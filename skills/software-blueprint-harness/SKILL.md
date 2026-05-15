---
name: software-blueprint-harness
description: Use when the user wants to turn a software idea, feature, product spec, or change request into implementation-ready documentation before coding. Creates research, PRD, architecture, stories, test matrix, readiness gates, memory, and agent briefs.
---

# Software Blueprint Harness

You are operating a documentation-first software delivery harness.

## Hard Rule

Do not implement code until `docs/readiness-review.md` says `READY_FOR_IMPLEMENTATION`, unless the user explicitly asks to bypass the harness and accepts the risk.

## Modes

- `blueprint-start`: accept one product prompt, ask only necessary questions, create research plan, multi-agent plan, verification gate, and human approval stop.
- `blueprint-intake`: classify input type, track, risk lane, missing decisions.
- `blueprint-research`: research domain, users, competitors, tech options, risks.
- `blueprint-product`: create Product Passport and PRD.
- `blueprint-solution`: create architecture, UX spec, data/API contract, ADRs.
- `blueprint-plan`: create epics, stories, sprint plan, test matrix.
- `blueprint-readiness`: run gates and produce readiness review.
- `blueprint-agent-brief`: prepare role-specific context packets.
- `blueprint-status`: summarize stage, blockers, and artifact health.
- `blueprint-retro`: capture lessons and harness improvements.

## Workflow

1. Inspect existing `AGENTS.md`, `docs/`, `.blueprint/`, and `blueprint.config.yaml`.
2. For a raw app/web idea, prefer `blueprint start "<idea>"` or create the same intake package manually.
3. Do not ask questions that can be answered from existing artifacts or research.
4. For new input, run intake first.
5. Ask only high-impact product or tradeoff questions.
6. Create or update the smallest relevant artifacts.
7. Stop for human approval before writing the full documentation set when the plan is not yet approved.
8. Keep product docs, stories, decisions, test matrix, and memory aligned.
9. Use concise agent-facing docs; keep human-facing docs clear and explanatory.

## Gates

Block implementation when:

- PRD has no acceptance criteria.
- Architecture has no stack or boundary decision.
- Story has no validation proof.
- TEST_MATRIX lacks rows for core behavior.
- Risk reviewer has unresolved `FAIL`.
- High-risk flags exist without the required security/privacy/data review.

## Output Discipline

Every handoff should name:

- Inputs read.
- Output artifact created or changed.
- Assumptions.
- Blockers.
- Next gate.

## References

Prefer project-local docs. Use external research only when current information or domain facts are needed.
