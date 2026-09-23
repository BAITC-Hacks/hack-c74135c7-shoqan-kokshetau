import test from 'node:test';
import assert from 'node:assert/strict';
import { createLimiter, createOpenAIGateway } from '../server/limits.js';
import { createApp } from '../server/app.js';
import { createStore } from '../server/store.js';
import { clarify } from '../server/ai.js';
import { createTranslator } from '../server/translate.js';
import { newTask } from '../server/domain.js';

test('rate limits reset after the window and never evict an active key',()=>{
  let now=0;const consume=createLimiter({now:()=>now,maxKeys:1});
  consume('client',2,60000);consume('client',2,60000);
  assert.throws(()=>consume('client',2,60000),error=>error.status===429 && error.retryAfter===60);
  assert.throws(()=>consume('other',2,60000),error=>error.status===429);
  now=60001;consume('client',2,60000);
});

test('outbound AI gate holds slot through body read and enforces daily budget',async()=>{
  let release;let calls=0;
  const wait=new Promise(resolve=>release=resolve);
  const gateway=createOpenAIGateway({maxConcurrent:1,perDay:2,fetcher:async()=>{
    calls++;return {ok:true,status:200,json:async()=>{await wait;return {status:'completed'};}};
  }});
  const first=gateway('unused',{});
  await assert.rejects(gateway('unused',{}),error=>error.code==='AI_LIMIT');
  release();assert.equal((await (await first).json()).status,'completed');
  await gateway('unused',{});
  await assert.rejects(gateway('unused',{}),error=>error.code==='AI_LIMIT');
  assert.equal(calls,2);
});

test('AI budget exhaustion uses local questions and original translation',async()=>{
  const {task}=newTask('Only original facts');
  const fetcher=async()=>{throw Object.assign(new Error('budget'),{code:'AI_LIMIT'});};
  const questions=await clarify(task,{apiKey:'test-only',fetcher});
  assert.equal(questions.reason,'rate_limited');assert.ok(questions.questions.length>=3);
  const translation=await createTranslator({apiKey:'test-only',fetcher})(task,'ru');
  assert.equal(translation.reason,'rate_limited');assert.equal(translation.fields.context,'Only original facts');
});

test('HTTP throttles clients, ignores spoofed forwarding and keeps health reachable',async t=>{
  const store=createStore(':memory:');
  const server=createApp(store,{limitOptions:{clientPerMinute:2}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
  const base=`http://127.0.0.1:${server.address().port}`;
  for(let i=0;i<2;i++)assert.equal((await fetch(base+'/api/tasks')).status,200);
  const limited=await fetch(base+'/api/tasks',{headers:{'X-Forwarded-For':'different-client'}});
  assert.equal(limited.status,429);assert.ok(Number(limited.headers.get('Retry-After'))>0);
  assert.equal((await fetch(base+'/api/health')).status,200);
  assert.equal((await fetch(base+'/')).status,200);
});
