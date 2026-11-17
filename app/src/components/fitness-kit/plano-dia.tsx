import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarDays, Check, ChevronRight, Play, Repeat2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DialogoCabeca } from '@/components/fitness-kit/dialogo-cabeca';
import { useLuzDoDialogo } from '@/components/fitness-kit/dialogo-luz';
import { elementoDaModalidade } from '@/components/fitness-kit/treinos-elementos';
import { tituloDoDia } from '@/components/fitness-kit/plano-rotulos';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import type { DiaDaSemana } from '@/lib/workout/progressao';
import type { WorkoutTemplate } from '@/types/workout';

interface PlanoDiaProps {
  dia: DiaDaSemana | null;
  templates: readonly WorkoutTemplate[];
  onOpenChange: (aberto: boolean) => void;
  /** Opens the existing "Tornar Ciclo" flow (the sheet is closed first by the caller). */
  onCiclo: (template: WorkoutTemplate) => void;
  /** Opens the existing template editor, where the date of the workout is set. */
  onAgendar: (template: WorkoutTemplate) => void;
  /** No workouts yet: leads the person to the modalities. */
  onCriar: () => void;
}

const DESCRICAO: Record<DiaDaSemana['estado'], string> = {
  vazio: 'Nada planejado para este dia.',
  planejado: 'Treino planejado para este dia.',
  feito: 'Dia cumprido. Bom trabalho.',
  parcial: 'Parte do plano já foi feita.',
  perdido: 'O plano deste dia não aconteceu. Siga em frente: o próximo treino é um novo começo.',
};

