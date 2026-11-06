# R27-A — Contrato e lógica de lembretes por ocorrência — 0.1.111

30/10/2026 · Astro Boy sequencial · **Sol Alto confirmado por Fábio** · checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Continuidade anterior](R26-M2E-RETORNO-SEGURO.md). Aplicadas coordenação/backend-conselho e custódia de versão. Primeiro lote do contrato de lembretes: **módulo puro implementado/testado, ainda não integrado à UI/persistência ou entrega de notificações**.

## Contrato implementado

`src/lib/reminders/occurrence-reminder.ts` consome uma ocorrência já projetada pelo Temporal. Origem: task/habit/sequence/project/quest/mission/commitment, ID real e data local. A chave é JSON do trio, evitando colisões por separador e distinguindo dias/atividades. Não cria Task/Habit/Commitment nem outro motor de recorrência. Eventos externos Google são recusados neste recorte, sem opt-in implícito.

Horário precisa ser explícito HH:mm. Converte a data/horário local do dispositivo para instante UTC ISO congelado. Criar uma base não inventa horário para atividades existentes. A ocorrência de origem fica imutável ao adiar, inclusive quando o aviso cruza a meia-noite. Não modifica dueDate, agenda ou recibos.

Comandos com ID, revisão esperada e instante UTC fornecido pelo chamador:

- `one-hour`: 60 minutos transcorridos a partir do comando, inclusive em mudanças de fuso/DST.
- `tomorrow-nine`: amanhã no calendário local do dispositivo às 9h.
- `tomorrow-same-time`: amanhã no horário local do aviso **atual**, inclusive se já tiver sido adiado.
- `dismiss`: dispensa somente este aviso/ocorrência, não conclui atividade, não desativa hábito nem concede XP/Prana/fragmentos.

Aplicação retorna novo estado/revisão, sem relógio implícito, storage, timer ou efeito de pontuação. Repetir o último comando idêntico retorna mesmo estado; mesmo ID com conteúdo diferente falha. Revisão antiga, comando de relógio anterior, origem inválida e limite de revisão falham. Após dispensar, só repetição idêntica é aceita; reabrir exige fluxo explícito futuro. Isso é transição em memória, **não garante CAS entre abas/dispositivos ou exactly-once de notificação**. Na persistência, será necessário aplicar a revisão atomicamente junto do estado atual.

`isReminderDue` depende de dois fatos fornecidos pelo chamador: origem disponível e ocorrência não concluída. Ainda não existe ligação automática desses fatos ao store. UI futura deve recalcular ambos usando o estado real antes de exibir ou executar ação. Concluir deverá usar o comando/recibo atual do app; não é ação desse módulo.

## Fuso e datas

Hora de criação e opções “amanhã” usam o fuso do dispositivo executor. Horário inexistente na transição DST é rejeitado, sem avançar silenciosamente; horário repetido usa a primeira ocorrência do Date nativo e congela o instante. Comportamento conferido em [MDN Date.setHours](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours) e teste Node com `TZ=America/New_York`. “Amanhã 9h” continua 9h ao cruzar DST; uma hora soma duração real.

**Sem suporte prometido a recorrência flutuante multi-fuso:** o instante já criado fica congelado. Gerar futuras ocorrências em outro dispositivo/fuso precisará de política explícita na integração; não recalcular avisos existentes silenciosamente. Relógio do dispositivo não é relógio confiável de servidor. Política de atraso/offline, limite de adiamentos e deduplicação de entrega ficam no próximo contrato de persistência/entrega. Nada notifica em segundo plano só por existir este módulo.

## Evidências e limites

Oito testes direcionados aprovados em `/tmp/r27-a-reminders.log`: todas as origens suportadas, entradas inválidas, identidade por dia, ausência de mutação, virada de mês/ano, repetição/revisão, dispensa, disponibilidade/conclusão e DST (processo Node local isolado). Sem navegador, dados pessoais ou serviço de push. **552 testes globais aprovados**, zero falhas, 27,79s (`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`, `/tmp/r27-a-all.log`). TypeScript e lint exit 0 (`...-types.log`, `...-lint.log`). Vite `build({envDir:false})` exit 0 em **29,09s** (`...-build.log`), avisos de chunks/Browserslist existentes mantidos. Versões/links/diff-check conferidos. SHA-256: 90 fontes preexistentes protegidas idênticas, whitelists somente versão (`/tmp/r27-a-final-review.json`). Reserva encerrada.

## Preservação e abertura do app

Baseline `/tmp/r27-a-before.json`; nenhuma fonte preexistente de stores/services/types/agenda/recorrência/XP/bootstrap/gates alterada. Whitelists frontend/SQL NÃO aplicado somente aceitam 0.1.111. Nenhuma migração/CLI/projeto Supabase remoto, secret, login real, deploy, commit/push ou subagente. Não criado store paralelo. Nova estrutura é contrato de metadados puro; nenhum perfil/backup pessoal foi modificado.

Pedido de abrir `http://127.0.0.1:5173/grandes-obras` enviado via `open_in_codex`, retorno **queued**. Isso solicita mostrar uma aba ao usuário, **não comprova exibição, servidor ativo, conteúdo da página nem liberação da inspeção**. Não houve leitura da origem bloqueada ou tentativa alternativa de inspeção/CDP/HTTP/browser. QA visual permanece pendente.

## Próximo R27-B — manter Sol Alto

Integrar metadados ao mecanismo de progresso/backup existente, com compatibilidade de arquivos antigos, isolamento por conta, recuperação e CAS local, sem engine de atividades paralelo. Conferir cobertura dos snapshots/adapters antes de habilitar. Conectar disponibilidade/conclusão reais; mudanças na atividade/ocorrência devem invalidar aviso obsoleto. Ausência de horário significa aviso não configurado. Testar reload, troca de perfil, atraso/retomada, edição/exclusão, Undo, falha de gravação e comandos concorrentes. Decidir estratégia de fuso para ocorrências futuras e atraso offline no contrato antes da integração.

Depois, **Sol Médio** para cartões/transparência/ações rápidas e preferência de movimento reduzido. Avisar antes da troca. Sistema de entrega com app aberto e push/app fechado são entregas diferentes; publicação/serviço remoto têm escopo próprio. Conta hospedada e QA mobile/tablet continuam pendentes; o módulo não os libera. Revisão de implementação/custódia sequencial pelo Astro Boy, com limites declarados.
