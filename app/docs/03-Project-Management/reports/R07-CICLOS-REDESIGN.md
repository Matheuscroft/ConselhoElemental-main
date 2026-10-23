# R07 — Redesign de Ciclos / 0.1.44

22/10/2026. Pedido: atenção especial à UX/UI completa de Ciclos, com melhorias implementadas. Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Alterações anteriores preservadas. Entrega local; QA visual/funcional em navegador ainda pendente.

## Diagnóstico pelo código e capturas fornecidas

A página reunia resumo de pontuação, contexto celeste, constância, biblioteca de sequências, treinos e rotina numa rolagem única. A rotina aparecia depois de vários blocos auxiliares. Havia ordenação por pendência, mas não busca por texto nem filtros por elemento/estado. Biblioteca e execução das sequências apareciam em contextos pouco distintos. Campos e vários botões dependiam de placeholder/ícone sem nome acessível; diálogos tinham identidade e hierarquia inconsistentes.

As sete capturas enviadas pelo usuário (22/10, 11:37–11:38) mostram o estado vazio em mobile: faixa de datas sem expansão, pesquisa/ordenação sem itens, evolução com quadrados grandes zerados e formulário de sequência solto na página. Elas orientaram o complemento deste mesmo lote. Não são capturas geradas pelo executor nem validação da implementação final.

Não afirmar reprodução interativa: a ferramenta recusou a tentativa de abrir `/ciclos` após o usuário informar liberação. Motivo retornado: preferência salva bloqueando `http://127.0.0.1:5173`. Nenhum contorno por browser alternativo, CDP, Playwright, outra porta ou renderização indireta.

