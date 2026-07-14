# AI Feature Spec — Header & Footer

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Header & Footer
- **Related Area:** Mobile (shared layout component)

## Feature Goal

Give every screen except Login a consistent header (Rocket Food Delivery logo
+ Log Out button) so the brand is visible throughout the app and the user can
always sign out. The footer (Restaurants / OrderHistory tabs) already exists
from the navigation-structure feature — this feature only adds the header.

## Feature Scope

### In Scope

- A shared `Header` component: logo image (left) + "LOG OUT" button (right)
- Wiring the header into every screen the customer sees (all screens under
  `app/customer/`), but **not** the Login screen
- Log Out button clears the stored session (AsyncStorage) and navigates back
  to `/` (Login)

### Out of Scope

- The footer tabs themselves — already implemented (`navigation-structure`)
- Real session/token storage — AsyncStorage keys are only *defined* here as a
  stub; the real `accessToken` write happens in `login-page`. Log Out clears
  whatever is there (no-op if nothing is stored yet)
- Any styling beyond the header bar itself

## Sub-Requirements

- R1 — Header and footer are visible on all pages **except** the Login Page
  (checklist: "Header - Navigation Visibility")
- R2 — Header displays the Rocket Food Delivery logo and a Log Out button
  (checklist: "Header - Logo")
- R3 — Clicking Log Out redirects the user to the Login Page
  (checklist: "Header - Logout Function")

## User Flow

1. User is anywhere inside the customer area (Restaurants, a restaurant menu,
   or OrderHistory) — the header is visible at the top, footer at the bottom
2. User taps **LOG OUT**
3. Any stored session data is cleared
4. User is returned to the Login screen (`/`), where no header/footer is shown

## Interfaces

| File | Role |
|---|---|
| `components/Header.tsx` | new — logo + Log Out button, shared component |
| `app/customer/_layout.tsx` | render `<Header />` above the `<Tabs>` |
| `app/customer/restaurant/_layout.tsx` | menu screen still needs the header even though it's a nested Stack — render `<Header />` here too (or lift it — see Notes) |
| `app/index.tsx` | unaffected — must NOT render the header |

## Data Used or Modified

- Reads/clears AsyncStorage key `accessToken` (and `user_id`, `customer_id` if
  present) on Log Out. No network calls.

## Tech Constraints

- Logo image: `assets/images/AppLogoV1.png` (or V2 — pick the one that best
  matches the wireframe's header lockup; do not create a new logo asset)
- Log Out button color: Orange Red `#DA583B` (from `constants/colors.ts`),
  white text — matches the wireframe exactly
- Navigate with `router.replace('/')` (not `push`) so Login isn't stackable
  via back button after logout
- No inline hex colors — import from `constants/colors.ts`

## Acceptance Criteria

- [ ] Header (logo + LOG OUT) appears on the restaurant list, restaurant menu,
      and order history screens
- [ ] Header does **not** appear on the Login screen
- [ ] Tapping LOG OUT navigates to Login and the customer area is no longer
      reachable via back button
- [ ] Colors match the wireframe/palette exactly
- [ ] Verified on-device (Expo Go), not just typecheck/bundle

## Notes for the AI

- The nested restaurant Stack (`customer/restaurant/_layout.tsx`) sits *inside*
  the Tabs layout — if the header is only rendered once in
  `customer/_layout.tsx` (above the `<Tabs>`), it will already cover the
  restaurant list and menu screens too since they're nested underneath. Prefer
  that single placement over duplicating `<Header />` in the nested stack —
  confirm it actually renders on the menu screen on-device before assuming so.
- Keep the component simple: no dropdown, no confirmation dialog on logout
  (wireframe shows none).
