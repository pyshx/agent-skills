#!/usr/bin/env python3
"""List the checks that records say could not be run, most frequent first.

Directories are searched recursively for *.md files. Any record form works: full, compact, or a PR
template's What I Did Not Check section. Files with no record are skipped; malformed records are reported on
stderr and their readable gaps still counted.
"""

import argparse
import csv
import re
import sys
from collections import defaultdict
from pathlib import Path

from record import RecordError, load, read, record_id


def files(args):
    for arg in args:
        p = Path(arg)
        if p.is_dir():
            yield from sorted(p.rglob("*.md"))
        else:
            yield p


def gap_rows(paths, warn):
    for path in paths:
        try:
            record = load(str(path))
        except RecordError as e:
            warn(str(e))
            continue
        found = read(record)
        if found.form == "none":
            continue
        if found.problems:
            warn(f"{path}: {found.problems[0]}; run check_record.py on it")
        rid = record_id(record)
        for gap in found.gaps:
            yield str(path), rid, gap.check, gap.why, gap.enable


def key(check):
    return re.sub(r"\s+", " ", check.strip().lower())


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    parser.add_argument("paths", nargs="+", help="record files or directories")
    parser.add_argument("--min", type=int, default=1, help="show only checks missing from at least N records")
    parser.add_argument("--csv", action="store_true", help="print one row per gap instead of the grouped report")
    args = parser.parse_args(argv[1:])

    def warn(message):
        print(f"warn {message}", file=sys.stderr)

    rows = list(gap_rows(files(args.paths), warn))
    if args.csv:
        w = csv.writer(sys.stdout)
        w.writerow(["file", "record", "check", "why_not", "enable"])
        w.writerows(rows)
        return 0

    groups = defaultdict(list)
    for row in rows:
        groups[key(row[2])].append(row)
    ranked = sorted(groups.values(), key=lambda g: (-len({r[0] for r in g}), key(g[0][2])))
    for group in ranked:
        sources = {r[0]: r[1] for r in group}
        if len(sources) < args.min:
            continue
        print(f"{len(sources)}x  {group[0][2]}  [{', '.join(sources[s] for s in sorted(sources))}]")
        for why in sorted({r[3] for r in group}):
            print(f"      why not: {why}")
        for enable in sorted({r[4] for r in group}):
            print(f"      enable:  {enable}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
