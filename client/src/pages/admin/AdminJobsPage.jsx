import PageHeader from '../../components/common/PageHeader';
import JobsTable from '../shared/JobsTable';

export default function AdminJobsPage() {
  return (
    <>
      <PageHeader title="Job postings" subtitle="All postings across companies. Admins can close or withdraw any posting." />
      <JobsTable showCompany />
    </>
  );
}
