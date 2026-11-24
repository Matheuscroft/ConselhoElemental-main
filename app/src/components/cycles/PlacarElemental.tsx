import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ChevronDown } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { Contagem } from '@/components/motion/Contagem';
import { ELEMENTS, type ElementId } from '@/constants';
import { useAppStore } from '@/stores/appStore';
import { LevelingCalculatorService } from '@/services/leveling-calculator';
import './placar-elemental.css';

/**
 * The first sight of the scoreboard, per opening of the app. It has its own
 * flag on purpose: the balance panel of Pilares keeps its own, so seeing this
 * strip here never takes away the arrival of that one there.
 */
let placarJaVisto = false;

const RAIO = 48;
const XP_KEY = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;
/** A hairline of dark between two arcs, in percent of the ring. */
const VAO = 1.6;

const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

interface Fatia {
  readonly id: ElementId;
  readonly pontos: number;
  readonly porcentagem: number;
}

/** Where each arc starts and how long it is, in percent of the ring. */
function arcos(fatias: readonly Fatia[], total: number) {
  const visiveis = fatias.filter((fatia) => fatia.pontos > 0).length;
  let inicio = 0;
  return fatias.map((fatia) => {
    const parte = total > 0 ? (fatia.pontos / total) * 100 : 0;
    const arco = { id: fatia.id, inicio, comprimento: Math.max(0, parte - (visiveis > 1 ? VAO : 0)) };
    inicio += parte;
    return arco;
  });
}

/** True once the strip is on screen for the first time in this opening of the app. */
function useChegadaDoPlacar(alvoRef: RefObject<Element | null>): boolean {
  const [chegou, setChegou] = useState(() => placarJaVisto);
  useEffect(() => {
    if (placarJaVisto) return;
    const alvo = alvoRef.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada?.isIntersecting) return;
      placarJaVisto = true;
      setChegou(true);
      observador.disconnect();
    }, { threshold: 0.35 });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [alvoRef]);
  return chegou;
}

/**
 * "Ver pontuação elemental" as a small living panel: a ring of four arcs in
 * the elements' own colours, the total as a number that counts, and four bars
 * with a glint that keeps passing. Pressing it still does what the old line
 * did (opens "Sua evolução" and goes there); `aoAbrir` is that action. With no
 * points yet it is an invitation, not an empty graph.
 */
