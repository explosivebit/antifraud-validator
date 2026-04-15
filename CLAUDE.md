# CLAUDE.md — Antifraud Transaction Validator

## Critical Rules

- This is a **learning project** — code must be readable by a beginner in 60 seconds
- Zero external dependencies — only Node.js built-in modules
- CommonJS (`require`) only — no ESM (`import`)
- Every function has a single responsibility

## Documentation

All project knowledge lives in `docs/`. Read before making design decisions:

- **[docs/index.md](docs/index.md)** — full documentation index
- **[docs/prd.md](docs/prd.md)** — problem statement, acceptance criteria, scope
- **[docs/architecture.md](docs/architecture.md)** — schema, rule contract, engine design
- **[docs/session-plan.md](docs/session-plan.md)** — lesson flow and timing
- **[docs/adr/](docs/adr/)** — architecture decision records

## File Map

| File                | Purpose                                 |
|---------------------|---------------------------------------- |
| `validator.js`      | Core logic: rules and validation engine |
| `validator.test.js` | Unit tests using `node:assert`          |
| `transactions.json` | Sample data for manual testing          |
| `TASK.md`           | Task specification (quick reference)    |

## Code Conventions

- Names: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants
- Verdicts: `"APPROVED"`, `"SUSPICIOUS"`, `"BLOCKED"` — string constants only
- Rule signature: `(transaction) => { verdict, rule }` or `null`
- Strict equality (`===`) everywhere
- `"use strict";` at the top of every `.js` file

## Validation Logic

Rules are evaluated in priority order — first match wins:
1. `BLOCKED` rules (highest priority)
2. `SUSPICIOUS` rules
3. No match → `APPROVED`

## Testing

- Run tests: `node validator.test.js`
- Run manually: `node validator.js`
- Each rule needs at least 2 tests: one triggers, one does not
- Test names describe the scenario, not the implementation

## Commit Messages

Format: `<type>: <short description>`
Types: `feat` | `fix` | `test` | `docs` | `refactor`

## Design Insights

Why this file is structured the way it is:
1. **Primacy-recency.** `Critical Rules` first, `Never Do` last — LLMs pay most attention to the edges of context
2. **Closed file list.** Without an explicit File Map, LLMs create `utils.js`, `helpers.js` — the list prevents bloat
3. **Uniform rule contract.** `(tx) => result | null` means new rules are added by copying, not by inventing architecture
4. **Docs live in `docs/`.** CLAUDE.md is a rulebook, not an encyclopedia — it links to docs, never duplicates them

## Never Do

- Do NOT add npm dependencies — run with `node` alone
- Do NOT use TypeScript, ESM imports, or async/await
- Do NOT create classes or complex abstractions — plain functions only
- Do NOT add try/catch unless handling a specific known error
- Do NOT add comments that repeat what the code says
- Do NOT modify the transaction schema without updating tests and sample data
- Do NOT create files beyond those listed in File Map and `docs/`
- Do NOT put project descriptions or PRD content in this file — it belongs in `docs/`
