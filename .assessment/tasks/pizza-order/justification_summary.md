# Solution Justification: Pizza Order Flow (pizza-order)

## Objective
- Implemented a complete, end-to-end Pizza Ordering system. This allows customers to select quantities of their saved custom pizzas, view a live order summary, and submit orders via a confirmation dialog. It also allows employees to manage active orders (filtering by state: Pending, Preparing, Ready), transition them sequentially, and search them.

## Surgical Approach
The implementation introduced the `orders` feature cleanly without disrupting other modules:
- **Database Migration**: Added an `orders` table with PostgreSQL Row-Level Security (RLS) policies matching Customer and Employee roles. Order pizza details are stored as a JSON/JSONB "snapshot" to prevent future pricing/description updates from affecting historical orders.
- **Backend Service & Controller (`apps/api/src/order/`)**: Created custom models, DTOs, logic, and route handlers. Order transitions are strictly future-only (Pending $\rightarrow$ Preparing $\rightarrow$ Ready $\rightarrow$ Delivered). Cancellation (deleting the order record) is permitted only in the `Pending` state.
- **Custom Pizza Pagination (`apps/api/src/custom-pizza/`)**: Enhanced the custom pizza lookup service to support offset pagination, sorting by name, and text searches.
- **Frontend Pages (`apps/web/src/app/ordering/` & `/orders/`)**: Built responsive interface screens tailored to user roles.
  - Customers browse their saved custom pizzas (with pagination/sorting/search), build an order cart, submit with confirmation, and view history.
  - Employees search and advance orders using state tabs.
- **Header Navigation (`apps/web/src/components/`)**: Displayed dynamic menus based on roles.

## Architectural & Design Tradeoffs
- **Postgres RLS with App-Level Decoupling**: Implemented database-enforced policies ensuring Customers cannot modify or access other users' orders, and Employees cannot transition orders improperly. Decoupled the role validation inside Sequelize queries for additional defense-in-depth.
- **JSONB Snapshots**: Instead of referencing live database rows of toppings and items (which could change prices or names later), we serialized a static snapshot of the custom pizza composition into the order. This ensures historical integrity of sales records.
- **Unidirectional state transition guards**: Explicitly validated status change checks in `order.service.ts` using state mapping to avoid out-of-order state progressions.

## Verification & Quality Results
- **Build Status**: Successful (NestJS and Next.js compiled cleanly without errors).
- **Test Outcome**: 34/34 tests passing, including new unit tests for services and controllers.
- **Manual/Visual Verification**: Visually tested in the browser. Customer ordering flows, cart summaries, confirmation dialogs, and Employee state progression panels are verified to render and function correctly.
