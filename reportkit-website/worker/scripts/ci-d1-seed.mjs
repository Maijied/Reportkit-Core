#!/usr/bin/env node
/**
 * Auto-seed free-tier D1 after worker tests on GitHub Actions (Deploy Worker workflow).
 * Skips unless secrets exist and DB is below research scale or seed files changed.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(root, '..');
const isCi = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';

function run(cmd, opts = {}) {
  console.log(`[ci-d1-seed] ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: workerRoot, shell: '/bin/bash', ...opts });
}

function sh(cmd) {
  return execSync(cmd, { cwd: workerRoot, shell: '/bin/bash', encoding: 'utf8' }).trim();
}

if (!isCi) {
  console.log('[ci-d1-seed] skip (not CI)');
  process.exit(0);
}

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, REPORTKIT_LIVE, REPORTKIT_ARCHIVE } = process.env;
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !REPORTKIT_LIVE || !REPORTKIT_ARCHIVE) {
  console.log('[ci-d1-seed] skip — Cloudflare / D1 secrets not configured');
  process.exit(0);
}

let seedFilesChanged = false;
try {
  const diff = sh('git diff --name-only HEAD~1 HEAD 2>/dev/null || true');
  seedFilesChanged = /worker\/seed\/|worker\/scripts\/(seed|ci-d1)/.test(diff);
} catch {
  seedFilesChanged = false;
}

let liveRows = 0;
try {
  run('sed -i "s|\\${REPORTKIT_LIVE}|' + REPORTKIT_LIVE + '|g" wrangler.toml');
  run('sed -i "s|\\${REPORTKIT_ARCHIVE}|' + REPORTKIT_ARCHIVE + '|g" wrangler.toml');
  const out = sh('npx wrangler d1 execute reportkit_live --remote --command "SELECT value FROM report_stats WHERE key=\'live_rows\' LIMIT 1" 2>/dev/null || true');
  const m = out.match(/"value"\s*:\s*"?(\\d+)"?/i) || out.match(/(\\d{4,})/);
  if (m) liveRows = parseInt(m[1], 10);
} catch (e) {
  console.warn('[ci-d1-seed] could not read live_rows meta:', e.message);
}

const RESEARCH_TARGET = 400_000;
const needsSeed = process.env.FORCE_D1_SEED === 'true' || seedFilesChanged || liveRows < RESEARCH_TARGET;

if (!needsSeed) {
  console.log(`[ci-d1-seed] skip — live_rows≈${liveRows} (target ${RESEARCH_TARGET}+) and seed unchanged`);
  process.exit(0);
}

console.log(`[ci-d1-seed] applying research scale (1M measured, 1B virtual meta)`);
run('SEED_SCALE=research npm run seed:sql');

const apply = join(workerRoot, 'scripts', 'seed-apply-remote.sh');
if (!existsSync(apply)) {
  console.error('[ci-d1-seed] missing seed-apply-remote.sh');
  process.exit(1);
}
run(`bash ${apply}`);

console.log('[ci-d1-seed] complete');
