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

## `blueprint status`

Summarizes project stage, track, risk, readiness, and required artifacts.

```bash
blueprint status
```

## `blueprint check`

Checks required structure.

```bash
blueprint check
blueprint check --strict
```

## `blueprint readiness`

Generates or updates `docs/readiness-review.md`.

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
```

## `blueprint extension create`

Creates an extension skeleton.

```bash
blueprint extension create security-threat-model
```

## `blueprint integration add github`

Installs GitHub PR and CI templates.

```bash
blueprint integration add github
```
