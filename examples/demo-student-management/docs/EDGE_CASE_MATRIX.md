# Edge Case Matrix: Student Management

| Flow | Trigger | Expected behavior | Owner | Story | Test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EC-STUDENT-001 Create student | Duplicate student code submitted | API returns STUDENT_CODE_DUPLICATE; no second student is created. | data-api-agent | US-001 | TC-STUDENT-002 | docs/evidence/US-001.md#TC-STUDENT-002 | planned |
| EC-STUDENT-002 Create student | Viewer submits create request | API returns PERMISSION_DENIED and writes audit denial. | security-agent | US-001 | TC-RBAC-001 | docs/evidence/US-001.md#TC-RBAC-001 | planned |
| EC-STUDENT-003 Create student | Required name missing | API returns STUDENT_REQUIRED_FIELD mapped to fullName. | data-api-agent | US-001 | TC-STUDENT-003 | docs/evidence/US-001.md#TC-STUDENT-003 | planned |
| EC-STUDENT-004 Audit | Audit sink temporarily unavailable | Student create fails safely or queues audit according to configured policy; no unaudited mutation is silently accepted. | security-agent | US-001 | TC-AUDIT-001 | docs/evidence/US-001.md#TC-AUDIT-001 | planned |
| Duplicate callback | Import completion callback is delivered twice | Idempotency key prevents duplicate imported students and duplicate audit events. | data-api-agent | US-001 | TC-STUDENT-002 | docs/evidence/US-001.md#TC-STUDENT-002 | planned |
| Late callback | Import status callback arrives after import cancellation | System reconciles current import state before accepting transition. | data-api-agent | US-001 | TC-AUDIT-001 | docs/evidence/US-001.md#TC-AUDIT-001 | planned |
| Out of stock | Seat/class capacity is full during enrollment | Enrollment is rejected without partial student/class mutation. | product-agent | US-001 | TC-STUDENT-001 | docs/evidence/US-001.md#TC-STUDENT-001 | planned |
| Refund | Tuition status correction reverses a prior manual mark | Correction records previous value, new value, actor, and reason in audit log. | finance-agent | US-001 | TC-AUDIT-001 | docs/evidence/US-001.md#TC-AUDIT-001 | planned |
| Timeout | Student create request times out after persistence | Retried request with same Idempotency-Key returns existing created result. | data-api-agent | US-001 | TC-STUDENT-001 | docs/evidence/US-001.md#TC-STUDENT-001 | planned |
| Dead-letter | Async import row repeatedly fails validation | Row is moved to dead-letter report with reason and no silent data loss. | data-api-agent | US-001 | TC-STUDENT-003 | docs/evidence/US-001.md#TC-STUDENT-003 | planned |
| Reconcile | Report count differs from source student records | Reconcile job reports drift and links affected student ids for review. | manager-agent | US-001 | TC-AUDIT-001 | docs/evidence/US-001.md#TC-AUDIT-001 | planned |
