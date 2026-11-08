> Retomada F6-N02 (07/11): conexão SQL voltou, baseline122/gatefalse reconfirmados e pacote consolidado135 preparado. Ver [estado atual e autorização pendente](FECHAMENTO-F6-N02-COMPATIBILIDADE-HOSPEDADA.md). As falhas descritas abaixo são o registro histórico de N01.

# F6-N01 — início integral de conta nova — 0.1.135 local

07/11/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration/base67bb6e5. Pedido autoriza continuar a etapa de contas após M06, preservando progresso pessoal. Alterações anteriores130–134 conservadas. Não é ativação pública, aplicação remota ou transferência pessoal.

## Entrega

Fechada a lacuna de início em aparelho vazio: após login explícito, o workspace oferece “Sua primeira jornada” com consentimento para começar do zero, salvar/sincronizar e confirmação de outras abas fechadas. Retomada por até12h é opcional, como no caminho existente. Quem já possui arquivo/progresso é orientado a importar/receber; qualquer projeção local existente, vínculo ou pendência impede o início vazio. A operação não tenta decidir pela conta a partir de nome/avatar/arquivo.

`initial-character` extrai exatamente os valores anteriores de User/Onboarding do appStore. A store e o novo snapshot usam as mesmas fábricas; teste compara todas as projeções iniciais, exceto UUID/data naturalmente distintos. XP inicial permanece0, Prana100 como antes. Não altera fórmula, prêmio, saldo, ID ou histórico existente. Fitness recebe os contêineres iniciais da própria projeção; seu catálogo continua sendo preparado pelo caminho de hidratação atual.

`startNewAccountProgress` não importa stores, Auth global ou App. Com a conta autenticada, confirma leitura integral/coverage e estado remoto vazio pelo transporte/revisões já existentes. Só então cria as projeções vazias pelo journal de restauração atual, confere bytes e continua localmente. O primeiro envio reutiliza `beginAccountTransfer`, intent durável, revisão expectedRevision=empty, commit atômico e recibo/readback; o vínculo é finalizado pelo helper existente. Não há segundo protocolo de persistência, nova tabela ou nova chave de progresso.

Exceção delimitada de cópia anterior: não havia progresso local para exportar. Apenas o arquivo vazio recém-criado pode iniciar esse primeiro envio sem seleção externa de backup; a verificação de bytes continua sendo feita. Todos os envios posteriores e a associação de progresso existente preservam o requisito de cópia salva/conferida. Se outra aba criar dados, o início vazio falha sem apagar o conteúdo.

Handoff usa a sessão autenticada existente e o coordenador de sincronização já instalado. O wrapper UI bloqueia toque duplo, invalida consentimento/resultado tardio quando o contexto muda e não inicia sem callback de sessão ou gate. Em falha, o mesmo journal/intent orienta a retomada; não repete commit ou cria outro personagem automaticamente. O link “Reabrir conferência segura” permite voltar ao guard de bootstrap quando a recuperação está pendente.

## Verificações executadas

- 28 direcionados de início/AccountWorkspace/candidato SQL passaram (8,40s), depois oito do início repetidos com teste adicional de edição/sync real da store (2,87s).
- Suíte completa final: **690 testes**, zero falhas/pulos, **59,38s**.
- TypeScript, ESLint e build Vite envDir:false aprovados; build13,38s. Avisos conhecidos de chunks/Browserslist mantidos.
- PGlite executou SQL real em memória: duas contas distintas, leitura/commit/CAS/recibo e primeira atividade posterior salva pelo coordenador live; zero XP inicial preservado. Não é Supabase hospedado/JWT real.
- Cenários de gate fechado/consentimento/lease ausentes, bytes locais existentes, estado remoto prévio/legado/falha, troca de identidade/edição concorrente, interrupção local e resposta de commit perdida preservam dados/journal/intent; recuperação não duplica commit.
- Sem teste novo de navegador, teclado do iPhone, cadastro/e-mail/login real, servidor remoto ou importação pessoal. Não reapresentar M06 como evidência visual deste novo fluxo.

[Evidências selecionadas](evidence/conta-nova-0.1.135/verificacoes.json).

## Estado hospedado e limite concreto

Consulta de projetos via conector listou DominioDoMagoDB/myvxvgeyseoyugskqlqr ACTIVE_HEALTHY. Duas consultas SQL somente de leitura expiraram com Connection terminated due to connection timeout (uma consulta de metadados do validador/gate; depois apenas o gate). Isso não confirma o estado atual do gate nem do validador.

Fallback pela CLI oficial2.119: help consultado; comando corrigido para --linked --project-ref, que usa Management API, recusou por ausência de login. Não foi aberto arquivo de credencial, variável de ambiente, senha do banco ou token; não usar --debug para expor contexto de autenticação. Não repetir consultas idênticas indefinidamente ou tratar falha como conta vazia.

Changelog oficial Supabase consultado; mudanças de Flutter/CLI3 não foram adotadas. Versão135/whitelist e candidato CLI20261107030703_account_archive_version_135.sql preparados/testados apenas localmente, mantendo schemaVersion1 e preservando arquivos armazenados/gate fechado no ensaio. Nenhum SQL remoto/configuração Auth/conta real foi alterado. Gate do código conta=false, lembretes=false, restore=true. Projeto de testes permanece no deploy134; não publicar conta inacabada como pronta.

## Retomada e próximo aceite

1. Restabelecer consulta SQL ao projeto correto pelo conector, ou autenticar CLI oficialmente sem enviar chaves pelo chat. Confirmar hash instalado/versão do validador, gate e grants antes de preparar a aplicação compatível do produtor atual. O último registro histórico era122; não foi reconfirmado nesta rodada.
2. Preparar pacote hospedado revisável e pedir escopo específico antes de aplicar migrações ou abrir escrita. A autorização anterior cobria somente a migração integral com escrita desativada; este lote não amplia isso por inferência.
3. Conferir redirects de Auth para o domínio fixo; aceite essencial de cadastro/confirmação/login/recuperação/reload e duas contas separadas no serviço. Código/testes locais não substituem esse aceite.
4. Só então liberar contas/sync, publicar no MESMO projeto de testes e associar o progresso pessoal pelo caminho de cópia/readback. O progresso de Fábio não usa o botão de início vazio. Usuário ainda deve confirmar a importação local corrigida em M06 no iPhone.

Continuar em Sol Alto até fechar contratos/Auth/serviço; Sol Médio depois, no aceite/polimento mobile delimitado. Sem subagentes ou dependência de um novo chat de Matheus. Custódia sequencial concluída, reservas encerradas neste ponto; F6 permanece parcial, com uma lacuna local fechada e validação hospedada pendente.
