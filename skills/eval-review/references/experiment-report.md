# Experiment report

An experiment report is a Markdown file that shares the result of an experiment with
people who did not see the data. It is shown in the page's `report` tab, next to the
experiment tab that holds the numbers, and "Markdown を書き出す" / "Export Markdown"
downloads it for pasting into Google Docs or Notion.

## Flow

1. Build the page with the `experiment` tab, have a human review the regressed
   items, and export the record as JSON ("記録を書き出す (JSON)").
2. Ask the requester what the reader is asked to decide, who decides, and why the
   comparison is being done (the problem or trigger behind it). Write 背景 from that
   answer, not from general knowledge; without an answer, write that it is unconfirmed.
3. Read the record, the config's `experiment.description`, and the data, and write the
   report. Copy every number from the record; do not recompute it from the data.
4. Set `experiment.record` to the JSON and `experiment.report` to the Markdown, add
   `report` to `tabs`, and build again.
5. Reread the report as the reader and fix what fails these questions: What am I asked
   to decide, and by whom? Why was this compared at all? What exactly was compared, and
   how was it scored? What do the numbers say, and how sure are they? What does the
   decision still need that was not measured? Also check every factual sentence against
   the data or the record, and remove anything the requester did not say (a guess).

`examples/experiment_record.json`, `examples/experiment_report.md`, and
`examples/experiment_report.config.json` are a complete example.

The page computes each condition's verdict from the config's criteria; the 95%
interval never changes it. The conclusion is the reading of the person who owns the
experiment, not the verdict alone.

## Frontmatter

The file starts with each condition's verdict, by condition label, as the code `pass`,
`review`, or `fail` (not the words of `verdict_labels`):

```markdown
---
verdicts:
  条件A: pass
  条件B: fail
  条件C: review
---
```

`verdicts:` is the only key, every candidate in `data.candidates` appears exactly once,
and a label may be quoted. The build recomputes each verdict from the data and the
record's reviews and exits 1 on any mismatch. The numbers in the body are not checked.
The frontmatter is not rendered or downloaded.

## Structure

Use these six headings in this order, in the language of the page, with nothing before
the first.

| Heading | Purpose |
|---------|---------|
| 結論 / Conclusion | In a few sentences: what the reader is asked to decide, what was changed and what happened (with the main number), and the recommendation (採用する / 直して再度試す / 採用しない) with who decides, or 未決. |
| 背景 / Background | The problem, why it matters, and the hypothesis. |
| 方法 / Method | What was compared, the data, how it was measured and scored, and the criteria. |
| 結果 / Results | Each condition's verdict and each metric's value, difference, and 95% interval. |
| 考察 / Discussion | How to read the results, how far they carry, and what the decision needs that was not measured. |
| 次にやること / Next steps | Only what someone has decided to do, each with who does it. Put your (the agent's) own suggestions in a separate list labelled 提案 / Suggestions. |

## Principles

- Put the conclusion first and keep it short. Verdict labels, criteria, and the review
  procedure belong in 方法 and 結果.
- Open each paragraph with its topic sentence: the point of the paragraph, or a
  one-line overview of it.
- Use bold sparingly, for the key number or judgment, about once per section at most;
  when much is bold, nothing stands out.
- Write for a reader who saw neither the data nor the page: say the background and
  what each compared thing is, and use the readers' words rather than the page's or
  this skill's labels (or explain a label where it first appears).
- Every sentence has a subject. Name people by the roles the requester gave, verbatim,
  and do not coin new ones. When you (the agent) did part of the work, say so.
- Do not guess. Ask the requester, or write that it is unconfirmed.
- State everything decided after seeing the data: a criterion, a metric, a scoring
  rule, a filter.
- Report every metric, including those that got worse and those whose interval
  contains 0.
- An interval computed this way contains the true difference in 95% of repeated
  experiments; when it contains 0, the difference is not distinguishable from noise
  with this data (このデータでは偶然のばらつきと区別できない), not "no effect".

## Markdown and staleness

The report tab renders the same Markdown subset as for the release report and colours
▲ / ▼ differences the same way; see
[release-report.md](release-report.md#markdown-that-the-report-tab-renders). If the
viewer's reviews change a verdict from the record, the tab warns that the report is
out of date.

## Sources

- [Matt Strom, Bottom Line Up Front](https://mattstromawn.com/writing/bluf)
- [Statsig, How to report test results](https://statsig.com/blog/how-to-report-test-results)
- Kohavi, Tang and Xu, *Trustworthy Online Controlled Experiments* (2020)
