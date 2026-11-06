# Fechamento F5 — cadastro, confirmação e login separados do progresso — 0.1.122

30/10/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base b11ed9d. Continuação do [fechamento integral](FECHAMENTO-CONTA-E-PUBLICACAO.md). Implementação de acesso; não é ativação da conta no produto, transferência pessoal ou deploy.

## Decisão e mudança deliberada

Autenticar não é transferir dados. O código anterior exigia arquivo de backup ou modo de recebimento até para construir a sessão de login. Essa dependência foi removida somente do acesso explícito: entrar/criar conta usa apenas e-mail/senha e não lê/transmite um arquivo de progresso. As proteções de enviar/receber continuam no mesmo coordenador, com cópia salva/readback, escopo de todos os perfis, consentimentos, revisão/CAS e recibos. Não existe motor novo de XP ou persistência de domínio paralela.

A etapa de acesso agora vem primeiro no workspace. Modos Entrar/Criar conta separados, botões nativos com aria-pressed e estado visual dourado, labels/autocomplete adequados; cadastro exige confirmação de senha e mínimo local de oito caracteres, além da política do servidor. Senhas existentes de login não são normalizadas ou submetidas ao novo mínimo de cadastro. Trocar modo limpa campos sensíveis; trocar um acesso validado descarta somente sua sessão em memória e renova os consentimentos, preservando arquivo, vínculo, intent e journal. Feedback de Auth fica junto ao formulário, separado das mensagens da transferência.

Uma barreira de readiness aguarda a inspeção inicial de vínculo/intent/journal e a reinspeção após mudanças de storage antes de aceitar ações. Um toque rápido não pode cancelar a leitura por avançar a geração e deixar metadados incompletos. Isso não volta a exigir arquivo para autenticar; somente exige que o contexto esteja conferido.

## Cadastro e confirmação

`account-access` recebe um cliente já construído por ação explícita; não cria Auth, storage ou rede no import. signUp usa emailRedirectTo fixo da própria origem para `/?progresso=conta`, sem redirect arbitrário vindo de query/input. Resposta é genérica quanto à necessidade de confirmação para não anunciar a existência de outra conta.

Mesmo se o servidor retornar uma sessão por autoconfirm, o cadastro **não** a transforma em identidade da conferência nem aciona envio/handoff. O workspace descarta essa sessão localmente, volta a Entrar e pede login explícito. Descarte local não é declaração de revogação de sessões no servidor. Reenviar confirmação é outra ação explícita, com e-mail apenas, propósito signup e mesmo destino fixo; não transmite senha, não repete pedidos automaticamente e orienta conferir o e-mail diante de resposta ambígua.

Login usa signInWithPassword e depois getUser no servidor. O ID validado precisa corresponder ao da resposta de login e, no workspace, a cada vínculo/tentativa/escolha pendente existente. URL, nome/avatar, user_metadata ou arquivo local não autenticam. Erros/retornos tardios descartam somente o cliente pertencente à tentativa; não apagam a sessão de uma operação mais nova nem restauram autoridade de envio depois de mudança do contexto.

## Retorno seguro antes do app

Uma confirmação pode voltar ao Site URL padrão, inclusive à raiz, se o redirect não estiver configurado. Isso poderia deixar o SDK legado interpretar credenciais e disparar cloud-first. O bootstrap agora reconhece retornos Auth antes de openProgress/importação do App, limpa o endereço e abre somente o workspace isolado.

Credenciais usuais no fragmento/query são descartadas, sem setSession/exchange automático, registro em history.state, storage ou logs. O aviso “link aberto” é só informativo: login posterior comprova a identidade. Erro/recusa também é limpo; falha no history.replaceState ou no carregamento do workspace nunca cai no App como fallback. A recuperação PKCE da F4 mantém sua entrada própria e prioridade, sem perder esse protocolo.

Não tratar todo `code` de todas as páginas como Auth do app. Código de callback distinto do Google Calendar não é interceptado por essa regra; navegação comum continua intocada. Raiz, /auth e conta são contextos reconhecidos para query code, e credenciais Auth explícitas em fragmentos/queries são isoladas inclusive fora dessas rotas. Nenhum ajuste foi feito na integração Google ou nas tabelas correspondentes.

## Compatibilidade hospedada

A versão do produtor passou para 0.1.122. As migrações F3/F4 já aplicadas permaneceram byte a byte intactas. Nova migração gerada pela CLI, condicionada ao hash do validador 121 e gate com escrita fechada, acrescenta somente a versão 122 ao mesmo schemaVersion:1. Não amplia versões futuras indiscriminadamente, reescreve arquivos existentes, muda fórmulas, cria usuário ou habilita escrita.

