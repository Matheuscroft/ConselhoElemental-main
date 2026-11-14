# Conceito FE-W2

09/11/2026. **Proposta do líder de design (Opus 5.5), ainda não aprovada por Fábio.** Só leitura e texto: nenhum código foi escrito. Nada foi implementado, commitado ou publicado. Pedido de origem: entrada FE-W2 de [FILA-ENTREGAS.md](../FILA-ENTREGAS.md). Levantamento de código e material externo que serviu de insumo: feito em leitura pelo orquestrador (relatório na pasta temporária da sessão).

## Limites do que está abaixo

- **O efeito "Element Cards" de referência não foi encontrado.** O thread do X foi lido por espelho (fxtwitter/vxtwitter) e o README e a SKILL do reanimate por `raw.githubusercontent.com`, mas "Element Cards" aparece zero vezes nos três textos, e a imagem anexa ao tweet não foi lida. O item A propõe a partir do pedido de Fábio e do que o código já tem, não da referência.
- **As três gravações de tela de Fábio não foram abertas** (`Operation not permitted` em `TemporaryItems`). Nada aqui afirma o que elas mostram. O líder de design listou o que precisa ver delas (ao fim do documento).
- Nada foi visto em WebKit nem em aparelho real. O item D é análise matemática do shader, não vista na tela.

## O que o material externo ensinou (reanimate)

A técnica é filmar o original, reconstruir na stack do projeto, filmar a cópia com a mesma captura e comparar até os números baterem: `inspect.json` (durações, delays, easings, keyframes declarados), `track.json` (posição, opacidade e transform por frame), folhas de comparação de frames; para WebGL, relógio virtual e extração dos shaders e uniforms reais; uma linha de spec de movimento por elemento e propriedade; `compare.ts` (pixelmatch), `easing.ts`, de 2 a 5 rodadas; tolerância padrão ±80 ms e ≤2% de diferença de pixels no nível pixel-faithful. Não foram lidos os `references/*.md` do reanimate.

---

## Briefing do líder de design (Opus 5.5), sem edição

### A) Pilares / Element Cards

**1 Conceito.** Os quatro elementos viram quatro arcanos: cartões altos com a arte do elemento grande e o nome em Cinzel no pé. A grade nunca se rearranja. Tocar acende um arcano (a matéria ganha vida), e a leitura dele aparece embaixo da grade. **Coisa memorável:** o arcano aceso por dentro. Diagnóstico estático, não confirmado em vídeo: hoje um toque dispara quatro mudanças ao mesmo tempo, e duas delas são saltos que não animam (`grid-column: 1 / -1` e a troca do gatilho para três colunas). Provavelmente é esse o "não ficou como desejado".

**2 Layouts**
```
A1 (recomendado)      A2 baralho horizontal     A3 faixas
[arc][arc]            < [ ][ARC][ ] >           [=Terra=====]
[arc][arc]                                       [=Água======] ↓ abre ali
[leitura .ds-pane]                               [=Fogo======]
```
- A1: estável, porque nada muda de lugar.
- A2: repetiria a linguagem do Reel de Ciclos.
- A3: seguro, mas pouco memorável.

**3 Desempenho e movimento.** Vidro: zero declarações novas. Na tela ficam 2 camadas (cabeçalho e navegação); os cartões usam `--ds-surface-raised` com `--ds-edge`.
- Toque: `press`.
- Acender e apagar: `feedback`, só em cor, borda e opacidade (sai o `scale: 0.985`).
- Painel: `reveal`, e é a única animação por toque. Os quatro `RevealPanel` ficam empilhados na mesma célula (`grid-area: 1 / 1`), para que trocar de elemento não empurre a página duas vezes.
- Canvas: um só, do arcano aceso, a 112px. Acrescentar pausa fora da tela (IntersectionObserver).
- Não animam: o tamanho da arte, a grade, a entrada da página.

Custo igual ao de hoje. Risco: o `-webkit-box-reflect` no iOS.

**4 Remover.** O salto de coluna, a troca de layout do gatilho e o crescimento de 76 para 92px.

