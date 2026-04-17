# Documentation Index

> All project documentation lives in `docs/`. This file is the entry point.
> CLAUDE.md links here — the agent reads this index to find deeper context.

## Documents

| Document | Path | Description |
|----------|------|-------------|
| PRD | [prd.md](prd.md) | Problem statement, why this task, acceptance criteria |
| Architecture | [architecture.md](architecture.md) | Technical design, schema, project structure |
| Session Plan | [session-plan.md](session-plan.md) | Step-by-step lesson flow and timing |
| ADR-001 | [adr/001-javascript-over-python.md](adr/001-javascript-over-python.md) | Why JavaScript was chosen over Python |
| ADR-002 | [adr/002-no-frameworks.md](adr/002-no-frameworks.md) | Why zero dependencies |
| Session Summary | [session-summary.md](session-summary.md) | Full log of decisions, actions, and results |

## How to Use

- **Starting a new session?** Read `prd.md` for the goal, then `session-plan.md` for the flow
- **Adding code?** Check `architecture.md` for the schema and rule contract
- **Making a design decision?** Create a new ADR in `adr/` following the existing format
