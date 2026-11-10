---
description: Core case. A one-line bug fix whose unit tests can run but whose end-to-end check needs a staging URL only CI has. The record must list the e2e check under Not performed instead of claiming it.
tags: [core, trigger]
runs: 2
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Edit, Write, Bash]
---

slugify keeps capital letters, so post URLs come out as /posts/Hello-World. Fix it and get it ready for a PR. Tell me what you verified.
