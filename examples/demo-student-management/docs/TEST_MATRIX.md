# Test Matrix: Student Management

| Requirement | Story | Scenario ID | Scenario | Test Type | Command | Fixture/Data | Expected Evidence | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-STUDENT-001 | US-001 | TC-STUDENT-001 | Admin creates valid student and record becomes active | Integration | `npm test -- students.create` | `fixtures/students/valid-student.json` | API response and audit event captured | qa-agent | planned | docs/evidence/US-001.md#TC-STUDENT-001 |
| REQ-STUDENT-001 | US-001 | TC-STUDENT-002 | Duplicate student code is rejected without second record | Integration | `npm test -- students.duplicate-code` | `fixtures/students/duplicate-code.json` | `STUDENT_CODE_DUPLICATE` and unchanged row count | qa-agent | planned | docs/evidence/US-001.md#TC-STUDENT-002 |
| REQ-STUDENT-001 | US-001 | TC-STUDENT-003 | Missing required full name maps field error | Unit | `npm test -- students.validation` | `fixtures/students/missing-name.json` | `STUDENT_REQUIRED_FIELD` field proof | qa-agent | planned | docs/evidence/US-001.md#TC-STUDENT-003 |
| REQ-RBAC-001 | US-001 | TC-RBAC-001 | Viewer cannot create student profile | Integration | `npm test -- students.rbac` | `fixtures/auth/viewer-session.json` | `PERMISSION_DENIED` and denial audit event | security-agent | planned | docs/evidence/US-001.md#TC-RBAC-001 |
| REQ-AUDIT-001 | US-001 | TC-AUDIT-001 | Student create writes actor/action/target/outcome audit fields | Integration | `npm test -- students.audit` | `fixtures/students/valid-student.json` | Audit event contains required fields | qa-agent | planned | docs/evidence/US-001.md#TC-AUDIT-001 |
