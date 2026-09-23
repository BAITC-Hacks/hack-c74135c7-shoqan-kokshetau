import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../server/store.js';
import { createApp } from '../server/app.js';
import { seed } from '../server/seed.js';
import { hash } from '../server/domain.js';

async function fixture(t, authOptions) {
  const store=createStore(':memory:');
  const server=createApp(store,{authOptions});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
  const base=`http://127.0.0.1:${server.address().port}`;
  async function call(path,method='GET',body,cookie,token,extraHeaders={}){
    const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...extraHeaders},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const setCookie=response.headers.get('set-cookie');
    return {status:response.status,body:await response.json(),cookie:setCookie?.split(';')[0],setCookie};
  }
  return {store,call,base};
}
const credentials = (email='owner@example.test')=>({name:'Test owner',email,password:randomUUID()});

test('register, account task ownership, second browser login, rotation and logout',async t=>{
  const {call,store}=await fixture(t);
  const input=credentials('Owner@Example.test');
  const registration=await call('/auth/register','POST',input);
  assert.equal(registration.status,201);
  assert.equal(registration.body.user.email,'owner@example.test');
  assert.match(registration.setCookie,/HttpOnly/);assert.match(registration.setCookie,/SameSite=Strict/);
  assert.ok(!JSON.stringify(registration.body).includes('password'));
  const stored=store.userByEmail('owner@example.test');
  assert.ok(stored.passwordHash.startsWith('scrypt-v1:'));
  assert.ok(!stored.passwordHash.includes(input.password));
  assert.equal((await call('/auth/me','GET',undefined,registration.cookie)).body.user.id,stored.id);
  const created=await call('/tasks/draft','POST',{description:'Account project'},registration.cookie);
  const id=created.body.task.id;
  assert.equal(created.status,201);assert.equal(created.body.ownerToken,undefined);
  assert.equal(created.body.task.ownerId,undefined);assert.equal(created.body.task.ownerHash,undefined);
  assert.equal(created.body.task.ownership,'account');assert.equal(created.body.task.canManage,true);
  const second=await call('/auth/login','POST',{email:input.email,password:input.password});
  assert.equal(second.status,200);assert.notEqual(second.cookie,registration.cookie);
  assert.equal((await call('/tasks/mine','GET',undefined,second.cookie)).body.tasks[0].id,id);
  assert.equal((await call(`/tasks/${id}`,'GET',undefined,second.cookie)).status,200);
  assert.equal((await call(`/tasks/${id}`)).status,403);
  const other=await call('/auth/register','POST',credentials('other@example.test'));
  assert.deepEqual((await call('/tasks/mine','GET',undefined,other.cookie)).body.tasks,[]);
  assert.equal((await call(`/tasks/${id}`,'PATCH',{version:1,fields:{title:{value:'stolen'}}},other.cookie)).status,403);
  const rotation=await call('/auth/login','POST',{email:input.email,password:input.password},second.cookie);
  assert.equal((await call('/auth/me','GET',undefined,second.cookie)).body.user,null);
  assert.equal((await call('/auth/me','GET',undefined,rotation.cookie)).body.user.id,stored.id);
  const logout=await call('/auth/logout','POST',{},rotation.cookie);
  assert.match(logout.setCookie,/Max-Age=0/);
  assert.equal((await call('/auth/me','GET',undefined,rotation.cookie)).body.user,null);
  assert.equal((await call('/tasks/mine','GET',undefined,rotation.cookie)).status,401);
  assert.equal((await call('/auth/me','GET',undefined,registration.cookie)).body.user.id,stored.id);
});

