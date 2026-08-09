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
├── CLAUDE.md            # AI Tools Work Instructions
└── README.md            # Development Documentation
```

## Stack Freeze
* **Frontend**: Next.js, TypeScript, Tailwind CSS v4, PostCSS.
* **Backend**: NestJS, TypeScript (strict: true), Passport, JWT.
* **Persistence**: PostgreSQL 16, Sequelize, Sequelize-TypeScript, Sequelize-CLI.
* **Infrastructure**: Docker, Docker Compose.

---

## Local Setup

### Prerequisites
* Docker and Docker Compose installed.
* Node.js (v18 or higher) and npm installed locally.

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

The database includes two pre-configured demo user accounts created via `npm run db:seed`:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `Customer123!` | Customer role for pizza ordering & account management |
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
