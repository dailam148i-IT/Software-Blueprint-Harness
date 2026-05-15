# Contributing

Thanks for helping improve Software Blueprint Harness.

## Development Setup

```bash
git clone https://github.com/dailam148i-IT/Software-Blueprint-Harness.git
cd Software-Blueprint-Harness
npm ci
npm test
```

## Quality Bar

Before opening a pull request, run:

```bash
npm test
npm run pack:check
npm run smoke:pack
npm run audit:prod
node bin/blueprint.js lint --directory examples/demo-student-management --ci
```

## Contribution Areas

- CLI commands and validation gates.
- Artifact templates and docs.
- Extension manifests and extension authoring docs.
- Golden examples that pass `blueprint lint --ci`.
- Research reference synthesis.
- Tests for path safety, schema validation, and public install flows.

## Pull Request Expectations

- Keep changes scoped.
- Add tests for new CLI behavior.
- Update docs when commands, templates, readiness semantics, or public workflows change.
- Do not vendor cloned reference repositories into git.
- Do not include private project data in examples.

## Extension Contributions

New extensions must include:

- `extension.yaml` with schema-valid metadata;
- declared hooks and outputs;
- safe relative output paths;
- README with purpose, required inputs, and gate behavior;
- tests or a smoke command when behavior is executable.
