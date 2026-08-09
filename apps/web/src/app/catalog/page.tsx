'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { getCatalogItems, CatalogItem, CatalogCategory } from '@/lib/api/catalog';
import Link from 'next/link';

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'vegan' | 'healthy'>('all');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await getCatalogItems();
        setItems(data);
        setFilteredItems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch catalog items');
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    let result = items;

    // Filter by type
    if (activeFilter === 'vegan') {
      result = result.filter(item => item.isVegan);
    } else if (activeFilter === 'healthy') {
      result = result.filter(item => item.isHealthy);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    setFilteredItems(result);
  }, [searchQuery, activeFilter, items]);

  const categories: CatalogCategory[] = ['Crust', 'Sauce', 'Base', 'Toppings'];

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-stone-50">
      {/* Reusable Header Navigation */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Banner Section */}
        <section className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden p-8 md:p-12 shadow-xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 rounded-full">
              Pizza Crafting Base
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              The Pizza Catalog
            </h2>
            <p className="text-sm md:text-base text-emerald-100 font-light leading-relaxed">
              Explore our handpicked range of organic crusts, slow-simmered sauces, premium cheese bases, and fresh toppings. Use this catalog to plan your perfect artisanal creation.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar Controls */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                activeFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Options
            </button>
            <button
              onClick={() => setActiveFilter('vegan')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activeFilter === 'vegan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              🌱 Vegan Friendly
            </button>
            <button
              onClick={() => setActiveFilter('healthy')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activeFilter === 'healthy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              🥗 Healthy Choice
            </button>
          </div>

          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Search catalog items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              🔍
            </span>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading catalog items...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-800">Error Loading Catalog</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <section key={category} className="space-y-6">
                  {/* Category Title & Badge */}
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {category === 'Base' ? 'Bases & Cheeses' : `${category}s`}
                    </h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-md">
                      {categoryItems.length} {categoryItems.length === 1 ? 'option' : 'options'}
                    </span>
                  </div>

                  {/* Grid Layout of Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600/30 transition duration-300 transform hover:-translate-y-0.5"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition">
                              {item.title}
                            </h4>
                            <span className="font-mono font-bold text-emerald-700 text-sm whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                              +${item.price.toFixed(2)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed font-light">
                            {item.description}
                          </p>
                        </div>

                        {/* Badges/Tags */}
                        {(item.isVegan || item.isHealthy) && (
                          <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-50">
                            {item.isVegan && (
                              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-md">
                                🌱 Vegan
                              </span>
                            )}
                            {item.isHealthy && (
                              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-teal-50 border border-teal-100 text-teal-800 rounded-md">
                                🥗 Healthy
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <span className="text-4xl">🧐</span>
                <h3 className="text-base font-bold text-slate-700">No items match your filters</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Try adjusting your search criteria or selecting a different catalog filter.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© 2026 Verde & Crust Artisanal Pizza Studio. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/catalog" className="hover:text-white transition">Catalog</Link>
            <Link href="/developer" className="hover:text-white transition">Developer Health</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
