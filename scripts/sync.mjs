#!/usr/bin/env node
// Tokens are read only from the process environment. No credentials are written to Git.
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
const apply = process.argv.includes('--apply');
const requested = process.argv.find((arg) => arg.startsWith('--slug='))?.slice(7);
const catalog = JSON.parse(await readFile(new URL('../catalog/index.json', import.meta.url), 'utf8'));
const withdrawn = catalog.withdrawnSlugs ?? [];
if (!Array.isArray(withdrawn) || withdrawn.some((slug) => !catalog.entries.some((entry) => entry.slug === slug))) throw new Error('withdrawnSlugs must contain known catalog slugs.');
const base = process.env.CONTENT_API_BASE_URL;
const token = process.env.CONTENT_API_TOKEN;
if (!base || !token) throw new Error('Set CONTENT_API_BASE_URL and CONTENT_API_TOKEN in the environment.');
const origin = new URL(base);
if (!['https://ailesson.dev', 'https://ailesson.io', 'http://localhost:5173'].includes(origin.origin)) throw new Error('Use an AILesson environment URL.');
if (!!process.env.CF_ACCESS_CLIENT_ID !== !!process.env.CF_ACCESS_CLIENT_SECRET) throw new Error('Cloudflare Access credentials must be configured together.');
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
if (process.env.CF_ACCESS_CLIENT_ID) {
  headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID;
  headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET;
}
const entries = catalog.entries.filter((entry) => !requested || entry.slug === requested);
if (!entries.length) throw new Error('No matching entries.');
for (const skill of entries) {
  const url = new URL(`/api/content/v1/agent-skills/${skill.slug}`, origin);
  const current = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!current.ok && current.status !== 404) throw new Error(`Read failed (${current.status}) for ${skill.slug}.`);
  const existing = current.ok ? await current.json() : null;
  const payload = { schemaVersion: 1, revision: catalog.revision, published: !process.argv.includes('--withdraw') && !withdrawn.includes(skill.slug), position: catalog.entries.indexOf(skill), skill };
  const unchanged = existing && ['schemaVersion', 'revision', 'published', 'position', 'skill'].every((key) => isDeepStrictEqual(existing[key], payload[key]));
  console.log(`${unchanged ? 'UNCHANGED' : existing ? 'UPDATE' : 'CREATE'} ${skill.slug}${apply ? '' : ' (dry run)'}`);
  if (!unchanged && apply) {
    const endpoint = existing ? url : new URL('/api/content/v1/agent-skills', origin);
    const response = await fetch(endpoint, { method: existing ? 'PUT' : 'POST', headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Write failed (${response.status}) for ${skill.slug}.`);
  }
}
