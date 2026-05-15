# Test Matrix: Student Management

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-001 | Role-based access controls protected routes | auth guards | session + role checks | login as admin/teacher | deploy env vars | planned | none |
| US-002 | Admin can create student profile | student validation | unique code persistence | create student from UI | seed db | planned | none |
| US-005 | Teacher can mark attendance | attendance rules | attendance save/query | mark session from UI | timezone check | planned | none |
