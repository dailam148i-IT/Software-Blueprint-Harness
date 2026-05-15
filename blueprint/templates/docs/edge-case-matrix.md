# Edge Case Matrix

| Flow | Trigger | Expected behavior | Owner | Story | Test | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Payment callback | Duplicate callback | Idempotency prevents double processing. | TBD | US-000 | Integration | none | planned |
| Payment callback | Late callback | Reconcile current state before accepting transition. | TBD | US-000 | Integration | none | planned |
| Checkout | Out of stock during checkout | No inconsistent reservation or payment capture remains. | TBD | US-000 | E2E | none | planned |
| Refund/cancel | Cancel after payment attempt | Refund/cancel state and audit trail are deterministic. | TBD | US-000 | Integration | none | planned |
| Timeout | Provider timeout | Expire pending state and enqueue reconcile. | TBD | US-000 | Integration | none | planned |
