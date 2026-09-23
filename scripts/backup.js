import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

export function backupDatabase(source = './data/app.sqlite', directory = './backups') {
  // Read-only mode also prevents a typo from creating an empty source database.
  const db = new DatabaseSync(resolve(source), { readOnly: true });
  let partial;
  try {
    db.exec('PRAGMA busy_timeout=5000');
    mkdirSync(directory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = resolve(directory, `shoqan-${stamp}-${randomUUID()}.sqlite`);
    partial = `${destination}.partial`;
    // SQLite takes a consistent snapshot, including committed WAL data.
    db.prepare('VACUUM INTO ?').run(partial);
    const copy = new DatabaseSync(partial, { readOnly: true });
    try {
      const checks = copy.prepare('PRAGMA integrity_check').all();
      if (checks.length !== 1 || checks[0].integrity_check !== 'ok') {
        throw new Error('Backup integrity check failed');
      }
    } finally { copy.close(); }
    renameSync(partial, destination);
    partial = undefined;
    return destination;
  } finally {
    db.close();
    if (partial) {
      try { unlinkSync(partial); } catch { /* Never touch existing backups. */ }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Backup saved and verified: ${backupDatabase(process.env.DATABASE_PATH)}`);
  } catch (error) {
    console.error(`Backup failed: ${error.message}`);
    process.exitCode = 1;
  }
}
