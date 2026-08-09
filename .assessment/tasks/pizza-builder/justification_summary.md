# Solution Justification: Pizza Builder (pizza-builder)

## Objective
- Implemented a persistent, custom pizza building feature associated with authenticated customer users. This allows users to create customized pizza recipes (consisting of a required Crust, Sauce, and Base cheese, along with a list of optional toppings), see a dynamically calculated cost in real-time, name their creation, and save it to their profile for fast reordering.

## Surgical Approach
- **Database & RLS Policies**: Created the tables `custom_pizzas` and `custom_pizza_toppings` under a transaction, enforcing strict PostgreSQL Row-Level Security (RLS) policies requiring matching `userId` session variables via `app.current_user_id`.
- **Backend (NestJS)**: Created the `CustomPizzaModule` with controllers, models, and service classes to manage creation (`POST /api/custom-pizza`) and retrieval (`GET /api/custom-pizza`). Sanitized the custom pizza responses cleanly in `serializePizza` to prevent global class serialization conflicts with Sequelize model class structures.
- **Frontend (Next.js)**: Built the complete multi-step wizard UI at `/pizza-builder` with dynamic cost estimation and state persistence, guiding guests to sign in if they want to save their signatures.
- **Seeder UUID compliance**: Refactored the database seeders and example responses to strictly adhere to the standard RFC 4122 / UUID version 4 format.

Files modified:
- `apps/api/database/migrations/20260809000004-create-custom-pizzas-table.ts`
- `apps/api/database/seeders/20260809000001-seed-initial-users.ts`
- `apps/api/database/seeders/20260809000002-seed-catalog-items.ts`
- `apps/api/src/catalog/dto/catalog-item-response.dto.ts`
- `apps/api/src/custom-pizza/custom-pizza.service.ts`
- `apps/api/src/custom-pizza/custom-pizza.controller.ts`
- `apps/api/src/custom-pizza/custom-pizza.module.ts`
- `apps/api/src/custom-pizza/dto/custom-pizza-response.dto.ts`
- `apps/api/src/custom-pizza/models/custom-pizza.model.ts`
- `apps/api/src/custom-pizza/models/custom-pizza-topping.model.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/app/pizza-builder/page.tsx`
- `apps/web/src/lib/api/custom-pizza.ts`
- `apps/web/src/components/AppHeader.tsx`

## Architectural & Design Tradeoffs
- **Custom Response Serialization**: In `serializePizza`, we choose to manually map model properties to a clean object structure instead of using recursive `.get({ plain: true })`. This avoids leaking database-specific properties (like junction-table metadata objects) to class-transformer, avoiding any instantiator crashes.
- **Defense in Depth**: Combined PostgreSQL Row-Level Security checks with application-level controller checks (`@CurrentUser()` JWT user id bindings) to guarantee user isolation and data leakage protection at both API and Database Engine layers.

## Verification & Quality Results
- **Build Status**: Successful production compile for both backend and frontend applications (`npm run build`).
- **Test Outcome**: All 6 unit tests and 2 E2E tests are passing successfully.
