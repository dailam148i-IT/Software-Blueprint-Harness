# Data and API Contract

## Entities
| Entity | Fields | Constraints | Privacy Class | Owner |
| --- | --- | --- | --- | --- |
| EntityTBD | id | TBD | public/internal/personal/sensitive | data-api-agent |

## Commands
| Command | Request | Response | Status Code | Authorization | Idempotency | Emits | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CommandTBD | TBD | TBD | 200/201/400/401/403/409 | role/action | required/not-required | event.name | ERROR_CODE |

## Queries
| Query | Filters | Response | Pagination | Authorization | Errors |
| --- | --- | --- | --- | --- | --- |
| QueryTBD | TBD | TBD | TBD | role/action | ERROR_CODE |

## API / CLI / Events
| Surface | Method/Event | Path/Topic | Request or Event Payload | Response | Status Code | Auth |
| --- | --- | --- | --- | --- | --- | --- |
| HTTP | POST | /api/v1/tbd | TBD | TBD | 201 | TBD |

## Validation and Errors
Link canonical errors in docs/specs/error-codes.yaml.

| Rule | Error Code | HTTP Status | Retryable | User Message |
| --- | --- | --- | --- | --- |
| TBD | ERROR_TBD | 400 | false | TBD |

## Permissions
Link canonical permissions in docs/specs/rbac.yaml.

| Resource | Action | Allowed Roles | Audit Required | Deny Behavior |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | true/false | ERROR_TBD |
