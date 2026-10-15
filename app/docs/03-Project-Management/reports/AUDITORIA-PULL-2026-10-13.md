# Auditoria completa do pull — 13/10/2026

> Atualização posterior: Matheus determinou restaurar ER×0.10 e sessão consolidada. A fórmula importada deixou de ser vigente nos caminhos de pontuação após essa restauração local. Ver [decisão e comparação para debate](DECISAO-MATHEUS-PONTUACAO-2026-10-13.md). O restante deste relatório descreve o snapshot importado, não a regra vigente após a decisão.

## Escopo e limite

Comparação **b1575e4 → fe1a8fe**, exatamente o commit obtido por pull. Inventário completo: **73 arquivos**, 1515 linhas adicionadas / 374 removidas e uma imagem nova. As correções locais posteriores não fazem parte desse diff. Inspeção de código/documentos; não executei testes, build ou fluxos de navegador nesta auditoria. Evidências declaradas no changelog remoto não equivalem a validação executada aqui.

Fábio atua em UX/UI conforme instrução explícita do proprietário. Mudanças de pontuação precisam de aprovação explícita do proprietário; o status “Aceito” do ADR importado não comprova essa aprovação. A matemática importada continua ativa até uma mudança de código específica: esta auditoria não a reverte.

## 1. Mudanças de pontuação que precisam de crivo

| Regra | Antes (b1575e4) | Importado (fe1a8fe) |
|---|---|---|
| Unidade de pontuação | Sessão consolidada, uma folha com teto único | Cada série é um bloco pontuado; resultados somados |
| Base de repetições | ER × 0.10 | ER × 0.10 × 2 |
| Base de duração | ER × 0.10 | ER × 0.10 |
| Esforço | Esforço global 1–5 | RPE por série 1–10 → round(RPE/2), limitado a 1–5; ausência usa global |
| Teto | Um teto do esforço para o treino | Teto por série/bloco; total pode exceder o teto antigo |
| Tempo LIVE enviado ao Core | Tempo de relógio real da sessão | Tempo ativo dos blocos: reps × 4s e duração registrada; relógio separado |
| Tempo CHECKIN usado no XP | Tempo declarado proporcional ao planejamento | Tempo ativo dos blocos; tempo planejado deixa de determinar XP |
| Presença | Faixas de presença do tempo da sessão; CHECKIN assume planejamento | Mesmas faixas, mas tempo de entrada agora é ativo |
| Prana | Custo pelo esforço global, uma vez por sessão | Custo pelo esforço agregado ponderado pela base, uma vez; zero se não há blocos |
| XP por exercício | Parcela proporcional de ER do total com teto único | Soma de recompensas dos blocos daquele exercício |
| Sem séries elegíveis | Caminho anterior ainda podia cobrar custo do esforço | Zero XP e zero custo de Prana |
| Versão do recibo | core-native-leaf-v3 | core-native-workout-block-v2 quando usa blocos |

**Segmentar trabalho igual em mais séries pode aumentar XP**, porque há teto por bloco. O texto do ADR reconhece esse efeito. Os multiplicadores/tetos tabelados não foram substituídos, mas a forma de aplicá-los mudou. ER é mantido; base_value e recompensa não são equivalentes à regra anterior. Prévia, conclusão e widget usam partes desse novo caminho. Recibos antigos não são recalculados pelo novo calculador.

Também houve mudança funcional no Core: addExperience/addElementExperience corrigem o destino das chaves de Terra/Fogo/Água/Ar. Fórmula de níveis em leveling-calculator não foi alterada, mas a leitura visual de nível/XP foi alterada em Santuário, layout, sidebar e Grimório.

## 2. Navegação de modalidades e regressão identificada

Modalidade continua sendo o conceito para Calistenia, Yoga, Corrida etc. Não passou a ser treino nem subárea Core.

Antes: raiz com grade de modalidades; clicar abria o conteúdo interno, cabeçalho com nome da modalidade e Voltar às modalidades. Clicar em Treinos voltava à grade inicial.

Importado: grade e conteúdo na mesma tela; clique só altera query modalidade; Corrida selecionada por padrão; header fixo “Escolher treino”; voltar vai a Pilares; aba Treinos não limpa modalidade. Catálogo permanece no código, porém abaixo de controles/Meus treinos, sem a organização de página dedicada anterior.

As rotas /dominios/yoga e /dominios/calistenia continuam redirecionando para /fitness?modalidade=...; o componente destinatário mudou seu comportamento. /treinos e /treinos/legado passaram a renderizar FitnessRoot. Painel, histórico, semana, insights e corpo antigos viraram redirects para abas.

