import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../server/store.js';
import { createApp } from '../server/app.js';
import { clarify } from '../server/ai.js';
import { fieldNames, newTask, rating } from '../server/domain.js';
import { seed } from '../server/seed.js';

async function fixture(t) {
  const store = createStore(':memory:');
  const server = createApp(store, { ai: task => clarify(task, { apiKey: '' }) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); store.close(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  async function call(path, method = 'GET', body, token) {
    const response = await fetch(url + '/api' + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    return { status: response.status, ...await response.json() };
  }
  return { store, call, url };
}

test('full lifecycle, human review, low score proposals and manual owner decisions', async t => {
  const { call } = await fixture(t);
  const draft = await call('/tasks/draft', 'POST', { description: 'Қойманы есептеу керек' });
  assert.equal(draft.status, 201);
  const token = draft.ownerToken;
  let task = draft.task;
  const path = `/tasks/${task.id}`;
  assert.equal(task.rating.score, 0);
  assert.equal(task.ownerHash, undefined);
  assert.equal((await call('/tasks')).tasks.length, 0);
  assert.equal((await call(path)).status, 403);
  const questions = await call(path + '/clarify', 'POST', {}, token);
  assert.equal(questions.source, 'fallback');
  assert.ok(questions.questions.length >= 3);
  assert.equal((await call(path + '/publish', 'POST', { version: 1, reviewed: true }, token)).status, 400);
  task = (await call(path, 'PATCH', { version: task.version, fields: { title: { value: 'Қойма', confirmed: true }, context: { confirmed: true }, data: { value: 'CSV' } } }, token)).task;
  assert.equal(task.rating.score, 20);
  assert.equal(task.fields.data.confirmed, false);
  assert.equal((await call(path, 'PATCH', { version: 1, fields: { title: { value: 'Stale' } } }, token)).status, 409);
  assert.equal((await call(path + '/publish', 'POST', { version: task.version, reviewed: true }, token)).status, 400);
  task = (await call(path, 'PATCH', { version: task.version, fields: { data: { value: '' } } }, token)).task;
  assert.equal((await call(path + '/publish', 'POST', { version: task.version }, token)).status, 400);
  task = (await call(path + '/publish', 'POST', { version: task.version, reviewed: true }, token)).task;
  assert.equal(task.status, 'published');
  assert.equal(task.rating.score, 20);
  assert.equal((await call('/tasks')).tasks[0].id, task.id);
  const offered = await call(path + '/proposals', 'POST', { teamName: 'Students', contact: 'team@example.test', message: 'Prototype in two weeks', plan:'Build and test', deadline:'2 weeks', prototypeLink:'https://example.test/prototype' });
  assert.equal(offered.status, 201);
  assert.equal(offered.proposal.status, 'pending');
  const decisionPath = '/proposals/' + offered.proposal.id;
  assert.equal((await call(path + '/proposals')).status, 403);
  assert.equal((await call(decisionPath, 'PATCH', { version: 1, status: 'accepted' }, 'wrong')).status, 403);
  assert.equal((await call(decisionPath, 'PATCH', { version: 1, status: 'accepted' }, token)).proposal.status, 'accepted');
  assert.equal((await call(decisionPath, 'PATCH', { version: 1, status: 'rejected' }, token)).status, 409);
  assert.equal((await call(decisionPath, 'PATCH', { version: 2, status: 'rejected' }, token)).proposal.status, 'rejected');
  assert.equal((await call(path + '/proposals', 'GET', undefined, token)).proposals.length, 1);
  task = (await call(path, 'PATCH', { version: task.version, fields: { context: { value: 'Changed context' } } }, token)).task;
  assert.equal(task.fields.context.confirmed, false);
  assert.equal(task.reviewedAt, null);
  assert.equal(task.status, 'draft');
  assert.equal(task.rating.score, 0);
  assert.equal((await call('/tasks')).tasks.length, 0);
  assert.equal((await call(path + '/proposals', 'POST', { teamName: 'A', contact: 'B', message: 'C' })).status, 409);
});

test('validation is atomic; owner scope, payload limits, JSON and CORS', async t => {
  const { call, url } = await fixture(t);
  const a = await call('/tasks/draft', 'POST', { description: 'A' });
  const b = await call('/tasks/draft', 'POST', { description: 'B' });
  const path = '/tasks/' + a.task.id;
  assert.equal((await call(path, 'PATCH', { version: 1, fields: { title: { value: 'X' } } }, b.ownerToken)).status, 403);
  assert.equal((await call(path, 'PATCH', { version: 1, fields: { title: { value: 'Valid' }, unknown: { value: 'Oops' } } }, a.ownerToken)).status, 400);
  assert.equal((await call(path, 'GET', undefined, a.ownerToken)).task.fields.title.value, '');
  for (const fields of [{ data: { confirmed: true } }, { title: { confirmed: 'true' } }, {}, { title: { value: 12 } }]) {
    assert.equal((await call(path, 'PATCH', { version: 1, fields }, a.ownerToken)).status, 400);
  }
  assert.equal((await call('/tasks/draft', 'POST', { description: '  ' })).status, 400);
  assert.equal((await call('/tasks/draft', 'POST', { description: 'X', status: 'published' })).status, 400);
  assert.equal((await call('/tasks/missing')).status, 404);
  assert.equal((await fetch(url + '/api/tasks/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' })).status, 400);
  assert.equal((await fetch(url + '/api/tasks/draft', { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await fetch(url + '/api/tasks/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: 'x'.repeat(140000) }) })).status, 413);
  assert.equal((await fetch(url + '/api/tasks', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  const cors = await fetch(url + '/api/tasks', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173' } });
  assert.equal(cors.status, 204);
  assert.equal(cors.headers.get('Access-Control-Allow-Origin'), 'http://localhost:5173');
});

test('scoring all weights, empty/unconfirmed fields and exact level boundaries', () => {
  const { task } = newTask('A');
  for (const name of fieldNames) task.fields[name] = { value: 'Present', confirmed: true };
  assert.equal(rating(task.fields).score, 100);
  assert.equal(rating(task.fields).level, 'Басым');
  task.fields.data.confirmed = false;
  assert.equal(rating(task.fields).score, 80);
  assert.equal(rating(task.fields).level, 'Дайын');
  task.fields.context.value = '   ';
  assert.equal(rating(task.fields).score, 60);
  assert.equal(rating(task.fields).level, 'Жұмысқа дайындалып жатыр');
  for (const name of fieldNames) task.fields[name].confirmed = false;
  assert.equal(rating(task.fields).score, 0);
  assert.equal(rating(task.fields).level, 'Жоба');
  for (const [fields, score, level] of [
    [['context', 'data'], 40, 'Жұмысқа дайындалып жатыр'],
    [['context', 'data', 'expectedResult', 'successCriteria'], 70, 'Дайын'],
    [['context', 'data', 'expectedResult', 'successCriteria', 'users', 'contact'], 90, 'Басым']
  ]) {
    for (const name of fieldNames) task.fields[name] = { value: 'X', confirmed: fields.includes(name) };
    assert.deepEqual([rating(task.fields).score, rating(task.fields).level], [score, level]);
  }
});

test('AI questions use Responses schema and cannot overwrite user facts', async () => {
  const { task } = newTask('Only supplied fact');
  const before = structuredClone(task);
  const questions = ['data', 'users', 'constraints'].map(field => ({ field, question: `${field}?` }));
  const result = await clarify(task, { apiKey: 'test-only', fetcher: async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    assert.equal(request.text.format.strict, true);
    return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ questions, fields: { data: 'invented fact' } }) }] }] }) };
  } });
  assert.equal(result.source, 'openai');
  assert.deepEqual(result.questions, questions);
  assert.equal(result.fields, undefined);
  assert.deepEqual(task, before);
});

test('AI outages, timeout, refusal, malformed or insufficient output fall back', async () => {
  const { task } = newTask('A');
  const mocks = [
    async () => { throw new Error('timeout with secret'); },
    async () => ({ ok: false, status: 429 }),
    async () => ({ ok: true, json: async () => ({ status: 'incomplete' }) }),
    async () => ({ ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'refusal' }] }] }) }),
    async () => ({ ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: '{bad' }] }] }) }),
    async () => ({ ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: '{"questions":[]}' }] }] }) })
  ];
  for (const fetcher of mocks) {
    const result = await clarify(task, { apiKey: 'test-only', fetcher });
    assert.equal(result.source, 'fallback');
    assert.ok(result.questions.length >= 3);
    assert.ok(!JSON.stringify(result).includes('secret'));
  }
});

test('SQLite persists tasks and proposals; seed is idempotent and includes low ratings', () => {
  const directory = mkdtempSync(join(tmpdir(), 'shoqan-api-'));
  const path = join(directory, 'test.sqlite');
  let store;
  try {
    store = createStore(path); seed(store); seed(store);
    assert.equal(store.tasks().length, 10);
    assert.ok(store.tasks().some(task => rating(task.fields).score < 40));
    store.close(); store = createStore(path);
    assert.equal(store.tasks().length, 10);
    assert.equal(store.proposals('demo-task-1')[0].status, 'pending');
  } finally { store?.close(); rmSync(directory, { recursive: true, force: true }); }
});
