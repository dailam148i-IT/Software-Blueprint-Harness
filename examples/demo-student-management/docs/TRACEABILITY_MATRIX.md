# Traceability Matrix: Student Management

| Requirement | Source | Spec Contract | Story | Test Matrix Row | Evidence | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-STUDENT-001 create student profile | docs/product/prd.md | state-machines:student-profile, rbac:RBAC-001, errors:STUDENT_REQUIRED_FIELD/STUDENT_CODE_DUPLICATE | US-001 | docs/TEST_MATRIX.md#US-001 | docs/evidence/US-001.md | developer-agent | planned |
| REQ-RBAC-001 protect student writes | docs/product/data-api-contract.md | rbac:RBAC-001, errors:PERMISSION_DENIED | US-001 | docs/TEST_MATRIX.md#US-001 | docs/evidence/US-001.md | security-agent | planned |
