---
title: "Input & output"
description: "Using ecall to print integers and strings, and read user input."
---

# Input & output

All input/output goes through `ecall`. Think of `ecall` (environment call) as a bridge between your raw assembly code and the operating system or simulator. Your program cannot directly control the screen or keyboard hardware — it must pause and ask the host system for permission and assistance.

Put the **service number** in `a7`, any **argument** in `a0`, then trigger `ecall`.

## Services

| `a7` | Service | Notes |
|------|---------|-------|
| `1` | Print integer | `a0` = the number to print |
| `4` | Print string | `a0` = address of the text |
| `5` | Read integer | Result returned in `a0` |
| `10` | Exit program | — |
| `32` | Sleep | `a0` = milliseconds |

## Reading input

```asm
li a7, 5         # read integer -> a0
ecall

add a0, a0, a0   # double it

li a7, 1         # print integer
ecall

li a7, 10
ecall
```

`li a7, 5` selects read-integer and `ecall` pauses for input, returning your number in `a0`. `add a0, a0, a0` adds `a0` to itself, doubling it in place. Then `li a7, 1` and `ecall` print the result.

## Printing text

Two concepts first. A **section** is a labeled region of your program: instructions live in `.text`, while fixed data like strings lives in `.data`. An **address** is a number that identifies one slot in memory — instead of carrying a whole string around, a register carries the address where the string begins, and the print service reads from there.

Text lives in the **data section**. You give it a label, then load that label's address with `la` ("load address") and print with service 4.

```asm
.data
msg: .string "Hello, RISC-V!\n"

.text
la a0, msg       # a0 = address of the text
li a7, 4         # print string
ecall

li a7, 10
ecall
```

`.data` reserves the text and labels it `msg`; `.string` stores the characters plus `\n`, a newline. In `.text`, `la a0, msg` loads the **address** of that text into `a0`, `li a7, 4` selects print-string, and `ecall` prints from that address until the end of the string.
