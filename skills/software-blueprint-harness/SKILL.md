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
- `blueprint-plan`: create epics, stories, sprint plan, traceability matrix, edge-case matrix, and test matrix.
- `blueprint-spec`: create or update machine-readable state machines, RBAC, error codes, and integration protocol.
- `blueprint-readiness`: run gates and produce readiness review.
- `blueprint-agent-brief`: prepare role-specific context packets.
- `blueprint-status`: summarize stage, blockers, and artifact health.
- `blueprint-retro`: capture lessons and harness improvements.

## Workflow

1. Inspect existing `AGENTS.md`, `docs/`, `.blueprint/`, and `blueprint.config.yaml`.
2. When the user says "nắm quy trình", read `AGENTS.md`, `docs/AGENT_BOOTSTRAP.md`, and `docs/SIMPLE_PROMPT_WORKFLOW.md`, then confirm the process briefly.
3. When the user sends `/start <idea>`, prefer `blueprint start "<idea>"` or create the same intake package manually.
4. Read `docs/ARTIFACT_DEPTH_STANDARD.md` before writing the full documentation set.
5. Use `docs/EXAMPLE_COMPARISON.md` to avoid shallow-but-plausible output.
6. Use `docs/COMMERCE_RISK_PLAYBOOK.md` when payment, shipping, inventory, auth, provider, or privacy risk exists.
7. Do not ask questions that can be answered from existing artifacts or research.
8. For new input, run intake first.
9. Ask only high-impact product or tradeoff questions.
10. Create or update the smallest relevant artifacts.
11. Stop for human approval before writing the full documentation set when the plan is not yet approved.
12. Keep product docs, specs, stories, decisions, traceability, edge cases, test matrix, and memory aligned.
13. Use concise agent-facing docs; keep human-facing docs clear and explanatory.

## Gates

Block implementation when:

- PRD has no acceptance criteria.
- Architecture has no stack or boundary decision.
- Story has no validation proof.
- Story has no Definition of Ready/Done, owner, allowed files, forbidden files, or proof format.
- Machine-readable state/RBAC/error contracts are missing, placeholder-only, or unlinked from stories.
- EDGE_CASE_MATRIX lacks required callback, timeout, refund/cancel, retry, dead-letter, or reconcile behavior where relevant.
- TRACEABILITY_MATRIX does not map requirement -> spec -> story -> test -> evidence.
- TEST_MATRIX lacks rows for core behavior.
- TEST_MATRIX uses `yes/no`, `planned`, or `pending implementation` as proof instead of scenario IDs, commands, fixtures, and evidence paths.
- PRD has no stable requirement IDs or acceptance criteria IDs.
- Research is simulated/planned but treated as evidence.
- Product Passport and `.blueprint/status.json` disagree on stage, risk, or readiness.
- Risk reviewer has unresolved `FAIL`.
- High-risk flags exist without the required security/privacy/data review.

Run `blueprint explain-fail`, `blueprint lint --ci`, and `blueprint readiness` before implementation when the CLI is available.

`READY_WITH_ACCEPTED_RISK` is a human approval stop. Do not treat it as an automatic implementation pass unless the user records explicit concern acceptance with owner, impact, expiry, and rollback note.

## Output Discipline

Every handoff should name:

- Inputs read.
- Output artifact created or changed.
- Assumptions.
- Blockers.
- Next gate.

## References

Prefer project-local docs. Use external research only when current information or domain facts are needed.
