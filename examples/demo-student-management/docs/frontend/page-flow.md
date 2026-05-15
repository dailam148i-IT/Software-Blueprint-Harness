# Frontend Page Flow

## Routes
| Route | Purpose | Role Access | Empty State | Error State |
| --- | --- | --- | --- | --- |
| /login | authenticate staff | anonymous | login form | invalid credentials message |
| /students | search and inspect students | admin, staff, viewer | no students yet | recoverable load error |
| /students/new | create student profile | admin, staff | create form | field-level validation |
| /students/:id | view student details | admin, staff, viewer | not applicable | not found or permission denied |

## User Journeys
- Staff logs in and opens the student list.
- Staff creates a student with required fields.
- System rejects duplicate student code with a clear message.
- Admin archives an inactive student and audit evidence is recorded.

## States
- loading
- empty
- validation-error
- permission-denied
- stale-record
- success
