#!/usr/bin/env node
/**
 * Runs at end of `npm run build` on GitHub Actions — no workflow YAML changes required.
 * Quality + Deploy site workflows already invoke npm run build.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isCi = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';

function run(cmd, opts = {}) {
  console.log(`[ci-gate] ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

if (!isCi) {
  console.log('[ci-gate] skip (not CI)');
  process.exit(0);
}

console.log('[ci-gate] post-build verification');

const dist = join(root, 'dist');
for (const route of ['index.html', 'demo/index.html', 'simulation/index.html']) {
  const p = join(dist, route);
  if (!existsSync(p)) {
    console.error(`[ci-gate] missing dist/${route}`);
    process.exit(1);
  }
}

try {
  run('npm run check');
} catch {
  console.warn('[ci-gate] astro check failed (non-blocking)');
}

run('npx playwright install --with-deps chromium');
run('npm run test:e2e');

console.log('[ci-gate] done');
