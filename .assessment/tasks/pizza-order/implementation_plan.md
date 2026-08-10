# Implementation Plan: Pizza Order Flow (pizza-order)

This document outlines the changes and execution sequence for implementing the Pizza Order Flow, covering both backend API services and database setup, and frontend ordering and management workflows.

## Architecture & Security Strategy

### 1. Row-Level Security (RLS) stance
The API connects as the `postgres` superuser (`docker-compose.yml`), and PostgreSQL **superusers bypass RLS**. RLS is therefore defense-in-depth, not the primary boundary. This plan makes that explicit and enforces ownership + roles at the service layer, while keeping the schema correct if a least-privilege DB role is ever adopted.

- Migration creates `orders` with RLS enabled + FORCE, using a **role-aware policy**:
  ```sql
  CREATE POLICY orders_policy ON orders
  FOR ALL
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR NULLIF(current_setting('app.current_user_role', true), '') = 'Employee'
  )
  WITH CHECK ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
  ```
- Every query in `OrderService` runs in a transaction that first sets **both** session vars:
  ```sql
  SELECT set_config('app.current_user_id', :userId, true), set_config('app.current_user_role', :role, true);
  ```
- **Primary enforcement** lives in the app: `@Roles(EMPLOYEE)` on employee endpoints (existing `RolesGuard`), explicit `WHERE userId = :currentUserId` on all customer queries, and atomic status transitions.

### 2. Order status model
- `OrderStatus` enum (file `order/enums/order-status.enum.ts`), values `'Pending' | 'Preparing' | 'Ready' | 'Delivered'` (string style matches `UserRole`).
- Strict transition map: `Pending → Preparing → Ready → Delivered`.
- Cancel allowed **only** from `Pending`, by the owning Customer.

### 3. Snapshot schema (server-computed)
`orders.pizzas` is a JSONB array of line items. The service **recomputes prices from the DB** (fetches each custom pizza via `CustomPizzaService` and serializes with the existing `serializeCustomPizza`) — the client only supplies `{ customPizzaId, quantity }`. Snapshot shape:
```ts
interface OrderLineItemSnapshot {
  customPizzaId: string;
  name: string;
  quantity: number;
  unitPrice: number;   // recomputed from DB ingredients
  lineTotal: number;   // unitPrice * quantity
  ingredients: {       // serialized catalog snapshots
    crust: CatalogItem | null;
    sauce: CatalogItem | null;
    base: CatalogItem | null;
    toppings: CatalogItem[];
  };
}
```
`orders.totalPrice` = sum of line totals (2-decimal rounding), computed server-side. `customPizzaId` is stored for reference but **not** FK-constrained (snapshot independence).

### 4. Atomic state transitions
Employee `PATCH /orders/:id/status` and customer `DELETE /orders/:id` use conditional updates to eliminate races:
```sql
UPDATE orders SET status = :next, "updatedAt" = NOW()
WHERE id = :id AND status = :current;      -- check rowsAffected === 1
DELETE FROM orders WHERE id = :id AND "userId" = :userId AND status = 'Pending';
```
0 rows affected → 404 (not found/not yours) vs 409 (invalid transition / not pending). No `findByPk` + save round-trip for the write itself.

---

## Proposed File Changes

### Backend (NestJS API & Database)

- **File**: `apps/api/database/migrations/20260810000000-create-orders-table.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Create `orders` (`id` UUID PK, `userId` FK→users CASCADE, `status` ENUM(OrderStatus) default `'Pending'`, `pizzas` JSONB, `totalPrice` DECIMAL(10,2), timestamps), indexes on `(userId)`, `(status)`, and role-aware RLS policy above. `down` drops policy, disables RLS, drops table.

- **File**: `apps/api/src/order/enums/order-status.enum.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `OrderStatus` enum + `ORDER_STATUS_TRANSITIONS` map + `canTransition()` helper.

