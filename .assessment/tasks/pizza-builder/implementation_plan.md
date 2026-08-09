# Implementation Plan: Pizza Builder (pizza-builder)

We need to implement a full-stack Pizza Builder wizard where users can construct custom pizzas (Crust, Sauce, Base, and optional Toppings), view a dynamic cost estimation, name their custom pizza, and save it. The backend will persist custom builds in the database.

## Architecture & Security Strategy

This plan incorporates the **3 available skills** (`nestjs-best-practices`, `ui-styling`, `ui-ux-pro-max`) along with a multi-layered security strategy combining controller-level checks and PostgreSQL Row-Level Security (RLS).

### 1. Database Layer: Row-Level Security (RLS)
- We will define migrations to create `custom_pizzas` and `custom_pizza_toppings` tables.
- RLS will be enabled and forced on both tables.
- A SELECT policy and an ALL policy will restrict access:
  - A user can only see/modify custom pizzas where `user_id` matches the session variable `app.current_user_id`.
  - In NestJS, database queries accessing `custom_pizzas` will run inside a transaction. The transaction will first execute:
    ```sql
    SELECT set_config('app.current_user_id', :userId, true);
    ```
    This guarantees that PostgreSQL enforces the policy at the database engine level, preventing data leakage even if service-level filters fail.

### 2. NestJS Best Practices
- **Feature Modules (`arch-feature-modules`)**: All custom pizza logic will reside in a self-contained `CustomPizzaModule`.
- **Input Validation (`security-validate-all-input`)**: DTO inputs will be strictly validated using `class-validator` to ensure required ingredients are specified and types are correct.
- **Dependency Injection (`di-prefer-constructor-injection`)**: Constructor injection will be used for the models and services.
- **Transaction Safety (`db-use-transactions`)**: Creation of custom pizzas and toppings will be executed inside a single transaction to maintain database integrity.

### 3. UI/UX & Styling Guidelines (`ui-styling` & `ui-ux-pro-max`)
- **Stepper & Navigation**: A progressive multi-step wizard will guide the customer smoothly (Crust -> Sauce -> Base -> Toppings -> Name/Review).
- **Responsive Layout**: Spacing and card grids will scale responsively from mobile devices (single column) to desktop screens (grid cards).
- **Dynamic Cost Calculation**: Cost will update instantly at each step as ingredients are toggled.
- **Micro-interactions**: Subtle hover states, transition animations, and progress bar updates will enhance visual polish.

---

## Proposed File Changes

- **File**: `apps/api/database/migrations/20260809000004-create-custom-pizzas-table.ts`
  - **Complexity**: Medium
  - **Action**: Create tables for `custom_pizzas` and `custom_pizza_toppings`, add foreign keys, and configure PostgreSQL RLS policies.
  
- **File**: `apps/api/src/custom-pizza/models/custom-pizza.model.ts`
  - **Complexity**: Low
  - **Action**: Create the `CustomPizza` Sequelize model with associations.

- **File**: `apps/api/src/custom-pizza/models/custom-pizza-topping.model.ts`
  - **Complexity**: Low
  - **Action**: Create the `CustomPizzaTopping` junction table model.

- **File**: `apps/api/src/custom-pizza/dto/create-custom-pizza.dto.ts`
  - **Complexity**: Low
  - **Action**: Define and validate payload structure for creating a custom pizza.

- **File**: `apps/api/src/custom-pizza/dto/custom-pizza-response.dto.ts`
  - **Complexity**: Low
  - **Action**: Define the serialized response structure for the custom pizza.

- **File**: `apps/api/src/custom-pizza/custom-pizza.service.ts`
  - **Complexity**: Medium
  - **Action**: Implement custom pizza creation and retrieval logic, wrapping database queries in RLS transactions.

- **File**: `apps/api/src/custom-pizza/custom-pizza.controller.ts`
  - **Complexity**: Low
  - **Action**: Define authenticated REST endpoints (`POST /api/custom-pizza`, `GET /api/custom-pizza`).

- **File**: `apps/api/src/custom-pizza/custom-pizza.module.ts`
  - **Complexity**: Low
  - **Action**: Set up NestJS module imports, providers, and controllers.

- **File**: `apps/api/src/app.module.ts`
  - **Complexity**: Low
  - **Action**: Register `CustomPizzaModule` in the root application module.

- **File**: `apps/web/src/lib/api/custom-pizza.ts`
  - **Complexity**: Low
  - **Action**: Add frontend API client functions to submit and fetch custom pizzas.

- **File**: `apps/web/src/components/AppHeader.tsx`
  - **Complexity**: Low
  - **Action**: Add a navigation link to the "Pizza Builder" page.

- **File**: `apps/web/src/app/pizza-builder/page.tsx`
  - **Complexity**: High
  - **Action**: Create the multi-step wizard page utilizing design tokens, stepper controls, dynamic pricing, and form validation.

---

## Execution Sequence

1. **Step 1: Database Migration & RLS**
   - Target: `apps/api/database/migrations/20260809000004-create-custom-pizzas-table.ts`
   - Verification: Run `npm run db:migrate` and check tables in Postgres.

2. **Step 2: Define Sequelize Models**
   - Target: `apps/api/src/custom-pizza/models/custom-pizza.model.ts`, `apps/api/src/custom-pizza/models/custom-pizza-topping.model.ts`
   - Verification: Compile project using `npm run build --prefix apps/api`.

3. **Step 3: Implement Custom Pizza Service & RLS Context**
   - Target: `apps/api/src/custom-pizza/custom-pizza.service.ts`
   - Verification: Ensure the service initializes PostgreSQL current user setting inside its transactions.

4. **Step 4: Implement Controller, DTOs, and Module**
   - Target: `apps/api/src/custom-pizza/custom-pizza.controller.ts`, `apps/api/src/custom-pizza/custom-pizza.module.ts`, `apps/api/src/app.module.ts`
   - Verification: Start NestJS API and run HTTP request checks.

5. **Step 5: Frontend API Client**
   - Target: `apps/web/src/lib/api/custom-pizza.ts`
   - Verification: Check type definitions and imports.

6. **Step 6: Frontend Multi-Step Wizard UI**
   - Target: `apps/web/src/app/pizza-builder/page.tsx`
   - Verification: Run `npm run lint --prefix apps/web` and open page `/pizza-builder` in browser.

7. **Step 7: Header Link integration**
   - Target: `apps/web/src/components/AppHeader.tsx`
   - Verification: Confirm navigation link is visible and navigates to the builder.
