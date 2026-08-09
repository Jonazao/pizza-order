# Task Understanding: Pizza Builder (pizza-builder)

## Problem Statement
We want to be able to create Custom Pizzas for a specific user. The pizza build should be persisted in the database for further quick orders. 

- The custom pizzas belong to a Customer User.
- The Custom pizza can contain:
  - Crust (Required)
  - Sauce (Required)
  - Base (Required)
  - List of Toppings (Optional)
- The total cost should be dynamically calculated based on the selected ingredients.
- There is no limit in the number of toppings the customer can select.
- The customer should set a Custom Pizza Name.

### UI/UX
- The pizza builder should be a multi step wizard with the following order:
  1. Select Crust
  2. Select Sauce
  3. Select Base
  4. Select Toppings
  5. Set Pizza Name

## DoD (Definition of Done)
- [x] All existing build, lint, and test suites pass.
- [x] Custom Pizza database schema/models and migrations defined to support custom pizza entities associated with users, referencing their ingredients (Crust, Sauce, Base, Toppings) and storing their custom name.
- [x] NestJS Backend REST APIs to support creating a custom pizza for a logged-in user and retrieving the user's custom pizzas.
- [x] Next.js Frontend Multi-step Wizard UI (`Select Crust` -> `Select Sauce` -> `Select Base` -> `Select Toppings` -> `Set Pizza Name`).
- [x] Total cost dynamically calculated and displayed on the UI at each step as ingredients are selected.
- [x] Validation in the wizard to ensure required fields (Crust, Sauce, Base, Name) are provided, and no limit on toppings.
- [x] Custom pizza successfully saved to the database via API upon completing the wizard.
- [x] Visual styling matching design tokens, high-quality aesthetics, and interactive stepper UI.

## Constraints & Boundaries
- **Explicit Constraints**:
  - Custom pizzas must belong to a Customer User.
  - Crust, Sauce, and Base are required ingredients.
  - Toppings are optional, and there is no limit on how many toppings can be selected.
  - Custom pizza name must be specified.
  - Wizard step order must be exactly: Crust -> Sauce -> Base -> Toppings -> Name.
- **Implicit Assumptions**:
  - A user session (JWT/Session cookie) is available to authenticate and associate the custom pizza with the active customer.
  - The ingredients and pricing are loaded dynamically from the catalog.
