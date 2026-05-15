# API Guidelines

## REST
- Student resources use `/api/v1/students`.
- Create uses `POST /api/v1/students`.
- Update uses `PATCH /api/v1/students/{id}`.
- Archive uses `POST /api/v1/students/{id}/archive` to preserve audit semantics.

## Versioning
- Public API paths are versioned with `/api/v1`.
- Breaking contract changes require a decision record.

## Pagination
- Student list uses cursor or page pagination with explicit limit.
- Search filters are documented in the data/API contract.
- Responses include request id and pagination metadata.
