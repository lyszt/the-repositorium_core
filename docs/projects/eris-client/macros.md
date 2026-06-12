---
title: "iris alias / run"
description: "Save named sequences of shell commands and replay them."
---

# `iris alias` — macros

Save a named sequence of shell commands (a macro) and replay it on demand.

```bash
iris alias add <name> ...     # define a macro
iris alias run <name>         # run it
iris run <name>               # shorthand for "alias run"
```

## Where macros live

Macros are stored in `.iris/.iris.macros` at the project root, in an INI-style format:

```ini
[deploy]
make build
git push origin main
ssh prod "systemctl restart app"
```

## Defining a macro

With the `do` separator — no quoting needed, each `do` starts a new command:

```bash
iris alias add deploy do make build do git push origin main
```

With quotes — for commands that contain semicolons or other shell syntax:

```bash
iris alias add test "npm run lint" "npm test"
```

## Running a macro

```bash
iris alias run deploy
iris run deploy            # shorthand
```

Each line in the macro runs in sequence.

## Related

- [`iris init`](./init) — creates the macros file.
- [Command chaining](./chaining) — combine macros with `and` / `or`.
