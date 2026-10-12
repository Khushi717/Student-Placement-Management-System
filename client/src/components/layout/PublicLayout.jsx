import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Student Placement Management System · Academic project (SEDP)
      </footer>
    </div>
  );
}