Aplicação aceita no DominioDoMagoDB. ID remoto/local **20261030211424_account_archive_version_122.sql**; ID original gerado pela CLI: 20261030211040. Loader alinhado, sem arquivo duplicado. SHA-256 do patch: `eddb04b4faf01a42a0fc0ef065297cf38408f0d7e642d73992a523c2c73915d2`. Corpo anterior confirmado: `25abb9a4660a380cc09d76f5859804c2335997f70dcc841b53e4b424ffb67275`; corpo novo: `a1673918e5294ced9b1f5e17f2cac08e0bddf681f3a6ba8fed2cc9bf565216cb`.

[Pós-verificação reduzida](evidence/CONTA-REVISAO-122-2026-10-30.json): validador puro PG17 aceitou envelope estrutural mínimo/sintético 122 e retornou o SHA esperado; gate continua fechado, rotina invoker/search_path fixo, sem execute para anon/authenticated. Não é conta completa, Auth ou commit de progresso e nenhum arquivo pessoal foi enviado. Advisors manteve os mesmos avisos: [função antiga com search_path mutável](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [proteção de senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) e [RLS sem policies em tabelas privadas deliberadamente sem acesso direto](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Não modificar essas configurações por inferência.

## Verificações e limites

**654 testes globais finais aprovados** após a barreira de inspeção (`/tmp/account-f5-release-all.log`, 36,28s). Quatorze casos novos nesta entrega: SDK/HTTP sintéticos para cadastro/login/reenvio, callbacks/retornos sem adoção, modos/consentimentos e preservação de tentativas, autoconfirm não adotado, resposta tardia, fallback raiz e ausência de tráfego no aviso de confirmação. 33 testes direcionados aprovados (`/tmp/account-f5-final-targeted.log`). TypeScript/lint e build envDir:false final (36,81s) aprovados nos logs `/tmp/account-f5-release-types.log`, `...-lint.log` e `...-build.log`. CSS do seletor compila com o tema existente, sem inferir aceite visual. PGlite cobre arquivo de produtor 122 aceito somente após revisão correspondente e preservação dos arquivos anteriores/gate.

Uma primeira versão do novo teste de troca de acesso tentou selecionar arquivo em uma fixture com intent pendente, onde esse input não deve existir. O setup foi corrigido para preencher somente o acesso; nenhuma asserção de proteção foi removida. Suíte anterior de 652 foi substituída pela final após adicionar o caso do aviso de confirmação. Não são testes de entrega real de e-mail, signup/login hospedado, navegador, teclado/mobile/tablet ou transferência pessoal. Callbacks usam URL/DOM/hooks sintéticos e SDK instalado com fetch substituído, não credenciais reais.

Gates de transferência continuam false. Sem Auth/configuração real, secrets/.env, conta/e-mail pessoal, dados de domínio lidos ou alterados pelo agente, deploy/push ou subagentes. Somente metadados/gate e validador puro foram consultados no serviço; não prometer conta pronta por isso. CLI cache de versão foi limitado/restaurado ao valor versionado anterior, sem atualizar instalação global. Revisão de custódia sequencial no fechamento: `/tmp/account-f5-final-review.json`; escopo, versões, hash das migrações anteriores, links e git diff --check conferidos.

Documentação primária consultada: [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [resend signup](https://supabase.com/docs/reference/javascript/auth-resend). Revisão React/UX sequencial: controles com labels/tipos/feedback, consentimentos separados, imports de Auth só após ação, nenhuma hidratação de domínio nos helpers/retorno; não equivale a fidelidade visual validada.

## Custódia final

Revisão sequencial concluída: 679 de 700 entradas anteriores idênticas ao baseline; 21 diferenças e seis arquivos novos no escopo, nenhum inesperado. CSS limitado ao seletor de modo do workspace, sem alteração de outras telas. Versões, links, gates, hashes das migrações anteriores, ID do novo patch e git diff --check conferidos em `/tmp/account-f5-final-review.json`. Nenhum store, serviço legado ou fórmula alterado. Reservas encerradas; continuidade/fila/manual/dossiê/ADR/changelog atualizados.

## Próximo — F6 em Sol Alto

Retomada de acesso após recarga com consentimento próprio, renovação/expiração e saída, antes de importar App e sempre vinculada à identidade remota e ao progresso integral/CAS já existente. Não transformar Map temporário em token permanente por conveniência. Validar de modo essencial signup/confirm/login/recuperação/salvamento integral no serviço autorizado antes de liberar gates. Configuração de redirect/template público precisa corresponder aos caminhos usados; não foi lida ou alterada nesta rodada. Nova conta vazia ainda precisa da experiência de início integral. Progresso pessoal continua dependendo da cópia anterior e da associação explícita/readback; não foi transferido por este lote. Manter Sol Alto; avisar antes de voltar a Médio no UX delimitado.
