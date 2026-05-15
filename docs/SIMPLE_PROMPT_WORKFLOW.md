# Simple Prompt Workflow

This is the shortest path through the harness.

## Intended Chat Flow

1. Install the framework.
2. Tell the agent: `nắm quy trình framework này`.
3. Start with `/start <ý tưởng>`.
4. Agent asks only necessary questions.
5. Agent runs or follows `start-base`.
6. After answers, agent runs or follows `start-deep`.
7. Verifier agents review the plan.
8. Human approves with `approve`.
9. Agents run assess, lint, and readiness.

## One Prompt

```text
/start I need to build: <app, website, SaaS, automation, or feature>.
```

The orchestrator should not code. It should:

1. Ask only the necessary clarifying questions.
2. Run `blueprint start-base` or create the same base intake package manually.
3. After answers, run `blueprint start-deep --from-latest`.
4. Ask verifier agents to review the professional plan.
5. Stop for human approval.
6. Record approval with `blueprint approve --from-latest --yes`.
7. Run assess, lint, and readiness before implementation.

## CLI Shortcut

```bash
blueprint start-base "I need to build a student management web app"
blueprint start-deep --from-latest
blueprint approve --from-latest --yes
```

Equivalent alias:

```bash
blueprint /start "I need to build a student management web app"
```

This creates:

```text
.blueprint/intake/<run-id>/
  00-raw-input.md
  00-base-analysis.md
  01-questions.md
  02-multi-agent-plan.md
  03-verification-gate.md
  04-human-approval.md
  05-documentation-workplan.md
  orchestrator-prompt.md
  next-commands.md
docs/intake/<run-id>.md
.blueprint/research/runs/<run-id>/plan.md
.blueprint/next.json
```

Use `--run-research` when refs have already been synced and you want a research run immediately:

```bash
blueprint start-base "I need to build a student management web app" --run-research
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

The `start-deep` documentation agents create:

- Project brief, feature map, and MVP scope
- Product Passport
- Research synthesis
- PRD
- UX spec
- Frontend design system, component architecture, page flow, SEO
- Backend architecture, API guidelines, database schema, error handling
- Security/privacy/SEO and engineering standards
- Delivery plan
- Architecture
- Data/API contract
- Decision records
- Epics and stories
- Test matrix
- Readiness review
- Memory and compact context

## Implementation Rule

Implementation starts only after `blueprint readiness` produces `READY_FOR_IMPLEMENTATION`.

If readiness produces `READY_WITH_ACCEPTED_RISK`, implementation remains blocked until the human accepts every concern with owner, impact, expiry, and rollback note.
