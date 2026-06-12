---
title: "Using the simulator"
description: "A walkthrough of the Tesserae Venus UI, panels, and workflow."
---

# Using the simulator

Tesserae Venus lives at `/toolkit/tesserae-venus-simulator` on the Tesserae platform. The UI is a single-page IDE laid out with a vertical navigation bar on the left and a content area on the right.

## Navigation panels

| Panel | Icon | Purpose |
|-------|------|---------|
| **Projects** | Folder | Browse, open, and delete saved programs |
| **Editor** | Code | Write assembly; the simulator side-panel is docked here on desktop |
| **Simulator** | CPU | Full-width register and output view (mobile-friendly) |
| **Reference** | Table | Searchable instruction reference |
| **Learn** | Book | Interactive lessons with runnable examples |
| **Export** | Download | Save the current program as `.asm` or `.riscv` |

## Writing code

The Editor panel uses **Monaco** (the same editor as VS Code) with a custom RISC-V language mode providing syntax highlighting. On mobile and narrow screens, a **token bar** appears below the editor — tap any mnemonic or register name to insert it at the cursor without a keyboard.

## Running a program

Controls appear in the Simulator panel toolbar:

| Button | Action |
|--------|--------|
| **Run** | Execute the entire program |
| **Step** | Execute one instruction |
| **Reset** | Reset registers and output, keep the code |

The output console is displayed below the register file. If your program uses `ecall` service 5 (read integer), an input prompt appears inline when that instruction is reached.

## The register view

The register display shows all 32 RISC-V registers by their ABI names (`zero`, `ra`, `sp`, `a0`–`a7`, `t0`–`t6`, `s0`–`s11`). Registers that changed in the most recent step are highlighted. The display can be toggled between **decimal** and **hexadecimal** using the toolbar toggle.

## Saving and sessions

Work is saved in two ways:

- **Named projects** — click **Save** (or use the name input and Enter) to create a named snapshot in the browser's local storage. Projects are listed in the Projects panel and persist indefinitely.
- **Session autosave** — the editor content, project name, and save state are written to `sessionStorage` roughly 400ms after each keystroke. If you reload the page, your last working state is automatically restored without any action.

To download your program as a file, open the **Export** panel and choose `.asm` or `.riscv`. The filename is derived from the project name (or `untitled` if unsaved).

## The Learn panel

The Learn panel contains a series of interactive lessons covering RISC-V from the ground up. Each lesson has:

- Explanatory prose broken into sections
- Read-only code examples
- **Runnable examples** — click **Load into editor** to copy the example into the editor, then switch to the Editor panel and run it

The same content, extracted and expanded, is available in the [RISC-V guide](/risc-v/).
