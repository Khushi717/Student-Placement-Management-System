import { Link } from 'react-router-dom';
import { Briefcase, Users, ShieldCheck, FileCheck2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { listJobs } from '../../modules/jobs/job.api';
import { listApplicants } from '../../modules/applications/application.api';

export default function CompanyDashboard() {
  const { company } = useAuth();
  const jobs = useFetch(() => listJobs({ limit: 100 }), []);
  const applicants = useFetch(() => listApplicants({ limit: 5 }), []);
  const approved = company?.verificationStatus === 'APPROVED';
  if (jobs.loading || applicants.loading) return <LoadingSpinner />;

  const published = (jobs.data || []).filter((j) => j.status === 'PUBLISHED').length;
  return (
    <>
      <PageHeader title={company?.name || 'Company dashboard'} subtitle="Manage postings and review applicants." actions={approved && <Link to="/company/jobs/new" className="btn bg-navy-700 text-white hover:bg-navy-800">Post a job</Link>} />
      {!approved && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {company?.verificationStatus === 'REJECTED'
            ? <>Your company registration was rejected{company.verificationRemarks ? `: ${company.verificationRemarks}` : '.'} Update your <Link to="/company/profile" className="font-medium underline">profile</Link> or contact the placement cell.</>
            : 'Your company is awaiting verification by the placement cell. You will be able to publish jobs once approved.'}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verification" value={<StatusBadge status={company?.verificationStatus} />} icon={ShieldCheck} tone={approved ? 'green' : 'amber'} />
        <StatCard label="Total postings" value={jobs.meta?.total ?? 0} icon={Briefcase} />
        <StatCard label="Published" value={published} icon={FileCheck2} tone="green" />
        <StatCard label="Applicants" value={applicants.meta?.total ?? 0} icon={Users} tone="amber" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Latest applicants</h2>
      <div className="card divide-y divide-slate-100">
        {applicants.data?.length ? applicants.data.map((a) => (
          <div key={a._id} className="flex items-center justify-between p-4">
            <div><p className="font-medium text-slate-900">{a.student?.name}</p><p className="text-xs text-slate-500">{a.job?.title} · {a.student?.studentProfile?.branch} · CGPA {a.student?.studentProfile?.cgpa ?? '—'}</p></div>
            <StatusBadge status={a.status} />
          </div>
        )) : <p className="p-6 text-sm text-slate-500">No applicants yet.</p>}
      </div>
    </>
  );
}
