# AI Specification — Rocket Food Delivery Mobile App (Module 13)

> This is the **global AI specification** for the project. Read this file **first**,
> before implementing any feature. Each feature also has its own spec in
> `./ai/features/` — use both together. Do not implement anything that is not
> defined in these documents.

---

## Project Identity

- **Project Name:** Rocket Food Delivery — Customer Mobile App
- **Short Description:** Cross-platform mobile app that lets Rocket Food Delivery
  customers log in, browse and filter restaurants, order menu items, and review
  their order history. Consumes the existing Module 12 Spring Boot REST API.
- **Project Type:** Mobile App (React Native + Expo SDK 54, TypeScript, Expo Router)

## Goal and Scope

### Goal

Deliver the complete customer journey on iOS and Android, matching the provided
wireframes and color scheme exactly:

```
Login → Browse Restaurants → Filter (optional) → Select Restaurant
  → View Menu → Adjust Quantities → Create Order
    → Confirm in Modal → See Success/Failure Feedback
      → View Order History → Inspect Order Details
```

### In Scope (Build Now)

- Three-level nested navigation (root Stack → customer Tabs → restaurant Stack)
- Header (logo + Log Out) and footer (Restaurants / OrderHistory tabs) on every
  screen except Login
- Login screen with JWT auth and inline error message
- Restaurant list with rating/price filters
- Restaurant menu with stepper-controlled quantities and Create Order flow
- Order confirmation modal (processing / success / failure states)
- Order history table and order detail modal

### Out of Scope (Do NOT Build)

- Any back-end change — the Java API is consumed **as-is**
- Courier or employee flows (customer accounts only)
- Registration / password reset / account editing
- Payment processing, delivery tracking, push notifications
- Restaurant CRUD from the app (create/update/delete)
- Any screen, field, or button not present in the wireframes

## Users and Use Cases

- **Customer (only user type):** logs in, browses/filters restaurants, places
  orders, reviews order history. Seeded dev account: `customer@gmail.com` /
  `password` (customer_id 2).

## Feature Index (specs in ./ai/features/)

Each feature gets its own `feature/*` branch: spec first, then implementation.

1. `navigation-structure.feature.md` — ✅ implemented (verified on-device)
2. `header-footer.feature.md` — ✅ implemented (verified on-device)
3. `login-page.feature.md` — ✅ implemented (verified on-device)
4. `restaurant-list-page.feature.md` — ✅ implemented (verified on-device)
5. `restaurant-menu-page.feature.md` — ✅ implemented (verified on-device)
6. `menu-modal-confirmation.feature.md` — ✅ implemented (success path verified on-device; failure-state path not yet exercised on-device)
7. `order-history-page.feature.md` — ✅ implemented (verified on-device)
8. `order-history-modal.feature.md` — ✅ implemented (verified on-device)

## Screens / Routes (Expo Router file map)

| Route file | Screen | Navigator |
|---|---|---|
| `app/_layout.tsx` | Root layout | Stack (Login vs customer area) |
| `app/index.tsx` | Login | — |
| `app/customer/_layout.tsx` | Customer area | Bottom Tabs (Restaurants, OrderHistory) |
| `app/customer/restaurant/_layout.tsx` | Restaurant tab | nested Stack |
| `app/customer/restaurant/index.tsx` | Restaurant list | — |
| `app/customer/restaurant/[id].tsx` | Restaurant menu | — |
| `app/customer/history.tsx` | Order history | — |

Modals (order confirmation, order detail) are React Native `<Modal>` components
inside their screens, not routes.

## Data and API

**Base URL:** `process.env.EXPO_PUBLIC_URL` (ngrok tunnel to the local Spring
Boot server, set in `.env`). Every request except login sends
`Authorization: Bearer <token>`.

**Response envelope:** all endpoints except `/api/auth` wrap results as
`{ "message": "Success", "data": ... }` — always unwrap `.data`.

| Endpoint | Used by | Notes |
|---|---|---|
| `POST /api/auth` | Login | body `{email, password}` → `{success, accessToken, user_id, customer_id, courier_id}` (no envelope). 401 + `{success:false}` on bad credentials |
| `GET /api/restaurants?rating=&price_range=` | Restaurant list | both query params optional; `rating` 1–5, `price_range` 1–3 |
| `GET /api/restaurants/{id}` | Menu header | name, rating, price_range |
| `GET /api/products?restaurant={id}` | Menu | `[{id, name, description, cost, restaurant_id}]` — `cost` is a whole number of dollars |
| `GET /api/orders?type=customer&id={customer_id}` | Order history | products include `unit_cost`, `total_cost` in cents-free dollars |
| `POST /api/orders` | Order confirmation | body `{restaurant_id, customer_id, products:[{id, quantity}]}` |

