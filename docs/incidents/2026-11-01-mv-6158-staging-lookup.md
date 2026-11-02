# Incident: MV-6158 staging lookup regression

**Label:** `controlled-staging-no-production-impact`

## Summary

A regression in shipment lookup caused the staging rendered-journey gate to fail for
reference `MV-6158` while the `MV-4821` journey continued to pass. The issue was
introduced by PR #5 (commit `c3451e1`) and was resolved by PR #6 (commit `c04cfe2`).
This incident was confined to controlled staging and had no production impact.

## Regression

- **Pull request:** #5
- **Commit:** `c3451e1`
- PR #5 restricted public shipment lookup to shipments that had already left the
  pre-dispatch state. On the deployed revision `c3451e1`, this caused `findShipment`
  to stop returning a result for the `MV-6158` reference, which was still in the
  "Preparing dispatch" status at the time.
- The pre-deploy rendered gate (`scripts/browser-check.mjs`) only checked the
  `MV-4821` reference by default, so the regression against `MV-6158` was not
  caught before the change reached staging.

## Detection

- **Run 41364127803** — MV-6158 hosted rendered-journey check: **failed**.
- **Run 41364130284** — MV-4821 hosted rendered-journey check: **passed**.

The divergence between the two runs — one failing reference and one healthy
reference against the same deployed revision — indicated that the lookup change
in PR #5 had a reference-specific blind spot rather than a general outage.

## Diagnosis

At **23:55:41 UTC**, the cause was identified as the pre-dispatch exclusion added
in PR #5 (`c3451e1`): `findShipment` filtered out shipments whose status was
`Preparing dispatch`, which matched `MV-6158` at the time but not `MV-4821`. The
existing CI gate did not exercise the `MV-6158` reference by default, which is why
the regression was not caught prior to the hosted failure in run 41364127803.

## Repair

- **Pull request:** #6 — "Restore MV-6158 lookup and gate every active shipment reference"
- **Commit:** `c04cfe2`
- `lib/tracking.mjs`: `findShipment` no longer excludes shipments by dispatch
  status, so any registered reference can be looked up again; a new
  `activeShipments` helper lists references that are not yet delivered.
- `scripts/browser-check.mjs`: when no `CHECK_REFERENCE` is supplied, the gate now
  renders every active shipment reference (currently `MV-4821` and `MV-6158`) and
  fails if any of them does not return its route. The hosted workflow's
  single-reference input continues to work unchanged.
- `test/tracking.test.mjs`: adds a test asserting that every active shipment
  reference, including a pre-dispatch booking, remains retrievable.
- `README.md`: updated to document the expanded gate behavior.

### Verification runs

- **Run 41366312400**
- **Run 41366315783**

Both post-fix hosted rendered-journey runs confirmed restored behavior for the
affected reference after the Pages deployment of PR #6.

## Lessons

- A rendered-journey gate that only checks a single hardcoded reference
  (`MV-4821`) created a blind spot: a lookup regression affecting a different
  reference (`MV-6158`) was not caught before reaching staging.
- Gating on every active shipment reference, rather than one fixed reference,
  closes this blind spot and would have caught the PR #5 regression before it
  shipped.
- Comparing two hosted runs against the same revision (one failing, one passing)
  was an effective signal for narrowing the regression to a reference-specific
  lookup condition rather than a broad outage.
- This incident and its repair were limited to controlled staging infrastructure
  and did not affect production, consistent with the
  `controlled-staging-no-production-impact` label applied to this note.
