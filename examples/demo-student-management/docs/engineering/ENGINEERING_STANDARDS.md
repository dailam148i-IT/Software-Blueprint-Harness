# Engineering Standards

## SOLID
- Keep student use cases focused and testable.
- Depend on repository and authorization interfaces, not concrete infrastructure inside domain logic.
- Add design patterns only when they remove real duplication or isolate provider/database concerns.

## Naming
- Components and classes use PascalCase.
- Functions and variables use camelCase.
- Requirement, story, edge-case, and test IDs remain stable.

## Testing
- Every story has unit, integration, and relevant E2E evidence expectations.
- Permission and validation failures are first-class tests.
- Test fixture names map to test scenario IDs.

## Dependency Policy
- New libraries need a decision note covering maintenance, license, security, and runtime cost.
- Auth, validation, routing, forms, data fetching, and tests should use established libraries when appropriate.
