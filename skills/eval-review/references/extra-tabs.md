# Extra tabs

Use an extra tab only when the request needs a view that `overview`, `compare`,
`review`, and `table` do not give: counts per week, a list of rows matching a rule the
user described, a chart of a column the config has no role for. Check the built-in tabs
and the config keys first; a filter, `order`, or the table often already answers it.

An extra tab is a small JavaScript file next to the config. The build inlines it after
the page code, so the HTML stays one offline file. Do not edit `assets/` or write a
separate HTML page instead.

## Config

```json
"extra_tabs": [
  {"id": "weekly", "title": "週ごとの件数", "script": "feedback_weekly.js"}
]
```

| Key | Meaning |
|-----|---------|
| `id` | Unique among extra tabs and different from the built-in tabs `overview`, `compare`, `review`, `table`, `release`, `report`. The script registers under this id. |
| `title` | Tab label. |
| `script` | A `.js` file, resolved relative to the config file like the data paths. |

Extra tabs follow the `tabs` entries, in list order. The build fails on an unknown key, a
missing file, a non-`.js` path, a repeated id, or an id of a built-in tab. Only `id` and
`title` are stored in the HTML's config; the script's code is inlined, its path is not.

## API

Each script calls `EvalReview.registerTab(id, render)` once. `render(ctx)` runs
every time the tab is drawn: when it is opened, when the data is loaded or reloaded
(load mode, a picked or dropped file), when a filter changes, and on window resize.
The container is new and empty each time, so `render` builds the whole tab from `ctx`.

`ctx` holds:

| Field | Meaning |
|-------|---------|
| `container` | The tab's element. Append to it. |
| `rows` | Rows of the main data file (A) that match the filter bar. Each row maps every header to its cell: text as in the CSV (`"true"`, `"0.92"`), or an array / object for JSON values kept in `columns.text` columns. |
| `rowsB` | The same for the candidate selected in the compare tab (the first one until another is picked), or `null` without `data.candidates`. |
| `pairs` | With candidates: `[{id, a, b}]` for ids present in A and the selected candidate, filtered like the compare tab. Otherwise `null`. |
| `candidates` | Every candidate in config order: `[{label, rows, pairs}]`, filtered the same way. An empty list without `data.candidates`. |
| `columns` | The config's `columns` (`id`, `text`, `category`, `status`, `verdict`, `metrics`). |
| `order` | The config's `order`. |
| `labels` | `{a, b}` side names: `data.label_a` and the selected candidate's label (`null` without candidates). |
| `lang` | `"ja"` or `"en"`. Write the tab's own text in this language. |
| `el(tag, attrs, children)` | Element builder. `attrs.text` sets `textContent`; `on<event>` adds a listener; other keys are attributes. String children become text nodes. |
| `cellText(value)` | A cell as one line of text (arrays and objects as compact JSON). |
| `formatNumber(n)` | A number formatted like the overview's numbers. |
| `barChart(holder, categories, counts)` | Horizontal bars; `counts` is a `Map` from category to count. Returns an SVG. |
| `stackedBarChart(holder, categories, segments, countOf)` | Horizontal bars stacked by segment, with a legend; `countOf(category, segment)` returns a count. Segments that are status / verdict values keep the overview's colors. Returns an element. |
| `histogramChart(holder, values, unit)` | Histogram of finite numbers; `unit` is an optional suffix. Returns an SVG (or an empty-state message for no values). |
| `dataTable(headers, rows, opts)` | A plain table; `rows` are arrays of strings. A column whose non-empty cells are all numbers (`12`, `1,088`, `-0.5`, `85%`) is right-aligned and does not wrap; any other column is left-aligned and wraps. `opts` is optional: `numeric` is an array of column indexes to treat as numeric instead of guessing (`{numeric: [2, 3]}`; `[]` makes every column text), and `minWidth` is the minimum width in px of each text column, so long sentences do not squeeze into a narrow column. An invalid `opts` throws. |
| `downloadCsv(filename, fields, rows)` | Downloads a CSV (UTF-8 with BOM); `rows` are arrays of cells. |

The chart functions size themselves to `holder`, so append `holder` to the container
before calling them, then append the returned node to `holder`. Charts have the same
tooltips as the overview.

Columns that the config does not name are not checked by the build or by the browser,
so a load-mode file may lack them. Check the columns the tab uses and `throw` an `Error`
with a clear message when one is missing or a value cannot be parsed.

## Errors

An error thrown by `render` replaces the tab's content with the message and is logged
to the browser console; the other tabs keep working. A script that fails before calling
`registerTab` (a syntax error, a throw at top level) leaves its tab showing "did not
register" and the error in the console. `registerTab` throws for an id not in
`config.extra_tabs`, a second registration, or a `render` that is not a function.

## Security rule

Insert data only with `ctx.el` (`text` or string children) or `textContent`. Never
assign data to `innerHTML`, `outerHTML`, or `insertAdjacentHTML`, and never build
attribute values such as `href` or `style` from data. The data may contain markup, and
the page's guarantee that it is shown literally depends on every tab keeping this
rule. The Content-Security-Policy is unchanged: the script cannot load anything from the
network, and should not try.

## Example

`examples/feedback_weekly.js`, used by `examples/feedback.config.json`, counts
feedback per week (weeks starting on Monday) stacked by status, with the counts as a
table and a CSV download. Its core:

```js
EvalReview.registerTab("weekly", (ctx) => {
  const status = ctx.columns.status;
  if (ctx.rows.length && !("date" in ctx.rows[0])) throw new Error("column date is missing");
  const counts = new Map();          // week -> Map(status -> n)
  for (const row of ctx.rows) {
    const week = weekOf(row.date);   // Monday of the week, "YYYY-MM-DD"
    const perStatus = counts.get(week) || new Map();
    perStatus.set(row[status], (perStatus.get(row[status]) || 0) + 1);
    counts.set(week, perStatus);
  }
  const weeks = [...counts.keys()].sort();
  const statuses = ctx.order[status] || [];
  const card = ctx.el("div", { class: "card" }, [ctx.el("h2", { text: "週ごとの件数" })]);
  ctx.container.appendChild(card);
  const holder = ctx.el("div");
  card.appendChild(holder);
  holder.appendChild(ctx.stackedBarChart(holder, weeks, statuses,
    (w, s) => counts.get(w).get(s) || 0));
});
```

Build it as any example and open the "週ごとの件数" tab:
`python3 scripts/build.py --config examples/feedback.config.json --out /tmp/feedback.html`.

The page's CSS classes `card`, `empty`, `small`, `muted`, `btn`, `grid`, and
`two-col` are available for layout, so an extra tab looks like the built-in ones.
