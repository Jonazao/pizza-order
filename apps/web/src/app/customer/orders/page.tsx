'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Order, OrderStatus } from '@/lib/api/order';
import { useCancelOrder, useOrderHistory } from '@/lib/hooks/use-orders';
import { OrderCard, StatusBadge, money, shortId } from '@/components/orders/order-card';
import { Pagination } from '@/components/orders/pagination';

const PAGE_SIZE = 10;

export default function CustomerOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const historyQuery = useOrderHistory({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
    enabled: !!user,
  });
  const cancelOrder = useCancelOrder();

  const resetPage = () => setPage(1);

  const handleCancel = (order: Order) => {
    setCancelTarget(order);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancelOrder.mutate(cancelTarget.id, {
      onSettled: () => setCancelTarget(null),
    });
  };

  if (authLoading || !user) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading orders...</p>
        </div>
      </main>
    );
  }

  const data = historyQuery.data;
  const orders = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order History</h2>
          <p className="text-xs text-slate-400 font-light mt-1">
            Review your past and current orders. Pending orders can be cancelled.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | '');
            resetPage();
          }}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {historyQuery.isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-center rounded-3xl bg-white border border-slate-200/80">
          <span className="text-4xl">🧾</span>
          <p className="text-sm font-bold text-slate-700">No orders yet</p>
          <p className="text-xs text-slate-400 font-light max-w-xs">
            Place your first order from the Ordering page to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              footer={(o) =>
                o.status === 'Pending' ? (
                  <button
                    onClick={() => handleCancel(o)}
                    disabled={cancelOrder.isPending}
                    className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Cancellation unavailable</span>
                )
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                Cancel Order #{shortId(cancelTarget.id)}?
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                This action cannot be undone. Your order will be removed from your history.
              </p>
            </div>

            <div className="px-6 py-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Items</span>
                <span className="text-slate-900 font-semibold">
                  {cancelTarget.items.length} pizza{cancelTarget.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Status</span>
                <StatusBadge status={cancelTarget.status} />
              </div>
              <div className="rounded-2xl bg-stone-50 border border-slate-200 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {money(cancelTarget.totalPrice)}
                </span>
              </div>
              {cancelOrder.isError && cancelOrder.error && (
                <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  ⚠️ {cancelOrder.error.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelOrder.isPending}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelOrder.isPending}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
