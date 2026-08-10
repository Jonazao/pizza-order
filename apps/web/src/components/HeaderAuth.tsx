'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

export function HeaderAuth() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return <span className="text-slate-400 text-sm font-medium animate-pulse">Checking status...</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span>Welcome, <strong className="text-slate-900 font-semibold">{user.name}</strong></span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
            user.role === 'Employee' 
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {user.role}
          </span>
        </div>
        {user.role === 'Customer' && (
          <Link
            href="/customer/ordering"
            className="px-4 py-1.5 text-xs font-bold rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition cursor-pointer"
          >
            Order Now
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 transition duration-200 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-semibold rounded-full text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 transition"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="px-5 py-2 text-sm font-semibold rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition duration-200 transform hover:-translate-y-0.5"
      >
        Order Now
      </Link>
    </div>
  );
}
