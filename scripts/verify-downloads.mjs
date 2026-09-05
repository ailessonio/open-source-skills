#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// Public GitHub downloads never receive Content API credentials.
const catalog = JSON.parse(await readFile(new URL('../catalog/index.json', import.meta.url), 'utf8'));
for (const { slug, download } of catalog.entries) {
  const url = `https://github.com/ailessonio/open-source-skills/releases/download/${encodeURIComponent(download.release)}/${encodeURIComponent(download.file)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${slug}: download failed (${response.status})`);
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > download.bytes) throw new Error(`${slug}: download exceeds expected size`);
    hash.update(chunk);
  }
  if (bytes !== download.bytes || hash.digest('hex') !== download.sha256) {
    throw new Error(`${slug}: download size or SHA-256 mismatch`);
  }
  console.log(`VERIFIED ${slug}`);
}
