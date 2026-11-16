/** The same fold the search uses: no accents, no case. One output character per input unit, so positions carry over. */
const dobrar = (unidade: string) => unidade.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');

/**
 * Where `busca` sits inside `texto`, as [start, end) in the original string,
 * or null. Accents and case are ignored, like `matchesAreaName` does, so the
 * part that lit up is the part the person sees marked.
 */
export function trechoAchado(texto: string, busca: string): readonly [number, number] | null {
  const procurado = busca.trim();
  if (!procurado) return null;
  let dobrado = '';
  const inicios: number[] = [];
  for (let i = 0; i < texto.length; i += 1) {
    const parte = dobrar(texto[i]);
    for (let j = 0; j < parte.length; j += 1) inicios.push(i);
    dobrado += parte;
  }
  const alvo = [...procurado].map(dobrar).join('');
  const achado = alvo ? dobrado.indexOf(alvo) : -1;
  if (achado < 0) return null;
  const fim = inicios[achado + alvo.length - 1] + 1;
  return [inicios[achado], fim];
}
