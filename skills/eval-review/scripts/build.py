#!/usr/bin/env python3
"""Build a single self-contained HTML page from local CSV, JSON, or JSONL files.

Usage:
    python3 build.py --config cfg.json --out out.html [--csv a.csv]
        [--mode embed|load]

Data paths in the config are resolved relative to the config file; --csv overrides the
main file (resolved relative to the current directory). The format follows the
extension (.csv, .json, .jsonl); nested JSON objects become dot-separated columns. In
"load" mode the files are still read and validated, but no rows are written to the HTML:
it stores each file's path relative to the output HTML, fetches it on open when served
over http(s), and otherwise asks for the file. Python 3 stdlib only.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ASSETS = SKILL_DIR / "assets"

TABS = ("overview", "compare", "review", "table", "release", "experiment", "report")
AGGREGATES = ("mean", "sum", "rate")
BETTER = ("higher", "lower", "none")
LANGS = ("ja", "en")
MODES = ("embed", "load")

TOP_KEYS = {"title", "lang", "item_label", "tabs", "data", "columns", "order", "histogram",
            "review", "extra_tabs", "release", "experiment"}
RELEASE_KEYS = {"criteria", "review_labels", "record", "report", "description"}
EXPERIMENT_KEYS = RELEASE_KEYS | {"hypothesis", "verdict_labels"}
# Display-only keys of a criterion: a name shown instead of the default one and a short
# explanation. They never change a verdict, so a record is checked without them.
CRITERION_DISPLAY_KEYS = {"label", "note"}
CRITERION_KEYS = {
    "absolute": {"type", "metric", "min", "max"} | CRITERION_DISPLAY_KEYS,
    "relative": {"type", "metric", "max_worse", "max_worse_pct"} | CRITERION_DISPLAY_KEYS,
    "regressions": {"type", "max", "count"} | CRITERION_DISPLAY_KEYS,
    "critical_categories": {"type", "categories"} | CRITERION_DISPLAY_KEYS,
}
# How a regressions criterion counts: every regressed item, or only those not accepted in
# review (unreviewed or rejected). Must match evaluateCriterion() in app.js.
REGRESSION_COUNTS = ("all", "unaccepted")
# The last review label rejects an item. Must match the release / experiment tab in app.js.
DEFAULT_REVIEW_LABELS = {"ja": ["許容", "不可"], "en": ["acceptable", "unacceptable"]}


@dataclass(frozen=True)
class Decision:
    """A tab that judges each candidate against criteria: "release" or "experiment".

    Both share the criteria, the review of regressed items, the record, and the report;
    they differ in their keys, the record kind, and the verdict codes. Must match
    DECISIONS in app.js.
    """
    tab: str
    keys: frozenset[str]
    record_kind: str
    # Codes for: every criterion met and no regressed item left unreviewed; a regressed
    # item left unreviewed; a criterion not met or an item rejected.
    verdicts: tuple[str, str, str]


DECISIONS = {
    "release": Decision("release", frozenset(RELEASE_KEYS), "eval-review/release-record",
                        ("go", "review", "no-go")),
    "experiment": Decision("experiment", frozenset(EXPERIMENT_KEYS),
                           "eval-review/experiment-record", ("pass", "review", "fail")),
}
DATA_KEYS = {"csv", "candidates", "label_a", "mode", "records_path"}
CANDIDATE_KEYS = {"file", "label"}
# Replaced by data.candidates; a config using them gets an error showing the rewrite.
REMOVED_DATA_KEYS = ("csv_b", "label_b")
COLUMN_KEYS = {"id", "text", "collapsed", "sections", "category", "status", "verdict", "metrics"}
SECTION_KEYS = {"title", "columns", "layout"}
SECTION_LAYOUTS = ("stack", "side-by-side")
METRIC_KEYS = {"column", "label", "unit", "aggregate", "better", "regression_threshold", "format"}
METRIC_FORMATS = ("percent",)
REVIEW_KEYS = {"labels"}
EXTRA_TAB_KEYS = {"id", "title", "script"}

# Boolean spellings accepted for aggregate "rate". Must match parseBool() in app.js.
TRUE_VALUES = {"true", "1", "yes", "y", "t"}
FALSE_VALUES = {"false", "0", "no", "n", "f"}

# Input formats by file extension. Must match formatOf() in app.js.
FORMATS = (".csv", ".json", ".jsonl")

# Larger numbers lose precision in the browser (JavaScript doubles), so ids beyond this
# would silently change or collide there. Must match MAX_SAFE_ID in app.js.
MAX_SAFE_INTEGER = 2**53 - 1

# Added to exported review CSVs; a source file must not already use them.
REVIEW_EXPORT_COLUMNS = ("human_label", "human_note")

# Embed mode makes no requests at all. Load mode may fetch its default data file(s) from the
# same origin when the page is served over http(s); nothing else is allowed.
CSP_EMBED = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:"
CSP_LOAD = CSP_EMBED + "; connect-src 'self'"


class BuildError(Exception):
    """A user-facing error: bad config, missing file, or invalid CSV / JSON content."""


@dataclass(frozen=True)
class Table:
    path: Path
    headers: list[str]
    # CSV cells are strings. JSON cells keep their JSON value: str, int, float, bool, None,
    # or a list / dict that flattening left in place.
    rows: list[dict[str, object]]
    # Where each row came from, for error messages ("row 3", "line 3", "record 3").
    locations: list[str]


def fail(message: str) -> None:
    raise BuildError(message)


def check_keys(obj: object, allowed: set[str], where: str) -> dict:
    if not isinstance(obj, dict):
        fail(f"{where} must be a JSON object")
    unknown = sorted(set(obj) - allowed)
    if unknown:
        fail(f"{where}: unknown key(s) {unknown}; allowed: {sorted(allowed)}")
    return obj


def require_str(obj: dict, key: str, where: str) -> str:
    value = obj.get(key)
    if not isinstance(value, str) or not value:
        fail(f"{where}.{key} must be a non-empty string")
    return value


def optional_str(obj: dict, key: str, where: str) -> str | None:
    if key not in obj or obj[key] is None:
        return None
    return require_str(obj, key, where)


def optional_text(obj: dict, key: str, where: str) -> None:
    """An optional display string: when present, a string with something besides spaces."""
    if key in obj and (not isinstance(obj[key], str) or not obj[key].strip()):
        fail(f"{where}.{key} must be a non-empty string")


def text_subset(value: object, text: list[str], where: str) -> list[str]:
    """Checks a list of distinct columns.text names (a typo is an error, not ignored)."""
    if not isinstance(value, list) or not all(isinstance(c, str) and c for c in value):
        fail(f"{where} must be a list of column names")
    missing = [c for c in value if c not in text]
    if missing:
        fail(f"{where}: {missing} not in config.columns.text {text}")
    repeated = sorted({c for c in value if value.count(c) > 1})
    if repeated:
        fail(f"{where}: {repeated} listed more than once")
    return value


def validate_sections(sections: object, text: list[str]) -> None:
    """columns.sections: headed groups of text columns. Text columns in no section are
    shown last under "Other" by app.js, so they are not an error."""
    if not isinstance(sections, list):
        fail("config.columns.sections must be a list of {title, columns, layout} objects")
    seen: dict[str, int] = {}
    for i, s in enumerate(sections):
        where = f"config.columns.sections[{i}]"
        check_keys(s, SECTION_KEYS, where)
        require_str(s, "title", where)
        columns = text_subset(s.get("columns"), text, f"{where}.columns")
        if not columns:
            fail(f"{where}.columns must not be empty")
        for c in columns:
            if c in seen:
                fail(f"{where}.columns: {c!r} is already in config.columns.sections[{seen[c]}]")
            seen[c] = i
        layout = s.setdefault("layout", "stack")
        if layout not in SECTION_LAYOUTS:
            fail(f"{where}.layout must be one of {list(SECTION_LAYOUTS)}, got {layout!r}")


def validate_config(cfg: object) -> dict:
    cfg = check_keys(cfg, TOP_KEYS, "config")
    require_str(cfg, "title", "config")
    lang = cfg.setdefault("lang", "ja")
    if lang not in LANGS:
        fail(f"config.lang must be one of {list(LANGS)}, got {lang!r}")
    item_label = optional_str(cfg, "item_label", "config")
    if item_label is not None and (item_label != item_label.strip() or "{" in item_label
                                   or "}" in item_label):
        fail(f"config.item_label {item_label!r} must have no leading or trailing spaces and "
             "no braces; it names one row, for example \"質問\" or \"questions\"")

    tabs = cfg.get("tabs")
    if not isinstance(tabs, list) or not tabs:
        fail(f"config.tabs must be a non-empty list drawn from {list(TABS)}")
    bad = [t for t in tabs if t not in TABS]
    if bad or len(set(tabs)) != len(tabs):
        fail(f"config.tabs has unknown or repeated entries {tabs}; allowed: {list(TABS)}")

    data = cfg.get("data")
    if isinstance(data, dict) and any(k in data for k in REMOVED_DATA_KEYS):
        fail(removed_keys_message(data))
    data = check_keys(data, DATA_KEYS, "config.data")
    require_str(data, "csv", "config.data")
    for key in ("label_a", "records_path"):
        optional_str(data, key, "config.data")
    data.setdefault("label_a", "A")
    mode = data.setdefault("mode", "embed")
    if mode not in MODES:
        fail(f"config.data.mode must be one of {list(MODES)}, got {mode!r}")
    candidates = data.setdefault("candidates", [])
    if not isinstance(candidates, list):
        fail('config.data.candidates must be a list of {"file", "label"} objects')
    seen_labels = {data["label_a"]}
    for i, cand in enumerate(candidates):
        where = f"config.data.candidates[{i}]"
        check_keys(cand, CANDIDATE_KEYS, where)
        require_str(cand, "file", where)
        label = require_str(cand, "label", where)
        if label in seen_labels:
            fail(f"{where}.label {label!r} is already used by data.label_a or another candidate")
        seen_labels.add(label)
    if "compare" in tabs and not candidates:
        fail('config.tabs includes "compare" but config.data.candidates is empty')

    cols = check_keys(cfg.get("columns"), COLUMN_KEYS, "config.columns")
    require_str(cols, "id", "config.columns")
    for key in ("category", "status", "verdict"):
        optional_str(cols, key, "config.columns")
    text = cols.setdefault("text", [])
    if not isinstance(text, list) or not all(isinstance(t, str) and t for t in text):
        fail("config.columns.text must be a list of column names")
    if "collapsed" in cols:
        text_subset(cols["collapsed"], text, "config.columns.collapsed")
    if "sections" in cols:
        validate_sections(cols["sections"], text)

    metrics = cols.setdefault("metrics", [])
    if not isinstance(metrics, list):
        fail("config.columns.metrics must be a list")
    for i, m in enumerate(metrics):
        where = f"config.columns.metrics[{i}]"
        check_keys(m, METRIC_KEYS, where)
        require_str(m, "column", where)
        m.setdefault("label", m["column"])
        m.setdefault("unit", "")
        if m.get("aggregate") not in AGGREGATES:
            fail(f"{where}.aggregate must be one of {list(AGGREGATES)}")
        if m.get("better") not in BETTER:
            fail(f"{where}.better must be one of {list(BETTER)}")
        threshold = m.get("regression_threshold")
        if threshold is not None:
            if m["better"] == "none":
                fail(f"{where}: better 'none' shows the metric for reference only, so it has no "
                     "regression_threshold; remove it or set better to 'higher' or 'lower'")
            if m["aggregate"] == "rate":
                fail(f"{where}: regression_threshold is not used with aggregate 'rate' "
                     "(a true->false flip is the regression); remove it")
            if not isinstance(threshold, (int, float)) or threshold < 0:
                fail(f"{where}.regression_threshold must be a number >= 0")
        if "format" in m:
            if m["format"] not in METRIC_FORMATS:
                fail(f"{where}.format must be one of {list(METRIC_FORMATS)}, got {m['format']!r}")
            if m["aggregate"] != "mean":
                fail(f"{where}: format 'percent' needs aggregate 'mean' (a rate is already a "
                     "percentage, and a sum of fractions is not one)")
            if m["unit"]:
                fail(f"{where}: format 'percent' shows % and pt, so remove unit {m['unit']!r}")
    if "compare" in tabs and not metrics:
        fail('config.tabs includes "compare" but config.columns.metrics is empty')

    order = cfg.setdefault("order", {})
    if not isinstance(order, dict) or not all(
        isinstance(v, list) and all(isinstance(x, str) for x in v) for v in order.values()
    ):
        fail("config.order must map a column name to a list of values")

    histogram = cfg.get("histogram")
    if histogram is not None:
        numeric = [m["column"] for m in metrics if m["aggregate"] != "rate"]
        if histogram not in numeric:
            fail(f"config.histogram {histogram!r} must be a metric column with aggregate "
                 f"mean or sum; candidates: {numeric}")

    if "review" in tabs:
        review = check_keys(cfg.get("review"), REVIEW_KEYS, "config.review")
        labels = review.get("labels")
        if (not isinstance(labels, list) or not 1 <= len(labels) <= 9
                or not all(isinstance(x, str) and x for x in labels)
                or len(set(labels)) != len(labels)):
            fail("config.review.labels must be 1-9 distinct non-empty strings "
                 "(number keys 1-9 select them)")
    elif "review" in cfg:
        fail('config.review is set but "review" is not in config.tabs')

    extra_tabs = cfg.setdefault("extra_tabs", [])
    if not isinstance(extra_tabs, list):
        fail("config.extra_tabs must be a list of {id, title, script} objects")
    seen_ids: set[str] = set()
    for i, tab in enumerate(extra_tabs):
        where = f"config.extra_tabs[{i}]"
        check_keys(tab, EXTRA_TAB_KEYS, where)
        tab_id = require_str(tab, "id", where)
        require_str(tab, "title", where)
        script = require_str(tab, "script", where)
        if tab_id in TABS:
            fail(f"{where}.id {tab_id!r} collides with a built-in tab {list(TABS)}")
        if tab_id in seen_ids:
            fail(f"{where}.id {tab_id!r} is used by another extra tab")
        seen_ids.add(tab_id)
        if not script.lower().endswith(".js"):
            fail(f"{where}.script must be a .js file, got {script!r}")

    decision = decision_of(cfg)
    for name in DECISIONS:
        if name not in tabs and name in cfg:
            fail(f'config.{name} is set but "{name}" is not in config.tabs')
    if decision:
        validate_decision(cfg, decision)
    has_report = bool(decision and cfg[decision.tab].get("report"))
    if "report" in tabs and not has_report:
        fail(f'config.tabs includes "report" but config.{decision.tab if decision else "release"}.report '
             "is not set")
    if has_report and "report" not in tabs:
        fail(f'config.{decision.tab}.report is set but "report" is not in config.tabs')
    return cfg


def decision_of(cfg: dict) -> Decision | None:
    """The release or experiment tab in config.tabs; a config may use only one of them, so
    the report tab and the review of regressed items always belong to one decision."""
    found = [DECISIONS[t] for t in cfg["tabs"] if t in DECISIONS]
    if len(found) > 1:
        fail('config.tabs may include "release" or "experiment", not both; build a separate '
             "page for each")
    return found[0] if found else None


def is_fraction(m: dict) -> bool:
    """A metric whose values are fractions shown as %: a rate, or a mean with format percent.
    Must match isPercent() in app.js."""
    return m["aggregate"] == "rate" or m.get("format") == "percent"


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_decision(cfg: dict, decision: Decision) -> None:
    tab = decision.tab
    where_cfg = f"config.{tab}"
    section = check_keys(cfg.get(tab), set(decision.keys), where_cfg)
    if not cfg["data"]["candidates"]:
        fail(f'config.tabs includes "{tab}" but config.data.candidates is empty')
    metrics = {m["column"]: m for m in cfg["columns"]["metrics"]}
    if not metrics:
        fail(f'config.tabs includes "{tab}" but config.columns.metrics is empty')

    criteria = section.get("criteria")
    if not isinstance(criteria, list) or not criteria:
        fail(f"{where_cfg}.criteria must be a non-empty list of criteria")
    for i, c in enumerate(criteria):
        where = f"{where_cfg}.criteria[{i}]"
        kind = c.get("type") if isinstance(c, dict) else None
        if kind not in CRITERION_KEYS:
            fail(f"{where}.type must be one of {list(CRITERION_KEYS)}")
        check_keys(c, CRITERION_KEYS[kind], where)
        for key in sorted(CRITERION_DISPLAY_KEYS):
            optional_text(c, key, where)
        m = None
        if kind in ("absolute", "relative"):
            if c.get("metric") not in metrics:
                fail(f"{where}.metric must be a column in config.columns.metrics: {list(metrics)}")
            m = metrics[c["metric"]]
            if m["better"] == "none":
                fail(f"{where}: metric {c['metric']!r} has better 'none' (reference only), so it "
                     "cannot be a criterion; set its better to 'higher' or 'lower'")
        if kind == "absolute":
            bounds = [k for k in ("min", "max") if k in c]
            if not bounds:
                fail(f"{where}: set min, max, or both")
            for k in bounds:
                if not is_number(c[k]):
                    fail(f"{where}.{k} must be a number")
                if is_fraction(m) and not 0 <= c[k] <= 1:
                    fail(f"{where}.{k} must be between 0 and 1 for a rate or percent metric "
                         "(0.85 means 85%)")
            if len(bounds) == 2 and c["min"] > c["max"]:
                fail(f"{where}: min {c['min']} is greater than max {c['max']}")
        elif kind == "relative":
            given = [k for k in ("max_worse", "max_worse_pct") if k in c]
            if len(given) != 1:
                fail(f"{where}: set exactly one of max_worse (in the metric's unit) or "
                     "max_worse_pct (percent of the current model's value)")
            key = given[0]
            if not is_number(c[key]) or c[key] < 0:
                fail(f"{where}.{key} must be a number >= 0")
            if is_fraction(m) and key == "max_worse" and c[key] > 1:
                fail(f"{where}.max_worse is a fraction for a rate or percent metric "
                     "(0.02 means 2pt)")
        elif kind == "regressions":
            value = c.get("max")
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                fail(f"{where}.max must be an integer >= 0")
            if c.get("count", "all") not in REGRESSION_COUNTS:
                fail(f"{where}.count must be one of {list(REGRESSION_COUNTS)}, got {c['count']!r}")
        else:
            if not cfg["columns"].get("category"):
                fail(f"{where}: critical_categories needs config.columns.category")
            cats = c.get("categories")
            if (not isinstance(cats, list) or not cats
                    or not all(isinstance(x, str) and x for x in cats) or len(set(cats)) != len(cats)):
                fail(f"{where}.categories must be a non-empty list of distinct category values")

    labels = section.setdefault("review_labels", list(DEFAULT_REVIEW_LABELS[cfg["lang"]]))
    if (not isinstance(labels, list) or not 2 <= len(labels) <= 9
            or not all(isinstance(x, str) and x for x in labels) or len(set(labels)) != len(labels)):
        fail(f"{where_cfg}.review_labels must be 2-9 distinct non-empty strings; the last one "
             f"rejects the item ({decision.verdicts[2]}), number keys 1-9 select them")
    optional_text(section, "description", where_cfg)
    record = optional_str(section, "record", where_cfg)
    report = optional_str(section, "report", where_cfg)
    if record and not record.lower().endswith(".json"):
        fail(f"{where_cfg}.record must be a .json file exported from the {tab} tab, got {record!r}")
    if report and not report.lower().endswith(".md"):
        fail(f"{where_cfg}.report must be a .md file, got {report!r}")
    if report and not record:
        fail(f"{where_cfg}.report needs {where_cfg}.record: the report's verdicts are "
             "checked against the record")
    if tab == "experiment":
        require_str(section, "hypothesis", where_cfg)
        names = section.get("verdict_labels")
        keys = list(decision.verdicts)
        if (not isinstance(names, dict) or sorted(names) != sorted(keys)
                or not all(isinstance(v, str) and v.strip() for v in names.values())
                or len(set(names.values())) != len(names)):
            fail(f"{where_cfg}.verdict_labels must map {keys} to 3 distinct non-empty strings, "
                 'for example {"pass": "改善した", "review": "要レビュー", "fail": "改善しなかった"}')


def removed_keys_message(data: dict) -> str:
    file_b = data.get("csv_b", "b.csv")
    label_b = data.get("label_b", "B")
    rewrite = json.dumps({"candidates": [{"file": file_b, "label": label_b}]}, ensure_ascii=False)
    return ("config.data.csv_b / label_b were replaced by config.data.candidates. Remove them "
            f"and write {rewrite} (add one object per candidate to compare against data.csv)")


def read_extra_scripts(cfg: dict, base: Path) -> list[tuple[str, str]]:
    """Read each extra tab script (relative to the config file) as (file name, code)."""
    scripts = []
    for i, tab in enumerate(cfg["extra_tabs"]):
        path = base / tab["script"]
        if not path.is_file():
            fail(f"config.extra_tabs[{i}].script not found: {path}")
        try:
            code = path.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError as e:
            fail(f"extra tab script is not UTF-8 ({e.reason} at byte {e.start}): {path}")
        scripts.append((path.name, code))
    return scripts


def read_table(path: Path, role: str, records_path: str | None) -> Table:
    if not path.is_file():
        fail(f"{role} file not found: {path}")
    suffix = path.suffix.lower()
    if suffix not in FORMATS:
        fail(f"{role} file {path}: unknown extension {path.suffix!r}; use one of {list(FORMATS)}")
    if records_path and suffix != ".json":
        fail(f"{role} file {path}: config.data.records_path only applies to .json files")
    if suffix == ".csv":
        return read_csv(path, role)
    return read_json(path, role, records_path)


def read_csv(path: Path, role: str) -> Table:
    try:
        with path.open(encoding="utf-8-sig", newline="") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                fail(f"{role} CSV is empty: {path}")
            if len(set(headers)) != len(headers):
                dupes = sorted({h for h in headers if headers.count(h) > 1})
                fail(f"{role} CSV has duplicate header(s) {dupes}: {path}")
            rows, locations = [], []
            for line_no, values in enumerate(reader, start=2):
                if not any(v.strip() for v in values):
                    continue
                if len(values) != len(headers):
                    fail(f"{role} CSV {path}, row {line_no}: expected {len(headers)} "
                         f"fields, got {len(values)}")
                rows.append(dict(zip(headers, values)))
                locations.append(f"row {line_no}")
    except UnicodeDecodeError as e:
        fail(f"{role} CSV is not UTF-8 ({e.reason} at byte {e.start}): {path}")
    except csv.Error as e:
        fail(f"{role} CSV could not be parsed ({e}): {path}")
    return Table(path=path, headers=headers, rows=rows, locations=locations)


def reject_constant(name: str) -> None:
    # json.loads accepts NaN / Infinity, which are not JSON and which JSON.parse rejects.
    raise ValueError(f"{name} is not valid JSON")


def read_json(path: Path, role: str, records_path: str | None) -> Table:
    """Read a .json array (or the array at records_path) or .jsonl, one object per record."""
    try:
        text = path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as e:
        fail(f"{role} file is not UTF-8 ({e.reason} at byte {e.start}): {path}")

    def parse(source: str, where: str) -> object:
        try:
            return json.loads(source, parse_constant=reject_constant)
        except ValueError as e:  # JSONDecodeError is a ValueError
            fail(f"{role} file {path}, {where}: invalid JSON ({e})")

    records: list[tuple[str, object]] = []
    if path.suffix.lower() == ".jsonl":
        # split("\n"), not splitlines(): JSON strings may contain U+2028 and friends.
        for line_no, line in enumerate(text.split("\n"), start=1):
            if line.strip():
                records.append((f"line {line_no}", parse(line, f"line {line_no}")))
    else:
        node = parse(text, "document")
        if records_path:
            walked = []
            for key in records_path.split("."):
                walked.append(key)
                if not isinstance(node, dict) or key not in node:
                    fail(f"{role} file {path}: records_path {records_path!r} not found "
                         f"(no key {'.'.join(walked)!r})")
                node = node[key]
        if not isinstance(node, list):
            hint = "" if records_path else (
                "; if the records are under a key, set config.data.records_path"
                + (f" (top-level keys: {sorted(node)})" if isinstance(node, dict) else ""))
            fail(f"{role} file {path}: expected an array of records, got "
                 f"{type(node).__name__}{hint}")
        records = [(f"record {i}", rec) for i, rec in enumerate(node, start=1)]

    headers: dict[str, None] = {}
    flat_rows = []
    for where, rec in records:
        if not isinstance(rec, dict):
            fail(f"{role} file {path}, {where}: a record must be a JSON object, "
                 f"got {type(rec).__name__}")
        flat: dict[str, object] = {}
        flatten(rec, "", flat, f"{role} file {path}, {where}")
        headers.update(dict.fromkeys(flat))
        flat_rows.append(flat)
    if not records:
        fail(f"{role} file has no records: {path}")
    names = list(headers)
    # A key missing from a record is an empty cell, as in a CSV.
    rows = [{h: flat.get(h, "") for h in names} for flat in flat_rows]
    return Table(path=path, headers=names, rows=rows, locations=[w for w, _ in records])


def flatten(obj: dict, prefix: str, out: dict[str, object], where: str) -> None:
    """Nested non-empty objects become "parent.child" columns; other values stay as is."""
    for key, value in obj.items():
        name = prefix + key
        if isinstance(value, dict) and value:
            flatten(value, name + ".", out, where)
        elif name in out:
            fail(f"{where}: column {name!r} appears twice after flattening nested objects")
        else:
            out[name] = value


def cell_text(value: object) -> str:
    """A scalar cell as the CSV text it stands for. Must match toCell() in app.js."""
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return repr(value)
    return value


def configured_columns(cfg: dict) -> list[str]:
    cols = cfg["columns"]
    names = [cols["id"], *cols["text"], *(m["column"] for m in cols["metrics"])]
    names += [cols[k] for k in ("category", "status", "verdict") if cols.get(k)]
    return list(dict.fromkeys(names))


def validate_table(table: Table, cfg: dict, role: str) -> None:
    where = f"{role} file {table.path}"
    missing = [c for c in configured_columns(cfg) if c not in table.headers]
    if missing:
        fail(f"{where}: configured column(s) {missing} not in header {table.headers}")
    if "review" in cfg["tabs"]:
        clash = [c for c in REVIEW_EXPORT_COLUMNS if c in table.headers]
        if clash:
            fail(f"{where}: column(s) {clash} are reserved for review export")

    # Only text columns may hold JSON arrays / objects; the others are compared and counted.
    cols = cfg["columns"]
    scalar_cols = set(configured_columns(cfg)) - set(cols["text"])
    for loc, row in zip(table.locations, table.rows):
        for col in scalar_cols:
            if isinstance(row[col], (list, dict)):
                fail(f"{where}, {loc}: column {col!r} holds a JSON array or object; only "
                     "columns.text columns may")

    id_col = cols["id"]
    seen: dict[str, str] = {}
    for loc, row in zip(table.locations, table.rows):
        value = row[id_col]
        if isinstance(value, (int, float)) and not isinstance(value, bool) \
                and abs(value) > MAX_SAFE_INTEGER:
            fail(f"{where}, {loc}: id {value!r} is beyond 2^53-1 and would change in the "
                 "browser; store ids as strings")
        rid = cell_text(value).strip()
        if not rid:
            fail(f"{where}, {loc}: empty id in column {id_col!r}")
        if rid in seen:
            fail(f"{where}: duplicate id {rid!r} ({seen[rid]} and {loc})")
        seen[rid] = loc

    for m in cols["metrics"]:
        col = m["column"]
        for loc, row in zip(table.locations, table.rows):
            raw = cell_text(row[col]).strip()
            if not raw:
                continue  # empty means "no value"; excluded from n
            if m["aggregate"] == "rate":
                if raw.lower() not in TRUE_VALUES | FALSE_VALUES:
                    fail(f"{where}, {loc}: {col}={raw!r} is not a boolean "
                         f"(use one of {sorted(TRUE_VALUES | FALSE_VALUES)})")
            else:
                try:
                    value = float(raw)
                except ValueError:
                    value = math.nan
                if not math.isfinite(value):
                    fail(f"{where}, {loc}: {col}={raw!r} is not a number")


def id_mismatch(a: Table, b: Table, id_col: str) -> dict[str, list[str]]:
    ids_a = [cell_text(r[id_col]).strip() for r in a.rows]
    ids_b = [cell_text(r[id_col]).strip() for r in b.rows]
    set_a, set_b = set(ids_a), set(ids_b)
    return {
        "only_a": [i for i in ids_a if i not in set_b],
        "only_b": [i for i in ids_b if i not in set_a],
    }


# ---------- release decision and experiment ----------
# These functions mirror the release / experiment tab in app.js (pairs, classifyPair,
# aggregate, evaluateCriterion, candidateResult) so the build can recompute the verdicts
# that a record or report states. Keep both sides in step.


def metric_value(row: dict, m: dict) -> float | None:
    raw = cell_text(row[m["column"]]).strip()
    if m["aggregate"] == "rate":
        low = raw.lower()
        return 1 if low in TRUE_VALUES else 0 if low in FALSE_VALUES else None
    if not raw:
        return None
    value = float(raw)
    return value if math.isfinite(value) else None


def js_sum(values: list[float]) -> float:
    # Plain left-to-right addition like Array.reduce; sum() compensates since Python 3.12.
    total = 0
    for v in values:
        total += v
    return total


def aggregate(values: list[float], m: dict) -> float | None:
    if not values:
        return None
    return js_sum(values) if m["aggregate"] == "sum" else js_sum(values) / len(values)


def pair_rows(a: Table, b: Table, id_col: str) -> list[tuple[str, dict, dict]]:
    by_id = {cell_text(r[id_col]): r for r in b.rows}
    out = []
    for row in a.rows:
        rid = cell_text(row[id_col])
        if rid in by_id:
            out.append((rid, row, by_id[rid]))
    return out


def is_regressed(a: dict, b: dict, metrics: list[dict]) -> bool:
    for m in metrics:
        if m["better"] == "none":
            continue
        va, vb = metric_value(a, m), metric_value(b, m)
        if va is None or vb is None:
            continue
        if m["aggregate"] == "rate":
            good = 1 if m["better"] == "higher" else 0
            if va == good and vb != good:
                return True
            continue
        threshold = m.get("regression_threshold")
        if threshold is None:
            continue
        worse = vb - va if m["better"] == "lower" else va - vb
        if worse > threshold:
            return True
    return False


def evaluate_criterion(c: dict, metrics: dict[str, dict], pairs: list, regressed: list,
                       category_col: str | None, labels: dict[str, str], reject: str) -> str:
    """"pass", "fail", or "pending" (count "unaccepted" over the maximum only because of
    unreviewed items). `labels` maps each regressed id to its review label ("" if none)."""
    kind = c["type"]
    if kind == "regressions":
        if c.get("count", "all") != "unaccepted":
            return "pass" if len(regressed) <= c["max"] else "fail"
        counted = [labels[rid] for rid, _, _ in regressed if labels[rid] in ("", reject)]
        if len(counted) <= c["max"]:
            return "pass"
        return "pending" if counted.count(reject) <= c["max"] else "fail"
    if kind == "critical_categories":
        cats = set(c["categories"])
        return "fail" if any(cell_text(a[category_col]) in cats for _, a, _ in regressed) else "pass"
    return "pass" if metric_criterion_met(c, metrics[c["metric"]], pairs) else "fail"


def metric_criterion_met(c: dict, m: dict, pairs: list) -> bool:
    both = [(va, vb) for va, vb in ((metric_value(a, m), metric_value(b, m)) for _, a, b in pairs)
            if va is not None and vb is not None]
    cur = aggregate([x[0] for x in both], m)
    cand = aggregate([x[1] for x in both], m)
    if cand is None:
        return False
    if c["type"] == "absolute":
        return ("min" not in c or cand >= c["min"]) and ("max" not in c or cand <= c["max"])
    worse = cand - cur if m["better"] == "lower" else cur - cand
    if "max_worse" in c:
        return worse <= c["max_worse"]
    if cur != 0:
        pct = worse / abs(cur) * 100
    else:
        pct = math.inf if worse > 0 else 0
    return pct <= c["max_worse_pct"]


def candidate_verdict(cfg: dict, decision: Decision, a: Table, b: Table,
                      reviews: dict[str, dict], criteria: list[dict] | None = None) -> tuple[str, set[str]]:
    """The verdict code and the ids of regressed items for one candidate, judged by
    `criteria` (default: every criterion in the config)."""
    cols = cfg["columns"]
    section = cfg[decision.tab]
    pairs = pair_rows(a, b, cols["id"])
    regressed = [p for p in pairs if is_regressed(p[1], p[2], cols["metrics"])]
    metrics = {m["column"]: m for m in cols["metrics"]}
    reject = section["review_labels"][-1]
    by_id = {rid: reviews.get(rid, {}).get("label", "") for rid, _, _ in regressed}
    # A pending criterion is not failed; it implies an unreviewed item, so the verdict is
    # the middle one.
    failed = any(evaluate_criterion(c, metrics, pairs, regressed, cols.get("category"), by_id, reject) == "fail"
                 for c in (section["criteria"] if criteria is None else criteria))
    labels = list(by_id.values())
    met, unreviewed, not_met = decision.verdicts
    if failed or reject in labels:
        verdict = not_met
    elif any(not label for label in labels):
        verdict = unreviewed
    else:
        verdict = met
    return verdict, {rid for rid, _, _ in regressed}


# Marks a criterion that was added to the config after a record was exported, that is,
# after the results were seen. Must match ADDED_KEY in app.js.
ADDED_KEY = "added_after_results"


def record_criteria(where: str, tab: str, rec_criteria, criteria: list[dict], again: str) -> list[int]:
    """Check the record's criteria against config.<tab>.criteria; returns the indexes of
    the criteria added after the results.

    The record's criteria (without their ADDED_KEY marks) must be the first criteria of
    the config, compared without the display-only keys, so renaming or explaining a
    criterion keeps the record valid. The config's later criteria, and those the record
    already marks, were added after the results; they must all come after the ones
    written before."""
    if not isinstance(rec_criteria, list) or not all(isinstance(c, dict) for c in rec_criteria):
        fail(f"{where}: criteria must be a list of objects")

    def judged(c: dict) -> dict:
        return {k: v for k, v in c.items() if k != ADDED_KEY and k not in CRITERION_DISPLAY_KEYS}

    stated = [judged(c) for c in rec_criteria]
    if stated != [judged(c) for c in criteria[:len(stated)]]:
        fail(f"{where}: the record's criteria are not the first criteria of config.{tab}.criteria. "
             "Criteria added after the results go after the existing ones; a changed or removed "
             f"criterion needs a new record{again}")
    added = [i for i, c in enumerate(rec_criteria) if c.get(ADDED_KEY) is True]
    added += list(range(len(rec_criteria), len(criteria)))
    if added and added != list(range(added[0], len(criteria))):
        fail(f"{where}: the criteria marked {ADDED_KEY} must be the last ones of config.{tab}.criteria{again}")
    return added


def read_record(path: Path, cfg: dict, decision: Decision,
                tables: dict[str, Table]) -> tuple[dict, dict, list[int]]:
    """Validate an exported record; returns (verdicts, reviews) keyed by candidate label, and
    the indexes of the criteria added after the results."""
    tab = decision.tab
    where = f"{tab} record {path}"
    if not path.is_file():
        fail(f"{where} not found (config.{tab}.record)")
    try:
        rec = json.loads(path.read_text(encoding="utf-8-sig"), parse_constant=reject_constant)
    except UnicodeDecodeError as e:
        fail(f"{where} is not UTF-8 ({e.reason} at byte {e.start})")
    except ValueError as e:
        fail(f"{where} is not valid JSON ({e})")
    if not isinstance(rec, dict) or rec.get("kind") != decision.record_kind or rec.get("version") != 1:
        fail(f"{where} is not a record exported from the {tab} tab "
             f"(expected kind {decision.record_kind!r}, version 1)")
    section = cfg[tab]
    again = "; export the record again from a page built with this config and data"
    compared = ["review_labels"]
    if tab == "experiment":
        compared += ["hypothesis", "verdict_labels"]
    for key in compared:
        if rec.get(key) != section[key]:
            fail(f"{where}: the record's {key} and config.{tab}.{key} are different{again}")
    added = record_criteria(where, tab, rec.get("criteria"), section["criteria"], again)
    # The record's verdicts were judged by the criteria it lists; the page and the report
    # use every criterion in the config.
    stated_criteria = section["criteria"][:len(rec["criteria"])]
    files = rec.get("files")
    if not isinstance(files, dict) or not isinstance(files.get("current"), dict) \
            or files["current"].get("file") != tables["a"].path.name:
        fail(f"{where}: its current file is not {tables['a'].path.name}{again}")

    candidates = cfg["data"]["candidates"]
    expected = [c["label"] for c in candidates]
    entries = rec.get("candidates")
    if not isinstance(entries, list) or not all(isinstance(e, dict) for e in entries):
        fail(f"{where}: candidates must be a list of objects")
    found = [e.get("label") for e in entries]
    if sorted(map(str, found)) != sorted(expected) or len(set(found)) != len(found):
        fail(f"{where}: candidates {found} differ from config.data.candidates {expected}{again}")
    by_label = {e["label"]: e for e in entries}
    verdicts: dict[str, str] = {}
    reviews: dict[str, dict[str, dict]] = {}
    for i, cand in enumerate(candidates, start=1):
        label = cand["label"]
        entry = by_label[label]
        table = tables[f"c{i}"]
        if entry.get("file") != table.path.name:
            fail(f"{where}: candidate {label!r} file is {entry.get('file')!r}, not {table.path.name!r}{again}")
        if entry.get("verdict") not in decision.verdicts:
            fail(f"{where}: candidate {label!r} verdict must be one of {list(decision.verdicts)}")
        items = entry.get("reviews")
        if not isinstance(items, list):
            fail(f"{where}: candidate {label!r} reviews must be a list")
        per_id: dict[str, dict] = {}
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get("id"), str) \
                    or not isinstance(item.get("label", ""), str) or not isinstance(item.get("note", ""), str):
                fail(f"{where}: candidate {label!r} has a review that is not "
                     '{"id": str, "label": str, "note": str}')
            if item.get("label", "") and item["label"] not in section["review_labels"]:
                fail(f"{where}: candidate {label!r} id {item['id']!r} has label {item['label']!r}, "
                     f"not one of {section['review_labels']}")
            if item.get("label") or item.get("note"):
                per_id[item["id"]] = {"label": item.get("label", ""), "note": item.get("note", "")}
        stated_verdict, regressed = candidate_verdict(cfg, decision, tables["a"], table, per_id, stated_criteria)
        stray = sorted(set(per_id) - regressed)
        if stray:
            fail(f"{where} does not match the data: candidate {label!r} has reviews for {stray}, "
                 "which are not regressed items")
        if stated_verdict != entry["verdict"]:
            fail(f"{where} does not match the data: candidate {label!r} is {entry['verdict']!r} in "
                 f"the record but {stated_verdict!r} from the data and the record's reviews{again}")
        verdicts[label] = candidate_verdict(cfg, decision, tables["a"], table, per_id)[0]
        reviews[label] = per_id
    return verdicts, reviews, added


def read_report(path: Path, decision: Decision, verdicts: dict[str, str]) -> str:
    """Check the report's frontmatter verdicts against `verdicts`; returns the body."""
    where = f"{decision.tab} report {path}"
    codes = list(decision.verdicts)
    if not path.is_file():
        fail(f"{where} not found (config.{decision.tab}.report)")
    try:
        text = path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as e:
        fail(f"{where} is not UTF-8 ({e.reason} at byte {e.start})")
    lines = [line.rstrip("\r") for line in text.split("\n")]
    example = "---\\nverdicts:\\n  <candidate label>: " + " | ".join(codes) + "\\n---"
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        fail(f"{where} must begin with frontmatter: {example}")
    end = lines.index("---", 1)
    stated: dict[str, str] = {}
    in_verdicts = False
    for n, line in enumerate(lines[1:end], start=2):
        if not line.strip():
            continue
        if not line[0].isspace():
            if line.strip() != "verdicts:" or in_verdicts:
                fail(f"{where}, line {n}: the frontmatter holds only one 'verdicts:' key ({example})")
            in_verdicts = True
            continue
        key, sep, value = line.strip().rpartition(":")
        key, value = key.strip(), value.strip()
        if len(key) >= 2 and key[0] == key[-1] == '"':
            key = key[1:-1]
        if not in_verdicts or not sep or not key:
            fail(f"{where}, line {n}: expected '  <candidate label>: <verdict>' under 'verdicts:'")
        if value not in codes:
            fail(f"{where}, line {n}: verdict {value!r} must be one of {codes}")
        if key in stated:
            fail(f"{where}, line {n}: candidate {key!r} appears twice")
        stated[key] = value
    if not in_verdicts:
        fail(f"{where}: the frontmatter has no 'verdicts:' key ({example})")
    problems = []
    missing = [k for k in verdicts if k not in stated]
    extra = [k for k in stated if k not in verdicts]
    if missing:
        problems.append(f"missing candidate(s) {missing}")
    if extra:
        problems.append(f"unknown candidate(s) {extra}")
    for label, verdict in verdicts.items():
        if label in stated and stated[label] != verdict:
            problems.append(f"{label!r} is {stated[label]!r} in the report but {verdict!r} from the record")
    if problems:
        fail(f"{where}: frontmatter verdicts do not match the record: " + "; ".join(problems))
    return "\n".join(lines[end + 1:]).strip("\n")


