# Research Report: Student Management System

## Source Inventory

| Source ID | Source | What it supports | Confidence |
| --- | --- | --- | --- |
| SRC-001 | Internal SME interview notes from training-center admin workflow | Spreadsheet pain, duplicate records, tuition-status reporting | medium |
| SRC-002 | Common SIS/center-management product teardown | Modules: auth/RBAC, students, classes, attendance, reports | medium |
| SRC-003 | Privacy and RBAC review checklist | High-risk classification for student personal data | high |

## Context

Training centers and schools often begin with spreadsheets, chat groups, and manual payment tracking. This works at small scale but becomes unreliable once staff need shared records, attendance history, role permissions, and reports.

## Target Users

- Admin staff: manage students, classes, attendance, tuition, and reports.
- Teachers: view assigned classes and mark attendance.
- Managers: monitor class performance, attendance, and tuition status.

## Common Modules

- Authentication and role-based access.
- Student profile management.
- Class and enrollment management.
- Attendance tracking.
- Tuition status tracking.
- Import/export from spreadsheet.
- Activity/audit log for sensitive changes.

## Claim Map

| Claim ID | Claim | Evidence | Decision impact |
| --- | --- | --- | --- |
| CLM-001 | Student personal data requires enterprise-grade RBAC and audit. | SRC-003 | Choose enterprise track and require security/privacy extensions |
| CLM-002 | Student code uniqueness is a core data integrity rule. | SRC-001, SRC-002 | Add AC-STUDENT-002 and TC-STUDENT-002 |
| CLM-003 | Teachers need scoped class access rather than full student administration. | SRC-001, SRC-002 | Add RBAC rules and future attendance stories |

## Risks

- Personal data exposure.
- Weak role permissions.
- Duplicate records after imports.
- Spreadsheet import errors.
- Reports drifting from source records.

## Recommended Track

Enterprise, because the product stores personal student data and requires role-based access.

## Open Questions

| Question | Owner | Needed by | Current handling |
| --- | --- | --- | --- |
| Do students log in, or only staff? | product-owner | V1.1 planning | MVP assumes staff-only |
| Is tuition tracking informational, or does it integrate with payments? | product-owner | V1.1 planning | MVP excludes online payment |
| Is Excel import required in MVP? | product-owner | backlog grooming | MVP defers import |
