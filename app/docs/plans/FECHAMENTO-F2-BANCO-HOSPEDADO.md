# Fechamento F2 — retomada do banco confirmado

30/10/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base b11ed9d. Produto **0.1.119 mantido**: esta rodada é operacional/documental, sem código de produto. Continuação do [plano de fechamento](FECHAMENTO-CONTA-E-PUBLICACAO.md), depois do [F1](FECHAMENTO-F1-SESSAO-ONLINE.md).

## Verificação posterior F3

Em 30/10/2026 o banco retornou ACTIVE_HEALTHY; [conferência de schema e pacote de instalação](FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). Os estados COMING_UP abaixo são históricos da F2, preservados como evidência.

## Destino e ação executada

Usuário confirmou **DominioDoMagoDB**, referência pública `myvxvgeyseoyugskqlqr`, região sa-east-1. `get_project` confirmou INACTIVE. A operação `restore_project` dessa referência retornou success:true e consultas posteriores retornaram COMING_UP. É a retomada do projeto pausado, não restauração escolhida de um backup histórico, novo projeto ou troca de plano. Última consulta de encerramento (30/10/2026, 19:59 UTC): COMING_UP; o estado ACTIVE_HEALTHY ainda precisa ser confirmado.

A documentação oficial distingue [retomar projeto pausado](https://supabase.com/docs/guides/platform/free-project-pausing) da restauração de backup/PITR; o [endpoint de retomada](https://supabase.com/docs/reference/api/v1-restore-a-project) recebe a referência do projeto. Não foram informados backup, data de rollback, senha ou credencial. Nenhum outro projeto foi modificado.

## Evidências reais desta rodada

- Retomada aceita pelo serviço; status observado passou de INACTIVE para COMING_UP. Aceitação da solicitação não comprova banco/Auth disponíveis.
- Durante COMING_UP, list_migrations falhou com connection timeout; list_tables e uma consulta somente de catálogos falharam com Database is possibly not accessible at the moment. Não houve resultado de schema, linhas de usuários/atividades ou SQL de escrita. Não interpretar indisponibilidade como tabela/migração ausente.
- Consulta de catálogos preparada para nomes/tipos de colunas das dez tabelas legadas, RLS, existência de progress_private, assinaturas/privilégios das funções e triggers. Sem ler linhas de domínio, auth.users, sessões, chaves ou configurações sensíveis.
- Executado `node --test tests/backup/account-database.test.mjs`: **11/11 aprovados**, log `/tmp/account-f2-database.log`. Migração SQL real em PostgreSQL PGlite isolado, Auth/roles sintéticos. Cobre arquivo integral, isolamento A/B, grants, CAS, repetição, falha transacional, gate fechado e bloqueio do escritor legado após opt-in. Não prova JWT/PostgREST, concorrência entre conexões nem banco hospedado PG17.
- Não repetidos build, lint, TypeScript ou suíte global: nenhum código de produto foi alterado. Os 621 testes/checks da F1 são evidência histórica, não novos resultados desta rodada.

## Conferência necessária quando terminar a inicialização

1. Confirmar disponibilidade com get_project. Sem repetir consultas de schema enquanto continuar indisponível. Se o estado deixar de progredir, verificar a saúde/retomada no Supabase antes de tentar outra restauração; não cancelar/recomeçar por suposição.
2. Listar migrações e metadados em public/progress_private. A migração local depende de profiles(id) e de custom_areas, custom_subareas, tasks, habits, projects, quests, drafts, cycle_sequences e sequence_memberships com user_id. Confirmar tipos/contratos e possíveis nomes conflitantes. Ausência no histórico, isoladamente, não prova ausência no schema.
3. Conferir RPCs progress_account_read, progress_account_receipt e progress_account_commit: wrappers invoker em public, helpers privados com identidade auth.uid, search_path fixo e sem execute para anon/PUBLIC; RLS e privilégios diretos das tabelas privadas; triggers do legado. Conferir gate separadamente, sem abrir escrita. Não executar as funções com identidade real para inferir permissões.
4. Antes de aplicação remota, preparar escopo específico da migração aditiva já existente, análise de compatibilidade, backup/retorno e revisão de Matheus documentada. ADR-004 não autoriza aplicação remota por si. Não executar db push de toda a pasta ou gerar chaves para destravar. Ainda não há prova de que a migração local esteja aplicada ou ausente no destino.
5. Fechar o acesso cotidiano integral: cadastro/confirmação, recuperação de senha, retomada após reload e logout/feedback de sync. O modo de conferência atual é transitório; o handoff F1 renova tokens só durante o uso autorizado. Não habilitar persistência de sessão global antiga como atalho.
6. Aceite hospedado essencial com identidades temporárias autorizadas e readback integral, isolamento entre contas, falha/retry/conflito. Só depois avaliar gates. Progresso pessoal permanece intocado até cópia integral salva e associação explícita, sem recalcular XP ou executar conclusões antigas.

## Impacto e custódia

Sem migração aplicada, deploy/push, gates alterados, segredo/.env/chaves consultados, usuários reais criados ou progresso pessoal lido/enviado. Sem inspeção de navegador ou contorno da permissão recusada. QA de lembretes não retomada. Arquivos de src, testes, migrações e manifests devem continuar idênticos ao baseline `/tmp/account-f2-before.json`. Documentação atualizada e revisão de custódia sequencial encerrada. `/tmp/account-f2-final-review.json`: 562 arquivos de produto/testes/migrações/manifests idênticos ao baseline, nenhum arquivo de produto adicionado, links F2/versões conferidos e git diff --check aprovado.

**Próximo: permanecer em Sol Alto** para disponibilidade/contrato e acesso integral. A UX delimitada poderá voltar a Médio após aviso. localhost e Vercel continuam origens independentes; esta retomada não transferiu o progresso do navegador para a conta.
