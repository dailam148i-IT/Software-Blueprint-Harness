# UX Spec: Student Management

## Primary Flows

### Admin Creates Student

1. Admin opens Students.
2. Admin clicks Create Student.
3. Admin enters identity and contact fields.
4. System validates required fields and unique student code.
5. Student appears in the list.

### Teacher Marks Attendance

1. Teacher opens assigned class.
2. Teacher selects session date.
3. Teacher marks present, absent, late, or excused.
4. System saves attendance and updates class summary.

## Screens

- Login
- Dashboard
- Students list
- Student detail
- Classes list
- Class detail
- Attendance session
- Tuition status

## States

- Empty state
- Loading state
- Validation error
- Duplicate student code
- Unauthorized access
- Import preview errors

## Accessibility

- All forms need labels.
- Error text must be associated with fields.
- Keyboard navigation required for tables and dialogs.
