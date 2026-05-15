# Reference Synthesis

This file maps the reference projects into concrete Software Blueprint Harness modules. The framework does not simply link to these projects; it translates their useful patterns into CLI commands, docs, schemas, hooks, and agent workflows.

## harness-experimental

| Source Concept | Harness Implementation |
| --- | --- |
| App is for users; harness is for agents | `docs/HARNESS.md`, `AGENTS.md`, `.blueprint/` |
| Feature intake before work | `docs/FEATURE_INTAKE.md`, `blueprint check`, `blueprint readiness` |
| Story packets | `docs/stories/`, `blueprint new-story` |
| Test matrix | `docs/TEST_MATRIX.md` |
| Decisions as durable memory | `docs/decisions/`, `blueprint new-decision` |
| Context packets | `.blueprint/context-packets/`, `blueprint export-context` |
| Harness improvement loop | `docs/HARNESS_BACKLOG.md` |

## BMAD-METHOD

| BMAD Phase | Harness Stage | Artifact |
| --- | --- | --- |
| Analysis | INTAKE_READY / RESEARCH_READY | `docs/research/*`, Product Passport |
| Planning | PRODUCT_READY | `docs/product/prd.md`, epics |
| Solutioning | SOLUTION_READY | `docs/architecture.md`, data/API contract, ADRs |
| Implementation | STORY_READY -> IMPLEMENTING | story packets, context packets, test matrix |

BMAD-style roles are represented in `docs/MULTI_AGENT_OPERATING_MODEL.md` and `docs/agent-briefs/`.

## Academic Research Skills

| Source Pattern | Harness Implementation |
| --- | --- |
| staged pipeline | workflow state machine |
| integrity gate | readiness gate |
| review/revise loop | review reports and revision traceability |
| source discipline | research report, assumptions, evidence fields |
| process summary | progress ledger, memory compact, release notes |

## Caveman

| Source Pattern | Harness Implementation |
| --- | --- |
| concise agent docs | `docs/CONTEXT_COMPRESSION.md` |
| skill packaging | `skills/software-blueprint-harness/SKILL.md` |
| multi-tool distribution thinking | CLI + skill + integration adapters |
| eval discipline | `test/cli.test.js`, scenario examples |

## Security / Delivery References

| Reference | Harness Use |
| --- | --- |
| Scrum Guide | `docs/AGILE_SCRUM.md`, story readiness and done rules |
| OWASP ASVS/SAMM | security/privacy extensions and high-risk triggers |
| Twelve-Factor App | deployment and operations checks in architecture/release artifacts |

## Reference Sync

Run this to clone source repositories locally:

```bash
blueprint refs sync
```

The repositories are cloned into `refs/vendor/`, which is ignored by git to avoid vendoring large external projects into this framework.
