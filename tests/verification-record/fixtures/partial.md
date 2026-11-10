---
id: 142
subject: Split the auth middleware into token and session layers
---
## Performed
| Check | How | Result | Evidence |
|---|---|---|---|
| Unit tests | `uv run pytest tests/auth` | 48 passed | CI run 9912 |
| Lint | `uv run ruff check .` | exit 0 | CI run 9912 |

## Not performed
| Check | Why not | What would enable it |
|---|---|---|
| Login in a real browser | No staging URL for this branch | Preview deploys per PR |

## Residual risk
Session refresh after token expiry has no test.
