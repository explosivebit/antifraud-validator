# ADR-001: JavaScript over Python

**Status:** Accepted
**Date:** 2026-04-15
**Context:** Choosing the language for a live-demo antifraud validator project.

## Decision

Use plain JavaScript (Node.js) instead of Python.

## Rationale

- `node` is pre-installed on most dev machines; Python often requires `venv` + `pip`
- JSON is native to JavaScript — no `import json` needed
- `if/else` syntax in JS is universally readable
- The course focuses on agent workflow, not language features — less setup = more time for the core lesson

## Consequences

- Participants without Node.js must install it (one command via brew/nvm/choco)
- No access to Python-specific ML/data libraries (irrelevant for this project)
