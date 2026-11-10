---
name: explain-diff-notion
description: Use when the user explicitly asks for a rich explanation of a code change, diff, branch, commit, or PR as a Notion page or Notion doc (e.g. to share with the team). Requires Notion MCP tools.
---

# Explain Diff (Notion)

## Overview

Produce a rich explanation of a code change as a Notion page, using the Notion MCP tools. Return the new page's URL when done.

## Required sections

**Background** — the existing system relevant to this change. Broadly explore surrounding code first. Two layers: a deep background for beginners (marked as skippable for familiar readers), then a narrow background directly relevant to the change.

**Intuition** — the core idea of the change; essence over detail. Concrete examples with toy data. Figures and diagrams liberally.

**Code** — high-level walkthrough of the changes, grouped and ordered for understanding (not file order).

**Quiz** — five multiple-choice questions, medium difficulty: answerable only by someone who understood the substance of the change, but no gotchas. Each option is a toggle block whose body explains why that answer is correct or incorrect:

```
1. Question
   ▶ Option 1
     ❌ Explanation for why it was incorrect
   ▶ Option 2
     ❌ Explanation for why it was incorrect
   ▶ Option 3
     ✅ Explanation for why it was correct
   ▶ Option 4
     ❌ Explanation for why it was incorrect
2. Question
   ...
```

## Format

- Create a new page with the Notion MCP tools and return its URL. If no destination was given and no obvious parent page exists, ask where to put it before creating.
- Write with the clarity and flow of Martin Kleppmann — engaging, classic style, smooth transitions between sections.
- Diagrams: pick a small number of diagram families and reuse them throughout the explanation. Always include example data.
- Use callouts for key concepts, definitions, and important edge cases.
