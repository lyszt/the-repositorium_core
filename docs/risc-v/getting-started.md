---
title: "Getting started"
description: "What assembly is, what registers are, and your first RISC-V program."
---

# Getting started

## What is assembly?

Before anything else: a **CPU** (central processing unit) is the chip at the heart of your computer, and it really does only one thing — it carries out a long list of tiny commands called **instructions**, one after another, billions per second. Each instruction is simple on its own (add two numbers, move a value, jump somewhere). Assembly is how we write those instructions in text a person can read.

Assembly is the human-readable form of the instructions a CPU actually runs. Each line is (almost) one machine instruction. There are no loops, objects, or strings handed to you. You move numbers between **registers** and **memory**, one tiny step at a time.

This simulator runs **RISC-V**, a clean, modern instruction set used in real chips and taught in universities. What you learn here maps directly to hardware.

RISC stands for **Reduced Instruction Set Computer**. The hardware is designed to execute a small set of simple instructions extremely fast, rather than having complex instructions that do many things at once. Complex behavior is built by combining these simple, fast steps.

## Registers: the CPU's hands

First, what is a **bit**? It's a single 0 or 1, the smallest piece of information a computer can store. Line up 32 of them and you get a **32-bit number**, which can count from 0 up to about 4 billion. Every register and every memory slot in RISC-V holds exactly one 32-bit number.

A register is a tiny, ultra-fast slot holding one 32-bit number. RISC-V has 32 of them. Registers sit right inside the processor core, which makes them far faster than RAM — by orders of magnitude. The ones you'll use most often:

| Name | Role |
|------|------|
| `zero` | Always 0; writes to it are ignored |
| `ra` | Return address — where to go back after a function |
| `sp` | Stack pointer |
| `a0`–`a7` | Arguments and return values |
| `t0`–`t6` | Temporary scratch registers |
| `s0`–`s11` | Saved registers (preserved across function calls) |

:::tip
Open the **Simulator** tab in Tesserae Venus to watch every register change as your program runs. That live view is the fastest way to build intuition.
:::

## Your first program

```asm
# Print the number 42, then exit.
# a7 picks the service; a0 carries the value.
li a7, 1        # service 1 = print integer
li a0, 42       # the value to print
ecall           # do it

li a7, 10       # service 10 = exit
ecall
```

Read it line by line. `li` means **load immediate**: it drops a constant into a register. `li a7, 1` selects service 1 (print integer); `li a0, 42` loads the value to print into `a0`. `ecall` hands control to the system, which prints whatever is in `a0`. Finally `li a7, 10` selects the exit service and `ecall` stops the program.

Lines starting with `#` are comments. They are ignored by the assembler.
