import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from './AuthShell';
import { Input } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { resetPassword } from '../../modules/authentication/auth.api';
import { getErrorMessage } from '../../services/apiClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = params.get('token');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword({ token, password });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" footer={<Link to="/login" className="font-medium text-navy-700 hover:underline">Back to login</Link>}>
      {!token ? <ErrorMessage message="This reset link is missing its token." /> : (
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorMessage message={error} />
          <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Min 8 characters, with a letter and a number" required />
          <Button type="submit" loading={loading} className="w-full">Reset password</Button>
        </form>
      )}
    </AuthShell>
  );
}
