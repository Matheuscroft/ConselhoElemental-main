# Fechamento F3 — instalação integral hospedada — 0.1.120

30/10/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base b11ed9d. [Plano de fechamento](FECHAMENTO-CONTA-E-PUBLICACAO.md). A fase inicial foi inspeção/preparação. Depois de revisar o pacote, Fábio autorizou explicitamente: “Sim, aplicar somente essa migração com escrita desativada”. A aplicação hospedada foi executada exclusivamente nesse escopo; nenhum gate foi aberto ou progresso pessoal transferido.

## Resultado da aplicação autorizada

`apply_migration` retornou success:true. Histórico remoto: **20261030202517 / progress_account_atomic**. O serviço gerou esse identificador; o arquivo local foi renomeado para `supabase/migrations/20261030202517_progress_account_atomic.sql` e o loader de testes passou a usar esse nome. Conteúdo idêntico ao arquivo aprovado originalmente como 20261029182304_progress_account_atomic.sql: SHA-256 abaixo preservado. Não manter cópia SQL duplicada na pasta, reparar histórico antigo por suposição ou executar db push de todas as migrações legadas.

Pós-verificação real por catálogos e gate: três tabelas privadas com RLS e sem privilégios diretos de SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER para authenticated ou anon; anon sem USAGE no schema privado, authenticated com USAGE apenas para o protocolo; dez funções com search_path fixo e EXECUTE revogado de PUBLIC/anon; três wrappers públicos invoker; somente três helpers privados callable por authenticated, vinculados ao protocolo. Dez triggers guards ativos, 12 triggers anteriores de updated_at e as duas tabelas Google Calendar presentes. Gate com uma linha e **writes_enabled=false**. Cliente ACCOUNT_TRANSFER_WRITES_RELEASED permanece false. A aplicação compilou o SQL em PG17.11; não comprova login/JWT/PostgREST ou sync por conta.

