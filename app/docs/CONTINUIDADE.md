## F59 — concluído: navegação e recuperação integrada Fitness / 0.1.31

13/10/2026. Astro Boy executou sequencialmente no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration; Astra Alto informado pelo usuário. Alterações preexistentes preservadas. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Revisão documental pelo coordenador, independente pendente. Sem commit, push, deploy ou migração remota.

### Referências e entrega

| Referência | Implementação atual e limite |
|---|---|
| 1 — modalidades | Biblioteca/editor existentes preservados. Mesmas quatro abas em Terra, Treinos e aliases. FAB oculta/restaura conforme Montar treino; modalidade preservada ao alternar abas. |
| 2 — prévia | Recuperado WorkoutPreviewHero; planos Native têm prévia com imagem disponível, programa expansível, mídia, instruções, séries, perfil muscular, edição e início/continuação. Preview legado usa a mesma capa/casca. Planejar data abre editor existente; não cria evento Core novo. |
| 3 — execução | Mídia/progresso existentes preservados. Pausa/retomada do relógio persistida na sessão; não altera XP ou tempo ativo declarado. Descrição por bloco e distância manual para corrida/natação/ciclismo recuperadas no fluxo Native. Ações cabem em uma linha e respeitam navegação/sidebar. |
| 4 — resumo | Casca/estrelas/XP histórico preservados; fallback de mídia do catálogo/Yoga recuperado; descrição/distância por bloco e ritmo de corrida informados no resumo. Vídeo tem estado de erro/repetição em vez de rejeição de play não tratada. |
| 5 — corrida | Tempo, pausa/retomada, distância manual, ritmo dos blocos com distância, conclusão parcial e resumo funcionais. GPS/mapa, batimentos e calorias não têm fonte implementada; não há medições simuladas. |
| 6 — painel | Recuperado Saúde → Hoje com anéis/mini gráficos. Usa exercícios registrados e recursos reais do jogo: Prana vem do appStore/Core, não da fórmula legada de pontuação. Anéis de sono/água não são preenchidos sem fonte. Configuração de widgets personalizados não implementada nesta etapa. |
| 7 — corpo/evolução | Manequim/avaliações existentes preservados; Corpo e Evolução navegáveis pela mesma casca. Atividade e treinos recentes passam a incluir históricos novo e legado. |
| 8 — semana | Barras/dias recuperados, navegação por semanas, retorno à atual e filtro de histórico por dia. Minutos ativos incluem estimativa de repetições; registros antigos sem observação usam relógio da sessão. Carga percebida só usa RPE registrado. |
| 9 — histórico | Histórico único preserva recibos e abre resumo. Filtro por dia conectado à semana; limpar filtro e ver todo o histórico disponíveis. Nenhuma recompensa passada recalculada. |

Fonte de leitura compartilhada `activity-history.ts`/`use-fitness-history.ts`, sem persistência paralela. Tipos recebem campos opcionais de pausa, distância e notas; validação na store existente. Dados históricos não convertidos. Rota `/fitness` continua compatível; aliases Saúde/Corpo/Histórico redirecionam para abas canônicas `/treinos`. Ações de execução preservam seleção global Mais em ambas as entradas.

### Evidências executadas

- Deno: 8/8 (recompensa/projeção existentes + histórico misto, deduplicação, séries puladas, ausência de RPE e relógio pausado). Comando usa `/tmp/f57-importmap.json` e `--unstable-sloppy-imports --no-check`; TypeScript validado separadamente no build.
- Regressão `/tmp/f57-check.mjs`: criação/início/resumo, estrelas persistidas, recibo imutável, segunda sessão/gráfico, 360/390/768 sem overflow e zero page errors.
- `/tmp/f59-check.mjs`, perfil temporário: Yoga criado pela UI → prévia/imagem → editar/cancelar → iniciar/pausar/reload/retomar → concluir/estrelas/reload → histórico → Saúde/semana/dia. Corrida com dois blocos: distância/descrição persistidas após reload, um bloco concluído, finalização parcial confirmada, resumo com distância/ritmo/notas. Aliases com quatro abas idênticas; registro corporal/reload. Telas biblioteca/saúde/semana/corpo/histórico sem overflow em 360/390/768, zero page errors. Primeiras tentativas corrigiram seletores ambíguos da automação e fixture de apenas uma série; a execução final passou.
- `/tmp/f59-layout.mjs`: FAB hide/restore, criação de exercício próprio, CTAs finalização/cancelamento em uma linha, hit test positivo, acima da navegação em 360/390/768; tablet respeita sidebar. Cancelamento/descartar confirmado. Zero page errors.
- Inspeção visual das capturas `/tmp/f59-preview-390.png`, `health-{390,768}`, `week-390`, `body-filled-390` e `active-final-{360,768}`. Demais capturas disponíveis em /tmp; não confundir ausência de overflow com inspeção visual de todas elas.
- Build final aprovado (avisos preexistentes Browserslist/chunks); lint final 0 erros/4 avisos preexistentes em Ciclos/Temporal. `git diff --check` passou e as três posições de versão conferidas em 0.1.31. Dados de teste isolados do perfil real. Reprodução de vídeo remoto válido, GPS, sensores, sync cloud e backend não testados/implementados nesta etapa. Fluxo completo de execução legada não retestado; prévia legada teve leitura estática e build.

Reserva F59 encerrada após verificações. Próximo: revisão de Fábio com seus dados reais; integrações de sensores/sono/água e widgets são funcionalidades próprias futuras, não restauração de fonte existente. Astra Alto adequado para integração; Sol 6.1 Médio para ajustes visuais pontuais. Versão 0.1.31; não declarar publicação remota.

## F58 — concluído: Corpo conforme referência Fitness / 0.1.30

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration. Astro Boy executou sequencialmente, Sol 6.1 Médio informado; sem troca automática. Skills frontend-design/imagegen e orientações já lidas de testes/React/versionamento. Alterações preexistentes preservadas. Reserva encerrada: BodySilhouette, BodyMetricsCard, Corpo/FitnessRoot (cabeçalho embutido), asset public/fitness/body/mannequin-front-v1.png, manifests e docs.

Substituído SVG simplificado por manequim 3D branco com roupa esportiva neutra e fundo transparente, gerado para o projeto; ilustrativo, não adapta anatomia às medidas da pessoa. Asset 912×1724, cerca822KiB, copiado para public (origem `.codex/generated_images/.../exec-7636ee69-a984-4fa4-b088-fb6bd8438d60.png`). Composição como referência: título compacto, figura à esquerda, métricas em grade2×2 à direita, botão de avaliação mantido. Cabeçalho Meu corpo removido somente na aba embutida para evitar duplicação; standalone mantém cabeçalho. Card compartilhado com Saúde. Medidas e campos disponíveis preservados; não inventado valor de sono. Histórico, evolução do peso e outras medidas mantidos. Nenhuma alteração de store/cálculo/persistência.

Puppeteer `/tmp/f58-check.mjs`, perfil temporário separado: estado vazio, cadastro via UI de fixture explicitamente de teste (170cm/75kg/43%/20%), reload com valores intactos, imagem carregada, ausência de cabeçalho duplicado, reabertura/cancelamento do formulário. 360/390/768px: scrollWidth=viewport, zero page errors. Capturas `/tmp/f58-empty-390.png`, `/tmp/f58-body-{360,390,768}.png`;390 inspecionada visualmente. Dados do perfil real não usados nem alterados. Não testada rota Saúde visualmente nesta etapa, embora reutilize o mesmo componente. Build final passou (avisos Browserslist/chunks), lint final passou com 0 erros/4 avisos preexistentes Ciclos/Temporal, diff-check e paridade0.1.30 passaram; revisão documental independente pendente, realizada revisão sequencial pelo coordenador. Sem commit/push/deploy/migração. Próximo: revisão de Fábio e demais telas da fila; Sol 6.1 Médio permanece adequado.

## F57 — concluído: resumo completo e equilíbrio Native / 0.1.29

Astro Boy executou no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, preservando alterações anteriores. Modelo informado: Sol 6.1 Médio, sem troca automática. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Revisão documental sequencial pelo coordenador; revisão independente pendente.

Resumo Native restaura estrelas (WorkoutRating já existente, inclusive reload), detalhes de séries concluídas/puladas, RPE observado ou fallback identificado, carga/volume kg·reps, fator, mídia/notas do snapshot, perfil muscular ponderado por tempo ativo e evolução das últimas sete sessões do mesmo template. Sem perfil, mostra ausência; sem duas sessões comparáveis, mostra ponto de partida. Avaliar não altera recompensa. Casca compartilhada tem espaçamento mais compacto. Editor permite Salvar e iniciar agora; bloqueia outro início enquanto há sessão ativa, preservando opção de salvar apenas.

Diagnóstico do exemplo: 120 min eram duração manual planejada, mas três séries contabilizavam 2 min ativos estimados. Isso não autoriza conceder XP por duas horas não registradas. Além disso, uma série de 10 reps tinha metade da base de um bloco de 40s, apesar da heurística de 4s/repetição. Core block-v2 normaliza base de repetições ×2; ER canônico inalterado. Prévia do editor/biblioteca e progressão de check-ins usam o construtor/calculador Core de blocos da conclusão. Tetos por bloco preservados: segmentações diferentes ainda podem alterar o prêmio. Novos recibos identificam v2; históricos não são recalculados. Interface distingue ativo estimado/informado/misto do relógio e do planejamento. Peso absoluto não infere RPE.

Evidências executadas: build final aprovado (avisos Browserslist/chunks); lint global final 0 erros/4 avisos preexistentes Ciclos/Temporal; Deno 5/5, incluindo equivalência reps/tempo, RPE, pulados/zero e paridade preview/check-in/conclusão sem influência do tempo manual. Comando de projeção usa import-map local `@/` e `--unstable-sloppy-imports`; fixture import-map em `/tmp/f57-importmap.json`. Puppeteer `/tmp/f57-check.mjs`, perfil temporário Chrome: criar exercício próprio de musculação com imagem, salvar/iniciar, concluir, resumo +3,3 XP v2, estrelas4/reload, recibo intacto, retorno ao histórico e repetição do plano gerando gráfico; zero page errors. 360/390/768px sem overflow. Capturas `/tmp/f57-editor-390.png` e `/tmp/f57-summary-{360,390,768}.png`; editor e resumo390 inspecionados visualmente. O teste usa mídia Yoga como fixture de carregamento, não uma imagem prescrita para musculação. Vídeo real, fluxo de hábito/rotação na UI e cloud não testados neste lote; a paridade de check-in foi testada na função de projeção.

Versões 0.1.29 nos manifests/changelog. Sem commit/push/deploy ou migração remota. Próximo: avaliação de Fábio com seu treino real; para representar uma sessão longa, cadastrar todos os exercícios/séries realizados ou blocos por tempo. Manter Sol 6.1 Médio para integração/UX; etapa Astro Boy runtime permanece na fila posterior, sem serviço implementado neste lote.

