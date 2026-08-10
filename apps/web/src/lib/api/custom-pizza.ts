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

export interface PaginatedCustomPizzas {
  items: CustomPizza[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomPizzasQuery {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function createCustomPizza(dto: CreateCustomPizzaDto): Promise<CustomPizza> {
  return apiFetch<CustomPizza>('/custom-pizza', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getCustomPizzas(query: CustomPizzasQuery = {}): Promise<PaginatedCustomPizzas> {
  return apiFetch<PaginatedCustomPizzas>(
    `/custom-pizza${buildQueryString({ ...query })}`,
  );
}
