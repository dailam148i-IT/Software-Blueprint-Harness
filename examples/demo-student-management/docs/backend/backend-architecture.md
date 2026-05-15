# Backend Architecture

## Layers
| Layer | Responsibility | Rule |
| --- | --- | --- |
| API/controller | auth context, request validation, response mapping | no hidden business rules |
| application/service | student use cases and transactions | owns workflow behavior |
| domain | student invariants and duplicate prevention | framework independent |
| repository | persistence access | no product decisions |

## Services
- `StudentService` owns create, update, archive, and search use cases.
- `AuditService` records sensitive mutations.
- `AuthorizationService` evaluates RBAC rules from the canonical policy.

## Repository
- Student repository enforces unique student code.
- Writes are transactional when audit records are required.
- Search queries use indexed fields only.
