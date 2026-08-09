import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Create custom_pizzas table
    await queryInterface.createTable('custom_pizzas', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      crustId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'catalog_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sauceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'catalog_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      baseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'catalog_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // 2. Create custom_pizza_toppings junction table
    await queryInterface.createTable('custom_pizza_toppings', {
      customPizzaId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'custom_pizzas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      catalogItemId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'catalog_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // 3. Enable RLS on custom_pizzas
    await queryInterface.sequelize.query('ALTER TABLE custom_pizzas ENABLE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query('ALTER TABLE custom_pizzas FORCE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query(`
      CREATE POLICY custom_pizzas_user_policy ON custom_pizzas
      FOR ALL
      USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
    `);

    // 4. Enable RLS on custom_pizza_toppings
    await queryInterface.sequelize.query('ALTER TABLE custom_pizza_toppings ENABLE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query('ALTER TABLE custom_pizza_toppings FORCE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query(`
      CREATE POLICY custom_pizza_toppings_user_policy ON custom_pizza_toppings
      FOR ALL
      USING (
        "customPizzaId" IN (
          SELECT id FROM custom_pizzas WHERE "userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
      );
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Drop policies first
    await queryInterface.sequelize.query('DROP POLICY IF EXISTS custom_pizza_toppings_user_policy ON custom_pizza_toppings;');
    await queryInterface.sequelize.query('DROP POLICY IF EXISTS custom_pizzas_user_policy ON custom_pizzas;');
    
    // Disable RLS
    await queryInterface.sequelize.query('ALTER TABLE custom_pizza_toppings DISABLE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query('ALTER TABLE custom_pizzas DISABLE ROW LEVEL SECURITY;');

    // Drop tables
    await queryInterface.dropTable('custom_pizza_toppings');
    await queryInterface.dropTable('custom_pizzas');
  },
};
