# Release report

A release report is a Markdown file that explains the release decision to people who
did not do the review. It is shown in the page's `report` tab, next to the release
tab that holds the numbers; "Markdown を書き出す" / "Export Markdown" there downloads the
report body. For an experiment that tests a hypothesis, see
[experiment-report.md](experiment-report.md) instead.

## Flow

1. Build the page with the `release` tab, have a human review the regressed items,
   and export the record as JSON ("記録を書き出す (JSON)").
2. Ask the requester what the reader is asked to decide, who decides, and why the
   candidates are being compared (the problem or trigger behind it). Write that reason
   from the answer, not from general knowledge; without an answer, write that it is
   unconfirmed.
3. Read the record (and the data when an item needs explaining) and write the report.
   Copy every number from the record; do not recompute it from the data.
4. Set `release.record` to the JSON and `release.report` to the Markdown, add `report`
   to `tabs`, and build again. The HTML then carries the reviews too, so one file shows
   the same verdicts to everyone.
5. Reread the report as the reader against the questions in
   [experiment-report.md](experiment-report.md#flow) step 5, and fix what fails.

`examples/release_record.json`, `examples/release_report.md`, and
`examples/release_report.config.json` are a complete example.

## Frontmatter

The file starts with each candidate's verdict, by candidate label, as the code `go`
(出してよい), `review` (要レビュー), or `no-go` (出さない):

```markdown
---
verdicts:
  候補B: go
  候補C: no-go
  候補D: review
---
```

`verdicts:` is the only key. Every candidate in `data.candidates` appears exactly once,
and no other label does; a label may be quoted (`"候補 B": go`). The build recomputes
each verdict from the data and the record's reviews and exits 1 on any mismatch,
missing, or extra candidate. The numbers in the body are not checked, which is why
they must be copied from the record. The frontmatter is not rendered or downloaded.

## Structure

Use these four headings in this order, in the language of the page, with nothing
before the first.

| Heading | Purpose |
|---------|---------|
| 結論 / Conclusion | In a few sentences: what the reader is asked to decide, which candidates can be released and why in plain words, and the decision with who decides, or 未決. |
| 理由 / Reasons | What the current model and each candidate are, the data, the criteria, and per candidate the values and reviewed items that decided its verdict. |
| 注意点 / Caveats | What limits the decision, including what it needs that was not measured. |
| 次にやること / Next steps | Only what someone has decided to do, each with who does it. Put your (the agent's) own suggestions in a separate list labelled 提案 / Suggestions. |

## Principles

The same as for the experiment report
([experiment-report.md](experiment-report.md#principles)): conclusion first and short;
each paragraph opens with its topic sentence; bold only the key number or judgment,
about once per section at most; write for a reader who saw nothing else; every sentence has a subject and people are
named by the roles the requester gave; use the readers' words; do not guess but ask or
write that it is unconfirmed; state everything decided after seeing the data; report
unfavourable results; and describe the 95% interval correctly.

## Markdown that the report tab renders

The report tab renders a small subset and inserts every character as text, so HTML in
the file is shown literally, never executed.

- Headings: `#` to `######` (all shown one level below the page title).
- Paragraphs: consecutive lines, separated by a blank line.
- Lists: `- ` / `* ` bullets and `1. ` / `1) ` numbered items, one level only
  (indented items are shown at the same level).
- Tables: a header row, a `| --- |` separator row, then data rows.
- Emphasis: `**bold**` and `*italic*`.
- Differences: ▲ / ▼ followed by the change, as described below.

Anything else (links, images, inline code, code blocks, nested lists, `_italic_`) is
shown as plain text. Write file names and ids without backticks.

## Writing differences

Write a difference the way the page does: ▲ when the number went up and ▼ when it went
down, then the signed change, then 改善 or 悪化 (better / worse in English) for a metric
with a direction, for example "▼ −2pt 悪化" for accuracy or "▲ +75.6 ms 悪化" for
latency. The report tab colours the difference from that word: in a table cell that
starts with ▲ / ▼ the whole cell, elsewhere the text from the arrow to the next 、。,;
or closing parenthesis. A difference without either word stays uncoloured.

## When the report goes stale

The reviews in the record seed the viewer's release review. If the viewer changes a
review so that a verdict differs from the record, the report tab shows a warning
naming each changed candidate (record verdict -> current verdict). Export the record
again, update the report, and rebuild.
