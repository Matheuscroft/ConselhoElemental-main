# R29 — XP de atividades e gamificação visual

27/10/2026 · 0.1.80 local · base b11ed9d · branch codex/fitness-ui-integration. Astro Boy, execução e revisão sequenciais. Pedido de Fábio: concluir atividades deve evoluir o personagem e dar estímulo visual. O pedido autoriza corrigir a integração de XP; não foi usado para mudar Prana, tempos, fórmulas de pontuação ou curva de níveis.

> Continuidade posterior: [R29-R/B — 0.1.81](R29-RECUPERACAO-E-RITUAIS.md) implementa recuperação explícita de Ciclos e crédito/Undo de Rituais. As tabelas e evidências abaixo registram o estado histórico de R29-A.

## Causa reproduzida e entrega R29-A

O teste `tests/cycles/rewards.test.mjs` executou o store Zustand real com armazenamento vazio em memória: completar hábito gravava HabitCompletion e recalculava totalScore/constância, mas nenhum saldo xp_earth/xp_fire/xp_water/xp_air aumentava. O primeiro teste falhou em `completion must advance avatar XP` antes da alteração. O nível lê esses quatro saldos, não totalScore. Portanto era uma lacuna de concessão, não apenas arredondamento da barra.

Novas conclusões de folhas VALUABLE em Ciclos agora creditam no elemento da atividade **1 XP por ponto calculado pela função de execução já existente**, sem novos multiplicadores ou bônus fixos. Regra operacional identificada como `cycle-xp-v1`, baseada no resultado atual; não reconcilia a fórmula legada com todas as divergências canônicas. O usuário autorizou recompensa de XP; o coeficiente 1:1 é a decisão de implementação deste lote, não uma citação numérica do usuário.

- `HabitCompletion` ganha campos opcionais `xpAwarded`, `xpElementId`, `xpRuleset`. Registram concessão real e o elemento original, para não depender de alterações futuras no planejamento.
- Conclusão e crédito são escritos no mesmo update local do store. `applyCycleXpDelta` só contabiliza diferença entre os recibos antes/depois; não é outro motor de pontuação e não roda na hidratação.
- Pai/agregador recebe zero diretamente. No comando existente que conclui todos os descendentes, cada folha nova recebe sua pontuação de execução com zero minutos, coerente com o tempo zero gravado nesse recibo automático. O tempo informado ao pai não é inventado/distribuído entre filhos. Pais marcados por propagação não duplicam os ganhos.
- Undo debita apenas XP registrado nos recibos removidos, do elemento original; repetição não paga novamente na mesma ocorrência. Novos dias têm ocorrências independentes. Sem soma de XP por quantidade extra: permanece a decisão anterior de contadores informacionais com conclusão separada.
- NOTE/VALUELESS e agregação não viram trabalho remunerado. Criação de rascunho, agendamento, navegação e sorteio também não são conclusão de atividade.
- **Sem backfill:** recibos anteriores não têm metadados de concessão; não são creditados retroativamente nem debitam XP de outras fontes. Não migrar saldos pessoais por inferência. A reparação histórica precisa de simulação e reconciliação próprias.

Os pontos totais legados de subitens continuam tendo divergências: `collectHabitScoresAndCompletionDays` agrega recibos de raízes, enquanto folhas podem ter recibos próprios e raiz automática com score zero. Este lote corrige XP; não reescreve esses pontos nem históricos.

## Retorno visual em Ciclos

`CycleRewardNotice` apresenta XP real do recibo, elemento(s), barra de experiência do personagem e anúncio quando o LevelingCalculatorService confirma nível maior. Usa a identidade elemental, superfície translúcida, ícone e entrada breve; barra anima por transform. Movimento reduzido remove entrada/rotação/transição. Duração de 5 segundos, botão Fechar com alvo de 44px e limite de altura com rolagem para conteúdo maior. Nenhuma animação concede recompensa.