export function PlacarElemental({ aoAbrir }: { aoAbrir: () => void }) {
  const botaoRef = useRef<HTMLElement>(null);
  const chegou = useChegadaDoPlacar(botaoRef);
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const user = useAppStore((estado) => estado.user);
  const getElementScores = useAppStore((estado) => estado.getElementScores);
  const tasks = useAppStore((estado) => estado.tasks);
  const habits = useAppStore((estado) => estado.habits);
  const projects = useAppStore((estado) => estado.projects);
  const quests = useAppStore((estado) => estado.quests);

  // Read-only, from the same function Pilares reads. The percentages are
  // recomputed here from the points: the store answers 25% each when nothing
  // has been scored, which is a placeholder and not a measurement.
  const { fatias, total } = useMemo(() => {
    const lidos = getElementScores();
    const soma = lidos.reduce((parcial, lido) => parcial + lido.score, 0);
    return {
      total: soma,
      fatias: ELEMENT_ORDER.map((id): Fatia => {
        const pontos = lidos.find((lido) => lido.elementId === id)?.score ?? 0;
        return { id, pontos, porcentagem: soma > 0 ? Math.round((pontos / soma) * 100) : 0 };
      }),
    };
    // The store reads these slices itself; they are what invalidates the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getElementScores, tasks, habits, projects, quests]);

  const vazio = total <= 0;
  const forma = arcos(fatias, total);
  const descricao = vazio
    ? 'Ainda sem pontos.'
    : `${formatar(total)} pontos. ${fatias.map((fatia) => `${ELEMENTS[fatia.id].name} ${fatia.porcentagem}%`).join(', ')}.`;

  // The panel: every element with its points, its share and its mastery bar, the one most in action first.
  const linhas = useMemo(() => fatias.map((fatia) => {
    const xp = user[XP_KEY[fatia.id]];
    const calculo = LevelingCalculatorService.calculate(xp);
    return { ...fatia, nivel: calculo.level, titulo: calculo.title, fracao: calculo.progressFraction, faltam: Math.max(0, calculo.xpToNextLevel - (calculo.xpTotal - calculo.xpAtLevelStart)), xp: calculo.xpTotal };
  }).sort((a, b) => b.pontos - a.pontos || b.xp - a.xp), [fatias, user]);
  const lider = linhas[0] && (linhas[0].pontos > 0 || linhas[0].xp > 0) ? linhas[0].id : null;

  return (
    <section ref={botaoRef} className="cycle-placar ds-pane" data-luz data-vazio={vazio} data-chegou={chegou} data-aberto={aberto}>
      <button type="button" className="placar-cabeca" aria-expanded={aberto} aria-controls={painelId}
        aria-label={`Pontuação elemental. ${descricao} ${aberto ? 'Recolher.' : 'Expandir.'}`} onClick={() => setAberto((v) => !v)}>
        <span className="placar-anel" aria-hidden="true">
          <svg viewBox="0 0 120 120" focusable="false">
            <circle className="placar-trilha" cx="60" cy="60" r={RAIO} />
            {forma.map((arco, indice) => vazio
              ? <circle key={arco.id} className="placar-promessa" data-element={arco.id} cx="60" cy="60" r={RAIO} pathLength={100} style={{ '--ordem': indice, '--giro': `${indice * 90 - 90}deg` } as CSSProperties} />
              : <g key={arco.id} data-element={arco.id} style={{ '--arco': arco.comprimento, '--ordem': indice, '--giro': `${(arco.inicio * 3.6 - 90).toFixed(2)}deg` } as CSSProperties}>
                <circle className="placar-halo" cx="60" cy="60" r={RAIO} pathLength={100} />
                <circle className="placar-arco" cx="60" cy="60" r={RAIO} pathLength={100} />
              </g>)}
          </svg>
          <span className="placar-centro"><ArcaneIcon name="conquista" size={20} /></span>
        </span>

        <span className="placar-texto">
          <strong>Ver pontuação elemental</strong>
          {vazio
            ? <small>O primeiro ciclo concluído acende o primeiro arco.</small>
            : <small><b><Contagem valor={chegou ? total : 0} formatar={formatar} /></b> pontos registrados</small>}
        </span>
        <ChevronDown className="placar-seta" size={18} aria-hidden="true" />

        {vazio || aberto ? null : (
          <span className="placar-barras" aria-hidden="true">
            {fatias.map((fatia, indice) => (
              <span key={fatia.id} className="placar-barra" data-element={fatia.id} data-sem-pontos={fatia.pontos <= 0} style={{ '--parte': Math.min(1, fatia.porcentagem / 100), '--ordem': indice } as CSSProperties}>
                <span className="placar-nome">{ELEMENTS[fatia.id].name}<b><Contagem valor={chegou ? fatia.porcentagem : 0} />%</b></span>
                <i><span className="placar-preenche" /></i>
              </span>
            ))}
          </span>
        )}
      </button>

      <div id={painelId} className="placar-painel" role="region" aria-label="Pontuação e maestria por elemento" aria-hidden={!aberto}>
        <div className="placar-painel-int">
          <div className="placar-equilibrio" aria-hidden="true">
            {linhas.map((linha, i) => (
              <i key={linha.id} data-element={linha.id} style={{ '--parte': linha.porcentagem || 0, '--ordem': i } as CSSProperties} />
            ))}
          </div>
          <ul className="placar-linhas">
            {linhas.map((linha, i) => (
              <li key={linha.id} data-element={linha.id} data-lider={linha.id === lider || undefined} style={{ '--ordem': i, '--parte': linha.fracao } as CSSProperties}>
                <span className="placar-orbe" aria-hidden="true"><img src={`/sanctuary/elements/${linha.id}-v1.webp`} alt="" width={44} height={44} loading="lazy" /></span>
                <span className="placar-linha-texto">
                  <strong>{ELEMENTS[linha.id].name}{linha.id === lider ? <em>Em ação</em> : null}</strong>
                  <small>Nível {linha.nivel} · {linha.titulo}</small>
                </span>
                <span className="placar-linha-pontos"><b><Contagem valor={aberto ? linha.pontos : 0} formatar={formatar} /></b><small>{linha.porcentagem}% dos pontos</small></span>
                <span className="placar-xp" role="img" aria-label={`Maestria de ${ELEMENTS[linha.id].name}: nível ${linha.nivel}, faltam ${formatar(linha.faltam)} XP para o próximo`}>
                  <i><span /></i>
                  <small>faltam <b>{formatar(linha.faltam)} XP</b> para o nível {linha.nivel + 1}</small>
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="placar-evolucao" tabIndex={aberto ? 0 : -1} onClick={aoAbrir}>Ver evolução completa<ChevronDown size={16} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}

export default PlacarElemental;
