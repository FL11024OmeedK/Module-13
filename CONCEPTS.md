# Module 13 – Mobile Development 1 (React Native / Expo)

## 🎯 Purpose

List of three challenging concepts applied in this project.

## 📝 How to Use the CONCEPTS.md Log

> 1. Write the **`🔤 Name`** of the concept you found challenging.
> 2. Describe its **`🎯 Purpose`** within the project.
> 3. Explain in your own words **`❓ Why`** it was challenging
> 4. If applicable, indicate **`📍 Where`** it was used in your project (file name and line number).

---

## ✏️ Concept - 01

**🔤 Name:**

Lifting state above a screen's mount/unmount lifecycle (React Context)

**🎯 Purpose:**

The Restaurant Menu screen must reset every item's quantity to 0 the
moment the customer opens a different restaurant — quantities set on one
restaurant must never leak into another one's menu.

**❓ Why it was challenging:**

My first attempt kept `quantities` as local `useState` inside the menu
screen and reset it with `useEffect(() => setQuantities({}), [id])`,
assuming a different restaurant id always means a fresh mount. Expo Router
(built on React Navigation) doesn't guarantee that: a Stack can preserve a
previously-visited screen, so the effect didn't reliably fire on return
visits, and quantities from one restaurant could survive underneath
another. Switching to `useFocusEffect` (reset on every focus, not just id
change) closed that gap, but the deeper issue was that *local* component
state is inherently destroyed whenever the screen unmounts — which
happens on every back-navigation by default — so relying on effect timing
inside the screen itself was always going to be fragile, regardless of
which hook triggered the reset. The actual fix was to lift the quantities
out of the screen entirely into a `CartContext` living above it, holding a
single "active restaurant" id and its quantities. Whenever a menu screen
requests a *different* restaurant than the one currently active, the
context clears the quantities immediately as part of making the switch —
so the reset is guaranteed by the context's own logic, independent of
whatever Expo Router does with the screen's mount/unmount/focus lifecycle
underneath it.

**📍 Where (file & line):**

`contexts/CartContext.tsx` (the provider); used in
`app/customer/restaurant/[id].tsx`, lines 36–37 (`useCart()` /
`getQuantities`) and lines 63–64 (`increment`/`decrement`)

---

## ✏️ Concept - 02

**🔤 Name:**

JWT bearer-token authentication with AsyncStorage

**🎯 Purpose:**

The whole app runs on token-based auth against the Spring Boot API: logging
in exchanges an email/password for a JWT, and every protected request
afterward (restaurants, products, orders) must present that token in an
`Authorization: Bearer <token>` header or the server answers 401/403. The
token — plus `user_id` and `customer_id` — has to survive across screens, so
it is persisted in AsyncStorage at login and wiped again at logout.

**❓ Why it was challenging:**

Coming from browser development, my instinct was that "being logged in" is
something the server remembers (a session cookie sent automatically). JWT
flips that: the server remembers nothing, and the *client* is responsible for
storing the proof of identity and attaching it to every single request
manually. That responsibility spreads across the whole app — the login screen
stores the token, three different screens read it back before fetching, and
the header's Log Out must clear it — so there is no one place where "auth"
lives. The async nature added traps: AsyncStorage reads return promises, so
every fetch has to `await` the token first (forgetting this sends
`Bearer null` and produces a confusing 403 rather than an obvious error), and
non-string values like `customer_id` must be explicitly converted, since
AsyncStorage only stores strings. Testing also required understanding that a
403 from the API can mean "valid app, missing/expired token" rather than a
bug in the endpoint — early on I had to learn to read 401/403 responses as
part of the normal auth flow instead of as failures.

**📍 Where (file & line):**

`app/index.tsx` line 38 (`AsyncStorage.multiSet` storing the token at login);
`components/Header.tsx` line 10 (`multiRemove` on Log Out);
`app/customer/restaurant/index.tsx` line 50 and `app/customer/history.tsx`
line 49 (Bearer header on authenticated fetches)

---

## ✏️ Concept - 03

**🔤 Name:**

Derived state instead of stored state

**🎯 Purpose:**

On the Restaurant Menu screen, several things depend on the item quantities
at once: the Create Order button must be disabled while every quantity is 0,
the confirmation modal must list exactly the items with a quantity above 0,
and the total must be the sum of those items' line prices. All three are
graded behaviors, and all three must always agree with the quantities and
with each other.

**❓ Why it was challenging:**

My first instinct was to give each of these its own state — a
`useState` for whether the button is disabled, another for the selected
items, another for the total — and update them inside the +/− button
handlers. The problem with that design is synchronization: every stored
copy of information that can be computed from other state is a chance for
the copies to drift apart. If quantities reset when switching restaurants
(which they do, via the cart context) but a separately-stored `disabled`
flag isn't reset in the same code path, the button stays enabled with an
empty cart — a bug that only appears through a specific navigation
sequence. The fix was a mindset shift: store only the *source of truth*
(the quantities map) and **derive** everything else from it during render —
`hasAnyQuantity` with `.some()`, `selectedItems` with `.filter().map()`,
and `total` with `.reduce()`. These are plain `const` calculations, not
state, so they can never be stale: any change to quantities re-renders the
component and every derived value is recomputed from scratch. Understanding
why this is safe (and cheap) required getting comfortable with React's
render model — the component function re-runs on every state change, so
recomputing three small array operations per render costs almost nothing
and eliminates an entire class of synchronization bugs.

**📍 Where (file & line):**

`app/customer/restaurant/[id].tsx` lines 63–69 (`hasAnyQuantity`,
`selectedItems`, `total` — all derived from the `quantities` map, none
stored in their own state)

---
