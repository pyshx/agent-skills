---
description: "compare を含む設定に extra_tabs で小さなスクリプトを追加し、カテゴリ別の正答率を A/B で並べるタブを作る。skill の assets/ は編集せず、別の HTML も手書きしない。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

golden_model_a.csv（現行）と golden_model_b.csv（新）（どちらも examples/ にあります）の比較 HTML に、カテゴリごとの正答率を現行と新で並べて見られるタブも付けてください。悪化した項目の一覧は今まで通り使いたいです。
