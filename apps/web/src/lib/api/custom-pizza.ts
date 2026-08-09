import { apiFetch } from './client';
import { CatalogItem } from './catalog';

export interface CustomPizza {
  id: string;
  name: string;
  userId: string;
  crust: CatalogItem;
  sauce: CatalogItem;
  base: CatalogItem;
  toppings: CatalogItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomPizzaDto {
  name: string;
  crustId: string;
  sauceId: string;
  baseId: string;
  toppings: string[];
}

export async function createCustomPizza(dto: CreateCustomPizzaDto): Promise<CustomPizza> {
  return apiFetch<CustomPizza>('/custom-pizza', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getCustomPizzas(): Promise<CustomPizza[]> {
  return apiFetch<CustomPizza[]>('/custom-pizza');
}
