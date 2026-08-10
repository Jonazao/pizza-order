# Task Understanding: Pizza Order Flow (pizza-order)

## Problem Statement
The app should be able to generate a pizza order containing one or multiple pizzas.

-An order can have 4 states:
--Pending
--Preparing
--Ready
--Delivered

-The order can only be canceled while it still in Pending State
-An order state can only be updated by an Emplyee user. 
--The orders can only transition to future states, never to a previous one
--Pending transition to Preparing
--Preparing transition to Ready
--Ready transition to Delivered

-The orders should be persisted, so we can display a users Order History
-When placing an order, the selected items for each pizza should not be referenced, an instance "snapshot" should be save in the order, this in case in a future the items prices/names/descriptions changes, the order stills accurrate (JSON column suggestion). 

UI/UX:
-When logged in as a Customer there should be a button to "Order Now", this should take us to a Ordering Page where a list of our saved custom pizzas is display.
-The Custom pizzas should be per user, the endpoint should be paginated, sorteable by name and searcheable. 
-There should be a way to select quantity of pizzas to add to the order and an action to add them to the Order
-There should be a view order summary rendered so the customer can see what currently is on his order and the total amount. 
-When clicking submit order, there should be a confirmation dialog with a brief summary of the order, and total price, after accepting the order should be created for that user and set in a pending state.

-When loging in as an Employee there should be a view/tab that displays all orders that are not in a Delivered state. 
-The orders should be searcheable and filtered by state so we can transition properly.
-The orders should contain an action to transition it to the next state

## DoD (Definition of Done)
- [x] All existing build, lint, and test suites pass.
- [x] Database schema is updated with an `orders` table (with RLS support and JSON/JSONB field for snapshots) via database migration.
- [x] Backend routes and controller created for `Order`:
  - `POST /api/orders` to create a new order (accessible to Customers).
  - `GET /api/orders` to retrieve order history for the authenticated Customer.
  - `GET /api/orders/employee` (or similar endpoint) to list all orders for Employees (with filtering by state, search, excluding Delivered state by default).
  - `PATCH /api/orders/:id/status` (or transition endpoint) to update status (accessible to Employees, with transition checks).
  - `DELETE /api/orders/:id` (or cancel endpoint) to cancel a pending order (accessible to Customers, state must be Pending).
- [x] Back-end Pagination, Sorting, and Search added to the User Custom Pizza endpoint (`GET /api/custom-pizza` / `findAll`).
- [x] Custom Pizzas pagination, sorting, and search UI built/updated in React/Next.js frontend.
- [x] Frontend Customer Ordering flow:
  - "Order Now" button on Dashboard/Home.
  - Ordering Page displaying the customer's custom pizzas (paginated, sorted, searchable).
  - Ability to adjust pizza quantity and add to order.
  - Live order summary showing items and total price.
  - Submit order triggers a confirmation dialog showing summary and total.
  - Order creation sets state to `Pending`.
- [x] Frontend Employee workflow:
  - Tab/View displaying orders not in `Delivered` state.
  - Searchable and filterable by state.
  - Action to transition orders to the next state (Pending -> Preparing -> Ready -> Delivered).
- [x] Automated tests added for the new backend order APIs and custom pizza pagination/search.
- [x] Visual verification of the entire flow in the browser.

## Constraints & Boundaries
- **Explicit Constraints**:
  - State transitions are strict: Pending -> Preparing -> Ready -> Delivered.
  - State updates can only be made by an Employee user.
  - Order cancellation can only happen when the state is Pending (by the Customer who placed it).
  - Customers can only read/view their own orders (Order History).
  - Employee users can read all orders from all users to view and manage them.
  - Items in an order must be a snapshot (not reference DB rows of custom pizzas or catalog items directly) so prices/details remain accurate if changed.
  - The custom pizzas endpoint must be paginated, searchable by name, and sortable by name.
  - Row Level Security (RLS) context must be correctly set in PostgreSQL transactions for query execution, ensuring security boundaries.
- **Implicit Assumptions**:
  - Employee users are authenticated and have specific roles or properties.
  - Current timestamp and user details are supplied via decorators/JWT guards.