/** The sheet of one day: what is planned, what was done, and the way to plan more. */
export function PlanoDia({ dia, templates, onOpenChange, onCiclo, onAgendar, onCriar }: PlanoDiaProps) {
  const navigate = useNavigate();
  const titleId = useId();
  const ligarLuz = useLuzDoDialogo();
  const [planejando, setPlanejando] = useState(false);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const startSession = useWorkoutStore((state) => state.startSession);
  const habits = useAppStore((state) => state.habits);
  const emCiclo = (id: string) => habits.some((h) => h.sourceModule === 'modulo_treino' && h.sourceRefId === id && !h.controlledBySequenceId);
  const fechar = () => { setPlanejando(false); onOpenChange(false); };
  const executar = (template: WorkoutTemplate) => {
    // Same behaviour as the workout card in the library.
    const session = startSession(template.id);
    if (session) { fechar(); navigate(`/fitness/ativo/${session.id}`); }
    else toast.error('Não foi possível iniciar o treino. Confira a sessão em andamento.');
  };
  const principal = dia?.planejados[0]?.modalidade;
  const planejados = dia?.planejados ?? [];
  const feitos = dia?.feitos ?? [];
  return <Dialog open={!!dia} onOpenChange={(aberto) => { if (!aberto) setPlanejando(false); onOpenChange(aberto); }}>
    <DialogContent ref={ligarLuz} data-luz="" data-element={principal ? elementoDaModalidade(principal) : 'fogo'} aria-labelledby={titleId} showCloseButton={false} overlayClassName="dialogo-veu" className="dialogo-treino dg-compacto ds-glass-float pl-folha">
      <DialogoCabeca icone={CalendarDays} sobretitulo="Plano da semana" fechar="Fechar plano do dia">
        <DialogTitle id={titleId} className="dg-titulo">{dia ? tituloDoDia(dia.data) : 'Plano do dia'}</DialogTitle>
        <DialogDescription className="dg-descricao">{dia ? DESCRICAO[dia.estado] : ''}</DialogDescription>
      </DialogoCabeca>
      <div className="dg-corpo">
        {planejados.length > 0 && <section className="dg-secao" aria-label="Planejado">
          <div className="dg-secao-cab"><h3 className="dg-secao-titulo">Planejado</h3><span className="dg-secao-meta">{planejados.length} {planejados.length === 1 ? 'treino' : 'treinos'}</span></div>
          <ul className="pl-lista">
            {planejados.map((p) => {
              const template = templates.find((t) => t.id === p.templateId);
              const Icone = CATEGORY_ICONS[p.modalidade];
              const minutos = template ? calculateEstimatedDuration(template.exercises) : 0;
              const emAndamento = active?.templateId === p.templateId;
              return <li key={p.templateId} className="pl-linha ds-pane" data-element={elementoDaModalidade(p.modalidade)} data-cumprido={p.cumprido ? '' : undefined}>
                <span className="pl-sigilo" aria-hidden="true"><Icone size={22} strokeWidth={1.55} /></span>
                <span className="pl-linha-texto">
                  <span className="pl-linha-nome">{p.nome}</span>
                  <span className="pl-linha-meta">{CATEGORY_LABELS[p.modalidade]}{minutos > 0 && ` · ~${minutos} min`}{p.origem === 'habito' ? ' · Ciclo' : ' · Data marcada'}</span>
                </span>
                {p.cumprido
                  ? <span className="pl-chip" data-tom="feito"><Check size={16} aria-hidden="true" />Feito</span>
                  : template && <button type="button" className="pl-executar" disabled={(!!active) || template.exercises.length === 0} onClick={() => executar(template)}><Play size={16} aria-hidden="true" /><span>{emAndamento ? 'Sessão em andamento' : 'Executar agora'}</span></button>}
              </li>;
            })}
          </ul>
        </section>}
        {feitos.length > 0 && <section className="dg-secao" aria-label="Feito">
          <div className="dg-secao-cab"><h3 className="dg-secao-titulo">Feito</h3><span className="dg-secao-meta">{feitos.reduce((t, f) => t + f.minutos, 0)} min ativos</span></div>
          <ul className="pl-lista">
            {feitos.map((f) => <li key={f.sessaoId} className="pl-linha ds-pane" data-element="terra" data-cumprido="">
              <button type="button" className="pl-linha-botao" onClick={() => { fechar(); navigate(`/treinos/resumo/${f.sessaoId}`); }}>
                <span className="pl-sigilo" aria-hidden="true"><Check size={22} strokeWidth={1.8} /></span>
                <span className="pl-linha-texto"><span className="pl-linha-nome">{f.nome}</span><span className="pl-linha-meta">{f.minutos} min ativos · ver resumo</span></span>
                <ChevronRight size={18} aria-hidden="true" className="pl-seta" />
              </button>
            </li>)}
          </ul>
        </section>}
        {!planejados.length && !feitos.length && !planejando && <p className="pl-vazio ds-pane">Este dia está livre. Escolha um treino para planejar, ou deixe como descanso.</p>}
        {planejando && <section className="dg-secao" aria-label="Planejar treinos">
          <div className="dg-secao-cab"><h3 className="dg-secao-titulo">Planejar</h3></div>
          <p className="dg-nota">Para repetir na semana, torne o treino um Ciclo. Para um dia só, marque a data no próprio treino.</p>
          {templates.length === 0
            ? <div className="pl-vazio ds-pane"><p>Você ainda não tem treinos salvos. Crie um numa modalidade e volte aqui.</p><button type="button" className="dg-btn" data-tipo="secundario" onClick={() => { fechar(); onCriar(); }}>Explorar modalidades</button></div>
            : <ul className="pl-lista">
              {templates.map((t) => {
                const Icone = CATEGORY_ICONS[t.modality];
                const ciclo = emCiclo(t.id);
                return <li key={t.id} className="pl-linha pl-linha-planejar ds-pane" data-element={elementoDaModalidade(t.modality)}>
                  <span className="pl-sigilo" aria-hidden="true"><Icone size={22} strokeWidth={1.55} /></span>
                  <span className="pl-linha-texto"><span className="pl-linha-nome">{t.name}</span><span className="pl-linha-meta">{ciclo ? 'Já é um Ciclo' : t.scheduledAt ? `Data marcada: ${new Date(t.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : CATEGORY_LABELS[t.modality]}</span></span>
                  <span className="pl-linha-acoes">
                    <button type="button" className="pl-mini" aria-label={`Marcar data de ${t.name}`} onClick={() => onAgendar(t)}><CalendarDays size={18} aria-hidden="true" /><span>Data</span></button>
                    <button type="button" className="pl-mini" aria-label={ciclo ? `${t.name} já está em um Ciclo` : `Tornar ${t.name} um Ciclo`} disabled={ciclo} onClick={() => onCiclo(t)}>{ciclo ? <Check size={18} aria-hidden="true" /> : <Repeat2 size={18} aria-hidden="true" />}<span>{ciclo ? 'Em ciclo' : 'Ciclo'}</span></button>
                  </span>
                </li>;
              })}
            </ul>}
        </section>}
      </div>
      <footer className="dg-pe">
        <div className="dg-pe-acoes">
          <button type="button" className="dg-btn" data-tipo="fantasma" onClick={() => { fechar(); navigate('/ciclos'); }}>Ver nos Ciclos</button>
          <button type="button" className="dg-btn" data-tipo="primario" aria-pressed={planejando} onClick={() => setPlanejando((v) => !v)}>{planejando ? 'Ocultar planejamento' : 'Planejar'}</button>
        </div>
      </footer>
    </DialogContent>
  </Dialog>;
}
