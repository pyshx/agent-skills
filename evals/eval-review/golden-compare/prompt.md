---
description: "compare を先頭にした設定ファイルを作り、HTML を生成し、悪化件数と id のずれの警告を報告する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

golden_model_a.csv が現行モデル、golden_model_b.csv が新モデルの評価結果です（どちらも examples/ にあります）。新モデルで悪化したケースがあるか一目で分かる HTML を作ってください。correct は正誤、latency_ms は 300ms 以上遅くなったら悪化扱い、cost_usd も見たいです。
