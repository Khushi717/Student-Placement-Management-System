import { Check, X, Ban } from 'lucide-react';

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'PLACED'];
const LABELS = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', PLACED: 'Placed' };

/** Visual progress tracker for a single application. REJECTED shows the stage where it stopped. */
export default function ApplicationTracker({ status, history = [] }) {
  const rejected = status === 'REJECTED';
  const withdrawn = status === 'WITHDRAWN';
  const lastGood = (rejected || withdrawn)
    ? [...history].reverse().find((h) => h.status !== 'REJECTED' && h.status !== 'WITHDRAWN')?.status || 'APPLIED'
    : status;
  const reached = STAGES.indexOf(lastGood);

  return (
    <ol className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i <= reached;
        const failedHere = rejected && i === reached + 1;
        const withdrawnHere = withdrawn && i === reached;
        return (
          <li key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${withdrawnHere ? 'bg-slate-500 text-white' : failedHere ? 'bg-red-600 text-white' : done ? 'bg-navy-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {withdrawnHere ? <Ban className="h-4 w-4" /> : failedHere ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="mt-1 text-[11px] text-slate-500">{withdrawnHere ? 'Withdrawn' : failedHere ? 'Rejected' : LABELS[stage]}</span>
            </div>
            {i < STAGES.length - 1 && <div className={`mx-1 mb-4 h-0.5 flex-1 ${i < reached ? 'bg-navy-700' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
