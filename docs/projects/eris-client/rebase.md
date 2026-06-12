---
title: "iris rebase"
description: "Rebase a branch onto the freshly-updated base branch."
---

# `iris rebase`

Bring a branch up to date by rebasing it onto the latest base branch.

```bash
iris rebase [branch]
```

`branch` is optional and defaults to the **current** branch.

## What it does

1. Detects the repository's default branch via `origin/HEAD` (falling back to `master`).
2. `git fetch origin`.
3. Checks out the base branch and pulls it up to date.
4. Checks out the target branch (the argument, or your current branch).
5. Rebases the target onto the freshly-updated base.

If the target *is* the base branch, Iris stops — there's nothing to rebase.

## Conflicts

If the rebase hits conflicts, Iris stops and tells you to resolve them and continue manually:

```bash
# resolve conflicts in your editor, then:
git rebase --continue
```

## Examples

```bash
iris rebase                 # rebase the current branch onto the base
iris rebase feature/login   # rebase a specific branch
```

## Related

- [`iris branch`](./branch) — create the branch you'll later rebase.
