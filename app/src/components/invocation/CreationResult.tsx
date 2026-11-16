import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';
import { INVOCATION_TYPES, type InvocationType } from './InvocationChoices';
import { CREATION_DESTINATIONS } from './creation-destination';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/**
 * The moment of conjuring: the sigil of what was created arrives in the colour
 * of its element, a halo opens behind it, two rings leave it and a few sparks
 * rise. Nothing that was earned is computed here; this is only the face of the
 * receipt, which still offers the destination and the Sanctuary.
 */
export function CreationResult({ type, title, elemento }: { type: InvocationType; title: string; elemento?: ElementId | null }) {
  const choice = INVOCATION_TYPES.find(item => item.id === type)!;
  const destination = CREATION_DESTINATIONS[type];
  return <div className="invocation-result" data-element={elemento ?? undefined}>
    <div className="invocation-conjuro" aria-hidden="true">
      <span className="invocation-conjuro-halo" />
      <span className="invocation-conjuro-anel" />
      <span className="invocation-conjuro-anel" data-segundo="" />
      {FAISCAS.map(i => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
      <div className="invocation-success-icon"><ArcaneIcon name={choice.icon} size={44} /></div>
    </div>
    <p className="invocation-result-title">{title}</p>
    <p id="invocation-success-description">Sua invocação foi salva. Você escolhe o próximo passo.</p>
    <Link className="ds-botao" data-tipo="primario" to={destination.path}>{destination.label}</Link>
    <Link className="ds-botao" data-tipo="secundario" to="/santuario">Voltar ao Santuário</Link>
  </div>;
}