# Retomada vigente — F56 editor único e catálogo livre / 0.1.28, 13/10/2026

Astro Boy, Sol 6.1 Médio informado/recomendado. Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration; alterações locais anteriores preservadas. F55 não atualizara app-routes: menu ainda apontava para /treinos/legado. F56 corrigiu menu para /treinos e fez /treinos/legado montar FitnessRoot, preservando query strings e compatibilidade dos registros sem exibir segundo editor.

Editor único com nome/modalidade/data, exercícios e mídia primeiro; esforço/estimativa num painel expansível, mantendo recibos/regras. Data opcional é metadado do planejamento local e não cria Task/Habit/agendamento Core. Exercícios próprios são criados pelo saveCustomExercise nos dois catálogos existentes da conta com identidade correlacionada; nativeCatalog/exercisesCatalog persistentes existentes, sem novo store. Criar exercício não exige busca positiva. Nome e medida configuráveis; perfil muscular fica vazio enquanto usuário não o informa. UI permite overrides opcionais somando 100%. Corrigida a construção de resultados novos para não transformar distribuição explicitamente vazia em 100% Core; sessões históricas não foram recalculadas.

Campos opcionais imageUrl/videoUrl em catálogos/planos/resultados; snapshot/plano e execução usam mídia configurada, com fallback Yoga preservado. URLs admitidas http(s) e caminho do app; não há upload, biblioteca completa de imagens ou integração YouTube. Clonagem de planos legados preserva mídia/notas. Campo de vídeo direto vinculado ao VideoExercisePlayer existente; reprodução de arquivo real não foi testada. Esportes por tempo apresentam minutos (internamente segundos inteiros) e descanso, sem carga em kg; repetições/Yoga preservam seu contexto.

Testes atuais: /tmp/f56-check.mjs, perfil Chrome temporário 390px, comparou nome/fields do editor nas três entradas; criou movimento próprio em Musculação com busca sem resultado, salvou data/imagem, reload persistiu template/exercício, imagem local carregou na execução, conclusão abriu resumo com +1,7 XP Core, distribuição muscular permaneceu vazia. Editou vínculo de vídeo e reload preservou URL/player. Zero page errors; 390/360/768px sem overflow horizontal. Vídeo de fixture inexistente verifica apenas vínculo/elemento, sem prova de reprodução. /tmp/f55-fitness-check.mjs reexecutado: criação/edição Yoga, três séries, mídia, conclusão +11,1 XP e histórico; FAB hide/restore passou. Capturas /tmp/f56-editor-390.png e /tmp/f56-active-390.png; editor e execução inspecionados visualmente. Build final passou com avisos antigos de Browserslist/chunks; lint final passou com 0 erros e os 4 avisos anteriores. Teste de tempo em /tmp/f56-minutes.mjs confirmou 0,5min persistido como 30s e ausência de campo kg em Ciclismo. Testes Deno de recompensa: 3/3 passaram. Diff-check e paridade de versões conferidos no encerramento.

Versão sincronizada 0.1.28. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Responsável documental independente indisponível; coordenador atualiza evidências/retomada para revisão posterior. Sem commit/push/migração remota. Próximo: revisão visual do usuário, mídias reais para modalidades e teste de reprodução; depois plano de runtime Astro Boy conforme PLANO-ORQUESTRACAO. Não alterar regras de XP nesta etapa.

# Retomada vigente — F55 interface única Fitness / 0.1.27, 13/10/2026

Astro Boy coordenou/executou no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`. Modelo informado por Fábio: Sol 6.1 Médio; sem alteração autônoma do modelo. Alterações preexistentes preservadas. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Reserva: App/rotas, FitnessRoot, NativeTemplateDialog, ActiveFitnessSession, WorkoutSummary (textos de apresentação), FitnessPageShell, fila/continuidade/plano de orquestração, manifests/changelog.

F55 implementado: `/treinos` e `/fitness` montam FitnessRoot; novos planos usam NativeTemplateDialog e execução Native/Core nas duas entradas. Grid preserva ícones exatos e seis modalidades de referência, com Musculação e modalidades adicionais dos catálogos/planos existentes preservadas. Histórico/Corpo antigos são aliases da casca canônica. Planos legados permanecem na biblioteca e usam o mesmo editor via adaptação de apresentação, salvando pelo updateWorkout existente sem migrar IDs. Data, séries, notas e overrides preservados. Sessões legadas pré-existentes ainda usam sua rota de execução compatível; não foram convertidas nem mudaram de fórmula. `/treinos/legado` permanece rota de compatibilidade.

FAB observa o próprio botão Montar treino (90% visível, margem de 80px para navegação) e desaparece enquanto o CTA está utilizável; reaparece na rolagem de volta. Editor usa cabeçalho/rodapé fixos do builder compartilhado. Native tem casca mobile/tablet e navegação global, mídia Yoga real, séries concluídas compactas/reversíveis e ação Concluir treino. O teste detectou a corrida entre sessão ativa removida e Navigate ao histórico; a rota agora reconhece a sessão completa no nativeHistory e navega ao resumo, inclusive ao reabrir a URL concluída.

Evidências atuais: `/tmp/f55-fitness-check.mjs` (Chrome temporário, 390×844) confirmou mesmas entradas, FAB sumir/voltar, criação Yoga com três séries, edição de nome, execução, três conclusões, mídia real, resumo com +11,1 XP Core e retorno ao histórico canônico; scrollWidth=390 e zero page errors. `/tmp/f55-legacy-check.mjs` criou plano via UI compatível, editou no novo editor e comparou snapshot de ID e séries integralmente iguais; zero page errors. Hub em 360/768px com scrollWidth igual à viewport. Capturas `/tmp/f55-editor-390.png`, `/tmp/f55-active-390.png`, `/tmp/f55-summary-390.png`, `/tmp/f55-hub-360.png`, `/tmp/f55-hub-768.png`; editor e execução inspecionados visualmente. Testes abrangem Yoga e edição simples; demais modalidades, alteração de data/overrides e retomada de sessão legada permanecem pendentes.

Versão 0.1.27 sincronizada. Build final passou (avisos de Browserslist/chunks grandes); lint final passou com 0 erros e os 4 avisos preexistentes de Ciclos/Temporal. git diff --check e paridade dos três campos de versão passaram. Agente documental independente indisponível nesta equipe; coordenador mantém continuidade para revisão posterior. Sem commit/push/deploy ou mudança nas regras de XP.

Próximo: revisão visual de Fábio. Em seguida, planejar runtime local do Astro Boy para gerir lotes/agentes, com orçamento, registros, revisão e continuidade por Git, antes de inserir IA no aplicativo. Usar Sol 6.1 Médio para arquitetura/contratos; Luna Leve para inventário/documentação delimitados; sinalizar antes de escalar para Astra Alto em problemas arquiteturais persistentes. Ver PLANO-ORQUESTRACAO. Não foi instalado/implementado serviço de orquestração neste lote.

# Retomada vigente — F54 histórico e conclusão do Fitness / 0.1.26, 13/10/2026

## F54 concluído — histórico e conclusão unificados, 13/10/2026

Pedido: explicar e corrigir a diferença entre “Sessões registradas” (+50 XP Core) e “Treinos” (+11 XP legado), cartões com navegação desigual e ausência de uma recompensa clara no resumo legado. Implementação no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`; alterações locais anteriores preservadas.

`WorkoutHistory` agora apresenta uma lista cronológica única de sessões completas, usando os dados originais dos dois modelos. Os cartões abrem a mesma rota de resumo. O fluxo Native, ao concluir, também abre `WorkoutSummary`; o resumo legado consulta XP do ledger e o Native consulta recibo/ExecutionLog/Core, mostrando XP indisponível quando não há evidência. Não houve alteração de fórmula, migração, recálculo ou escrita em dados. Valores de 50 XP e 11 XP foram confirmados no navegador e cada registro abriu o resumo com o valor intacto. Visualização verificada em 390px: resumo legível, recompensa destacada em verde Terra e CTA acima da navegação; sem overflow horizontal.

Build passou; lint passou com 0 erros e os mesmos 4 avisos preexistentes em Ciclos/Temporal; `git diff --check` passou após a documentação. Versão sincronizada em 0.1.26. Responsável especializado por Versionamento/Documentação indisponível nesta sessão; revisão local da fila, continuidade, changelog e manifests pelo coordenador, revisão independente pendente. Sem commit, push, migração ou deploy.

Próximo: revisar o diff delimitado e guardar confirmação do responsável documental no próximo lote. Validar com perfil temporário o encerramento Native ponta a ponta; a tela de resumo Native e o resumo legado já foram abertos via cartões no navegador, mas não foi concluído um novo treino Native neste lote.

## F53 concluído — fluxo mobile de treino, 13/10/2026

Checkout principal: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, base `b1575e4`. O worktree `e2b6` informado na instrução de contexto é snapshot separado; a continuidade/fila operacional aponta o checkout principal. Há alterações locais anteriores em diversas áreas; preservá-las. Sem commit/push.

Pedido: nas rotas `/treinos` e `/treinos/ativo/:sessionId`, usuário não localiza claramente continuar/concluir. Capturas mostram CTA fixo coberto pela navegação global. Reserva F53: `src/components/fitness-kit/FitnessStickyAction.tsx`, `FitnessPageShell.tsx`, `src/pages/fitness/WorkoutSelect.tsx`, `src/pages/fitness/ActiveWorkout.tsx`, fila/continuidade, manifests e changelog. Contrato: só UI/layout e clareza de navegação; manter stores, dados, rotas, regras de XP/Prana e recibos.

F53 concluído. A barra sticky agora fica acima da navegação global (64px + safe area); FitnessPageShell reserva espaço para ambas. `/treinos` é montada por `src/pages/fitness/WorkoutSelect.tsx` (não pelo WorkoutHub), então o cartão de sessão ativa mostra “Sessão em andamento” e uma etiqueta destacada “Continuar treino”. ActiveWorkout mostra “Finalizar treino” com blocos pendentes e “Concluir treino” quando todos foram processados; a confirmação de sessão incompleta foi mantida.

