import { NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, X } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS[user.role] || [];
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-navy-100 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-semibold text-white"><GraduationCap className="h-6 w-6" /> SPMS</div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-navy-700 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-navy-800 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-navy-800 hover:text-white">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
