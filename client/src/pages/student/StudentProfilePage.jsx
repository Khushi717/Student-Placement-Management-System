import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Input, Select } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { updateMe } from '../../modules/users/user.api';
import { getErrorMessage } from '../../services/apiClient';

const BRANCHES = ['CSE', 'IT', 'CSIT', 'ECE', 'EEE', 'ME', 'CE', 'AI&ML'];

export default function StudentProfilePage() {
  const { user, refresh } = useAuth();
  const sp = user.studentProfile || {};
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', branch: sp.branch || '', cgpa: sp.cgpa ?? '', activeBacklogs: sp.activeBacklogs ?? 0, graduationYear: sp.graduationYear || '', resumeUrl: sp.resumeUrl || '', skills: (sp.skills || []).join(', ') });
  const [state, setState] = useState({ saving: false, error: '', ok: false });
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', ok: false });
    try {
      await updateMe({
        name: f.name,
        ...(f.phone && { phone: f.phone }),
        studentProfile: {
          branch: f.branch || undefined,
          ...(f.cgpa !== '' && { cgpa: Number(f.cgpa) }),
          activeBacklogs: Number(f.activeBacklogs || 0),
          ...(f.graduationYear && { graduationYear: Number(f.graduationYear) }),
          ...(f.resumeUrl && { resumeUrl: f.resumeUrl }),
          skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });
      await refresh();
      setState({ saving: false, error: '', ok: true });
    } catch (err) {
      setState({ saving: false, error: getErrorMessage(err), ok: false });
    }
  };

  return (
    <>
      <PageHeader title="My profile" subtitle="Your CGPA, branch and backlogs decide which drives you are eligible for." />
      <form onSubmit={onSubmit} className="card max-w-3xl space-y-4 p-6">
        <ErrorMessage message={state.error} />
        {state.ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Profile saved.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" value={f.name} onChange={onChange} required />
          <Input label="Email" value={user.email} disabled />
          <Input label="Enrollment no." value={sp.enrollmentNo || ''} disabled hint="Contact the placement cell to change this" />
          <Input label="Phone" name="phone" value={f.phone} onChange={onChange} />
          <Select label="Branch" name="branch" value={f.branch} onChange={onChange} options={BRANCHES} placeholder="Select branch" />
          <Input label="CGPA" name="cgpa" type="number" step="0.01" min="0" max="10" value={f.cgpa} onChange={onChange} />
          <Input label="Active backlogs" name="activeBacklogs" type="number" min="0" value={f.activeBacklogs} onChange={onChange} />
          <Input label="Graduation year" name="graduationYear" type="number" value={f.graduationYear} onChange={onChange} />
          <div className="sm:col-span-2"><Input label="Resume link" name="resumeUrl" type="url" placeholder="https://drive.google.com/…" value={f.resumeUrl} onChange={onChange} hint="File upload is a planned integration point; a shareable link is used for now." /></div>
          <div className="sm:col-span-2"><Input label="Skills" name="skills" value={f.skills} onChange={onChange} hint="Comma separated, e.g. React, Node.js, SQL" /></div>
        </div>
        <Button type="submit" loading={state.saving}>Save changes</Button>
      </form>
    </>
  );
}
