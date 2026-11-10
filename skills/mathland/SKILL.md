---
name: mathland
description: Use only on explicit request — when the user wants to understand a system, algorithm, execution, migration, or refactor by stepping through it themselves, e.g. asks for a debugger, stepper, trace viewer, time scrubber, or command center, or says "let me do it myself" / "build me a way to walk through this." Builds an interactive tool driven by real system state.
---

# Mathland

## Overview

Papert's "Mathland": if you want to learn math, live in Mathland — the way you'd live in France to learn French. Applied to code: build a small world the user inhabits, where they naturally intuit how a system works or is changing by driving it themselves.

The product of this skill is not an explanation — it is a tool the user operates. Agents can write bits of code whose purpose is to help humans understand other code; this skill is that category.

## Core principles

1. **The user drives.** The user clicks "next," triggers the step, performs the action — even though you could do it instantly. The friction of manual stepping is what builds understanding. Never silently automate through it.
2. **Real state, never illustration.** Wire the tool into the actual system — real stack frames, real diffs, real file trees, real intermediate outputs. No mock or toy data.
3. **Time travel where possible.** If the process has discrete steps, let the user scrub backward and forward, not just play forward once.
4. **Show the state that matters.** At each step, prominently surface the domain-meaningful object (the rule that fired, the file that changed, the current bindings) — not a raw state dump the user has to parse.
5. **Notes.** Give the user a lightweight per-step annotation field for their own observations ("nice, we correctly applied that rule").
6. **Side-by-side for migrations.** Run old and new together so the user compares real behavior directly, not a diff they can't fully read.

## Procedure

1. Read the real system broadly — well enough to instrument it, not just describe it.
2. Identify the natural "step" unit for the domain: a rule evaluation, a migration step, a recursive call, a file transformation.
3. Choose the medium:
   - **Trace viewer** — when per-step state can be precomputed: instrument the program to emit a trace (e.g. JSON of stack/bindings per step), then build a self-contained interactive HTML viewer that scrubs through it.
   - **Command center** — when the process must execute live against the real environment (running migration steps on real files, old and new servers side by side): build a small local web UI backed by real scripts and commands.
4. Build the controls: step forward/back, jump-to-step, run-to-here, and a per-step notes field.
5. The tool may act on real files and systems when the user drives it — but gate destructive or irreversible steps behind an explicit confirmation, and give file-mutating steps a dry-run preview.

## Examples of the pattern

- **Interpreter debugger:** instrument a Prolog interpreter to emit a per-step trace (stack contents, rule evaluated), then a trace viewer with time scrubbing and step comments.
- **Migration command center:** a framework port done step by step through a UI — click to run each step, watch the file tree evolve, old and new site running side by side. Same understanding as porting by hand, much faster.

## Common mistakes

- Doing the debugging or migration yourself and presenting results — the user must drive.
- Toy data in the tool — the intuition comes from the real thing.
- Play-forward-only when the domain has discrete steps — add scrubbing.
- Firing this without an explicit request — it is an explicit-invocation skill.
