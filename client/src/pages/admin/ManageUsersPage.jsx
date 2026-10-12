import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Input, Select } from '../../components/forms/FormField';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { listUsers, setUserStatus } from '../../modules/users/user.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, humanize } from '../../utils/format';

export default function ManageUsersPage() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState({ role: '', search: '' });
  const { data, loading, error, reload } = useFetch(() => listUsers({ limit: 100, ...(filters.role && { role: filters.role }), ...(filters.search && { search: filters.search }) }), [filters]);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setActionError('');
    try { await setUserStatus(pending._id, pending.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'); reload(); }
    catch (err) { setActionError(getErrorMessage(err)); }
    finally { setBusy(false); setPending(null); }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (u) => <div><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div> },
    { key: 'role', header: 'Role', render: (u) => humanize(u.role) },
    { key: 'details', header: 'Details', render: (u) => u.studentProfile ? `${u.studentProfile.enrollmentNo ?? ''} · ${u.studentProfile.branch ?? '—'} · CGPA ${u.studentProfile.cgpa ?? '—'}` : '—' },
    { key: 'createdAt', header: 'Joined', render: (u) => formatDate(u.createdAt) },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'actions', header: '', render: (u) => u._id === me._id ? null : (
      <Button variant={u.status === 'ACTIVE' ? 'ghost' : 'secondary'} className={`px-3 py-1 ${u.status === 'ACTIVE' ? 'text-red-600' : ''}`} onClick={() => setPending(u)}>
        {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
      </Button>
    ) },
  ];

  return (
    <>
      <PageHeader title="Manage users" subtitle="Search accounts and suspend or reactivate access." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Input placeholder="Search name, e-mail or enrollment no." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} aria-label="Search users" /></div>
        <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} options={[{ value: '', label: 'All roles' }, { value: 'STUDENT', label: 'Students' }, { value: 'COMPANY', label: 'Recruiters' }, { value: 'ADMIN', label: 'Admins' }]} aria-label="Filter by role" />
      </div>
      <ErrorMessage message={actionError} />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No users found" />
      <ConfirmModal open={Boolean(pending)} loading={busy} variant={pending?.status === 'ACTIVE' ? 'danger' : 'primary'}
        title={pending?.status === 'ACTIVE' ? `Suspend ${pending?.name}?` : `Reactivate ${pending?.name}?`}
        message={pending?.status === 'ACTIVE' ? 'They will be blocked from every request immediately.' : 'They will be able to log in again.'}
        onConfirm={confirm} onCancel={() => setPending(null)} />
    </>
  );
}
