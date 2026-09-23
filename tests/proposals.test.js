import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../server/app.js';
import { createStore } from '../server/store.js';
import { seed } from '../server/seed.js';

test('sender sees only own submissions and latest owner decisions, including across sessions',async t=>{
  const store=createStore(':memory:');seed(store);
  const server=createApp(store);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
  const base=`http://127.0.0.1:${server.address().port}/api`;
  async function call(path,method='GET',body,cookie,token){
    const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
    return {status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
  }
  const password=randomUUID();
  const sender=await call('/auth/register','POST',{name:'Team',email:'team@example.test',password});
  const other=await call('/auth/register','POST',{name:'Other',email:'other@example.test',password:randomUUID()});
  const body={teamName:'Test team',contact:'team@example.test',message:'A prototype proposal',plan:'Build and test',deadline:'2 weeks',prototypeLink:'https://example.test/prototype',skills:'Data analysis',interests:'Operations',technologies:'Node.js'};
  const created=await call('/tasks/demo-task-1/proposals','POST',body,sender.cookie);
  assert.equal(created.status,201);
  assert.equal(created.body.tracked,true);
  assert.equal(created.body.proposal.senderId,undefined);
  assert.equal(created.body.proposal.taskTitleSnapshot,undefined);
  assert.equal(created.body.proposal.decisionNote,'');
  assert.equal(created.body.proposal.plan,body.plan);
  assert.equal(created.body.proposal.progressPoints,0);
  const id=created.body.proposal.id;
  // Guest contact matching an account never grants access to old guest submissions.
  const guest=await call('/tasks/demo-task-1/proposals','POST',body);
  assert.equal(guest.status,201);assert.equal(guest.body.tracked,false);
  assert.equal((await call('/tasks/demo-task-1/proposals','POST',{...body,senderId:other.body.user.id},sender.cookie)).status,400);
  assert.equal((await call('/proposals/mine')).status,401);
  assert.deepEqual((await call('/proposals/mine','GET',undefined,other.cookie)).body.proposals,[]);
  const mine=(await call('/proposals/mine','GET',undefined,sender.cookie)).body.proposals;
  assert.equal(mine.length,1);assert.equal(mine[0].id,id);assert.equal(mine[0].status,'pending');
  assert.equal(mine[0].task.available,true);
  assert.equal(mine[0].task.title,'Қойма есебін автоматтандыру');
  assert.equal(mine[0].senderId,undefined);
  assert.equal((await call('/tasks/demo-task-1/proposals','GET',undefined,sender.cookie)).status,403);
  assert.equal((await call(`/proposals/${id}`,'PATCH',{status:'accepted',version:1,decisionNote:'Forged decision'},sender.cookie)).status,403);
  for(const decisionNote of [null,17,'x'.repeat(2001)]){
    assert.equal((await call(`/proposals/${id}`,'PATCH',{status:'accepted',version:1,decisionNote},undefined,'local-demo-owner')).status,400);
    assert.equal(store.proposal(id).version,1);
    assert.equal(store.proposal(id).status,'pending');
  }
  const note='Кездесу уақытын келісейік.\nСіздің тәсіліңіз сәйкес келеді.';
  const accepted=await call(`/proposals/${id}`,'PATCH',{status:'accepted',version:1,decisionNote:note},undefined,'local-demo-owner');
  assert.equal(accepted.status,200);
  const progressed=await call(`/proposals/${id}`,'PATCH',{status:'accepted',version:2,progress:2},undefined,'local-demo-owner');
  assert.equal(progressed.status,200);assert.equal(progressed.body.proposal.progress,2);assert.equal(progressed.body.proposal.progressPoints,20);
  const after=(await call('/proposals/mine','GET',undefined,sender.cookie)).body.proposals[0];
  assert.equal(after.status,'accepted');assert.ok(after.decidedAt);assert.equal(after.version,3);assert.equal(after.progressPoints,20);
  assert.equal(after.decisionNote,note);
  const stale=await call(`/proposals/${id}`,'PATCH',{status:'rejected',version:1,decisionNote:'Stale note'},undefined,'local-demo-owner');
  assert.equal(stale.status,409);assert.equal(store.proposal(id).decisionNote,note);
  const anotherBrowser=await call('/auth/login','POST',{email:'team@example.test',password});
  const otherSessionProposal=(await call('/proposals/mine','GET',undefined,anotherBrowser.cookie)).body.proposals[0];
  assert.equal(otherSessionProposal.id,id);assert.equal(otherSessionProposal.decisionNote,note);
  await call(`/proposals/${id}`,'PATCH',{status:'rejected',version:3},undefined,'local-demo-owner');
  const rejected=(await call('/proposals/mine','GET',undefined,anotherBrowser.cookie)).body.proposals[0];
  assert.equal(rejected.status,'rejected');assert.equal(rejected.decisionNote,'');

  // A later unpublished revision must not leak its private title or other fields.
  const edit=await call('/tasks/demo-task-1','PATCH',{version:1,fields:{title:{value:'PRIVATE REVISION'},context:{value:'PRIVATE DETAILS'}}},undefined,'local-demo-owner');
  assert.equal(edit.status,200);
  const privateView=(await call('/proposals/mine','GET',undefined,sender.cookie)).body.proposals[0];
  assert.equal(privateView.task.available,false);
  assert.equal(privateView.task.title,'Қойма есебін автоматтандыру');
  assert.ok(!JSON.stringify(privateView).includes('PRIVATE'));
  assert.equal((await call('/tasks/demo-task-1','GET',undefined,sender.cookie)).status,403);
  assert.equal((await call('/tasks/demo-task-1/proposals','POST',body,sender.cookie)).status,409);
  const owned=(await call('/tasks/demo-task-1/proposals','GET',undefined,undefined,'local-demo-owner')).body.proposals;
  assert.equal(owned.length,3); // Existing seed, authenticated submission, guest submission.
  assert.ok(owned.every(proposal=>!('senderId' in proposal)&&!('taskTitleSnapshot' in proposal)));
  await call('/auth/logout','POST',{},sender.cookie);
  assert.equal((await call('/proposals/mine','GET',undefined,sender.cookie)).status,401);
});
