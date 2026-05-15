# Database Schema

## Entities
| Entity | Key Fields | Privacy Class | Owner |
| --- | --- | --- | --- |
| student | id, student_code, full_name, date_of_birth, status | personal | data-api-agent |
| audit_log | id, actor_id, action, target_id, outcome | internal | security-agent |

## Indexes
- Unique index on `student.student_code`.
- Search index on student name/code according to chosen database capability.
- Audit index on target id and created time.

## Migrations
- Student schema changes require migration proof and rollback notes.
- Personal-data field additions require privacy review.
- Archive status changes must not delete historical audit records.
