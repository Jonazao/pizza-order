import { serializeOrder } from './order.serializer';
import { Order } from '../models/order.model';
import { OrderStatus } from '../enums/order-status.enum';

describe('order.serializer', () => {
  const lineItem = {
    customPizzaId: 'pizza-1',
    name: 'My Pizza',
    quantity: 2,
    unitPrice: 5,
    lineTotal: 10,
    ingredients: { crust: null, sauce: null, base: null, toppings: [] },
  };

  it('maps order fields and includes customerName when the user association is loaded', () => {
    const order = {
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.PENDING,
      pizzas: [lineItem],
      totalPrice: 10,
      createdAt: new Date('2026-08-09T00:00:00.000Z'),
      updatedAt: new Date('2026-08-09T00:00:00.000Z'),
      user: { name: 'John Doe' },
    } as unknown as Order;

    const result = serializeOrder(order);

    expect(result.id).toBe('order-1');
    expect(result.userId).toBe('user-1');
    expect(result.status).toBe(OrderStatus.PENDING);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
    expect(result.totalPrice).toBe(10);
    expect(result.customerName).toBe('John Doe');
  });

  it('omits customerName and handles empty items when user association is missing', () => {
    const order = {
      id: 'order-2',
      userId: 'user-2',
      status: OrderStatus.DELIVERED,
      pizzas: [],
      totalPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Order;

    const result = serializeOrder(order);

    expect(result.customerName).toBeUndefined();
    expect(result.items).toEqual([]);
    expect(result.status).toBe(OrderStatus.DELIVERED);
  });
});
