import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { myInterviews } from '../../modules/interviews/interview.api';
import { formatDateTime } from '../../utils/format';

export default function AdminInterviewsPage() {
  const { data, loading, error, reload } = useFetch(myInterviews, []);
  const columns = [
    { key: 'student', header: 'Candidate', render: (i) => <div><p className="font-medium text-slate-900">{i.application?.student?.name}</p><p className="text-xs text-slate-500">{i.application?.student?.email}</p></div> },
    { key: 'job', header: 'Job', render: (i) => `${i.application?.job?.title} · ${i.application?.job?.company?.name}` },
    { key: 'round', header: 'Round' },
    { key: 'scheduledAt', header: 'When', render: (i) => formatDateTime(i.scheduledAt) },
    { key: 'mode', header: 'Mode / place', render: (i) => `${i.mode}${i.location ? ` · ${i.location}` : ''}` },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
  ];
  return (
    <>
      <PageHeader title="Interview schedule" subtitle="All interviews. To schedule a new one, shortlist a candidate under Applications and choose “Schedule interview”." />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No interviews scheduled" />
    </>
  );
}
