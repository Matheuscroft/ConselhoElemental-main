# R12-C — catálogos e criação integrada

23/10/2026 · versão 0.1.51 local · HEAD `987e09e` · branch `codex/fitness-ui-integration`.

**Implementado localmente, em revisão visual.** Continuação autorizada por Fábio após R12-B. Escopo: páginas Jornadas/Grandes Obras, QuestComposer e CSS de apresentação. Trabalho anterior preservado.

## Experiência entregue

- Cada cartão ganha acesso direto à trilha, disponível mesmo recolhido. Showcase continua expansível e mantém o acesso aos detalhes; obras concluídas/arquivadas usam “Consultar trilha”. Os links continuam usando `trailHref` e IDs existentes, sem iniciar execução.
- Cabeçalhos passam a explicar a finalidade da página, mostrar contagens existentes e oferecer criação completa. O mapa ilustrativo de Jornadas sem ações foi substituído por orientação curta; a contagem de jornadas concluídas permanece.
- “Nova Jornada” e “Nova Grande Obra” abrem o mesmo compositor de quests com tipo inicial adequado. Ao concluir a criação pelos comandos existentes, o usuário abre a trilha resultante. O seletor de tipo permanece livre; o link usa a chave retornada, mesmo se o usuário trocar o tipo.
- “Criar só com nome” mantém a operação anterior de criação rápida e os mesmos defaults de domínio. A ação equivalente no estado vazio tem o mesmo nome para não sugerir que abre outro fluxo.
- Detalhes e criação rápida usam superfície elemental, runas, descrição acessível e campos identificados. Controles de campanha ganham rótulo e alvo de toque. Progresso, datas, recompensas, bônus e composição continuam visíveis com os valores anteriores.
- Ações finais do compositor ficam aderentes à borda inferior durante rolagem, com espaço de rolagem para campos. Nenhuma etapa foi removida; validação e comandos permanecem existentes.
- Animações de página existentes estão sob `MotionConfig reducedMotion="user"`; transições CSS novas respeitam movimento reduzido.

## Direção e limites

Cinzel/Inter, azul escuro, dourado e cores elementais existentes. Títulos alinhados à esquerda, cartões expansíveis com link direto separado e detalhes em diálogo. Nenhuma nova biblioteca, regra de progresso, importação de UI Duolingo ou dado demonstrativo. Revisão de componentes: mesma ordem de hooks, propriedades opcionais tipadas, rotas geradas por helper existente, SVG decorativo e controles HTML nativos. Sem agente de revisão independente.

Os snapshots de detalhes/macro podem divergir dos registros vivos como já documentado; handlers e cálculos não foram reescritos nesta rodada. A lista de campanhas e sua criação existentes permanecem; seleção avançada de capítulos na trilha e edição completa de composição não foram acrescentadas. Não chamar esta entrega de reformulação concluída de todas as páginas.

## Verificações executadas

- `node --test tests/quests/*.test.mjs tests/elemental/*.test.mjs`: **54/54 passaram**. Suíte existente de unidade/callbacks/SSR; não prova criação e navegação em navegador.
- `./node_modules/.bin/tsc -b`: passou.
- `npm run lint`: passou sem erros/avisos.
- Build Vite pela API com `envDir:false`: passou em 7,83 s. Avisos de chunks grandes e Browserslist desatualizado permanecem.
- Comparação AST: `openQuestDetail`, `handleCreateQuest`, `openProjectDetail`, `handleAddMission`, `handleCreateProject` idênticos à cópia do início do lote.
- Snapshot SHA-256: somente quatro fontes preexistentes mudaram nesta rodada: Jornadas, GrandesObras, QuestComposer e quests.css. Compositor altera apenas tipo inicial/reset e rótulo do gatilho; `createQuestPlan` permanece intacto.
- Diff contra HEAD vazio em stores/lib/types/services/constants/Supabase e quest-commands/quest-path. Não houve alteração de backend, XP/Prana, recorrência ou persistência.
- `git diff --check`, versões e links conferidos ao encerrar. Logs locais: `/tmp/r12-c-tests.log`, `/tmp/r12-c-build.log`; snapshot `/tmp/r12-c-before.json`.

**QA visual/funcional pendente:** acesso ao navegador recusado anteriormente por preferência salva; sem nova tentativa/contorno neste lote. Sem capturas, FPS, criação real, teste de foco real ou sincronização remota. Testes locais não substituem esses critérios.

## Retomada

Validar catálogos→criação completa→trilha e criação rápida→detalhes, tipo inicial e troca livre, capítulos, filtros ativo/concluído/arquivado, teclado/Escape, nomes longos, sticky footer com teclado móvel e zoom 200%, nas larguras 360/390/768/1440. Revisar divergência de snapshots em lote específico; não corrigir cálculo como efeito colateral do layout. Fragmentos/streak enriquecido seguem R12-D/E, com decisões do proprietário e contrato de Matheus.

Reservas encerradas, documentação revisada pelo coordenador. Sem secrets, commit, push, deploy ou migração. Versão 0.1.51 sincronizada nos manifests/changelog; planos e implementações R12 ainda locais.
