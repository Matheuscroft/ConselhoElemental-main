import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS, type ElementId } from '@/constants';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function ElementReading({ elementId, score, percentage }: { elementId: ElementId; score: number; percentage: number }) {
  const element = ELEMENTS[elementId];
  const [failed, setFailed] = useState(false);
  return <details className="astrolabe-element" style={{ '--reading-color': element.color } as CSSProperties}>
    <summary>
      <span className="astrolabe-element-art" aria-hidden="true">{failed ? <ElementIcon element={elementId} size={48} /> : <img src={`/sanctuary/elements/${elementId}-v1.webp`} alt="" width={88} height={88} loading="lazy" onError={() => setFailed(true)} />}</span>
      <span><strong>{element.name}</strong><span>{format(score)} pontos</span><small>{percentage}% do total elemental</small></span>
      <ChevronDown size={18} aria-hidden="true" />
    </summary>
    <div className="astrolabe-element-detail">
      <p className="astrolabe-element-domain">{element.domain}</p><p>{element.description}</p>
      <div className="astrolabe-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} /></div>
      <Link to={`/santuario/elementos/${elementId}`}>Explorar {element.name}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
  </details>;
}

export function RecordedDaysTable({ days }: { days: { stamp: number; points: number }[] }) {
  return <details className="astrolabe-records"><summary>Consultar valores por dia<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="astrolabe-table-scroll" role="region" aria-label="Tabela de pontuação diária" tabIndex={0}>
      <table><caption>Pontuação registrada no período selecionado</caption><thead><tr><th scope="col">Dia</th><th scope="col">Pontos</th></tr></thead>
        <tbody>{days.map(day => <tr key={day.stamp}><th scope="row">{new Date(day.stamp).toLocaleDateString('pt-BR')}</th><td>{format(day.points)}</td></tr>)}</tbody>
      </table>
    </div>
  </details>;
}
