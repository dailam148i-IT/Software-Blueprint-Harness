export const templates = {
  "AGENTS.md": `# Agent Operating Guide

This repository uses Software Blueprint Harness. Do not start implementation until docs/readiness-review.md says READY_FOR_IMPLEMENTATION.

## Read Order
1. README.md
2. docs/HARNESS.md
3. docs/FEATURE_INTAKE.md
4. docs/product/product-passport.yaml
5. docs/product/prd.md
6. docs/architecture.md
7. docs/product/data-api-contract.md
8. docs/stories/
9. docs/TEST_MATRIX.md
10. docs/decisions/
11. .blueprint/memory/project-memory.yaml

## Task Loop
1. Classify the request: new spec, spec slice, change request, initiative, maintenance, or harness improvement.
2. Choose lane: tiny, normal, or high-risk.
3. Locate affected product docs, stories, decisions, and test matrix rows.
4. Work only inside the selected story scope.
5. Update docs, memory, decisions, test matrix, and evidence when behavior changes.

## Done Definition
- Requested change completed or blocker documented.
- Product truth remains current.
- Validation expectations remain current.
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

Gate statuses: PASS, PASS_WITH_CONCERNS, FAIL, BLOCKED.

## Mandatory Gates
- Research Gate: sources, insight, assumptions, risks.
- Product Gate: scope, out-of-scope, metrics.
- Requirement Gate: testable requirements and no contradictions.
- Solution Gate: stack, boundaries, data/API, security.
- Story Gate: context, acceptance criteria, proof.
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
  "docs/TEST_MATRIX.md": `# Test Matrix

This file maps product behavior to proof.

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TBD | Add rows when story packets are created | no | no | no | no | planned | none |
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

## Users
TBD

## Scope
TBD

## Functional Requirements
- TBD

## Non-Functional Requirements
- TBD

## Acceptance Criteria
- TBD
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
TBD

## Commands
TBD

## Queries
TBD

## API / CLI / Events
TBD

## Validation and Errors
TBD

## Permissions
TBD
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
type: gate
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
type: gate
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
