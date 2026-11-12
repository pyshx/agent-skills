#!/usr/bin/env python3
"""Check that a verification record is complete. Prints its status, or each problem, and exits 1 on problems.

Accepts the full form (Performed / Not performed / Residual risk), the compact form (one Check | Result
table), and a PR template's What I Checked / What I Did Not Check sections.

Usage: check_record.py <record.md | ->
"""

import sys

from record import RecordError, load, read


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    try:
        record = load(argv[1])
    except RecordError as e:
        print(f"FAIL {e}")
        return 1
    found = read(record)
    if found.problems:
        for p in found.problems:
            print(f"FAIL {record.source}: {p}")
        return 1
    print(
        f"ok   {record.source}: {found.status} ({len(found.performed)} performed, "
        f"{len(found.failing)} failing, {len(found.gaps)} not performed) [{found.form}]"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
