import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

/**
 * columns: [{ key, header, render?(row), className? }]
 * Handles loading / error / empty states so pages stay small.
 */
export default function DataTable({ columns, rows, loading, error, onRetry, emptyTitle, emptyDescription, rowKey = (r) => r._id }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.className || ''}`}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={rowKey(row) ?? i} className="hover:bg-slate-50/60">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle text-slate-700 ${c.className || ''}`}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
