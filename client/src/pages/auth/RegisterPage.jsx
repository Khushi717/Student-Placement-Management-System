import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Building2 } from 'lucide-react';
import AuthShell from './AuthShell';
import { Input, Select, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { ROLE_HOME } from '../../utils/navigation';

const BRANCHES = ['CSE', 'IT', 'CSIT', 'ECE', 'EEE', 'ME', 'CE', 'AI&ML'];

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT'); // UI choice only; the server validates it again (ADMIN is never accepted)
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '', enrollmentNo: '', branch: '', cgpa: '', activeBacklogs: '0', companyName: '', industry: '', location: '', website: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const base = { name: f.name, email: f.email, password: f.password, ...(f.phone && { phone: f.phone }), role };
    const payload = role === 'STUDENT'
      ? { ...base, studentProfile: { enrollmentNo: f.enrollmentNo, branch: f.branch, ...(f.cgpa !== '' && { cgpa: Number(f.cgpa) }), activeBacklogs: Number(f.activeBacklogs || 0) } }
      : { ...base, company: { name: f.companyName, ...(f.industry && { industry: f.industry }), ...(f.location && { location: f.location }), ...(f.website && { website: f.website }), ...(f.description && { description: f.description }) } };
    setLoading(true);
    try {
      const u = await register(payload);
      navigate(ROLE_HOME[u.role], { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const tab = (value, label, Icon) => (
    <button type="button" onClick={() => setRole(value)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${role === value ? 'border-navy-600 bg-navy-50 text-navy-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <AuthShell wide title="Create your account" subtitle="Students and recruiters can register here. TPO accounts are created by the placement cell."
      footer={<>Already registered? <Link to="/login" className="font-medium text-navy-700 hover:underline">Log in</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2">{tab('STUDENT', "I'm a student", GraduationCap)}{tab('COMPANY', "I'm a recruiter", Building2)}</div>
        <ErrorMessage message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" value={f.name} onChange={onChange} required />
          <Input label="Email" name="email" type="email" value={f.email} onChange={onChange} required />
          <Input label="Password" name="password" type="password" value={f.password} onChange={onChange} hint="Min 8 characters, with a letter and a number" required />
          <Input label="Phone (optional)" name="phone" value={f.phone} onChange={onChange} />
        </div>

        {role === 'STUDENT' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Enrollment no." name="enrollmentNo" value={f.enrollmentNo} onChange={onChange} required />
            <Select label="Branch" name="branch" value={f.branch} onChange={onChange} options={BRANCHES} placeholder="Select branch" required />
            <Input label="CGPA" name="cgpa" type="number" step="0.01" min="0" max="10" value={f.cgpa} onChange={onChange} />
            <Input label="Active backlogs" name="activeBacklogs" type="number" min="0" value={f.activeBacklogs} onChange={onChange} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company name" name="companyName" value={f.companyName} onChange={onChange} required />
            <Input label="Industry" name="industry" value={f.industry} onChange={onChange} />
            <Input label="Location" name="location" value={f.location} onChange={onChange} />
            <Input label="Website" name="website" type="url" placeholder="https://" value={f.website} onChange={onChange} />
            <div className="sm:col-span-2"><Textarea label="About the company" name="description" rows={3} value={f.description} onChange={onChange} /></div>
            <p className="text-xs text-slate-500 sm:col-span-2">Your company will be reviewed by the placement cell before you can publish jobs.</p>
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}
