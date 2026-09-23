import test from 'node:test';
import assert from 'node:assert/strict';
import { createTranslator } from '../server/translate.js';
import { newTask, fieldNames } from '../server/domain.js';
import { createApp } from '../server/app.js';
import { createStore } from '../server/store.js';
import { clarify } from '../server/ai.js';

test('translation uses structured output, caches per version/language and preserves original', async () => {
  const { task } = newTask('Қойма есебін жүргізу');
  const original=structuredClone(task);
  let calls=0;
  const translated=Object.fromEntries(fieldNames.map(name=>[name,name==='context'?'Вести учёт склада':'']));
  const translate=createTranslator({apiKey:'test-only',fetcher:async(url,options)=>{
    calls++;
    assert.equal(url,'https://api.openai.com/v1/responses');
    const request=JSON.parse(options.body);
    assert.equal(request.store,false);
    assert.equal(request.text.format.strict,true);
    assert.ok(!request.input.includes(task.ownerHash));
    return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(translated)}]}]})};
  }});
  const result=await translate(task,'ru');
  assert.equal(result.source,'openai');
  assert.equal(result.fields.context,'Вести учёт склада');
  assert.deepEqual(task,original);
  await translate(task,'ru');assert.equal(calls,1);
  await translate({...task,version:2},'ru');assert.equal(calls,2);
  await translate(task,'kk');assert.equal(calls,3);
});

test('missing key, API failure, malformed output and invented empty field use original', async () => {
  const {task}=newTask('Original');
  assert.equal((await createTranslator({apiKey:''})(task,'ru')).reason,'not_configured');
  const invented=Object.fromEntries(fieldNames.map(name=>[name,name==='context'?'Перевод':name==='data'?'Invented CSV':'']));
  for(const fetcher of [
    async()=>{throw new Error('secret upstream error');},
    async()=>({ok:false}),
    async()=>({ok:true,json:async()=>({status:'incomplete'})}),
    async()=>({ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(invented)}]}]})})
  ]){
    const result=await createTranslator({apiKey:'test-only',fetcher})(task,'ru');
    assert.equal(result.source,'original');assert.equal(result.fields.context,'Original');assert.equal(result.fields.data,'');
    assert.ok(!JSON.stringify(result).includes('secret'));
  }
});

test('HTTP serves UI assets only, supports same-origin POST and protects draft translation',async t=>{
  const store=createStore(':memory:');
  const server=createApp(store,{translate:createTranslator({apiKey:''})});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
  const base=`http://127.0.0.1:${server.address().port}`;
  const root=await fetch(base);
  assert.match(root.headers.get('content-type'),/text\/html/);
  assert.match(root.headers.get('content-security-policy'),/script-src 'self'/);
  assert.match(await root.text(),/app.js/);
  for(const path of ['/server/index.js','/.env.local','/data/app.sqlite','/package.json'])assert.equal((await fetch(base+path)).status,404);
  for(const path of ['/app.js','/style.css'])assert.equal((await fetch(base+path)).status,200);
  const created=await fetch(base+'/api/tasks/draft',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({description:'Test'})});
  assert.equal(created.status,201);
  const {task,ownerToken}=await created.json();
  async function translate(language,token){return fetch(base+`/api/tasks/${task.id}/translate`,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({language})});}
  assert.equal((await translate('ru')).status,403);
  assert.equal((await translate('fr',ownerToken)).status,400);
  const result=await (await translate('ru',ownerToken)).json();
  assert.equal(result.source,'original');assert.equal(result.taskVersion,1);
  assert.equal(store.task(task.id).version,1);
  assert.equal(store.task(task.id).status,'draft');
  assert.equal(store.task(task.id).fields.context.confirmed,false);
});

test('clarification fallback is localized without remote API',async()=>{
  const {task}=newTask('Описание');
  const result=await clarify(task,{apiKey:'',language:'ru'});
  assert.ok(result.questions.length>=3);
  assert.equal(result.questions.find(q=>q.field==='title').question,'Как называется задача?');
});
