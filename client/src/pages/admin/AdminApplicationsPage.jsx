import PageHeader from '../../components/common/PageHeader';
import ApplicantsTable from '../shared/ApplicantsTable';

export default function AdminApplicationsPage() {
  return (
    <>
      <PageHeader title="Applications" subtitle="Every application in the system. Admins can move candidates through the pipeline." />
      <ApplicantsTable />
    </>
  );
}
