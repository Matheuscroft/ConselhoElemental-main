# R27-C1 — Conferência protegida de lembretes — 0.1.115

30/10/2026 · Astro Boy, execução e custódia sequenciais · Sol Alto confirmado pelo usuário · `codex/fitness-ui-integration`, base `b11ed9d`. Antecedente: [R27-B2B](R27-B2B-TRANSPORTE-E-RETORNO.md). **Integração pré-bootstrap implementada; escrita real, entrada nos cartões e entrega de notificações continuam desativadas.**

## Resultado e limites de produto

O início do app reconhece `?progresso=lembretes` ou um plano temporário existente na própria aba e monta a conferência antes de importar App/stores/Auth. Rotas explícitas de conta/restauração mantêm prioridade. Sem plano ou seleção explícita, mantém o início normal e suas barreiras anteriores. Falha ao ler a sessão mostra proteção de armazenamento, sem cair silenciosamente no app. Essa nova leitura de sessão é uma dependência do início normal; deve entrar no QA de navegadores com restrições.

A tela usa os estilos, tipografia e controles de 48px da conferência existente. Direção visual: fundo noturno #101721/#0c111a, texto #eceae3, ouro #d5b66f e apoio #adb8c8; Cinzel para identidade e corpo já adotado no app. Uma coluna com alteração → recuperação quando necessária → confirmação. Sem animação ornamental ou nova biblioteca; ainda não há aceite de fluidez, foco nativo ou fidelidade mobile.

Leitura requer “Atualizar conferência”; montar a tela não altera dados nem inicia leitura/exportação do progresso por efeito. Só mostra nome da atividade, data e horário dos avisos alterados; nunca renderiza baseline, IDs de conta, checksums ou payload. Inputs de confirmação e fechamento de outras abas são separados e desmarcados após cada conferência/ação. Efeito apenas gerencia foco/listener e revogação por desmontagem. Erro remove a revisão utilizável e oferece nova conferência. Tocar duas vezes não envia outra ação em andamento.

**Não foi resolvido o uso cotidiano de snooze online:** novas aplicações são recusadas sem marcador de modo local já válido, ou com qualquer vínculo/intenção/resolução de conta presente. Não cria marcador local automaticamente, não altera login e não desliga sync silenciosamente. O fechamento das abas continua pré-condição explícita por causa de clientes antigos sem lease. O gate `REMINDER_WRITES_RELEASED=false` permanece no produto; mocks substituem o módulo apenas nos testes.

A interface oferece salvar, recuperar, continuar local e retornar somente no estado correspondente; a lib repete todas as proteções independentemente do botão. O descarte explícito pode limpar apenas plano preparado/alterado mesmo com gate fechado, sem desfazer mudanças reais. Não remove plano ilegível nem journal automaticamente. Sem plano, mas com journal, encaminha à recuperação existente; não interpreta perda de sessão como autorização para abrir o app.

## Arquitetura e preservação

- `reminder-entry.ts` depende apenas da constante em `reminder-handoff-key.ts`, evitando carregar a implementação de escrita na entrada normal. `reminder-handoff.ts` reexporta a mesma constante; sem mudança de formato/chave/dados existentes.
- `reminder-workspace.ts` confere origem/perfil/revisão através dos validadores anteriores, captura baseline e estado operacional de conta/modo e repete comparação após awaits. A ação copia a revisão mostrada ao usuário e rejeita mudança de revisão, bytes, journal, modo, conta ou geração cancelada.
- Recuperação só é oferecida depois de comparar **as duas versões protegidas** do journal ao baseline/alvo do plano da aba, pelos leitores de cópias de segurança e fingerprint existentes. Um journal de outra operação, inclusive no mesmo perfil com outro horário de aviso, é recusado. Não foi criado parser de journal ou segundo mecanismo de recuperação.
- Escrita/recuperação continuam passando por `commitStagedReminder` / `runExclusiveRestore`, com trava global, readback e journal existentes. Confirmação de continuar somente local permanece separada. Após sucesso, uma nova conferência e confirmação são necessárias para limpar transporte e retornar por URL interna fixa `/santuario`.
- Não há alteração dos stores, serviços, fórmulas de XP/Prana, recorrência, dados pessoais ou UI de execução existentes. SQL NÃO aplicado recebe somente whitelist de versão, junto ao auditor frontend e três posições dos manifests.

