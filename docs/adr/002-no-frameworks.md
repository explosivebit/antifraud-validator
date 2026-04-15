# ADR-002: No Frameworks or Dependencies

**Status:** Accepted
**Date:** 2026-04-15
**Context:** Deciding whether to use npm packages (Jest, Express, etc.) in a teaching project.

## Decision

Zero external dependencies. Only Node.js built-in modules (`assert`, `fs`, `path`).

## Rationale

- `npm install` is a failure point in live demos (network issues, version conflicts)
- Beginners get confused by `node_modules/`, `package-lock.json`, and transitive deps
- `node:assert` is sufficient for 3-5 unit tests
- The focus is agent-driven workflow, not framework mastery

## Consequences

- No pretty test output (no colors, no diffs) — acceptable for a 40-min demo
- No hot-reload or watch mode — students run `node file.js` manually
- Tests must be self-contained (no `describe`/`it` DSL)
