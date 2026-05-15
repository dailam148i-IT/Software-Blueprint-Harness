# Backend Error Handling

## Error Envelope
| Field | Meaning |
| --- | --- |
| code | canonical code from error-codes.yaml |
| message | safe user-facing message |
| details | field-level validation data when safe |
| request_id | support/debug correlation |

## Retryable Errors
- Validation and permission errors are not retryable.
- Stale version conflicts may be retried after refreshing the record.
- Timeout responses must not imply the mutation succeeded.

## Logging
- Logs include request id, actor id, action, target type, and outcome.
- Logs never include raw sensitive student details beyond approved identifiers.
- Permission denial is audit-worthy for sensitive mutations.
