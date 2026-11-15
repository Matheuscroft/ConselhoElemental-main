import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CREATION_DESTINATIONS } from '@/components/invocation/creation-destination';
import type { InvocationType } from '@/components/invocation/InvocationChoices';

export type ForgeFeedbackValue = { title: string; message: string; destination?: Exclude<InvocationType, 'DRAFT'> };

export function ForgeFeedback({ value }: { value: ForgeFeedbackValue }) {
  const destination = value.destination && CREATION_DESTINATIONS[value.destination];
  return <div className="forge-feedback-content">
    <span className="forge-feedback-seal" aria-hidden="true"><ArcaneIcon name="concluir" size={20} /></span>
    <div><strong>{value.title}</strong><p>{value.message}</p></div>
    {destination && <Link className="elemental-press" to={destination.path}>{destination.label}</Link>}
  </div>;
}
