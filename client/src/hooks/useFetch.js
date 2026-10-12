import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/apiClient';

/** Runs an API function on mount / when deps change. Returns { data, meta, loading, error, reload }. */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then(({ data, meta }) => !cancelled && setState({ data, meta, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, meta: null, loading: false, error: getErrorMessage(err) }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);
  return { ...state, reload: run };
}
