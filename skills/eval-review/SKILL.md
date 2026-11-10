---
name: eval-review
description: Turn local CSV, JSON, or JSONL datasets into one self-contained offline HTML page for reviewing evaluation results - compare a current model against one or more candidates on a golden dataset (regressions first), decide which candidates can be released against stated criteria with a human review of regressed items and a written report, share an experiment's result against a hypothesis with a written report, let a human review and label items (for example fact-check) with keyboard shortcuts and export the labels as CSV, or triage feedback by category and status. Use when the user has a CSV / JSON / JSONL dataset or evaluation results (for example LLM eval outputs as JSONL) and asks to visualize, explore, compare, review, label, or triage them, or says CSV を可視化, JSON を可視化, JSONL を確認, データセットを見たい, A/B 比較, リリース判定, 出してよいか, 実験結果の共有, 仮説検証, レビュー画面, ファクトチェックの確認. Not for live databases, BI dashboards, or charts meant for slides.
---

# Eval Review

Build a single offline HTML page for reviewing evaluation results (a review page, not live monitoring) from one or more data files plus a small JSON config. The file
opens from disk with no server and no network: Tabulator, PapaParse, the app code, and
the data are all inlined (or, in load mode, the data is read from the data file when
the page opens). The user can then sort, filter, read long text, compare the
current model with candidates, decide releases, share experiment results, record
review labels, and export CSV.

Input formats, chosen by file extension (anything else is an error):

- `.csv` - a header row plus rows.
- `.jsonl` - one JSON object per line (blank lines are skipped).
- `.json` - an array of objects, or an object holding that array at `data.records_path`
  (a dotted path such as `"data.items"`).

JSON records are flattened: nested objects become dot-separated column names
(`{"llm": {"verdict": ...}}` -> `llm.verdict`), and the config uses those names. A key
missing from a record is an empty cell; numbers and booleans behave as the same text
would in a CSV, so metrics work unchanged. Values that are still arrays or objects
after flattening are allowed only in `columns.text` columns; they are shown as
pretty-printed JSON in review and compare details and as compact JSON in the table.
Exports are always CSV.

Five jobs, selected by `tabs` in the config:

| Job | Tabs | What the reader gets |
|-----|------|----------------------|
| Model A vs B on a golden set | `compare`, `overview`, `table` | Counts of regressed / improved / unchanged items, metric deltas, a regressions-first list, and a side-by-side A/B detail view; with several candidates, a picker |
| Release decision | `release` (+ `report`), `compare`, `overview`, `table` | Per candidate a verdict (出してよい / 要レビュー / 出さない) against the config's criteria, a candidate x criteria table, a review of regressed items, a record to export, and later the written report |
| Sharing experiment results (hypothesis test) | `experiment` (+ `report`), `compare`, `overview`, `table` | The hypothesis and criteria, per condition a verdict against the baseline in words chosen for the experiment, each metric's difference and 95% interval with how to read it, a review of regressed items, a record to export, and later the written report with a Markdown download |
| Fact-check human review | `review`, `overview`, `table` | One item at a time, keys 1-9 to label, N for a note, autosave in the browser, CSV export with `human_label` and `human_note` |
| Feedback triage | `overview`, `table` | Category x status stacked bars, filters, and a full table with header filters and CSV download |

## Workflow

1. **Inspect the headers (for JSON, the keys of a few records) and a few rows** before
   writing anything. For JSON, note where the record array sits (`records_path`) and
   the flattened names of nested keys. Note the id
   column, long-text columns, the category / status / verdict columns, and numeric or
   boolean metric columns. Do not guess column names. Note data anomalies you see on
   the way (a verdict that contradicts its rationale, ids present in only one file,
   duplicate texts) to report later; do not fix the data.
2. **Pick the data mode without asking.** Use `embed` (the default): a fixed snapshot
   in one file, containing every row of the CSV. Use `load` only when the request
   implies it: the data is refreshed regularly, the data must not live in the HTML, or
   the HTML is distributed separately from the data. A `load` HTML contains no rows;
   it reads the CSV when it opens, so a data update only needs "読み込み直す" / Reload.
   Set `data.mode` in the config or pass `--mode load`. When choosing `load`, quote the
   words in the request that led to it.
3. **Write the config** next to the CSVs (paths in it resolve relative to the config
   file). Read [references/config.md](references/config.md) for every key and one
   example per job. Keep it minimal; unknown keys are an error by design.
   Prefer the built-in tabs and keys. When the request needs a view they do not give
   (counts per week, rows matching a rule the user described), write a small extra tab
   script and list it in `extra_tabs`; read
   [references/extra-tabs.md](references/extra-tabs.md) first. Never edit `assets/` or
   hand-write a separate HTML page for one request.
