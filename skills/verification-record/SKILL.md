---
name: verification-record
description: Write a verification record before you report work as done, open a pull request, or mark one ready. The record lists each check you ran with its evidence, each check you could not run with the reason and what would make it possible, and the risk that remains, then a bundled script lints it. Also lists checks that recur as "could not run" across many records, which shows what the test harness lacks. Use when finishing a code change, a fix, a migration, or any delegated task whose result someone must trust; when writing the Verification section of a PR; or when asked "did you test this?", "what did you verify?", "検証記録", "確認したことと確認していないこと", "動作確認の記録".
---

# Verification Record

A record replaces "I verified it" with a list a reader can check. It must say what you did not verify as plainly as what you did. A record that hides a skipped check is worse than none.

## 1. List the checks before running them

Before verifying, list the checks this change calls for. Draw them from:

- the repository's CI configuration and its documented test, lint, and type-check commands;
- each user-facing path the change touches (a command, a page, an endpoint, a file format), driven the way a user drives it;
- side effects the change promises (rows written, files created, messages sent);
- checks the requester named.

Every listed check ends up in exactly one table. Do not shorten the list to the checks that are easy to run.

## 2. Run them and write the record

Use this format. Keep the column names exactly.

```markdown
---
id: 142
subject: Split the auth middleware into token and session layers
---
## Performed
| Check | How | Result | Evidence |
|---|---|---|---|
| Unit tests | `uv run pytest tests/auth` | 48 passed | CI run 9912 |

## Not performed
| Check | Why not | What would enable it |
|---|---|---|
| Login in a real browser | No staging URL for this branch | Preview deploys per PR |

## Residual risk
Session refresh after token expiry has no test.
```

- **How:** the exact command, or the steps a person would repeat.
- **Result:** what you observed: a count, an exit code, the visible state. Not "works" or "OK".
- **Evidence:** a pointer a reviewer can open: a CI run, a log or screenshot path, a commit. Not prose.
- **Performed** means run against the final revision of the change. After any edit, rerun the checks it affects or move them to Not performed.
- **Not performed** includes checks that ran only against a stand-in: a mock where production has a real service, a dry run, a different branch. Say what the stand-in was.
- **What would enable it:** the smallest change to the environment or harness that would let the check run. This column becomes the harness roadmap.
- A failed check that you did not fix stays in Performed. Start its Result with `FAIL` (`FAIL: 2 of 48 failed`), and put its consequence in Residual risk.
- A table with nothing to list gets one row whose first cell is `none`. Write `None known.` under Residual risk when there is none. Silence never stands for "nothing to report".

## 3. Put it where the reader looks

Follow the repository's convention. If it has a `verifications/` directory, open the PR first, then commit the record there as `<pr-number>.md`. Otherwise, put the three sections under a `## Verification` heading in the PR description, using `###` headings. For work without a PR, put the record in your final report.

## 4. Lint it

```bash
python3 <skill-dir>/scripts/check_record.py verifications/142.md
gh pr view 142 --json body -q .body | python3 <skill-dir>/scripts/check_record.py -
```

The script prints the status it derives from the rows: `failing` (a Result starts with `FAIL`), `unverified` (nothing performed), `partial` (some gaps), or `verified` (no gaps). It exits 1 on a missing or duplicated section, wrong columns, an empty cell, or two `none` tables. Fix the record, not the script. Report the derived status as it is: `unverified` is an honest result, and `failing` means the work is not done.

To block pull requests that lack a valid record, read [references/ci-gate.md](references/ci-gate.md).

## 5. Read the gaps across records

```bash
python3 <skill-dir>/scripts/gaps.py --min 2 verifications/
python3 <skill-dir>/scripts/gaps.py --csv verifications/ > gaps.csv
```

For records kept in PR descriptions, save each body to a file first, for example `gh pr view 142 --json body -q .body > records/142.md`, then pass the directory.

It groups Not performed rows by check, most frequent first, with the reasons and enablers given. A check that keeps appearing marks a hole in the harness. Propose closing it (a preview environment, a fixture, a script that drives the feature) rather than writing the same gap again. `--csv` writes one row per gap for a spreadsheet or a review page.
