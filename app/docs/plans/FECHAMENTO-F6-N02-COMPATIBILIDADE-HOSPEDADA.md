> Atualização07/11: pacote aplicado em [F6-N03](FECHAMENTO-F6-N03-COMPATIBILIDADE-INSTALADA.md), mantendo escrita fechada. Este texto preserva a revisão anterior à aplicação.

# F6-N02 — conexão retomada e compatibilidade hospedada preparada

07/11/2026 · Astro Boy sequencial · Sol Alto · base67bb6e5/codex/fitness-ui-integration. App local135, Vercel134. Pacote da mesma versão135, sem nova alteração em src ou assets. **Pronto para revisão/autorização; não aplicado.**

## Conexão e estado confirmado

A primeira consulta SQL desta retomada também expirou. O metadata do projeto informou ACTIVE_HEALTHY, mas health advisors retornou que o projeto estava hibernado e acordaria com requisição suportada. Após leituras públicas válidas de Auth/Data API, a consulta SQL respondeu. Hibernação é a explicação consistente com a mensagem do serviço; a ordem dos eventos não prova que uma chamada específica causou a retomada.

Não foi necessário login novo, troca de chaves ou acesso a secrets. Usada somente a configuração pública já publicada no vercel.json; valores não registrados na evidência. Health posterior retornou zero lints. O preflight exato do pacote foi executado com BEGIN READ ONLY/ROLLBACK no banco real e retornou preflight_122_to_135_ok, sem CREATE/UPDATE ou mudança de gate. Consulta agregada de logs retornou lista vazia; isso não prova ausência de eventos ou problemas fora da consulta.

Confirmado no DominioDoMagoDB/myvxvgeyseoyugskqlqr:

- Uma configuração de escrita consultada: writes_enabled=false. Nenhuma alteração de gate.
- Histórico tem somente instalação integral120 e revisões121/122. Validador instalado corresponde exatamente ao hash122: `a1673918e5294ced9b1f5e17f2cac08e0bddf681f3a6ba8fed2cc9bf565216cb`.
- Dez rotinas do protocolo catalogadas por hash/caminho de busca/permissões; wrappers públicos são invoker, sem EXECUTE de PUBLIC/anon. Três helpers privados acessíveis a authenticated são os previstos pelo protocolo. Não se ampliou acesso.
- Três tabelas privadas com RLS e nenhum privilégio direto para anon/authenticated. Dez gatilhos de proteção de escrita legada presentes e habilitados.
- Auth público: cadastro e e-mail habilitados, confirmação exigida. Não valida entrega de e-mail ou redirects do domínio novo.
- RPC de leitura chamada sem login com ID nulo foi negada com HTTP401/42501. Nenhuma conta/sessão real criada, nenhum arquivo pessoal transmitido ou linha de atividade consultada.

