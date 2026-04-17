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

| File                | Purpose                                          |
|---------------------|--------------------------------------------------|
| `rules.js`          | Rule functions and verdict constants             |
| `validator.js`      | Rule registry, validation engine, and CLI        |
| `validator.test.js` | Unit + integration tests using `node:assert`     |
| `transactions.json` | Sample data for manual testing                   |
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

## Continuous Integration

- Workflow: `.github/workflows/test.yml`
- Runs on every Pull Request and on push to `main`
- Uses Node.js 20, runs `node validator.test.js`
- A failing run blocks merge once the `test` status check is set as required in branch protection

## Git Workflow

### Branch Naming

Format: `<type>/<short-kebab-description>`

| Type | When to use | Example |
|------|-------------|---------|
| `feat/` | New feature or rule | `feat/night-transfer-rule` |
| `fix/` | Bug fix | `fix/boundary-off-by-one` |
| `test/` | Adding or improving tests only | `test/edge-cases-medium-amount` |
| `docs/` | Documentation changes only | `docs/update-architecture` |
| `refactor/` | Code restructure, no behavior change | `refactor/extract-rule-registry` |

Rules:
- Always branch from `main`
- Use lowercase, hyphens between words, no spaces or underscores
- Keep branch names under 50 characters
- One branch = one logical change (do not mix features)

### Branch Protection

- `main` is protected: no direct push; PR with 1 approval required for non-admins
- Repository admin may merge their own PR without a second approval — this is a solo-developer compromise; in a real team the admin bypass should be disabled
- Force-push is forbidden on all branches (ruleset `no-force-push-all-branches`)
- Deletion of `main` is forbidden; feature branches are deletable after merge (normal cleanup)
- All changes to `main` go through Pull Requests

### Commit Messages

Format: `<type>: <short description>`

Types: `feat` | `fix` | `test` | `docs` | `refactor`

Rules:
- Subject line: imperative mood, lowercase, max 72 characters, no period
- Body (optional): blank line after subject, explain **why** not **what**
- One commit = one logical change
- Do NOT use `git commit --amend` on pushed commits
- Do NOT use `--no-verify` to skip hooks

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
