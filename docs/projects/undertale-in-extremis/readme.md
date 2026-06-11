---
title: "README"
---


> University project (ORG 2026.1). An RPG combat simulator and Monte Carlo engine written entirely in RISC-V assembly.

https://github.com/user-attachments/assets/379521ff-3ec5-4981-8845-8c0878b5ebea

## The Setup

I built an RPG combat engine from scratch in raw RISC-V assembly. The goal was to write three distinct AI state machines, throw them into a headless emulator, and run 10,000 automated matches to see which strategy came out on top.

The combat revolves around a strict action economy. MP regenerates slowly, but can be overcharged using specific skills. 

| Skill | Cost | What it does |
|---|---|---|
| **Attack** | free | Rolls a 1d20. `< 10` misses, `10+` hits, `20` crits for double damage. |
| **Defend** | free | Blocks incoming damage. High rolls trigger a counter-attack. |
| **Absolute Grit** | 20 MP | Bypasses the dice for a guaranteed critical hit. |
| **Soul Suck** | free | The caster takes 1–12 recoil damage, drains that same amount from the enemy's MP, and gains 4× it for themselves. The only way to bypass the 100 MP cap. |
| **Final Execution** | 150 MP | An 800% damage nuke. Fails if the target is above 50% HP. |
| **Mirror Shield** | 30 MP | Reflects the next incoming attack back at the attacker. |

## The Contenders

I wrote three bots, each with a completely different brain:

**Flowey (The Chaos):** Pure RNG. He evaluates nothing and just rolls a random number to pick his next move.

```asm
decision_random:
  li a0, 6
  call randomizer  # picks a number between 1 and 6, that's the whole strategy
  j decision_end
```

**Chara (The Try-Hard):** She optimizes for one combo: spam *Soul Suck* until she hits 150 MP, chip the enemy below 50% HP, and drop the *Final Execution*. In the code the strategy is also named smart, but it is not quite so.

```asm
decision_smart:
  # eu escrevi essa estrategia
  # ela se consiste em usar roubo de alma até poder usar execute
  # só que pra isso também precisamos sobreviver e diminuir a vida do inimigo pra 50%
  # sem morrer
  ...
  li t6, 150        # preço do execute
  blt t4, t6, decision_smart_my_mana_is_low   # mp < 150? go farm
  bge a2, t6, decision_smart_enemy_hp_high    # enemy hp > 50? go bully
  j decision_smart_i_can_kill                 # otherwise, execute

decision_smart_my_mana_is_low:
  li a0, 4  # soul suck
decision_smart_enemy_hp_high:
  li a0, 2  # absolute grit
decision_smart_i_can_kill:
  li a0, 5  # final execution
```

**Toby (The Hard-Counter):** Built specifically to farm Chara. He watches both his own HP and the enemy's MP bar. If he is below 50 HP and the enemy is sitting on 150 MP, he raises his *Mirror Shield* and lets the nuke come back. Outside of that window he mixes attacks and Soul Suck, and can also fire off Final Execution himself when the conditions line up.

```asm
decision_troll_checks:
  li t6, 50
  ble t5, t6, decision_troll_check_enemy_mp  # am I low enough to worry?
  j decision_troll_not_execute
decision_troll_check_enemy_mp:
  li t6, 150
  bge a3, t6, decision_troll_prepare_against_execute  # is enemy close to 150 mp?
  j decision_troll_not_execute
decision_troll_prepare_against_execute:
  li a0, 6  # mirror shield
  ret
```

## The Benchmark Results

After running 10,000 matches on Terminal using rars.jar, the jar from the Risc-V Java-based simulator RARS, the results came back. 

| Character | Win Rate |
|-----------|----------|
| **Flowey** | ~52% |
| **Toby** | ~29% |
| **Chara** | ~17% |

The dumbest AI won the absolute majority of the games. 

Chara's 17% win rate exposes the problem with rigid, greedy combos. To reach 150 MP, she has to take recoil damage from *Soul Suck*. Often, Toby just holds up his shield, and Chara's script forces her to keep draining her own health until she literally kills herself before she can even cast her ultimate. 

Toby's 29% comes from successfully baiting Chara. Against Flowey it is a different story: the shield condition requires the enemy to be near 150 MP, and Flowey never deliberately builds towards that. The counter never triggers, so Toby just plays his default game of attacking and soul sucking, which gives him no real edge over chaos.

