export const templates = {
  "AGENTS.md": `# Agent Operating Guide

This repository uses Software Blueprint Harness. Do not start implementation until docs/readiness-review.md says READY_FOR_IMPLEMENTATION.

## Bootstrap
When the user says "nắm quy trình", "learn the process", or "follow the harness", read this file first, then read docs/AGENT_BOOTSTRAP.md and docs/SIMPLE_PROMPT_WORKFLOW.md.

When the user sends:

\`\`\`text
/start <I want to build an app/web/SaaS/feature...>
\`\`\`

do not code. Treat it as a blueprint-start request:
1. Create or refresh the intake package with \`blueprint start "<idea>" --depth deep\` when the CLI is available.
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
`,
  "blueprint.config.yaml": `project: Software Blueprint Project
version: 0.1.0
default_track: standard
language: vi
readiness_gate: required
memory:
  enabled: true
  compact_agent_context: true
integrations:
  github: false
extensions: []
`,
  "README.md": `# Software Blueprint Project

This project uses Software Blueprint Harness: a documentation-first workflow for humans, agents, and multi-agent development teams.

Start here:

\`\`\`bash
blueprint status
blueprint check
blueprint lint --ci
blueprint readiness
\`\`\`

Code should begin only after \`docs/readiness-review.md\` says \`READY_FOR_IMPLEMENTATION\`.
`,
  "docs/HARNESS.md": `# Harness

The app is what users touch. The harness is what agents and developers touch.

The harness turns human intent into product contracts, story packets, validation expectations, decisions, and memory before implementation begins.

## Source Hierarchy
User intent -> docs/product/* -> docs/stories/* -> docs/TEST_MATRIX.md -> docs/decisions/* -> .blueprint/memory/*

## Growth Rule
When an agent sees repeated confusion, missing validation, or unclear ownership, it must improve the harness or add an item to docs/HARNESS_BACKLOG.md.
`,
  "docs/WORKFLOW.md": `# Workflow

RAW_INPUT -> INTAKE_READY -> RESEARCH_READY -> PRODUCT_READY -> SOLUTION_READY -> STORY_READY -> READY_FOR_IMPLEMENTATION -> IMPLEMENTING -> REVIEWING -> RELEASE_READY -> RELEASED -> RETROSPECTIVE_DONE

## Tracks
- Quick: narrow, low-risk work.
- Standard: product features and typical apps.
- Enterprise: auth, payment, sensitive data, migrations, compliance, or external providers.
`,
  "docs/FEATURE_INTAKE.md": `# Feature Intake

Every implementation prompt enters intake before code changes.

## Input Types
| Type | Use when |
| --- | --- |
| New spec | A new product idea or complete specification arrives. |
| Spec slice | A selected behavior from an accepted spec. |
| Change request | A bounded product change or bug fix. |
| New initiative | A larger product area needing multiple stories. |
| Maintenance | Technical, operational, dependency, or security work. |
| Harness improvement | Process, template, proof, or agent instruction changes. |

## Risk Lanes
- tiny: docs/copy/names/narrow edits.
- normal: story-sized behavior with bounded blast radius.
- high-risk: auth, authorization, data model, data loss, migration, payment, provider, security, privacy, public contracts, weak proof, or multi-domain work.
`,
  "docs/QUALITY_GATES.md": `# Quality Gates

Gate statuses: PASS, READY_FOR_IMPLEMENTATION, READY_WITH_ACCEPTED_RISK, FAIL, BLOCKED.

## Mandatory Gates
- Research Gate: sources, insight, assumptions, risks.
- Product Gate: scope, out-of-scope, metrics.
- Requirement Gate: testable requirements and no contradictions.
- Solution Gate: stack, boundaries, data/API, security.
- Machine Spec Gate: state machines, RBAC, and error codes are structured and traceable.
- Integration Gate: idempotency, retry, signature, callback, dead-letter, and reconcile rules.
- Story Gate: context, acceptance criteria, proof.
- Trace Gate: requirement -> spec -> story -> test -> evidence.
- Agent Gate: ownership and limits.
- Pre-Code Gate: READY_FOR_IMPLEMENTATION.
`,
  "docs/AGILE_SCRUM.md": `# Agile Scrum Operating Model

Use Scrum lightly and practically.

- Product Backlog: epics and stories derived from PRD and architecture.
- Sprint Backlog: stories that pass Story Gate.
- Definition of Ready: product contract, dependencies, design notes, validation proof.
- Definition of Done: code, tests, docs, test matrix, and evidence updated.
`,
  "docs/MULTI_AGENT_OPERATING_MODEL.md": `# Multi-Agent Operating Model

Agents hand off artifacts, not vibes.

Roles: orchestrator, research-agent, product-agent, ux-agent, architect-agent, data-api-agent, scrum-planner-agent, qa-agent, risk-reviewer-agent, developer-agent, code-reviewer-agent, technical-writer-agent, release-agent.

Each agent brief must define inputs, outputs, forbidden actions, gate rules, and handoff target.
`,
  "docs/TECHNOLOGY_DECISION_GUIDE.md": `# Technology Decision Guide

Technology is proposed after intake and research, not guessed at prompt time.

Compare options by: product fit, team skill, deployment target, data sensitivity, integration needs, cost, scalability, testability, and maintenance.
`,
  "docs/CONTEXT_COMPRESSION.md": `# Context Compression

Agent-facing docs should be short, precise, and high-signal.

Compress: AGENTS.md summaries, agent briefs, story summaries, status summaries, review comments.

Do not over-compress: security warnings, irreversible action confirmations, API/schema contracts, acceptance criteria, complex setup steps.
`,
  "docs/AGENT_BOOTSTRAP.md": `# Agent Bootstrap

This file tells an AI agent how to begin using the harness after installation.

## User Says: "nắm quy trình"

Respond by reading:

1. AGENTS.md
2. docs/SIMPLE_PROMPT_WORKFLOW.md
3. docs/WORKFLOW.md
4. docs/QUALITY_GATES.md
5. docs/PROMPTS_END_TO_END.md

Then summarize the operating rule in one short answer:

\`\`\`text
Tôi đã nắm quy trình. Khi bạn gửi /start <ý tưởng>, tôi sẽ hỏi vài câu cần thiết, chạy/chuẩn bị research, lập kế hoạch đa agent, cho verifier kiểm tra, chờ bạn chốt, rồi mới viết bộ tài liệu đầy đủ. Tôi sẽ không code trước readiness.
\`\`\`

## User Sends: /start

Example:

\`\`\`text
/start tôi muốn làm website quản lý sinh viên
\`\`\`

Agent behavior:

1. Extract the idea after \`/start\`.
2. Run \`blueprint start "<idea>" --depth deep\` if the CLI is available.
3. If the CLI is not available, manually create the same artifacts listed in docs/SIMPLE_PROMPT_WORKFLOW.md.
4. Ask only the questions in the generated \`01-questions.md\`.
5. Do not write PRD, architecture, stories, or code yet.
6. Run or schedule refs/research.
7. Create or present the multi-agent plan.
8. Run verifier review.
9. Stop at human approval.

## After Human Approval

Only after approval, write the full documentation set:

- Product Passport
- Research synthesis
- PRD
- UX spec
- Architecture
- Data/API contract
- Decision records
- Epics and stories
- Test matrix
- Readiness review
- Memory and compact context

## Hard Stop

Do not start implementation until \`blueprint readiness\` says \`READY_FOR_IMPLEMENTATION\`. If readiness says \`READY_WITH_ACCEPTED_RISK\`, implementation is blocked until a human accepts every concern with owner, impact, expiry, and rollback note.
`,
  "docs/SIMPLE_PROMPT_WORKFLOW.md": `# Simple Prompt Workflow

Use one prompt to start:

\`\`\`text
/blueprint-start
I need to build: <app, website, SaaS, automation, or feature>.
\`\`\`

The orchestrator should ask only necessary questions, run refs/research, create a multi-agent plan, ask verifier agents to review, stop for human approval, and then write full documentation.

CLI shortcut:

\`\`\`bash
blueprint start "I need to build a student management web app" --depth deep
\`\`\`

The command creates \`.blueprint/intake/<run-id>/\`, \`docs/intake/<run-id>.md\`, and a research plan.
`,
  "docs/RESEARCH_PIPELINE.md": `# Research Pipeline

Use refs and research commands to turn source repositories into evidence-backed decisions.

\`\`\`bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs status
blueprint refs index
blueprint research plan --topic "your product" --depth deep
blueprint research run --topic "your product" --depth deep
blueprint research report
blueprint research validate
\`\`\`

Outputs live in \`.blueprint/refs/\`, \`.blueprint/research/runs/\`, and \`docs/research/\`.

Do not integrate a reference idea unless it maps to a CLI command, schema, template, extension, integration, readiness gate, test, or documented workflow.
`,
  "docs/PRODUCTION_V1.md": `# Production V1 Bar

The harness is production-ready when it can be installed, checked, researched, extended, and used by agents without hidden setup knowledge.

Required capabilities:
- One-command install.
- Non-destructive init.
- Placeholder-blocking readiness gate.
- Machine-readable state machine, RBAC, and error-code specs.
- Edge-case matrix for callbacks, inventory, refund/cancel, timeout, retries, and reconciliation.
- Traceability lint from requirement to story, test matrix, and evidence.
- Story packets with Definition of Ready, Definition of Done, scope boundaries, and proof format.
- Integration protocol for idempotency, retry, signature validation, dead-letter handling, and reconcile runbooks.
- Stable memory and context export.
- Extension outputs that can block readiness.
- GitHub templates and issue export.
- Reference sync, lock, index, research synthesis, and evidence validation.
- End-to-end prompt playbook.
- Automated tests for core workflows.
`,
  "docs/PROMPTS_END_TO_END.md": `# End-to-End Prompt Playbook

Use these prompts in order.

## Intake
\`\`\`text
I want to build: <product>. Act as orchestrator. Do not code yet. Classify the request, ask only questions that cannot be researched, choose risk lane, and prepare Product Passport.
\`\`\`

## Research
\`\`\`text
Run deep reference and domain research. Produce source inventory, findings, claim map, conflicts, synthesis, and integration proposal. Do not integrate claims without evidence.
\`\`\`

## Product
\`\`\`text
Write the PRD with problem, users, scope, out-of-scope, requirements, non-functional requirements, acceptance criteria, assumptions, and open questions.
\`\`\`

## Architecture
\`\`\`text
Propose technology options with tradeoffs, recommend one, then update architecture and create a decision record after approval.
\`\`\`

## Stories
\`\`\`text
Create implementation-ready story packets with product contract, acceptance criteria, validation proof, ownership, allowed files, forbidden files, and dependencies.
\`\`\`

## Machine-Readable Specs
\`\`\`text
Update the state machine, RBAC, error-code, edge-case, integration protocol, and traceability artifacts. Every story must map to the relevant machine-readable contracts before code.
\`\`\`

## Readiness
\`\`\`text
Run extension hooks, blueprint lint --ci, and readiness. Fix blockers before implementation. Do not start code until READY_FOR_IMPLEMENTATION or accepted concerns have owners.
\`\`\`

## Implementation
\`\`\`text
Implement only story <US-xxx>. Read the context packet. Stay in allowed scope. Run tests, update TEST_MATRIX evidence, update memory, and summarize residual risk.
\`\`\`
`,
  "docs/TEST_MATRIX.md": `# Test Matrix

This file maps product behavior to proof. Do not use boolean \`yes/no\` as proof.

| Requirement | Story | Scenario ID | Scenario | Test Type | Command | Fixture/Data | Expected Evidence | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-TBD-001 | US-000 | TC-TBD-001 | Replace this row with a real scenario | unit/integration/e2e/platform | command to run | fixture path or seed data | docs/evidence/US-000.md#TC-TBD-001 | qa-agent | planned | docs/evidence/US-000.md |
`,
  "docs/TRACEABILITY_MATRIX.md": `# Traceability Matrix

This file maps requirements to structured contracts, story packets, tests, and evidence.

| Requirement | Source | Spec Contract | Story | Test Matrix Row | Evidence | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TBD | docs/product/prd.md | docs/specs/state-machines.yaml | US-000 | docs/TEST_MATRIX.md | none | TBD | planned |
`,
  "docs/EDGE_CASE_MATRIX.md": `# Edge Case Matrix

This file makes failure behavior explicit before implementation.

| Flow | Trigger | Expected behavior | Owner | Story | Test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Payment callback | Provider sends duplicate callback | Operation is idempotent; duplicate is recorded and ignored safely. | TBD | US-000 | Integration | none | planned |
| Payment callback | Provider sends late callback after timeout/cancel | Callback is reconciled against current state and cannot reopen closed work without a decision. | TBD | US-000 | Integration | none | planned |
| Checkout | Item becomes out of stock or unavailable during checkout | User sees recoverable error; no payment capture or inconsistent reservation remains. | TBD | US-000 | E2E | none | planned |
| Refund/cancel | User or admin cancels after payment attempt | State transition, refund/cancel command, and audit log are deterministic. | TBD | US-000 | Integration | none | planned |
| Payment timeout | Payment remains pending past timeout window | Pending state expires, retry/reconcile job handles provider uncertainty, user receives clear status. | TBD | US-000 | Integration | none | planned |
| Provider outage | External provider is unavailable | Request retries according to policy, then dead-letters with alert and manual recovery path. | TBD | US-000 | Platform | none | planned |
| Partial failure | Local write succeeds but external action fails | System records compensating action or recovery task; no silent data loss. | TBD | US-000 | Integration | none | planned |
| Retry exhaustion | Retry policy reaches max attempts | Work item moves to dead-letter queue/runbook with owner and evidence. | TBD | US-000 | Platform | none | planned |
`,
  "docs/HARNESS_BACKLOG.md": `# Harness Backlog

Add process, template, validation, or integration improvements discovered during real work.
`,
  "docs/MEMORY.md": `# Memory

Memory is an index and compact summary. It does not replace source docs.

Memory layers:
- Product memory.
- Decision memory.
- Progress memory.
- Agent handoff memory.
- Evidence memory.
`,
  "docs/product/product-passport.yaml": `product_name: TBD
product_type: TBD
target_users: []
problem: TBD
desired_outcome: TBD
in_scope: []
out_of_scope: []
success_metrics: []
constraints: []
risk_level: normal
chosen_track: standard
tech_preferences: []
external_dependencies: []
security_privacy_notes: []
current_stage: RAW_INPUT
readiness_status: NOT_READY
`,
  "docs/product/prd.md": `# Product Requirements Document

## Problem
TBD

## Personas
| Persona ID | User | Goal | Permissions | Pains | Success Moment |
| --- | --- | --- | --- | --- | --- |
| PER-TBD-001 | TBD | TBD | TBD | TBD | TBD |

## Scope
### MVP
- TBD

### Later
- TBD

### Explicitly Out Of Scope
- TBD

## Scope By Release
| Release | Included | Excluded | Exit Criteria |
| --- | --- | --- | --- |
| MVP | TBD | TBD | TBD |

## Functional Requirements
| Requirement | Priority | Requirement | Business Rule | Acceptance Criteria | Story | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-TBD-001 | Must | TBD | TBD | AC-TBD-001 | US-000 | normal |

## Non-Functional Requirements
| Requirement | Target | Measurement | Owner |
| --- | --- | --- | --- |
| NFR-TBD-001 | TBD | TBD | TBD |

## Business Rules
| Rule | Description | Owner | Source |
| --- | --- | --- | --- |
| BR-TBD-001 | TBD | TBD | TBD |

## Acceptance Criteria
| Acceptance | Requirement | Given | When | Then | Negative Case | Test |
| --- | --- | --- | --- | --- | --- | --- |
| AC-TBD-001 | REQ-TBD-001 | TBD | TBD | TBD | TBD | TC-TBD-001 |

## Assumptions And Open Questions
| ID | Type | Item | Owner | Severity | Decision Needed By | Status |
| --- | --- | --- | --- | --- | --- | --- |
| OQ-TBD-001 | question | TBD | product-owner | high | before readiness | open |
`,
  "docs/product/ux-spec.md": `# UX Spec

## User Journeys
TBD

## Screens
TBD

## States
TBD

## Accessibility
TBD
`,
  "docs/product/data-api-contract.md": `# Data and API Contract

## Entities
| Entity | Fields | Constraints | Privacy Class | Owner |
| --- | --- | --- | --- | --- |
| EntityTBD | id | TBD | public/internal/personal/sensitive | data-api-agent |

## Commands
| Command | Request | Response | Status Code | Authorization | Idempotency | Emits | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CommandTBD | TBD | TBD | 200/201/400/401/403/409 | role/action | required/not-required | event.name | ERROR_CODE |

## Queries
| Query | Filters | Response | Pagination | Authorization | Errors |
| --- | --- | --- | --- | --- | --- |
| QueryTBD | TBD | TBD | TBD | role/action | ERROR_CODE |

## API / CLI / Events
| Surface | Method/Event | Path/Topic | Request or Event Payload | Response | Status Code | Auth |
| --- | --- | --- | --- | --- | --- | --- |
| HTTP | POST | /api/v1/tbd | TBD | TBD | 201 | TBD |

## Validation and Errors
Link canonical errors in docs/specs/error-codes.yaml.

| Rule | Error Code | HTTP Status | Retryable | User Message |
| --- | --- | --- | --- | --- |
| TBD | ERROR_TBD | 400 | false | TBD |

## Permissions
Link canonical permissions in docs/specs/rbac.yaml.

| Resource | Action | Allowed Roles | Audit Required | Deny Behavior |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | true/false | ERROR_TBD |
`,
  "docs/product/integration-protocol.md": `# Integration Protocol

Use this when the product talks to external systems, payment providers, webhooks, imports, exports, queues, email/SMS, or automation jobs.

## Idempotency Keys
TBD

## Retry Policy
TBD

## Signature Validation
TBD

## Callback Handling
TBD

## Dead Letter Handling
TBD

## Reconcile Runbook
TBD

## Observability
TBD

## Security
TBD

## Test Requirements
TBD
`,
  "docs/specs/state-machines.yaml": `version: 0.1.0
state_machines:
  - name: order-payment-shipping
    owner: TBD
    entity: TBD
    initial_state: draft
    states:
      - draft
      - pending_payment
      - paid
      - fulfilling
      - shipped
      - completed
      - cancelled
      - refunded
      - failed
    transitions:
      - from: draft
        event: submit_checkout
        to: pending_payment
        guards:
          - inventory_reserved
          - user_can_checkout
        side_effects:
          - create_payment_intent
        errors:
          - CHECKOUT_OUT_OF_STOCK
      - from: pending_payment
        event: payment_timeout
        to: failed
        guards:
          - timeout_window_elapsed
        side_effects:
          - release_inventory_reservation
          - enqueue_reconcile
        errors:
          - PAYMENT_TIMEOUT
      - from: pending_payment
        event: payment_callback_success
        to: paid
        guards:
          - valid_signature
          - idempotency_key_not_processed
        side_effects:
          - record_payment
          - enqueue_fulfillment
        errors:
          - WEBHOOK_INVALID_SIGNATURE
      - from: paid
        event: cancel_or_refund
        to: refunded
        guards:
          - refund_allowed
        side_effects:
          - request_refund
          - append_audit_log
        errors:
          - REFUND_NOT_ALLOWED
`,
  "docs/specs/rbac.yaml": `version: 0.1.0
roles:
  - name: admin
    owner: TBD
    description: Full operational access for approved administrators.
    permissions:
      - students.read
      - students.write
      - users.manage
      - reports.read
  - name: staff
    owner: TBD
    description: Day-to-day operational access.
    permissions:
      - students.read
      - students.write
      - reports.read
  - name: viewer
    owner: TBD
    description: Read-only access.
    permissions:
      - students.read
resources:
  - name: student_record
    data_classification: personal_data
    actions:
      - read
      - create
      - update
      - delete
rules:
  - id: RBAC-001
    resource: student_record
    action: delete
    allowed_roles:
      - admin
    audit_required: true
    linked_story: US-000
`,
  "docs/specs/error-codes.yaml": `version: 0.1.0
errors:
  - code: CHECKOUT_OUT_OF_STOCK
    owner: TBD
    http_status: 409
    user_message: The selected item is no longer available.
    retryable: false
    linked_story: US-000
  - code: PAYMENT_TIMEOUT
    owner: TBD
    http_status: 408
    user_message: Payment confirmation timed out. We are checking the final status.
    retryable: true
    linked_story: US-000
  - code: WEBHOOK_INVALID_SIGNATURE
    owner: TBD
    http_status: 401
    user_message: Request could not be verified.
    retryable: false
    linked_story: US-000
  - code: REFUND_NOT_ALLOWED
    owner: TBD
    http_status: 409
    user_message: This payment cannot be refunded automatically.
    retryable: false
    linked_story: US-000
`,
  "docs/architecture.md": `# Architecture

## Stack
TBD

## Product Surfaces
TBD

## Module Boundaries
TBD

## Dependency Rule
Inner layers must not depend on outer layers.

## Deployment
TBD

## Observability
TBD

## Security
TBD
`,
  "docs/epics/epics.md": `# Epics

No epics accepted yet.
`,
  "docs/stories/.gitkeep": "",
  "docs/decisions/.gitkeep": "",
  "docs/agent-briefs/.gitkeep": "",
  "docs/research/.gitkeep": "",
  "docs/reviews/.gitkeep": "",
  "docs/release/.gitkeep": "",
  "docs/readiness-review.md": `# Readiness Review

Status: NOT_READY

Run:

\`\`\`bash
blueprint readiness
\`\`\`
`,
  "docs/progress-ledger.md": `# Progress Ledger

## Current Stage
RAW_INPUT

## Blockers
- Product docs not complete.

## Change Log
- Initialized blueprint harness.
`,
  ".blueprint/status.json": `{
  "stage": "RAW_INPUT",
  "track": "standard",
  "risk": "normal",
  "readiness": "NOT_READY",
  "updated_at": null
}
`,
  ".blueprint/memory/project-memory.yaml": `product:
  name: TBD
  type: TBD
  source: docs/product/product-passport.yaml
decisions: []
progress:
  stage: RAW_INPUT
  readiness: NOT_READY
agent_handoffs: []
evidence: []
`,
  ".blueprint/memory/decisions.index.json": `[]\n`,
  ".blueprint/memory/artifact-index.json": `[]\n`,
  ".blueprint/memory/agent-handoffs.json": `[]\n`,
  ".blueprint/context-packets/.gitkeep": "",
  "extensions/security-threat-model/extension.yaml": `name: security-threat-model
type: quality-gate-extension
version: 0.1.0
runs_on:
  - before_readiness
required_when:
  risk_flags:
    - auth
    - authorization
    - payment
    - sensitive_data
outputs:
  - docs/security/threat-model.md
owner: risk-reviewer-agent
`,
  "extensions/security-threat-model/README.md": `# Security Threat Model Extension

Runs before readiness when the product touches auth, authorization, payment, or sensitive data.

The output must not stay BLOCKED when implementation begins.
`,
  "extensions/privacy-impact-assessment/extension.yaml": `name: privacy-impact-assessment
type: quality-gate-extension
version: 0.1.0
runs_on:
  - before_readiness
required_when:
  risk_flags:
    - personal_data
    - sensitive_data
outputs:
  - docs/privacy/privacy-impact-assessment.md
owner: risk-reviewer-agent
`,
  "extensions/privacy-impact-assessment/README.md": `# Privacy Impact Assessment Extension

Runs before readiness when the product stores or processes personal or sensitive data.

The output must not stay BLOCKED when implementation begins.
`
};

