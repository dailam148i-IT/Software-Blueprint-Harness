# End-to-End Prompt Playbook

Use these prompts with a coding agent after installing Software Blueprint Harness. The goal is to move from raw product idea to implementation-ready story packets without starting code too early.

## Simplified Entry

Use this first when you want the harness to lead the process:

```text
nắm quy trình framework này
```

Then:

```text
/start I need to build: <app, web, SaaS, automation, or feature>.

First ask only the necessary questions. Then run deep refs/research with multi-agent review, create a multi-agent plan, ask verifier agents to check it, stop for human approval, and only after approval write the full documentation set.
```

CLI equivalent:

```bash
blueprint start "I need to build a student management web app" --depth deep
```

## 0. Install The Harness

```text
Install Software Blueprint Harness into this repository. Use dry-run first, then install with GitHub templates and examples if safe. Do not overwrite existing files unless I approve.
```

Expected commands:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --dry-run
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes --with-github --with-examples
npx -y github:dailam148i-IT/Software-Blueprint-Harness doctor --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness check --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness explain-fail --directory .
```

If the package is installed globally or locally, replace the GitHub `npx` runner with `blueprint`.

## 1. Product Intake

```text
I want to build: <describe the product>.

Act as orchestrator. Do not write code yet. Classify the request, ask only the questions that cannot be researched, identify the risk lane, and prepare docs/product/product-passport.yaml plus docs/FEATURE_INTAKE.md notes.
```

Good user input example:

```text
I want a web app for managing students, classes, attendance, tuition, and staff permissions for a training center.
```

## 2. Research Plan

```text
Create a research plan before product decisions. Use the refs and research pipeline. The output must list source repositories, market/domain questions, technical unknowns, assumptions, and evidence rules.
```

Expected commands:

```bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs status
blueprint refs index
blueprint research plan --topic "<product/domain>" --depth deep
```

## 3. Deep Reference Research

```text
Run deep reference research. Extract patterns from the synced reference repositories. Produce claim-map, conflicts, synthesis, and integration proposal. Do not integrate a claim unless it has source evidence.
```

Expected commands:

```bash
blueprint research run --topic "<product/domain>" --depth deep
blueprint research report
blueprint research validate
```

## 4. Product Requirements

```text
Using the accepted research synthesis, write the PRD to the Artifact Depth Standard. Include personas, scope by release, requirement IDs, acceptance criteria IDs, business rules, measurable NFRs, assumptions/open questions with owner and severity, and trace targets. Keep every requirement testable.
```

Expected files:

```text
docs/product/prd.md
docs/product/product-passport.yaml
docs/research/latest-reference-synthesis.md
```

## 5. UX And User Flows

```text
Create the UX spec for this product. Define roles, core workflows, screens, empty/loading/error states, accessibility requirements, and mobile/desktop expectations. Do not create marketing copy unless the product needs a public landing page.
```

Expected file:

```text
docs/product/ux-spec.md
```

## 6. Architecture And Technology Options

```text
Act as architect. Propose 2-3 technology options with tradeoffs. Consider team skill, deployment, cost, data sensitivity, auth, testing, and maintenance. Recommend one option, but mark it as proposed until I approve.
```

After approval:

```text
Update docs/architecture.md and create a decision record for the chosen stack. Include module boundaries, data ownership, API style, deployment, observability, and security notes.
```

Expected commands:

```bash
blueprint new-decision "Choose technology stack"
```

## 7. Data And API Contract

```text
Create the data and API contract. Define entities, commands, queries, validation errors, permissions, audit requirements, and migration risks. If personal data exists, mark privacy/security extension outputs as required.
```

Expected file:

```text
docs/product/data-api-contract.md
```

## 8. Machine-Readable Specs And Edge Cases

```text
Create machine-readable implementation contracts before story handoff. Update state machines, RBAC, error codes, integration protocol, edge-case matrix, and traceability matrix. Include callback idempotency, late/duplicate events, out-of-stock or unavailable resources, cancel/refund, payment timeout, retry exhaustion, dead-letter handling, and reconcile runbook where relevant.
```

Expected files:

```text
docs/specs/state-machines.yaml
docs/specs/rbac.yaml
docs/specs/error-codes.yaml
docs/product/integration-protocol.md
docs/EDGE_CASE_MATRIX.md
docs/TRACEABILITY_MATRIX.md
```

## 9. Epics And Story Packets

```text
Create epics and story packets from the PRD. Each story must be small enough for one implementation agent, include product contract, acceptance criteria, Definition of Ready, Definition of Done, machine-readable contract links, edge cases, validation proof, ownership, allowed files, forbidden files, proof format, and dependencies.
```

Expected commands:

```bash
blueprint new-story "Create student profile"
blueprint new-story "Manage class enrollment"
blueprint new-story "Record attendance"
```

## 10. Test Matrix

```text
Build the test matrix and traceability matrix. Map every requirement and story to scenario IDs, test type, command, fixture/data, expected evidence, owner, and status. Do not use yes/no as proof.
```

Expected file:

```text
docs/TEST_MATRIX.md
docs/TRACEABILITY_MATRIX.md
```

## 11. Extension Gates

```text
Run required extension hooks before readiness. Complete any generated output docs until their Gate Status is not BLOCKED.
```

Expected commands:

```bash
blueprint extension list
blueprint extension run before_readiness
```

## 12. Production Lint And Readiness Review

```text
Run production lint and readiness. If either fails, fix the docs and story packets instead of starting code. Continue until the review says READY_FOR_IMPLEMENTATION or all concerns have owners and explicit acceptance.
```

Expected commands:

```bash
blueprint lint --ci
blueprint readiness
```

## 13. Multi-Agent Handoff

```text
Create context packets for each implementation agent. Each packet must include the story, docs to read, constraints, allowed scope, forbidden changes, and validation proof.
```

Expected commands:

```bash
blueprint export-context US-001 --agent frontend-agent
blueprint export-context US-002 --agent backend-agent
blueprint export-context US-003 --agent qa-agent
blueprint memory update
blueprint memory compact
```

## 14. Implementation Prompt

```text
Implement only story <US-xxx>. Read the exported context packet first. Stay inside allowed files/modules. Do not change product scope, architecture, data/API contracts, or validation rules unless you create a decision record and stop for review. After coding, run the required tests, update TEST_MATRIX evidence, update memory, and summarize residual risk.
```

## 15. Review Prompt

```text
Review the implementation for story <US-xxx>. Prioritize bugs, regressions, missing validation, security/privacy issues, and contract drift. Give findings first with file and line references. Do not rewrite unrelated code.
```

## 16. Release Prompt

```text
Prepare release notes. Verify docs, decisions, test matrix, evidence, readiness review, and memory are current. Do not release if any readiness blocker or extension output remains BLOCKED.
```

## Golden Rule

If an agent cannot answer what it is building, why, for whom, how it will prove correctness, and what it must not touch, the project is not ready for implementation.
