# Pizza Order Builder - Scaffolding

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