[Evidência de instalação e permissões sem dados pessoais](evidence/CONTA-INSTALACAO-2026-10-30.json). Advisors após DDL mantém os dois WARN existentes e acrescenta três INFO de RLS sem policies ([referência](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Aqui a ausência de policies é deliberada: tabelas privadas sem acesso direto, com protocolo pelas funções verificadas. Não criar policies permissivas para silenciar o INFO.

As seções seguintes registram a inspeção anterior e o pacote aplicado, sem promover a instalação a conta pronta. Nenhuma linha pessoal foi selecionada ou importada; não é prova de igualdade byte a byte de todos os dados hospedados. O arquivo SQL não atualiza/apaga linhas legadas.

## O que foi comprovado no destino

DominioDoMagoDB, referência pública `myvxvgeyseoyugskqlqr`, retornou **ACTIVE_HEALTHY**. PostgreSQL 17.11 confirmou presença de auth.uid(), sha256(bytea), gen_random_uuid(), anon e authenticated. Retomada F2 concluída quanto à disponibilidade; não é prova de login/sync integral funcionando.

list_migrations retornou histórico vazio. list_tables e consulta de catálogos confirmaram as dez tabelas legadas, RLS habilitado, políticas por auth.uid e triggers anteriores de updated_at; **progress_private e as três RPCs integrais não existiam no catálogo observado antes da aplicação**. Não confundir histórico vazio com banco vazio. As duas tabelas Google Calendar também existem e ficam fora desta migração. Nenhuma linha de atividades, perfil ou sessão Auth foi selecionada. Estimativas de quantidade retornadas pelo inventário não foram usadas como prova de ausência de dados.

[Metadados reduzidos sem linhas pessoais](evidence/CONTA-SCHEMA-2026-10-30.json). Diferenças relevantes em relação ao SQL inicial local: drafts tem notes; cycle_sequences não tem is_active; sequence_memberships usa sequence_id/habit_id obrigatórios, sem position. Esses campos não são dependências do arquivo integral: não é necessário alterá-los ou executar as migrações antigas de alinhamento para instalar o novo contrato. Não executar db push de toda a pasta.

## Código local preparado

A migração existente ganhou um preflight dentro da transação, antes do primeiro CREATE. Recusa schema integral já existente, qualquer RPC pública com nome conflitante (inclusive overload), dependências ausentes, tabela incompatível, proprietário sem UUID obrigatório, ausência de RLS ou trigger guard já presente. Erros deixam a instalação sem objetos parciais. Colunas legadas não utilizadas pelo contrato continuam livres para variar; não se exige reproduzir todo o schema local no banco do Matheus.

Teste novo account-installation.test.mjs usa PostgreSQL em memória com Auth/roles sintéticos e a variante de colunas observada. Confere igualdade das linhas sintéticas, colunas/defaults, políticas e triggers anteriores; instalação fechada; leitura de conta legada como legacy; arquivo integral byte a byte para conta nova depois de liberação exclusivamente no teste; escrita antiga preservada para conta sem opt-in. Também testa tabela/coluna ausente, propriedade nullable, RLS desligado, Auth ausente, RPC conflitante e tentativa de reinstalação preservando revisão/recibo/gate anteriores. load-account-db.mjs separou a criação da base legada para esses testes e fecha o banco em caso de falha da instalação.

Versionamento: package/lock sincronizados em 0.1.120; auditor e SQL aceitam adicionalmente essa versão, com o mesmo formato de arquivo/domínio. Sem alterações de fórmulas, stores, Auth do produto, UI ou gates.

## Pacote aprovado e aplicado

- Destino único: DominioDoMagoDB / myvxvgeyseoyugskqlqr.
- Arquivo atual: `supabase/migrations/20261030202517_progress_account_atomic.sql`; nome original na aprovação: `20261029182304_progress_account_atomic.sql`.
- SHA-256 conferido: `9d0d074a51e62f4a98248ff699948546aab6a8203f586bd5d556b4b65bf85809`.
- Efeito: criar schema progress_private, três tabelas privadas (estado integral, recibos e gate), sete rotinas privadas, três wrappers públicos e dez triggers de proteção nas tabelas legadas. Preservar colunas, políticas, funções anteriores e linhas existentes. Gate do servidor nasce **false**; gates do cliente permanecem false.
- Sem aplicar as migrações anteriores, cadastrar usuários, enviar progresso, alterar Auth/redirects/chaves, ligar sincronização, publicar frontend ou executar deploy na Vercel.
- Antes da aplicação: repetir o preflight de metadados para detectar mudança concorrente e conferir o mesmo hash. Aplicar somente este arquivo pela ferramenta de migração, não por SQL de dados nem pasta inteira. A transação já envolve todos os objetos.
- Se houver falha: rollback da transação; não tentar corrigir o banco automaticamente ou remover objetos preexistentes. Depois de sucesso, conferir schema/RPCs/grants/RLS/triggers/gate e Advisors. Em suspensão do rollout, manter ambos os gates fechados; não apagar tabelas privadas se houver qualquer estado/recibo posterior.
- A proteção anterior de progresso pessoal continua sendo a cópia integral salva e conferida no app, antes da associação explícita. Esta preparação não acessou esse progresso, não gerou cópia pessoal e não transfere localStorage para Vercel.

## Alertas existentes observados

Advisors security retornou dois WARN: public.touch_updated_at sem search_path fixo ([orientação oficial](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)) e proteção contra senhas vazadas desativada ([orientação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)). Nenhum dos dois WARN foi corrigido automaticamente ou atribuído à nova migração; permaneceram após a instalação. Os três INFO novos e sua justificativa estão na pós-verificação acima. Não ler configuração Auth completa para buscar chaves; separar eventual ajuste com escopo próprio.

Changelog oficial consultado; página markdown exigiu fetch textual porque web open recusou text/markdown. Nota [PostgreSQL 17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) revisada: este pacote usa SHA-256 nativo/UUID e não cria índices ltree/btree_gist, operadores customizados ou criptografia PGP. Não foi feita auditoria global dessas extensões ou dos dados do banco.

## Verificação e limite

23 testes direcionados finais aprovados; TypeScript e lint global aprovados, lint adicional do último teste aprovado; Vite envDir:false em 35,47s, sem ler .env. **625 testes globais finais aprovados** novamente após o alinhamento do nome do arquivo em 19,40s, incluindo scripts/astro-boy.test.mjs; log `/tmp/account-f3-installed-all.log`. Lint do loader/teste após alinhamento também aprovado (`/tmp/account-f3-installed-lint.log`). Logs `/tmp/account-f3-targeted-final.log`, `/tmp/account-f3-types.log`, `/tmp/account-f3-lint.log`, `/tmp/account-f3-lint-final.log`, `/tmp/account-f3-build.log`, `/tmp/account-f3-all-final.log`. A primeira suíte usou glob menor e 622 casos antes do último teste; foi substituída pelo comando completo depois da alteração final.

Testes são PGlite/SDK sintéticos, não JWT/PostgREST, sessões concorrentes ou navegador reais. Não repetir microtestes de layout. Migração aplicada somente após a autorização explícita, sem abertura de escrita, secrets, sessão/progresso pessoal, deploy/push ou subagentes nesta rodada. Baseline `/tmp/account-f3-before.json`; revisão final de escopo/versões/links encerrada sequencialmente. `/tmp/account-f3-final-review.json`: 670 de 686 entradas anteriores idênticas; 16 diferenças e três arquivos novos no escopo reservado, nenhum inesperado; versões, hash, gates, links e git diff --check conferidos. Confirmação específica da aplicação hospedada recebida e executada; registro final de alinhamento do arquivo e pós-verificação em `/tmp/account-f3-installed-review.json`.

**Próximo em Sol Alto:** fechar cadastro/recuperação/reload e acesso integral cotidiano, seguido de aceite hospedado essencial. A autorização recebida não libera gates, transferência pessoal, criação de contas de teste ou deploy na Vercel. Ativar conta exige mais que instalar o SQL; não pedir novamente autorização para a instalação já concluída. Matheus recebe contrato/impacto por estes documentos versionáveis; nenhuma mensagem externa foi enviada.
