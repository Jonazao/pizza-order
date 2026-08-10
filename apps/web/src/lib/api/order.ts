import { apiFetch } from './client';
import { CatalogItem } from './catalog';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered';

export interface OrderIngredientSnapshot {
  crust: CatalogItem;
  sauce: CatalogItem;
  base: CatalogItem;
  toppings: CatalogItem[];
}

export interface OrderLineItem {
  customPizzaId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  ingredients: OrderIngredientSnapshot;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderLineItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrderItemDto {
  customPizzaId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface EmployeeOrdersQuery extends OrdersQuery {
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

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getOrders(query: OrdersQuery = {}): Promise<PaginatedOrders> {
  return apiFetch<PaginatedOrders>(`/orders${buildQueryString({ ...query })}`);
}

export async function getEmployeeOrders(query: EmployeeOrdersQuery = {}): Promise<PaginatedOrders> {
  return apiFetch<PaginatedOrders>(`/orders/employee${buildQueryString({ ...query })}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function cancelOrder(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/orders/${id}`, {
    method: 'DELETE',
  });
}
