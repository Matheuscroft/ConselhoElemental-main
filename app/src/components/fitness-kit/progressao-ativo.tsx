import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { padraoDeMovimento, type ExercicioClassificavel } from '@/lib/workout/exercise-motion';
import { regioesDoExercicio, type ExercicioComMusculos } from '@/lib/workout/exercise-muscles';
import { FiguraExercicio } from './FiguraExercicio';
import { padraoExiste } from './figura-padroes';
import { MidiaDoExercicio } from './midia-exercicio';
import { elementoDaModalidade } from './treinos-elementos';

type Exercicio = ExercicioClassificavel & ExercicioComMusculos;

/**
 * Compact demonstration for the active set: a thumbnail of the animated figure beside the
 * suggestion (`children`), and a 44px button that unfolds the full 16:10 card. Real video or
 * image keeps the full media as before. Presentation only.
 */
export function DemonstracaoCompacta({ titulo, exercicio, aberta, onAlternar, children }: {
  titulo: string;
  exercicio: Exercicio;
  aberta: boolean;
  onAlternar: () => void;
  children?: ReactNode;
}) {
  const base: ExercicioClassificavel = { ...exercicio, name: exercicio.name ?? titulo };
  const padrao = padraoDeMovimento(base);
  const musculos = useMemo(() => regioesDoExercicio(exercicio), [exercicio]);
  const [painel] = useState(() => `demo-${Math.random().toString(36).slice(2, 8)}`);
  if (!padraoExiste(padrao)) return children ? <div className="progressao-demo-solta">{children}</div> : null;
  const elemento = elementoDaModalidade(base.category ?? base.modality ?? 'strength');
  return <div className="progressao-demo">
    <div className="progressao-demo-linha">
      <span className="progressao-mini" data-elemento={elemento} aria-hidden="true">
        <FiguraExercicio padraoId={padrao} elemento={elemento} tamanho="mini" musculos={musculos} className="figura-mini" />
      </span>
      <div className="progressao-demo-lado">
        {children}
        <button type="button" className="treino-acao progressao-ver" aria-expanded={aberta} aria-controls={painel} onClick={onAlternar}>
          {aberta ? 'Ocultar demonstração' : 'Ver demonstração'}<ChevronDown size={18} aria-hidden="true" data-aberto={aberta} />
        </button>
      </div>
    </div>
    <div className="progressao-demo-painel" data-aberto={aberta} id={painel}>
      <div className="progressao-demo-miolo" inert={!aberta}>
        <MidiaDoExercicio title={titulo} exercicio={exercicio} />
      </div>
    </div>
  </div>;
}

const textoDe = (n: number) => String(Math.round(n * 100) / 100);

/** Number field with 44px minus/plus buttons; the numeric keyboard stays available in the input. */
export function CampoNumerico({ rotulo, ariaLabel, valor, passo, minimo, decimal, onMudar, onSair }: {
  rotulo: string;
  ariaLabel: string;
  valor: string;
  passo: number;
  minimo: number;
  decimal?: boolean;
  onMudar: (proximo: string) => void;
  onSair?: () => void;
}) {
  const atual = Number(valor.replace(',', '.'));
  const base = Number.isFinite(atual) ? atual : 0;
  const mover = (delta: number) => onMudar(textoDe(Math.max(minimo, base + delta)));
  const padrao = decimal ? /^\d*[.,]?\d*$/ : /^\d*$/;
  return <div className="progressao-campo">
    <span className="treino-campo-rotulo">{rotulo}</span>
    <div className="progressao-campo-corpo">
      <button type="button" className="progressao-passo" aria-label={`Diminuir ${ariaLabel}`} disabled={base <= minimo} onClick={() => mover(-passo)}><Minus size={18} aria-hidden="true" /></button>
      <input className="treino-campo progressao-campo-valor" inputMode={decimal ? 'decimal' : 'numeric'} aria-label={ariaLabel} value={valor}
        onChange={(e) => { if (padrao.test(e.target.value)) onMudar(e.target.value); }} onBlur={onSair} />
      <button type="button" className="progressao-passo" aria-label={`Aumentar ${ariaLabel}`} onClick={() => mover(passo)}><Plus size={18} aria-hidden="true" /></button>
    </div>
  </div>;
}

const NIVEL = (v: number) => (v <= 2 ? 'Muito leve' : v <= 4 ? 'Leve' : v <= 6 ? 'Moderado' : v <= 8 ? 'Intenso' : 'Máximo');

/** Perceived effort as a compact chip scale; one 44px line shows the choice and unfolds the 1-10 chips. */
export function EsforcoChips({ valor, rotuloAcessivel, onMudar }: { valor: string; rotuloAcessivel: string; onMudar: (proximo: string) => void }) {
  const [aberto, setAberto] = useState(false);
  const [painel] = useState(() => `rpe-${Math.random().toString(36).slice(2, 8)}`);
  const atual = Number(valor);
  return <div className="progressao-esforco">
    <button type="button" className="treino-acao progressao-esforco-botao" aria-expanded={aberto} aria-controls={painel} onClick={() => setAberto(!aberto)}>
      <span>Esforço {atual}/10 · {NIVEL(atual)}</span><ChevronDown size={18} aria-hidden="true" data-aberto={aberto} />
    </button>
    <div className="progressao-demo-painel" data-aberto={aberto} id={painel}>
      <div className="progressao-demo-miolo" inert={!aberto}>
        <div className="progressao-esforco-chips" role="radiogroup" aria-label={rotuloAcessivel}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => <button key={v} type="button" role="radio" aria-checked={v === atual} aria-label={`${v}, ${NIVEL(v)}`} className="progressao-esforco-chip" data-ativo={v === atual} onClick={() => onMudar(String(v))}>{v}</button>)}
        </div>
      </div>
    </div>
  </div>;
}
