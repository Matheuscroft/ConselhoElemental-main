# Briefing: refino visual da rotina em Ciclos (14/11/2026)

Líder de design (Opus) + decisões de Fábio. Função NÃO muda: só visual e UX. A parte de cima (Reel com a moldura viva) fica como está.

## Decisões de Fábio
1. Progresso: **só a trilha de selos**. Sai a barra "Ciclos concluídos nesta data" do painel do Reel e a barra `.cycle-day-progress` da lista.
2. Concluídos: **grupo "Selados (n)" no fim da lista**, recolhido por padrão. Só muda a exibição: a ordem salva do usuário não muda. Reordenar por arrastar continua valendo entre os pendentes; os cartões dentro de "Selados" não são arrastáveis.
3. "Adicionar contador": **linha discreta no próprio cartão** (marcação intacta, só CSS).

## Diagnóstico
- A cor do cartão vem de `--cycle-accent: element.color` (Ciclos.tsx ~1953 e ~2203), paleta antiga e escura: a borda de 3px some e o selo "Água"/"Terra" reprova contraste. A paleta do Reel (ACENTO/TINTA/AURA em `src/lib/design/palette.ts`) não chega ao cartão.
- Cara de gerenciador de tarefas: Tailwind genérico, checkbox quadrado com título riscado, badges `text-[10px]`.
- `.cycle-counter-enable` é um bloco largo em todo cartão; o bloco R27 de ciclos.css usa hex soltos.
- Três medidores para o mesmo progresso; guia "Ciclo, sequência ou subitem?" acima do Reel; filtros como caixas dentro de caixas; vazio em Tailwind.

## Conceito
Cada ciclo é uma **runa do dia**, um selo gravado na pedra. Pendente: a runa espera apagada no tom do elemento. Cumprido: acende e lacra em ouro. O cartão fala a gramática do Reel (triângulo alquímico do elemento, fio de luz na borda, ouro só para o conquistado), em sussurro: a moldura viva é o grito, a lista é a inscrição.

## Anatomia do cartão (`.cycle-routine-card` com `.ds-pane`; handlers, `role`, `aria-*`, `draggable` intactos)
- Linha 1: selo (alvo 44px, disco visível 26px), título Inter 500 `--ds-text-body`, chevron de subitens e menu ⋮ (44px cada).
- Linha 2 (metadados, `--ds-text-micro`, muted, separados por ícones e gap 12px): triângulo 10px + nome do elemento na cor de acento; "+10 Área" (ou só "+10" se Sem Categoria); relógio + "30min"; "Em sequência" (ícone `ciclo`, ouro); "3 de 5 etapas" (`completedCount`/`actionableCount`).
- Linha 3 (pé): "Adicionar contador" fantasma à esquerda; "Iniciar" à direita, contornado no acento. Raios: cartão 16px, botões 12px, nada de pílula.
- Pendente: véu de TINTA do elemento (radial do canto superior esquerdo, some a 60%); sai a borda esquerda de 3px; selo = anel 1,5px no acento a 70% com triângulo vazado a 50%.
- Concluído: véu em ouro a 8%, borda `--ds-edge-lit`; selo cheio no acento com Check 16px na cor canvas; título em muted SEM risco (o estado é a forma do selo); fio de borda cai de .55 para .3.
- Em andamento (`activeHabit === habit.id`): duas cantoneiras de 10px no acento (superior esquerdo e inferior direito, como no Reel); aura do selo respirando em AURA a 25%, `calc(var(--ds-duration-conjure) * 3)`; movimento reduzido: `animation: none`, aura estática a 20%.
- Contador configurado: `.cycle-daily-counter` vira medidor afundado (`--ds-surface-sunken`, sem borda, raio 12px), trilha no acento, número em `--ds-text-title` (troca o 1.6rem literal; o teto de fontes pode cair para 10). "Somar ao dia" contornado no acento.
- Subitens: fio `.cycle-child-tree` passa de ouro .24 para o acento a .3; checkbox do filho = mini-selo 20px no alvo de 44px; sem animação por elemento.
- Arrastando: sai o Tailwind de ~2218 e ~1923, entra `data-drag-over="true"` com linha de inserção dourada de 2px no topo; o cartão inteiro não pinta.
- Assinatura de borda por elemento (`::after`, pointer-events none, opacidade .55, só CSS): fogo = fio 1px no topo (transparente, acento, núcleo `--cyc-nucleo`, acento, transparente); água = faixa 6px na base com `mask-image` de onda SVG data-URI (com `-webkit-`); ar = dois arcos finos no canto superior direito (um radial-gradient de anéis); terra = faceta triangular de 14px no canto superior direito e veio de 1px na base (acento, `--cyc-magma`, acento).
- Ao marcar: o `::before` do selo anima uma vez com `[data-selando]`, `--ds-duration-settle`, só transform e opacity. Fogo = ignição (núcleo branco-quente de 0,4 a 1,6 e some); água = dois anéis com 80ms de defasagem (`--ds-stagger`); ar = selo gira de -90° a 0° e um arco cônico varre o anel; terra = selo cai de 1,15 a 1 com `--ds-ease-conjure` e um brilho de faceta passa a 135°. O cartão não pisca nem salta. O aviso flutuante e o som continuam como estão.

