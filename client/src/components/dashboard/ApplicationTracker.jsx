import { Check, X } from 'lucide-react';

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
const LABELS = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected' };

/** Visual progress tracker for a single application. REJECTED shows the stage where it stopped. */
export default function ApplicationTracker({ status, history = [] }) {
  const rejected = status === 'REJECTED';
  const lastGood = rejected ? [...history].reverse().find((h) => h.status !== 'REJECTED')?.status || 'APPLIED' : status;
  const reached = STAGES.indexOf(lastGood);

  return (
    <ol className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i <= reached;
        const failedHere = rejected && i === reached + 1;
        return (
          <li key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${failedHere ? 'bg-red-600 text-white' : done ? 'bg-navy-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {failedHere ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="mt-1 text-[11px] text-slate-500">{failedHere ? 'Rejected' : LABELS[stage]}</span>
            </div>
            {i < STAGES.length - 1 && <div className={`mx-1 mb-4 h-0.5 flex-1 ${i < reached ? 'bg-navy-700' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
