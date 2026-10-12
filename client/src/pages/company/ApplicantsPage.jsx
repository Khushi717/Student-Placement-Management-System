import PageHeader from '../../components/common/PageHeader';
import ApplicantsTable from '../shared/ApplicantsTable';

export default function ApplicantsPage() {
  return (
    <>
      <PageHeader title="Applicants" subtitle="Shortlist candidates, schedule interviews and make offers." />
      <ApplicantsTable />
    </>
  );
}
