# Harness

Software Blueprint Harness is the operating environment around a future software product.

The product is what users touch. The harness is what agents, developers, reviewers, and project owners touch.

## Core Loop

```text
human intent
-> feature intake
-> product docs
-> solution docs
-> story packets
-> validation proof
-> implementation
-> review
-> release
-> harness improvement
```

## Source Of Truth

1. User-provided input starts the process.
2. Accepted product truth lives in `docs/product/`.
3. Work units live in `docs/stories/`.
4. Decisions live in `docs/decisions/`.
5. Proof lives in `docs/TEST_MATRIX.md` and review/evidence notes.
6. Memory indexes and summarizes, but never replaces the source docs.

## Growth Rule

If a task reveals repeated confusion, missing validation, unclear ownership, or unnecessary context bloat, add a harness improvement to `docs/HARNESS_BACKLOG.md`.
