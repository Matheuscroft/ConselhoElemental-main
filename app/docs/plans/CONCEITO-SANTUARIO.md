# Conceito do Santuário

09/11/2026. Aprovado por Fábio **com ajustes**. A direção veio do líder de design (Opus 5.5), que só leu e devolveu um briefing; o briefing completo está no apêndice, e esta parte, no topo, **vale sobre ele** onde houver conflito.

## A ideia

O Santuário deixa de ser um painel com um personagem embaixo e vira um palco: a pessoa de pé num estrado, com a aura do signo dela, e as quatro pedras elementais ao redor. A coisa memorável é o **XP como um anel dourado gravado no estrado, aos pés do personagem**: ganhou XP, o anel se preenche; fechou, a Cerimônia abre. O resto fica quieto e disciplinado.

## Decisões de Fábio

1. **Órbita: fica, sem controles.** As pedras continuam girando. Saem as setas, o botão de pausar e a dica. Isso **recusa** a recomendação do líder de design de remover a órbita e de fixar as pedras nas posições do Despertar, então o passo 2 do plano dele (`PalcoElemental`) **não se aplica**.
2. **Grade de 9 caminhos: removida.** Fica um link "Todos os caminhos" para `/mapa`. A aba Mais e o mapa já cobrem.
3. **Equipamentos: saem do Santuário** até existir inventário de verdade. O componente pode ficar no arquivo, sem uso na tela.
4. **Anel de XP: mantido**, junto com o HUD do topo. O HUD é o instrumento, o anel é a cena.

Adotado por omissão, a partir da recomendação do líder de design, e reversível: o estrado é o próprio anel em SVG, e a arte de um estrado ilustrado fica para depois, porque a `placa-base` já tem a figura encapuzada desenhada dentro.

**Decisão ainda pendente, e que NÃO se constrói:** o corpo como ecossistema e o registro de água. Não se deixa elemento reservado no DOM; só não se ocupa o espaço abaixo do próximo passo com outra coisa.

## O que o líder de design achou de errado, e vale corrigir

- **Os recursos aparecem duas vezes**, no HUD do topo e no bloco de identidade. Pior: são **dois `Conjurar` para o mesmo nível**, então numa subida de nível os dois selos e a Cerimônia disparam juntos, contra a regra de uma animação por ação.
- Rótulos de modelo pronto: "Seu Santuário", "Recursos do jogo" e a frase "Cada pequeno ritual…" não informam nada, e o personagem só começa em y≈360 de 920.
- **"Pausar órbita" não pausa a aura**, e na captura a Terra sai cortada pela borda esquerda.
- **A aura aparece como uma mancha menta chapada com borda dura.** Hipótese dele, **não confirmada**: o canvas com `inset: -50%` dentro de `.ep-orbit { overflow: clip }`. O implementador deve investigar e confirmar antes de mexer.
- O cabeçalho desfoca atrás de um fundo 95% opaco: custa e não aparece.

## Plano revisado, para um implementador Sonnet

Uma pessoa só escreve em `ElementalPreview.tsx` e `elemental-preview.css`, então os passos 1 a 5 são **em série**, por um único implementador. Arquivos permitidos: `src/pages/ElementalPreview.tsx`, `src/pages/elemental-preview.css` e, novos, `src/components/sanctuary/AnelXp.tsx` e `anel-xp.css`. Não tocar em `src/components/layout/*` (o HUD e a navegação inferior são do orquestrador), em stores, em tipos nem em `elemental-preview.css` além das classes do Santuário: o arquivo também estiliza `/santuario/elementos/:id`.

