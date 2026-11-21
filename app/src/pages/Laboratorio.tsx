import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppLayout } from '@/components/layout';
import { Cerimonia } from '@/components/cerimonia/Cerimonia';
import { CerimoniaDeNivel } from '@/components/cerimonia/CerimoniaDeNivel';
import { NoticiaElemental } from '@/components/feedback/NoticiaElemental';
import { empilhar, remover, type Noticia } from '@/components/feedback/fila';
import { Acao, Bloco, Deslizante, Escolha, Texto } from '@/components/laboratorio/controles';
import { ReelMomentos, type DiaDoReel } from '@/components/momentos/ReelMomentos';
import { Conjurar } from '@/components/motion/Conjurar';
import { Contagem } from '@/components/motion/Contagem';
import { RewardSummary } from '@/components/rewards/RewardSummary';
import type { Premio } from '@/lib/cerimonia/cerimonia';
import { ACENTO, type ElementoId } from '@/lib/design/palette';
import type { AscensaoDoReel, NivelDeAscensao } from '@/lib/momentos/ascensao';
import type { NivelVfx } from '@/lib/momentos/nivel-vfx';
import { LevelingCalculatorService } from '@/services/leveling-calculator';
import '@/components/laboratorio/laboratorio.css';

/**
 * Laboratório: a place to trigger what the app does when something is earned, without earning it.
 * Everything here is a rehearsal on made-up values. Nothing reads from or writes to the person's
 * progress, cycles, XP or backup: the only thing it touches is what is on this screen.
 */

const ELEMENTOS: readonly ElementoId[] = ['fogo', 'agua', 'ar', 'terra'];
const NOME: Record<ElementoId, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const OPCOES_ELEMENTO = ELEMENTOS.map((valor) => ({ valor, texto: NOME[valor] }));
const OPCOES_OU_NENHUM: ReadonlyArray<{ valor: ElementoId | null; texto: string }> = [{ valor: null, texto: 'Nenhum' }, ...OPCOES_ELEMENTO];

type Painel = 'nivel' | 'moldura' | 'avisos' | 'recompensa' | 'movimento';
const PAINEIS: ReadonlyArray<{ id: Painel; texto: string }> = [
  { id: 'nivel', texto: 'Nível' }, { id: 'moldura', texto: 'Moldura' }, { id: 'avisos', texto: 'Avisos' },
  { id: 'recompensa', texto: 'Recompensa' }, { id: 'movimento', texto: 'Movimento' },
];

/* ---------- Nível: a subida de nível e a cerimônia de conclusão ---------- */
function PainelNivel() {
  const [de, setDe] = useState(4);
  const [titulo, setTitulo] = useState('Aprendiz');
  const [fracao, setFracao] = useState(0.12);
  const [fracaoAntes, setFracaoAntes] = useState(0.9);
  const [faltam, setFaltam] = useState(120);
  const [subida, setSubida] = useState<number | null>(null);

  const [elemento, setElemento] = useState<ElementoId | null>('fogo');
  const [tituloPremio, setTituloPremio] = useState('Novo nível');
  const [comNumero, setComNumero] = useState(true);
  const [comDestrave, setComDestrave] = useState(true);
  const [premioN, setPremioN] = useState<number | null>(null);
  const premio: Premio = {
    ...(elemento ? { elemento } : {}),
    titulo: tituloPremio,
    ...(comNumero ? { numero: { rotulo: 'Nível', de, para: de + 1 } } : {}),
    ...(comDestrave ? { destrave: { titulo: 'Progresso', detalhe: 'Até o próximo nível' } } : {}),
  };

  return (
    <>
      <Bloco titulo="Subida de nível" nota="A tela cheia do anel do Santuário, os quatro elementos e o número novo.">
        <Deslizante rotulo="Nível de partida" valor={de} min={1} max={60} aoMudar={setDe} formatar={(v) => `${v} → ${v + 1}`} />
        <Texto rotulo="Título de maestria do novo nível" valor={titulo} aoMudar={setTitulo} />
        <Deslizante rotulo="Já andado no novo nível" valor={fracao} min={0} max={1} passo={0.01} aoMudar={setFracao} formatar={(v) => `${Math.round(v * 100)}%`} />
        <Deslizante rotulo="Andado no nível vencido, antes do ganho" valor={fracaoAntes} min={0} max={1} passo={0.01} aoMudar={setFracaoAntes} formatar={(v) => `${Math.round(v * 100)}%`} />
        <Deslizante rotulo="XP que faltam para o próximo" valor={faltam} min={0} max={2000} passo={10} aoMudar={setFaltam} />
        <Acao primaria aoClicar={() => setSubida((n) => (n ?? 0) + 1)}>Disparar subida de nível</Acao>
      </Bloco>
      {subida !== null ? createPortal(
        <CerimoniaDeNivel key={subida} de={de} para={de + 1} titulo={titulo} fracao={fracao} fracaoAntes={fracaoAntes} faltam={faltam} onFechar={() => setSubida(null)} />,
        document.body,
      ) : null}

      <Bloco titulo="Cerimônia de conclusão" nota="As telas que marcam terminar algo: a chegada, o número e o que se destrava.">
        <Escolha rotulo="Elemento" valor={elemento} opcoes={OPCOES_OU_NENHUM} aoMudar={setElemento} />
        <Texto rotulo="Título" valor={tituloPremio} aoMudar={setTituloPremio} />
        <Escolha rotulo="Mostrar o número" valor={comNumero ? 1 : 0} opcoes={[{ valor: 1, texto: 'Sim' }, { valor: 0, texto: 'Não' }]} aoMudar={(v) => setComNumero(v === 1)} />
        <Escolha rotulo="Mostrar o que destrava" valor={comDestrave ? 1 : 0} opcoes={[{ valor: 1, texto: 'Sim' }, { valor: 0, texto: 'Não' }]} aoMudar={(v) => setComDestrave(v === 1)} />
        <Acao primaria aoClicar={() => setPremioN((n) => (n ?? 0) + 1)}>Disparar cerimônia</Acao>
      </Bloco>
      {premioN !== null ? <Cerimonia key={premioN} premio={premio} onFechar={() => setPremioN(null)} /> : null}
    </>
  );
}