**Stored client state:** AsyncStorage holds `accessToken`, `user_id`, and
`customer_id` after login; cleared on Log Out.

## Design System (from provided wireframes + ColorScheme.pdf)

Colors — use these exact values, no others:

| Name | Hex | Usage |
|---|---|---|
| Orange Red | `#DA583B` | Primary buttons (LOG IN, LOG OUT, Create Order, Confirm Order, filter dropdowns), logo accent, restaurant name in detail modal |
| Dark Charcoal | `#222126` | Modal header bars, table header row, stepper +/− buttons, body text |
| Dark Red | `#851919` | Failure X icon |
| Muted Green | `#609475` | Success checkmark icon |
| Warm Yellow | `#F0CB67` | Star ratings |
| White | `#FFFFFF` | Cards, modal bodies, header/footer background |

Fonts (both bundled, so they render identically on iOS and Android):
**Oswald_700Bold** (`@expo-google-fonts/oswald`) for headings/section titles
(NEARBY RESTAURANTS, RESTAURANT MENU, MY ORDERS — uppercase); **Arimo**
(`@expo-google-fonts/arimo`, the open Arial-equivalent, 400/700) for all body
text, applied by default through `components/AppText.tsx` — always import
`AppText as Text` instead of react-native's `Text`. Font loading in
`app/_layout.tsx` is deliberately **non-blocking** (no `fontsLoaded` render
gate — a stalled font fetch must not blank the app). Overflowing content must
scroll.

## Tech Stack and Constraints

- Expo SDK **54** (matches installed Expo Go), TypeScript, Expo Router (file-based)
- AsyncStorage for persistence; **fetch API** for HTTP (no axios)
- FontAwesome (`@fortawesome/react-native-fontawesome`) for icons
- react-native-reanimated available; React Bootstrap installed to satisfy module
  constraints (web-oriented — native UI is built with core RN components)
- ⚠️ **react-native-dotenv is installed but its babel plugin must NEVER be
  configured** — it breaks Expo Router's route discovery (the app renders the
  "no routes" onboarding screen). There must be no custom `babel.config.js`.
  Env vars are read via Expo's built-in `EXPO_PUBLIC_*` inlining instead.
- All restaurant menus use the same static image `assets/images/RestaurantMenu.jpg`;
  restaurant cards pick images from `assets/images/restaurants/`
- Must run on **both iOS and Android** via Expo Go

## Repository Structure

- `app/` — Expo Router screens (see route map above)
- `components/` — shared UI (header, cards, modals, steppers)
- `constants/` — colors, shared styles
- `hooks/` — custom hooks (e.g. auth/session helpers)
- `assets/images/` — provided images (`restaurants/`, `RestaurantMenu.jpg`, logos)
- `ai/` — this spec + feature specs
- `src/`, `pom.xml` — Module 12 Java API (do not modify)
- `start-backend.sh` — starts the API using `DB_PASSWORD` from `.env`
- `check-services.sh` — reports MySQL / backend / tunnel status in one shot

## Rules for the AI

1. Read this file and the relevant feature spec before writing any code.
2. Do not add features, screens, fields, or dependencies not listed here.
3. Match the wireframes and the six colors exactly — no improvised styling.
4. Junior-friendly code: functional components + hooks, no advanced patterns.
5. Reuse existing components/files before creating new ones.
6. All fetches go through `process.env.EXPO_PUBLIC_URL` with the Bearer token
   (except login). Never hardcode the tunnel URL.
7. Never modify anything under `src/` (Java back-end) or commit credentials.
8. Follow the commit convention (`<type>(scope): summary`) and the branching
   model: `feature/*` from `dev`, merged back into `dev`. No direct commits to `main`.
9. Never commit the submission summary document — it is submitted through the
   platform only.
10. Each feature spec must exist in `./ai/features/` **before** its feature is
    implemented, and implementation must follow it together with this file.

## How to Run / Test

1. Set `DB_PASSWORD` in `.env` (once), then start the API with
   `./start-backend.sh` — it reads the password from `.env` and passes it to
   Spring Boot, so it is never typed on the command line or hardcoded. Do
   **not** run `./mvnw spring-boot:run` directly — without the env override it
   silently falls back to the broken `root`/blank-password default in
   `application.properties` and fails to start.