0. **Orquestrador, commit à parte: o guarda de vidro.** Hoje `tests/design/superficie.test.mjs` só lê `.css` e conta 11, mas há mais 4 `backdrop-blur` em classes do Tailwind dentro de `.tsx` (`MobileBottomNav`, `Auth`, os dois `VideoExercisePlayer`), e o total real é 15. O guarda passa a ler `.tsx` também, e o teto vai para **15 como retrato da realidade, não como meta**, com um comentário nomeando os quatro e dizendo que devem cair. Provar que ele falha ao acrescentar uma classe `backdrop-blur` num `.tsx`.
1. **Duplicatas e rótulos.** Remover do bloco de identidade o selo, a barra de XP, HP/Stamina/Prana, o `Conjurar` local, "Seu Santuário", "Recursos do jogo" e a frase de abertura. O HUD do topo é a única fonte. A lógica `nivelVisto` → `setPremio` fica **intacta**.
2. **Órbita sem controles.** Remover o bloco `ep-ring-controls` (setas e pausar), `ep-orbit-hint` e `ep-orbit-actions` com o `EquipmentSheet`, e o estado ou a função que ficarem sem uso (o lint tem de passar). Manter o laço, os canvas, a pausa por hover e foco, a pausa fora da tela, o movimento reduzido, `aria-label="Escolha um elemento"`, a ordem `ORDER` e os ids `ep-entry-${id}` (é por eles que o foco volta com "Voltar ao Santuário"). Investigar e corrigir o corte da Terra e a mancha da aura.
3. **Anel de XP em SVG** (`AnelXp`), elipse com cerca de 92% da largura e 16% da altura na base do palco, `aria-hidden` (o HUD já é a barra de progresso), atrás das pedras que passam. Preenchimento por `stroke-dashoffset` a partir de `progressFraction`, com transição `--ds-duration-settle`; em movimento reduzido o token já colapsa. **Não** acrescentar outro `Conjurar`. Para ver o anel preenchido o perfil de teste está em XP 0, então usar uma sonda temporária e removê-la antes de commitar.
4. **Abaixo do palco.** Próximo passo em `.ds-pane`, depois `QuestNextSteps` e Ciclos como estão. Remover `PATHS` e a grade; deixar um link "Todos os caminhos" para `/mapa`. Tirar o uso de `EquipmentSheet`.
5. **Cabeçalho.** `.ep-header` com `background: var(--ds-surface-float)` e `blur(var(--ds-blur-soft))`, de modo que o desfoque apareça e custe menos (8px no lugar de 12px). `180ms` e `155ms` escritos à mão viram `var(--ds-duration-feedback)`.
6. **Verificação.** `npx tsc --noEmit -p tsconfig.app.json` e `npx eslint` nos arquivos próprios. O QA confere 390 e 768px, estouro horizontal, a órbita sem corte, a aura, e movimento reduzido.

## Testes e contratos

Nenhum teste existente cita os controles da órbita, a dica, os equipamentos nem a grade de caminhos; confirmado por `grep` antes de escrever isto. Continuam valendo: `tests/elemental/navigation.test.mjs`, `discovery-scroll.test.mjs`, `sanctuary-timer.test.mjs`, `material-effects.test.mjs`, `presentation.test.mjs`, `creation-feedback.test.mjs`, `topbar.test.mjs`, os de `tests/motion/` e `tests/design/`. Não tocar em `navigation.ts` nem em `sanctuary-timer.ts`. Nenhum arquivo de teste deve ter diff, exceto `tests/design/superficie.test.mjs` no passo 0.

## Limites

Nada disto foi visto em WebKit nem em aparelho real. A aura cresce até 1,75× no nível 50 e pode cortar na borda da tela. O QA só vê o perfil vazio. O personagem em si, o corpo genérico, **não é tratado por este conceito**, e provavelmente é o maior ganho de acabamento que falta; depende de arte nova.

---

## Apêndice: briefing original do líder de design (Opus 5.5)

> Reproduzido sem edição. Onde conflitar com o texto acima, vale o texto acima. Em particular, as seções 3, 5 e 7 assumem pedras fixas e a remoção da órbita.

**Briefing: Santuário (`/santuario`). Só leitura, nenhum arquivo alterado.**

**1. Conceito**
O Santuário deixa de ser um painel com um personagem embaixo e vira um palco. A pessoa fica de pé num estrado, com a aura do signo dela. As quatro pedras elementais ficam paradas nas mesmas posições do Despertar: Terra no alto à esquerda, Água no alto à direita, Fogo à esquerda, Ar à direita. Logo abaixo vem um único próximo passo.
**A coisa memorável:** a progressão de XP passa a ser o próprio anel dourado gravado no estrado, aos pés do personagem. Quando a pessoa ganha XP, o anel se preenche. Quando ele fecha, a Cerimônia abre.

