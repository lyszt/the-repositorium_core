---
title: "Command chaining"
description: "Combine Eris commands with and, or, and not using the Prolog router."
---

# Command chaining

Eris's command router is written in Prolog. It understands logical connectives directly in the argument list, so commands compose with real success/failure semantics.

The connectives are the **words** `and`, `or`, and `not` — *not* the shell operators `&&` / `||`. The shell would intercept `&&` and `||` before Eris ever saw them; plain words pass straight through to Eris. You also write `eris` only once:

```bash
eris init myapp and commit       # one eris, words between commands
```

## Operators

| Connective | Meaning |
|---|---|
| `and` | **then** — run the next command only if the previous one succeeded. |
| `or` | **else** — run the next command only if the previous one failed. |
| `not <cmd>` | **invert** — succeed when `<cmd>` fails, and vice versa. |

## Examples

```bash
eris init myapp and commit   # commit only if init succeeded
eris init or root            # if init fails, fall back to printing the root
eris not init                # succeed when init fails
```

Chains can mix any Eris commands, including [macros](./macros):

```bash
eris run build and commit and rebase
```

## Related

- [Macros](./macros) — name sequences you chain often.
