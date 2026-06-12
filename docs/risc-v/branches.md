---
title: "Decisions & loops"
description: "Labels, branch instructions, and building if/else and loops in RISC-V assembly."
---

# Decisions & loops

By default the CPU runs instructions in order, top to bottom. On its own that can never make a choice or repeat work. A **branch** is how a program escapes that straight line: it checks a condition and, if the condition is true, tells the CPU to continue somewhere else instead of at the next line. Every decision and every loop is built from this one idea.

There is no `if` or `for`. You build them from **labels** (named positions) and **branches** (jump there when a condition holds). A label is a name followed by `:`.

To understand how this actually executes, you must understand the **Program Counter (PC)**. The PC is a special, hidden register that holds the memory address of the current instruction. A branch instruction actively rewrites the PC, forcing the CPU to fetch its next instruction from your target label instead of simply moving to the next line.

## The branch family

Every branch compares two registers and jumps to the label only if the test holds; otherwise it falls through to the next line.

| Instruction | Condition | Notes |
|-------------|-----------|-------|
| `beq rs1, rs2, label` | `rs1 == rs2` | Equality, sign-agnostic |
| `bne rs1, rs2, label` | `rs1 != rs2` | Inequality |
| `blt rs1, rs2, label` | `rs1 < rs2` | Signed |
| `bge rs1, rs2, label` | `rs1 >= rs2` | Signed |
| `bltu rs1, rs2, label` | `rs1 < rs2` | Unsigned |
| `bgeu rs1, rs2, label` | `rs1 >= rs2` | Unsigned |

```asm
beq  a, b, label   # branch if a == b
bne  a, b, label   # branch if a != b
blt  a, b, label   # branch if a <  b   (signed)
bge  a, b, label   # branch if a >= b   (signed)
bltu a, b, label   # branch if a <  b   (unsigned)
bgeu a, b, label   # branch if a >= b   (unsigned)
```

`beq` and `bne` test equality and ignore sign. `blt`/`bge` compare as **signed** numbers (the topmost bit is a minus sign). `bltu`/`bgeu` compare as **unsigned** (all bits count toward magnitude) — use these for addresses or counts that are never negative.

There's no direct "branch if greater" or "branch if less-or-equal". You get those by swapping registers; the assembler offers `bgt` and `ble` as pseudo-branches that do the swap. Two more shortcuts: `beqz` and `bnez` test a single register against zero, and `j label` jumps with no condition at all.

## Building a loop

```asm
li t0, 0         # sum   = 0
li t1, 1         # i     = 1
li t2, 6         # limit = 6  (loop while i < 6)

loop:
  bge t1, t2, done   # if i >= 6, leave the loop
  add t0, t0, t1     # sum += i
  addi t1, t1, 1     # i++
  j loop             # go check again

done:
  mv a0, t0          # print the sum (should be 15)
  li a7, 1
  ecall
  li a7, 10
  ecall
```

`t0` is the running sum (starts 0), `t1` is the counter `i` (starts 1), `t2` is the limit 6. Each pass: `bge t1, t2, done` exits once `i` reaches 6; `add t0, t0, t1` adds `i` to the sum; `addi t1, t1, 1` bumps `i`; `j loop` jumps back to test again. So it adds 1 + 2 + 3 + 4 + 5 = 15.

:::tip
Use **Step** instead of Run to walk one instruction at a time. Watch `t1` climb and the program counter (`pc`) jump back to `loop`. That's the loop, made visible.
:::

:::warning
Forget the exit condition and you get an infinite loop. The simulator guards against runaway programs, but your branch logic is yours to get right.
:::
