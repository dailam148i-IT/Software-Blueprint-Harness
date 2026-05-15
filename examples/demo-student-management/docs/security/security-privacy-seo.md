# Security, Privacy, And SEO

## Authentication
- Staff users must authenticate before accessing student records.
- Session/token expiry and refresh behavior are documented in the architecture decision.

## Authorization
- RBAC controls read, create, update, archive, and user-management actions.
- Archive and user-management actions require admin role.
- Permission denial returns `PERMISSION_DENIED` and does not reveal hidden records.

## Privacy
- Student personal data is classified as personal data.
- Logs and exports mask sensitive fields unless explicitly approved.
- Retention and deletion policy must be decided before production release.

## SEO
- Authenticated admin pages are noindex.
- Public login or marketing pages must avoid student-specific metadata.
