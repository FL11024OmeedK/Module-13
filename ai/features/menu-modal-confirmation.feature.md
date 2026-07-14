# AI Feature Spec — Menu Modal Confirmation

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Menu Modal Confirmation
- **Related Area:** Mobile (modal state machine + API integration)

## Feature Goal

Turn the Order Confirmation modal (currently a static summary shell from the
`restaurant-menu-page` feature) into the real order flow: a Confirm Order
button that POSTs the order, a disabled "Processing Order…" state while the
request is in flight, and distinct success / failure end states matching the
wireframe.

## Feature Scope

### In Scope

- Confirm Order button inside the modal (Orange Red, full width, per wireframe)
- `POST /api/orders` with the selected items when Confirm Order is tapped
- **Processing state:** button disabled, label becomes "Processing Order…"
- **Success state:** button disappears entirely; a green circle-checkmark icon
  and a success message ("Thank you! Your order has been received.") appear
- **Failure state:** the Confirm Order button reappears (tappable, for retry)
  with a red circle-X icon and a failure message ("Your order was not
  processed successfully. Please try again.")
- Closing and reopening the modal returns it to the initial (idle) state
- On success, all item quantities reset to 0 (owner decision — beyond the
  checklist, prevents accidentally re-ordering the same items), so the menu
  behind the modal shows a fresh cart once it closes
- The summary itself (names, quantities, prices, total) — already rendered by
  the shell — is formally owned by this feature's "Correct Details" and
  "Currency Format" requirements now

### Out of Scope

- Order history updates (the new order will naturally appear there via the
  API — `order-history-page` feature)
- Retry limits, timeouts, offline queueing

## Sub-Requirements

- R1 — the modal displays accurate product details: names, quantities, prices
  (checklist: "Correct Details")
- R2 — all prices use standard currency formatting, e.g. `$20.95`
  (checklist: "Currency Format")
- R3 — while awaiting the API response, the button is disabled and reads
  "Processing Order…" (checklist: "'Processing Order…' State")
- R4 — on success: button disappears, green checkmark + success message
  (checklist: "Success State")
- R5 — on failure: Confirm Order button reappears with a red X icon and a
  failure message (checklist: "Error State")

## User Flow

1. Customer taps Create Order on the menu → modal opens in **idle** state:
   summary rows + TOTAL + orange CONFIRM ORDER button
2. Customer taps CONFIRM ORDER → **processing**: button disabled, label
   "Processing Order…"; `POST /api/orders` fires
3. **On 2xx:** → **success**: button gone; green ✓ icon + "Thank you! Your
   order has been received."
4. **On non-2xx / network error:** → **failure**: button back (enabled) + red
   ✗ icon + "Your order was not processed successfully. Please try again."
   Tapping the button again retries from step 2.
5. Customer closes the modal (X) at any point → reopening starts at idle

## Interfaces

| File | Role |
|---|---|
| `app/customer/restaurant/[id].tsx` | modal upgraded from shell to full state machine |
| `contexts/CartContext.tsx` | source of quantities; gains a `clearQuantities()` used on success |
| `POST /api/orders` | back-end endpoint (no changes) |

## Data Used or Modified

- **Sends:** `POST {EXPO_PUBLIC_URL}/api/orders` with Bearer token, body:
  `{ restaurant_id: number, customer_id: number, products: [{ id, quantity }] }`
  — `customer_id` read from AsyncStorage (stored at login),
  `restaurant_id` from the route param, `products` from the cart (only items
  with quantity > 0)
- **Receives (success):** 201 with the created order in `.data`
- **Receives (failure):** non-2xx (e.g. 400 "Invalid or missing parameters")
- Local modal state: `'idle' | 'processing' | 'success' | 'error'`

## Validations / Expected Behavior

- Confirm Order is only reachable when at least one quantity > 0 (the menu
  page already gates Create Order, so the modal can assume a non-empty cart)
- Duplicate taps during processing are impossible (button disabled — R3)
- All money values formatted with two decimals (`toFixed(2)` style: `$20.95`,
  `$9.00`) — applies to line items AND the total
- The failure message must not leak raw server errors; use the fixed
  wireframe copy

## Tech Constraints

- Icons: FontAwesome `faCircleCheck` (Muted Green `#609475`) and
  `faCircleXmark` (Dark Red `#851919`) — per the global spec's color-usage
  table; no new icon libraries
- Modal layout/colors already match the wireframe (dark charcoal header bar,
  white body) — keep them
- State machine in a single `useState<'idle'|'processing'|'success'|'error'>`
  — no reducer/library needed at this size

## Acceptance Criteria

- [ ] Modal shows exactly the selected items with correct names, quantities,
      and prices; total is the correct sum (R1)
- [ ] Every price shows as `$X.XX` (R2)
- [ ] Tapping CONFIRM ORDER immediately disables it and shows
      "Processing Order…" until the response arrives (R3)
- [ ] Successful order: button gone, green checkmark + success message; the
      order actually exists afterward (verify via
      `GET /api/orders?type=customer&id=…` or the Postman collection) (R4)
- [ ] Failed order: red X + failure message, button back and tappable (R5) —
      test by forcing a failure (e.g. temporarily stopping the backend or
      sending an invalid body via a temporary tweak)
- [ ] Close + reopen the modal → idle state again
- [ ] After a successful order, closing the modal shows the menu with all
      quantities back at 0 (and Create Order disabled again)
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running

## Notes for the AI

- The shell modal from `restaurant-menu-page` already renders summary rows
  and total — extend it in place rather than rebuilding it
- Keep the state transitions honest: `processing` must only be entered when
  the request actually starts, and only exit on the response/catch — no
  artificial delays
- For the on-device failure test, the cleanest non-destructive trigger is
  stopping the Spring Boot process briefly (the tunnel then returns 502) —
  no code changes needed
