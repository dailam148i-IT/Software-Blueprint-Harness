# Data/API Contract: Student Management

## Entities

### User

- id
- email
- role: admin | teacher | manager

### Student

- id
- studentCode
- fullName
- dateOfBirth
- phone
- email
- status
- createdAt
- updatedAt

### Class

- id
- name
- teacherId
- startDate
- endDate
- status

### Enrollment

- id
- studentId
- classId
- status

### AttendanceRecord

- id
- classId
- studentId
- sessionDate
- status: present | absent | late | excused

## Commands

- CreateStudent
- UpdateStudent
- CreateClass
- EnrollStudent
- MarkAttendance

## Queries

- ListStudents
- GetStudent
- ListClasses
- GetClassAttendance

## Validation

- studentCode must be unique.
- fullName is required.
- role-based permissions are required.
- teacher can only update assigned class attendance.

## Error Shape

```json
{
  "code": "STUDENT_CODE_EXISTS",
  "message": "Student code already exists.",
  "field": "studentCode"
}
```
