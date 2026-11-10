---
description: "embed か load かを質問せずに、依頼文から load を選んで HTML を CSV の隣に生成し、行データが入っていないこと、http で配信すれば自動で読み込み、ダブルクリックで開いたときは1クリックかファイル選択が必要なこと、更新時は読み込み直すことを説明する。"
tags: [core, trigger]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

feedback.csv（examples/ にあります）は毎週更新されます。チームに HTML を配りたいのですが、データ自体は HTML に入れたくありません。更新のたびに読み込み直せる形にしてください。
