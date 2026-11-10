## Why
Retries were unbounded.

## Verification

### Performed
| Check | How | Result | Evidence |
|---|---|---|---|
| Retry test | `go test ./retry/...` | ok | CI run 77 |

### Not performed
| Check | Why not | What would enable it |
|---|---|---|
| Login in a real browser | No staging URL for this branch | Preview deploys per PR |

### Residual risk
Backoff jitter is untested.

## Scope
Retry only.
