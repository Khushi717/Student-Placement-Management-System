import { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import { Input, Textarea } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import MockDataNotice from '../../components/common/MockDataNotice';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); }; // TODO: wire to a /api/contact endpoint
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contact the placement cell</h1>
        <p className="mt-3 text-slate-600">Questions about drives, company registration or your account? Send us a message.</p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy-600" /> placement@example.edu</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-navy-600" /> Training &amp; Placement Office, Campus</p>
        </div>
      </div>
      <form onSubmit={submit} className="card space-y-4 p-6">
        <MockDataNotice>Form is not connected to a backend yet — nothing is sent.</MockDataNotice>
        {sent ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Thanks! (Demo only — no message was sent.)</p> : (
          <>
            <Input label="Your name" name="name" required />
            <Input label="Email" name="email" type="email" required />
            <Textarea label="Message" name="message" required />
            <Button type="submit">Send message</Button>
          </>
        )}
      </form>
    </div>
  );
}
