import { useCallback, useEffect, useRef, useState } from 'react';
import { chaveDoDia, MENSAGENS_MOMENTO, podeGuardarFoto } from '@/lib/momentos/momento';
import { AcoesMomento } from './AcoesMomento';
import './momento-do-dia.css';

// The store is loaded on demand, from effects and handlers only: a dialog
// rendered closed (or on the server) never pulls in or touches IndexedDB.
const armazem = () => import('@/lib/momentos/momento-store');

// Same wording as the Reel's cards, for the same failures.
const MENSAGENS = MENSAGENS_MOMENTO;

/**
 * The photograph of one day, at the top of its dialog. The store is read only
 * inside an effect and only when the browser can keep photos, so a dialog
 * rendered closed on the server never touches IndexedDB. Without storage, or
 * for a future day with no photo, nothing is drawn.
 */
export function MomentoDoDia({ data }: { data: Date }) {
  const dia = chaveDoDia(data);
  const [disponivel, setDisponivel] = useState(false);
  const [foto, setFoto] = useState<{ dia: string; url: string } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const soltarRef = useRef<(() => void) | null>(null);

  const trocar = useCallback((proximo: { dia: string; url: string; soltar: () => void } | null) => {
    soltarRef.current?.();
    soltarRef.current = proximo?.soltar ?? null;
    setFoto(proximo ? { dia: proximo.dia, url: proximo.url } : null);
  }, []);

  useEffect(() => {
    let vivo = true;
    void armazem().then(async ({ momentosDisponiveis, lerMomento, enderecoTemporario }) => {
      if (!momentosDisponiveis()) return;
      const momento = await lerMomento(dia);
      if (!vivo) return;
      setDisponivel(true);
      setAviso(null);
      if (!momento) { trocar(null); return; }
      trocar({ dia, ...enderecoTemporario(momento.exibicao) });
    });
    return () => { vivo = false; };
  }, [dia, trocar]);

  useEffect(() => () => { soltarRef.current?.(); soltarRef.current = null; }, []);

  const guardar = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    setAviso(null);
    const { salvarMomento, enderecoTemporario } = await armazem();
    const resultado = await salvarMomento(dia, arquivo);
    if (!resultado.ok) {
      setAviso(MENSAGENS[resultado.motivo] ?? MENSAGENS.falha);
      return;
    }
    trocar({ dia, ...enderecoTemporario(resultado.momento.exibicao) });
  };

  const remover = async () => {
    const { apagarMomento } = await armazem();
    if (await apagarMomento(dia)) trocar(null);
  };

  if (!disponivel) return null;

  const atual = foto?.dia === dia ? foto.url : null;
  const permitido = podeGuardarFoto(dia, new Date());
  if (!atual && !permitido) return null;

  const extenso = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="momento-do-dia">
      {atual ? (
        <figure className="momento-do-dia-foto">
          <img key={atual} src={atual} alt={`Momento de ${extenso}`} decoding="async" draggable={false} />
        </figure>
      ) : null}
      {permitido ? (
        <AcoesMomento
          temFoto={Boolean(atual)}
          aoEscolher={(arquivo) => void guardar(arquivo)}
          aoRemover={() => void remover()}
        />
      ) : null}
      <p className="momento-do-dia-privado">Fica só neste aparelho.</p>
      {aviso ? <p className="momento-do-dia-aviso" role="alert">{aviso}</p> : null}
    </div>
  );
}

export default MomentoDoDia;
