"""Run with: python3 tests/verification-record/test_scripts.py"""

import csv
import subprocess
import tempfile
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "skills" / "verification-record" / "scripts"
FIXTURES = Path(__file__).resolve().parent / "fixtures"


def run(script, *args, stdin=None):
    return subprocess.run(
        [sys.executable, str(SCRIPTS / script), *map(str, args)],
        input=stdin,
        capture_output=True,
        text=True,
    )


class CheckRecord(unittest.TestCase):
    def assert_ok(self, fixture, status):
        r = run("check_record.py", FIXTURES / fixture)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn(f": {status} (", r.stdout)

    def assert_fails(self, fixture, message):
        r = run("check_record.py", FIXTURES / fixture)
        self.assertEqual(r.returncode, 1, r.stdout + r.stderr)
        self.assertIn(message, r.stdout)

    def test_partial(self):
        self.assert_ok("partial.md", "partial")

    def test_verified_with_none_row(self):
        self.assert_ok("verified.md", "verified")

    def test_unverified_is_an_honest_record(self):
        self.assert_ok("unverified.md", "unverified")

    def test_escaped_pipe_stays_in_one_cell(self):
        r = run("check_record.py", FIXTURES / "verified.md")
        self.assertIn("verified (1 performed, 0 failing, 0 not performed)", r.stdout)

    def test_pr_body_from_stdin(self):
        r = run("check_record.py", "-", stdin=(FIXTURES / "pr-body.md").read_text())
        self.assertEqual(r.returncode, 0, r.stdout)
        self.assertIn("partial (1 performed, 0 failing, 1 not performed)", r.stdout)

    def test_missing_evidence(self):
        self.assert_fails("fail-missing-evidence.md", "Performed row 1: empty Evidence")

    def test_missing_section(self):
        self.assert_fails("fail-missing-section.md", "missing section: Not performed")

    def test_both_none_is_a_vacuous_record(self):
        self.assert_fails("fail-both-none.md", "both tables are `none`")

    def test_empty_residual_risk(self):
        self.assert_fails("fail-empty-risk.md", "Residual risk: empty")

    def test_wrong_columns(self):
        self.assert_fails("fail-wrong-columns.md", "Performed: columns must be Check | How | Result | Evidence")


class Gaps(unittest.TestCase):
    def test_groups_the_same_check_across_records(self):
        r = run("gaps.py", "--min", "2", FIXTURES)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(r.stdout.splitlines()[0], "2x  Login in a real browser  [142, pr-body]")
        self.assertNotIn("Unit tests", r.stdout)

    def test_csv_has_one_row_per_gap(self):
        r = run("gaps.py", "--csv", FIXTURES / "partial.md", FIXTURES / "unverified.md")
        rows = [row[1:] for row in csv.reader(r.stdout.splitlines())]
        self.assertEqual(
            rows,
            [
                ["record", "check", "why_not", "enable"],
                ["142", "Login in a real browser", "No staging URL for this branch", "Preview deploys per PR"],
                ["unverified", "Unit tests", "The test runner needs Docker, which this machine lacks", "Docker in the agent sandbox"],
            ],
        )

    def test_records_sharing_an_id_count_separately(self):
        gap = "| Check | Why not | What would enable it |\n|---|---|---|\n| Browser login | no URL | previews |\n"
        with tempfile.TemporaryDirectory() as d:
            for sub in ("a", "b"):
                (Path(d) / sub).mkdir()
                (Path(d) / sub / "1.md").write_text(f"## Not performed\n{gap}")
            r = run("gaps.py", "--min", "2", d)
        self.assertTrue(r.stdout.startswith("2x  Browser login  [1, 1]"), r.stdout)

    def test_bad_arguments_exit_cleanly(self):
        for args in (["--min"], ["--min", "abc", "x"], []):
            r = run("gaps.py", *args)
            self.assertEqual(r.returncode, 2, args)
            self.assertNotIn("Traceback", r.stderr)

    def test_unreadable_file_is_a_warning(self):
        r = run("gaps.py", "/nonexistent/record.md")
        self.assertEqual(r.returncode, 0)
        self.assertIn("cannot read", r.stderr)
        self.assertNotIn("Traceback", r.stderr)


PERFORMED = "## Performed\n| Check | How | Result | Evidence |\n{sep}\n{rows}\n"
NOT_PERFORMED = "## Not performed\n| Check | Why not | What would enable it |\n|---|---|---|\n| none | | |\n"
RISK = "## Residual risk\n{risk}\n"
ROW = "| Unit tests | `npm test` | 12 passed | CI run 5 |"


def record(rows=ROW, sep="|---|---|---|---|", risk="None known.", before="", between=""):
    return before + PERFORMED.format(sep=sep, rows=rows) + between + NOT_PERFORMED + RISK.format(risk=risk)


class CheckRecordEdges(unittest.TestCase):
    def check(self, text):
        return run("check_record.py", "-", stdin=text)

    def test_failing_result_is_reported_as_failing(self):
        r = self.check(record(rows="| Unit tests | `npm test` | FAIL: 2 of 12 failed | CI run 5 |"))
        self.assertIn(": failing (1 performed, 1 failing", r.stdout)

    def test_short_separator_is_not_a_row(self):
        r = self.check(record(sep="|--|--|--|--|", rows=""))
        self.assertEqual(r.returncode, 1)
        self.assertIn("Performed: table has no rows", r.stdout)

    def test_all_empty_row_is_reported(self):
        r = self.check(record(rows=ROW + "\n| | | | |"))
        self.assertIn("Performed row 2: empty Check", r.stdout)

    def test_heading_inside_a_fence_is_ignored(self):
        fence = "```bash\n# run it\nnpm test\n```\n"
        r = self.check(record(rows=ROW + "\n\n" + fence))
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_fenced_example_does_not_replace_a_section(self):
        example = "\n```markdown\n## Residual risk\nexample text\n```\n"
        r = self.check(record(risk="", between=example))
        self.assertIn("Residual risk: empty", r.stdout)
        self.assertNotIn("duplicate", r.stdout)

    def test_duplicate_section_is_reported(self):
        r = self.check(record() + "\n## Performed\nmore notes\n")
        self.assertIn("duplicate section: Performed", r.stdout)

    def test_comment_only_risk_is_empty(self):
        r = self.check(record(risk="<!-- fill in -->"))
        self.assertIn("Residual risk: empty", r.stdout)

    def test_leading_horizontal_rule_is_not_frontmatter(self):
        r = self.check("---\nSome intro.\n\n---\n" + record())
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_bom_is_ignored(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "bom.md"
            p.write_text("\ufeff" + record(), encoding="utf-8")
            r = run("check_record.py", p)
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_missing_file_fails_without_traceback(self):
        r = run("check_record.py", "/nonexistent/record.md")
        self.assertEqual(r.returncode, 1)
        self.assertIn("cannot read", r.stdout)
        self.assertNotIn("Traceback", r.stderr)

if __name__ == "__main__":
    unittest.main()
