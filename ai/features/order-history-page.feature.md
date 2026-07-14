# AI Feature Spec — Order History Page

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Order History Page
- **Related Area:** Mobile (screen + API integration)

## Feature Goal

Replace the placeholder Order History screen with a real table of the logged-in
customer's past orders, and give each row a View control that opens the Order
History Detail modal — matching the wireframe's "MY ORDERS" table.

## Feature Scope

### In Scope

- Replace the placeholder `app/customer/history.tsx` with the real screen
- Fetch `GET /api/orders?type=customer&id={customer_id}` on load
  (`customer_id` from AsyncStorage)
- "MY ORDERS" section title
- A table with a dark charcoal header row and three columns: **ORDER**,
  **STATUS**, **VIEW**
- One row per order: restaurant name (ORDER), status uppercased e.g.
  "PENDING" (STATUS), a magnifying-glass icon button (VIEW)
- Tapping the VIEW icon opens the Order History Detail modal **shell** — a
  modal that opens and can be closed. Its detailed contents (date, courier,
  products, prices, totals) belong to the **next** feature,
  `order-history-modal`; do not build them here beyond what's needed to prove
  the modal opens for the correct order.

### Out of Scope

- The detail modal's body content — `order-history-modal` feature
- Sorting, filtering, pagination (not in the wireframe)
- Cancelling/editing/re-ordering past orders

## Sub-Requirements

- R1 — the page displays a structured table with headings Order, Status,
  and View (checklist: "Order History Page - Table")
- R2 — clicking a View button/icon opens the Order History Detail modal
  (checklist: "Order History Page - View Button")

## User Flow

1. Customer taps the OrderHistory tab → `GET /api/orders?type=customer&id={customer_id}`
   → the table renders one row per past order
2. Each row shows the restaurant name, the order status (uppercased), and a
   magnifying-glass VIEW icon
3. Customer taps the VIEW icon on a row → the Order History Detail modal opens
   for that specific order (identified so the next feature can render its
   details); the customer can close it to return to the table

## Interfaces

| File | Role |
|---|---|
| `app/customer/history.tsx` | rewritten — real order history table (was placeholder) |
| `GET /api/orders?type=customer&id={customer_id}` | back-end endpoint (no changes) |

## Data Used or Modified

- **Fetch:** `GET {EXPO_PUBLIC_URL}/api/orders?type=customer&id={customer_id}`
  with Bearer token; `customer_id` read from AsyncStorage (stored at login)
- **Response:** unwrap `.data` → array of orders. Fields used **by this
  feature**: `id`, `restaurant_name`, `status`. (The same objects also carry
  `courier_name`, `products[]`, `total_cost`, `created_on` — consumed by the
  `order-history-modal` feature, not here.)
- **Local state only:** which order (if any) is selected for the modal, e.g.
  `selectedOrder: Order | null`. No writes.

## Validations / Expected Behavior

- `status` from the API is lowercase (e.g. `"pending"`); display uppercased
  ("PENDING") to match the wireframe
- If the customer has no orders, render the table headers with no rows (no
  special empty-state copy shown in the wireframe)
- The VIEW icon is the only interactive element per row (tapping elsewhere on
  the row does nothing, matching the wireframe which shows only the icon as
  actionable)

## Tech Constraints

- Reuse the fetch/auth pattern (base URL from `EXPO_PUBLIC_URL`, Bearer token
  from AsyncStorage) established by earlier features
- Colors from `constants/colors.ts`: table header row is Dark Charcoal
  `#222126` with white text, per the wireframe
- VIEW icon: FontAwesome magnifying glass (`faMagnifyingGlass`, or
  `faMagnifyingGlassPlus` to match the wireframe's zoom-in glyph); no new
  icon libraries
- Modal: plain React Native `<Modal>`, consistent with the menu confirmation
  modal — not a new dependency

## Acceptance Criteria

- [ ] The OrderHistory tab shows a table with a header row reading
      ORDER / STATUS / VIEW
- [ ] Each past order appears as a row with restaurant name and uppercased
      status
- [ ] Tapping a row's VIEW icon opens a modal (shell is fine for this
      feature) tied to that specific order
- [ ] Data matches the API (verify against
      `GET /api/orders?type=customer&id=…` or the Postman collection)
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running

## Notes for the AI

- The seeded customer (`customer_id` 2) has real orders from earlier order-
  creation testing, so the table won't be empty during verification
- Keep the modal state (`selectedOrder`) here — the next feature
  (`order-history-modal`) reads it to render the detail body, so store the
  whole order object, not just its id, to avoid a second fetch
- Match the wireframe layout: fixed three-column table, header row visually
  distinct (dark background), rows separated by thin lines
