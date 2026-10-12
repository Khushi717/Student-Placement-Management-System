import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../utils/navigation';

/**
 * UI-level role gate (UX only). The real enforcement is on the server; this just
 * sends users to their own area instead of showing pages that would return 403.
 */
export default function RoleGuard({ allow }) {
  const { user } = useAuth();
  if (!allow.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}
