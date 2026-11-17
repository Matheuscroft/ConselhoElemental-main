/**
 * Pure progression / records / weekly-plan layer for native workouts.
 * No React, no store access: callers pass plain data in. Read-only; nothing here is persisted
 * and nothing here touches scoring. Suggestions are follow-up hints, not promises.
 */
import type { NativeWorkoutSession, WorkoutExerciseCategory } from '@/types/workout';
import type { RecurrenceConfig, RecurrenceType } from '@/types';
import { recurrenceMatchesDate } from '../temporal/recurrence';

/* ------------------------------------------------------------------ helpers */

const round1 = (n: number) => Math.round(n * 10) / 10;
const roundHalf = (n: number) => Math.round(n * 2) / 2;
const fmt = (n: number) => String(round1(n)).replace('.', ',');
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

const pad = (n: number) => String(n).padStart(2, '0');
/** Local calendar day key (YYYY-MM-DD); the app reasons in the device's local day. */
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDayLocal = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDaysLocal = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const weekStart = (d: Date, first: 0 | 1) => addDaysLocal(startOfDayLocal(d), -((d.getDay() - first + 7) % 7));

const sessionDate = (s: NativeWorkoutSession) => s.completedAt ?? s.startedAt;
const isDone = (s: NativeWorkoutSession) => s.status === 'completed';
const sessionTime = (s: NativeWorkoutSession) => Date.parse(sessionDate(s));

/* ------------------------------------------------------------------ A) history */

export interface SerieRegistrada {
  reps?: number;
  cargaKg?: number;
  segundos?: number;
  distanciaM?: number;
  rpe?: number;
}

export interface EntradaDeHistorico {
  sessaoId: string;
  /** ISO date of the session (completedAt, else startedAt). */
  data: string;
  series: SerieRegistrada[];
}

/** Completed, non-skipped sets of one exercise per session, most recent session first. */
export function historicoDoExercicio(sessoes: readonly NativeWorkoutSession[], exerciseId: string): EntradaDeHistorico[] {
  const out: EntradaDeHistorico[] = [];
  for (const s of sessoes) {
    if (!isDone(s)) continue;
    const series: SerieRegistrada[] = [];
    for (const ex of s.exerciseResults) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets) {
        if (!set.completed || set.skipped) continue;
        const item: SerieRegistrada = {};
        if (set.measureMode === 'duration') {
          if (set.durationSeconds != null && set.durationSeconds > 0) item.segundos = set.durationSeconds;
        } else if (set.reps != null && set.reps > 0) item.reps = set.reps;
        if (set.loadKg != null && set.loadKg > 0) item.cargaKg = set.loadKg;
        if (set.distanceMeters != null && set.distanceMeters > 0) item.distanciaM = set.distanceMeters;
        if (set.perceivedExertion != null) item.rpe = set.perceivedExertion;
        series.push(item);
      }
    }
    if (series.length) out.push({ sessaoId: s.id, data: sessionDate(s), series });
  }
  return out.sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
}

/* ------------------------------------------------------------------ B) suggestion */

export type MotivoDeProgressao = 'primeira-vez' | 'manter' | 'subir-carga' | 'subir-reps' | 'aliviar';

export interface AlvoDeProgressao {
  /** Top of the planned repetition range. */
  repsMax?: number;
  /** Planned hold/duration per set, in seconds. */
  segundos?: number;
}

export interface SugestaoDeProgressao {
  motivo: MotivoDeProgressao;
  cargaKg?: number;
  reps?: number;
  segundos?: number;
  texto: string;
}

const rpeMedio = (e: EntradaDeHistorico) => avg(e.series.flatMap((s) => (s.rpe != null ? [s.rpe] : [])));

/**
 * Simple double progression. `historico` must be most recent first (as returned by
 * historicoDoExercicio). Missing RPE never blocks a progression, but never triggers a deload.
 */
