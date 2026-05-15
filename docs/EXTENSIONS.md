# Extensions

Extensions add workflows, gates, artifacts, or agents without changing the core harness.

## Types

- workflow-extension
- artifact-extension
- integration-extension
- agent-extension
- quality-gate-extension

## Hook Points

- after_init
- after_intake
- after_research
- after_product
- before_solution
- after_solution
- before_readiness
- after_readiness_pass
- before_release
- after_release
- on_story_created
- on_decision_created

## Manifest Contract

Each extension lives in `extensions/<name>/extension.yaml` and must pass `blueprint/schemas/extension.schema.json`.

```yaml
name: security-threat-model
version: 0.1.0
type: quality-gate-extension
runs_on:
  - before_readiness
required_when:
  risk_flags:
    - auth
    - sensitive_data
outputs:
  - docs/security/threat-model.md
permissions:
  - read-docs
  - write-docs
```

## Output Safety

Outputs must be relative paths inside the target project. Absolute paths and `..` traversal are rejected before read or write.

## Gate Output Minimum

Generated review artifacts must contain:

- `## Findings`
- `## Gate Status`
- no placeholder text such as `TBD` or `TODO`

`Gate Status: BLOCKED` blocks readiness. `READY_WITH_ACCEPTED_RISK` still requires explicit human concern acceptance before implementation.
