# CLAUDE.md

## Running the Application
- Start local environment: `npm run dev` (runs `docker compose up`)
- Build and start: `npm run dev:build` (runs `docker compose up --build`)
- Tear down containers: `npm run down` (runs `docker compose down`)
- Hard reset database: `npm run down:clean` (runs `docker compose down -v`)

## Building and Testing (Host commands)
- Build all projects: `npm run build`
- Run backend unit tests: `npm run test`
- Run backend E2E tests: `npm run test:e2e`

## Database Migrations
- Apply migrations: `npm run db:migrate`
- Undo last migration: `npm run db:migrate:undo`
- Run seeders: `npm run db:seed`
- Undo seeders: `npm run db:seed:undo`

## Project Structure
- `apps/api/`: NestJS backend application
- `apps/web/`: Next.js frontend application

## Technology & Style Guidelines
- **TypeScript**: Strict mode enabled (`"strict": true`). No `any` types unless absolutely necessary.
- **Backend (NestJS)**: Clean modular design, validation via `class-validator` pipes, CORS dynamically fetched from environment variables.
- **Frontend (Next.js)**: App router routing style. Separation of API clients (`src/lib/api`) and page routing code. Tailwind CSS v4 styling.
- **Database (Sequelize)**: Schema management via migrations only (`synchronize: false` is strict). Migrations authored as TypeScript under `apps/api/database/migrations` and compiled to JavaScript before running.
- **Casing & Naming**:
  - Files: kebab-case for directories/filenames (e.g. `jwt-auth.guard.ts`).
  - Classes: PascalCase.
  - Functions/Variables: camelCase.
