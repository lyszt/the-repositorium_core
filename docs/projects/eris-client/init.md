---
title: "eris init"
description: "Initialize Eris inside a project."
---

# `eris init`

Set up Eris in the current project.

```bash
eris init [name]
```

`name` is optional and defaults to the current folder name.

## What it does

- Creates an `.eris/` directory at the project root.
- Writes the macros file (`.eris/.eris.macros`) used by [macros](./macros).
- Adds `.eris/` to git's **local exclude** (`.git/info/exclude`) so Eris state never shows up in your repository or commits.

Run this once per project before using the other commands.

## Example

```bash
cd my-project
eris init            # registers "my-project"
eris init backend    # or name it explicitly
```

## Related

- [`eris root`](./utilities) — print the detected project root.