Flowey won 52% of the time because having no strategy is impossible to counter-read consistently. He never takes recoil damage trying to set up a massive play; he just throws out high-value moves by accident. It turns out, if your entire codebase relies on predicting enemy behavior, you automatically lose to an enemy that does things for no reason.

## Is This Actually Surprising?

Probably not. Random agents dominating deterministic ones is a well-documented result in strategy simulations.

A Citadel simulation I came across in a study group produced the same pattern: some strategies consistently beat random, some got crushed by it, and some beat certain opponents but lost to others. The rock-paper-scissors dynamic was there, but random still held its ground against most of them.

The difference is that in a richer environment (more strategies, more decision variables, more ways for a smart agent to exploit a random one) the results tend to spread out more. A well-tuned deterministic strategy can carve out a reliable edge if the action space gives it enough to work with.

Here, it probably doesn't. With only six possible actions and a combat system where a single lucky crit can end the match regardless of strategy, the gap between Chara's careful planning and Flowey's random button mashing just isn't that wide. Chara's combo requires several turns of setup, and the RNG has ample opportunity to kill her before she gets there. The action space may simply be too small and too swingy for a greedy strategy to consistently outperform chaos.

In other words: Flowey winning is less of a finding and more of a design constraint. A smarter Chara would need a smarter game to prove it.

## Why These Numbers Are Not Fully Reliable

Before drawing conclusions from the benchmark, there are a few structural biases worth acknowledging.

**The matchups are not isolated.** Both players get a randomly assigned strategy each match, which means the win rates are aggregates across all possible pairings, not clean 1v1 stats. Flowey's 52% includes matches where Flowey fought another Flowey, and in those one of them had to win. To actually know if Chara beats Toby or if Flowey beats everyone equally, you would need to fix the matchup and run each pairing separately.

**Turn order is never rotated.** Player 1 always moves first. In a system where a single crit can end a match, going first is a real edge. The results don't account for this at all.

**The RNG is a custom xorshift seeded from system time.** It works well enough for a university project, but it is not a statistically validated generator. If the distribution of outputs is uneven across the 6 possible actions, Flowey's results are directly affected since his entire strategy is just calling that function.

**The action space is very small.** Six possible actions means any strategy has limited room to differentiate itself from chaos. In a deeper system, Chara's combo might be harder to interrupt, or there could be recovery options that reduce the cost of her setup. Here, the game is just punishing enough that her recoil damage often ends the run before the payoff arrives.

**Chara was likely not designed well enough.** Her strategy has no defensive fallback. If the combo conditions are not met and she is taking heavy damage, she just keeps farming MP anyway. A more robust version would switch to survival mode when below a certain HP threshold, which would likely improve her numbers meaningfully.

The results are directionally interesting but should be read as a snapshot of this specific configuration, not a general statement about strategy vs randomness.

## Future Research

The obvious next step is getting off RARS entirely. This version runs on a Java-based RISC-V emulator, which puts a hard ceiling on simulation speed. A second version targeting real compiled RISC-V with Linux syscalls instead of RARS ecalls should be dramatically faster, which matters a lot once the match count starts climbing into the millions.

Beyond performance, the more interesting directions are on the design side:

**More players per match.** Right now it is always 1v1. Adding a third or fourth participant changes the strategic landscape completely. Suddenly a counter-strategy has to account for being attacked from two directions at once, and pure randomness becomes harder to sustain.

**Machine learning inside the assembly.** The idea is to implement a minimal ML algorithm directly in RISC-V, using matrix operations to let a bot update its own weights based on match outcomes. No external libraries, no high-level runtime, just integer matrix math in registers. Whether this is practical or just an interesting pain to implement is part of the appeal.

**More strategies and a deeper engine.** The current action space is too small for any strategy to meaningfully pull ahead of random. Taking more direct inspiration from World of Warcraft (cooldowns, resource trade-offs, positioning effects, more varied skill interactions) would give well-designed strategies actual room to prove themselves over chaos.

The benchmark infrastructure is already there. The bottleneck is the game being deep enough to make the results mean something.

## Running It

To compile the assembly and run the engine locally:

```sh
make simulate
