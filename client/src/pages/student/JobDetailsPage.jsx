import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Input, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { getJob } from '../../modules/jobs/job.api';
import { apply } from '../../modules/applications/application.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, formatLPA, humanize } from '../../utils/format';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: job, loading, error, reload } = useFetch(() => getJob(id), [id]);
  const [form, setForm] = useState({ resumeUrl: user.studentProfile?.resumeUrl || '', coverNote: '' });
  const [state, setState] = useState({ submitting: false, error: '' });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const check = job.eligibilityCheck;
  const onApply = async (e) => {
    e.preventDefault();
    setState({ submitting: true, error: '' });
    try {
      await apply({ jobId: job._id, ...(form.resumeUrl && { resumeUrl: form.resumeUrl }), ...(form.coverNote && { coverNote: form.coverNote }) });
      navigate('/student/applications');
    } catch (err) {
      setState({ submitting: false, error: getErrorMessage(err) });
    }
  };

  return (
    <>
      <Link to="/student/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"><ArrowLeft className="h-4 w-4" /> All drives</Link>
      <PageHeader title={job.title} subtitle={`${job.company?.name}${job.location ? ` · ${job.location}` : ''}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="font-semibold text-slate-900">About the role</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{job.description}</p>
            {job.skills?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs text-navy-700">{s}</span>)}</div>}
          </section>
          <section className="card p-5">
            <h2 className="font-semibold text-slate-900">Eligibility criteria</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>Minimum CGPA: <b>{job.eligibility?.minCgpa || 'None'}</b></li>
              <li>Branches: <b>{job.eligibility?.eligibleBranches?.length ? job.eligibility.eligibleBranches.join(', ') : 'All'}</b></li>
              <li>Max active backlogs: <b>{job.eligibility?.maxActiveBacklogs ?? 0}</b></li>
            </ul>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="card p-5 text-sm text-slate-600">
            <p className="text-lg font-semibold text-navy-700">{formatLPA(job.packageLPA)}</p>
            <p>{humanize(job.jobType)} · {job.openings} opening(s)</p>
            <div className="mt-1 flex items-center justify-between">
              <p>Deadline: <b>{formatDate(job.deadline)}</b></p>
              {new Date(job.deadline) < new Date() && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Deadline Passed</span>
              )}
            </div>
          </div>
          <div className="card p-5">
            {check.eligible
              ? <p className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> You are eligible</p>
              : <div className="mb-3 text-sm text-red-700"><p className="flex items-center gap-2 font-medium"><XCircle className="h-4 w-4" /> You are not eligible</p><ul className="mt-1 list-disc pl-6 text-xs">{check.reasons.map((r) => <li key={r}>{r}</li>)}</ul></div>}
            {job.hasApplied ? (
              <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">You have already applied. <Link to="/student/applications" className="font-medium underline">Track status</Link></p>
            ) : (
              <form onSubmit={onApply} className="space-y-3">
                <ErrorMessage message={state.error} />
                <Input label="Resume link" type="url" value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} placeholder="https://…" disabled={!check.eligible} />
                <Textarea label="Cover note (optional)" rows={3} value={form.coverNote} onChange={(e) => setForm({ ...form, coverNote: e.target.value })} disabled={!check.eligible} />
                <Button type="submit" className="w-full" loading={state.submitting} disabled={!check.eligible}>Apply now</Button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
