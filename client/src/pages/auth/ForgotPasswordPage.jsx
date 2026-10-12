import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { Input } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { forgotPassword } from '../../modules/authentication/auth.api';
import { getErrorMessage } from '../../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { message } = await forgotPassword(email);
      setDone(message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your account e-mail to generate a reset link." footer={<Link to="/login" className="font-medium text-navy-700 hover:underline">Back to login</Link>}>
      {done ? (
        <div className="space-y-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          <p>{done}</p>
          <p className="text-xs text-emerald-700">E-mail delivery is not configured in this foundation build: in development the link is printed in the server console.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorMessage message={error} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
