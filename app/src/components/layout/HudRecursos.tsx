import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { ArcaneIcon, type ArcaneIconName } from '@/components/elemental/ArcaneIcon';
import { Contagem } from '@/components/motion/Contagem';
import { Conjurar } from '@/components/motion/Conjurar';
import { ACENTO } from '@/lib/design/palette';
import { HP_BASE, HP_MAXIMO, hpDoDia } from '@/lib/recursos/vitalidade';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';

type RecursoId = 'ofensiva' | 'vida' | 'stamina' | 'prana';
type Estado = 'base' | 'cheio' | 'normal' | 'baixo' | 'esgotado' | 'ativo' | 'repouso';

interface Conta {
  readonly id: RecursoId;
  readonly nome: string;
  readonly valor: number;
  readonly estado: Estado;
  /** Arc of the gauge ring, 0..100. Streak has no ring. */
  readonly medida: number | null;
  readonly cor: string;
  readonly dica: string;
}

const SIGILO_DA_CONTA: Record<RecursoId, ArcaneIconName> = {
  ofensiva: 'ofensiva', vida: 'vida', stamina: 'stamina', prana: 'prana',
};
const LIMITE_BAIXO = 20;
const ROLAGEM_PARA_FECHAR = 24;

const limitar = (valor: number) => Math.max(0, Math.min(100, valor));
/** How much of the seal ring the travelling glint covers, in 0..1 of its length. */
const BRILHO_DO_ANEL = 0.12;

/** Reads the same rules the HUD always used; it only decides how they look. */
function estadoDeReserva(valor: number): Estado {
  if (valor <= 0) return 'esgotado';
  if (valor < LIMITE_BAIXO) return 'baixo';
  return 'normal';
}

/**
 * The resources, kept on screen wherever you are: the "Fio do Nivel".
 *
 * Closed, it is one 44px thread (level seal, XP line, four gauge rings) with
 * no numbers to read. A touch opens a tray inside the header with the exact
 * figures. It closes on a second touch, Esc, a press outside, a route change
 * or scrolling away.
 */
