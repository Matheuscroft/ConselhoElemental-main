import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon, type ArcaneIconName } from '@/components/elemental/ArcaneIcon';
import { Vazio } from '@/components/elemental/blocos';
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
  return <section id="grimoire-history" tabIndex={-1} className="grimoire-history" aria-labelledby="grimoire-history-title">
    <div className="ds-secao"><h2 id="grimoire-history-title">Memórias da jornada</h2></div>
    <p className="ds-nota">Encontre suas atividades e os resultados registrados.</p>
    {entries.length > 0 && <div className="grimoire-history-controls"><label className="ds-campo" data-tipo="busca"><ArcaneIcon name="buscar" size={18} /><span className="sr-only">Buscar no histórico</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(20); }} placeholder="Buscar uma atividade…" /></label><div className="grimoire-history-filters"><label className="ds-campo"><span>Atividade</span><select value={kind} onChange={event => { setKind(event.target.value as typeof kind); setLimit(20); }}><option value="all">Todas</option>{Object.entries(LABELS).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label><label className="ds-campo"><span>Período</span><select value={period} onChange={event => { setPeriod(event.target.value as typeof period); setLimit(20); }}><option value="all">Todo o histórico</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label></div><p className="ds-nota" role="status">{filtered.length} {filtered.length === 1 ? 'registro encontrado' : 'registros encontrados'}</p></div>}
    {filtered.length ? <><ol className="grimoire-timeline">{filtered.slice(0, limit).map(entry => <li key={entry.id}><details><summary className="ds-linha"><ArcaneIcon name={ICONS[entry.kind]} size={28} /><span><strong>{entry.title}</strong><span className="ds-meta"><span>{LABELS[entry.kind]}</span><span>{entry.date ? entry.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Data não registrada'}</span></span></span><span className="ds-linha-valor grimoire-history-points"><span>{entry.points == null ? '—' : format(entry.points)}<small> pts</small></span><ArcaneIcon name="chevron" size={16} /></span></summary><div className="grimoire-history-detail"><span>{entry.completed ? 'Conclusão registrada' : 'Execução parcial'}</span><span>{entry.minutes == null ? 'Tempo não registrado' : `${format(entry.minutes)} min registrados`}</span>{entry.points == null && <span>Pontuação não registrada</span>}</div></details></li>)}</ol>{filtered.length > limit && <button className="ds-botao grimoire-load-more" data-tipo="fantasma" type="button" onClick={() => setLimit(value => value + 20)}>Mostrar mais registros</button>}</> : <Vazio titulo={entries.length ? 'Nenhum registro nesta seleção' : 'Sua história começa com uma ação'} texto={entries.length ? 'Tente outro nome, período ou tipo de atividade.' : 'As atividades registradas aparecerão aqui conforme você avança.'} acao={entries.length ? <button className="ds-botao" data-tipo="secundario" type="button" onClick={clear}>Limpar filtros</button> : <Link className="ds-botao" data-tipo="secundario" to="/rituais">Ver meus rituais</Link>} />}
  </section>;
}
