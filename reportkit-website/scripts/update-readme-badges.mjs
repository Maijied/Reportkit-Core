#!/usr/bin/env node
/**
 * Refresh README badge stats from GitHub (languages + topics).
 * Output: .github/badges/stats.json (consumed by shields.io dynamic badges in README.md)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = process.env.GITHUB_REPOSITORY || 'Maijied/Reportkit-Core';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../.github/badges/stats.json');

async function fetchJson(url) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'reportkit-badge-sync',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

const [languages, topics] = await Promise.all([
  fetchJson(`https://api.github.com/repos/${REPO}/languages`),
  fetchJson(`https://api.github.com/repos/${REPO}/topics`),
]);

const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
const languagePct = {};
for (const [name, bytes] of Object.entries(languages)) {
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  languagePct[key] = total ? Math.round((bytes / total) * 1000) / 10 : 0;
}

const stats = {
  updated_at: new Date().toISOString(),
  repo: REPO,
  topic_count: topics.names?.length ?? 0,
  topics: topics.names ?? [],
  languages: languagePct,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
