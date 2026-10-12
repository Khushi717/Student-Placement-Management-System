import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-navy-700 text-white hover:bg-navy-800',
  secondary: 'bg-white text-navy-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-navy-700 hover:bg-navy-50',
};

export default function Button({ variant = 'primary', loading = false, className = '', children, ...props }) {
  return (
    <button className={`btn ${VARIANTS[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
