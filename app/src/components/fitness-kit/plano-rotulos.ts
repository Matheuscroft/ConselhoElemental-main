import type { DiaDaSemana } from '@/lib/workout/progressao';

/** Local calendar date from a YYYY-MM-DD key (never through UTC, which would shift the day). */
export function dataDaChave(chave: string): Date {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "Terça", "Sábado": the weekday without the "-feira". */
export function nomeDoDia(data: Date): string {
  const nome = data.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0];
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

/** "Terça, 18 de novembro". */
export function tituloDoDia(chave: string): string {
  const data = dataDaChave(chave);
  return `${nomeDoDia(data)}, ${data.getDate()} de ${data.toLocaleDateString('pt-BR', { month: 'long' })}`;
}

/** "17 a 23 de nov." for the header of the week. */
export function faixaDaSemana(semana: readonly DiaDaSemana[]): string {
  if (!semana.length) return '';
  const a = dataDaChave(semana[0].data);
  const b = dataDaChave(semana[semana.length - 1].data);
  const mes = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return a.getMonth() === b.getMonth() ? `${a.getDate()} a ${b.getDate()} de ${mes(b)}` : `${a.getDate()} ${mes(a)} a ${b.getDate()} ${mes(b)}`;
}

const lista = (nomes: readonly string[]) => nomes.join(', ');

/** What a screen reader hears for one day of the strip: "Terça, 18: treino planejado: Peito e tríceps". */
export function rotuloDoDia(dia: DiaDaSemana): string {
  const data = dataDaChave(dia.data);
  const cabeca = `${nomeDoDia(data)}, ${data.getDate()}${dia.ehHoje ? ', hoje' : ''}`;
  const nomes = dia.planejados.map((p) => p.nome);
  const cumpridos = dia.planejados.filter((p) => p.cumprido).length;
  switch (dia.estado) {
    case 'planejado': return `${cabeca}: ${nomes.length === 1 ? 'treino planejado' : `${nomes.length} treinos planejados`}: ${lista(nomes)}`;
    case 'feito': return `${cabeca}: treino feito: ${lista(dia.feitos.length ? dia.feitos.map((f) => f.nome) : nomes)}`;
    case 'parcial': return `${cabeca}: ${cumpridos} de ${nomes.length} treinos feitos: ${lista(nomes)}`;
    case 'perdido': return `${cabeca}: treino planejado que não aconteceu: ${lista(nomes)}`;
    default: return `${cabeca}: sem treino planejado`;
  }
}