- **File**: `apps/api/src/order/routes.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `ORDER_ROUTES = { base: 'orders', employee: 'employee', status: 'status' }` (matches `CUSTOM_PIZZA_ROUTES` pattern).

- **File**: `apps/api/src/order/models/order.model.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Sequelize `Order` model: `userId`, `status` (enum), `pizzas` (JSONB), `totalPrice`; `@BelongsTo(() => User)` as `user`; `OrderAttributes` interface.

- **File**: `apps/api/src/order/models/index.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Barrel export for the order model.

- **File**: `apps/api/src/order/dto/create-order.dto.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `{ items: OrderItemInputDto[] }`; `OrderItemInputDto { customPizzaId: @IsUUID; quantity: @IsInt @Min(1) }`; `@ArrayNotEmpty` + `@ValidateNested`.

- **File**: `apps/api/src/order/dto/update-order-status.dto.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `{ status: @IsEnum(OrderStatus) }`.

- **File**: `apps/api/src/order/dto/order-response.dto.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Serialized order: `id, userId, status, items (snapshot), totalPrice, createdAt, updatedAt, customerName?`.

- **File**: `apps/api/src/order/dto/find-orders-query.dto.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Shared pagination/filter params `page`, `limit`, `status?` (customer history + employee queue). `FindEmployeeOrdersQueryDto` extends it with `search?`.

- **File**: `apps/api/src/order/dto/index.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Barrel export for order DTOs.

- **File**: `apps/api/src/order/serializers/order.serializer.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Manual mapping (like `serializeCustomPizza`) to avoid class-transformer/Sequelize conflicts; includes `customerName` when `order.user` is present.

- **File**: `apps/api/src/order/serializers/index.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Barrel export for the order serializer.

- **File**: `apps/api/src/order/order.service.ts` [NEW]
  - **Complexity**: Medium
  - **Action**: `create(userId, dto)` (fetch+snapshot via `CustomPizzaService.findByIds`, recompute unitPrice/lineTotal/totalPrice server-side, insert in RLS transaction at `Pending`), `findHistory(userId, query)` (paginated own orders), `findEmployeeQueue(query)` (status filter default excluding `Delivered`, search by order id / customer name, paginated), `updateStatus(...)` (validate transition, atomic conditional UPDATE, 409/404), `cancel(...)` (atomic conditional DELETE, owner + `Pending` only).

- **File**: `apps/api/src/order/order.controller.ts` [NEW]
  - **Complexity**: Medium
  - **Action**: Endpoints `POST /orders`, `GET /orders` (Customer history), `GET /orders/employee` (Employee queue), `PATCH /orders/:id/status` (Employee), `DELETE /orders/:id` (Customer cancel). `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`.

