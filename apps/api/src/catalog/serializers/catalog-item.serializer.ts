import { CatalogItem } from '../models/catalog-item.model';
import { CatalogItemResponseDto } from '../dto/catalog-item-response.dto';

export function serializeCatalogItem(item: CatalogItem): CatalogItemResponseDto {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    category: item.category,
    isVegan: item.isVegan,
    isHealthy: item.isHealthy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