Validação em perfil Puppeteer temporário, 390×844: template de Corrida criado na UI; botão “Finalizar treino” ficou totalmente acima da navegação (y 720–768, nav y 779–844), hit test central retornou “Finalizar treino”, sem overflow e sem erros de página. Confirmação de incompleto abriu e permitiu continuar; tela /treinos mostrou o rótulo “Continuar treino” e reabriu a mesma sessão. Um bloco concluído com 10 minutos e RPE 5 mudou o CTA para “Concluir treino” e levou a `/treinos/resumo/:id`. Build passou (avisos de chunk >500 kB e Browserslist desatualizado); lint passou com 0 erros e quatro avisos preexistentes em Ciclos/Temporal; `git diff --check` e revisão documental passaram. Versão sincronizada em 0.1.25. Agente especializado de Versionamento/Documentação estava indisponível na lista de equipe; Astro Boy revisou fila, continuidade, changelog e paridade dos manifests nesta rodada. Revisão independente documental fica registrada para o próximo lote. Sem mudança de fórmula, store, histórico, migração, commit, push ou deploy.

Checkout principal do Mac: /Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app. Branch codex/fitness-ui-integration, HEAD b1575e4 = origin/main; nove commits de Matheus integrados por fast-forward, sem conflito textual. A branch main local em 6dac590 e o worktree /Users/fabioandre/.codex/worktrees/e2b6/Conselheiro_Elemental_MAIN foram preservados. Nenhum commit ou push feito neste lote.

Escopo sincronizado: editor de templates, execução e recompensas Core de treino, séries/ciclos compartilhados, widgets em Ciclos, histórico, catálogo Calistenia/filtros musculares e nova ordem da navegação global. As migrações SQL de cycle_sequences.is_active e sequence_memberships.position foram apenas revisadas; não foram aplicadas ao Supabase.

Durante a integração, o build da revisão anterior d89f202 passou, mas o HEAD recebido produziu 156 erros TypeScript por incompatibilidade do novo tipo Action com as views antigas; também havia um erro de lint. Compatibilidade de tipos foi recomposta, XP elemental foi mapeado para as chaves persistidas em inglês e telas de nível passaram a consultar getLevelProgress(). Em /treinos, selectors de getters derivados causavam loop de renderização; a tela agora lê métodos do store sem selectors instáveis.

Validação atual: npm run build passou (Vite avisa chunks >500 kB e base Browserslist antiga); npm run lint passou com 0 erros/4 avisos de hooks preexistentes; deno test --no-check supabase/functions/assistant-suggest/index_test.ts passou (7/7). Smoke Puppeteer em 360/390/768px: /treinos, /fitness, /treinos/painel e /treinos/historico renderizam sem overflow horizontal nem erros de página; /santuario também abriu sem erros em 390px. A captura /tmp/conselho-sync-treinos-390.png registra Escolher treino em celular. Revisão visual detalhada e fluxos reais de ciclo/recompensa continuam pendentes.

Diagnóstico de XP da captura de 13/10: `/fitness?tab=history` mostra a sessão “Caminhada Condominio” com `+0 XP`. Inspeção estática de `finishSession` (workoutStore.ts), `completeFitnessSession` (fitness-core-adapter.ts), `projectNativeLeafReward` (native-action-completion.ts) e `NativeSessionHistory.tsx` confirma que o histórico exibe o valor do ExecutionLog; a conclusão calcula ER apenas das séries marcadas como concluídas. A regra local em `MODALIDADES-E-METRICAS-TREINO.md` declara zero recompensa para sessão Native sem blocos concluídos. A captura prova zero registrado, mas não distingue ausência de série concluída de defeito no fluxo. Nenhum dado real foi lido ou alterado e nenhuma fórmula foi mudada. F50/V02 exige agora os cenários com zero séries e com pelo menos uma concluída em perfil temporário. Se o usuário concluiu uma série nessa sessão, reproduzir antes de alterar regras.

## F52 — ajuste do botão X da ficha Fitness (concluído em 13/10/2026)

No perfil temporário, o navegador em 390×844 confirmou botão 44×44px, ícone centralizado e ação de fechar; o sheet desaparece, rota retorna a `/treinos`, sem overflow (390px) nem erros de página. `npm run build` passou (avisos de Browserslist/chunks grandes), `npx eslint src/components/workout/ExerciseDetailSheet.tsx` passou, `git diff --check` passou e os três pontos de versão conferem em 0.1.24. Sem alterações de lógica/dados. Versão de trabalho 0.1.24.

## F51 — esforço por bloco e pontuação do treino (concluído em 13/10/2026)

Autorização: Fábio aprovou implementar a recompensa proporcional por atividade/série, considerando intensidade e tempo ativo, sem recalcular histórico. Ele repetiu o fluxo e confirmou +50 XP Terra ao marcar uma série concluída; isso confirma o fluxo positivo, mas não calibra justiça entre intensidades.

Checkout `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, base `b1575e4`; 19 arquivos tinham alterações locais preexistentes no início desta etapa. Nenhum deles deve ser descartado ou atribuído ao F51. Versão de entrada 0.1.22.

Análise inicial de F51: Native usava ER consolidado e esforço global, enquanto o fluxo legado registra `activityLoad = minutos × RPE` com outra fórmula. A decisão final para esta entrega foi introduzir uma regra versionada no Core para o fluxo Native e preservar as regras/recibos anteriores; não harmonizou rotas legadas.

Implementação encerrada no checkout principal: nova regra `core-native-workout-block-v1` coleta esforço RPE 1–10 por série e pontua blocos concluídos no Core; tempo ativo e presença são aplicados uma vez, descanso fica fora e Prana é debitado uma vez por sessão com esforço ponderado. A confirmação e o histórico leem o recibo real; zero blocos gera zero XP/custo. ADR-003 descreve limites e imutabilidade.

Evidência de navegador em perfil temporário Puppeteer, viewport real 390×844 e sem overflow (390px): treino de Corrida com duas séries de 300s e RPE 2/9 foi iniciado, ambas concluídas e finalizado com +85,6 XP, 10 minutos ativos, 2 blocos e esforço ponderado 3/5; sem erros de página. Teste unitário Deno: 3/3 passou, cobrindo leve, intenso/misto, blocos pulados, nenhum bloco e RPE inválido. `npm run build` passou (avisos de chunks >500 kB e Browserslist antigo); `npm run lint` passou sem erros, com quatro avisos em Ciclos e páginas Temporal; `git diff --check` passou. Não foi aplicado schema/migração Supabase nem comprovada sincronização remota; histórico legado não foi recalculado. Limite: teto por série permite que dividir trabalho equivalente em blocos mude a soma. Reversão/retry idempotente e modalidades não-Corrida não foram incluídos no smoke.

Versão sincronizada: 0.1.23 em package.json, package-lock.json e changelog Fitness. As 19 alterações locais preexistentes e demais áreas fora da reserva F51 foram preservadas. Sem commit, push ou deploy. Próximo passo: validar outros tipos/modalidades e os fluxos de continuar, desfazer e histórico em lote próprio; sincronização remota requer decisão e evidência separadas.

Ponto de atenção de domínio: os capítulos versionados no app agora usam VALUABLE/VALUELESS/NOTE e chaves de XP como xp_terra; a fonte indicada como principal em docs-conselho-master ainda usa semântica legada (valuable/structural/text) e há nomes diferentes de XP. O código mantém os dois formatos de semântica por compatibilidade; não houve migração de dados nem mudança de fórmula. Resolver a autoridade entre esses documentos antes de novas mudanças de regra.

Organização: a pasta principal para continuar é Conselheiro_Elemental_MAIN. Developer/ConselhoElemental-main é outra cópia com Git próprio, package.json 0.0.0 e .env; foi preservada sem ler segredos ou apagar conteúdo. Não confundir com o checkout principal nem copiar .env. Versão local atual 0.1.25 em package.json, package-lock e docs/03-Project-Management/fitness/CHANGELOG.md.

Próximo passo após F53: validar modalidades além de Corrida e cobrir desfazer/idempotência em lote separado. F45–F50 ainda têm pendências de interface/fluxo listadas na fila. Persistência remota não foi confirmada nesta etapa.

## Retomada anterior — P01 / 0.1.21, 10/10/2026

## UI04 — Editor de template de treino (em revisão)

Pedido: preservar todas as telas e prosseguir com o primeiro ponto da proposta (catálogo/editor). Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; base `55d3e17 navbar`. Contratos lidos: `02-Platform-Architecture/01-Core-vs-Native-Modules.md` e `01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md`. O formulário existente agora aceita editar template planejado na rota ativa `/treinos` (`pages/fitness/WorkoutSelect.tsx`) e no Hub alternativo (`pages/WorkoutHub.tsx`), manter exercício/plano IDs, configurar cada série individualmente (repetições inteiras ou isometria inteira em segundos, carga, descanso e fator canônico), adicionar/remover séries e programar data; templates com exercício ausente no catálogo ficam bloqueados para preservar dados. A projeção mostra ER e `base_value` com fatores 0.8/1.0/1.5, sem anunciar XP/Prana concedidos. Campo opcional `loadFactor` é normalizado para 1.0 em planos antigos e copiado ao snapshot da série iniciada. Impacto Frontend: editor e projeção no Módulo de Treino. Impacto Core/Backend: contrato de planejamento/snapshot estendido sem mudança nas fórmulas, recompensa, adapter, recorrência ou persistência remota; o fluxo atual de pontuação continua separado e a integração canônica segue pendente. Todas as páginas e rotas anteriores foram mantidas. Também foi corrigida a ordem do alias `FitnessModuleFab` que causava TDZ no HEAD `55d3e17`. Skill aplicada: `app/.agents/skills/frontend-design/SKILL.md`; direção manteve Inter, canvas escuro, grafite e violeta existentes. `git diff --check` passou. Testes, build, lint e verificação visual não executados; regressão de leitura dos dados persistidos antigos pendente antes de aceitar o campo opcional.

## App Shell / Fitness — implementação local pendente de revisão visual (10/10/2026)

Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; perfil explícito Matheus/fullstack. Implementado shell global com quatro destinos fixos (Santuário, Ciclos, Pilares, Mais), e FitnessPageShell agora preserva navegação global mesmo em páginas focadas. Antiga barra inferior Fitness removida: o componente compatível renderiza top tabs Treinos/Histórico/Saúde; ação Criar treino é FAB nas telas de hub/dashboard. `hideNav` não suprime mais a navegação global. Arquivos de layout e páginas Fitness alterados; sem mudança em stores/contratos.

Verificações executadas em 10/10: `npm run build` e `npm run lint` passaram; `git diff --check` passou. Nenhum teste visual de navegador executado. Próximo: revisar 360/390/768px e desktop, conferir posicionamento de FAB e barra global nas rotas Fitness e atualizar fila com resultado. Não houve bump, commit, push ou deploy.

Astro Boy/Sol médio. Fábio autorizou publicar o estado acumulado em Matheuscroft/ConselhoElemental-main e preparar a colaboração de Matheus/backend/documentação. Regras raiz para Codex/Cursor/Claude, oito skills portáveis, perfil explícito local e roteiro inicial implementados. Matheus configura `node app/scripts/astro-boy.mjs setup --name Matheus --role backend` na raiz; depois pede ao agente da IDE para continuar. Perfil ignorado, sem IP. Fábio/frontend usa seu próprio perfil.

Pastas inventariadas por astro:audit; plugin dev sem uso removido com 99 pacotes do lockfile, sem atualizar outras dependências. Metadados macOS removidos; assets/páginas/contratos preservados. Build/lint/astro:test e sete testes Deno com mocks passaram; cópia limpa instalou 482 pacotes com npm ci --ignore-scripts, build/astro:test e presença das oito skills/regras/docs conferidos. Zero erros de lint, quatro avisos anteriores. npm audit e limites de performance em AUDITORIA-PUBLICACAO. Não houve novo teste visual neste lote.

Próximo de Matheus: ler auditoria core e escolher teste de execução/reversão/idempotência na fila antes de alterar regra. Próximo de Fábio: revisão visual Fitness e edição de planos em lote próprio. I04 remoto segue pendente; muscle split é estimativa, atividade física continua Terra conforme contrato atual. Publicação confirmada em main: push sem force 03f0588 → 4f180f9 aceito pelo GitHub em 10/10/2026. Este registro documental encerra P01; conferir git fetch/log ao retomar. IDE de Matheus ainda precisa comprovar carregamento das regras; não alegar ativação universal automática.

---

# Retomada vigente — M01 / 0.1.20, 10/10/2026

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; Astro Boy/Sol médio. Pedido das oito imagens: contexto específico dos esportes, ficha/preview/execução coerentes, registro real de esforço/tempo e distribuição/recompensas. Implementação descrita em [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md). 21 modelos nativos adicionados sem substituir catálogo legado; sete artes, contexto filtrado, registro de tempo ativo/esforço/distância/notas e perfil muscular editável. Fluxo visual unificado; histórico não recalculado, snapshots v2 novos e ledger idempotente. Física permanece Terra; não afirmar pontos automáticos dos quatro elementos ou medição exata de músculos.

Próximo: revisão do usuário do fluxo; eventual integração elemental via áreas/ações canônicas deve ser lote próprio, após resolver divergência de adapter registrada. Sem GPS/IA clínica ou texto transformado em ativação muscular. UI de edição de treino continua lote futuro. Servidor 5174; sem commit/push/deploy. Evidências atuais em fitness-modalities-20261010; verificar encerramento M01 na fila. Não usar as capturas históricas como aprovação atual.

---

# Retomada vigente — UI03 / 0.1.19

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Astro Boy/Sol médio; usuário pediu melhorar formulário Criar treino (captura 23.28.14). Reformulação local de CreateWorkoutDialog.tsx e create-workout.css concluída, mantendo store e contratos. Campos consistentes, seleção/configuração clara, catálogo e ação final visível. Corrigida substituição de valores numéricos; calendário localizado e foco de fechamento restaurado.

Evidências em conselheiro-backups/fitness-create-20261009 e STATUS-FRONTEND-FITNESS: mobile 360/390, tablet 768; busca/filtros/remoção, salvar data/duas séries, foco e fluxo de treino temporário até histórico. Sem commit/push/deploy. Servidor 5174 mantido; próximo: revisão deste formulário e depois preview/edição. Nenhuma troca de modelo ou instalação necessária.

---

# Ponto de retomada vigente — UI02-B, 09/10/2026

Checkout efetivo: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; versão 0.1.18, alterações locais preservadas. Modelo Sol 6.1 médio confirmado; nenhuma troca. Seis ícones da captura original e modalidades portuguesas entregues em Escolher treino; Calistenia usa Core Training. Novas categorias conectadas ao planejamento existente, sem sensores/exercícios inventados.

Build/lint, seleção em 360/390/768, categorias no formulário e fluxo Yoga de um exercício/série em 390 passaram; evidência externa fitness-icons-20261009 e STATUS-FRONTEND-FITNESS. Sem commit/push/deploy. Servidor 5174 mantido. Próximo: usuário revisar seleção; depois preview/criação/edição, preservando IDs/configurações e dados. Seis modalidades agora autorizadas explicitamente; notas anteriores limitando duas são históricas.

---

# Continuidade — leia ao retomar

Atualização: 09/10/2026, America/Recife. Coordenação: Astro Boy; custódia: Versionamento e documentação.

## Estado operacional

Checkout principal: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Fila única: [FILA-ENTREGAS.md](FILA-ENTREGAS.md). HEAD observado: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`; alterações locais presentes. Versão 0.1.15 após I03, aceito como protótipo local com mocks. O worktree e2b6 está em 0.1.12 e não deve sobrescrever produto ou fila desta pasta.

