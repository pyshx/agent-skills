---
type: llm
focus: trace
weight: 1
---

release.criteria に absolute（correct の min 0.85）、relative（latency_ms の max_worse_pct 10）、relative（cost_usd の max_worse 0.005）、regressions（max 3）、critical_categories（["安全"]）を書いている
