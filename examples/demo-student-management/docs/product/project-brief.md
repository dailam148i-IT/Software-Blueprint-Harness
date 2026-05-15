# Project Brief

## Topic
Student Management System for a training center.

## Problem
Training center staff manage student profiles, class enrollment, attendance, and tuition notes across spreadsheets and chat threads. This causes duplicate records, weak permissions, and unclear audit history.

## Outcome
Admins and staff can manage student records in one web admin app with role-based access, validation, and evidence-backed audit behavior.

## Domain Notes
- Student personal data requires privacy-aware access and logging.
- Attendance and tuition workflows affect operational reporting.
- Staff need fast search and correction flows more than public marketing pages.

## Primary Users
| Role | Goal | Key Permissions | Success Moment |
| --- | --- | --- | --- |
| admin | configure and audit student operations | students.write, users.manage, reports.read | can safely create/archive student records |
| staff | maintain daily student data | students.read, students.write | can find and update the correct student quickly |
| viewer | inspect records without mutation | students.read | can view permitted records only |
