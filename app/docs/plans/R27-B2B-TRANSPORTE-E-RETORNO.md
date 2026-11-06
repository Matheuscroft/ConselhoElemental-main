# R27-B2B — Transporte temporário, cancelamento e retorno — 0.1.114

30/10/2026 · Astro Boy sequencial · Sol Alto · checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Coordenador anterior](R27-B2A-ESCRITA-ISOLADA-LEMBRETES.md). **Código de transporte/ligação testado, sem rota/workspace ou interface ativos. Gate de escrita permanece false.**

## App no painel interno

`lsof` não encontrou listener em 5173. Servidor Vite iniciado com `envDir:false`, host 127.0.0.1, strictPort 5173; o processo imprimiu URL local e permaneceu em execução para o usuário. Abertura de `/grandes-obras` solicitada a `open_in_codex`, retorno **queued**. Isso não prova renderização, servidor respondendo HTTP, console ou acesso de inspeção. Não foi feita requisição HTTP, CUA/CDP ou outra tentativa de observar a origem bloqueada. Usuário pode recarregar sua aba. Não foi lido `.env`.

## Transporte implementado

`reminder-handoff.ts` usa storage de sessão injetado, **da própria aba**, com chave fixa `conselho-elemental-reminder-handoff-v1`. Não é store de atividades nem diário de recuperação: contém cópia temporária do plano/baseline, não saldos autônomos ou comandos de XP. Não usar localStorage nessa chave. O progresso continua nos dois stores originais; a recuperação usa o diário existente.

Plano é validado por origem, perfil, versão/revisão, formato exato e SHA-256. Checksum detecta corrupção, **não é autenticação nem autorização para executar um plano**. A confirmação específica e o gate do coordenador continuam obrigatórios. Não persistir consentimento como se sobrevivesse a navegações/recargas.

`stageReminderHandoff` retorna somente após readback exato, impedindo saída da página antes da cópia confirmada. Recusa outro plano pendente; quota/erro/leitura divergente interrompem o handoff, sem tocar no domínio. Plano é copiado antes de awaits para não mudar por referência. Há limite de tamanho; sessão real pode ter quota menor e falhar com segurança. Esse conteúdo contém progresso privado e não deve ser logado/exportado/publicado automaticamente. Nenhuma instância real de sessionStorage foi acessada nesta entrega.

`reviewReminderHandoff` distingue preparado, recuperação pendente, alvo confirmado e dados modificados. Journal existente, mesmo ilegível, exige recuperação. `cancelReminderHandoff` remove somente transporte preparado/alterado, com baseline fresco; não dispensa journal ou desfaz uma gravação confirmada. Não altera dados estrangeiros. Plano corrompido é conservado para revisão, não apagado automaticamente.

`reminder-handoff-commit.ts` liga o plano exato da aba ao coordenador anterior, verificando-o antes/depois da leitura e em cada callback de frescor da gravação. Cancelar/remover/trocar plano durante a preparação impede gravação; após journal, o cancelamento exige revisão. Sem novo mecanismo de lock/commit.

`finishReminderHandoff` limpa só a sessão depois do alvo exato, ausência de journal, marcador local válido e nova confirmação explícita. Compara baseline da leitura de retorno novamente antes da limpeza. O fluxo de recuperação/continuação local permanece o existente, sob exclusivo; não faz limpeza automática do journal nem autenticação/associação de conta. A confirmação de uso somente local não é silenciosa: esse mecanismo conserva isolamento contra sync legado. **Cliente online/sync ativo e ergonomia sem reload não foram resolvidos por estes helpers.**

Se a aba fechar antes do commit, o plano temporário pode ser perdido, mas o domínio não mudou. Depois do commit, journal no storage de progresso continua protegendo a recuperação mesmo se a sessão se perder. Sessão não é backup durável nem fila de entrega. `sessionStorage` pode ser copiado por abertura via opener; não é garantia de exclusividade: baseline/revisão/lease global continuam sendo as autoridades no commit.

## Verificações

29 testes de lembretes aprovados (`/tmp/r27-b2b-reminders-final.log`), oito novos (seis de transporte, dois de percurso completo). Exercitam preparação/readback/recarga simulada/cancelamento, journal ilegível, alvo alterado, quota/falha, checksum/origem errados, confirmação nova, grafo sem serviços/stores e percurso **stage → commit → revisar/recuperar → continuar localmente → finalizar transporte** com coordenador/diário reais e locks/storage sintéticos. Também remoção do plano durante preparação impede escrever progresso.

Primeira execução do teste usou loader TS para importar versão JSON e falhou na fixture por metadados de backup inválidos. Trocado o carregamento do harness por bundle esbuild, que preserva JSON como os testes de coordenação existentes; produto não foi afrouxado. Evidências iniciais `/tmp/r27-b2b-handoff.log`, final `/tmp/r27-b2b-handoff-final.log`. Nenhuma prova de navegação/recarga real, quota física, BFCache, entrega de notificações ou mobile.

**Checks finais executados:** 573 testes globais aprovados (`/tmp/r27-b2b-all-reviewed.log`, 24,30s), TypeScript (`/tmp/r27-b2b-types-reviewed.log`), lint (`/tmp/r27-b2b-lint-reviewed.log`) e build Vite `envDir:false` (`/tmp/r27-b2b-build-reviewed.log`, 25,83s). Aviso de chunks grandes permanece; não foi tratado como erro nem como desempenho mobile validado. A primeira checagem TypeScript apontou narrowing insuficiente de valores unknown após helper de erro em arrow function; substituído por declaração `function fail(): never`, preservando validações. Checks finais repetidos após essa correção.

Conferência SHA-256 de 542 entradas preexistentes: 537 idênticas; diferenças limitadas ao auditor/whitelist frontend, whitelist SQL NÃO aplicada, teste de coordenação e dois manifests. Código novo em dois módulos e um arquivo de testes; sem alteração dos coordenadores/serviços/stores preexistentes. Revisão `/tmp/r27-b2b-final-review.json`. Baseline `/tmp/r27-b2b-before.json`; somente novos módulos/testes e versionamento/documentação. Fontes preexistentes de domínio/conta/recuperação permanecem intactas, salvo whitelist de versão; SQL NÃO aplicado só aceita 0.1.114. Gates false. Sem dados pessoais, secrets, Auth/projeto remoto, migração, deploy, commit/push, subagentes ou contorno de browser. Custódia sequencial pelo Astro Boy.

## Próximo — R27-C, integração do workspace controlado

**Manter Sol Alto para bootstrap/contratos de navegação do workspace**, sem abrir gates por passar testes Node. Integrar entrada protegida, transporte da própria aba, seleção de plano e confirmações explícitas de aplicação/recuperação/uso local/retorno. Conferir operação quando o usuário decide cancelar antes/depois de sair, quando a sessão se perde e quando há vínculo online. Não oferecer reload/isolamento de todo o app como se fosse um snooze instantâneo; fechar essa limitação de produto antes de entrega cotidiana.

Depois, avisar para Sol Médio no refinamento visual dos cartões/formulários. UI, timer de entrega, push/app fechado, QA real e conta hospedada continuam pendentes. Este lote não promete concluir toda a B2/produto nem tornar lembretes utilizáveis no app ainda.
