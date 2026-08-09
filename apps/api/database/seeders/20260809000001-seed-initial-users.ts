import { QueryInterface } from 'sequelize';
import * as bcrypt from 'bcryptjs';

export = {
  up: async (queryInterface: QueryInterface) => {
    const customerPassword = await bcrypt.hash('Customer123!', 10);
    const employeePassword = await bcrypt.hash('Employee123!', 10);

    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'John Customer',
        email: 'customer@example.com',
        password: customerPassword,
        role: 'Customer',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Alice Employee',
        email: 'employee@example.com',
        password: employeePassword,
        role: 'Employee',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: ['customer@example.com', 'employee@example.com'],
    });
  },
};