2. Start the tunnel: `ngrok http 8080` → put the URL in `.env` as
   `EXPO_PUBLIC_URL`. With an authenticated account and its reserved static
   domain, this URL is stable across restarts — `.env` should only need
   setting once. If the URL ever does change, update `.env` and the Postman
   collection's `base_url`, then restart Metro (`EXPO_PUBLIC_*` values are
   baked into the bundle at build time).
3. Run `./check-services.sh` at any point to confirm MySQL, the backend, and
   the tunnel are all up and actually reachable (not just that the process
   exists) before assuming a bug is in the app code.
4. `npx expo start --tunnel` → scan QR with Expo Go (primary target is a
   physical phone; `--tunnel` is required under WSL2 because Metro's LAN
   address is unreachable from the phone)
5. Verify with `npx tsc --noEmit` and the Postman collection
   (`PostmanCollection.json`) before committing.
6. Verifying a feature means checking its **rendered output on a device (or the
   served web page)** — a successful bundle/typecheck alone does not prove the
   screen works.
7. ⚠️ **Do NOT run `npx expo export` while `npx expo start` is running.** They
   share the same project's Metro cache / `.expo/` state, and running an export
   against a live dev server can destabilize or kill the running Metro process.
   Use `npx tsc --noEmit` for compile-level checks and the on-device render for
   behavior — `expo export` is not needed for routine verification.

### Tunnel operational notes (WSL2)

- Two ngrok tunnels run at once and coexist fine: the **API tunnel**
  (`~/.local/bin/ngrok http 8080`, config `~/.ngrok2/ngrok.yml`) and Metro's
  **`--tunnel`** (via `@expo/ngrok`, config `~/.expo/ngrok.yml`). This is
  expected — it is not a session-limit conflict.
- If the Metro process dies but its tunnel agent lingers, restarting
  `expo start --tunnel` fails with **`ERR_NGROK_334` ("endpoint already
  online")**. Fix: kill the orphaned `@expo/ngrok .../ngrok start --none`
  process **only** — never kill the `~/.local/bin/ngrok http 8080` API tunnel.
- After killing a tunnel agent, a retry can briefly fail with **"session
  closed"** while ngrok's cloud side releases the session. Wait ~60s and retry;
  do not start editing ngrok config files in response to this.

## Definition of Done (project-wide)

- [ ] Every screen matches its wireframe and uses only the six palette colors
- [ ] Header/footer visible everywhere except Login; Log Out returns to Login
- [ ] Quantities: start at 0, never negative, buttons only, reset on restaurant
      change; Create Order disabled while all quantities are 0
- [ ] All API calls authenticated via token from AsyncStorage; app works through
      the ngrok tunnel on a physical device (iOS and Android)
- [ ] Prices display as standard currency (e.g. `$20.95`)
- [ ] `npx tsc --noEmit` passes; app runs in Expo Go without errors
- [ ] Work merged feature → dev with convention-compliant commits
- [ ] Before submission: all feature branches merged into `dev`, then `dev`
      merged into `main` — only `main` is graded, and its history must show the
      feature → dev → main workflow

## Final Wireframe Verification (run once ALL features are complete)

These are graded line-items. After the last feature is merged, open every screen
side-by-side with `Requirements/support_materials_13/Design/Wireframe.pdf` on a
physical device and check each row off. Do not submit until all seven pass.

- [ ] **Color Consistency** — every color in the app is one of the six exact
      values below; no off-palette color anywhere:
      1. Orange Red — `rgba(218, 88, 59, 1)` / `#DA583B`
      2. Dark Charcoal — `rgba(33, 33, 38, 1)` / `#222126`
      3. Dark Red — `rgba(132, 25, 25, 1)` / `#851919`
      4. Muted Green — `rgba(96, 148, 116, 1)` / `#609475`
      5. Warm Yellow / Mustard — `rgba(240, 203, 103, 1)` / `#F0CB67`
      6. White — `rgba(255, 255, 255, 1)` / `#FFFFFF`
- [ ] **Login Page** matches the provided wireframe
- [ ] **Restaurants Page** matches the provided wireframe (with and without filters)
- [ ] **Restaurant Menu Page** matches the provided wireframe
- [ ] **Order Confirmation Modal** follows the provided wireframe
      (default, processing, success, and failure states)
- [ ] **Order History Page** matches the provided wireframe
- [ ] **Order History Detail Modal** matches the provided wireframe
