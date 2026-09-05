# AILesson Open Source Skills

An open collection of practical Agent Skills, curated from existing upstream projects for [AILesson](https://ailesson.io).

**Status:** 47 curated Skills with complete source folders, en/zh catalog metadata, and reproducible download packages. Source and package checks are complete; end-to-end Agent task verification is not claimed.

## What belongs here

- Complete, redistributable upstream Skill folders, with their original authors and licenses preserved.
- Localized catalog descriptions, task categories, prerequisites, and first-use guidance.
- Source repository, path, pinned commit, license evidence, and verification status for every entry.

Repository documentation is English. Skill files have one upstream English version; catalog descriptions and usage metadata have English and Simplified Chinese translations.

We curate existing Skills; we do not create original Skills in this phase. Inclusion does not imply universal compatibility or a security certification.

## Repository structure

```text
catalog/index.json         # Published catalog
catalog/entries/           # Localized entry metadata
catalog/research/          # Intake evidence and deferred candidates
skills/<source>/<name>/    # Complete upstream Skill folders
```

Use a source namespace to distinguish authors while retaining each Skill's original directory name. Never install every folder by default.

## Get a Skill

Browse [catalog/index.json](catalog/index.json) for source folders and usage guidance. Individual ZIP files are provided as GitHub Release assets, with a pinned source revision and checksum. GitHub's **Code → Download ZIP** downloads the whole repository, not one ready-to-upload Skill.

Downloads link directly to GitHub. AILesson does not need a separate Skill file hosting service.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Use an issue to suggest an existing upstream Skill, or submit a pull request with the complete source and provenance. Do not submit credentials, private material, or files without redistribution permission.

## Licensing

AILesson-authored catalog descriptions and repository maintenance materials are provided under the [MIT License](LICENSE). Third-party Skills and their accompanying resources retain their own licenses; the root license does not relicense them. Each imported directory must include its applicable license and notices. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Maintain the catalog

`python3 scripts/build-catalog.py --release catalog-YYYY-MM-DD --date YYYY-MM-DD` checks provenance and builds ZIP files in `dist/`. Publish the ZIPs to the matching GitHub Release before syncing their metadata.

The website reads metadata from D1; Skill files stay on GitHub. Set `CONTENT_API_BASE_URL` and `CONTENT_API_TOKEN` securely in your environment. Run `node scripts/sync.mjs` for a read-only dry run, then add `--apply` to write. Use `--slug=<slug>` for one entry; combine with `--withdraw` to unpublish it. Never remove D1 entries merely because a local file is absent. Staging and production must be synced separately after the application migration is deployed.

New or changed packages require a new Release tag. Unchanged packages keep their existing download URLs and checksums. Source scripts are never executed by the builder; executable file permissions are preserved in the ZIP.

The September 5 expansion reviewed 48 candidates from six repositories, imported 32, and deferred 16 for unresolved licensing or supporting references. See [the intake record](catalog/research/2026-09-05-expansion.json).
