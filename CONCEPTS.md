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

Expo Router screen focus vs. component mount/unmount lifecycle

**🎯 Purpose:**

The Restaurant Menu screen must reset every item's quantity to 0 whenever
the customer switches to a different restaurant (a graded requirement).
The natural instinct is to rely on `useState`'s initial value resetting
automatically whenever the screen "restarts" for a new restaurant.

**❓ Why it was challenging:**

My first implementation used `useEffect(() => setQuantities({}), [id])`,
assuming that navigating to a different restaurant's menu (a different
`[id]` route param) always causes React to fully unmount and remount the
screen component, which would naturally reset local state anyway. That
assumption is wrong for Expo Router (built on React Navigation): a Stack
navigator can keep a previously-visited screen instance alive in memory
so that going "back" to it restores scroll position and other UI state
instead of rebuilding it from scratch. In that case, an effect keyed only
on `id` does not re-fire when you return to a restaurant you'd already
visited, since — from that specific screen instance's point of view — its
`id` never changed. This meant quantities set on Restaurant A could
silently survive a trip to Restaurant B and back, which is exactly the
bug the requirement exists to prevent, and it would not have shown up in
a quick test that only opened one new restaurant at a time. The fix was
to switch from a mount-based effect to a focus-based one
(`useFocusEffect`), which fires every time the screen becomes the active
one on screen — covering first visits, new restaurants, and returning to
an already-visited restaurant — regardless of whether the underlying
component instance was actually recreated.

**📍 Where (file & line):**

`app/customer/restaurant/[id].tsx`, lines 40–47 (the `useFocusEffect` call)

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