Correção local desta auditoria: restaura a grade na raiz sem modalidade padrão, página interna com nome da modalidade e voltar à grade, e reset da aba Treinos. Mantém as novas abas/recursos restantes. Não altera pontuação.

## 3. O que permanece igual entre os commits

Arquivos de catálogo Calistenia (21 exercícios), perfis musculares, regiões/filtros, FitnessHabitWidget, biblioteca/card de sequências, compartilhamento de sequências, edição/reconciliação de membros, cálculo da fila/pulos, página Ciclos e supabaseCloudSync não têm diff entre os dois commits.

Isso não garante identidade de resultado: helper de recompensa chamado pelo widget/Adapter mudou, embora o arquivo do widget não tenha sido editado. A ordem global permanece Santuário/Pilares/Ciclos/Mais; Fitness passou a destacar Mais. Migrações Supabase não foram alteradas nesse commit.

## 4. Inventário completo por arquivo

| Operação | Arquivo | Linhas | Alteração |
|---|---|---|---|
| Modificado | `app/AGENTS.md` | +2 / −2 | Correção de caminhos da documentação. |
| Modificado | `app/docs/01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md` | +14 / −0 | Acrescenta regra por bloco v1 e v2: RPE, teto por série, tempo ativo e fator adicional de repetições. |
| Modificado | `app/docs/02-Platform-Architecture/01-Core-vs-Native-Modules.md` | +2 / −2 | Atualiza documentação do Adapter para recompensa por blocos. |
| Modificado | `app/docs/03-Project-Management/README.md` | +2 / −0 | Atualiza índices e links. |
| Modificado | `app/docs/03-Project-Management/fitness/CHANGELOG.md` | +62 / −0 | Registra versões 0.1.22–0.1.31 e evidências declaradas de outras entregas. |
| Novo | `app/docs/04-ADRs/ADR-003-Recompensa-Native-Treino-Por-Bloco.md` | +37 / −0 | Nova decisão de domínio para pontuação por bloco; importada com status Aceito sem comprovação de aprovação do proprietário. |
| Modificado | `app/docs/AGENTE-VERSIONAMENTO-DOCUMENTACAO.md` | +3 / −3 | Atualiza referências e procedimento documental. |
| Modificado | `app/docs/ASTRO-BOY-BOAS-VINDAS.md` | +13 / −8 | Atualiza capacidades, entregas e orientações de entrada. |
| Modificado | `app/docs/CONTINUIDADE.md` | +134 / −1 | Acrescenta entregas F50–F59, evidências e pendências. |
| Modificado | `app/docs/DOSSIE-TECNICO.md` | +5 / −1 | Atualiza dossiê e referências técnicas. |
| Modificado | `app/docs/FILA-ENTREGAS.md` | +60 / −0 | Registra novos lotes e estados de entrega. |
| Modificado | `app/docs/MANUAL-ENGENHARIA.md` | +2 / −0 | Acrescenta referências/procedimentos. |
| Modificado | `app/docs/MODALIDADES-E-METRICAS-TREINO.md` | +8 / −0 | Documenta novos recursos/métricas Fitness. |
| Modificado | `app/docs/PLANO-ORQUESTRACAO.md` | +6 / −0 | Acrescenta planejamento de entregas. |
| Modificado | `app/docs/README.md` | +2 / −1 | Atualiza índices e links. |
| Modificado | `app/package-lock.json` | +2 / −2 | Atualiza versão do pacote. |
| Modificado | `app/package.json` | +1 / −1 | Versão 0.1.21 → 0.1.31. |
| Novo | `app/public/fitness/body/mannequin-front-v1.png` | Binário | Nova imagem decorativa de manequim do Corpo. |
| Modificado | `app/scripts/astro-boy.mjs` | +4 / −3 | Atualiza script de coordenação. |
| Modificado | `app/scripts/astro-boy.test.mjs` | +5 / −1 | Atualiza testes do script; não executados nesta auditoria. |
| Modificado | `app/src/App.tsx` | +7 / −13 | Unifica /treinos e /fitness em FitnessRoot; rotas antigas de painel/histórico/corpo/saúde viram redirects. |
| Modificado | `app/src/components/fitness-kit/BodyMetricsCard.tsx` | +11 / −11 | Ajusta figura, grade de medidas, data da avaliação e espaçamentos. |
| Modificado | `app/src/components/fitness-kit/BodySilhouette.tsx` | +15 / −25 | Troca silhueta SVG pela imagem decorativa. |
| Modificado | `app/src/components/fitness-kit/FitnessBottomNav.tsx` | +9 / −8 | Quatro abas internas, query params e estilos Fitness. |
| Modificado | `app/src/components/fitness-kit/FitnessPageShell.tsx` | +3 / −3 | Ajusta casca e espaço para navegação/ações fixas. |
| Modificado | `app/src/components/fitness-kit/FitnessStickyAction.tsx` | +3 / −3 | Ajusta posição/layout da barra fixa. |
| Modificado | `app/src/components/fitness-kit/VideoExercisePlayer.tsx` | +5 / −1 | Ajusta apresentação e parâmetros de mídia. |
| Modificado | `app/src/components/fitness-kit/WorkoutSummaryView.tsx` | +6 / −6 | Adapta resumo compartilhado. |
| Modificado | `app/src/components/layout/AppLayout.tsx` | +6 / −5 | Nível/XP passam a ler getLevelProgress; ajuste de assinatura. |
| Modificado | `app/src/components/layout/MobileBottomNav.tsx` | +2 / −2 | Fitness destaca Mais em vez de Pilares; ordem de botões preservada. |
| Modificado | `app/src/components/layout/Sidebar.tsx` | +3 / −2 | Nível mostrado pelo cálculo de progresso atual. |
| Modificado | `app/src/components/sanctuary/CharacterStage.tsx` | +6 / −5 | Nível/XP do personagem passam a ler getLevelProgress. |
| Novo | `app/src/components/workout/CustomExerciseFields.tsx` | +21 / −0 | Novo formulário para exercício próprio. |
| Novo | `app/src/components/workout/FitnessDurationField.tsx` | +6 / −0 | Novo campo de duração. |
| Novo | `app/src/components/workout/NativeSessionDetails.tsx` | +77 / −0 | Novo detalhe nativo de sessão: séries, métricas, mídia, avaliação/evolução. |
| Excluído | `app/src/components/workout/NativeSessionHistory.tsx` | +0 / −27 | Componente anterior de histórico nativo excluído; histórico integrado em WorkoutHistory. |
| Modificado | `app/src/components/workout/NativeTemplateDialog.tsx` | +86 / −33 | Editor compartilhado reformulado: exercícios próprios, mídia, notas, data, configurações recolhidas e salvar/iniciar. |
| Modificado | `app/src/components/workout/exercise-detail.css` | +1 / −1 | Ajusta estilo da ficha de exercício. |
| Modificado | `app/src/lib/app-routes.ts` | +1 / −1 | Mais/Treinos deixa de apontar para menu Treino — Legado e aponta para /treinos. |
| Modificado | `app/src/lib/core/native-action-completion.ts` | +13 / −4 | Core aceita blocos, aplica nova calculadora, valida base e grava regra v2. |
| Novo | `app/src/lib/core/native-workout-reward.ts` | +130 / −0 | Nova calculadora de domínio por série: ER, RPE, base normalizada, tempo ativo, tetos e Prana. |
| Modificado | `app/src/lib/fitness-kit/adapters.ts` | +13 / −14 | Dashboards passam a aceitar sessões nativas/legadas e métricas compartilhadas. |
| Novo | `app/src/lib/fitness/activity-history.ts` | +29 / −0 | Novo modelo de leitura conjunta de sessões e métricas de atividade. |
| Modificado | `app/src/lib/fitness/fitness-insights.ts` | +5 / −4 | Atualiza análise de histórico para os dados compartilhados. |
| Novo | `app/src/lib/fitness/use-fitness-history.ts` | +10 / −0 | Novo hook de histórico conjunto. |
| Novo | `app/src/lib/workout/exercise-media.ts` | +14 / −0 | Novo resolvedor de imagem/vídeo, incluindo fallback Yoga. |
| Modificado | `app/src/lib/workout/fitness-core-adapter.ts` | +6 / −1 | Envia blocos e tempo ativo ao Core, em vez da base/tempo consolidados anteriores. |
| Modificado | `app/src/lib/workout/native-progress-reward.ts` | +9 / −6 | Badge acumulado muda para calculadora por bloco; muda contribuição XP por exercício. |
| Modificado | `app/src/lib/workout/native-reward-preview.ts` | +7 / −8 | Preview muda para calculadora por bloco; duração planejada deixa de determinar recompensa. |
| Novo | `app/src/lib/workout/native-session-reward.ts` | +16 / −0 | Novo resolvedor de XP real por recibo/snapshot/conclusão. |
| Novo | `app/src/lib/workout/session-clock.ts` | +7 / −0 | Novo cálculo de relógio com pausa. |
| Modificado | `app/src/lib/workout/workout-ids.ts` | +2 / −2 | Ajusta tipagem de loadFactor e retorno de ExerciseDraftConfig; não troca IDs. |
| Modificado | `app/src/pages/Corpo.tsx` | +10 / −8 | Modo embutido e remoção de cabeçalho duplicado. |
| Modificado | `app/src/pages/Grimorio.tsx` | +7 / −5 | Nível/XP passam a usar getLevelProgress. |
| Modificado | `app/src/pages/fitness/ActiveFitnessSession.tsx` | +39 / −20 | Mídia, RPE por série, distância/notas, pausa, navegação global e conclusão para resumo. |
| Modificado | `app/src/pages/fitness/ActiveWorkout.tsx` | +2 / −2 | Ajustes na execução legada/mídia. |
| Modificado | `app/src/pages/fitness/FitnessRoot.tsx` | +89 / −31 | Quatro abas, planos legados, prévia, editor; seleção de modalidade inline e Corrida padrão substituem navegação interna anterior. |
| Modificado | `app/src/pages/fitness/HealthDashboard.tsx` | +20 / −22 | Histórico conjunto; Prana do Core; anel Stamina trocado por treinos semanais; gráficos de tempo ativo. |
| Modificado | `app/src/pages/fitness/HealthInsights.tsx` | +8 / −8 | Evolução com histórico conjunto e apresentação atualizada. |
| Modificado | `app/src/pages/fitness/HealthWeeklySummary.tsx` | +20 / −11 | Semana/período/dia e métricas do histórico conjunto. |
| Novo | `app/src/pages/fitness/NativeWorkoutPreview.tsx` | +55 / −0 | Nova prévia nativa com programa, mídia, instruções e ações. |
| Modificado | `app/src/pages/fitness/WorkoutHistory.tsx` | +46 / −22 | Histórico cronológico conjunto, filtro de dia e entrada no resumo compartilhado. |
| Modificado | `app/src/pages/fitness/WorkoutPreview.tsx` | +12 / −4 | Integra prévia nativa e atualiza apresentação/rotas. |
| Modificado | `app/src/pages/fitness/WorkoutSelect.tsx` | +18 / −9 | Adapta entradas de biblioteca/editor às rotas unificadas. |
| Modificado | `app/src/pages/fitness/WorkoutSummary.tsx` | +53 / −2 | Resumo compartilhado para nativo/legado, recibos reais e detalhes. |
| Modificado | `app/src/services/leveling-calculator.ts` | +2 / −2 | Corrige contrato de chaves xp_fire/xp_earth/xp_water/xp_air; fórmula de níveis não mudou nesse diff. |
| Modificado | `app/src/stores/appStore.ts` | +45 / −2 | Corrige chaves de XP elemental; acrescenta campos Core em conversões Task→Habit/subitens; impacto além de UI. |
| Modificado | `app/src/stores/workoutStore.ts` | +47 / −13 | Exercícios próprios, novos campos por série, pausa, data, conclusão por blocos/tempo ativo e avaliação de sessões nativas. |
| Modificado | `app/src/types/index.ts` | +17 / −3 | Compatibilidade de tipos legados, User/Action/Habit/TaskItem e novas fontes de duração. |
| Modificado | `app/src/types/workout.ts` | +19 / −0 | Mídia, notas, distância, RPE, data de planejamento, pausa e duração ativa. |
| Novo | `app/tests/workout/fitness-history.test.ts` | +29 / −0 | Novos testes de histórico. |
| Novo | `app/tests/workout/native-reward-projection.test.ts` | +13 / −0 | Novos testes de projeção por bloco. |
| Novo | `app/tests/workout/native-workout-reward.test.ts` | +71 / −0 | Novos testes do motor por bloco. |

## 5. Diff integral

O arquivo [PULL-b1575e4-fe1a8fe.diff](PULL-b1575e4-fe1a8fe.diff) contém todos os hunks textuais desse pull, sem as mudanças locais posteriores. A imagem binária nova é registrada no inventário e pode ser inspecionada em app/public/fitness/body/mannequin-front-v1.png.

## 6. Estado após auditoria

- Código importado: fe1a8fe.
- Fórmula importada permanece em execução, pendente do crivo; não foi modificada nesta auditoria.
- ADR-003 anotado localmente como pendente de aprovação.
- AGENTS registra a fronteira UX/UI e a necessidade de aprovação de domínio.
- Navegação interna de modalidade restaurada localmente.
- Sem commit/push das correções locais ou aplicação de migração remota.


