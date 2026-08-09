import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CustomPizza } from './models/custom-pizza.model';
import { CustomPizzaTopping } from './models/custom-pizza-topping.model';
import { CatalogItem, CatalogCategory } from '../catalog/models/catalog-item.model';
import { CreateCustomPizzaDto } from './dto/create-custom-pizza.dto';
import { serializeCustomPizza } from './serializers/custom-pizza.serializer';

@Injectable()
export class CustomPizzaService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(CustomPizza)
    private customPizzaModel: typeof CustomPizza,
    @InjectModel(CatalogItem)
    private catalogItemModel: typeof CatalogItem,
  ) { }

  /**
   * Helper to set current user ID configuration context in a transaction for PostgreSQL RLS.
   */
  private async setRlsContext(userId: string, transaction: any): Promise<void> {
    await this.sequelize.query(
      `SELECT set_config('app.current_user_id', :userId, true);`,
      {
        replacements: { userId },
        transaction,
      }
    );
  }

  /**
   * Create a new custom pizza for a user, using RLS context at the database level.
   */
  async create(userId: string, dto: CreateCustomPizzaDto) {
    // 1. Validate ingredient categories at service level
    const crust = await this.catalogItemModel.findByPk(dto.crustId);
    if (!crust || crust.category !== CatalogCategory.CRUST) {
      throw new BadRequestException('Invalid crust selection');
    }

    const sauce = await this.catalogItemModel.findByPk(dto.sauceId);
    if (!sauce || sauce.category !== CatalogCategory.SAUCE) {
      throw new BadRequestException('Invalid sauce selection');
    }

    const base = await this.catalogItemModel.findByPk(dto.baseId);
    if (!base || base.category !== CatalogCategory.BASE) {
      throw new BadRequestException('Invalid base selection');
    }

    let toppings: CatalogItem[] = [];
    if (dto.toppings && dto.toppings.length > 0) {
      toppings = await this.catalogItemModel.findAll({
        where: {
          id: dto.toppings,
        },
      });

      // Ensure all toppings are valid and in Toppings category
      if (toppings.length !== dto.toppings.length) {
        throw new BadRequestException('One or more selected toppings are invalid');
      }

      for (const topping of toppings) {
        if (topping.category !== CatalogCategory.TOPPINGS) {
          throw new BadRequestException('All items in toppings list must belong to Toppings category');
        }
      }
    }

    // 2. Perform DB operations inside an RLS-enforced transaction
    const transaction = await this.sequelize.transaction();
    try {
      // Set RLS parameter first
      await this.setRlsContext(userId, transaction);

      // Create Custom Pizza record
      const customPizza = await this.customPizzaModel.create(
        {
          name: dto.name,
          userId,
          crustId: dto.crustId,
          sauceId: dto.sauceId,
          baseId: dto.baseId,
        },
        { transaction }
      );

      // Link toppings if any
      if (toppings.length > 0) {
        await customPizza.$set('toppings', toppings, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      // Fetch the complete pizza with its associations
      // Create a fresh read transaction for RLS consistency
      const readTransaction = await this.sequelize.transaction();
      try {
        await this.setRlsContext(userId, readTransaction);
        const savedPizza = await this.customPizzaModel.findByPk(customPizza.id, {
          include: [
            { model: CatalogItem, as: 'crust' },
            { model: CatalogItem, as: 'sauce' },
            { model: CatalogItem, as: 'base' },
            { model: CatalogItem, as: 'toppings', through: { attributes: [] } },
          ],
          transaction: readTransaction,
        });
        await readTransaction.commit();

        if (!savedPizza) {
          throw new NotFoundException('Saved pizza not found');
        }

        return serializeCustomPizza(savedPizza);
      } catch (err) {
        await readTransaction.rollback();
        throw err;
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Find all custom pizzas for a user, using RLS context at the database level.
   */
  async findAll(userId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      // Set RLS parameter first
      await this.setRlsContext(userId, transaction);

      // Query custom pizzas
      const pizzas = await this.customPizzaModel.findAll({
        where: { userId }, // Added service filter alongside RLS for defense-in-depth
        include: [
          { model: CatalogItem, as: 'crust' },
          { model: CatalogItem, as: 'sauce' },
          { model: CatalogItem, as: 'base' },
          { model: CatalogItem, as: 'toppings', through: { attributes: [] } },
        ],
        order: [['createdAt', 'DESC']],
        transaction,
      });

      await transaction.commit();

      return pizzas.map(serializeCustomPizza);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
