import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../server/store.js';
import {createApp} from '../server/app.js';
import {issuePasswordReset} from '../server/auth.js';
import {hash} from '../server/domain.js';

test('local recovery is expiring, single-use, rotates codes and revokes all account sessions',async()=>{
  const store=createStore(':memory:');let now=Date.now();
  const server=createApp(store,{authOptions:{now:()=>now,maxAttempts:100}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/api/auth`;
  async function call(path,body,cookie){
    const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
    return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
  }
  try{
    const email='recovery@example.test',old='Old-password-12345',password='New-password-56789';
    const first=await call('/register',{email,name:'Recovery',password:old});
    const second=await call('/login',{email,password:old});
    const userId=first.body.user.id;
    assert.throws(()=>issuePasswordReset(store,'missing@example.test',now));
    const expired=issuePasswordReset(store,email,now-16*60*1000);
    assert.equal((await call('/reset-password',{token:expired,password})).status,401);
    const superseded=issuePasswordReset(store,email,now);
    const token=issuePasswordReset(store,email,now);
    assert.equal(store.passwordReset(token),undefined);
    assert.equal(store.passwordReset(hash(token)).userId,userId);
    assert.equal((await call('/reset-password',{token:superseded,password})).status,401);
    assert.equal((await call('/reset-password',{token,password:'short'})).status,400);
    const outcomes=await Promise.all([call('/reset-password',{token,password}),call('/reset-password',{token,password})]);
    assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,401]);
    assert.equal((await call('/me',null,first.cookie)).body.user,null);
    assert.equal((await call('/me',null,second.cookie)).body.user,null);
    assert.equal((await call('/login',{email,password:old})).status,401);
    assert.equal((await call('/login',{email,password})).status,200);
    assert.equal((await call('/reset-password',{token,password})).status,401);
    assert.equal(store.passwordReset(hash(token)),undefined);
    assert.notEqual(store.user(userId).passwordHash,password);
  }finally{await new Promise(resolve=>server.close(resolve));store.close();}
});
