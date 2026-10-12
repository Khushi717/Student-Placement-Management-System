export default function StatCard({ label, value, icon: Icon, hint, tone = 'navy' }) {
  const tones = { navy: 'bg-navy-50 text-navy-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700' };
  return (
    <div className="card flex items-center gap-4 p-5">
      {Icon && <div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-6 w-6" /></div>}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value ?? '—'}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}
