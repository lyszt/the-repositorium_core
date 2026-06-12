---
title: "eris alias / run"
description: "Save named sequences of shell commands and replay them."
---

# `eris alias` — macros

Save a named sequence of shell commands (a macro) and replay it on demand.

```bash
eris alias add <name> ...     # define a macro
eris alias run <name>         # run it
eris run <name>               # shorthand for "alias run"
```

## Where macros live

Macros are stored in `.eris/.eris.macros` at the project root, in an INI-style format:

```ini
[deploy]
make build
git push origin main
ssh prod "systemctl restart app"
```

## Defining a macro

With the `do` separator — no quoting needed, each `do` starts a new command:

```bash
eris alias add deploy do make build do git push origin main
```

With quotes — for commands that contain semicolons or other shell syntax:

```bash
eris alias add test "npm run lint" "npm test"
```

## Running a macro

```bash
eris alias run deploy
eris run deploy            # shorthand
```

Each line in the macro runs in sequence.

## Related

- [`eris init`](./init) — creates the macros file.
- [Command chaining](./chaining) — combine macros with `and` / `or`.
