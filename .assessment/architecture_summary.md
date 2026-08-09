# Repository Architecture Summary

## Core Technologies
- **Framework/Runtime**: NestJS 10 (Backend API), Next.js 15 App Router + React 19 (Frontend Web), Node.js v20+
- **Database & ORM**: PostgreSQL 16, Sequelize ORM (`sequelize-typescript`)
- **Package Manager**: npm (Simple Monorepo structure)
- **Build Commands**:
  - Build all: `npm run build` (`apps/api` + `apps/web`)
  - Docker local dev: `npm run dev` (`docker compose up`) / `npm run dev:build` (`docker compose up --build`)
  - Host local dev: `npm run dev:api` (Backend) / `npm run dev:web` (Frontend)

## Testing & Quality Control
- **Linter**: Next Lint (`npm run lint --prefix apps/web`)
- **Testing Framework**: Jest (`ts-jest`)
- **Test Commands**:
  - Unit tests: `npm run test`
  - E2E tests: `npm run test:e2e`

## Database Migrations & Management
- **Migration Commands**:
  - Apply migrations: `npm run db:migrate`
  - Undo migration: `npm run db:migrate:undo`
  - Seed database: `npm run db:seed`
  - Undo seeders: `npm run db:seed:undo`

## Project Layout & Conventions
- **Monorepo Architecture**:
  - `apps/api/`: NestJS backend application (`src/main.ts`, `src/app.module.ts`, `src/auth/`, `src/health/`, `src/database/`)
  - `apps/web/`: Next.js frontend application (`src/app/page.tsx`, `src/app/developer/page.tsx`, `src/components/`, `src/lib/api.ts`)
- **Styling Setup**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Environment & Docker Setup**: Root `.env` shared across containers (`pizza-api`, `pizza-web`, `pizza-postgres`) via `docker-compose.yml`
