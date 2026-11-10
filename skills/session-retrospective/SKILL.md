---
name: session-retrospective
description: Use at the end of a session, or when the user says "振り返り", "retrospective", "今回の振り返り", "セッションを振り返って", "/session-retrospective" — review the recent conversation, summarize Keep/Problem/Try, cross-reference past retrospectives for recurring patterns, then save the retrospective and propose memory entries, documentation updates, and skill candidates.
---

# Session Retrospective

## Overview

Run a structured retrospective at the end of a working session. The skill:

1. Summarizes the session as **Keep / Problem / Try**
2. Cross-references past retrospectives in the user's retrospective directory to detect **recurring patterns**
3. Proposes:
   - **Memory entries** (with explicit scope: global vs project)
   - **Documentation updates** (where in the repo to record durable knowledge)
   - **Skill candidates** (recurring workflows worth automating)
4. Writes the retrospective to `<retrospective-dir>/YYYY-MM-DD-HHMM-{slug}.md` with structured frontmatter so future runs can analyze it

## Environment and storage

This skill works with any agent that can read the current conversation and local files.
Follow the active environment's user and repository instructions for durable guidance,
memory, and skill authoring; no Claude-specific tool or memory layout is required.

Resolve `<retrospective-dir>` once and use it for both reading and writing. Use the
user's configured directory first. Otherwise preserve the current agent's existing
history: for Codex, reuse `~/.codex/retrospectives/` if it exists; for Claude Code,
reuse `~/.claude/retrospectives/` if it exists. If neither rule selects a directory,
check those two paths and `~/.local/share/session-retrospective/`: reuse the only
existing directory, or ask which to use when several exist. If none exists, use
the agent-neutral default `~/.local/share/session-retrospective/`.
Do not move existing history as part of a retrospective.

## When to Use

- User explicitly invokes: "振り返り", "retrospective", "今回のセッションを振り返って", `/session-retrospective`
- User asks to "save lessons learned", "save what we learned", "今回の学びをまとめて"
- End of a substantial working session where memories / docs / skills might need updating

Do NOT trigger on requests that only ask to save memory. Use the user's existing memory
workflow when available; this skill does not require a separate `save-memory` skill.

## Workflow

### Step 0: Check for unfinished work

Before starting the retrospective, review the current conversation and task state for work
that was requested but is not complete. Include failed or unrun verification, unresolved
questions, pending edits, and external actions required to satisfy the request.

- If no work remains, continue to Step 1.
- If work remains, tell the user exactly what is unfinished and ask whether to complete it now
  or proceed with the retrospective while treating it as unfinished. **Wait for the user's
  answer before starting Step 1.**

### Step 1: Load past retrospectives (pattern detection)

Read the **frontmatter only** of the most recent ~20 Markdown files in
`<retrospective-dir>`, ordered by the timestamp in their filenames (newest first).
If the directory is missing or
empty, report that no past retrospectives are available and continue. If reading
fails, report the failure rather than treating it as no history.

Collect the `problem:` tags across past sessions. If any tag appears **3 or more times** (including potentially this session), flag it as a recurring pattern.

If the project keeps verification records (a `verifications/` directory, or records in
recent PR descriptions) and the `verification-record` skill is installed, run its
`gaps.py --min 3` over them. Save PR-description records to one file per PR first, as
that skill describes. Each check it reports could not be run in three or more
records: flag it as a recurring pattern tagged `unverifiable-<check-slug>`. Its Try item
is the harness change that makes the check runnable, taken from the records' "What
would enable it" column.

### Step 2: Draft Keep / Problem / Try

Review the current conversation and propose:

- **Keep**: 2-4 things that worked well. Specific actions, not vague praise.
- **Problem**: 2-5 things that didn't work or caused friction. Include user corrections, redos, miscommunications. **Be honest** — performative self-criticism is useless; concrete misses are valuable.
- **Try**: For each Problem, propose a concrete change. These become candidates for memory / docs / skills.

If recurring patterns were detected in Step 1, **call them out explicitly**:

> ⚠️ "file-location-guessing" appeared in 3 past retrospectives. A memory was saved on 2026-05-22 ([[confirm-save-location]]) — is it not firing, or is the memory wrong?

### Step 3: Triage Try items

For each Try item, ask: **mechanism / memory / doc / skill — which?**

- Can a lint, test, script, CI check, or hook enforce it → that mechanism. A rule a tool
  enforces holds without anyone remembering it; prefer it over the options below.
- Behavior change for future sessions that needs judgment → Memory
- Durable knowledge (paths, conventions, facts) → Doc or reference
- Recurring multi-step workflow → Skill

In practice, items often map to **multiple** outputs. That's fine.

#### Promotion threshold for durable actions

Do not turn every first occurrence into a new memory, documentation rule, regression
checklist, or skill. Use the recurring-pattern threshold from Step 1 as the default:

- On the first or second occurrence, record the Problem and Try with a stable tag. Make a
  narrow correction to an existing workflow when needed, but defer additional durable rules.
