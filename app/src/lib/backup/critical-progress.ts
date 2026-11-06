import { readProfileReminders } from '@/lib/reminders/profile-reminder-codec';
import type { ProgressSnapshot } from './progress-backup';
import type { ElementId } from '@/types';
import { auditFitnessAccount } from './fitness-audit';
import { auditProgressLinks } from './progress-links';

export interface ProgressIssue { path: string; message: string }
export interface CriticalProgressAudit { issues: ProgressIssue[]; truncated: boolean }
type Data = Record<string, unknown>;
const record = (value: unknown): value is Data => !!value && typeof value === 'object' && !Array.isArray(value);
const elements = ['fogo', 'terra', 'agua', 'ar'] satisfies ElementId[];
const element = (value: unknown) => typeof value === 'string' && (elements as string[]).includes(value);
const nestedLists = ['tasks', 'habits', 'projects', 'quests', 'missions', 'actions', 'childItems', 'childHabits', 'completions', 'dailyEntries'];
const rootLists = ['tasks', 'habits', 'projects', 'quests', 'actions', 'drafts', 'executionLogs', 'cycleSequences', 'sequenceMemberships', 'commitments', 'customAreas'];
const validDate = (value: unknown) => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Date.parse(value));
const validDayKey = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && validDate(value) && new Date(value).toISOString().slice(0, 10) === value;
const positive = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nonempty = (value: unknown) => typeof value === 'string' && value.trim() !== '';

/** Read-only critical-field audit, AFTER envelope/checksum validation.
 * Deliberately not a complete domain schema, migration or permission to restore.
 * Unknown properties are preserved. No IDs, rewards or defaults are synthesized.
 */
