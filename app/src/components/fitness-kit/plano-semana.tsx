import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CalendarPlus } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import { isNativeSession } from '@/lib/fitness/activity-history';
import { useWeekStartsOnPreference } from '@/lib/temporal/preferences';
import { semanaDoPlano, resumoDaSemana, type DiaDaSemana, type EstadoDoDia } from '@/lib/workout/progressao';
import { elementoDaModalidade } from '@/components/fitness-kit/treinos-elementos';
import { NumeroQueConta } from '@/components/fitness-kit/treino-numero';
import { PlanoDia } from '@/components/fitness-kit/plano-dia';
import { dataDaChave, faixaDaSemana, rotuloDoDia } from '@/components/fitness-kit/plano-rotulos';
import { MakeCycleModal } from '@/components/workout/MakeCycleModal';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import type { WorkoutTemplate } from '@/types/workout';

/** The week plays its arrival once per visit to the app, not at every return to the tab. */
let jaEntrou = false;

/** Today, refreshed when the app comes back to the foreground (so the strip never keeps yesterday). */
function useHoje() {
  const [hoje, setHoje] = useState(() => new Date());
  useEffect(() => {
    const atualizar = () => setHoje((atual) => (atual.toDateString() === new Date().toDateString() ? atual : new Date()));
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('focus', atualizar);
    return () => { document.removeEventListener('visibilitychange', atualizar); window.removeEventListener('focus', atualizar); };
  }, []);
  return hoje;
}

/** The seal of one day. Empty = a hairline; planned = ring with its dot; done = full ring and mark; partial = half ring; missed = a quiet dotted ring. */
function Selo({ estado, quantidade }: { estado: EstadoDoDia; quantidade: number }) {
  return <svg className="pl-selo" viewBox="0 0 28 28" aria-hidden="true" focusable="false" data-estado={estado}>
    {estado === 'vazio' && <line className="pl-traco" x1="9" y1="14" x2="19" y2="14" />}
    {estado !== 'vazio' && <circle className="pl-trilho" cx="14" cy="14" r="11" pathLength="100" />}
    {estado === 'planejado' && (quantidade > 1
      ? <text className="pl-selo-num" x="14" y="14" textAnchor="middle" dominantBaseline="central">{quantidade}</text>
      : <circle className="pl-ponto" cx="14" cy="14" r="3.5" />)}
    {estado === 'feito' && <><circle className="pl-arco" cx="14" cy="14" r="11" pathLength="100" strokeDasharray="100" /><path className="pl-marca" d="M9 14.5 12.6 18 19 10.5" pathLength="100" /></>}
    {estado === 'parcial' && <circle className="pl-arco" cx="14" cy="14" r="11" pathLength="100" strokeDasharray="50 50" />}
  </svg>;
}

interface PlanoSemanaProps {
  /** Leads the person to the modalities when there is no workout to plan yet. */
  onExplorar?: () => void;
}

