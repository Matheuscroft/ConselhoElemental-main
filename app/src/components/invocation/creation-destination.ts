import type { InvocationType } from './InvocationChoices';

export const CREATION_DESTINATIONS: Record<InvocationType, { path: string; label: string }> = {
  ACTION: { path: '/rituais', label: 'Ver Rituais' },
  HABIT: { path: '/ciclos', label: 'Ver Ciclos' },
  QUEST: { path: '/jornadas', label: 'Ver Jornadas' },
  PROJECT: { path: '/grandes-obras', label: 'Ver Grandes Obras' },
  DRAFT: { path: '/forja', label: 'Ver Forja' },
};
