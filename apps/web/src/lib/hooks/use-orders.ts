'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelOrder,
  createOrder,
  getEmployeeOrders,
  getOrders,
  OrderStatus,
  PaginatedOrders,
  CreateOrderDto,
  updateOrderStatus,
} from '@/lib/api/order';

export const ORDERS_QUERY_KEY = ['orders'] as const;

export function useOrderHistory(params: { page: number; limit: number; status?: OrderStatus }) {
  return useQuery<PaginatedOrders, Error>({
    queryKey: ['orders', 'history', params],
    queryFn: () => getOrders(params),
  });
}

export function useEmployeeOrders(params: { page: number; limit: number; status?: OrderStatus; search?: string }) {
  return useQuery<PaginatedOrders, Error>({
    queryKey: ['orders', 'employee', params],
    queryFn: () => getEmployeeOrders(params),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, CreateOrderDto>({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