export function sugestaoDeProgressao(historico: readonly EntradaDeHistorico[], alvo?: AlvoDeProgressao): SugestaoDeProgressao {
  const ultima = historico[0];
  if (!ultima || !ultima.series.length) return { motivo: 'primeira-vez', texto: 'Primeira vez neste exercício: registre para termos uma base.' };

  const series = ultima.series;
  const porTempo = series.every((s) => s.segundos != null && s.reps == null);
  const cargas = series.flatMap((s) => (s.cargaKg != null ? [s.cargaKg] : []));
  const comCarga = cargas.length > 0;
  const cargaTopo = comCarga ? Math.max(...cargas) : 0;
  const n = series.length;

  const rpeUltima = rpeMedio(ultima);
  const rpeAnterior = historico[1] ? rpeMedio(historico[1]) : null;
  const sobrecarregado = rpeUltima != null && rpeAnterior != null && rpeUltima >= 9.5 && rpeAnterior >= 9.5;

  if (porTempo) {
    const tempos = series.map((s) => s.segundos as number);
    const topo = Math.max(...tempos);
    const resumo = `Última vez: ${n} × ${topo} s${comCarga ? ` · ${fmt(cargaTopo)} kg` : ''}.`;
    if (sobrecarregado) {
      const segundos = Math.max(1, Math.round(topo * 0.95));
      return { motivo: 'aliviar', segundos, cargaKg: comCarga ? cargaTopo : undefined, texto: `${resumo} Esforço alto nas duas últimas: hoje ${segundos} s.` };
    }
    const meta = alvo?.segundos ?? topo;
    const bateu = tempos.every((t) => t >= meta) && (rpeUltima == null || rpeUltima <= 8);
    if (bateu) {
      const segundos = Math.max(topo + 1, Math.round(topo * 1.05));
      return { motivo: 'subir-reps', segundos, cargaKg: comCarga ? cargaTopo : undefined, texto: `${resumo} Hoje: ${segundos} s.` };
    }
    return { motivo: 'manter', segundos: topo, cargaKg: comCarga ? cargaTopo : undefined, texto: `${resumo} Hoje: mantenha ${topo} s.` };
  }

  const repsFeitas = series.map((s) => s.reps ?? 0);
  const topoReps = Math.max(...repsFeitas);
  const resumo = `Última vez: ${n} × ${topoReps}${comCarga ? ` · ${fmt(cargaTopo)} kg` : ''}.`;

  if (sobrecarregado) {
    if (comCarga) {
      const cargaKg = Math.max(0.5, roundHalf(cargaTopo * 0.95));
      return { motivo: 'aliviar', cargaKg, reps: topoReps, texto: `${resumo} Esforço alto nas duas últimas: hoje ${fmt(cargaKg)} kg.` };
    }
    const reps = Math.max(1, topoReps - 1);
    return { motivo: 'aliviar', reps, texto: `${resumo} Esforço alto nas duas últimas: hoje ${reps} repetições.` };
  }

  const meta = alvo?.repsMax ?? topoReps;
  const bateu = repsFeitas.every((r) => r >= meta) && (rpeUltima == null || rpeUltima <= 8);
  if (!bateu) {
    return { motivo: 'manter', cargaKg: comCarga ? cargaTopo : undefined, reps: topoReps, texto: `${resumo} Hoje: mantenha${comCarga ? ` ${fmt(cargaTopo)} kg` : ''} e busque ${meta} repetições.` };
  }
  if (comCarga) {
    const passo = Math.max(0.5, roundHalf(cargaTopo * 0.025));
    const cargaKg = cargaTopo + passo;
    return { motivo: 'subir-carga', cargaKg, reps: topoReps, texto: `${resumo} Hoje: ${fmt(cargaKg)} kg.` };
  }
  const reps = topoReps + 1;
  return { motivo: 'subir-reps', reps, texto: `${resumo} Hoje: ${reps} repetições.` };
}

/* ------------------------------------------------------------------ C) records */

export interface Recorde {
  valor: number;
  data: string;
  sessaoId: string;
}

export interface RecordesDoExercicio {
  cargaMaximaKg: Recorde | null;
  repsMaximas: Recorde | null;
  /** Largest per-session sum of load × reps. */
  volumeMaximo: Recorde | null;
  /** Epley estimate (load × (1 + reps / 30)); an estimate, not a tested 1RM. */
  melhor1RMEstimado: Recorde | null;
  duracaoMaximaS: Recorde | null;
  distanciaMaximaM: Recorde | null;
}

/** Epley estimate; a single rep is taken at face value. */
export const umRMEpley = (cargaKg: number, reps: number) => (reps <= 1 ? cargaKg : round1(cargaKg * (1 + reps / 30)));

