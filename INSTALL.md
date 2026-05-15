# Install

## GitHub Install

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes
```

## Safe Preview

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --dry-run
```

## Options

| Option | Meaning |
| --- | --- |
| `--directory <path>` | Target project directory. |
| `--dry-run` | Print files that would be created. |
| `--merge` | Add missing files, keep existing files. |
| `--override` | Back up and replace existing files. |
| `--yes` | Non-interactive approval. |
| `--with-github` | Add GitHub PR template and CI check workflow. |
| `--with-examples` | Add demo blueprint examples. |

## Windows

Use PowerShell with Node.js 18+ installed:

```powershell
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes
```

## After Install

If the package is not installed globally or as a project dependency, keep using the GitHub `npx` runner:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness status --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness check --directory .
```

If `blueprint` is on your PATH:

```bash
blueprint status
blueprint check
blueprint explain-fail
blueprint lint --ci
blueprint readiness
```

Read next:

- `docs/USAGE.md` in this repository for complete workflows.
- `examples/README.md` for demo scenarios.
