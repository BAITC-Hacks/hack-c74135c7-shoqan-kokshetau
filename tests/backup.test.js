import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { backupDatabase } from '../scripts/backup.js';
import { createStore } from '../server/store.js';
import { seed } from '../server/seed.js';

function workspace(t) {
  const directory=mkdtempSync(join(tmpdir(),'shoqan-backup-'));
  t.after(()=>{
    assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep+'shoqan-backup-'));
    rmSync(directory,{recursive:true,force:true});
  });
  return directory;
}

test('backup includes live WAL data and restores application records without changing the source',t=>{
  let store;
  t.after(()=>store?.close());
  const directory=workspace(t),source=join(directory,'live.sqlite');
  store=createStore(source);
  seed(store);
  const user={id:'local-user',email:'backup@example.test',name:'Backup test'};
  store.saveUser(user);
  store.saveSession({tokenHash:'test-session-hash',userId:user.id,expiresAt:12345});
  assert.ok(existsSync(`${source}-wal`));
  const destination=backupDatabase(source,join(directory,'copies'));
  const copy=createStore(destination);
  try {
    assert.deepEqual(copy.tasks(),store.tasks());
    for(const task of store.tasks())assert.deepEqual(copy.proposals(task.id),store.proposals(task.id));
    assert.deepEqual(copy.user(user.id),user);
    assert.deepEqual({...copy.session('test-session-hash')},{userId:user.id,expiresAt:12345});
    copy.saveUser({id:'copy-only',email:'copy@example.test'});
    assert.equal(store.user('copy-only'),undefined);
  } finally { copy.close(); }
  const second=backupDatabase(source,join(directory,'copies'));
  assert.notEqual(second,destination);
  assert.ok(existsSync(destination));
  assert.ok(existsSync(second));
  assert.ok(readdirSync(join(directory,'copies')).every(name=>!name.endsWith('.partial')));
});

test('missing source fails without creating an empty database or backup',t=>{
  const directory=workspace(t),source=join(directory,'missing.sqlite');
  assert.throws(()=>backupDatabase(source,join(directory,'copies')));
  assert.equal(existsSync(source),false);
  assert.equal(existsSync(join(directory,'copies')),false);
});
