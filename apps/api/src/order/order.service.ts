import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { isUUID } from 'class-validator';
import { Order } from './models/order.model';
import { User } from '../auth/models/user.model';
import { UserRole } from '../auth/models';
import { CustomPizzaService } from '../custom-pizza/custom-pizza.service';
import {
  CreateOrderDto,
  FindEmployeeOrdersQueryDto,
  FindOrdersQueryDto,
  OrderLineItemSnapshotDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from './dto';
import { serializeOrder } from './serializers/order.serializer';
import { OrderWhereOptions, PaginatedOrdersResponse } from './interfaces';
import { canTransition } from './helpers/order-status.helper';
import { round2 } from './helpers/money.helper';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    private readonly customPizzaService: CustomPizzaService,
  ) {}

  /**
   * Helper to set current user id + role context in a transaction for PostgreSQL RLS.
   */
  private async setRlsContext(userId: string, role: UserRole, transaction: Transaction): Promise<void> {
    await this.sequelize.query(
      `SELECT set_config('app.current_user_id', :userId, true), set_config('app.current_user_role', :role, true);`,
      {
        replacements: { userId, role },
        transaction,
      }
    );
  }

  /**
   * Create a new order from the user's saved custom pizzas.
   * Prices are recomputed server-side from the DB and snapshotted into JSONB.
   */
  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    // 1. Merge duplicate custom pizza ids and fetch the user's pizzas (server-side pricing)
    const quantityMap = new Map<string, number>();
    for (const item of dto.items) {
      quantityMap.set(item.customPizzaId, (quantityMap.get(item.customPizzaId) ?? 0) + item.quantity);
    }
    const ids = [...quantityMap.keys()];

    const pizzas = await this.customPizzaService.findByIds(userId, ids);
    const pizzaMap = new Map(pizzas.map((pizza) => [pizza.id, pizza]));

    // 2. Build the server-computed snapshot
    const items: OrderLineItemSnapshotDto[] = [...quantityMap.entries()].map(([customPizzaId, quantity]) => {
      const pizza = pizzaMap.get(customPizzaId);
      if (!pizza) {
        throw new BadRequestException(`Custom pizza ${customPizzaId} does not exist or is not yours`);
      }
      const unitPrice = pizza.totalPrice;
      return {
        customPizzaId: pizza.id,
        name: pizza.name,
        quantity,
        unitPrice,
        lineTotal: round2(unitPrice * quantity),
        ingredients: {
          crust: pizza.crust,
          sauce: pizza.sauce,
          base: pizza.base,
          toppings: pizza.toppings,
        },
      };
    });

    const totalPrice = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));

    // 3. Persist order inside an RLS-enforced transaction
    const transaction = await this.sequelize.transaction();
    try {
      await this.setRlsContext(userId, UserRole.CUSTOMER, transaction);

      const order = await this.orderModel.create(
        {
          userId,
          status: OrderStatus.PENDING,
          pizzas: items,
          totalPrice,
        },
        { transaction }
      );

      await transaction.commit();
      return serializeOrder(order);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Retrieve the authenticated customer's order history (paginated, optional status filter).
   */
  async findHistory(userId: string, query: FindOrdersQueryDto): Promise<PaginatedOrdersResponse> {
    const { page = 1, limit = 10, status } = query;
    const where: WhereOptions<Order> = status ? { userId, status } : { userId };

    const transaction = await this.sequelize.transaction();
    try {
      await this.setRlsContext(userId, UserRole.CUSTOMER, transaction);

      const { rows, count } = await this.orderModel.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        transaction,
      });

      await transaction.commit();
      return {
        items: rows.map(serializeOrder),
        total: count,
        page,
        limit,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Employee queue: all orders, excluding Delivered by default, searchable by order id /
   * customer name/email and filterable by status.
   */
  async findEmployeeQueue(
    employeeId: string,
    role: UserRole,
    query: FindEmployeeOrdersQueryDto,
  ): Promise<PaginatedOrdersResponse> {
    const { page = 1, limit = 10, status, search } = query;

    const where: OrderWhereOptions = status
      ? { status }
      : { status: { [Op.ne]: OrderStatus.DELIVERED } };

    if (search && search.trim()) {
      const term = search.trim();
      const conditions: OrderWhereOptions[] = [
        { '$user.name$': { [Op.iLike]: `%${term}%` } },
        { '$user.email$': { [Op.iLike]: `%${term}%` } },
      ];
      if (isUUID(term)) {
        conditions.push({ id: term });
      }
      where[Op.or] = conditions;
    }

    const transaction = await this.sequelize.transaction();
    try {
      await this.setRlsContext(employeeId, role, transaction);

      const { rows, count } = await this.orderModel.findAndCountAll({
        where: where as WhereOptions<Order>,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        transaction,
      });

      await transaction.commit();
      return {
        items: rows.map(serializeOrder),
        total: count,
        page,
        limit,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Transition an order to the next state. Only valid single-step forward transitions
   * are allowed; the write is atomic to prevent race conditions.
   */
  async updateStatus(
    employeeId: string,
    role: UserRole,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const next = dto.status;

    const transaction = await this.sequelize.transaction();
    try {
      await this.setRlsContext(employeeId, role, transaction);

      const order = await this.orderModel.findByPk(orderId, { transaction });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (!canTransition(order.status, next)) {
        throw new ConflictException(
          `Cannot transition order from '${order.status}' to '${next}'. Only single forward steps are allowed.`
        );
      }

      const [affected] = await this.orderModel.update(
        { status: next },
        { where: { id: orderId, status: order.status }, transaction }
      );
      if (affected === 0) {
        throw new ConflictException('Order status changed concurrently. Refresh and retry.');
      }

      const updated = await this.orderModel.findByPk(orderId, { transaction });
      if (!updated) {
        throw new NotFoundException('Order not found');
      }
      await transaction.commit();
      return serializeOrder(updated);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancel a pending order. Only the owning customer can cancel, and only while Pending.
   */
  async cancel(customerId: string, orderId: string): Promise<{ message: string }> {
    const transaction = await this.sequelize.transaction();
    try {
      await this.setRlsContext(customerId, UserRole.CUSTOMER, transaction);

      const order = await this.orderModel.findOne({
        where: { id: orderId, userId: customerId },
        transaction,
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new ConflictException('Only pending orders can be cancelled');
      }

      const deleted = await this.orderModel.destroy({
        where: { id: orderId, userId: customerId, status: OrderStatus.PENDING },
        transaction,
      });
      if (deleted === 0) {
        throw new ConflictException('Order can no longer be cancelled');
      }

      await transaction.commit();
      return { message: 'Order cancelled successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
