import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function createStore(path = './data/app.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(id), body TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS proposals_task ON proposals(task_id);
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS password_resets (user_id TEXT PRIMARY KEY REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS proposals_sender ON proposals(json_extract(body, '$.senderId'));`);
  return {
    user: id => { const row = db.prepare('SELECT body FROM users WHERE id=?').get(id); return row && JSON.parse(row.body); },
    userByEmail: email => { const row = db.prepare('SELECT body FROM users WHERE email=?').get(email); return row && JSON.parse(row.body); },
    saveUser: user => db.prepare('INSERT INTO users VALUES (?,?,?)').run(user.id, user.email, JSON.stringify(user)),
    session: tokenHash => db.prepare('SELECT user_id AS userId, expires_at AS expiresAt FROM sessions WHERE token_hash=?').get(tokenHash),
    saveSession: session => db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(session.tokenHash, session.userId, session.expiresAt),
    deleteSession: tokenHash => db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash),
    deleteUserSessions: userId => db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId),
    savePasswordReset: (userId, tokenHash, expiresAt) => db.prepare('INSERT INTO password_resets VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET token_hash=excluded.token_hash, expires_at=excluded.expires_at').run(userId,tokenHash,expiresAt),
    passwordReset: tokenHash => db.prepare('SELECT user_id AS userId, expires_at AS expiresAt FROM password_resets WHERE token_hash=?').get(tokenHash),
    deletePasswordReset: userId => db.prepare('DELETE FROM password_resets WHERE user_id=?').run(userId),
    updateUserPassword: (userId, passwordHash) => db.prepare("UPDATE users SET body=json_set(body,'$.passwordHash',?) WHERE id=?").run(passwordHash,userId),
    pruneSessions: now => db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now),
    task: id => { const row = db.prepare('SELECT body FROM tasks WHERE id=?').get(id); return row && JSON.parse(row.body); },
    tasks: () => db.prepare('SELECT body FROM tasks ORDER BY rowid DESC').all().map(row => JSON.parse(row.body)),
    saveTask: task => db.prepare('INSERT INTO tasks VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(task.id, JSON.stringify(task)),
    proposal: id => { const row = db.prepare('SELECT body FROM proposals WHERE id=?').get(id); return row && JSON.parse(row.body); },
    proposals: id => db.prepare('SELECT body FROM proposals WHERE task_id=? ORDER BY rowid DESC').all(id).map(row => JSON.parse(row.body)),
    proposalsBySender: id => db.prepare("SELECT body FROM proposals WHERE json_extract(body, '$.senderId')=? ORDER BY rowid DESC").all(id).map(row => JSON.parse(row.body)),
    saveProposal: proposal => db.prepare('INSERT INTO proposals VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(proposal.id, proposal.taskId, JSON.stringify(proposal)),
    transaction(fn) {
      db.exec('BEGIN IMMEDIATE');
      try { const result = fn(); db.exec('COMMIT'); return result; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    close: () => db.close()
  };
}
