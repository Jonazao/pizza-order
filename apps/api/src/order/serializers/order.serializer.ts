import { Order } from '../models/order.model';
import { OrderResponseDto } from '../dto/order-response.dto';

export function serializeOrder(order: Order): OrderResponseDto {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    items: order.pizzas,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ...(order.user ? { customerName: order.user.name } : {}),
  };
}
