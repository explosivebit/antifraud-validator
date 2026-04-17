# Architecture: Antifraud Transaction Validator

## Project Structure

```
project-root/
  CLAUDE.md               — agent rules and constraints (NOT documentation)
  TASK.md                 — task specification (quick reference)
  rules.js                — rule functions and verdict constants
  validator.js            — rule registry, validation engine, and CLI
  validator.test.js       — unit + integration tests (Node.js assert)
  transactions.json       — sample transactions for manual testing
  .github/workflows/
    test.yml              — CI: runs the test suite on PR and push to main
  docs/
    index.md              — this documentation index
    prd.md                — product requirements
    architecture.md       — you are here
    session-plan.md       — lesson timing
    adr/                  — architecture decision records
```

## Module Responsibilities

| Module             | Owns                                                              | Does not own                  |
|--------------------|-------------------------------------------------------------------|-------------------------------|
| `rules.js`         | Verdict constants, rule functions, `Transaction`/`RuleResult` types | Registration, orchestration |
| `validator.js`     | `BLOCKED_RULES` / `SUSPICIOUS_RULES` arrays, `validateTransaction`, CLI entrypoint | Rule bodies |
| `validator.test.js`| All tests (unit, data-driven, integration)                         | Production logic              |

Adding a new rule now touches two places instead of one — the rule body goes in `rules.js`, and the registration goes in `validator.js`. This is intentional: rules become drop-in, the registry decides priority.

## Transaction Schema

```json
{
  "id": "tx-001",
  "amount": 150000,
  "currency": "RUB",
  "timestamp": "2026-04-15T03:30:00Z",
  "sender": "user-42",
  "receiver": "user-99",
  "country": "RU"
}
```

## Rule Contract

Every rule is a plain function with this signature:

```js
function ruleName(transaction) {
  // returns { verdict: "BLOCKED"|"SUSPICIOUS", rule: "ruleName" }
  // or null if the rule does not trigger
}
```

## Validation Engine

Rules are stored in two arrays by priority:

```
BLOCKED_RULES  → evaluated first  (hard stop)
SUSPICIOUS_RULES → evaluated second (soft flag)
```

First matching rule wins. If no rule triggers, the verdict is `APPROVED`.

## Pre-built Rules

| Rule             | Condition            | Verdict      |
|------------------|----------------------|--------------|
| High Amount      | `amount > 1_000_000` | `BLOCKED`    |
| Medium Amount    | `amount > 100_000`   | `SUSPICIOUS` |

## Live Task Rule

| Rule             | Condition                                        | Verdict      |
|------------------|--------------------------------------------------|--------------|
| Night Transfer   | hour 00:00–06:00 UTC **and** `amount > 50_000`   | `SUSPICIOUS` |
