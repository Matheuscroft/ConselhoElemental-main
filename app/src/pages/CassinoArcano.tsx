import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, RotateCw } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { AppLayout } from '@/components/layout';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { useAppStore } from '@/stores/appStore';
import { ELEMENTS } from '@/constants';
import type { ElementId } from '@/types';
import { DestinyWheel } from '@/components/destiny/DestinyWheel';
import { chooseDestiny, destinyOptions, destinyRotation, filterDestinyOptions, DESTINY_LABELS, type DestinyKind, type DestinyOption } from '@/components/destiny/destiny-options';
import '@/styles/elemental-design-system.css';
import '@/components/destiny/destiny.css';

export function CassinoArcano() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <AppLayout showAura={false}><DestinyWorkspace key={accountId ?? 'local'} /></AppLayout>;
}

function DestinyWorkspace() {
  const { tasks, quests, getHabitsForDate } = useAppStore();
  const reduced = !!useReducedMotion();
  const [kind, setKind] = useState<DestinyKind | 'all'>('all');
  const [element, setElement] = useState<ElementId | 'all'>('all');
  const [days, setDays] = useState<1 | 7>(1);
  const [now, setNow] = useState(() => new Date());
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [snapshot, setSnapshot] = useState<DestinyOption[]>([]);
  const [result, setResult] = useState<DestinyOption | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState !== 'hidden') setNow(new Date()); };
    const interval = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', refresh); if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!result) return;
    const frame = requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [result, reduced]);

  const allOptions = destinyOptions(tasks, quests, getHabitsForDate, now, days);
  const options = filterDestinyOptions(allOptions, kind, element);
  const currentResult = result ? options.find(item => item.key === result.key && item.href === result.href) : null;
  const displayedOptions = spinning || result ? snapshot : options;
  const spin = () => {
    if (locked.current) return;
    const fresh = filterDestinyOptions(destinyOptions(tasks, quests, getHabitsForDate, new Date(), days), kind, element);
    const chosen = chooseDestiny(fresh, Math.random());
    if (!chosen) { setNow(new Date()); return; }
    locked.current = true;
    setSnapshot(fresh);
    setSpinning(true);
    setResult(null);
    setRotation(previous => destinyRotation(previous, fresh.findIndex(item => item.key === chosen.key), fresh.length));
    timer.current = setTimeout(() => {
      locked.current = false;
      timer.current = null;
      setSpinning(false);
      setNow(new Date());
      setResult(chosen);
    }, reduced ? 0 : 2700);
  };

  return <div className="elemental-system destiny-workspace">
    <header className="destiny-heading"><span className="destiny-seal"><ArcaneIcon name="cassino" size={30} /></span><div><p>Cassino Arcano</p><h1>Roda do Destino</h1><p>Menos tempo escolhendo. Um próximo passo para você.</p></div></header>
    <div className="destiny-free"><ArcaneIcon name="invocar" size={18} /><span>Sorteio gratuito. Você decide quando começar.</span></div>
    <section className="destiny-arena" aria-label="Escolha aleatória de atividade">
      <DestinyWheel options={displayedOptions} rotation={rotation} spinning={spinning} reduced={reduced} />
      <p className="destiny-count" role="status">{spinning ? 'Escolhendo entre suas atividades…' : `${options.length} ${options.length === 1 ? 'opção participa' : 'opções participam'} do sorteio`}</p>
      <button type="button" className="elemental-action destiny-spin" onClick={spin} disabled={spinning || !options.length}><RotateCw size={20} aria-hidden="true" />{spinning ? 'Consultando o destino…' : result ? 'Escolher outra atividade' : 'Escolher minha próxima atividade'}</button>
      <p className="destiny-note">{displayedOptions.length > 12 ? 'O anel é simbólico. Todas as opções da lista participam com a mesma chance.' : 'Cada opção tem a mesma chance. Nenhuma atividade é iniciada automaticamente.'}</p>
    </section>
    {result && <div ref={resultRef} tabIndex={-1} className="destiny-result" style={{ '--destiny-accent': `var(--element-${result.element})` } as CSSProperties}>
      <div className="destiny-result-cover"><img src={`/sanctuary/elements/${result.element}-v1.webp`} width={100} height={100} alt="" /><div><p>{currentResult ? 'Seu próximo passo' : 'Opção indisponível agora'}</p><h2>{currentResult?.title ?? result.title}</h2><span>{DESTINY_LABELS[result.kind]} · {currentResult?.when ?? result.when}</span></div></div>
      {currentResult ? <><p className="destiny-result-description">{currentResult.description || 'Abra a atividade para ver seus detalhes e começar no seu ritmo.'}</p><Link className="destiny-open" to={currentResult.href}>Abrir {DESTINY_LABELS[result.kind].toLocaleLowerCase('pt-BR')}<ArrowUpRight size={20} aria-hidden="true" /></Link><small>XP e recompensas seguem as regras normais de conclusão.</small></> : <p className="destiny-result-description">A atividade foi alterada, concluída ou saiu dos filtros. Faça uma nova escolha.</p>}
    </div>}
    <section className="destiny-settings" aria-labelledby="destiny-settings-title"><h2 id="destiny-settings-title">O que o destino pode escolher?</h2>
      <fieldset disabled={spinning} className="destiny-types"><legend>Tipo de atividade</legend>{(['all', 'task', 'habit', 'quest'] as const).map(value => <label key={value}><input type="radio" name="destiny-kind" value={value} checked={kind === value} onChange={() => setKind(value)} /><span><ArcaneIcon name={value === 'task' ? 'ritual' : value === 'habit' ? 'ciclo' : value === 'quest' ? 'jornada' : 'explorar'} size={20} />{value === 'all' ? 'Todas' : value === 'task' ? 'Tarefas' : value === 'habit' ? 'Ciclos' : 'Jornadas'}</span></label>)}</fieldset>
      <fieldset disabled={spinning} className="destiny-selects"><legend className="sr-only">Filtros do sorteio</legend><label>Elemento<select value={element} onChange={event => setElement(event.target.value as ElementId | 'all')}><option value="all">Todos os elementos</option>{(['terra', 'fogo', 'agua', 'ar'] as const).map(id => <option key={id} value={id}>{ELEMENTS[id].name}</option>)}</select></label><label>Recorrência dos ciclos<select value={days} onChange={event => setDays(Number(event.target.value) as 1 | 7)}><option value={1}>Hoje</option><option value={7}>Próximos 7 dias</option></select></label></fieldset>
      <p className="destiny-note">Tarefas pendentes e jornadas em andamento. Ciclos seguem sua recorrência e entram uma vez, na primeira data disponível do período.</p>
    </section>
    {!options.length && <div className="destiny-empty"><ArcaneIcon name="ritual" size={32} /><h2>Nenhuma atividade nestes filtros</h2><p>Experimente outro tipo, elemento ou período. Você também pode criar uma nova atividade.</p><Link to="/invocar">Criar atividade<ArrowUpRight size={18} aria-hidden="true" /></Link></div>}
    {!!displayedOptions.length && <details className="destiny-options"><summary><span>{result ? 'Opções da última escolha' : 'Ver opções do sorteio'}<small>{displayedOptions.length} participantes</small></span><ChevronDown size={19} aria-hidden="true" /></summary><ol>{displayedOptions.map((item, index) => <li key={item.key}><span className="destiny-option-number">{index + 1}</span><ElementIcon element={item.element} size={19} /><div><strong>{item.title}</strong><small>{DESTINY_LABELS[item.kind]} · {item.when}{item.minutes && item.minutes > 0 ? ` · ${item.minutes} min previstos` : ''}</small></div></li>)}</ol></details>}
  </div>;
}
