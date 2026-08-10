import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { CatalogItem } from '../../catalog/models/catalog-item.model';
import { CustomPizzaTopping } from './custom-pizza-topping.model';
import { CustomPizzaAttributes } from '../interfaces/custom-pizza.interface';

@Table({ tableName: 'custom_pizzas', timestamps: true })
export class CustomPizza extends Model<CustomPizza, CustomPizzaAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => CatalogItem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  crustId!: string;

  @BelongsTo(() => CatalogItem, { foreignKey: 'crustId', as: 'crust' })
  crust!: CatalogItem;

  @ForeignKey(() => CatalogItem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  sauceId!: string;

  @BelongsTo(() => CatalogItem, { foreignKey: 'sauceId', as: 'sauce' })
  sauce!: CatalogItem;

  @ForeignKey(() => CatalogItem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  baseId!: string;

  @BelongsTo(() => CatalogItem, { foreignKey: 'baseId', as: 'base' })
  base!: CatalogItem;

  @BelongsToMany(() => CatalogItem, () => CustomPizzaTopping)
  toppings!: CatalogItem[];
}
