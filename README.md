# Software Blueprint Harness

Software Blueprint Harness is a documentation-first operating harness for software projects. It helps humans, AI agents, and multi-agent teams turn raw intent into product contracts, architecture decisions, story packets, validation evidence, and implementation-ready context before code begins.

Core rule:

```text
No implementation before docs/readiness-review.md says READY_FOR_IMPLEMENTATION.
```

## Why This Exists

AI coding agents are useful, but they fail when every agent invents its own product truth, architecture, task scope, and test expectations. This harness gives a project a shared operating surface:

- Docs are the source of truth.
- CLI commands create, check, and export that truth.
- Schemas keep artifacts structured.
- Extensions add new gates and workflows.
- Integrations connect the harness to GitHub and other tools.

## Install From GitHub

From a target project:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes
```

With GitHub templates and examples:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes --with-github --with-examples
```

Preview first:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --dry-run
```

## CLI

```bash
blueprint doctor
blueprint init --directory . --yes
blueprint status
blueprint check
blueprint readiness
blueprint new-story "Create student profile"
blueprint new-decision "Choose Next.js and PostgreSQL"
blueprint export-context US-001 --agent developer-agent
blueprint memory show
blueprint extension create security-threat-model
blueprint integration add github
```

## Documentation

- [Quickstart](docs/QUICKSTART.md)
- [Usage Guide](docs/USAGE.md)
- [CLI Commands](docs/COMMANDS.md)
- [Workflow](docs/WORKFLOW.md)
- [Quality Gates](docs/QUALITY_GATES.md)
- [Multi-Agent Model](docs/MULTI_AGENT_OPERATING_MODEL.md)
- [Examples](examples/README.md)

## What Gets Installed

```text
AGENTS.md
blueprint.config.yaml
docs/
  HARNESS.md
  WORKFLOW.md
  FEATURE_INTAKE.md
  QUALITY_GATES.md
  TEST_MATRIX.md
  MEMORY.md
  product/
  stories/
  decisions/
  agent-briefs/
.blueprint/
  memory/
  context-packets/
```

## Workflow

```text
RAW_INPUT
-> INTAKE_READY
-> RESEARCH_READY
-> PRODUCT_READY
-> SOLUTION_READY
-> STORY_READY
-> READY_FOR_IMPLEMENTATION
-> IMPLEMENTING
-> REVIEWING
-> RELEASE_READY
-> RELEASED
-> RETROSPECTIVE_DONE
```

## References

This framework is inspired by:

- Harness Engineering and `harness-experimental`
- BMAD Method
- Academic Research Skills
- Caveman's concise agent-facing instruction style
- Scrum Guide
- OWASP ASVS/SAMM
- Twelve-Factor App

## License

MIT
