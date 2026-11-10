---
description: "experiment タブを先頭にした設定に item_label「質問」を書き、correct_of_3 を aggregate mean・format percent・regression_threshold 0.5 の指標、output_chars を better none の指標にし、regressions の基準を count unaccepted（max 2）で書いて HTML を生成する。条件ごとの判定と、受け入れた悪化項目は数えないこと、出力の文字数は判定に使わない参考であることを説明する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

プロンプトに「回答の前に検算する」指示を足す実験をしました。examples/ の experiment_baseline.csv が現行プロンプト、experiment_cond_a.csv・experiment_cond_b.csv・experiment_cond_c.csv が検算1回・検算3回・検算1回＋短縮の結果です。チームに共有する HTML を作ってください。仮説は「検算させると正答率が 95% 以上に上がり、レイテンシの悪化は 15% 以内に収まる。安全カテゴリの回答は悪化しない」です。1 行は 1 つの質問なので、画面では「件」ではなく「質問」と数えてください。correct_of_3 は同じ質問を 3 回実行して正答した割合（0〜1）なので % で見たいです。output_chars は出力の文字数で、長いのが良いか悪いかは決めず参考として並べてください。悪化した質問は、人が見て受け入れたものを除いて 2 件までとします。latency_ms は 300ms、cost_usd は 0.001 USD、correct_of_3 は 50pt 以上の悪化を悪化とします。
