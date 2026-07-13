# Rocket Food Delivery — Customer Mobile App

Cross-platform mobile app (React Native + Expo) for the Rocket Food Delivery service, built as Module 13 of the CodeBoxx Full-Stack Development Program.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Author](#author)

## Project Description

Rocket Food Delivery is a food-ordering service. This repository contains its **customer-facing mobile application**, which lets customers:

1. Log in to their account (JWT authentication)
2. Browse restaurants and filter them by rating and price range
3. View a restaurant's menu and select item quantities
4. Place orders and receive success/failure confirmation
5. Review their order history with full details

The app is built from a bare Expo project and consumes the existing **Spring Boot REST API** from Module 12 (also included in this repository under `src/`). Because the API runs on a local machine, an **ngrok tunnel** exposes it so a physical phone can reach it.

> **Status:** the mobile app is in active development. Project setup, dependencies, assets, and the API/tunnel connection are complete and verified; the navigation structure and feature screens (Login, Restaurants, Menu, Order History) are being built feature-branch by feature-branch.

## Tech Stack

**Mobile app (this module):**
- **Framework:** React Native 0.81 + Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Expo Router 6 (file-based routing; React Navigation under the hood)
- **Storage:** AsyncStorage (persists the JWT token)
- **UI / Icons:** React Bootstrap, FontAwesome (`@fortawesome/react-native-fontawesome`)
- **Animation:** react-native-reanimated
- **Env config:** Expo `EXPO_PUBLIC_*` variables + react-native-dotenv
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
│   └── index.tsx         # Login screen (entry route)
├── assets/
│   └── images/
│       ├── restaurants/  # Provided restaurant card images
│       ├── RestaurantMenu.jpg  # Static image used by all menus
│       └── AppLogoV*.png / AppIcon.png
├── components/           # Shared React Native components
├── constants/            # App-wide constants (colors, etc.)
├── hooks/                # Custom React hooks
├── src/                  # Java Spring Boot REST API (Module 12)
│   ├── main/java/com/rocketFoodDelivery/rocketFood/
│   │   ├── controller/api/   # REST controllers
│   │   ├── models/ repository/ service/ dtos/
│   │   └── security/         # JWT filter, SecurityConfig
│   └── main/resources/application.properties
├── app.json              # Expo configuration
├── babel.config.js       # Babel (react-native-dotenv plugin)
├── package.json          # Mobile app dependencies
├── pom.xml               # Back-end dependencies (Maven)
└── .env.example          # Template for required env vars
```

## Installation / Setup

Prerequisites: Node.js 20+, Java 17+, MySQL 8+, an [ngrok](https://ngrok.com/) account (free tier), and the **Expo Go** app on your phone.

### 1. Clone and install

```bash
git clone git@github.com:FL11024OmeedK/Module-13.git
cd Module-13
npm install
```

### 2. Database

```sql
-- In a MySQL session:
CREATE DATABASE IF NOT EXISTS rdelivery;
CREATE USER 'rdelivery_app'@'localhost' IDENTIFIED BY '<your-password>';
GRANT ALL PRIVILEGES ON rdelivery.* TO 'rdelivery_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Start the back-end

Credentials are passed as environment variables so they never live in a committed file:

```bash
SPRING_DATASOURCE_USERNAME=rdelivery_app \
SPRING_DATASOURCE_PASSWORD=<your-password> \
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080` and seeds the database on first run (seeding is skipped automatically if data already exists).

### 4. Start the ngrok tunnel

```bash
ngrok config add-authtoken <your-ngrok-authtoken>   # first time only
ngrok http 8080
```

Copy the public `https://….ngrok-free.dev` URL that ngrok prints.

### 5. Configure and start the mobile app

```bash
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_URL to your ngrok URL

npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

> **Note:** the free ngrok URL changes every time the tunnel restarts — update `.env` and restart Expo when it does.

**Seeded dev login** (created by the back-end seeder, for local development only):
`customer@gmail.com` / `password`

## Environment Variables

Mobile app — set in `.env` at the project root (never committed; see `.env.example`):

```env
# Public base URL of the back-end API (your ngrok tunnel)
EXPO_PUBLIC_URL=https://your-subdomain.ngrok-free.app
```

Back-end — passed on the command line when starting the server (see step 3 above):

```env
SPRING_DATASOURCE_USERNAME=rdelivery_app
SPRING_DATASOURCE_PASSWORD=<your-password>
```

All other back-end configuration lives in `src/main/resources/application.properties`.

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

The full API also exposes CRUD endpoints for users, customers, couriers, employees, addresses, product-orders, and order/courier statuses. A Postman collection covering all module endpoints will be exported to `PostmanCollection.json` at the project root.

## Author

**Omeed Kashef**
- GitHub: [@FL11024OmeedK](https://github.com/FL11024OmeedK)
- LinkedIn: [linkedin.com/in/omeedkashef](https://www.linkedin.com/in/omeedkashef/)
- Email: omeedkashef@gmail.com
