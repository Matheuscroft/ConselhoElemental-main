# R29-R/B — recuperação de XP e Rituais

27/10/2026 · **0.1.81 local** · branch `codex/fitness-ui-integration` · base `b11ed9d`. Execução/revisão sequenciais pelo Astro Boy; alterações anteriores R27–R29-A preservadas. Pedido explícito de Fábio: recuperar XP retroativo e continuar a integração de recompensas. Sem commit/push/deploy.

## Recuperação histórica dos Ciclos

`planCycleXpRecovery` aceita somente recibos únicos `habit-v1`, com data válida, ID vinculado ao hábito, valor positivo finito salvo em executedScore/scoreEarned e sem divergência entre os dois campos. Treinos nativos e descendentes, recibos já marcados como pagos, valores zero, desconhecidos ou conflitantes ficam excluídos. O valor vem da conclusão histórica, nunca do planejamento atual. O elemento vem da atividade atual porque recibos antigos não guardavam esse snapshot; a prévia informa essa limitação.

**Não há crédito automático ao iniciar/hidratar o app.** Em Ciclos, abaixo do calendário: **Seu esforço também conta → Conferir recuperação → confirmar ausência de compensação manual anterior → Recuperar N XP**. A confirmação é vinculada à assinatura da prévia; alterações nos recibos invalidam a confirmação. O comando confere conta e assinatura novamente, salva e relê uma cópia anterior e então grava recibos/XP no mesmo update do store. `xpRuleset: cycle-xp-recovery-v1` impede repetir o pagamento após recarga. IDs/datas originais são preservados; a recuperação não dispara celebração de nova atividade.

A cópia `conselho-cycle-xp-backup:<conta>:<uuid>` contém personagem e Ciclos da conta afetada. O botão **Baixar cópia anterior** aparece após o sucesso na sessão atual. É uma cópia local delimitada a esta operação, não backup integral, restauração automática ou sincronização em nuvem. Falha antes da cópia bloqueia o crédito; uma exceção posterior exige conferir o saldo antes de tentar novamente. Pagamentos manuais anteriores não têm rastreabilidade suficiente: não compensar de novo se já foram concedidos por outro meio.

**Saldo pessoal não aplicado nem observado.** O usuário informou liberação do navegador, mas a tentativa de inspeção foi rejeitada pela ferramenta por permissão salva. Nenhum contorno foi usado. O caminho explícito no próprio app permite que o usuário aplique a prévia. O total real recuperável permanece desconhecido nesta entrega.

## Rituais e subitens

`withTaskXpUpdate` acompanha transições dos comandos existentes de conclusão/desfazer. Ritual simples preserva `round(completedScore / 2)`. Subitem pontuável usa o score legado de folha (`round((baseValue || 1) × EFFORT_MULTIPLIERS[2])`) e então `round(score / 2)`. A granularidade por folha é decisão de implementação para igualar execução individual e cascata; arredondamento por folha pode diferir do agregado antigo. Não atribuir ao usuário uma aprovação numérica literal.

- Novo campo opcional `Action.completionXp` guarda amount, elementId e ruleset `ritual-leaf-xp-v1` na projeção Task/TaskItem existente.
- Crédito e snapshot no mesmo update local; cliques repetidos não recompensam novamente.
- Pai com filhos recebe zero; fechamento parcial mantém apenas ganhos das folhas que efetivamente concluíram. Cascata remunera cada folha nova, inclusive em árvores aninhadas.
- Desfazer retira somente o valor e elemento do snapshot, mesmo após editar nome/elemento/planejamento. Metadados são retirados para permitir próxima conclusão legítima.
- NOTE/VALUELESS e seus aliases não remuneram; adapter nativo permanece responsável pelo seu próprio XP.
- Conclusões antigas de Rituais sem snapshot não recebem retrocrédito nem débito inferido. Se forem reabertas e concluídas novamente, a nova conclusão passa a receber snapshot; a reconciliação de XP antigo desconhecido continua pendente.
- Pontuação total legada, Prana, temporizadores, LevelingCalculator, política de fechar parcialmente pais e serviços remotos não foram reescritos. Divergências legadas de totalScore/semântica de pais com filhos apenas NOTE/Check continuam fora deste lote.

## Evidências executadas

- **231 testes passaram** em `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- Dez testes novos: quatro de recuperação com store real isolado, dois da UI com dublês de hooks/comando, quatro de Rituais com store real e caso puro nativo.
- Cobertura: crédito original, backup antes da mutação, quota/conta/prévia inválida, duplicados/histórico inseguro, recarga, ausência de replay, confirmação, toque repetido, falha/retry deliberado, elemento original, cascata/aninhamento, fechamento parcial, semântica e não interferência nativa.
- `tsc -b`, `npm run lint`, build Vite com `envDir:false`: passaram; **22,08s** de build. Avisos de bundle grande e Browserslist permanecem.
- `git diff --check` passou; package.json e duas versões do package-lock em 0.1.81.
- Logs locais: `/tmp/conselho-r29r-{tests,types,lint,build}.log`.

Testes usam armazenamento vazio em memória, nunca dados pessoais. Não executados: QA renderizado/toque/FPS/mobile, gravação no saldo real, sincronização remota, suíte Deno nativa, migrações ou deploy. Revisão documental e de código pelo coordenador; sem revisão independente.

## Impacto e próxima etapa

Matheus mantém backend; Fábio conduz frontend/mobile. Preservar os campos opcionais de recompensa na futura sincronização, garantindo idempotência e atomicidade no servidor. A cópia canônica `actions` e projeções `tasks/habits` já divergem em caminhos legados; este lote não as unifica nem comprova sync. Não lançar uma migração que descarte os snapshots ou recompute concessões históricas.

Próximo lote **R29-C**: auditar e implementar conclusão/reabertura explícita de Jornadas/Grandes Obras com bônus registrado, evitando pagamento duplicado por agregação. Depois **R29-D**: recibo visual compartilhado e animações ligadas a ganhos reais, mantendo R28-F QA mobile e R25 backup/associação de conta pendentes. Fragmentos/constância global ainda têm contratos próprios. A implementação de recompensas em todo o app permanece parcial.
