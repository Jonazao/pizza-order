'use client';

import { ReactNode } from 'react';
import { Order, OrderStatus } from '@/lib/api/order';

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
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

export const money = (value: number) => `$${value.toFixed(2)}`;
export const shortId = (id: string) => id.slice(0, 8);
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function OrderCard({
  order,
  footer,
}: {
  order: Order;
  footer: (order: Order) => ReactNode;
}) {
  return (
    <div className="h-full p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
      {/* Title */}
      <div className="flex justify-between items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-slate-900">
            #{shortId(order.id)}
          </span>
          <StatusBadge status={order.status} />
          {order.customerName && (
            <span className="text-[10px] text-slate-400 font-medium truncate">
              — {order.customerName}
            </span>
          )}
        </div>
        <span className="font-mono font-bold text-sm text-emerald-700 whitespace-nowrap">
          {money(order.totalPrice)}
        </span>
      </div>

      {/* Fixed scrollable body */}
      <div className="flex-1 min-h-0 max-h-[180px] overflow-y-auto pr-1 text-[11px] text-slate-500 font-light space-y-1">
        {order.items.map((item) => (
          <p key={item.customPizzaId} className="flex justify-between gap-2">
            <span className="truncate">
              {item.quantity} × {item.name}
            </span>
            <span className="font-mono text-slate-600 shrink-0">{money(item.lineTotal)}</span>
          </p>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center gap-2 border-t border-slate-100 pt-3 shrink-0 mt-auto">
        <span className="text-[10px] text-slate-400 font-light">{formatDate(order.createdAt)}</span>
        <div>{footer(order)}</div>
      </div>
    </div>
  );
}