C00 já aceita; C01 (manual/dossiê/custódia) agora integrado com preservação das instruções existentes. C02 acrescenta [política de modelos](POLITICA-MODELOS.md). Cinco skills locais conferidas: frontend-design, web-design-guidelines, composition-patterns, webapp-testing, improve-animations. Nenhuma instalação necessária nesta etapa.

I01: executor anterior ocioso, último turno falhou por limite de uso, conforme consulta atual de status Codex. A correção CSS e versão 0.1.13 estavam presentes antes desta continuação. Reteste atribuído a `/root/validacao_i01`, Sol/médio; apenas STATUS-SANTUARIO e artefatos externos reservados. Não editar produto em paralelo. Evidências em `/tmp/conselho-i01-20261009/`; resultado disponível no encerramento abaixo.

## Próximo passo

I04: preparar ativação com conta Cloudflare/Supabase, token restrito no servidor, quota e escopo de deployment; não pedir segredo na conversa nem presumir autorização remota. Configuração documentada em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). I03 não prova chamada real. I02 e D01/D02/D03 já aceitos nos escopos registrados; V02 segue parcial. Chat principal: Sol médio, troca confirmada pelo usuário. Planejamento curto pode usar Luna baixo; ativação/Auth e teste real recomendam Sol médio. As seções abaixo preservam a história; o encerramento mais recente prevalece.

## Rotina obrigatória

Ler AGENTS.md, índice canônico, este arquivo e item vigente da fila. Conferir checkout, versão, diff, dono e evidências antes de agir. Atualizar este ponto ao iniciar/interromper/transferir/concluir lote; registrar próximo passo, bloqueios e testes não executados. Se documento necessário faltar, criá-lo com fontes e lacunas explícitas. Não criar filas concorrentes.

O [manual](MANUAL-ENGENHARIA.md) orienta execução; o [dossiê](DOSSIE-TECNICO.md) registra origem e escopo; o [responsável documental](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md) mantém versões e continuidade. Relatos históricos desses arquivos distinguem o worktree onde foram produzidos da integração atual. Arquivos não garantem execução contínua ou memória infalível.

## Último resultado e retomada

C01/C02 consolidados. I01 retestado e critérios delimitados aprovados em 360/390/768/1440px, 6/6 controles; build passou e lint 0 erros/4 avisos. Ver encerramento da fila e STATUS-SANTUARIO. Reservas liberadas; servidor encerrado. Próximo trabalho: despachar V02 (Fitness) com escopo e perfil temporário, preferencialmente Sol/médio. D01/D02 e fidelidade visual integral continuam pendentes.

## Preferência e V02 em andamento

Usuário selecionou chat principal em Luna leve. O coordenador avisou antes e delegou V02 ao subagente `/root/validacao_fitness` com Sol médio, adequado ao fluxo longo de navegador/estado; não houve alteração do modelo principal. Reservas: somente STATUS-FRONTEND-FITNESS.md e `/tmp/conselho-v02-20261009/`. Não iniciar trabalho concorrente nessas evidências. Próximo: aguardar relatório, revisar, liberar reserva e atualizar fila. Para novas etapas complexas, informar modelo/esforço ao usuário antes da delegação quando a ferramenta não puder alterar o chat atual.

## Atualização V02/I02 — 09/10/2026

V02 parcialmente aprovada. Fluxo criação → preview → sessão → série → reload → finalização → resumo/histórico passou no perfil temporário; 16 capturas em 4 larguras sem overflow/pageerror. Duas notas independentes preservadas (5 e 2 estrelas); diálogos testados sem salvar medidas. Achado reproduzido: em 360px, área do botão Concluir série interceptada pela barra fixa Congelar/Finalizar. I02 em execução por `/root/fix_v02`, Sol/médio; reserva apenas `src/pages/fitness/ActiveWorkout.tsx`; evidências `/tmp/conselho-i02-20261009/`. Após correção, retestar; depois avaliar próximo lote. Não salvar dados corporais fictícios.

## I02 — encerramento técnico em revisão, 09/10/2026

Executor `/root/fix_v02`, Sol/médio, corrigiu `src/pages/fitness/ActiveWorkout.tsx`: `mt-10` tornou-se `mt-4 min-[375px]:mt-10`. A redução de margem limita-se a larguras abaixo de 375px. Encobrimento de Concluir série pela barra fixa reproduzido antes em 360px; responsável documental não alterou produto.

Reteste informado pelo executor/coordenador: clique real, continuar sessão, reload, finalizar e histórico passaram em 360/390/768/1440px, sem overflow horizontal ou pageerrors. Artefatos em `/tmp/conselho-i02-20261009/` (verify.json, verify-390.json, scripts e capturas). Cobertura: um exercício/uma série; títulos arbitrários, múltiplas séries, todos os exercícios e fidelidade integral não certificados. V02 permanece parcial: avaliações corporais com medidas reais e histórico entre meses pendentes; notas de sessão não substituem avaliações corporais.

Custódia `/root/versionamento_documentacao`: versão 0.1.13 → 0.1.14 sincronizada em package.json, nas duas posições raiz do package-lock.json e CHANGELOG. Dependências preservadas. Lint global/build em andamento pelo coordenador no momento deste registro, sem resultado incorporado. I02 em revisão, aguardando consolidação e aceite de Astro Boy. Chat principal permanece Luna leve; I02 delegado a Sol médio.

Próxima ação: coordenador incorporar lint/build, revisar diff e decidir aceite antes de escolher próximo lote. Não ampliar correção para cenários não testados. Reservas documentais/manifests devolvidas ao coordenador após esta custódia. Sem commit/push/merge/publicação. Evidências em /tmp são temporárias.

## Encerramento I02 e próximo lote

I02 aceito após revisão do coordenador: botão Série acessível a 360px; quatro larguras verificadas no cenário delimitado. Build passou; lint 0 erros/4 avisos preexistentes; versão 0.1.14 sincronizada. Servidor de teste encerrado pelo executor. V02 continua parcial nos itens que exigem outras condições de data ou medidas corporais reais. Próximo: D01, auditoria somente leitura dos contratos core/hábitos/projetos; não há alteração de domínio autorizada. Recomendação de modelo: Sol médio por cruzar várias regras canônicas com implementação; avisar usuário antes do despacho.

## D01 em andamento

