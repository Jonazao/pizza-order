import { Op } from 'sequelize';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderLineItemSnapshotDto } from '../dto/order-line-item-snapshot.dto';
import { OrderResponseDto } from '../dto/order-response.dto';

export interface OrderAttributes {
  id?: string;
  userId: string;
  status?: OrderStatus;
  pizzas: OrderLineItemSnapshotDto[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedOrdersResponse {
  items: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderWhereOptions {
  [key: string]: unknown;
  [Op.or]?: OrderWhereOptions[];
}
