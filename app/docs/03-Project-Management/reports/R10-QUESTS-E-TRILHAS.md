# R10 — Quests e trilhas elementais — 0.1.47

Atualizado em 23/10/2026. Astro Boy, execução sequencial, checkout `app` na branch `codex/fitness-ui-integration`, base `f07292f`. Implementação local concluída; **em revisão, com QA visual e fluxo no navegador pendentes**. Não representa aceite visual nem publicação. Alterações anteriores I03/R01–R09 preservadas.

## Decisão de produto

Usuário pediu referência Duolingo aplicada à gestão pessoal: quests executáveis, progresso de Jornadas/Grandes Obras e próximas etapas no Santuário, mantendo magia elemental. Resposta explícita: **próxima etapa sugerida, com acesso livre às demais**. Não há bloqueio por pré-requisito, vidas, punição por ausência ou motor adicional de recompensas.

A referência é um kit comunitário de telas, identificado no próprio arquivo como reconstrução para um desafio de design. Não contém o motor de regras do Duolingo. A entrega adapta padrões de interação; não reproduz sua marca, mascote ou todas as suas mecânicas.

## Referência efetivamente consultada

[Figma Community — arquivo fornecido pelo usuário](https://www.figma.com/design/g5rrLsKdGs9f5QXsxEsGH6/DuoLingo-Design-System--Community-?node-id=24-482).

Acesso pelo MCP Figma. Inventário estrutural das páginas Cover (`24:482`), Components (`0:1`), Existing Flows (`11:4093`) e Design Challenge (`11:4094`). Contexto de design e imagens inspecionados para:

| Frame/componente | Nó | Padrão aproveitado |
| --- | --- | --- |
| Lesson Track | `9:1212` | Percurso vertical com nós em relevo e estados distintos |
| Select Lesson | `11:2022` | Etapa selecionada revela contexto e ação principal |
| Quest Completion | `8:2790` | Progresso legível e feedback por conquista |
| Lesson Complete | `11:1892` | Retorno de conclusão com resultado registrado |
| Streek Progress | `8:3209` | Clareza da continuidade; não foi criado outro cálculo de sequência |
| Button | `8:1085` | Relevo, pressão, foco e hierarquia de ação |
| Level | `9:725` | Diferenciação de próxima etapa/concluída/disponível |

Inventário não equivale a inspeção visual de cada asset do arquivo. Os demais módulos de onboarding, idiomas, respostas e áudio não foram copiados: pertencem ao contexto de ensino do kit. Foco desta adaptação: execução de atividades reais. Ícones próprios, fundo escuro, ouro, selos e tipografia elemental existentes foram preservados; nenhuma dependência ou asset remoto novo foi instalado.

## Fluxo entregue

1. **Rituais → Quests** abre as trilhas. A lista anterior permanece em **Lista de rituais**, com criação, edição, subetapas, filtros, conclusão e reversão existentes.
2. **Nova quest** permite nomear uma Jornada ou Grande Obra, escolher elemento e listar etapas. Uma Grande Obra recebe seu primeiro capítulo. Todos os registros são criados pelos métodos existentes e IDs reais retornados pelo store.
3. Seletor alterna entre trilhas existentes. Nós mostram capítulo/contexto, estado e próxima etapa; qualquer etapa pode ser selecionada. Detalhe expande em posição, sem salto ao topo causado pela mudança de query.
4. Ritual simples abre o cronômetro elemental existente. Pausar, retomar e concluir passam pelo proprietário atual do timer. Fechar o diálogo não reinicia nem descarta o tempo. Outra atividade, mesmo pausada, impede substituir o cronômetro.
5. Conclusão exibe pontos registrados, diferença de XP do getter existente e tempo efetivo. O botão seguinte apenas abre a próxima etapa; não inicia atividade nem concede recompensa novamente.
6. Rituais com subetapas abrem a lista existente. Ciclos recorrentes vão a Ciclos; atividades nativas de treino vão a Treinos. Não são concluídos pelo atalho simples da trilha.
7. É possível adicionar uma etapa à Jornada ou a um capítulo existente da Grande Obra. Gestão dos capítulos permanece em Grandes Obras.
8. **Santuário** mostra até três próximas quests, deduplicando ações compartilhadas entre agregadores; atalhos incluem trilha e etapa na URL. Jornadas e Grandes Obras têm links de seus detalhes para a trilha correspondente.
9. Trilhas concluídas/arquivadas são consultáveis; referências removidas e links indisponíveis não iniciam atividades. A interface de composição reinicia quando a conta muda.

## Integração e limites do domínio

Fontes canônicas consultadas: índice `docs-conselho-master/README.md`, capítulos versionados de hierarquia/tipos e ações/hábitos. Contratos conferidos no código atual.

- `quest-path.ts` é uma projeção de leitura. Resolve snapshots de agregadores pelos IDs em `tasks`/`habits`, respeita `itemOrder`, reúne capítulos e deduplica ações. Um registro removido não recebe conclusão ou pontos inferidos.
- **Divergência preexistente:** `completeTask` atualiza tarefas reais, mas não sincroniza todas as cópias aninhadas nem a porcentagem persistida dos agregadores. A trilha mostra explicitamente **rituais concluídos / total de rituais**; não grava `.progress`, não conclui a macro automaticamente e não concede seu bônus. A contagem pode diferir da porcentagem legada de Jornada/Obra. Corrigir essa sincronização exige lote de domínio próprio.
- Hábitos continuam recorrentes e fora da contagem finita de rituais. Não existe novo histórico, agenda, persistência ou saldo paralelo.
- Criação usa `addQuest`, `addProject`, `addMissionToProject`, `addTaskToQuest` e `addTaskToMission`. Composição macro inicia em `area-sem-categoria`; configuração detalhada de áreas/duração/esforço permanece no editor existente. Não há nova fórmula nem estimativa de recompensa.
- Os comandos de composição do store são síncronos e não formam uma transação nova. Uma falha excepcional durante várias gravações pode deixar uma composição parcial, revisável nas páginas existentes; não há exclusão automática para simular rollback.
- Timer reutiliza `sanctuary-timer.ts`; minutos são os segundos efetivos divididos por 60, sem novo arredondamento. `finishQuestStep` confirma a conclusão real antes de mostrar recibo, bloqueia caminho simples para agregadores e treinos nativos e não premia duas vezes.
- Troca de conta reinicia estado visual e callbacks conferem a conta capturada antes de comandos. Deep links apenas selecionam; não executam atividade.
- `ScrollToTop` ganhou exceção delimitada a seleção explícita dentro de `/rituais`. Entrada externa/troca de página continua com o comportamento anterior. Nenhuma outra navegação foi reescrita.

## Arquivos do lote

- Novos: `src/components/quests/{QuestHub,QuestComposer,QuestTrailMap,QuestNextSteps}.tsx`, `quest-path.ts`, `quest-commands.ts`, `quest-navigation.ts`, `quests.css`.
- Integrações: páginas `Rituais`, `Jornadas`, `GrandesObras`, `ElementalPreview` e `components/layout/ScrollToTop`.
- Testes: `tests/quests/path.test.mjs` e `commands.test.mjs`.
- Manifests, changelog, índice, fila, continuidade, manual e dossiê atualizados para 0.1.47.

## Verificações executadas

Em 23/10/2026, após concluir os ajustes:

- `node --test tests/elemental/*.test.mjs tests/cycles/*.test.mjs tests/temporal/*.test.mjs tests/grimorio/*.test.mjs tests/quests/*.test.mjs`: **87/87 passaram**, incluindo 20 novos de quests. São testes Node, projeção, callbacks e markup de servidor; não são E2E de navegador nem teste de persistência real.
- Casos novos: snapshots antigos versus dados atuais/Undo, referências removidas, ordem, hábitos recorrentes, capítulos, deduplicação, trilhas finalizadas/arquivadas, URLs, todos os nós selecionáveis, escape de conteúdo, comandos com IDs reais fornecidos pelo proprietário, validação antes de gravação, conta divergente, destino inválido, tempo fracionário, conclusão repetida, timer de outro item, falha sem recibo, exclusão de treino/agregador do caminho simples e exceção de scroll.
- `tsc -b`: passou.
- ESLint nos componentes quests, ScrollToTop e quatro páginas integradas: passou sem erros/avisos.
- Build Vite via API com `envDir:false`: passou em **7,04 s**. Avisos de Browserslist desatualizado e chunks grandes permanecem. Não é teste de desempenho no dispositivo.
- SHA-256 comparado com snapshot de 298 arquivos de `src`/Supabase do início do lote: somente as quatro páginas e ScrollToTop mudaram entre os arquivos preexistentes. **64 arquivos de stores/lib/constants/services/types/Supabase intactos.** Novos arquivos de quests são separados dessa comparação.
- Comparação AST das funções nomeadas sem JSX nas quatro páginas: **34 preservadas** (Rituais 21, Jornadas 2, GrandesObras 3, ElementalPreview 8). Essa verificação não prova equivalência integral de UI.
- Evidências temporárias locais: `/tmp/r047-tests.log`, `/tmp/r047-functions.json`, `/tmp/r047-preservation.json` e snapshot inicial `/tmp/r047-before.json`. Podem ser removidas pelo sistema; resultados essenciais estão registrados aqui.

## QA pendente e retomada

A preferência salva de localhost havia recusado acesso do agente no navegador, mesmo com autorização humana. Não houve nova alegação de desbloqueio efetivo nem contorno por outro navegador/porta. **Renderização, fidelidade visual, foco/rolagem real, toque e persistência via UI não foram validados nesta entrega.**

Após acesso efetivo, usar conta/dados isolados e validar em 360/390/768/1440 px:

- Nova Jornada com duas etapas e Grande Obra com primeiro capítulo; confirmar IDs/criação/reload sem duplicação.
- Santuário → etapa específica; acesso livre à etapa posterior, voltar/avançar, link inválido e troca de trilha.
- Timer iniciar/pausar/fechar/retomar/reload, outra atividade pausada, concluir uma vez, recibo, próxima etapa e foco.
- Undo na lista refletido na trilha; renomear/remover tarefa e trocar conta sem dados visuais antigos.
- Projetos antigos, capítulos vazios, macro concluída/arquivada, hábitos recorrentes e ações nativas Fitness.
- Teclado, leitores de tela, movimento reduzido, títulos longos, teclado mobile e ausência de sobreposição com navegação inferior.

Revisão documental pelo coordenador; revisão independente pendente. Reservas encerradas. Sem secrets, deploy, migração, edição de backend/fórmulas, commit ou push. Demais pendências da repaginação permanecem na fila.