## Blocos auxiliares
- "Adicionar contador": SÓ CSS, marcação intacta: linha fantasma de 44px, ícone + e rótulo em muted `--ds-text-small`, sem borda; o `<small>` da descrição fica sr-only (precisa continuar no HTML: teste exige o texto); chevron oculto; formulário aberto = painel afundado de largura total abaixo do pé.
- Guia "Ciclo, sequência ou subitem?": desce para o rodapé, junto de "Sua evolução", mesmo estilo de `details` em Cinzel.
- CycleXpRecovery: trocar hex por tokens.
- Cartão de sequência sem ciclo atual: mesmo cartão, selo muted, "Sem ciclo atual" em micro.

## Página abaixo do Reel
- Ordem: Reel (intocado) → XpRecovery (se houver) → seletor Rotina/Sequências → Treinos do dia → cabeçalho da rotina → cartões (gap 10px) → **Selados (n) recolhido** → Biblioteca → Sua evolução → Guia.
- Ritmo: 32px entre seções, 16px entre cabeçalho de seção e conteúdo.
- Seletor Rotina/Sequências: duas abas de texto em Cinzel `--ds-text-body`, sem caixa; ativa em ouro com sublinhado 2px; contagem em micro.
- Cabeçalho da rotina: "Ciclos de hoje" em Cinzel `--ds-text-title`, fração "3/7" em Cinzel ouro à direita; o `<p>` "x de y" vira sr-only; "Planejar esta semana" vira link terciário micro, ouro a 80%, abaixo do título.
- **Trilha de selos** (substitui `.cycle-day-progress`): um triângulo de 10px por cartão visível, na ordem da lista e na cor do acento; vazado = pendente, cheio = feito; gap 6px; aria-hidden; o progressbar vira sr-only. Acima de 14 itens volta a um fio de 2px.
- Filtros: Todos/Pendentes/Feitos viram abas com sublinhado, sem fundo; busca e filtro numa linha de 48px, afundada, borda muted a .18; botões de elemento no filtro ganham borda no acento do elemento quando ativos.
- Vazio: quatro triângulos alquímicos em losango, muted, título em Cinzel `--ds-text-lead` e um botão; o mesmo desenho, menor, para filtro sem resultado.

## Tokens (só no escopo `.cycles-workspace`)
- Por cartão, inline vindo de palette.ts: `--cyc-acento: ACENTO[el]`, `--cyc-tinta: TINTA[el]`, `--cyc-aura: AURA[el]`; `--cycle-accent` vira alias de `--cyc-acento`.
- Atributos: `data-element="fogo|agua|ar|terra"`, `data-selando` (transitório, limpo por timeout de `DURATION.settle`, não por animationend), `data-em-andamento`, `data-drag-over`.
- Locais no CSS: `--cyc-nucleo: rgb(255 246 232)`, `--cyc-magma: #ff8a4d` (comentar "= AURA.fogo"), `--cyc-radius: 16px`, `--cyc-gap: 10px`.
- Movimento só por `--ds-duration-*`, `--ds-ease*`, `--ds-stagger`. Tipografia: Cinzel em títulos de seção, fração e vazio; Inter no resto; `font-size: var(--ds-text-*)`, nenhum `font:` com px.
- **Zero `backdrop-filter` novo** (teto 15 fica onde está).

## Divisão de arquivos
- A (CSS): `src/pages/ciclos.css`. Reescreve R26-B, R26-C e R27, tokens no lugar dos hex, todos os estados acima, movimento.
- C (componentes): `src/components/cycles/`. Novo `CycleSigil.tsx` (SVG decorativo, props `element` e `size: 'card' | 'child' | 'trail'`; copiar os pontos de `TRIANGULO` de `components/momentos/RunasMoldura.tsx` sem editar esse arquivo); `CycleRoutineToolbar.tsx`: trilha de selos e reposição do link, com prop nova de lista `{ element, done }`. NÃO tocar a marcação de `CycleDailyCounter.tsx`.
- B (marcação): `src/pages/Ciclos.tsx`, um agente só, DEPOIS de C: atributos e variáveis do cartão e da sequência, `data-selando` nos handlers de clique (sem tocar `handleQuick*`), linha de metadados, abas, EmptyState, guia para o rodapé, grupo "Selados", remoção das duas barras de progresso.

## Testes que não podem quebrar
- `tests/cycles/counter-focus.test.mjs`: `className === 'cycle-counter-enable'` exato.
- `tests/cycles/daily-tracking.test.mjs`: no HTML "Adicionar contador", "Some repetições ou quantidades desta atividade" e `aria-expanded="false"`.
- `calendar.test` e `date-navigation.test` recortam Ciclos.tsx por `selectRelativeVisibleDay`, `  const selectCalendarDate =`, `  // Navigate days`, `  const destinyHabitId =` e `  const dayShortcuts =`: não renomear nem mover essas âncoras.
- `tests/momentos/ascensao.test.mjs`: `ascensao={ascensaoDoReel}` presente e nenhum `<CycleCompletionFeedback`.
- Guardas de `tests/design/` e `tests/motion/`.
- Riscos funcionais: `data-selando` não pode bloquear desmarcar; arrastar depende de `dragOverMixedCard` e `canReorderVisibleCards`; `role="checkbox"` e o aria-label do selo não mudam.

## QA a 390 e 768px
Quatro elementos, pendente e concluído; contador nos três estados; subitens em três níveis; sequência com e sem ciclo atual; filtro vazio e data vazia; movimento reduzido; foco por teclado; arrastar no Chrome desktop; zero estouro horizontal.
