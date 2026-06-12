---
title: "eris branch"
description: "Create a git branch and push it upstream in one command."
---

# `eris branch`

Create a new branch and immediately publish it.

```bash
eris branch <name>
```

## What it does

1. Creates the branch and switches to it (`git checkout -b <name>`).
2. Pushes it with an upstream set (`git push --set-upstream origin <name>`).

The branch is tracked from the moment it exists, so subsequent pushes and [`eris commit`](./commit) need no extra `--set-upstream` step.

## Example

```bash
eris branch feature/login
```

Creates `feature/login`, switches to it, and pushes it to `origin` with tracking configured.

## Related

- [`eris rebase`](./rebase) — keep the branch current with its base.
- [`eris commit`](./commit) — commit and push on the new branch.
