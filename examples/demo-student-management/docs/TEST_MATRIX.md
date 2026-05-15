# Test Matrix: Student Management

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-001 | Admin/staff can create student profile with validation and RBAC | validation + RBAC guard | unique code persistence + permission check | create student from UI | seed db + audit log | planned | docs/evidence/US-001.md |
| US-002 | Role-based access controls protected routes | auth guards | session + role checks | login as admin/teacher | deploy env vars | planned | none |
| US-005 | Teacher can mark attendance | attendance rules | attendance save/query | mark session from UI | timezone check | planned | none |
