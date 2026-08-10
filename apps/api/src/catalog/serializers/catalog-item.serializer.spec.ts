import { serializeCatalogItem } from './catalog-item.serializer';
import { CatalogCategory } from '../enums/catalog-category.enum';
import { CatalogItem } from '../models/catalog-item.model';

describe('catalog-item.serializer', () => {
  it('maps a CatalogItem model to its response DTO without exposing internals', () => {
    const item = {
      id: 'item-1',
      title: 'Classic Crust',
      description: 'A classic crust',
      price: 3,
      category: CatalogCategory.CRUST,
      isVegan: true,
      isHealthy: false,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    } as unknown as CatalogItem;

    expect(serializeCatalogItem(item)).toEqual({
      id: 'item-1',
      title: 'Classic Crust',
      description: 'A classic crust',
      price: 3,
      category: CatalogCategory.CRUST,
      isVegan: true,
      isHealthy: false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  });
});
