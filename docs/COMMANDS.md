# CLI Commands

## `blueprint doctor`

Checks local runtime and framework health.

```bash
blueprint doctor
blueprint doctor --ci
blueprint --version
```

## `blueprint init`

Installs harness files into a project.

```bash
blueprint init --directory . --yes
blueprint init --directory . --dry-run
blueprint init --directory . --yes --with-github --with-examples
```

Options:

| Option | Meaning |
| --- | --- |
| `--directory <path>` | Target directory. |
| `--dry-run` | Preview files. |
| `--merge` | Keep existing files. |
| `--override` | Back up and replace existing files. |
| `--yes` | Non-interactive approval. |
| `--with-github` | Add GitHub workflow and PR template. |
| `--with-examples` | Add demo examples. |

`init` also ensures `.gitignore` contains `refs/vendor/` and `refs/REFS_LOCK.json` so synced reference repositories are not committed by accident.

## `blueprint start-base`

Creates the base discovery package from one product idea. `blueprint start` and `blueprint /start` are aliases for this command.

```bash
blueprint start-base "I need to build a student management web app"
blueprint start "I need to build a student management web app"
blueprint /start "I need to build a student management web app"
blueprint start-base "I need to build a student management web app" --run-research
```

Outputs:

```text
.blueprint/intake/<run-id>/
docs/intake/<run-id>.md
.blueprint/research/runs/<run-id>/plan.md
.blueprint/next.json
```

The package contains base analysis, clarifying questions, a multi-agent plan, a verification gate, a human approval file, a documentation workplan, and a ready-to-use `/blueprint-start` orchestrator prompt.

## `blueprint start-deep`

Creates the professional planning document set from the latest base run. It smart-updates scaffold/TBD files but keeps existing non-placeholder files.

```bash
blueprint start-deep --from-latest
blueprint start-deep --from-latest --dry-run
blueprint start-deep --from-latest --json
```

It creates or updates product, frontend, backend, security, delivery, engineering, epic, story, and machine-readable spec artifacts.

## `blueprint approve`

Records human approval for the latest workflow run. Approval does not bypass readiness.

```bash
blueprint approve --from-latest --yes
blueprint approve --from-latest --yes --dry-run
```

Outputs:

```text
.blueprint/approvals/<run-id>.json
.blueprint/next.json
```

## `blueprint next`

Shows the next command and suggested prompt stored by the last workflow command.

```bash
blueprint next
blueprint next --json
```

## `blueprint assess`

Runs an advisory role-based quality assessment. By default it warns only; it fails CI only when `--ci --min-score` is used.

```bash
blueprint assess
blueprint assess --json
blueprint assess --ci --min-score 80
```

Roles: PM, BA, UX, Frontend, Backend, API, Security, QA, DevOps.

## `blueprint status`

Summarizes project stage, track, risk, readiness, and required artifacts.

```bash
blueprint status
```

## `blueprint check`

Checks required structure and reports immature placeholder content as concerns. With `--strict`, concerns also produce a non-zero exit code.

```bash
blueprint check
blueprint check --strict
```

## `blueprint explain-fail`

Prints a repair checklist from the same production lint engine. Use it after a shallow or old project fails.

```bash
blueprint explain-fail
blueprint explain-fail --directory .
```

## `blueprint lint`

Runs the production documentation gate. It checks placeholder-free product docs, machine-readable state/RBAC/error specs, integration protocol, story ownership, edge-case coverage, and traceability from requirement to story to test evidence.

```bash
blueprint lint
blueprint lint --strict
blueprint lint --ci
```

Use `check` for adoption and `lint --ci` for pre-code enforcement.

## `blueprint readiness`

Generates or updates `docs/readiness-review.md`. Readiness treats placeholder product docs, placeholder story packets, missing story matrix rows, missing required extension outputs, and extension outputs marked `BLOCKED` as blockers.

```bash
blueprint readiness
blueprint readiness --ci
```

## `blueprint new-story`

Creates a story packet.

```bash
blueprint new-story "Create student profile"
```

## `blueprint new-decision`

Creates a decision record.

```bash
blueprint new-decision "Choose Next.js PostgreSQL Prisma"
```

## `blueprint export-context`

Creates a focused packet for an agent.

```bash
blueprint export-context US-001 --agent developer-agent
```

## `blueprint memory show`

Prints project memory.

```bash
blueprint memory show
blueprint memory update
blueprint memory compact
```

## `blueprint extension create`

Creates, lists, or runs extensions.

```bash
blueprint extension create security-threat-model
blueprint extension list
blueprint extension run before_readiness
```

## `blueprint integration add github`

Installs GitHub PR and CI templates.

```bash
blueprint integration add github
```

## `blueprint github create-issues`

Exports story packets into GitHub issue markdown files. With `--use-gh`, it calls `gh issue create`, so GitHub CLI must be installed and authenticated. Live publishing requires `--repo` and `--confirm-publish` because story bodies can contain private product context.

```bash
blueprint github create-issues
blueprint github create-issues --use-gh --repo owner/name --confirm-publish
blueprint github create-issues --use-gh --repo owner/name --confirm-publish --force
```

The command writes `.blueprint/github/issues.index.json` to avoid duplicate issue creation on repeated `--use-gh` runs.

## `blueprint refs sync`

Clones the reference repositories listed in `refs/catalog.json` into `refs/vendor/`, writes a commit lock, and supports status/index commands for research.

```bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs sync --force
blueprint refs status
blueprint refs index
```

`refs index` writes `.blueprint/refs/index.json`, `.blueprint/refs/index.summary.json`, and `.blueprint/refs/index.files.jsonl`.

## `blueprint research`

Creates evidence-backed research runs from synced reference repositories.

```bash
blueprint research plan --topic "student management SaaS" --depth deep
blueprint research run --topic "student management SaaS" --depth deep
blueprint research report
blueprint research synthesize
blueprint research validate
blueprint research validate --strict --ci
```

Research runs write `.blueprint/research/runs/<run-id>/` with plan, source inventory, evidence cards, findings, claim map, conflicts, synthesis, and integration proposal.
