# F6-N10 — conta conectada, 0.1.140

Entrega de 07/11/2026. Astro Boy executou coordenação, implementação, validação e revisão documental sequencialmente, em Sol Alto, sem subagentes. O usuário confirmou sucesso da importação no celular; esse aceite foi relatado por ele, não observado pelo agente.

## Resultado

Minha conta passa a mostrar estado local/conectado, identidade conferida, última versão salva, sincronização, pausa e falta de conexão. Cadastro/login usam o SDK e contratos existentes. Depois de entrar, salvar o progresso deste aparelho ou receber a versão da conta exige uma escolha explícita; a cópia de segurança é preparada/conferida internamente, sem solicitar outro JSON. A confirmação cobre todos os perfis locais, XP, atividades, histórico e Treinos.

O protocolo existente mantém identidade, revisão/CAS, recibos, readback, exclusividade, recuperação após interrupção e conflito entre aparelhos. Não há merge automático nem replay de recompensas. Recibos e resolução usam a compactação de recuperação já adotada na importação para evitar estouro de quota. Operações sem resposta confirmada ficam pendentes, sem reenvio cego.

O salvamento acompanha alterações com debounce e retoma a conferência ao voltar ao app/conexão. **Não é uma tarefa garantida em segundo plano quando o app está fechado no iPhone.** A autorização lembrada dura 12 horas por aba; não foi implementado login permanente após fechar a aba. Conta antiga com dados no modelo legado não é convertida ou substituída automaticamente.

## O trabalho de Matheus e a falha real encontrada

README, authStore e serviços Supabase já tinham cadastro, login, recuperação e sincronização legada. Existiam duas contas registradas e dados legados hospedados. Esse caminho não abrangia integralmente XP, recursos, histórico e Fitness, cobertos pelo protocolo opt-in atual. Os serviços legados e o motor de pontuação foram preservados.

O primeiro ensaio com o SDK real revelou que o bundle publicado não recebia URL/chave pública do Supabase. As declarações estavam em `vercel.json.env` (runtime), mas o Vite precisa delas durante o build. Foram cadastrados seis campos públicos já existentes como Config em production/preview no mesmo projeto Vercel, removida a declaração runtime e adicionada uma guarda de build para configuração ausente, chave privada ou flags de Auth/bootstrap legado indevidas. Nenhuma chave privada foi acessada/criada. As flags antigas de Auth e bootstrap cloud continuam false: o fluxo integral usa sua própria liberação e evita dois gravadores concorrentes.

## Banco e publicação

A migração `20261107192045_account_archive_version_140.sql` foi aplicada com sucesso no DominioDoMagoDB após preflight. Compatibilidade até produtor140, hash do validador `1a9eb5c670d494c12e66fae716146588352e97e83349638a3c476b9cc4f94a04`. A ativação revisada está em `supabase/review-candidates/activate_account_beta_140.sql`; gate de escrita passou a true, mantendo APIs, grants, RLS e dez gatilhos de proteção do legado.

Readback após ativação: zero arquivos de contas integrais, duas contas Auth, cinco tarefas e 34 hábitos legados, dez gatilhos ativos. Validador puro hospedado aceitou envelope sintético140; não houve gravação remota de progresso pessoal, criação de usuário ou envio de e-mail pelo agente. Achados preexistentes dos advisors: `public.touch_updated_at` com search_path mutável, proteção de senha vazada desativada; INFO de tabelas privadas sem políticas corresponde ao acesso exclusivamente por RPC. Não alterados neste lote.

Publicação final **READY dpl_99BnsuDSywCwPFg2DrfG9z6u6b4n**, domínio fixo https://conselho-elemental-testes.vercel.app, versão0.1.140. HTML e entry responderam200, versão140 e cache no-store/no-cache/must-revalidate conferidos. Upload de518 arquivos de fonte por SHA, sem JSON pessoal, env, SQL, documentos ou fixtures. Deploys intermediários foram substituídos; o primeiro revelou a falha de configuração de build descrita acima. Sem push GitHub neste lote.

## Verificações executadas

