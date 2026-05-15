# Security Threat Model: Student Management

Hook: before_readiness
Output: docs/security/threat-model.md

## Purpose
Validate that the MVP security model is explicit enough for multi-agent implementation.

## Findings
- Authentication is required before any student, class, attendance, tuition, or audit view.
- Authorization is role-based, with admin/staff/teacher/viewer permissions mapped in `docs/specs/rbac.yaml`.
- Student create/archive commands require permission checks, validation, idempotency for retries, and audit events.
- MVP avoids online payment and external webhooks, so provider signature validation is not required in this release.

## Abuse Cases
| Abuse Case | Mitigation | Evidence |
| --- | --- | --- |
| Viewer attempts student create | `PERMISSION_DENIED`, no mutation, audit denial | docs/specs/error-codes.yaml |
| Duplicate student code | unique constraint and `STUDENT_CODE_DUPLICATE` | docs/product/data-api-contract.md |
| Stale edit overwrites record | version conflict policy | docs/backend/error-handling.md |
| Audit sink unavailable | fail safely or queue repair according to policy | docs/EDGE_CASE_MATRIX.md |

## Required Controls
- Validate all command payloads at API boundary.
- Use least-privilege role checks before service-layer mutations.
- Keep audit records immutable from normal application flows.
- Do not expose student PII in logs, URLs, metadata, or analytics.

## Gate Status
PASS
