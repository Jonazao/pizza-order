# Task Understanding: Pizza Catalog (pizza-catalog)

## Problem Statement
We need to create the catalog base for a future pizza builder wizard. This requires creating the database models/migrations, backend API endpoints (NestJS), initial seeders, and a dedicated frontend catalog page route (Next.js App Router) with rich UI/UX components.

## DoD (Definition of Done)
- [ ] All existing build, lint, and test suites pass.
- [ ] Catalog database models, migrations, and seeders created with common options for standard, vegan, and healthy pizzas across 4 categories (Crust, Sauce, Base, Toppings).
- [ ] NestJS backend catalog module & REST API endpoints created to serve catalog categories and items.
- [ ] Dedicated Next.js page route created for the Pizza Catalog (`/catalog` or `/pizza-catalog`).
- [ ] Unpaginated category section layout rendering items in cards with title, description, price, category badges, and visual tags.
- [ ] Premium UI/UX design adhering to design tokens, responsive layout, dark/light harmonious aesthetics, and subtle micro-interactions.

## Constraints & Boundaries
- **Explicit Constraints**:
  - Categories must be: `Crust`, `Sauce`, `Base` (cheese/other options), and `Toppings`.
  - No pagination; display all items per section since item counts are controlled.
  - Seed initial data covering regular, vegan, and healthy options.
  - Dedicated page route with full UI/UX component cards showing title, description, and price.
- **Implicit Assumptions**:
  - API endpoint `/api/catalog` serves catalog items grouped by category or with category relations.
  - Sequelize models are integrated into NestJS `SequelizeModule`.
