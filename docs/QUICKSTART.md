# Quickstart

This guide shows the fastest useful path from an idea to implementation-ready documents.

## 1. Install Into A Project

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes --with-github --with-examples
```

Preview first:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --dry-run
```

## 2. Check The Harness

```bash
blueprint doctor
blueprint status
blueprint check
```

Expected early result:

```text
PASS_WITH_CONCERNS blueprint structural check
concern no story packets yet
```

That is normal. A fresh project has structure, but it is not implementation-ready.

## 3. Start From A Raw Idea

Example:

```text
I want to build a website for managing students at a training center.
```

The harness should produce or guide you toward:

- Product Passport
- PRD
- UX Spec
- Architecture
- Data/API Contract
- Epics and stories
- Test Matrix
- Readiness Review
- Agent briefs/context packets

## 4. Create A Story

```bash
blueprint new-story "Create student profile"
```

Then edit the generated story in `docs/stories/` until it has:

- Product contract
- Acceptance criteria
- Design notes
- Validation proof
- Agent ownership

## 5. Export Context For A Coding Agent

```bash
blueprint export-context US-001 --agent developer-agent
```

The packet appears in:

```text
.blueprint/context-packets/
```

Give that packet to a coding agent instead of dumping the whole repo context.

## 6. Run Readiness

```bash
blueprint readiness
```

Only start implementation when:

```text
READY_FOR_IMPLEMENTATION
```

If the status is `FAIL`, fix blockers first.
