import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Session } from './session.model';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserAttributes } from '../interfaces/auth.interface';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, UserAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.ENUM(UserRole.CUSTOMER, UserRole.EMPLOYEE),
    allowNull: false,
    defaultValue: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @HasMany(() => Session)
  sessions!: Session[];
}
