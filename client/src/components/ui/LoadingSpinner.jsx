import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…', className = 'py-16' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-slate-500 ${className}`} role="status">
      <Loader2 className="h-6 w-6 animate-spin text-navy-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
