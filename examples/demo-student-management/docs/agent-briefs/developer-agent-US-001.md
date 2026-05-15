# Agent Brief: Developer Agent / US-001

## Role

Implement only the approved story scope after readiness is passed.

## Inputs To Read

- `docs/product/product-passport.yaml`
- `docs/product/prd.md`
- `docs/product/data-api-contract.md`
- `docs/architecture.md`
- `docs/stories/US-001-create-student-profile.md`
- `docs/TEST_MATRIX.md`

## Outputs

- Implementation for the story.
- Tests matching the test matrix.
- Evidence in the story packet.

## Forbidden Actions

- Do not change selected stack without an ADR.
- Do not add student login unless the product scope is updated.
- Do not weaken role-based access requirements.

## Handoff

Hand off to `code-reviewer-agent` with command output and test evidence.
