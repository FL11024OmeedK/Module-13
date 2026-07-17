# AI Feature Spec — Login Page

> Use together with the global spec (`./ai/ai-spec.md`). Read both before
> implementing.

## Feature Identity

- **Feature Name:** Login Page
- **Related Area:** Mobile (screen + API integration)

## Feature Goal

Replace the temporary placeholder login screen with a real, functional login:
the user enters email and password, the app authenticates against the Java
API through the ngrok tunnel, stores the session on success, and shows an
inline error on failure — matching the wireframe exactly.

## Feature Scope

### In Scope

- Email + password form on `app/index.tsx`
- `POST /api/auth` call through `EXPO_PUBLIC_URL` (the ngrok tunnel)
- On success: store `accessToken`, `user_id`, `customer_id` in AsyncStorage,
  navigate to the customer area (`/customer/restaurant`)
- On failure (401 / bad credentials): inline error message shown **above**
  the Login button; form stays on screen, fields are not cleared
- Removing the TEMP "Enter customer area" link added by the
  `navigation-structure` feature

### Out of Scope

- Registration, "forgot password," remember-me, biometric login
- Auto-redirect if a valid session already exists in AsyncStorage on app
  launch (not required by the checklist; would be scope creep)
- Any back-end change — `/api/auth` is consumed exactly as it exists

## Sub-Requirements

- R1 — functional login using email and password as credentials
  (checklist: "Login Page - Create")
- R2 — incorrect credentials produce an inline error message positioned
  **above** the Login button (checklist: "Login Page - Error Message")
- R3 — the request goes through the ngrok tunnel (`EXPO_PUBLIC_URL`), and this
  is the pattern all future fetch calls in the app must follow
  (checklist: "Login Page - Tunnel Connection")

## User Flow

1. User opens the app → sees the Login screen (logo, "Welcome Back" / "Login
   to begin", Email field, Password field, LOG IN button)
2. User enters email and password, taps LOG IN
3. App calls `POST {EXPO_PUBLIC_URL}/api/auth` with `{email, password}`
4. **Success:** response `{success:true, accessToken, user_id, customer_id}`
   → stored in AsyncStorage → navigate to `/customer/restaurant`
5. **Failure:** response is 401 with `{success:false}` → an error message
   appears above the LOG IN button; user can retry without leaving the screen

## Interfaces

| File | Role |
|---|---|
| `app/index.tsx` | rewritten — real login form (was the temp placeholder) |
| `POST /api/auth` | back-end endpoint (no changes) |

## Data Used or Modified

- **Sends:** `{ email: string, password: string }`
- **Receives (success):** `{ success: true, accessToken, user_id, customer_id, courier_id }`
- **Receives (failure):** HTTP 401, `{ success: false }`
- **AsyncStorage writes on success:** `accessToken`, `user_id`, `customer_id`
  (same keys `Header`'s Log Out already clears — no new keys to invent)

## Validations / Expected Behavior

- Both fields required — LOG IN does not attempt a request with an empty
  email or password (simple client-side check, no format/regex validation
  beyond "not empty," since the wireframe shows no such messaging)
- While a request is in flight, avoid duplicate submissions (disable the
  button or ignore repeat taps) — no specific wireframe state for this, keep
  it simple (e.g. `disabled` while loading)
- Any non-2xx response (401 or otherwise) shows the same generic error
  message; do not leak server error details to the UI

## Tech Constraints

- Use `fetch` with `process.env.EXPO_PUBLIC_URL` as the base — never hardcode
  a URL (per global spec rule 6)
- Colors/fonts must match the wireframe: Orange Red `#DA583B` LOG IN button,
  Dark Charcoal text, white background — import from `constants/colors.ts`
- No third-party form library — plain `useState` + `TextInput`

## Acceptance Criteria

- [ ] Entering the seeded credentials (`customer@gmail.com` / `password`)
      logs in and navigates to the restaurant list
- [ ] Entering wrong credentials shows an inline error message positioned
      above the LOG IN button; the user stays on the Login screen
- [ ] The request is confirmed (e.g. via server or ngrok inspector logs) to
      go through the `EXPO_PUBLIC_URL` tunnel, not a hardcoded localhost URL
- [ ] AsyncStorage contains `accessToken` after a successful login
      (verify via a quick log or the React Native debugger)
- [ ] The TEMP "Enter customer area" link no longer exists
- [ ] Verified on-device (Expo Go) with the real backend + tunnel running,
      not just typecheck/bundle

## Notes for the AI

- This is the first feature that performs a real network request — reuse this
  fetch pattern (base URL from `EXPO_PUBLIC_URL`, Bearer token where needed)
  for every subsequent feature rather than inventing a new one each time.
- Keep the component simple: one `useState` for email, one for password, one
  for the error message, one for loading state.
