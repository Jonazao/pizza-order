import { OrderStatus } from '../enums/order-status.enum';
import { ORDER_STATUS_TRANSITIONS } from '../constants/order-status-transitions';

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  return ORDER_STATUS_TRANSITIONS[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from] === to;
}
