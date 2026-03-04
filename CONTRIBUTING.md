# Contributing to MindCloner

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
```

## Local quality gates

Run these before opening a PR:

```bash
npm run lint
npm run typecheck
npm test
```

Or run all gates together:

```bash
npm run verify
```

## Development notes

- Keep changes minimal and focused.
- Add or update tests when behavior changes.
- Keep `README.md` and `tasks/todo.md` aligned with delivered behavior.

## Pull request checklist

- Scope is clear and objective.
- Tests pass locally.
- No regressions in CLI flows.
- Documentation updated when needed.
