import { safeTemporalReturn } from '@/components/temporal/temporal-navigation';

/** Presentation destination only. Never an authorization, plan, or consent. */
export function safeReminderReturn(input: string): string {
  const href = safeTemporalReturn({ temporalReturn: input });
  if (!href) return '/santuario';
  const url = new URL(href, 'https://temporal.invalid');
  const params = new URLSearchParams();
  // Keep the selected period/day, without forwarding workspace switches or nested destinations.
  for (const key of ['data', 'dia', 'mes', 'ano']) {
    const value = url.searchParams.get(key);
    if (value !== null && value.length <= 32) params.set(key, value);
  }
  return url.pathname + (params.size ? `?${params}` : '');
}
export function reminderWorkspaceHref(returnTo: string): string {
  return `/?${new URLSearchParams({ progresso: 'lembretes', voltar: safeReminderReturn(returnTo) })}`;
}
export function reminderReturnFromSearch(search: string): string {
  return safeReminderReturn(new URLSearchParams(search).get('voltar') ?? '');
}
