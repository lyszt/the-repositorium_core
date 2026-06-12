---
title: "Instruction reference"
description: "Complete RV32IM instruction reference including pseudo-instructions and ecall services."
---

# Instruction reference

Complete reference for the RV32IM instruction set as implemented by the Tesserae Venus engine. Pseudo-instructions (expanded by the assembler) are marked with **P**.

## Arithmetic

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `add` | `add rd, rs1, rs2` | `rd = rs1 + rs2` | Wraps on overflow |
| `sub` | `sub rd, rs1, rs2` | `rd = rs1 - rs2` | Wraps on overflow |
| `addi` | `addi rd, rs1, imm` | `rd = rs1 + imm` | Signed 12-bit immediate |
| `mul` | `mul rd, rs1, rs2` | `rd = rs1 * rs2` | Low 32 bits of product |
| `mulh` | `mulh rd, rs1, rs2` | `rd = (rs1 * rs2) >> 32` | High 32 bits, signed |
| `div` | `div rd, rs1, rs2` | `rd = rs1 / rs2` | Signed, truncated toward zero |
| `divu` | `divu rd, rs1, rs2` | `rd = rs1 / rs2` | Unsigned |
| `rem` | `rem rd, rs1, rs2` | `rd = rs1 % rs2` | Signed remainder |
| `remu` | `remu rd, rs1, rs2` | `rd = rs1 % rs2` | Unsigned remainder |
| **P** `neg` | `neg rd, rs` | `rd = -rs` | Expands to `sub rd, zero, rs` |

:::tip
To double a value: `add t0, t1, t1`. To negate: `sub t0, zero, t1`.
:::

## Bitwise logic

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `and` | `and rd, rs1, rs2` | `rd = rs1 & rs2` | Result bit is 1 if both bits are 1 |
| `or` | `or rd, rs1, rs2` | `rd = rs1 \| rs2` | Result bit is 1 if either bit is 1 |
| `xor` | `xor rd, rs1, rs2` | `rd = rs1 ^ rs2` | Result bit is 1 if bits differ |
| `andi` | `andi rd, rs1, imm` | `rd = rs1 & imm` | 12-bit immediate |
| `ori` | `ori rd, rs1, imm` | `rd = rs1 \| imm` | 12-bit immediate |
| `xori` | `xori rd, rs1, imm` | `rd = rs1 ^ imm` | 12-bit immediate |
| **P** `not` | `not rd, rs` | `rd = ~rs` | Expands to `xori rd, rs, -1` |

:::tip
Use `and` to mask bits: `andi t0, t0, 0xff` keeps only the low byte. Use `xor t0, t0, t0` to zero a register.
:::

## Shifts

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `sll` | `sll rd, rs1, rs2` | `rd = rs1 << (rs2 & 31)` | Shift left, zero-fill; each position doubles the value |
| `srl` | `srl rd, rs1, rs2` | `rd = rs1 >>> (rs2 & 31)` | Shift right, zero-fill (unsigned) |
| `sra` | `sra rd, rs1, rs2` | `rd = rs1 >> (rs2 & 31)` | Shift right, sign-fill |
| `slli` | `slli rd, rs1, shamt` | `rd = rs1 << shamt` | Fixed shift, 0–31 |
| `srli` | `srli rd, rs1, shamt` | `rd = rs1 >>> shamt` | Fixed shift, zero-fill |
| `srai` | `srai rd, rs1, shamt` | `rd = rs1 >> shamt` | Fixed shift, sign-fill |

:::tip
`slli t0, t0, 2` multiplies `t0` by 4. Useful for calculating word-sized array offsets: `slli t1, t1, 2` converts an element index into a byte offset.
:::

## Compare & set

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `slt` | `slt rd, rs1, rs2` | `rd = (rs1 < rs2) ? 1 : 0` | Signed |
| `sltu` | `sltu rd, rs1, rs2` | `rd = (rs1 < rs2) ? 1 : 0` | Unsigned |
| `slti` | `slti rd, rs1, imm` | `rd = (rs1 < imm) ? 1 : 0` | Signed, 12-bit immediate |
| `sltiu` | `sltiu rd, rs1, imm` | `rd = (rs1 < imm) ? 1 : 0` | Unsigned |
| **P** `seqz` | `seqz rd, rs` | `rd = (rs == 0) ? 1 : 0` | Expands to `sltiu rd, rs, 1` |
| **P** `snez` | `snez rd, rs` | `rd = (rs != 0) ? 1 : 0` | Expands to `sltu rd, zero, rs` |

