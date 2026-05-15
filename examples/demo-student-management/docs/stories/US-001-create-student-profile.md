# US-001 Create Student Profile

## Status
planned

## Lane
high-risk

## Product Contract
Admin can create a student profile with required identity and contact fields.

## Relevant Product Docs
- docs/product/prd.md
- docs/architecture.md
- docs/product/data-api-contract.md
- docs/product/integration-protocol.md
- docs/specs/state-machines.yaml
- docs/specs/rbac.yaml
- docs/specs/error-codes.yaml
- docs/TRACEABILITY_MATRIX.md
- docs/EDGE_CASE_MATRIX.md

## Acceptance Criteria
- Student name is required.
- Student code is unique.
- Created student appears in the student list.
- Only admin and staff roles can create a student profile.

## Definition of Ready
- Product contract maps to PRD requirement REQ-STUDENT-001.
- RBAC rule RBAC-001 allows admin/staff and excludes viewer.
- Error codes STUDENT_CODE_DUPLICATE and STUDENT_REQUIRED_FIELD are defined.
- Edge cases EC-STUDENT-001 and EC-STUDENT-002 are mapped.
- Primary agent and allowed/forbidden files are assigned.
- Test proof is defined in docs/TEST_MATRIX.md.

## Definition of Done
- Acceptance criteria are implemented inside allowed modules.
- Validation, uniqueness, and RBAC checks have automated proof.
- TEST_MATRIX evidence path is updated.
- TRACEABILITY_MATRIX status moves from planned to covered.
- Memory is updated if product truth changes.
- No forbidden modules are modified.

## Machine-Readable Contract Links
| Contract | Link or IDs |
| --- | --- |
| State machines | docs/specs/state-machines.yaml#student-profile |
| RBAC | docs/specs/rbac.yaml#RBAC-001 |
| Error codes | docs/specs/error-codes.yaml#STUDENT_CODE_DUPLICATE |
| Integration protocol | docs/product/integration-protocol.md#imports |

## Edge Cases
- EC-STUDENT-001 duplicate student code during create.
- EC-STUDENT-002 unauthorized viewer attempts create.

## Validation
| Layer | Expected proof |
| --- | --- |
| Unit | validation rules and RBAC guard |
| Integration | uniqueness persistence and permission check |
| E2E | create student from UI |
| Platform | seed data and audit log check |

## Agent Ownership
- Primary agent: developer-agent
- Handoff target: qa-agent
- Files/modules allowed: app/students/**, tests/students/**
- Files/modules forbidden: auth/session core, billing modules, deployment config

## Proof Format
- Commands to run: npm test -- students
- Expected output: validation, RBAC, and persistence tests pass
- Evidence path: docs/evidence/US-001.md
- Reviewer: qa-agent

## Harness Delta
No harness changes expected.

## Evidence
Planned evidence path: docs/evidence/US-001.md
