import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Create orders table
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      status: {
        type: DataTypes.ENUM('Pending', 'Preparing', 'Ready', 'Delivered'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      pizzas: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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

    // 2. Performance indexes for history + queue queries
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['status']);

    // 3. Enable RLS with a role-aware policy (Customer sees own, Employee sees all)
    await queryInterface.sequelize.query('ALTER TABLE orders ENABLE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query('ALTER TABLE orders FORCE ROW LEVEL SECURITY;');
    await queryInterface.sequelize.query(`
      CREATE POLICY orders_policy ON orders
      FOR ALL
      USING (
        "userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        OR NULLIF(current_setting('app.current_user_role', true), '') = 'Employee'
      )
      WITH CHECK ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Drop policy first
    await queryInterface.sequelize.query('DROP POLICY IF EXISTS orders_policy ON orders;');

    // Disable RLS
    await queryInterface.sequelize.query('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');

    // Drop table
    await queryInterface.dropTable('orders');
  },
};
