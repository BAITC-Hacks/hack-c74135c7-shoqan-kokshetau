import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../server/store.js';
import { seedAccountDemo } from '../scripts/seed-account-demo.js';

test('account demo creates ten owned tasks and ten incoming proposals without overwriting edits',()=>{
  const store=createStore(':memory:');
  try {
    store.saveUser({id:'demo-owner',email:'owner@example.test'});
    const result=seedAccountDemo(store,'OWNER@example.test');
    assert.equal(result.tasksAdded,10);assert.equal(result.proposalsAdded,10);
    const tasks=store.tasks();
    assert.ok(tasks.every(task=>task.ownerId==='demo-owner'));
    assert.equal(tasks.filter(task=>task.status==='published').length,7);
    assert.equal(tasks.filter(task=>task.status==='draft').length,3);
    const offers=tasks.flatMap(task=>store.proposals(task.id));
    assert.equal(offers.filter(p=>p.status==='pending').length,4);
    assert.equal(offers.filter(p=>p.status==='accepted').length,3);
    assert.equal(offers.filter(p=>p.status==='rejected').length,3);
    assert.ok(offers.every(p=>store.task(p.taskId).status==='published'));
    assert.ok(tasks.filter(t=>t.status==='published').every(t=>Object.values(t.fields).every(f=>!f.value||f.confirmed)));
    assert.equal(new Set(result.tasks.map(t=>t.score)).size>=6,true);
    const edited=tasks[0];edited.description='User edited this';store.saveTask(edited);
    const repeat=seedAccountDemo(store,'owner@example.test');
    assert.equal(repeat.tasksAdded,0);assert.equal(repeat.proposalsAdded,0);
    assert.equal(store.task(edited.id).description,'User edited this');
    assert.equal(store.proposalsBySender('demo-owner').length,0);
  } finally {store.close();}
});

test('unknown account does not receive demo records or create an account',()=>{
  const store=createStore(':memory:');
  try {
    assert.throws(()=>seedAccountDemo(store,'missing@example.test'),/Account not found/);
    assert.equal(store.tasks().length,0);
    assert.equal(store.userByEmail('missing@example.test'),undefined);
  } finally {store.close();}
});
