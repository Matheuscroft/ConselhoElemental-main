import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ResourceMeter } from './ResourceMeter';
import type { Element, ElementScore } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';

const COLORS = { terra: '151 192 144', fogo: '245 162 109', agua: '125 207 229', ar: '197 223 229' };
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function ElementMasteryCard({ element, mastery, score, hasScores }: {
  element: Element; mastery: LevelProgress; score: ElementScore; hasScores: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return <details className="grimoire-element" style={{ '--element-tint': COLORS[element.id] } as CSSProperties}>
    <summary>
      <span className="grimoire-element-art" aria-hidden="true">
        {imageFailed ? <ElementIcon element={element.id} size={52} /> : <img src={`/sanctuary/elements/${element.id}-v1.webp`} alt="" width={112} height={112} loading="lazy" onError={() => setImageFailed(true)} />}
      </span>
      <span className="grimoire-element-name"><strong>{element.name}</strong><span>{element.domain}</span><small>{mastery.title} · Nível {mastery.level}</small></span>
      <ChevronDown size={18} className="grimoire-disclosure" aria-hidden="true" />
    </summary>
    <div className="grimoire-element-detail">
      <ResourceMeter label={`Experiência de ${element.name}`} value={mastery.xpTotal - mastery.xpAtLevelStart} maximum={mastery.xpToNextLevel} color={COLORS[element.id]} icon={<ElementIcon element={element.id} size={17} />} note={`${format(mastery.xpTotal)} XP acumulados. Faltam ${format(mastery.xpToNextLevel - (mastery.xpTotal - mastery.xpAtLevelStart))} XP para o nível ${mastery.level + 1}.`} />
      <dl><div><dt>Pontuação</dt><dd>{format(score.score)} pts</dd></div><div><dt>Participação no equilíbrio</dt><dd>{hasScores ? `${score.percentage}%` : 'Sem pontuação'}</dd></div></dl>
      <p>{element.description}</p>
      <Link to={`/santuario/elementos/${element.id}`}>Explorar {element.name}<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div>
  </details>;
}
