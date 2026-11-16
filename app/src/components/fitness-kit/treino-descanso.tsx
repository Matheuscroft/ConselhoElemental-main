import { useCallback, useEffect, useRef, useState } from 'react';
import { formatClock } from '@/lib/fitness-kit/format';
import { DURATION } from '@/lib/motion/motion';
import { TreinoAnel } from './treino-anel';
import './treino-uau.css';

export interface SerieConcluidaParaDescanso {
  id: string;
  /** Rest planned after this set, in seconds. */
  descansoSegundos: number;
}

export interface DescansoEmCurso { fim: number; total: number }

/**
 * Starts a rest when a set is newly completed in front of the person. It only
 * reads which sets are done: opening a session that already has sets done
 * starts nothing, and nothing here can block, delay or record a set.
 */
export function useDescanso(concluidas: readonly SerieConcluidaParaDescanso[], haProxima: boolean) {
  const [descanso, setDescanso] = useState<DescansoEmCurso | null>(null);
  const vistas = useRef<ReadonlySet<string> | null>(null);
  useEffect(() => {
    const ids = new Set(concluidas.map((serie) => serie.id));
    const anteriores = vistas.current;
    vistas.current = ids;
    if (anteriores === null) return;
    const nova = concluidas.find((serie) => !anteriores.has(serie.id));
    if (nova && haProxima && nova.descansoSegundos > 0) {
      setDescanso({ fim: Date.now() + nova.descansoSegundos * 1000, total: nova.descansoSegundos });
    } else if (!haProxima) {
      setDescanso(null);
    }
  }, [concluidas, haProxima]);
  const dispensar = useCallback(() => setDescanso(null), []);
  return { descanso, dispensar };
}

/** The ring that empties while the person rests, with a way out that is always one tap away. */
export function TreinoDescanso({ descanso, onDispensar }: { descanso: DescansoEmCurso; onDispensar: () => void }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const tique = window.setInterval(() => setAgora(Date.now()), 250);
    return () => window.clearInterval(tique);
  }, []);
  const restanteMs = Math.max(0, descanso.fim - agora);
  const pronto = restanteMs === 0;
  useEffect(() => {
    if (!pronto) return;
    const fim = window.setTimeout(onDispensar, DURATION.conjure * 3);
    return () => window.clearTimeout(fim);
  }, [pronto, onDispensar]);
  const segundos = Math.ceil(restanteMs / 1000);
  return <div className="treino-descanso" data-pronto={pronto}>
    <TreinoAnel valor={restanteMs / (descanso.total * 1000)} tamanho={44} espessura={5} />
    <div className="treino-descanso-texto">
      <span className="treino-descanso-rotulo">{pronto ? 'Descanso' : 'Descansando'}</span>
      {/* The countdown is not announced every second; only the end is. */}
      <span className="treino-descanso-tempo" aria-hidden={pronto ? undefined : true}>{pronto ? 'Pronto para a próxima' : formatClock(segundos)}</span>
    </div>
    <span className="sr-only" role="status">{pronto ? 'Descanso terminado. Pronto para a próxima série.' : ''}</span>
    <button type="button" className="treino-acao treino-descanso-pular" onClick={onDispensar}>{pronto ? 'Fechar' : 'Pular descanso'}</button>
  </div>;
}
