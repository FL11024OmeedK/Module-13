# AI Feature Spec — Restaurant List Page

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Restaurant List Page
- **Related Area:** Mobile (screen + API integration)

## Feature Goal

Show the customer every restaurant on arrival, with optional filtering by
rating and/or price range, matching the wireframe's grid layout exactly.
Tapping a restaurant's image navigates to that restaurant's menu.

## Feature Scope

### In Scope

- Replace the placeholder `app/customer/restaurant/index.tsx` (currently TEMP
  links to restaurant ids 1/2) with the real screen
- Fetch `GET /api/restaurants` on load — no filters applied, all restaurants
  shown
- Rating filter dropdown and Price filter dropdown, both showing a
  placeholder (`-- Select --`) when unset; either, both, or neither can be
  active
- Two-column grid of restaurant cards: image, name + price notation, star
  rating
- Tapping a card's image navigates to `/customer/restaurant/{id}`

### Out of Scope

- The restaurant menu screen itself — `restaurant-menu-page` feature
- Sorting (not shown in the wireframe, only filtering)
- Pagination/infinite scroll (checklist doesn't require it; the seeded data
  set is small)

## Sub-Requirements

- R1 — on arrival, all restaurants are displayed with no filters applied
  (checklist: "Restaurant List Page - Full Display")
- R2 — user can filter by Rating, Price, or both; unset filters show a
  placeholder value (checklist: "Restaurant List Page - Filters")
- R3 — tapping a restaurant's image navigates to that restaurant's Menu page
  (checklist: "Restaurant List Page - Redirection")

## User Flow

1. Customer lands on the Restaurants tab → `GET /api/restaurants` (no query
   params) → all restaurants render in a grid
2. Customer opens the Rating dropdown, picks a value (1–5) →
   `GET /api/restaurants?rating={value}` → grid re-renders filtered
3. Customer opens the Price dropdown, picks a value (1–3) → combines with any
   active rating filter → `GET /api/restaurants?rating={value}&price_range={value}`
4. Customer taps a restaurant's image → navigates to
   `/customer/restaurant/{id}`

## Interfaces

| File | Role |
|---|---|
| `app/customer/restaurant/index.tsx` | rewritten — real restaurant list (was TEMP placeholder) |
| `GET /api/restaurants` | back-end endpoint (no changes) |

## Data Used or Modified

- **Fetch:** `GET {EXPO_PUBLIC_URL}/api/restaurants?rating=&price_range=`
  with `Authorization: Bearer <token>` (both query params optional)
- **Response:** unwrap `.data` → `[{ id, name, rating, price_range }]`
  (`rating` is an integer 0–5; `price_range` is an integer 1–3)
- No writes; read-only screen

## Validations / Expected Behavior

- No filter selected on first load — this is the default state, not an edge
  case to special-case
- Selecting "-- Select --" again (i.e. clearing a filter) removes that query
  param and re-fetches
- `price_range` displays as `$` / `$$` / `$$$` for 1 / 2 / 3, matching the
  wireframe (e.g. "Sweet Dragon ($)", "Golden Bar & Grill ($$)")
- `rating` displays as that many filled stars (e.g. `rating: 4` → `★★★★`)
- If the restaurants array is empty (a filter combination matches nothing),
  show the empty grid — no special empty-state copy is shown in the wireframe

## Tech Constraints

- `fetch` with `EXPO_PUBLIC_URL` + Bearer token, same pattern established by
  `login-page`
- Colors from `constants/colors.ts` only; filter dropdown buttons use Orange
  Red `#DA583B` per the wireframe
- Each restaurant card gets an image assigned from
  `assets/images/restaurants/` (6 available: cuisineGreek, cuisineJapanese,
  cuisinePasta, cuisinePizza, cuisineSoutheast, cuisineViet) — assignment is
  **deterministic per restaurant id** (e.g. `id % 6`), not re-randomized on
  every render, so a given restaurant doesn't visually flicker between
  images on re-renders/filter changes
- No native `<Picker>` dependency needed unless already available — a simple
  pressable + inline options (or `@react-native-picker/picker` if already a
  transitive dependency) is fine; do not add a new heavy UI library for this

## Acceptance Criteria

- [ ] On first load, all seeded restaurants appear with no filter applied
- [ ] Rating and Price dropdowns both show `-- Select --` by default
- [ ] Selecting a rating, a price, or both narrows the grid correctly (verify
      against known seeded data via the Postman collection or direct API call)
- [ ] Tapping a restaurant's image navigates to `/customer/restaurant/{id}`
      with the correct id
- [ ] Price displays as `$`/`$$`/`$$$`, rating displays as stars
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running

## Notes for the AI

- Reuse the exact fetch/auth pattern from `login-page` — base URL from
  `EXPO_PUBLIC_URL`, Bearer token from AsyncStorage's `accessToken`
- Keep filter state in local `useState`; re-fetch on any filter change
- This is the first screen to read the stored token for a GET request —
  confirm it's actually being sent (e.g. check the ngrok inspector or backend
  logs show a 200, not a 401/403) as part of on-device verification
