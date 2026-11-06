import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { INVOCATION_TYPES, type InvocationType } from './InvocationChoices';
import { CREATION_DESTINATIONS } from './creation-destination';

export function CreationResult({ type, title }: { type: InvocationType; title: string }) {
  const choice = INVOCATION_TYPES.find(item => item.id === type)!;
  const destination = CREATION_DESTINATIONS[type];
  return <div className="invocation-result">
    <div className="invocation-success-icon" aria-hidden="true"><ArcaneIcon name={choice.icon} size={40} /></div>
    <p className="invocation-result-title">{title}</p>
    <p id="invocation-success-description">Sua invocação foi salva. Você escolhe o próximo passo.</p>
    <Link className="elemental-action elemental-press" to={destination.path}>{destination.label}</Link>
    <Link className="elemental-action elemental-action-secondary elemental-press" to="/santuario">Voltar ao Santuário</Link>
  </div>;
}
