import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import ApplicationTracker from '../../components/dashboard/ApplicationTracker';
import useFetch from '../../hooks/useFetch';
import { myApplications, withdrawApplication } from '../../modules/applications/application.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, formatLPA } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function MyApplicationsPage() {
  const { data, loading, error, reload } = useFetch(() => myApplications({ limit: 100 }), []);
  const [targetWithdraw, setTargetWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleWithdraw = async () => {
    if (!targetWithdraw) return;
    setWithdrawing(true);
    setActionError('');
    try {
      await withdrawApplication(targetWithdraw._id);
      setTargetWithdraw(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setTargetWithdraw(null);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <PageHeader title="My applications" subtitle="Track every application from applied to selected." />
      <ErrorMessage message={actionError} />
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
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  {['APPLIED', 'SHORTLISTED'].includes(a.status) && (
                    <Button variant="secondary" className="text-xs px-2.5 py-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" onClick={() => setTargetWithdraw(a)}>
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
              <ApplicationTracker status={a.status} history={a.statusHistory} />
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={Boolean(targetWithdraw)}
        loading={withdrawing}
        variant="danger"
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${targetWithdraw?.job?.title}"? You cannot undo this action.`}
        confirmLabel="Yes, withdraw"
        onConfirm={handleWithdraw}
        onCancel={() => setTargetWithdraw(null)}
      />
    </>
  );
}
