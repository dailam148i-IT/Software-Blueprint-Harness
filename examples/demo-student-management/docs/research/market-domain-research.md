# Research Report: Student Management System

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
- Tuition/payment status tracking.
- Import/export from spreadsheet.
- Activity/audit log for sensitive changes.

## Risks

- Personal data exposure.
- Weak role permissions.
- Duplicate records after imports.
- Spreadsheet import errors.
- Reports drifting from source records.

## Recommended Track

Enterprise, because the product stores personal student data and requires role-based access.

## Open Questions

- Do students log in, or only staff?
- Is tuition tracking informational, or does it integrate with payments?
- Is Excel import required in MVP?
