import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { listNotifications } from '../../modules/notifications/notification.api';
import { humanize } from '../../utils/format';

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { meta } = useFetch(() => listNotifications({ limit: 1 }), []);
  const unread = meta?.unreadCount || 0;
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden text-sm text-slate-500 lg:block">Student Placement Management System</div>
      <div className="flex items-center gap-4">
        <Link to={`/${user.role.toLowerCase()}/notifications`} className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">{unread > 9 ? '9+' : unread}</span>}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white">{user.name?.[0]?.toUpperCase()}</div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{humanize(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
