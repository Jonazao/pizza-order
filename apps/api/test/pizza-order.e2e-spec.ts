import './set-test-env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/common/enums/user-role.enum';
import { OrderStatus } from '../src/order/enums/order-status.enum';

interface AuthResponseBody {
  user: { id: string; email: string; name: string; role: UserRole };
  accessToken: string;
}

interface CatalogItemBody {
  id: string;
  title: string;
  price: number;
  category: string;
}

interface CustomPizzaBody {
  id: string;
  name: string;
  userId: string;
  toppings: { id: string }[];
  totalPrice: number;
}

interface OrderLineItemBody {
  customPizzaId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderBody {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderLineItemBody[];
  customerName?: string;
}

interface PaginatedBody<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

const EMPLOYEE_EMAIL = 'employee@example.com';
const EMPLOYEE_PASSWORD = 'Employee123!';
const CUSTOMER_PASSWORD = 'Password123!';
const CUSTOMER_A_EMAIL = 'e2e-customer-a@example.com';
const CUSTOMER_B_EMAIL = 'e2e-customer-b@example.com';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

describe('Pizza Order API (e2e)', () => {
  let app: INestApplication;

  let customerAToken: string;
  let customerBToken: string;
  let customerAId: string;
  let employeeToken: string;

  let crustId: string;
  let sauceId: string;
  let baseId: string;
  let toppingId: string;
  let crustPrice: number;
  let saucePrice: number;
  let basePrice: number;
  let toppingPrice: number;

  const registerCustomer = (email: string, name: string): Promise<request.Response> =>
    request(app.getHttpServer()).post('/api/auth/register').send({ email, password: CUSTOMER_PASSWORD, name }).expect(201);

  const createCustomPizza = async (token: string, name: string, withTopping = false): Promise<CustomPizzaBody> => {
    const payload: { name: string; crustId: string; sauceId: string; baseId: string; toppings?: string[] } = {
      name,
      crustId,
      sauceId,
      baseId,
    };
    if (withTopping) {
      payload.toppings = [toppingId];
    }
    const res = await request(app.getHttpServer())
      .post('/api/custom-pizza')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);
    return res.body as CustomPizzaBody;
  };

  const createOrder = async (
    token: string,
    items: { customPizzaId: string; quantity: number }[],
  ): Promise<OrderBody> => {
    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items })
      .expect(201);
    return res.body as OrderBody;
  };

  const updateStatus = (token: string, orderId: string, status: OrderStatus): request.Test =>
    request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const regA = await registerCustomer(CUSTOMER_A_EMAIL, 'Customer A');
    const regB = await registerCustomer(CUSTOMER_B_EMAIL, 'Customer B');
    customerAToken = (regA.body as AuthResponseBody).accessToken;
    customerBToken = (regB.body as AuthResponseBody).accessToken;
    customerAId = (regA.body as AuthResponseBody).user.id;

    const employeeLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD })
      .expect(200);
    employeeToken = (employeeLogin.body as AuthResponseBody).accessToken;

    const catalogRes = await request(app.getHttpServer()).get('/api/catalog').expect(200);
    const catalog = catalogRes.body as CatalogItemBody[];
    const crust = catalog.find((item) => item.category === 'Crust');
    const sauce = catalog.find((item) => item.category === 'Sauce');
    const base = catalog.find((item) => item.category === 'Base');
    const topping = catalog.find((item) => item.category === 'Toppings');
    if (!crust || !sauce || !base || !topping) {
      throw new Error('Seeded catalog is missing an ingredient category');
    }
    crustId = crust.id;
    sauceId = sauce.id;
    baseId = base.id;
    toppingId = topping.id;
    crustPrice = crust.price;
    saucePrice = sauce.price;
    basePrice = base.price;
    toppingPrice = topping.price;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup', () => {
    it('should register two customer users and authenticate the seeded employee', async () => {
      expect(customerAToken).toBeDefined();
      expect(customerBToken).toBeDefined();
      expect(customerAId).toBeDefined();
      expect(employeeToken).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: CUSTOMER_B_EMAIL, password: CUSTOMER_PASSWORD, name: 'Customer B' })
        .expect(409);
      expect(res.body.message).toBe('User with this email already exists');
    });
  });

  describe('Customer - GREEN', () => {
    it('should fetch the public catalog with seeded items', async () => {
      const res = await request(app.getHttpServer()).get('/api/catalog').expect(200);
      const items = res.body as CatalogItemBody[];
      expect(items.length).toBeGreaterThan(0);
      const categories = new Set(items.map((item) => item.category));
      for (const category of ['Crust', 'Sauce', 'Base', 'Toppings']) {
        expect(categories.has(category)).toBe(true);
      }
      expect(items.some((item) => item.title === 'Classic Hand-Tossed Crust')).toBe(true);
    });

    it('should create a custom pizza and compute its price from crust + sauce + base', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Customer A Signature');
      expect(pizza.id).toBeDefined();
      expect(pizza.userId).toBe(customerAId);
      expect(pizza.toppings).toHaveLength(0);
      expect(pizza.totalPrice).toBe(round2(crustPrice + saucePrice + basePrice));
    });

    it('should create a custom pizza with toppings included in the price', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Customer A Loaded', true);
      expect(pizza.toppings).toHaveLength(1);
      expect(pizza.totalPrice).toBe(round2(crustPrice + saucePrice + basePrice + toppingPrice));
    });

    it('should create an order with a single pizza', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Single Pizza');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.totalPrice).toBe(pizza.totalPrice);
      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toMatchObject({
        customPizzaId: pizza.id,
        quantity: 1,
        unitPrice: pizza.totalPrice,
        lineTotal: pizza.totalPrice,
      });
    });

    it('should create an order with many pizzas and different quantities (merging duplicates)', async () => {
      const plain = await createCustomPizza(customerAToken, 'Multi Plain');
      const loaded = await createCustomPizza(customerAToken, 'Multi Loaded', true);
      const order = await createOrder(customerAToken, [
        { customPizzaId: plain.id, quantity: 2 },
        { customPizzaId: loaded.id, quantity: 3 },
        { customPizzaId: plain.id, quantity: 1 },
      ]);

      expect(order.items).toHaveLength(2);

      const plainItem = order.items.find((item) => item.customPizzaId === plain.id);
      const loadedItem = order.items.find((item) => item.customPizzaId === loaded.id);
      expect(plainItem?.quantity).toBe(3);
      expect(plainItem?.lineTotal).toBe(round2(3 * plain.totalPrice));
      expect(loadedItem?.quantity).toBe(3);
      expect(loadedItem?.lineTotal).toBe(round2(3 * loaded.totalPrice));
      expect(order.totalPrice).toBe(round2(3 * plain.totalPrice + 3 * loaded.totalPrice));
    });

    it('should cancel an own pending order', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Cancel Me');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      const res = await request(app.getHttpServer())
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${customerAToken}`)
        .expect(200);
      expect(res.body).toEqual({ message: 'Order cancelled successfully' });
    });
  });

  describe('Customer - RED', () => {
    it('should reject cancelling an order that is no longer pending', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Too Late');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      await updateStatus(employeeToken, order.id, OrderStatus.PREPARING).expect(200);

      const res = await request(app.getHttpServer())
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${customerAToken}`)
        .expect(409);
      expect(res.body.message).toBe('Only pending orders can be cancelled');
    });

    it('should not expose another customer custom pizzas', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Private Pizza');

      const res = await request(app.getHttpServer())
        .get('/api/custom-pizza')
        .set('Authorization', `Bearer ${customerBToken}`)
        .expect(200);
      const body = res.body as PaginatedBody<CustomPizzaBody>;

      expect(body.items.some((item) => item.id === pizza.id)).toBe(false);
      expect(body.total).toBe(body.items.length);
    });

    it('should not expose another customer orders', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Hidden Order');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      const res = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerBToken}`)
        .expect(200);
      const body = res.body as PaginatedBody<OrderBody>;

      expect(body.items.some((item) => item.id === order.id)).toBe(false);
    });

    it('should reject cancelling another customer order', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Not Yours');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      const res = await request(app.getHttpServer())
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${customerBToken}`)
        .expect(404);
      expect(res.body.message).toBe('Order not found');
    });
  });

  describe('Employee - GREEN', () => {
    it('should list all customer orders in the employee queue with customer names', async () => {
      const pizzaA = await createCustomPizza(customerAToken, 'Emp Queue A');
      const orderA = await createOrder(customerAToken, [{ customPizzaId: pizzaA.id, quantity: 1 }]);
      const pizzaB = await createCustomPizza(customerBToken, 'Emp Queue B');
      const orderB = await createOrder(customerBToken, [{ customPizzaId: pizzaB.id, quantity: 1 }]);

      const res = await request(app.getHttpServer())
        .get('/api/orders/employee')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);
      const body = res.body as PaginatedBody<OrderBody>;
      const ids = body.items.map((item) => item.id);

      expect(ids).toContain(orderA.id);
      expect(ids).toContain(orderB.id);
      const orderAItem = body.items.find((item) => item.id === orderA.id);
      expect(orderAItem?.customerName).toBe('Customer A');
    });

    it('should transition an order through pending -> preparing -> ready -> delivered', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Transitions');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);
      expect(order.status).toBe(OrderStatus.PENDING);

      let res = await updateStatus(employeeToken, order.id, OrderStatus.PREPARING).expect(200);
      expect((res.body as OrderBody).status).toBe(OrderStatus.PREPARING);

      res = await updateStatus(employeeToken, order.id, OrderStatus.READY).expect(200);
      expect((res.body as OrderBody).status).toBe(OrderStatus.READY);

      res = await updateStatus(employeeToken, order.id, OrderStatus.DELIVERED).expect(200);
      expect((res.body as OrderBody).status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('Employee - RED', () => {
    it('should reject skipping a status transition (pending -> ready)', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Skip One');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      const res = await updateStatus(employeeToken, order.id, OrderStatus.READY).expect(409);
      expect(res.body.message).toContain('Cannot transition');
    });

    it('should reject multi-step transitions (pending -> delivered)', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Skip Two');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      const res = await updateStatus(employeeToken, order.id, OrderStatus.DELIVERED).expect(409);
      expect(res.body.message).toContain('Cannot transition');
    });

    it('should reject backward transitions (preparing -> pending)', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Backwards');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      await updateStatus(employeeToken, order.id, OrderStatus.PREPARING).expect(200);

      const res = await updateStatus(employeeToken, order.id, OrderStatus.PENDING).expect(409);
      expect(res.body.message).toContain('Cannot transition');
    });
  });

  describe('Bonus - role and auth guards', () => {
    it('should reject a customer updating an order status', async () => {
      const pizza = await createCustomPizza(customerAToken, 'No Status');
      const order = await createOrder(customerAToken, [{ customPizzaId: pizza.id, quantity: 1 }]);

      await updateStatus(customerAToken, order.id, OrderStatus.PREPARING).expect(403);
    });

    it('should reject an employee creating a customer order', async () => {
      const pizza = await createCustomPizza(customerAToken, 'Emp No Order');

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ items: [{ customPizzaId: pizza.id, quantity: 1 }] })
        .expect(403);
    });

    it('should reject a customer accessing the employee queue', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/employee')
        .set('Authorization', `Bearer ${customerAToken}`)
        .expect(403);
    });

    it('should reject unauthenticated access to protected endpoints', async () => {
      await request(app.getHttpServer()).get('/api/custom-pizza').expect(401);
      await request(app.getHttpServer()).get('/api/orders').expect(401);
      await request(app.getHttpServer()).post('/api/orders').send({ items: [] }).expect(401);
    });
  });
});
