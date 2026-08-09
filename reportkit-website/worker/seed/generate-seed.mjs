#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const res = spawnSync(process.execPath, [path.join(root, 'generate-research-seed.mjs')], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(res.status ?? 1);
