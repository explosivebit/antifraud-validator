# Antifraud Transaction Validator

> Spec v0.1 | 2026-04-15 | Author: Course Instructor

## 1. Context

This project is a **live demo** for the first session of an agent-driven development course.

**Audience:** mixed skill level — from complete beginners to senior/principal engineers.

**Session goal:** demonstrate the full development workflow using Claude Code:
1. Configure `CLAUDE.md` for the project
2. Understand existing code
3. Implement a meaningful feature (new antifraud rule)
4. Commit, push, and open a Pull Request on GitHub
5. Review / approve / reject the PR on GitHub

## 2. Problem Statement

We need a simple **transaction validator** that checks payment transactions
against a set of antifraud rules and returns a verdict:

| Verdict       | Meaning                                      |
|---------------|----------------------------------------------|
| `APPROVED`    | Transaction passes all checks                |
| `SUSPICIOUS`  | Transaction triggers soft rules (needs review)|
| `BLOCKED`     | Transaction triggers hard rules (auto-reject) |

## 3. Decision: Why This Task

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

## 4. Technical Design

### 4.1 Project Structure

```
antifraud-validator/
  CLAUDE.md               — project instructions for Claude Code
  package.json            — project metadata, test script
  validator.js            — core validation logic (rules + engine)
  validator.test.js       — unit tests (Node.js assert)
  transactions.json       — sample transactions for manual testing
```

### 4.2 Transaction Schema

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

### 4.3 Pre-built Rules (in starter code)

| Rule             | Condition                | Verdict      |
|------------------|--------------------------|--------------|
| High Amount      | `amount > 1_000_000`     | `BLOCKED`    |
| Medium Amount    | `amount > 100_000`       | `SUSPICIOUS` |

### 4.4 Live Task: Add a New Rule

During the session, participants add **one new rule** with Claude Code's help:

**Night Transfer Rule:**
- Transactions between 00:00 and 06:00 (local or UTC) with `amount > 50_000`
- Verdict: `SUSPICIOUS`

This rule is intentionally chosen because:
- It requires extracting hours from a timestamp (light logic)
- It combines two conditions (amount + time)
- It is a real antifraud heuristic used in production systems

## 5. Session Flow

| Step | Action                              | Duration |
|------|-------------------------------------|----------|
| 1    | Clone repo, explore starter code    | 5 min    |
| 2    | Configure `CLAUDE.md` together      | 5 min    |
| 3    | Discuss the task, ask Claude Code   | 5 min    |
| 4    | Implement night transfer rule       | 10 min   |
| 5    | Run tests, verify                   | 5 min    |
| 6    | Commit + push + open PR            | 5 min    |
| 7    | Review PR on GitHub, approve/reject | 5 min    |
| **Total** |                               | **~40 min** |

## 6. Acceptance Criteria

- [ ] `node validator.js` runs without errors and prints verdicts for sample transactions
- [ ] `node validator.test.js` passes all tests (including the new rule)
- [ ] The new rule correctly flags night transactions over 50,000 as `SUSPICIOUS`
- [ ] A clean commit with a descriptive message exists
- [ ] A Pull Request is opened on GitHub with a summary of changes
- [ ] Participants can reproduce the exercise offline using the video recording

## 7. Out of Scope

- No npm dependencies (no install step)
- No REST API / HTTP server
- No database
- No frontend
- No TypeScript (plain JS reduces cognitive load)
- No ESM modules (CommonJS `require` is more familiar to beginners)
