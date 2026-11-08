import { STORE_KEYS } from './progress-backup';

export function accessEntry(pathname: string | undefined, search: string): 'account' | 'welcome' | null {
  if (pathname === '/auth' || pathname === '/entrar' || pathname === '/cadastro') return 'account';
  if (pathname === '/boas-vindas' || new URLSearchParams(search).get('progresso') === 'inicio') return 'welcome';
  return null;
}

/** Called only after the existing startup barriers; any local projection wins. */
export function shouldShowWelcome(pathname: string | undefined, storage: Pick<Storage, 'getItem'>) {
  return pathname === '/' && storage.getItem(STORE_KEYS.core) === null && storage.getItem(STORE_KEYS.fitness) === null;
}
