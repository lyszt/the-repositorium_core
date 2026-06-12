---
title: "iris ignore"
description: "Exclude files from the staging that copush performs."
---

# `iris ignore`

Exclude one or more files from the staging step of [`iris commit`](./commit) / `copush`.

```bash
iris ignore <file> [file ...]
```

## What it does

Adds the given file(s) to `.iris/.iris.ignore`. Anything listed there is skipped when `iris commit` stages changes. The list is **per-project** — stored under `.iris`, not global — so it never affects other repositories or your global git config.

## Example

```bash
iris ignore secrets.env
iris ignore notes.todo scratch.log
```

After this, `iris commit` will stage and push everything *except* those files.

## Related

- [`iris commit`](./commit) — the staging step this affects.