test('legacy claiming is explicit, preserves content and revokes bearer access',async t=>{
  const {call,store}=await fixture(t);
  const {body:{task,ownerToken}}=await call('/tasks/draft','POST',{description:'Legacy data'});
  const before=store.task(task.id);
  const owner=await call('/auth/register','POST',credentials());
  const other=await call('/auth/register','POST',credentials('other@example.test'));
  assert.equal((await call(`/tasks/${task.id}/claim`,'POST',{},undefined,ownerToken)).status,401);
  assert.equal((await call(`/tasks/${task.id}/claim`,'POST',{},owner.cookie,'wrong')).status,403);
  const claimed=await call(`/tasks/${task.id}/claim`,'POST',{},owner.cookie,ownerToken);
  assert.equal(claimed.status,200);assert.equal(claimed.body.task.ownership,'account');
  assert.deepEqual(store.task(task.id).fields,before.fields);
  assert.equal(store.task(task.id).version,before.version);
  assert.equal((await call(`/tasks/${task.id}`,'GET',undefined,undefined,ownerToken)).status,403);
  assert.equal((await call(`/tasks/${task.id}/claim`,'POST',{},other.cookie,ownerToken)).status,403);
  assert.equal((await call(`/tasks/${task.id}/claim`,'POST',{},owner.cookie)).status,200);
  seed(store);
  assert.equal((await call('/tasks/demo-task-1/claim','POST',{},owner.cookie,'local-demo-owner')).status,400);
});

test('invalid credentials, normalization, CSRF, secure cookie and expiry',async t=>{
  let now=Date.now();
  const {call}=await fixture(t,{secureCookies:true,now:()=>now,maxAttempts:30});
  assert.equal((await call('/auth/register','POST',{name:'A',email:'bad',password:'short'})).status,400);
  assert.equal((await call('/auth/register','POST',{name:'A',email:'a@example.test',password:' '.repeat(12)})).status,400);
  const input=credentials();
  const registered=await call('/auth/register','POST',input);
  assert.match(registered.setCookie,/; Secure/);
  assert.equal((await call('/auth/register','POST',{...input,email:'OWNER@EXAMPLE.TEST'})).status,409);
  const wrong=await call('/auth/login','POST',{email:input.email,password:'wrong-password-123'});
  const missing=await call('/auth/login','POST',{email:'missing@example.test',password:'wrong-password-123'});
  assert.equal(wrong.status,401);assert.deepEqual(wrong.body,missing.body);
  assert.equal((await call('/auth/logout','POST',{},registered.cookie,undefined,{Origin:'https://evil.example'})).status,403);
  assert.equal((await call('/auth/logout','POST',{},registered.cookie,undefined,{'Sec-Fetch-Site':'cross-site'})).status,403);
  assert.equal((await call('/auth/logout','GET',undefined,registered.cookie)).status,404);
  assert.equal((await call('/auth/me','GET',undefined,registered.cookie)).body.user.email,input.email);
  now+=8*24*60*60*1000;
  assert.equal((await call('/auth/me','GET',undefined,registered.cookie)).body.user,null);
});

test('auth attempt limit expires and cannot be bypassed using forwarded address',async t=>{
  let now=Date.now();
  const {call}=await fixture(t,{maxAttempts:2,now:()=>now});
  for(let i=0;i<2;i++)assert.equal((await call('/auth/login','POST',{email:'invalid',password:'short'})).status,400);
  assert.equal((await call('/auth/login','POST',{email:'invalid',password:'short'},undefined,undefined,{'X-Forwarded-For':'1.2.3.4'})).status,429);
  now+=16*60*1000;
  assert.equal((await call('/auth/login','POST',{email:'invalid',password:'short'})).status,400);
});

test('accounts and hashed sessions persist across database reopen',()=>{
  const directory=mkdtempSync(join(tmpdir(),'shoqan-auth-'));
  const file=join(directory,'auth.sqlite');let store;
  try{
    store=createStore(file);
    store.saveUser({id:'test',name:'Test',email:'test@example.test',passwordHash:'synthetic-hash'});
    store.saveSession({tokenHash:hash('synthetic-session'),userId:'test',expiresAt:Date.now()+100000});
    store.close();store=createStore(file);
    assert.equal(store.userByEmail('test@example.test').id,'test');
    assert.equal(store.session(hash('synthetic-session')).userId,'test');
  }finally{store?.close();rmSync(directory,{recursive:true,force:true});}
});
