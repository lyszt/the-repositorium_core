---
title: "RISC-V"
description: "A practical guide to RISC-V assembly, written for the Tesserae Venus simulator."
---

# RISC-V

A ground-up introduction to RISC-V assembly. Written to accompany the [Tesserae Venus simulator](/tesserae-venus/) — every code example can be loaded directly into it and run.

The guide covers what a CPU actually does, how to move numbers around, perform arithmetic, handle input and output, make decisions, write functions, and work with memory. No prior assembly experience required.

## Contents

| Chapter | What you learn |
|---------|---------------|
| [Getting started](/risc-v/getting-started) | What assembly is, what registers are, your first program |
| [Arithmetic](/risc-v/arithmetic) | `add`, `sub`, `mul`, `div`, shifts and why they matter |
| [Input & output](/risc-v/io) | `ecall` services, printing integers and strings, reading input |
| [Decisions & loops](/risc-v/branches) | Labels, all six branch instructions, building if/else and loops |
| [Functions & the stack](/risc-v/functions) | `jal`, `ret`, calling conventions, saving `ra` across calls |
| [Memory](/risc-v/memory) | `lw`, `sw`, byte addressing, arrays in the data section |
| [Instruction reference](/risc-v/instruction-reference) | Complete RV32IM reference with pseudo-instructions |

## The ISA

This guide targets **RV32IM** — the 32-bit base integer instruction set (`I`) plus the multiply/divide extension (`M`). This is the subset implemented by the Tesserae Venus engine and commonly used in university courses.
