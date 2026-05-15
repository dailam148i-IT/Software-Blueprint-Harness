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
- GitHub issue export with duplicate protection.
- Reference repository sync with commit locking.
- Reference indexing and research synthesis with evidence.
- End-to-end prompt guide for product discovery through implementation handoff.
- Automated tests for install, check, readiness, memory, refs, research, extensions, and GitHub export.

## Release Checklist

1. Run `npm test`.
2. Run `node bin/blueprint.js doctor`.
3. Run `node bin/blueprint.js init --dry-run --with-github --with-examples`.
4. Run a temp install and `blueprint check`.
5. Run `blueprint lint --ci` on a completed demo blueprint.
6. Run `blueprint explain-fail` on a known shallow project and confirm repair hints are actionable.
7. Run `blueprint refs status`.
8. Run `blueprint refs index`.
9. Run `blueprint research run --depth quick`.
10. Run `blueprint research validate`.
11. Confirm README, INSTALL, COMMANDS, USAGE, PROMPTS, artifact depth docs, and examples are current.
12. Tag release with a changelog.

## Known V1 Limits

- Research extraction is deterministic and heuristic; it is not a replacement for human review.
- GitHub issue duplicate protection uses a local issue index unless the user chooses to add live GitHub API checks later.
- The YAML parser supports the harness' simple YAML subset, not every YAML feature.
- Extension requirements use declared risk flags and keyword matching.

## Promotion Rule

If a workflow depends on unstated human knowledge, it is not production v1. Convert that knowledge into docs, CLI output, schema, extension metadata, or tests.
