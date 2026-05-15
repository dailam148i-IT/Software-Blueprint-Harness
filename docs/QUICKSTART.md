# Quickstart

This guide shows the fastest useful path from an idea to implementation-ready documents.

## 1. Install Into A Project

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes --with-github --with-examples
```

### 3-Minute Path

1. Install the harness.
2. Tell the agent `nắm quy trình framework này`.
3. Send `/start <your product idea>`.
4. Answer the intake questions.
5. Approve the multi-agent plan.
6. Let the agent write the full docs.
7. Run `blueprint lint --ci` and `blueprint readiness`.

Preview first:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --dry-run
```

## 2. Check The Harness

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness doctor --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness status --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness check --directory .
```

If you installed the package globally or as a project dependency, you can use `blueprint` instead of the GitHub `npx` runner.

Expected early result:

```text
PASS_WITH_CONCERNS blueprint structural check
concern no story packets yet
```

That is normal. A fresh project has structure, but it is not implementation-ready.

Read these before asking an agent to write full docs:

- `docs/ARTIFACT_DEPTH_STANDARD.md`
- `docs/SCHEMA_REFERENCE.md`
- `docs/EXAMPLE_COMPARISON.md`
- `docs/COMMERCE_RISK_PLAYBOOK.md` for payment, shipping, inventory, auth, provider, or privacy risk

## 3. Start From A Raw Idea

Example:

```text
I want to build a website for managing students at a training center.
```

Use the one-command start flow:

Chat-first flow:

```text
nắm quy trình framework này
/start I want to build a website for managing students at a training center
```

CLI equivalent:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness start "I want to build a website for managing students at a training center" --directory . --depth deep
```

The harness should produce or guide you toward:

- Product Passport
- PRD
- UX Spec
- Architecture
- Data/API Contract
- Integration Protocol
- State/RBAC/Error-code specs
- Edge Case Matrix
- Traceability Matrix
- Epics and stories
- Test Matrix
- Readiness Review
- Agent briefs/context packets

## 4. Create A Story

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness new-story "Create student profile" --directory .
```

Then edit the generated story in `docs/stories/` until it has:

- Product contract
- Acceptance criteria
- Definition of Ready and Definition of Done
- Design notes
- Validation proof
- Agent ownership
- Allowed and forbidden files/modules
- Proof format

## 5. Export Context For A Coding Agent

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness export-context US-001 --agent developer-agent --directory .
```

The packet appears in:

```text
.blueprint/context-packets/
```

Give that packet to a coding agent instead of dumping the whole repo context.

## 6. Run Production Lint And Readiness

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness explain-fail --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness lint --directory . --ci
npx -y github:dailam148i-IT/Software-Blueprint-Harness readiness --directory .
```

Only start implementation when:

```text
READY_FOR_IMPLEMENTATION
```

If the status is `FAIL`, fix blockers first.

## 7. Optional: Sync References

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness refs sync --directory . --dry-run
npx -y github:dailam148i-IT/Software-Blueprint-Harness refs sync --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness refs index --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness research run --directory . --topic "student management SaaS" --depth deep
```

This clones the source method repos into `refs/vendor/` for local study.

## 8. Optional: Export GitHub Issues

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness github create-issues --directory .
npx -y github:dailam148i-IT/Software-Blueprint-Harness github create-issues --directory . --use-gh --repo owner/name --confirm-publish
```

This converts story packets into issue markdown under `.blueprint/github/issues/`.
