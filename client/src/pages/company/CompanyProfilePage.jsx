import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Input, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { updateCompany } from '../../modules/companies/company.api';
import { getErrorMessage } from '../../services/apiClient';

const FIELDS = ['name', 'industry', 'website', 'location', 'description', 'hrContactName', 'hrContactEmail', 'hrContactPhone'];

export default function CompanyProfilePage() {
  const { company, refresh } = useAuth();
  const [f, setF] = useState(Object.fromEntries(FIELDS.map((k) => [k, company?.[k] || ''])));
  const [state, setState] = useState({ saving: false, error: '', ok: false });
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', ok: false });
    try {
      // Send only non-empty values; the API rejects empty URL/e-mail strings.
      await updateCompany(company._id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '')));
      await refresh();
      setState({ saving: false, error: '', ok: true });
    } catch (err) { setState({ saving: false, error: getErrorMessage(err), ok: false }); }
  };

  return (
    <>
      <PageHeader title="Company profile" subtitle="Keep your details current — the placement cell uses them to verify you." actions={<StatusBadge status={company?.verificationStatus} />} />
      <form onSubmit={onSubmit} className="card max-w-3xl space-y-4 p-6">
        <ErrorMessage message={state.error} />
        {state.ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Profile saved.</p>}
        {company?.verificationRemarks && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">TPO remarks: {company.verificationRemarks}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company name" name="name" value={f.name} onChange={onChange} required />
          <Input label="Industry" name="industry" value={f.industry} onChange={onChange} />
          <Input label="Website" name="website" type="url" value={f.website} onChange={onChange} />
          <Input label="Location" name="location" value={f.location} onChange={onChange} />
          <Input label="HR contact name" name="hrContactName" value={f.hrContactName} onChange={onChange} />
          <Input label="HR contact email" name="hrContactEmail" type="email" value={f.hrContactEmail} onChange={onChange} />
          <Input label="HR contact phone" name="hrContactPhone" value={f.hrContactPhone} onChange={onChange} />
          <div className="sm:col-span-2"><Textarea label="About" name="description" value={f.description} onChange={onChange} /></div>
        </div>
        <Button type="submit" loading={state.saving}>Save changes</Button>
      </form>
    </>
  );
}
