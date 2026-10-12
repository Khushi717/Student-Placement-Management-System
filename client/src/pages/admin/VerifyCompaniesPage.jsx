import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Select, Textarea } from '../../components/forms/FormField';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useFetch from '../../hooks/useFetch';
import { listCompanies, verifyCompany } from '../../modules/companies/company.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate } from '../../utils/format';

export default function VerifyCompaniesPage() {
  const [status, setStatus] = useState('PENDING');
  const { data, loading, error, reload } = useFetch(() => listCompanies({ limit: 100, ...(status && { verificationStatus: status }) }), [status]);
  const [review, setReview] = useState(null); // { company, decision }
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const open = (company, decision) => { setRemarks(''); setActionError(''); setReview({ company, decision }); };
  const submit = async () => {
    setBusy(true);
    setActionError('');
    try { await verifyCompany(review.company._id, { status: review.decision, ...(remarks && { remarks }) }); setReview(null); reload(); }
    catch (err) { setActionError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const columns = [
    { key: 'name', header: 'Company', render: (c) => <div><p className="font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.industry} {c.location && `· ${c.location}`}</p></div> },
    { key: 'contact', header: 'Recruiter', render: (c) => <div><p>{c.user?.name}</p><p className="text-xs text-slate-500">{c.user?.email}</p></div> },
    { key: 'website', header: 'Website', render: (c) => c.website ? <a href={c.website} target="_blank" rel="noreferrer noopener" className="text-navy-700 underline">Visit</a> : '—' },
    { key: 'createdAt', header: 'Registered', render: (c) => formatDate(c.createdAt) },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.verificationStatus} /> },
    { key: 'actions', header: '', render: (c) => (
      <div className="flex gap-2">
        {c.verificationStatus !== 'APPROVED' && <Button className="px-3 py-1" onClick={() => open(c, 'APPROVED')}>Approve</Button>}
        {c.verificationStatus !== 'REJECTED' && <Button variant="ghost" className="px-3 py-1 text-red-600" onClick={() => open(c, 'REJECTED')}>Reject</Button>}
      </div>
    ) },
  ];

  return (
    <>
      <PageHeader title="Verify companies" subtitle="Only approved companies can publish job postings."
        actions={<div className="w-44"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }, { value: '', label: 'All' }]} aria-label="Filter by status" /></div>} />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No companies in this state" />
      <Modal open={Boolean(review)} onClose={() => setReview(null)} title={`${review?.decision === 'APPROVED' ? 'Approve' : 'Reject'} ${review?.company?.name}`}>
        <div className="space-y-4">
          <ErrorMessage message={actionError} />
          <Textarea label="Remarks (shared with the company)" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReview(null)}>Cancel</Button>
            <Button variant={review?.decision === 'APPROVED' ? 'primary' : 'danger'} loading={busy} onClick={submit}>{review?.decision === 'APPROVED' ? 'Approve' : 'Reject'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
