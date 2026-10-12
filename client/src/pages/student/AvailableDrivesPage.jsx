import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Select } from '../../components/forms/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import { listJobs } from '../../modules/jobs/job.api';
import { formatDate, formatLPA, humanize } from '../../utils/format';

export default function AvailableDrivesPage() {
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useFetch(() => listJobs({ limit: 100, ...(filter && { eligible: filter }) }), [filter]);

  return (
    <>
      <PageHeader title="Available drives" subtitle="Open placement drives and your eligibility for each."
        actions={<div className="w-48"><Select value={filter} onChange={(e) => setFilter(e.target.value)} options={[{ value: '', label: 'All drives' }, { value: 'true', label: 'Eligible for me' }, { value: 'false', label: 'Not eligible' }]} aria-label="Filter drives" /></div>} />
      {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState title="No drives found" description="No open drives match this filter right now. Check back soon." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((job) => (
            <Link key={job._id} to={`/student/jobs/${job._id}`} className="card flex flex-col p-5 transition hover:border-navy-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="font-semibold text-slate-900">{job.title}</h3><p className="text-sm text-slate-500">{job.company?.name}</p></div>
                {job.eligibilityCheck?.eligible
                  ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Eligible</span>
                  : <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3.5 w-3.5" /> Not eligible</span>}
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                <p className="font-medium text-navy-700">{formatLPA(job.packageLPA)} · {humanize(job.jobType)}</p>
                {job.location && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {job.location}</p>}
                <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> Apply by {formatDate(job.deadline)}</p>
              </div>
              {!job.eligibilityCheck?.eligible && <p className="mt-3 text-xs text-slate-500">{job.eligibilityCheck?.reasons?.[0]}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
