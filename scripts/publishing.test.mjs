import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

async function run(script, catalog, mock, args = []) {
  const root = await mkdtemp(join(tmpdir(), 'skill-publishing-'));
  try {
    await mkdir(join(root, 'scripts'));
    await mkdir(join(root, 'catalog'));
    await copyFile(new URL(script, import.meta.url), join(root, 'scripts', script));
    await writeFile(join(root, 'catalog/index.json'), JSON.stringify(catalog));
    await writeFile(join(root, 'mock.mjs'), mock);
    return spawnSync(process.execPath, ['--import', join(root, 'mock.mjs'), join(root, 'scripts', script), ...args], {
      encoding: 'utf8', env: { PATH: process.env.PATH, CONTENT_API_BASE_URL: 'https://ailesson.dev', CONTENT_API_TOKEN: 'test-only' },
    });
  } finally { await rm(root, { recursive: true, force: true }); }
}
const entry = { slug: 'example', download: { release: 'catalog-test', file: 'example.zip', bytes: 3, sha256: createHash('sha256').update('zip').digest('hex') } };

test('download verification rejects unavailable and corrupted assets', async () => {
  for (const mock of ["new Response('', {status:404})", "new Response('bad')", "new Response('oversize')"]) {
    const result = await run('verify-downloads.mjs', { entries: [entry] }, `globalThis.fetch = async () => ${mock};`);
    assert.notEqual(result.status, 0);
  }
});
test('download verification accepts matching bytes without credentials', async () => {
  const result = await run('verify-downloads.mjs', { entries: [entry] }, `globalThis.fetch = async (url, options) => {
    if (options.headers) throw new Error('Credentials leaked');
    if (!url.startsWith('https://github.com/ailessonio/open-source-skills/releases/download/')) throw new Error('Wrong host');
    return new Response('zip');
  };`);
  assert.equal(result.status, 0, result.stderr);
});
test('automatic sync preserves catalog withdrawals', async () => {
  const result = await run('sync.mjs', { entries: [entry], withdrawnSlugs: ['example'], revision: 'a'.repeat(40) }, `globalThis.fetch = async (url, options) => {
    if (!options.method) return new Response('', {status:404});
    if (JSON.parse(options.body).published !== false) throw new Error('Republished withdrawn entry');
    return new Response('{}');
  };`, ['--apply']);
  assert.equal(result.status, 0, result.stderr);
});
test('invalid withdrawal blocks sync before requests', async () => {
  const result = await run('sync.mjs', { entries: [entry], withdrawnSlugs: ['missing'] }, "globalThis.fetch = async () => { throw new Error('Unexpected request'); };", ['--apply']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /withdrawnSlugs must contain known/);
});
