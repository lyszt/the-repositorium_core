---
title: "Functions & the stack"
description: "Writing reusable functions with jal/ret, calling conventions, and saving state on the stack."
---

# Functions & the stack

A **function** is a named, reusable block of instructions. You jump to it, it does its job, and it hands control back to wherever you called it from. The point is to write a piece of logic once and reuse it from many places, instead of copying the same lines all over your program.

## Calling a function

Call a function with `jal` ("jump and link"): it jumps to the label **and** saves the return spot in `ra`. The function ends with `ret`, which jumps back to `ra`. In practice you'll usually write `call label` and `ret` — these are **pseudo-instructions**: friendly names the assembler expands into the real ones (`jal ra, label` and `jalr zero, ra, 0`).

Arguments go in `a0`, `a1`, …; the return value comes back in `a0`. This is the **calling convention** — the shared agreement that lets separate pieces of code work together.

```asm
li a0, 6         # argument
jal square       # call; ra remembers where to come back

li a7, 1         # square left its result in a0
ecall
li a7, 10
ecall

square:
  mul a0, a0, a0   # a0 = a0 * a0
  ret              # jump back to ra
```

Tracing the call: `li a0, 6` puts 6 in `a0`. `jal square` jumps to `square` and saves the return address in `ra`. Inside, `mul a0, a0, a0` computes 6 × 6 = 36 and leaves it in `a0`. `ret` jumps back to the line right after the call, where the ecall prints 36.

## The stack

Only 32 registers exist, so functions that call other functions need scratch space. The **stack** is memory you borrow via the stack pointer `sp`: subtract to make room, store what you must keep, restore it before `ret`.

The stack operates **Last-In, First-Out (LIFO)** and by convention in RISC-V it grows **downwards** in memory. When you subtract from `sp`, you're claiming new, safe space. You must retrieve stored values in a strictly mirrored order — otherwise you corrupt the execution flow.

### Saving `ra` across a call

```asm
addi sp, sp, -4   # make room for one word
sw   ra, 0(sp)    # save the return address
# ... call other functions here ...
lw   ra, 0(sp)    # restore it
addi sp, sp, 4    # give the room back
ret
```

Why bother? Every `jal`/`call` overwrites `ra`. If your function calls another function, that inner call clobbers your return address and your own `ret` would jump to the wrong place. So:

1. `addi sp, sp, -4` claims 4 bytes on the stack
2. `sw ra, 0(sp)` stashes `ra` there
3. Make your inner calls
4. `lw ra, 0(sp)` restores it
5. `addi sp, sp, 4` releases the space
6. `ret`

:::warning
Always restore `sp` to where it started, and restore `ra` before `ret` if you called anything. A mismatched stack is the classic way assembly programs crash.
:::
