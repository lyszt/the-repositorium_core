---
title: "eris ignore"
description: "Exclude files from the staging that copush performs."
---

# `eris ignore`

Exclude one or more files from the staging step of [`eris commit`](./commit) / `copush`.

```bash
eris ignore <file> [file ...]
```

## What it does

Adds the given file(s) to `.eris/.eris.ignore`. Anything listed there is skipped when `eris commit` stages changes. The list is **per-project** — stored under `.eris`, not global — so it never affects other repositories or your global git config.

## Example

```bash
eris ignore secrets.env
eris ignore notes.todo scratch.log
```

After this, `eris commit` will stage and push everything *except* those files.

## Related

- [`eris commit`](./commit) — the staging step this affects.