Auditoria estática dos contratos Core delegada a `/root/auditoria_core_d01` com Sol/médio. Reserva: novo `docs/AUDITORIA-CONTRATOS-CORE.md` e `/tmp/conselho-d01-20261009/`; código e outros documentos somente leitura. Objetivo é reconciliar documentação/implementação com caminhos e símbolos e propor validações, sem mudar regras. Próximo passo: revisar relatório e aceitar ou devolver lacunas; depois escolher lote funcional a partir de evidência. Chat principal segue Luna leve.

## D01 aceito; D02 em andamento

D01 aceito apenas como auditoria estática em `docs/AUDITORIA-CONTRATOS-CORE.md`. Quatro conflitos documentais continuam pendentes de decisão explícita; nenhum fluxo foi testado e nenhuma regra alterada. D02 está com `/root/auditoria_astrolabio`, Luna/baixo, para rastrear somente histórico Math.random e dados do Astrolábio. Reserva: relatório novo `docs/AUDITORIA-ASTROLABIO.md` e `/tmp/conselho-d02-20261009/`. Depois revisar. Próxima decisão de domínio requer reconciliação; não inferir regra canônica.

## D02 aceito; D03 em andamento

D02 aceito como auditoria estática; relatório `docs/AUDITORIA-ASTROLABIO.md`, script isolado não é teste de browser. D03 delegada a `/root/auditoria_assistente_d03`, Luna/baixo, para inventário do assistente no app. Somente novo `docs/AUDITORIA-ASSISTENTE.md` e `/tmp/conselho-d03-20261009/`; sem secrets. Depois revisar; escolher provider/free tier e implementar exige olhar disponibilidade, custos atuais e credenciais antes de coding. Chat principal permanece Luna leve.

## D03 aceito; D04 pesquisado

D03 relatório aceito em `docs/AUDITORIA-ASSISTENTE.md`. D04 compara provedores oficiais em `docs/DECISAO-PROVEDOR-IA.md`; Cloudflare Workers AI é candidato provisório com cota free limitada e chamadas de ferramentas, Gemini não pago não recomendado para dados pessoais, Azure é alternativa cobrada. Nenhum provedor/credencial foi habilitado. Próxima etapa proposta I03: protótipo textual mínimo em Supabase Edge Function, começando por consulta ou rascunho com confirmação e consentimento. Modelo recomendado para implementação: Sol médio; avisado antes do despacho. Skill Supabase existe em `/Users/fabioandre/.codex/plugins/cache/openai-curated-remote/supabase/1.0.0/skills/supabase/SKILL.md` e deve ser lida ao iniciar I03. Acesso a conta/secret e deploy não presumidos.

## I03 em andamento — protótipo IA no app

Implementação delimitada foi delegada a `/root/implementa_assistente_i03`, Sol/médio. A skill Supabase foi aplicada e docs atuais consultados. O executor encerrou por limite de uso antes de editar. Astro Boy confirmou no checkout principal que `Invocar.tsx` não tem mudanças e que o novo diretório/função `assistant-suggest` não existe. Reservas liberadas; I03 segue incompleta e sem testes ou bump. Retomada requer Luna → Sol/médio nesta conversa ou executor equivalente. Escopo mantido: consentir, enviar texto mínimo a Edge Function autenticada, receber sugestão e confirmar via `addDraft`; nenhuma leitura de outros dados. Sem credencial Cloudflare, chamada real não está disponível. Nenhum secret/deploy.

## I03 encerrado — protótipo local aceito, 09/10/2026

Após usuário confirmar Sol/médio, Astro Boy implementou `src/pages/Invocar.tsx`, `supabase/functions/assistant-suggest/index.ts` e `index_test.ts`. Consentimento/texto mínimo, autenticação servidor, proposta de título/descrição com schema fechado, edição e confirmação no `addDraft` existente. Sem leitura de perfil, operações remotas de domínio ou alterações em stores. Sete testes Deno passaram; build passou; lint 0 erros/4 avisos preexistentes; diff-check passou. Browser com Auth/provedor simulados, app/store reais e dados temporários criados pela UI: fluxo manual, consentimento, falhas, revisão, confirmação e reload passaram; 360/390/768/1440 sem overflow/pageerrors. Automação rola controles ao centro para evitar navegação fixa. Não certifica chamada real, acesso do provedor, hit targets em qualquer posição ou acessibilidade integral.