Conclusões rápidas são reunidas sem duplicar recibos; Undo remove as revertidas. Dispensar reinicia o agrupamento. Abrir histórico, hidratar ou trocar conta não reproduz celebração; timers/listeners são liberados. A interface é um recibo efêmero local, não novo histórico persistido. Layout/toque/FPS/leitor de tela permanecem pendentes, pois o usuário escolheu revisão somente por código.

## Auditoria de cobertura e próximos lotes

| Caminho | Evidência atual | Continuidade |
| --- | --- | --- |
| Ciclo raiz, folha/subitem e sequência que usa completeHabitChild | R29-A implementado e testado com store real isolado | Aceite mobile e casos de sequência completa na UI pendentes |
| Ritual simples | completeTask concede Math.round(score / 2); recibo de trilha lê delta real | Preservado. UncompleteTask comum não debita XP: revisar simetria com snapshot, sem estimar valores históricos |
| Subitens de Rituais | completeTaskItem acrescenta pontos e propaga estado, sem addExperience | R29-B: crédito por folha com idempotência e Undo; evitar duplicação no fechamento do pai |
| Treino nativo | Adapter de ExecutionLog credita XP; undoNativeHabitCompletion possui reversão | Preservado. Não acrescentar pagamento por série; conferir integração do recibo visual |
| Treino legado | workoutStore mantém cálculo e crédito próprio de compatibilidade | Preservado; regressão específica antes de unificar apresentação |
| Jornadas/Grandes Obras | UI anuncia xpBonus; updateQuest/updateProject são updates simples; progress é projeção | R29-C: fluxo explícito de concluir/reabrir + recibo imutável de bônus, sem fechar hábito recorrente ou pagar pai por inferência |
| Forja, contador de quantidades e Roda | Organização/registro/sorteio, sem execução válida nova | Sem recompensa automática; decisões anteriores preservadas |
| Todo o app | Existem recibos em Ciclos, trilha de Rituais e Treinos; estilos/acionamentos ainda distintos | R29-D: apresentação compartilhada após contratos, cobrindo sucesso/Undo/nível sem sobrepor recibos |

Essa tabela é inspeção do código para os caminhos fora de Ciclos, não teste de integração de todos os módulos. O pedido de XP em todas as atividades ainda não está integralmente concluído. Prioridade seguinte: R29-B (Rituais/subitens/Undo), depois R29-C e R29-D. Etapa antiga R28-F5 de contexto/cancelamento fica depois da integridade das recompensas. R25 backup/conta continua pendente e prioritário antes de migração de dados pessoais; fragmentos e bônus de constância não foram criados por esta rodada.

## Evidências executadas

- Dez testes novos: concessão/elementos/dias/repetição, undo depois de editar elemento e pontos, rehidratação em storage de memória, agregadores/cascatas/subitens, legado, semântica e atomicidade local; markup do recibo e avanço de nível pelo calculator real; listener com dublês de hooks/timers para dispensar/undo/conta/hidratação/expiração.
- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **221 passaram**.
- `tsc -b`, `npm run lint`, build Vite `envDir:false`: passaram; build **16,92s**. Avisos de chunks grandes e Browserslist permanecem.
- `git diff --check`: passou. Versões 0.1.80 sincronizadas. Revisão de código, React e documentação pelo coordenador, sem revisor independente.
- Logs locais: `/tmp/conselho-r29-{tests,types,lint,build}.log`.

Não executados: navegador/mobile/FPS, leitura de dados pessoais, integração remota/Supabase, migração/backfill, suíte Deno nativa, deploy ou push. Alterações preexistentes preservadas. Não alegar que o armazenamento de memória confirma persistência/sync no aparelho do usuário.

## Impacto para Matheus

Fábio segue frontend; este pedido explícito exige ajuste delimitado no crédito local de XP. Campos novos opcionais são compatíveis com recibos antigos. Matheus deve considerar preservação desses campos na serialização/sync futura e contratos equivalentes no backend, além de atomicidade/idempotência remota; isso não foi implementado no servidor. Sem secrets, schema migrations ou chamadas externas. A fila canônica continua em FILA-ENTREGAS.md.
