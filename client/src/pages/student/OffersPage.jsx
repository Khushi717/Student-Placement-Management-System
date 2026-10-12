import { useState } from 'react';
import { Gift } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { myOffers, respondToOffer } from '../../modules/offers/offer.api';
import { getErrorMessage } from '../../services/apiClient';
import { formatDate, formatLPA } from '../../utils/format';

export default function OffersPage() {
  const { data, loading, error, reload } = useFetch(myOffers, []);
  const [pending, setPending] = useState(null); // { offer, response }
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setActionError('');
    try { await respondToOffer(pending.offer._id, pending.response); setPending(null); reload(); }
    catch (err) { setActionError(getErrorMessage(err)); setPending(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="My offers" subtitle="Review and respond to offers. Responses are final." />
      <ErrorMessage message={actionError} />
      {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState icon={Gift} title="No offers yet" description="Offers from companies will show up here." />
      ) : (
        <div className="space-y-4">
          {data.map((o) => (
            <div key={o._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{o.job?.title} <span className="font-normal text-slate-500">at {o.company?.name}</span></h3>
                  <p className="mt-1 text-lg font-semibold text-navy-700">{formatLPA(o.packageLPA)}</p>
                  <p className="text-sm text-slate-500">Joining: {formatDate(o.joiningDate)} · Offered {formatDate(o.createdAt)}</p>
                  {o.message && <p className="mt-2 text-sm text-slate-600">{o.message}</p>}
                </div>
                <StatusBadge status={o.status} />
              </div>
              {o.status === 'PENDING' && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setPending({ offer: o, response: 'ACCEPTED' })}>Accept offer</Button>
                  <Button variant="secondary" onClick={() => setPending({ offer: o, response: 'DECLINED' })}>Decline</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal open={Boolean(pending)} loading={busy} variant={pending?.response === 'ACCEPTED' ? 'primary' : 'danger'}
        title={pending?.response === 'ACCEPTED' ? 'Accept this offer?' : 'Decline this offer?'}
        message="This decision cannot be changed afterwards." confirmLabel={pending?.response === 'ACCEPTED' ? 'Yes, accept' : 'Yes, decline'}
        onConfirm={confirm} onCancel={() => setPending(null)} />
    </>
  );
}
