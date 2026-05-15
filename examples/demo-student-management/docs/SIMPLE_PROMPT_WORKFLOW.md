# Simple Prompt Workflow

This is the shortest path through the harness.

## Intended Chat Flow

1. Install the framework.
2. Tell the agent: `nắm quy trình framework này`.
3. Start with `/start <ý tưởng>`.
4. Agent asks only necessary questions.
5. Agent prepares refs/research and a multi-agent plan.
6. Verifier agents review the plan.
7. Human approves.
8. Agents write the full documentation set.

## One Prompt

```text
/start I need to build: <app, website, SaaS, automation, or feature>.
```

The orchestrator should not code. It should:

1. Ask only the necessary clarifying questions.
2. Start refs/research for deep source-backed research.
3. Create a multi-agent plan.
4. Ask verifier agents to review the plan.
5. Stop for human approval.
6. After approval, write the full documentation set.
7. Run readiness before implementation.

## CLI Shortcut

```bash
blueprint start "I need to build a student management web app" --depth deep
```

Equivalent alias:

```bash
blueprint /start "I need to build a student management web app" --depth deep
```

This creates:

```text
.blueprint/intake/<run-id>/
  00-raw-input.md
  01-questions.md
  02-multi-agent-plan.md
  03-verification-gate.md
  04-human-approval.md
  05-documentation-workplan.md
  orchestrator-prompt.md
  next-commands.md
docs/intake/<run-id>.md
.blueprint/research/runs/<run-id>/plan.md
```

Use `--run-research` when refs have already been synced and you want a research run immediately:

```bash
blueprint start "I need to build a student management web app" --depth deep --run-research
```

## Human Gate

Agents must stop at:

```text
APPROVED_FOR_DOCUMENTATION: no
```

Only continue when the human changes or explicitly answers:

```text
APPROVED_FOR_DOCUMENTATION: yes
```

## After Approval

The documentation agents create:

- Product Passport
- Research synthesis
- PRD
- UX spec
- Architecture
- Data/API contract
- Decision records
- Epics and stories
- Test matrix
- Readiness review
- Memory and compact context

## Implementation Rule

Implementation starts only after `blueprint readiness` produces `READY_FOR_IMPLEMENTATION` or the human explicitly accepts named concerns.
