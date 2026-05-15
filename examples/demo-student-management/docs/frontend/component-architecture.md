# Frontend Component Architecture

## Structure
| Layer | Responsibility | Naming |
| --- | --- | --- |
| routes | page shell and route-level loading | route folder |
| features/students | student workflow screens and forms | kebab-case folder |
| components | reusable primitives and composed widgets | PascalCase |
| hooks | form and data interaction helpers | useCamelCase |
| services | API clients and adapters | camelCase |

## State Rules
- Server state is loaded through a query/cache boundary.
- Form state stays inside the form component.
- Shared client state requires a named owner and documented reason.

## Naming
- Student form components use `StudentCreateForm`, `StudentEditForm`, and `StudentArchiveDialog`.
- API DTO types end with `Request`, `Response`, or `Dto`.
- Test fixtures mirror scenario IDs from `docs/TEST_MATRIX.md`.
