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

export function useOrderHistory({ enabled, ...params }: { page: number; limit: number; status?: OrderStatus; enabled?: boolean }) {
  return useQuery<PaginatedOrders, Error>({
    queryKey: ['orders', 'history', params],
    queryFn: () => getOrders(params),
    enabled,
  });
}

export function useEmployeeOrders({ enabled, ...params }: { page: number; limit: number; status?: OrderStatus; search?: string; enabled?: boolean }) {
  return useQuery<PaginatedOrders, Error>({
    queryKey: ['orders', 'employee', params],
    queryFn: () => getEmployeeOrders(params),
    enabled,
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