**2. O que está errado hoje**
1. **Tudo aparece duas vezes.** Na captura, o selo "1", a barra de XP e HP/Stamina/Prana estão no HUD e de novo no bloco de identidade (`ElementalPreview.tsx:264-286`). São dois `Conjurar` para o mesmo nível: numa subida de nível, os dois selos e a Cerimônia disparam juntos. Isso fere a regra de uma animação por ação.
2. **Rótulos de modelo pronto em vez de conteúdo.** "Seu Santuário" fica como rótulo acima do título, e "Recursos do jogo" e a frase "Cada pequeno ritual…" não informam nada. O personagem só começa em y≈360 de 920.
3. **Movimento ambiente solto, e o controle dele chama mais atenção que a cena.** A órbita gira sozinha a cada 48s, com quatro canvas, Ar girando e Terra levitando (CSS:75-76), e por isso precisa de "Pausar órbita", de setas e de uma dica. "Pausar" não pausa a aura: só `reducedMotion` chega a ela (linhas 179-184). Na captura, a Terra sai cortada pela borda ("Ter").
4. **O personagem flutua no vazio.** Não há chão nem fonte de luz, ao contrário do Despertar. A aura aparece como uma mancha menta chapada com borda dura. A causa provável é o canvas com `inset:-50%` dentro de `.ep-orbit {overflow: clip}`, mas não confirmei.
5. **O vidro custa e não aparece.** O `.ep-header` desfoca atrás de um fundo `#080b12f2`, que é 95% opaco. O `MobileBottomNav` usa `backdrop-blur-xl` do Tailwind sobre `bg-void/95`, e esse desfoque escapa do guarda, que só lê `.css`. Ainda há durações escritas à mão (`180ms`, CSS:18 e 155) e tamanhos fora da escala (25px, 44px, `clamp(30px…)`).

**3. Estrutura a 390px**
```
[cabeçalho fixo, vidro 1] marca · menu · conta        REAPROVEITAR
[linha do HUD] selo · XP · ofensiva HP ST PR          REAPROVEITAR, sem mudança
[PALCO 350×420, aspect-ratio 5/6]                     NOVO (substitui ep-identity e ep-orbit)
  Terra ●            ● Água     (pedras de 72px, fixas)
         [aura + corpo]
  Fogo ●             ● Ar
   (──── anel do estrado: elipse de XP ────)
  Nome em Cinzel, --ds-fluid-display, centralizado
  "Nível N", --ds-text-small, cor apagada
[Próximo passo .ds-pane] SanctuaryRituals + "Criar ritual"   REAPROVEITAR, sobe de posição
[QuestNextSteps]                                       REAPROVEITAR
[Ciclos, linha simples]                                REAPROVEITAR
[espaço reservado para corpo e água]                   NÃO CONSTRUIR (decisão)
[um link: Todos os caminhos → /mapa]                   REAPROVEITAR
[grade com 9 caminhos]                                 REMOVER
[navegação inferior, vidro 2]                          REAPROVEITAR
```
Remover também: rótulo "Seu Santuário", frase de abertura, `ep-level`, `ep-xp`, `ep-resources`, "Recursos do jogo", os controles do anel, a dica e o `ElementDirectory` dentro do Santuário. O `ElementDirectory` continua na página de elemento não encontrado.
A 768px: uma coluna, palco com no máximo 520px, centralizado.

**4. O que reaproveitar**
- **Componentes:** `AuraElemental` (`src/components/sanctuary/`), `ElementMagic` sem o modo animado, `Cerimonia`, `Contagem` (já está no HUD) e `HudRecursos`.
- **Cor:** `ACENTO` nas pedras via `--element-accent`; `AURA` vem do signo; dourado de `--ep-gold`.
- **Superfície:** `.ds-pane` e `--ds-edge-lit` para o traçado do anel.
- **Tipo:** `--ds-fluid-display` no nome, `--ds-text-small` e `--ds-text-micro` no resto.
- **Movimento:** `.elemental-press`, `--ds-duration-settle`, `--ds-ease`.
- **Não usar no Santuário:** `ExpandedElements` e `ShowcaseCard`. Já moram em Pilares e Jornadas, e trazê-los repetiria a mesma linguagem visual.

**5. Vidro e movimento**
- **Vidro:** duas camadas, cabeçalho e navegação inferior, que não se sobrepõem. Nenhum `backdrop-filter` novo. O cabeçalho passa a `background: var(--ds-surface-float)` com `blur(var(--ds-blur-soft))`: o desfoque fica visível e mais barato (8px no lugar de 12px). Dialog aberto pode somar uma terceira camada; a Cerimônia não tem desfoque.
- **Animação por gesto:**
  - Tocar numa pedra: `press`. Foco ou hover: `feedback` (o halo da pedra acende).
  - Ganhar XP: o anel preenche em `settle`. A contagem do HUD é o mesmo evento, no mesmo tempo.
  - Subir de nível: só a Cerimônia, e é a única coisa que ultrapassa o alvo.
- **A aura** é a única exceção ambiente, porque já existe e é a identidade da pessoa. Ela pausa fora da tela e fica estática com movimento reduzido.
- **Não anima:** pedras, nome, o anel ao abrir a página e entradas de seção.

