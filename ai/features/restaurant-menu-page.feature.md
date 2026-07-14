# AI Feature Spec — Restaurant Menu Page

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Restaurant Menu Page
- **Related Area:** Mobile (screen + API integration)

## Feature Goal

Show a restaurant's menu with quantity steppers on each item, gate the
Create Order button on at least one item having a non-zero quantity, and
open the Order Confirmation Modal when it's tapped — matching the wireframe.

## Feature Scope

### In Scope

- Replace the placeholder `app/customer/restaurant/[id].tsx` with the real
  screen
- Header: restaurant name, price (`$`/`$$`/`$$$`), rating (stars) —
  `GET /api/restaurants/{id}`
- Menu item list — `GET /api/products?restaurant={id}` — each row: static
  `RestaurantMenu.jpg` image, name, description, price, quantity stepper
- Create Order button: disabled while every quantity is 0, enabled once any
  quantity is > 0
- Tapping Create Order (when enabled) opens the Order Confirmation Modal —
  **only as a shell** showing the order summary (item names, quantities,
  prices, total). The modal's interactive states (Processing/Success/Failure,
  the actual `POST /api/orders` call) belong to the **next** feature,
  `menu-modal-confirmation` — do not implement them here.

### Out of Scope

- Anything inside the modal beyond a static summary + close button (see
  above) — `menu-modal-confirmation` feature
- Editing product data, restaurant CRUD
- Any styling/layout not shown in the wireframe

## Sub-Requirements

- R1 — all quantities start at 0 and can never go negative
  (checklist: "Default Quantity = 0")
- R2 — switching to a different restaurant resets all quantities to 0
  (checklist: "Quantities Reset on Restaurant Change")
- R3 — quantities can only change via the + and − buttons; no text input
  (checklist: "Buttons Only")
- R4 — Create Order is disabled while every quantity is 0
  (checklist: "Create Order Disabled at 0")
- R5 — enabled Create Order opens the Order Confirmation Modal
  (checklist: "Confirmation Modal Opens")
- R6 — every restaurant's menu uses the same static image, `RestaurantMenu.jpg`
  (checklist: "Static Menu Image")

## User Flow

1. Customer taps a restaurant on the list → lands on `/customer/restaurant/{id}`
2. Header shows that restaurant's name/price/rating; item list loads below
3. Every item shows quantity 0 and a disabled-looking Create Order button
4. Customer taps `+` on one or more items → quantity increases; Create Order
   becomes enabled as soon as any quantity > 0
5. Customer taps `-` → quantity decreases, floor at 0 (button is a no-op at 0,
   never goes negative)
6. Customer taps Create Order (enabled) → the confirmation modal opens,
   showing the selected items, quantities, unit prices, and total
7. If the customer instead navigates back and opens a **different**
   restaurant, that restaurant's item quantities all start at 0 — even if
   they had non-zero quantities set on the previous restaurant

## Interfaces

| File | Role |
|---|---|
| `app/customer/restaurant/[id].tsx` | rewritten — real menu screen (was TEMP placeholder) |
| `GET /api/restaurants/{id}` | back-end endpoint (no changes) — header data |
| `GET /api/products?restaurant={id}` | back-end endpoint (no changes) — item list |

## Data Used or Modified

- **Fetch (header):** `GET {EXPO_PUBLIC_URL}/api/restaurants/{id}` with Bearer
  token → unwrap `.data` → `{ name, rating, price_range }` (plus whatever else
  the DTO returns — only these three are used here)
- **Fetch (items):** `GET {EXPO_PUBLIC_URL}/api/products?restaurant={id}` with
  Bearer token → unwrap `.data` → `[{ id, name, description, cost, restaurant_id }]`
- **Local state only:** a quantity map keyed by product id, e.g.
  `Record<number, number>`. Not persisted anywhere (AsyncStorage, etc.) —
  it's per-visit, in-memory only.
- No writes in this feature (order creation is `menu-modal-confirmation`)

## Validations / Expected Behavior

- Quantity floor is 0 — the `-` button must not decrement below 0 (either
  disable it visually at 0, or make it a no-op; either satisfies R1)
- No `TextInput` anywhere near quantity — R3 is violated by allowing typed
  input, even if validated afterward
- Create Order's disabled/enabled state is derived from the quantity map
  (e.g. `Object.values(quantities).some(q => q > 0)`), not tracked as a
  separate flag that could drift out of sync
- Price format: `$X.XX` (e.g. a `cost` of `14` displays as `$14.00`)

## Tech Constraints

- Reuse the fetch/auth pattern from `login-page`/`restaurant-list-page`
- Colors from `constants/colors.ts`; Create Order button is Orange Red
  `#DA583B` when enabled, visibly muted (e.g. reduced opacity) when disabled
- Image: `require('@/assets/images/RestaurantMenu.jpg')` — the **same**
  import for every item row, every restaurant. Do not use the per-restaurant
  `assets/images/restaurants/*` images here — those are list-page only.
- Modal: a plain React Native `<Modal>`, not a new dependency

## Acceptance Criteria

- [ ] Opening any restaurant's menu shows every item at quantity 0
- [ ] Tapping `+`/`-` changes quantity; `-` never goes below 0
- [ ] No way to type a quantity directly
- [ ] Create Order is disabled (and visibly so) while all quantities are 0
- [ ] Setting any quantity > 0 enables Create Order
- [ ] Tapping Create Order opens a modal showing the correct items/quantities/
      prices/total
- [ ] Navigating from Restaurant A (with some non-zero quantities) to
      Restaurant B shows Restaurant B's items all at quantity 0 — **and**
      navigating back to Restaurant A also shows quantity 0 (not the values
      previously set), confirming the reset actually happened rather than
      just looking that way on first visit
- [ ] Static `RestaurantMenu.jpg` renders for every item, on every restaurant
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running

## Notes for the AI

- **Known trap (and how it was resolved):** Expo Router's Stack can preserve
  a previously-visited screen instance, so neither "the component remounts,
  `useState` resets itself" nor a `useEffect` keyed on `id` reliably enforces
  R2, and a `useFocusEffect` reset fires in cases the requirement doesn't
  ask about. The implemented solution lifts quantities out of the screen
  into `contexts/CartContext.tsx`, which tracks a single **active
  restaurant id**: when a menu screen calls `setActiveRestaurant(id)` with a
  different id than the current one, the context clears all quantities as
  part of the switch. The reset is therefore guaranteed by context logic,
  independent of the screen's mount/unmount/focus lifecycle. Keep this
  invariant if the cart is ever extended (e.g. by the
  `menu-modal-confirmation` feature).
- Reuse the header pattern from `Header.tsx` conceptually (logo bar), but
  this restaurant-name/price/rating block is a separate, page-specific
  element — not the same component.
