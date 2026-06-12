---
title: "Introduction"
description: "What Iris is, why it's useful, and how to install it."
---

# Introduction

Iris is a small command-line tool, written in C, that sits on top of `git` and turns the repetitive parts of a development workflow into single, predictable commands. You run `iris` instead of stringing together `git add`, `git commit`, `git push`, branch juggling, and rebases by hand.

It is **project-local**: each project gets its own `.iris/` directory holding macros, ignore rules, and per-branch state. Nothing leaks into the repository itself — `.iris/` is added to git's local exclude on init.

## Why it's useful

Git is general-purpose and verbose. Most day-to-day work is the same handful of motions repeated thousands of times: stage everything, write a well-formed commit message, push to the right upstream, cut a branch, keep it current with the base branch. Iris compresses each of those into one command with sensible defaults:

- **Consistent commits.** A guided prompt produces [Conventional Commit](https://www.conventionalcommits.org/) messages (`feat`, `fix`, `refactor`, …) instead of ad-hoc one-liners — so history stays readable and tooling-friendly.
- **One-shot commit + push.** [`iris commit`](./commit) stages, commits, and pushes in a single step, from anywhere inside the project.
- **Branch and rebase, automated.** [Creating a branch](./branch) with an upstream, or [rebasing](./rebase) a feature branch onto an updated base, are each one command instead of a sequence you have to remember.
- **Project macros.** [Save any sequence](./macros) of shell commands under a name and replay it with `iris run <name>`.
- **Composable.** A Prolog-based command router understands the [`and`, `or`, and `not`](./chaining) connectives, so commands chain with real success/failure logic.

The result is fewer keystrokes, fewer mistakes, and a uniform workflow across every project that uses it.

## Install

From the Iris source tree:

```bash
make install
```

This builds the binary, installs it to `/usr/local/bin/iris`, and appends an `iris` alias to your `.bashrc` or `.zshrc` (auto-detected). Reload your shell afterwards:

```bash
source ~/.zshrc   # or ~/.bashrc
```

Build dependencies (`cmake`, `gcc`/`g++`, `libcurl`, `libssl`, `pkg-config`) are checked and installed automatically. The Prolog command router additionally requires **SWI-Prolog** (`libswipl-dev` on Debian/Ubuntu, `swi-prolog` on Fedora/Arch).

To build without installing:

```bash
make                 # configure + build (Debug)
make CONFIG=Release  # optimized build
make JOBS=8          # parallelism
```

## A typical session

```bash
cd my-project
iris init                   # set up .iris/ in this project
iris branch feature/login   # cut a branch and push it upstream
# ...make changes...
iris commit                 # guided commit, then stage/commit/push
iris rebase                 # bring the branch up to date with the base
```

Each command has its own page in the sidebar.
