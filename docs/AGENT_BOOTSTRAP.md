# Agent Bootstrap

This file defines the intended human-to-agent entry flow.

## Step 1: Install

The user installs the framework into a repository:

```bash
npx -y github:dailam148i-IT/Software-Blueprint-Harness init --directory . --yes --with-github
```

This creates `AGENTS.md`, docs, templates, gates, memory, extensions, and research scaffolding.

## Step 2: Human Tells Agent To Learn The Process

User message:

```text
nắm quy trình framework này
```

Agent response should be short:

```text
Tôi đã nắm quy trình. Khi bạn gửi /start <ý tưởng>, tôi sẽ hỏi vài câu cần thiết, chạy/chuẩn bị research, lập kế hoạch đa agent, cho verifier kiểm tra, chờ bạn chốt, rồi mới viết bộ tài liệu đầy đủ. Tôi sẽ không code trước readiness.
```

The agent must read:

1. `AGENTS.md`
2. `docs/SIMPLE_PROMPT_WORKFLOW.md`
3. `docs/WORKFLOW.md`
4. `docs/QUALITY_GATES.md`
5. `docs/ARTIFACT_DEPTH_STANDARD.md`
6. `docs/EXAMPLE_COMPARISON.md`
7. `docs/PROMPTS_END_TO_END.md`

## Step 3: Human Starts A Product

User message:

```text
/start tôi muốn làm website quản lý sinh viên
```

Agent behavior:

1. Extract the idea after `/start`.
2. Run `blueprint start-base "<idea>"` if available.
3. Ask the generated clarifying questions.
4. Prepare refs/research as needed.
5. After answers, run `blueprint start-deep --from-latest`.
6. Ask verifier agents to review the professional plan.
7. Stop for human approval.
8. Record approval with `blueprint approve --from-latest --yes`.
9. Run `blueprint assess`, `blueprint lint --ci`, and `blueprint readiness`.

## Step 4: Human Approves

Human approval can be written directly or recorded in:

```text
.blueprint/intake/<run-id>/04-human-approval.md
```

Required approval:

```text
APPROVED_FOR_DOCUMENTATION: yes
```

CLI approval:

```bash
blueprint approve --from-latest --yes
```

## Step 5: Documentation, Then Readiness

After approval, agents write docs and run:

```bash
blueprint explain-fail
blueprint assess --ci --min-score 80
blueprint lint --ci
blueprint readiness
blueprint memory update
blueprint memory compact
```

Implementation remains blocked until readiness allows it.
