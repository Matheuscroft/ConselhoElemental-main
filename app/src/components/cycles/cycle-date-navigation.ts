import { dateToInput } from '@/lib/temporal/recurrence';
import { safeTemporalReturn } from '@/components/temporal/temporal-navigation';

export function isCycleDateSelection(state: unknown, intent: string | null): boolean {
  return !!intent && !!state && typeof state === 'object' && 'cycleDateSelection' in state && state.cycleDateSelection === true
    && 'cycleDateIntent' in state && state.cycleDateIntent === intent;
}
/** View state only; manual date selection exits an activity deep link without clearing live filters. */
export function cycleDateNavigation(search: string, date: Date, accountId: string | null, state: unknown, keepActivity = false) {
  const params = new URLSearchParams(search);
  params.set('data', dateToInput(date));
  if (!keepActivity) params.delete('atividade');
  const activity = params.get('atividade');
  const intent = activity ? `${accountId}:${activity}:${params.get('data')}` : `${accountId}:day:${params.get('data')}`;
  const temporalReturn = safeTemporalReturn(state);
  return { href: `/ciclos?${params}`, options: { replace: true, preventScrollReset: true,
    state: { cycleDateSelection: true, cycleDateIntent: intent, ...(temporalReturn ? { temporalReturn } : {}) } } };
}
export function preserveCycleDateScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  return previousPath === '/ciclos' && pathname === '/ciclos' && !!state && typeof state === 'object'
    && 'cycleDateIntent' in state && typeof state.cycleDateIntent === 'string' && isCycleDateSelection(state,state.cycleDateIntent);
}
