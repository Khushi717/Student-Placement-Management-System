import { Star } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import useFetch from '../../hooks/useFetch';
import { listFeedback } from '../../modules/feedback/feedback.api';
import { formatDate } from '../../utils/format';

export default function FeedbackManagementPage() {
  const { data, loading, error, reload } = useFetch(listFeedback, []);
  const columns = [
    { key: 'company', header: 'Company', render: (f) => <div><p className="font-medium text-slate-900">{f.company?.name}</p><p className="text-xs text-slate-500">{f.job?.title}</p></div> },
    { key: 'rating', header: 'Rating', render: (f) => <span className="inline-flex items-center gap-1 text-amber-600"><Star className="h-4 w-4 fill-current" /> {f.rating}/5</span> },
    { key: 'comments', header: 'Comments', render: (f) => <span className="text-slate-600">{f.comments || '—'}</span> },
    { key: 'student', header: 'Student', render: (f) => `${f.student?.name ?? ''} ${f.student?.studentProfile?.branch ? `(${f.student.studentProfile.branch})` : ''}` },
    { key: 'createdAt', header: 'Date', render: (f) => formatDate(f.createdAt) },
  ];
  return (
    <>
      <PageHeader title="Feedback" subtitle="Student feedback about companies and drives." />
      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyTitle="No feedback yet" />
    </>
  );
}
