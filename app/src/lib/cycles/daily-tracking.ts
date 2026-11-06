import type { HabitDailyEntry, HabitDailyTracking } from '@/types';

export function dailyDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) throw new Error('Escolha uma data válida.');
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validateDailyTracking(config: HabitDailyTracking): HabitDailyTracking {
  const unit = config.unit.trim();
  if (!unit || unit.length > 24) throw new Error('Informe uma unidade com até 24 caracteres.');
  for (const value of [config.target, config.step]) {
    if (!Number.isFinite(value) || value < .001 || value > 1_000_000 || Math.abs(value * 1000 - Math.round(value * 1000)) > 0.000001) {
      throw new Error('Use quantidades entre 0,001 e 1.000.000, com até três casas decimais.');
    }
  }
  return { target: config.target, step: config.step, unit };
}
export function dailyQuantity(entries: readonly HabitDailyEntry[], date: Date, unit: string) {
  const key = dailyDateKey(date);
  const items = entries.filter(entry => entry.dateKey === key && entry.unit === unit);
  return { items, total: Math.round(items.reduce((sum, entry) => sum + entry.quantity, 0) * 1000) / 1000 };
}
