import { Link } from 'react-router-dom';
import { ShieldCheck, Briefcase, BarChart3, ArrowRight, Users } from 'lucide-react';
import { landingStats } from '../../mocks/mockData';
import MockDataNotice from '../../components/common/MockDataNotice';

const features = [
  { icon: Users, title: 'One profile, every drive', text: 'Students keep academic details and resume links in one place and apply in a click.' },
  { icon: ShieldCheck, title: 'Verified recruiters', text: 'The placement cell approves every company before it can publish a job.' },
  { icon: Briefcase, title: 'Automatic eligibility', text: 'CGPA, branch and backlog rules are checked for you before you apply.' },
  { icon: BarChart3, title: 'Placement analytics', text: 'Branch-wise, company-wise and package-wise insights for the TPO.' },
];

export default function LandingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">KIET Deemed to be University</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Campus placements, organised end to end.</h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100">Students, recruiters and the Training &amp; Placement Office work from one transparent platform — from company verification to offer acceptance.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn bg-white text-navy-800 hover:bg-navy-50">Create an account <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" className="btn border border-white/30 text-white hover:bg-white/10">Log in</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <MockDataNotice>Sample figures for the landing page.</MockDataNotice>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {landingStats.map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <dd className="text-3xl font-bold text-navy-700">{s.value}</dd>
              <dt className="mt-1 text-sm text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-8 text-2xl font-semibold text-slate-900">Built for every role in the process</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-navy-50 p-2 text-navy-700"><Icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
