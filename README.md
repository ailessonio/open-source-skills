# AILesson Agent Skills

An open collection of practical Agent Skills, curated from existing upstream projects for [AILesson](https://ailesson.io).

**Status:** repository setup. No Skills have been imported or runtime-verified yet. The website catalog and per-Skill downloads are planned.

## What belongs here

- Complete, redistributable upstream Skill folders, with their original authors and licenses preserved.
- Public English and Simplified Chinese descriptions, task categories, prerequisites, and first-use guidance.
- Source repository, path, pinned commit, license evidence, and verification status for every entry.

We curate existing Skills; we do not create original Skills in this phase. Inclusion does not imply universal compatibility or a security certification.

## Repository structure

```text
catalog/index.json         # Published catalog; empty until entries pass review
catalog/entries/           # Planned: bilingual entry metadata
catalog/collections/       # Planned: task-based collections
skills/<source>/<name>/    # Planned: complete upstream Skill folders
```

Use a source namespace to distinguish authors while retaining each Skill's original directory name. Never install every folder by default.

## Get a Skill

There are currently no installable entries. Once published, each entry will link to its source folder and installation guidance. Individual ZIP files may be provided as GitHub Release assets, with a pinned source revision and checksum. GitHub's **Code → Download ZIP** downloads the whole repository, not one ready-to-upload Skill.

Downloads will link directly to GitHub. AILesson does not need a separate Skill file hosting service.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Use an issue to suggest an existing upstream Skill, or submit a pull request with the complete source and provenance. Do not submit credentials, private material, or files without redistribution permission.

## Licensing

AILesson-authored catalog descriptions and repository maintenance materials are provided under the [MIT License](LICENSE). Third-party Skills and their accompanying resources retain their own licenses; the root license does not relicense them. Each imported directory must include its applicable license and notices. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## 中文说明

这是 AILesson 的公开 Agent Skills 内容仓库，收集互联网上已有、允许再分发的实用 Skills，并维护中英文介绍、使用条件和来源记录。

目前仅完成仓库初始化，尚未导入或验证任何 Skill。后续网站负责搜索、筛选与使用指导，内容与下载直接链接 GitHub。欢迎通过 Issue 推荐来源，或通过 Pull Request 改进内容。第三方内容保留各自许可证，不统一改为 MIT。
