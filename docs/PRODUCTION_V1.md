# Production V1 Bar

Software Blueprint Harness reaches production v1 when it can be installed, audited, extended, and used by humans or agents without hidden setup knowledge.

## Required Capabilities

- One-command install from GitHub.
- Non-destructive init with dry-run, merge, override, examples, and GitHub templates.
- Structural check that does not block fresh adoption.
- Readiness gate that blocks placeholder docs and incomplete story packets.
- Production lint gate for traceability, spec completeness, story ownership, and edge-case coverage.
- Artifact depth standard with weak/strong examples and recovery guide.
- Machine-readable state machine, RBAC, and error-code artifacts.
- Integration protocol covering idempotency, retry, signature validation, callbacks, dead-letter handling, reconciliation, observability, and tests.
- Story packets with Definition of Ready, Definition of Done, allowed/forbidden files, and proof format.
- Memory update and compact context with stable YAML.
- Extension hooks that can block readiness.
- Path-contained template, extension, ref, integration, and GitHub export writes.
- JSON Schema validation for machine-readable artifacts and extension manifests.
- GitHub issue export with duplicate protection and explicit live publish confirmation.
- Reference repository sync with commit locking and safe reference names.
- Golden demo that passes `blueprint lint --ci`.
- Reference indexing and research synthesis with evidence.
- End-to-end prompt guide for product discovery through implementation handoff.
- Automated tests for install, check, readiness, memory, refs, research, extensions, and GitHub export.
- Two-stage start workflow: `start-base` for discovery and `start-deep` for professional documentation.
- Human `approve` command before hard gates.
- Next-prompt guidance through `.blueprint/next.json`.
- Advisory role assessment for PM, BA, UX, frontend, backend, API, security, QA, and DevOps.

## Release Checklist

1. Run `npm test`.
2. Run `npm run audit:prod`.
3. Run `npm run pack:check`.
4. Run `npm run smoke:pack`.
5. Run `node bin/blueprint.js doctor`.
6. Run `node bin/blueprint.js init --dry-run --with-github --with-examples`.
7. Run `node bin/blueprint.js lint --directory examples/demo-student-management --ci`.
8. Run `node bin/blueprint.js assess --directory examples/demo-student-management --ci --min-score 80`.
9. Run `blueprint explain-fail` on a known shallow project and confirm repair hints are actionable.
10. Run `blueprint refs status`.
11. Run `blueprint refs index`.
12. Run `blueprint research run --depth quick`.
13. Run `blueprint research validate`.
14. Confirm README, INSTALL, COMMANDS, USAGE, PROMPTS, artifact depth docs, and examples are current.
15. Tag release with a changelog.

## Known V1 Limits

- Research extraction is deterministic and heuristic; it is not a replacement for human review.
- GitHub issue duplicate protection uses a local issue index unless the user chooses to add live GitHub API checks later.
- Validation uses a real YAML parser and JSON Schema for core structured artifacts, but semantic product contradictions still require review.
- Extension requirements use declared risk flags and keyword matching.

## Promotion Rule

If a workflow depends on unstated human knowledge, it is not production v1. Convert that knowledge into docs, CLI output, schema, extension metadata, or tests.
