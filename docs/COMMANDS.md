# CLI Commands

## `blueprint doctor`

Checks local runtime and framework health.

```bash
blueprint doctor
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

Exports story packets into GitHub issue markdown files. With `--use-gh`, it calls `gh issue create`, so GitHub CLI must be installed and authenticated.

```bash
blueprint github create-issues
blueprint github create-issues --use-gh --repo owner/name
blueprint github create-issues --use-gh --repo owner/name --force
```

The command writes `.blueprint/github/issues.index.json` to avoid duplicate issue creation on repeated `--use-gh` runs.

## `blueprint refs sync`

Clones the reference repositories listed in `refs/catalog.json` into `refs/vendor/`.

```bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs sync --force
```
