import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { CatalogCategory } from '../enums/catalog-category.enum';
import { CatalogItemAttributes } from '../interfaces/catalog-item.interface';

@Table({ tableName: 'catalog_items', timestamps: true })
export class CatalogItem extends Model<CatalogItem, CatalogItemAttributes> {
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
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('price');
      return rawValue ? parseFloat(rawValue as unknown as string) : 0;
    },
  })
  price!: number;

  @Column({
    type: DataType.ENUM(...Object.values(CatalogCategory)),
    allowNull: false,
  })
  category!: CatalogCategory;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVegan!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isHealthy!: boolean;
}
