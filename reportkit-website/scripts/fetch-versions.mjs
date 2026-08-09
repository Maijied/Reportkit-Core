#!/usr/bin/env node
/**
 * Fetch latest GitHub releases for ReportKit packages (monorepo).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/data/versions.json');

const MONO_REPO = 'Maijied/Reportkit-Website';

const PACKAGES = [
  { id: 'core', composer: 'reportkit/core', tagPrefix: 'core/', path: 'reportkit-core' },
  { id: 'laravel', composer: 'reportkit/laravel', tagPrefix: 'laravel/', path: 'reportkit-laravel' },
  { id: 'laravel-legacy', composer: 'reportkit/laravel-legacy', tagPrefix: 'laravel-legacy/', path: 'reportkit-laravel-legacy' },
  { id: 'ui', npm: '@lorapok-labs/reportkit-ui', tagPrefix: 'ui/', path: 'reportkit-ui' },
];

function channelFromTag(tag) {
  const v = String(tag || '').replace(/^[^/]+\/v/, '');
  if (v.includes('-beta.')) return 'beta';
  if (v.includes('-rc.')) return 'rc';
  if (v.includes('-alpha.')) return 'alpha';
  return 'stable';
}

async function latestRelease(tagPrefix) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'reportkit-website-versions',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const relRes = await fetch(`https://api.github.com/repos/${MONO_REPO}/releases?per_page=30`, { headers });
  if (relRes.ok) {
    const releases = (await relRes.json()).filter((r) => String(r.tag_name || '').startsWith(tagPrefix));
    if (releases.length) {
      const latestAny = releases[0];
      const latestStable = releases.find((r) => !r.prerelease && !r.draft) || null;
      const latestBeta = releases.find((r) => r.prerelease && String(r.tag_name).includes('beta')) || null;
      return {
        tag: latestAny.tag_name,
        version: String(latestAny.tag_name).replace(new RegExp(`^${tagPrefix}v`), ''),
        channel: channelFromTag(latestAny.tag_name),
        prerelease: !!latestAny.prerelease,
        url: latestAny.html_url,
        published_at: latestAny.published_at,
        stable: latestStable
          ? {
              tag: latestStable.tag_name,
              version: String(latestStable.tag_name).replace(new RegExp(`^${tagPrefix}v`), ''),
              url: latestStable.html_url,
            }
          : null,
        beta: latestBeta
          ? {
              tag: latestBeta.tag_name,
              version: String(latestBeta.tag_name).replace(new RegExp(`^${tagPrefix}v`), ''),
              url: latestBeta.html_url,
            }
          : null,
      };
    }
  }

  const tagRes = await fetch(`https://api.github.com/repos/${MONO_REPO}/tags?per_page=50`, { headers });
  if (tagRes.ok) {
    const tags = (await tagRes.json()).filter((t) => String(t.name || '').startsWith(tagPrefix));
    if (tags[0]) {
      const tag = tags[0].name;
      return {
        tag,
        version: String(tag).replace(new RegExp(`^${tagPrefix}v`), ''),
        channel: channelFromTag(tag),
        prerelease: channelFromTag(tag) !== 'stable',
        url: `https://github.com/${MONO_REPO}/releases/tag/${encodeURIComponent(tag)}`,
        published_at: null,
        stable: null,
        beta: null,
      };
    }
  }

  return {
    tag: `${tagPrefix}v0.1.0`,
    version: '0.1.0',
    channel: 'stable',
    prerelease: false,
    url: `https://github.com/${MONO_REPO}`,
    published_at: null,
    stable: { tag: `${tagPrefix}v0.1.0`, version: '0.1.0', url: `https://github.com/${MONO_REPO}` },
    beta: null,
  };
}

const packages = {};
for (const pkg of PACKAGES) {
  packages[pkg.id] = {
    id: pkg.id,
    composer: pkg.composer,
    npm: pkg.npm,
    repo: MONO_REPO,
    path: pkg.path,
    release: await latestRelease(pkg.tagPrefix),
  };
}

const payload = {
  generated_at: new Date().toISOString(),
  channel_default: 'beta',
  monorepo: MONO_REPO,
  packages,
  install: {
    beta: {
      composer: 'composer require reportkit/core:^0.1@beta reportkit/laravel:^0.1@beta',
      npm: 'npm i @lorapok-labs/reportkit-ui@beta',
    },
    stable: {
      composer: 'composer require reportkit/core reportkit/laravel',
      npm: 'npm i @lorapok-labs/reportkit-ui',
    },
  },
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log('Wrote', outPath);
