# Example Comparison

This comparison explains why a blueprint can look reasonable but still be too shallow for implementation.

## Shallow Output Pattern

Typical shallow output:

- PRD has numbered requirements but no `REQ-*` IDs.
- Acceptance criteria are generic statements, not Given/When/Then.
- Test matrix uses `yes`, `planned`, or `pending implementation`.
- Stories have ownership but no Definition of Ready, Definition of Done, machine-readable links, edge cases, or proof format.
- Research synthesis says planned, simulated, or generic evidence.
- Payment, shipping, inventory, auth, or privacy are described in prose but not locked in specs.

This output is useful for kickoff, not for coding.

## Production-Ready Pattern

Production-ready output:

- PRD uses stable requirement and acceptance criteria IDs.
- Story packets map to requirements, specs, edge cases, tests, and evidence.
- State machines define transitions, guards, side effects, and errors.
- RBAC defines role/resource/action rules with audit requirements.
- Error codes define retryability, messages, status codes, and owners.
- Integration protocol defines idempotency, retry, signature validation, callback ordering, dead-letter, and reconcile behavior.
- Test matrix has scenario IDs, commands, fixtures, expected evidence, owner, and status.
- Readiness fails until blockers are resolved or explicitly accepted with owners.

## Bad vs Good Requirement

Weak:

```text
Customers can track orders.
```

Strong:

```text
REQ-ORDER-004 | Must | Customer can view a tracking timeline for their own order.
AC-ORDER-004 | Given an authenticated customer owns order O-123, when they open tracking, then the timeline shows placed, confirmed, shipped, delivered/canceled states from the order state machine and hides admin-only audit notes.
Trace: state-machines:order-payment-shipping, rbac:RBAC-ORDER-READ-OWN, TC-ORDER-004
```

## Bad vs Good Test Matrix Row

Weak:

```text
| US-001 | Checkout | yes | yes | yes | planned | pending implementation |
```

Strong:

```text
| REQ-ORDER-001 | US-001 | TC-ORDER-001 | Valid COD checkout reserves stock and creates confirmed COD order | Integration | npm test -- order.checkout.cod | fixtures/cart-valid.json | docs/evidence/US-001.md#TC-ORDER-001 | qa-agent | planned | docs/evidence/US-001.md |
```

## Bad vs Good Story Proof

Weak:

```text
Validation Proof: Unit, Integration, E2E.
```

Strong:

```text
Proof Format:
- Commands to run: npm test -- order.checkout && npm run e2e -- checkout
- Fixture/data: fixtures/cart-valid.json, fixtures/cart-out-of-stock.json
- Expected output: TC-ORDER-001, TC-ORDER-002, and TC-INVENTORY-001 pass
- Evidence path: docs/evidence/US-001.md
- Reviewer: qa-agent
```