**5 Contratos e testes.**
- `tests/elemental/presentation.test.mjs`: 4 `aria-controls="expanded-…"`, nenhum aberto, 4 `inert`, `href=/santuario/elementos/{id}`.
- `tests/elemental/icon-navigation.test.mjs`: duas instâncias, 8 painéis, ids únicos.
- `material-effects.test.mjs`, que não deixa tocar em `material-effects.ts`.
- `tests/motion/*` e `tests/design/*`.
- Manter o export `ExpandedElements`, a prop `elements` e os ids `expanded-${instance}-${id}`.

**6 Passos (Sonnet, um escritor).**
1. `ExpandedElements.tsx` e `element-cards.css`: grade 2×2 com cartões 3:4 (1×4 a partir de 768px), painéis fora dos cartões, numa célula só, em `.ds-pane`. Nome em Cinzel `--ds-text-lead`, rótulo `--ds-text-micro`, texto do painel `--ds-text-small`. Cor `var(--element-*)`.
2. `Pilares.tsx` e `pilares.css`: tirar a frase redundante "Abra um cartão…".
3. `tsc` e `eslint` nos próprios arquivos.

**7 Decisões de Fábio.**
- Mostrar a referência de "Element Cards". Recomendo A1 até ela aparecer.
- Usar o reanimate (Chromium e ffmpeg, cerca de 250 MB, skill global). Recomendo só se a referência for complexa, em fidelidade *mixed*: copiar sequência e família de easing, com as durações arredondadas para as cinco batidas.

---

### B) Ciclos / Reel Slider, e remoção do Flow Tunnel

**1 Conceito.** O Reel passa a ser o próprio calendário: o dia de frente é o dia selecionado, e a rotina embaixo é a dele. Cada cartão mostra dia da semana, número, mês, "Hoje" e quantos ciclos foram feitos de quantos. Se o dia tiver Momento, a foto vira a face do cartão. Saem a alternância Calendário/Momentos/Túnel e o trilho antigo. **Coisa memorável:** girar o dia com o dedo.

**2 Layouts**
```
B1 (recomendado)          B2                       B3 vertical, tipo story
[‹ nav ›]                 [Calend.|Momentos]       [ dia em tela cheia ]
 [ ][ DIA 3/5 ][ ]        trilho antigo OU reel
[barra de progresso]
[rotina do dia]
```
B2 duplica o mesmo controle. B3 depende das gravações.

**3 Desempenho e movimento.** Vidro: zero declarações novas; 2 camadas na tela.
- A rolagem é manipulação direta, sem batida. O rAF só roda enquanto o trilho rola, como já é hoje.
- **Tirar o `filter: blur()` aplicado a cada quadro** nos cartões laterais. É o mais caro no iOS. Tirar no componente, sem mexer em `reel.ts`.
- Trocar de dia anima só a barra existente (`settle`).
- Com movimento reduzido o trilho fica plano, como já é.

Risco sem aparelho: o snap sobre `preserve-3d` no WebKit. Também a lista da rotina (`AnimatePresence`) entrar e sair a cada dia numa rolagem rápida; quem passar pelo dia sem parar não dispara nada, porque a seleção só acontece quando a rolagem assenta (120ms).

**4 Remover o túnel.**
- Apagar `src/components/momentos/TunelMomentos.tsx`, `tunel-momentos.css`, `src/lib/momentos/tunel.ts` e `tests/momentos/tunel.test.mjs`. Apagar o teste fica com o orquestrador.
- Em `Ciclos.tsx`: o import da linha 4, o `'tunel'` da linha 129, o botão da 1675 e o ternário de 1697-1699.
- Na documentação: `docs/plans/MOMENTOS-E-REEL.md`, linhas 66-93.

**5 Contratos (AST).** Preservar:
- o texto e a ordem de `  const destinyHabitId =` até `  const dayShortcuts =` (`date-navigation.test.mjs`);
- `  const selectCalendarDate =` até `  // Navigate days`, sem mudanças;
- a declaração `selectRelativeVisibleDay` (`calendar.test.mjs`);
- `handleSaveEdit` (`agenda.test.mjs`).

