#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cname = path.join(root, 'CNAME');
const dist = path.join(root, 'dist', 'CNAME');
if (!fs.existsSync(cname)) {
  console.error('CNAME missing at repo root');
  process.exit(1);
}
const value = fs.readFileSync(cname, 'utf8').trim();
if (value !== 'reportkit.lorapok.tech') {
  console.error(`CNAME must be exactly reportkit.lorapok.tech, got: ${JSON.stringify(value)}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(dist), { recursive: true });
fs.writeFileSync(dist, 'reportkit.lorapok.tech\n');
console.log('ensured dist/CNAME');
