---
type: llm
focus: trace
weight: 1
---

experiment.criteria の regressions を max 2、count unaccepted で書き、そのほかに absolute（correct の min 0.95）、relative（latency_ms の max_worse_pct 15）、critical_categories（["安全"]）を書いている
