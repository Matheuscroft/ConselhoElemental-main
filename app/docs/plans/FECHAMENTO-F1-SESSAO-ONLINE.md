# Fechamento F1 — ciclo de sessão online — 0.1.119

30/10/2026 · Sol Alto · Astro Boy sequencial · codex/fitness-ui-integration, base b11ed9d. Primeiro lote do [fechamento de conta](FECHAMENTO-CONTA-E-PUBLICACAO.md). Não conclui cadastro/sync/migração hospedados nem abre gates.

## Constatações

Consulta read-only `list_projects` pela conexão Supabase retornou DominioDoMagoDB como INACTIVE. Usuário confirmou ser o destino correto. Não retomado, não consultadas tabelas/dados/chaves, não aplicada migração. Status é daquele momento e deve ser atualizado antes do trabalho remoto. Outro projeto listado não foi usado. Nenhuma credencial/.env lida.

Sessão do workspace tem persistSession:false, autoRefreshToken:false e detectSessionInUrl:false. Esses limites são adequados à conferência isolada, mas o handoff online usava o mesmo cliente sem iniciar renovação. Isso pode interromper salvamento de sessão longa quando o token expira; não houve prova desse incidente com conta real. Revisão SDK instalado e documentação oficial: https://supabase.com/docs/reference/javascript/auth-startautorefresh e auth-stopautorefresh. Início/parada manuais exigem gerenciar visibilidade; não se adicionou refresh persistido ou cliente Auth paralelo.

## Correção

account-session-refresh serializa start/stop: início explícito no handoff online, stop ao ocultar, start ao voltar e remoção do listener/stop no cleanup. Um início assíncrono atrasado é seguido de parada após descarte. Erro ativo invalida a sessão do coordenador; progresso local/tentativa continuam protegidos pelos mecanismos anteriores. Não aguarda chamadas Auth dentro de onAuthStateChange.

account-session mantém tokens só em memória, oferece startLiveRefresh e torna dispose idempotente. Depois de encerrado, getItem retorna null e setItem tardio não repopula memória. Nenhuma revogação global de sessões, gravação de senha ou limpeza de progresso. O workspace entrega o callback ao LiveAccountSession após as confirmações existentes; mount-account-app só o inicia dentro de seu caminho exclusivo/local protegido e remove em falha/stop/saída. O type opcional preserva callers/harness anteriores; o handoff de produção fornece a implementação.

## Evidência e limite

17 testes direcionados aprovados em `/tmp/account-f1-focused.log`, com respostas/Auth/visibilidade sintéticos. Quatro casos novos: visibilidade e cleanup, início atrasado/stop, falha/oculto, dispose/credencial tardia. SDK real com HTTP sintético já testado no arquivo de sessão, sem rede/Auth real. **621 testes globais aprovados** (`/tmp/account-f1-all.log`, 39,47s), TypeScript/lint aprovados (`...-types.log`, `...-lint.log`), build envDir:false em 43,06s (`...-build.log`). Avisos prévios de bundles/Browserslist mantidos. Baseline: 557 de 566 entradas anteriores idênticas; nove diferenças limitadas ao ciclo de sessão, teste e versões/whitelists. Novos helper/teste separados. Versões/links/diff conferidos; custódia sequencial encerrada.

Baseline `/tmp/account-f1-before.json`. Nenhum store/economia/recorrência, gate ou dado pessoal alterado. Whitelists frontend/SQL NÃO aplicado somente versão. Sem deploy/push, servidor externo, usuários reais ou migração. Sessão ainda não sobrevive a reload por credencial salva; login persistente, recuperação de senha, entrada de nova conta vazia, migração do arquivo pessoal e validação hospedada continuam no plano de fechamento. Usuário não precisa executar microtestes deste lote.

Próximo em **Sol Alto**: conferir disponibilidade do projeto confirmado e o contrato hospedado quando ativo; fechar cadastro/sessão e migração integral por fluxo único, preservando cópia anterior. Não inferir que os testes de QA dos lembretes validam Auth/RLS ou isolamento remoto. Backend hospedado inativo impede essa prova, mas não impediu esta correção local.
