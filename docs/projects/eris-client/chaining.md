---
title: "Command chaining"
description: "Combine Iris commands with and, or, and not using the Prolog router."
---

# Command chaining

Iris's command router is written in Prolog. It understands logical connectives directly in the argument list, so commands compose with real success/failure semantics.

The connectives are the **words** `and`, `or`, and `not` — *not* the shell operators `&&` / `||`. The shell would intercept `&&` and `||` before Iris ever saw them; plain words pass straight through to Iris. You also write `iris` only once:

```bash
iris init myapp and commit       # one iris, words between commands
```

## Operators

| Connective | Meaning |
|---|---|
| `and` | **then** — run the next command only if the previous one succeeded. |
| `or` | **else** — run the next command only if the previous one failed. |
| `not <cmd>` | **invert** — succeed when `<cmd>` fails, and vice versa. |

## Examples

```bash
iris init myapp and commit   # commit only if init succeeded
iris init or root            # if init fails, fall back to printing the root
iris not init                # succeed when init fails
```

Chains can mix any Iris commands, including [macros](./macros):

```bash
iris run build and commit and rebase
```

## Related

- [Macros](./macros) — name sequences you chain often.
