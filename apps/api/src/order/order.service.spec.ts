import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { OrderService } from './order.service';
import { Order } from './models/order.model';
import { CustomPizzaService } from '../custom-pizza/custom-pizza.service';
import { OrderStatus } from './enums/order-status.enum';
import { UserRole } from '../auth/models';

interface MockTransaction {
  commit: jest.Mock<Promise<void>>;
  rollback: jest.Mock<Promise<void>>;
}

interface MockSequelize {
  query: jest.Mock<Promise<unknown[]>>;
  transaction: jest.Mock<Promise<MockTransaction>>;
}

interface MockOrderModel {
  create: jest.Mock;
  findAndCountAll: jest.Mock;
  findByPk: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  destroy: jest.Mock;
}

interface MockCustomPizzaService {
  findByIds: jest.Mock;
}

describe('OrderService', () => {
  let service: OrderService;
  let mockTransaction: MockTransaction;
  let mockSequelize: MockSequelize;
  let mockOrderModel: MockOrderModel;
  let mockCustomPizzaService: MockCustomPizzaService;

  const serializedPizza = (id: string, name: string, totalPrice: number) => ({
    id,
    name,
    userId: 'user-1',
    totalPrice,
    crust: null,
    sauce: null,
    base: null,
    toppings: [],
  });

  const orderRow = (overrides: Partial<Order> = {}) => ({
    id: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDING,
    pizzas: [],
    totalPrice: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
    mockSequelize = {
      query: jest.fn().mockResolvedValue([]),
      transaction: jest.fn().mockResolvedValue(mockTransaction),
    };
    mockOrderModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };
    mockCustomPizzaService = {
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: Sequelize, useValue: mockSequelize as unknown as Sequelize },
        { provide: getModelToken(Order), useValue: mockOrderModel as unknown as typeof Order },
        { provide: CustomPizzaService, useValue: mockCustomPizzaService as unknown as CustomPizzaService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('builds a server-computed snapshot, computes totals, and persists a Pending order', async () => {
      mockCustomPizzaService.findByIds.mockResolvedValue([
        serializedPizza('pizza-1', 'Margherita', 5),
        serializedPizza('pizza-2', 'Pepperoni', 10),
      ]);
      mockOrderModel.create.mockResolvedValue(orderRow({ pizzas: [], totalPrice: 20 }));

      const result = await service.create('user-1', {
        items: [
          { customPizzaId: 'pizza-1', quantity: 2 },
          { customPizzaId: 'pizza-2', quantity: 1 },
        ],
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('set_config'),
        expect.objectContaining({ replacements: { userId: 'user-1', role: 'Customer' } }),
      );
      expect(mockCustomPizzaService.findByIds).toHaveBeenCalledWith('user-1', ['pizza-1', 'pizza-2']);
      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          status: OrderStatus.PENDING,
          totalPrice: 20,
        }),
        expect.any(Object),
      );
      expect(mockOrderModel.create.mock.calls[0][0].pizzas).toEqual([
        expect.objectContaining({ customPizzaId: 'pizza-1', quantity: 2, unitPrice: 5, lineTotal: 10 }),
        expect.objectContaining({ customPizzaId: 'pizza-2', quantity: 1, unitPrice: 10, lineTotal: 10 }),
      ]);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.id).toBe('order-1');
      expect(result.status).toBe(OrderStatus.PENDING);
    });

    it('merges duplicate custom pizza ids by summing quantities', async () => {
      mockCustomPizzaService.findByIds.mockResolvedValue([serializedPizza('pizza-1', 'Margherita', 5)]);
      mockOrderModel.create.mockResolvedValue(orderRow());

      await service.create('user-1', {
        items: [
          { customPizzaId: 'pizza-1', quantity: 2 },
          { customPizzaId: 'pizza-1', quantity: 3 },
        ],
      });

      expect(mockOrderModel.create.mock.calls[0][0].pizzas).toEqual([
        expect.objectContaining({ customPizzaId: 'pizza-1', quantity: 5, unitPrice: 5, lineTotal: 25 }),
      ]);
    });

    it('throws BadRequestException when a requested pizza is not owned by the user', async () => {
      mockCustomPizzaService.findByIds.mockResolvedValue([serializedPizza('pizza-1', 'Margherita', 5)]);

      await expect(
        service.create('user-1', { items: [{ customPizzaId: 'pizza-999', quantity: 1 }] }),
      ).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).not.toHaveBeenCalled(); // fails before opening a write transaction
    });
  });

  describe('findHistory', () => {
    it('paginates the customer\'s own orders with descending createdAt', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [orderRow()], count: 1 });

      const result = await service.findHistory('user-1', { page: 2, limit: 5 });

      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          order: [['createdAt', 'DESC']],
          limit: 5,
          offset: 5,
        }),
      );
      expect(result).toEqual({ items: [expect.objectContaining({ id: 'order-1' })], total: 1, page: 2, limit: 5 });
    });

    it('applies the status filter when provided', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findHistory('user-1', { status: OrderStatus.READY });

      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', status: OrderStatus.READY } }),
      );
    });
  });

  describe('findEmployeeQueue', () => {
    it('excludes Delivered orders by default', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findEmployeeQueue('emp-1', UserRole.EMPLOYEE, {});

      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: { [Op.ne]: OrderStatus.DELIVERED } } }),
      );
    });

    it('filters by an explicit status', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findEmployeeQueue('emp-1', UserRole.EMPLOYEE, { status: OrderStatus.PREPARING });

      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: OrderStatus.PREPARING } }),
      );
    });

    it('searches by customer name/email and matches order id for UUID terms', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findEmployeeQueue('emp-1', UserRole.EMPLOYEE, { search: '11111111-1111-4111-8111-111111111111' });

      const where = mockOrderModel.findAndCountAll.mock.calls[0][0].where;
      expect(where[Op.or]).toEqual([
        { '$user.name$': { [Op.iLike]: '%11111111-1111-4111-8111-111111111111%' } },
        { '$user.email$': { [Op.iLike]: '%11111111-1111-4111-8111-111111111111%' } },
        { id: '11111111-1111-4111-8111-111111111111' },
      ]);
    });

    it('includes the user association for the employee display', async () => {
      mockOrderModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findEmployeeQueue('emp-1', UserRole.EMPLOYEE, {});

      expect(mockOrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [{ model: expect.anything(), as: 'user', attributes: ['id', 'name', 'email'] }],
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('advances to the exact next state', async () => {
      mockOrderModel.findByPk
        .mockResolvedValueOnce(orderRow({ status: OrderStatus.PENDING }))
        .mockResolvedValueOnce(orderRow({ status: OrderStatus.PREPARING }));
      mockOrderModel.update.mockResolvedValue([1]);

      const result = await service.updateStatus('emp-1', UserRole.EMPLOYEE, 'order-1', { status: OrderStatus.PREPARING });

      expect(mockOrderModel.update).toHaveBeenCalledWith(
        { status: OrderStatus.PREPARING },
        expect.objectContaining({ where: { id: 'order-1', status: OrderStatus.PENDING } }),
      );
      expect(result.status).toBe(OrderStatus.PREPARING);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('rejects a non-consecutive transition', async () => {
      mockOrderModel.findByPk.mockResolvedValue(orderRow({ status: OrderStatus.PENDING }));

      await expect(
        service.updateStatus('emp-1', UserRole.EMPLOYEE, 'order-1', { status: OrderStatus.DELIVERED }),
      ).rejects.toThrow(ConflictException);
      expect(mockOrderModel.update).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws NotFoundException when the order does not exist', async () => {
      mockOrderModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateStatus('emp-1', UserRole.EMPLOYEE, 'order-1', { status: OrderStatus.PREPARING }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when a concurrent update changes the status first', async () => {
      mockOrderModel.findByPk.mockResolvedValue(orderRow({ status: OrderStatus.PENDING }));
      mockOrderModel.update.mockResolvedValue([0]);

      await expect(
        service.updateStatus('emp-1', UserRole.EMPLOYEE, 'order-1', { status: OrderStatus.PREPARING }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    it('cancels a pending order owned by the customer', async () => {
      mockOrderModel.findOne.mockResolvedValue(orderRow({ status: OrderStatus.PENDING }));
      mockOrderModel.destroy.mockResolvedValue(1);

      const result = await service.cancel('user-1', 'order-1');

      expect(mockOrderModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', userId: 'user-1', status: OrderStatus.PENDING },
        }),
      );
      expect(result).toEqual({ message: 'Order cancelled successfully' });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('rejects cancellation when the order is not pending', async () => {
      mockOrderModel.findOne.mockResolvedValue(orderRow({ status: OrderStatus.PREPARING }));

      await expect(service.cancel('user-1', 'order-1')).rejects.toThrow(ConflictException);
      expect(mockOrderModel.destroy).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the order is not found or not owned', async () => {
      mockOrderModel.findOne.mockResolvedValue(null);

      await expect(service.cancel('user-1', 'order-1')).rejects.toThrow(NotFoundException);
    });
  });
});
