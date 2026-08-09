#!/usr/bin/env node
/**
 * Research-aligned D1 seed generator.
 *
 * Provenance model (see docs/RESEARCH.md):
 * - synthetic: 50M virtual rows (2012 → now) — not stored on D1
 * - live (measured): dual-D1 sample with operator catalog cross-reference
 *
 * Scales (SEED_SCALE):
 * - default     → 2k + 2k
 * - large       → 50k + 50k
 * - research    → 500k + 500k (1M measured — max for free-tier CI)
 * - research-full → 25M + 25M (local/paid D1 only — run manually)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const operators = JSON.parse(fs.readFileSync(path.join(root, 'operators.json'), 'utf8'));

const ROUTES = ['HUB-A-HUB-B', 'HUB-A-HUB-C', 'HUB-A-HUB-D', 'HUB-B-HUB-A', 'HUB-C-HUB-A', 'HUB-D-HUB-A', 'HUB-E-HUB-A', 'HUB-F-HUB-A'];
const CHANNELS = ['online', 'offline'];
const STATUSES = ['confirmed', 'completed', 'cancelled'];

const PRESETS = {
  default: { live: 2000, archive: 2000, overlapPct: 0.1 },
  large: { live: 50000, archive: 50000, overlapPct: 0.1 },
  research: { live: 500000, archive: 500000, overlapPct: 0.08 },
  'research-full': { live: 25000000, archive: 25000000, overlapPct: 0.05 },
};

const scaleName = process.env.SEED_SCALE || 'default';
const preset = PRESETS[scaleName] || PRESETS.default;
const BATCH_SIZE = parseInt(process.env.SEED_BATCH || '500', 10);
const ROWS_PER_FILE = parseInt(process.env.SEED_ROWS_PER_FILE || '25000', 10);

const LIVE_START = Date.parse('2018-01-01T00:00:00Z');
const LIVE_END = Date.now();
const ARCHIVE_START = Date.parse('2012-01-01T00:00:00Z');
const ARCHIVE_END = Date.parse('2017-12-31T00:00:00Z');

/** Dummy demo totals — no real customer or production data. */
const VIRTUAL_LOGICAL_TOTAL = 50_000_000;

function isoDay(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function dayInRange(index, total, startMs, endMs) {
  const span = endMs - startMs;
  const offset = Math.floor((index / Math.max(total, 1)) * span);
  return isoDay(startMs + offset);
}

function operatorInserts() {
  return operators.map(
    (o) =>
      `INSERT OR IGNORE INTO operators VALUES (${o.id},'${o.code}','${o.name.replace(/'/g, "''")}','${o.region}','${o.active_since}');`
  );
}

function liveTripRow(i, overlap) {
  const op = operators[i % operators.length];
  const booked = dayInRange(i, preset.live, LIVE_START, LIVE_END);
  const route = ROUTES[i % ROUTES.length];
  const channel = CHANNELS[i % CHANNELS.length];
  const seats = 1 + (i % 4);
  const fare = 45000 + (i % 120) * 500;
  const status = STATUSES[i % 20 === 0 ? 2 : i % 50 === 0 ? 1 : 0];
  const prefix = i < overlap ? 'X' : 'L';
  const tripId = `${prefix}-${String(i).padStart(10, '0')}`;
  return `INSERT OR IGNORE INTO trips VALUES ('${tripId}','${booked}',${op.id},'${route}','${channel}',${seats},${fare},'${status}');`;
}

function archiveTripRow(i, overlap) {
  const op = operators[i % operators.length];
  const booked = dayInRange(i, preset.archive, ARCHIVE_START, ARCHIVE_END);
  const route = ROUTES[(i + 3) % ROUTES.length];
  const channel = CHANNELS[i % CHANNELS.length];
  const seats = 1 + (i % 5);
  const fare = 35000 + (i % 100) * 450;
  const status = STATUSES[i % 30 === 0 ? 2 : 0];
  const prefix = i < overlap ? 'X' : 'A';
  const tripId = `${prefix}-${String(i).padStart(10, '0')}`;
  return `INSERT OR IGNORE INTO trips VALUES ('${tripId}','${booked}','${op.code}','${route}','${channel}',${seats},${fare},'${status}');`;
}

function writeBatches(prefix, lines, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith(prefix) && f.endsWith('.sql')) fs.unlinkSync(path.join(outDir, f));
  }
  const files = [];
  let chunk = [];
  let fileIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    chunk.push(lines[i]);
    if (chunk.length >= ROWS_PER_FILE || i === lines.length - 1) {
      const name = `${prefix}.${String(fileIdx).padStart(4, '0')}.sql`;
      fs.writeFileSync(path.join(outDir, name), chunk.join('\n'));
      files.push(name);
      chunk = [];
      fileIdx++;
    }
  }
  return files;
}

function metaSql() {
  const now = new Date().toISOString();
  return [
    `INSERT OR REPLACE INTO report_meta VALUES ('virtual_logical_total','${VIRTUAL_LOGICAL_TOTAL}','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('data_kind','dummy_synthetic','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('live_date_min','2018-01-01','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('live_date_max','${isoDay(LIVE_END)}','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('archive_date_min','2012-01-01','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('archive_date_max','2017-12-31','${now}');`,
    `INSERT OR REPLACE INTO report_meta VALUES ('note','Fictional operators and routes for demo only','${now}');`,
    `INSERT OR REPLACE INTO report_stats VALUES ('live_rows',${preset.live},'${now}');`,
    `INSERT OR REPLACE INTO report_stats VALUES ('archive_rows',${preset.archive},'${now}');`,
    `INSERT OR REPLACE INTO report_stats VALUES ('virtual_logical_total',${VIRTUAL_LOGICAL_TOTAL},'${now}');`,
  ].join('\n');
}

const overlap = Math.floor(Math.min(preset.live, preset.archive) * preset.overlapPct);

console.log(`Scale: ${scaleName} → live=${preset.live}, archive=${preset.archive}, overlap=${overlap}`);

const liveLines = [...operatorInserts()];
for (let i = 0; i < preset.live; i++) liveLines.push(liveTripRow(i, overlap));

const archiveLines = [];
for (let i = 0; i < preset.archive; i++) archiveLines.push(archiveTripRow(i, overlap));

const batchDir = path.join(root, 'batches');
const liveFiles = writeBatches('live', liveLines, batchDir);
const archiveFiles = writeBatches('archive', archiveLines, batchDir);

fs.writeFileSync(path.join(root, 'live.meta.sql'), metaSql());
fs.writeFileSync(
  path.join(root, 'archive.meta.sql'),
  [
    `INSERT OR REPLACE INTO report_stats VALUES ('archive_rows',${preset.archive},'${new Date().toISOString()}');`,
    `INSERT OR REPLACE INTO report_stats VALUES ('virtual_logical_total',${VIRTUAL_LOGICAL_TOTAL},'${new Date().toISOString()}');`,
  ].join('\n')
);

const manifest = {
  scale: scaleName,
  live_rows: preset.live,
  archive_rows: preset.archive,
  overlap,
  virtual_logical_total: VIRTUAL_LOGICAL_TOTAL,
  data_kind: 'dummy_synthetic',
  live_batches: liveFiles,
  archive_batches: archiveFiles,
  date_ranges: {
    live: ['2018-01-01', isoDay(LIVE_END)],
    archive: ['2012-01-01', '2017-12-31'],
  },
};

fs.writeFileSync(path.join(batchDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${liveFiles.length} live + ${archiveFiles.length} archive batch files`);
console.log(JSON.stringify(manifest, null, 2));
