# R27-B1 — Metadados de lembretes no progresso existente — 0.1.112

30/10/2026 · Astro Boy sequencial · Sol Alto confirmado · checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Contrato anterior](R27-A-CONTRATO-LEMBRETES.md). **Integração local implementada, ainda sem UI/timer/push e sem liberação para uso real do novo fluxo.**

## Integração

Campo opcional `User.reminderState` (`schema:1`, revisão da coleção e itens) conserva avisos no perfil já persistido pelo appStore. Não há nova chave de storage/store, nova coleção raiz nem motor de atividades. `partialize`, captura de contas e backup integral já incluem User completo; não precisaram de caminhos alternativos. Conta criada sem importar progresso não recebe os avisos da outra; importação explícita segue a cópia integral existente. Perfil antigo sem campo é lido como coleção vazia, sem normalizar ou gravar defaults durante leitura.

Novo comando `mutateOccurrenceReminder(accountId,userId,revision,mutation)` verifica os dois IDs contra o estado atual e a revisão da coleção dentro do set síncrono. Metadados são copiados em JSON antes de incorporar ao perfil. Comando não altera XP/Prana/histórico/recorrência. Revisões antigas não gravam. Repetir comando de aviso idêntico após reler revisão atual retorna estado existente; tentativa com revisão de coleção antiga exige releitura explícita, não retry automático.

Primeira integração aceita configuração de avisos para Ritual agendado, Ciclo raiz projetado e Commitment. A ocorrência precisa existir na projeção Temporal da data e não estar concluída. Fonte excluída, data/agenda alterada ou tarefa concluída deixa de ser elegível. Aviso obsoleto pode ser dispensado; adiá-lo é recusado. `dueProfileReminders` lê agenda/histórico reais passados pelo chamador; ainda não há listener/scheduler chamando-o automaticamente. Desfazer conclusão pode tornar o aviso pendente elegível novamente, sem recriar metadados ou pagar recompensa. Origens project/quest/mission/sequence suportadas na base pura R27-A não foram ativadas aqui até fechar seus contratos específicos de conclusão diária.

## Arquivos e backup

- `src/lib/reminders/profile-reminder-codec.ts`: parser estrito sem dependência de store/serviços; `profile-reminders.ts`: de metadados opcionais, revisão local, projeção/eligibilidade e leitura de avisos vencidos. Limite técnico de 1000 avisos evita crescimento sem limite neste contrato; limpeza/reconfiguração explícita ainda não tem interface.
- `src/types/index.ts` e `src/stores/appStore.ts`: campo opcional em User e comando isolado. As demais operações existentes são preservadas.
- `critical-progress.ts`: audita o campo quando presente em TODOS os perfis, sem remover/normalizar erros. Campo ausente em arquivo antigo continua válido. Snapshot/checksum/fingerprint integral conserva a propriedade aninhada.
- Formato e raízes do backup não mudaram; `progress-backup`/capture/restauração não receberam engine novo. SQL NÃO aplicado recebe somente whitelist 0.1.112; protocolo integral guarda o JSON completo. Sync legado de tabelas continua parcial: **não afirmar que envia esses metadados ao backend**. Conta integral hospedada/gates permanecem false, sem QA remoto.

## Verificações

14 testes de lembretes aprovados em `/tmp/r27-b1-reminders-final.log`, seis novos sobre store/backup. Testam recarga pela mesma chave persist, isolamento/troca de conta, CAS local, recusa de callback de outra conta, início/edição/exclusão/conclusão da fonte, retorno de elegibilidade no estado sintético desfeito, cópia integral/checksum e leitura de arquivos sem metadados. Dados sintéticos e Zustand real em memória; nenhum dado pessoal foi lido/gravado.

Primeira execução falhou por comando inexistente `fitness.switchAccount` no harness. Corrigida a preparação sintética do perfil de Treinos pelo mecanismo setState existente. Segunda falhou por enviar Date in-memory à auditoria pós-JSON; normalizada a fixture na mesma representação do arquivo. Só o log final é aceite, intermediários preservados em `/tmp/r27-b1-reminders.log` e histórico da execução.

A primeira global detectou imports indiretos de serviços de domínio na proteção de startup, por o auditor importar o módulo de agenda. Corrigido separando o codec de validação da projeção de agenda; não relaxados os testes de isolamento. 35 testes direcionados de lembretes/startup/recuperação passaram após a correção (`/tmp/r27-b1-reviewed.log`). Resultados finais: **558 globais aprovados**, zero falhas, 29,02s (`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`, `/tmp/r27-b1-all-reviewed.log`). TypeScript/lint exit 0 (`...-types-reviewed.log`, `...-lint-reviewed.log`). Build Vite `envDir:false` em **30,32s**, exit 0 (`...-build-reviewed.log`), avisos existentes de chunks/Browserslist mantidos. 92 fontes preexistentes protegidas conferidas: 89 idênticas, alterações aprovadas appStore/User/auditor. SQL somente versão; campos de versão 0.1.112 coerentes, links/diff-check conferidos, reserva encerrada (`/tmp/r27-b1-final-review.json`). Baseline `/tmp/r27-b1-before.json`; nenhuma operação real de conta, navegador, .env/secrets, projeto remoto, migração, deploy, commit/push ou subagente. Não houve teste de UI/mobile nem contorno de bloqueio. Custódia documental sequencial pelo Astro Boy.

## Limite crítico e próximo R27-B2 — manter Sol Alto

CAS atual é **somente na instância local de Zustand**. Não protege abas independentes, relógios divergentes ou falha de persistência depois de o estado mudar em memória. Um erro parcial deve interromper o fluxo e preservar os dados; não implementar retry cego. Antes de ativar UI, reutilizar coordenação exclusiva/identidade e recuperação do progresso, projetar journal/readback para alterações locais e testar falhas em cada limite de gravação, abas concorrentes e troca de perfil.

Não existe garantia de entrega exactly-once, timer persistente, notificação de sistema ou funcionamento com app fechado. Avisos antigos não são eliminados automaticamente; backlog/retomada e estratégia multi-fuso continuam para definição antes de entrega. Não criar fuso/horário padrão para atividades existentes. A base congela instantes e usa fuso do executor para opções locais; UI deve explicar e integração futura deve definir fuso de recorrências sem silenciosamente recalcular avisos.

Depois de B2 e seus testes, avisar para Sol Médio na interface dos cartões/ações. QA visual e conta hospedada continuam pendentes. O novo campo é opcional/backward-compatible neste executor; clientes antigos podem não cobrir novos comandos e não devem ser habilitados por esta entrega. Nada abre gate de conta/restauração ou publica serviço.
