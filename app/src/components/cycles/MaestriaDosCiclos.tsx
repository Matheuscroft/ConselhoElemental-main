import { useMemo, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { Contagem } from '@/components/motion/Contagem';
import { ELEMENTS, type ElementId } from '@/constants';
import { caminhoDoElemento, caminhoDoMago, DEGRAUS } from '@/lib/maestria/caminho';
import { useAppStore } from '@/stores/appStore';
import './maestria-dos-ciclos.css';

const XP_KEY = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;
const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const RAIO = 44;

/**
 * The mastery of the person, as a quiet card under the scoreboard: the mage's level with the bar to the next one, and
 * one ring per element with its own level and the next step of the day's frame (Faísca, Fluxo, Domínio), always saying
 * how far it is. Closed it is one line; open it is the road. Read-only: it counts nothing and writes nothing.
 */
export function MaestriaDosCiclos() {
  const user = useAppStore((estado) => estado.user);
  const { mago, elementos } = useMemo(() => ({
    mago: caminhoDoMago(user.xp_fire + user.xp_earth + user.xp_water + user.xp_air),
    elementos: ELEMENT_ORDER.map((id) => ({ id: id as ElementId, ...caminhoDoElemento(user[XP_KEY[id as ElementId]]) })),
  }), [user]);
  // The nearest frame step across the four elements: the thing worth wanting.
  const meta = elementos.filter((e) => e.proximo).sort((a, b) => (a.proximo?.faltamXp ?? 0) - (b.proximo?.faltamXp ?? 0))[0];

  return (
    <details className="cycle-maestria ds-pane" data-luz>
      <summary>
        <span className="maestria-selo" aria-hidden="true"><b>{mago.nivel}</b></span>
        <span className="maestria-resumo">
          <strong>Maestria · {mago.titulo}</strong>
          <small>{meta?.proximo ? <>Faltam <b>{formatar(meta.proximo.faltamXp)} XP</b> para o {meta.proximo.nome} de {ELEMENTS[meta.id].name}</> : 'Todos os elementos no Domínio'}</small>
          <i className="maestria-fio" aria-hidden="true"><span style={{ '--parte': mago.fracao } as CSSProperties} /></i>
        </span>
        <ChevronDown className="maestria-seta" size={18} aria-hidden="true" />
      </summary>

      <div className="maestria-corpo">
        <p className="maestria-mago">
          <span>Nível <b><Contagem valor={mago.nivel} /></b> · {formatar(mago.xpTotal)} XP</span>
          <span>{mago.proximoTitulo ? <>{mago.proximoTitulo.titulo} no nível {mago.proximoTitulo.nivel} · faltam {mago.proximoTitulo.faltamNiveis}</> : `Topo: ${mago.topo.titulo}`}</span>
        </p>
        <ul className="maestria-elementos">
          {elementos.map((e, indice) => (
            <li key={e.id} data-element={e.id} data-degrau={e.degrau} style={{ '--ordem': indice } as CSSProperties}>
              <span className="maestria-anel" aria-hidden="true">
                <svg viewBox="0 0 100 100" focusable="false">
                  <circle className="maestria-trilha" cx="50" cy="50" r={RAIO} />
                  <circle className="maestria-arco" cx="50" cy="50" r={RAIO} pathLength={100} style={{ '--parte': e.fracao } as CSSProperties} />
                </svg>
                <b>{e.nivel}</b>
              </span>
              <span className="maestria-info">
                <strong>{ELEMENTS[e.id].name}</strong>
                <small>Borda: {e.degrauNome}</small>
                <span className="maestria-degraus" aria-label={`Degrau da borda: ${e.degrauNome}`}>
                  {DEGRAUS.map((d) => <i key={d.id} data-feito={e.nivel >= d.nivel} title={`${d.nome} · nível ${d.nivel}`} />)}
                </span>
                <em>{e.proximo ? `${e.proximo.nome} em ${formatar(e.proximo.faltamXp)} XP` : 'Domínio alcançado'}</em>
              </span>
            </li>
          ))}
        </ul>
        <p className="maestria-topo"><ArcaneIcon name="conquista" size={16} />O topo da escada é <b>{mago.topo.titulo}</b>, no nível {mago.topo.nivel}.</p>
      </div>
    </details>
  );
}

export default MaestriaDosCiclos;
