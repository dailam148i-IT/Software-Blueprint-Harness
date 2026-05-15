# Agent Operating Guide

This repository is the source project for Software Blueprint Harness.

## Read Order

1. `README.md`
2. `INSTALL.md`
3. `docs/HARNESS.md`
4. `docs/WORKFLOW.md`
5. `blueprint/core/cli.js`
6. `blueprint/core/templates.js`
7. `skills/software-blueprint-harness/SKILL.md`

## Rules

- Keep the CLI dependency-free unless a dependency is clearly worth the install cost.
- Do not make app templates here; this project provides the harness around future apps.
- Human-facing docs should explain why and how.
- Agent-facing docs should be terse, specific, and action-oriented.
- If behavior changes, update README, templates, skill instructions, and examples together.
- Installer behavior must be safe: dry-run, merge, override, and no surprise destructive writes.

## Done Definition

- CLI command works or blocker is documented.
- Templates and docs remain aligned.
- GitHub install path remains usable.
- Tests from the publish plan have been attempted.
