---
title: "README"
---

( god, who programmed .iris to not be able to be commited? )


A text-based RPG written in RISC-V 32-bit assembly, simulated via QEMU.

> "The universe decided it didn't want me doing anything better, like maybe getting a life."

## Dependencies

- `riscv32-elf-as` — RISC-V assembler
- `riscv32-elf-ld` — RISC-V linker
- `qemu-riscv32` — RISC-V user-mode emulator

On Arch Linux:
```sh
sudo pacman -S riscv64-elf-binutils qemu-user
```

## Build & Run

```sh
make build   # assemble and link into main.bin
make run     # build + run via qemu-riscv32
make debug   # run with -strace to inspect syscalls
```

## Project Structure

```
Extremis/
├── main.s                      # Entry point (_start), calls run_chapter_1
├── src/
│   ├── include/
│   │   └── function.s          # startF / endF stack frame macros
│   ├── engine/
│   │   ├── print.s             # print  — print a single null-terminated string (a0)
│   │   └── utils.s             # printl — print a list of strings (a0=addr table, a1=count)
│   ├── chapters/
│   │   └── chapter_1.s         # Chapter 1 logic; loads intro strings and calls printl
│   └── dialogue/
│       └── intro.s             # String data for the intro sequence
└── build/                      # Compiled .o files (mirrors src/ layout)
```

## Architecture

The engine is pure RISC-V 32-bit assembly targeting the Linux ABI via QEMU user-mode emulation.

### Stack Frame Convention

Every function uses the `startF` / `endF` macros from `src/include/function.s` to save and restore `ra`, `s0`, `s1`, `s2` on the stack:

```asm
startF    # push: allocate 16 bytes, save ra/s0/s1/s2
...
endF      # pop:  restore ra/s0/s1/s2, deallocate 16 bytes
ret
```

### Syscalls

> **Warning:** RARS/MARS environment call numbers do **not** work under `qemu-riscv32`. This project uses Linux RISC-V ABI syscall numbers.

Syscall number goes in `a7`, invoke with `ecall`. Return value comes back in `a0`.

#### Output

| Intent             | RARS `a7` | Linux `a7` | `a0`            | `a1`        | `a2`   | Notes                                        |
|--------------------|-----------|------------|-----------------|-------------|--------|----------------------------------------------|
| Print string       | `4`       | `64`       | `1` (stdout fd) | buf addr    | length | Linux does NOT stop at null — pass byte len  |
| Print char         | `11`      | `64`       | `1`             | char buf    | `1`    | store char in memory, pass its address       |
| Print integer      | `1`       | —          | integer         | —           | —      | no Linux equivalent; convert to string first |
| Print hex integer  | `34`      | —          | integer         | —           | —      | no Linux equivalent; convert manually        |
| Print unsigned int | `36`      | —          | integer         | —           | —      | no Linux equivalent; convert manually        |

#### Input

| Intent       | RARS `a7` | Linux `a7` | `a0`            | `a1`       | `a2`      | Notes                                        |
|--------------|-----------|------------|-----------------|------------|-----------|----------------------------------------------|
| Read string  | `8`       | `63`       | `0` (stdin fd)  | buf addr   | max bytes | Linux returns raw bytes incl. newline        |
| Read char    | `12`      | `63`       | `0`             | buf addr   | `1`       | returns `a0` = bytes read; char is in buf    |
| Read integer | `5`       | —          | —               | —          | —         | no Linux equivalent; read string, parse it   |

#### Process

| Intent     | RARS `a7` | Linux `a7` | `a0`        | Notes                                   |
|------------|-----------|------------|-------------|-----------------------------------------|
| Exit       | `10`      | `93`       | —           | RARS ignores `a0`; Linux reads it as exit status |
| Exit(code) | `17`      | `93`       | exit code   | Linux `exit_group`                      |

#### Memory

| Intent          | RARS `a7` | Linux `a7` | `a0`            | Returns               | Notes                        |
|-----------------|-----------|------------|-----------------|-----------------------|------------------------------|
| Allocate (sbrk) | `9`       | `214`      | bytes (RARS) / new brk addr (Linux) | `a0` = start of allocated block | Linux `brk` works differently — you set the new top, not a size |

#### File I/O

| Intent      | RARS `a7` | Linux `a7` | `a0`     | `a1`          | `a2`       | `a3`   | Notes                   |
|-------------|-----------|------------|----------|---------------|------------|--------|-------------------------|
| Open file   | `13`      | `56`       | dirfd (`-100`=CWD) | filename addr | flags | mode | Linux uses `openat`     |
| Read file   | `14`      | `63`       | fd       | buf addr      | max bytes  | —      | returns bytes read       |
| Write file  | `15`      | `64`       | fd       | buf addr      | byte count | —      | returns bytes written    |
| Close file  | `16`      | `57`       | fd       | —             | —          | —      | returns `0` on success  |

#### Time

| Intent | RARS `a7` | Linux `a7` | `a0`               | `a1`          | Notes                                         |
|--------|-----------|------------|--------------------|---------------|-----------------------------------------------|
| Time   | `30`      | `113`      | clock id (`1`=REALTIME) | `timespec*` buf | RARS returns split lo/hi in a0/a1; Linux writes struct to buf |
| Sleep  | `32`      | `115`      | clock id           | `timespec*`   | RARS takes milliseconds in `a0`; Linux uses `clock_nanosleep` with a struct |

### Adding Content

- New dialogue strings go in `src/dialogue/`.
- New chapters go in `src/chapters/` and are `.include`'d into the chapter file that needs them.
- The Makefile auto-discovers all `.s` files under `src/` (excluding `src/include/`).
