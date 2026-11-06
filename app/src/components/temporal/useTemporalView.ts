import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toDayStamp } from '@/lib/temporal/date';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';
import { readTemporalView, temporalViewHref, safeTemporalReturn, type TemporalViewKind } from './temporal-navigation';

/** View-only URL state: no activity, reward or persistence commands. */
export function useTemporalView(kind: TemporalViewKind, inlineDay = false) {
  const location = useLocation();
  const navigate = useNavigate();
  const [fallbackStamp] = useState(() => Date.now());
  const view = readTemporalView(location.search, new Date(fallbackStamp), kind);
  const dayKey = dateToInput(view.anchorDate);
  const anchorKey = kind === 'year' ? `${dayKey.slice(0, 4)}-01-01` : kind === 'week' ? dayKey : `${dayKey.slice(0, 7)}-01`;
  // A guarded view cache keeps Date identity stable for existing grid/request effects.
  // Only URL changes replace it; this does not persist or mutate an activity.
  const [anchorCache, setAnchorCache] = useState(() => ({ key: anchorKey, date: dateFromInput(anchorKey)! }));
  const anchorDate = anchorCache.key === anchorKey ? anchorCache.date : dateFromInput(anchorKey)!;
  if (anchorCache.key !== anchorKey) setAnchorCache({ key: anchorKey, date: anchorDate });
  const selectedDayStamp = view.selectedDayStamp == null ? (inlineDay ? toDayStamp(anchorDate) : null) : toDayStamp(view.selectedDayStamp);
  const previousView = safeTemporalReturn(location.state);
  const navigateView = (anchor: Date, selected: Date | null) => navigate(temporalViewHref(location.pathname, anchor, selected, location.search), {
    replace: true, preventScrollReset: true, state: { temporalViewSelection: true, ...(previousView ? { temporalReturn: previousView } : {}) },
  });
  return {
    anchorDate, selectedDayStamp,
    returnTo: temporalViewHref(location.pathname, anchorDate, selectedDayStamp == null ? null : new Date(selectedDayStamp), location.search),
    setAnchorDate: (next: Date | ((date: Date) => Date)) => navigateView(typeof next === 'function' ? next(new Date(anchorDate)) : next, null),
    setSelectedDayStamp: (stamp: number | null) => navigateView(stamp == null ? anchorDate : new Date(stamp), stamp == null ? null : new Date(stamp)),
  };
}
