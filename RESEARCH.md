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

---

## Extra Mile — Using Twilio Credentials in a Java Backend

![Twilio account proof](screenshots/twilio-account.png)

Twilio provides SMS through a Java SDK. This project's Spring Boot backend
already integrates it (see `service/NotificationService.java`); the steps below
describe how the credentials flow through a Java backend in general, using this
project as the concrete example.

**1. Get the credentials.** After creating a Twilio account, the Console
dashboard shows an **Account SID** (public identifier) and an **Auth Token**
(secret). A trial account also provides a **Twilio phone number** to send from.

**2. Add the SDK dependency.** In `pom.xml`:

```xml
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>11.3.5</version>
</dependency>
```

**3. Expose the credentials as configuration properties.**
`application.properties` declares placeholder keys — the real values are
supplied at runtime (see the security note below), never committed:

```properties
twilio.account-sid=your-twilio-account-sid
twilio.auth-token=your-twilio-auth-token
twilio.from-number=+1XXXXXXXXXX
```

Spring injects them into the service with `@Value("${twilio.account-sid:}")`
(the trailing `:` makes them default to empty so the app still boots without
credentials — the service just skips sending).

**4. Initialize the SDK once at startup.** `NotificationService` does this in a
`@PostConstruct` method: `Twilio.init(twilioAccountSid, twilioAuthToken);`,
guarded by a blank-check so missing credentials disable SMS instead of
crashing the app.

**5. Send a message.** One call:

```java
Message.creator(
    new PhoneNumber(toPhone),          // recipient (E.164, e.g. +15551234567)
    new PhoneNumber(twilioFromNumber), // your Twilio number
    body                               // the SMS text
).create();
```

In this project that runs when an order is created with `send_sms` enabled,
inside a try/catch that logs failures rather than failing the order.

**Trial limitation:** a free Twilio account can only send SMS to phone numbers
you have verified in the Console (e.g. your own).

## Extra Mile — Using Notify.EU Credentials in a Java Backend

![Notify.EU account proof](screenshots/notify-account.png)

Notify.eu is a notification platform that sends templated email through a REST
API, so no SDK is needed — any Java HTTP client works. This backend uses
Spring's `RestTemplate` (see `service/NotificationService.java`).

**1. Get the credentials.** The Notify.eu dashboard provides a **Client ID**
and a **Secret Key**. You also configure an **SMTP channel** (for Gmail: a
16-character App Password with 2-Step Verification, `smtp.gmail.com:587` — the
full steps are documented in this repo's `application.properties` comments)
and create a **message template**, whose *notification type name* identifies
which template a request should use.

**2. Expose them as configuration properties**, same pattern as Twilio:

```properties
notify.api-url=https://api.notify.eu/notification/send
notify.client-id=your-notify-client-id
notify.secret-key=your-notify-secret-key
notify.template-id=your-template-notification-type-name
notify.language=en
```

**3. Authenticate with HTTP headers.** Notify.eu expects the credentials on
every request as headers, not in the body:

```java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
headers.set("X-ClientId", notifyClientId);
headers.set("X-SecretKey", notifySecretKey);
```

**4. POST a JSON message.** The body names the template
(`notificationType`), the language, the template parameters (this project
passes `firstName`, `order_id`, `restaurant_name`, `order_total_cost`), and
the transport with recipients:

```java
HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
restTemplate.postForEntity(notifyApiUrl, request, String.class);
```

Notify.eu merges the params into the template and delivers it through the
configured SMTP channel. As with SMS, the call is wrapped in try/catch and
skipped entirely when credentials are blank.

### Security note (applies to both services)

Real credentials are **never committed**. `application.properties` keeps
placeholder values only; actual secrets are supplied at runtime as environment
variables, the same pattern this project uses for the database password. With
Spring's relaxed binding, kebab-case properties map to env vars with the
dashes removed — e.g. `twilio.account-sid` ← `TWILIO_ACCOUNTSID`. Because
`start-backend.sh` sources `.env` before launching Spring Boot, adding lines
like `TWILIO_ACCOUNTSID=...` / `NOTIFY_SECRETKEY=...` to the (gitignored)
`.env` file is all that's needed.
