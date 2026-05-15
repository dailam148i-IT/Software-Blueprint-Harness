# GitHub Integration

V1 installs:

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/blueprint-check.yml`

The CLI also supports story issue export:

```bash
blueprint github create-issues
```

This writes reviewed issue bodies to `.blueprint/github/issues/` and updates `.blueprint/github/issues.index.json`.

To publish live GitHub issues through the GitHub CLI, the command requires an explicit target repo and confirmation flag:

```bash
blueprint github create-issues --use-gh --repo owner/name --confirm-publish
```

The confirmation flag exists because story packets may contain product plans, API contracts, or private business context. Review generated issue markdown before publishing.

Duplicate protection is local: stories already marked `created` in `.blueprint/github/issues.index.json` are skipped unless `--force` is passed. Future versions may sync existing issue URLs and readiness/status labels through the GitHub API.
