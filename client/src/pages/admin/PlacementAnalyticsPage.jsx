import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ChartCard from '../../components/dashboard/ChartCard';
import DataTable from '../../components/common/DataTable';
import MockDataNotice from '../../components/common/MockDataNotice';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getDashboard, getPlacementRecords, generateReport } from '../../modules/reports/report.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, formatLPA } from '../../utils/format';
import { yearlyTrend } from '../../mocks/mockData'; // MOCK: no multi-year history exists yet

export default function PlacementAnalyticsPage() {
  const dash = useFetch(getDashboard, []);
  const records = useFetch(() => getPlacementRecords(), []);
  const [reportMsg, setReportMsg] = useState('');

  const tryGenerate = async (format) => {
    setReportMsg('');
    try { await generateReport(format); } catch (err) { setReportMsg(getErrorMessage(err)); } // expected: 501 placeholder
  };

  if (dash.loading) return <LoadingSpinner />;
  if (dash.error) return <ErrorMessage message={dash.error} onRetry={dash.reload} />;
  const d = dash.data;

  const columns = [
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium text-slate-900">{r.student}</p><p className="text-xs text-slate-500">{r.enrollmentNo}</p></div> },
    { key: 'branch', header: 'Branch' },
    { key: 'company', header: 'Company' },
    { key: 'role', header: 'Role' },
    { key: 'packageLPA', header: 'Package', render: (r) => formatLPA(r.packageLPA) },
    { key: 'acceptedOn', header: 'Accepted', render: (r) => formatDate(r.acceptedOn) },
  ];

  return (
    <>
      <PageHeader title="Placement analytics" subtitle="Branch, company and package-wise placement data."
        actions={<><Button variant="secondary" onClick={() => tryGenerate('pdf')}><Download className="h-4 w-4" /> PDF</Button><Button variant="secondary" onClick={() => tryGenerate('xlsx')}><Download className="h-4 w-4" /> Excel</Button></>} />
      <ErrorMessage message={reportMsg} />
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Company-wise placements" subtitle="Accepted offers per company (top 15)">
          {d.companyWise.length ? <ResponsiveContainer><BarChart data={d.companyWise} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="company" width={110} /><Tooltip /><Bar dataKey="placed" name="Placed" fill="#264d8c" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="No placements yet" />}
        </ChartCard>
        <ChartCard title="Package-wise placements" subtitle="Accepted offers by package band">
          <ResponsiveContainer><BarChart data={d.packageWise}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="range" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Students" fill="#5580c4" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Year-over-year trend" subtitle="Historical placements" className="lg:col-span-2">
          <MockDataNotice>Sample data — multi-year history will come from archived placement records.</MockDataNotice>
          <div className="h-52"><ResponsiveContainer><LineChart data={yearlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="placed" name="Students placed" stroke="#264d8c" strokeWidth={2} /><Line type="monotone" dataKey="offers" name="Offers" stroke="#f59e0b" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </ChartCard>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Placement records</h2>
      <DataTable columns={columns} rows={records.data} loading={records.loading} error={records.error} onRetry={records.reload} rowKey={(r) => r.offerId} emptyTitle="No accepted offers yet" emptyDescription="Records appear here once students accept offers." />
    </>
  );
}
