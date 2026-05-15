# Feature Map

## Feature Catalog
| Feature ID | Feature | User Value | MVP | Dependencies | Risk |
| --- | --- | --- | --- | --- | --- |
| FEAT-STUDENT-001 | Student profile management | staff can create and maintain reliable student records | yes | RBAC, audit logging | high |
| FEAT-CLASS-001 | Class assignment | staff can place students into active classes | later | student profiles | normal |
| FEAT-ATTEND-001 | Attendance tracking | teachers can record daily attendance | later | class assignment | normal |
| FEAT-TUITION-001 | Tuition tracking notes | admins can track internal tuition status | later | student profiles | high |

## Release Mapping
| Release | Features | Exit Criteria |
| --- | --- | --- |
| MVP | FEAT-STUDENT-001 | student creation, duplicate prevention, archive, permission denial, and audit evidence pass |
| Later | FEAT-CLASS-001, FEAT-ATTEND-001, FEAT-TUITION-001 | class, attendance, and tuition workflows have approved PRD/story packets |

## Non-Functional Feature Needs
- Personal data is masked in logs and exports.
- Admin actions are auditable.
- Search remains usable for training-center record volume.
