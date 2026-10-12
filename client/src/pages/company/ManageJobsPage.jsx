import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import JobsTable from '../shared/JobsTable';

export default function ManageJobsPage() {
  return (
    <>
      <PageHeader title="Job postings" subtitle="Publish, close or withdraw your postings." actions={<Link to="/company/jobs/new" className="btn bg-navy-700 text-white hover:bg-navy-800">New posting</Link>} />
      <JobsTable />
    </>
  );
}
