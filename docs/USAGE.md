# Usage Guide

Software Blueprint Harness is designed for one job: create enough high-quality product, architecture, story, and validation context before implementation starts.

## Mental Model

Do not treat this as a markdown folder. Treat it as a project operating system.

```text
Raw idea
-> intake
-> research
-> product contract
-> solution design
-> story packets
-> readiness gate
-> implementation
-> review
-> release
```

## Common Workflow: New Product

User input:

```text
I want to create a website for managing students.
```

Recommended flow:

1. Fill `docs/product/product-passport.yaml`.
2. Write `docs/research/market-domain-research.md`.
3. Write `docs/product/prd.md`.
4. Write `docs/product/ux-spec.md` if the product has UI.
5. Write `docs/architecture.md`.
6. Write `docs/product/data-api-contract.md`.
7. Write `docs/product/integration-protocol.md`.
8. Update `docs/specs/state-machines.yaml`, `docs/specs/rbac.yaml`, and `docs/specs/error-codes.yaml`.
9. Fill `docs/EDGE_CASE_MATRIX.md` and `docs/TRACEABILITY_MATRIX.md`.
10. Create epics in `docs/epics/epics.md`.
11. Create story packets in `docs/stories/`.
12. Map stories to proof in `docs/TEST_MATRIX.md`.
13. Run `blueprint lint --ci` and `blueprint readiness`.

The user should not be forced to choose technology immediately. First gather product intent, then research, then propose options and ask the user to approve.

Before implementation, compare every artifact against `docs/ARTIFACT_DEPTH_STANDARD.md`. If the output feels like a good summary but cannot produce exact tests, exact state transitions, exact permissions, and exact evidence paths, it is still shallow.

## Common Workflow: Change Request

For a change request:

1. Classify the request in `docs/FEATURE_INTAKE.md` terms.
2. Decide lane: tiny, normal, or high-risk.
3. Update product docs if behavior changes.
4. Add or update a story packet.
5. Add or update a decision record if architecture or product policy changes.
6. Update `docs/TEST_MATRIX.md`.
7. Export a context packet for the responsible agent.

## Common Workflow: Multi-Agent Build

Use agent briefs and context packets:

```bash
blueprint export-context US-001 --agent frontend-agent
blueprint export-context US-002 --agent backend-agent
blueprint export-context US-003 --agent qa-agent
```

Each agent packet should define:

- story scope
- docs to read
- allowed files/modules
- forbidden changes
- validation proof
- handoff target

Before handoff, each story must also link its state machine, RBAC, error-code, edge-case, traceability, and test matrix rows.

## Common Workflow: Sync Reference Repositories

The framework keeps reference repos out of git history by default. Clone them locally when you need to inspect source material:

```bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs status
blueprint refs index
blueprint research run --topic "your product" --depth deep
blueprint research validate
```

References are cloned into:

```text
refs/vendor/
```

The conceptual mapping lives in:

```text
docs/REFERENCE_SYNTHESIS.md
```

The generated research run lives in `.blueprint/research/runs/<run-id>/` and includes evidence cards, claim map, conflicts, synthesis, and integration proposal.

## Common Workflow: Run Extension Hooks

Extensions are real hook-driven artifacts. For example:

```bash
blueprint extension create security-threat-model
blueprint extension run before_readiness
```

If an extension declares outputs, the hook runner creates those docs unless they already exist.

Built-in security and privacy extensions also declare `required_when.risk_flags`. During `blueprint readiness`, a high-risk product that mentions auth, authorization, payment, personal data, or sensitive data must have the required extension outputs, and those outputs must not say `BLOCKED`.

## Common Workflow: Export GitHub Issues

After stories exist:

```bash
blueprint github create-issues
```

This creates issue markdown under:

```text
.blueprint/github/issues/
```

The command also maintains `.blueprint/github/issues.index.json`. Use `--use-gh --repo owner/name --confirm-publish` to create real GitHub issues through the GitHub CLI after reviewing the generated issue markdown. Re-running with `--use-gh` skips stories already marked created unless you pass `--force`.

```bash
blueprint github create-issues --use-gh --repo owner/name --confirm-publish
```

## Production Lint

`blueprint lint --ci` is the strict pre-code automation. It fails if implementation-critical docs still contain `TBD`, story packets lack ownership or file boundaries, specs remain placeholders, edge-case coverage is incomplete, or traceability is missing from requirement to story to test evidence.

Use `blueprint check` for adoption and `blueprint lint --ci` before implementation.

When lint fails, run:

```bash
blueprint explain-fail --directory .
```

Then follow `docs/PROJECT_RECOVERY_GUIDE.md`.

## Depth Standard

Use these docs to prevent shallow-but-plausible output:

- `docs/ARTIFACT_DEPTH_STANDARD.md`: minimum depth per artifact.
- `docs/EXAMPLE_COMPARISON.md`: weak vs strong examples.
- `docs/COMMERCE_RISK_PLAYBOOK.md`: payment, shipping, inventory, callback, privacy, and RBAC checks.
- `docs/PROJECT_RECOVERY_GUIDE.md`: how to upgrade an old or shallow project.

## GitHub CI Behavior

The installed GitHub workflow runs `blueprint check` without `--strict`. This lets a new project push while it still has expected concerns such as missing stories. Structural failures still fail, and teams can run `blueprint lint --ci` locally or in a stricter branch protection workflow once adoption is complete.

## What The AI Should Ask

The AI should ask about preferences that cannot be researched:

- Who are the real users?
- What is the MVP?
- Which roles need access?
- Is data sensitive?
- What deployment target matters?
- Are speed, cost, maintainability, or scale most important?

The AI should research or infer:

- common modules for the product type
- technology options
- known risks
- common data model candidates
- test strategy
- architecture tradeoffs

## Readiness Results

`READY_FOR_IMPLEMENTATION` means implementation may start.

`READY_WITH_ACCEPTED_RISK` means implementation may start only after a human explicitly accepts every concern with owner, impact, expiry, and rollback note.

`NOT_READY` means implementation should not start.

`BLOCKED` means human input or missing source material is required.

## Practical Rule

The framework is successful when a new developer or coding agent can answer:

- What are we building?
- For whom?
- What is in scope?
- What is out of scope?
- Which decisions are locked?
- Which story am I implementing?
- Which state/RBAC/error contract applies?
- Which edge cases can break this flow?
- How do I prove it works?
- What am I not allowed to change?
