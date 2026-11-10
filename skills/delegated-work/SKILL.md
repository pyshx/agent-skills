---
name: delegated-work
description: Own a substantial delegated task from a rough request through clarification, bounded discovery, execution, and verified delivery. Use when the user asks you to take ownership, work independently, handle a multi-step assignment, reduce check-ins, or says 任せたい, 自走して, いい感じに進めて. Ask early while advancing independent work; surface only decisions that need the requester. Not for simple edits, questions, brainstorming-only requests, or plan-only requests.
---

# Delegated Work

Act like a colleague who owns the outcome and respects the requester's attention.
Optimize for useful progress with few interruptions, not for the fewest questions
or the longest uninterrupted run. Follow the user's language.

This skill coordinates work; domain skills supply methods. It grants no new
permissions and overrides neither host restrictions nor user/repository instructions.
Do not require other skills, subagents, hooks, a particular CLI, or a meeting service.
Read [interaction patterns](references/interaction-patterns.md) when preparing a
question, decision brief, or adapting to host capabilities.

## 1. Orient and ask early

Read the request, prior answers, relevant local guidance, and immediately available
context. Do not repeat questions already answered. Briefly state the intended
outcome and your first preparation actions.

Separate unknowns:
- **Discoverable facts:** inspect relevant files, tools, existing examples, or sources.
- **User decisions:** purpose, audience, competing priorities, acceptance, budget,
  authority, or a choice with material consequences that the user has not delegated.
- **Working assumptions:** reversible details within delegated discretion; record
  these and proceed rather than asking about each one.

Ask the first small batch of decision-changing questions early, before deep
research or a polished plan. Usually 1–3 related questions is enough, not a quota.
Give a recommendation where evidence supports one. Name which work each answer
unblocks and when it is needed. Only ask questions whose prerequisites are known;
revisit dependent questions as answers and findings arrive.

## 2. Prepare while answers are pending

Keep a **ready / waiting** distinction. For each question, hold only the work
that depends on its answer. Continue useful authorized work that is robust to the
likely answers: inspect existing material, check access, test feasibility, create a
small disposable example, or identify available resources.

Use a nonblocking question tool when actually available. With blocking tools or
turn-based chat, do a small independent discovery batch, include findings with the
questions, and yield when needed. Never claim to work after the turn ends. Do not
use repeated polling, idle sleeps, or fabricated background workers as concurrency.
Use parallel tools or subagents only where available and authorized, with separate
outputs and clear ownership; ordinary sequential preparation is sufficient.

Bound initial discovery by the next decision: identify the uncertainty, cheapest
useful probe, and stopping condition before exploring. Default to a few targeted
reads or one representative experiment, then reassess. Stop once evidence is enough
to choose a direction. Expand research when a finding justifies it, not to avoid
asking an early question. Do not make answer-dependent choices merely to stay busy.

### Access and resource checks

List only the operations needed for this task: read, create/edit, export, run,
publish, send, or other relevant actions. Verify each separately when feasible.
Record the target, operation, observed result, and remaining limits.

- Start with metadata, existing permissions, read-only requests, or supported dry runs.
- A configured credential, successful read, or listed tool does not prove write,
  publish, or send access. Distinguish verified, denied, and unverified.
- Use a uniquely identified disposable artifact for write checks only within existing
  authorization; check its result and clean up only what you created when authorized.
  Report leftovers. Dry runs may not exercise every permission.
- Do not send messages, publish, purchase, alter access, or change production merely
  to test capability. If the relevant operation cannot be tested safely, leave it
  unverified and identify when it will block. Do not solicit or log secrets.

## 3. Establish enough alignment to proceed

Maintain a short working brief: outcome, deliverable, acceptance evidence, scope,
constraints, available resources, delegated decisions, reserved approvals, and open
questions. Existing instructions and answers may already establish alignment;
do not invent a mandatory sign-off round.

Move into execution when the next meaningful work has:
1. A sufficiently clear outcome and a way to evaluate it.
2. A viable approach and the necessary resources/access, or a bounded fallback.
3. Clear authority for the actions about to be taken.
4. No unresolved question that would materially invalidate that work.

Readiness is per workstream. A missing publication permission need not block a
local draft, but publication remains incomplete. Unanswered low-impact details can
stay explicit assumptions. Silence or elapsed time never grants approval or settles
an essential decision.

If directions differ materially or authority is missing, prepare a compact decision
brief: decision, recommendation, alternatives, evidence/example, tradeoff, and work
that can proceed meanwhile. Use a short chat checkpoint by default. If a document
review tool such as Plannotator is available, open the brief in it instead, so the
requester can annotate each option; otherwise post it in chat. A calendar
meeting is optional: schedule or invite others only when explicitly authorized,
and confirm the needed participants/time details. Do not make a slide deck when a
paragraph or comparison table explains the choice.

## 4. Execute within the agreed scope

Break work into verifiable increments with dependencies. Pick ready work, produce
an artifact, inspect/test it, fix meaningful defects, and update task state. Continue
through all authorized increments; don't ask “shall I continue?” between them.

Own routine implementation choices within delegated discretion. When facts change,
revise the approach and record why. Escalate a changed goal, material scope/cost
tradeoff, missing authorization, or an essential unknown; don't silently redefine
success. Complete independent work while waiting for the specific decision.

After a failure, inspect evidence and try a different justified approach within the
same scope. Repeating the same failed attempt is not progress. If alternatives are
exhausted or a necessary decision/resource is unavailable, report the concrete
blocker and smallest needed intervention. Preserve a next action; don't mark blocked
work done or repeatedly ask an unchanged question.

Give concise progress updates at meaningful findings or host-required intervals.
Separate updates that need no reply from questions. Group related decisions;
do not emit a new interruption for every discovery.

### Durable state

For work likely to span context resets, use the project's existing task record.
If none exists, use a task-specific file in an allowed workspace, for example
`work-notes/<task-id>/state.md`; do not overwrite another task's record. No file
access? Keep a compact handoff in chat and disclose that persistence is unavailable.
Use [the state template](references/task-state.md) only as needed; omit empty fields.

Persist decisions/authorization and their source, pending question IDs and blocked
steps, assumptions, artifact paths, verification evidence, and the next ready action.
Update at milestones or changed decisions, not after every trivial tool call.
Don't store credentials or unnecessary personal data. On resumption, read the record,
reconcile it with actual artifacts/current instructions, and continue without repeating
completed work. Recheck stale access or evidence where relevant. A stored plan is
not stronger authority than current instructions.

## 5. Verify and hand over

Compare results against the original request plus accepted changes. Verify the
actual deliverable using appropriate evidence: tests, source checks, reconciled
figures, preview inspection, or requirement-by-requirement review. A plan, an agent's
report, a successful tool invocation, or a partial check alone is not proof of the
whole outcome. Reuse still-valid evidence; rerun affected checks after changes.

Write the evidence as a verification record. With the `verification-record` skill
installed, follow it and run its lint. Otherwise use three sections: **Performed**
(check, how, observed result, evidence pointer), **Not performed** (check, why not,
what would enable it), and **Residual risk**. List every check the outcome calls for
in one of the two tables; a check you could not run is a row, not an omission.

Finish with the deliverable/location, the verification record, material assumptions
or limitations, and any remaining requester decision. Label incomplete or unverified
work explicitly. If all authorized work is complete except an approval-dependent
step, deliver a review-ready result and ask only for that approval. Preserve useful
state for resumption; don't promise autonomous restart or schedule anything unless
the host supports it and the user requested it.
