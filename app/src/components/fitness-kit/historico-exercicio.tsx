import React, { useMemo, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import './historico-uau.css';
import { TrendAreaChart, type TrendPoint } from './TrendAreaChart';
import { useChegadaSaude } from './saude-chegada';
import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import { isNativeSession } from '@/lib/fitness/activity-history';
import {
  historicoDoExercicio, recordesDoExercicio, sugestaoDeProgressao,
  type EntradaDeHistorico, type Recorde, type SerieRegistrada,
} from '@/lib/workout/progressao';

const num = (value: number, digits = 1) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const diaLongo = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

type Serie = { rotulo: string; unidade: string; valor: (e: EntradaDeHistorico) => number };

/** The measure that tells the story of this exercise: load first, then repetitions, then time, then distance. */
function medidaPrincipal(historico: readonly EntradaDeHistorico[]): Serie {
  const tem = (pick: (s: SerieRegistrada) => number | undefined) => historico.some((e) => e.series.some((s) => (pick(s) ?? 0) > 0));
  const melhor = (pick: (s: SerieRegistrada) => number | undefined) => (e: EntradaDeHistorico) => Math.max(0, ...e.series.map((s) => pick(s) ?? 0));
  if (tem((s) => s.cargaKg)) return { rotulo: 'Melhor carga por sessão', unidade: 'kg', valor: melhor((s) => s.cargaKg) };
  if (tem((s) => s.reps)) return { rotulo: 'Repetições máximas por sessão', unidade: 'rep.', valor: melhor((s) => s.reps) };
  if (tem((s) => s.segundos)) return { rotulo: 'Maior tempo por sessão', unidade: 's', valor: melhor((s) => s.segundos) };
  return { rotulo: 'Maior distância por sessão', unidade: 'm', valor: melhor((s) => s.distanciaM) };
}

/** One compact line for the best set of a session. */
function melhorSerie(e: EntradaDeHistorico): string {
  const ordenadas = [...e.series].sort((a, b) => (b.cargaKg ?? 0) - (a.cargaKg ?? 0) || (b.reps ?? b.segundos ?? 0) - (a.reps ?? a.segundos ?? 0));
  const s = ordenadas[0];
  if (!s) return '';
  const corpo = s.reps != null ? `${s.reps} rep.` : s.segundos != null ? `${s.segundos} s` : s.distanciaM != null ? `${num(s.distanciaM, 0)} m` : '';
  return [s.cargaKg != null ? `${num(s.cargaKg)} kg` : '', corpo].filter(Boolean).join(' × ');
}

interface Cartao { chave: string; rotulo: string; valor: string; unidade: string; recorde: Recorde; estimativa?: boolean }

export const HistoricoDoExercicio: React.FC<{ exerciseId: string }> = ({ exerciseId }) => {
  const sessoes = useFitnessHistory();
  const ref = useRef<HTMLElement>(null);
  const chegou = useChegadaSaude(ref, `ficha-historico:${exerciseId}`);
  const dados = useMemo(() => {
    const historico = historicoDoExercicio(sessoes.filter(isNativeSession), exerciseId);
    return { historico, recordes: recordesDoExercicio(historico), sugestao: sugestaoDeProgressao(historico) };
  }, [sessoes, exerciseId]);
  const { historico, recordes, sugestao } = dados;

  if (!historico.length) {
    return (
      <section ref={ref} className="hx-bloco hx-vazio" aria-label="Seu histórico">
        <TrendingUp size={18} aria-hidden="true" />
        <p>Faça este exercício para começar sua curva.</p>
      </section>
    );
  }

  const medida = medidaPrincipal(historico);
  const pontos: TrendPoint[] = [...historico].reverse().slice(-12).map((e) => ({ label: dia(e.data), value: medida.valor(e) }));
  const cartoes: Cartao[] = [];
  const somar = (chave: string, rotulo: string, r: Recorde | null, unidade: string, digits = 1, estimativa = false) => {
    if (r) cartoes.push({ chave, rotulo, valor: num(r.valor, digits), unidade, recorde: r, estimativa });
  };
  somar('carga', 'Carga máxima', recordes.cargaMaximaKg, 'kg');
  somar('reps', 'Repetições máximas', recordes.repsMaximas, 'rep.', 0);
  somar('volume', 'Volume máximo', recordes.volumeMaximo, 'kg');
  somar('1rm', '1RM estimado', recordes.melhor1RMEstimado, 'kg', 1, true);
  somar('tempo', 'Maior tempo', recordes.duracaoMaximaS, 's', 0);
  somar('dist', 'Maior distância', recordes.distanciaMaximaM, 'm', 0);

  return (
    <section ref={ref} className="hx-bloco" aria-label="Seu histórico">
      <h3><TrendingUp size={18} aria-hidden="true" />Seu histórico</h3>
      <p className="hx-intro">{historico.length === 1 ? '1 sessão registrada' : `${historico.length} sessões registradas`}</p>

      {sugestao.motivo !== 'primeira-vez' && (
        <p className="hx-sugestao" data-motivo={sugestao.motivo}>{sugestao.texto}</p>
      )}

      {pontos.length >= 2 ? (
        <figure className="hx-grafico">
          <figcaption>{medida.rotulo} ({medida.unidade})</figcaption>
          <TrendAreaChart data={pontos} height={132} color="var(--elem-acento)" unit={medida.unidade} decimals={1} animate arrived={chegou} fitRange />
        </figure>
      ) : (
        <p className="hx-intro">Registre mais uma sessão para ver a curva.</p>
      )}

      {cartoes.length > 0 && (
        <ul className="hx-recordes" aria-label="Recordes pessoais">
          {cartoes.map((c) => (
            <li key={c.chave} className="hx-recorde">
              <span className="hx-recorde-rotulo">{c.rotulo}</span>
              <strong>{c.valor}<small> {c.unidade}</small></strong>
              <span className="hx-recorde-data">{c.estimativa ? 'estimativa · ' : ''}{diaLongo(c.recorde.data)}</span>
            </li>
          ))}
        </ul>
      )}

      <ol className="hx-sessoes" aria-label="Últimas sessões">
        {historico.slice(0, 3).map((e) => (
          <li key={e.sessaoId}>
            <time dateTime={e.data}>{dia(e.data)}</time>
            <span>{e.series.length === 1 ? '1 série' : `${e.series.length} séries`}</span>
            <strong>{melhorSerie(e)}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
};
