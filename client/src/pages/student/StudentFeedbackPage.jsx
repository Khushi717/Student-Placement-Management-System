import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Select, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useFetch from '../../hooks/useFetch';
import { myApplications } from '../../modules/applications/application.api';
import { submitFeedback } from '../../modules/feedback/feedback.api';
import { getErrorMessage } from '../../services/apiClient';

export default function StudentFeedbackPage() {
  const { data, loading } = useFetch(() => myApplications({ limit: 100 }), []);
  const [f, setF] = useState({ jobId: '', rating: '5', comments: '' });
  const [state, setState] = useState({ saving: false, error: '', ok: false });

  if (loading) return <LoadingSpinner />;
  // Feedback targets a company you applied to; derive the company from the chosen application.
  const options = (data || []).map((a) => ({ value: a.job._id, label: `${a.job.title} — ${a.job.company?.name}` }));
  const chosen = (data || []).find((a) => a.job._id === f.jobId);

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', ok: false });
    try {
      await submitFeedback({ companyId: chosen.job.company._id, jobId: f.jobId, rating: Number(f.rating), ...(f.comments && { comments: f.comments }) });
      setF({ jobId: '', rating: '5', comments: '' });
      setState({ saving: false, error: '', ok: true });
    } catch (err) { setState({ saving: false, error: getErrorMessage(err), ok: false }); }
  };

  return (
    <>
      <PageHeader title="Share feedback" subtitle="Tell the placement cell about your experience with a drive." />
      <form onSubmit={onSubmit} className="card max-w-xl space-y-4 p-6">
        <ErrorMessage message={state.error} />
        {state.ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Thank you — your feedback was submitted.</p>}
        <Select label="Drive" value={f.jobId} onChange={(e) => setF({ ...f, jobId: e.target.value })} options={options} placeholder={options.length ? 'Select a drive you applied to' : 'Apply to a drive first'} required />
        <Select label="Rating" value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} options={[{ value: '5', label: '5 – Excellent' }, { value: '4', label: '4 – Good' }, { value: '3', label: '3 – Average' }, { value: '2', label: '2 – Poor' }, { value: '1', label: '1 – Very poor' }]} />
        <Textarea label="Comments" value={f.comments} onChange={(e) => setF({ ...f, comments: e.target.value })} />
        <Button type="submit" loading={state.saving} disabled={!f.jobId}>Submit feedback</Button>
      </form>
    </>
  );
}