Advisors de segurança mantêm os avisos já conhecidos: [RLS sem policies nas tabelas privadas deliberadamente sem acesso direto](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [search_path de função anterior](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) e [proteção de senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Nenhuma configuração foi alterada para silenciar avisos.

## Pacote concreto proposto

Arquivo a aplicar: [arquivo135 instalado em N03](../../supabase/migrations/20261107042615_account_archive_version_135.sql). Gerado originalmente pela CLI em F6-N01 e revisado antes de qualquer aplicação; agora consolida a passagem direta122→135, preservando o corpo final do validador135 já testado. SHA do pacote está na evidência abaixo.

Única mudança funcional no banco: `CREATE OR REPLACE` do validador privado para reconhecer produtores85–135 no MESMO schemaVersion1. Não altera estrutura do backup, checksum, campos, origens, permissões, tabelas, autenticação, funções de pontuação, arquivos armazenados ou XP. Não contém INSERT/UPDATE/DELETE de atividades, não faz upload de progresso e não abre escrita.

Preflight falha ANTES da mudança se o banco não corresponder ao revisado: hash do validador122 (134 apenas para ensaio sequencial arquivado), gate único fechado, hashes/permissões/security/search_path das nove outras rotinas, invoker e acesso privado do validador, RLS/acesso das três tabelas e dez gatilhos legados esperados. O corpo-alvo tem SHA `16bbb83d98310d34e9713aebfb0ba0ef6fe4c1706fdeab59ee89d111b66150d3`.

### Organização dos candidatos anteriores

Doze candidatos intermediários123–134, nunca instalados neste serviço segundo o histórico atual, foram movidos para `supabase/review-candidates/producer-versions/`, preservados byte a byte/SHA. Continuam acessíveis ao teste sequencial histórico; não são mais passos pendentes de deploy. Arquivo135 permanece em migrations como o único patch de compatibilidade a aprovar. Loader de integração agora usa120+121+122+135 direto. Fontes da aplicação e candidatos instalados120–122 ficaram intactos.

Não usar `supabase db push` de toda a pasta: ela também contém migrações legadas fora deste escopo. Aplicar somente o arquivo135 revisado pelo conector no projeto confirmado. Após aplicação, conferir o ID efetivamente registrado e alinhar o arquivo/loader se o serviço gerar timestamp distinto, como nas instalações anteriores. Não inventar entradas de histórico para os12 candidatos arquivados.

## Verificações executadas nesta rodada

- Cinco testes iniciais de compatibilidade consolidada/sequencial passaram (8,10s).
- 324 testes de backup/conta passaram (46,17s), antes da última guarda explícita de gatilhos.
- Após essa guarda,13 testes finais de consolidação/versão/início de conta passaram (8,45s). Cobrem passagem direta122→135, cadeia histórica134→135, arquivo120 preservado byte a byte, todos os grants/owners e nove outros corpos inalterados, gate fechado e rejeição de136.
- Testes impedem migração com gate aberto, grants/RLS incompatíveis, função alterada ou gatilho removido. Ensaio com ROLLBACK conserva exatamente o validador122 e o gate.
- ESLint e git diff --check passaram. Fonte de app comparada aos hashes de N01 sem diferença; sem nova execução de build/TypeScript/navegador para este pacote SQL/documental.

[Evidências atuais](evidence/conta-compatibilidade-0.1.135/verificacoes.json), [funções hospedadas](evidence/conta-compatibilidade-0.1.135/funcoes-hospedadas.json), [gatilhos](evidence/conta-compatibilidade-0.1.135/gatilhos-hospedados.json) e [inventário dos candidatos movidos](evidence/conta-compatibilidade-0.1.135/candidatos-arquivados.json). Esses arquivos só contêm metadados, hashes e resultados reduzidos; não contêm atividades, backups ou credenciais pessoais.

## Aplicação, conferência e retorno

Antes de aplicar: autorização específica do usuário, reconsultar hash/gate para evitar usar catálogo obsoleto e confirmar SHA do arquivo aprovado. Não alterar o pacote após aprovação silenciosamente. Executar somente esse SQL no projeto confirmado.

Depois: consultar hash-alvo, gate=false, grants/RLS/gatilhos e histórico; validar um envelope SINTÉTICO135 no validador puro sem criar conta nem armazenar o arquivo. Conservar o endereço Vercel e o progresso dos aparelhos. Falha de preflight/DDL reverte pela transação; não executar limpeza ou reaplicar patches antigos. Se a compatibilidade for aplicada, versões antigas permanecem aceitas; manter gate fechado é o retorno seguro, sem downgrade automático ou apagamento de dados.

## Autorização e próxima fase

[ADR-004](../04-ADRs/ADR-004-Progresso-Integral-Opt-In.md) registra que a autorização anterior foi “Sim, aplicar somente essa migração com escrita desativada”. Ela se referia à instalação anterior; não autoriza esta nova migração nem abrir escrita por inferência. Solicitar agora somente compatibilidade135 com escrita desativada. Produto135 permanece local, conta=false, lembretes=false, restore=true; sem push/deploy nesta rodada.

Depois da compatibilidade: verificar redirects para conselho-elemental-testes.vercel.app e aceitar Auth real/cadastro/confirmação/login/recuperação/retomada. Liberação de escrita e associação do progresso pessoal continuam sendo passos explícitos e separados. Mantenha Sol Alto até essa conclusão; Sol Médio no polimento mobile posterior.

Custódia sequencial e revisão delimitada concluídas. F6-N02 aguardando autorização de aplicação; arquivos do pacote/testes ficam reservados até essa decisão, sem bloquear o frontend independente. Usuário ainda precisa confirmar a importação pessoal corrigida no iPhone; não tratar a compatibilidade do banco como transferência já feita.
