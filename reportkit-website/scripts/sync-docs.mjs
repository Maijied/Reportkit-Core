#!/usr/bin/env node
/**
 * Sync package markdown into website snapshots (best-effort).
 * Looks for sibling package dirs in the local workspace; falls back to committed snapshots.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const workspace = path.resolve(root, '..');
const snap = path.join(root, 'content-snapshots');

const sources = [
  ['reportkit-core/docs/API.md', 'API.md'],
  ['reportkit-core/docs/ARCHITECTURE.md', 'ARCHITECTURE.md'],
  ['reportkit-core/docs/COMPATIBILITY.md', 'COMPATIBILITY.md'],
  ['reportkit-laravel/docs/INSTALL.md', 'INSTALL-laravel.md'],
  ['reportkit-laravel-legacy/docs/INSTALL.md', 'INSTALL-legacy.md'],
  ['reportkit-ui/docs/CSS.md', 'CSS.md'],
  ['reportkit-ui/docs/JS.md', 'JS.md'],
];

fs.mkdirSync(snap, { recursive: true });

let updated = 0;
let missing = 0;
for (const [rel, dest] of sources) {
  const from = path.join(workspace, rel);
  const to = path.join(snap, dest);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    updated += 1;
    console.log(`synced ${rel} -> ${dest}`);
  } else if (fs.existsSync(to)) {
    console.log(`keep snapshot ${dest} (source missing)`);
    missing += 1;
  } else {
    console.error(`FATAL: missing source and snapshot for ${dest}`);
    process.exit(1);
  }
}

console.log(`sync-docs done: ${updated} updated, ${missing} snapshot fallbacks`);
