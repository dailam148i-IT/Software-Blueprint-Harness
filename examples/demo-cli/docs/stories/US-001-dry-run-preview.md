# US-001 Dry Run Preview

## Status
planned

## Lane
normal

## Product Contract
User can preview all planned rename operations before files are changed.

## Acceptance Criteria
- Command prints source and target paths.
- Command detects name collisions.
- No files are changed in dry-run mode.

## Validation
| Layer | Expected proof |
| --- | --- |
| Unit | pattern expansion |
| Integration | temp directory dry-run |
| E2E | CLI command output |