- At about the third occurrence, propose the appropriate memory, documentation update,
  regression check, or skill.
- Act sooner when the issue creates a material security, privacy, data-loss, destructive-action,
  or external-impact risk, or when the user explicitly requests immediate durable action.

State the observed occurrence count and any exception used in the retrospective. Do not claim
recurrence merely because several symptoms appeared in one session.

### Step 4: Determine scope (memory only)

For each memory candidate, **explicitly tag scope** before saving. Follow the user's
scope rules and choose the narrowest scope that covers the lesson. Identify the
actual durable destination from the active environment's instructions (for example,
`AGENTS.md`, `CLAUDE.md`, or a configured memory system). Do not invent an agent's
memory path. If no destination is established, propose one for confirmation.

When continuing an existing Codex setup, preserve its established use of
`~/.codex/AGENTS.md` for global guidance and the project's `AGENTS.md` for project
instructions. Keep detailed project context in durable project documents and link
them from `AGENTS.md` when automatic discovery is needed. Follow any configured
source-repository or symlink rules when editing these files.

Examples:
- "Confirm save location before writing files" → **global** (universal behavior)
- "The project uses a particular release process" → **project** (project-specific convention)
- "Local development tools are stored in a shared directory" → **global reference** (machine-level path)

### Step 5: Write the retrospective file

Save to `<retrospective-dir>/YYYY-MM-DD-HHMM-{slug}.md` with this frontmatter:

```yaml
---
date: YYYY-MM-DD
session_slug: short-kebab-case
project: <project name, or "global" if no project>
project_path: <absolute path>
task_summary: |
  1-3 lines of what the session was about.

keep:
  - tag-1
  - tag-2

problem:
  - tag-1
  - tag-2

try:
  - tag-1
  - tag-2

memories_saved:
  - global/feedback/<slug>
  - project/<project>/<slug>
  - global/reference/<slug>

skills_proposed:
  - skill-name

recurring_patterns:
  - pattern: <tag>
    occurred_in: [YYYY-MM-DD, YYYY-MM-DD]
    memory: <slug or "none">
    status: <"new" | "existing memory not firing" | "memory wrong">
---
```

Tags in `keep:` / `problem:` / `try:` MUST be short kebab-case so they aggregate cleanly across sessions. Use the same tag across sessions if it's truly the same pattern — that's how recurrence is detected.

Body: human-readable sections per Keep / Problem / Try, with the *why* and *learning* for each.

If the session already has a work log and the retrospective makes no corrections to
repository content, saving this retrospective is sufficient. Do not add another work-log
entry or create a pull request solely to record that the retrospective ran. If the
retrospective results in repository corrections or authorized memory, documentation, or
skill changes, follow the repository's normal delivery requirements for those changes.

### Step 6: Execute the actions

Only propose durable actions that meet the promotion threshold above. For each
output category, **ask the user to confirm before writing** unless the
current session already authorizes that action, then:

- **Mechanism**: add the lint, test, check, or hook in the repository it guards, following that repository's normal delivery
- **Memory (global)**: update the established user-wide guidance or memory destination
- **Memory (project)**: update the established project guidance or project-scoped memory; maintain an index only if that memory workflow requires one
- **Doc**: edit the relevant file in the project repo
- **Skill**: use the user's skill-authoring workflow and source repository; update an existing catalog only when required by that repository

List only successfully persisted entries in `memories_saved`, using their actual
paths or identifiers. Keep proposals and unavailable persistence actions in the body;
do not claim they were saved.

## Anti-patterns

| ❌ Don't | ✅ Do |
|---|---|
| "セッションは順調でした" type vague Keep | Specific actions: "Compared the design document with the implementation before proposing changes." |
| Hiding mistakes to look competent | List every redo, file-move, miscommunication. That's where the value is. |
| Save memory with no scope | Always tag global / project / reference and follow the user's scope rules. |
| Skip the past-retrospective scan | The whole point is detecting recurrence. Always Step 1. |
| Save "I'll do better next time" as memory | Memories must be **actionable rules with why + how to apply**. |

## Example Output Skeleton

```markdown
# Retrospective: <session topic>

## Recurring patterns from past sessions
- ⚠️ "X" appeared in N past retrospectives. Memory [[Y]] exists but may not be firing.

## Keep
- ...

## Problem
- ...

## Try
- Mechanism: ...
- Memory: ...
- Doc: ...
- Skill: ...

## Proposed actions (waiting for confirmation)
1. Save memory: [scope] [type] [slug]
2. Update doc: [path]
3. Create skill: [name]
```

## Notes

- This skill is meant to be invoked **deliberately at session end**, not automatically — automatic invocation tends to produce shallow retros.
- The default retrospective directory is shared across projects and agents so patterns can be detected across sessions. Respect a different user-configured scope.
- Project-specific findings still get saved to project-scoped memory; the retrospective itself is just the index of what was learned and where it went.
