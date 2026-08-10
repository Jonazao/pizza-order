import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CustomPizzaService } from './custom-pizza.service';
import { CustomPizza } from './models/custom-pizza.model';
import { CatalogItem } from '../catalog/models/catalog-item.model';

describe('CustomPizzaService', () => {
  let service: CustomPizzaService;
  let mockTransaction: { commit: jest.Mock; rollback: jest.Mock };
  let mockSequelize: any;
  let mockCustomPizzaModel: any;
  let mockCatalogItemModel: any;

  const pizzaRow = (id: string, name: string) => ({
    id,
    name,
    userId: 'user-1',
    crust: { id: 'crust-1', price: 3 },
    sauce: { id: 'sauce-1', price: 1 },
    base: { id: 'base-1', price: 2 },
    toppings: [{ id: 'topping-1', price: 1.5 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
    mockSequelize = {
      query: jest.fn().mockResolvedValue([]),
      transaction: jest.fn().mockResolvedValue(mockTransaction),
    };
    mockCustomPizzaModel = {
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
    };
    mockCatalogItemModel = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomPizzaService,
        { provide: Sequelize, useValue: mockSequelize },
        { provide: getModelToken(CustomPizza), useValue: mockCustomPizzaModel },
        { provide: getModelToken(CatalogItem), useValue: mockCatalogItemModel },
      ],
    }).compile();

    service = module.get<CustomPizzaService>(CustomPizzaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('paginates with the user filter, distinct count, and default sort', async () => {
      mockCustomPizzaModel.findAndCountAll.mockResolvedValue({
        rows: [pizzaRow('pizza-1', 'Margherita')],
        count: 1,
      });

      const result = await service.findAll('user-1', { page: 2, limit: 5 });

      expect(mockCustomPizzaModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          distinct: true,
          order: [['createdAt', 'DESC']],
          limit: 5,
          offset: 5,
        }),
      );
      expect(result).toEqual({
        items: [expect.objectContaining({ id: 'pizza-1', name: 'Margherita', totalPrice: 7.5 })],
        total: 1,
        page: 2,
        limit: 5,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('searches by name with a case-insensitive match and applies the requested sort', async () => {
      mockCustomPizzaModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('user-1', { search: 'pepperoni', sortBy: 'name', sortOrder: 'ASC' });

      expect(mockCustomPizzaModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', name: { [Op.iLike]: '%pepperoni%' } },
          order: [['name', 'ASC']],
        }),
      );
    });

    it('does not add a search clause when search is empty', async () => {
      mockCustomPizzaModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('user-1', { search: '   ' });

      expect(mockCustomPizzaModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('findByIds', () => {
    it('returns serialized pizzas scoped to the user and requested ids', async () => {
      mockCustomPizzaModel.findAll.mockResolvedValue([pizzaRow('pizza-1', 'Margherita')]);

      const result = await service.findByIds('user-1', ['pizza-1']);

      expect(mockCustomPizzaModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { [Op.in]: ['pizza-1'] }, userId: 'user-1' },
        }),
      );
      expect(result).toEqual([expect.objectContaining({ id: 'pizza-1', totalPrice: 7.5 })]);
    });

    it('returns an empty array without querying when no ids are supplied', async () => {
      const result = await service.findByIds('user-1', []);

      expect(result).toEqual([]);
      expect(mockCustomPizzaModel.findAll).not.toHaveBeenCalled();
    });
  });
});
