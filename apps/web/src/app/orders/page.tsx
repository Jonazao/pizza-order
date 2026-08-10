'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Order,
  OrderStatus,
} from '@/lib/api/order';
import {
  useCancelOrder,
  useEmployeeOrders,
  useOrderHistory,
  useUpdateOrderStatus,
} from '@/lib/hooks/use-orders';

const PAGE_SIZE = 10;

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Delivered',
  Delivered: null,
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: 'bg-orange-50 text-orange-700 border-orange-200',
  Preparing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Delivered: 'bg-slate-100 text-slate-600 border-slate-200',
};

const money = (value: number) => `$${value.toFixed(2)}`;
const shortId = (id: string) => id.slice(0, 8);
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function OrderCard({
  order,
  footer,
}: {
  order: Order;
  footer: (order: Order) => React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-slate-900">
            #{shortId(order.id)}
          </span>
          <StatusBadge status={order.status} />
          {'customerName' in order && order.customerName && (
            <span className="text-[10px] text-slate-400 font-medium truncate">
              — {order.customerName}
            </span>
          )}
        </div>
        <span className="font-mono font-bold text-sm text-emerald-700 whitespace-nowrap">
          {money(order.totalPrice)}
        </span>
      </div>

      <div className="text-[11px] text-slate-500 font-light space-y-1">
        {order.items.map((item) => (
          <p key={item.customPizzaId} className="flex justify-between gap-2">
            <span className="truncate">
              {item.quantity} × {item.name}
            </span>
            <span className="font-mono text-slate-600 shrink-0">{money(item.lineTotal)}</span>
          </p>
        ))}
      </div>

      <div className="flex justify-between items-center gap-2 border-t border-slate-100 pt-3">
        <span className="text-[10px] text-slate-400 font-light">{formatDate(order.createdAt)}</span>
        <div>{footer(order)}</div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:border-emerald-600/40 transition cursor-pointer disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-xs font-medium text-slate-500">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:border-emerald-600/40 transition cursor-pointer disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const isEmployee = user?.role === 'Employee';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const historyQuery = useOrderHistory({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
  });
  const employeeQuery = useEmployeeOrders({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
    search: submittedSearch || undefined,
  });

  const activeQuery = isEmployee ? employeeQuery : historyQuery;
  const data = activeQuery.data;
  const orders = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();

  const resetPage = () => setPage(1);

  const handleAdvance = (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    updateStatus.mutate({ id: order.id, status: next });
  };

  const handleCancel = (order: Order) => {
    setCancelTarget(order);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancelOrder.mutate(cancelTarget.id, {
      onSettled: () => setCancelTarget(null),
    });
  };

  const renderFooter = (order: Order) => {
    if (isEmployee) {
      const next = NEXT_STATUS[order.status];
      return next ? (
        <button
          onClick={() => handleAdvance(order)}
          disabled={updateStatus.isPending}
          className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
        >
          Advance → {next}
        </button>
      ) : (
        <span className="text-[10px] text-slate-400 font-medium">Completed</span>
      );
    }
    return order.status === 'Pending' ? (
      <button
        onClick={() => handleCancel(order)}
        disabled={cancelOrder.isPending}
        className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
      >
        Cancel Order
      </button>
    ) : (
      <span className="text-[10px] text-slate-400 font-medium">Cancellation unavailable</span>
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex-1 min-h-screen bg-stone-50">
        <AppHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Loading orders...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-stone-50">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEmployee ? 'Order Queue' : 'Order History'}
            </h2>
            <p className="text-xs text-slate-400 font-light mt-1">
              {isEmployee
                ? 'All active orders across customers. Advance each order to the next stage.'
                : 'Review your past and current orders. Pending orders can be cancelled.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEmployee && (
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
            )}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                resetPage();
              }}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
            >
              <option value="">{isEmployee ? 'All Active' : 'All Statuses'}</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              {isEmployee && <option value="Delivered">Delivered</option>}
            </select>
          </div>
        </div>

        {activeQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-center rounded-3xl bg-white border border-slate-200/80">
            <span className="text-4xl">{isEmployee ? '📋' : '🧾'}</span>
            <p className="text-sm font-bold text-slate-700">
              {isEmployee ? 'No orders in the queue' : 'No orders yet'}
            </p>
            <p className="text-xs text-slate-400 font-light max-w-xs">
              {isEmployee
                ? 'Orders will appear here as customers submit them.'
                : 'Place your first order from the Ordering page to see it here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} footer={renderFooter} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>

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
    </div>
  );
}
