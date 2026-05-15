# US-001 Create Student Profile

## Status
planned

## Lane
high-risk

## Product Contract
Admin can create a student profile with required identity and contact fields.

## Acceptance Criteria
- Student name is required.
- Student code is unique.
- Created student appears in the student list.

## Validation
| Layer | Expected proof |
| --- | --- |
| Unit | validation rules |
| Integration | uniqueness persistence |
| E2E | create student from UI |
