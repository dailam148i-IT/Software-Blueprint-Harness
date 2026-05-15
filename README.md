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

Until the package is installed globally or published to npm, use the GitHub `npx` runner for follow-up commands:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness check --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness readiness --directory .
```

## Simplest Workflow

Start with one product prompt:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness start "I need to build a student management web app" --directory . --depth deep
```

That creates a guided intake package with questions, refs/research plan, multi-agent plan, verification gate, human approval file, and documentation workplan.

## CLI

```bash
blueprint --version
blueprint doctor
blueprint init --directory . --yes
blueprint start "I need to build a student management web app" --depth deep
blueprint status
blueprint check
blueprint readiness
blueprint new-story "Create student profile"
blueprint new-decision "Choose Next.js and PostgreSQL"
blueprint export-context US-001 --agent developer-agent
blueprint memory show
blueprint memory update
blueprint memory compact
blueprint extension create security-threat-model
blueprint extension run before_readiness
blueprint integration add github
blueprint github create-issues
blueprint refs sync --dry-run
blueprint refs status
blueprint refs index
blueprint research run --topic "student management SaaS" --depth deep
blueprint research validate
```

Fresh GitHub installs run `blueprint check` without strict mode so a new repo can push while expected setup concerns still exist. Use `blueprint readiness` to enforce pre-code quality gates.

## Documentation

- [Quickstart](docs/QUICKSTART.md)
- [Simple Prompt Workflow](docs/SIMPLE_PROMPT_WORKFLOW.md)
- [Usage Guide](docs/USAGE.md)
- [CLI Commands](docs/COMMANDS.md)
- [Research Pipeline](docs/RESEARCH_PIPELINE.md)
- [End-to-End Prompt Playbook](docs/PROMPTS_END_TO_END.md)
- [Production V1 Bar](docs/PRODUCTION_V1.md)
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
  SIMPLE_PROMPT_WORKFLOW.md
  RESEARCH_PIPELINE.md
  PROMPTS_END_TO_END.md
  PRODUCTION_V1.md
  TEST_MATRIX.md
  MEMORY.md
  product/
  stories/
  decisions/
  agent-briefs/
.blueprint/
  memory/
  context-packets/
extensions/
  security-threat-model/
  privacy-impact-assessment/
.gitignore
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