/** Records over a history (any order). Ties keep the earliest achievement. */
export function recordesDoExercicio(historico: readonly EntradaDeHistorico[]): RecordesDoExercicio {
  const result: RecordesDoExercicio = { cargaMaximaKg: null, repsMaximas: null, volumeMaximo: null, melhor1RMEstimado: null, duracaoMaximaS: null, distanciaMaximaM: null };
  const maisAntigoPrimeiro = [...historico].sort((a, b) => Date.parse(a.data) - Date.parse(b.data));
  const tentar = (chave: keyof RecordesDoExercicio, valor: number, e: EntradaDeHistorico) => {
    if (!(valor > 0)) return;
    const atual = result[chave];
    if (!atual || valor > atual.valor) result[chave] = { valor, data: e.data, sessaoId: e.sessaoId };
  };
  for (const e of maisAntigoPrimeiro) {
    let volume = 0;
    for (const s of e.series) {
      if (s.cargaKg != null) tentar('cargaMaximaKg', s.cargaKg, e);
      if (s.reps != null) tentar('repsMaximas', s.reps, e);
      if (s.cargaKg != null && s.reps != null) {
        volume += s.cargaKg * s.reps;
        tentar('melhor1RMEstimado', umRMEpley(s.cargaKg, s.reps), e);
      }
      if (s.segundos != null) tentar('duracaoMaximaS', s.segundos, e);
      if (s.distanciaM != null) tentar('distanciaMaximaM', s.distanciaM, e);
    }
    tentar('volumeMaximo', round1(volume), e);
  }
  return result;
}

/* ------------------------------------------------------------------ D) broken records */

export type TipoDeRecorde = 'carga' | 'reps' | 'volume' | '1rm' | 'duracao' | 'distancia';

export interface RecordeQuebrado {
  exerciseId: string;
  nome: string;
  tipo: TipoDeRecorde;
  valorNovo: number;
  valorAnterior: number | null;
}

/** First appearance of an exercise: sets a baseline, never counts as a broken record. */
export interface EstreiaDeExercicio {
  exerciseId: string;
  nome: string;
  tipo: 'estreia';
}

export type EventoDeRecorde = RecordeQuebrado | EstreiaDeExercicio;

const CHAVE_POR_TIPO: Record<TipoDeRecorde, keyof RecordesDoExercicio> = {
  carga: 'cargaMaximaKg',
  reps: 'repsMaximas',
  volume: 'volumeMaximo',
  '1rm': 'melhor1RMEstimado',
  duracao: 'duracaoMaximaS',
  distancia: 'distanciaMaximaM',
};

/**
 * Compares what `sessao` did against everything in `sessoesAnteriores` (the session itself is
 * ignored if present there). Callers should pass only earlier sessions.
 */
export function recordesQuebradosNaSessao(sessao: NativeWorkoutSession, sessoesAnteriores: readonly NativeWorkoutSession[]): EventoDeRecorde[] {
  const anteriores = sessoesAnteriores.filter((s) => s.id !== sessao.id);
  const eventos: EventoDeRecorde[] = [];
  const vistos = new Set<string>();
  for (const ex of sessao.exerciseResults) {
    if (vistos.has(ex.exerciseId)) continue;
    vistos.add(ex.exerciseId);
    const nome = ex.exerciseNameSnapshot;
    const agora = historicoDoExercicio([{ ...sessao, status: 'completed' }], ex.exerciseId);
    if (!agora.length) continue;
    const antes = historicoDoExercicio(anteriores, ex.exerciseId);
    if (!antes.length) {
      eventos.push({ exerciseId: ex.exerciseId, nome, tipo: 'estreia' });
      continue;
    }
    const novos = recordesDoExercicio(agora);
    const velhos = recordesDoExercicio(antes);
    for (const tipo of Object.keys(CHAVE_POR_TIPO) as TipoDeRecorde[]) {
      const chave = CHAVE_POR_TIPO[tipo];
      const n = novos[chave];
      const v = velhos[chave];
      if (n && (!v || n.valor > v.valor)) eventos.push({ exerciseId: ex.exerciseId, nome, tipo, valorNovo: n.valor, valorAnterior: v ? v.valor : null });
    }
  }
  return eventos;
}

/* ------------------------------------------------------------------ E) modality */

export interface TemplateComModalidade {
  id: string;
  modality: WorkoutExerciseCategory;
}

export interface RecordesDaModalidade {
  treinos: number;
  /** Longest active time, seconds (activeDurationSeconds, else durationSeconds). */
  maiorTempoAtivoS: Recorde | null;
  maiorDistanciaM: Recorde | null;
  maisSeries: Recorde | null;
  /** Consecutive active weeks ending this week (or last week, if this week has no session yet). */
  semanasAtivasSeguidas: number;
  melhorSequenciaDeSemanas: number;
}

