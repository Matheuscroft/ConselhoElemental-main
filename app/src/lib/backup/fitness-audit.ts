import type { MuscleGroupId } from '@/types/workout';
type Data = Record<string, unknown>;
type Report = (path: string, message: string) => void;
const object = (v: unknown): v is Data => !!v && typeof v === 'object' && !Array.isArray(v);
const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const text = (v: unknown) => typeof v === 'string' && v.trim() !== '';
const date = (v: unknown) => typeof v === 'string' && v.trim() !== '' && Number.isFinite(Date.parse(v));
const uuid = (v: unknown) => typeof v === 'string' && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(v);

/** Audits stored values, never recalculates rewards or repairs historical snapshots.
 * Historical references can outlive their plan, catalogue entry or session.
 */
export function auditFitnessAccount(data: Data, path: string, native: boolean, report: Report): void {
  const bad = (p: string, message = 'Dados de treino incompletos ou incompatíveis.') => report(p, message);
  const sessionIds = new Set<string>();
  function fields(value: Data, p: string, names: string[], required = false) {
    for (const key of names) if ((required || key in value) && !number(value[key])) bad(`${p}.${key}`, 'Valor numérico de treino inválido.');
  }
  function dates(value: Data, p: string, required: string[], optional: string[] = []) {
    for (const key of required) if (!date(value[key])) bad(`${p}.${key}`, 'Data de treino inválida.');
    for (const key of optional) if (value[key] != null && !date(value[key])) bad(`${p}.${key}`, 'Data de treino inválida.');
  }
  function list(value: unknown, p: string, visit: (v: Data, p: string) => void, id?: 'native' | 'legacy') {
    if (!Array.isArray(value)) { bad(p, 'Lista interna de treino inválida.'); return; }
    const seen = new Set<string>();
    value.forEach((entry, i) => {
      const loc = `${p}[${i}]`;
      if (!object(entry)) { bad(loc); return; }
      if (id) {
        if (!(id === 'native' ? uuid(entry.id) : text(entry.id))) bad(loc, 'Identificação interna de treino inválida.');
        if (typeof entry.id === 'string' && seen.has(entry.id)) bad(loc, 'Identificação interna de treino repetida.');
        if (typeof entry.id === 'string') seen.add(entry.id);
      }
      visit(entry, loc);
    });
  }
  function series(v: Data, p: string, executed: boolean) {
    if (!Number.isInteger(v.setNumber) || (v.setNumber as number) < 1) bad(p, 'Número da série inválido.');
    fields(v, p, ['loadKg', 'targetLoadKg', 'effectiveLoadKg', 'volume', 'restSeconds', 'distanceMeters', 'durationSeconds', 'targetDurationSeconds', 'reps', 'targetReps', 'activityLoad']);
    if (native) {
      if (v.measureMode !== 'reps' && v.measureMode !== 'duration') bad(p, 'Modo de medição da série inválido.');
      if (v.measureMode === 'reps' && ('durationSeconds' in v || 'targetDurationSeconds' in v)
        || v.measureMode === 'duration' && ('reps' in v || 'targetReps' in v)) bad(p, 'Série mistura repetições e duração.');
      for (const key of ['reps', 'targetReps']) if (key in v && !Number.isInteger(v[key])) bad(p, 'Repetições da série inválidas.');
    } else if (executed) fields(v, p, ['loadKg', 'reps', 'effectiveLoadKg', 'volume'], true);
    else fields(v, p, ['targetLoadKg', 'restSeconds'], true);
    if ((native || executed) && typeof v.completed !== 'boolean') bad(p, 'Estado da série inválido.');
    if ('skipped' in v && typeof v.skipped !== 'boolean') bad(p, 'Estado da série inválido.');
    if (v.skipped === true && v.completed === true) bad(p, 'Série marcada como feita e pulada ao mesmo tempo.');
    if ('loadFactor' in v && ![0.8, 1, 1.5].includes(v.loadFactor as number)) bad(p, 'Fator registrado da série inválido.');
    if ('perceivedExertion' in v && (!Number.isInteger(v.perceivedExertion) || (v.perceivedExertion as number) < 1 || (v.perceivedExertion as number) > 10)) bad(p, 'Esforço registrado da série inválido.');
    dates(v, p, [], ['completedAt']);
  }
  function catalogue(v: Data, p: string) {
    if (!text(v.name)) bad(p, 'Nome do exercício ausente.');
    for (const key of ['imageUrl', 'videoUrl', 'description', 'family', 'nameAlternate', 'durationLabel', 'focus', 'breathing', 'legacyId']) {
      if (key in v && typeof v[key] !== 'string') bad(`${p}.${key}`, 'Texto do catálogo inválido.');
    }
    const choices: [string, readonly string[]][] = [
      ['source', ['native', 'calistenia', 'musculacao', 'yoga', 'custom']],
      [native ? 'modality' : 'category', ['running', 'swimming', 'martial_arts', 'cycling', 'strength', 'hypertrophy', 'calisthenics', 'yoga', 'mobility', 'conditioning', 'mixed', 'custom']],
      ['level', ['beginner', 'intermediate', 'advanced', 'custom']],
      ['measureMode', ['reps', 'duration']], ['loadMode', ['weighted', 'bodyweight', 'none']],
    ];
    for (const [key, values] of choices) if (typeof v[key] !== 'string' || !values.includes(v[key] as string)) bad(`${p}.${key}`, 'Classificação do catálogo não reconhecida.');
    for (const key of ['instructions', 'benefits', 'contraindications', 'variations', 'equipment']) {
      if (key === 'equipment' && v[key] === undefined) continue;
      if (!Array.isArray(v[key]) || (v[key] as unknown[]).some(item => typeof item !== 'string')) bad(`${p}.${key}`, 'Lista de textos do catálogo inválida.');
    }
    fields(v, p, ['defaultSets', 'defaultReps', 'defaultDurationSeconds', 'defaultLoadKg'], true);
    const muscles: Record<MuscleGroupId, true> = { chest:true, upper_back:true, lats:true, shoulders:true, biceps:true, triceps:true, forearms:true, core:true, obliques:true, glutes:true, quadriceps:true, hamstrings:true, calves:true, tibialis:true, serratus:true, adductors:true, lower_back:true };
    for (const key of ['primaryMuscles', 'secondaryMuscles']) if (v[key] !== undefined && (!Array.isArray(v[key]) || (v[key] as unknown[]).some(item => typeof item !== 'string' || !Object.hasOwn(muscles,item)))) bad(`${p}.${key}`, 'Grupo muscular não reconhecido.');
    list(v.muscleDistribution, `${p}.muscleDistribution`, (m, loc) => {
      if (typeof m.muscleId !== 'string' || !Object.hasOwn(muscles,m.muscleId) || !number(m.percentage) || (m.percentage as number) > 100) bad(loc, 'Distribuição muscular inválida.');
    });
    // Custom exercises can have no distribution; never infer or normalize a total.
  }
  function exercise(v: Data, p: string, executed: boolean) {
    if (!(native ? uuid(v.exerciseId) : text(v.exerciseId)) || !Number.isInteger(v.order) || (v.order as number) < 0) bad(p, 'Referência ou ordem do exercício inválida.');
    if ((native || executed) && typeof v.exerciseNameSnapshot !== 'string') bad(p, 'Nome registrado do exercício ausente.');
    list(v.sets, `${p}.sets`, (set, loc) => series(set, loc, executed), native ? 'native' : 'legacy');
  }
  function plan(v: Data, p: string) {
    if (!text(v.name)) bad(p, 'Nome do plano ausente.');
    dates(v, p, ['createdAt', 'updatedAt'], ['scheduledAt']);
    fields(v, p, ['estimatedDurationMinutes'], true);
    if ('effortLevel' in v && (!Number.isInteger(v.effortLevel) || (v.effortLevel as number) < 1 || (v.effortLevel as number) > 5)) bad(p, 'Esforço do plano inválido.');
    list(v.exercises, `${p}.exercises`, (item, loc) => exercise(item, loc, false), native ? 'native' : 'legacy');
  }
  function session(v: Data, p: string) {
    if (native && typeof v.id === 'string') {
      if (sessionIds.has(v.id)) bad(p, 'A mesma sessão aparece em mais de um estado de treino.');
      sessionIds.add(v.id);
    }
    if (!['in_progress', 'completed', 'cancelled'].includes(v.status as string)) bad(p, 'Estado da sessão inválido.');
    if (!text(native ? v.nameSnapshot : v.workoutNameSnapshot)) bad(p, 'Nome registrado da sessão ausente.');
    dates(v, p, ['startedAt'], ['completedAt', 'scheduledAt', 'pausedAt']);
    if (v.status === 'completed' && !date(v.completedAt)) bad(p, 'Sessão concluída sem data válida.');
    fields(v, p, ['durationSeconds', ...(native ? ['totalER'] : ['totalVolume', 'earthPoints', 'strengthGain', 'pranaCost', 'staminaCost'])], true);
    fields(v, p, ['earnedXp', 'baseValue', 'activeDurationSeconds', 'pausedSeconds']);
    if (native) {
      if ('effortLevel' in v && (!Number.isInteger(v.effortLevel) || (v.effortLevel as number) < 1 || (v.effortLevel as number) > 5)) bad(p, 'Esforço da sessão inválido.');
      if ('executionMode' in v && !['LIVE', 'CHECKIN'].includes(v.executionMode as string)) bad(p, 'Modo de execução da sessão inválido.');
      if ('durationSource' in v && !['MEASURED', 'DECLARED_PLANNED'].includes(v.durationSource as string)) bad(p, 'Origem da duração da sessão inválida.');
    }
    for (const key of native ? ['templateId', 'sequenceId', 'coreEntityId', 'coreHabitId', 'coreExecutionLogId'] : ['workoutId']) {
      if ((!native || key in v) && !(native ? uuid(v[key]) : text(v[key]))) bad(`${p}.${key}`, 'Referência registrada da sessão inválida.');
    }
    list(v.exerciseResults, `${p}.exerciseResults`, (item, loc) => exercise(item, loc, true), native ? 'native' : undefined);
    if ('coreReceipt' in v) {
      if (!object(v.coreReceipt)) bad(`${p}.coreReceipt`, 'Recibo de treino inválido.');
      else {
        const r = v.coreReceipt;
        if (!text(r.id) || !text(r.subjectId) || typeof r.fullCompletion !== 'boolean' || !Array.isArray(r.completedItemIds) || r.completedItemIds.some(id => !text(id))) bad(`${p}.coreReceipt`, 'Recibo de treino incompleto.');
        dates(r, `${p}.coreReceipt`, ['timestamp']);
        fields(r, `${p}.coreReceipt`, ['executedValue', 'actualTimeMinutes', 'actualEffortLevel', 'bonusApplied'], true);
        if (v.coreExecutionLogId != null && r.id !== v.coreExecutionLogId) bad(p, 'Recibo e sessão apontam para execuções diferentes.');
        if ((v.coreEntityId != null && r.subjectId !== v.coreEntityId)
          || (v.coreHabitId != null && (r.subjectId !== v.coreHabitId || r.subjectType !== 'HABIT'))
          || ('sourceRefId' in r && r.sourceRefId !== v.id)
          || ('sourceModule' in r && r.sourceModule !== 'modulo_treino')) bad(p, 'O recibo está vinculado a outra atividade ou sessão.');
      }
    }
  }
  list(data[native ? 'nativeCatalog' : 'exercisesCatalog'], `${path}.${native ? 'nativeCatalog' : 'exercisesCatalog'}`, catalogue, native ? 'native' : 'legacy');
  list(data[native ? 'templates' : 'workouts'], `${path}.${native ? 'templates' : 'workouts'}`, plan, native ? 'native' : 'legacy');
  list(data[native ? 'nativeHistory' : 'sessions'], `${path}.${native ? 'nativeHistory' : 'sessions'}`, session, native ? 'native' : 'legacy');
  if (native) {
    if (data.activeNativeSession !== null) {
      if (!object(data.activeNativeSession)) bad(`${path}.activeNativeSession`);
      else {
        if (!uuid(data.activeNativeSession.id)) bad(`${path}.activeNativeSession`);
        if (data.activeNativeSession.status !== 'in_progress') bad(`${path}.activeNativeSession`, 'A sessão ativa não está em andamento.');
        session(data.activeNativeSession, `${path}.activeNativeSession`);
      }
    }
    if (!object(data.nativeCheckins)) bad(`${path}.nativeCheckins`);
    else for (const [key, v] of Object.entries(data.nativeCheckins)) {
      const p = `${path}.nativeCheckins[${JSON.stringify(key)}]`;
      if (!object(v) || !uuid(v.id)) bad(p); else {
        if (!uuid(key) || v.coreHabitId !== key) bad(p, 'O registro diário está vinculado a outro ciclo.');
        if (v.status !== 'in_progress') bad(p, 'O registro diário não está em andamento.');
        session(v, p);
      }
    }
    list(data.sequences, `${path}.sequences`, (v, p) => {
      if (!text(v.name) || !Array.isArray(v.templateIds) || v.templateIds.some(id => !uuid(id)) || new Set(v.templateIds as unknown[]).size !== (v.templateIds as unknown[]).length) bad(p, 'Sequência de planos inválida.');
      dates(v, p, ['createdAt', 'updatedAt']);
    }, 'native');
  } else {
    fields(data, path, ['strengthProgressPoints', 'strengthStat'], true);
    if (!Number.isInteger(data.strengthStat)) bad(`${path}.strengthStat`, 'Indicador de força inválido.');
    const ratedSessions = new Set<string>();
    list(data.ratings, `${path}.ratings`, (v, p) => {
      if (!text(v.sessionId)) bad(p, 'Avaliação sem referência de sessão.');
      if (typeof v.sessionId === 'string') {
        if (ratedSessions.has(v.sessionId)) bad(p, 'Avaliação repetida para a mesma sessão.');
        ratedSessions.add(v.sessionId);
      }
      if (!Number.isInteger(v.stars) || (v.stars as number) < 1 || (v.stars as number) > 5) bad(p, 'Avaliação deve ter de uma a cinco estrelas.');
      dates(v, p, ['createdAt', 'updatedAt']);
      // Native cleanup can remove a session while its rating remains in this map.
    });
    list(data.strengthRecords, `${path}.strengthRecords`, (v, p) => {
      if (!text(v.exerciseId) || typeof v.isPersonalRecord !== 'boolean') bad(p, 'Recorde de força incompleto.');
      dates(v, p, ['recordedAt']);
      fields(v, p, ['bestLoadKg', 'bestReps', 'estimatedOneRepMax', 'previousEstimatedOneRepMax', 'gain'], true);
      if (!Number.isInteger(v.bestReps)) bad(p, 'Repetições do recorde inválidas.');
    }, 'legacy');
    list(data.gamificationLedger, `${path}.gamificationLedger`, (v, p) => {
      if (!text(v.sessionId) || !text(v.formulaVersion)) bad(p, 'Recibo legado sem referência ou versão.');
      dates(v, p, ['appliedAt']);
      fields(v, p, ['earthPoints', 'xpAwarded', 'totalScoreDelta', 'staminaCost', 'pranaCost', 'strengthGain'], true);
    }, 'legacy');
    list(data.bodyMeasurements, `${path}.bodyMeasurements`, (v, p) => {
      dates(v, p, ['measuredAt']);
      fields(v, p, ['heightCm', 'weightKg', 'bodyFatPercent', 'waterPercent', 'muscleMassKg', 'waistCm', 'chestCm', 'armCm', 'thighCm']);
    }, 'legacy');
  }
}
