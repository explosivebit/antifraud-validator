# PRD: Antifraud Transaction Validator

> v0.1 | 2026-04-15 | Author: Course Instructor

## Context

This project is a **live demo** for the first session of an agent-driven development course.

**Audience:** mixed skill level — from complete beginners to senior/principal engineers.

**Session goal:** demonstrate the full development workflow using Claude Code:
1. Configure `CLAUDE.md` for the project
2. Understand existing code
3. Implement a meaningful feature (new antifraud rule)
4. Commit, push, and open a Pull Request on GitHub
5. Review / approve / reject the PR on GitHub

## Problem Statement

We need a simple **transaction validator** that checks payment transactions
against a set of antifraud rules and returns a verdict:

| Verdict       | Meaning                                      |
|---------------|----------------------------------------------|
| `APPROVED`    | Transaction passes all checks                |
| `SUSPICIOUS`  | Transaction triggers soft rules (needs review)|
| `BLOCKED`     | Transaction triggers hard rules (auto-reject) |

## Why This Task

| Criterion                        | Fit |
|----------------------------------|-----|
| Understandable in under 5 min    | Yes — everyone knows what fraud is |
| Domain logic is intuitive        | Yes — "large amount at night = suspicious" |
| Fits in a 30-40 min live session | Yes — ~50 lines of code total |
| Produces a meaningful PR diff    | Yes — adding a new rule is a clean, isolated change |
| Zero external dependencies       | Yes — pure Node.js, native JSON |
| Works on any OS                  | Yes — only requires `node` (v14+) |

### Alternatives Considered

- **Python version** — equally simple, but JS has lower setup friction (no venv)
- **CLI with CSV** — adds file I/O complexity, distracts from the core goal
- **Rule Engine pattern** — good for session 2 as a refactor exercise

## Acceptance Criteria

- [ ] `node validator.js` runs without errors and prints verdicts for sample transactions
- [ ] `node validator.test.js` passes all tests (including the new rule)
- [ ] The new rule correctly flags night transactions over 50,000 as `SUSPICIOUS`
- [ ] A clean commit with a descriptive message exists
- [ ] A Pull Request is opened on GitHub with a summary of changes
- [ ] Participants can reproduce the exercise offline using the video recording

## Out of Scope

- No npm dependencies (no install step)
- No REST API / HTTP server
- No database or frontend
- No TypeScript, no ESM modules