/** A session belongs to its template's modality; ad-hoc sessions use the most frequent exercise modality. */
function modalidadeDaSessao(s: NativeWorkoutSession, templates: readonly TemplateComModalidade[]): WorkoutExerciseCategory | null {
  const t = s.templateId ? templates.find((x) => x.id === s.templateId) : undefined;
  if (t) return t.modality;
  const contagem = new Map<WorkoutExerciseCategory, number>();
  for (const ex of s.exerciseResults) if (ex.modality) contagem.set(ex.modality, (contagem.get(ex.modality) ?? 0) + 1);
  let melhor: WorkoutExerciseCategory | null = null;
  let max = 0;
  for (const [m, c] of contagem) if (c > max) { melhor = m; max = c; }
  return melhor;
}

export function recordesDaModalidade(
  sessoes: readonly NativeWorkoutSession[],
  modalidade: WorkoutExerciseCategory,
  opcoes: { templates?: readonly TemplateComModalidade[]; hoje?: Date; comecoDaSemana?: 0 | 1 } = {},
): RecordesDaModalidade {
  const { templates = [], hoje = new Date(), comecoDaSemana = 1 } = opcoes;
  const doTipo = sessoes.filter((s) => isDone(s) && modalidadeDaSessao(s, templates) === modalidade)
    .sort((a, b) => sessionTime(a) - sessionTime(b));
  const out: RecordesDaModalidade = { treinos: doTipo.length, maiorTempoAtivoS: null, maiorDistanciaM: null, maisSeries: null, semanasAtivasSeguidas: 0, melhorSequenciaDeSemanas: 0 };
  const tentar = (chave: 'maiorTempoAtivoS' | 'maiorDistanciaM' | 'maisSeries', valor: number, s: NativeWorkoutSession) => {
    if (!(valor > 0)) return;
    const atual = out[chave];
    if (!atual || valor > atual.valor) out[chave] = { valor, data: sessionDate(s), sessaoId: s.id };
  };
  const semanas = new Set<number>();
  for (const s of doTipo) {
    tentar('maiorTempoAtivoS', s.activeDurationSeconds ?? s.durationSeconds, s);
    let distancia = 0;
    let series = 0;
    for (const ex of s.exerciseResults) for (const set of ex.sets) {
      if (!set.completed || set.skipped) continue;
      series += 1;
      distancia += set.distanceMeters ?? 0;
    }
    tentar('maiorDistanciaM', distancia, s);
    tentar('maisSeries', series, s);
    semanas.add(weekStart(new Date(sessionTime(s)), comecoDaSemana).getTime());
  }
  // Week keys are compared by calendar stepping (not 7 × 24h) to survive DST changes.
  const lista = [...semanas].sort((a, b) => a - b);
  let corrente = 0;
  let anterior: number | null = null;
  for (const w of lista) {
    corrente = anterior != null && addDaysLocal(new Date(anterior), 7).getTime() === w ? corrente + 1 : 1;
    out.melhorSequenciaDeSemanas = Math.max(out.melhorSequenciaDeSemanas, corrente);
    anterior = w;
  }
  let w = weekStart(hoje, comecoDaSemana);
  if (!semanas.has(w.getTime())) w = addDaysLocal(w, -7);
  while (semanas.has(w.getTime())) { out.semanasAtivasSeguidas += 1; w = addDaysLocal(w, -7); }
  return out;
}

/* ------------------------------------------------------------------ F) weekly plan */

/** Structural subset of Habit; only what scheduling and ownership need. */
export interface HabitoDeTreino {
  sourceModule?: string;
  sourceRefId?: string;
  recurrenceType: RecurrenceType;
  recurrenceConfig: RecurrenceConfig;
  createdAt: Date | string;
  startDate?: Date | string;
  controlledBySequenceId?: string | null;
}

export interface TemplateDoPlano {
  id: string;
  name: string;
  modality: WorkoutExerciseCategory;
  scheduledAt?: string;
}

export type EstadoDoDia = 'vazio' | 'planejado' | 'feito' | 'parcial' | 'perdido';

export interface PlanejadoDoDia {
  templateId: string;
  nome: string;
  modalidade: WorkoutExerciseCategory;
  origem: 'habito' | 'data';
  /** True when a completed session of this same template exists that day. */
  cumprido: boolean;
}

