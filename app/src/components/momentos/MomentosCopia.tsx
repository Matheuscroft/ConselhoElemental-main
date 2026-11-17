import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportarMomentos, importarMomentos } from '@/lib/momentos/momento-store';
import './momentos-copia.css';

/** Keep and bring back the photographs of the days. They live only on this device. */
export function MomentosCopia() {
  const campo = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  async function guardar() {
    if (ocupado) return;
    setOcupado(true);
    setAviso('Preparando o arquivo…');
    try {
      const feito = await exportarMomentos();
      if (!feito) { setAviso('Você ainda não tem momentos guardados neste aparelho.'); return; }
      const nome = `conselho-momentos-${new Date().toISOString().slice(0, 10)}.json`;
      const arquivo = new File([feito.texto], nome, { type: 'application/json' });
      if (navigator.canShare?.({ files: [arquivo] })) {
        try { await navigator.share({ files: [arquivo], title: 'Meus momentos' }); setAviso(`${feito.total} momentos no arquivo. Guarde-o em Arquivos ou no iCloud.`); return; }
        catch (erro) { if ((erro as DOMException)?.name === 'AbortError') { setAviso(''); return; } }
      }
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');
      link.href = url; link.download = nome; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setAviso(`${feito.total} momentos no arquivo ${nome}.`);
    } catch { setAviso('Não consegui montar o arquivo. Tente de novo.'); }
    finally { setOcupado(false); }
  }

  async function trazer(arquivo: File) {
    setOcupado(true);
    setAviso('Trazendo seus momentos…');
    try {
      const r = await importarMomentos(arquivo);
      if (!r.ok) setAviso(r.motivo === 'grande' ? 'Esse arquivo é grande demais.' : r.motivo === 'indisponivel' ? 'Este navegador não guarda fotos. Use o app instalado.' : 'Esse arquivo não é uma cópia de momentos deste app.');
      else setAviso(`${r.trazidos} trazidos${r.jaExistiam ? `, ${r.jaExistiam} dias já tinham foto e foram mantidos` : ''}${r.ignorados ? `, ${r.ignorados} ignorados` : ''}. Reabra Ciclos para vê-los.`);
    } catch { setAviso('Não consegui ler esse arquivo.'); }
    finally { setOcupado(false); }
  }

  return <div className="momentos-copia">
    <p>As fotos dos seus dias ficam só neste aparelho. Se você apagar o app, elas se perdem. Guarde uma cópia em arquivo e traga de volta quando precisar.</p>
    <div className="momentos-copia__acoes">
      <button type="button" disabled={ocupado} onClick={() => void guardar()}><Download size={18} aria-hidden="true" />Guardar meus momentos</button>
      <button type="button" disabled={ocupado} onClick={() => campo.current?.click()}><Upload size={18} aria-hidden="true" />Trazer momentos</button>
    </div>
    <input ref={campo} type="file" accept="application/json,.json" hidden aria-label="Arquivo de momentos" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void trazer(f); }} />
    <p role="status" aria-live="polite" className="momentos-copia__aviso">{aviso}</p>
  </div>;
}
