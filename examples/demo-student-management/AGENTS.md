# Agent Operating Guide

This repository uses Software Blueprint Harness. Do not start implementation until docs/readiness-review.md says READY_FOR_IMPLEMENTATION.

## Bootstrap
When the user says "nắm quy trình", "learn the process", or "follow the harness", read this file first, then read docs/AGENT_BOOTSTRAP.md and docs/SIMPLE_PROMPT_WORKFLOW.md.

When the user sends:

```text
/start <I want to build an app/web/SaaS/feature...>
```

do not code. Treat it as a blueprint-start request:
1. Create or refresh the intake package with `blueprint start "<idea>" --depth deep` when the CLI is available.
2. Ask only the necessary clarifying questions.
3. Run or plan refs/research.
4. Create a multi-agent plan.
5. Ask verifier agents to review the plan.
6. Stop for human approval.
7. After approval, write the full documentation set.
8. Run readiness before implementation.

## Read Order
1. README.md
2. docs/AGENT_BOOTSTRAP.md
3. docs/SIMPLE_PROMPT_WORKFLOW.md
4. docs/HARNESS.md
5. docs/FEATURE_INTAKE.md
6. docs/ARTIFACT_DEPTH_STANDARD.md
7. docs/EXAMPLE_COMPARISON.md
8. docs/COMMERCE_RISK_PLAYBOOK.md when payment, shipping, inventory, auth, or provider risk exists
9. docs/product/product-passport.yaml
10. docs/product/prd.md
11. docs/architecture.md
12. docs/product/data-api-contract.md
13. docs/product/integration-protocol.md
14. docs/specs/state-machines.yaml
15. docs/specs/rbac.yaml
16. docs/specs/error-codes.yaml
17. docs/stories/
18. docs/TRACEABILITY_MATRIX.md
19. docs/EDGE_CASE_MATRIX.md
20. docs/TEST_MATRIX.md
21. docs/decisions/
22. .blueprint/memory/project-memory.yaml

## Task Loop
1. Classify the request: new spec, spec slice, change request, initiative, maintenance, or harness improvement.
2. Choose lane: tiny, normal, or high-risk.
3. Grade affected artifacts against docs/ARTIFACT_DEPTH_STANDARD.md.
4. Locate affected product docs, specs, stories, decisions, edge cases, traceability, and test matrix rows.
5. Work only inside the selected story scope.
6. Update docs, memory, decisions, test matrix, traceability, edge cases, and evidence when behavior changes.

## Done Definition
- Requested change completed or blocker documented.
- Product truth remains current.
- Validation expectations remain current.
- Requirement IDs, acceptance criteria IDs, edge case IDs, and test scenario IDs remain traceable.
- Evidence is linked when checks exist.
- Final response says what changed and what was not attempted.
