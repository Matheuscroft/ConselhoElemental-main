import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { RewardSummary } from './RewardSummary';

export function RewardNotice({ title, name, onDismiss, ...reward }: ComponentProps<typeof RewardSummary> & {
  title: string; name?: string; onDismiss: () => void;
}) {
  return <div className="elemental-reward-notice">
    <div className="elemental-reward-heading"><div><strong>{title}</strong>{name && <small>{name}</small>}</div>
      <button type="button" onClick={onDismiss} aria-label="Fechar recompensa"><X size={20} /></button>
    </div>
    <RewardSummary {...reward} animate />
  </div>;
}
