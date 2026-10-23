import { useCallback, useEffect, useState } from 'react';
import { subscribeLiveClock } from './live-clock';

/** Presentation clock only. Does not interact with the activity timer. */
export function useLiveDate() {
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);
  useEffect(() => subscribeLiveClock(refresh), [refresh]);
  return { now, refresh };
}
