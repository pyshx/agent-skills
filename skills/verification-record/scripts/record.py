"""Parse a verification record: a Markdown document with Performed, Not performed, and Residual risk sections."""

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


def parse(text, source="-"):
    meta, body = parse_frontmatter(text.lstrip("﻿").replace("\r\n", "\n"))
    sections, duplicates = {}, []
    current, level, fenced = None, 0, False
    for line in body.splitlines():
        if FENCE.match(line):
            fenced = not fenced
        m = None if fenced else HEADING.match(line)
        if m:
            depth, title = len(m.group(1)), m.group(2).strip().lower()
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
        if current:
            current.lines.append(line)
    return Record(source, meta, sections, duplicates)


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
