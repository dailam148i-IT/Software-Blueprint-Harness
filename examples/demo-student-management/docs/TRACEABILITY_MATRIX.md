# Traceability Matrix: Student Management

| Requirement | Source | Spec Contract | Story | Test Matrix Row | Evidence | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-STUDENT-001 create student profile | docs/product/prd.md#functional-requirements | state-machines:student-profile, rbac:RBAC-001, errors:STUDENT_REQUIRED_FIELD/STUDENT_CODE_DUPLICATE | US-001 | TC-STUDENT-001, TC-STUDENT-002, TC-STUDENT-003 | docs/evidence/US-001.md | developer-agent | planned |
| REQ-RBAC-001 protect student writes | docs/product/prd.md#functional-requirements | rbac:RBAC-001, errors:PERMISSION_DENIED | US-001 | TC-RBAC-001 | docs/evidence/US-001.md | security-agent | planned |
| REQ-AUDIT-001 audit student mutations | docs/product/prd.md#functional-requirements | events:student.created/student.write_denied | US-001 | TC-AUDIT-001 | docs/evidence/US-001.md | qa-agent | planned |
