import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { UserRole } from '../enums/user-role.enum';

export async function setRlsContext(
  sequelize: Sequelize,
  userId: string,
  transaction: Transaction,
  role?: UserRole,
): Promise<void> {
  await sequelize.query(
    `SELECT set_config('app.current_user_id', :userId, true), set_config('app.current_user_role', :role, true);`,
    {
      replacements: { userId, role: role ?? null },
      transaction,
    }
  );
}
