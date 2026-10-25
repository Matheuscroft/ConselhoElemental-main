# R24 — Roda do Destino gratuita

24/10/2026 · 0.1.64 · base `91fa5a5` · branch `codex/fitness-ui-integration`.
Astro Boy executou sequencialmente. R15–R23 preexistentes preservados.

## Decisão explícita de produto

Fábio pediu que a roda ajudasse a escolher uma atividade real, sem precisar decidir o que fazer. Ao ser consultado sobre a economia antiga, respondeu: **“Sim, escolher atividades sem custo nem XP automático”**. Autorização restrita ao sorteio: removidos custo local de stamina, espaços de bônus e concessão direta de XP nesta página. Concluir atividades continua usando os comandos existentes. Não muda fórmulas gerais, recompensas históricas, Prana, dados ou persistência.

Índice canônico consultado: `docs-conselho-master/README.md`; capítulos Ações e Hábitos e Lista Diária. Não encontrada especificação canônica própria do Cassino. O comportamento anterior foi identificado no código: até três tarefas + três hábitos, espaços extras de XP, custo de 20 stamina de sessão e concessão por addExperience. Não tratar esse comportamento antigo como requisito aprovado.

## Entrega

- Roda SVG com runas próprias, metais escuros/ouro e tons dos quatro elementos; layout limitado pela largura disponível e controles de toque de 48px.
- Tarefas pendentes, ciclos por recorrência existente e jornadas em andamento. Notas e tarefas/jornadas concluídas não participam. Sem limite artificial às três primeiras atividades.
- Filtros por tipo e elemento; ciclos de hoje ou próximos sete dias. Cada ciclo participa uma vez, na primeira data disponível. Uma ocorrência já concluída hoje pode participar em outro dia elegível no período semanal.
- Projeção utiliza `getHabitsForDate` do store para respeitar recorrência/sequências. Não implementa um segundo calendário nem altera sequências.
- Seleção uniforme por item elegível; catálogo é congelado durante o giro. Até 12 opções: setores numerados correspondem à lista. Acima disso: anel simbólico declarado, sem ponteiro enganoso, e todas as opções continuam elegíveis.
- Resultado inline com imagem elemental, nome e link real. Após a escolha, o disco/lista da última escolha permanecem estáveis; disponibilidade do resultado é conferida contra dados atuais. Atividade concluída/removida/fora do filtro não oferece ação obsoleta.
- Links para Rituais abrem a lista filtrada pela atividade; Ciclos abre a data sorteada e a rotina filtrada; Jornadas usa a trilha existente. A busca textual pode incluir homônimos. Nenhum link inicia execução ou concede recompensa.
- Giro respeita movimento reduzido. Bloqueio síncrono de repetição, cleanup de timeout/listener e workspace reiniciado por conta implementados; interações reais ainda precisam de QA.

## Arquivos e fronteiras

`src/components/destiny/`, `src/pages/CassinoArcano.tsx`, entrada de navegação em `src/lib/app-routes.ts`, leitura de parâmetros de apresentação em Rituais/Ciclos e `tests/elemental/destiny.test.mjs`. Manifests e changelog em 0.1.64.

Nenhuma alteração em `src/stores`, `src/services`, `src/types` ou `supabase`. Comparação AST com snapshots anteriores ao R24 confirmou 189 inicializadores internos de Rituais e 360 de Ciclos preservados. Os corpos das páginas mudaram para receber parâmetros; esse teste não equivale a execução dos handlers.

## Verificação

- Seis testes novos: catálogo real completo/imutabilidade, ocorrências/semana/deduplicação, filtros/URLs/intervalos aleatórios, alinhamento após giros repetidos, datas locais válidas e SVG para 0/1/12/13 opções.
- Suíte completa: 134 testes Node aprovados.
- TypeScript e lint aprovados após correção. A primeira execução do lint apontou setState em effects das duas páginas; ajustado para sincronização condicionada ao identificador de navegação, sem efeito de renderização em cascata. Não houve supressão da regra.
- Build Vite com `envDir:false` aprovado em 11,79s; avisos de chunks acima de 500kB e Browserslist antiga permanecem.
- `git diff --check` e conferência de versões executados no fechamento.
- Evidência temporária: `/tmp/conselho-r24-{tests,tsc,lint,build}.log`. Esses arquivos não são entregues como dependência portátil.

**Pendente:** QA renderizado 360/390/768px, execução dos links, toque repetido, troca de conta durante giro, nomes longos, estado vazio e movimento reduzido no dispositivo. Bloqueio anterior do navegador não contornado. Inspeção/SSR/build não comprovam fluidez nem aceite visual.

Revisão documental pelo coordenador; revisão independente pendente. Sem deploy, migração ou comunicação externa. Checkpoint local solicitado posteriormente por Fábio, reunindo R15–R24; detalhes em CONTINUIDADE.