## Memory

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `lw` | `lw rd, off(rs1)` | `rd = mem[rs1 + off]` | Load 32-bit word |
| `lh` | `lh rd, off(rs1)` | `rd = mem[rs1 + off]` | Load 16-bit halfword, sign-extended |
| `lhu` | `lhu rd, off(rs1)` | `rd = mem[rs1 + off]` | Load 16-bit halfword, zero-extended |
| `lb` | `lb rd, off(rs1)` | `rd = mem[rs1 + off]` | Load byte, sign-extended |
| `lbu` | `lbu rd, off(rs1)` | `rd = mem[rs1 + off]` | Load byte, zero-extended |
| `sw` | `sw rs2, off(rs1)` | `mem[rs1 + off] = rs2` | Store 32-bit word |
| `sh` | `sh rs2, off(rs1)` | `mem[rs1 + off] = rs2` | Store low 16 bits |
| `sb` | `sb rs2, off(rs1)` | `mem[rs1 + off] = rs2` | Store low 8 bits |
| **P** `la` | `la rd, label` | `rd = &label` | Load address of a label |
| **P** `li` | `li rd, imm` | `rd = imm` | Load any constant (auto-expands) |
| **P** `mv` | `mv rd, rs` | `rd = rs` | Expands to `addi rd, rs, 0` |

## Branches

| Instruction | Syntax | Operation |
|-------------|--------|-----------|
| `beq` | `beq rs1, rs2, label` | Jump if `rs1 == rs2` |
| `bne` | `bne rs1, rs2, label` | Jump if `rs1 != rs2` |
| `blt` | `blt rs1, rs2, label` | Jump if `rs1 < rs2` (signed) |
| `bge` | `bge rs1, rs2, label` | Jump if `rs1 >= rs2` (signed) |
| `bltu` | `bltu rs1, rs2, label` | Jump if `rs1 < rs2` (unsigned) |
| `bgeu` | `bgeu rs1, rs2, label` | Jump if `rs1 >= rs2` (unsigned) |
| **P** `beqz` | `beqz rs, label` | Jump if `rs == 0` |
| **P** `bnez` | `bnez rs, label` | Jump if `rs != 0` |
| **P** `bgt` | `bgt rs1, rs2, label` | Jump if `rs1 > rs2` (signed) |
| **P** `ble` | `ble rs1, rs2, label` | Jump if `rs1 <= rs2` (signed) |

## Jumps & functions

| Instruction | Syntax | Operation | Notes |
|-------------|--------|-----------|-------|
| `jal` | `jal rd, label` | `rd = pc + 4; goto label` | Jump and link |
| `jalr` | `jalr rd, rs, off` | `rd = pc + 4; goto rs + off` | Jump to computed address |
| `lui` | `lui rd, imm` | `rd = imm << 12` | Load upper immediate (20 bits) |
| `auipc` | `auipc rd, imm` | `rd = pc + (imm << 12)` | PC-relative upper immediate |
| **P** `j` | `j label` | `goto label` | Unconditional jump |
| **P** `jr` | `jr rs` | `goto rs` | Jump to address in register |
| **P** `call` | `call label` | `ra = pc + 4; goto label` | Call a function |
| **P** `ret` | `ret` | `goto ra` | Return from function |

## System

| Instruction | Notes |
|-------------|-------|
| `ecall` | Triggers a system service. Set `a7` to the service number before calling. |
| **P** `nop` | Does nothing. Expands to `addi zero, zero, 0`. |

## ecall services

| `a7` | Service | Argument | Result |
|------|---------|----------|--------|
| `1` | Print integer | `a0` = integer | — |
| `4` | Print string | `a0` = string address | — |
| `5` | Read integer | — | `a0` = input integer |
| `10` | Exit | — | — |
| `32` | Sleep | `a0` = milliseconds | — |

## Register map

| Name | ABI alias | Role |
|------|-----------|------|
| `x0` | `zero` | Always 0; writes ignored |
| `x1` | `ra` | Return address |
| `x2` | `sp` | Stack pointer |
| `x3` | `gp` | Global pointer |
| `x4` | `tp` | Thread pointer |
| `x5`–`x7` | `t0`–`t2` | Temporary (caller-saved) |
| `x8`–`x9` | `s0`–`s1` | Saved (callee-saved) |
| `x10`–`x17` | `a0`–`a7` | Arguments / return values |
| `x18`–`x27` | `s2`–`s11` | Saved (callee-saved) |
| `x28`–`x31` | `t3`–`t6` | Temporary (caller-saved) |
