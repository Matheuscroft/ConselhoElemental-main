import { toDayStamp } from '@/lib/temporal/date';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';

export type TemporalViewKind = 'week' | 'month' | 'calendar' | 'year';
const paths = ['/temporal/semana', '/temporal/mes', '/temporal/calendario', '/temporal/ano'];
const readDay = (value: string | null) => { try { return dateFromInput(value ?? ''); } catch { return null; } };

export function readTemporalView(search: string, fallback: Date, kind: TemporalViewKind) {
  const params = new URLSearchParams(search);
  const selected = readDay(params.get('dia'));
  const month = params.get('mes');
  const yearText = params.get('ano');
  const year = yearText && /^[1-9]\d{3}$/.test(yearText) ? Number(yearText) : null;
  if (kind === 'year') return { anchorDate: new Date(year ?? selected?.getFullYear() ?? fallback.getFullYear(), 0, 1), selectedDayStamp: null };
  const anchor = kind === 'week'
    ? selected ?? readDay(params.get('data')) ?? fallback
    : (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? readDay(`${month}-01`) : null) ?? selected ?? fallback;
  return { anchorDate: anchor, selectedDayStamp: selected ? toDayStamp(selected) : null };
}

export function temporalViewHref(pathname: string, anchor: Date, selected: Date | null = null, search = '') {
  const params = new URLSearchParams(search);
  if (pathname === '/temporal/ano') { params.set('ano', String(anchor.getFullYear())); params.delete('mes'); params.delete('data'); params.delete('dia'); return `${pathname}?${params}`; }
  params.delete('ano');
  if (pathname === '/temporal/semana') { params.set('data', dateToInput(anchor)); params.delete('mes'); }
  else { params.set('mes', dateToInput(anchor).slice(0, 7)); params.delete('data'); }
  if (selected) params.set('dia', dateToInput(selected)); else params.delete('dia');
  return `${pathname}?${params}`;
}

export function safeTemporalReturn(state: unknown): string | null {
  if (!state || typeof state !== 'object' || !('temporalReturn' in state) || typeof state.temporalReturn !== 'string') return null;
  const href = state.temporalReturn;
  if (href.length > 2048 || !href.startsWith('/temporal/') || href.includes('\\')) return null;
  const url = new URL(href, 'https://temporal.invalid');
  return url.origin === 'https://temporal.invalid' && paths.includes(url.pathname) ? url.pathname + url.search : null;
}

export function preserveTemporalScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  return previousPath === pathname && paths.includes(pathname) && !!state && typeof state === 'object'
    && 'temporalViewSelection' in state && state.temporalViewSelection === true;
}
