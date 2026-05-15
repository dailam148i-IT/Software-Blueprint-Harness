# Artifact Depth Standard

This is the minimum bar before implementation. A document is not ready because it has headings. It is ready when another developer or agent can implement, test, and review from it without inventing product truth.

## Grading Scale

| Grade | Meaning | Implementation allowed |
| --- | --- | --- |
| 0 Blocker | Missing, placeholder, contradictory, or source-free for risky claims. | No |
| 1 Shallow | Has prose but lacks IDs, owners, edge cases, proof, or machine-readable contracts. | No |
| 2 Usable | Mostly specific and traceable, with named open concerns and owners. | Only with accepted concerns |
| 3 Implementation-ready | Specific, testable, traceable, owned, and covered by proof expectations. | Yes |

## Global Rules

- Every requirement must have a stable ID: `REQ-AREA-001`.
- Every acceptance criterion must have a stable ID: `AC-AREA-001`.
- Every edge case must have a stable ID: `EC-AREA-001`.
- Every test scenario must have a stable ID: `TC-AREA-001`.
- Every story must map to requirement IDs, spec contracts, edge cases, tests, evidence, and owners.
- High-risk products must not rely only on prose. Use state machines, RBAC, error codes, integration protocol, edge-case matrix, and traceability matrix.

## PRD Minimum Depth

The PRD must include:

- Problem and desired outcome.
- Personas with goals, permissions, pains, and success moments.
- Scope by release: MVP, later, explicitly out of scope.
- Functional requirements table with `REQ-*`, priority, business rule, acceptance criteria IDs, linked story, risk.
- Non-functional requirements with measurable targets.
- Business rules with owner and source.
- Acceptance criteria in Given/When/Then format.
- Assumptions and open questions with owner, severity, and decision date.

Weak:

```text
1. Customers can checkout.
```

Strong:

```text
REQ-ORDER-001 | Must | Customer can create an order from valid cart items.
Business rule: every line item must have available stock at reserve time.
AC-ORDER-001 | Given cart item qty <= available stock, when customer submits checkout, then order is created in pending_payment or confirmed_cod state and inventory reservation is recorded.
```

## UX Spec Minimum Depth

The UX spec must include:

- User journeys by role.
- Screen inventory.
- Field-level behavior for critical forms.
- Empty, loading, error, disabled, success, and permission-denied states.
- Mobile and desktop layout notes.
- Accessibility expectations.
- Localization/content rules when product is multilingual.

## Architecture Minimum Depth

Architecture must include:

- Stack options and decision rationale.
- Module boundaries and ownership.
- Data ownership and dependency rules.
- Deployment/runtime topology.
- Observability and audit events.
- Security boundaries.
- Risks and tradeoffs.

## Data/API Contract Minimum Depth

The data/API contract must include:

- Entities with fields, identifiers, constraints, ownership, and privacy class.
- Commands with request schema, response schema, status codes, authorization, idempotency, validation, and emitted events.
- Queries with filters, pagination, authorization, and response shape.
- Events/callback payloads.
- Error-code links to `docs/specs/error-codes.yaml`.
- Permissions links to `docs/specs/rbac.yaml`.

## Integration Protocol Minimum Depth

Integration protocol must include:

- Idempotency key format and storage.
- Retry policy with max attempts and backoff.
- Signature validation or authentication.
- Callback ordering and duplicate/late event handling.
- Dead-letter behavior.
- Reconcile runbook.
- Observability and alerts.
- Manual override rules and audit logs.
- Test requirements for timeout, retry, duplicate, invalid signature, and reconciliation.

## Machine-Readable Specs Minimum Depth

State machines must include states, transitions, guards, side effects, errors, terminal states, owners, and linked stories.

RBAC must include roles, permissions, resources, actions, allowed roles, denied behavior, audit requirement, owners, and linked stories.

Error codes must include code, owner, HTTP/status mapping, retryable flag, user message, admin message when relevant, severity, and linked story.

## Edge-Case Matrix Minimum Depth

Each row must include flow, trigger, expected behavior, owner, story, test scenario, evidence, and status. For commerce/integration systems include duplicate callback, late callback, out-of-stock, concurrent checkout, refund/cancel, timeout, provider outage, dead-letter, reconcile, and unauthorized mutation.

## Story Packet Minimum Depth

Each story must include:

- Status and lane.
- Product contract.
- Relevant docs.
- Acceptance criteria.
- Definition of Ready.
- Definition of Done.
- Machine-readable contract links.
- Edge cases.
- Design notes.
- Validation table.
- Agent ownership.
- Allowed and forbidden files/modules.
- Proof format.
- Evidence path.

## Test Matrix Minimum Depth

The test matrix must not use `yes/no` as proof. It must include requirement ID, story, scenario ID, scenario, test type, command, fixture/data, expected evidence, owner, status, and evidence path.

## Readiness Rule

If an artifact cannot answer who owns the behavior, what exact rule applies, how it fails, how it is tested, and where evidence will live, it is not implementation-ready.
