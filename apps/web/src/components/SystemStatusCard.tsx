'use client';

import { useEffect, useState } from 'react';
import { apiFetch, HealthResponse } from '@/lib/api/client';

export function SystemStatusCard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HealthResponse>('/health')
      .then((data) => setHealth(data))
      .catch((err) => setHealthError(err.message || 'Failed to reach API'));
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col items-start gap-4 text-left transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <h3 className="text-base font-bold text-slate-900">System Status</h3>
      </div>
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 font-medium">NestJS Backend:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ONLINE
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 font-medium">PostgreSQL 16:</span>
          {health ? (
            health.database === 'up' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                CONNECTED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                DISCONNECTED
              </span>
            )
          ) : healthError ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              DOWN
            </span>
          ) : (
            <span className="text-slate-400 text-xs animate-pulse">Checking...</span>
          )}
        </div>
      </div>
      {healthError && (
        <p className="text-xs text-red-700 mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200 w-full font-medium">
          Note: {healthError}
        </p>
      )}
    </div>
  );
}

