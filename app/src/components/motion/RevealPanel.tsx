import type { ReactNode } from 'react';

/** Mounted content preserves local state; collapsed controls leave keyboard/AT navigation immediately. */
export function RevealPanel({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return <div id={id} className="elemental-reveal-panel" data-open={open} inert={!open} aria-hidden={!open}>
    <div className="elemental-reveal-inner">{children}</div>
  </div>;
}
