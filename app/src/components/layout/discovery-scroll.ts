/** Mark only deliberate in-page filter/disclosure changes, never ordinary route navigation. */
export const DISCOVERY_NAVIGATION_OPTIONS = {
  replace: true,
  preventScrollReset: true,
  state: { discoveryFilter: true },
};

export function preserveDiscoveryScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  return previousPath === pathname && (pathname === '/dominios' || pathname === '/mapa')
    && typeof state === 'object' && state !== null
    && 'discoveryFilter' in state && state.discoveryFilter === true;
}
