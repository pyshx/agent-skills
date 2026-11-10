---
type: llm
focus: trace
weight: 1
---

experiment.criteria に absolute（correct の min 0.95）、relative（latency_ms の max_worse_pct 15）、regressions（max 2）、critical_categories（["安全"]）を書き、依頼にない基準を足していない