Referências públicas consultadas: [Expanded Cards](https://www.scrolltide.co/#c-expanded-cards) para revelar o dia selecionado; [Showcase Card](https://www.scrolltide.co/#c-showcase-card) para composição de sequências, evolução e estados vazios. Adaptação ao uso por toque/teclado, sem afirmar reprodução pixel a pixel.

## Plano visual aplicado

Paleta existente: obsidiana #090c13, superfície #101620, dourado #d9b96e, texto #eeeae2 e acentos elementais. Cinzel nos títulos, Inter em conteúdo e controles. Ícone de ciclo como assinatura da página; sem novas partículas ou animações contínuas. Conteúdo alinhado à esquerda; datas e execução centralizam somente o contexto principal.

Estrutura: cabeçalho/criar → data e progresso existente → Rotina ou Sequências → evolução recolhível. A revisão do plano priorizou ações reais do dia; estatísticas e biblioteca deixam de empurrar a rotina para baixo. Não tratar a página como dashboard com métricas inventadas.

## Implementação

- **Rotina / Sequências:** dois botões de visão com `aria-pressed`/`aria-controls`, painéis `hidden`. Estado local à página; sem migração, nova rota ou persistência. A lista de treinos do dia continua integrada à Rotina. A biblioteca continua exibindo sequências pausadas; calendário/posição continuam derivados das mesmas regras.
- **Calendário Expanded:** nove cartões de datas; a seleção amplia um cartão, revela contagem real e mantém dias vizinhos operáveis sem depender de hover. Selos orbitais decorativos e arco superior seguem a identidade elemental. A rolagem horizontal centraliza o dia após expansão, sem mover a página ou roubar foco, respeitando movimento reduzido. As mesmas funções escolhem datas e avançam janelas de sete dias; rótulos das setas agora descrevem essa ação corretamente. O calendário completo fica fora da faixa rolável para permanecer acessível. Data inclui ano, nomes acessíveis nos dias e retorno explícito para hoje. Progresso descreve a data selecionada, corrigindo a ambiguidade de “hoje” em datas históricas. Valores continuam os mesmos. Ícones vetoriais substituem emojis dos atalhos Lua/Estações; helpers astronômicos antigos dessa página não foram alterados.
- **Busca real:** busca/ordenação ficam ocultas quando não existem itens na data; permanecem visíveis quando filtros reduzem uma lista existente a zero. pesquisa por nome, descrição, área e nome da sequência atual; insensível a acentos/caixa, combina termos. Elemento/estado em disclosure para reduzir carga inicial. Mostra quantidade exibida e estado vazio próprio com limpar filtros. Não procura subitens recursivamente nem pretende cobrir ciclos fora da data selecionada.
- **Ordenação:** a composição e a ordem base originais permanecem. “Pendentes primeiro” continua ordenando, distinguindo-se do novo filtro “Pendentes”. Reorganizar pela lista/menu fica disponível na visão completa em Ordem; no subconjunto filtrado a UI orienta limpar filtros, evitando mover itens cuja vizinhança não está visível. Operações de reordenação originais intactas.
- **Biblioteca:** `CycleSequenceShowcase` combina overview sempre visível (nome, ativa/pausada e ciclo da vez) com composição expansível e ações explícitas. Ordem dos membros, atual, pular/pausar/retomar/reiniciar/detalhes e encaminhamento de treinos para Fitness reutilizam dados/callbacks existentes. Busca separada por sequência/descrição/ciclo atual. Abrir a criação limpa a busca da biblioteca para não ocultar a sequência criada. A biblioteca global não é um filtro de sequências programadas apenas para aquela data.
- **Evolução Showcase:** `ScoreHierarchyPanel` recebe apresentação opt-in `showcase` em Ciclos: cartões compactos com assets locais dos quatro elementos e estado pressionado acessível; selecionar continua abrindo as áreas pelo handler original. Os demais consumidores mantêm a apresentação padrão. Contagens, barras e cálculo permanecem idênticos. Maiores sequências de constância continuam no disclosure. Contagem de ciclos cadastrados mantida no cabeçalho.
- **Cartões:** superfícies, espaçamentos, destaque de conclusão/constância e ações refinados com CSS escopado. Subitens, menus, pontuação, agregação, FitnessHabitWidget e callbacks existentes permanecem.
- **Estados vazios Showcase:** selo visual, explicação curta e ação direta, sem pesquisa/contagem redundantes. Biblioteca vazia oferece criar sequência.
- **Diálogos:** sequência nova usa diálogo com nome, tipo e dias existentes, ações ao final e retorno de foco ao botão Nova sequência. Criação, edição, detalhes da sequência, timer simples e execução avançada recebem superfície comum, rolagem limitada por viewport, descrições e IDs explícitos para nome/descrição acessíveis. Campos principais e seletores de dias recebem nomes/estado; controles com alvos maiores. Na execução, relógio total e tempo da tarefa continuam separados; mesmos handlers de pausar, voltar, concluir, finalizar e cancelar.
- **Movimento:** MotionConfig com preferência do usuário e CSS com reduced-motion. Não foi medido FPS nem verificado comportamento no dispositivo.

Arquivos: `src/pages/Ciclos.tsx`, `src/pages/ciclos.css`, `src/components/cycles/{cycle-discovery.ts,CycleFilters.tsx,CycleSequenceShowcase.tsx,ExpandedDayCard.tsx}`, `src/components/cards/ScoreHierarchyPanel.tsx` e `tests/cycles/{discovery,calendar}.test.mjs`. Entre os arquivos de código preexistentes, Ciclos.tsx e a apresentação de ScoreHierarchyPanel.tsx foram alterados nesta etapa. SequenceLibraryCard compartilhado e páginas de Fitness permanecem intactos.

## Preservação verificável

SHA-256 confirmou **64 arquivos protegidos** de stores/lib/constants/services/types/Supabase idênticos à linha de base. Comparação AST confirmou **60 funções nomeadas sem JSX** e **146 das 147 instruções não JSX originais do corpo de Ciclos** preservadas; a única substituição é o efeito de rolagem visual das datas, além do bloco de composição, conclusão e ordenação de mixedCards. No painel de pontuação, sete funções sem JSX e o bloco de estado/cálculos antes do retorno JSX são idênticos à cópia inicial. Filtros trabalham sobre a coleção já calculada; não escrevem dados nem alteram valores de progresso. Não executar recálculo, migração, reset, criação de fixtures na conta real ou reescrita de serviços.

As comparações estáticas não equivalem a testes completos de persistência, premiação, relógios ou backend remoto. Alterações em handlers visuais: filtros, alternância de painel, limpeza de busca e guardas de reorganização sobre listas filtradas. Não houve alteração de cálculos/handlers de domínio, dependências, secrets, deploy, commit ou push.

## Verificações executadas

- `npx tsc -b`: passou.
- `npx eslint src/pages/Ciclos.tsx src/components/cycles/*.tsx src/components/cycles/*.ts src/components/cards/ScoreHierarchyPanel.tsx`: zero erros, dois avisos de hooks preexistentes (`beginExecutionTaskTracking`, `finalizeExecutionCycle`), reproduzidos também por eslint stdin na cópia inicial. Sem supressão.
- `node --test tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`: **41/41** (32 anteriores + nove novos). Casos: pesquisa com acentos e termos reordenados; combinação de filtros preservando objetos/ordem; sequência sem elemento não inferido; callbacks de filtros e limpar; ordem/estado/membro atual do Showcase e ação explícita; sequência vazia sem progresso/ação fictícios. Calendário: callback e data intactos, data completa na virada de ano, hoje independente de seleção, contagem exclusiva do dia expandido e estados vazio/concluído sem valores inventados. SSR/unidade/numéricos, sem browser. Uma asserção inicial de teste esperava keys sem o prefixo de React.Children; corrigida para conferir conteúdo/ordem renderizados, sem mudança de produto para satisfazê-la.
- Build Vite via API com `envDir:false`: passou em 9,89 s na verificação final. Avisos de Browserslist desatualizado e chunks grandes permanecem; sem benchmark.
- `git diff --check`: passou. Versões de package/package-lock permanecem 0.1.44, sem novas dependências.
- Preservação por hashes/AST executada conforme acima. Evidências temporárias: `/tmp/r044-{tests,tsc,lint,lint-before,build}.log`, `/tmp/r044-preserve.cjs` e cópia inicial `/tmp/r044-Ciclos.tsx`; podem não existir em outra sessão.

## Aceite e próxima verificação

Implementação local pronta para revisão. **Não executados:** captura própria da versão final, matriz 360/390/768/1440, hitboxes, toque/teclado real, criação/edição/exclusão no app, busca com dados reais, recorrência atravessando datas, drag/drop, pausar/retomar/reabrir/reload e conclusão/reversão de ciclos e Fitness. Nenhum aceite visual novo foi presumido. Usuário tinha aprovado Lua e direção geral, não esta renderização.

Próximo: quando a ferramenta permitir localhost, usar perfil isolado e dados temporários criados pela UI; validar uma rotina simples, ciclo com filhos, sequência geral e sequência Fitness, com filtros vazios/ativos, nomes longos, dia sem itens e troca de data. Conferir diálogos/menus, teclado, safe area e fluxo de execução, preservando regras antes de novas alterações. Registrar diferenças reproduzidas, não reescrever domínio a partir de hipótese.

Reservas encerradas após fechamento. Revisão documental pelo coordenador; revisão independente pendente. Escopo geral de repaginação continua, mas Ciclos é a prioridade de QA atual.
