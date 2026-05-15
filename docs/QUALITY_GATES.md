# Quality Gates

Gate statuses:

- PASS
- READY_FOR_IMPLEMENTATION
- READY_WITH_ACCEPTED_RISK
- PASS_WITH_CONCERNS (structural/adoption checks only)
- FAIL
- BLOCKED

## Mandatory Gates

- Research Gate
- Product Gate
- Requirement Gate
- Solution Gate
- Machine Spec Gate
- Integration Gate
- Story Gate
- Trace Gate
- Agent Gate
- Pre-Code Gate

Implementation starts only when the Pre-Code Gate says `READY_FOR_IMPLEMENTATION`. If readiness says `READY_WITH_ACCEPTED_RISK`, implementation is still blocked until a human accepts every concern with owner, impact, expiry, and rollback note.

## Production Lint Gate

Run:

```bash
blueprint lint --ci
blueprint explain-fail
```

This gate checks that implementation-critical docs have no placeholders, machine-readable specs exist, edge-case rows are assigned, story packets have ownership and file boundaries, and every story maps to test/evidence expectations.

The gate also rejects shallow artifacts: PRD without stable requirement IDs, test matrix with yes/no cells, simulated research treated as evidence, and status drift between Product Passport and `.blueprint/status.json`.
