# Integrations

Integrations connect blueprint artifacts to external tools.

Planned adapters:

- GitHub
- Linear
- Jira
- Slack
- Figma
- CI

V1 includes GitHub templates for PRs and blueprint checks, plus local story issue export.

Live GitHub issue creation requires:

```bash
blueprint github create-issues --use-gh --repo owner/name --confirm-publish
```

Review generated `.blueprint/github/issues/*.md` before publishing because story packets can contain private product context.
