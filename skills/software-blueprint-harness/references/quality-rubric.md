# Quality Rubric

Blueprint artifacts are graded by implementation usefulness, not by polish.

## Scale

| Grade | Name | Description | Code allowed |
| --- | --- | --- | --- |
| 0 | Blocker | Missing, placeholder, contradictory, or source-free in a risky area. | No |
| 1 | Shallow | Sounds plausible but lacks IDs, traceability, owners, edge cases, or proof. | No |
| 2 | Usable | Specific and mostly traceable, with accepted concerns and owners. | Only with explicit acceptance |
| 3 | Implementation-ready | Specific, testable, traceable, owned, and covered by evidence expectations. | Yes |

## Strong Artifact Rules

- Product requirements use stable IDs such as `REQ-ORDER-001`.
- Acceptance criteria use stable IDs such as `AC-ORDER-001`.
- Edge cases use stable IDs such as `EC-ORDER-001`.
- Test scenarios use stable IDs such as `TC-ORDER-001`.
- Stories link requirement IDs, state/RBAC/error contracts, edge cases, test scenarios, owners, and evidence.
- High-risk flows are represented in machine-readable specs, not prose only.
- Research claims have source inventory, evidence, assumptions, and conflicts.

## Weak Signals

- Test matrix says only `yes`, `planned`, or `pending implementation`.
- PRD uses numbered bullets but no requirement IDs.
- Story lacks Definition of Ready, Definition of Done, proof format, or allowed/forbidden files.
- Data/API contract lists endpoints without request/response/status/auth/idempotency.
- Payment/shipping/inventory behavior is described without state transitions and edge cases.
- Security/privacy risk exists but extension output is missing or still `BLOCKED`.

## Agent Rule

When in doubt, grade down. A concise but traceable artifact beats a long narrative that does not constrain implementation.
