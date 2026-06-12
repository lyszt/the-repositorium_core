---
title: "Utilities"
description: "Maintenance commands: rebuild and root."
---

# Utilities

Small maintenance commands.

## `iris rebuild`

Rebuild the Iris binary itself using CMake.

```bash
iris rebuild
```

Useful after pulling new Iris source or changing its build configuration — it reconfigures and recompiles without leaving the project you're working in.

## `iris root`

Print the detected Iris project root.

```bash
iris root
```

Iris walks up from the current directory to find the `.iris/` directory created by [`iris init`](./init); `iris root` prints the path it resolves to. Handy in scripts and for confirming which project context Iris is operating in.
