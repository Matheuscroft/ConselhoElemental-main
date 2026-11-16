import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CREATION_DESTINATIONS } from '@/components/invocation/creation-destination';
import type { InvocationType } from '@/components/invocation/InvocationChoices';

export type ForgeFeedbackValue = {
  title: string;
  message: string;
  destination?: Exclude<InvocationType, 'DRAFT'>;
  /** The idea was just kept: the seal lights, a ring and a few sparks leave it. */
  celebrar?: boolean;
};

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export function ForgeFeedback({ value }: { value: ForgeFeedbackValue }) {
  const destination = value.destination && CREATION_DESTINATIONS[value.destination];
  return <div className="forge-feedback-content" data-celebrar={value.celebrar ? '' : undefined}>
    <span className="forge-feedback-seal" aria-hidden="true">
      {value.celebrar && <>
        <span className="forge-feedback-anel" />
        {FAISCAS.map(i => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
      </>}
      <ArcaneIcon name={value.celebrar ? 'forja' : 'concluir'} size={20} />
    </span>
    <div><strong>{value.title}</strong><p>{value.message}</p></div>
    {destination && <Link className="elemental-press" to={destination.path}>{destination.label}</Link>}
  </div>;
}
