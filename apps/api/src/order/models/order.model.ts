import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderLineItemSnapshotDto } from '../dto/order-line-item-snapshot.dto';
import { OrderAttributes } from '../interfaces/order.interface';

@Table({ tableName: 'orders', timestamps: true })
export class Order extends Model<Order, OrderAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User, { as: 'user' })
  user!: User;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  pizzas!: OrderLineItemSnapshotDto[];

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    get() {
      const rawValue = this.getDataValue('totalPrice');
      return rawValue ? parseFloat(rawValue as unknown as string) : 0;
    },
  })
  totalPrice!: number;
}