Cópias temporárias contêm progresso privado e permanecem na aba; não registrar conteúdo nos logs. Quota física, consumo de memória com planos grandes, BFCache, outra aba real, cliente antigo e sincronização hospedada não foram testados. Fingerprints e checksum detectam divergência, não autenticam propriedade. Confirmação humana não prova que todas as abas antigas fecharam.

## Verificações desta rodada

50 testes direcionados aprovados em `/tmp/r27-c-reminders-final.log`: 44 lembretes + seis de entrada dos workspaces. Dezesseis casos novos no total (nove de integração/revisão, seis de eventos/apresentação e um de entrada); harness UI usa hooks/listeners sintéticos, sem navegador. Provas incluem: conferência sem escrita; gate fechado; confirmação e lock obrigatórios; modo local prévio; recusa de vínculo/intenção/resolução; cancelamento; percurso completo; geração obsoleta; plano perdido; journal estrangeiro/conflitante; interrupção parcial/rollback/retry; rejeição de toque duplo e retorno tardio; import graph sem domínio/Auth.

A checagem inicial TypeScript identificou que fontes de ocorrência podem incluir projeto/quest além das três primeiras projeções de B1. A apresentação passou a tratar listas conhecidas e fallback seguro, sem expandir elegibilidade ou relaxar validação de domínio. Evidência inicial `/tmp/r27-c-types-initial.log`; nova checagem passou antes da versão final. Durante a revisão do teste foi removido um ramo redundante que alterava o callback depois da cópia de contexto; o teste próprio continua verificando revogação por closure/generation.

**Checks finais executados:** 589 testes globais aprovados (30,71s, `/tmp/r27-c-all.log`), TypeScript (`/tmp/r27-c-types-final.log`), lint (`/tmp/r27-c-lint.log`) e Vite `envDir:false` (32,32s, `/tmp/r27-c-build.log`). Avisos existentes de Browserslist e chunks grandes mantidos; não comprovam desempenho mobile. Sem erro nos checks finais.

Baseline `/tmp/r27-c-before.json`; revisão `/tmp/r27-c-final-review.json`. Fontes preexistentes alteradas apenas: `main.tsx` (entrada), `reminder-handoff.ts` (extração/reexport da mesma chave), auditor frontend/SQL NÃO aplicado (somente versão), teste da entrada e dois manifests. Todos os demais arquivos do baseline permanecem idênticos. Novos arquivos limitados a mount, tela, helpers e testes do workspace. Versões/links/diff-check conferidos; custódia sequencial encerrada.

Revisão React sequencial: imports pesados condicionais, apresentação fora do componente controlador, efeitos com cleanup e sem mutações de domínio, cancelamento por geração, refs para exclusão de ações, labels/status/alert explícitos, nenhuma nova dependência CSS/JS. Acessibilidade visual/toque não comprovada por esse checklist.

Skill Supabase consultada por causa da whitelist de versão. Fetch pelo web tool rejeitou content-type markdown; consulta HTTPS local ao índice oficial foi concluída em `/tmp/r27-c-supabase-changelog.md`. Nenhuma API/SDK/esquema foi alterado e nenhuma chamada de banco ou Auth foi executada. Sem secrets/.env, deploy, migração aplicada, commit/push ou subagentes. Inspeção do navegador continua pendente; permissão salva não foi contornada nem retentada.

## Próximo passo

R27-C2: conectar a preparação do plano aos controles das atividades, com clareza sobre disponibilidade local/conectada e saída/retorno sem perder formulário. **Manter Sol Alto** enquanto o contrato de entrada/isolamento estiver em integração. Não abrir gate por passar testes Node. Depois avisar o usuário para **Sol Médio** na validação e no polimento visual mobile/tablet. Entrega real de avisos (timer enquanto aberto, permissões, app fechado/push), conta hospedada e critérios de ativação continuam em escopos próprios; esta entrega não conclui o produto de lembretes.
