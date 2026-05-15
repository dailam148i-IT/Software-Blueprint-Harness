# Data/API Contract: Student Management

## Entities

### User

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| email | string | Unique login identifier |
| role | enum | admin, staff, teacher, manager, viewer |

### Student

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| studentCode | string | Unique across all students |
| fullName | string | Required |
| dateOfBirth | date | Optional |
| phone | string | Personal data |
| email | string | Optional personal data |
| status | enum | draft, active, archived |
| createdAt | datetime | Server timestamp |
| updatedAt | datetime | Server timestamp |

## Commands

### CreateStudent

| Contract | Value |
| --- | --- |
| Request | `{ "studentCode": "STU-001", "fullName": "Nguyen Van A", "phone": "0900000000", "email": "a@example.test" }` |
| Response | `{ "id": "uuid", "studentCode": "STU-001", "status": "active" }` |
| Status Code | `201`, `400`, `403`, `409` |
| Authorization | `students.write` permission required |
| Idempotency | `Idempotency-Key` required for retrying create from UI/API |
| Event Payload | `student.created` with `studentId`, `actorId`, `outcome`, `occurredAt` |
| Owner | data-api-agent |

### ArchiveStudent

| Contract | Value |
| --- | --- |
| Request | `{ "id": "uuid", "reason": "duplicate" }` |
| Response | `{ "id": "uuid", "status": "archived" }` |
| Status Code | `200`, `403`, `404`, `409` |
| Authorization | `students.archive` permission required |
| Idempotency | Repeat archive on already archived record returns current archived state |
| Event Payload | `student.archived` with `studentId`, `actorId`, `reason`, `occurredAt` |
| Owner | data-api-agent |

## Queries

| Query | Request | Response | Authorization |
| --- | --- | --- | --- |
| ListStudents | `?search=&status=&page=` | paginated student summaries | `students.read` |
| GetStudent | `studentId` | full student profile and enrollment summary | `students.read` |

## Validation and Errors

| Rule | Error code | Status Code | Field |
| --- | --- | --- | --- |
| `fullName` missing | STUDENT_REQUIRED_FIELD | 400 | fullName |
| `studentCode` duplicate | STUDENT_CODE_DUPLICATE | 409 | studentCode |
| actor lacks permission | PERMISSION_DENIED | 403 | none |

## Permissions

| Permission | Roles | Resources | Audit |
| --- | --- | --- | --- |
| students.read | admin, staff, teacher, manager, viewer | student_record | false |
| students.write | admin, staff | student_record | true |
| students.archive | admin | student_record | true |

## Audit Requirements

- Successful creates write `student.created`.
- Denied writes write `student.write_denied`.
- Audit event includes actor, target student when available, request id, outcome, and timestamp.
