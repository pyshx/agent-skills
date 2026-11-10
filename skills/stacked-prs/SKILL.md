---
name: stacked-prs
description: Manage stacked PR branches - split large changes into small, reviewable PRs, update branches after base merge, and cascade changes downstream. Triggers when working with chained/dependent PRs or when a change needs to be split into multiple PRs.
---

# Stacked PRs Branch Management

## Overview
This skill helps manage a chain of dependent PRs (stacked PRs) where each PR builds on the previous one.

It updates branches by merging, never by rebasing. This suits repositories that squash-merge: rebasing a pushed branch needs a force-push, which rewrites history that reviewers and downstream branches already hold.

## When to Use

- Splitting a large change into multiple small PRs
- Updating downstream branches after a PR in the chain is merged
- Syncing the chain with new commits on main
- Creating a new PR that depends on an unmerged PR

## Decision: Independent PR vs. Stacked PR

| Scenario | Strategy |
|----------|----------|
| Change is self-contained, no dependency on unmerged work | **Independent PR** — branch from `main` |
| Change builds on top of an unmerged PR | **Stacked PR** — branch from the parent PR branch |
| Large change that can be split into independent pieces | **Multiple independent PRs** from `main` |
| Large change where pieces depend on each other sequentially | **Stacked PRs** — chain branches |

## Branch Chain Pattern
```
main
  └── pr1-branch (base: main)
        └── pr2-branch (base: pr1-branch)
              └── pr3-branch (base: pr2-branch)
```

## Commands

### 1. Update Branches After PR Merge

When a PR in the chain is squash-merged to main:

**Key Strategy - Avoid Conflict Hell:**
1. Merge main into the **original merged branch** first (locally)
2. Then cascade merge through downstream branches
3. This works because downstream branches already know how to merge from their parent

**Steps:**
1. `git fetch origin main`
2. `git checkout {merged-branch}`
3. `git merge origin/main -m "Merge main into {merged-branch}"`
4. For each downstream branch in order:
   - `git checkout {downstream-branch}`
   - `git merge {parent-branch} -m "Merge {parent-branch} into {downstream-branch}"`
   - Run the repository's own checks for the PR (the commands its CI runs)
   - If new errors from merged files, fix them and commit
   - `git push origin {downstream-branch}`

### 2. Update Branches After Main Updated

When main has new commits unrelated to the PR chain:

1. `git fetch origin main`
2. Merge main into the first branch in chain
3. Cascade merge through all downstream branches
4. Push each branch

### 3. Split Large Change into Multiple PRs

Follow [Google's Small CLs Guide](references/small-cls.md) principles:

- ~100 lines per PR is reasonable, ~1000 is too large
- Each PR should be "one self-contained change"
- Keep refactoring separate from features/bug fixes
- System must work after each PR merges

**Splitting strategies:**
- By type: formatting -> lint fixes -> manual fixes
- By feature: independent full-stack features separately
- By files: group by reviewer expertise

**Workflow:**
1. Identify logical groupings
2. Create branches in sequence, each based on the previous
3. Create PRs with appropriate base branches
4. Use `gh pr create --base {parent-branch}` for each
5. Give each PR its own verification record (the `verification-record` skill when installed) covering only that layer's diff: what you ran on that branch, what you could not run, and the remaining risk
6. Review each layer on its own diff, `git diff {parent-branch}...{branch}`. If a review tool such as Plannotator is available, `plannotator review --base {parent-branch}` opens the same layer for annotation

## Example Workflow

```bash
# After pr1-branch is merged to main
git fetch origin
git checkout pr1-branch
git merge origin/main -m "Merge main into pr1-branch"

# Cascade to pr2
git checkout pr2-branch
git merge pr1-branch -m "Merge pr1-branch into pr2-branch"
git push origin pr2-branch

# Cascade to pr3
git checkout pr3-branch
git merge pr2-branch -m "Merge pr2-branch into pr3-branch"
git push origin pr3-branch
```

## Verify and Fix After Merge

After merging, verify each branch still passes its checks:

1. **Run the checks** the repository uses for the PR's purpose: the lint, format, and test commands from its CI configuration or contributor docs. Do not guess commands from another project.

2. **If new errors appear** from merged files:
   - Fix them on the appropriate branch (usually the one responsible for that type of fix)
   - Commit fixes: `git commit -m "Fix errors from merged files"`
   - Push and cascade downstream

3. **Update documentation** if error counts changed (e.g., in progress tracking docs)

4. **Update each affected PR's verification record.** A merge changes the code under every downstream PR, so checks recorded before it no longer describe the branch. Rerun them, or move them to Not performed with the reason.

## Tips

- Always use merge (not rebase) to keep history simple
- Resolve conflicts at each level before moving downstream
- Push after each successful merge
- Check PR diff after updates to ensure correctness
- Run checks on each branch to catch new errors early
