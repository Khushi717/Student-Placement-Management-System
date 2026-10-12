import { CalendarClock, MapPin, Video } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { myInterviews } from '../../modules/interviews/interview.api';
import { formatDateTime } from '../../utils/format';

export default function InterviewSchedulePage() {
  const { data, loading, error, reload } = useFetch(myInterviews, []);
  if (loading) return <LoadingSpinner />;
  return (
    <>
      <PageHeader title="Interview schedule" subtitle="Upcoming and past interviews for your applications." />
      {error ? <ErrorMessage message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState icon={CalendarClock} title="No interviews scheduled" description="When a company shortlists you and schedules an interview, it will appear here." />
      ) : (
        <div className="space-y-3">
          {data.map((i) => (
            <div key={i._id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-slate-900">{i.application?.job?.title} <span className="font-normal text-slate-500">· {i.application?.job?.company?.name}</span></p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><CalendarClock className="h-4 w-4 text-slate-400" /> {i.round} · {formatDateTime(i.scheduledAt)} ({i.durationMinutes} min)</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">{i.mode === 'ONLINE' ? <Video className="h-4 w-4 text-slate-400" /> : <MapPin className="h-4 w-4 text-slate-400" />} {i.location || (i.mode === 'ONLINE' ? 'Link will be shared' : 'Venue to be announced')}</p>
                {i.notes && <p className="mt-1 text-xs text-slate-500">{i.notes}</p>}
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