4. **Build:**

   ```bash
   python3 <skill-dir>/scripts/build.py --config review.config.json --out review.html [--mode load]
   ```

   Python 3 standard library only; nothing to install. `--csv` overrides the main
   data file path (CSV, JSON, or JSONL) for a one-off run (resolved from the current
   directory); candidates are always taken from the config.
   Load mode still reads the CSVs at build time to check columns and ids, and stores
   each CSV's path relative to `--out` as its default location, so write the HTML
   next to the CSV (or where that relative path stays valid).
5. **Read the build output.** It prints `wrote <path> (<bytes> bytes)` on success, or
   `error: ...` and exits 1. A warning such as `ids only in A (1): [...]` is not
   fatal; the same notice appears as a banner in the page. Fix errors by
   correcting the config or telling the user what is wrong with the CSV; never edit
   the user's CSV silently.
6. **Verify before handing over.** If a browser tool is available, open the file and
   check each tab: no console errors, charts sized to their cards, numbers that match
   a quick count from the CSV (for example the number of rows and of `true` values).
   In load mode, serve the folder (`python3 -m http.server`) so the CSV loads, or drop
   it on the page. After a rebuild, reopen the page with a new query string
   (`page.html?v=2`) or a forced reload; the browser may otherwise show the previous
   build from its cache. If no browser is available, say so instead of claiming it
   renders. Write what you checked as a verification record (the
   `verification-record` skill when installed): each tab opened, each count you
   reconciled against the data, and each check you could not run, such as "rendered
   in a browser" when none was available, with the reason.
7. **Hand the HTML file to the user** with a short reply covering:
   - the HTML path and size (from the build output);
   - the verification record from step 6;
   - what is in it and how to use it: which tab answers their question, keyboard keys
     for review, where the export / download buttons are. When the page will be opened
     in a pane where downloads do nothing (for example a browser pane inside a desktop
     app), point the user to the copy buttons next to each export instead;
   - any build warning;
   - data anomalies noticed in step 1, one line each, without fixing them;
   - in load mode: the words in the request that led to load; the CSV file(s) the page
     reads; that the HTML must sit next to the CSV (or keep the same relative path);
     that served over http it loads the CSV automatically, while opened by
     double-click (file://) it needs one click on "前回のファイルを読み込む" (Chromium,
     after the first pick) or a file pick / drop; and that every viewer needs the CSV.

## Choosing the config for a request

- "Did the new model get worse anywhere?" -> `compare` first. Declare each metric with
  `aggregate` and `better`. Boolean pass/fail metrics use `aggregate: "rate"`; a
  true->false flip of a `better: "higher"` rate is a regression. For numeric metrics
  set `regression_threshold` in the metric's unit (for example 300 for latency in ms);
  a numeric metric without a threshold is shown but does not classify items. A metric
  with no good direction (for example answer length) takes `better: "none"`: it is shown
  for reference only, without better/worse or colour, and cannot be a criterion.
  Put the current model in `data.csv` and each other model in `data.candidates`.
- "Which candidate can we release?" -> `release` first, then `compare`, `overview`,
  `table`. Turn each condition the user states into a `release.criteria` entry
  (`absolute`, `relative`, `regressions`, `critical_categories`); do not invent
  criteria they did not state, and ask when a threshold is missing. The metric
  thresholds decide which items count as regressed, so set them too. A condition like
  "no regressed item, unless a person looks at it and accepts it" is
  `{"type": "regressions", "max": 0, "count": "unaccepted"}`; plain `"max": 0` fails
  on the first regressed item whatever the review says.
- "Write up the decision" -> only after a human has reviewed the regressed items and
  exported the record (JSON). Read
  [references/release-report.md](references/release-report.md), write the report with
  every number copied from the record (never recomputed from the data), set
  `release.record` and `release.report`, add the `report` tab, and build again; the
  build checks the report's frontmatter verdicts against the record.
- "Did my experiment improve things? / Share the experiment result" -> `experiment`
  first, then `compare`, `overview`, `table`. Put the baseline in `data.csv` and each
  condition in `data.candidates`. Write the user's hypothesis in
  `experiment.hypothesis` and their conditions in `experiment.criteria` (the same
  types as release; do not invent any). Put the setup the reader needs (data, how
  each row was produced) in `experiment.description`, and give a criterion whose
  default name does not say what it checks a `label` and a `note`. Pick `experiment.verdict_labels` yourself to
  fit the experiment, worded so that the condition reads as their subject, for example
  基準を満たす / 要レビュー / 基準を満たさない, or 改善した / 要レビュー / 改善しなかった for a
  feature change (not 仮説を支持: a condition does not support anything). Never
  combine `experiment` and `release` in one config. The report comes later, as for
  release, from
  [references/experiment-report.md](references/experiment-report.md): six headings
  starting with a short conclusion, written for readers who saw neither the data nor
  the page; the conclusion is the human's reading and recommendation, not the verdict.
