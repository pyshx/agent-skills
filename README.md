# agent-skills

Agent Skills I use for everyday development. Each skill is a directory with a `SKILL.md`, so it works with Claude Code, Codex, and any agent that reads the Agent Skills format. In Claude Code, all skills install as one plugin and are invoked as `pyshx:<skill-name>`.

## Skills

| Skill | What it does |
|---|---|
| `verification-record` | Before work is reported done or a PR opens, write a record of each check run (with evidence), each check not run (with the reason and what would make it possible), and the remaining risk. A bundled script lints the record, and another lists the checks that keep going unrun across records |
| `delegated-work` | Own a delegated task from a rough request to verified delivery: ask the decision-changing questions early, keep working on what does not depend on the answers, and surface only the decisions that need the requester |
| `stacked-prs` | Split a large change into stacked PRs, cascade merges down the stack after a base PR is squash-merged, and keep a verification record for each layer |
| `eval-review` | Turn local CSV, JSON, or JSONL evaluation results into one offline HTML page: compare models, decide which candidates can ship, share an experiment result, label items by hand, or triage feedback |
| `session-retrospective` | Run a Keep / Problem / Try retrospective at the end of a session, flag problems that recur across past retrospectives and verification records, and turn each into a mechanism, memory, doc, or skill |
| `shared-doc-writing` | Write documents meant to get a reaction (proposals, design docs, PR descriptions, READMEs, specs): decide the reader, lead with the conclusion, separate verified facts from assumptions. Includes rules for Japanese prose |
| `explain-diff-html` | When a unit of code change is finished, produce a self-contained interactive HTML page that explains it |
| `explain-diff-notion` | Explain a code change as a Notion page to share with a team. Needs the Notion MCP tools |
| `mathland` | On request, build an interactive tool (stepper, trace viewer, time scrubber, command center) driven by real system state, so you understand a system by driving it. The idea is Seymour Papert's "Mathland", as applied to code by Geoffrey Litt in "Understanding is the new bottleneck" |
| `web-research` | Look up external facts (library usage, versions, config keys, pricing, news) instead of answering from memory, and cite sources |
| `open-in-editor` | Open a file from the current Git worktree in VS Code or Cursor, in that worktree's window |
| `session-cleanup` | Claude Code desktop app only: classify unarchived sessions, archive finished ones, and report the rest (Japanese) |

## Install

### Claude Code

```
/plugin marketplace add pyshx/agent-skills
/plugin install pyshx@pyshx-agent-skills
```

### Other agents

```
npx skills add pyshx/agent-skills --list
npx skills add pyshx/agent-skills --skill verification-record
gh skill install pyshx/agent-skills verification-record
```

## Skills I use from elsewhere

These are not mine, so they are not in this repository. Install them from their sources.

| Skill | Source | License |
|---|---|---|
| `anatomy` | [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | MIT |
| `neuro-symbolic-reasoning` | [sundial-org/skills](https://github.com/sundial-org/skills) | none stated |
| `sol` | Ships with [solstone](https://github.com/solpbc/solstone) | AGPL-3.0 |
| pstack | [pyshx/pstack-claude](https://github.com/pyshx/pstack-claude) | MIT |

## Development

- Skills live in `skills/<name>/`. Eval suites live in `evals/<name>/`, so installers do not copy them.
- Run a suite with `scripts/eval.sh <skill> [claude plugin eval options]`, for example `scripts/eval.sh verification-record --scaffold --allow-tools Edit Write Bash`.
- Unit tests for `verification-record`'s scripts: `python3 tests/verification-record/test_scripts.py`.
- Check the manifest with `claude plugin validate .`.

## License

MIT. See [LICENSE](LICENSE). `delegated-work` and `eval-review` also carry `THIRD_PARTY_NOTICES.md` for the work they adapt or bundle.