**6. Testes e contratos que o implementador não pode quebrar**
- **Testes:**
  - `tests/elemental/navigation.test.mjs`: rotas em `App.tsx`, `elementHref`, `previewRedirect`. Não mexer em `navigation.ts`.
  - `tests/elemental/discovery-scroll.test.mjs`.
  - `tests/elemental/sanctuary-timer.test.mjs`: não tocar em `sanctuary-timer.ts`.
  - `tests/elemental/material-effects.test.mjs`.
  - `tests/elemental/presentation.test.mjs`, `creation-feedback.test.mjs`, `topbar.test.mjs`: links para `/santuario`.
  - `tests/motion/*`: nenhuma duração à mão. A Cerimônia tem teto de 4s.
  - `tests/design/fundacao.test.mjs`: `TETO_TAMANHOS=11`.
  - `tests/design/superficie.test.mjs`: `TETO_VIDRO=12`. Hoje são 11 pela regex do guarda; sempre com o par `-webkit-`.
- **Contratos sem teste:**
  - As pedras precisam manter `id="ep-entry-${id}"`. É por esse id que o foco volta quando a pessoa usa "Voltar ao Santuário" (linha 370).
  - A lógica `nivelVisto` → `setPremio` fica intacta.
  - `elemental-preview.css` também estiliza `/santuario/elementos/:id`, então toda mudança precisa ficar presa às classes do Santuário.

**7. Plano para um Sonnet**
1. Remover as duplicatas e os rótulos do bloco de identidade, e o `Conjurar` local. Arquivos: `src/pages/ElementalPreview.tsx`, `src/pages/elemental-preview.css`.
2. Trocar `ElementalOrbit` por um `PalcoElemental` com posições fixas. Sem rAF, sem canvas, sem controles. A navegação mantém `aria-label="Escolha um elemento"`, a ordem `ORDER` e os ids `ep-entry-*`. O palco pode cortar o que vaza na lateral, mas com margem negativa até a borda da tela, para a aura sumir na borda da viewport e não na coluna. Arquivos: novos `src/components/sanctuary/PalcoElemental.tsx` e `palco-elemental.css`, mais `ElementalPreview.tsx`.
3. Anel em SVG (elipse com 92% de largura e 16% de altura, na base), `aria-hidden`, porque o HUD já é a barra de progresso. Preenchimento por `stroke-dashoffset` a partir de `progressFraction`, com transição `--ds-duration-settle`. Mesmos arquivos do passo 2.
4. Reordenar o conteúdo abaixo do palco, passar o próximo passo a `.ds-pane`, tirar a grade de caminhos e deixar um link só. Arquivos: `ElementalPreview.tsx`, `elemental-preview.css`.
5. Cabeçalho com `--ds-surface-float` e `--ds-blur-soft`; `180ms` → `var(--ds-duration-feedback)`. Arquivo: `elemental-preview.css`.
6. Rodar `tsc` e `eslint` nos próprios arquivos. O QA confere 390 e 768px, o estouro horizontal e o movimento reduzido.

**8. Decisões suas**
- **Equipamentos:** o diálogo admite que é só um lugar visual. Recomendo tirar do Santuário até o inventário existir.
- **Corpo como ecossistema e registro de água:** recomendo reservar só uma faixa sob o próximo passo e não construir nada até você definir.
- **Estrado ilustrado:** a `placa-base` já tem a figura encapuzada desenhada dentro, então não serve. Recomendo começar com o estrado em SVG e encomendar a arte do estrado sozinho depois.
- **XP no HUD e no anel ao mesmo tempo:** recomendo manter os dois. O HUD é o instrumento, o anel é a cena.
- **Grade de 9 caminhos:** recomendo remover, porque "Mais" e `/mapa` já cobrem.

**O que eu removeria:** a órbita inteira, com os controles e os quatro canvas.

**O que mudou na revisão contra o padrão genérico:** o primeiro rascunho abria com o nome grande, o rótulo acima e três números. Isso é o "número grande com estatísticas", e saiu. Depois, cada seção virava um cartão arredondado igual aos outros; agora só o próximo passo é `.ds-pane`. Por fim, eu mantinha a órbita mais lenta; o movimento migrou para o anel, que responde a uma ação.

**Custo e risco:** saem o rAF da órbita e quatro laços de canvas, e fica um quad WebGL. A aura cresce até 1,75× no nível 50 e pode cortar na borda da tela. Nada foi visto em WebKit nem em aparelho real.

**Para o orquestrador:** o `backdrop-blur-xl` do `MobileBottomNav` (`src/components/layout/`, arquivo seu) fica fora do `TETO_VIDRO`.
