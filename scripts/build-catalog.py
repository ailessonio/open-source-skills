#!/usr/bin/env python3
"""Validate metadata, preserve upstream files, and build deterministic GitHub ZIP assets."""
import argparse
from datetime import date
import re
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Validate committed catalog and packages without rewriting metadata')
parser.add_argument('--release', help='New GitHub Release tag for new or changed packages')
parser.add_argument('--date', default=date.today().isoformat(), help='Catalog review date (YYYY-MM-DD)')
ARGS = parser.parse_args()
assert ARGS.check or ARGS.release, '--release is required unless --check is used'
assert ARGS.release is None or re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', ARGS.release)
date.fromisoformat(ARGS.date)

def build():
    OUT.mkdir(exist_ok=True)
    entries = []
    for path in sorted((ROOT / 'catalog/entries').glob('*.json')):
        entry = json.loads(path.read_text())
        folder = ROOT / entry['path']
        assert folder.resolve().is_relative_to((ROOT / 'skills').resolve())
        assert (folder / 'SKILL.md').is_file()
        assert (folder / 'LICENSE').exists() or (folder / 'LICENSE.txt').exists()
        assert entry['language'] == 'en'
        for locale in ['en', 'zh']:
            for key in ['title', 'description', 'tasks', 'prerequisites', 'example', 'expectedResult', 'limitations']:
                assert entry['translations'][locale][key], (path, locale, key)
        provenance = json.loads((folder / 'PROVENANCE.json').read_text())
        for relative, expected in provenance['sha256'].items():
            assert hashlib.sha256((folder / relative).read_bytes()).hexdigest() == expected, (path, relative)
        target = OUT / f"{entry['slug']}.zip"
        with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
            for file in sorted(folder.rglob('*')):
                assert not file.is_symlink(), file
                if not file.is_file():
                    continue
                info = zipfile.ZipInfo(f"{entry['name']}/{file.relative_to(folder)}", date_time=(2026, 9, 5, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o100000 | (file.stat().st_mode & 0o777)) << 16
                archive.writestr(info, file.read_bytes())
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        previous = entry.get('download')
        if ARGS.check:
            assert previous and previous['sha256'] == digest, f'{path}: rebuild catalog before syncing'
        if not previous or previous['sha256'] != digest:
            assert not previous or previous['release'] != ARGS.release, 'Changed packages require a new Release tag'
            entry['download'] = {'release': ARGS.release, 'file': target.name, 'sha256': digest, 'bytes': target.stat().st_size}
        else:
            assert previous['bytes'] == target.stat().st_size and previous['file'] == target.name
        if not ARGS.check:
            path.write_text(json.dumps(entry, ensure_ascii=False, indent=2) + '\n')
        entries.append(entry)
    if ARGS.check:
        catalog = json.loads((ROOT / 'catalog/index.json').read_text())
        assert catalog['schemaVersion'] == 1 and re.fullmatch(r'[0-9a-f]{40}', catalog['revision'])
        withdrawn = catalog.get('withdrawnSlugs', [])
        assert isinstance(withdrawn, list) and all(slug in [entry['slug'] for entry in entries] for slug in withdrawn), 'Invalid withdrawnSlugs'
        assert catalog['entries'] == entries, 'catalog/index.json is stale; rebuild it'
        print(f'Validated {len(entries)} committed entries and ZIP files without rewriting metadata.')
        return
    previous_catalog = json.loads((ROOT / 'catalog/index.json').read_text()) if (ROOT / 'catalog/index.json').exists() else {}
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    catalog = {'schemaVersion': 1, 'revision': revision, 'updatedAt': ARGS.date, 'entries': entries}
    if 'withdrawnSlugs' in previous_catalog:
        catalog['withdrawnSlugs'] = previous_catalog['withdrawnSlugs']
    (ROOT / 'catalog/index.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(f"Validated {len(entries)} entries and built {len(entries)} complete ZIP files.")

if __name__ == '__main__':
    build()