/* ---------- Moldura: o Reel dos dias com a moldura elemental ---------- */
const TOTAL_DE_CICLOS = 4;

function diasDeTeste(elemento: ElementoId | null, nivel: NivelVfx, feitos: number): DiaDoReel[] {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, indice) => {
    const data = new Date(base);
    data.setDate(base.getDate() + indice - 3);
    const aberto = indice === 3;
    return {
      dia: `laboratorio-${indice}`, data, hoje: aberto, total: TOTAL_DE_CICLOS,
      feitos: aberto ? feitos : indice < 3 ? TOTAL_DE_CICLOS : 0,
      elemento: aberto ? elemento : ELEMENTOS[indice % ELEMENTOS.length],
      nivel: aberto ? nivel : 1,
    } satisfies DiaDoReel;
  });
}

function PainelMoldura() {
  const [elemento, setElemento] = useState<ElementoId | null>('fogo');
  const [nivel, setNivel] = useState<NivelVfx>(1);
  const [feitos, setFeitos] = useState(1);
  const [selecionado, setSelecionado] = useState(3);
  const [ascensao, setAscensao] = useState<AscensaoDoReel | null>(null);
  const dias = useMemo(() => diasDeTeste(elemento, nivel, feitos), [elemento, nivel, feitos]);
  const ascender = (alvo: NivelDeAscensao) => setAscensao((atual) => ({ n: (atual?.n ?? 0) + 1, elemento: elemento ?? 'fogo', nivel: alvo }));

  return (
    <>
      <Bloco titulo="Moldura do dia" nota="O Reel de verdade, com dias inventados. Toque no cartão aberto no nível 3 para o salto.">
        <div className="lab-palco">
          <ReelMomentos dias={dias} selecionado={selecionado} aoEscolher={setSelecionado} ascensao={ascensao} />
        </div>
      </Bloco>
      <Bloco titulo="Comandos">
        <Escolha rotulo="Elemento do dia" valor={elemento} opcoes={OPCOES_OU_NENHUM} aoMudar={setElemento} />
        <Escolha rotulo="Nível da moldura" valor={nivel} opcoes={[{ valor: 1, texto: '1 · Faísca' }, { valor: 2, texto: '2 · Fluxo' }, { valor: 3, texto: '3 · Domínio' }]} aoMudar={setNivel} />
        <div className="lab-acoes">
          <Acao primaria aoClicar={() => setFeitos((n) => (n >= TOTAL_DE_CICLOS ? 0 : n + 1))}>Concluir um ciclo ({feitos}/{TOTAL_DE_CICLOS})</Acao>
          <Acao aoClicar={() => setFeitos(TOTAL_DE_CICLOS)}>Completar o dia</Acao>
          <Acao aoClicar={() => setFeitos(0)}>Zerar o dia</Acao>
        </div>
        <div className="lab-acoes">
          <Acao primaria aoClicar={() => ascender(2)}>Ascensão ao Fluxo</Acao>
          <Acao primaria aoClicar={() => ascender(3)}>Ascensão ao Domínio</Acao>
        </div>
      </Bloco>
    </>
  );
}

