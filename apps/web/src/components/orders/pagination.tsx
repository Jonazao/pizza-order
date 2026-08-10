'use client';

export function Pagination({
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
