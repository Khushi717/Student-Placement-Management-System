import { humanize } from '../../utils/format';

const COLORS = {
  // applications
  APPLIED: 'bg-blue-50 text-blue-700 ring-blue-200',
  SHORTLISTED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  INTERVIEW: 'bg-amber-50 text-amber-700 ring-amber-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PLACED: 'bg-purple-50 text-purple-700 ring-purple-200',
  WITHDRAWN: 'bg-slate-100 text-slate-600 ring-slate-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  // offers
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DECLINED: 'bg-red-50 text-red-700 ring-red-200',
  // companies / jobs / accounts / interviews
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-700 ring-slate-200',
  CLOSED: 'bg-slate-100 text-slate-700 ring-slate-300',
  WITHDRAWN: 'bg-red-50 text-red-700 ring-red-200',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-200',
  SCHEDULED: 'bg-blue-50 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-700 ring-slate-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORS[status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {humanize(status)}
    </span>
  );
}
