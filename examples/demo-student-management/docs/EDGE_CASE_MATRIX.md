# Edge Case Matrix: Student Management

| Flow | Trigger | Expected behavior | Owner | Story | Test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EC-STUDENT-001 Create student | Duplicate student code submitted | API returns STUDENT_CODE_DUPLICATE; no second student is created. | data-api-agent | US-001 | Integration | docs/evidence/US-001.md | planned |
| EC-STUDENT-002 Create student | Viewer submits create request | API returns PERMISSION_DENIED and writes audit denial. | security-agent | US-001 | Integration | docs/evidence/US-001.md | planned |
| EC-STUDENT-003 Import students | One row invalid in import file | Valid rows continue only if import mode allows partial success; invalid row is reported. | data-api-agent | US-003 | Integration | none | planned |
| EC-STUDENT-004 Attendance | Teacher marks attendance outside class scope | API denies write and keeps attendance unchanged. | security-agent | US-005 | Integration | none | planned |
