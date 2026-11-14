import { useEffect, useId, useState } from 'react';
import {
  ativarSom, assinarPreferencias, definirHaptico, definirSilenciado, definirVolume, lerPreferencias,
  tocarConclusao, tocarConquista, tocarNivel, tocarToque, tocarTrocaDeElemento, tocarVibracaoDeTeste,
  type ElementoSom, type PreferenciasSom,
} from '@/lib/audio';

const ELEMENTOS_TESTE: readonly { id: ElementoSom; nome: string }[] = [
  { id: 'fogo', nome: 'Fogo' }, { id: 'agua', nome: 'Água' }, { id: 'ar', nome: 'Ar' }, { id: 'terra', nome: 'Terra' },
];

/** Every signal by name, so each one can be heard and asked about by that name. */
function OuvirOsSons() {
  const tocar = (acao: () => void) => () => { void ativarSom().then(() => acao()); };
  return (
    <details className="pref-som__teste">
      <summary>Ouvir os sons</summary>
      <div className="pref-som__grade">
        <button type="button" onClick={tocar(tocarToque)}>Toque de cristal</button>
        {ELEMENTOS_TESTE.map(({ id, nome }) => (
          <button key={id} type="button" onClick={tocar(() => tocarConclusao(id, 0.8))}>Conclusão · {nome}</button>
        ))}
        {ELEMENTOS_TESTE.map(({ id, nome }) => (
          <button key={id} type="button" onClick={tocar(() => tocarNivel(id, 2))}>Fluxo · {nome}</button>
        ))}
        {ELEMENTOS_TESTE.map(({ id, nome }) => (
          <button key={id} type="button" onClick={tocar(() => tocarNivel(id, 3))}>Domínio · {nome}</button>
        ))}
        <button type="button" onClick={tocar(() => tocarTrocaDeElemento('fogo', 'agua'))}>Troca de elemento</button>
        <button type="button" onClick={tocar(tocarConquista)}>Conquista</button>
        <button type="button" onClick={tocar(tocarVibracaoDeTeste)}>Só a vibração</button>
      </div>
    </details>
  );
}
import './preferencias-de-som.css';

/** Small reusable block: sound on/off, volume, vibration. Device settings only. */
export function PreferenciasDeSom({ className = '' }: { className?: string }) {
  const [prefs, setPrefs] = useState<PreferenciasSom>(() => lerPreferencias());
  const id = useId();
  useEffect(() => {
    const parar = assinarPreferencias(setPrefs);
    return parar;
  }, []);
  const porcento = Math.round(prefs.volume * 100);
  return (
    <div className={`pref-som ${className}`.trim()} role="group" aria-label="Som e vibração">
      <button
        type="button" role="switch" aria-checked={prefs.ligado} className="pref-som__linha"
        onClick={() => { definirSilenciado(prefs.ligado); if (!prefs.ligado) tocarToque(); }}
      >
        <span>Som</span>
        <span className="pref-som__estado">{prefs.ligado ? 'Ligado' : 'Mudo'}</span>
        <span className="pref-som__chave" aria-hidden="true" />
      </button>
      <div className="pref-som__linha pref-som__volume">
        <label htmlFor={`${id}-vol`}>Volume</label>
        <input
          id={`${id}-vol`} type="range" min={0} max={100} step={5} value={porcento}
          disabled={!prefs.ligado} aria-valuetext={`${porcento}%`}
          onChange={(e) => definirVolume(Number(e.target.value) / 100)}
          onPointerUp={() => tocarToque()}
        />
        <output htmlFor={`${id}-vol`}>{porcento}%</output>
      </div>
      <button
        type="button" role="switch" aria-checked={prefs.haptico} className="pref-som__linha"
        onClick={() => definirHaptico(!prefs.haptico)}
      >
        <span>Vibração</span>
        <span className="pref-som__estado">{prefs.haptico ? 'Ligada' : 'Desligada'}</span>
        <span className="pref-som__chave" aria-hidden="true" />
      </button>
      <OuvirOsSons />
    </div>
  );
}
