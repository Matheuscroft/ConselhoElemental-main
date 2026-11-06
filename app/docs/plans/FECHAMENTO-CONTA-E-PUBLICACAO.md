# Fechamento: conta pessoal, progresso integral e publicação

30/10/2026 · Diretriz explícita do usuário: interromper a sequência longa de testes manuais de QA e priorizar concluir o app para acesso por contas próprias, salvamento de progresso e preservação do progresso de Fábio na passagem para a Vercel. Não é autorização para apagar dados, acessar secrets, abrir gates sem critérios ou fazer deploy nesta rodada.

## Acesso F5 — 0.1.122

[Cadastro/login e confirmação isolados](FECHAMENTO-F5-CADASTRO-CONFIRMACAO.md) implementados e testados sem exigir cópia para autenticar, mantendo cópia/consentimentos para dados. 654 testes/checks, compatibilidade 122 instalada com escrita false. Próximo F6: retomada após reload e experiência de conta vazia em Sol Alto; real Auth/configuração/associação ainda pendentes.

## Acesso F4 — 0.1.121

[Recuperação PKCE isolada, adapter e compatibilidade](FECHAMENTO-F4-RECUPERACAO-ACESSO.md) implementados/verificados, 640 testes/checks. Novo patch do validador instalado com gate fechado, sem reescrever migração anterior. Entrada/cadastro/confirmação/reload e aceite real continuam próximos em Sol Alto.

## Instalação F3-R concluída — 0.1.120

Fábio autorizou o pacote específico; SQL aplicado, gates mantidos false e permissões/RLS/triggers conferidos no banco. Arquivo alinhado a 20261030202517, conteúdo aprovado preservado; [evidências e limites](FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). Próximo acesso integral cotidiano e aceite hospedado essencial em Sol Alto, antes de qualquer ativação/transferência pessoal.

## Preparação F3 anterior — 0.1.120

Banco ACTIVE_HEALTHY; contrato integral ausente no catálogo. [Pacote de instalação exato, compatibilidade e limites](FECHAMENTO-F3-INSTALACAO-INTEGRAL.md), 625 testes/checks locais. Não aplicado remoto ou habilitados gates. Próximo autorização específica da migração aditiva; cadastro/recuperação/reload/aceite hospedado continuam pendentes em Sol Alto.

## Atualização operacional F2 — 30/10/2026

DominioDoMagoDB confirmado; retomada aceita e estado COMING_UP observado. Contrato hospedado ainda indisponível para conferência. [Evidências e retomada](FECHAMENTO-F2-BANCO-HOSPEDADO.md). Produto atual 0.1.119, gates preservados; estado 0.1.118 abaixo descreve a inspeção inicial.

## Estado inspecionado

Produto 0.1.118, codex/fitness-ui-integration, base b11ed9d. Há Auth legado com cadastro/login e cloud sync, e workspace isolado de associação integral com signUp/signIn, snapshot/readback, conflito/recibos e bootstrap/sync próprios. Esses caminhos não são equivalentes: não promover o legado a garantia de preservar todo o domínio/Fitness. ACCOUNT_TRANSFER_WRITES_RELEASED e RESTORE_WRITES_RELEASED continuam false. Migração integral local tem gate de servidor false e não tem aplicação hospedada comprovada. A QA de lembretes sintética não valida conta real nem essa migração.

Nenhum secret/.env, conta real, banco ou projeto remoto foi acessado nesta revisão. Não se afirma que a configuração remota esteja ausente: ela simplesmente não foi conferida nesta rodada.

## Prioridade de fechamento (substitui a sequência de QA dos lembretes)

1. **Conta e progresso integral — Sol Alto.** Reconciliar Auth legado e bootstrap integral, cadastro/confirmação de e-mail/login/recuperação de senha/logout, retomada de sessão e autosync. Identificar lacunas reais antes de reescrever. Verificar contrato hospedado/RPC/RLS/gates e autorização por auth.uid; manter contas isoladas. Não presumir aplicação de SQL local, configuração de redirect ou autenticação hospedada por aprovação de mocks.
2. **Preservação do progresso atual — Sol Alto.** Cópia integral pelo app principal (Grimório, botão Baixar cópia do progresso) e conferência do arquivo. Não usar fixture como backup pessoal. Enviar o arquivo/progresso revisado à conta autenticada com confirmação de origem/destino; preservar perfis, IDs, atividades, histórico, XP/conquistas e Fitness, sem reexecutar conclusões nem somar recompensas. Conta com dados existentes exige comparação/decisão, não sobrescrita automática. Não apagar local depois do primeiro envio; conservar recuperação até readback confirmado. Endereços localhost e Vercel têm armazenamento separado; deploy não copia localStorage. Transferência por arquivo ao domínio final é alternativa necessária se não houver associação online concluída antes da mudança de origem.
3. **Fechamento da experiência — Sol Médio após contratos.** Entrada única e clara para entrar/criar conta, estados de salvo/offline/erro/conflito e onboarding para nova conta vazia. Manter a migração de progresso existente separada da experiência cotidiana de login. Restringir revisão às telas e falhas reais desse percurso; lembretes, extras e polimento extensivo podem continuar ocultos fora do MVP de fechamento.
4. **Aceite integrado e preparação de publicação — Sol Alto onde houver configuração/contrato; Médio na UI.** Conferir cadastro/login, leitura em outro navegador/dispositivo, persistência após reload/logout/login, isolamento A/B, falha de rede/retry sem duplicação, importação integral sem perda e conflito preservado. Usar contas de teste descartáveis no serviço autorizado. Os testes essenciais de dados/segurança não são dispensados; evitar novas rodadas de microtestes manuais de layout. Preparar checklist objetivo de ambiente/redirect/build e informar o que está verificado ou pendente antes de eventual deploy explicitamente solicitado.

## Critério de pronto

Nova pessoa cria/acessa sua conta e recebe somente seu progresso. Fábio associa o progresso integral atual à conta sem perder dados e o reencontra no domínio final/outro dispositivo. Alterações são salvas com feedback e falhas não causam sobrescrita silenciosa. Backup anterior continua disponível. Verificação remota real e limitações documentadas; não declarar garantia por testes locais ou pela mera abertura do app na Vercel.

## Próximo lote concreto

Selecionar Sol Alto antes da edição dependente. Retomar AccountWorkspace, Auth/authStore, account-live-sync/attach-account-sync, transport/migração e ADR-004. Inventariar o que já funciona versus falta na conta real; implementar a menor lacuna do fluxo ponta a ponta e executar os checks relevantes em lote. Não continuar solicitando pequenos testes manuais dos lembretes a cada turno. UI em Médio depois de estabilizar o contrato. Não depende de nova autorização de Matheus para o trabalho que o usuário acabou de pedir, mas exige registro do impacto backend/frontend e preservação das regras.
