import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../server/store.js';
import {createApp} from '../server/app.js';
import {seed,demoToken} from '../server/seed.js';

test('catalog ranking, topic editing, proposal validation and confirmed team progress',async()=>{
  const store=createStore(':memory:');seed(store);
  const server=createApp(store);await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const call=async(path,method='GET',body,token=demoToken)=>{
    const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},...(body?{body:JSON.stringify(body)}:{})});
    return {status:r.status,body:await r.json()};
  };
  try{
    const catalog=(await call('/tasks')).body.tasks;
    assert.equal(catalog.length,5);
    assert.deepEqual(catalog.map(t=>t.rating.score),[...catalog.map(t=>t.rating.score)].sort((a,b)=>b-a));
    assert.ok(catalog.some(t=>t.rating.score<40));
    const draft=await call('/tasks/draft','POST',{description:'Library search',topic:'Education'});
    assert.equal(draft.body.task.topic,'Education');
    const edited=await call(`/tasks/${draft.body.task.id}`,'PATCH',{version:1,topic:'Libraries',fields:{title:{value:'Library',confirmed:true}}},draft.body.ownerToken);
    assert.equal(edited.body.task.topic,'Libraries');
    assert.equal(edited.body.task.status,'draft');
    const body={teamName:'Team',contact:'team@example.test',message:'Idea',plan:'Build then test',deadline:'2 weeks',prototypeLink:'https://example.test/prototype'};
    for(const field of ['plan','deadline','prototypeLink']){
      const invalid={...body};delete invalid[field];
      assert.equal((await call('/tasks/demo-task-5/proposals','POST',invalid)).status,400);
    }
    for(const prototypeLink of ['javascript:alert(1)','data:text/html,test','/relative','https://name:password@example.test']){
      assert.equal((await call('/tasks/demo-task-5/proposals','POST',{...body,prototypeLink})).status,400);
    }
    assert.equal((await call('/tasks/demo-task-5/proposals','POST',{...body,skills:12})).status,400);
    const offered=await call('/tasks/demo-task-5/proposals','POST',body);
    assert.equal(offered.status,201);assert.equal(offered.body.proposal.skills,'');
    const path=`/proposals/${offered.body.proposal.id}`;
    assert.equal((await call(path,'PATCH',{version:1,status:'accepted',progress:1})).status,409);
    assert.equal((await call(path,'PATCH',{version:1,status:'accepted'})).status,200);
    assert.equal((await call(path,'PATCH',{version:2,status:'rejected',progress:3})).status,409);
    const confirmed=await call(path,'PATCH',{version:2,status:'accepted',progress:2});
    assert.equal(confirmed.body.proposal.progressPoints,20);
    assert.equal((await call(path,'PATCH',{version:2,status:'accepted',progress:3})).status,409);
    assert.equal((await call(path,'PATCH',{version:3,status:'accepted',progress:4})).status,400);
    const rejected=await call(path,'PATCH',{version:3,status:'rejected'});
    assert.equal(rejected.body.proposal.progressPoints,0);
  }finally{await new Promise(r=>server.close(r));store.close();}
});

test('seed provides five drafts and profiles and never resets decisions or edits',()=>{
  const store=createStore(':memory:');
  try{
    seed(store);
    assert.equal(store.tasks().filter(t=>t.status==='draft').length,5);
    const offers=store.tasks().flatMap(t=>store.proposals(t.id));assert.equal(offers.length,5);
    assert.ok(offers.every(p=>p.plan&&p.deadline&&p.prototypeLink&&p.interests&&p.skills&&p.technologies));
    const proposal={...offers[0],status:'accepted',version:8,decisionNote:'Keep',progress:2,progressPoints:20};
    store.saveProposal(proposal);
    const task={...store.task(proposal.taskId),version:4,topic:'User topic'};store.saveTask(task);
    seed(store);
    assert.deepEqual(store.proposal(proposal.id),proposal);
    assert.deepEqual(store.task(task.id),task);
    assert.equal(store.tasks().length,10);
  }finally{store.close();}
});