- "I need to check the LLM's fact-check verdicts" -> `review` first, with the verdict
  column as `columns.verdict` and the labels the user wants (`["正しい","誤り","保留"]`).
  Put the claim, the evidence, and the rationale in `columns.text` in reading order.
  When there are many text columns, group them with `columns.sections` (put the
  columns to compare in a `side-by-side` section) and list long text read only now and
  then (a full answer, cited sources) in `columns.collapsed`.
- "Show me where the feedback stands" -> `overview` + `table` with `category` and
  `status`. Use `order` to put workflow states in their natural order instead of
  first-seen order.
- Set `lang` to `ja` or `en` to match the user. All UI text follows it.
- Add `table` almost always; it is the escape hatch for anything the charts omit.

## Where to apply feedback

- On one page (tabs, criteria, thresholds, labels, wording, columns) -> change the
  config and build again.
- On a written report (structure, wording, a missing caveat) -> edit the report
  Markdown, keeping every number copied from the record, and build again (the build
  re-checks the frontmatter verdicts).
- A view the built-in tabs do not give, for one request -> an extra tab script
  ([references/extra-tabs.md](references/extra-tabs.md)).
- Never edit the generated HTML: the next build overwrites it, and it skips the build's checks.
- Change the skill itself (`assets/`, `scripts/`, `references/`) only for a need that
  recurs across requests (a new report type, a new criterion type, a bug): in the
  skill's source repository through a pull request, then reinstall. Never in the
  installed copy, and never for one request.

## What the page does (so you can explain it)

- **Overview:** stat tiles per metric (rate as % and k/n, mean with p50/p95, sum with
  per-item), horizontal bars of items per category stacked by status or verdict, and
  a histogram of one numeric metric. Every chart has hover tooltips and a "show as
  table" view. With candidates, buttons switch the overview between the data files.
- **Compare:** with several candidates, buttons pick the one compared with A. Items
  are paired by id. Ids present on only one side are excluded and
  listed in a banner. A sentence at the top says what was compared and which change
  of each metric counts as regressed or improved, and each count tile says what it
  counted. The change column shows each deciding metric as before → after (a rate as
  ○ → ×, a number with ▲ / ▼ for the direction of the number). Regressions sort
  flips first, then by size relative to the threshold, which the page calls the
  guide for better or worse (悪化・改善の目安). Selecting a row shows metrics side by
  side, text that is identical once, and text that differs as two columns.
- **Review:** applies to the first CSV (A). Labels and notes are stored in the
  browser's localStorage, keyed by the title and the set of ids, so reopening the file
  or a rebuild with changed values resumes; an item whose values changed since it was
  labelled shows 「データが変わった」. Picking a label moves to the next item. Keys: left/right arrows move, 1-9
  pick a label, N focuses the note, Esc leaves the note. "Unreviewed only" filters the
  queue. Export writes the original columns plus `human_label` and `human_note`
  (UTF-8 with BOM so Excel opens it correctly); "CSV をコピー" copies the same CSV
  without the BOM.
- **Release:** `release.description` on top when set; one card per candidate with its verdict, the criteria it did not meet,
  and links to its review and to the compare view; a candidate x criteria table with
  each value and ✓ / ✕ plus text; and each metric's n and 95% interval, for reference
  only. Clicking a table cell, a verdict, or a reason on a card (keyboard too; click
  again or Esc closes) opens a panel below the table with what decided it: the
  aggregate with k/n, n and the threshold (absolute); both values, the difference in
  the unit and in %, and the better direction (relative); or the regressed items with
  their reasons, review label, note, and links to their review and the compare view
  (regressions, critical categories, "不可" items, unreviewed items).
  Verdicts use all paired items and ignore the filter bar (hidden on this tab):
  出さない if a criterion fails or a regressed item is labelled with the last review
  label (default 不可), 要レビュー if a regressed item is unreviewed, otherwise 出してよい.
  The review of regressed items works like the review tab (arrows, 1-9, N, Esc) and is
  saved per candidate in localStorage. Without an `absolute` criterion, a line under
  the cards says only worsening was checked, not improvement. "記録を書き出す" downloads the record as JSON
  or Markdown, without reviewer names or times; "記録の … をコピー" copies the same text.
- **Experiment:** the release tab with the hypothesis (and `experiment.description`) on top and the verdicts in the
  words of `experiment.verdict_labels` (codes `pass` / `review` / `fail`, decided by
  the same rules), including the same detail panel. Each metric row says how to read
  its 95% interval (区間が0を含まない：
  差は誤差の範囲を超えている可能性が高い / 区間が0を含む：差は誤差の範囲かもしれない); the
  interval never changes a verdict. The record adds `hypothesis` and `verdict_labels`.
