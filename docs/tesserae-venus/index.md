---
title: "Tesserae Venus"
description: "A multilingual, in-browser RISC-V assembly simulator and learning environment built into Tesserae."
---

# Tesserae Venus

**Tesserae Venus is a RISC-V assembly simulator that runs entirely in your browser.** Write assembly, run it, step through it one instruction at a time, watch every register and memory cell change — no toolchain, no installation, no account.

> **Open the live simulator → [joaoluisalmeidasantos.com/en/toolkit/tesserae-venus-simulator](https://joaoluisalmeidasantos.com/en/toolkit/tesserae-venus-simulator)**

It is built directly into the [Tesserae](https://github.com/lyszt/lyszt_tesserae_core) platform as one of its toolkit tools. The name is a nod to [Venus](https://github.com/kvakil/venus), Keyhan Vakil's original educational RISC-V simulator — Tesserae Venus is a from-scratch successor wrapped in a redesigned IDE, with a built-in lesson track and a reference that speak many languages.

## Why it exists — the philosophy

Computer architecture is taught in English, by default. The canonical RISC-V references, the famous textbooks, and nearly every simulator assume the reader already reads technical English. That excludes a large share of the people first meeting a register file.

**Tesserae Venus exists to expose clean, accurate RISC-V documentation in the maximum number of languages possible.** RISC-V itself is the right vehicle for this: it is an open standard, small enough to learn completely, and free of the historical baggage of older ISAs. The teaching material around it should be just as open and just as reachable — so the lessons, the instruction reference, and the entire UI are translated, not just the chrome.

The goal is simple to state and hard to do well: a student should be able to learn how a CPU actually works in their own language, in a tab, with a real machine reacting under their fingertips.

Today the interface, lessons, and reference are available in **13 languages**:

| | | |
|---|---|---|
| العربية (Arabic) | Deutsch (German) | English |
| Español (Spanish) | Français (French) | Italiano (Italian) |
| 日本語 (Japanese) | 한국어 (Korean) | Nederlands (Dutch) |
| Polski (Polish) | Português (Portuguese) | Русский (Russian) |
| 中文 (Chinese) | | |

Translations cover the lesson prose, instruction descriptions, the navigation, and tooltips — the assembly mnemonics themselves stay standard, because that is the shared vocabulary you carry to any other RISC-V tool.

## What it implements

Tesserae Venus runs **RV32IM**:

- **RV32I** — the 32-bit base integer instruction set: arithmetic, logic, shifts, loads/stores, branches, jumps, `lui`/`auipc`, and `ecall`.
- **M extension** — `mul`, `mulh`, `div`, `divu`, `rem`, `remu`.

This is the exact subset taught in most undergraduate computer-architecture courses, so programs written here transfer directly to coursework and to other Venus-family simulators.

### Machine model

The engine emulates a real little-endian RV32 machine with a conventional memory layout:

| Region | Base address | Purpose |
|--------|-------------|---------|
| Text | `0x00400000` | Your assembled instructions |
| Data | `0x10010000` | The `.data` section |
| Global pointer (`gp`) | `0x10010800` | `data base + 0x800` |
| Stack top (`sp`) | `0x7ffffff0` | Grows downward |

All 32 registers use their standard ABI names — `zero`, `ra`, `sp`, `gp`, `tp`, `t0`–`t6`, `s0`–`s11`, `a0`–`a7` (plus `fp` as an alias for `s0`). Immediates accept decimal, `0x` hex, `0b` binary, negatives, and character literals like `'a'`, `'\n'`, `'\0'`.

### System calls (`ecall`)

Services follow the standard convention: the service number goes in `a7`, arguments in `a0`.

| `a7` | Service | Effect |
|------|---------|--------|
| `1` | print int | Prints `a0` as a signed integer |
| `4` | print string | Prints the null-terminated string at address `a0` |
| `5` | read int | Pauses for input, returns the value in `a0` |
| `11` | print char | Prints the low byte of `a0` as a character |
| `32` | sleep | Pauses for `a0` milliseconds of real time |
| `10` | exit | Halts the program |
| `17` | exit with code | Halts and returns the exit code in `a0` |

## Using it

The simulator is a single-page IDE with a vertical nav bar. The panels:

- **Projects** — browse, open, and delete saved programs (stored in your browser).
- **Editor** — a Monaco editor (the VS Code engine) with RISC-V syntax highlighting. On the desktop, the simulator is docked beside it; on mobile, a tap-to-insert token bar gives you mnemonics and registers without a keyboard.
- **Simulator** — the register file and output console, with **Run**, **Step**, and **Reset**. Registers that changed on the last step are highlighted; values toggle between decimal and hex.
- **Reference** — a searchable RV32IM instruction reference with pseudo-instructions.
- **Learn** — interactive lessons, each with runnable examples you load straight into the editor.
- **Export** — download your program as `.asm` or `.riscv`.

Your work is never lost: named projects persist in local storage, and the editor autosaves your session ~400ms after you stop typing, so a reload drops you back exactly where you were.

A full walkthrough lives in **[Using the simulator](/tesserae-venus/using-the-simulator)**.

## What it's good for

- **Learning assembly from zero** — the [RISC-V guide](/risc-v/) and the in-app Learn panel take you from "what is a register" to functions, the stack, and arrays, every example runnable in one click.
- **University coursework** — RV32IM with `ecall` I/O matches the typical computer-architecture lab, so you can prototype and debug labs without a local toolchain.
- **Teaching** — step execution plus the live register highlight makes it easy to show, on a projector, exactly what each instruction does to the machine.
- **Quick experiments** — try out an instruction, check a calling-convention detail, or sanity-check a bit-twiddling trick without leaving the browser.
- **Reaching non-English learners** — the whole point: hand someone the link in their language and they can start immediately.

## Where to go next

- [Using the simulator](/tesserae-venus/using-the-simulator) — the UI, panels, keyboard shortcuts, and file management in detail.
- [RISC-V guide](/risc-v/) — the same lessons as standalone documentation, from first principles through memory.

The Learn panel and this documentation share their source, so whichever you prefer — interactive in the app, or read-through here — you get the same material.
