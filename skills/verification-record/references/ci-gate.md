# CI gate for verification records

Read this when a repository wants pull requests to fail CI until they carry a valid verification record. Add the gate only when the repository owner asks for it.

The gate runs when a PR opens, whenever its code or description changes, and when a draft is marked ready, so it also covers teams that open PRs as ready.

## Setup

1. Copy `scripts/record.py` and `scripts/check_record.py` from this skill into the repository, for example under `.github/verification/`. CI cannot rely on the skill being installed.
2. Add the workflow below as `.github/workflows/verification-record.yml`.

```yaml
name: verification-record
on:
  pull_request:
    types: [opened, synchronize, reopened, edited, ready_for_review]
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Take the checker from the base branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.base.sha }}
          path: base
          sparse-checkout: .github/verification
      - name: Lint the verification record
        env:
          PR_NUMBER: ${{ github.event.pull_request.number }}
          PR_BODY: ${{ github.event.pull_request.body }}
        run: |
          record="verifications/${PR_NUMBER}.md"
          if [ -f "$record" ]; then
            python3 base/.github/verification/check_record.py "$record"
          else
            printf '%s' "$PR_BODY" | python3 base/.github/verification/check_record.py -
          fi
```

The PR body goes through an environment variable, never interpolated into the script, so text in a description cannot run as shell. The checker runs from the base branch, so a PR cannot weaken the check that judges it. Merge the checker to the base branch before the gate goes live.

## Notes

- A record committed under `verifications/` is reviewed with the code. One in the PR body is easier to update but leaves no history in the repository.
- The gate checks that the record is complete, not that it is true. Reviewers still open the evidence.
- When the PR number is not known at commit time, commit the record as `verifications/<branch-name>.md` and rename it after the PR opens, or keep the record in the PR body.
