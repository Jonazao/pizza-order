import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { CustomPizza } from './custom-pizza.model';
import { CatalogItem } from '../../catalog/models/catalog-item.model';

@Table({ tableName: 'custom_pizza_toppings', timestamps: true })
export class CustomPizzaTopping extends Model {
  @ForeignKey(() => CustomPizza)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  customPizzaId!: string;

  @ForeignKey(() => CatalogItem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  catalogItemId!: string;
}