export function auditCriticalProgress(snapshot: ProgressSnapshot): CriticalProgressAudit {
  const issues: ProgressIssue[] = [];
  let truncated = false;
  const add = (path: string, message: string) => {
    if (issues.length < 30) issues.push({ path, message }); else truncated = true;
  };
  const shape = (value: unknown, path: string): value is Data => {
    if (record(value)) return true;
    add(path, 'Estrutura de dados incompleta.'); return false;
  };
  function list(value: unknown, path: string, visit: (item: Data, path: string) => void = entity) {
    if (!Array.isArray(value)) { add(path, 'Lista de registros inválida.'); return; }
    const ids = new Set<string>();
    value.forEach((item, index) => {
      const location = `${path}[${index}]`;
      if (!shape(item, location)) return;
      if (!nonempty(item.id)) add(location, 'Registro sem identificação.');
      else if (ids.has(item.id as string)) add(location, 'Identificação repetida nesta lista.');
      else ids.add(item.id as string);
      visit(item, location);
    });
  }
  function reward(value: unknown, path: string, rules: string[]) {
    if (!shape(value, path)) return;
    if (!nonnegative(value.amount) || !element(value.elementId) || typeof value.ruleset !== 'string' || !rules.includes(value.ruleset)) {
      add(path, 'Recibo de recompensa incompatível.');
    }
  }
  function entity(item: Data, path: string) {
    for (const name of nestedLists) if (name in item) list(item[name], `${path}.${name}`, (child, location) => {
      if (name === 'dailyEntries' && (!positive(child.quantity) || !nonempty(child.unit) || !('dateKey' in child) || !validDate(child.recordedAt))) add(location, 'Registro de quantidade incompleto.');
      if (name === 'completions' && (!nonempty(child.habitId) || !validDate(child.completionDate) || !nonnegative(child.scoreEarned) || !nonnegative(child.timeSpentMinutes))) add(location, 'Registro de conclusão incompleto.');
      entity(child, location);
    });
    for (const name of ['createdAt', 'updatedAt', 'completionDate', 'recordedAt', 'timestamp']) {
      if (name in item && !validDate(item[name])) add(`${path}.${name}`, 'Data de registro inválida.');
    }
    for (const name of ['completedAt', 'lastCompletedAt', 'lastCompletedDate', 'dueDate', 'lastStartedAt', 'cursorDate']) {
      if (item[name] != null && !validDate(item[name])) add(`${path}.${name}`, 'Data de registro inválida.');
    }
    if ('isCompleted' in item && typeof item.isCompleted !== 'boolean') add(path, 'Estado de conclusão inválido.');
    if ('elementId' in item && !element(item.elementId)) add(path, 'Elemento não reconhecido.');
    if ('dailyTracking' in item && shape(item.dailyTracking, `${path}.dailyTracking`)) {
      const config = item.dailyTracking;
      if (!positive(config.target) || !positive(config.step) || !nonempty(config.unit)) add(`${path}.dailyTracking`, 'Meta, incremento ou unidade do contador inválidos.');
    }
    if ('quantity' in item && (!positive(item.quantity) || !nonempty(item.unit))) add(path, 'Quantidade ou unidade do registro inválida.');
    if ('dateKey' in item) {
      const key = item.dateKey;
      if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key) || !validDate(key)
        || new Date(key).toISOString().slice(0, 10) !== key) add(path, 'Dia do contador inválido.');
    }
    if (typeof item.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) && !validDayKey(item.dueDate)) add(path, 'Data planejada inválida.');
    if ('untilDate' in item && !validDayKey(item.untilDate)) add(path, 'Data final de recorrência inválida.');
    if ('completionXp' in item) reward(item.completionXp, `${path}.completionXp`, ['ritual-leaf-xp-v1']);
    if ('completionBonus' in item) {
      reward(item.completionBonus, `${path}.completionBonus`, ['achievement-bonus-v1']);
      if (record(item.completionBonus) && (!nonempty(item.completionBonus.id) || !validDate(item.completionBonus.completedAt))) {
        add(`${path}.completionBonus`, 'Identificação ou data da conquista inválida.');
      }
    }
    if (['xpAwarded', 'xpElementId', 'xpRuleset'].some(name => name in item)
      && (!nonnegative(item.xpAwarded) || !element(item.xpElementId) || typeof item.xpRuleset !== 'string'
        || !['cycle-xp-v1', 'cycle-xp-recovery-v1'].includes(item.xpRuleset))) add(path, 'Recibo de XP do ciclo incompleto ou incompatível.');
    if ('recurrenceConfig' in item && shape(item.recurrenceConfig, `${path}.recurrenceConfig`)) {
      if ('until' in item.recurrenceConfig && !validDayKey(item.recurrenceConfig.until)) add(path, 'Data final de recorrência inválida.');
      const { month, day } = item.recurrenceConfig;
      if (month !== undefined || day !== undefined) {
        if (typeof month !== 'number' || typeof day !== 'number' || !Number.isInteger(month) || !Number.isInteger(day)
          || month < 1 || month > 12 || day < 1 || day > new Date(2000, month, 0).getDate()) add(path, 'Data de recorrência anual inválida.');
      }
      for (const [key, min, max] of [['daysOfWeek', 0, 6], ['daysOfMonth', 1, 31]] as const) {
        const days = item.recurrenceConfig[key];
        if (days !== undefined && (!Array.isArray(days) || days.some(day => !Number.isInteger(day) || day < min || day > max))) add(path, 'Dias de recorrência inválidos.');
      }
    }
  }
  function profile(value: unknown, path: string) {
    if (!shape(value, path)) return;
    if (shape(value.user, `${path}.user`)) {
      if (!nonempty(value.user.id)) add(`${path}.user`, 'Personagem sem identificação.');
      try { readProfileReminders(value.user.reminderState); } catch { add(`${path}.user.reminderState`, 'Metadados de lembretes incompatíveis. Preserve a cópia para revisão.'); }
      for (const key of ['xp_fire', 'xp_earth', 'xp_water', 'xp_air']) if (!nonnegative(value.user[key])) add(`${path}.user.${key}`, 'XP registrado inválido.');
    }
    for (const name of rootLists) list(value[name], `${path}.${name}`);
  }
  // Explicitly reviewed archive versions, not an inferred migration policy.
  if (!/^0\.1\.(85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129)$/.test(snapshot.appVersion)) add('appVersion', 'Versão do arquivo ainda não revisada para restauração.');
  const core = snapshot.stores.core.state;
  profile(core, 'core');
  list(core.accounts, 'core.accounts', () => {});
  for (const [id, data] of Object.entries(core.accountDataById as Data)) profile(data, `core.accountDataById[${JSON.stringify(id)}]`);
  for (const map of ['accountDataById', 'nativeDataById'] as const) {
    for (const [id, value] of Object.entries(snapshot.stores.fitness.state[map] as Data)) {
      const path = `fitness.${map}[${JSON.stringify(id)}]`;
      if (!shape(value, path)) continue;
      auditFitnessAccount(value, path, map === 'nativeDataById', add);
    }
  }
  auditProgressLinks(snapshot, add);
  return { issues, truncated };
}
