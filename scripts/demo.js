// Run against a running local API. Every run creates one task and one proposal.
const base = process.env.API_URL || 'http://127.0.0.1:3001/api';
async function request(path, method = 'GET', body, token) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error?.message}`);
  return result;
}
const created = await request('/tasks/draft', 'POST', { description: 'Демо: қойма есебін жеңілдету керек.' });
const token = created.ownerToken;
let task = created.task;
const path = '/tasks/' + task.id;
console.log('1. Draft:', task.id, 'score:', task.rating.score);
const questions = await request(path + '/clarify', 'POST', {}, token);
console.log('2. Questions:', questions.source, questions.questions);
task = (await request(path, 'PATCH', { version: task.version, fields: {
  title: { value: 'Демо қойма есебі' },
  data: { value: 'Жасанды CSV, 100 тауар' },
  expectedResult: { value: 'Қалдықтар кестесі' }
} }, token)).task;
console.log('3. Answers saved; unconfirmed score:', task.rating.score);
// This script simulates explicit human review for fictional demo content only.
const confirmations = Object.fromEntries(Object.entries(task.fields).filter(([, field]) => field.value).map(([name]) => [name, { confirmed: true }]));
task = (await request(path, 'PATCH', { version: task.version, fields: confirmations }, token)).task;
console.log('4. Demo human confirmation; score:', task.rating.score, task.rating.level);
task = (await request(path + '/publish', 'POST', { version: task.version, reviewed: true }, token)).task;
const catalog = await request('/tasks');
if (!catalog.tasks.some(item => item.id === task.id)) throw new Error('Published task missing');
console.log('5. Published in catalog');
const { proposal } = await request(path + '/proposals', 'POST', { teamName: 'Demo Students', contact: 'students@example.test', message: 'Демо прототип ұсынамыз.' });
const decision = await request('/proposals/' + proposal.id, 'PATCH', { version: proposal.version, status: 'accepted' }, token);
console.log('6. Owner decision:', decision.proposal.status);
const proposals = await request(path + '/proposals', 'GET', undefined, token);
console.log('7. Owner proposals:', proposals.proposals.length);
// Owner token deliberately not printed to logs.
