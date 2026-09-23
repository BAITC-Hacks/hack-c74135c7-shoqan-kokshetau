import { randomUUID, randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export const weights = { context: 20, data: 20, expectedResult: 15, successCriteria: 15, constraints: 10, users: 10, contact: 10 };
export const fieldNames = ['title', ...Object.keys(weights)];
export function fail(status, message) { throw Object.assign(new Error(message), { status }); }
export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Expected a JSON object');
  return value;
}
export function keys(value, allowed) {
  object(value);
  if (Object.keys(value).some(key => !allowed.includes(key))) fail(400, 'Unknown property');
}
export function string(value, max = 10000, empty = false) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) fail(400, 'Invalid text');
  return value.trim();
}
export const hash = token => createHash('sha256').update(token).digest('hex');
export function prototypeUrl(value) {
  const text=string(value,2000);
  let url;try{url=new URL(text);}catch{fail(400,'Use an absolute HTTP or HTTPS prototype URL');}
  if(!['http:','https:'].includes(url.protocol) || url.username || url.password)fail(400,'Use an HTTP or HTTPS prototype URL without credentials');
  return url.href;
}
export function authorize(task, token, userId) {
  if (task.ownerId) {
    if (task.ownerId !== userId) fail(403, 'Account owner required');
    return;
  }
  if (typeof token !== 'string' || !timingSafeEqual(Buffer.from(task.ownerHash, 'hex'), Buffer.from(hash(token), 'hex'))) fail(403, 'Owner token required');
}
export function rating(fields) {
  const breakdown = Object.entries(weights).map(([field, max]) => ({ field, max, points: fields[field].confirmed && fields[field].value.trim() ? max : 0 }));
  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  const level = score < 40 ? 'Жоба' : score < 70 ? 'Жұмысқа дайындалып жатыр' : score < 90 ? 'Дайын' : 'Басым';
  return { score, level, breakdown };
}
export function publicTask(task) {
  const { ownerHash, ownerId, ...result } = task;
  return { ...result, ownership: ownerId ? 'account' : 'token', rating: rating(task.fields) };
}
export function publicProposal(proposal) {
  const { senderId, taskTitleSnapshot, ...result } = proposal;
  return { ...result, decisionNote: proposal.decisionNote || '' };
}
export function newTask(description, ownerToken = randomBytes(32).toString('hex')) {
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(), description: string(description),
    topic: 'Другое',
    fields: Object.fromEntries(fieldNames.map(field => [field, { value: field === 'context' ? description.trim() : '', confirmed: false }])),
    status: 'draft', version: 1, reviewedAt: null, createdAt: now, updatedAt: now, ownerHash: hash(ownerToken)
  };
  return { task, ownerToken };
}

export function proposalProgress(value) {
  if (!Number.isInteger(value) || value < 0 || value > 3) fail(400, 'Progress must be between 0 and 3');
  return { progress: value, progressPoints: value * 10 };
}
export function checkVersion(task, version) {
  if (!Number.isInteger(version) || version < 1) fail(400, 'version is required');
  if (task.version !== version) fail(409, 'Task changed; reload before saving');
}
export function updateFields(task, updates) {
  keys(updates, fieldNames);
  if (!Object.keys(updates).length) fail(400, 'At least one field is required');
  const fields = structuredClone(task.fields);
  for (const [name, update] of Object.entries(updates)) {
    keys(update, ['value', 'confirmed']);
    if (!Object.keys(update).length) fail(400, 'Empty field update');
    if ('confirmed' in update && typeof update.confirmed !== 'boolean') fail(400, 'confirmed must be boolean');
    const old = fields[name];
    const value = 'value' in update ? string(update.value, name === 'title' ? 200 : 10000, true) : old.value;
    const confirmed = update.confirmed ?? (value === old.value ? old.confirmed : false);
    if (confirmed && !value) fail(400, 'An empty field cannot be confirmed');
    fields[name] = { value, confirmed };
  }
  return { ...task, fields, status: 'draft', reviewedAt: null, version: task.version + 1, updatedAt: new Date().toISOString() };
}
