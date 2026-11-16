import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ResourceMeter } from './ResourceMeter';
import { AnelMaestria } from './AnelMaestria';
import type { Element, ElementScore } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function ElementMasteryCard({ element, mastery, score, hasScores, chegou = true, ordem = 0 }: {
  element: Element; mastery: LevelProgress; score: ElementScore; hasScores: boolean;
  /** False until the section was seen: the ring waits at zero and then draws itself. */
  chegou?: boolean;
  /** Position in the list, for the cascade. */
  ordem?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const levelXp = mastery.xpTotal - mastery.xpAtLevelStart;
  const fraction = mastery.xpToNextLevel > 0 ? levelXp / mastery.xpToNextLevel : 0;
  return <details className="ds-runa grimoire-element" data-element={element.id} data-forma="vitrine" data-luz="" data-chegou={chegou} style={{ '--ordem': ordem } as CSSProperties}>
    <summary>
      <span className="gr-brilho" aria-hidden="true" />
      <span className="grimoire-element-art" aria-hidden="true">
        <AnelMaestria fracao={fraction} nivel={mastery.level} chegou={chegou} />
        {imageFailed ? <ElementIcon element={element.id} size={36} /> : <img src={`/sanctuary/elements/${element.id}-v1.webp`} alt="" width={112} height={112} loading="lazy" onError={() => setImageFailed(true)} />}
      </span>
      <span className="grimoire-element-name"><strong>{element.name}</strong><span>{element.domain}</span><span className="ds-meta"><span>{mastery.title}</span><span>Nível {mastery.level}</span></span></span>
      <ArcaneIcon name="chevron" size={16} className="ds-runa-chevron" />
    </summary>
    <div className="grimoire-element-detail ds-runa-conteudo">
      <ResourceMeter label={`Experiência de ${element.name}`} value={levelXp} maximum={mastery.xpToNextLevel} color="var(--elem-acento)" icon={<ElementIcon element={element.id} size={17} />} note={`${format(mastery.xpTotal)} XP acumulados. Faltam ${format(mastery.xpToNextLevel - levelXp)} XP para o nível ${mastery.level + 1}.`} />
      <dl><div><dt>Pontuação</dt><dd>{format(score.score)} pts</dd></div><div><dt>Participação no equilíbrio</dt><dd>{hasScores ? `${score.percentage}%` : 'Sem pontuação'}</dd></div></dl>
      <p className="ds-nota">{element.description}</p>
      <Link className="ds-elo" to={`/santuario/elementos/${element.id}`}>Explorar {element.name}</Link>
    </div>
  </details>;
}
