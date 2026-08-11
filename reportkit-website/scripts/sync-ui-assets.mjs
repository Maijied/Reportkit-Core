#!/usr/bin/env node
/**
 * Copy reportkit-ui assets into the website public folder for /demo.
 */
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = join(root, '..', 'reportkit-ui');
const targets = [
  { from: join(uiRoot, 'js', 'reportkit.js'), to: join(root, 'public', 'js', 'reportkit', 'reportkit.js') },
  { from: join(uiRoot, 'css', 'reportkit.css'), to: join(root, 'public', 'css', 'reportkit', 'reportkit.css') },
  { from: join(uiRoot, 'css', 'reportkit-compat.css'), to: join(root, 'public', 'css', 'reportkit', 'reportkit-compat.css') },
];

for (const { from, to } of targets) {
  if (!existsSync(from)) {
    console.warn('[sync-ui-assets] skip missing', from);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
  console.log('[sync-ui-assets]', to);
}