def check_decision(cfg: dict, decision: Decision, tables: dict[str, Table],
                   base: Path) -> tuple[dict | None, str | None]:
    """Check the release / experiment config against the data; read the record and report if set."""
    section = cfg[decision.tab]
    cat_col = cfg["columns"].get("category")
    if cat_col:
        present = sorted({cell_text(r[cat_col]) for r in tables["a"].rows})
        for i, c in enumerate(section["criteria"]):
            if c["type"] != "critical_categories":
                continue
            missing = [x for x in c["categories"] if x not in present]
            if missing:
                fail(f"config.{decision.tab}.criteria[{i}].categories {missing} not found in column "
                     f"{cat_col!r} of {tables['a'].path.name}; values: {present}")
    if not section.get("record"):
        return None, None
    verdicts, reviews, added = read_record(base / section["record"], cfg, decision, tables)
    report = read_report(base / section["report"], decision, verdicts) if section.get("report") else None
    return {"verdicts": verdicts, "reviews": reviews, "added_after_results": added}, report


def read_asset(name: str) -> str:
    path = ASSETS / name
    if not path.is_file():
        fail(f"skill asset missing: {path}")
    return path.read_text(encoding="utf-8")


def inline_script(code: str, name: str) -> str:
    # A literal "</script" would terminate the inline <script> element early.
    if re.search(r"</script", code, re.IGNORECASE):
        fail(f"script {name} contains '</script' and cannot be inlined safely")
    return code