- **Report:** the Markdown report from `release.report` or `experiment.report`,
  rendered as headings, paragraphs, flat lists, tables, and bold / italic only, with
  HTML shown as text. "Markdown を書き出す" downloads the report body and "Markdown
  をコピー" copies it. If the viewer's
  reviews change a verdict from the record, a warning on top says the report is out of
  date.
- **Table:** Tabulator with sort, header filters (drop-downs for category / status /
  verdict), long text truncated with an expand button, optional grouping by category,
  and download of the currently filtered rows.
- **Loading other data:** the load buttons and drag-and-drop (CSV, JSON, or JSONL) replace the
  embedded data in the browser only (a dropped file replaces A). The same column
  checks as the build script run; a mismatch shows an error and keeps the old data.
- **Load mode:** served over http(s), the page fetches each CSV from its default
  path (relative to the HTML) on open, checks it like a picked file, and renders;
  "読み込み直す" fetches it again. Opened from file://, or when the fetch fails (404,
  wrong columns), it shows "データファイルを選択 / ドロップ" with a one-line reason, the expected
  file names, and the required columns. Dropped files go to the side whose expected
  name matches. The header shows each file's path or name, row count, and load time.
  In Chromium browsers a picked file is remembered, so after reopening the page one
  click on "前回のファイルを読み込む" (plus the browser's permission prompt) re-reads
  it, and "読み込み直す" re-reads the same files directly; elsewhere it returns to the
  picker.

## Security and privacy notes

- The HTML is self-contained: a Content-Security-Policy forbids external scripts and
  remote images, and network requests except, in load mode, reading the CSV from the
  same server (`connect-src 'self'`). Nothing is uploaded anywhere.
- **In embed mode the CSV data is in the HTML.** Anyone who receives the file can read
  every row, including columns the page does not show. Tell the user this before
  they share it; drop sensitive columns from the CSV first, or use load mode. A
  load-mode file holds only the config (title, column names, labels, `order` values)
  and each CSV's path relative to the HTML, never absolute paths or rows.
- CSV values are inserted as text, never as HTML, so markup in the data is displayed
  literally. The only exception is that `http://` / `https://` URLs in `columns.text`
  values become links (new tab, `rel="noopener noreferrer"`); other schemes such as
  `javascript:` stay text. Extra tab scripts must keep this: data goes in only through the provided
  element builder or `textContent`, never `innerHTML`.
- Review labels, including release reviews, live only in that browser's localStorage.
  Clearing site data, another browser, or another machine starts empty. Export to keep
  them; for release (or experiment) reviews, export the record and set it as
  `release.record` (`experiment.record`) so the rebuilt HTML carries them.

## Gotchas

- Duplicate or empty ids are build errors in every mode, because compare and review
  key on the id. If the CSV has no id column, ask the user which column is unique, or
  add one in a copy of the CSV and say so.
- Rate metrics accept `true/false`, `1/0`, `yes/no`, `y/n`, `t/f` (any case). An
  empty cell means "no value" and is excluded from n; any other value is an error.
- A CSV with `human_label` or `human_note` columns cannot be used with `review` (those
  names are reserved for the export). Rename them in a copy first.
- More than 8 status / verdict values fold the tail into "Other" for color; the table
  still shows the real values.
- Large files: in embed mode the data is inlined as JSON, so the HTML is roughly the
  CSV size plus about 570 KB of libraries and app code (load mode: just the 570 KB). Tens of thousands of rows work; for far more, filter the
  CSV first.

## Files

- `scripts/build.py` - validates the config and data files, inlines everything.
- `assets/template.html`, `assets/app.js`, `assets/app.css` - the page itself.
- `assets/vendor/` - PapaParse 5.4.1 and Tabulator 6.3.1 (MIT); see
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- `references/config.md` - every config key, including `release` and `experiment`, and
  the record format.
- `references/release-report.md` - the release report's frontmatter, four headings,
  and the Markdown the report tab renders.
- `references/experiment-report.md` - the experiment report's frontmatter, six
  headings, and the writing principles both reports follow.
- `references/extra-tabs.md` - the extra tab API, an example, and the security rule.
- `examples/` - synthetic CSVs and a config for each job (the release decision has a
  current model and three candidates, plus `release_record.json`, `release_report.md`,
  and `release_report.config.json`; the experiment has a baseline and three conditions,
  plus `experiment_record.json`, `experiment_report.md`, and
  `experiment_report.config.json`), plus `factcheck.jsonl` with
  `factcheck_jsonl.config.json` (nested keys and an array column) and
  `feedback_weekly.js` (an extra tab used by `feedback.config.json`). Build one to see the result:
  `python3 scripts/build.py --config examples/golden.config.json --out /tmp/golden.html`.
