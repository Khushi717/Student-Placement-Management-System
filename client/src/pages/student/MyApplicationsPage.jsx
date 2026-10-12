import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import ApplicationTracker from '../../components/dashboard/ApplicationTracker';
import useFetch from '../../hooks/useFetch';
import { myApplications } from '../../modules/applications/application.api';
import { formatDate, formatLPA } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function MyApplicationsPage() {
  const { data, loading, error, reload } = useFetch(() => myApplications({ limit: 100 }), []);
  return (
    <>
      <PageHeader title="My applications" subtitle="Track every application from applied to selected." />
      {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState title="No applications yet" description="Apply to an eligible drive and it will show up here." action={<Link to="/student/jobs" className="btn bg-navy-700 text-white hover:bg-navy-800">Browse drives</Link>} />
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{a.job?.title}</h3>
                  <p className="text-sm text-slate-500">{a.job?.company?.name} · {formatLPA(a.job?.packageLPA)} · applied {formatDate(a.createdAt)}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <ApplicationTracker status={a.status} history={a.statusHistory} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
