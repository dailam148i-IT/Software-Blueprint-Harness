# Readiness Review: Student Management

Status: CONCERNS

## Pass

- Product type identified.
- Risk level correctly marked high because personal data and role access are involved.
- Initial PRD, architecture, data/API contract, epics, and story packet exist.
- State, RBAC, error-code, edge-case, traceability, and test matrix examples exist.

## Concerns

- Need final decision on whether students log in.
- Need final decision on Excel import in MVP.
- Need deployment target.
- Need security threat model before implementation.
- Need evidence files after implementation begins.

## Required Before Code

- Resolve login scope.
- Add `docs/security/threat-model.md`.
- Add story packets for US-001 and US-003.
- Update test matrix after all MVP stories are created.
