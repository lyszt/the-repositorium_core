---
title: "Memory: load & store"
description: "lw, sw, byte addressing, and working with arrays in the RISC-V data section."
---

# Memory: load & store

What is **memory**? Picture a huge row of numbered storage slots, each holding one **byte** (8 bits). The number of a slot is its **address**. Registers are the CPU's handful of fast slots; memory is far larger but slower, and it holds everything that doesn't fit in registers — arrays, strings, large values. To work on a value in memory: load it into a register, change it, then store it back.

## Load and store

Move a word **from** memory into a register with `lw` (load word) and **back** with `sw` (store word). The address is written `offset(register)`.

```asm
lw t0, 0(a1)    # t0 = memory at address a1
sw t0, 4(a1)    # memory at address a1+4 = t0
```

`offset(register)` means: take the address in the register and add the offset. So `0(a1)` is exactly the address in `a1`, and `4(a1)` is 4 bytes further along. That's how you step through neighbouring values without changing the base register.

## Byte addressing

Memory in RISC-V is **byte-addressed**: every byte has its own sequential address. Because a word is 32 bits (4 bytes), you step pointers by 4 to reach the next word — which is why array offsets go 0, 4, 8, and so on.

On real hardware, loading a word from an address that isn't a multiple of 4 can be slow or trap; this simulator allows it, but keeping words 4-aligned is the habit to build.

## Declaring data

Reserve named memory in the data section:

- `.word 10, 20, 30` — one or more 32-bit values
- `.space N` — N blank bytes
- `.string "hello\n"` — a null-terminated string

```asm
.data
nums: .word 10, 20, 30, 40   # four words
```

## Summing an array

```asm
.data
nums: .word 10, 20, 30, 40   # four words

.text
la t1, nums      # t1 = address of the array
li t2, 4         # count
li t0, 0         # running sum

loop:
  beq t2, zero, done
  lw  t3, 0(t1)    # load current element
  add t0, t0, t3   # add to sum
  addi t1, t1, 4   # advance to next word (4 bytes)
  addi t2, t2, -1  # one fewer left
  j loop

done:
  mv a0, t0        # print the total (100)
  li a7, 1
  ecall
  li a7, 10
  ecall
```

Walk the loop: `la t1, nums` puts the array's address in `t1`, `t2` counts 4 elements remaining, `t0` holds the running sum. Each pass: `beq t2, zero, done` stops when no elements remain; `lw t3, 0(t1)` loads the element `t1` points at; `add t0, t0, t3` adds it to the sum; `addi t1, t1, 4` moves the pointer forward by one word; `addi t2, t2, -1` drops the count. After all four (10 + 20 + 30 + 40), `done` prints 100.

:::tip
Switch the simulator readout between **HEX** and **DEC** to read addresses and values in whichever base makes the moment clearer.
:::

## Smaller loads

| Instruction | Width | Sign |
|-------------|-------|------|
| `lw` | 32 bits | — |
| `lh` | 16 bits | signed |
| `lhu` | 16 bits | unsigned |
| `lb` | 8 bits | signed |
| `lbu` | 8 bits | unsigned |
| `sw` | 32 bits | — |
| `sh` | 16 bits | — |
| `sb` | 8 bits | — |
