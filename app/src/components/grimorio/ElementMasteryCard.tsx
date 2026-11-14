import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ResourceMeter } from './ResourceMeter';
import type { Element, ElementScore } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function ElementMasteryCard({ element, mastery, score, hasScores }: {
  element: Element; mastery: LevelProgress; score: ElementScore; hasScores: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return <details className="ds-runa grimoire-element" data-element={element.id} data-forma="vitrine">
    <summary>
      <span className="grimoire-element-art" aria-hidden="true">
        {imageFailed ? <ElementIcon element={element.id} size={44} /> : <img src={`/sanctuary/elements/${element.id}-v1.webp`} alt="" width={112} height={112} loading="lazy" onError={() => setImageFailed(true)} />}
      </span>
      <span className="grimoire-element-name"><strong>{element.name}</strong><span>{element.domain}</span><span className="ds-meta"><span>{mastery.title}</span><span>Nível {mastery.level}</span></span></span>
      <ArcaneIcon name="chevron" size={16} className="ds-runa-chevron" />
    </summary>
    <div className="grimoire-element-detail ds-runa-conteudo">
      <ResourceMeter label={`Experiência de ${element.name}`} value={mastery.xpTotal - mastery.xpAtLevelStart} maximum={mastery.xpToNextLevel} color="var(--elem-acento)" icon={<ElementIcon element={element.id} size={17} />} note={`${format(mastery.xpTotal)} XP acumulados. Faltam ${format(mastery.xpToNextLevel - (mastery.xpTotal - mastery.xpAtLevelStart))} XP para o nível ${mastery.level + 1}.`} />
      <dl><div><dt>Pontuação</dt><dd>{format(score.score)} pts</dd></div><div><dt>Participação no equilíbrio</dt><dd>{hasScores ? `${score.percentage}%` : 'Sem pontuação'}</dd></div></dl>
      <p className="ds-nota">{element.description}</p>
      <Link className="ds-elo" to={`/santuario/elementos/${element.id}`}>Explorar {element.name}</Link>
    </div>
  </details>;
}
