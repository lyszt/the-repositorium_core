---
title: "Engine architecture"
description: "How the Tesserae Venus assembler, CPU, and WASM core are implemented."
---

# Engine architecture

The Tesserae Venus engine is a pure-JavaScript RV32IM implementation with an optional WASM core for performance-critical paths. All source lives under `tesserae_front/src/pages/toolkit/tools/tesserae-venus-simulator/engine/`.

## Source layout

```
engine/
├── index.js        Entry point — ties assembler + CPU together
├── assembler.js    Two-pass assembler: tokenise → resolve labels → encode
├── isa.js          RV32IM instruction definitions and executors
├── machinecode.js  Bit-field helpers for encoding/decoding instructions
├── constants.js    Shared numeric constants (toU32, etc.)
└── wasm/
    ├── core.c      C source for the WASM core
    ├── core.wasm   Compiled WASM binary
    ├── runtime.js  JS wrapper that loads and calls the WASM module
    └── build.sh    Build script (Emscripten)
```

## Assembler (`assembler.js`)

The assembler is a classic two-pass design:

1. **First pass** — tokenise each line, assign addresses to all labels, expand pseudo-instructions (e.g. `li`, `la`, `mv`, `neg`, `j`, `call`, `ret`) into their real instruction equivalents.
2. **Second pass** — resolve label references (branch targets, `la` addresses) to concrete offsets, then encode each instruction into a 32-bit machine word.

Pseudo-instruction expansion happens before label resolution, so a single pseudo can expand to two real instructions (e.g. `li` for large constants expands to `lui` + `addi`).

## ISA definitions (`isa.js`)

Each instruction is defined as a small descriptor object plus an executor function. The executor receives a decoded field struct `f` (with `rd`, `rs1`, `rs2`, `imm`, `shamt` extracted) and a CPU state object `c`, and returns either `undefined` (fall through to `pc + 4`) or a new PC value (for jumps/branches).

```js
// Example: add
R("add", 0b000, 0b0000000,
  (c, f) => c.wr(f.rd, c.rd(f.rs1) + c.rd(f.rs2))
)
```

The CPU's `wr`/`rd` methods keep all register values as 32-bit signed integers (JavaScript numbers). Writes to `x0` are silently ignored.

## Machine code encoding (`machinecode.js`)

Provides `MachineCode`, a helper that encodes instructions into 32-bit words by extracting and combining bit fields (`F.rd`, `F.rs1`, `F.imm`, etc.), and `signExtend` for correctly extending signed immediates.

The instruction formats mirror the RISC-V spec directly: R, I, S, B, U, J.

## WASM core (`wasm/`)

The WASM core (`core.c`) accelerates the inner execution loop — particularly multi-step and run-to-completion operations where JavaScript overhead accumulates. The JS runtime (`runtime.js`) loads the WASM binary and exposes a thin call interface.

`core.c` is compiled with Emscripten; the `build.sh` script documents the flags. The pre-compiled `core.wasm` is checked in so the simulator works without a build step.

## Register conventions

The CPU state holds 32 registers indexed 0–31. The ABI aliases (`zero`, `ra`, `sp`, etc.) are resolved at assembly time — `zero` → `x0`, `ra` → `x1`, `sp` → `x2`, `a0` → `x10`, and so on. The assembler maps names to indices before encoding; the CPU itself only deals with indices.

## ecall dispatch

`ecall` (opcode `0b1110011`, funct12 = 0) is intercepted before normal instruction dispatch. The simulator reads the service number from `a7` (register index 17) and branches into a switch:

| `a7` | Handler |
|------|---------|
| `1` | Format `a0` as signed decimal, append to output |
| `4` | Walk memory from the address in `a0` until a null byte, append to output |
| `5` | Pause execution, show input prompt, resume with the integer in `a0` |
| `10` | Halt; mark execution as complete |
| `32` | `setTimeout` for `a0` milliseconds, then resume |