def inline_style(code: str, name: str) -> str:
    if re.search(r"</style", code, re.IGNORECASE):
        fail(f"asset {name} contains '</style' and cannot be inlined safely")
    return code


def notices_comment() -> str:
    # The vendored MIT licenses require their notices in every copy, and every
    # generated page is a copy, so the notices file is embedded as an HTML comment.
    path = SKILL_DIR / "THIRD_PARTY_NOTICES.md"
    if not path.is_file():
        fail(f"skill file missing: {path}")
    text = path.read_text(encoding="utf-8")
    if any(token in text for token in ("-->", "<!--", "--!>")):
        fail(f"{path.name} contains a sequence that would end an HTML comment")
    return text


def json_for_script(payload: dict) -> str:
    # Escaping every "<" makes "</script" and "<!--" impossible inside the JSON block.
    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return text.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def render(cfg: dict, payload: dict, extra_scripts: list[tuple[str, str]]) -> str:
    template = read_asset("template.html")
    # One <script> per extra tab, after app.js, so one failing at top level leaves the rest working.
    extra_js = "".join(f"<script>{inline_script(code, name)}</script>\n" for name, code in extra_scripts)
    parts = {
        "CSP": CSP_LOAD if cfg["data"]["mode"] == "load" else CSP_EMBED,
        "TITLE": html_escape(cfg["title"]),
        "LANG": cfg["lang"],
        "NOTICES": notices_comment(),
        "VENDOR_CSS": inline_style(read_asset("vendor/tabulator.min.css"), "tabulator.min.css"),
        "APP_CSS": inline_style(read_asset("app.css"), "app.css"),
        "VENDOR_PAPAPARSE": inline_script(read_asset("vendor/papaparse.min.js"), "papaparse.min.js"),
        "VENDOR_TABULATOR": inline_script(read_asset("vendor/tabulator.min.js"), "tabulator.min.js"),
        "APP_JS": inline_script(read_asset("app.js"), "app.js"),
        "EXTRA_SCRIPTS": extra_js,
        "DATA_JSON": json_for_script(payload),
    }
    found = set(re.findall(r"\{\{([A-Z_]+)\}\}", template))
    if found != set(parts):
        fail(f"template placeholders {sorted(found)} do not match {sorted(parts)}")
    # Single pass so inserted content is never re-scanned for placeholders.
    return re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: parts[m.group(1)], template)


