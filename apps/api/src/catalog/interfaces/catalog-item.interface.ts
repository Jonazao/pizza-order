import { CatalogCategory } from '../enums/catalog-category.enum';

export interface CatalogItemAttributes {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: CatalogCategory;
  isVegan?: boolean;
  isHealthy?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
