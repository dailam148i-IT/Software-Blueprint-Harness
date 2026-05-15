# Privacy Impact Assessment: Student Management

Hook: before_readiness
Output: docs/privacy/privacy-impact-assessment.md

## Purpose
Assess whether MVP student-management documentation defines enough privacy controls before implementation.

## Findings
- Student profile data is personal data and must be protected by RBAC, audit logging, and environment-specific access controls.
- MVP excludes parent portal, public sharing, online payment, and external analytics, reducing third-party data exposure.
- Required data fields are limited to identity, contact, class assignment, attendance, tuition status notes, and audit metadata.
- Retention, export, and deletion requests are documented as policy-owned follow-up items before V1.1.

## Required Controls
| Control | Artifact | Status |
| --- | --- | --- |
| Role-limited access | docs/specs/rbac.yaml | ready |
| Audit trail for mutation | docs/product/data-api-contract.md | ready |
| No external payment/parent portal in MVP | docs/product/mvp-scope.md | ready |
| Field-level validation and errors | docs/specs/error-codes.yaml | ready |

## Residual Risk
- School-specific retention rules still need an owner decision before production deployment.
- Data export/delete operations are out of MVP and must not be implied by UI copy.

## Gate Status
PASS