def relative_to_html(csv_path: Path, out_path: Path) -> str | None:
    """The data file's path relative to the HTML's folder, in posix form.

    None when the two share no folder below the filesystem root: such a path climbs to
    the root and spells out the absolute location, which the HTML must not carry.
    """
    csv_abs, out_dir = csv_path.resolve(), out_path.resolve().parent
    try:
        common = Path(os.path.commonpath([csv_abs, out_dir]))
    except ValueError:  # different drives on Windows
        return None
    if common == Path(common.anchor):
        return None
    return Path(os.path.relpath(csv_abs, out_dir)).as_posix()


def html_escape(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def build(config_path: Path, out_path: Path, csv_override: Path | None,
          mode_override: str | None) -> list[str]:
    if not config_path.is_file():
        fail(f"config not found: {config_path}")
    try:
        raw_cfg = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        fail(f"config is not valid JSON ({e}): {config_path}")
    cfg = validate_config(raw_cfg)
    data = cfg["data"]
    if mode_override:
        data["mode"] = mode_override
    base = config_path.resolve().parent
    extra_scripts = read_extra_scripts(cfg, base)

    records_path = data.get("records_path")
    candidates = data["candidates"]
    # Side keys: "a" for data.csv, "c1", "c2", ... for the candidates in config order.
    path_a = csv_override.resolve() if csv_override else base / data["csv"]
    role_a = data["label_a"] if candidates else "data"
    tables = {"a": read_table(path_a, role_a, records_path)}
    validate_table(tables["a"], cfg, role_a)
    for i, cand in enumerate(candidates, start=1):
        table = read_table(base / cand["file"], cand["label"], records_path)
        validate_table(table, cfg, cand["label"])
        tables[f"c{i}"] = table

    warnings: list[str] = []
    id_col = cfg["columns"]["id"]
    banner = "(also shown as a banner in the page)"
    for i, cand in enumerate(candidates, start=1):
        mismatch = id_mismatch(tables["a"], tables[f"c{i}"], id_col)
        if mismatch["only_a"]:
            warnings.append(f"ids only in {data['label_a']}, not in {cand['label']} "
                            f"({len(mismatch['only_a'])}): {mismatch['only_a']} {banner}")
        if mismatch["only_b"]:
            warnings.append(f"ids only in {cand['label']}, not in {data['label_a']} "
                            f"({len(mismatch['only_b'])}): {mismatch['only_b']} {banner}")

    decision = decision_of(cfg)
    record = None
    report = None
    if decision:
        record, report = check_decision(cfg, decision, tables, base)
        if record and record["added_after_results"]:
            names = ", ".join(f"criteria[{i}]" for i in record["added_after_results"])
            warnings.append(f"config.{decision.tab}.{names}: added after the results (the page and its "
                            f"exported record mark {ADDED_KEY}); the report must keep them apart from "
                            "the criteria written before")

    # The HTML may be shared, so it never carries the build machine's absolute paths. The
    # config keeps file names, which load mode shows as the files to pick.
    data["csv"] = tables["a"].path.name
    for i, cand in enumerate(candidates, start=1):
        cand["file"] = tables[f"c{i}"].path.name
    if decision:
        for key in ("record", "report"):
            if cfg[decision.tab].get(key):
                cfg[decision.tab][key] = Path(cfg[decision.tab][key]).name
    # The scripts are inlined; the page only needs each tab's id and title.
    cfg["extra_tabs"] = [{"id": t["id"], "title": t["title"]} for t in cfg["extra_tabs"]]
    payload: dict = {"config": cfg, "record": record, "report": report}
    if data["mode"] == "load":
        # Relative to the HTML, so a page served over http fetches the file beside it.
        defaults = {}
        for side, table in tables.items():
            rel = relative_to_html(table.path, out_path)
            if rel is None:
                rel = table.path.name
                warnings.append(f"{table.path} shares no folder with {out_path}, so the default "
                                f"path is just {rel!r}; put the HTML next to the data file to auto-load it")
            defaults[side] = rel
        payload["tables"] = None
        payload["default_paths"] = defaults
    else:
        payload["tables"] = {
            side: {"name": t.path.name, "headers": t.headers, "rows": t.rows}
            for side, t in tables.items()
        }
    html = render(cfg, payload, extra_scripts)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    return warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--config", required=True, type=Path, help="config JSON file")
    parser.add_argument("--out", required=True, type=Path, help="output HTML file")
    parser.add_argument("--csv", type=Path, help="override config.data.csv (.csv, .json or .jsonl)")
    parser.add_argument("--mode", choices=MODES, help="override config.data.mode")
    args = parser.parse_args()
    try:
        warnings = build(args.config, args.out, args.csv, args.mode)
    except BuildError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    for w in warnings:
        print(f"warning: {w}", file=sys.stderr)
    print(f"wrote {args.out} ({args.out.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