export function PlanoSemana({ onExplorar }: PlanoSemanaProps) {
  const templates = useWorkoutStore((state) => state.templates);
  const catalog = useWorkoutStore((state) => state.nativeCatalog);
  const habits = useAppStore((state) => state.habits);
  const historico = useFitnessHistory();
  const { weekStartsOn } = useWeekStartsOnPreference();
  const hoje = useHoje();
  const [entrada] = useState(() => { const primeira = !jaEntrou; jaEntrou = true; return primeira; });
  const sessoes = useMemo(() => historico.filter(isNativeSession), [historico]);
  const semana = useMemo(() => semanaDoPlano({ templates, habitos: habits, sessoes, hoje, comecoDaSemana: weekStartsOn === 1 ? 1 : 0 }), [templates, habits, sessoes, hoje, weekStartsOn]);
  const resumo = useMemo(() => resumoDaSemana(semana), [semana]);
  const chaveHoje = semana.find((d) => d.ehHoje)?.data;
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [ciclo, setCiclo] = useState<WorkoutTemplate | null>(null);
  const [agendar, setAgendar] = useState<WorkoutTemplate | null>(null);
  const selecionado = escolhido ?? chaveHoje ?? semana[0]?.data;
  const indice = Math.max(0, semana.findIndex((d) => d.data === selecionado));
  const dia = aberto ? semana.find((d) => d.data === selecionado) ?? null : null;
  const semPlano = resumo.planejados === 0;
  const aderencia = semPlano ? 0 : resumo.aderenciaPercentual;
  const abrir = (d: DiaDaSemana) => { setEscolhido(d.data); setAberto(true); };
  const planejar = () => { setEscolhido(chaveHoje ?? semana[0]?.data ?? null); setAberto(true); };
  const circ = 2 * Math.PI * 30;

  return <section aria-labelledby="plano-semana-titulo" className="pl-cartao ds-pane" data-entrada={entrada ? 'plena' : 'breve'} data-sem-plano={semPlano ? '' : undefined}>
    <header className="pl-cab">
      <div>
        <h2 id="plano-semana-titulo" className="tr-secao-titulo">Sua semana</h2>
        <p className="tr-secao-subtitulo">{faixaDaSemana(semana)}</p>
      </div>
    </header>

    {semPlano && resumo.feitos === 0
      ? <div className="pl-convite" style={{ '--i': 1 } as CSSProperties}>
        <p className="pl-convite-titulo">Monte sua semana</p>
        <p className="pl-convite-texto">Escolha dias para cada treino e acompanhe aqui o que você cumpriu.</p>
        <button type="button" className="pl-acao" onClick={templates.length ? planejar : onExplorar}><CalendarPlus size={18} aria-hidden="true" /><span>{templates.length ? 'Escolher dias' : 'Criar meu primeiro treino'}</span></button>
      </div>
      : <div className="pl-resumo" style={{ '--i': 1 } as CSSProperties}>
        <div className="pl-anel" role="progressbar" aria-label="Aderência ao plano da semana" aria-valuemin={0} aria-valuemax={100} aria-valuenow={aderencia} aria-valuetext={semPlano ? 'Sem plano nesta semana' : `${resumo.cumpridos} de ${resumo.planejados} treinos planejados cumpridos`}>
          <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
            <circle className="pl-anel-trilho" cx="36" cy="36" r="30" />
            <circle className="pl-anel-arco" cx="36" cy="36" r="30" strokeDasharray={circ} strokeDashoffset={circ * (1 - aderencia / 100)} />
          </svg>
          <span className="pl-anel-centro" aria-hidden="true">{semPlano ? '—' : <><NumeroQueConta texto={String(aderencia)} /><small>%</small></>}</span>
        </div>
        <dl className="pl-numeros">
          <div><dt>{semPlano ? 'Plano' : 'Cumpridos'}</dt><dd>{semPlano ? 'ainda sem dias' : <><NumeroQueConta texto={String(resumo.cumpridos)} /> de {resumo.planejados}</>}</dd></div>
          <div><dt>Minutos ativos</dt><dd><NumeroQueConta texto={String(resumo.minutosAtivos)} /> min</dd></div>
          <div><dt>Treinos feitos</dt><dd><NumeroQueConta texto={String(resumo.feitos)} /></dd></div>
        </dl>
        {semPlano && <button type="button" className="pl-acao pl-acao-sutil" onClick={templates.length ? planejar : onExplorar}><CalendarPlus size={18} aria-hidden="true" /><span>Planejar a semana</span></button>}
      </div>}

    <div className="pl-faixa" style={{ '--pl-i': indice } as CSSProperties}>
      <span className="pl-indicador" aria-hidden="true" />
      <ul className="pl-dias" aria-label="Dias da semana">
        {semana.map((d, i) => {
          const principal = d.planejados[0]?.modalidade;
          return <li key={d.data}>
            <button type="button" className="pl-dia" aria-label={rotuloDoDia(d)} aria-haspopup="dialog" aria-current={d.ehHoje ? 'date' : undefined} data-estado={d.estado} data-hoje={d.ehHoje ? '' : undefined} data-selecionado={d.data === selecionado ? '' : undefined} data-element={principal ? elementoDaModalidade(principal) : undefined} style={{ '--i': i + 2 } as CSSProperties} onClick={() => abrir(d)}>
              <span className="pl-dia-rotulo" aria-hidden="true">{d.rotuloCurto}</span>
              <span className="pl-dia-numero" aria-hidden="true">{dataDaChave(d.data).getDate()}</span>
              <Selo estado={d.estado} quantidade={d.planejados.length} />
            </button>
          </li>;
        })}
      </ul>
    </div>

    <PlanoDia
      dia={dia}
      templates={templates}
      onOpenChange={setAberto}
      onCiclo={(t) => { setAberto(false); setCiclo(t); }}
      onAgendar={(t) => { setAberto(false); setAgendar(t); }}
      onCriar={() => onExplorar?.()}
    />
    {ciclo && <MakeCycleModal template={ciclo} onClose={() => setCiclo(null)} />}
    {agendar && <NativeTemplateDialog template={agendar} catalog={catalog.filter((e) => e.modality === agendar.modality)} modality={agendar.modality} onClose={() => setAgendar(null)} />}
  </section>;
}
