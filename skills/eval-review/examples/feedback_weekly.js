// Extra tab for feedback.config.json: feedback received per week (Monday start), stacked by status.
// Data is inserted only through ctx.el / textContent, never innerHTML.
EvalReview.registerTab("weekly", (ctx) => {
  const DATE = "date";
  const status = ctx.columns.status;
  if (ctx.rows.length && !(DATE in ctx.rows[0])) throw new Error("column " + DATE + " is missing");

  // "2026-07-01" -> "2026-06-29", the Monday of that week (UTC, so time zones cannot shift it).
  const weekOf = (text) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text).trim());
    if (!m) throw new Error(DATE + " " + JSON.stringify(text) + " is not YYYY-MM-DD");
    const day = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    return day.toISOString().slice(0, 10);
  };

  const counts = new Map();
  const statuses = [];
  for (const row of ctx.rows) {
    const week = weekOf(row[DATE]);
    const s = row[status];
    if (!statuses.includes(s)) statuses.push(s);
    const perStatus = counts.get(week) || new Map();
    perStatus.set(s, (perStatus.get(s) || 0) + 1);
    counts.set(week, perStatus);
  }
  const weeks = [...counts.keys()].sort();
  // Keep the status order from config.order when it is set.
  const preferred = ctx.order[status] || [];
  statuses.sort((x, y) => (preferred.indexOf(x) + 1 || 1e9) - (preferred.indexOf(y) + 1 || 1e9));

  const ja = ctx.lang === "ja";
  const card = ctx.el("div", { class: "card" }, [ctx.el("h2", { text: ja ? "週ごとの件数（月曜始まり）" : "Count per week (weeks start on Monday)" })]);
  ctx.container.appendChild(card);
  if (!weeks.length) {
    card.appendChild(ctx.el("div", { class: "empty", text: ja ? "条件に合う項目はありません" : "No items match the filters" }));
    return;
  }
  const holder = ctx.el("div");
  card.appendChild(holder);
  const countOf = (week, s) => counts.get(week).get(s) || 0;
  holder.appendChild(ctx.stackedBarChart(holder, weeks, statuses, countOf));

  const header = [ja ? "週" : "week", ...statuses, ja ? "合計" : "total"];
  const body = weeks.map((w) => {
    const ns = statuses.map((s) => countOf(w, s));
    return [w, ...ns.map(String), String(ns.reduce((a, b) => a + b, 0))];
  });
  card.appendChild(ctx.dataTable(header, body));
  card.appendChild(ctx.el("button", {
    class: "btn", type: "button", text: ja ? "週ごとの件数を CSV でダウンロード" : "Download weekly counts as CSV",
    onclick: () => ctx.downloadCsv("feedback_weekly.csv", header, body)
  }));
});
