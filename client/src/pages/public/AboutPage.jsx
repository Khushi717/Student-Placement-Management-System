import { faqs } from '../../mocks/mockData';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-bold text-slate-900">About SPMS</h1>
      <p className="mt-4 text-slate-600">
        The Student Placement Management System replaces spreadsheets, e-mail threads and notice boards with a single platform for the college placement cell.
        It supports three roles — students, company recruiters and the TPO/admin — each with a dashboard that matches their responsibilities.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-slate-900">Modules</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
        <li>User management &amp; authentication</li>
        <li>Company &amp; job posting management</li>
        <li>Student application &amp; placement process</li>
        <li>Notifications, reporting &amp; analytics</li>
      </ul>
      <h2 className="mt-10 text-xl font-semibold text-slate-900">FAQ</h2>
      <div className="mt-3 space-y-3">
        {faqs.map((f) => (
          <div key={f.q} className="card p-4">
            <p className="font-medium text-slate-900">{f.q}</p>
            <p className="mt-1 text-sm text-slate-600">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
