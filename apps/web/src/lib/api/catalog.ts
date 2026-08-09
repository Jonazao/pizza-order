import { apiFetch } from './client';

export type CatalogCategory = 'Crust' | 'Sauce' | 'Base' | 'Toppings';

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: CatalogCategory;
  isVegan: boolean;
  isHealthy: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
  return apiFetch<CatalogItem[]>('/catalog');
}
