# AI Feature Spec — Order History Modal

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Order History Modal (Detail)
- **Related Area:** Mobile (modal body rendering)

## Feature Goal

Fill in the Order History Detail modal — the shell opened by the
`order-history-page` feature — so it shows the full details of the selected
order: date, status, courier, product lines, prices, and total, matching the
wireframe's "Order History Details" popup.

## Feature Scope

### In Scope

- Render the body of the existing modal in `app/customer/history.tsx` using the
  already-selected order (`selectedOrder`, held in state from the View tap —
  no new fetch)
- Header (already present): restaurant name in Orange Red on the dark charcoal
  bar; keep it
- Detail block: **Order Date**, **Status** (uppercased), **Courier**
- Product lines: each product's name, quantity (e.g. `x2`), and line price
- **TOTAL** row with the order's total, currency-formatted

### Out of Scope

- The table and the View button — `order-history-page` feature (done)
- Any new network request — all data is already in `selectedOrder`
- Editing/cancelling/re-ordering; changing courier or status

## Sub-Requirements

- R1 — the modal shows the correct **date**, **status**, **courier name**,
  **products**, **prices**, and **totals** (checklist: "Accurate Details").
  This is the single graded row; every field below is part of it.

## User Flow

1. Customer taps a row's VIEW icon on the Order History table (previous
   feature) → the modal opens with `selectedOrder` set
2. The modal renders that order's date, status, courier, and each product line
   with quantity and price, then the total
3. Customer closes the modal (X) → returns to the table (already wired)

## Interfaces

| File | Role |
|---|---|
| `app/customer/history.tsx` | modal body filled in (shell already exists here) |

No endpoints — this feature renders data already fetched by
`order-history-page`.

## Data Used or Modified

From `selectedOrder` (shape confirmed against the live API):

- `created_on` — ISO timestamp string (e.g. `"2026-07-13T19:21:30.023184"`) →
  displayed as a readable date
- `status` — lowercase string (e.g. `"pending"`) → displayed uppercased
- `courier_name` — string **or `null`** (null for pending/unassigned orders)
- `products` — `[{ product_name, quantity, unit_cost, total_cost, product_id }]`
- `total_cost` — number (whole dollars)

No writes.

## Validations / Expected Behavior

- `courier_name` is `null` when no courier is assigned yet — render the
  "Courier:" label with an empty value (or a dash), never the literal
  "null"
- `created_on` formatted as a human-readable date (e.g. `Jul 13, 2026`);
  do not dump the raw ISO string
- All money values currency-formatted to two decimals (`$28.00`, `$44.00`) —
  line prices and the total. Use each product's `total_cost` for its line
  (unit_cost × quantity), and the order's `total_cost` for the TOTAL row
- Product line quantity shown as `x{quantity}` to match the wireframe
- The modal must read whatever order was tapped — verify by opening two
  different orders and confirming each shows its own products/total, not a
  stale previous one

## Tech Constraints

- Colors from `constants/colors.ts`; keep the existing header styling
  (restaurant name Orange Red on Dark Charcoal). Body text Dark Charcoal on
  white, per the wireframe
- Reuse the modal layout patterns already in `history.tsx` and the menu
  confirmation modal — no new modal library
- Date formatting with built-in `Date`/`toLocaleDateString` — no date library

## Acceptance Criteria

- [ ] Opening an order shows its correct date, uppercased status, courier
      (or blank when null), every product with quantity and price, and the
      correct total
- [ ] Prices are currency-formatted (`$X.XX`); the total matches the order's
      `total_cost`
- [ ] Opening a different order updates all fields to that order (no stale
      data from a previously-opened order)
- [ ] A pending order with `courier_name: null` renders cleanly (no "null")
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running

## Notes for the AI

- The seeded customer has real multi-product orders (e.g. order #34: Teriyaki
  Chicken Donburi x2 + Poutine x1, total 44), so all fields are populated for
  verification — except `courier_name`, which is null on pending orders (a
  case the modal must handle)
- This is the last feature. After it verifies, run the **Final Wireframe
  Verification** checklist in `ai-spec.md` and the still-pending on-device
  test of the confirmation modal's error state before merging to `main`.
