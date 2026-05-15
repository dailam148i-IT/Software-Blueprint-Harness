# MVP Scope

## MVP
- Admin and staff can create student profiles with required fields.
- Student codes are unique and duplicate attempts return a canonical error.
- Staff can view and update permitted student records.
- Admin can archive a student record with audit evidence.
- Unauthorized users cannot mutate student records.

## Later
- Class assignment.
- Attendance tracking.
- Tuition tracking.
- Excel import.
- Parent/student self-service login.

## Explicitly Out Of Scope
- Online payment processing.
- Parent mobile app.
- Learning management features.
- AI recommendations.

## Scope Rules
- Every MVP item maps to `REQ-STUDENT-*`, `US-*`, `TC-STUDENT-*`, and evidence in `docs/evidence/`.
- New personal-data fields require privacy review.
- Payment or tuition collection changes require a new decision record and high-risk extension review.
