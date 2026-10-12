import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useFetch from '../../hooks/useFetch';
import { listJobs, setJobStatus } from '../../modules/jobs/job.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, formatLPA } from '../../utils/format';

/** Job table with close / withdraw / publish actions. Used by the company and admin "manage jobs" pages. */
export default function JobsTable({ showCompany = false }) {
  const { data, loading, error, reload } = useFetch(() => listJobs({ limit: 100 }), []);
  const [pending, setPending] = useState(null); // { job, status }
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setActionError('');
    try { await setJobStatus(pending.job._id, pending.status); reload(); }
    catch (err) { setActionError(getErrorMessage(err)); }
    finally { setBusy(false); setPending(null); }
  };

  const columns = [
    { key: 'title', header: 'Title', render: (j) => <span className="font-medium text-slate-900">{j.title}</span> },
    ...(showCompany ? [{ key: 'company', header: 'Company', render: (j) => j.company?.name }] : []),
    { key: 'packageLPA', header: 'Package', render: (j) => formatLPA(j.packageLPA) },
    { key: 'eligibility', header: 'Eligibility', render: (j) => `CGPA ≥ ${j.eligibility?.minCgpa ?? 0} · ${j.eligibility?.eligibleBranches?.length ? j.eligibility.eligibleBranches.join('/') : 'All'}` },
    { key: 'deadline', header: 'Deadline', render: (j) => formatDate(j.deadline) },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    {
      key: 'actions', header: '', render: (j) => (
        <div className="flex gap-2">
          {j.status === 'DRAFT' && <Button variant="secondary" className="px-3 py-1" onClick={() => setPending({ job: j, status: 'PUBLISHED' })}>Publish</Button>}
          {j.status === 'PUBLISHED' && <Button variant="secondary" className="px-3 py-1" onClick={() => setPending({ job: j, status: 'CLOSED' })}>Close</Button>}
          {['DRAFT', 'PUBLISHED'].includes(j.status) && <Button variant="ghost" className="px-3 py-1 text-red-600" onClick={() => setPending({ job: j, status: 'WITHDRAWN' })}>Withdraw</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <ErrorMessage message={actionError} />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No job postings" emptyDescription="Postings will appear here once created." />
      <ConfirmModal open={Boolean(pending)} loading={busy} variant={pending?.status === 'PUBLISHED' ? 'primary' : 'danger'}
        title={`${pending?.status === 'PUBLISHED' ? 'Publish' : pending?.status === 'CLOSED' ? 'Close' : 'Withdraw'} "${pending?.job?.title}"?`}
        message={pending?.status === 'PUBLISHED' ? 'Eligible students will be notified.' : 'Students will no longer be able to apply. This cannot be undone.'}
        confirmLabel="Confirm" onConfirm={confirm} onCancel={() => setPending(null)} />
    </>
  );
}
