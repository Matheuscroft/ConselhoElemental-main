export type SeasonReader = (date: Date) => { name: string; icon: string };

/** Read the app's own season boundaries; do not duplicate or replace its calendar rule. */
export function seasonCycle(now: Date, readSeason: SeasonReader) {
  const changes: { name: string; icon: string; start: Date }[] = [];
  const cursor = new Date(now.getFullYear() - 1, 11, 1, 12);
  const limit = new Date(now.getFullYear() + 2, 0, 1, 12);
  let previous = '';
  while (cursor <= limit) {
    const season = readSeason(cursor);
    if (season.name !== previous) {
      changes.push({ ...season, start: new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()) });
      previous = season.name;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const windows = changes.slice(0, -1).map((entry, index) => ({ ...entry, end: changes[index + 1].start }));
  const current = windows.findIndex((entry) => entry.start <= now && now < entry.end);
  return current < 0 ? [] : windows.slice(current, current + 4);
}

export const SEASON_STORIES: Record<string, { tone: string; title: string; description: string; prompt: string }> = {
  'Primavera': { tone: 'spring', title: 'Espaço para começar', description: 'A paisagem se renova. Um convite para olhar suas ideias com curiosidade.', prompt: 'Há uma ideia que você gostaria de experimentar?' },
  'Verão': { tone: 'summer', title: 'Presença e movimento', description: 'Luz e expansão dão o tom deste capítulo. Escolha o que merece sua atenção.', prompt: 'Qual projeto você quer colocar em movimento?' },
  'Outono': { tone: 'autumn', title: 'Colher e reorganizar', description: 'Um capítulo para reconhecer o que cresceu e rever o que ainda faz sentido.', prompt: 'O que você deseja continuar — ou deixar para depois?' },
  'Inverno': { tone: 'winter', title: 'Cuidar da base', description: 'Uma pausa na paisagem pode inspirar espaço para cuidado e reflexão.', prompt: 'O que ajuda você a sustentar sua rotina?' },
};
