# Pizza Order Builder

This project establishes the reproducible scaffolding for a complete Pizza Order Builder application. It sets up NestJS, Next.js, and PostgreSQL using a simple monorepo structure orchestrated via Docker Compose.

## Project Structure
```
pizza-order-builder/
├── apps/
│   ├── api/             # NestJS API Backend
│   └── web/             # Next.js Web Frontend
├── docker-compose.yml   # Docker Orchestration Configuration
├── package.json         # Workspace Scripts Runner
├── .env.example         # Environment Variable Template
├── AGENTS.md            # AI Tools Work Instructions
└── README.md            # Development Documentation
```

## Stack Freeze
* **Frontend**: Next.js, TypeScript, Tailwind CSS v4, PostCSS.
* **Backend**: NestJS, TypeScript (strict: true), Passport, JWT.
* **Persistence**: PostgreSQL 16, Sequelize, Sequelize-TypeScript, Sequelize-CLI.
* **Infrastructure**: Docker, Docker Compose.

---

## Local Setup

### Quick Start (Docker only)

A fresh clone requires only Docker — no local Node.js/npm needed.

```bash
git clone <repo-url> pizza-order
cd pizza-order

# 1. Create your environment file
cp .env.example .env

# 2. Build and start the stack (PostgreSQL, API, Web) in the background
docker compose up -d --build

# 3. Apply database migrations
docker compose exec api npm run db:migrate

# 4. Load the seed data (demo accounts + catalog)
docker compose exec api npm run db:seed

# 5. Done — open the app
#    Web client:      http://localhost:3001
#    API entry point: http://localhost:3000/api
#    Swagger docs:    http://localhost:3000/api/docs
```

The `db:migrate` and `db:seed` commands compile and run inside the `api` container, so nothing is installed on your host machine. Re-run them any time you pull fresh changes that add migrations or seeders.

### Prerequisites
* Docker and Docker Compose installed.
* Node.js (v18 or higher) and npm installed locally (only needed for host-side commands below).

### Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Ensure you customize the database passwords or port binds if necessary.

### Start the Scaffolding
Start the complete stack:
```bash
npm run dev
```
To force-rebuild the containers, run:
```bash
npm run dev:build
```
After starting, apply migrations and seed data (if you prefer host-side npm instead of the container commands above):
```bash
npm run db:migrate
npm run db:seed
```

### Stopped Stack & Resetting DB Volumes
To stop all containers:
```bash
npm run down
```
To reset database storage completely (deleting persistent volume data):
```bash
npm run down:clean
```

---

## Demo Accounts (Pre-Seeded)

The database includes three pre-configured demo user accounts created via `npm run db:seed`:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `Customer123!` | Customer role for pizza ordering & account management |
| **Customer** | `customer2@example.com` | `Customer123!` | Second customer for testing unique per-user ordering history |
| **Employee** | `employee@example.com` | `Employee123!` | Employee role for kitchen & order fulfillment management |

