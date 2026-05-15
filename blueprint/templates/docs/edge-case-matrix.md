# Edge Case Matrix

| Flow | Trigger | Expected behavior | Owner | Story | Test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Duplicate submit | User submits the same command twice | Idempotency prevents duplicate mutation and returns a deterministic result. | TBD | US-000 | Integration | none | planned |
| Invalid input | Required or malformed field is submitted | API/UI returns field-level validation errors and preserves safe state. | TBD | US-000 | Unit/Integration | none | planned |
| Permission denied | User lacks the required role or permission | Request is rejected, no mutation occurs, and audit evidence is recorded where required. | TBD | US-000 | RBAC | none | planned |
| Concurrent update | Two actors update the same record at the same time | Optimistic locking or equivalent conflict handling prevents silent overwrite. | TBD | US-000 | Integration | none | planned |
| Stale data | Client submits an outdated version of a resource | System returns a conflict response and gives the user a safe recovery path. | TBD | US-000 | Integration | none | planned |
| Timeout | Operation times out after partial progress | Retry/reconcile behavior is deterministic and no user-visible state is misleading. | TBD | US-000 | Integration | none | planned |
| Partial failure | One downstream step fails after another succeeds | System compensates, queues repair, or exposes a clear manual recovery path. | TBD | US-000 | Integration | none | planned |
| Retry exhaustion | Retry policy reaches maximum attempts | Work is moved to an explicit failed/dead-letter state with owner-visible evidence. | TBD | US-000 | Operations | none | planned |
