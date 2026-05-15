# Agent Operating Guide

This repository is the source project for Software Blueprint Harness.

## Read Order

1. `README.md`
2. `INSTALL.md`
3. `docs/HARNESS.md`
4. `docs/WORKFLOW.md`
5. `docs/ARTIFACT_DEPTH_STANDARD.md`
6. `docs/EXAMPLE_COMPARISON.md`
7. `docs/PROJECT_RECOVERY_GUIDE.md`
8. `blueprint/core/cli.js`
9. `blueprint/core/templates.js`
10. `skills/software-blueprint-harness/SKILL.md`

## Rules

- Keep dependencies small and justified; YAML and schema validation are part of the production contract.
- Do not make app templates here; this project provides the harness around future apps.
- Human-facing docs should explain why and how.
- Agent-facing docs should be terse, specific, and action-oriented.
- If behavior changes, update README, templates, skill instructions, and examples together.
- If output quality changes, update `docs/ARTIFACT_DEPTH_STANDARD.md`, `docs/EXAMPLE_COMPARISON.md`, and the skill quality rubric together.
- Installer behavior must be safe: dry-run, merge, override, and no surprise destructive writes.
- Any output path from templates, extensions, refs, integrations, or GitHub export must stay inside the target project.

## Done Definition

- CLI command works or blocker is documented.
- Templates and docs remain aligned.
- GitHub install path remains usable.
- Tests from the publish plan have been attempted.
