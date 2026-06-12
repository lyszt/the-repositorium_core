---
title: "Arithmetic"
description: "Addition, subtraction, multiplication, division, and bitwise shifts in RISC-V."
---

# Arithmetic

Every calculation happens between registers. An arithmetic instruction names the **destination first**, then the two sources it reads: `add dest, src1, src2` means `dest = src1 + src2`.

## Adding and subtracting

`add` takes the numbers in two registers and stores their sum in a third. `sub` is the same for subtraction: `sub t2, t0, t1` computes `t0 - t1`. Both read registers only.

```asm
add t2, t0, t1   # t2 = t0 + t1
sub t2, t0, t1   # t2 = t0 - t1
```

One thing to know: a register only holds 32 bits, so there is a ceiling. If a result is too big to fit, it doesn't raise an error — it quietly **wraps around** back to very low numbers. You won't hit this with everyday values, but the ceiling is there.

To use a fixed number instead of a second register, add the letter `i` for **immediate**: `addi t0, t0, 1` adds the constant 1. There is no `subi`, so to subtract a constant you add a negative one: `addi t0, t0, -1`.

:::tip
`addi` adds a **constant**; `add` adds two **registers**. Mixing them up is the #1 beginner error.
:::

## Multiplying and dividing

`mul` multiplies two registers. `div` divides them as whole numbers and drops the fraction, so `7 / 2` gives `3`; `rem` gives what's left over, so `7 % 2` gives `1`. Division never crashes: dividing by zero returns -1.

```asm
mul t2, t0, t1   # t2 = t0 * t1
div t2, t0, t1   # t2 = t0 / t1  (integer)
rem t2, t0, t1   # t2 = t0 % t1  (remainder)
```

## Putting it together

```asm
li t0, 7
li t1, 5
add t1, t0, t1   # t1 = 7 + 5 = 12

mv a0, t1        # the print service reads a0
li a7, 1
ecall

li a7, 10
ecall
```

`li t0, 7` loads 7 into `t0`; `li t1, 5` loads 5 into `t1`. `add t1, t0, t1` adds them and writes 12 back into `t1`. `mv a0, t1` copies the result into `a0` (the print service always reads from `a0`). Then the print ecall, then exit.

## Multiplying with shifts

When the factor is a power of two, there's a faster way than `mul`. `sll` (shift left logical) slides a register's bits to the left, and every position you shift **doubles** the value: shift by 1 to multiply by 2, by 2 for 4, by 3 for 8. Shifting is cheaper than multiplying.

```asm
li t0, 5         # start with 5

# shift left by 3 bits (5 * 2^3 = 5 * 8)
sll a0, t0, 3    # a0 = 40

li a7, 1         # print integer
ecall

li a7, 10
ecall
```

`sll a0, t0, 3` shifts the bits three places left. Since each place doubles the value, 5 doubles three times (5 → 10 → 20 → 40), landing on 40 in `a0`. Try changing the 3 to a 1 or a 2 and predict the result before running.