/* ---------- Avisos: os cartões que descem do topo ---------- */
function PainelAvisos() {
  const [fila, setFila] = useState<Noticia[]>([]);
  const [elemento, setElemento] = useState<ElementoId | null>('agua');
  const [xp, setXp] = useState(25);
  const contador = useRef(0);
  const novo = useCallback((resto: Omit<Noticia, 'id' | 'elemento'>) => {
    contador.current += 1;
    setFila((atual) => empilhar(atual, [{ id: `lab-${contador.current}`, elemento, ...resto }]));
  }, [elemento]);
  const fechar = useCallback((id: string) => setFila((atual) => remover(atual, id)), []);

  return (
    <>
      <Bloco titulo="Avisos de XP" nota="Até três ao mesmo tempo; o mais antigo sai primeiro. Deslize para cima para dispensar.">
        <Escolha rotulo="Elemento" valor={elemento} opcoes={OPCOES_OU_NENHUM} aoMudar={setElemento} />
        <Deslizante rotulo="XP do aviso" valor={xp} min={1} max={80} aoMudar={setXp} formatar={(v) => `+${v} XP`} />
        <div className="lab-acoes">
          <Acao primaria aoClicar={() => novo({ tipo: 'conclusao', nome: 'Treino concluído', xp })}>Conclusão</Acao>
          <Acao aoClicar={() => novo({ tipo: 'ascensao', nome: 'Ascensão', xp, nivel: 2 })}>Ascensão · Fluxo</Acao>
          <Acao aoClicar={() => novo({ tipo: 'ascensao', nome: 'Ascensão', xp, nivel: 3 })}>Ascensão · Domínio</Acao>
          <Acao aoClicar={() => novo({ tipo: 'resumo', nome: '5 conclusões', xp: xp * 5, quantidade: 5 })}>Resumo de 5</Acao>
        </div>
      </Bloco>
      {fila.length ? createPortal(
        <div className="noticias">
          {fila.map((noticia) => <NoticiaElemental key={noticia.id} noticia={noticia} onFechar={fechar} />)}
        </div>,
        document.body,
      ) : null}
    </>
  );
}

/* ---------- Recompensa: o recibo de XP, com e sem subida de nível ---------- */
function PainelRecompensa() {
  const [elemento, setElemento] = useState<ElementoId>('fogo');
  const [antes, setAntes] = useState(380);
  const [ganho, setGanho] = useState(60);
  const [toque, setToque] = useState(0);
  const progresso = LevelingCalculatorService.calculate(antes + ganho);
  const nivelAntes = LevelingCalculatorService.calculate(antes).level;

  return (
    <Bloco titulo="Recibo de recompensa" nota={progresso.level > nivelAntes ? `Sobe do nível ${nivelAntes} para ${progresso.level}.` : 'Sem subida de nível com estes valores.'}>
      <Escolha rotulo="Elemento" valor={elemento} opcoes={OPCOES_ELEMENTO} aoMudar={setElemento} />
      <Deslizante rotulo="XP total antes" valor={antes} min={0} max={6000} passo={10} aoMudar={setAntes} />
      <Deslizante rotulo="XP ganho" valor={ganho} min={0} max={900} passo={5} aoMudar={setGanho} formatar={(v) => `+${v}`} />
      <Acao primaria aoClicar={() => setToque((n) => n + 1)}>Reproduzir</Acao>
      <div className="lab-recibo">
        <RewardSummary key={toque} xp={ganho} elements={[{ element: elemento, amount: ganho }]} progress={progresso} fromLevel={nivelAntes} animate />
      </div>
    </Bloco>
  );
}

/* ---------- Movimento: a contagem e a conjuração ---------- */
function PainelMovimento() {
  const [valor, setValor] = useState(120);
  const [marca, setMarca] = useState(0);
  const [elemento, setElemento] = useState<ElementoId>('terra');
  return (
    <>
      <Bloco titulo="Contagem" nota="O número que conta até o novo valor em vez de trocar de uma vez.">
        <p className="lab-numero"><Contagem valor={valor} /></p>
        <div className="lab-acoes">
          <Acao primaria aoClicar={() => setValor((v) => v + 1)}>+1</Acao>
          <Acao aoClicar={() => setValor((v) => v + 10)}>+10</Acao>
          <Acao aoClicar={() => setValor((v) => v + 100)}>+100</Acao>
          <Acao aoClicar={() => setValor(0)}>Zerar</Acao>
        </div>
      </Bloco>
      <Bloco titulo="Conjurar" nota="A chegada de algo ganho: o pulo, a energia, na cor do elemento.">
        <Escolha rotulo="Elemento" valor={elemento} opcoes={OPCOES_ELEMENTO} aoMudar={setElemento} />
        <p className="lab-numero"><Conjurar marca={marca} cor={ACENTO[elemento]}><span>+{marca} XP</span></Conjurar></p>
        <Acao primaria aoClicar={() => setMarca((n) => n + 10)}>Conjurar</Acao>
      </Bloco>
    </>
  );
}

export default function Laboratorio() {
  const [painel, setPainel] = useState<Painel>('nivel');
  return (
    <AppLayout>
      <main className="lab">
        <header className="lab-cabeca">
          <small>Teste livre</small>
          <h1>Laboratório</h1>
          <p>Dispare as animações e os efeitos do app sem ganhar XP e sem mexer nos seus dados.</p>
        </header>
        <div className="lab-abas" role="tablist" aria-label="O que testar">
          {PAINEIS.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={painel === item.id} onClick={() => setPainel(item.id)}>{item.texto}</button>
          ))}
        </div>
        <div className="lab-painel" role="tabpanel" key={painel}>
          {painel === 'nivel' ? <PainelNivel /> : null}
          {painel === 'moldura' ? <PainelMoldura /> : null}
          {painel === 'avisos' ? <PainelAvisos /> : null}
          {painel === 'recompensa' ? <PainelRecompensa /> : null}
          {painel === 'movimento' ? <PainelMovimento /> : null}
        </div>
      </main>
    </AppLayout>
  );
}
