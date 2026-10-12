import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Input, Select, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { createJob } from '../../modules/jobs/job.api';
import { getErrorMessage } from '../../services/apiClient';

const BRANCHES = ['CSE', 'IT', 'CSIT', 'ECE', 'EEE', 'ME', 'CE', 'AI&ML'];

export default function CreateJobPage() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ title: '', description: '', location: '', jobType: 'FULL_TIME', packageLPA: '', openings: '1', skills: '', deadline: '', minCgpa: '0', maxActiveBacklogs: '0', eligibleBranches: [] });
  const [state, setState] = useState({ saving: false, error: '' });
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const toggleBranch = (b) => setF({ ...f, eligibleBranches: f.eligibleBranches.includes(b) ? f.eligibleBranches.filter((x) => x !== b) : [...f.eligibleBranches, b] });
  const approved = company?.verificationStatus === 'APPROVED';

  const submit = (publish) => async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '' });
    try {
      await createJob({
        title: f.title, description: f.description, jobType: f.jobType, publish,
        ...(f.location && { location: f.location }),
        ...(f.packageLPA !== '' && { packageLPA: Number(f.packageLPA) }),
        openings: Number(f.openings || 1),
        skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
        deadline: new Date(f.deadline).toISOString(),
        eligibility: { minCgpa: Number(f.minCgpa || 0), maxActiveBacklogs: Number(f.maxActiveBacklogs || 0), eligibleBranches: f.eligibleBranches },
      });
      navigate('/company/jobs');
    } catch (err) { setState({ saving: false, error: getErrorMessage(err) }); }
  };

  return (
    <>
      <PageHeader title="Create job posting" subtitle="Define the role and who can apply." />
      {!approved && <div className="mb-4"><ErrorMessage message="Your company must be approved before you can publish. You can still save drafts once approved." /></div>}
      <form onSubmit={submit(true)} className="card max-w-3xl space-y-5 p-6">
        <ErrorMessage message={state.error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input label="Job title" name="title" value={f.title} onChange={onChange} required /></div>
          <div className="sm:col-span-2"><Textarea label="Description" name="description" rows={6} value={f.description} onChange={onChange} required /></div>
          <Select label="Job type" name="jobType" value={f.jobType} onChange={onChange} options={[{ value: 'FULL_TIME', label: 'Full time' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'INTERNSHIP_PPO', label: 'Internship + PPO' }]} />
          <Input label="Location" name="location" value={f.location} onChange={onChange} />
          <Input label="Package (LPA)" name="packageLPA" type="number" step="0.1" min="0" value={f.packageLPA} onChange={onChange} />
          <Input label="Openings" name="openings" type="number" min="1" value={f.openings} onChange={onChange} />
          <Input label="Application deadline" name="deadline" type="datetime-local" value={f.deadline} onChange={onChange} required />
          <Input label="Skills" name="skills" value={f.skills} onChange={onChange} hint="Comma separated" />
        </div>

        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-800">Eligibility criteria</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Minimum CGPA" name="minCgpa" type="number" step="0.1" min="0" max="10" value={f.minCgpa} onChange={onChange} />
            <Input label="Max active backlogs" name="maxActiveBacklogs" type="number" min="0" value={f.maxActiveBacklogs} onChange={onChange} />
          </div>
          <p className="mb-2 mt-4 text-sm font-medium text-slate-700">Eligible branches <span className="font-normal text-slate-500">(none selected = all)</span></p>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button type="button" key={b} onClick={() => toggleBranch(b)} className={`rounded-full border px-3 py-1 text-sm ${f.eligibleBranches.includes(b) ? 'border-navy-600 bg-navy-50 text-navy-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{b}</button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2">
          <Button type="submit" loading={state.saving} disabled={!approved}>Publish job</Button>
          <Button type="button" variant="secondary" onClick={submit(false)} disabled={state.saving || !approved}>Save as draft</Button>
        </div>
      </form>
    </>
  );
}
