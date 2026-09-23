import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { authorize, checkVersion, fail, keys, newTask, object, publicTask, string, updateFields } from './domain.js';
import { clarify } from './ai.js';
import { createTranslator } from './translate.js';
import { readFileSync } from 'node:fs';
import { createAuth } from './auth.js';
import { createRequestLimits } from './limits.js';

const assets = new Map(['index.html', 'app.js', 'account.js', 'style.css'].map(name => [name, new URL('../public/' + name, import.meta.url)]));

async function readBody(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Use application/json');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 131072) fail(413, 'Request too large');
    chunks.push(chunk);
  }
  try { return object(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
  catch (error) { if (error.status) throw error; fail(400, 'Invalid JSON'); }
}

export function createApp(store, { ai = clarify, translate = createTranslator(), origin = 'http://localhost:5173', authOptions, limitOptions } = {}) {
  const auth = createAuth(store, authOptions);
  const checkLimits = createRequestLimits(limitOptions);
  return createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    try {
      const localOrigin = `http://${req.headers.host}`;
      if (req.headers.origin && req.headers.origin !== origin && req.headers.origin !== localOrigin) fail(403, 'Origin not allowed');
      if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      if (req.headers['sec-fetch-site'] === 'cross-site' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) fail(403, 'Cross-site write blocked');
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.writeHead(204); return res.end();
      }
      const path = new URL(req.url, 'http://localhost').pathname;
      checkLimits(req, path);
      const asset = path === '/' ? 'index.html' : path.slice(1);
      if (req.method === 'GET' && assets.has(asset)) {
        res.setHeader('Content-Type', asset.endsWith('.html') ? 'text/html; charset=utf-8' : asset.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
        return res.end(readFileSync(assets.get(asset)));
      }
      const token = req.headers.authorization?.replace(/^Bearer /, '');
      const user = auth.session(req);
      const viewTask = task => {
        let canManage = false;
        try { authorize(task, token, user?.id); canManage = true; } catch { /* Public readers need no owner access. */ }
        return { ...publicTask(task), canManage };
      };
      const ownedTask = id => {
        const task = store.task(id);
        if (!task) fail(404, 'Task not found');
        authorize(task, token, user?.id); return task;
      };
      if (req.method === 'GET' && path === '/api/auth/me') return send(200, { user });
      if (req.method === 'POST' && path === '/api/auth/register') return send(201, { user: await auth.register(req, res, await readBody(req)) });
      if (req.method === 'POST' && path === '/api/auth/login') return send(200, { user: await auth.login(req, res, await readBody(req)) });
      if (req.method === 'POST' && path === '/api/auth/logout') {
        keys(await readBody(req), []); auth.logout(req, res); return send(200, { ok: true });
      }
      if (req.method === 'GET' && path === '/api/tasks/mine') {
        if (!user) fail(401, 'Sign in required');
        return send(200, { tasks: store.tasks().filter(task => task.ownerId === user.id).map(viewTask) });
      }
      if (req.method === 'GET' && path === '/api/health') return send(200, { ok: true });
      if (req.method === 'GET' && path === '/api/tasks') return send(200, { tasks: store.tasks().filter(t => t.status === 'published').map(viewTask) });
      if (req.method === 'POST' && path === '/api/tasks/draft') {
        const body = await readBody(req); keys(body, ['description']);
        const { task, ownerToken } = newTask(body.description);
        if (user) task.ownerId = user.id;
        store.saveTask(task);
        return send(201, { task: { ...viewTask(task), canManage: true }, ...(user ? {} : { ownerToken }) });
      }
      const match = path.match(/^\/api\/tasks\/([^/]+)(?:\/(clarify|publish|proposals|translate|claim))?$/);
      if (match) {
        const [, id, action] = match;
        if (req.method === 'POST' && action === 'claim') {
          keys(await readBody(req), []);
          if (!user) fail(401, 'Sign in required');
          const task = store.transaction(() => {
            const current = store.task(id);
            if (!current) fail(404, 'Task not found');
            if (id.startsWith('demo-')) fail(400, 'Shared demo tasks cannot be claimed');
            if (current.ownerId) {
              if (current.ownerId !== user.id) fail(403, 'Task belongs to another account');
              return current;
            }
            authorize(current, token);
            const updated = { ...current, ownerId: user.id, ownerHash: null };
            store.saveTask(updated); return updated;
          });
          return send(200, { task: viewTask(task) });
        }
        if (req.method === 'POST' && action === 'translate') {
          const body = await readBody(req); keys(body, ['language']);
          if (!['kk', 'ru'].includes(body.language)) fail(400, 'Unsupported language');
          const task = store.task(id);
          if (!task) fail(404, 'Task not found');
          if (task.status !== 'published') authorize(task, token, user?.id);
          return send(200, { taskVersion: task.version, ...await translate(task, body.language) });
        }
        if (req.method === 'GET' && !action) {
          const task = store.task(id);
          if (!task) fail(404, 'Task not found');
          if (task.status !== 'published') authorize(task, token, user?.id);
          return send(200, { task: viewTask(task) });
        }
        if (req.method === 'POST' && action === 'clarify') {
          const body = await readBody(req); keys(body, ['language']);
          if (body.language !== undefined && !['kk', 'ru'].includes(body.language)) fail(400, 'Unsupported language');
          const task = ownedTask(id);
          return send(200, { taskVersion: task.version, ...await ai(task, { language: body.language || 'kk' }) });
        }
        if (req.method === 'PATCH' && !action) {
          const body = await readBody(req); keys(body, ['version', 'fields']);
          const task = store.transaction(() => {
            const current = ownedTask(id); checkVersion(current, body.version);
            const updated = updateFields(current, body.fields); store.saveTask(updated); return updated;
          });
          return send(200, { task: viewTask(task) });
        }
        if (req.method === 'POST' && action === 'publish') {
          const body = await readBody(req); keys(body, ['version', 'reviewed']);
          const task = store.transaction(() => {
            const current = ownedTask(id); checkVersion(current, body.version);
            if (body.reviewed !== true) fail(400, 'Human review is required');
            if (!current.fields.title.value || !current.fields.title.confirmed) fail(400, 'A confirmed title is required');
            if (Object.values(current.fields).some(field => field.value && !field.confirmed)) fail(400, 'Confirm every populated field before publishing');
            const now = new Date().toISOString();
            const updated = { ...current, status: 'published', reviewedAt: now, updatedAt: now, version: current.version + 1 };
            store.saveTask(updated); return updated;
          });
          return send(200, { task: viewTask(task) });
        }
        if (req.method === 'GET' && action === 'proposals') {
          ownedTask(id); return send(200, { proposals: store.proposals(id) });
        }
        if (req.method === 'POST' && action === 'proposals') {
          const body = await readBody(req); keys(body, ['teamName', 'contact', 'message']);
          const proposal = store.transaction(() => {
            const task = store.task(id);
            if (!task) fail(404, 'Task not found');
            if (task.status !== 'published') fail(409, 'Task is not published');
            const now = new Date().toISOString();
            const result = { id: randomUUID(), taskId: id, teamName: string(body.teamName, 200), contact: string(body.contact, 1000), message: string(body.message), status: 'pending', createdAt: now, decidedAt: null, version: 1 };
            store.saveProposal(result); return result;
          });
          return send(201, { proposal });
        }
      }
      const proposalMatch = path.match(/^\/api\/proposals\/([^/]+)$/);
      if (req.method === 'PATCH' && proposalMatch) {
        const body = await readBody(req); keys(body, ['status', 'version']);
        const proposal = store.transaction(() => {
          const current = store.proposal(proposalMatch[1]);
          if (!current) fail(404, 'Proposal not found');
          ownedTask(current.taskId); checkVersion(current, body.version);
          if (!['accepted', 'rejected'].includes(body.status)) fail(400, 'Choose accepted or rejected');
          const updated = { ...current, status: body.status, decidedAt: new Date().toISOString(), version: current.version + 1 };
          store.saveProposal(updated); return updated;
        });
        return send(200, { proposal });
      }
      fail(404, 'Route not found');
    } catch (error) {
      if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter));
      // Never include upstream response bodies, credentials or stack traces in API errors.
      send(error.status || 500, { error: { message: error.status ? error.message : 'Internal server error' } });
    }
  });
}
