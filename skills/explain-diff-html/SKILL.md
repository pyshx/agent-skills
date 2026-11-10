---
name: explain-diff-html
description: Use when a complete unit of code change is ready to review — a finished diff, branch, commit, or PR, or the moment a spec/plan implementation wraps up — not only when explicitly asked for a "rich explanation." Fires once per unit of work, never per file or per subagent action. Produces a self-contained interactive HTML page.
---

# Explain Diff (HTML)

## Overview

Produce a rich, interactive explanation of a code change as a single self-contained HTML page. The page should let a reader — beginner or the change's own author — verify they truly understand the change.

## When to trigger

Fire at the granularity of one coherent, reviewable unit of work:

- A finished branch, commit, PR, or pasted diff the user is looking at or discussing.
- The conclusion of a spec/plan implementation — once all steps are done and the changes form one coherent diff, treat "plan implementation complete" as "PR ready," even if no formal PR exists.
- When subagents make the edits or commits: wait until ALL subagents for the unit of work have finished, then explain the aggregate diff.

If no change is specified, explain the most recently completed unit of work in the conversation.

**Red flags — do NOT fire when:**

- Only a single file (of a larger change) was just edited
- One subagent finished but others are still working
- A plan step completed but the plan isn't done
- Changes are mid-flight, partial, or still being iterated on

All of these mean: wait for the whole unit.

## Required sections

**Background** — the existing system relevant to this change. Broadly explore surrounding code first. Two layers: a deep background for beginners (marked as skippable for familiar readers), then a narrow background directly relevant to the change.

**Intuition** — the core idea of the change; essence over detail. Concrete examples with toy data. Figures and diagrams liberally.

**Code** — high-level walkthrough of the changes, grouped and ordered for understanding (not file order).

**Quiz** — five interactive multiple-choice questions, medium difficulty: answerable only by someone who understood the substance of the change, but no gotchas. Clicking an answer reveals whether it was correct, with feedback.

## Format

- One self-contained HTML file (inline CSS + JS). One long page with a table of contents and section headers — no tabs for top-level structure. Basic responsive styling so it reads well on a phone.
- Save it in a global place outside any code repo, filename starting with today's date in YYYY-MM-DD- format (keeps files time-sorted and out of version control), e.g. `/tmp/2026-01-12-explanation-auth-refactor.html`. Then open it in the browser (`open <file>` on macOS) or send it to the user.
- Write with the clarity and flow of Martin Kleppmann — engaging, classic style, smooth transitions between sections.

## Diagrams and code blocks

- Pick a small number of diagram families and reuse them throughout. Useful families:
  - A simplified version of the app's UI, for explaining UI changes.
  - A system diagram of data flow / communication between components — always with example data.
- Never ASCII diagrams. Use simple HTML/CSS designs for diagrams; HTML lists for lists.
- Code blocks: always `<pre>` tags. A custom-styled div MUST have `white-space: pre-wrap` in its CSS, or the browser collapses all newlines into one line. Before saving, scan every code block in the HTML source and confirm its CSS includes `white-space: pre` or `pre-wrap`.
- Use callouts for key concepts, definitions, and important edge cases.
