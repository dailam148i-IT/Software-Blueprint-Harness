# PRD: Student Management System

## Problem

Training centers manage student profiles, class enrollments, attendance, and tuition status across spreadsheets and chat threads. This creates duplicate records, unclear role ownership, and weak auditability for personal data changes.

## Personas

| Persona | Goal | Constraints | Success signal |
| --- | --- | --- | --- |
| Admin staff | Create and maintain accurate student records | Needs fast form entry and duplicate prevention | Student record created once with audit trail |
| Teacher | View assigned classes and mark attendance | Must not edit unrelated student data | Attendance captured for assigned class only |
| Manager | Monitor student operations and tuition status | Needs read-heavy reports, not daily data entry | Can trust reports match source records |

## Scope

The MVP covers staff-only web access for student profile CRUD, class enrollment, attendance tracking, tuition-status visibility, and audit logs for sensitive changes.

## Scope By Release

| Release | Included | Excluded |
| --- | --- | --- |
| MVP | Admin login, student CRUD, class enrollment, attendance, tuition status, audit log | Parent portal, LMS lessons, online payment |
| V1.1 | Spreadsheet import preview, duplicate merge workflow, manager dashboard | Mobile apps |

## Functional Requirements

| Requirement ID | Requirement | Priority | Risk | Acceptance criteria |
| --- | --- | --- | --- | --- |
| REQ-STUDENT-001 | Admin or staff can create a student profile with required identity/contact fields. | Must | High | AC-STUDENT-001, AC-STUDENT-002, AC-STUDENT-003 |
| REQ-RBAC-001 | Only roles with `students.write` can create or update student records. | Must | High | AC-RBAC-001 |
| REQ-AUDIT-001 | Sensitive student mutations write an audit event with actor, action, target, and timestamp. | Must | Medium | AC-AUDIT-001 |

## Non-Functional Requirements

| NFR ID | Requirement | Target | Owner |
| --- | --- | --- | --- |
| NFR-PRIVACY-001 | Student personal data is only visible to authorized staff. | 100% protected routes covered by RBAC tests | security-agent |
| NFR-RELIABILITY-001 | Duplicate student code creates no partial record. | Atomic create transaction | data-api-agent |

## Business Rules

- Student code is unique across active and archived student records.
- Full name and student code are required before a profile can become active.
- Admin and staff may create student profiles; viewer cannot create or update.
- Every create, update, archive, and denied write attempt is auditable.

## Acceptance Criteria

| AC ID | Given | When | Then | Test |
| --- | --- | --- | --- | --- |
| AC-STUDENT-001 | Admin has `students.write` permission | Admin submits valid student profile | Student is created in active state and appears in list | TC-STUDENT-001 |
| AC-STUDENT-002 | A student code already exists | Staff submits another student with same code | API returns `STUDENT_CODE_DUPLICATE`; no second record is created | TC-STUDENT-002 |
| AC-STUDENT-003 | Required field is missing | Admin submits form | API returns `STUDENT_REQUIRED_FIELD` mapped to the field | TC-STUDENT-003 |
| AC-RBAC-001 | Viewer lacks `students.write` | Viewer submits create request | API returns `PERMISSION_DENIED` and audit denial is recorded | TC-RBAC-001 |
| AC-AUDIT-001 | Any student create succeeds or is denied | System completes response | Audit event includes actor, action, target, outcome, timestamp | TC-AUDIT-001 |

## Assumptions And Open Questions

| ID | Type | Statement | Owner | Severity | Needed by | Status |
| --- | --- | --- | --- | --- | --- | --- |
| A-STUDENT-001 | assumption | Students do not log in during MVP. | product-owner | medium | before implementation | accepted |
| O-TUITION-001 | open question | Tuition status is informational only; online payment is outside MVP. | product-owner | low | before V1.1 | open |
