#!/usr/bin/env python3
"""Check that a verification record is complete. Prints its status, or each problem, and exits 1 on problems.

Usage: check_record.py <record.md | ->
"""

import sys

from record import COLUMNS, NOT_PERFORMED, PERFORMED, RESIDUAL_RISK, SECTIONS, RecordError, is_none_row, load


def problems(record):
    found = [f"duplicate section: {name.capitalize()}" for name in record.duplicates]
    found += [f"missing section: {name.capitalize()}" for name in SECTIONS if name not in record.sections]
    if found:
        return found

    counts = {}
    for name, expected in COLUMNS.items():
        table = record.rows(name)
        title = name.capitalize()
        if not table:
            found.append(f"{title}: no table (write one `none` row when there is nothing to list)")
            continue
        header = tuple(c.lower() for c in table[0])
        if header != expected:
            found.append(f"{title}: columns must be {' | '.join(c.capitalize() for c in expected)}, got {' | '.join(table[0])}")
            continue
        rows = table[1:]
        if not rows:
            found.append(f"{title}: table has no rows (write one `none` row when there is nothing to list)")
            continue
        if any(is_none_row(r) for r in rows):
            if len(rows) > 1:
                found.append(f"{title}: a `none` row must be the only row")
            counts[name] = 0
            continue
        for i, row in enumerate(rows, 1):
            if len(row) != len(expected):
                found.append(f"{title} row {i}: expected {len(expected)} cells, got {len(row)}")
                continue
            for col, cell in zip(expected, row):
                if not cell:
                    found.append(f"{title} row {i}: empty {col.capitalize()}")
        counts[name] = len(rows)

    if not found and counts.get(PERFORMED) == 0 and counts.get(NOT_PERFORMED) == 0:
        found.append("both tables are `none`: list each check you ran or could not run")
    if not record.text(RESIDUAL_RISK):
        found.append("Residual risk: empty (write `None known.` when there is none)")
    return found


def status(record):
    performed = [r for r in record.rows(PERFORMED)[1:] if not is_none_row(r)]
    gaps = sum(1 for r in record.rows(NOT_PERFORMED)[1:] if not is_none_row(r))
    failing = sum(1 for r in performed if len(r) > 2 and r[2].upper().startswith("FAIL"))
    if failing:
        state = "failing"
    elif not performed:
        state = "unverified"
    else:
        state = "partial" if gaps else "verified"
    return state, len(performed), gaps, failing


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    try:
        record = load(argv[1])
    except RecordError as e:
        print(f"FAIL {e}")
        return 1
    found = problems(record)
    if found:
        for p in found:
            print(f"FAIL {record.source}: {p}")
        return 1
    state, performed, gaps, failing = status(record)
    print(f"ok   {record.source}: {state} ({performed} performed, {failing} failing, {gaps} not performed)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
