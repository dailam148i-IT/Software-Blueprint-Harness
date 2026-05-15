# Architecture: Student Management

## Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Web app | Next.js | Authenticated admin/staff UI with server actions/API routes |
| Database | PostgreSQL | Relational student, class, enrollment, attendance, audit data |
| ORM | Prisma | Schema migrations and typed data access |
| Auth | Auth.js | Role-aware session handling |
| Tests | Node test + Playwright | Unit/API coverage plus staff workflow proof |

## Product Surfaces

- Staff web dashboard for students, classes, attendance, tuition status.
- API surface for student commands and list/detail queries.
- Audit log viewer for admin and manager roles.

## Module Boundaries

| Module | Owns | Must not own |
| --- | --- | --- |
| `app/students/**` | Student screens, forms, student API handlers | Auth session internals |
| `lib/students/**` | Student validation, repository, service commands | Billing/payment logic |
| `lib/auth/**` | Session, role, permission checks | Student persistence |
| `tests/students/**` | Student unit/integration/e2e proof | Production migrations |

## Deployment

- Single web service with PostgreSQL connection string in environment.
- Migrations run before release.
- Seed script creates admin/staff/viewer test roles in non-production.

## Security

- RBAC enforced server-side for every mutation.
- Student personal data is excluded from debug logs.
- Audit event is written for successful and denied sensitive mutations.
- Session cookies are secure, HTTP-only, and same-site.
