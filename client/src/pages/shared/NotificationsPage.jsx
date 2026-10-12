import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useFetch from '../../hooks/useFetch';
import { listNotifications, markRead, markAllRead } from '../../modules/notifications/notification.api';
import { formatDateTime } from '../../utils/format';

/** Notification center, shared by all roles (the API only ever returns the caller's own notifications). */
export default function NotificationsPage() {
  const { data, meta, loading, error, reload } = useFetch(() => listNotifications({ limit: 50 }), []);

  const open = async (n) => { if (!n.isRead) { await markRead(n._id).catch(() => {}); reload(); } };
  const readAll = async () => { await markAllRead(); reload(); };

  return (
    <>
      <PageHeader title="Notifications" subtitle={meta ? `${meta.unreadCount} unread` : undefined}
        actions={<Button variant="secondary" onClick={readAll} disabled={!meta?.unreadCount}><CheckCheck className="h-4 w-4" /> Mark all read</Button>} />
      {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts about drives, applications and offers will appear here." />
      ) : (
        <ul className="card divide-y divide-slate-100">
          {data.map((n) => (
            <li key={n._id} className={`flex items-start gap-3 p-4 ${n.isRead ? '' : 'bg-navy-50/50'}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-navy-600'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {n.link ? <Link to={n.link} onClick={() => open(n)} className="text-sm font-medium text-navy-700 hover:underline">View</Link>
                : !n.isRead && <button onClick={() => open(n)} className="text-sm text-navy-700 hover:underline">Mark read</button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
