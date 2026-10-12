import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-50 to-white px-4 py-10">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-semibold text-navy-800">
          <span className="rounded-lg bg-navy-700 p-1.5 text-white"><GraduationCap className="h-5 w-5" /></span> SPMS
        </Link>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}
