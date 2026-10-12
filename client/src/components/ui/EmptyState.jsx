import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-navy-50 p-3 text-navy-600"><Icon className="h-6 w-6" /></div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
