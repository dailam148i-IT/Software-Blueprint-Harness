# Research Pipeline

The research pipeline turns reference repositories into evidence-backed harness decisions.

## Commands

```bash
blueprint refs sync --dry-run
blueprint refs sync
blueprint refs status
blueprint refs index

blueprint research plan --topic "student management SaaS"
blueprint research run --topic "student management SaaS" --depth deep
blueprint research report
blueprint research validate
blueprint research synthesize
```

## Stages

```text
refs sync
-> commit lock
-> refs index
-> research plan
-> extraction
-> claim map
-> synthesis
-> integration proposal
-> validation
```

## Output

```text
.blueprint/refs/REFS_LOCK.json
.blueprint/refs/index.json
.blueprint/refs/index.summary.json
.blueprint/refs/index.files.jsonl
.blueprint/research/runs/<run-id>/
  manifest.json
  plan.md
  lock-snapshot.json
  source-inventory.json
  evidence-cards.jsonl
  findings.jsonl
  extracted-findings.json
  claim-map.json
  conflicts.md
  synthesis.md
  integration-proposal.md
docs/research/reference-notes/
docs/research/latest-reference-synthesis.md
```

## Evidence Rule

Do not integrate a reference idea into the harness unless it maps to a concrete artifact:

- CLI command
- schema
- template
- extension
- integration adapter
- readiness gate
- test
- documented workflow

Every claim in `claim-map.json` must have a source path, line, and commit when the reference repository is synced. Every evidence card must rehydrate from the local reference file and match its `quote_hash`.

## Depth Levels

| Depth | Use when | Behavior |
| --- | --- | --- |
| `quick` | orientation | samples a small set of high-signal files |
| `standard` | normal framework work | extracts from core docs and relevant source |
| `deep` | production v1 or major process design | extracts more files per reference |

## Human Review

Research output proposes changes. It does not automatically rewrite product truth. Accepted changes should become decision records or harness backlog items before implementation.
