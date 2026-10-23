/** Keeps the presentation current after backgrounding, without activity-timer writes. */
export function subscribeLiveClock(refresh: () => void, doc: Document = document, host: Window = window) {
  const updateVisible = () => { if (!doc.hidden) refresh(); };
  const interval = host.setInterval(updateVisible, 60_000);
  doc.addEventListener('visibilitychange', updateVisible);
  host.addEventListener('focus', updateVisible);
  return () => {
    host.clearInterval(interval);
    doc.removeEventListener('visibilitychange', updateVisible);
    host.removeEventListener('focus', updateVisible);
  };
}
