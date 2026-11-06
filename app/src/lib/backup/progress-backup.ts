/** A read-only archive of the two existing persist projections, not a new data store. */
export const BACKUP_FORMAT = 'conselho-elemental-progress';
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
export const STORE_KEYS = { core: 'conselho-elemental-storage', fitness: 'dominio-do-mago-workout-storage-v1' } as const;
const coreLists = ['executionLogs', 'accounts', 'customAreas', 'actions', 'tasks', 'habits', 'cycleSequences', 'sequenceMemberships', 'commitments', 'projects', 'quests', 'drafts'];
const coreObjects = ['accountDataById', 'user', 'onboarding', 'customSubareas', 'linkedSubareasByAreaId'];
const fitnessObjects = ['accountDataById', 'nativeDataById'];
type RecordValue = Record<string, unknown>;
export interface StoreArchive { key: string; version: number; state: RecordValue }
export interface ProgressSnapshot {
  format: typeof BACKUP_FORMAT;
  schemaVersion: 1;
  appVersion: string;
  createdAt: string;
  source: { origin: string; accountId: string | null };
  stores: { core: StoreArchive; fitness: StoreArchive };
}
export interface ProgressBackup extends ProgressSnapshot { checksum: { algorithm: 'SHA-256'; value: string } }
export interface BackupSummary {
  createdAt: string; appVersion: string; origin: string; accountId: string | null;
  profiles: number; tasks: number; habits: number; quests: number; projects: number;
  drafts: number; executions: number; fitnessAccounts: number; sessions: number;
}
function fail(message: string): never { throw new Error(message); }
function object(value: unknown): value is RecordValue { return !!value && typeof value === 'object' && !Array.isArray(value); }
function exactKeys(value: RecordValue, keys: readonly string[]) {
  if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) fail('Estrutura de backup incompatível. Nenhum dado foi alterado.');
}
function checkJson(value: unknown, depth = 0): void {
  if (depth > 100) fail('O arquivo tem uma estrutura profunda demais.');
  if (typeof value === 'number' && !Number.isFinite(value)) fail('O arquivo contém um número inválido.');
  if (object(value) || Array.isArray(value)) for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('O arquivo contém uma chave incompatível.');
    checkJson(child, depth + 1);
  }
}
function checkStore(value: unknown, type: keyof typeof STORE_KEYS): asserts value is StoreArchive {
  if (!object(value)) fail('Falta uma das partes do progresso.');
  exactKeys(value, ['key', 'version', 'state']);
  if (value.key !== STORE_KEYS[type] || value.version !== 0 || !object(value.state)) fail('Versão de armazenamento incompatível.');
  const state = value.state;
  const lists = type === 'core' ? coreLists : [];
  const objects = type === 'core' ? coreObjects : fitnessObjects;
  exactKeys(state, [...lists, ...objects, 'currentAccountId']);
  if (state.currentAccountId !== null && typeof state.currentAccountId !== 'string') fail('Identificação da conta inválida.');
  if (lists.some(key => !Array.isArray(state[key])) || objects.some(key => !object(state[key]))) fail('Dados de progresso incompletos.');
}
function checkSnapshot(value: unknown): asserts value is ProgressSnapshot {
  if (!object(value)) fail('Este arquivo não é um backup de progresso.');
  exactKeys(value, ['format', 'schemaVersion', 'appVersion', 'createdAt', 'source', 'stores']);
  if (value.format !== BACKUP_FORMAT || value.schemaVersion !== 1) fail('Formato de backup não suportado.');
  if (typeof value.appVersion !== 'string' || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) fail('Metadados do backup inválidos.');
  if (!object(value.source) || !object(value.stores)) fail('Origem ou partes do backup ausentes.');
  exactKeys(value.source, ['origin', 'accountId']); exactKeys(value.stores, ['core', 'fitness']);
  if (typeof value.source.origin !== 'string' || (value.source.accountId !== null && typeof value.source.accountId !== 'string')) fail('Origem do backup inválida.');
  checkStore(value.stores.core, 'core'); checkStore(value.stores.fitness, 'fitness');
  if (value.source.accountId !== value.stores.core.state.currentAccountId || (value.source.accountId ?? 'local') !== value.stores.fitness.state.currentAccountId) fail('As contas dos dois módulos não estão alinhadas. Tente novamente após abrir Treinos.');
  checkJson(value);
}
function checkSize(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) fail('O backup excede o limite de 20 MB. Nenhum dado foi alterado.');
}
/** Shared structural boundary for already parsed storage envelopes; no writes or coercion. */
export function validateProgressSnapshot(value: unknown): asserts value is ProgressSnapshot {
  checkSnapshot(value);
}
async function checksum(snapshot: ProgressSnapshot): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(snapshot)));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
/** Serializes synchronously before hashing so edits during the await cannot change the archive. */
export async function createProgressBackup(input: ProgressSnapshot): Promise<string> {
  checkJson(input);
  const serialized = JSON.stringify(input);
  checkSize(serialized);
  const snapshot: unknown = JSON.parse(serialized);
  checkSnapshot(snapshot);
  const result = JSON.stringify({ ...snapshot, checksum: { algorithm: 'SHA-256', value: await checksum(snapshot) } }, null, 2);
  checkSize(result);
  return result;
}
export async function inspectProgressBackup(text: string): Promise<{ backup: ProgressBackup; summary: BackupSummary }> {
  checkSize(text);
  let value: unknown;
  try { value = JSON.parse(text); } catch { return fail('Não foi possível ler o JSON. Escolha um backup exportado pelo Grimório.'); }
  if (!object(value)) fail('Este arquivo não é um backup de progresso.');
  exactKeys(value, ['format', 'schemaVersion', 'appVersion', 'createdAt', 'source', 'stores', 'checksum']);
  const { checksum: signature, ...snapshot } = value;
  checkSnapshot(snapshot);
  if (!object(signature) || signature.algorithm !== 'SHA-256' || typeof signature.value !== 'string' || !/^[a-f0-9]{64}$/.test(signature.value)) fail('Verificação de integridade ausente ou inválida.');
  exactKeys(signature, ['algorithm', 'value']);
  if (await checksum(snapshot) !== signature.value) fail('O conteúdo mudou desde a exportação. Nenhum dado foi alterado.');
  return { backup: value as unknown as ProgressBackup, summary: summarizeProgress(snapshot) };
}
/** Summary of an already validated snapshot; never use this as an input validator. */
export function summarizeProgress(snapshot: ProgressSnapshot): BackupSummary {
  const core = snapshot.stores.core.state;
  const fitness = snapshot.stores.fitness.state;
  const legacy = fitness.accountDataById as RecordValue, native = fitness.nativeDataById as RecordValue;
  const count = (value: unknown) => Array.isArray(value) ? value.length : 0;
  const sessions = Object.values(legacy).reduce<number>((sum, data) => sum + (object(data) ? count(data.sessions) : 0), 0)
    + Object.values(native).reduce<number>((sum, data) => sum + (object(data) ? count(data.nativeHistory) : 0), 0);
  return { createdAt: snapshot.createdAt, appVersion: snapshot.appVersion, origin: snapshot.source.origin, accountId: snapshot.source.accountId,
    profiles: count(core.accounts), tasks: count(core.tasks), habits: count(core.habits), quests: count(core.quests), projects: count(core.projects), drafts: count(core.drafts), executions: count(core.executionLogs),
    fitnessAccounts: new Set([...Object.keys(legacy), ...Object.keys(native)]).size, sessions };
}
