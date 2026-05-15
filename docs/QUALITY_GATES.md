# Quality Gates

Gate statuses:

- PASS
- PASS_WITH_CONCERNS
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

Implementation starts only when the Pre-Code Gate says `READY_FOR_IMPLEMENTATION`.

## Production Lint Gate

Run:

```bash
blueprint lint --ci
```

This gate checks that implementation-critical docs have no placeholders, machine-readable specs exist, edge-case rows are assigned, story packets have ownership and file boundaries, and every story maps to test/evidence expectations.
