# Schema Reference

Machine-readable artifacts are validated with `yaml` and `ajv` during `blueprint check`, `blueprint lint`, and `blueprint readiness`.

| Artifact | Schema |
| --- | --- |
| `docs/product/product-passport.yaml` | `blueprint/schemas/product-passport.schema.json` |
| `docs/specs/state-machines.yaml` | `blueprint/schemas/state-machine.schema.json` |
| `docs/specs/rbac.yaml` | `blueprint/schemas/rbac.schema.json` |
| `docs/specs/error-codes.yaml` | `blueprint/schemas/error-codes.schema.json` |
| `extensions/*/extension.yaml` | `blueprint/schemas/extension.schema.json` |

Schema validation catches malformed YAML, wrong scalar/list/object types, missing required fields, and invalid enum values. The production lint gate still adds semantic checks such as stable IDs, traceability, edge-case coverage, test proof, and placeholder rejection.

## Authoring Rules

- Keep YAML simple and explicit.
- Use arrays for lists of users, states, permissions, errors, and outputs.
- Use stable IDs: `REQ-*`, `AC-*`, `US-*`, `TC-*`, `RBAC-*`.
- Do not use placeholders to satisfy required fields.
- Keep extension output paths relative and inside the target project.
