import { useEffect, useId, useState } from 'react';
import {
  assinarPreferencias, definirHaptico, definirSilenciado, definirVolume, lerPreferencias, tocarToque,
  type PreferenciasSom,
} from '@/lib/audio';
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
    </div>
  );
}
