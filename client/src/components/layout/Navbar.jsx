import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../utils/navigation';

const links = [{ to: '/', label: 'Home' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }];

/** Public-site navbar. */
export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-navy-800">
          <span className="rounded-lg bg-navy-700 p-1.5 text-white"><GraduationCap className="h-5 w-5" /></span> SPMS
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-navy-700' : 'text-slate-600 hover:text-navy-700'}`}>{l.label}</NavLink>
          ))}
          {user ? (
            <Link to={ROLE_HOME[user.role]} className="btn bg-navy-700 text-white hover:bg-navy-800">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-navy-700">Log in</Link>
              <Link to="/register" className="btn bg-navy-700 text-white hover:bg-navy-800">Get started</Link>
            </>
          )}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-1 text-sm text-slate-700">{l.label}</Link>)}
          <Link to={user ? ROLE_HOME[user.role] : '/login'} onClick={() => setOpen(false)} className="block py-1 text-sm font-medium text-navy-700">{user ? 'Dashboard' : 'Log in'}</Link>
        </div>
      )}
    </header>
  );
}
