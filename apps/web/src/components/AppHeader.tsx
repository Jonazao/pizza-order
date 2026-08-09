'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderAuth } from './HeaderAuth';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center px-6 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20 font-bold">
            🌿
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Verde & Crust
            </h1>
            <span className="text-xs text-emerald-700 font-medium tracking-wide">
              Artisanal Pizza Studio
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/catalog"
            className={`transition hover:text-emerald-700 ${pathname === '/catalog' ? 'text-emerald-700 font-semibold' : ''
              }`}
          >
            Pizza Catalog
          </Link>
          <Link
            href="/pizza-builder"
            className={`transition hover:text-emerald-700 ${pathname === '/pizza-builder' ? 'text-emerald-700 font-semibold' : ''
              }`}
          >
            Pizza Builder
          </Link>
          <Link
            href="/developer"
            className={`transition hover:text-emerald-700 ${pathname === '/developer' ? 'text-emerald-700 font-semibold' : ''
              }`}
          >
            Developer Portal
          </Link>
        </nav>

        <HeaderAuth />
      </div>
    </header>
  );
}
export default AppHeader;