You can log in using either credential set on the Web Client ([http://localhost:3001/login](http://localhost:3001/login)) or directly via the API authentication endpoints.

---

## Data Model Overview

The schema is managed exclusively through migrations (`apps/api/database/migrations`) and uses PostgreSQL. Row-level security is enabled on the tables that hold user-owned data (`custom_pizzas`, `custom_pizza_toppings`, `orders`).

```
┌──────────┐  1   N ┌──────────┐
│   User   │────────│  Session │  (token used for JWT revocation)
└──────────┘        └──────────┘
     │ 1
     │ N
     ├───────────────┐
     │               │
┌────▼────────────┐  │            ┌──────────────────┐
│  CustomPizza    │  │    N       │   CatalogItem    │
│ (user's build)  │  │────────────│ (Crust / Sauce / │
└─────────────────┘  │  belongsTo │  Base / Toppings)│
     │ M            │            └──────────────────┘
     │ N            1 │
┌────▼────────────────┐
│ CustomPizzaTopping  │  (junction: CustomPizza <-> CatalogItem)
└─────────────────────┘
     │ 1
     │ N
┌────▼────┐  N     1 ┌──────────┐
│  Order  │──────────│   User   │  (owner of the order)
└─────────┘          └──────────┘
```

### Entities

| Entity | Purpose | Key fields |
| :--- | :--- | :--- |
| `User` | A customer or employee account. | `name`, `email` (unique), `password` (bcrypt hash), `role` (`Customer` \| `Employee`) |
| `Session` | Server-side record backing a JWT so it can be invalidated on logout. | `token`, `expiresAt`, `userId` FK |
| `CatalogItem` | An available ingredient with a fixed price. | `title`, `description`, `price`, `category` (`Crust` \| `Sauce` \| `Base` \| `Toppings`), `isVegan`, `isHealthy` |
| `CustomPizza` | A user's saved custom pizza. | `name`, `userId` FK, `crustId`/`sauceId`/`baseId` FKs |
| `CustomPizzaTopping` | Many-to-many junction between a custom pizza and its toppings. | `customPizzaId` FK, `catalogItemId` FK |
| `Order` | A placed order with a snapshot of its line items. | `userId` FK, `status` (`Pending` \| `Preparing` \| `Ready` \| `Delivered`), `pizzas` (JSONB snapshot), `totalPrice` |

### Pricing

- A custom pizza's price is **computed server-side** as `crust + sauce + base + toppings` from the live catalog.
- An order's `totalPrice` is the sum of all line-item totals (`unitPrice × quantity`), also computed server-side and stored as an immutable JSONB snapshot so the order is unaffected by later catalog price changes.

---

## Notable Design Decisions

- **Row-Level Security (RLS) for ownership.** `custom_pizzas`, `custom_pizza_toppings`, and `orders` enable PostgreSQL RLS. Every request inside a transaction sets `app.current_user_id` / `app.current_user_role` via `set_config` (`src/common/helpers/rls.helper.ts`), so the database itself enforces that users only see/act on their own rows. This is layered with service-level checks (e.g. `CustomPizzaService.findByIds` scoped by `userId`, order cancel scoped by owner) and role guards.
- **Server-side pricing with order snapshots.** Clients never send prices. At order creation the API recomputes each pizza's price from the catalog, snapshots ingredients + unit prices into JSONB, and computes the total. Later catalog changes therefore never mutate historical orders.
- **Strict single-step status transitions.** `pending -> preparing -> ready -> delivered` is enforced via a transition map (`src/order/constants/order-status-transitions.ts`). Updates are atomic (`UPDATE ... WHERE status = current`) so concurrent double-advances are rejected with a `409`.
- **Cancel only while pending.** Customers may cancel their own orders exclusively in the `Pending` state; the DELETE is scoped by both `id` and `userId` and guarded against concurrent state changes.
- **Server-side sessions for JWT revocation.** JWT expiry is short-lived by default and every issued token is recorded in `sessions`; the JWT strategy verifies the token exists server-side, so `logout` genuinely invalidates a session.
- **Migration-only schema.** Sequelize `synchronize: false`; all schema changes live as versioned TypeScript migrations compiled and run via Sequelize CLI.
- **Role separation.** Customer endpoints (create/history/cancel orders, custom pizzas) and Employee endpoints (order queue, status transitions) are guarded by a `RolesGuard` on top of authentication.
- **E2E with an auto-provisioned database.** The e2e suite (`apps/api/test/pizza-order.e2e-spec.ts`) creates a dedicated `pizza_test` database, runs migrations + seeders, and refuses to run against the dev database.

---

## Workspace Script Reference

Run these commands from the root directory:

* `npm run dev`: Boot up the Docker Compose container network.
* `npm run dev:build`: Boot up and rebuild Docker Compose containers.
* `npm run build`: Compile backend and frontend projects.
* `npm run test`: Execute backend Jest unit tests.
* `npm run test:e2e`: Execute backend End-to-End tests.
* `npm run db:migrate`: Run database migrations.
* `npm run db:seed`: Load seed data.

---

## Verification Endpoints
* **Next.js Web Client**: `http://localhost:3001`
* **NestJS API Entry Point**: `http://localhost:3000/api`
* **API Health Check**: `http://localhost:3000/api/health`
* **Swagger Documentation**: `http://localhost:3000/api/docs`
