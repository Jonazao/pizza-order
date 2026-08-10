'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Order, OrderStatus } from '@/lib/api/order';
import { useEmployeeOrders, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { NEXT_STATUS, OrderCard } from '@/components/orders/order-card';
import { Pagination } from '@/components/orders/pagination';

const PAGE_SIZE = 10;

export default function EmployeeOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const employeeQuery = useEmployeeOrders({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
    search: submittedSearch || undefined,
    enabled: !!user,
  });
  const updateStatus = useUpdateOrderStatus();

  const resetPage = () => setPage(1);

  const handleAdvance = (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    updateStatus.mutate({ id: order.id, status: next });
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

  const data = employeeQuery.data;
  const orders = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Queue</h2>
          <p className="text-xs text-slate-400 font-light mt-1">
            All active orders across customers. Advance each order to the next stage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search customer or order id..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSubmittedSearch(e.target.value);
              resetPage();
            }}
            className="w-56 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white transition"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '');
              resetPage();
            }}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
          >
            <option value="">All Active</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {employeeQuery.isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-center rounded-3xl bg-white border border-slate-200/80">
          <span className="text-4xl">📋</span>
          <p className="text-sm font-bold text-slate-700">No orders in the queue</p>
          <p className="text-xs text-slate-400 font-light max-w-xs">
            Orders will appear here as customers submit them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <OrderCard
                key={order.id}
                order={order}
                footer={(o) =>
                  next ? (
                    <button
                      onClick={() => handleAdvance(o)}
                      disabled={updateStatus.isPending}
                      className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      Advance → {next}
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                  )
                }
              />
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}
