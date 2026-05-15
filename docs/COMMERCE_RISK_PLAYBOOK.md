# Commerce Risk Playbook

Use this playbook for ecommerce, booking, payment, shipping, inventory, marketplace, subscription, or wallet-like products.

## Required Contracts

- `docs/specs/state-machines.yaml`
- `docs/specs/rbac.yaml`
- `docs/specs/error-codes.yaml`
- `docs/product/integration-protocol.md`
- `docs/EDGE_CASE_MATRIX.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/TEST_MATRIX.md`
- `docs/security/threat-model.md`
- `docs/privacy/privacy-impact-assessment.md` when personal data exists

## State Machines

Define at least these when relevant:

- order lifecycle
- payment lifecycle
- inventory reservation/deduction/restoration
- shipment lifecycle
- refund/return lifecycle

Each transition must define:

- from state
- event
- to state
- guards
- side effects
- error codes
- idempotency behavior
- audit event
- linked story

## Payment And Bank Transfer Checklist

- Payment method states for COD, bank transfer, and future providers.
- Idempotency key format for confirmation.
- Reference uniqueness and amount matching.
- Underpay, overpay, duplicate reference, wrong reference.
- Manual confirmation SLA.
- Pending payment expiry.
- Cancel before/after confirmation.
- Reconciliation schedule and owner.
- Override permission and audit trail.
- Dispute/reversal handling if applicable.

## Inventory Integrity Checklist

- Available = on_hand - reserved.
- Reserve stock atomically at the chosen point.
- Deduct stock exactly once when order is confirmed or fulfilled.
- Restore reservation exactly once on cancel/failure/expiry.
- Reject checkout if requested quantity exceeds available stock.
- Handle concurrent checkout for the same SKU.
- Handle stock adjustment while checkout is in progress.
- Never allow negative on_hand or reserved.
- Write stock ledger entries for every mutation.

## Shipping Callback Checklist

- Signature/auth validation.
- Provider event payload schema.
- Duplicate callback handling.
- Late or out-of-order callback handling.
- Unknown tracking code handling.
- Retry policy and backoff.
- Dead-letter queue or manual review queue.
- Reconcile job for stale shipments.
- Customer-visible status mapping.

## Security And Privacy Checklist

- Customer can view only own orders.
- Admin/order ops permissions are separate from inventory permissions.
- Payment status mutation requires elevated role and audit log.
- PII is masked in logs and exports.
- Address/phone retention policy exists.
- Threat model covers tampering, replay, privilege escalation, and provider spoofing.

## Test Scenarios

Minimum scenarios for high-risk commerce:

- `TC-ORDER-001` valid checkout.
- `TC-INVENTORY-001` concurrent checkout same SKU.
- `TC-INVENTORY-002` cancel restores reservation exactly once.
- `TC-PAYMENT-001` duplicate bank transfer confirmation is idempotent.
- `TC-PAYMENT-002` pending payment expiry releases reservation.
- `TC-SHIP-001` duplicate shipping callback is ignored safely.
- `TC-SHIP-002` late callback cannot reopen terminal order.
- `TC-RBAC-001` unauthorized staff cannot mutate payment status.
