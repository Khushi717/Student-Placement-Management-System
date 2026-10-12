import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import { Input } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { ROLE_HOME } from '../../utils/navigation';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form);
      const from = location.state?.from;
      // Only return to the previous page if it belongs to this user's role area.
      navigate(from && from.startsWith(`/${u.role.toLowerCase()}`) ? from : ROLE_HOME[u.role], { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your placement portal account." footer={<>New here? <Link to="/register" className="font-medium text-navy-700 hover:underline">Create an account</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorMessage message={error} />
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
        <Input label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} required />
        <div className="text-right"><Link to="/forgot-password" className="text-sm text-navy-700 hover:underline">Forgot password?</Link></div>
        <Button type="submit" loading={loading} className="w-full">Log in</Button>
      </form>
    </AuthShell>
  );
}
