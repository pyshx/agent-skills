---
description: "review タブとラベル3種の設定で HTML を生成し、キー操作・自動保存・書き出し列を説明する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

factcheck.csv（examples/ にあります）は LLM が主張を支持・矛盾・確認不能に判定した結果です。人間が1件ずつ見て「正しい／誤り／保留」を付け、最後に CSV で書き出せる画面がほしいです。
