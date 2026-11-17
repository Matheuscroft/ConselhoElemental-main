import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import type { EntradaDeHistorico, SugestaoDeProgressao } from '@/lib/workout/progressao';
import { NumeroQueConta } from './treino-numero';

/** Exercises whose suggestion already played its entrance in this visit: it plays once, not on every set. */
const jaEntrou = new Set<string>();

const numero = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** What the last session did, in the shape the suggestion is compared against. */
function ultimaVez(entrada: EntradaDeHistorico) {
  const series = entrada.series;
  const cargas = series.flatMap((s) => (s.cargaKg != null ? [s.cargaKg] : []));
  const tempos = series.flatMap((s) => (s.segundos != null && s.reps == null ? [s.segundos] : []));
  const porTempo = tempos.length === series.length;
  const topo = porTempo ? Math.max(...tempos) : Math.max(...series.map((s) => s.reps ?? 0));
  return { texto: `${series.length} × ${topo}${porTempo ? ' s' : ''}${cargas.length ? ` · ${numero(Math.max(...cargas))} kg` : ''}` };
}

const TOM: Record<SugestaoDeProgressao['motivo'], string> = {
  'primeira-vez': '',
  manter: 'Manter a base',
  'subir-carga': 'Subir um pouco a carga',
  'subir-reps': 'Subir um pouco o volume',
  aliviar: 'Aliviar hoje costuma render mais',
};

/**
 * Compact "last time -> today" chip for the active exercise. Presentation only: `onUsar` is the
 * caller's own manual edit path, so nothing is recorded here.
 */
export function ProgressaoSugestao({ chave, historico, sugestao, aplicada, onUsar }: {
  chave: string;
  historico: readonly EntradaDeHistorico[];
  sugestao: SugestaoDeProgressao;
  aplicada: boolean;
  onUsar: () => void;
}) {
  const animar = !jaEntrou.has(chave);
  useEffect(() => { jaEntrou.add(chave); }, [chave]);

  if (sugestao.motivo === 'primeira-vez' || !historico[0]) {
    return <p className="progressao-discreta" data-animar={animar}>Primeira vez: registre para eu sugerir a próxima.</p>;
  }
  const { texto } = ultimaVez(historico[0]);
  const hoje = sugestao.cargaKg != null && !(sugestao.motivo === 'subir-reps' && sugestao.segundos != null)
    ? { valor: numero(sugestao.cargaKg), unidade: 'kg' }
    : sugestao.segundos != null ? { valor: String(sugestao.segundos), unidade: 's' }
    : sugestao.reps != null ? { valor: String(sugestao.reps), unidade: 'reps' } : null;
  const rotulo = sugestao.motivo === 'manter' && hoje ? `Hoje: mantenha ${hoje.valor} ${hoje.unidade}` : null;
  return <div className="progressao-chip ds-pane" data-motivo={sugestao.motivo} data-animar={animar} role="group" aria-label="Sugestão de progressão">
    <div className="progressao-chip-texto">
      <span className="progressao-chip-antes">Última vez: {texto}</span>
      <ArrowRight className="progressao-chip-seta" size={14} aria-hidden="true" />
      {hoje && <span className="progressao-chip-hoje">{rotulo ?? <>Hoje: <strong>{animar ? <NumeroQueConta texto={hoje.valor} /> : hoje.valor}</strong> {hoje.unidade}</>}</span>}
      <span className="progressao-chip-motivo">{TOM[sugestao.motivo]}</span>
    </div>
    {hoje && <button type="button" className="treino-acao progressao-usar" disabled={aplicada} onClick={onUsar}>{aplicada ? 'Em uso' : 'Usar'}</button>}
  </div>;
}
