/* eval-review runtime. Data values are only ever inserted as text (textContent or text
   nodes); http(s) URLs in text columns become <a> elements after new URL() checks them. */
(function () {
  "use strict";

  const STRINGS = {
    ja: {
      tabs: { overview: "概要", compare: "比較", review: "レビュー", table: "表", release: "リリース判定", experiment: "実験結果", report: "レポート" },
      all: "すべて", search: "検索", searchPh: "id・本文を検索", shown: "表示 {n} / {total} 件",
      dataSide: "表示するデータ", mean: "平均", sum: "合計", perItem: "1件あたり",
      items: "件", other: "その他", rows: "{n} 行", embedded: "ビルド時に埋め込み", loaded: "ブラウザで読み込み",
      countsTitle: "{cat} × {stack} の件数", countsTitleSingle: "{cat} 別の件数", histTitle: "{label} の分布",
      tableView: "表で見る", total: "合計", range: "範囲", count: "件数",
      onlyIn: "{label} にだけあり {other} にない id（{n} 件、比較から除外）: {ids}",
      candidate: "比べる候補", candidateCol: "候補", candidateValue: "候補の値",
      paired: "比較した件数", regressed: "悪化", improved: "改善", unchanged: "変化なし",
      better: "改善", worse: "悪化", flat: "変化なし", rateGood: "○", rateBad: "×",
      regressedTitle: "悪化したケース", improvedTitle: "改善したケース",
      regressedSort: "{flip}悪くなり方が大きい順です。行を押すと、{a} と {b} の内容を並べて表示します。",
      improvedSort: "{flip}良くなり方が大きい順です。行を押すと、{a} と {b} の内容を並べて表示します。",
      flipFirst: "{from}→{to} に変わったものを先頭に、",
      compareSummary: "{a} と {b} を、同じ id の行どうし（{n} 件）で比べた。",
      rulesUsed: "{rules}ものを「悪化」、反対に良くなったものを「改善」とした。",
      rulesNone: "悪化・改善を決める指標がないため、すべて「変化なし」とした。",
      ruleFlip: "{label} が {good} から {bad} に変わった", ruleUp: "{label} が {t} を超えて上がった", ruleDown: "{label} が {t} を超えて下がった", ruleOr: "か、",
      countOf: "{total} {unit}のうち {n}（{pct}%）", pairedNote: "{a} と {b} の両方にある id",
      noteFlip: "{label} {from}→{to}", noteOver: "{label} {d} 超", noteAny: "{list} のどれか", unchangedNote: "悪化にも改善にも当たらない",
      changeText: "{label}：{a} → {b}", changeDelta: "（{d}）",
      reason: "変化", metric: "指標", delta: "差 ({b}−{a})", shared: "{a}・{b} 共通",
      noRegressions: "条件に合う悪化ケースはありません", noImprovements: "条件に合う改善ケースはありません",
      thresholdNote: "悪化・改善の目安", noThreshold: "目安なし（悪化・改善の判断に使わない）",
      infoNote: "参考（悪化・改善の判断に使わない）", rulesInfo: "{list} は参考として表示し、悪化・改善の判断には使わない。", listSep: "、",
      reviewed: "レビュー済み {n} / {total}", unreviewedOnly: "未レビューのみ", exportCsv: "CSV を書き出す",
      dataChanged: "データが変わった", dataChangedHint: "レビューした後で、この項目の値が変わった。見直して、ラベルを付け直すかメモを直すと消える。",
      prev: "← 前へ", next: "次へ →", note: "メモ", humanLabel: "あなたの判定",
      keys: "← → 移動 · 1–{n} 判定 · N メモ · Esc メモから戻る",
      storageOk: "このブラウザに自動保存しています", storageNo: "このブラウザには保存できません。閉じる前に CSV を書き出してください",
      noItems: "条件に合う項目はありません", groupBy: "カテゴリでまとめる", download: "表示中の行を CSV でダウンロード",
      loadA: "データを読み込む", loadSide: "{label} のデータを読み込む", dropHint: "ドロップしたファイルで {label} のデータを置き換えます",
      badExt: "{name} の拡張子に対応していません（.csv / .json / .jsonl）", badJson: "{where}: JSON として読めません（{msg}）",
      notObject: "{where}: レコードは JSON オブジェクトである必要があります", notArray: "レコードの配列がありません（records_path を設定してください）",
      recordsMissing: "records_path {path} が見つかりません", recordsPathOnlyJson: "records_path は .json ファイルにだけ使えます",
      dupKey: "{where}: ネストを展開すると列 {col} が重複します", noRecords: "レコードがありません",
      nestedValue: "データ {r} 行目: 列 {col} が JSON の配列かオブジェクトです（columns.text の列だけが許されます）",
      unsafeId: "データ {r} 行目: id {id} は 2^53-1 を超え、ブラウザで値が変わります。id は文字列にしてください",
      line: "{n} 行目", record: "{n} 件目", document: "ファイル全体",
      loadErr: "{name} を読み込めませんでした", missingCols: "設定した列 {cols} がヘッダーにありません",
      dupId: "id {id} が重複しています（データ {r1} 行目と {r2} 行目）", emptyId: "データ {r} 行目の id が空です",
      badValue: "データ {r} 行目: {col}={v} は{kind}ではありません", number: "数値", boolean: "真偽値 (true/false)",
      parseErr: "データ {r} 行目: {msg}", reserved: "列 {cols} はレビューの書き出し用に予約されています",
      noData: "データがありません",
      loadTitle: "データファイルを選択 / ドロップ",
      loadIntro: "この HTML にはデータが入っていません。http で配信していれば既定の場所のファイル（CSV / JSON / JSONL）を開いたときに自動で読み込みます。それ以外はファイルを選ぶかページにドロップしてください。データを更新したら「読み込み直す」で反映できます。",
      expectedFile: "想定するファイル: {name}", requiredCols: "必須の列: {cols}", defaultPath: "既定の場所（HTML からの相対パス）: {path}",
      chooseFile: "ファイルを選ぶ", notLoaded: "未読み込み", reload: "読み込み直す",
      lastFile: "前回のファイルを読み込む ({name})", loadedAt: "{time} に読み込み",
      dropHintLoad: "ドロップしたファイルを読み込みます",
      autoLoading: "{path} を読み込んでいます…",
      autoFile: "file:// で開いているため自動では読み込みません。ブラウザは隣にあるファイルの読み取りを禁止しています。フォルダを http で配信すると（例: python3 -m http.server）開いたときに自動で読み込みます。",
      autoFail: "{path} を自動で読み込めませんでした（{msg}）。ファイルを選ぶかドロップしてください。",
      extraError: "このタブの表示でエラーが発生しました: {msg}",
      extraMissing: "タブ {id} のスクリプトが登録されていません（ブラウザのコンソールを確認してください）",
      verdict: { go: "✓ 出してよい", review: "△ 要レビュー", "no-go": "✕ 出さない" },
      pass: "✓ 満たす", fail: "✕ 満たさない",
      verdictTitle: "候補ごとの判定", verdictRule: "判定の順: 自動の基準を1つでも満たさないか「{reject}」が1件でもあれば出さない、悪化項目にレビューしていないものが残れば要レビュー、それ以外は出してよい。集計はフィルタにかかわらず全件。",
      failedCriteria: "満たさなかった基準", none: "なし", rejectedItems: "「{reject}」の項目: {n} 件",
      unreviewedItems: "未レビューの悪化項目: {n} / {total} 件",
      reviewRegressed: "悪化項目をレビュー ({n})", openCompare: "比較ビューで見る",
      criteriaTitle: "候補 × 基準", criterion: "基準", thresholdCol: "基準値", verdictRow: "判定",
      critAbsolute: "{metric}", critRelative: "{metric}の{a}からの悪化", critRegressions: "悪化した項目の数",
      addedAfter: "（結果を見た後に追加）",
      addedAfterNote: "「結果を見た後に追加」の基準は、記録を書き出した後で設定に加えたもの。判定には含めるが、報告では前からある基準と分けて書く。",
      critCritical: "重要カテゴリ（{cats}）で悪化した項目",
      worseOnly: "悪化がないことだけを確かめた。改善したかは判定していない。",
      worsePos: "（悪化）", worseNeg: "（改善）", nItems: "{n} 件",
      metricsTitle: "指標ごとの差と 95% 区間（参考）",
      metricsNote: "差は {b} − {a}（同じ id どうしの対応のある差）。95% 区間は差の平均 ± t × 標準偏差 / √n で、t は自由度 n − 1 の t 分布の両側 95% 点（n = 7 なら 2.447、n が大きいと 1.96 に近づく）。合計の指標は n 倍する。n が 2 未満では表示しない。各行の値が複数回の平均のとき、その中のばらつきは区間に入らない（区間は項目の間のばらつきだけを見る）。判定には使わず、差が誤差の範囲かどうかの目安にする。",
      ci: "95% 区間", containsZero: "0 を含む", czYes: "はい（誤差の範囲）", czNo: "いいえ",
      exportMd: "記録を Markdown で書き出す", exportJson: "記録を JSON で書き出す",
      backToVerdicts: "← 判定に戻る", reviewTitle: "{label} の悪化項目のレビュー",
      allRegressed: "悪化項目の一覧", yourLabel: "判定", unlabeled: "未レビュー",
      noRegressedItems: "この候補に悪化項目はありません",
      reportStale: "このレポートはビルド時の判定の記録に基づいています。その後この画面でレビューを変えたため、判定が記録と異なります: {diffs}。記録を書き出し直し、レポートを更新してください。",
      staleItem: "{label}（記録: {was} → 現在: {now}）",
      recordTitle: "リリース判定の記録", exportedAt: "書き出した日時", dataFiles: "データ",
      criteriaH: "判定基準", summaryH: "判定のまとめ", reviewsH: "悪化項目のレビュー",
      hypothesis: "仮説", experimentRecordTitle: "実験結果の記録",
      experimentRule: "判定の順: 自動の基準を1つでも満たさないか「{reject}」が1件でもあれば「{fail}」、悪化項目にレビューしていないものが残れば「{review}」、それ以外は「{pass}」。95% 区間は判定に使わない。集計はフィルタにかかわらず全件。",
      ciGuide: "区間の読み方", ciExcludesZero: "区間が0を含まない：差は誤差の範囲を超えている可能性が高い",
      ciIncludesZero: "区間が0を含む：差は誤差の範囲かもしれない",
      exportReport: "Markdown を書き出す", copyReport: "Markdown をコピー",
      copyCsv: "CSV をコピー", copyMd: "記録の Markdown をコピー", copyJson: "記録の JSON をコピー",
      copied: "✓ クリップボードにコピーしました",
      copyFallback: "クリップボードに書き込めませんでした。下の欄を選択してコピーしてください（全選択してから Ctrl+C / ⌘C）。",
      detailHint: "値・判定・理由を押すと、判断の根拠を表の下に表示します（もう一度押すか Esc で閉じる）。",
      close: "閉じる", verdictReasons: "判定の理由", result: "結果", aggregation: "集計方法",
      aggRate: "割合（true の件数 / 値のある件数）", pairedN: "n（両方に値がある同じ id の項目）", valueOf: "{label} の値",
      failMin: "下限 {v} を下回る", failMax: "上限 {v} を上回る", noValue: "両方に値がある項目がないため満たさない",
      whyFail: "満たさない理由", direction: "良い方向", higherBetter: "高いほど良い", lowerBetter: "低いほど良い",
      comparedValue: "基準値と比べる値", regCount: "悪化した項目 {n} 件（上限 {max} 件）",
      pending: "△ レビュー待ち", pendingCriteria: "レビュー待ちの基準", critUnaccepted: "人が確認して許容していない悪化した項目の数",
      unacceptedRule: "「{name}」は、レビューで「{reject}」以外のラベルを付けた項目を数えず、未レビューの項目は数える。未レビューの項目を数えたために上限を超えるときは、その基準をレビュー待ちとし、判定は「{review}」にする。",
      unacceptedCount: "人が確認して許容していない悪化した項目 {n} 件（上限 {max} 件）。悪化した {total} 件のうち、レビューで受け入れた {accepted} 件を除き、未レビューの {unreviewed} 件を数えた",
      unacceptedCountRejected: "人が確認して許容していない悪化した項目 {n} 件（上限 {max} 件）。悪化した {total} 件のうち、レビューで受け入れた {accepted} 件を除き、未レビューの {unreviewed} 件と「{reject}」の {rejected} 件を数えた",
      whyPending: "レビュー待ちの理由", pendingReason: "上限を超えるのは未レビューの項目を数えているため。レビューが済むまで判定は「{review}」になる。",
      countedItems: "数えた項目（未レビュー・「{reject}」）: {n} 件", notCountedItems: "数えない項目（レビューで受け入れた）: {n} 件",
      openInReview: "レビューで開く", goTo: "移動",
      foldedTitle: "{title}（{n} 字）"
    },
    en: {
      tabs: { overview: "Overview", compare: "Compare", review: "Review", table: "Table", release: "Release decision", experiment: "Experiment", report: "Report" },
      all: "All", search: "Search", searchPh: "Search id and text", shown: "Showing {n} of {total}",
      dataSide: "Dataset", mean: "mean", sum: "sum", perItem: "per item",
      items: "items", other: "Other", rows: "{n} rows", embedded: "embedded at build", loaded: "loaded in browser",
      countsTitle: "Count by {cat} × {stack}", countsTitleSingle: "Count by {cat}", histTitle: "Distribution of {label}",
      tableView: "Show as table", total: "Total", range: "Range", count: "Count",
      onlyIn: "ids in {label} but not in {other} ({n}, excluded from comparison): {ids}",
      candidate: "Candidate", candidateCol: "Candidate", candidateValue: "Candidate value",
      paired: "Compared cases", regressed: "Regressed", improved: "Improved", unchanged: "Unchanged",
      better: "better", worse: "worse", flat: "no change", rateGood: "✓", rateBad: "✗",
      regressedTitle: "Regressed cases", improvedTitle: "Improved cases",
      regressedSort: "Sorted {flip}by how much worse they got. Select a row to see {a} and {b} side by side.",
      improvedSort: "Sorted {flip}by how much better they got. Select a row to see {a} and {b} side by side.",
      flipFirst: "with {from}→{to} changes first, then ",
      compareSummary: "Compared {a} and {b} on {n} {unit} with the same id.",
      rulesUsed: "\"Regressed\" {unit} are those where {rules}; \"improved\" {unit} changed the other way.",
      rulesNone: "No metric is used to call a change better or worse, so all {unit} count as unchanged.",
      ruleFlip: "{label} changed from {good} to {bad}", ruleUp: "{label} rose by more than {t}", ruleDown: "{label} fell by more than {t}", ruleOr: ", or ",
      countOf: "{n} of {total} {unit} ({pct}%)", pairedNote: "{unit} in both {a} and {b}",
      noteFlip: "{label} {from}→{to}", noteOver: "{label} over {d}", noteAny: "any of: {list}", unchangedNote: "neither regressed nor improved",
      changeText: "{label}: {a} → {b}", changeDelta: " ({d})",
      reason: "Change", metric: "Metric", delta: "Δ ({b}−{a})", shared: "Same in {a} and {b}",
      noRegressions: "No regressed cases match the filters", noImprovements: "No improved cases match the filters",
      thresholdNote: "threshold for better or worse", noThreshold: "no threshold (not used to call a change better or worse)",
      infoNote: "reference only (not used to call a change better or worse)", rulesInfo: "{list} are shown for reference only and are not used to call a change better or worse.", listSep: ", ",
      reviewed: "Reviewed {n} / {total}", unreviewedOnly: "Unreviewed only", exportCsv: "Export CSV",
      dataChanged: "data changed", dataChangedHint: "This item's values changed after it was reviewed. Check it again; setting the label or editing the note clears this mark.",
      prev: "← Prev", next: "Next →", note: "Note", humanLabel: "Your judgment",
      keys: "← → move · 1–{n} judgment · N note · Esc leave note",
      storageOk: "Auto-saved in this browser", storageNo: "Cannot save in this browser. Export the CSV before closing.",
      noItems: "No items match the filters", groupBy: "Group by category", download: "Download shown rows as CSV",
      loadA: "Load data", loadSide: "Load {label} data", dropHint: "Dropped file replaces the {label} data",
      badExt: "{name}: unsupported extension (use .csv, .json or .jsonl)", badJson: "{where}: invalid JSON ({msg})",
      notObject: "{where}: a record must be a JSON object", notArray: "no array of records (set records_path)",
      recordsMissing: "records_path {path} not found", recordsPathOnlyJson: "records_path only applies to .json files",
      dupKey: "{where}: column {col} appears twice after flattening nested objects", noRecords: "no records",
      nestedValue: "data row {r}: column {col} holds a JSON array or object (only columns.text columns may)",
      unsafeId: "data row {r}: id {id} is beyond 2^53-1 and changes in the browser; store ids as strings",
      line: "line {n}", record: "record {n}", document: "document",
      loadErr: "Could not load {name}", missingCols: "configured column(s) {cols} not in header",
      dupId: "duplicate id {id} (data rows {r1} and {r2})", emptyId: "data row {r}: empty id",
      badValue: "data row {r}: {col}={v} is not a {kind}", number: "number", boolean: "boolean (true/false)",
      parseErr: "data row {r}: {msg}", reserved: "column(s) {cols} are reserved for review export",
      noData: "No data",
      loadTitle: "Choose or drop the data file",
      loadIntro: "This HTML contains no data. Served over http, it loads the file (CSV, JSON or JSONL) from its default location when it opens. Otherwise choose the file or drop it on the page. When the data changes, use Reload to pick it up.",
      expectedFile: "Expected file: {name}", requiredCols: "Required columns: {cols}", defaultPath: "Default location (relative to the HTML): {path}",
      chooseFile: "Choose file", notLoaded: "Not loaded", reload: "Reload",
      lastFile: "Load previous file ({name})", loadedAt: "loaded {time}",
      dropHintLoad: "Drop to load the file",
      autoLoading: "Loading {path}…",
      autoFile: "Opened from file://, so nothing is loaded automatically: browsers block reading neighbouring files. Serve the folder over http (for example python3 -m http.server) to load it on open.",
      autoFail: "Could not load {path} automatically ({msg}). Choose the file or drop it.",
      extraError: "This tab failed to render: {msg}",
      extraMissing: "The script for tab {id} did not register (see the browser console)",
      verdict: { go: "✓ Release", review: "△ Needs review", "no-go": "✕ Do not release" },
      pass: "✓ met", fail: "✕ not met",
      verdictTitle: "Verdict per candidate", verdictRule: "Order: any criterion not met or any \"{reject}\" item means do not release; otherwise any regressed item left unreviewed means needs review; otherwise release. Computed on all items, regardless of the filters.",
      failedCriteria: "Criteria not met", none: "none", rejectedItems: "\"{reject}\" items: {n}",
      unreviewedItems: "Unreviewed regressed items: {n} / {total}",
      reviewRegressed: "Review regressed items ({n})", openCompare: "Open in compare",
      criteriaTitle: "Candidates × criteria", criterion: "Criterion", thresholdCol: "Threshold", verdictRow: "Verdict",
      critAbsolute: "{metric}", critRelative: "{metric} worse than {a}", critRegressions: "Regressed items",
      addedAfter: " (added after the results)",
      addedAfterNote: "Criteria marked \"added after the results\" were added to the config after the record was exported. They count toward the verdict, but the report keeps them apart from the criteria written before.",
      critCritical: "Regressed items in critical categories ({cats})",
      worseOnly: "Only checked that nothing got worse; whether anything improved is not judged.",
      worsePos: " (worse)", worseNeg: " (better)", nItems: "{n}",
      metricsTitle: "Difference per metric with 95% interval (reference)",
      metricsNote: "The difference is {b} − {a} over items present in both (paired). The 95% interval is the mean paired difference ± t × standard deviation / √n, where t is the two-sided 95% point of the t distribution with n − 1 degrees of freedom (2.447 for n = 7, approaching 1.96 as n grows), multiplied by n for sum metrics; not shown when n < 2. When each row's value is itself an average of several runs, the spread within it is not in the interval (the interval only sees the spread between items). It is not used in the verdict; it hints whether a difference is within noise.",
      ci: "95% interval", containsZero: "Contains 0", czYes: "yes (within noise)", czNo: "no",
      exportMd: "Export record (Markdown)", exportJson: "Export record (JSON)",
      backToVerdicts: "← Back to verdicts", reviewTitle: "Review regressed items of {label}",
      allRegressed: "All regressed items", yourLabel: "Judgment", unlabeled: "unreviewed",
      noRegressedItems: "This candidate has no regressed items",
      reportStale: "This report is based on the record made at build time. Reviews changed on this page since then, so the verdicts differ from the record: {diffs}. Export the record again and update the report.",
      staleItem: "{label} (record: {was} → now: {now})",
      recordTitle: "Release decision record", exportedAt: "Exported at", dataFiles: "Data",
      criteriaH: "Criteria", summaryH: "Verdicts", reviewsH: "Reviews of regressed items",
      hypothesis: "Hypothesis", experimentRecordTitle: "Experiment record",
      experimentRule: "Order: any criterion not met or any \"{reject}\" item means \"{fail}\"; otherwise any regressed item left unreviewed means \"{review}\"; otherwise \"{pass}\". The 95% interval is not used in the verdict. Computed on all items, regardless of the filters.",
      ciGuide: "Reading the interval", ciExcludesZero: "Interval excludes 0: the difference is likely beyond noise",
      ciIncludesZero: "Interval includes 0: the difference may be within noise",
      exportReport: "Export Markdown", copyReport: "Copy Markdown",
      copyCsv: "Copy CSV", copyMd: "Copy record (Markdown)", copyJson: "Copy record (JSON)",
      copied: "✓ Copied to the clipboard",
      copyFallback: "Could not write to the clipboard. Select the text below and copy it (select all, then Ctrl+C / ⌘C).",
      detailHint: "Click a value, a verdict, or a reason to see what decided it below the table (click again or press Esc to close).",
      close: "Close", verdictReasons: "Why this verdict", result: "Result", aggregation: "Aggregation",
      aggRate: "rate (true count / items with a value)", pairedN: "n (items with the same id and a value on both sides)", valueOf: "{label} value",
      failMin: "below the minimum {v}", failMax: "above the maximum {v}", noValue: "not met: no item has a value on both sides",
      whyFail: "Why not met", direction: "Better when", higherBetter: "higher", lowerBetter: "lower",
      comparedValue: "Compared with the threshold", regCount: "{n} regressed items (at most {max})",
      pending: "△ awaiting review", pendingCriteria: "Criteria awaiting review", critUnaccepted: "Regressed items a reviewer has not accepted",
      unacceptedRule: "\"{name}\" does not count items reviewed with a label other than \"{reject}\", and counts unreviewed items. When it exceeds the maximum only because unreviewed items are counted, the criterion awaits review and the verdict is \"{review}\".",
      unacceptedCount: "{n} regressed items a reviewer has not accepted (at most {max}). Of {total} regressed items, {accepted} accepted in review are left out and {unreviewed} unreviewed are counted",
      unacceptedCountRejected: "{n} regressed items a reviewer has not accepted (at most {max}). Of {total} regressed items, {accepted} accepted in review are left out, and {unreviewed} unreviewed and {rejected} \"{reject}\" are counted",
      whyPending: "Why awaiting review", pendingReason: "The maximum is exceeded only because unreviewed items are counted. Until they are reviewed, the verdict is \"{review}\".",
      countedItems: "Counted items (unreviewed or \"{reject}\"): {n}", notCountedItems: "Items not counted (accepted in review): {n}",
      openInReview: "Open in review", goTo: "Go to",
      foldedTitle: "{title} ({n} chars)"
    }
  };

  // Strings that count items, rewritten with {unit} (config.item_label). They replace the
  // STRINGS entries only when item_label is set, so pages without it read as before.
  const ITEM_STRINGS = {
    ja: {
      shown: "表示 {n} / {total} {unit}", items: "{unit}", perItem: "1{unit}あたり",
      countsTitle: "{cat} × {stack} の{unit}の数", countsTitleSingle: "{cat} 別の{unit}の数", count: "{unit}の数",
      onlyIn: "{label} にだけあり {other} にない id（{n} {unit}、比較から除外）: {ids}",
      paired: "比較した{unit}の数", regressedTitle: "悪化した{unit}", improvedTitle: "改善した{unit}",
      noRegressions: "条件に合う悪化した{unit}はありません", noImprovements: "条件に合う改善した{unit}はありません",
      reviewed: "レビュー済み {n} / {total} {unit}", noItems: "条件に合う{unit}はありません",
      verdictRule: "判定の順: 自動の基準を1つでも満たさないか「{reject}」が1件でもあれば出さない、悪化した{unit}にレビューしていないものが残れば要レビュー、それ以外は出してよい。集計はフィルタにかかわらず全件。",
      experimentRule: "判定の順: 自動の基準を1つでも満たさないか「{reject}」が1件でもあれば「{fail}」、悪化した{unit}にレビューしていないものが残れば「{review}」、それ以外は「{pass}」。95% 区間は判定に使わない。集計はフィルタにかかわらず全件。",
      rejectedItems: "「{reject}」の{unit}: {n}", unreviewedItems: "未レビューの悪化した{unit}: {n} / {total}",
      reviewRegressed: "悪化した{unit}をレビュー ({n})", critRegressions: "悪化した{unit}の数",
      critCritical: "重要カテゴリ（{cats}）で悪化した{unit}", nItems: "{n} {unit}",
      reviewTitle: "{label} の悪化した{unit}のレビュー", allRegressed: "悪化した{unit}の一覧",
      noRegressedItems: "この候補に悪化した{unit}はありません", reviewsH: "悪化した{unit}のレビュー",
      pairedN: "n（両方に値がある同じ id の{unit}）", regCount: "悪化した{unit} {n}（上限 {max}）",
      critUnaccepted: "人が確認して許容していない悪化した{unit}の数",
      unacceptedRule: "「{name}」は、レビューで「{reject}」以外のラベルを付けた{unit}を数えず、未レビューの{unit}は数える。未レビューの{unit}を数えたために上限を超えるときは、その基準をレビュー待ちとし、判定は「{review}」にする。",
      unacceptedCount: "人が確認して許容していない悪化した{unit} {n}（上限 {max}）。悪化した {total} {unit}のうち、レビューで受け入れた {accepted} {unit}を除き、未レビューの {unreviewed} {unit}を数えた",
      unacceptedCountRejected: "人が確認して許容していない悪化した{unit} {n}（上限 {max}）。悪化した {total} {unit}のうち、レビューで受け入れた {accepted} {unit}を除き、未レビューの {unreviewed} {unit}と「{reject}」の {rejected} {unit}を数えた",
      pendingReason: "上限を超えるのは未レビューの{unit}を数えているため。レビューが済むまで判定は「{review}」になる。",
      countedItems: "数えた{unit}（未レビュー・「{reject}」）: {n}", notCountedItems: "数えない{unit}（レビューで受け入れた）: {n}",
      compareSummary: "{a} と {b} を、同じ{unit}どうし（{n} {unit}）で比べた。",
      rulesUsed: "{rules}{unit}を「悪化」、反対に良くなった{unit}を「改善」とした。",
      pairedNote: "{a} と {b} の両方にある{unit}"
    },
    en: {
      shown: "Showing {n} of {total} {unit}", items: "{unit}",
      countsTitle: "Number of {unit} by {cat} × {stack}", countsTitleSingle: "Number of {unit} by {cat}", count: "Number of {unit}",
      onlyIn: "ids in {label} but not in {other} ({n} {unit}, excluded from comparison): {ids}",
      paired: "Compared {unit}", regressedTitle: "Regressed {unit}", improvedTitle: "Improved {unit}",
      noRegressions: "No regressed {unit} match the filters", noImprovements: "No improved {unit} match the filters",
      reviewed: "Reviewed {n} / {total} {unit}", noItems: "No {unit} match the filters",
      verdictRule: "Order: any criterion not met or any \"{reject}\" item means do not release; otherwise any regressed {unit} left unreviewed means needs review; otherwise release. Computed on all items, regardless of the filters.",
      experimentRule: "Order: any criterion not met or any \"{reject}\" item means \"{fail}\"; otherwise any regressed {unit} left unreviewed means \"{review}\"; otherwise \"{pass}\". The 95% interval is not used in the verdict. Computed on all items, regardless of the filters.",
      rejectedItems: "\"{reject}\" {unit}: {n}", unreviewedItems: "Unreviewed regressed {unit}: {n} / {total}",
      reviewRegressed: "Review regressed {unit} ({n})", critRegressions: "Regressed {unit}",
      critCritical: "Regressed {unit} in critical categories ({cats})", nItems: "{n} {unit}",
      reviewTitle: "Review regressed {unit} of {label}", allRegressed: "All regressed {unit}",
      noRegressedItems: "This candidate has no regressed {unit}", reviewsH: "Reviews of regressed {unit}",
      pairedN: "n ({unit} with the same id and a value on both sides)", regCount: "{n} regressed {unit} (at most {max})",
      critUnaccepted: "Regressed {unit} a reviewer has not accepted",
      unacceptedRule: "\"{name}\" does not count {unit} reviewed with a label other than \"{reject}\", and counts unreviewed {unit}. When it exceeds the maximum only because unreviewed {unit} are counted, the criterion awaits review and the verdict is \"{review}\".",
      unacceptedCount: "{n} regressed {unit} a reviewer has not accepted (at most {max}). Of {total} regressed {unit}, {accepted} accepted in review are left out and {unreviewed} unreviewed are counted",
      unacceptedCountRejected: "{n} regressed {unit} a reviewer has not accepted (at most {max}). Of {total} regressed {unit}, {accepted} accepted in review are left out, and {unreviewed} unreviewed and {rejected} \"{reject}\" are counted",
      pendingReason: "The maximum is exceeded only because unreviewed {unit} are counted. Until they are reviewed, the verdict is \"{review}\".",
      countedItems: "Counted {unit} (unreviewed or \"{reject}\"): {n}", notCountedItems: "{unit} not counted (accepted in review): {n}"
    }
  };

  // Must match TRUE_VALUES / FALSE_VALUES in build.py.
  const TRUE_VALUES = new Set(["true", "1", "yes", "y", "t"]);
  const FALSE_VALUES = new Set(["false", "0", "no", "n", "f"]);
  const REVIEW_EXPORT_COLUMNS = ["human_label", "human_note"];
  // Must match MAX_SAFE_INTEGER in build.py.
  const MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;
  const SERIES_SLOTS = 8;
  const STORAGE_PREFIX = "eval-review:v1:";

  const payload = JSON.parse(document.getElementById("page-data").textContent);
  const cfg = payload.config;
  const LANG = STRINGS[cfg.lang] ? cfg.lang : "ja";
  // What one row is (config.item_label, plural in English), or the generic word.
  const itemLabel = cfg.item_label || null;
  const UNIT = itemLabel || (LANG === "en" ? "items" : "件");
  // {unit} is filled in once here, so every string reads with item_label wherever it is used.
  const T = Object.fromEntries(Object.entries(Object.assign({}, STRINGS[LANG], itemLabel ? ITEM_STRINGS[LANG] : {}))
    .map(([k, v]) => [k, typeof v === "string" ? v.split("{unit}").join(UNIT) : v]));
  const cols = cfg.columns;
  const metrics = cols.metrics;
  // Side keys: "a" is data.csv (the current model when comparing), "c1", "c2", ... are
  // data.candidates in config order. Must match build() in build.py.
  const candidates = cfg.data.candidates || [];
  const CAND_SIDES = candidates.map((_, i) => "c" + (i + 1));
  const SIDES = ["a"].concat(CAND_SIDES);
  const hasB = CAND_SIDES.length > 0;
  // "load" mode: the HTML carries no rows. Served over http(s) it fetches the CSV(s) from
  // the default paths (relative to the HTML); otherwise the user picks them on open.
  const loadMode = cfg.data.mode === "load";
  const expectedName = { a: cfg.data.csv };
  const sideLabel = { a: cfg.data.label_a || "A" };
  candidates.forEach((c, i) => { expectedName[CAND_SIDES[i]] = c.file; sideLabel[CAND_SIDES[i]] = c.label; });
  const defaultPath = payload.default_paths || {};
  const canFetch = location.protocol === "http:" || location.protocol === "https:";
  // config.release or config.experiment (a config has at most one): verdicts on the
  // candidates, their record and the report. Must match DECISIONS in build.py.
  const DECISIONS = {
    release: { kind: "eval-review/release-record", verdicts: ["go", "review", "no-go"] },
    experiment: { kind: "eval-review/experiment-record", verdicts: ["pass", "review", "fail"] }
  };
  const decisionTab = cfg.tabs.find((t) => Object.prototype.hasOwnProperty.call(DECISIONS, t)) || null;
  const decision = decisionTab ? cfg[decisionTab] : null;
  const isExperiment = decisionTab === "experiment";
  const decisionRecord = payload.record || null;
  // Indexes of the criteria added to the config after the record was exported, that is,
  // after the results were seen. The key must match ADDED_KEY in build.py.
  const ADDED_KEY = "added_after_results";
  const addedAfter = new Set(decisionRecord ? decisionRecord[ADDED_KEY] : []);
  function perSide(make) { return Object.fromEntries(SIDES.map((s) => [s, make(s)])); }
  const stackCol = cols.status || cols.verdict || null;
  const numFmtCache = {};
  const canPick = typeof window.showOpenFilePicker === "function";
  // Tabs written for one page (config.extra_tabs); their scripts run after this file
  // and call EvalReview.registerTab().
  const extraTabs = cfg.extra_tabs || [];
  const extraTitle = new Map(extraTabs.map((t) => [t.id, t.title]));
  const extraRenderers = new Map();
  const allTabs = cfg.tabs.concat(extraTabs.map((t) => t.id));

  const state = {
    data: perSide((s) => (payload.tables ? withOrigin(payload.tables[s], "embedded") : null)),
    // File handles from showOpenFilePicker: `handles` were picked or granted in this page
    // session, `saved` were restored from IndexedDB and still need a permission prompt.
    handles: perSide(() => null),
    saved: perSide(() => null),
    // Sides whose current data came from fetching the default path; Reload re-fetches them.
    fetched: perSide(() => false),
    autoLoading: false,
    // Why the default CSV was not loaded on open, shown in the load panel.
    autoNotes: [],
    tab: cfg.tabs[0],
    side: "a",
    filters: { category: "", status: "", verdict: "", q: "" },
    compareView: "regressed",
    // The candidate the compare tab (and an extra tab's rowsB / pairs) shows against A.
    compareSide: CAND_SIDES[0] || null,
    selectedId: null,
    // Release tab: the candidate whose regressed items are being reviewed (null shows the
    // verdicts), the item shown, and per-candidate review labels.
    decisionSide: null,
    decisionCursor: null,
    decisionUnreviewedOnly: false,
    // The open detail panel on the verdicts view: { side, kind, index? } with kind
    // "criterion" (index into the criteria), "verdict", "rejected" or "unreviewed".
    decisionDetail: null,
    decisionReview: {},
    decisionStorageKey: {},
    decisionStorageOk: false,
    review: {},
    storageKey: null,
    storageOk: false,
    reviewCursor: null,
    unreviewedOnly: false,
    groupBy: false,
    colorIndex: new Map(),
    errors: [],
    table: null
  };

  // ---------- small helpers ----------

  // Embedded JSON rows keep their JSON scalars; normalize them as a loaded file would be.
  function withOrigin(table, origin) {
    return { name: table.name, headers: table.headers, rows: table.rows.map(normalizeRow), origin: origin, loadedAt: null };
  }

  // A JSON scalar as the CSV text it stands for, so metrics, filters and ids behave as with
  // a CSV. Arrays and objects stay as values. Must match cell_text() in build.py.
  function toCell(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    return v;
  }

  function normalizeRow(row) {
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, toCell(v)]));
  }

  function isObject(v) { return v !== null && typeof v === "object"; }
  function isPlainObject(v) { return isObject(v) && !Array.isArray(v); }

  // One-line text for search, comparison, the table and CSV export.
  function cellText(v) { return isObject(v) ? JSON.stringify(v) : (v ?? ""); }

  // Multi-line text for the review and compare detail views.
  function prettyText(v) { return isObject(v) ? JSON.stringify(v, null, 2) : (v ?? ""); }

  // True while load mode still waits for a CSV on some side.
  function needsLoad() {
    return loadMode && SIDES.some((s) => !state.data[s]);
  }

  function fmt(template, vars) {
    return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    setAttrs(node, attrs);
    appendChildren(node, children);
    return node;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    setAttrs(node, attrs);
    appendChildren(node, children);
    return node;
  }

  function setAttrs(node, attrs) {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "text") node.textContent = String(v);
      else if (k === "class") node.setAttribute("class", v);
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : String(v));
    }
  }

  function appendChildren(node, children) {
    if (children === null || children === undefined) return;
    for (const c of [].concat(children)) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    }
  }

  function parseBool(raw) {
    const v = String(raw ?? "").trim().toLowerCase();
    if (TRUE_VALUES.has(v)) return true;
    if (FALSE_VALUES.has(v)) return false;
    return null;
  }

  function parseNum(raw) {
    const v = String(raw ?? "").trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function metricValue(row, m) {
    if (!row) return null;
    if (m.aggregate === "rate") {
      const b = parseBool(row[m.column]);
      return b === null ? null : (b ? 1 : 0);
    }
    return parseNum(row[m.column]);
  }

  function numberFormat(maxFrac, sig) {
    const key = maxFrac + ":" + sig;
    if (!numFmtCache[key]) {
      numFmtCache[key] = new Intl.NumberFormat(cfg.lang, sig ? { maximumSignificantDigits: sig } : { maximumFractionDigits: maxFrac });
    }
    return numFmtCache[key];
  }

  function fmtNum(v) {
    if (v === null || !Number.isFinite(v)) return "–";
    const a = Math.abs(v);
    if (a >= 100) return numberFormat(0).format(v);
    if (a >= 10) return numberFormat(1).format(v);
    if (a >= 1) return numberFormat(2).format(v);
    return numberFormat(0, 3).format(v);
  }

  // Rates and "format": "percent" means hold fractions (0.85) shown as % (85%), and their
  // differences and thresholds as pt. Must match is_fraction() in build.py.
  function isPercent(m) { return m.aggregate === "rate" || m.format === "percent"; }

  // The metric's label with how it is aggregated, e.g. "Latency (mean)".
  function metricName(m) {
    return m.label + (m.aggregate === "mean" ? " (" + T.mean + ")" : m.aggregate === "sum" ? " (" + T.sum + ")" : "");
  }

  // better "none": shown for reference, never used to classify or judge. Must match build.py.
  function isInfo(m) { return m.better === "none"; }

  function fmtMetric(v, m) {
    if (v === null || !Number.isFinite(v)) return "–";
    if (isPercent(m)) return numberFormat(1).format(v * 100) + "%";
    return fmtNum(v) + (m.unit ? " " + m.unit : "");
  }

  // An unsigned amount of change in the metric's unit, as for a threshold.
  function fmtAmount(v, m) {
    if (isPercent(m)) return numberFormat(1).format(v * 100) + "pt";
    return fmtNum(v) + (m.unit ? " " + m.unit : "");
  }

  function fmtDelta(d, m) {
    const sign = d > 0 ? "+" : d < 0 ? "−" : "±";
    return sign + fmtAmount(Math.abs(d), m);
  }

  function mean(xs) { return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null; }
  function sum(xs) { return xs.reduce((s, x) => s + x, 0); }
  function quantile(xs, q) {
    if (!xs.length) return null;
    const s = xs.slice().sort((x, y) => x - y);
    const pos = (s.length - 1) * q;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    return s[lo] + (s[hi] - s[lo]) * (pos - lo);
  }

  function aggregate(values, m) {
    if (!values.length) return null;
    return m.aggregate === "sum" ? sum(values) : mean(values);
  }

  function niceStep(span, count) {
    if (span <= 0) return 1;
    const raw = span / count;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const err = raw / pow;
    return pow * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
  }

  // Rough text width for layout decisions (CJK glyphs are about 1em wide).
  function textWidth(s, px) {
    let w = 0;
    for (const ch of String(s)) w += ch.codePointAt(0) > 0x2e80 ? px : px * 0.6;
    return w;
  }

  function truncateToWidth(s, maxW, px) {
    if (textWidth(s, px) <= maxW) return s;
    let out = "";
    for (const ch of String(s)) {
      if (textWidth(out + ch + "…", px) > maxW) break;
      out += ch;
    }
    return out + "…";
  }

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function cssToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Ink or white for a label set inside a filled mark, by the fill's luminance.
  function inkFor(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return "#ffffff";
    const n = parseInt(m[1], 16);
    const lin = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    return lum > 0.3 ? "#0b0f14" : "#ffffff";
  }

  // ---------- data model ----------

  function rowsOf(side) { return state.data[side] ? state.data[side].rows : []; }

  function orderedValues(column) {
    const preferred = (cfg.order && cfg.order[column]) || [];
    const seen = new Set();
    const out = [];
    const present = new Set();
    for (const side of SIDES) for (const r of rowsOf(side)) present.add(r[column]);
    for (const v of preferred) if (present.has(v) && !seen.has(v)) { seen.add(v); out.push(v); }
    for (const side of SIDES) {
      for (const r of rowsOf(side)) {
        const v = r[column];
        if (v !== undefined && v !== "" && !seen.has(v)) { seen.add(v); out.push(v); }
      }
    }
    return out;
  }

  // Color follows the entity: slots are fixed from the full dataset, never from the filtered slice.
  function computeColors() {
    state.colorIndex = new Map();
    if (!stackCol) return;
    const values = orderedValues(stackCol);
    const overflow = values.length > SERIES_SLOTS;
    values.forEach((v, i) => state.colorIndex.set(v, overflow && i >= SERIES_SLOTS - 1 ? "other" : i));
  }

  function seriesKey(v) {
    const idx = state.colorIndex.get(v);
    return idx === "other" ? T.other : v;
  }

  function seriesVar(v) {
    const idx = state.colorIndex.get(v);
    return idx === undefined || idx === "other" ? "--series-other" : "--series-" + (idx + 1);
  }

  function hayOf(row) {
    if (!row) return "";
    const parts = [row[cols.id]];
    for (const c of cols.text) parts.push(cellText(row[c]));
    for (const k of ["category", "status", "verdict"]) if (cols[k]) parts.push(row[cols[k]]);
    return parts.join("\n").toLowerCase();
  }

  function dimsMatch(row) {
    const f = state.filters;
    for (const k of ["category", "status", "verdict"]) {
      if (cols[k] && f[k] && row[cols[k]] !== f[k]) return false;
    }
    return true;
  }

  function queryMatch(row) {
    const q = state.filters.q.trim().toLowerCase();
    return !q || hayOf(row).includes(q);
  }

  function filteredRows(side) {
    return rowsOf(side).filter((r) => dimsMatch(r) && queryMatch(r));
  }

  function idMismatch(side) {
    if (!state.data.a || !state.data[side]) return { onlyA: [], onlyB: [] };
    const idsA = rowsOf("a").map((r) => r[cols.id]);
    const idsB = rowsOf(side).map((r) => r[cols.id]);
    const setA = new Set(idsA), setB = new Set(idsB);
    return { onlyA: idsA.filter((i) => !setB.has(i)), onlyB: idsB.filter((i) => !setA.has(i)) };
  }

  // A paired with one candidate side by id. Pairs keep the key `b` for the candidate row,
  // which extra tabs read as ctx.pairs. Must match pair_rows() in build.py.
  function pairs(side) {
    const byId = new Map(rowsOf(side).map((r) => [r[cols.id], r]));
    const out = [];
    for (const a of rowsOf("a")) {
      const b = byId.get(a[cols.id]);
      if (b) out.push({ id: a[cols.id], a: a, b: b });
    }
    return out;
  }

  function filteredPairs(side) {
    return pairs(side).filter((p) => dimsMatch(p.a) && (queryMatch(p.a) || queryMatch(p.b)));
  }

  // Per metric: positive "worse" means B is worse than A in the metric's own direction.
  function classifyPair(p) {
    const changes = [];
    for (const m of metrics) {
      if (isInfo(m)) continue; // includes rate flips
      const va = metricValue(p.a, m), vb = metricValue(p.b, m);
      if (va === null || vb === null) continue;
      if (m.aggregate === "rate") {
        const good = m.better === "higher" ? 1 : 0;
        if (va === good && vb !== good) changes.push({ m: m, kind: "regressed", flip: true, score: Infinity, va: va, vb: vb });
        else if (va !== good && vb === good) changes.push({ m: m, kind: "improved", flip: true, score: Infinity, va: va, vb: vb });
        continue;
      }
      if (m.regression_threshold === undefined || m.regression_threshold === null) continue;
      const worse = m.better === "lower" ? vb - va : va - vb;
      const scale = m.regression_threshold || Math.abs(va) || 1;
      if (worse > m.regression_threshold) changes.push({ m: m, kind: "regressed", flip: false, score: worse / scale, va: va, vb: vb });
      else if (-worse > m.regression_threshold) changes.push({ m: m, kind: "improved", flip: false, score: -worse / scale, va: va, vb: vb });
    }
    const reg = changes.filter((c) => c.kind === "regressed");
    const imp = changes.filter((c) => c.kind === "improved");
    const kind = reg.length ? "regressed" : imp.length ? "improved" : "unchanged";
    const relevant = kind === "regressed" ? reg : imp;
    return {
      kind: kind,
      changes: relevant,
      flip: relevant.some((c) => c.flip),
      score: Math.max(0, ...relevant.filter((c) => !c.flip).map((c) => c.score))
    };
  }

  // Must match configured_columns() in build.py.
  function requiredColumns() {
    const needed = [cols.id, ...cols.text, ...metrics.map((m) => m.column)];
    for (const k of ["category", "status", "verdict"]) if (cols[k]) needed.push(cols[k]);
    return [...new Set(needed)];
  }

  function validateTable(headers, rows) {
    const errors = [];
    const missing = requiredColumns().filter((c) => !headers.includes(c));
    if (missing.length) errors.push(fmt(T.missingCols, { cols: JSON.stringify(missing) }));
    if (cfg.tabs.includes("review")) {
      const clash = REVIEW_EXPORT_COLUMNS.filter((c) => headers.includes(c));
      if (clash.length) errors.push(fmt(T.reserved, { cols: JSON.stringify(clash) }));
    }
    if (errors.length) return errors;
    // Only text columns may hold JSON arrays / objects; the others are compared and counted.
    const scalarCols = requiredColumns().filter((c) => !cols.text.includes(c));
    rows.forEach((r, i) => {
      for (const c of scalarCols) if (isObject(r[c])) errors.push(fmt(T.nestedValue, { r: i + 1, col: c }));
    });
    if (errors.length) return errors;
    const seen = new Map();
    rows.forEach((r, i) => {
      const id = String(r[cols.id] ?? "").trim();
      if (!id) errors.push(fmt(T.emptyId, { r: i + 1 }));
      else if (seen.has(id)) errors.push(fmt(T.dupId, { id: id, r1: seen.get(id), r2: i + 1 }));
      else seen.set(id, i + 1);
      for (const m of metrics) {
        const raw = String(r[m.column] ?? "").trim();
        if (!raw) continue;
        const ok = m.aggregate === "rate" ? parseBool(raw) !== null : parseNum(raw) !== null;
        if (!ok) errors.push(fmt(T.badValue, { r: i + 1, col: m.column, v: raw, kind: m.aggregate === "rate" ? T.boolean : T.number }));
      }
    });
    return errors;
  }

  // ---------- review storage ----------

  function initReview() {
    state.review = {};
    state.reviewCursor = null;
    const a = state.data.a;
    if (!a) { state.storageKey = null; state.storageOk = false; return; }
    // Both modes key by title + id set, so labels survive a rebuild or reload with an added
    // column or changed values; each review keeps a fingerprint of its row (fp) instead,
    // and an item whose row changed since is marked.
    state.storageKey = STORAGE_PREFIX + "ids:" + fnv1a(JSON.stringify([cfg.title, a.rows.map((r) => r[cols.id]).sort()]));
    try {
      const raw = window.localStorage.getItem(state.storageKey);
      if (raw) state.review = JSON.parse(raw) || {};
      state.storageOk = true;
    } catch (e) {
      state.storageOk = false;
    }
  }

  function saveReview() {
    if (!state.storageOk) return;
    try {
      window.localStorage.setItem(state.storageKey, JSON.stringify(state.review));
    } catch (e) {
      state.storageOk = false;
      renderContent();
    }
  }

  function reviewOf(id) { return state.review[id] || { label: "", note: "" }; }

  // The configured columns of a row, which a review of the row was made against.
  function rowFingerprint(row) {
    return fnv1a(JSON.stringify(requiredColumns().map((c) => cellText(row[c]))));
  }

  // True when a stored review has a fingerprint and the data has changed since.
  function reviewIsStale(rv, fp) { return Boolean(rv.fp && (rv.label || rv.note) && rv.fp !== fp); }

  function staleBadge() {
    return el("span", { class: "badge stale", title: T.dataChangedHint, text: "⚠ " + T.dataChanged });
  }

  function setReview(id, patch) {
    const row = state.data.a.rows.find((r) => r[cols.id] === id);
    const next = Object.assign({}, reviewOf(id), patch, row ? { fp: rowFingerprint(row) } : {});
    if (!next.label && !next.note) delete state.review[id];
    else state.review[id] = next;
    saveReview();
  }

  // ---------- tooltip ----------

  const tip = document.getElementById("tooltip");

  function showTip(nodes, x, y) {
    tip.replaceChildren(...nodes);
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x + 12, top = y + 12;
    if (left + r.width > window.innerWidth - 8) left = Math.max(8, x - r.width - 12);
    if (top + r.height > window.innerHeight - 8) top = Math.max(8, y - r.height - 12);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function hideTip() { tip.hidden = true; }

  function bindTip(node, build) {
    node.addEventListener("pointermove", (e) => showTip(build(), e.clientX, e.clientY));
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", () => {
      const r = node.getBoundingClientRect();
      showTip(build(), r.left + r.width / 2, r.top + r.height / 2);
    });
    node.addEventListener("blur", hideTip);
  }

  function tipContent(value, rows) {
    const out = [el("div", { class: "tt-value", text: value })];
    for (const row of rows) {
      out.push(el("div", { class: "tt-row" }, [
        row.color ? el("span", { class: "tt-key", style: "background:var(" + row.color + ")" }) : null,
        el("span", { class: "tt-name", text: row.text })
      ]));
    }
    return out;
  }

  // ---------- charts ----------

  function legend(values, colorOf = seriesVar) {
    return el("ul", { class: "legend" }, values.map((v) =>
      el("li", null, [el("span", { class: "swatch", style: "background:var(" + colorOf(v) + ")" }), v])));
  }

  // Path for a horizontal bar segment: square at the left, 4px rounded right end when `roundEnd`.
  function hBarPath(x, y, w, h, roundEnd) {
    const r = roundEnd ? Math.min(4, w / 2, h / 2) : 0;
    return "M" + x + "," + y + "H" + (x + w - r) + (r ? "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) : "") +
      "V" + (y + h - r) + (r ? "Q" + (x + w) + "," + (y + h) + " " + (x + w - r) + "," + (y + h) : "") + "H" + x + "Z";
  }

  // Path for a vertical column: square at the baseline, 4px rounded top.
  function vBarPath(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return "M" + x + "," + (y + h) + "V" + (y + r) + "Q" + x + "," + y + " " + (x + r) + "," + y +
      "H" + (x + w - r) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) + "V" + (y + h) + "Z";
  }

  // Horizontal bars per category. With `single`, segValues is ["_"] and slot 1 colors every bar.
  // `colorOf` maps a segment value to a CSS color variable name.
  function stackedBars(container, categories, segValues, counts, single, colorOf = seriesVar) {
    const width = Math.max(280, container.clientWidth || 600);
    const longest = Math.max(...categories.map((c) => textWidth(c, 12)), 40);
    const labelW = Math.min(longest + 8, width * 0.32);
    const x0 = labelW + 8, x1 = width - 44;
    const rowH = 30, barH = 18, top = 20;
    const height = top + categories.length * rowH + 4;
    const totals = categories.map((c) => segValues.reduce((s, v) => s + (counts.get(c + "\u0000" + v) || 0), 0));
    const maxTotal = Math.max(1, ...totals);
    const step = niceStep(maxTotal, Math.max(2, Math.floor((x1 - x0) / 70)));
    const axisMax = Math.ceil(maxTotal / step) * step;
    const sx = (v) => x0 + (v / axisMax) * (x1 - x0);
    const svg = svgEl("svg", { class: "chart", viewBox: "0 0 " + width + " " + height, width: width, height: height, role: "img" });
    for (let t = 0; t <= axisMax + 1e-9; t += step) {
      svg.appendChild(svgEl("line", { class: t === 0 ? "baseline" : "gridline", x1: sx(t), x2: sx(t), y1: top - 4, y2: height - 4 }));
      svg.appendChild(svgEl("text", { x: sx(t), y: top - 8, "text-anchor": "middle", text: fmtNum(t) }));
    }
    const hexCache = {};
    categories.forEach((cat, i) => {
      const y = top + i * rowH + (rowH - barH) / 2;
      svg.appendChild(svgEl("text", { x: labelW, y: y + barH / 2 + 4, "text-anchor": "end", text: truncateToWidth(cat, labelW, 12), style: "font-size:12px" },
        [svgEl("title", { text: cat })]));
      let acc = 0;
      const present = segValues.filter((v) => counts.get(cat + "\u0000" + v));
      present.forEach((v, j) => {
        const n = counts.get(cat + "\u0000" + v);
        const isLast = j === present.length - 1;
        const xa = sx(acc), full = sx(acc + n) - xa;
        const w = Math.max(1, isLast ? full : full - 2);
        acc += n;
        const varName = single ? "--series-1" : colorOf(v);
        const g = svgEl("g", { class: "hov", tabindex: 0, "aria-label": cat + (single ? "" : " · " + v) + ": " + n });
        g.appendChild(svgEl("rect", { class: "hit", x: xa, y: top + i * rowH, width: Math.max(full, 6), height: rowH }));
        g.appendChild(svgEl("path", { class: "mark", d: hBarPath(xa, y, w, barH, isLast), style: "fill:var(" + varName + ")" }));
        const label = String(n);
        if (!single && w >= textWidth(label, 11) + 12) {
          hexCache[varName] = hexCache[varName] || cssToken(varName);
          g.appendChild(svgEl("text", { class: "in-label", x: xa + w / 2, y: y + barH / 2 + 4, "text-anchor": "middle", text: label, style: "fill:" + inkFor(hexCache[varName]) }));
        }
        bindTip(g, () => single
          ? tipContent(n + " " + T.items, [{ text: cat }])
          : tipContent(n + " " + T.items + " (" + Math.round((n / totals[i]) * 100) + "%)", [{ text: cat }, { text: v, color: varName }]));
        svg.appendChild(g);
      });
      svg.appendChild(svgEl("text", { class: "value-label", x: sx(totals[i]) + 6, y: y + barH / 2 + 4, text: String(totals[i]) }));
    });
    return svg;
  }

  function singleBars(container, categories, counts) {
    const keyed = new Map(categories.map((c) => [c + "\u0000_", counts.get(c) || 0]));
    return stackedBars(container, categories, ["_"], keyed, true);
  }

  function histogram(container, values, m) {
    const width = Math.max(280, container.clientWidth || 600);
    const height = 220, left = 44, right = 12, top = 16, bottom = 34;
    const lo = Math.min(...values), hi = Math.max(...values);
    const step = niceStep(hi - lo || Math.abs(hi) || 1, 12);
    const start = Math.floor(lo / step) * step;
    const nBins = Math.floor((hi - start) / step) + 1;
    const bins = Array.from({ length: nBins }, (_, i) => ({ lo: start + i * step, hi: start + (i + 1) * step, n: 0 }));
    for (const v of values) bins[Math.min(nBins - 1, Math.floor((v - start) / step))].n++;
    const maxN = Math.max(1, ...bins.map((b) => b.n));
    const yStep = niceStep(maxN, 4);
    const yMax = Math.ceil(maxN / yStep) * yStep;
    const plotW = width - left - right, plotH = height - top - bottom;
    const slot = plotW / nBins;
    const barW = Math.max(2, Math.min(24, slot - 2));
    const sy = (n) => top + plotH - (n / yMax) * plotH;
    const svg = svgEl("svg", { class: "chart", viewBox: "0 0 " + width + " " + height, width: width, height: height, role: "img" });
    for (let t = 0; t <= yMax + 1e-9; t += yStep) {
      svg.appendChild(svgEl("line", { class: t === 0 ? "baseline" : "gridline", x1: left, x2: width - right, y1: sy(t), y2: sy(t) }));
      svg.appendChild(svgEl("text", { x: left - 6, y: sy(t) + 4, "text-anchor": "end", text: fmtNum(t) }));
    }
    // Axis values without the unit, which is written once at the end; percent stays %.
    const axisNum = (v) => (isPercent(m) ? fmtMetric(v, m) : fmtNum(v));
    const edgeLabelW = Math.max(...bins.map((b) => textWidth(axisNum(b.lo), 11))) + 10;
    const every = Math.max(1, Math.ceil(edgeLabelW / slot));
    for (let i = 0; i <= nBins; i += every) {
      svg.appendChild(svgEl("text", { x: left + i * slot, y: height - bottom + 16, "text-anchor": "middle", text: axisNum(start + i * step) }));
    }
    if (m.unit) svg.appendChild(svgEl("text", { x: width - right, y: height - 4, "text-anchor": "end", text: m.unit }));
    const tallest = bins.reduce((best, b) => (b.n > best.n ? b : best), bins[0]);
    bins.forEach((b, i) => {
      const x = left + i * slot + (slot - barW) / 2;
      const g = svgEl("g", { class: "hov", tabindex: 0, "aria-label": axisNum(b.lo) + "–" + axisNum(b.hi) + ": " + b.n });
      g.appendChild(svgEl("rect", { class: "hit", x: left + i * slot, y: top, width: slot, height: plotH }));
      if (b.n > 0) g.appendChild(svgEl("path", { class: "mark", d: vBarPath(x, sy(b.n), barW, sy(0) - sy(b.n)), style: "fill:var(--series-1)" }));
      bindTip(g, () => tipContent(b.n + " " + T.items, [{ text: T.range + ": " + fmtMetric(b.lo, m) + " – " + fmtMetric(b.hi, m) }]));
      svg.appendChild(g);
      if (b === tallest && b.n > 0) svg.appendChild(svgEl("text", { class: "value-label", x: x + barW / 2, y: sy(b.n) - 4, "text-anchor": "middle", text: String(b.n) }));
    });
    return { svg: svg, bins: bins };
  }

  // A cell that reads as a number: digits with optional sign, grouping commas, decimals and %.
  const NUMBER_CELL = /^[+\-−±]?(?:\d{1,3}(?:,\d{3})+|\d*)(?:\.\d+)?(?:e[+-]?\d+)?\s*%?$/i;

  // Numeric columns are right-aligned and do not wrap; text columns are left-aligned and wrap.
  // opts.numeric: indexes of the numeric columns; without it, a column is numeric when every
  // non-empty cell is a number. opts.minWidth: minimum width in px of each text column.
  function dataTable(headers, rows, opts) {
    opts = opts || {};
    if (opts.numeric !== undefined && !(Array.isArray(opts.numeric) && opts.numeric.every((i) => Number.isInteger(i) && i >= 0 && i < headers.length))) {
      throw new Error("dataTable: opts.numeric must be an array of column indexes (0 to " + (headers.length - 1) + ")");
    }
    if (opts.minWidth !== undefined && !(typeof opts.minWidth === "number" && opts.minWidth > 0)) {
      throw new Error("dataTable: opts.minWidth must be a positive number of px");
    }
    const numeric = headers.map((_, i) => {
      if (opts.numeric) return opts.numeric.includes(i);
      const cells = rows.map((r) => String(r[i] === undefined || r[i] === null ? "" : r[i]).trim()).filter((v) => v !== "");
      return cells.length > 0 && cells.every((v) => /\d/.test(v) && NUMBER_CELL.test(v));
    });
    const textStyle = opts.minWidth ? "min-width:" + opts.minWidth + "px" : null;
    return el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
      el("thead", null, el("tr", null, headers.map((h, i) => el("th", { text: h, style: numeric[i] ? "text-align:right" : textStyle })))),
      el("tbody", null, rows.map((r) => el("tr", { style: "cursor:default" }, r.map((v, i) => el("td", { class: numeric[i] ? "num" : null, text: v })))))
    ]));
  }

  // ---------- chrome: header, tabs, filters, banner ----------

  function renderHeader() {
    document.getElementById("page-title").textContent = cfg.title;
    const parts = [];
    for (const side of SIDES) {
      const d = state.data[side];
      if (!d) continue;
      parts.push((hasB ? sideLabel[side] + ": " : "") + sourceText(d));
    }
    document.getElementById("source-line").textContent = parts.join(" · ");
    const loader = document.getElementById("loader");
    loader.replaceChildren();
    if (loadMode) {
      if (SIDES.some((s) => state.data[s])) loader.appendChild(el("button", { class: "btn", type: "button", text: T.reload, onclick: reload }));
      return;
    }
    for (const side of SIDES) {
      const input = el("input", { type: "file", accept: FILE_ACCEPT, onchange: (e) => { if (e.target.files[0]) loadFile(e.target.files[0], side); e.target.value = ""; } });
      loader.appendChild(el("label", null, [hasB ? fmt(T.loadSide, { label: sideLabel[side] }) : T.loadA, input]));
    }
  }

  function sourceText(d) {
    const when = d.origin === "embedded" ? T.embedded
      : loadMode ? fmt(T.loadedAt, { time: d.loadedAt.toLocaleString(cfg.lang) }) : T.loaded;
    return (d.path || d.name) + " (" + fmt(T.rows, { n: d.rows.length }) + ", " + when + ")";
  }

  function renderTabs() {
    const nav = document.getElementById("tabs");
    nav.replaceChildren(...allTabs.map((t) => el("button", {
      role: "tab", "aria-selected": String(state.tab === t), text: extraTitle.get(t) || T.tabs[t],
      onclick: () => { state.tab = t; renderTabs(); renderContent(); }
    })));
  }

  let searchTimer = null;
  function renderFilters() {
    const box = document.getElementById("filters");
    box.replaceChildren();
    for (const k of ["category", "status", "verdict"]) {
      const col = cols[k];
      if (!col) continue;
      const values = orderedValues(col);
      if (state.filters[k] && !values.includes(state.filters[k])) state.filters[k] = "";
      const select = el("select", { onchange: (e) => { state.filters[k] = e.target.value; state.selectedId = null; renderContent(); } },
        [el("option", { value: "", text: T.all })].concat(values.map((v) => el("option", { value: v, text: v, selected: state.filters[k] === v }))));
      box.appendChild(el("label", null, [col, select]));
    }
    const search = el("input", { type: "search", placeholder: T.searchPh, value: state.filters.q,
      oninput: (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => { state.filters.q = e.target.value; state.selectedId = null; renderContent(); }, 150);
      } });
    box.appendChild(el("label", null, [T.search, search]));
    box.appendChild(el("span", { class: "count", id: "filter-count" }));
  }

  function updateCount() {
    const side = state.tab === "review" ? "a" : state.side;
    const node = document.getElementById("filter-count");
    if (node) node.textContent = fmt(T.shown, { n: filteredRows(side).length, total: rowsOf(side).length });
  }

  function renderBanner() {
    const banner = document.getElementById("banner");
    const lines = [];
    for (const e of state.errors) lines.push(e);
    const warn = [];
    for (const side of CAND_SIDES) {
      const mm = idMismatch(side);
      if (mm.onlyA.length) warn.push(fmt(T.onlyIn, { label: sideLabel.a, other: sideLabel[side], n: mm.onlyA.length, ids: mm.onlyA.join(", ") }));
      if (mm.onlyB.length) warn.push(fmt(T.onlyIn, { label: sideLabel[side], other: sideLabel.a, n: mm.onlyB.length, ids: mm.onlyB.join(", ") }));
    }
    if (!lines.length && !warn.length) { banner.hidden = true; return; }
    banner.hidden = false;
    banner.className = "banner" + (lines.length ? " error" : "");
    banner.replaceChildren(...lines.map((l) => el("p", { text: "✕ " + l })), ...warn.map((w) => el("p", { text: "⚠ " + w })));
  }

  // Only meaningful when a second CSV is loaded; single-CSV pages get nothing.
  function appendSideToggle(root) {
    if (!hasB) return;
    root.appendChild(el("div", { class: "segmented", role: "group", "aria-label": T.dataSide }, SIDES.map((s) =>
      el("button", { "aria-pressed": String(state.side === s), text: sideLabel[s], onclick: () => { state.side = s; renderContent(); } }))));
  }

  // ---------- overview ----------

  function statTile(m, rows) {
    const values = rows.map((r) => metricValue(r, m)).filter((v) => v !== null);
    let value, sub;
    if (m.aggregate === "rate") {
      value = fmtMetric(mean(values), m);
      sub = sum(values) + " / " + values.length + " (n=" + values.length + ")";
    } else if (m.aggregate === "sum") {
      value = fmtMetric(values.length ? sum(values) : null, m);
      sub = "n=" + values.length + " · " + T.perItem + " " + fmtMetric(mean(values), m);
    } else {
      value = fmtMetric(mean(values), m);
      sub = "n=" + values.length + " · p50 " + fmtMetric(quantile(values, 0.5), m) + " · p95 " + fmtMetric(quantile(values, 0.95), m);
    }
    const label = metricName(m);
    return el("div", { class: "tile" }, [el("div", { class: "label", text: label }), el("div", { class: "value", text: value }), el("div", { class: "sub", text: sub })]);
  }

  function renderOverview(root) {
    const side = state.side;
    appendSideToggle(root);
    const rows = filteredRows(side);
    if (metrics.length) root.appendChild(el("div", { class: "grid" }, metrics.map((m) => statTile(m, rows))));

    const charts = el("div", { class: "two-col" });
    root.appendChild(charts);
    // Charts measure their holder, so draw only after every card is in the grid.
    const draws = [];
    if (cols.category || stackCol) {
      const card = el("div", { class: "card" });
      charts.appendChild(card);
      const catCol = cols.category || stackCol;
      const allCats = orderedValues(catCol);
      const present = new Set(rows.map((r) => r[catCol]));
      const cats = allCats.filter((c) => present.has(c));
      if (cols.category && stackCol) {
        const segs = orderedValues(stackCol);
        const counts = new Map();
        for (const r of rows) {
          const k = r[catCol] + "\u0000" + r[stackCol];
          counts.set(k, (counts.get(k) || 0) + 1);
        }
        card.appendChild(el("h2", { text: fmt(T.countsTitle, { cat: catCol, stack: stackCol }) }));
        const legendValues = [...new Set(segs.map(seriesKey))];
        card.appendChild(legend(legendValues.map((v) => v)));
        const holder = el("div");
        card.appendChild(holder);
        if (!cats.length) holder.appendChild(el("div", { class: "empty", text: T.noItems }));
        else {
          draws.push(() => holder.appendChild(stackedBars(holder, cats, segs, counts)));
          card.appendChild(el("details", null, [el("summary", { class: "small muted", text: T.tableView }),
            dataTable([catCol, ...segs, T.total], cats.map((c) => {
              const ns = segs.map((s) => counts.get(c + "\u0000" + s) || 0);
              return [c, ...ns.map(String), String(sum(ns))];
            }))]));
        }
      } else {
        const counts = new Map();
        for (const r of rows) counts.set(r[catCol], (counts.get(r[catCol]) || 0) + 1);
        card.appendChild(el("h2", { text: fmt(T.countsTitleSingle, { cat: catCol }) }));
        const holder = el("div");
        card.appendChild(holder);
        if (!cats.length) holder.appendChild(el("div", { class: "empty", text: T.noItems }));
        else {
          draws.push(() => holder.appendChild(singleBars(holder, cats, counts)));
          card.appendChild(el("details", null, [el("summary", { class: "small muted", text: T.tableView }),
            dataTable([catCol, T.count], cats.map((c) => [c, String(counts.get(c) || 0)]))]));
        }
      }
    }

    const histCol = cfg.histogram || (metrics.find((m) => m.aggregate !== "rate") || {}).column;
    if (histCol) {
      const m = metrics.find((x) => x.column === histCol);
      const values = rows.map((r) => metricValue(r, m)).filter((v) => v !== null);
      const card = el("div", { class: "card" });
      charts.appendChild(card);
      card.appendChild(el("h2", { text: fmt(T.histTitle, { label: m.label }) }));
      card.appendChild(el("div", { class: "small muted", text: "n=" + values.length + " · " + T.mean + " " + fmtMetric(mean(values), m) }));
      const holder = el("div");
      card.appendChild(holder);
      if (!values.length) holder.appendChild(el("div", { class: "empty", text: T.noItems }));
      else {
        draws.push(() => {
          const h = histogram(holder, values, m);
          holder.appendChild(h.svg);
          card.appendChild(el("details", null, [el("summary", { class: "small muted", text: T.tableView }),
            dataTable([T.range, T.count], h.bins.map((b) => [fmtMetric(b.lo, m) + " – " + fmtMetric(b.hi, m), String(b.n)]))]));
        });
      }
    }
    for (const draw of draws) draw();
  }

  // ---------- compare ----------

  function deltaNode(d, m) {
    if (d === null) return el("span", { class: "delta flat", text: "–" });
    if (isInfo(m)) return el("span", { class: "delta neutral", text: fmtDelta(Math.abs(d) < 1e-12 ? 0 : d, m) });
    if (Math.abs(d) < 1e-12) {
      return el("span", { class: "delta flat", text: "= " + fmtDelta(0, m) + " " + T.flat });
    }
    const good = (d > 0) === (m.better === "higher");
    return el("span", { class: "delta " + (good ? "good" : "bad"), text: (d > 0 ? "▲ " : "▼ ") + fmtDelta(d, m) + " " + (good ? T.better : T.worse) });
  }

  // Metric values of pairs where both sides have one: [[a, b], ...].
  function pairedValues(ps, m) {
    return ps.map((p) => [metricValue(p.a, m), metricValue(p.b, m)]).filter(([x, y]) => x !== null && y !== null);
  }

  function deltaTile(m, ps, side) {
    const both = pairedValues(ps, m);
    const va = aggregate(both.map((x) => x[0]), m), vb = aggregate(both.map((x) => x[1]), m);
    const d = va === null || vb === null ? null : vb - va;
    const label = metricName(m);
    const threshold = isInfo(m) ? " · " + T.infoNote : m.aggregate === "rate" ? "" : m.regression_threshold === undefined || m.regression_threshold === null
      ? " · " + T.noThreshold : " · " + T.thresholdNote + " " + fmtAmount(m.regression_threshold, m);
    return el("div", { class: "tile" }, [
      el("div", { class: "label", text: label }),
      el("div", { class: "ab" }, [el("span", { text: sideLabel.a }), el("span", { text: fmtMetric(va, m) }), el("span", { text: sideLabel[side] }), el("span", { text: fmtMetric(vb, m) })]),
      el("div", { class: "value", style: "font-size:18px" }, deltaNode(d, m)),
      el("div", { class: "sub", text: "n=" + both.length + threshold })
    ]);
  }

  // total is 0 for a tile that is not a share of the compared items.
  function countTile(label, n, total, icon, note) {
    return el("div", { class: "tile" }, [el("div", { class: "label", text: label }), el("div", { class: "value", text: (icon ? icon + " " : "") + n }),
      total ? el("div", { class: "sub", text: fmt(T.countOf, { n: n, total: total, pct: numberFormat(1).format((n / total) * 100) }) }) : null,
      note ? el("div", { class: "sub", text: note }) : null]);
  }

  // Metrics that classifyPair() uses: rates, and numbers with a regression_threshold.
  function decidingMetrics() {
    return metrics.filter((m) => !isInfo(m) && (m.aggregate === "rate" ||
      (m.regression_threshold !== undefined && m.regression_threshold !== null)));
  }

  // The mark for a rate value: good is true for higher-is-better and false for lower-is-better.
  function rateMark(v, m) {
    if (v === null) return "–";
    return v === (m.better === "higher" ? 1 : 0) ? T.rateGood : T.rateBad;
  }

  // The sentences above the compare tab: what was compared, and what counts as regressed.
  function compareSummary(side, n) {
    const deciding = decidingMetrics();
    const rules = deciding.map((m) => m.aggregate === "rate"
      ? fmt(T.ruleFlip, { label: m.label, good: T.rateGood, bad: T.rateBad })
      : fmt(m.better === "lower" ? T.ruleUp : T.ruleDown, { label: m.label, t: fmtAmount(m.regression_threshold, m) }));
    const reference = metrics.filter((m) => !deciding.includes(m)).map(metricName);
    const parts = [fmt(T.compareSummary, { a: sideLabel.a, b: sideLabel[side], n: n })];
    parts.push(rules.length ? fmt(T.rulesUsed, { rules: rules.join(T.ruleOr) }) : T.rulesNone);
    if (reference.length) parts.push(fmt(T.rulesInfo, { list: reference.join(T.listSep) }));
    return parts.join(LANG === "en" ? " " : "");
  }

  // The note under the regressed (worse) or improved count tile, e.g. "accuracy ✓→✗, latency over +300 ms".
  function countNote(worse) {
    const notes = decidingMetrics().map((m) => {
      if (m.aggregate === "rate") {
        return fmt(T.noteFlip, worse ? { label: m.label, from: T.rateGood, to: T.rateBad } : { label: m.label, from: T.rateBad, to: T.rateGood });
      }
      const up = (m.better === "lower") === worse;
      return fmt(T.noteOver, { label: m.label, d: fmtDelta(up ? m.regression_threshold : -m.regression_threshold, m) });
    });
    if (!notes.length) return "";
    return notes.length === 1 ? notes[0] : fmt(T.noteAny, { list: notes.join(T.listSep) });
  }

  // One change in the change column: a flip as "✓ → ✗", a number as "before → after (▲ delta)".
  // ▲ / ▼ show the direction of the number, not whether it got better.
  function changeText(ch) {
    const m = ch.m;
    if (ch.flip) return fmt(T.changeText, { label: m.label, a: rateMark(ch.va, m), b: rateMark(ch.vb, m) });
    return fmt(T.changeText, { label: m.label, a: fmtMetric(ch.va, m), b: fmtMetric(ch.vb, m) })
      + fmt(T.changeDelta, { d: (ch.vb > ch.va ? "▲ " : "▼ ") + fmtDelta(ch.vb - ch.va, m) });
  }

  function reasonNodes(c) {
    return c.changes.map((ch) => el("span", { class: "badge reason", text: changeText(ch) }));
  }

  // http(s) URLs in columns.text values become links. ASCII only, so Japanese text right
  // after a URL (「…/libra）。」) is not part of the link.
  const URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/gi;

  // Drops trailing punctuation, and a ) or ] that has no opening partner in the URL
  // (so https://en.wikipedia.org/wiki/Foo_(bar) keeps its parenthesis).
  function trimUrl(url) {
    const count = (s, ch) => s.split(ch).length - 1;
    for (;;) {
      const last = url.slice(-1);
      if (".,;:!?'*".includes(last)) url = url.slice(0, -1);
      else if (last === ")" && count(url, "(") < count(url, ")")) url = url.slice(0, -1);
      else if (last === "]" && count(url, "[") < count(url, "]")) url = url.slice(0, -1);
      else return url;
    }
  }

  function isWebUrl(s) {
    try {
      const u = new URL(s);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname !== "";
    } catch (e) {
      return false;
    }
  }

  // Text nodes and <a> elements for `text`; never parsed as HTML.
  function linkify(text) {
    const out = [];
    let last = 0, m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(text))) {
      const url = trimUrl(m[0]);
      if (!isWebUrl(url)) continue;
      if (m.index > last) out.push(document.createTextNode(text.slice(last, m.index)));
      out.push(el("a", { href: url, text: url, target: "_blank", rel: "noopener noreferrer" }));
      last = m.index + url.length;
      URL_RE.lastIndex = last;
    }
    if (last < text.length || !out.length) out.push(document.createTextNode(text.slice(last)));
    return out;
  }

  // columns.collapsed: text columns shown as closed <details>. Which ones the reader opened
  // is kept per column for as long as the page is open (not in localStorage), so it
  // survives moving to the next item and re-renders.
  const foldedCols = new Set(cols.collapsed || []);
  const openCols = new Set();

  function textBlock(title, value, col) {
    const text = String(prettyText(value));
    const body = el("pre", { class: "longtext" }, linkify(text));
    if (!foldedCols.has(col)) return el("div", { class: "text-block" }, [el("h3", { text: title }), body]);
    // Code points, not UTF-16 units, so a character outside the BMP counts once.
    const n = numberFormat(0).format(Array.from(text).length);
    const block = el("details", { class: "text-block folded" },
      [el("summary", null, el("h3", { text: fmt(T.foldedTitle, { title: title, n: n }) })), body]);
    block.dataset.col = col;
    block.open = openCols.has(col);
    block.addEventListener("toggle", () => {
      // Ignores the toggle event fired by setting `open` above or by the sync below.
      if (block.open === openCols.has(col)) return;
      if (block.open) openCols.add(col); else openCols.delete(col);
      // Keeps every block of the column in step, such as A and B in the compare detail.
      for (const other of document.querySelectorAll("details.folded")) {
        if (other.dataset.col === col) other.open = block.open;
      }
    });
    return block;
  }

  // columns.sections: text columns grouped under headings. Text columns in no section
  // come last under "Other", so adding a column to columns.text never hides it.
  const textSections = (() => {
    if (!cols.sections || !cols.sections.length) return null;
    const listed = new Set(cols.sections.flatMap((s) => s.columns));
    const rest = cols.text.filter((c) => !listed.has(c));
    return rest.length ? cols.sections.concat([{ title: T.other, columns: rest }]) : cols.sections;
  })();

  // Appends one section per entry of textSections; `block(col)` gives a column's node(s).
  // Only the review tab lays out "side-by-side" sections in a row: in the compare detail
  // each differing column already takes two columns.
  function appendTextSections(card, block, sideBySide) {
    for (const s of textSections) {
      const blocks = s.columns.map(block);
      const row = sideBySide && s.layout === "side-by-side";
      card.appendChild(el("section", { class: "text-section" }, [el("h2", { class: "text-section-title", text: s.title })].concat(
        row ? el("div", { class: "section-cols", style: "--n:" + blocks.length }, blocks) : blocks)));
    }
  }

  function renderPairDetail(p, side) {
    const labelA = sideLabel.a, labelB = sideLabel[side];
    const card = el("div", { class: "card", id: "pair-detail" });
    card.appendChild(el("h2", { text: cols.id + ": " + p.id }));
    const metricRows = metrics.map((m) => {
      const va = metricValue(p.a, m), vb = metricValue(p.b, m);
      const d = va === null || vb === null ? null : vb - va;
      // A rate with a direction shows the same marks as the change column; a reference-only
      // rate has no good value, so it keeps true / false.
      const show = (v) => (m.aggregate !== "rate" ? fmtMetric(v, m) : isInfo(m) ? (v === null ? "–" : v ? "true" : "false") : rateMark(v, m));
      return el("tr", { style: "cursor:default" }, [el("td", { text: m.label, style: "white-space:nowrap" }), el("td", { class: "num", text: show(va) }), el("td", { class: "num", text: show(vb) }),
        el("td", { class: "num" }, m.aggregate === "rate" ? (d ? el("span", { class: "delta " + (isInfo(m) ? "neutral" : rateMark(vb, m) === T.rateGood ? "good" : "bad"), text: show(va) + " → " + show(vb) }) : el("span", { class: "delta flat", text: "= " + T.flat })) : deltaNode(d, m))]);
    });
    card.appendChild(el("div", { class: "scroll-x" }, el("table", { class: "list", style: "margin-bottom:12px" }, [
      el("thead", null, el("tr", null, [el("th", { text: T.metric }), el("th", { text: labelA }), el("th", { text: labelB }), el("th", { text: fmt(T.delta, { a: labelA, b: labelB }) })])),
      el("tbody", null, metricRows)])));
    const isShared = (c) => cellText(p.a[c]) === cellText(p.b[c]);
    const sharedBlock = (c) => textBlock(c + " (" + fmt(T.shared, { a: labelA, b: labelB }) + ")", p.a[c], c);
    const pairBlock = (c) => el("div", { class: "side-by-side" }, [textBlock(c + " — " + labelA, p.a[c], c), textBlock(c + " — " + labelB, p.b[c], c)]);
    if (textSections) {
      // Sections keep the configured reading order, so shared and differing columns mix.
      appendTextSections(card, (c) => (isShared(c) ? sharedBlock(c) : pairBlock(c)), false);
    } else {
      for (const c of cols.text.filter(isShared)) card.appendChild(sharedBlock(c));
      for (const c of cols.text.filter((c) => !isShared(c))) card.appendChild(pairBlock(c));
    }
    return card;
  }

  // Regressions list order: flips first, then by severity, then by id.
  function bySeverity(x, y) { return (y.c.flip - x.c.flip) || (y.c.score - x.c.score) || x.p.id.localeCompare(y.p.id); }

  function renderCompare(root) {
    const side = state.compareSide;
    if (CAND_SIDES.length > 1) {
      root.appendChild(el("div", { class: "segmented", role: "group", "aria-label": T.candidate }, CAND_SIDES.map((s) =>
        el("button", { "aria-pressed": String(side === s), text: sideLabel.a + " vs " + sideLabel[s],
          onclick: () => { state.compareSide = s; state.selectedId = null; renderContent(); } }))));
    }
    const ps = filteredPairs(side);
    const classified = ps.map((p) => ({ p: p, c: classifyPair(p) }));
    const reg = classified.filter((x) => x.c.kind === "regressed");
    const imp = classified.filter((x) => x.c.kind === "improved");
    reg.sort(bySeverity);
    imp.sort(bySeverity);

    root.appendChild(el("p", { class: "small muted", text: compareSummary(side, ps.length) }));
    root.appendChild(el("div", { class: "grid" }, [
      countTile(T.paired, ps.length, 0, "", fmt(T.pairedNote, { a: sideLabel.a, b: sideLabel[side] })),
      countTile(T.regressed, reg.length, ps.length, "▼", countNote(true)),
      countTile(T.improved, imp.length, ps.length, "▲", countNote(false)),
      countTile(T.unchanged, ps.length - reg.length - imp.length, ps.length, "=", T.unchangedNote)
    ]));
    root.appendChild(el("div", { class: "grid" }, metrics.map((m) => deltaTile(m, ps, side))));

    const view = state.compareView;
    const list = view === "regressed" ? reg : imp;
    const card = el("div", { class: "card" });
    root.appendChild(card);
    card.appendChild(el("div", { class: "segmented", role: "group" }, [["regressed", T.regressedTitle + " (" + reg.length + ")"], ["improved", T.improvedTitle + " (" + imp.length + ")"]].map(([k, label]) =>
      el("button", { "aria-pressed": String(view === k), text: label, onclick: () => { state.compareView = k; state.selectedId = null; renderContent(); } }))));
    const flip = !list.some((x) => x.c.flip) ? "" : view === "regressed"
      ? fmt(T.flipFirst, { from: T.rateGood, to: T.rateBad }) : fmt(T.flipFirst, { from: T.rateBad, to: T.rateGood });
    card.appendChild(el("p", { class: "small muted", text: fmt(view === "regressed" ? T.regressedSort : T.improvedSort, { flip: flip, a: sideLabel.a, b: sideLabel[side] }) }));
    if (!list.length) {
      card.appendChild(el("div", { class: "empty", text: view === "regressed" ? T.noRegressions : T.noImprovements }));
    } else {
      const preview = cols.text[0];
      const tbody = el("tbody", null, list.map((x) => el("tr", {
        tabindex: 0, "aria-selected": String(state.selectedId === x.p.id),
        onclick: () => selectPair(x.p.id),
        onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPair(x.p.id); } }
      }, [
        el("td", { text: x.p.id, style: "white-space:nowrap" }),
        cols.category ? el("td", { text: x.p.a[cols.category] }) : null,
        el("td", null, el("div", { style: "display:flex;flex-wrap:wrap;gap:4px" }, reasonNodes(x.c))),
        preview ? el("td", { class: "muted preview-col", text: truncateToWidth(cellText(x.p.a[preview]).replace(/\s+/g, " "), 260, 13) }) : null
      ])));
      card.appendChild(el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
        el("thead", null, el("tr", null, [el("th", { text: cols.id }), cols.category ? el("th", { text: cols.category }) : null, el("th", { text: T.reason }), preview ? el("th", { class: "preview-col", text: preview }) : null])),
        tbody])));
    }
    const selected = list.find((x) => x.p.id === state.selectedId);
    if (selected) root.appendChild(renderPairDetail(selected.p, side));
  }

  function selectPair(id) {
    state.selectedId = id;
    renderContent();
    const detail = document.getElementById("pair-detail");
    if (detail) detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- review ----------

  function reviewItems() {
    return filteredRows("a").filter((r) => !state.unreviewedOnly || !reviewOf(r[cols.id]).label);
  }

  function moveCursor(delta) {
    const items = reviewItems();
    if (!items.length) return;
    let idx = items.findIndex((r) => r[cols.id] === state.reviewCursor);
    idx = idx < 0 ? 0 : Math.min(items.length - 1, Math.max(0, idx + delta));
    state.reviewCursor = items[idx][cols.id];
    renderContent();
  }

  function applyLabel(id, label) {
    const items = reviewItems();
    const idx = items.findIndex((r) => r[cols.id] === id);
    const current = reviewOf(id).label;
    setReview(id, { label: current === label ? "" : label });
    // Advance to the next item after a judgment; toggling a label off stays put.
    if (current !== label && idx >= 0 && idx + 1 < items.length) state.reviewCursor = items[idx + 1][cols.id];
    renderContent();
  }

  // The reviewed data as CSV, shared by the download and the copy button.
  function reviewCsvText() {
    const a = state.data.a;
    const fields = a.headers.concat(REVIEW_EXPORT_COLUMNS);
    const data = a.rows.map((r) => {
      const rv = reviewOf(r[cols.id]);
      return a.headers.map((h) => cellText(r[h])).concat([rv.label, rv.note]);
    });
    return Papa.unparse({ fields: fields, data: data });
  }

  // The download gets a BOM so Excel opens the UTF-8 correctly; the copy does not.
  function exportReview() {
    download("\uFEFF" + reviewCsvText(), baseName(state.data.a.name) + "_reviewed.csv", "text/csv;charset=utf-8");
  }

  // UTF-8 with BOM so Excel opens it correctly. `data` is a list of rows, each a list of cells.
  // Exposed to extra tabs as ctx.downloadCsv.
  function downloadCsv(filename, fields, data) {
    const csvText = "\uFEFF" + Papa.unparse({ fields: fields, data: data.map((row) => row.map(cellText)) });
    download(csvText, filename, "text/csv;charset=utf-8");
  }

  // Some embedded browser panes ignore downloads without any sign the page can see, so
  // every export has a copy button next to it. When the clipboard is unavailable or
  // refused, the text is shown in a read-only textarea, selected, below the button's bar.
  function copyButton(label, makeText) {
    return el("button", { class: "btn", type: "button", text: label, onclick: (e) => copyText(makeText(), e.currentTarget) });
  }

  async function copyText(text, button) {
    const bar = button.parentElement;
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") throw new Error("no clipboard API");
      await navigator.clipboard.writeText(text);
      showCopied(bar);
    } catch (err) {
      showCopyFallback(bar, text);
    }
  }

  function showCopied(bar) {
    const old = bar.querySelector(".copy-status");
    if (old) old.remove();
    const status = el("span", { class: "small copy-status", role: "status", text: T.copied });
    bar.appendChild(status);
    setTimeout(() => status.remove(), 2500);
  }

  function showCopyFallback(bar, text) {
    const old = bar.nextElementSibling;
    if (old && old.classList.contains("copy-fallback")) old.remove();
    const area = el("textarea", { class: "copy-text", readonly: true, rows: 12, spellcheck: "false" });
    area.value = text; // a value, never markup
    const panel = el("div", { class: "card copy-fallback", role: "region" }, [
      el("div", { class: "verdict-head" }, [el("p", { class: "small", text: T.copyFallback }),
        el("button", { type: "button", class: "btn", text: T.close, onclick: () => panel.remove() })]),
      area]);
    bar.after(panel);
    area.focus();
    area.select();
  }

  function download(text, filename, type) {
    const url = URL.createObjectURL(new Blob([text], { type: type }));
    const link = el("a", { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderReview(root) {
    const labels = cfg.review.labels;
    const filtered = filteredRows("a");
    const items = reviewItems();
    const reviewedCount = filtered.filter((r) => reviewOf(r[cols.id]).label).length;
    let idx = items.findIndex((r) => r[cols.id] === state.reviewCursor);
    if (idx < 0 && items.length) { idx = 0; state.reviewCursor = items[0][cols.id]; }

    const bar = el("div", { class: "review-bar" }, [
      el("span", { class: "progress", text: items.length ? (idx + 1) + " / " + items.length : "0 / 0" }),
      el("span", { class: "progress-track", title: fmt(T.reviewed, { n: reviewedCount, total: filtered.length }) },
        el("span", { style: "width:" + (filtered.length ? (reviewedCount / filtered.length) * 100 : 0) + "%" })),
      el("span", { class: "small muted", text: fmt(T.reviewed, { n: reviewedCount, total: filtered.length }) }),
      el("label", { class: "check" }, [el("input", { type: "checkbox", checked: state.unreviewedOnly, onchange: (e) => { state.unreviewedOnly = e.target.checked; renderContent(); } }), T.unreviewedOnly]),
      el("button", { class: "btn", text: T.exportCsv, onclick: exportReview }),
      copyButton(T.copyCsv, reviewCsvText)
    ]);
    root.appendChild(bar);
    root.appendChild(el("p", { class: "small muted", text: (state.storageOk ? "✓ " + T.storageOk : "⚠ " + T.storageNo) + " · " + fmt(T.keys, { n: labels.length }) }));

    if (!items.length) { root.appendChild(el("div", { class: "card empty", text: T.noItems })); return; }
    const row = items[idx];
    const id = row[cols.id];
    const rv = reviewOf(id);
    const card = el("div", { class: "card" });
    root.appendChild(card);
    const meta = el("div", { class: "review-meta" }, [el("strong", { text: cols.id + ": " + id }),
      reviewIsStale(rv, rowFingerprint(row)) ? staleBadge() : null]);
    for (const k of ["category", "status", "verdict"]) {
      const c = cols[k];
      if (!c) continue;
      const v = row[c];
      meta.appendChild(el("span", { class: "badge" }, [c === stackCol ? el("span", { class: "swatch", style: "background:var(" + seriesVar(v) + ")" }) : null, c + ": " + v]));
    }
    card.appendChild(meta);
    if (textSections) appendTextSections(card, (c) => textBlock(c, row[c], c), true);
    else for (const c of cols.text) card.appendChild(textBlock(c, row[c], c));

    card.appendChild(el("h3", { text: T.humanLabel }));
    card.appendChild(el("div", { class: "label-buttons" }, labels.map((l, i) =>
      el("button", { "aria-pressed": String(rv.label === l), onclick: () => applyLabel(id, l) }, [el("kbd", { text: String(i + 1) }), l]))));
    card.appendChild(el("h3", { text: T.note }));
    card.appendChild(el("textarea", { class: "note", id: "review-note", text: rv.note, oninput: (e) => setReview(id, { note: e.target.value }) }));
    card.appendChild(el("div", { class: "review-nav" }, [
      el("button", { class: "btn", text: T.prev, disabled: idx === 0, onclick: () => moveCursor(-1) }),
      el("button", { class: "btn", text: T.next, disabled: idx === items.length - 1, onclick: () => moveCursor(1) })
    ]));
  }

  // The same keys drive the review tab and the release / experiment tab's review of one candidate.
  document.addEventListener("keydown", (e) => {
    const inReview = state.tab === "review" && cfg.review;
    const inDecision = state.tab === decisionTab && state.decisionSide;
    if ((!inReview && !inDecision) || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    const typing = target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.tagName === "SELECT");
    if (typing) {
      if (e.key === "Escape") target.blur();
      return;
    }
    const move = inReview ? moveCursor : moveDecisionCursor;
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === "n" || e.key === "N") {
      const note = document.getElementById("review-note");
      if (note) { e.preventDefault(); note.focus(); }
    } else if (/^[1-9]$/.test(e.key)) {
      if (inReview) {
        const label = cfg.review.labels[Number(e.key) - 1];
        if (label && state.reviewCursor !== null && reviewItems().length) { e.preventDefault(); applyLabel(state.reviewCursor, label); }
      } else {
        const label = REVIEW_LABELS[Number(e.key) - 1];
        if (label && state.decisionCursor !== null) { e.preventDefault(); applyDecisionLabel(state.decisionCursor, label); }
      }
    }
  });

  // ---------- release / experiment decision ----------

  const REVIEW_LABELS = decision ? decision.review_labels : [];
  // The last review label rejects the candidate. Must match candidate_verdict() in build.py.
  const REJECT = REVIEW_LABELS.length ? REVIEW_LABELS[REVIEW_LABELS.length - 1] : null;
  // Verdict codes in the order: met / regressions left unreviewed / not met.
  const VERDICTS = decision ? DECISIONS[decisionTab].verdicts : [];
  const VERDICT_MARKS = ["✓", "△", "✕"];
  const metricByColumn = new Map(metrics.map((m) => [m.column, m]));

  // What a candidate's stored review belongs to: like the review tab, the id set, so an
  // added column or changed values keep the reviews (see pairFingerprint).
  function tableSignature(side) {
    return state.data[side].rows.map((r) => r[cols.id]).sort();
  }

  // The compared metric values of a pair, which a review of the regressed item was made against.
  function pairFingerprint(p) {
    return fnv1a(JSON.stringify(metrics.map((m) => [metricValue(p.a, m), metricValue(p.b, m)])));
  }

  // Per candidate: labels saved in this browser, else the reviews embedded from
  // the decision's record. The embedded reviews are part of the key, so rebuilding with a new
  // record starts from that record.
  function initDecisionReview() {
    state.decisionReview = {};
    state.decisionStorageKey = {};
    state.decisionCursor = null;
    state.decisionDetail = null;
    state.decisionStorageOk = false;
    if (!decision || !state.data.a) return;
    state.decisionStorageOk = true;
    for (const s of CAND_SIDES) {
      if (!state.data[s]) continue;
      const embedded = decisionRecord ? decisionRecord.reviews[sideLabel[s]] || {} : {};
      const key = STORAGE_PREFIX + decisionTab + ":" + fnv1a(JSON.stringify([cfg.title, sideLabel[s], tableSignature("a"), tableSignature(s), embedded]));
      state.decisionStorageKey[s] = key;
      let stored = null;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) stored = JSON.parse(raw);
      } catch (e) {
        state.decisionStorageOk = false;
      }
      state.decisionReview[s] = isPlainObject(stored) ? stored : JSON.parse(JSON.stringify(embedded));
    }
  }

  function decisionReviewOf(side, id) { return (state.decisionReview[side] || {})[id] || { label: "", note: "" }; }

  function setDecisionReview(side, id, patch) {
    const all = state.decisionReview[side] || (state.decisionReview[side] = {});
    const pair = pairs(side).find((p) => p.id === id);
    const next = Object.assign({}, decisionReviewOf(side, id), patch, pair ? { fp: pairFingerprint(pair) } : {});
    if (!next.label && !next.note) delete all[id];
    else all[id] = next;
    if (!state.decisionStorageOk) return;
    try {
      window.localStorage.setItem(state.decisionStorageKey[side], JSON.stringify(all));
    } catch (e) {
      state.decisionStorageOk = false;
      renderContent();
    }
  }

  // Must match evaluate_criterion() in build.py. `value` is what the threshold
  // is compared with: the candidate's aggregate, its worsening from A (in the metric's
  // unit or in percent), or a count of items. `regressed` is [{ p, c }] from classifyPair.
  // The other fields (the counted items, n, both aggregates and their sums) are what the
  // detail panel shows; the verdict and the record use only `value`, `pass` and `pending`.
  // A regressions criterion with count "unaccepted" leaves out items accepted in review
  // (any label but REJECT); it is `pending` (not failed) while only unreviewed items
  // push it over the maximum.
  function evaluateCriterion(c, ps, regressed, side) {
    if (c.type === "regressions") {
      if (c.count !== "unaccepted") return { value: regressed.length, pass: regressed.length <= c.max, items: regressed };
      const labelOf = (x) => decisionReviewOf(side, x.p.id).label;
      const items = regressed.filter((x) => !labelOf(x) || labelOf(x) === REJECT);
      const accepted = regressed.filter((x) => labelOf(x) && labelOf(x) !== REJECT);
      const rejected = items.filter((x) => labelOf(x) === REJECT).length;
      const pass = items.length <= c.max;
      return { value: items.length, pass: pass, pending: !pass && rejected <= c.max, items: items, accepted: accepted,
        rejected: rejected, unreviewed: items.length - rejected, total: regressed.length };
    }
    if (c.type === "critical_categories") {
      const cats = new Set(c.categories);
      const items = regressed.filter((x) => cats.has(cellText(x.p.a[cols.category])));
      return { value: items.length, pass: items.length === 0, items: items };
    }
    const m = metricByColumn.get(c.metric);
    const both = pairedValues(ps, m);
    const curs = both.map((x) => x[0]), cands = both.map((x) => x[1]);
    const cur = aggregate(curs, m), cand = aggregate(cands, m);
    const basis = { n: both.length, cur: cur, cand: cand, sumCur: sum(curs), sumCand: sum(cands) };
    if (cand === null) return Object.assign({ value: null, pass: false }, basis);
    if (c.type === "absolute") {
      return Object.assign({ value: cand, pass: (c.min === undefined || cand >= c.min) && (c.max === undefined || cand <= c.max) }, basis);
    }
    const worse = m.better === "lower" ? cand - cur : cur - cand;
    if (c.max_worse !== undefined) return Object.assign({ value: worse, pass: worse <= c.max_worse }, basis);
    const pct = cur !== 0 ? worse / Math.abs(cur) * 100 : worse > 0 ? Infinity : 0;
    return Object.assign({ value: pct, pass: pct <= c.max_worse_pct }, basis);
  }

  // Every pair counts, regardless of the filter bar. Must match candidate_verdict().
  function candidateResult(side) {
    const ps = pairs(side);
    const regressed = ps.map((p) => ({ p: p, c: classifyPair(p) })).filter((x) => x.c.kind === "regressed");
    regressed.sort(bySeverity);
    const regPairs = regressed.map((x) => x.p);
    const results = decision.criteria.map((c) => evaluateCriterion(c, ps, regressed, side));
    const labels = regPairs.map((p) => decisionReviewOf(side, p.id).label);
    const rejected = labels.filter((l) => l === REJECT).length;
    const unreviewed = labels.filter((l) => !l).length;
    const idx = decision.criteria.map((c, i) => i);
    // A pending criterion is not failed: it implies an unreviewed item, so the verdict is the middle one.
    const failed = idx.filter((i) => !results[i].pass && !results[i].pending);
    const pending = idx.filter((i) => results[i].pending);
    const verdict = VERDICTS[failed.length || rejected ? 2 : unreviewed ? 1 : 0];
    return { side: side, label: sideLabel[side], pairs: ps, regressed: regressed, results: results, failed: failed,
      pending: pending, rejected: rejected, unreviewed: unreviewed, verdict: verdict };
  }

  // Two-sided 95% points of Student's t distribution for 1-30 degrees of freedom.
  const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
    2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086,
    2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];

  // Beyond the table, the first two terms of the Cornish-Fisher expansion around
  // z = 1.96; they give 2.0394 at df 31 (exact 2.0395), so there is no step after df 30.
  function t95(df) {
    if (df <= T95.length) return T95[df - 1];
    const z = 1.96;
    return z + (z ** 3 + z) / (4 * df) + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df * df);
  }

  // Paired difference (candidate − A) per metric with a 95% interval from the t
  // distribution: mean difference ± t(n−1)·sd/√n, scaled by n for sum metrics. Reference only.
  function diffStats(ps, m) {
    const both = pairedValues(ps, m);
    const n = both.length;
    const cur = aggregate(both.map((x) => x[0]), m), cand = aggregate(both.map((x) => x[1]), m);
    const d = cur === null || cand === null ? null : cand - cur;
    if (n < 2) return { n: n, cur: cur, cand: cand, d: d, ci: null };
    const diffs = both.map(([x, y]) => y - x);
    const mu = mean(diffs);
    const sd = Math.sqrt(diffs.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (n - 1));
    const half = t95(n - 1) * sd / Math.sqrt(n);
    const k = m.aggregate === "sum" ? n : 1;
    return { n: n, cur: cur, cand: cand, d: d, ci: [(mu - half) * k, (mu + half) * k] };
  }

  // c is an element of decision.criteria; a criterion added after the results says so.
  // Its label, when set, replaces the default name.
  function criterionName(c) {
    const added = addedAfter.has(decision.criteria.indexOf(c)) ? T.addedAfter : "";
    if (c.label) return c.label + added;
    if (c.type === "regressions") return (c.count === "unaccepted" ? T.critUnaccepted : T.critRegressions) + added;
    if (c.type === "critical_categories") return fmt(T.critCritical, { cats: c.categories.join(", ") }) + added;
    const m = metricByColumn.get(c.metric);
    return (c.type === "absolute" ? fmt(T.critAbsolute, { metric: m.label }) : fmt(T.critRelative, { metric: m.label, a: sideLabel.a })) + added;
  }

  function criterionThreshold(c) {
    if (c.type === "regressions") return "≤ " + fmt(T.nItems, { n: c.max });
    if (c.type === "critical_categories") return fmt(T.nItems, { n: 0 });
    const m = metricByColumn.get(c.metric);
    if (c.type === "absolute") {
      if (c.min !== undefined && c.max !== undefined) return fmtMetric(c.min, m) + " – " + fmtMetric(c.max, m);
      return c.min !== undefined ? "≥ " + fmtMetric(c.min, m) : "≤ " + fmtMetric(c.max, m);
    }
    return "≤ " + (c.max_worse !== undefined ? fmtAmount(c.max_worse, m) : fmtNum(c.max_worse_pct) + "%");
  }

  function criterionValue(c, r) {
    if (r.value === null) return "–";
    if (c.type === "regressions" || c.type === "critical_categories") return fmt(T.nItems, { n: r.value });
    const m = metricByColumn.get(c.metric);
    if (c.type === "absolute") return fmtMetric(r.value, m);
    const v = r.value;
    const amount = v === Infinity ? "∞%" : c.max_worse !== undefined ? fmtAmount(Math.abs(v), m) : fmtNum(Math.abs(v)) + "%";
    if (v === 0) return "±" + amount;
    return (v > 0 ? "+" : "−") + amount + (v > 0 ? T.worsePos : T.worseNeg);
  }

  // Release verdicts have fixed wording; an experiment's come from config.experiment.verdict_labels.
  function verdictText(verdict) {
    if (!isExperiment) return T.verdict[verdict];
    return VERDICT_MARKS[VERDICTS.indexOf(verdict)] + " " + decision.verdict_labels[verdict];
  }

  function verdictBadge(verdict) {
    return el("span", { class: "verdict verdict-" + verdict, text: verdictText(verdict) });
  }

  // `res` is an evaluateCriterion() result.
  function passNode(res) {
    if (res.pending) return el("span", { class: "delta pending", text: T.pending });
    return el("span", { class: "delta " + (res.pass ? "good" : "bad"), text: res.pass ? T.pass : T.fail });
  }

  function passText(res) { return res.pending ? T.pending : res.pass ? T.pass : T.fail; }

  // The verdict wording for "needs review", without the mark.
  function reviewVerdictName() {
    return isExperiment ? decision.verdict_labels.review : T.verdict.review.replace(/^\S+\s/, "");
  }

  function goTo(tab) {
    state.tab = tab;
    renderTabs();
    renderContent();
    window.scrollTo(0, 0);
  }

  function renderDecision(root) {
    const results = CAND_SIDES.map(candidateResult);
    if (state.decisionSide) renderDecisionReview(root, results.find((r) => r.side === state.decisionSide));
    else renderDecisionSummary(root, results);
  }

  function renderDecisionSummary(root, results) {
    root.appendChild(el("div", { class: "table-toolbar" }, [
      el("button", { class: "btn", text: T.exportMd, onclick: () => download(recordMarkdown(results), recordFileName("md"), "text/markdown;charset=utf-8") }),
      copyButton(T.copyMd, () => recordMarkdown(results)),
      el("button", { class: "btn", text: T.exportJson, onclick: () => download(recordJson(results), recordFileName("json"), "application/json") }),
      copyButton(T.copyJson, () => recordJson(results)),
      el("span", { class: "small muted", text: state.decisionStorageOk ? "✓ " + T.storageOk : "⚠ " + T.storageNo })
    ]));

    // config.<tab>.description (Markdown) goes below the hypothesis; a release has its own card in the same place.
    const description = decision.description ? el("div", { class: "report" }, renderMarkdown(decision.description)) : null;
    if (isExperiment) root.appendChild(el("div", { class: "card" }, [el("h2", { text: T.hypothesis }), el("p", { class: "hypothesis", text: decision.hypothesis }), description]));
    else if (description) root.appendChild(el("div", { class: "card" }, description));
    root.appendChild(el("h2", { text: T.verdictTitle }));
    root.appendChild(el("p", { class: "small muted", text: isExperiment
      ? fmt(T.experimentRule, { reject: REJECT, pass: decision.verdict_labels.pass, review: decision.verdict_labels.review, fail: decision.verdict_labels.fail })
      : fmt(T.verdictRule, { reject: REJECT }) }));
    for (const c of decision.criteria.filter((x) => x.type === "regressions" && x.count === "unaccepted")) {
      root.appendChild(el("p", { class: "small muted", text: fmt(T.unacceptedRule, { name: criterionName(c), reject: REJECT, review: reviewVerdictName() }) }));
    }
    root.appendChild(el("div", { class: "verdict-grid" }, results.map((r) => {
      const failedLinks = [];
      r.failed.forEach((i, k) => {
        if (k) failedLinks.push(" / ");
        failedLinks.push(detailButton({ side: r.side, kind: "criterion", index: i }, "link-btn", criterionName(decision.criteria[i])));
      });
      const pendingLinks = [];
      r.pending.forEach((i, k) => {
        if (k) pendingLinks.push(" / ");
        pendingLinks.push(detailButton({ side: r.side, kind: "criterion", index: i }, "link-btn", criterionName(decision.criteria[i])));
      });
      const unreviewedText = fmt(T.unreviewedItems, { n: r.unreviewed, total: r.regressed.length });
      return el("div", { class: "card verdict-card verdict-card-" + r.verdict }, [
        el("div", { class: "verdict-head" }, [el("strong", { text: r.label }), detailButton({ side: r.side, kind: "verdict" }, "link-btn", verdictBadge(r.verdict))]),
        el("div", { class: "small" }, [T.failedCriteria + ": "].concat(failedLinks.length ? failedLinks : [T.none])),
        pendingLinks.length ? el("div", { class: "small" }, [T.pendingCriteria + ": "].concat(pendingLinks)) : null,
        r.rejected ? el("div", { class: "small" }, detailButton({ side: r.side, kind: "rejected" }, "link-btn", fmt(T.rejectedItems, { reject: REJECT, n: r.rejected }))) : null,
        el("div", { class: "small" }, r.unreviewed ? detailButton({ side: r.side, kind: "unreviewed" }, "link-btn", unreviewedText) : unreviewedText),
        el("div", { class: "review-nav" }, [
          el("button", { class: "btn", text: fmt(T.reviewRegressed, { n: r.regressed.length }), disabled: !r.regressed.length,
            onclick: () => { state.decisionSide = r.side; state.decisionCursor = null; renderContent(); window.scrollTo(0, 0); } }),
          cfg.tabs.includes("compare") ? el("button", { class: "btn", text: T.openCompare,
            onclick: () => { state.compareSide = r.side; state.compareView = "regressed"; state.selectedId = null; goTo("compare"); } }) : null
        ])
      ]);
    })));
    if (worseOnly()) root.appendChild(el("p", { class: "small muted", text: T.worseOnly }));

    const card = el("div", { class: "card" }, [el("h2", { text: T.criteriaTitle }), el("p", { class: "small muted", text: T.detailHint }),
      addedAfter.size ? el("p", { class: "small muted", text: T.addedAfterNote }) : null]);
    root.appendChild(card);
    const head = [el("th", { text: T.criterion }), el("th", { text: T.thresholdCol })].concat(results.map((r) => el("th", { class: "num", text: r.label })));
    const body = decision.criteria.map((c, i) => el("tr", { style: "cursor:default" }, [
      el("td", { style: "min-width:10em" }, [criterionName(c), c.note ? el("div", { class: "small muted", text: c.note }) : null]),
      el("td", { class: "num", text: criterionThreshold(c) })
    ].concat(results.map((r) => el("td", { class: "num" }, detailButton({ side: r.side, kind: "criterion", index: i }, "cell-btn",
      [el("span", { class: "cell-value", text: criterionValue(c, r.results[i]) }), passNode(r.results[i])]))))));
    body.push(el("tr", { style: "cursor:default" }, [el("td", { text: T.verdictRow }), el("td")].concat(results.map((r) =>
      el("td", { class: "num" }, detailButton({ side: r.side, kind: "verdict" }, "cell-btn", verdictBadge(r.verdict)))))));
    card.appendChild(el("div", { class: "scroll-x" }, el("table", { class: "list" }, [el("thead", null, el("tr", null, head)), el("tbody", null, body)])));
    if (state.decisionDetail) root.appendChild(renderDecisionDetail(state.decisionDetail, results));

    if (!metrics.length) return;
    const mcard = el("div", { class: "card" }, [el("h2", { text: T.metricsTitle }),
      el("p", { class: "small muted", text: fmt(T.metricsNote, { a: sideLabel.a, b: T.candidateCol }) })]);
    root.appendChild(mcard);
    const rows = [];
    for (const r of results) {
      for (const m of metrics) {
        const s = diffStats(r.pairs, m);
        rows.push(el("tr", { style: "cursor:default" }, [
          el("td", { text: r.label }), el("td", { text: m.label }),
          el("td", { class: "num", text: String(s.n) }),
          el("td", { class: "num", text: fmtMetric(s.cur, m) }),
          el("td", { class: "num", text: fmtMetric(s.cand, m) }),
          el("td", { class: "num" }, deltaNode(s.d, m)),
          el("td", { class: "num", text: s.ci ? "[" + fmtDelta(s.ci[0], m) + ", " + fmtDelta(s.ci[1], m) + "]" : "–" }),
          el("td", { text: zeroText(s) })
        ]));
      }
    }
    mcard.appendChild(el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
      el("thead", null, el("tr", null, metricsHeaders().map((h, i) => el("th", { class: i >= 2 && i <= 6 ? "num" : null, text: h })))),
      el("tbody", null, rows)])));
  }

  // ---------- release / experiment: what decided a cell or a verdict ----------

  function detailKey(d) { return d.side + ":" + d.kind + (d.index === undefined ? "" : ":" + d.index); }
  function detailOpen(d) { return state.decisionDetail !== null && detailKey(state.decisionDetail) === detailKey(d); }

  function detailButton(d, cls, children) {
    return el("button", { type: "button", class: cls, "data-detail": detailKey(d), "aria-expanded": String(detailOpen(d)),
      onclick: () => toggleDetail(d) }, children);
  }

  function focusDetailTrigger(d) {
    const node = document.querySelector('[data-detail="' + CSS.escape(detailKey(d)) + '"]');
    if (node) node.focus();
  }

  // One panel at a time; the same trigger closes it and gets the focus back.
  function toggleDetail(d) {
    const closing = detailOpen(d);
    state.decisionDetail = closing ? null : d;
    renderContent();
    if (closing) { focusDetailTrigger(d); return; }
    const panel = document.getElementById("decision-detail");
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closeDetail() {
    const d = state.decisionDetail;
    state.decisionDetail = null;
    renderContent();
    focusDetailTrigger(d);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || state.tab !== decisionTab || state.decisionSide || !state.decisionDetail) return;
    const t = e.target;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT")) return;
    e.preventDefault();
    closeDetail();
  });

  function openInReview(side, id) {
    state.decisionSide = side;
    state.decisionCursor = id;
    state.decisionUnreviewedOnly = false;
    renderContent();
    window.scrollTo(0, 0);
  }

  // The compare view lists filtered pairs; clear the (hidden on this tab) filters if they hide the item.
  function openInCompare(side, id) {
    state.compareSide = side;
    state.compareView = "regressed";
    if (!filteredPairs(side).some((p) => p.id === id)) {
      state.filters = { category: "", status: "", verdict: "", q: "" };
      renderFilters();
    }
    state.tab = "compare";
    renderTabs();
    selectPair(id);
  }

  function kvList(rows) {
    return el("dl", { class: "kv" }, rows.flatMap(([k, v]) => [el("dt", { text: k }), el("dd", null, v)]));
  }

  // Regressed items ([{ p, c }]) with their reasons, review label and note, and links.
  // Every caller shows the count next to the list, so an empty list shows nothing.
  function regressedItemList(r, xs) {
    if (!xs.length) return null;
    const withCompare = cfg.tabs.includes("compare");
    return el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
      el("thead", null, el("tr", null, [el("th", { text: cols.id }), cols.category ? el("th", { text: cols.category }) : null,
        el("th", { text: T.reason }), el("th", { text: T.yourLabel }), el("th", { text: T.note }), el("th", { text: T.goTo })])),
      el("tbody", null, xs.map((x) => {
        const rv = decisionReviewOf(r.side, x.p.id);
        return el("tr", { style: "cursor:default" }, [
          el("td", { text: x.p.id, style: "white-space:nowrap" }),
          cols.category ? el("td", { text: x.p.a[cols.category] }) : null,
          el("td", null, el("div", { style: "display:flex;flex-wrap:wrap;gap:4px" }, reasonNodes(x.c))),
          el("td", null, [el("span", { class: rv.label === REJECT ? "delta bad" : rv.label ? "" : "muted", text: rv.label || T.unlabeled }),
            reviewIsStale(rv, pairFingerprint(x.p)) ? staleBadge() : null]),
          el("td", { class: "longtext", text: rv.note || "" }),
          el("td", null, el("div", { class: "detail-links" }, [
            el("button", { type: "button", class: "link-btn", text: T.openInReview, onclick: () => openInReview(r.side, x.p.id) }),
            withCompare ? el("button", { type: "button", class: "link-btn", text: T.openCompare, onclick: () => openInCompare(r.side, x.p.id) }) : null
          ]))
        ]);
      }))]));
  }

  function signedPct(v) {
    return (v > 0 ? "+" : v < 0 ? "−" : "±") + fmtNum(Math.abs(v)) + "%";
  }

  // Only `absolute` checks a target level; relative, regressions and critical_categories
  // only bound how much worse a candidate may get, so without an absolute criterion a
  // passing verdict says nothing about improvement.
  function worseOnly() { return !decision.criteria.some((c) => c.type === "absolute"); }

  // Shows the values evaluateCriterion() computed for the verdict, never a recomputation.
  function criterionDetail(c, res, r) {
    if (c.type === "regressions") {
      if (c.count !== "unaccepted") {
        return [kvList([[T.result, passNode(res)], [T.comparedValue, fmt(T.regCount, { n: res.value, max: c.max })]]),
          regressedItemList(r, res.items)];
      }
      const counts = { n: res.value, max: c.max, total: res.total, accepted: res.accepted.length, unreviewed: res.unreviewed, rejected: res.rejected, reject: REJECT };
      const rows = [[T.result, passNode(res)], [T.comparedValue, fmt(res.rejected ? T.unacceptedCountRejected : T.unacceptedCount, counts)]];
      if (res.pending) rows.push([T.whyPending, fmt(T.pendingReason, { review: reviewVerdictName() })]);
      return [kvList(rows),
        el("h3", { text: fmt(T.countedItems, { reject: REJECT, n: res.items.length }) }), regressedItemList(r, res.items),
        el("h3", { text: fmt(T.notCountedItems, { n: res.accepted.length }) }), regressedItemList(r, res.accepted)];
    }
    if (c.type === "critical_categories") {
      const out = [kvList([[T.result, passNode(res)], [T.thresholdCol, criterionThreshold(c)]])];
      for (const cat of c.categories) {
        const xs = res.items.filter((x) => cellText(x.p.a[cols.category]) === cat);
        out.push(el("h3", { text: cols.category + " = " + cat + ": " + fmt(T.nItems, { n: xs.length }) }), regressedItemList(r, xs));
      }
      return out;
    }
    const m = metricByColumn.get(c.metric);
    // Rates also show the count of true values over n.
    const show = (v, k) => fmtMetric(v, m) + (m.aggregate === "rate" && v !== null ? " (" + k + "/" + res.n + ")" : "");
    const rows = [[T.result, passNode(res)]];
    if (c.type === "relative") rows.push([fmt(T.valueOf, { label: sideLabel.a }), show(res.cur, res.sumCur)]);
    rows.push([fmt(T.valueOf, { label: r.label }), show(res.cand, res.sumCand)],
      [T.aggregation, m.aggregate === "rate" ? T.aggRate : m.aggregate === "sum" ? T.sum : T.mean],
      [T.pairedN, String(res.n)]);
    if (c.type === "relative") {
      const d = res.cand === null ? null : res.cand - res.cur;
      rows.push([T.direction, m.better === "lower" ? T.lowerBetter : T.higherBetter],
        [fmt(T.delta, { a: sideLabel.a, b: r.label }), d === null ? "–" : [deltaNode(d, m), res.cur !== 0 ? " (" + signedPct(d / Math.abs(res.cur) * 100) + ")" : ""]],
        [T.comparedValue, criterionValue(c, res)]);
    }
    rows.push([T.thresholdCol, criterionThreshold(c)]);
    if (!res.pass) {
      let why = T.noValue;
      if (res.cand !== null && c.type === "absolute") why = c.min !== undefined && res.cand < c.min ? fmt(T.failMin, { v: fmtMetric(c.min, m) }) : fmt(T.failMax, { v: fmtMetric(c.max, m) });
      else if (res.cand !== null) why = criterionValue(c, res) + " > " + criterionThreshold(c).replace(/^≤ /, "");
      rows.push([T.whyFail, why]);
    }
    return [kvList(rows)];
  }

  function rejectedOf(r) { return r.regressed.filter((x) => decisionReviewOf(r.side, x.p.id).label === REJECT); }
  function unreviewedOf(r) { return r.regressed.filter((x) => !decisionReviewOf(r.side, x.p.id).label); }

  function verdictDetail(r) {
    const failed = r.failed.length
      ? el("ul", { class: "detail-list" }, r.failed.map((i) => el("li", null,
        detailButton({ side: r.side, kind: "criterion", index: i }, "link-btn", "✕ " + criterionName(decision.criteria[i])))))
      : el("p", { class: "small muted", text: T.none });
    const pending = r.pending.length
      ? [el("h3", { text: T.pendingCriteria }), el("ul", { class: "detail-list" }, r.pending.map((i) => el("li", null,
        detailButton({ side: r.side, kind: "criterion", index: i }, "link-btn", T.pending.split(" ")[0] + " " + criterionName(decision.criteria[i])))))]
      : [];
    return [el("h3", { text: T.failedCriteria }), failed].concat(pending, [
      el("h3", { text: fmt(T.rejectedItems, { reject: REJECT, n: r.rejected }) }), regressedItemList(r, rejectedOf(r)),
      el("h3", { text: fmt(T.unreviewedItems, { n: r.unreviewed, total: r.regressed.length }) }), regressedItemList(r, unreviewedOf(r))]);
  }

  function renderDecisionDetail(d, results) {
    const r = results.find((x) => x.side === d.side);
    let title, body;
    if (d.kind === "criterion") {
      const c = decision.criteria[d.index];
      title = criterionName(c);
      body = [c.note ? el("p", { class: "small muted", text: c.note }) : null].concat(criterionDetail(c, r.results[d.index], r));
    } else if (d.kind === "verdict") {
      title = T.verdictReasons;
      body = [el("p", null, verdictBadge(r.verdict))].concat(verdictDetail(r));
    } else if (d.kind === "rejected") {
      title = fmt(T.rejectedItems, { reject: REJECT, n: r.rejected });
      body = [regressedItemList(r, rejectedOf(r))];
    } else {
      title = fmt(T.unreviewedItems, { n: r.unreviewed, total: r.regressed.length });
      body = [regressedItemList(r, unreviewedOf(r))];
    }
    const heading = r.label + " · " + title;
    return el("div", { class: "card decision-detail", id: "decision-detail", tabindex: -1, role: "region", "aria-label": heading }, [
      el("div", { class: "verdict-head" }, [el("h2", { text: heading }), el("button", { type: "button", class: "btn", text: T.close + " (Esc)", onclick: closeDetail })])
    ].concat(body));
  }

  function metricsHeaders() {
    return [T.candidateCol, T.metric, "n", sideLabel.a, T.candidateValue, fmt(T.delta, { a: sideLabel.a, b: T.candidateCol }), T.ci,
      isExperiment ? T.ciGuide : T.containsZero];
  }

  // Whether the 95% interval contains 0. An experiment spells out how to read it; neither
  // changes a verdict.
  function zeroText(s) {
    if (!s.ci) return "–";
    const zero = s.ci[0] <= 0 && s.ci[1] >= 0;
    if (isExperiment) return zero ? T.ciIncludesZero : T.ciExcludesZero;
    return zero ? T.czYes : T.czNo;
  }

  function decisionItems(r) {
    return r.regressed.filter((x) => !state.decisionUnreviewedOnly || !decisionReviewOf(r.side, x.p.id).label);
  }

  function moveDecisionCursor(delta) {
    const r = candidateResult(state.decisionSide);
    const items = decisionItems(r);
    if (!items.length) return;
    let idx = items.findIndex((x) => x.p.id === state.decisionCursor);
    idx = idx < 0 ? 0 : Math.min(items.length - 1, Math.max(0, idx + delta));
    state.decisionCursor = items[idx].p.id;
    renderContent();
  }

  function applyDecisionLabel(id, label) {
    const side = state.decisionSide;
    const items = decisionItems(candidateResult(side));
    const idx = items.findIndex((x) => x.p.id === id);
    const current = decisionReviewOf(side, id).label;
    setDecisionReview(side, id, { label: current === label ? "" : label });
    // Advance to the next item after a judgment; toggling a label off stays put.
    if (current !== label && idx >= 0 && idx + 1 < items.length) state.decisionCursor = items[idx + 1].p.id;
    renderContent();
  }

  function renderDecisionReview(root, r) {
    const side = r.side;
    const items = decisionItems(r);
    let idx = items.findIndex((x) => x.p.id === state.decisionCursor);
    if (idx < 0 && items.length) { idx = 0; state.decisionCursor = items[0].p.id; }
    const reviewedCount = r.regressed.length - r.unreviewed;

    root.appendChild(el("div", { class: "review-bar" }, [
      el("button", { class: "btn", text: T.backToVerdicts, onclick: () => { state.decisionSide = null; renderContent(); } }),
      el("strong", { text: fmt(T.reviewTitle, { label: r.label }) }),
      verdictBadge(r.verdict),
      el("span", { class: "small muted", text: fmt(T.reviewed, { n: reviewedCount, total: r.regressed.length }) }),
      el("label", { class: "check" }, [el("input", { type: "checkbox", checked: state.decisionUnreviewedOnly,
        onchange: (e) => { state.decisionUnreviewedOnly = e.target.checked; renderContent(); } }), T.unreviewedOnly])
    ]));
    root.appendChild(el("p", { class: "small muted", text: (state.decisionStorageOk ? "✓ " + T.storageOk : "⚠ " + T.storageNo) + " · " + fmt(T.keys, { n: REVIEW_LABELS.length }) }));
    if (!r.regressed.length) { root.appendChild(el("div", { class: "card empty", text: T.noRegressedItems })); return; }

    const list = el("div", { class: "card" }, [el("h2", { text: T.allRegressed })]);
    root.appendChild(list);
    if (!items.length) list.appendChild(el("div", { class: "empty", text: T.noItems }));
    else {
      list.appendChild(el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
        el("thead", null, el("tr", null, [el("th", { text: cols.id }), cols.category ? el("th", { text: cols.category }) : null, el("th", { text: T.reason }), el("th", { text: T.yourLabel }), el("th", { text: T.note })])),
        el("tbody", null, items.map((x) => {
          const rv = decisionReviewOf(side, x.p.id);
          const select = () => { state.decisionCursor = x.p.id; renderContent(); };
          return el("tr", { tabindex: 0, "aria-selected": String(state.decisionCursor === x.p.id), onclick: select,
            onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } } }, [
            el("td", { text: x.p.id, style: "white-space:nowrap" }),
            cols.category ? el("td", { text: x.p.a[cols.category] }) : null,
            el("td", null, el("div", { style: "display:flex;flex-wrap:wrap;gap:4px" }, reasonNodes(x.c))),
            el("td", null, [el("span", { class: rv.label === REJECT ? "delta bad" : rv.label ? "" : "muted", text: rv.label || T.unlabeled }),
              reviewIsStale(rv, pairFingerprint(x.p)) ? staleBadge() : null]),
            el("td", { class: "muted", text: truncateToWidth((rv.note || "").replace(/\s+/g, " "), 200, 13) })
          ]);
        }))])));
    }
    if (!items.length) return;

    const id = items[idx].p.id;
    const rv = decisionReviewOf(side, id);
    const card = el("div", { class: "card" });
    root.appendChild(card);
    card.appendChild(el("div", { class: "review-meta" }, [el("strong", { text: (idx + 1) + " / " + items.length }),
      reviewIsStale(rv, pairFingerprint(items[idx].p)) ? staleBadge() : null]));
    card.appendChild(el("h3", { text: T.humanLabel }));
    card.appendChild(el("div", { class: "label-buttons" }, REVIEW_LABELS.map((l, i) =>
      el("button", { "aria-pressed": String(rv.label === l), onclick: () => applyDecisionLabel(id, l) }, [el("kbd", { text: String(i + 1) }), l]))));
    card.appendChild(el("h3", { text: T.note }));
    card.appendChild(el("textarea", { class: "note", id: "review-note", text: rv.note, oninput: (e) => setDecisionReview(side, id, { note: e.target.value }) }));
    card.appendChild(el("div", { class: "review-nav" }, [
      el("button", { class: "btn", text: T.prev, disabled: idx === 0, onclick: () => moveDecisionCursor(-1) }),
      el("button", { class: "btn", text: T.next, disabled: idx === items.length - 1, onclick: () => moveDecisionCursor(1) })
    ]));
    root.appendChild(renderPairDetail(items[idx].p, side));
  }

  // ---------- release / experiment record export ----------

  function recordFileName(ext) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return decisionTab + "_record_" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()) + "." + ext;
  }

  // The JSON record that config.release.record / config.experiment.record reads back.
  // read_record() in build.py checks kind, version, criteria, review_labels (and
  // an experiment's hypothesis and verdict_labels), files, candidates and their verdicts.
  function recordData(results) {
    const num = (v) => (v === null || !Number.isFinite(v) ? null : v);
    const out = {
      kind: DECISIONS[decisionTab].kind,
      version: 1,
      title: cfg.title,
      exported_at: new Date().toISOString(),
      files: { current: { label: sideLabel.a, file: state.data.a.name } }
    };
    if (isExperiment) out.hypothesis = decision.hypothesis;
    out.criteria = decision.criteria.map((c, i) => (addedAfter.has(i) ? Object.assign({}, c, { [ADDED_KEY]: true }) : c));
    out.review_labels = REVIEW_LABELS;
    if (isExperiment) out.verdict_labels = decision.verdict_labels;
    out.candidates = results.map((r) => ({
        label: r.label,
        file: state.data[r.side].name,
        verdict: r.verdict,
        paired: r.pairs.length,
        regressed: r.regressed.length,
        unreviewed: r.unreviewed,
        rejected: r.rejected,
        criteria: decision.criteria.map((c, i) => Object.assign({ index: i, value: num(r.results[i].value), pass: r.results[i].pass },
          r.results[i].pending ? { pending: true } : {})),
        metrics: metrics.map((m) => {
          const s = diffStats(r.pairs, m);
          return { column: m.column, label: m.label, n: s.n, current: num(s.cur), candidate: num(s.cand), difference: num(s.d), ci95: s.ci ? s.ci.map(num) : null };
        }),
        reviews: r.regressed.map((x) => {
          const rv = decisionReviewOf(r.side, x.p.id);
          return { id: x.p.id, label: rv.label || "", note: rv.note || "" };
        })
      }));
    return out;
  }

  function recordJson(results) { return JSON.stringify(recordData(results), null, 2) + "\n"; }

  function mdCell(s) { return String(s).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " "); }
  function mdRow(cells) { return "| " + cells.map(mdCell).join(" | ") + " |"; }
  function mdTable(headers, rows) {
    return [mdRow(headers), "|" + headers.map(() => "---").join("|") + "|"].concat(rows.map(mdRow)).join("\n");
  }

  function recordMarkdown(results) {
    const out = ["# " + cfg.title + " — " + (isExperiment ? T.experimentRecordTitle : T.recordTitle), "",
      "- " + T.exportedAt + ": " + new Date().toLocaleString(cfg.lang)];
    if (isExperiment) out.push("", "## " + T.hypothesis, "", decision.hypothesis);
    if (decision.description) out.push("", decision.description.trim());
    out.push("", "## " + T.dataFiles, "",
      "- " + sideLabel.a + ": " + state.data.a.name);
    for (const r of results) out.push("- " + r.label + ": " + state.data[r.side].name);
    out.push("", "## " + T.criteriaH, "");
    decision.criteria.forEach((c) => {
      out.push("- " + criterionName(c) + ": " + criterionThreshold(c));
      if (c.note) out.push("  " + c.note.replace(/\s*\n\s*/g, " "));
    });
    if (addedAfter.size) out.push("", T.addedAfterNote);
    out.push("", "## " + T.summaryH, "");
    const rows = decision.criteria.map((c, i) => [criterionName(c), criterionThreshold(c)]
      .concat(results.map((r) => criterionValue(c, r.results[i]) + " " + passText(r.results[i]))));
    rows.push([T.verdictRow, ""].concat(results.map((r) => verdictText(r.verdict))));
    out.push(mdTable([T.criterion, T.thresholdCol].concat(results.map((r) => r.label)), rows));
    out.push("");
    for (const r of results) {
      out.push("- " + r.label + ": " + verdictText(r.verdict) + " · " + fmt(T.unreviewedItems, { n: r.unreviewed, total: r.regressed.length }) +
        (r.rejected ? " · " + fmt(T.rejectedItems, { reject: REJECT, n: r.rejected }) : ""));
    }
    if (worseOnly()) out.push("", T.worseOnly);
    if (metrics.length) {
      out.push("", "## " + T.metricsTitle, "", fmt(T.metricsNote, { a: sideLabel.a, b: T.candidateCol }), "");
      const mrows = [];
      for (const r of results) {
        for (const m of metrics) {
          const s = diffStats(r.pairs, m);
          mrows.push([r.label, m.label, String(s.n), fmtMetric(s.cur, m), fmtMetric(s.cand, m), s.d === null ? "–" : fmtDelta(s.d, m),
            s.ci ? "[" + fmtDelta(s.ci[0], m) + ", " + fmtDelta(s.ci[1], m) + "]" : "–", zeroText(s)]);
        }
      }
      out.push(mdTable(metricsHeaders(), mrows));
    }
    out.push("", "## " + T.reviewsH);
    for (const r of results) {
      out.push("", "### " + r.label, "");
      if (!r.regressed.length) { out.push(T.noRegressedItems); continue; }
      out.push(mdTable([cols.id].concat(cols.category ? [cols.category] : [], [T.reason, T.yourLabel, T.note]), r.regressed.map((x) => {
        const rv = decisionReviewOf(r.side, x.p.id);
        const reasons = x.c.changes.map(changeText).join("; ");
        return [x.p.id].concat(cols.category ? [cellText(x.p.a[cols.category])] : [], [reasons, rv.label || T.unlabeled, rv.note || ""]);
      })));
    }
    return out.join("\n") + "\n";
  }

  // ---------- report ----------

  function renderReport(root) {
    const now = CAND_SIDES.map(candidateResult);
    const diffs = now.filter((r) => decisionRecord.verdicts[r.label] !== r.verdict)
      .map((r) => fmt(T.staleItem, { label: r.label, was: verdictText(decisionRecord.verdicts[r.label]), now: verdictText(r.verdict) }));
    if (diffs.length) root.appendChild(el("div", { class: "banner" }, el("p", { text: "⚠ " + fmt(T.reportStale, { diffs: diffs.join(", ") }) })));
    // The download and the copy are the report body as embedded at build time (without the
    // frontmatter), for pasting into other documents.
    root.appendChild(el("div", { class: "table-toolbar" }, [
      el("button", { class: "btn", text: T.exportReport, onclick: () => download(payload.report + "\n", decision.report, "text/markdown;charset=utf-8") }),
      copyButton(T.copyReport, () => payload.report + "\n")]));
    root.appendChild(el("div", { class: "card report" }, renderMarkdown(payload.report)));
  }

  // A small Markdown subset: ATX headings, paragraphs, flat - / * / 1. lists, pipe tables,
  // **bold** and *italic*. Every piece of text goes in through text nodes, so HTML in the
  // report is shown as text.
  function renderMarkdown(text) {
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
    const isSeparator = (l) => /^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(l);
    const listItem = (l) => /^\s*(?:([-*])|(\d+)[.)])\s+(.*)$/.exec(l);
    const splitRow = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
      if (h) { out.push(el("h" + Math.min(6, h[1].length + 1), { class: "md-h" }, inline(h[2]))); i++; continue; }
      if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
        const head = splitRow(line);
        i += 2;
        const body = [];
        while (i < lines.length && isTableRow(lines[i])) { body.push(splitRow(lines[i])); i++; }
        out.push(el("div", { class: "scroll-x" }, el("table", { class: "list" }, [
          el("thead", null, el("tr", null, head.map((c) => el("th", null, inline(c))))),
          el("tbody", null, body.map((row) => el("tr", { style: "cursor:default" }, head.map((_, k) => el("td", null, deltaCell(row[k] || ""))))))])));
        continue;
      }
      const li = listItem(line);
      if (li) {
        const ordered = !li[1];
        const items = [];
        let m;
        while (i < lines.length && (m = listItem(lines[i])) && !m[1] === ordered) { items.push(m[3]); i++; }
        out.push(el(ordered ? "ol" : "ul", { class: "md-list" }, items.map((t) => el("li", null, inline(t)))));
        continue;
      }
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^#{1,6}\s/.test(lines[i]) && !listItem(lines[i]) &&
        !(isTableRow(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1]))) { para.push(lines[i].trim()); i++; }
      out.push(el("p", null, inline(para.join(" "))));
    }
    return out;
  }

  // `marks` false leaves ▲ / ▼ uncoloured (a table cell coloured as a whole).
  function inline(text, marks) {
    const plain = marks === false ? (t) => [t] : markDeltas;
    const nodes = [];
    const re = /\*\*(.+?)\*\*|\*([^*\s](?:[^*]*[^*\s])?)\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) nodes.push(...plain(text.slice(last, m.index)));
      nodes.push(m[1] !== undefined ? el("strong", null, inline(m[1], marks)) : el("em", null, plain(m[2])));
      last = re.lastIndex;
    }
    if (last < text.length) nodes.push(...plain(text.slice(last)));
    return nodes;
  }

  // In a report, ▲ / ▼ give the direction of the number (as in the page's differences);
  // whether it is better or worse comes only from the words written next to it, which
  // pick the colour. Neither word, or both, means no colour. Classes only, never styles
  // from the report.
  const BETTER_WORDS = /改善|\b(?:better|improved?)\b/i;
  const WORSE_WORDS = /悪化|\b(?:worse|regressed)\b/i;
  function deltaWordClass(text) {
    const good = BETTER_WORDS.test(text), bad = WORSE_WORDS.test(text);
    return good === bad ? null : "delta " + (good ? "good" : "bad");
  }

  // Colours each fragment from ▲ / ▼ to the next 、。,; or closing parenthesis.
  function markDeltas(text) {
    const out = [];
    const re = /[▲▼][^▲▼、。，,；;)）]*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      const cls = deltaWordClass(m[0]);
      if (!cls) continue;
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(el("span", { class: cls, text: m[0] }));
      last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }

  // A table cell that starts with ▲ / ▼ is coloured as a whole, from the words anywhere in it.
  function deltaCell(text) {
    const mark = text.trimStart()[0];
    if (mark !== "▲" && mark !== "▼") return inline(text);
    const cls = deltaWordClass(text);
    return cls ? el("span", { class: cls }, inline(text, false)) : inline(text);
  }

  // ---------- table ----------

  const TRUNCATE_AT = 140;

  // `links` turns URLs into links (columns.text). A truncated cell gets them only once
  // expanded, since the cut may fall inside a URL.
  function textFormatter(cell, links) {
    const value = String(cell.getValue() ?? "");
    const span = el("span", { class: "cell-text" });
    if (value.length <= TRUNCATE_AT) { appendChildren(span, links ? linkify(value) : value); return span; }
    let expanded = false;
    const body = el("span");
    const more = el("button", { class: "cell-more", type: "button" });
    const paint = () => {
      body.replaceChildren(...(expanded && links ? linkify(value) : [expanded ? value : value.slice(0, TRUNCATE_AT) + "…"]));
      more.textContent = expanded ? "▲" : "▼";
      more.setAttribute("aria-label", expanded ? "collapse" : "expand");
    };
    more.addEventListener("click", (e) => {
      e.stopPropagation();
      expanded = !expanded;
      paint();
      cell.getRow().normalizeHeight();
    });
    paint();
    span.append(body, more);
    return span;
  }

  function plainFormatter(cell) {
    return el("span", { text: String(cell.getValue() ?? "") });
  }

  function renderTable(root) {
    const side = state.side;
    appendSideToggle(root);
    const d = state.data[side];
    const rows = filteredRows(side);
    const withReview = side === "a" && cfg.tabs.includes("review");
    const headers = d.headers.concat(withReview ? REVIEW_EXPORT_COLUMNS : []);
    // Fields are positional so header names containing "." are not read as nested paths.
    const field = (i) => "f" + i;
    const data = rows.map((r) => {
      const obj = {};
      const rv = withReview ? reviewOf(r[cols.id]) : null;
      headers.forEach((h, i) => {
        obj[field(i)] = i < d.headers.length ? cellText(r[h]) :(h === "human_label" ? rv.label : rv.note);
      });
      return obj;
    });
    const dims = new Set(["category", "status", "verdict"].map((k) => cols[k]).filter(Boolean).concat(withReview ? ["human_label"] : []));
    const numeric = new Set(metrics.filter((m) => m.aggregate !== "rate").map((m) => m.column));
    const longText = new Set(cols.text.concat(withReview ? ["human_note"] : []));
    const percent = new Map(metrics.filter((m) => m.aggregate !== "rate" && isPercent(m)).map((m) => [m.column, m]));
    const columns = headers.map((h, i) => {
      const c = { title: h, field: field(i), headerFilter: "input", formatter: plainFormatter };
      if (dims.has(h)) Object.assign(c, { headerFilter: "list", headerFilterParams: { valuesLookup: true, clearable: true }, headerFilterFunc: "=" });
      if (numeric.has(h)) Object.assign(c, { sorter: "number", hozAlign: "right" });
      if (percent.has(h)) {
        // Shown as % while the data and the download keep the fraction; the filter matches either.
        const m = percent.get(h);
        const shown = (v) => { const n = parseNum(v); return n === null ? String(v ?? "") : fmtMetric(n, m); };
        Object.assign(c, {
          formatter: (cell) => el("span", { text: shown(cell.getValue()) }),
          headerFilterFunc: (q, v) => {
            const s = String(q).toLowerCase();
            return String(v ?? "").toLowerCase().includes(s) || shown(v).toLowerCase().includes(s);
          }
        });
      }
      if (longText.has(h)) {
        const links = cols.text.includes(h);
        Object.assign(c, { formatter: (cell) => textFormatter(cell, links), width: 320, variableHeight: true, cssClass: "wrap" });
      }
      if (h === cols.id) c.frozen = window.innerWidth > 600;
      return c;
    });

    const groupField = cols.category ? field(headers.indexOf(cols.category)) : null;
    const toolbar = el("div", { class: "table-toolbar" }, [
      groupField ? el("label", { class: "check" }, [el("input", { type: "checkbox", checked: state.groupBy, onchange: (e) => { state.groupBy = e.target.checked; renderContent(); } }), T.groupBy]) : null,
      el("button", { class: "btn", text: T.download, onclick: () => state.table && state.table.download("csv", baseName(d.name) + "_filtered.csv", { bom: true }, "active") })
    ]);
    root.appendChild(toolbar);
    const holder = el("div");
    root.appendChild(holder);
    state.table = new Tabulator(holder, {
      data: data,
      columns: columns,
      layout: "fitDataFill",
      height: "70vh",
      placeholder: T.noItems,
      groupBy: state.groupBy && groupField ? groupField : false,
      columnDefaults: { maxWidth: 420, headerSortTristate: true }
    });
  }

  // ---------- extra tabs ----------

  // Segments that are status / verdict values keep the overview's colors; others get slots in order.
  function segmentColors(segments) {
    if (segments.every((v) => state.colorIndex.has(v))) return seriesVar;
    const slots = new Map(segments.map((v, i) => [v, i < SERIES_SLOTS ? "--series-" + (i + 1) : "--series-other"]));
    return (v) => slots.get(v) || "--series-other";
  }

  // `countOf(category, segment)` returns the count; the result is a legend plus the chart.
  function stackedBarChart(holder, categories, segments, countOf) {
    const counts = new Map();
    for (const c of categories) for (const s of segments) counts.set(c + "\u0000" + s, countOf(c, s) || 0);
    const colorOf = segmentColors(segments);
    return el("div", null, [legend(segments, colorOf), stackedBars(holder, categories, segments, counts, false, colorOf)]);
  }

  function histogramChart(holder, values, unit) {
    if (!values.length) return el("div", { class: "empty", text: T.noItems });
    return histogram(holder, values, { aggregate: "mean", unit: unit || "" }).svg;
  }

  // Rows follow the filter bar, like the built-in tabs.
  function extraContext(container) {
    return {
      container: container,
      lang: cfg.lang,
      columns: cols,
      order: cfg.order,
      // With candidates, b / rowsB / pairs are the candidate selected in the compare tab.
      labels: { a: sideLabel.a, b: hasB ? sideLabel[state.compareSide] : null },
      rows: filteredRows("a"),
      rowsB: hasB ? filteredRows(state.compareSide) : null,
      pairs: hasB ? filteredPairs(state.compareSide) : null,
      candidates: CAND_SIDES.map((s) => ({ label: sideLabel[s], rows: filteredRows(s), pairs: filteredPairs(s) })),
      el: el,
      cellText: cellText,
      formatNumber: fmtNum,
      barChart: singleBars,
      stackedBarChart: stackedBarChart,
      histogramChart: histogramChart,
      dataTable: dataTable,
      downloadCsv: downloadCsv
    };
  }

  function renderExtra(root, id) {
    const render = extraRenderers.get(id);
    if (!render) {
      root.appendChild(el("div", { class: "banner error", text: fmt(T.extraMissing, { id: id }) }));
      return;
    }
    const container = el("div", { class: "extra-tab" });
    root.appendChild(container);
    try {
      render(extraContext(container));
    } catch (err) {
      console.error("eval-review: extra tab " + JSON.stringify(id) + " failed", err);
      container.replaceChildren(el("div", { class: "banner error", text: fmt(T.extraError, { msg: errorText(err) }) }));
    }
  }

  function registerTab(id, render) {
    if (!extraTitle.has(id)) throw new Error("registerTab: " + JSON.stringify(id) + " is not in config.extra_tabs");
    if (typeof render !== "function") throw new Error("registerTab: render for " + JSON.stringify(id) + " must be a function");
    if (extraRenderers.has(id)) throw new Error("registerTab: " + JSON.stringify(id) + " is already registered");
    extraRenderers.set(id, render);
    // Scripts run after the first render, so redraw if this tab is already showing.
    if (state.tab === id) renderContent();
  }

  // ---------- main render ----------

  function renderContent() {
    hideTip();
    if (state.table) { state.table.destroy(); state.table = null; }
    const root = document.getElementById("content");
    root.replaceChildren();
    renderBanner();
    // The release / experiment decision and its report always use every item, so the filter bar is hidden there.
    document.getElementById("filters").hidden = needsLoad() || state.tab === decisionTab || state.tab === "report";
    if (needsLoad()) renderLoadPanel(root);
    else if (!rowsOf("a").length) root.appendChild(el("div", { class: "card empty", text: T.noData }));
    else if (state.tab === "overview") renderOverview(root);
    else if (state.tab === "compare") renderCompare(root);
    else if (state.tab === "review") renderReview(root);
    else if (state.tab === "table") renderTable(root);
    else if (state.tab === decisionTab) renderDecision(root);
    else if (state.tab === "report") renderReport(root);
    else if (extraTitle.has(state.tab)) renderExtra(root, state.tab);
    updateCount();
  }

  function renderAll() {
    computeColors();
    renderHeader();
    renderTabs();
    renderFilters();
    renderContent();
  }

  // ---------- loading CSV in the browser ----------

  function errorText(err) { return String(err && err.message ? err.message : err); }

  // Input format by extension. Must match FORMATS in build.py.
  function formatOf(name) {
    const m = /\.(csv|json|jsonl)$/i.exec(name);
    if (!m) throw new Error(fmt(T.badExt, { name: name }));
    return m[1].toLowerCase();
  }

  // Strips the input extension for export file names; exports are always CSV.
  function baseName(name) { return name.replace(/\.(csv|json|jsonl)$/i, ""); }

  const FILE_ACCEPT = ".csv,.json,.jsonl,text/csv,application/json";

  // Parse a File or text by the extension of `name`; resolves to { headers, rows }.
  async function parseData(input, name) {
    const format = formatOf(name);
    if (format === "csv") return parseCsv(input);
    return parseJson(typeof input === "string" ? input : await input.text(), format);
  }

  function rejectWith(errors) {
    const err = new Error(errors.join("; "));
    err.details = errors;
    throw err;
  }

  function parseJsonText(source, where) {
    try {
      return JSON.parse(source);
    } catch (e) {
      throw new Error(fmt(T.badJson, { where: where, msg: errorText(e) }));
    }
  }

  // Nested non-empty objects become "parent.child" columns; other values stay as is.
  // A Map, so a key such as "__proto__" is an ordinary column name.
  function flattenRecord(obj, prefix, out, where) {
    for (const [k, v] of Object.entries(obj)) {
      const name = prefix + k;
      if (isPlainObject(v) && Object.keys(v).length) flattenRecord(v, name + ".", out, where);
      else if (out.has(name)) throw new Error(fmt(T.dupKey, { where: where, col: name }));
      else out.set(name, v);
    }
  }

  // Same rules as read_json() in build.py: a .json array (or the array at
  // data.records_path) or .jsonl with one object per line; then the CSV checks.
  function parseJson(text, format) {
    const recordsPath = cfg.data.records_path || null;
    const records = [];
    if (format === "jsonl") {
      if (recordsPath) throw new Error(T.recordsPathOnlyJson);
      text.split("\n").forEach((line, i) => {
        const where = fmt(T.line, { n: i + 1 });
        if (line.trim()) records.push({ where: where, value: parseJsonText(line, where) });
      });
    } else {
      let node = parseJsonText(text, T.document);
      if (recordsPath) {
        for (const key of recordsPath.split(".")) {
          if (!isPlainObject(node) || !Object.prototype.hasOwnProperty.call(node, key)) {
            throw new Error(fmt(T.recordsMissing, { path: recordsPath }));
          }
          node = node[key];
        }
      }
      if (!Array.isArray(node)) throw new Error(T.notArray);
      node.forEach((v, i) => records.push({ where: fmt(T.record, { n: i + 1 }), value: v }));
    }
    if (!records.length) throw new Error(T.noRecords);
    const headerSet = new Set();
    const flats = records.map(({ where, value }) => {
      if (!isPlainObject(value)) throw new Error(fmt(T.notObject, { where: where }));
      const flat = new Map();
      flattenRecord(value, "", flat, where);
      for (const k of flat.keys()) headerSet.add(k);
      return flat;
    });
    const headers = [...headerSet];
    const errors = [];
    flats.forEach((flat, i) => {
      const id = flat.get(cols.id);
      if (typeof id === "number" && Math.abs(id) > MAX_SAFE_ID) errors.push(fmt(T.unsafeId, { r: i + 1, id: id }));
    });
    if (errors.length) rejectWith(errors);
    // A key missing from a record is an empty cell, as in a CSV.
    const rows = flats.map((flat) => Object.fromEntries(headers.map((h) => [h, toCell(flat.get(h))])));
    errors.push(...validateTable(headers, rows).slice(0, 10));
    if (errors.length) rejectWith(errors);
    return { headers: headers, rows: rows };
  }

  // Parse a File or CSV text and run the same checks as the build script. Resolves to
  // { headers, rows }; rejects with an Error whose `details` lists every problem found.
  function parseCsv(input) {
    return new Promise((resolve, reject) => {
      Papa.parse(input, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h) => h.replace(/^\uFEFF/, ""),
        complete: (res) => {
          const headers = res.meta.fields || [];
          const errors = res.errors.slice(0, 5).map((e) => fmt(T.parseErr, { r: (e.row ?? 0) + 1, msg: e.message }));
          if (!errors.length) errors.push(...validateTable(headers, res.data).slice(0, 10));
          if (errors.length) {
            const err = new Error(errors.join("; "));
            err.details = errors;
            reject(err);
            return;
          }
          const rows = res.data.map((r) => {
            const o = {};
            for (const h of headers) o[h] = r[h] ?? "";
            return o;
          });
          resolve({ headers: headers, rows: rows });
        },
        error: reject
      });
    });
  }

  function setSide(side, table, name, path) {
    state.errors = [];
    state.data[side] = { name: name, path: path || null, headers: table.headers, rows: table.rows, origin: "loaded", loadedAt: new Date() };
    state.selectedId = null;
    if (side === "a") initReview();
    initDecisionReview();
    renderAll();
  }

  function showLoadError(name, err) {
    state.errors = [fmt(T.loadErr, { name: name })].concat(err && err.details ? err.details : [errorText(err)]);
    renderContent();
  }

  // `handle` is the FileSystemFileHandle the file came from, if any; it enables Reload.
  async function loadFile(file, side, handle) {
    let table;
    try {
      table = await parseData(file, file.name);
    } catch (err) {
      showLoadError(file.name, err);
      return;
    }
    state.handles[side] = handle || null;
    state.fetched[side] = false;
    if (handle) {
      state.saved[side] = handle;
      rememberHandle(side, handle);
    }
    setSide(side, table, file.name);
  }

  // ---------- load mode: fetching the default CSV over http(s) ----------

  async function fetchDefault(side) {
    const path = defaultPath[side];
    const url = new URL(path.split("/").map(encodeURIComponent).join("/"), location.href);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return parseData(await res.text(), path);
  }

  // On open, a failure only adds a note and leaves the side to the picker; on Reload it
  // is an error and the previously loaded data stays.
  async function loadDefault(side, onOpen) {
    const path = defaultPath[side];
    let table;
    try {
      table = await fetchDefault(side);
    } catch (err) {
      if (onOpen) state.autoNotes.push(fmt(T.autoFail, { path: path, msg: errorText(err) }));
      else showLoadError(path, err);
      return;
    }
    state.handles[side] = null;
    state.fetched[side] = true;
    setSide(side, table, path.split("/").pop(), path);
  }

  async function autoLoad() {
    if (!loadMode) return;
    if (!canFetch) {
      state.autoNotes.push(T.autoFile);
    } else {
      state.autoLoading = true;
      renderContent();
      for (const side of SIDES) await loadDefault(side, true);
      state.autoLoading = false;
    }
    if (needsLoad()) renderContent();
  }

  // ---------- load mode: empty state, picker, remembered files ----------

  function renderLoadPanel(root) {
    const card = el("div", { class: "card load-panel" }, [
      el("h2", { text: T.loadTitle }),
      el("p", { class: "muted", text: T.loadIntro }),
      ...state.autoNotes.map((n) => el("p", { class: "small", text: "ⓘ " + n })),
      el("p", { class: "small", text: fmt(T.requiredCols, { cols: requiredColumns().join(", ") }) })
    ]);
    for (const side of SIDES) {
      const d = state.data[side];
      const saved = state.saved[side];
      const status = d ? "✓ " + sourceText(d)
        : state.autoLoading ? fmt(T.autoLoading, { path: defaultPath[side] }) : T.notLoaded;
      card.appendChild(el("div", { class: "load-side" }, [
        el("h3", { text: (hasB ? sideLabel[side] + " — " : "") + fmt(T.expectedFile, { name: expectedName[side] }) }),
        defaultPath[side] ? el("p", { class: "small muted", text: fmt(T.defaultPath, { path: defaultPath[side] }) }) : null,
        el("p", { class: "small" + (d ? "" : " muted"), text: status }),
        el("div", { class: "load-actions" }, [
          canPick
            ? el("button", { class: "btn", type: "button", text: T.chooseFile, onclick: () => pickFile(side) })
            : el("label", { class: "btn" }, [T.chooseFile, el("input", { type: "file", accept: FILE_ACCEPT,
                onchange: (e) => { if (e.target.files[0]) loadFile(e.target.files[0], side); e.target.value = ""; } })]),
          saved && !d ? el("button", { class: "btn", type: "button", text: fmt(T.lastFile, { name: saved.name }), onclick: () => readHandle(side, saved) }) : null
        ])
      ]));
    }
    root.appendChild(card);
  }

  async function pickFile(side) {
    let picked;
    try {
      picked = await window.showOpenFilePicker({ types: [{ description: "CSV / JSON / JSONL", accept: { "text/csv": [".csv"], "application/json": [".json", ".jsonl"] } }] });
    } catch (e) {
      if (e.name !== "AbortError") showLoadError(expectedName[side], e);
      return;
    }
    await readHandle(side, picked[0]);
  }

  // Must run from a click: requestPermission needs a user gesture.
  async function readHandle(side, handle) {
    try {
      const opts = { mode: "read" };
      if ((await handle.queryPermission(opts)) !== "granted" && (await handle.requestPermission(opts)) !== "granted") return;
      loadFile(await handle.getFile(), side, handle);
    } catch (e) {
      showLoadError(handle.name, e);
    }
  }

  // Re-read every side from where it came from (a fetched default path or a picked file);
  // if any side was dropped or chosen without a handle, go back to the empty state so the
  // user can pick or drop the updated CSV.
  function reload() {
    if (SIDES.every((s) => state.fetched[s] || state.handles[s])) {
      (async () => {
        for (const s of SIDES) {
          if (state.fetched[s]) await loadDefault(s, false);
          else await readHandle(s, state.handles[s]);
        }
      })();
      return;
    }
    state.data = perSide(() => null);
    state.errors = [];
    state.selectedId = null;
    initReview();
    initDecisionReview();
    renderAll();
  }

  // Remembered handles are a convenience only: IndexedDB can be missing or blocked
  // (private windows, file:// in some browsers), so every failure is ignored on purpose.
  const IDB_NAME = "eval-review", IDB_STORE = "handles";

  function idbRequest(mode, makeRequest) {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open(IDB_NAME, 1);
      open.onupgradeneeded = () => open.result.createObjectStore(IDB_STORE);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction(IDB_STORE, mode);
        const req = makeRequest(tx.objectStore(IDB_STORE));
        tx.oncomplete = () => { db.close(); resolve(req.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
      };
    });
  }

  function handleKey(side) { return STORAGE_PREFIX + cfg.title + "\u0000" + side; }

  async function rememberHandle(side, handle) {
    try { await idbRequest("readwrite", (store) => store.put(handle, handleKey(side))); } catch (e) { /* optional */ }
  }

  async function recallHandles() {
    if (!loadMode || !canPick) return;
    let found = false;
    for (const side of SIDES) {
      try {
        const handle = await idbRequest("readonly", (store) => store.get(handleKey(side)));
        if (handle && !state.saved[side]) { state.saved[side] = handle; found = true; }
      } catch (e) { /* optional */ }
    }
    if (found && needsLoad()) renderContent();
  }

  // A drop in load mode fills the side whose expected file name matches, then any side
  // still empty; in embed mode it replaces A, as before.
  function dropFiles(files) {
    if (!loadMode) { if (files[0]) loadFile(files[0], "a"); return; }
    const free = SIDES.slice();
    for (const file of files.slice(0, SIDES.length)) {
      const side = free.find((s) => expectedName[s] === file.name) || free.find((s) => !state.data[s]) || free[0];
      free.splice(free.indexOf(side), 1);
      loadFile(file, side);
    }
  }

  const overlay = document.getElementById("drop-overlay");
  overlay.textContent = loadMode ? T.dropHintLoad : fmt(T.dropHint, { label: sideLabel.a });
  let dragDepth = 0;
  document.addEventListener("dragenter", (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { dragDepth++; overlay.hidden = false; } });
  document.addEventListener("dragleave", () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) overlay.hidden = true; });
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDepth = 0;
    overlay.hidden = true;
    if (e.dataTransfer) dropFiles([...e.dataTransfer.files]);
  });

  let resizeTimer = null;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    // Charts are sized once when drawn, so tabs that may hold charts redraw on resize.
    if (window.innerWidth === lastWidth || !(state.tab === "overview" || extraTitle.has(state.tab))) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderContent, 150);
  });

  window.EvalReview = Object.freeze({ registerTab: registerTab });

  initReview();
  initDecisionReview();
  renderAll();
  recallHandles();
  autoLoad();
})();
