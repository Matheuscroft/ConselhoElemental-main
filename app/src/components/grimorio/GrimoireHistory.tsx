import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { ArcaneIcon, type ArcaneIconName } from '@/components/elemental/ArcaneIcon';
import { filterGrimoireHistory, type GrimoireEntry, type HistoryKind } from './history';

const LABELS: Record<HistoryKind, string> = { ritual: 'Ritual', ciclo: 'Ciclo', treino: 'Treino', atividade: 'Atividade' };
const ICONS: Record<HistoryKind, ArcaneIconName> = { ritual: 'ritual', ciclo: 'ciclo', treino: 'treino', atividade: 'jornada' };
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function GrimoireHistory({ entries, now }: { entries: GrimoireEntry[]; now: Date }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | HistoryKind>('all');
  const [period, setPeriod] = useState<'all' | '7' | '30'>('all');
  const [limit, setLimit] = useState(20);
  const filtered = useMemo(() => filterGrimoireHistory(entries, query, kind, period, now), [entries, query, kind, period, now]);
  const clear = () => { setQuery(''); setKind('all'); setPeriod('all'); setLimit(20); };
  return <section id="grimoire-history" className="grimoire-history" aria-labelledby="grimoire-history-title">
    <div className="grimoire-section-heading"><div><h2 id="grimoire-history-title">Memórias da jornada</h2><p>Encontre suas atividades e os resultados registrados.</p></div><ArcaneIcon name="arquivo" size={26} /></div>
    {entries.length > 0 && <div className="grimoire-history-controls"><label className="grimoire-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar no histórico</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(20); }} placeholder="Buscar uma atividade…" /></label><div><label>Atividade<select value={kind} onChange={event => { setKind(event.target.value as typeof kind); setLimit(20); }}><option value="all">Todas</option>{Object.entries(LABELS).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label><label>Período<select value={period} onChange={event => { setPeriod(event.target.value as typeof period); setLimit(20); }}><option value="all">Todo o histórico</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label></div><p role="status">{filtered.length} {filtered.length === 1 ? 'registro encontrado' : 'registros encontrados'}</p></div>}
    {filtered.length ? <><ol className="grimoire-timeline">{filtered.slice(0, limit).map(entry => <li key={entry.id}><span className="grimoire-history-seal"><ArcaneIcon name={ICONS[entry.kind]} size={22} /></span><details><summary><span><small>{LABELS[entry.kind]} · {entry.date ? entry.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Data não registrada'}</small><strong>{entry.title}</strong></span><span className="grimoire-history-points">{entry.points == null ? '—' : format(entry.points)}<small>pontos</small></span><ChevronDown size={16} aria-hidden="true" /></summary><div className="grimoire-history-detail"><span>{entry.completed ? 'Conclusão registrada' : 'Execução parcial'}</span><span>{entry.minutes == null ? 'Tempo não registrado' : `${format(entry.minutes)} min registrados`}</span>{entry.points == null && <span>Pontuação não registrada</span>}</div></details></li>)}</ol>{filtered.length > limit && <button className="grimoire-load-more" type="button" onClick={() => setLimit(value => value + 20)}>Mostrar mais registros <ChevronDown size={17} /></button>}</> : <div className="grimoire-history-empty"><ArcaneIcon name="grimorio" size={40} /><h3>{entries.length ? 'Nenhum registro nesta seleção' : 'Sua história começa com uma ação'}</h3><p>{entries.length ? 'Tente outro nome, período ou tipo de atividade.' : 'As atividades registradas aparecerão aqui conforme você avança.'}</p>{entries.length ? <button type="button" onClick={clear}>Limpar filtros</button> : <Link to="/rituais">Ver meus rituais</Link>}</div>}
  </section>;
}
