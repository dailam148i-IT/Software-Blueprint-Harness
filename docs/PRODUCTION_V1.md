# Production V1 Bar

Software Blueprint Harness reaches production v1 when it can be installed, audited, extended, and used by humans or agents without hidden setup knowledge.

## Required Capabilities

- One-command install from GitHub.
- Non-destructive init with dry-run, merge, override, examples, and GitHub templates.
- Structural check that does not block fresh adoption.
- Readiness gate that blocks placeholder docs and incomplete story packets.
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
5. Run `blueprint refs status`.
6. Run `blueprint refs index`.
7. Run `blueprint research run --depth quick`.
8. Run `blueprint research validate`.
9. Confirm README, INSTALL, COMMANDS, USAGE, PROMPTS, and examples are current.
10. Tag release with a changelog.

## Known V1 Limits

- Research extraction is deterministic and heuristic; it is not a replacement for human review.
- GitHub issue duplicate protection uses a local issue index unless the user chooses to add live GitHub API checks later.
- The YAML parser supports the harness' simple YAML subset, not every YAML feature.
- Extension requirements use declared risk flags and keyword matching.

## Promotion Rule

If a workflow depends on unstated human knowledge, it is not production v1. Convert that knowledge into docs, CLI output, schema, extension metadata, or tests.
