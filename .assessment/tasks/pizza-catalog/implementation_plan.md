# Implementation Plan: Pizza Catalog (pizza-catalog)

This plan outlines the design and step-by-step changes to implement the Pizza Catalog feature, including the PostgreSQL database migration, seed data for common/vegan/healthy items, a NestJS backend REST API, and a beautiful, responsive Next.js catalog route.

## Proposed File Changes

### Backend (NestJS)

#### [NEW] [catalog-item.model.ts](file:///d:/Projects/pizza-order/apps/api/src/catalog/models/catalog-item.model.ts)
- **Complexity**: Low
- **Action**: Define the Sequelize model `CatalogItem` with attributes: `id` (UUID), `title` (String), `description` (Text), `price` (Decimal), `category` (Enum: `Crust`, `Sauce`, `Base`, `Toppings`), `isVegan` (Boolean), and `isHealthy` (Boolean).

#### [NEW] [catalog.controller.ts](file:///d:/Projects/pizza-order/apps/api/src/catalog/catalog.controller.ts)
- **Complexity**: Low
- **Action**: Create controller exposing `GET /api/catalog` to fetch catalog items.

#### [NEW] [catalog.service.ts](file:///d:/Projects/pizza-order/apps/api/src/catalog/catalog.service.ts)
- **Complexity**: Low
- **Action**: Create service to retrieve catalog items from the database.

#### [NEW] [catalog.module.ts](file:///d:/Projects/pizza-order/apps/api/src/catalog/catalog.module.ts)
- **Complexity**: Low
- **Action**: Bundle `CatalogItem` model, `CatalogController`, and `CatalogService` into a NestJS module.

#### [MODIFY] [app.module.ts](file:///d:/Projects/pizza-order/apps/api/src/app.module.ts)
- **Complexity**: Low
- **Action**: Register the new `CatalogModule` in imports.

---

### Database Setup

#### [NEW] [20260809000003-create-catalog-items-table.ts](file:///d:/Projects/pizza-order/apps/api/database/migrations/20260809000003-create-catalog-items-table.ts)
- **Complexity**: Low
- **Action**: Database migration to create the `catalog_items` table.

#### [NEW] [20260809000002-seed-catalog-items.ts](file:///d:/Projects/pizza-order/apps/api/database/seeders/20260809000002-seed-catalog-items.ts)
- **Complexity**: Low
- **Action**: Bulk seed data representing 12+ items across sections `Crust`, `Sauce`, `Base`, and `Toppings` featuring standard, vegan, and healthy variants.

---

### Frontend (Next.js)

#### [NEW] [catalog.ts](file:///d:/Projects/pizza-order/apps/web/src/lib/api/catalog.ts)
- **Complexity**: Low
- **Action**: Create frontend API client functions to fetch catalog items.

#### [NEW] [page.tsx](file:///d:/Projects/pizza-order/apps/web/src/app/catalog/page.tsx)
- **Complexity**: Medium
- **Action**: Build `/catalog` route page UI using Tailwind CSS. Render categories in distinct sections, layout items in cards with tags (Vegan, Healthy, Price), and add a filter bar (All, Vegan, Healthy).

---

## Execution Sequence

### Phase 1: Database Setup
1. Create database migration for `catalog_items`.
2. Create database seeder for catalog options.
3. Apply migration and run seeder inside the running Docker API container.

### Phase 2: NestJS REST API
1. Implement `CatalogItem` model in `apps/api/src/catalog/models`.
2. Implement service and controller in `apps/api/src/catalog`.
3. Register module in `AppModule`.
4. Verify backend endpoint `/api/catalog` via health check tools or direct API call.

### Phase 3: Next.js Frontend
1. Add frontend API client function in `apps/web/src/lib/api/catalog.ts`.
2. Create page route `/catalog` (`apps/web/src/app/catalog/page.tsx`) using premium visual styling, grid cards, search/filter controls, and a responsive navigation header links.
3. Verify visual design in browser.
