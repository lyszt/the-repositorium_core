---
title: "iris init"
description: "Initialize Iris inside a project."
---

# `iris init`

Set up Iris in the current project.

```bash
iris init [name]
```

`name` is optional and defaults to the current folder name.

## What it does

- Creates an `.iris/` directory at the project root.
- Writes the macros file (`.iris/.iris.macros`) used by [macros](./macros).
- Adds `.iris/` to git's **local exclude** (`.git/info/exclude`) so Iris state never shows up in your repository or commits.

Run this once per project before using the other commands.

## Example

```bash
cd my-project
iris init            # registers "my-project"
iris init backend    # or name it explicitly
```

## Related

- [`iris root`](./utilities) — print the detected project root.