export function HudRecursos() {
  const { getLevelProgress, getStreak, getCompletedHabitsToday } = useAppStore();
  const { getResourceSnapshot } = useWorkoutStore();
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [rota, setRota] = useState(pathname);
  const raiz = useRef<HTMLDivElement>(null);
  const mascara = `hud-anel-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [pulsos, setPulsos] = useState(0);

  // A new route always starts closed; adjusted during render, not in an effect.
  if (rota !== pathname) {
    setRota(pathname);
    setAberto(false);
  }

  useEffect(() => {
    if (!aberto) return;
    const origem = window.scrollY;
    const fecharComEsc = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setAberto(false); };
    // Listens only; it never prevents the press, so Explorar and the account
    // button receive their own click.
    const fecharFora = (evento: PointerEvent) => {
      if (raiz.current && evento.target instanceof Node && !raiz.current.contains(evento.target)) setAberto(false);
    };
    const fecharAoRolar = () => { if (Math.abs(window.scrollY - origem) > ROLAGEM_PARA_FECHAR) setAberto(false); };
    document.addEventListener('keydown', fecharComEsc);
    document.addEventListener('pointerdown', fecharFora);
    window.addEventListener('scroll', fecharAoRolar, { passive: true });
    return () => {
      document.removeEventListener('keydown', fecharComEsc);
      document.removeEventListener('pointerdown', fecharFora);
      window.removeEventListener('scroll', fecharAoRolar);
    };
  }, [aberto]);

  const nivel = getLevelProgress();
  const recursos = getResourceSnapshot();
  const ofensiva = getStreak();
  const hp = hpDoDia({ habitosHoje: getCompletedHabitsToday(), ofensiva });
  const stamina = Math.round(recursos.currentStamina);
  const prana = Math.round(recursos.currentPrana);
  const xpNoNivel = nivel.xpTotal - nivel.xpAtLevelStart;
  const faltam = Math.max(0, nivel.xpToNextLevel - xpNoNivel);
  const porcento = Math.max(0, Math.min(100, Math.round(nivel.progressFraction * 100)));

  // Any gain (or spend) pulses the seal ring once. The first render stays
  // still: opening the app is not an achievement.
  const leitura = `${nivel.level}|${xpNoNivel}|${hp}|${stamina}|${prana}|${ofensiva}`;
  if (assinatura !== leitura) {
    setAssinatura(leitura);
    if (assinatura !== null) setPulsos((atual) => atual + 1);
  }

  const contas: readonly Conta[] = [
    { id: 'ofensiva', nome: 'Ofensiva', valor: ofensiva, estado: ofensiva > 0 ? 'ativo' : 'repouso', medida: null, cor: ACENTO.fogo, dica: ofensiva === 1 ? 'dia seguido' : 'dias seguidos' },
    { id: 'vida', nome: 'Vida', valor: hp, estado: hp >= HP_MAXIMO ? 'cheio' : hp > HP_BASE ? 'normal' : 'base', medida: limitar(hp), cor: ACENTO.terra, dica: '+5 por ciclo hoje' },
    { id: 'stamina', nome: 'Stamina', valor: stamina, estado: stamina >= 100 ? 'cheio' : estadoDeReserva(stamina), medida: limitar(stamina), cor: ACENTO.agua, dica: '+8 por ritual hoje; treinos gastam' },
    { id: 'prana', nome: 'Prana', valor: prana, estado: estadoDeReserva(prana), medida: limitar(prana), cor: ACENTO.ar, dica: 'cresce com sua pontuação; treinos gastam' },
  ];

  const nomeAcessivel = `Nível ${nivel.level}, ${xpNoNivel} de ${nivel.xpToNextLevel} XP. Ofensiva ${ofensiva} ${ofensiva === 1 ? 'dia' : 'dias'}, vida ${hp} de 100, stamina ${stamina} de 100, prana ${prana} de 100. ${aberto ? 'Ocultar' : 'Mostrar'} detalhes`;

  return (
    <div className="hud-recursos" ref={raiz}>
      <button
        type="button"
        className="hud-fio"
        aria-expanded={aberto}
        aria-controls="hud-bandeja"
        aria-label={nomeAcessivel}
        onClick={() => setAberto((atual) => !atual)}
      >
        {/* The level is the one figure allowed to pop: it is the earned one. */}
        <Conjurar marca={nivel.level} className="hud-nivel">
          <span className="hud-selo-wrap" aria-hidden="true">
            <svg className="hud-selo-anel" viewBox="0 0 40 40" fill="none" focusable="false">
              <defs>
                <mask id={mascara} maskUnits="userSpaceOnUse" x={0} y={0} width={40} height={40}>
                  <circle className="hud-selo-recorte" cx="20" cy="20" r="17.5" pathLength={1} strokeDasharray={`${porcento / 100} 1`} transform="rotate(-90 20 20)" />
                </mask>
              </defs>
              <circle className="hud-selo-trilho" cx="20" cy="20" r="17.5" />
              <circle className="hud-selo-fio" cx="20" cy="20" r="17.5" pathLength={1} strokeDasharray={`${porcento / 100} 1`} transform="rotate(-90 20 20)" />
              <g mask={`url(#${mascara})`}>
                <circle className="hud-selo-brilho" cx="20" cy="20" r="17.5" pathLength={1} strokeDasharray={`${BRILHO_DO_ANEL} ${1 - BRILHO_DO_ANEL}`} transform="rotate(-90 20 20)" />
              </g>
              {pulsos > 0 && <circle key={pulsos} className="hud-selo-pulso" cx="20" cy="20" r="17.5" />}
            </svg>
            <span className="hud-selo" aria-hidden="true">{nivel.level}</span>
          </span>
        </Conjurar>
        <span className="hud-trilho" aria-hidden="true"><span style={{ inlineSize: `${porcento}%` }} /></span>
        <span className="hud-contas" aria-hidden="true">
          {contas.map((conta) => (
            <span
              key={conta.id}
              className="hud-conta"
              data-recurso={conta.id}
              data-estado={conta.estado}
              style={{ '--hud-cor': conta.cor } as CSSProperties}
            >
              {conta.medida !== null && (
                <svg className="hud-anel" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" focusable="false">
                  <circle className="hud-anel-trilho" cx="12" cy="12" r="10.5" />
                  <circle className="hud-anel-arco" cx="12" cy="12" r="10.5" pathLength={100} strokeDasharray={`${conta.medida} 100`} transform="rotate(-90 12 12)" />
                </svg>
              )}
              <ArcaneIcon name={SIGILO_DA_CONTA[conta.id]} size={14} ativo={conta.estado === 'ativo' || conta.estado === 'cheio' || conta.estado === 'normal'} />
            </span>
          ))}
        </span>
      </button>

      <div id="hud-bandeja" className="hud-bandeja ds-pane" data-aberto={aberto}>
        <div className="hud-bandeja-miolo">
          <div className="hud-bandeja-conteudo">
            <p className="hud-bandeja-nivel">
              Nível <Contagem valor={nivel.level} beat="settle" />, faltam <Contagem valor={faltam} beat="settle" /> XP
            </p>
            <div
              className="hud-bandeja-barra"
              role="progressbar"
              aria-label="Progresso para o próximo nível"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={porcento}
            >
              <span style={{ inlineSize: `${porcento}%` }} />
            </div>
            <dl className="hud-grade">
              {contas.map((conta) => (
                <div key={conta.id} className="hud-item" data-recurso={conta.id} data-estado={conta.estado} style={{ '--hud-cor': conta.cor } as CSSProperties}>
                  <dt><ArcaneIcon name={SIGILO_DA_CONTA[conta.id]} size={20} />{conta.nome}</dt>
                  <dd>
                    <Contagem valor={conta.valor} beat="settle" />
                    {conta.medida !== null ? '/100' : ''}
                    <small>{conta.dica}</small>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HudRecursos;