- Suíte completa MJS: **727 passaram**, zero falha/skip, 88,713s, antes do último ajuste exclusivamente CSS de alvo44px e entrada fade.
- Tipos e build finais passaram após CSS; lint passou antes desse ajuste exclusivamente CSS. Diff-check conferido no encerramento.
- Cópia autorizada original conferida somente em Node/PGlite temporários: estados brutos, XP e IDs preservados; arquivo original intacto; pico2.654.230bytes sob limite5MiB. Nenhum conteúdo pessoal foi incluído nas evidências versionadas.
- Chromium descartável390×844: SDK instalado com respostas Auth sintéticas interceptadas e RPCs SQL reais em PGlite local. Conexão em uma ação, edição real pelo formulário da Forja salva, retomada após recarga e segundo contexto recebe exatamente a versão salva. Três commits sintéticos, nenhum erro de página. **Não comprova Auth/JWT/e-mail hospedado nem dois celulares físicos.**
- Workspace sem overflow360/390/768px. Dialog final medido nessas três larguras, dentro da viewport900px e alvo fechar44×44; captura390 inspecionada. Sem aceite físico de teclado/Safari.
- [Resultados, capturas e hashes](evidence/conta-conectada-0.1.140/).

## E-mail: pendência concreta para beta aberto

Settings públicos Auth: signup habilitado, confirmação de e-mail exigida, provider e-mail ativo e Google desativado. Painel administrativo SMTP observado: custom SMTP desativado. Portanto a implementação de cadastro existe, mas não se pode anunciar cadastro aberto para qualquer testador: o serviço padrão restringe destinatários à equipe da organização. Nenhum provedor alternativo foi encontrado nos arquivos/documentos revisados.

Fábio não tem domínio próprio e relatou problema no Gmail. Alternativa documentada para teste é um provedor com remetente individual verificado, por exemplo [SendGrid Single Sender Verification](https://www.twilio.com/docs/sendgrid/ui/sending-email/sender-verification). Não exige comprar domínio para esse ensaio; depende de um endereço funcional que receba a verificação. Plano/custos não foram validados. Para produção, seguir autenticação de domínio. Não foi criada conta de provedor nem configurada credencial SMTP. Não pedir senhas/chaves no chat nem desligar confirmação para contornar o problema.

Fontes oficiais: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [testes de Auth](https://supabase.com/docs/guides/auth/testing-auth-flows), [identidade de remetente SendGrid](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/sender-identity).

## Água/Ar — revisão solicitada durante o lote

Na cópia autorizada de06/11, reproduzida só em memória: amizade creditou2 XP de Água, estudo5 XP de Ar; os pontos dos elementos também aumentaram. Nível permaneceu1 em ambos. Não se alteraram saldos reais nem se concedeu crédito retroativo sem divergência identificada.

No app público140 com dados sintéticos criados pelas APIs reais da store e perfil Chromium descartável, conclusão pela UI levou Água51→53 e Ar93→98, produziu feedback/recibos corretos, manteve ambos após reload e mostrou os totais corretos no Grimório expandido. Zero erro de página ou chamada Supabase. Nova regressão de pequenos ganhos sem cronômetro, persistência, idempotência e desfazer; nove testes direcionados passaram. Não é prova do estado atual do telefone. O resumo recolhido do Grimório destaca nível/título e esconde XP; melhorias de visibilidade devem ser tratadas como apresentação, sem modificar cálculo.

## Retomada e limites

1. Obter o áudio novamente: o caminho do anexo WhatsApp Audio 2026-11-07 at18.11.26.opus não existe nesta máquina; anexos conectados não o disponibilizaram. Nenhuma transcrição ou orientação atribuída a Matheus.
2. Escolher/configurar envio de confirmação e recuperação, preservando contas atuais; ou testar login com conta já confirmada. Etapa de configuração/contratos continua em Sol Alto.
3. Aceite Auth hospedado real pelo usuário, entrar no mesmo celular que contém o progresso e escolher salvar o progresso deste aparelho. Até esse aceite, não afirmar que seus dados já estão na nuvem.
4. Validar login/recebimento em outro aparelho e conflitos com contas de teste; frontend/polimento em Sol Médio após contratos fechados. Há limite12h por aba e sincronização durante uso, não agendamento diário de app fechado.
5. Se Água/Ar continuarem divergindo no telefone, obter evidência atual (data, valor esperado e saldo antes/depois) e reproduzir antes de corrigir registros. Nenhuma fórmula alterada por suspeita.

Revisão documental sequencial concluída; reservas de código N10 encerradas. Alterações de versão posteriores devem alinhar compatibilidade do validador hospedado antes de publicação. Não aplicar novamente migrações antigas arquivadas ou ativar o bootstrap legado.