`ExpandedDayCard.tsx` continua (o teste o importa), sem uso. Também valem `reel.test.mjs` e `momento.test.mjs`.

**6 Passos.**
- **B0**, em commit à parte: a remoção do túnel. Arquivos: `Ciclos.tsx` e os apagados.
- **B1**: `ReelMomentos.tsx`, `reel-momentos.css` e o novo `src/components/momentos/AcoesMomento.tsx`.
  - Cartões viram `<button>` com `aria-pressed`, `aria-current="date"` e um rótulo com a data completa e os ciclos.
  - Largura de 148px (180px a partir de 768px). Número em Cinzel `--ds-text-display`, o resto em `--ds-text-micro`. A foto entra com uma película escura para o texto continuar legível.
  - Props novas: `selecionado` e `aoEscolher`. O componente centraliza o dia selecionado sozinho.
  - **A rolagem só seleciona depois de um gesto da pessoa** (pointerdown, wheel ou keydown); rolagem programática nunca seleciona.
  - Ações de foto só abaixo do cartão ativo, extraídas para `AcoesMomento`.
- **B2**: `Ciclos.tsx`. Tirar `vistaDosDias` e o trilho. `aoEscolher = i => selectRelativeVisibleDay(dayShortcuts[i])`. Feitos e total por dia vêm de `getHabitsForDate(date)` e `completions`, num `useMemo`, só leitura. Tirar o efeito das linhas 289-299 e as duas refs.

**7 Decisões.**
- Horizontal ou vertical: recomendo horizontal.
- Rolar seleciona o dia: recomendo sim.
- Janela de 9 dias: manter.
- O cartão mostra só ciclos, sem o agregado do Temporal: recomendo só ciclos.

---

### C) Momentos no calendário e no Reel

**1 Conceito.** O dia tem um rosto: a mesma foto aparece no cartão do Reel (item B) e no topo do `DayDetailsDialog`. Sobre a fragilidade no Safari, o conceito é honesto sem criar persistência nova: uma linha `--ds-text-micro` diz "Fica só neste aparelho." Nada entra em backup nem em store.

**2 Layouts**
```
C1 (recomendado)       C2                      C3
[foto 16:9, máx 200]   [56px] Título           C1 + marca na grade do mês
Título do dia          leitura
leitura · agenda
```
C2 é discreto demais. C3 mexe nas páginas do Temporal.

**3 Desempenho e movimento.** O diálogo já é `ds-glass-float`; com ele aberto ficam 3 camadas na tela e nenhuma declaração nova. A foto surge em `feedback` (opacidade), e é o único movimento. Uma leitura no IndexedDB; a URL é revogada ao fechar. Guardar uma foto não usa `conjure`, porque não é coisa conquistada.

**4 Remover.** Nada.

**5 Testes.** `tests/temporal/agenda.test.mjs:175` renderiza o diálogo fechado por SSR. Por isso nada de IndexedDB no render: só em `useEffect`, depois de `momentosDisponiveis()`. Os testes de `agenda` sobre as quatro páginas: não tocar nas páginas. `momento.test.mjs`. A chave `chaveDoDia` é local, a mesma do Temporal.

**6 Passos** (depois de B1).
1. Novo `src/components/momentos/MomentoDoDia.tsx` e `momento-do-dia.css`, reaproveitando `AcoesMomento`. Bloco oculto se o navegador não guarda fotos.
2. `DayDetailsDialog.tsx`: só o import e uma linha entre o cabeçalho e a leitura.

**7 Decisões.**
- Bloquear foto em dia futuro, no Reel e no diálogo: recomendo sim. Hoje o Reel aceita.
- Marca de foto na grade do mês: recomendo depois.
- A perda no Safari (`storage.persist` ou backup): item à parte, com Matheus.

---

### D) Ganho da aura

