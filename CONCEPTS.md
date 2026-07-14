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

...

**🎯 Purpose:**

...

**❓ Why it was challenging:**

...

**📍 Where (file & line):**

...

---

## ✏️ Concept - 03

**🔤 Name:**

...

**🎯 Purpose:**

...

**❓ Why it was challenging:**

...

**📍 Where (file & line):**

...

---
