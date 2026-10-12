import { Users, GraduationCap, Building2, Briefcase, FileText, Gift, ShieldAlert, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getDashboard } from '../../modules/reports/report.api';
import { humanize } from '../../utils/format';

export const PIE_COLORS = ['#264d8c', '#5580c4', '#85a6d9', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(getDashboard, []);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  const t = data.totals;
  const statusData = data.applicationsByStatus.map((s) => ({ name: humanize(s.status), value: s.count }));

  return (
    <>
      <PageHeader title="Placement overview" subtitle="Live numbers from students, companies, applications and offers." />
      {t.pendingCompanies > 0 && (
        <Link to="/admin/companies" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 hover:bg-amber-100">
          <ShieldAlert className="h-5 w-5" /> {t.pendingCompanies} company registration(s) waiting for verification →
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={t.totalStudents} icon={Users} />
        <StatCard label="Placed students" value={t.placedStudents} icon={GraduationCap} tone="green" hint={`${t.placementRate}% placement rate`} />
        <StatCard label="Verified companies" value={t.approvedCompanies} icon={Building2} />
        <StatCard label="Open drives" value={t.openJobs} icon={Briefcase} tone="amber" />
        <StatCard label="Applications" value={t.totalApplications} icon={FileText} />
        <StatCard label="Offers made" value={t.offersMade} icon={Gift} tone="green" />
        <StatCard label="Average package" value={`₹${t.averagePackageLPA} LPA`} icon={TrendingUp} tone="green" />
        <StatCard label="Highest package" value={`₹${t.highestPackageLPA} LPA`} icon={TrendingUp} tone="green" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Branch-wise placements" subtitle="Placed vs total students">
          {data.branchWise.length ? (
            <ResponsiveContainer><BarChart data={data.branchWise}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="branch" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="total" name="Students" fill="#b3c9ea" radius={[4, 4, 0, 0]} /><Bar dataKey="placed" name="Placed" fill="#264d8c" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          ) : <EmptyState title="No data yet" />}
        </ChartCard>
        <ChartCard title="Applications by status">
          {statusData.length ? (
            <ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          ) : <EmptyState title="No applications yet" />}
        </ChartCard>
      </div>
    </>
  );
}
