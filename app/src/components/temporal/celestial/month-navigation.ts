/** Strict local calendar date. No UTC conversion or rollover of invalid input. */
export function monthFromSearch(search: string, fallback: Date): Date {
  const value = new URLSearchParams(search).get('mes');
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? '');
  if (!match || Number(match[1]) < 1000) return fallback;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}
export function monthHref(date: Date) {
  return `/temporal/mes?mes=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
