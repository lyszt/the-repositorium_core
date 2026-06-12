---
title: "Utilities"
description: "Maintenance commands: rebuild and root."
---

# Utilities

Small maintenance commands.

## `eris rebuild`

Rebuild the Eris binary itself using CMake.

```bash
eris rebuild
```

Useful after pulling new Eris source or changing its build configuration — it reconfigures and recompiles without leaving the project you're working in.

## `eris root`

Print the detected Eris project root.

```bash
eris root
```

Eris walks up from the current directory to find the `.eris/` directory created by [`eris init`](./init); `eris root` prints the path it resolves to. Handy in scripts and for confirming which project context Eris is operating in.