**1 Conceito.** Correção sem ousadia: a mesma cor, forma e modalidade, com gradação de volta. Análise matemática, não vista na tela.
- **Platô:** no anel, `0.30 + 1.45 × tongues` chega a 1,75 e, com o bloom, a cerca de 1,95. O clamp a 1 achata toda a faixa em que `tongues ≥ 0,48`.
- **Borda reta:** a borda do canvas fica em `d = 2/uScale`. A partir do nível 2 (escala 1,13), o anel e o bloom ainda não zeraram ali; no nível 50 (`d = 1,14`) o corte é total.
- **Topo:** `climb` só cai a 0,58 no alto.

**2 Curvas comparadas**
```
D1 (recomendada)  a = 0.9·(1 − exp(−1.2·campo·breath))
D2  Reinhard      a = campo / (1 + campo)   (escurece as partes fracas e muda a cara da aura)
D3  só baixar 1.45 (o platô volta com o breath e o bloom)
```
D1 tem inclinação de cerca de 1,08 perto de zero, então as partes fracas ficam iguais (bloom 0,26 vai a 0,24). Valores: sem língua 0,27; língua média 0,63; língua cheia 0,79; pico 0,81.

Mais duas mudanças:
- uma janela de borda, `(1 − smoothstep(.78, 1, |uv − .5|·2))` em x e em y;
- `climb = mix(1.0, 0.32, smoothstep(0.40, 0.92, vUv.y))`.

**3 Desempenho.** Um `exp` e dois `smoothstep` por fragmento, custo desprezível. Nada de vidro. O `900ms ease` de `aura-elemental.css` vira `var(--ds-duration-settle) var(--ds-ease)`. A verificar: o `AdditiveBlending` do three pode multiplicar o alfa outra vez (efeito próximo de a²).

**5 Testes.** Nenhum cita a aura; a validação é visual.

**6 Passos.**
- **D1**: `AuraElemental.tsx`, só o `FRAGMENT`. Sonda temporária, só em dev (`?aura-escala=&aura-cor=&aura-modo=`), apagada antes do commit e conferida por `grep`.
- **D2**: `aura-elemental.css`.
- **Validação** com Playwright a 390 e 768px, antes e depois: 4 cores de signo × 3 modalidades × escalas 1, 1,35 e 1,75, mais movimento reduzido. Critério numérico: nenhuma sequência de mais de cerca de 6px no valor máximo, numa linha na altura dos ombros e noutra acima da cabeça; os últimos 4px do canvas no tom do fundo. Depois, o iPhone de Fábio.

**7 Decisões.**
- Pico 0,9 ou 0,8: recomendo 0,9, com uma rodada de ajuste a olho.
- Textura de luminância dentro do mesmo tom: recomendo não fazer agora.
- Canvas que cresce com o nível: recomendo a janela, que não custa nada.

---

### Ordem e conflitos

Ordem: **D**, depois **B0**, **B1**, **B2** e **C**. **A** pode correr em paralelo assim que Fábio decidir a referência, porque os arquivos não se cruzam.

Nenhum item toca `ElementalPreview.tsx` nem `elemental-preview.css` (o WIP do Santuário); por isso a sonda do item D fica em `AuraElemental.tsx`. C depende de `AcoesMomento`, criado em B1. `Ciclos.tsx` tem um escritor só, B0 e B2 em série. Os documentos ficam com o orquestrador.

O que o líder de design tiraria do pedido:
- a vista "Momentos" separada, que vira parte do Reel;
- a marca de foto na grade do mês;
- instalar o reanimate antes de existir a referência;
- reservar espaço para o substituto do túnel.

### O que o líder de design precisa ver nas gravações

- que tela e em que trecho a coisa "não ficou como desejado";
- se aparece uma referência de Reel de outro app, e qual é o gesto: horizontal ou vertical, com snap, tamanho do cartão e o que cada cartão mostra;
- se aparece o Element Cards de referência;
- aparelho e navegador (iPhone com Safari ou PWA);
- o nível do perfil quando a aura foi gravada;
- se o movimento reduzido estava ligado.
