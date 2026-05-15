# UX Spec: Student Management

## User Journeys

### Admin Creates Student

1. Admin opens Students.
2. Admin selects Create Student.
3. Admin enters full name, student code, date of birth, phone, email, and status.
4. System validates required fields, uniqueness, and permission.
5. Student appears in the list with an audit event.

### Teacher Marks Attendance

1. Teacher opens assigned class.
2. Teacher selects session date.
3. Teacher marks present, absent, late, or excused.
4. System saves attendance and updates class summary.

## Screens

| Screen | Primary users | Key controls | Empty/error states |
| --- | --- | --- | --- |
| Login | All staff | Email, password, submit | Invalid credentials, locked account |
| Students list | Admin, staff, manager | Search, filter, create, export | No students, duplicate warning |
| Student detail | Admin, staff, manager | Edit, archive, enrollment history | Unauthorized edit, archived record |
| Attendance session | Teacher | Date picker, status grid, save | Class not assigned, duplicate session |
| Tuition status | Admin, manager | Status filter, notes | Missing tuition record |

## States

- Empty list with create action for admin/staff.
- Loading table skeleton for student list.
- Field-level validation error for required fields and duplicate code.
- Authorization error for viewer write attempt.
- Import preview errors before committing rows.

## Accessibility

- Every form field has a visible label and associated error text.
- Keyboard navigation works for tables, dialogs, date picker, and save actions.
- Color is not the only indicator of attendance or tuition status.
- Focus returns to the triggering control after dialogs close.
