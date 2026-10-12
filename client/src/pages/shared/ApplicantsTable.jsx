import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Input, Select, Textarea } from '../../components/forms/FormField';
import useFetch from '../../hooks/useFetch';
import { listApplicants, updateApplicationStatus } from '../../modules/applications/application.api';
import { scheduleInterview } from '../../modules/interviews/interview.api';
import { createOffer } from '../../modules/offers/offer.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate } from '../../utils/format';

/** Applicant list with shortlist / reject / schedule interview / create offer. Shared by company and admin pages. */
export default function ApplicantsTable({ showJob = true }) {
  const [params] = useSearchParams();
  const jobId = params.get('jobId') || undefined;
  const { data, loading, error, reload } = useFetch(() => listApplicants({ limit: 100, ...(jobId && { jobId }) }), [jobId]);
  const [modal, setModal] = useState(null); // { type: 'interview' | 'offer', app }
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = async (fn) => {
    setBusy(true);
    setActionError('');
    try { await fn(); setModal(null); reload(); }
    catch (err) { setActionError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const setStatus = (app, status) => run(() => updateApplicationStatus(app._id, { status }));
  const openModal = (type, app) => { setForm(type === 'offer' ? { packageLPA: app.job?.packageLPA ?? '' } : { mode: 'ONLINE', round: 'Round 1' }); setModal({ type, app }); };

  const submitModal = (e) => {
    e.preventDefault();
    if (modal.type === 'interview') {
      return run(() => scheduleInterview({ applicationId: modal.app._id, round: form.round, mode: form.mode, scheduledAt: new Date(form.scheduledAt).toISOString(), ...(form.location && { location: form.location }), ...(form.notes && { notes: form.notes }) }));
    }
    return run(() => createOffer({ applicationId: modal.app._id, packageLPA: Number(form.packageLPA), ...(form.joiningDate && { joiningDate: form.joiningDate }), ...(form.message && { message: form.message }) }));
  };
  const f = (k) => ({ value: form[k] ?? '', onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const columns = [
    { key: 'student', header: 'Student', render: (a) => <div><p className="font-medium text-slate-900">{a.student?.name}</p><p className="text-xs text-slate-500">{a.student?.studentProfile?.enrollmentNo}</p></div> },
    ...(showJob ? [{ key: 'job', header: 'Job', render: (a) => <div><p>{a.job?.title}</p><p className="text-xs text-slate-500">{a.job?.company?.name}</p></div> }] : []),
    { key: 'academics', header: 'Branch / CGPA', render: (a) => `${a.student?.studentProfile?.branch ?? '—'} · ${a.student?.studentProfile?.cgpa ?? '—'}` },
    { key: 'resume', header: 'Resume', render: (a) => a.resumeUrl ? <a href={a.resumeUrl} target="_blank" rel="noreferrer noopener" className="text-navy-700 underline">Open</a> : '—' },
    { key: 'createdAt', header: 'Applied', render: (a) => formatDate(a.createdAt) },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions', header: 'Actions', render: (a) => (
        <div className="flex flex-wrap gap-2">
          {a.status === 'APPLIED' && <Button variant="secondary" className="px-3 py-1" onClick={() => setStatus(a, 'SHORTLISTED')}>Shortlist</Button>}
          {['SHORTLISTED', 'INTERVIEW'].includes(a.status) && <Button variant="secondary" className="px-3 py-1" onClick={() => openModal('interview', a)}>Schedule interview</Button>}
          {['INTERVIEW', 'SELECTED'].includes(a.status) && <Button variant="secondary" className="px-3 py-1" onClick={() => openModal('offer', a)}>Create offer</Button>}
          {['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(a.status) && <Button variant="ghost" className="px-3 py-1 text-red-600" onClick={() => setStatus(a, 'REJECTED')}>Reject</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <ErrorMessage message={!modal ? actionError : ''} />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No applicants yet" emptyDescription="Applications will appear here as students apply." />
      <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal?.type === 'interview' ? 'Schedule interview' : 'Create offer'}>
        <form onSubmit={submitModal} className="space-y-4">
          <ErrorMessage message={actionError} />
          <p className="text-sm text-slate-600">{modal?.app?.student?.name} · {modal?.app?.job?.title}</p>
          {modal?.type === 'interview' ? (
            <>
              <Input label="Round" {...f('round')} />
              <Input label="Date & time" type="datetime-local" required {...f('scheduledAt')} />
              <Select label="Mode" options={['ONLINE', 'ONSITE']} {...f('mode')} />
              <Input label="Meeting link / venue" {...f('location')} />
              <Textarea label="Notes" rows={2} {...f('notes')} />
            </>
          ) : (
            <>
              <Input label="Package (LPA)" type="number" step="0.1" min="0" required {...f('packageLPA')} />
              <Input label="Joining date" type="date" {...f('joiningDate')} />
              <Textarea label="Message" rows={2} {...f('message')} />
            </>
          )}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" loading={busy}>Confirm</Button></div>
        </form>
      </Modal>
    </>
  );
}