export interface FeitoDoDia {
  sessaoId: string;
  nome: string;
  minutos: number;
}

export interface DiaDaSemana {
  /** Local day, YYYY-MM-DD. */
  data: string;
  rotuloCurto: string;
  ehHoje: boolean;
  planejados: PlanejadoDoDia[];
  feitos: FeitoDoDia[];
  estado: EstadoDoDia;
}

const ROTULOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export interface EntradaDaSemana {
  templates: readonly TemplateDoPlano[];
  habitos: readonly HabitoDeTreino[];
  sessoes: readonly NativeWorkoutSession[];
  hoje: Date;
  comecoDaSemana: 0 | 1;
}

/**
 * Seven days starting at `comecoDaSemana`. Habits recur through the shared recurrence rule;
 * habits controlled by a rotation are skipped (their day depends on the rotation cursor).
 */
export function semanaDoPlano({ templates, habitos, sessoes, hoje, comecoDaSemana }: EntradaDaSemana): DiaDaSemana[] {
  const inicio = weekStart(hoje, comecoDaSemana);
  const chaveHoje = dayKey(hoje);
  const concluidas = sessoes.filter((s) => isDone(s));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = addDaysLocal(inicio, i);
    const chave = dayKey(dia);
    const planejados: PlanejadoDoDia[] = [];
    const jaPlanejado = new Set<string>();
    for (const h of habitos) {
      if (h.sourceModule !== 'modulo_treino' || !h.sourceRefId || h.controlledBySequenceId) continue;
      const t = templates.find((x) => x.id === h.sourceRefId);
      if (!t || jaPlanejado.has(t.id) || !recurrenceMatchesDate(h, dia)) continue;
      jaPlanejado.add(t.id);
      planejados.push({ templateId: t.id, nome: t.name, modalidade: t.modality, origem: 'habito', cumprido: false });
    }
    for (const t of templates) {
      if (!t.scheduledAt || jaPlanejado.has(t.id)) continue;
      const d = new Date(t.scheduledAt);
      if (Number.isNaN(d.getTime()) || dayKey(d) !== chave) continue;
      jaPlanejado.add(t.id);
      planejados.push({ templateId: t.id, nome: t.name, modalidade: t.modality, origem: 'data', cumprido: false });
    }
    const doDia = concluidas.filter((s) => dayKey(new Date(sessionDate(s))) === chave).sort((a, b) => sessionTime(a) - sessionTime(b));
    for (const p of planejados) p.cumprido = doDia.some((s) => s.templateId === p.templateId);
    const feitos: FeitoDoDia[] = doDia.map((s) => ({ sessaoId: s.id, nome: s.nameSnapshot, minutos: Math.round((s.activeDurationSeconds ?? s.durationSeconds) / 60) }));
    const passado = chave < chaveHoje; // YYYY-MM-DD compares lexicographically
    const cumpridos = planejados.filter((p) => p.cumprido).length;
    let estado: EstadoDoDia;
    if (!planejados.length) estado = feitos.length ? 'feito' : 'vazio';
    else if (cumpridos === planejados.length) estado = 'feito';
    else if (cumpridos > 0) estado = 'parcial';
    else estado = passado ? 'perdido' : 'planejado';
    return { data: chave, rotuloCurto: ROTULOS[dia.getDay()], ehHoje: chave === chaveHoje, planejados, feitos, estado };
  });
}

/* ------------------------------------------------------------------ G) week summary */

export interface ResumoDaSemana {
  /** Planned workouts in the week. */
  planejados: number;
  /** Sessions completed in the week (planned or not). */
  feitos: number;
  /** Planned workouts fulfilled by a session of the same template. */
  cumpridos: number;
  /** cumpridos / planejados, 0 when nothing was planned. */
  aderenciaPercentual: number;
  minutosAtivos: number;
}

export function resumoDaSemana(semana: readonly DiaDaSemana[]): ResumoDaSemana {
  let planejados = 0, feitos = 0, cumpridos = 0, minutosAtivos = 0;
  for (const d of semana) {
    planejados += d.planejados.length;
    cumpridos += d.planejados.filter((p) => p.cumprido).length;
    feitos += d.feitos.length;
    minutosAtivos += d.feitos.reduce((t, f) => t + f.minutos, 0);
  }
  return { planejados, feitos, cumpridos, aderenciaPercentual: planejados ? Math.round((cumpridos / planejados) * 100) : 0, minutosAtivos };
}
