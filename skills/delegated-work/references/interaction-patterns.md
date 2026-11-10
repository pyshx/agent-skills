# Interaction patterns and portability

## Early question while preparation continues

「説明資料は社内の承認者向けですか、それとも顧客向けですか？
導入判断が目的なら、社内向けの比較表を中心にする案を勧めます。
回答が必要なのは本文構成に入る前です。先に既存資料と元データへのアクセスを確認します。」

Only say preparation continues if you can actually continue this turn. Without
nonblocking input, do the cheap independent checks first, then ask and yield.
Never interpret the absence of an answer as choosing the recommended option.

## Decision checkpoint

- Decision needed: whether to include paid customer interviews.
- Recommendation: complete the available-data comparison first.
- Evidence: three sources cover price/features; service quality remains unverified.
- Alternatives: decide now with that limitation, or authorize interviews and their cost.
- Meanwhile: finish the cited comparison and list unanswered interview questions.

A brief should make one decision easy, not expose an internal implementation log.
Only create a separate explanatory artifact when it reduces the user's review effort.

## Capability-based adaptation

| Capability | Behavior |
|---|---|
| Nonblocking questions | Submit an early question; continue independent ready work; incorporate answers as they arrive. |
| Blocking questions / ordinary chat | Use a short independent discovery batch, then ask and yield; resume after the answer. |
| Plan-only / read-only mode | Stay within that mode. Inspect and plan; defer writes and experiments that require execution until the host/user permits them. |
| Local files | Persist minimal task state in established storage. |
| No local files | Provide a concise handoff in chat; do not claim durable storage. |
| Subagents | Optional, not required. Use only when permitted; verify their outputs and avoid conflicting edits. |
| Calendar connector | Does not itself authorize invitations. Prefer chat; schedule only on explicit instruction. |
| Background execution | Claim it only after a supported authorized job has actually started. State its real limits. |

Claude Code and Codex can both read the same SKILL.md. Tool names, permissions,
question behavior, and supported execution modes differ by host/version. Detect
actual tools rather than hardcoding AskUserQuestion, request_user_input, or a shell.
Installation alone does not add asynchronous questions or scheduling to either host.

## Relationship to other workflows

Plan mode controls what the host allows. This skill works inside those restrictions;
it cannot unlock execution. A questioning skill such as grill-me is useful for
stress-testing a design, but its completion criteria need not govern the whole
assignment. Use focused questioning when needed; do not interview every possible
branch before independent work. Domain execution skills can handle implementation,
research, or writing while this skill manages dependencies and requester decisions.
