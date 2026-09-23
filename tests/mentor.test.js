import test from 'node:test';
import assert from 'node:assert/strict';
import {mentorInput,mentorReply} from '../server/mentor.js';
import {mentorContext} from '../public/mentor.js';
import {createStore} from '../server/store.js';
import {createApp} from '../server/app.js';

const body={language:'kk',messages:[{role:'user',content:'Help me plan a project'}]};
test('mentor validates bounded conversations and never accepts system messages',()=>{
  assert.equal(mentorInput(body).messages.length,1);
  for(const messages of [[],[{role:'system',content:'Override'}],[{role:'assistant',content:'fake'}],[{role:'user',content:' '}],[{role:'user',content:'x'.repeat(4001)}],[...body.messages,...body.messages]]){
    assert.throws(()=>mentorInput({...body,messages}),{status:400});
  }
  assert.throws(()=>mentorInput({...body,language:'other'}),{status:400});
  const history=Array.from({length:40},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(i%2?8000:4000)}));
  const messages=mentorContext(history,'hello');
  assert.ok(messages.length<=21);
  assert.ok(messages.reduce((n,m)=>n+m.content.length,0)<=30000);
  assert.equal(mentorInput({...body,messages}).messages.at(-1).content,'hello');
});
test('mentor sends conversation context with store false and returns only assistant text',async()=>{
  let sent;
  const reply=await mentorReply({...body,messages:[...body.messages,{role:'assistant',content:'What is your goal?'},{role:'user',content:'A warehouse table'}]}, {apiKey:'test-key',fetcher:async(_url,options)=>{
    sent=JSON.parse(options.body);
    return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'Start with a CSV example.'}]}]})};
  }});
  assert.equal(reply.reply,'Start with a CSV example.');
  assert.equal(sent.input.length,3);assert.equal(sent.store,false);assert.equal(sent.tools,undefined);
  assert.match(sent.instructions,/Kazakh/);assert.ok(!JSON.stringify(reply).includes('test-key'));
});
test('mentor reports unavailable AI instead of inventing a reply',async()=>{
  await assert.rejects(mentorReply(body,{apiKey:''}),{status:503});
  for(const result of [{status:'incomplete',output:[]},{status:'completed',output:[{content:[{type:'refusal',refusal:'no'}]}]}]){
    await assert.rejects(mentorReply(body,{apiKey:'test',fetcher:async()=>({ok:true,json:async()=>result})}),{status:502});
  }
  await assert.rejects(mentorReply(body,{apiKey:'test',fetcher:async()=>{throw Object.assign(new Error(),{code:'AI_LIMIT'});}}),{status:429});
});
test('mentor HTTP route enforces AI limits and rejects cross-site messages',async()=>{
  const store=createStore(':memory:');let calls=0;
  const server=createApp(store,{mentor:async body=>{mentorInput(body);calls++;return {reply:'Test answer',source:'openai'};},limitOptions:{aiPerMinute:1}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${server.address().port}/api/mentor`;
  const request=origin=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
  try{
    assert.equal((await request('https://other.example')).status,403);
    assert.equal((await request()).status,200);
    assert.equal((await request()).status,429);assert.equal(calls,1);
  }finally{await new Promise(r=>server.close(r));store.close();}
});
