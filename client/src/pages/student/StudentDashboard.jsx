import { Briefcase, FileText, CalendarClock, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { listJobs } from '../../modules/jobs/job.api';
import { myApplications } from '../../modules/applications/application.api';
import { myInterviews } from '../../modules/interviews/interview.api';
import { myOffers } from '../../modules/offers/offer.api';
import { formatDate } from '../../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const jobs = useFetch(() => listJobs({ eligible: 'true', limit: 1 }), []);
  const apps = useFetch(() => myApplications({ limit: 5 }), []);
  const interviews = useFetch(myInterviews, []);
  const offers = useFetch(myOffers, []);
  const incomplete = !user.studentProfile?.cgpa || !user.studentProfile?.resumeUrl;

  if (apps.loading || jobs.loading) return <LoadingSpinner />;
  if (apps.error) return <ErrorMessage message={apps.error} onRetry={apps.reload} />;

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]} 👋`} subtitle="Here's where your placement journey stands." />
      {incomplete && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Complete your <Link to="/student/profile" className="font-medium underline">profile</Link> (CGPA and resume link) to apply and see accurate eligibility.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Eligible drives" value={jobs.meta?.total ?? 0} icon={Briefcase} />
        <StatCard label="My applications" value={apps.meta?.total ?? 0} icon={FileText} tone="green" />
        <StatCard label="Interviews" value={interviews.data?.length ?? 0} icon={CalendarClock} tone="amber" />
        <StatCard label="Offers" value={offers.data?.length ?? 0} icon={Gift} tone="green" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Recent applications</h2>
      <div className="card divide-y divide-slate-100">
        {apps.data?.length ? apps.data.map((a) => (
          <div key={a._id} className="flex items-center justify-between p-4">
            <div><p className="font-medium text-slate-900">{a.job?.title}</p><p className="text-xs text-slate-500">{a.job?.company?.name} · applied {formatDate(a.createdAt)}</p></div>
            <StatusBadge status={a.status} />
          </div>
        )) : <p className="p-6 text-sm text-slate-500">No applications yet. <Link to="/student/jobs" className="font-medium text-navy-700 underline">Browse drives</Link></p>}
      </div>
    </>
  );
}
