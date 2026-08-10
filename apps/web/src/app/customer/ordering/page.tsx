'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { getCustomPizzas, CustomPizza } from '@/lib/api/custom-pizza';
import { createOrder } from '@/lib/api/order';
import { useSnackbar } from '@/components/snackbar/snackbar';

interface CartLine {
  pizza: CustomPizza;
  quantity: number;
}

const PAGE_SIZE = 9;

const money = (value: number) => `$${value.toFixed(2)}`;

export default function OrderingPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const snackbar = useSnackbar();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pizzasQuery = useQuery({
    queryKey: ['custom-pizzas', 'ordering', { page, search, sortBy, sortOrder }],
    queryFn: () => getCustomPizzas({ page, limit: PAGE_SIZE, search, sortBy, sortOrder }),
    enabled: !!user,
  });

  const data = pizzasQuery.data;
  const pizzas = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const isPendingSubmit = pizzasQuery.isFetching;

  const cartTotal = useMemo(
    () =>
      parseFloat(
        cart.reduce((sum, line) => sum + line.quantity * line.pizza.totalPrice, 0).toFixed(2)
      ),
    [cart]
  );

  const setQuantityFor = (pizzaId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [pizzaId]: Math.max(1, Math.min(50, value || 1)) }));
  };

  const handleAddToOrder = (pizza: CustomPizza) => {
    const qty = quantities[pizza.id] ?? 1;
    setCart((prev) => {
      const existing = prev.find((line) => line.pizza.id === pizza.id);
      if (existing) {
        return prev.map((line) =>
          line.pizza.id === pizza.id
            ? { ...line, quantity: line.quantity + qty }
            : line
        );
      }
      return [...prev, { pizza, quantity: qty }];
    });
  };

  const handleRemoveFromCart = (pizzaId: string) => {
    setCart((prev) => prev.filter((line) => line.pizza.id !== pizzaId));
  };

  const handleSubmitOrder = async () => {
    try {
      const order = await createOrder({
        items: cart.map((line) => ({
          customPizzaId: line.pizza.id,
          quantity: line.quantity,
        })),
      });
      snackbar.success(
        `🎉 Order #${order.id.slice(0, 8)} placed successfully! Total ${money(order.totalPrice)}.`
      );
      setConfirmOpen(false);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/customer/orders');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order.';
      snackbar.error(message);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading ordering...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Custom pizza selection */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Build Your Order
              </h2>
              <p className="text-xs text-slate-400 font-light mt-1">
                Pick from your saved custom pizzas, set quantities, and add them to your order.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Search saved pizzas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-48 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white transition"
              />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'name' | 'createdAt');
                  setPage(1);
                }}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date</option>
              </select>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-emerald-600/40 transition cursor-pointer"
                title="Toggle sort direction"
              >
                {sortOrder === 'ASC' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {pizzasQuery.isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
              <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
              <p className="text-xs font-medium text-slate-500">Loading your custom pizzas...</p>
            </div>
          ) : pizzas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-center rounded-3xl bg-white border border-slate-200/80">
              <span className="text-4xl">👩‍🍳</span>
              <p className="text-sm font-bold text-slate-700">
                {search ? 'No pizzas match your search' : 'You have no saved custom pizzas yet'}
              </p>
              <p className="text-xs text-slate-400 font-light max-w-xs">
                {search
                  ? 'Try a different search term.'
                  : 'Create a signature recipe in the Pizza Builder to start ordering it instantly.'}
              </p>
              {!search && (
                <Link
                  href="/pizza-builder"
                  className="mt-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  Open Pizza Builder
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pizzas.map((pizza) => (
                <div
                  key={pizza.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                        {pizza.name}
                      </h4>
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {money(pizza.totalPrice)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-light leading-normal space-y-0.5">
                      <p>• <span className="font-medium">Crust:</span> {pizza.crust?.title}</p>
                      <p>• <span className="font-medium">Sauce:</span> {pizza.sauce?.title}</p>
                      <p>• <span className="font-medium">Base:</span> {pizza.base?.title}</p>
                      {pizza.toppings && pizza.toppings.length > 0 && (
                        <p className="truncate">
                          • <span className="font-medium">Toppings:</span>{' '}
                          {pizza.toppings.map((t) => t.title).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setQuantityFor(pizza.id, (quantities[pizza.id] ?? 1) - 1)
                        }
                        className="px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={quantities[pizza.id] ?? 1}
                        onChange={(e) => setQuantityFor(pizza.id, parseInt(e.target.value, 10) || 1)}
                        className="w-12 text-center text-sm font-semibold text-slate-900 bg-transparent focus:outline-hidden appearance-none"
                      />
                      <button
                        onClick={() =>
                          setQuantityFor(pizza.id, (quantities[pizza.id] ?? 1) + 1)
                        }
                        className="px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToOrder(pizza)}
                      className="flex-1 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:border-emerald-600/40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:border-emerald-600/40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-lg relative overflow-hidden flex flex-col min-h-[260px]">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 relative">
              Current Order
            </h3>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-2">
                <span className="text-2xl">🛒</span>
                <p className="text-xs font-medium text-slate-400">Your order is empty</p>
                <p className="text-[10px] text-slate-500 font-light max-w-[200px]">
                  Add custom pizzas from the list to build your order.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 mt-4 relative">
                {cart.map((line) => (
                  <div key={line.pizza.id} className="flex justify-between items-start gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 truncate">
                        {line.quantity} × {line.pizza.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-light">
                        {money(line.pizza.totalPrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-emerald-300 font-semibold">
                        {money(line.quantity * line.pizza.totalPrice)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(line.pizza.id)}
                        className="text-slate-500 hover:text-rose-400 transition cursor-pointer text-sm leading-none"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-end relative">
              <span className="text-sm font-semibold text-slate-300">Order Total</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {money(cartTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={cart.length === 0 || isPendingSubmit}
            className={`w-full py-3 text-sm font-bold rounded-2xl text-white transition cursor-pointer ${
              cart.length > 0 && !isPendingSubmit
                ? 'bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isPendingSubmit ? 'Loading...' : 'Submit Order'}
          </button>
          <p className="text-[10px] text-slate-400 text-center font-light -mt-2">
            You will review your order in a confirmation step.
          </p>
        </div>
      </main>

      {/* Confirmation dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Confirm Your Order</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Review your items and total before placing the order.
              </p>
            </div>

            <div className="px-6 py-4 space-y-2.5 max-h-[280px] overflow-y-auto">
              {cart.map((line) => (
                <div key={line.pizza.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">
                    {line.quantity} × {line.pizza.name}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {money(line.quantity * line.pizza.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-2xl bg-stone-50 border border-slate-200 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {money(cartTotal)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                onClick={handleSubmitOrder}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
