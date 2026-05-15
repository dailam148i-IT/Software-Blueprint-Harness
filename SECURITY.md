# Security Policy

## Supported Versions

Security fixes are handled on the `main` branch until the project publishes tagged stable releases.

## Reporting A Vulnerability

Please do not open a public issue for a vulnerability that could expose user data, secrets, or unsafe file writes.

Use a private GitHub security advisory when available, or contact the maintainer through the repository owner account. Include:

- affected command or workflow;
- reproduction steps;
- expected impact;
- whether the issue can write outside the target project;
- logs or screenshots with secrets removed.

## Security Model

Software Blueprint Harness writes files into a target project, reads local documentation, optionally clones reference repositories into `refs/vendor/`, and can optionally create GitHub issues through the `gh` CLI. Live publishing commands require explicit confirmation flags.

Generated blueprints can contain private product plans, personal data examples, API contracts, and business-sensitive decisions. Review generated issue bodies and exported context packets before publishing them to GitHub or sharing them with third-party agents.
