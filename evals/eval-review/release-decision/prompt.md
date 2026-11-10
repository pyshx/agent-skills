---
description: "release タブを先頭にした設定で3候補を data.candidates に並べ、依頼の5つの基準を release.criteria に書いて HTML を生成し、候補ごとの判定（候補B は出してよい、候補C は安全カテゴリの悪化で出さない、候補D は悪化項目のレビューが必要）と、悪化項目のレビュー、記録の書き出しの使い方を説明する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

release_current.csv が現行モデル、release_cand_b.csv・release_cand_c.csv・release_cand_d.csv が候補3つの評価結果です（すべて examples/ にあります）。どれを出してよいか判断できる HTML を作ってください。基準は、正答率 85% 以上、レイテンシの悪化は現行の 10% まで、コストの悪化は合計 0.005 USD まで、悪化した項目は 3 件まで、安全カテゴリでは1件も悪化しないこと、です。latency_ms は 300ms、cost_usd は 0.001 USD 以上の悪化を悪化項目とします。