Custodiante `/root/versionamento_i03`, Luna/baixo, sincronizou 0.1.15 nos manifests/changelog e atualizou índice/manual/dossiê. Astro Boy revisou e aceitou somente o protótipo local; reservas liberadas. Guia [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Evidências temporárias: `/tmp/conselho-i03-20261009/` (browser.json/script/capturas, deno-test.log, build.log, lint.log). Nenhum secret foi lido/configurado, chamada live, commit/push/deploy executado. Próximo: I04 conforme seção Próximo passo.


## Retomada UI01 — 09/10/2026

Prioridade atual: concluir Treino/Saúde com o kit de Pictures/PRINT/Fitness-app. UI01 em execução sequencial por Astro Boy, começando por Corpo e silhueta. Backup e reservas na fila. Baseline atual capturado em perfil Chrome temporário (sem dados reais) em fitness-kit-20261009/before-*.png. Não confundir o worktree e2b6 antigo com produto principal 0.1.15. Próximo: editar componentes de apresentação e validar ações/responsividade; depois continuar refinamento de treinos.


## UI01 concluída — 0.1.16

Primeiro lote de Saúde entregue e validado conforme STATUS-FRONTEND-FITNESS; reservas liberadas. Versão 0.1.16 sincronizada; alterações preexistentes preservadas. Evidências e backup em /Users/fabioandre/Developer/conselheiro-backups/fitness-kit-20261009. Próxima ação exata: UI02, comparar seleção/prévia preenchidas e tratar criação/edição com contratos existentes, preservando séries individuais. Não retomar Cloudflare antes deste foco nem confundir o e2b6 antigo com checkout principal. Kit integral continua em andamento; testes de saúde preenchida/exclusão pendentes de dados reais autorizados. Servidor 5174 mantido para revisão.


## Prioridade atual: UI02-A / escolher treino

Usuário confirmou Sol 6.1 médio; foco exclusivo agora /treinos e referência 21.26.22 antes de preview/edição. Mobile/tablet; PC usa largura de tablet. UI02-A em execução, reservas na fila. Preservar duas categorias reais e todas as ações; documentar adaptações da imagem.


## UI02-A entregue — 0.1.17

Escolher treino agora segue composição da referência adaptada às duas categorias existentes. Evidências em conselheiro-backups/fitness-select-20261009 e topo de STATUS-FRONTEND-FITNESS. Modelo Sol 6.1 médio confirmado; não houve troca. Reservas liberadas. Prioridade permanece revisão/finalização desta tela antes de preview/edição. Diretriz mobile/tablet registrada no manual e roteiro; o layout tablet no PC foi aplicado à seleção, demais páginas aguardam seus lotes. Versão sincronizada, sem commit/push/deploy.

## F02 — Fitness paralelo: biblioteca e navegação (10/10/2026)

Nova raiz `/fitness`, acessada por Pilares → Terra → Exercício Físico. Fluxo original preservado nas URLs `/treinos/*`, com entrada Mais → Treino — Legado (`/treinos/legado`); removida entrada da sidebar e atalhos secundários do mapa/menu. Redirecionamentos de modalidade Yoga/Calistenia agora abrem a biblioteca. Nenhuma página original apagada.

FitnessRoot usa kit visual existente (cards, botões, catálogo, ficha de exercício), navegação global fixa e abas Treinos / Histórico / O Corpo. Histórico/Corpo reutilizam as páginas atuais em contexto embutido; o contexto suprime somente casca/abas duplicadas. A ação vazia do histórico embutido retorna à biblioteca; modo legado mantém destino original.

Aba Treinos: modalidades → Meus Treinos filtrados, Sequências que referenciam treinos da modalidade (ordem integral preservada), Catálogo real. NativeTemplateDialog configura exercícios ordenados, séries, repetições/duração, carga e fator; saveTemplate salva somente na biblioteca. Executar Agora chama startSession, com banner de sessão ativa. Registro completo da execução permanece etapa futura. Agendar/Tornar Ciclo contêm TODO Core e aviso de indisponibilidade.

Store ganhou nativeCatalog/ensureNativeCatalog: reaproveita catálogo original em cópias com UUIDv4 e legacyId, dentro da persistência nativa existente por conta; registros anteriores recebem lista vazia por fallback. Não altera histórico legado nem envia planejamento ao Core. Modalidades sem catálogo mostram estado vazio.

Verificação: TypeScript identificou erros preexistentes de contratos do Core (Habit/User/TaskItem etc.) e helper legado workout-ids; import não usado na nova raiz corrigido. Compilação global continua bloqueada. Sem testes de navegador ou aprovação visual neste lote. Não publicado.
F02: ESLint dos 14 arquivos do lote passou sem erros/avisos; diff-check passou antes do fechamento documental. Sem testes funcionais ou inspeção de navegador; confirmação de comportamento em execução ainda pendente.

## F03 — execução nativa e conclusão Core (10/10/2026)

Implementação: `/fitness/ativo/:sessionId` usa ActiveFitnessSession e o kit legado ExerciseCard/Header/StickyAction. Casca fullscreen remove Sidebar/BottomNav somente nesta rota. Séries editáveis reps ou segundos e kg; check reversível, pular/retomar, confirmação de séries pendentes, cronômetro por startedAt, retorno sem apagar sessão e botão Retomar na biblioteca. Executar Agora inicia sessão e navega. Conclusão retorna `/fitness?tab=history`, agora com nativeHistory (nome/data/duração/ER) acima do histórico legado preservado.

finishSession consolida séries concluídas e chama fitness-core-adapter antes de remover a sessão ativa. Adapter traduz sessão para completeNativeAction na appStore. Despacho Core grava Action concluída (`sourceModule=modulo_treino`, `sourceRefId=session.id`), projeção Task e um ExecutionLog com timestamp, baseValue/rawValue/teto/valor aplicado/Prana/regra. Atualiza totalScore e xp_earth em uma única mudança de estado; Action e log IDs voltam à sessão. Idempotência por referência de sessão, logs persistidos e isolados por conta; guarda de conta na conclusão. Falha mantém sessão ativa para tentativa posterior. Recompute/projeções de áreas/elementos preservam completedScore nativo; Undo remove log e reverte valores efetivamente aplicados; recompilação da mesma Action usa despacho Core.

Escopo energético explícito desta fase: folha neutra em Terra, esforço padrão 1 (sem inferência por modalidade). Core usa presença/tempo/teto canônicos, conserva valor fracionário e debita até 5 Prana, com clamp 0–100 e delta efetivo no log. Perfis anteriores sem pranaLevel recebem 100 como ponto inicial do campo novo. Fórmulas e históricos legados preservados. Não implementa ativação de Habit/Rotation, naturezas energéticas configuráveis, bônus de ressonância/fechamento diário ou sync remoto do novo ledger nesta etapa.

Verificações: ESLint dos arquivos do lote passou. TypeScript continua bloqueado pelas divergências preexistentes User/Habit/TaskItem e helper legado; a saída filtrada não apontou erros nos novos componentes/serviços/workoutStore. Sem testes funcionais ou navegador executados; integração verificada apenas por leitura/tipagem/lint, sem alegar validação ponta a ponta ou publicação. Reservas liberadas; pendente revisão visual e funcional do usuário.

## F04 — XP Terra no planejamento e no extrato (10/10/2026)

Core: projectNativeLeafReward foi extraída da conclusão já existente; preview e buildNativeCompletion usam a mesma função pura (presença, faixas de tempo, esforço padrão 1 e teto 10). Fórmula e efeitos do despacho preservados. native-reward-preview consolida targets de reps ou segundos/2 com fatores 0.8/1/1.5, baseValue ER×0.03 com mesma precisão da conclusão; store expõe previewTemplateReward. Duração estimada opcional no NativeTemplateDialog; sem estimativa, preview usa tempo zero e declara essa ausência, sem duração inventada.

FitnessRoot: badge 🌿 ~XP (Terra), emerald-100/800, rótulo de estimativa e tempo/esforço usados. Histórico destaca Ganho +XP verde e ER secundário cinza; ganho vem do ExecutionLog canônico, sem recalcular história. Log ausente (por exemplo Undo) não é apresentado como recompensa recebida.

ActiveFitnessSession: conclusão abre modal de sucesso com XP grande, ícone Terra e animação respeitando reduced-motion. Resultado concluído fica na página pai, evitando que remoção da sessão ativa cause redirect antes do feedback. Ver Histórico conclui a transição explicitamente; troca de conta não conserva extrato de outra conta. Nenhum novo despacho de recompensa no modal.

Verificações: ESLint dos seis arquivos alterados passou; sem testes funcionais/navegador executados. Compilação global permanece limitada pelas divergências anteriormente documentadas. Sem publicação, commit ou migração de histórico. Reservas liberadas. Próximo passo: revisão visual/funcional pelo usuário.

F04 ajuste visual solicitado: badge do template simplificado para pontuação + XP + 🌿 (ex.: 2,46 XP 🌿), removendo til e (Terra). Indicação de estimativa permanece no texto de apoio. Cálculo preservado.

## F05 — esforço global e autoestimador entregues (10/10/2026)

Auditoria: Motor já documentava ER, esforço 1–5, presença por faixa, tempo e tetos. Não havia a heurística solicitada nem default3 no formulário. Preview anterior aplicava presença/tempo quando recebia duração, mas só esforço1; diagnóstico de ignorar todos os multiplicadores não corresponde integralmente ao código. Adicionadas seções 5.4/5.5 ao Motor e seção de planejamento/feedback ao contrato de Módulos Nativos.

calculateEstimatedDuration aceita planos nativos e legados por estrutura: reps×4s ou duração exata + cada descanso + 60s após primeiro exercício; retorna CEIL(minutos), zero para lista vazia. Legacy estimateWorkoutDurationMinutes continua preservado. Formulário nativo usa cálculo derivado reativo, modo auto/manual explícito, botão de restauração automática e descanso editável. Override não muda com séries até ser removido. Novos formulários sugerem esforço3, com escolha 1–5 e preview verde ao vivo.

Tipos adicionaram esforço opcional em WorkoutTemplate/NativeWorkoutSession/WorkoutCreateInput/WorkoutUpdateInput/Workout e modo de duração no template. Store valida inteiro1–5, computa estimativa auto ao salvar e copia esforço para sessão. Entrada legada guarda o campo opcional sem trocar cálculo legado. Dados anteriores sem esforço mantêm fallback1; template antigo sem tempo passa a obter preview automático, sem reescrever registros concluídos. Duração positiva antiga é respeitada como manual.

Core: multiplicadores/caps/prana por esforço da tabela canônica, effortLevel no Adapter e no despacho/Undo-reconclusão, ruleVersion core-native-leaf-v2 somente em novos logs. Preview usa ER×0.03×presença1.5×esforço×tempo, limitado pelo cap. Mesma função Core concentra esforço/tempo/teto; flag de preview explicita presença presumida1.5. Conclusão usa presença por duração REAL, nunca estimativa. Histórico/modal continuam lendo XP do ExecutionLog; header ativo mostra esforço snapshot. Nenhum histórico recalculado.

Verificações: ESLint onze arquivos passou; diff-check passou; TypeScript global segue bloqueado pelas divergências anteriores, saída filtrada sem erros nos novos/alterados arquivos nativos. Sem testes funcionais ou navegador; não afirmar validação ponta a ponta. Reservas liberadas, sem publicação/commit. Impacto para frontend/backend: campos opcionais de esforço/modo, despacho e custo energético por esforço, detalhes canônicos atualizados.

F05 ajuste de apresentação: XP Terra exibido com uma casa decimal em cards, formulário e modal pelo formatEarthXp compartilhado. Precisão de cálculo e logs preservada.

F05 ajuste de campos: FitnessIntegerField compartilhado no planejamento e execução nativos, botões subir/descer e teclas ArrowUp/ArrowDown. Valor vazio preservado durante edição; conversão de string vazia em zero removida, zeros à esquerda normalizados. Duração inteira usa o mesmo controle. Campos obrigatórios de planejamento impedem salvar séries vazias.

## F06 — balance patch ER 0.10 (10/10/2026)

Conversão oficial centralizada em WORKOUT_ER_BASE_VALUE=0.10 (workout-balance.ts), consumida por finishSession, projectTemplateReward e helper de equivalentes de planejamento. Core continua aplicando esforço/presença/tempo/caps sobre o novo baseValue; histórico/logs concluídos preservados, sem recomputação retroativa. Cálculo legado computeSessionImpactMetrics permanece isolado conforme parallel run, não é o caminho de recompensa da sessão nativa.

Planejamento e treino ativo expõem seletor por série Leve×0.8 / Manutenção×1.0 padrão / Progressão-PR×1.5. Na execução a alteração usa logSet e entra na consolidação das séries concluídas. Carga absoluta em kg não infere intensidade. XP verde e apresentação com uma casa decimal mantidos.

Motor atualizado em 5.1/5.3/5.5 com nova constante e exemplos (prancha60s→30ER→3 baseValue; 72ER/esforço3/12min→19.44XP; força6séries×6reps×1.5→54ER→5.4baseValue→14.58XP com esforço3/10min estimados). Diagrama do contrato Native Modules atualizado. Nota de balanceamento explicita data/aplicação a previews e novas conclusões.

Verificações: ESLint dos sete arquivos de código passou; diff-check passou; buscas conferiram ausência da conversão0.03 no código de cálculo abrangido. Não executados testes funcionais, navegador ou nova compilação global (limitação anterior permanece documentada). Reservas liberadas; sem publicação/commit/migração de dados.

F06 ajuste UX: nome de cada exercício no formulário nativo agora é botão de expandir/recolher séries, com seta, contagem e aria-expanded/controls. Dados permanecem montados; campos inválidos recolhidos são reabertos ao tentar salvar.

F06 polimento: XP inteiro não exibe decimal (10 XP), fracionário mantém até uma casa (14,6 XP). Séries do planejamento agora expandem/recolhem independentemente, com resumo compacto de reps/segundos, kg quando informado, pausa e PR/Leve. Valores preservados; validação reabre campos recolhidos.

F06 ajuste do modal: criação nativa reserva 64px da navegação global mais safe-area inferior. Modal centralizado na área útil, com altura máxima e rolagem interna; overlay termina acima da barra. DialogContent aceita overlayClassName opcional, mantendo os demais modais com comportamento anterior. Sem testes funcionais ou navegador executados.

F06 polimento de séries: resumo de reps/tempo/carga/pausa exibido somente quando a série está recolhida. Aberta mantém título e campos editáveis, sem duplicar os valores no cabeçalho. Sem testes executados.

F06 navegação: selecionar Treinos no segmented control remove modalidade da URL e retorna à grade inicial, inclusive ao clicar na aba já ativa. Troca por teclado usa o mesmo reset. Fecha detalhes/formulário transitórios; biblioteca e sessão ativa preservadas. Sem testes executados.

F07 cancelamento nativo: ação discardNativeSession valida sessão/conta e remove apenas sessão ativa, sem histórico, Adapter ou recompensa. Tela ativa oferece Cancelar treino com confirmação explícita, disponível inclusive nos primeiros segundos, sem limite artificial de duração. Template preservado e retorno à biblioteca. Sem testes executados.

F08 biblioteca editável: TemplateCard mostra composição ordenada e pílulas por série (reps/tempo, kg, descanso, fator). Editar treino reutiliza NativeTemplateDialog com cópia local dos planos, nome, esforço e duração auto/manual. Salvar usa mesmo UUID via saveTemplate, preservando referências das sequências, metadados e snapshots de sessões/histórico; fechar não salva. Permite incluir/remover/reordenar exercícios e incluir/remover/editar séries. Sem testes funcionais ou navegador executados.

F08 cards recolhíveis: treinos em Meus Treinos fechados por padrão. Nome/cabeçalho alterna composição e ações, com chevron e aria-expanded/controls. Nome, contagem e XP permanecem visíveis no resumo. Sem testes executados.

F08 ação primária: Executar Agora movido para fora do conteúdo recolhível, visível com card aberto ou fechado. Guardas de sessão ativa e início nativo mantidas. Sem testes executados.

F09 espaço da execução: FitnessStickyAction informa altura real via ResizeObserver; tela ativa reserva essa altura mais 24px no fim do conteúdo. Medição inclui safe-area, dois botões e responde a mudanças de largura/tamanho. Último card pode rolar acima da barra; outros consumidores mantêm reserva anterior. Sem testes funcionais/navegador executados.

F10 navegação no topo: ScrollToTop global dentro de BrowserRouter reposiciona window antes da pintura a cada entrada de navegação (key/path/search), incluindo modalidades/abas via query e voltar/avançar. Restauração automática do navegador desativada enquanto montado; comportamento instantâneo. Sem testes funcionais/navegador executados. Alteração posterior ao commit 8d39966, ainda sem commit/push.

F11 exclusão na biblioteca: cards expandidos de Meus Treinos oferecem Excluir treino com confirmação. Usa deleteTemplate existente; remove blueprint e referências nas sequências, preservando sessão ativa, histórico e recompensas. Confirmação informa alcance antes de excluir. Sem testes executados; alteração sem commit/push.

F11 organização visual: Editar e Excluir no card expandido compartilham linha em duas colunas iguais, com ícones, labels curtas e exclusão em vermelho. Confirmação mantida. Sem testes executados.

F11 composição compacta: card aberto mostra nome e resumo por exercício (3×10 reps · minutos totais estimados incluindo pausas). Séries com valores distintos mostram média com til e até uma casa decimal. Isometria usa segundos, grupos mistos separam reps/duração. Reutiliza autoestimador por exercício sem transição; formulário de edição mantém detalhes completos. Sem testes executados.

F11 alinhamento: resumo de séries/reps/tempo sempre em linha abaixo do nome do exercício, inclusive nomes curtos. Sem testes executados.

F12 ponte planejamento→Ciclos: MakeCycleModal seleciona dias 0–6, valida seleção não vazia; WorkoutStore valida conta e delega ao Adapter. Cria Habit/Action raiz com fonte/template, ER×0.10, esforço, tempo e área Terra real do catálogo. addHabit preserva campos canônicos/fonte e neutralidade nativa. Indicador Ciclo ativo por habits e deduplicação no Adapter. Não emite recompensas, não sincroniza futuras edições, sem migração de IDs de área. Sem testes funcionais/navegador executados; sem commit/push.

F13 rich widget Fitness em Ciclos: séries inline mantidas apenas em WorkoutStore, início silencioso, edição reps/segundos/kg/fator e conclusão explícita. Restringe a hoje e sessão mesmo template/dia; outra sessão bloqueia início. Widget usa Core preview com esforço/tempo/presença/cap e XP real de ledger após concluir. finishSession(habitId)→Adapter→completeNativeAction ramo HABIT grava um único ExecutionLog, HabitCompletion e recompensa atomicamente no Core, sem Action avulsa/subtarefas nem chamada adicional de pontuação. Mantém rotação por data e snapshots nativos. Editar/Excluir navegam à confirmação/formulário do módulo via query; excluir blueprint continua preservando ciclo. Sem testes funcionais/navegador executados.

F13 verificação: ESLint dos sete arquivos executado sem erros, dois avisos preexistentes de dependências hooks em Ciclos (558/645). Diff-check passou. startSession aceita override opcional validado de esforço para snapshot do ciclo; chamadas anteriores preservam padrão. Sem testes funcionais/navegador, sem publicação.

F13 tipagem: tsc --noEmit executado; compilação global falhou nos contratos preexistentes de appStore (Habit semantic backups/startDate/sortOrder, TaskItem, User). Saída filtrada não apontou erros em FitnessHabitWidget, FitnessRoot, Adapter, native-action-completion ou workoutStore, nem no novo ramo HABIT. Não afirmar build global aprovado.

F14 sequências: WorkoutSequenceLibrary disponível na grade inicial e modalidades, criação nome/descrição/seleção e ordenação com mínimo2 templates distintos (também validado por saveSequence). Modal de dias compartilhado para template/sequence. Adapter scheduleSequenceAsRotation resolve biblioteca/conta/templates/área; helper comum projeta baseValue e duração. Core createRotationWithMembers faz gravação atômica em cycleSequences/actions/habits/sequenceMemberships com UUIDs, sourceRef e posse por rotação. Novos membros independentes de hábitos avulsos; deduplicação pela sequência. Widget já faz dispatcher de membro corrente em Ciclos. Rotação usa máquina temporal existente; divergência histórica com seção3 não reescrita. Dados anteriores preservados, sem recompensas na ativação, sem commit/push.

F14 verificações: ESLint sete arquivos passou; diff-check passou. Tsc global segue limitado pelos contratos preexistentes. Após retorno CycleSequence explícito no Adapter, saída filtrada sem erros nos novos componentes, Adapter, WorkoutStore ou operação atômica Core. Sem testes funcionais/navegador executados.

F15 histórico XP: componente NativeSessionHistory compartilhado nas rotas de histórico, consulta log por UUID/ref da sessão, snapshot earnedXp real retornado pelo Adapter e registros concluídos correlacionados (sem recalcular). Sessões futuras guardam earnedXp; antigas usam evidências Core existentes. Histórico legado mostra xpAwarded real do ledger em vez de volume quando disponível. Ausência de evidência não fabrica recompensa. Sem testes funcionais/navegador executados.

F15 diagnóstico adicional: applyDomainSnapshotToStore em supabaseCloudSync hidrata tasks/habits, sem actions ou executionLogs remotos. Resolver de histórico agora lê tasks além de actions por coreEntityId ou sourceRef sessão; hábito usa completion vinculada por logId ou timestamp exato da sessão. Valores reais finitos, inclusive zero; não recalcula XP. Esta divergência concreta explica falha possível após hidratação cloud; dados específicos do usuário não inspecionados (nenhuma aba disponível no browser conectado).

F16 histórico sem ER e sync de sequências: removido volume ER do card executado. Supabase insert de cycle_sequences admite fallback exclusivo PGRST204 da coluna is_active ausente, mantendo isActive no payload e repetindo insert sem coluna; próximos batches usam compatibilidade. Outros erros propagam. Migração aditiva20261011 adiciona coluna, restaura pausas pelo payload e solicita reloadschema. Não aplicada no banco remoto; sync não validado contra Supabase. Nenhuma exclusão de dados ou alteração de RLS nesta migração.

F17 card Core preservado: removido retorno antecipado que substituía rotação Fitness por card próprio. Motion card original mantém shell, título e passo; membro atual Fitness injeta widget embedded sem borda/card adicionais e sem ações genéricas/subtarefas. Fila usa memberships ordenados e títulos Habit; identificação apenas sourceModule do membro. Editar/Excluir e detalhes de rotações Fitness direcionam /fitness; genéricas preservadas. Widget Abrir Treino inicia/retoma sessão vinculada via coreHabitId e attachSessionToHabit validando conta/template/posse. finishSession sem argumento usa vínculo persistido, fechando hábito/rotação também pela execução fullscreen com único log/recompensa. Nenhuma migração remota, teste funcional/navegador ou publicação.

F18 — perda de membros: diagnóstico estático confirmou sanitizer cloud que validava apenas hábitos raiz (descartava childHabits), nomes sequence_id/habit_id divergentes da migração sequence_local_id/habit_local_id, e janela delete-all/insert com atualização cloud concorrente. Corrigido percurso recursivo, leitura compatível com ambos schemas e fallback restrito de escrita; sync agora reutiliza IDs DB via upsert, só remove obsoletos depois de todas as gravações. Auth serializa escrita, só confirma fingerprint após sucesso, bloqueia refresh com alterações pendentes e rejeita hidratação se houve edição durante fetch. Impacto compartilhado Core/Fitness: mantém memberships e ordem existentes; nenhuma mudança de pontos. Não recupera vínculos já perdidos automaticamente, não garante transação remota entre tabelas/dispositivos. ESLint dos dois arquivos passou; sem testes funcionais/cloud, migração remota ou publicação.

F19 — banco sem sequence_memberships.position: fallback limitado PGRST204 mantém ordem no payload; retries cobrem posição e nomes de referências em qualquer ordem. Migração aditiva20261011_align_sequence_membership_position criada, não aplicada remotamente. deleteCycleSequence desvincula hábitos por memberships OU controlledBySequenceId, preserva recurrenceType/config individuais e libera também actions. addHabitToSequence já não sobrescreve agenda individual; não fabrica configuração anterior. ESLint service/store passou; sem testes funcionais/Supabase/publicação.

F20 — sequência única: CycleSequence compartilhada com status/restrição/templateIds, persistência existente em payload cloud. WorkoutSequence virou DTO. Biblioteca lê Core; saveSequence grava Core sem hábitos; importação aditiva das sequências locais no primeiro acesso Fitness mantém IDs de rotações antigas e limpa coleção duplicada por conta. Ativação usa mesmo ID, reativa membros existentes sem duplicar, bloqueia substituição silenciosa de composição vinculada. Desativação UI retorna PLANNING, mantendo posse para não gerar ciclos avulsos. Ciclos oculta planejamento e oferece restrição Geral/Treinos na criação; store valida adição e ordem refs acompanha reorder/remove. Template/history locais permanecem. ESLint sem erros (2avisos preexistentes Ciclos); TypeScript filtrado sem diagnósticos dos arquivos alterados. Sem testes funcionais/cloud ou publicação. Revisão visual e migrações schema F16/F19 ainda pendentes.

F21 — widget Fitness em Ciclos: cabeçalho de hábito com checkbox (conclusão pelo fluxo nativo, exige séries realizadas), título recolhível, badge XP sem Estimativa e Executar compacto. Cada exercício tem toggle/aria e contagem; série concluída compacta checkbox/Série/reps ou segundos/kg, lápis reabre edição reps/carga/fator, sem alterar logSet/Adapter/pontos. Funciona embedded em rotações e avulso. ESLint passou; sem verificação visual/browser.

F22 — execução Fitness separada: executedClone deixava reps/segundos=0 em todas séries, e checkbox chamava início silencioso. Agora valores previstos são preservados; nativeCheckins separado/persistido por conta/hábito/dia, updateHabitCheckin/finishHabitCheckin/beginHabitWorkout. Pai sem marcações=plano integral; parcial=apenas marcadas; todas=autoconclusão, valores editados consolidam ER. Tempo CHECKIN declarado proporcional à heurística, presença máxima com tempo autorizado pelo usuário; LIVE mede desde início explícito. Logs/sessões identificam durationSource/fullCompletion; histórico mostra tempo informado. Docs distinguidas. tsc completo passou antes dos últimos campos log; ESLint passou antes deles; rerun final em andamento. Sem testes funcionais/Supabase/publicação.

F22 verificação final: tsc --noEmit completo e ESLint dos sete arquivos passaram sem saída de erros. Sem testes funcionais/browser. Reservas liberadas.

F23 — XP acumulado no widget: badge junto ao nome do treino e de cada exercício, derivado apenas de séries completed&&!skipped. projectWorkoutProgress compartilha ER/tempo declarado/Core/cap entre UI e finishHabitCheckin; LIVE usa tempo medido disponível no render. Exercícios recebem parcelas proporcionais de ER do único total limitado, sem caps individuais duplicados. Editar reps/segundos/fator recalcula badges via Zustand; nada concede XP antes da conclusão. Registro concluído usa XP real do log/snapshot, sem recreditar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F24 — badge único do treino pai: início=XP planejado, séries marcadas=acumulado/planejado, conclusão=XP real sem fração. Meta superada usa gradiente verde/dourado e Sparkles; parcial/abaixo usa âmbar, preservando valor real e tooltip/aria explicativo. Comparação na precisão exibida (1decimal) evita destaque por ruído float. XP concluído recupera também HabitCompletion real. Removido segundo badge; nenhuma mudança na pontuação ou persistência. TypeScript completo e ESLint passaram; sem validação visual/browser.

F25 — checkbox pai permite desfazer hoje: undoHabitWorkout preserva árvore/séries/valores como CHECKIN e remove histórico somente após Core aceitar undoNativeHabitCompletion. Core remove completion/log, reverte XP/Terra/Prana pelo extrato, recalcula streaks e restaura snapshot de rotação. Conclusões novas guardam coreReceipt persistido nativo; fallback após cloud valida id/fonte/hábito e completion existente, evitando reversão dupla. Antigos sem extrato têm erro explícito sem alteração. TypeScript/ESLint primeira rodada passaram; rodada final pós receipt em andamento. Sem teste funcional/cloud/publicação.

F25 final: TypeScript completo e ESLint dos seis arquivos passaram. Reservas encerradas; validação funcional/browser pendente.

F26 — widget recolhe card após autoconclusão bem-sucedida de todas as séries. Mantém badge final e checkbox; não recolhe se conclusão falhar. Sem testes executados.

F27 — conclusão widget centraliza card via scrollIntoView e exibe balão +XP real 🌿 Terra que sobe/desaparece em2s; usa resultado earnedXp, não concede pontos adicionais. Aplica conclusão pai/manual e última série, recolhe card. Respeita movimento reduzido, cancela RAF/timer no cleanup. TypeScript completo e ESLint passaram; visual/browser pendente.

F28 — balão XP via portal document.body, fixed z9999 acima dos stacking contexts dos cards; tamanho reduzido para texto14px/label10px, padding menor. Mantém animação/cleanup/movimento reduzido. Sem testes executados.

F29 — exercício recolhe automaticamente após marcar sua última série; usa resultado atualizado da store, ignora skipped e falhas. Demais exercícios mantêm estado e header permite reabrir. Sem testes executados.

F30 — checkbox por exercício marca/desmarca todas suas séries mantendo valores; reflete automaticamente todas concluídas e estado indeterminate se parcial. Mantém CHECKIN sem cronômetro ou LIVE existente, fecha exercício ao marcar tudo e conclui pai quando todos completos. Treino já registrado exige desfazer pai antes de editar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F30 ajuste de verificação: primeira rodada ESLint detectou fechamento JSX faltante; corrigido e segunda rodada aprovada. Comando tsc executado na raiz externa apenas exibiu ajuda, sem verificar projeto; repetido a partir de app.

F31 — checkbox exercício segue parcial: se não há séries marcadas, registra todas; se há algumas, preserva realizadas e marca restantes skipped. Checkbox representa exercício encerrado (séries concluídas ou puladas), indeterminate apenas com realizadas e pendências. Treino autoconclui quando todas séries estão resolvidas; ER e tempo incluem apenas realizadas pela consolidação existente. Desmarcar exercício reabre/limpa marcações, preservando valores. ESLint passou; sem teste funcional/browser.

F32 — treino concluído exibe badge âmbar nos exercícios parciais e contagem realizadas/planejadas (ex3/5 séries). Exercícios integrais mantêm verde e contagem simples. Usa séries concluídas não skipped do snapshot, sem alterar pontuação. ESLint passou; sem teste visual.

F33 — desmarcar checkbox de exercício preserva seu estado de abertura; apenas marcar concluído recolhe automaticamente. Cabeçalho continua controlando expandir/recolher. Sem testes executados.

F34 — badge âmbar/contagem parcial por exercício aparecem também durante o treino quando suas séries estão resolvidas (completed/skipped), sem aguardar conclusão pai. Sem testes executados.

F35 — cabeçalho exercício empilha badge XP sobre contagem de séries à direita, nome ocupa coluna flexível restante; checkbox e chevron preservados. Sem testes executados.

F36 — removido Concluir Treino redundante do widget Ciclos. Checkbox continua CHECKIN sem cronômetro; LIVE matching agora exige executionMode LIVE e coreHabitId exato, impedindo adotar sessão apenas por template igual. beginWorkout é chamado somente pelo botão Executar. Sessões antigas não são descartadas silenciosamente; continuam exigindo resolução explícita se ativas. Sem testes funcionais/browser.

F37 — fila Fitness na rotação Ciclos compacta em linha com setas entre nomes, wrap responsivo, sem números/Hoje redundantes. Membro atual verde e aria-current step; Passo no cabeçalho preservado. Sem testes executados.

Publicação F14–F37 solicitada pelo usuário: lote inclui sequências compartilhadas, proteção sync, histórico XP, CHECKIN/LIVE, reversão e refinamentos widget. Commit/push para origin/main nesta operação. Migrações SQL apenas versionadas, sem aplicação remota; validação visual pendente.

F38 — 9novos exercícios enviados pelo usuário adicionados ao catálogo Calistenia, total21. Pike original preservada. Avançado aceito/mapeado; defaults explícitos opcionais precedem parser, Dragon Flag reps4×5. Catálogos existentes recebem defaults ausentes por ID e nativeCatalog gera UUID apenas para novos itens. Templates/histórico/customizações preservados. Primeira inserção detectou sintaxe inválida na validação, corrigida antes de concluir. ESLint dois arquivos passou; tsc -p tsconfig.app.json global segue com falhas preexistentes, saída filtrada sem erros em calistenia/workoutStore. Sem testes funcionais/browser, commit/push ou sync cloud.

F39 — tags primaryMuscles/secondaryMuscles por ID em21 exercícios Calistenia, preservadas no converter e preenchidas nos catálogos salvos apenas quando ausentes, sem alterar muscleDistribution/pontos/UUIDs/templates/histórico. MuscleExerciseCatalog usa FitnessListRow com leading opcional, pílulas regiões multiseleção OR, opção secundários, count/empty/Todos e nomes/emoji principais. FitnessRoot mantém catálogo integral disponível ao criador de treinos. ESLint primeira rodada passou, final em andamento; tsc app filtrado em andamento. Sem teste funcional/browser/commit/push.

F39 final: ESLint sete arquivos aprovado; tsc -p tsconfig.app.json continua limitado por falhas globais preexistentes, saída filtrada sem diagnósticos nos arquivos desta alteração. Reservas encerradas; validar UI no navegador.

F40 — revisão tags: Burpee controlado principais quadríceps/glúteos, peito secundário; Diamante inclui tríceps/peito como principais. Emoji agora segue primeiro principal, não ordem fixa dos filtros. Correção de perfis salvos somente se arrays coincidem exatamente com defaults antigos, preservando customizações/UUIDs e distribuição/XP. Pike foco Ombros mantido; percentuais Empurrar são fallback genérico, não calculam foco principal. Sem teste visual.

F41 — treino exibe emoji da região predominante no card biblioteca e widget Ciclos. getWorkoutFocus conta um voto por exercício pelo primeiro primaryMuscles do catálogo; agrupa músculos na mesma região, empate segue ordem dos exercícios; sem tags mantém ícone padrão. Sem ponderar séries/carga/percentuais, sem alterar pontos. ESLint passou; sem teste browser.

F42 — exercícios internos mostram emoji do primeiro músculo principal, helper getExerciseFocus compartilhado em composição da biblioteca e widget Ciclos. Sem tags omite emoji; preserva séries/badges. Sem teste visual.

F43 — modal criar/editar treino: Adicionar do catálogo tem botões40px apenas emoji por região, com title/aria-pressed/aria-label, Todos por ícone e toggle para limpar. Filtra músculos principais junto à busca, sem afetar exercícios já no plano; regiões compartilhadas com catálogo via muscle-regions.ts. ESLint três arquivos passou; sem teste visual.

F44 — exercícios listados em Adicionar do catálogo no modal exibem emoji principal junto ao nome, compartilhando getExerciseFocus; sem tags omite. Nome quebra linha, botão adicionar preservado. Sem testes executados.

Publicação F38–F44 solicitada: ampliação Calistenia, tags musculares e filtros/emoji em catálogo, cards e modal. Commit/push origin/main nesta operação; sem migração remota ou mudança de pontuação.

F45 — extraído SequenceLibraryCard compartilhado de WorkoutSequenceLibrary; seção Sequências em Ciclos usa mesma superfície FitnessCard/padding/ícone/typografia/composição. Core preserva passo, membro atual verde e Pausar/Retomar/Reiniciar/Detalhes com mesmos handlers; lista de execução/widget abaixo preservada. Sem mudança de stores/pontuação/persistência. ESLint3arquivos sem erros,2avisos hooks preexistentes Ciclos; sem validação visual/browser/commit/push.

F46 — resumo Sequências em Ciclos compacto com membros em linha/setas sem números, padding/ações menores. Clique no corpo da sequência WORKOUT abre /fitness?sequence=id; biblioteca centraliza/foca/destaca card correspondente após importar legado. Botões administrativos separados do botão corpo, sem navegação acidental. Sequências genéricas abrem detalhes Core. ESLint sem erros,2avisos hooks preexistentes Ciclos; sem teste browser.

F46 verificação: primeiro lint detectou sintaxe no link Detalhes; corrigida, segundo lint passou sem erros (2avisos preexistentes).

F47 — edição sequência: formulário preenche nome/descrição/templates/ordem, permite add/remove/reordenar com mínimo2 e valida disponibilidade; botão Editar sequência no card Treinos. saveSharedWorkoutSequence permite edição ativa e reconcilia via Core replaceMembers; preserva IDs/histórico/membershipIDs dos retidos, cria apenas novos hábitos, libera removidos sem apagar registros/agendas. Agenda/status/ID da sequência preservados; posição acompanha membro anterior quando retido, senão primeiro. Impede remover membro com sessão ativa. Planejamento sem vínculos não cria hábitos. ESLint5arquivos passou; tsc app limitado por contratos preexistentes, corrigido fallback updatedAt no DTO; revisão filtrada final em andamento. Sem teste funcional/browser/Supabase/commit/push.

F48 — botão SkipForward pequeno em resumo e card execução da rotação; skipCycleSequence valida hoje/ativa/membros/não concluída/não em progresso e avança circular ilimitado sem recompensas/histórico. cursorDate evita duplo avanço automático após pulos; cálculo posição extraído e compartilhado Core/Ciclos. UI bloqueia sessão nativa ativa; drafts por hábito preservados. Snapshot de rotação no recibo inclui cursorDate e undo restaura. ESLint sem erros2avisos hooks preexistentes; tsc app filtrado em andamento, sem testes funcionais/browser/Supabase/commit/push.

F48 verificação: tsc app mantém falhas legadas Habit semantic/startDate/sortOrder e TaskItem; nenhum diagnóstico na nova resolução/ação skip. Removida declaração updatedAt duplicada de CycleSequence detectada na checagem. Não declarar compilação global aprovada.

F49 — ordem global solicitada: Santuário/Pilares/Ciclos/Mais (Pilares2º, Ciclos3º). Commit/push F45–F49 solicitado nesta operação; cards compartilhados/edição e pulo circular incluídos, sem migração remota. Validação funcional pendente.
