interface RefreshAuth { startAutoRefresh(): Promise<void>; stopAutoRefresh(): Promise<void> }
type Visibility = Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;
/** Explicit live handoff only. Serializes start/stop so late async starts cannot survive cleanup. */
export function attachSessionRefresh(auth: RefreshAuth, surface: Visibility, onFailure: () => void): () => void {
  let active = true;
  let queue: Promise<void> = Promise.resolve();
  function schedule() {
    const visible = surface.visibilityState === 'visible';
    queue = queue.then(async () => {
      if (!active) return;
      if (visible) await auth.startAutoRefresh(); else await auth.stopAutoRefresh();
    }).catch(() => { if (active) onFailure(); });
  }
  surface.addEventListener('visibilitychange', schedule);
  schedule();
  return () => {
    if (!active) return;
    active = false;
    surface.removeEventListener('visibilitychange', schedule);
    queue = queue.then(() => auth.stopAutoRefresh()).catch(() => {});
  };
}