export const githubTemplates = {
  ".github/PULL_REQUEST_TEMPLATE.md": `## Story
Link the story packet.

## Docs Read
- [ ] PRD
- [ ] Architecture
- [ ] Data/API Contract
- [ ] Story packet

## Acceptance Criteria
- [ ] Criteria from story are satisfied.

## Validation
- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] Platform

## Evidence
Paste command output, screenshots, or links.

## Docs Updated
- [ ] TEST_MATRIX
- [ ] Product docs if behavior changed
- [ ] ADR if a decision changed
`,
  ".github/workflows/blueprint-check.yml": `name: Blueprint Check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  blueprint-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx -y github:dailam148i-IT/Software-Blueprint-Harness check
`
};

export const exampleTemplates = {
  "examples/README.md": `# Examples

Examples are documentation-only. They show how to prepare a project before implementation.

## Demo Student Management

Enterprise-style web admin app with sensitive personal data.

## Demo CLI

Quick/Standard CLI tool.

## Demo Automation

Automation workflow with input/output contracts and operational evidence.
`,
  "examples/demo-student-management/README.md": `# Demo: Student Management

Example blueprint for a student management web app. This demo intentionally contains docs only, not app source.
`,
  "examples/demo-student-management/docs/product/product-passport.yaml": `product_name: Student Management System
product_type: web_admin_app
target_users:
  - admin
  - teacher
problem: Training centers need one place to manage students, classes, attendance, and tuition.
desired_outcome: Staff can manage student operations with clear roles and reliable records.
in_scope:
  - authentication
  - student profiles
  - classes
  - attendance
  - tuition tracking
out_of_scope:
  - parent mobile app
  - online learning
success_metrics:
  - reduce manual spreadsheet work
constraints:
  - protect student personal data
risk_level: high
chosen_track: enterprise
tech_preferences:
  - Next.js
  - PostgreSQL
external_dependencies: []
security_privacy_notes:
  - role-based access required
current_stage: PRODUCT_READY
readiness_status: CONCERNS
`,
  "examples/demo-student-management/docs/research/market-domain-research.md": `# Research Report: Student Management System

Training centers need shared records for students, classes, attendance, and tuition.

## Risks
- Personal data exposure.
- Weak role permissions.
- Spreadsheet import errors.
- Duplicate student records.

## Open Questions
- Do students log in?
- Is Excel import required in MVP?
- Is tuition informational or payment-connected?
`,
  "examples/demo-cli/README.md": `# Demo: CLI Rename Tool

Example Quick/Standard track for a CLI utility. No UI artifacts are required unless the product grows a UI.
`,
  "examples/demo-cli/docs/product/product-passport.yaml": `product_name: Bulk Rename CLI
product_type: cli_tool
target_users:
  - developer
problem: Users need a safe way to rename many files using patterns.
desired_outcome: Rename operations are previewed, validated, and collision-safe.
in_scope:
  - dry-run preview
  - pattern-based rename
  - collision detection
out_of_scope:
  - GUI
success_metrics:
  - no accidental overwrite
constraints: []
risk_level: normal
chosen_track: standard
tech_preferences:
  - Node.js
external_dependencies: []
security_privacy_notes: []
current_stage: PRODUCT_READY
readiness_status: CONCERNS
`,
  "examples/demo-automation/README.md": `# Demo: Automation Workflow

Example blueprint for an automation/data workflow with input/output contracts, retry behavior, and evidence requirements.
`,
  "examples/demo-automation/docs/product/product-passport.yaml": `product_name: Daily Report Automation
product_type: automation_workflow
target_users:
  - operations manager
problem: Daily reports are manually assembled from multiple exports.
desired_outcome: Workflow collects inputs, validates them, generates a report, and records evidence.
in_scope:
  - input folder scan
  - CSV validation
  - report generation
  - failure log
out_of_scope:
  - dashboard UI
success_metrics:
  - report generated before 8 AM
constraints: []
risk_level: normal
chosen_track: standard
tech_preferences:
  - Python
external_dependencies: []
security_privacy_notes: []
current_stage: PRODUCT_READY
readiness_status: CONCERNS
`
};
