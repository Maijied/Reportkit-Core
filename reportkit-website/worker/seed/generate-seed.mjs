#!/usr/bin/env node
/**
 * Generate modest seed SQL for D1 free tier.
 * Default: ~2k live + ~2k archive with ~200 overlapping trip_ids.
 * For the marketing "1.5M" story, run with SEED_SCALE=large (still keep under free write budget per day).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const scale = process.env.SEED_SCALE === 'large' ? 50000 : 2000;
const overlap = Math.floor(scale * 0.1);

const operators = ['Hanif', 'Green Line', 'Shyamoli', 'Ena', 'Desh Travels'];
const routes = ['DHK-CTG', 'DHK-SYL', 'DHK-RAJ', 'DHK-KHL', 'CTG-DHK'];
const channels = ['online', 'offline'];

function row(id, dayOffset, prefix) {
  const d = new Date(Date.UTC(2025, 6, 1));
  d.setUTCDate(d.getUTCDate() + (dayOffset % 200));
  const booked = d.toISOString().slice(0, 10);
  const op = operators[id % operators.length];
  const route = routes[id % routes.length];
  const channel = channels[id % 2];
  const seats = 1 + (id % 4);
  const fare = 50000 + (id % 40) * 1000;
  return `INSERT INTO trips VALUES ('${prefix}${id}','${booked}','${op}','${route}','${channel}',${seats},${fare},'confirmed');`;
}

const live = [];
const archive = [];

for (let i = 0; i < scale; i++) {
  live.push(row(i, i, 'L-'));
}
for (let i = 0; i < scale; i++) {
  // overlapping IDs for first `overlap` rows use L- prefix so dedupe drops archive copy
  const prefix = i < overlap ? 'L-' : 'A-';
  archive.push(row(i, i + 120, prefix));
}

fs.writeFileSync(path.join(root, 'live.seed.sql'), live.join('\n'));
fs.writeFileSync(path.join(root, 'archive.seed.sql'), archive.join('\n'));
console.log(`Wrote seed SQL: ${scale} live, ${scale} archive, overlap=${overlap}`);
