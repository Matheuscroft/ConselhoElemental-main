import { Camera, Trash2 } from 'lucide-react';
import './reel-momentos.css';

/**
 * Guardar, trocar e remover a foto de um dia. Só apresentação: quem guarda
 * (e quem avisa quando não dá) é o dono do componente.
 */
export function AcoesMomento({ temFoto, aoEscolher, aoRemover }: {
  temFoto: boolean;
  aoEscolher: (arquivo: File | undefined) => void;
  aoRemover: () => void;
}) {
  return (
    <div className="reel-acoes">
      <label className="reel-acao">
        <Camera size={16} aria-hidden="true" />
        {temFoto ? 'Trocar foto' : 'Guardar momento'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(evento) => {
            aoEscolher(evento.target.files?.[0]);
            evento.target.value = '';
          }}
        />
      </label>
      {temFoto ? (
        <button type="button" className="reel-acao" onClick={aoRemover}>
          <Trash2 size={16} aria-hidden="true" />
          Remover
        </button>
      ) : null}
    </div>
  );
}

export default AcoesMomento;
