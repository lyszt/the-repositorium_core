---
title: "Tesserae Venus"
description: "A RISC-V assembly simulator and learning environment built into Tesserae."
---

# Tesserae Venus

Tesserae Venus is a **RISC-V assembly simulator** built directly into the [Tesserae](https://github.com/lyszt/lyszt_tesserae_core) web platform. It provides a complete in-browser environment for writing, running, and stepping through RISC-V assembly programs — no installation required.

The name is a reference to [Venus](https://github.com/kvakil/venus), the original educational RISC-V simulator by Keyhan Vakil. Tesserae Venus reimplements the engine in modern JavaScript (with a WASM core for performance-critical paths) and wraps it in a redesigned IDE.

## What it implements

Tesserae Venus runs **RV32IM** — the 32-bit base integer instruction set plus the M (multiply/divide) extension. This is the configuration used in most undergraduate computer architecture courses.

## Contents

- [Using the simulator](/tesserae-venus/using-the-simulator) — the UI, panels, keyboard shortcuts, file management
- [Engine architecture](/tesserae-venus/engine) — how the assembler, CPU, and WASM core work

## RISC-V guide

Tesserae Venus ships with a built-in Learn panel containing interactive lessons. The same content is available as standalone documentation in the [RISC-V](/risc-v/) section of this site.
