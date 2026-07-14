# Rocket Food Delivery — Customer Mobile App

Cross-platform mobile app (React Native + Expo) for the Rocket Food Delivery service, built as Module 13 of the CodeBoxx Full-Stack Development Program.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Author](#author)
- [License](#license)

## Project Description

Rocket Food Delivery is a food-ordering service. This repository contains its **customer-facing mobile application**, which lets customers:

1. Log in to their account (JWT authentication)
2. Browse restaurants and filter them by rating and price range
3. View a restaurant's menu and select item quantities
4. Place orders and receive success/failure confirmation
5. Review their order history with full details

The app is built from a bare Expo project and consumes the existing **Spring Boot REST API** from Module 12 (also included in this repository under `src/`). Because the API runs on a local machine, an **ngrok tunnel** exposes it so a physical phone can reach it.

> **Status:** the mobile app is in active development. Project setup, dependencies, assets, the API/tunnel connection, the three-level navigation structure (root Stack → customer Tabs → restaurant Stack), the shared header/footer, and the Login page (JWT auth via the ngrok tunnel) are complete and verified on-device. The remaining feature screens (Restaurants, Menu, Order History) are being built feature-branch by feature-branch, each with its own spec in `ai/features/`.

## Features

- 🔐 JWT login with credentials persisted via AsyncStorage
- 🍽️ Restaurant browsing with rating and price-range filters
- 🧾 Restaurant menus with stepper-controlled item quantities
- 📦 Order creation with a confirmation modal and success/failure feedback
- 📜 Order history with a full-detail modal (products, prices, status, courier)
- 📱 Runs on both iOS and Android through Expo

## Tech Stack

**Mobile app (this module):**
- **Framework:** React Native 0.81 + Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Expo Router 6 (file-based routing; React Navigation under the hood)
- **Storage:** AsyncStorage (persists the JWT token)
- **UI / Icons:** React Bootstrap, FontAwesome (`@fortawesome/react-native-fontawesome`)
- **Animation:** react-native-reanimated
- **Env config:** Expo's built-in `EXPO_PUBLIC_*` variable inlining (react-native-dotenv is installed per module constraints, but its babel plugin is not loaded — it breaks Expo Router's route discovery)
- **Tunneling:** ngrok (v3)

**Back-end (consumed as-is from Module 12):**
- **Language/Framework:** Java 17, Spring Boot 3.5
- **Security:** Spring Security + JWT
- **Database:** MySQL 8 (Spring Data JPA / Hibernate)
- **Build:** Maven (wrapper included)

## Project Structure

```
Module13/
├── app/                  # Expo Router screens (file-based routes)
│   ├── _layout.tsx       # Root Stack navigator
│   ├── index.tsx         # Login screen (entry route)
│   └── customer/
│       ├── _layout.tsx   # Bottom Tabs (Restaurants, OrderHistory)
│       ├── history.tsx   # Order history screen
│       └── restaurant/
│           ├── _layout.tsx   # Nested Stack (list ↔ menu)
│           ├── index.tsx     # Restaurant list screen
│           └── [id].tsx      # Restaurant menu screen
├── ai/                   # AI specification documents
│   ├── ai-spec.md        # Global AI spec (read first)
│   └── features/         # One spec per feature
├── assets/
│   └── images/
│       ├── restaurants/  # Provided restaurant card images
│       ├── RestaurantMenu.jpg  # Static image used by all menus
│       └── AppLogoV*.png / AppIcon.png
├── components/           # Shared React Native components (Header, ...)
├── constants/            # App-wide constants (colors.ts palette)
├── hooks/                # Custom React hooks
├── src/                  # Java Spring Boot REST API (Module 12)
│   ├── main/java/com/rocketFoodDelivery/rocketFood/
│   │   ├── controller/api/   # REST controllers
│   │   ├── models/ repository/ service/ dtos/
│   │   └── security/         # JWT filter, SecurityConfig
│   └── main/resources/application.properties
├── app.json              # Expo configuration
├── package.json          # Mobile app dependencies
├── pom.xml               # Back-end dependencies (Maven)
├── PostmanCollection.json  # Pre-configured API requests
├── start-backend.sh       # Starts the Spring Boot API using .env credentials
├── check-services.sh      # Reports MySQL / backend / tunnel status
└── .env.example          # Template for required env vars
```

## Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Java 17+ ([Download via SDKMAN](https://sdkman.io/) or [Adoptium](https://adoptium.net/))
- MySQL 8+ ([Download](https://dev.mysql.com/downloads/))
- Git ([Download](https://git-scm.com/downloads))
- [ngrok](https://ngrok.com/) account (free tier) — exposes the local server to your phone
- **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

## Installation / Setup

### 1. Clone and install

```bash
git clone git@github.com:FL11024OmeedK/Module-13.git
cd Module-13
npm install
```

### 2. Database

Make sure MySQL is running first (it normally starts automatically with the
system; if not: `sudo systemctl start mysql`).

```sql
-- In a MySQL session:
CREATE DATABASE IF NOT EXISTS rdelivery;
CREATE USER 'rdelivery_app'@'localhost' IDENTIFIED BY '<your-password>';
GRANT ALL PRIVILEGES ON rdelivery.* TO 'rdelivery_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Start the back-end

```bash
cp .env.example .env
# Edit .env: set DB_PASSWORD to the password you chose in step 2

./start-backend.sh
```

`start-backend.sh` reads `DB_PASSWORD` from `.env` and passes it to Spring Boot
as `SPRING_DATASOURCE_PASSWORD`, so the real password is never typed on the
command line or written into `application.properties`. The API starts on
`http://localhost:8080` and seeds the database on first run (seeding is
skipped automatically if data already exists).

At any point, run `./check-services.sh` to check whether MySQL, the backend,
and the ngrok tunnel (step 4) are all up and actually reachable.

### 4. Start the ngrok tunnel

```bash
ngrok config add-authtoken <your-ngrok-authtoken>   # first time only
ngrok http 8080
```

Copy the public `https://….ngrok-free.dev` URL that ngrok prints. Every
authenticated free ngrok account gets one reserved **static domain**, so this
URL stays the same across restarts — check
[the ngrok dashboard](https://dashboard.ngrok.com/domains) for your assigned
domain, and optionally pin it explicitly so it never depends on ngrok's
default behavior:
```bash
ngrok http --domain=<your-static-domain>.ngrok-free.dev 8080
```

### 5. Configure and start the mobile app

```bash
# Edit .env (created in step 3) and set EXPO_PUBLIC_URL to your ngrok URL

npx expo start --tunnel
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

> **Why `--tunnel`?** Under WSL2 (and some networks), Metro binds to an address
> your phone can't reach. Tunnel mode serves the bundle through a public URL so
> any device can connect. On a plain LAN setup, `npx expo start` alone may work.

> **Note:** with an authenticated ngrok account and a reserved static domain (see step 4), this URL stays the same across restarts — `.env` should only need updating once. If you ever use an *unauthenticated* or unclaimed ngrok session instead, the URL would rotate on every restart, requiring updates to both `.env` (`EXPO_PUBLIC_URL`) and the Postman collection's `base_url`, plus a Metro restart — `EXPO_PUBLIC_*` values are baked into the JS bundle at build time, so a running app won't pick up `.env` changes until Expo is restarted.

**Seeded dev login** (created by the back-end seeder, for local development only):
`customer@gmail.com` / `password`

## Environment Variables

Both the mobile app and the back-end read from a single `.env` at the project
root (never committed; see `.env.example` for the template):

```env
# Public base URL of the back-end API (your ngrok tunnel) — read by Expo
EXPO_PUBLIC_URL=https://your-subdomain.ngrok-free.app

# rdelivery_app MySQL password — read by start-backend.sh, passed to Spring
# Boot as SPRING_DATASOURCE_PASSWORD (username is hardcoded to rdelivery_app
# in the script, since that's the only local dev user this project uses)
DB_PASSWORD=your_rdelivery_app_mysql_password
```

All other back-end configuration lives in `src/main/resources/application.properties`.

> ⚠️ Never commit real credentials. `.env` is gitignored, and the database
> password is only ever read from it at launch by `start-backend.sh` — it is
> never written into `application.properties` or typed on the command line.

## API Documentation

The mobile app authenticates once, stores the JWT in AsyncStorage, and sends it as a `Authorization: Bearer <token>` header on every request. All `/api/**` routes except `/api/auth` require the token.

Endpoints used by the mobile app:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth` | Authenticate (email + password) → JWT, user/customer ids |
| `GET` | `/api/restaurants` | List restaurants; optional `?rating=` and `?price_range=` filters |
| `GET` | `/api/restaurants/{id}` | Restaurant details with rating |
| `GET` | `/api/products` | List menu products |
| `GET` | `/api/orders` | List orders (by customer) |
| `POST` | `/api/orders` | Create a new order |

The full API also exposes CRUD endpoints for users, customers, couriers, employees, addresses, product-orders, and order/courier statuses. A Postman collection covering all module endpoints is available at [`PostmanCollection.json`](PostmanCollection.json) in the project root — run its *Authenticate* request first (the JWT is captured into a collection variable automatically).

## Tests

**Back-end** — integration tests cover every API controller (`Auth`, `Restaurant`, `Order`, `Product`, `Courier`, `Customer`, `Employee`, `User`, `Address`, `OrderStatus`, `CourierStatus`, `ProductOrder`):

```bash
./mvnw test
```

**Mobile app** — no automated test suite exists yet for this module; screens are verified manually on-device against the provided wireframes and through the Postman collection.

## Author

**Omeed Kashef**
- GitHub: [@FL11024OmeedK](https://github.com/FL11024OmeedK)
- LinkedIn: [linkedin.com/in/omeedkashef](https://www.linkedin.com/in/omeedkashef/)
- Email: omeedkashef@gmail.com

## License

Educational project built for the CodeBoxx Full-Stack Development Program (Module 13). Not licensed for redistribution.
