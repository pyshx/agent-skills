"""Parse a verification record in any of the three forms it is written in.

- full: Performed, Not performed, and Residual risk sections, each with its own table.
- compact: one table with Check and Result columns; a row whose Result starts "Not performed" is a gap.
- template: a repository PR template's "What I Checked" and "What I Did Not Check" sections, as bullets.

`read()` turns any of them into the same Findings: checks performed, gaps, residual risk, and problems.
"""

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

PERFORMED = "performed"
NOT_PERFORMED = "not performed"
RESIDUAL_RISK = "residual risk"
SECTIONS = (PERFORMED, NOT_PERFORMED, RESIDUAL_RISK)

COLUMNS = {
    PERFORMED: ("check", "how", "result", "evidence"),
    NOT_PERFORMED: ("check", "why not", "what would enable it"),
}

HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(```|~~~)")
SEPARATOR_CELL = re.compile(r"^:?-+:?$")
FRONTMATTER_LINE = re.compile(r"^[A-Za-z_][\w-]*\s*:")
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
NOT_PERFORMED_RESULT = re.compile(r"^\W*not (?:performed|run|checked|verified)\b\W*(.*)$", re.I | re.S)
FAILING_RESULT = re.compile(r"^\W*FAIL\b")
BULLET = re.compile(r"^(?:[-*+]|\d+[.)])\s+(.*)$")
CHECKED_TITLES = {"what i checked", "what was checked", "checked"}
NOT_CHECKED_TITLES = {"what i did not check", "what i didnt check", "what was not checked", "not checked"}
NOTHING = {"none", "none known", "nothing", "n/a", "na"}


class RecordError(Exception):
    pass


@dataclass
class Section:
    title: str
    lines: list = field(default_factory=list)


@dataclass
class Record:
    source: str
    meta: dict
    sections: dict
    duplicates: list
    titled: dict
    body: list

    def rows(self, name):
        return parse_table(self.sections[name].lines) if name in self.sections else []

    def text(self, name):
        if name not in self.sections:
            return ""
        return HTML_COMMENT.sub("", "\n".join(self.sections[name].lines)).strip()


def is_none_row(row):
    return len(row) > 0 and row[0].strip().lower() == "none" and all(not c.strip() for c in row[1:])


def is_separator(row):
    return len(row) > 0 and all(SEPARATOR_CELL.match(c) for c in row)


def split_row(line):
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|") and not body.endswith("\\|"):
        body = body[:-1]
    cells = re.split(r"(?<!\\)\|", body)
    return [c.strip().replace("\\|", "|") for c in cells]


def parse_table(lines):
    """Return [header, *rows] for the first table outside code fences, or [] when there is none."""
    table, fenced = [], False
    for line in lines:
        if FENCE.match(line):
            fenced = not fenced
            if table:
                break
            continue
        if not fenced and line.lstrip().startswith("|"):
            table.append(line)
        elif table:
            break
    return [r for r in (split_row(line) for line in table) if not is_separator(r)]


def parse_frontmatter(text):
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    block = [line for line in text[4:end].splitlines() if line.strip()]
    if not block or not all(FRONTMATTER_LINE.match(line) for line in block):
        return {}, text
    meta = {}
    for line in block:
        key, _, value = line.partition(":")
        meta[key.strip()] = value.split(" #", 1)[0].strip()
    return meta, text[end + 4 :]


def normalize_title(title):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", title.lower().replace("\u2019", "'").replace("'", ""))).strip()


def parse(text, source="-"):
    meta, body = parse_frontmatter(text.lstrip("\ufeff").replace("\r\n", "\n"))
    lines = body.splitlines()
    sections, duplicates, titled = {}, [], {}
    current, level, fenced = None, 0, False
    other, other_level = None, 0
    for line in lines:
        if FENCE.match(line):
            fenced = not fenced
        m = None if fenced else HEADING.match(line)
        if m:
            depth, title = len(m.group(1)), m.group(2).strip().lower()
            if other and depth <= other_level:
                other = None
            key = normalize_title(title)
            if key not in titled and key not in SECTIONS:
                other, other_level = Section(key), depth
                titled[key] = other
            if title in SECTIONS:
                if title in sections:
                    duplicates.append(title)
                    current = None
                else:
                    current, level = Section(title), depth
                    sections[title] = current
                continue
            if current and depth <= level:
                current = None
            continue
        if current:
            current.lines.append(line)
        if other:
            other.lines.append(line)
    return Record(source, meta, sections, duplicates, titled, lines)


def load(path):
    try:
        if path == "-":
            return parse(sys.stdin.read(), "-")
        return parse(Path(path).read_text(encoding="utf-8-sig"), str(path))
    except (OSError, UnicodeDecodeError) as e:
        raise RecordError(f"{path}: cannot read: {e}") from e


def record_id(record):
    if record.meta.get("id"):
        return record.meta["id"]
    return Path(record.source).stem if record.source != "-" else "-"


@dataclass
class Check:
    name: str
    result: str


@dataclass
class Gap:
    check: str
    why: str
    enable: str


@dataclass
class Findings:
    form: str
    performed: list = field(default_factory=list)
    gaps: list = field(default_factory=list)
    risk: str = ""
    problems: list = field(default_factory=list)

    @property
    def failing(self):
        return [c for c in self.performed if FAILING_RESULT.match(c.result)]

    @property
    def status(self):
        if self.failing:
            return "failing"
        if not self.performed:
            return "unverified"
        return "partial" if self.gaps else "verified"


def read(record):
    """Return the Findings of whichever form the record uses, with its problems."""
    if record.duplicates:
        return Findings("full", problems=[f"duplicate section: {name.capitalize()}" for name in record.duplicates])
    if any(name in record.sections for name in SECTIONS):
        return read_full(record)
    found = read_compact(record)
    if found:
        return found
    found = read_template(record)
    if found:
        return found
    return Findings("none", problems=[
        "no verification record found: expected Performed / Not performed / Residual risk sections, "
        "a table with Check and Result columns, or What I Checked / What I Did Not Check sections"
    ])


def read_full(record):
    found = Findings("full")
    missing = [name for name in SECTIONS if name not in record.sections]
    found.problems += [f"missing section: {name.capitalize()}" for name in missing]
    tables = {}
    for name, expected in COLUMNS.items():
        if name in missing:
            continue
        table = record.rows(name)
        title = name.capitalize()
        if not table:
            found.problems.append(f"{title}: no table (write one `none` row when there is nothing to list)")
            continue
        if tuple(c.lower() for c in table[0]) != expected:
            found.problems.append(f"{title}: columns must be {' | '.join(c.capitalize() for c in expected)}, got {' | '.join(table[0])}")
            continue
        rows = table[1:]
        if not rows:
            found.problems.append(f"{title}: table has no rows (write one `none` row when there is nothing to list)")
            continue
        if any(is_none_row(r) for r in rows):
            if len(rows) > 1:
                found.problems.append(f"{title}: a `none` row must be the only row")
            tables[name] = []
            continue
        good = []
        for i, row in enumerate(rows, 1):
            if len(row) != len(expected):
                found.problems.append(f"{title} row {i}: expected {len(expected)} cells, got {len(row)}")
                continue
            empty = [col for col, cell in zip(expected, row) if not cell]
            found.problems += [f"{title} row {i}: empty {col.capitalize()}" for col in empty]
            if not empty:
                good.append(row)
        tables[name] = good
    found.performed = [Check(r[0], r[2]) for r in tables.get(PERFORMED, [])]
    found.gaps = [Gap(r[0], r[1], r[2]) for r in tables.get(NOT_PERFORMED, [])]
    if not found.problems and not missing and not found.performed and not found.gaps:
        found.problems.append("both tables are `none`: list each check you ran or could not run")
    if missing:
        return found
    found.risk = record.text(RESIDUAL_RISK)
    if not found.risk:
        found.problems.append("Residual risk: empty (write `None known.` when there is none)")
    return found


def read_compact(record):
    """A single table whose header has Check and Result columns. Returns None when there is no such table."""
    table, fenced = None, False
    block = []
    for line in record.body + [""]:
        if FENCE.match(line):
            fenced = not fenced
        if not fenced and line.lstrip().startswith("|"):
            block.append(line)
            continue
        if block:
            rows = [r for r in (split_row(x) for x in block) if not is_separator(r)]
            header = [c.lower() for c in rows[0]] if rows else []
            if "check" in header and "result" in header:
                table = rows
                break
            block = []
    if table is None:
        return None
    found = Findings("compact")
    header = [c.lower() for c in table[0]]
    ci, ri = header.index("check"), header.index("result")
    rows = table[1:]
    if not rows:
        found.problems.append("Check | Result table has no rows")
    for i, row in enumerate(rows, 1):
        if len(row) != len(header):
            found.problems.append(f"row {i}: expected {len(header)} cells, got {len(row)}")
            continue
        check, result = row[ci], row[ri]
        if not check or not result:
            found.problems.append(f"row {i}: empty {'Check' if not check else 'Result'}")
            continue
        gap = NOT_PERFORMED_RESULT.match(result)
        if gap:
            if not gap.group(1).strip():
                found.problems.append(f"row {i}: `Not performed` needs a reason after it")
            found.gaps.append(Gap(check, gap.group(1).strip(), ""))
        else:
            found.performed.append(Check(check, result))
    return found


def bullets(section):
    items = []
    for line in section.lines:
        m = BULLET.match(line)
        if m and not line[:1].isspace():
            items.append(HTML_COMMENT.sub("", m.group(1)).strip())
        elif items and line.strip() and line[:1].isspace() and not BULLET.match(line.strip()):
            items[-1] += " " + line.strip()
    return [i for i in items if i]


def read_template(record):
    """A PR template's What I Checked / What I Did Not Check sections. Returns None when they are absent."""
    checked = next((record.titled[t] for t in CHECKED_TITLES if t in record.titled), None)
    unchecked = next((record.titled[t] for t in NOT_CHECKED_TITLES if t in record.titled), None)
    if checked is None and unchecked is None:
        return None
    found = Findings("template")
    if checked is None or unchecked is None:
        found.problems.append("template record needs both What I Checked and What I Did Not Check")
        return found
    found.performed = [Check(b, b) for b in bullets(checked)]
    if not found.performed:
        found.problems.append("What I Checked: no bullets")
    gap_items = bullets(unchecked)
    text = HTML_COMMENT.sub("", "\n".join(unchecked.lines)).strip().lower().rstrip(".")
    if not gap_items and text not in NOTHING:
        found.problems.append("What I Did Not Check: list each check as a bullet, or write `None.`")
    for item in gap_items:
        if item.lower().rstrip(".") in NOTHING:
            continue
        parts = re.split(r"(?<=[.:])\s+", item, maxsplit=1)
        found.gaps.append(Gap(parts[0].rstrip(".:"), parts[1] if len(parts) > 1 else "", ""))
    return found
