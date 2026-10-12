export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}
