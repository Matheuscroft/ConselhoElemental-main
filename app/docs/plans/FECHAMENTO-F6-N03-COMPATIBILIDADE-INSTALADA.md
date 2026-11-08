# F6-N03 — compatibilidade135 instalada com escrita fechada

07/11/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration/base67bb6e5. App135local e Vercel134 permanecem separados. **Instalação de compatibilidade concluída; contas/sync não liberadas.**

## Escopo e autorização

Em resposta à pergunta explícita “Autoriza aplicar somente essa atualização no DominioDoMagoDB, mantendo a escrita desativada?”, usuário instruiu “ainda estou em sol alto, analise o que precisa e continue”. A continuação foi executada estritamente nesse pacote previamente revisado. Não ampliou o escopo para abrir escrita, mudar Auth, criar contas, enviar o progresso pessoal, publicar Vercel ou alterar regras de XP/Prana.

Antes de executar: arquivo135 conferido com SHA `d9f1704ca2e8b8669ab85ebd1469a1c1c0076973d2972b2f44dc225ac6a5d9ba`; preflight repetido em transação somente leitura retornou preflight_122_to_135_ok. Não houve mudança do pacote após a revisão.

## Aplicação real e histórico

`apply_migration` no projeto confirmado DominioDoMagoDB/myvxvgeyseoyugskqlqr retornou success:true. Nome account_archive_version_135. Histórico remoto registrou **20261107042615**; candidato original havia sido gerado em20261107030703.

[Arquivo instalado](../../supabase/migrations/20261107042615_account_archive_version_135.sql) renomeado para o ID efetivo, sem alterar bytes/SHA; loader dos testes alinhado. Não manter duplicata do candidato anterior nem reaplicar intermediários123–134, preservados em review-candidates. O comentário do SQL é o texto histórico do pacote aprovado e foi conservado para preservar seu hash; este relatório registra a aplicação.

A única rotina substituída foi validate_archive: produtor85–135 no mesmo schemaVersion1, conservando o contrato integral. Não executou DML de atividades/XP, upload de backup ou migração de saldo. Nenhuma linha pessoal foi selecionada; não se afirma comparação byte a byte de todo o banco real.

## Pós-verificações executadas

- Hash do validador passou de122/a1673918... para135/`16bbb83d98310d34e9713aebfb0ba0ef6fe4c1706fdeab59ee89d111b66150d3`.
- Gate com exatamente uma linha e writes_enabled=false.
- Nove outros corpos, security/search_path e permissões de execução das dez rotinas comparados ao catálogo anterior e preservados. Anon/PUBLIC sem EXECUTE; wrappers invoker.
- Três tabelas privadas mantêm RLS e nenhum acesso direto para anon/authenticated; dez gatilhos de proteção da escrita legada continuam habilitados.
- Gerados em memória dois envelopes SINTÉTICOS (120 e135), sem atividades pessoais, contas Auth ou catálogo do usuário. Validador puro hospedado aceitou ambos e devolveu exatamente os SHA-256 dos bytes enviados. Arquivos não foram gravados no account_state nem viraram conta/progresso pessoal.
- Advisors após DDL manteve somente os avisos anteriores: [RLS sem policies nas tabelas privadas sem acesso direto](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [search_path mutável de public.touch_updated_at](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) e [proteção de senha vazada desativada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Não alterados fora deste escopo.
- Treze testes locais direcionados de versão/consolidação/início de conta passaram após alinhar o filename (10,65s); git diff --check passou. Sem nova execução de suíte global, TypeScript, build ou aceite visual do app para uma renomeação de arquivo SQL e documentação.

[Evidência reduzida da instalação](evidence/conta-instalacao-0.1.135/verificacoes.json). Não contém backup/credenciais pessoais. Fonte de app/gates preservados: conta=false, restore=true, lembretes=false. Sem push ou deploy; Vercel134 continua ativo.

## Próximo — URLs de Auth e aceite integral

Documentação oficial [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) consultada: o destino solicitado precisa corresponder à allowlist; Site URL é o fallback. Ainda não foi conferida a configuração real para conselho-elemental-testes.vercel.app.

Conector não oferece leitura específica da URL Configuration. Fallback no navegador interno abriu o painel correto, mas redirecionou ao login administrativo do Supabase. Nenhum campo de senha foi preenchido ou lido. Usuário recebeu pedido para entrar por conta própria, sem enviar chaves/senha no chat. Aba mantida para handoff. Essa é a conta administrativa do serviço, não o cadastro dentro do app.

Após login: ler Site URL/Redirect URLs, preservar destinos existentes e preparar qualquer alteração pública necessária para confirmação/recuperação. Não ler páginas de chaves nem ampliar permissões. Depois: aceite real de cadastro/confirmação/login/recuperação/retomada e duas identidades, seguido de decisão explícita sobre escrita/sync. Progresso pessoal deve ser associado pelo caminho de cópia/readback, nunca pelo início vazio.

Custódia sequencial concluída e reserva do pacote SQL encerrada. Retomada de configuração Auth depende do handoff de login; não registrar esse aceite antes de observar. Mantenha Sol Alto até encerrar Auth/contratos, Sol Médio no polimento mobile posterior.
