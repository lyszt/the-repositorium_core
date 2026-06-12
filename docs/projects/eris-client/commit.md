---
title: "iris commit"
description: "Guided Conventional Commit, then stage, commit, and push in one step."
---

# `iris commit`

Stage everything, build a well-formed commit message interactively, then commit and push — in a single command. Works from anywhere inside the project.

```bash
iris commit        # or the alias:
iris copush
```

## What it does

`iris commit` walks you through a structured [Conventional Commit](https://www.conventionalcommits.org/):

1. **Type** — pick from a menu: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`, `build`, `ci`, `revert`, and more.
2. **Scope** — optional; wrapped in parentheses if given.
3. **Subject** — a short description, capped at 72 characters.

It assembles the message — prefixed with the current branch name when you're on one — then runs the equivalent of `git add -A`, commits, and pushes.

If the working tree is clean, it stops and tells you there's nothing to commit.

## Retry

The composed message is cached per branch. If the push fails (network, rejected upstream, …), re-run without retyping anything:

```bash
iris commit --retry   # or -r
```

This reuses the last cached message and attempts the commit/push again.

## Excluding files

Use [`iris ignore`](./ignore) to keep specific files out of the staging that `iris commit` performs.

## Related

- [`iris ignore`](./ignore) — exclude files from staging.
- [Command chaining](./chaining) — e.g. `iris init and commit`.
