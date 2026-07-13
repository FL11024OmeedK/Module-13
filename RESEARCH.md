# Background Research — Module 13 (Mobile Development 1)

## Native vs Cross-Platform Mobile Applications

**Native applications** are made for a specific operating system using that
platform's languages and development tools. For example, iOS apps are usually
built with Swift or Objective-C in Xcode, while Android apps use Kotlin or Java
in Android Studio. This gives developers direct access to device features,
strong performance, and interface elements that feel familiar to users of each
platform. The downside is the extra work involved. Supporting both iOS and
Android usually means maintaining separate codebases and build processes, and
sometimes even separate development teams.

**Cross-platform applications** use one shared codebase to run on both iOS and
Android. Frameworks such as React Native and Flutter make this possible by
handling the differences between the two platforms. Developers write shared
code in JavaScript or TypeScript with React Native, or in Dart with Flutter.
React Native connects that code to native interface components, while Flutter
draws its own interface. A shared codebase can reduce development and
maintenance work while making it easier to keep features consistent across
platforms. However, there can still be some performance overhead, developers
must wait for the framework to support new operating-system features, and more
advanced features may require platform-specific code.

For Rocket Food Delivery, a cross-platform approach makes the most sense. One
team can build a consistent experience for iPhone and Android users at the same
time, which is especially useful when working with a short timeline. This is
the kind of project that Expo and React Native are well suited for.

## React Native vs React

**React** is a JavaScript library used to build interfaces for the **web**. Its
components produce HTML elements such as `<div>`, `<p>`, and `<button>`, which
are styled with CSS and displayed in a browser.

**React Native** brings the same component-based approach to **native mobile
apps**. Instead of rendering HTML elements, its components render native
interface elements. For example, `<View>` serves a similar purpose to an
Android `ViewGroup` or an iOS `UIView`, while `<Text>` displays native text.
React Native does not rely on HTML or a browser. Styles are written as
JavaScript objects, often with `StyleSheet.create`, and navigation can be
handled with tools such as Expo Router rather than links between web pages.

The two technologies still share the same main ideas. Both use JavaScript or
TypeScript, reusable components, props, hooks such as `useState` and
`useEffect`, and one-way data flow. Because of this, someone who already knows
React will find much of React Native familiar. The biggest differences are the
elements being rendered, the way styles are written, and the environment in
which the app runs. React runs in a browser, while React Native runs on a
mobile operating system through a JavaScript engine such as Hermes.

In short, **React provides the shared way of thinking about components and
state. React DOM brings that model to browsers, while React Native brings it to
iOS and Android.**