- **File**: `apps/api/src/order/order.module.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `SequelizeModule.forFeature([Order, User])`, imports `CustomPizzaModule`, binds service/controller, provides `RolesGuard`, exports `OrderService`.

- **File**: `apps/api/src/app.module.ts` [MODIFY]
  - **Complexity**: Low
  - **Action**: Import `OrderModule`.

- **File**: `apps/api/src/custom-pizza/custom-pizza.service.ts` [MODIFY]
  - **Complexity**: Medium
  - **Action**: `findAll(userId, query)` → paginated via `findAndCountAll` with `distinct: true` (toppings join inflates count), `name` ILIKE search, sort by `name`/`createdAt`, inside RLS transaction. Add `findByIds(userId, ids)` (same RLS context + ownership filter) for order snapshotting.

- **File**: `apps/api/src/custom-pizza/custom-pizza.controller.ts` [MODIFY]
  - **Complexity**: Low
  - **Action**: `GET /custom-pizza` accepts `FindCustomPizzasQueryDto`; returns `{ items, total, page, limit }`.

- **File**: `apps/api/src/custom-pizza/dto/find-custom-pizzas-query.dto.ts` [NEW]
  - **Complexity**: Low
  - **Action**: Validated query DTO (`page`, `limit`, `sortBy` whitelist `['name','createdAt']`, `search`, `sortOrder`).

### Frontend (Next.js Web App)

- **File**: `apps/web/src/lib/api/custom-pizza.ts` [MODIFY]
  - **Complexity**: Low
  - **Action**: `getCustomPizzas(query)` → typed paginated response `{ items, total, page, limit }`.

- **File**: `apps/web/src/lib/api/order.ts` [NEW]
  - **Complexity**: Low
  - **Action**: `createOrder`, `getOrders`, `getEmployeeOrders`, `updateOrderStatus`, `cancelOrder`; `Order` + `OrderLineItem` types mirroring backend.

- **File**: `apps/web/src/lib/hooks/use-orders.ts` [NEW]
  - **Complexity**: Low
  - **Action**: TanStack Query hooks for history/queue/mutations (matches existing `useQuery` usage in `auth-context`).

- **File**: `apps/web/src/components/AppHeader.tsx` [MODIFY]
  - **Complexity**: Low
  - **Action**: Role-aware nav: Customer sees `Ordering` + `Orders`; Employee sees `Orders`; keep Catalog/Builder/Developer.

- **File**: `apps/web/src/components/HeaderAuth.tsx` [MODIFY]
  - **Complexity**: Low
  - **Action**: Logged-in Customer gets "Order Now" → `/ordering` (in addition to current logged-out → `/register` behavior).

- **File**: `apps/web/src/app/ordering/page.tsx` [NEW]
  - **Complexity**: High
  - **Action**: Customer-only (redirect employees to `/orders`, guests to `/login`). Paginated/searchable/sorted custom pizza grid, quantity stepper per pizza, live order summary panel (line totals + grand total), "Submit Order" → confirmation dialog (summary + total) → `createOrder` → success view + `queryClient.invalidateQueries`. Empty state → link to `/pizza-builder`.

- **File**: `apps/web/src/app/orders/page.tsx` [NEW]
  - **Complexity**: High
  - **Action**: Role-switching single page: Customer = order history (paginated, status filter, Cancel on `Pending`); Employee = queue (default excludes `Delivered`, status filter + search, "Advance → next state" action using transition map).

---

## Execution Sequence

1. **Step 1: DB Migration & RLS Setup**
   - Target: `apps/api/database/migrations/20260810000000-create-orders-table.ts`
   - Verification: Run `npm run db:migrate` and verify tables/policies in Postgres.

2. **Step 2: Backend Models, Enums, DTOs, Routes**
   - Target: `apps/api/src/order/{enums,routes,models,dto}`
   - Verification: Model integration compiles (`npm run build --prefix apps/api`).

3. **Step 3: Custom Pizza Pagination & Search Backend**
   - Target: `apps/api/src/custom-pizza/{service,controller,dto}`
   - Verification: Add Jest spec for paginated custom pizzas querying; `npm run test`.

4. **Step 4: Backend Order Service & Controller Implementation**
   - Target: `apps/api/src/order/{order.service.ts,order.controller.ts,order.module.ts}`, `apps/api/src/app.module.ts`
   - Verification: Unit tests for order creation (snapshot + price recompute), history ownership, employee queue, state transitions, and cancellation; `npm run test`.

5. **Step 5: Frontend API Integration**
   - Target: `apps/web/src/lib/api/{custom-pizza.ts,order.ts}`, `apps/web/src/lib/hooks/use-orders.ts`
   - Verification: App builds correctly (`npm run build`).

6. **Step 6: Frontend Header & Navigation Integration**
   - Target: `apps/web/src/components/AppHeader.tsx`, `apps/web/src/components/HeaderAuth.tsx`
   - Verification: Correct links are displayed for Customer and Employee roles.

7. **Step 7: Frontend Customer Ordering Page**
   - Target: `apps/web/src/app/ordering/page.tsx`
   - Verification: Browser walkthrough (list → quantity → live summary → confirm dialog → order in `Pending`); `npm run lint --prefix apps/web`.

8. **Step 8: Frontend Orders Page (Customer & Employee)**
   - Target: `apps/web/src/app/orders/page.tsx`
   - Verification: Customer history + cancel; Employee queue search/filter/transitions.

9. **Step 9: Full Regression**
   - Target: whole repo
   - Verification: `npm run build`, `npm run test`, `npm run test:e2e`, re-run `db:migrate`/`db:seed`.
