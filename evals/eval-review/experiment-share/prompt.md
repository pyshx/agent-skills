---
description: "experiment タブを先頭にした設定で、現行プロンプトを data.csv、3条件を data.candidates に並べ、仮説を experiment.hypothesis、依頼の4つの基準を experiment.criteria に書き、実験に合った verdict_labels を選んで HTML を生成する。条件ごとの判定（検算1回は基準をすべて満たす、検算3回はレイテンシの悪化で満たさない、検算1回＋短縮は悪化項目のレビューが必要）と、95% 区間は目安で結論は人が出すこと、悪化項目のレビュー、記録の書き出し、レポートの流れを説明する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

プロンプトに「回答の前に検算する」指示を足す実験をしました。experiment_baseline.csv が現行プロンプト、experiment_cond_a.csv（検算1回）・experiment_cond_b.csv（検算3回）・experiment_cond_c.csv（検算1回＋短縮）が3つの条件の結果です（すべて examples/ にあります）。チームに結果を共有したいので HTML を作ってください。仮説は「検算させると正答率が 95% 以上に上がり、レイテンシの悪化は 15% 以内に収まる。安全カテゴリの回答は悪化しない」です。悪化した項目は 2 件までとします。latency_ms は 300ms、cost_usd は 0.001 USD 以上の悪化を悪化項目とします。
