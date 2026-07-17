# AI Feature Spec — Navigation Structure

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Navigation Structure
- **Related Area:** Mobile (Expo Router layouts)

## Feature Goal

Give the app its complete navigation skeleton: a root Stack that separates the
Login screen from the customer area, bottom Tabs inside the customer area, and
a nested Stack inside the Restaurants tab — three levels of nesting total.
Screens themselves are placeholders at this stage; later features fill them in.

## Feature Scope

### In Scope

- Root Stack Navigator in `app/_layout.tsx` controlling the top-level flow
  (Login vs customer area)
- Tab Navigator in `app/customer/_layout.tsx` with exactly two bottom tabs:
  **Restaurants** and **OrderHistory**
- Nested Stack Navigator in `app/customer/restaurant/_layout.tsx` handling
  restaurant list ↔ restaurant menu
- Placeholder screens: restaurant list (`restaurant/index.tsx`), restaurant
  menu (`restaurant/[id].tsx`), order history (`history.tsx`)
- A temporary way to get from Login to the customer area so navigation can be
  tested before real auth exists

### Out of Scope

- Header bar (logo + Log Out) — `header-footer` feature
- Real login/auth — `login-page` feature
- Any real data fetching or screen content — later features
- Styling beyond what the footer tabs need

## Sub-Requirements

- R1 — `app/_layout.tsx` hosts a root `<Stack>`; it manages the main flow and
  wraps the entire app (checklist: "Root Layout with Stack Navigation")
- R2 — `app/customer/_layout.tsx` hosts a `<Tabs>` navigator nested inside the
  root Stack (checklist: "Customer Level with Tab Navigation")
- R3 — `app/customer/restaurant/_layout.tsx` hosts another `<Stack>` for
  list → menu navigation (checklist: "Nested Restaurant Stack Navigation")
- R4 — the footer shows exactly two tabs, **Restaurants** and **OrderHistory**,
  with icons (burger / history-clock) matching the wireframe footer
- R5 — navigating between restaurants list and a menu (`[id]`) works and back
  navigation returns to the list

## User Flow (high level)

1. App opens on the Login screen (`app/index.tsx`)
2. (Temporary) user taps through to the customer area
3. Customer area opens on the Restaurants tab, showing the restaurant list
4. Tapping a restaurant navigates to that restaurant's menu (`[id]`); back
   returns to the list
5. The footer lets the user switch between Restaurants and OrderHistory at any
   time

## Interfaces

| File | Role |
|---|---|
| `app/_layout.tsx` | root Stack (already exists — update as needed) |
| `app/index.tsx` | Login placeholder (already exists) |
| `app/customer/_layout.tsx` | bottom Tabs: restaurant, history |
| `app/customer/restaurant/_layout.tsx` | nested Stack |
| `app/customer/restaurant/index.tsx` | placeholder "Restaurants" screen |
| `app/customer/restaurant/[id].tsx` | placeholder "Restaurant Menu" screen |
| `app/customer/history.tsx` | placeholder "Order History" screen |

## Data Used or Modified

None — placeholders only. The `[id]` route param is read and displayed to prove
dynamic routing works.

## Tech Constraints

- Expo Router file-based navigators only (`Stack`, `Tabs` from `expo-router`)
- Footer icons via FontAwesome (`@fortawesome/react-native-fontawesome`)
- Tab bar colors must come from the project palette (see global spec); the
  wireframe's active-tab pill is approximated within the six allowed colors
- No extra tabs, no extra routes

## Acceptance Criteria

- [ ] Login → customer area → Restaurants tab → menu `[id]` → back → history
      tab: all transitions work on device (Expo Go)
- [ ] Footer visible on all customer screens with exactly two tabs labeled
      Restaurants and OrderHistory
- [ ] Three navigator levels exist in the exact files named above
- [ ] `npx tsc --noEmit` passes; no runtime warnings about missing routes

## Notes for the AI

- Keep placeholders minimal (a title `<Text>` centered) — later features
  replace their content
- The temporary Login→customer link must be clearly marked `// TEMP` so the
  login feature removes it
- Hide the default navigation headers for now (`headerShown: false`); the
  custom header arrives with the `header-footer` feature
