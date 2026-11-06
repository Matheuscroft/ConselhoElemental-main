# R25-1B — associação segura à conta pessoal

Estado atual: **0.1.104 / 1B6B — escolha explícita de versão e recebimento integral implementados/testados localmente**. UI/Auth/servidor/restauração continuam fechados; conta pessoal real não ativa. **Próxima frente independente: revisão mobile/tablet do frontend em Sol Médio**, com aviso dado antes da troca. Aceite hospedado, rollout, restauração real e liberação remota continuam pendentes e exigem escopo próprio; contratos/auth complexos em Sol Alto. Fábio autorizou assumir a integração sem esperar Matheus, sem autorizar deploy/secrets/migração remota. [ADR-004](../04-ADRs/ADR-004-Progresso-Integral-Opt-In.md). Registros abaixo são históricos; fila única em FILA-ENTREGAS.

## 1B1 — cobertura e contrato preparados, 29/10/2026

Versão **0.1.98 mantida**: somente testes e documentação. Astro Boy executou sequencialmente em Sol Alto, no checkout `codex/fitness-ui-integration`, base `b11ed9d`. O usuário pediu a próxima etapa depois da restauração local 1A. A gravação de restauração continua fechada em fonte; aceite real de navegador permanece pendente. A associação online não foi executada ou habilitada. Fila operacional única em [FILA-ENTREGAS](../FILA-ENTREGAS.md).

### Conclusão para Fábio e Matheus

O backup integral e o sync atual têm coberturas diferentes. Login/autosync não podem ser apresentados como migração integral do progresso. No roundtrip sintético, árvores, IDs, recibos e contadores das atividades testadas retornam; os saldos independentes do personagem, outros perfis e Treinos não acompanham esse caminho. Uma falha no meio do envio pode deixar parte dos dados remotos atualizada e parte anterior. A existência de cópia de emergência não equivale a commit transacional nem cobre todo o backup local.

Fábio mantém UX/mobile e escolhas de produto; Matheus mantém backend, schema e persistência remota. Nenhuma fonte de produto ou política do serviço foi alterada para contornar essas lacunas. Este documento prepara o contrato; não aprova schema, mesclagem ou publicação.

### Matriz dos campos persistidos atuais

Classificação conferida contra `captureProgress` e `persist.partialize` reais: **18 campos core + 3 Fitness**. Sete coleções têm payload de atividade, cinco campos têm projeção parcial e nove ficam fora desse serviço. “Payload” não significa roundtrip integral de todo o domínio: há deduplicação/enriquecimento por `local_id`, saneamento de vínculos e normalização de posições. A preservação foi exercitada nos cenários descritos abaixo.

| Store | Campo persistido | Cobertura atual | Observação |
|---|---|---|---|
| core | `executionLogs` | Fora do sync | Livro de execuções do core sem tabela neste serviço. |
| core | `accounts` | Fora do sync | Catálogo de perfis locais sem vínculo remoto. |
| core | `currentAccountId` | Fora do sync | Seleção local não identifica o usuário autenticado. |
| core | `accountDataById` | Fora do sync | Snapshots de outros perfis não são publicados. |
| core | `user` | Parcial/projetada | profiles recebe apenas id remoto, display_name e avatar; XP e recursos não entram. |
| core | `onboarding` | Parcial/projetada | Seleções influenciam projeções de áreas; objeto completo não retorna. |
| core | `customAreas` | Parcial/projetada | Metadados passam por deduplicação e filtragem de linhas sintéticas. |
| core | `customSubareas` | Parcial/projetada | Metadados são agrupados pelo parentId; linhas sintéticas são filtradas. |
| core | `linkedSubareasByAreaId` | Parcial/projetada | Mapa é projetado em metadados de áreas base, com fallback do catálogo. |
| core | `actions` | Fora do sync | Coleção canônica não é uma tabela do sync legado. |
| core | `tasks` | Payload de atividade | Árvore e recibos seguem no payload, com deduplicação por id. |
| core | `habits` | Payload de atividade | Agenda, subitens, quantidades e recibos seguem no payload. |
| core | `cycleSequences` | Payload de atividade | Sequências seguem no payload; vínculos são saneados ao hidratar. |
| core | `sequenceMemberships` | Payload de atividade | Vínculos válidos seguem no payload; posição é normalizada ao hidratar. |
| core | `commitments` | Fora do sync | Compromissos não fazem parte deste serviço. |
| core | `projects` | Payload de atividade | Projetos, descendentes e recibo de bônus seguem no payload. |
| core | `quests` | Payload de atividade | Jornadas, referências e recibo de bônus seguem no payload. |
| core | `drafts` | Payload de atividade | Rascunhos seguem no payload. |
| fitness | `currentAccountId` | Fora do sync | Seleção local de Treinos sem vínculo neste serviço. |
| fitness | `accountDataById` | Fora do sync | Histórico legado e medidas de todas as contas ficam fora. |
| fitness | `nativeDataById` | Fora do sync | Templates, sessões, avaliações, recordes e recibos nativos ficam fora. |


`tests/backup/cloud-coverage-contract.mjs` contém essa classificação como artefato de teste. `account-association-contract.test.mjs` recusa campo novo/removido sem revisão explícita da matriz. A matriz não é usada pelo app para enviar dados e não constitui outro sync, store ou esquema remoto.

### Evidência executada

Cinco testes novos, com authStore/serviço atuais e stores reais empacotados, usando cliente/storage e perfis exclusivamente sintéticos:

1. Todas as chaves efetivamente persistidas são classificadas; exportação/conferência preservam stores e origem com checksum. Nenhuma chamada de cliente nessa captura.
2. Publicar e hidratar em outro store sintético preserva IDs, árvore/subitem e recibo de XP, registro fracionário do contador e recibo de bônus de Jornada, sem executar novamente comandos de conclusão. A hidratação acrescenta `local_id` ao objeto; o teste o confere explicitamente. O saldo independente de Fogo não é transferido: o destino conserva seu saldo anterior.
3. Outro perfil e medidas de Treinos permanecem no backup, mas não nos payloads enviados. `profiles` recebe apenas `id`, `display_name`, `avatar`; XP e recursos não entram por essa projeção.
4. Publicação repetida reutiliza identidades das linhas e mantém os recibos/payloads no cenário testado. Queries e rows do serviço são filtradas pelo `userId` fornecido. Isso **não demonstra** validação JWT, RLS, concorrência ou isolamento real do servidor.
5. Falha sintética no upsert de hábitos depois de tarefas mantém linhas antigas, pode deixar novas linhas de tarefas já gravadas e não chega à fase de delete. A cópia de emergência guarda o snapshot remoto anterior, sem constituir rollback/commit do conjunto.

`node --test tests/backup/*.test.mjs`: **155 aprovados**, zero falhas. `npm run lint` e `git diff --check` passaram. Logs `/tmp/r25-1b1-contract.log`, `/tmp/r25-1b1-backup.log`, `/tmp/r25-1b1-lint.log`. SHA-256 em `/tmp/r25-1b1-before.json`: **395 fontes/estilos/manifests preexistentes idênticos**. Não foi necessário novo TypeScript/build/suíte global por ser lote apenas de testes/documentação. O resultado global de 399 testes pertence ao lote 1A anterior e não é execução nova deste lote.

Duas expectativas da fixture foram corrigidas durante a escrita: exportação inclui checksum além do snapshot e hidratação inclui `local_id`. Não eram defeitos demonstrados no produto. Nenhuma correção de serviço/backend foi aplicada por conta desses testes. Dados pessoais, .env, sessões, secrets, SDK real, banco e rede do app não foram usados; sem browser/QA visual, commit/push/deploy ou comunicação externa.

### Contrato necessário antes de implementar a associação — proposta para 1B2

| Etapa | Pré-condição / resultado necessário | Regra de falha |
|---|---|---|
| Identidade | Identificar usuário autenticado por validação confiável de Auth e selecionar explicitamente o perfil local. IDs locais/personagem e usuário remoto são domínios distintos. | Nome igual, sessão salva, `currentAccountId`, `user_metadata` ou `user-${id}` não bastam para vínculo. |
| Prévia local | Capturar cópia integral atual e congelar perfil escolhido, bytes/fingerprint, origem e geração da operação. Guardar e conferir arquivo antes de substituir qualquer lado. | Mudança local, troca de perfil ou logout invalida consentimento/revisão antes de escrever. |
| Prévia remota | Ler estado remoto sem hidratar stores locais nem instalar autosync; obter revisão e cobertura real por domínio, incluindo XP e Treinos. | Leitura parcial/falha ou cobertura desconhecida impede associação. Não interpretar erro como nuvem vazia. |
| Conflito e escopo | Mostrar diferenças e escolher destino/política explicitamente. Proposta inicial conservadora: um perfil selecionado para conta nova/vazia; outros perfis ficam preservados localmente. | Não mesclar, substituir, somar XP ou publicar todos os perfis por padrão. A escolha de política ainda precisa de decisão de produto/contrato com Matheus. |
| Escrita completa | Backend/adapters precisam de operação coordenada, revisão de origem/destino, identidade, idempotência e cobertura de todo o escopo confirmado. Reaproveitar motor e recibos existentes. | Timeout/falha parcial mantém isolamento local; não liberar modo online porque algumas tabelas aceitaram upsert. Estratégia transacional ou staging versionado depende do backend, não foi escolhida/implementada. |
| Confirmação | Receber resultado durável de operação, usuário/perfil, revisão e fingerprint conferíveis do escopo completo; conferir leitura posterior. Repetição não concede XP nem duplica execução. | Confirmação antiga, identidade diferente ou conteúdo incompleto não autoriza remover marcador local. |
| Retomada | Só após aceite completo e confirmação explícita, preparar nova inicialização vinculada; proteger leituras/publicações tardias por usuário/perfil/geração e integrar autosync existente. | Login não remove isolamento; resposta tardia não pode hidratar/publicar sobre outro perfil após logout/troca. |

Não reaproveitar `hydrateAppStoreFromCloud` como prévia, pois ela altera os stores. Não chamar `persistAppStoreToCloud` como “migração integral” ou remover o marcador para forçar `authStore.initialize`. O serviço atual continua disponível no fluxo normal; esta proposta não modifica suas regras.

### Aceite futuro de 1B2/1B3

- Matheus define/revisa contrato de leitura completa, commit/recibo, propriedade/RLS e revisão/idempotência; schema/API/migrações terão escopo e testes próprios. Fábio decide escopo e comportamento em conflito a partir de prévia concreta.
- Testes de contrato devem cobrir os 21 campos ou exclusões explicitamente aceitas, perfil ativo/inativo, saldos/recibos, árvores, contadores, histórico e Treinos; nunca recalcular pagamentos como parte da transferência.
- Exercitar concorrência, troca de perfil/usuário, logout, falha e resposta tardia em cada await; reenvio após timeout não duplica commit/XP. Sem cobertura completa, o estado permanece local.
- QA real de 1A e integração remota com contas temporárias continuam necessários antes da liberação. Nenhuma restauração/associação pessoal para demonstrar segurança. No estado atual, **não há conexão pessoal segura habilitada** por esse trabalho.

### Fontes consultadas nesta rodada

- Código local: `src/lib/backup/capture-progress.ts`, projeções `partialize` dos dois stores, `src/services/supabaseCloudSync.ts`, audit/harness de `tests/backup`, contrato anterior em [isolamento auth/sync](R25-A-ISOLAMENTO-AUTH-SYNC.md).
- Fonte canônica: índice master e capítulo Core vs. Módulos; [base portável](../03-Project-Management/reports/BASE-CANONICA-E-EVOLUCAO.md). Sem mudar fórmulas/adapters.
- Skill Supabase e changelog público consultados em 29/10/2026. Quebra de TLS anunciada para 10/11/2026 consta no índice; nenhuma mudança de SDK/configuração foi feita, e não foi verificada a configuração remota deste projeto.
- [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser): validação confiável requer consulta ao servidor Auth; somente documentação foi lida, nenhum getUser real foi executado. RLS/propriedade devem ser confirmados em ambiente delimitado com Matheus antes de qualquer publicação.


## 1B2 — pré-conferência implementada — 0.1.99, 29/10/2026

Sol Alto confirmado; usuário pediu aviso antes de reduzir modelo e identificação clara de etapa atual/próxima. Astro Boy executou implementação/validação/custódia sequencialmente, sem subagentes. Não houve autorização nova de política de conflito, schema, escrita remota ou deploy.

### Resultado concreto na interface

Grimório → Guarde sua jornada → **Preparar conta pessoal** → **Conferir progresso local**. Painel colapsado com ícone de usuário e indicação visual de expansão; usa paleta e tipografia do Grimório, botão >=48px e grade de duas colunas, XP em quatro colunas a partir de 600px. Exibe nome, quantidades reais e os quatro saldos de XP registrados; zero não é substituído por preenchimento inventado. Informa escopo de perfil atual versus sessões de todas as contas. Não há botão de conectar/enviar/associar. QA visual/toque em viewport real ainda não foi executado.

A ação inicia captura somente por clique. Duplo clique bloqueado; geração/job por tentativa impede que um resultado cancelado desbloqueie ou substitua uma tentativa nova. Desmontagem descarta resultado e remove assinaturas. Alteração persistida em qualquer store invalida a revisão exibida; preferências/eventos sem relação não a invalidam. Storage de diário/modo local também invalida. Mudanças durante hashing são recusadas na checagem final, antes de mostrar resultado. Erros não provocam envio/limpeza/retry automático.

### Biblioteca somente de leitura

`src/lib/backup/association-review.ts` reutiliza arquivo/validação/auditoria/fingerprint/comparação existentes. Não importa SDK, serviços, stores nem captura viva, e não grava chaves de armazenamento. `prepareLocalAssociationReview` usa callbacks delimitados, serializa antes de awaits e vincula origem, perfil e conteúdo exatos; arquivo e metadados ficam em WeakMap transitório, nunca num store paralelo. A revisão exibida é imutável; uma cópia fabricada desse objeto não corresponde ao vínculo e deve ser refeita.

`AssociationReader` e `AssociationReadResponse` descrevem o adaptador de leitura **futuro**, sem implementá-lo ou criar endpoint. Métodos recebem somente usuário e sinal, não recebem arquivo local/saldo/atividades/credenciais. A identidade declarada pelo adaptador deve vir de validação confiável no backend; conferir uma string/coverage no frontend não autentica JWT/RLS nem comprova cobertura do servidor.

`prepareRemoteAssociationReview` exige revisão local atual e o usuário de destino esperado ainda vigente. Recheca origem/perfil/fingerprint/geração/usuário após leitura de identidade, resposta e hashing/comparação. Mudança de usuário/geração/logout invalida; AbortSignal também. Erro de leitura não é conta vazia. Resposta precisa confirmar complete, mesmo usuário, revisão não vazia/limitada e cobertura exata dos 21 campos atuais. Um destino vazio exige kind empty e archive null explícitos; snapshot exige arquivo válido e auditoria sem problemas. Metadados/arquivo são capturados antes dos awaits de validação para impedir retarget por mutação do objeto do chamador. A comparação usa os saldos registrados, não reaplica conclusões ou XP.

**Todo resultado mantém associationAllowed:false**, inclusive comparação completa/vazio. A revisão remota é apenas ponto de leitura: não é recibo de commit, prova de revisão ainda vigente no servidor, decisão de mesclagem ou autorização para remover isolamento. Nenhum leitor foi conectado à UI/SDK real; na interface só existe o relatório local. O sync normal preexistente não foi modificado/pausado por esse componente. A integração futura precisa de guardas de geração monotônica no chamador e verificação de revisão no backend antes de escrever.

### Evidência realmente executada

- `association-review.test.mjs`: oito testes novos com stores reais, WebCrypto e leitor sintético: valores/imutabilidade/zero I/O; origem/perfil/alterações/auditoria; identidade divergente/indisponível; completo/vazio explícito/cobertura insuficiente; arquivo/comparação e XP; resposta tardia em cada await; cópia de argumentos contra mutação durante hash; abort/cópia adulterada/versão futura. Grafo do módulo sem stores/SDK/serviços conferido.
- `account-preparation-ui.test.mjs`: quatro testes novos com hooks/store/DOM substitutos: ativação explícita, valores/zero XP/sem IDs crus ou ação de conectar; duplo clique/cancelar/nova tentativa; relatório obsoleto; storage/desmontagem/limpeza. Não é navegador.
- Suíte global `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **416 aprovados**, zero falhas. Após ajustes finais de texto/ícone e tipo de contrato, **15 testes direcionados** repetidos; TypeScript/lint/build Vite `envDir:false` novamente aprovados, build **14,64s**. Logs `/tmp/r25-1b2-{tests-final,reviewed,types-final,lint-final,build-final}.log`. Avisos existentes de bundle/Browserslist permanecem.
- SHA-256 contra `/tmp/r25-1b2-before.json`: stores core/Treinos/auth, sync, tipos core/Treinos, cliente, main e App intactos. Alterações delimitadas aos dois arquivos novos, integração no componente de backup/estilo, versão/whitelist/manifests e testes/docs. Sem dependências novas.
- Durante os testes, corrigida a passagem do envelope com checksum ao comparador que exige snapshot. Duas fixtures também foram corrigidas: cópia de snapshot remoto precisa ser clonada antes de editar para não mutar o store real; mutação de resposta deve ocorrer depois de iniciar sua validação (hash controlado), não antes de a função recebê-la. Esses erros não foram tratados como defeito do backend de Matheus.

Sem QA/browser/conta pessoal, sessão/secret, chamada do SDK real, banco, rede do app, commit/push/deploy ou comunicação externa. Nenhuma restauração pessoal, associação, limpeza de marcador ou upload ocorreu. A porta/browser abertos pelo usuário não comprovam validação do agente.

### Etapa seguinte e modelos

1. **1B3 — Sol Alto:** integrar adaptador completo e protocolo de escrita/commit/recibo em coordenação com Matheus; identidade/perfil, escopo e conflito precisam estar definidos. A matriz 1B1 comprova que o serviço parcial atual não satisfaz essa leitura/transferência integral. Não contornar isso declarando complete true, fabricando snapshot ou removendo isolamento. Backend/migrações continuam com escopo próprio.
2. **Validação mobile/tablet e ajustes delimitados — Sol Médio:** avisar o usuário ANTES de iniciar e dar oportunidade de trocar. Navegador continua bloqueado conforme orientação vigente; sem contorno. Acesso autorizado/funcional e dados sintéticos são dependências do QA real de 1A e desta interface. Se surgir falha crítica de contrato/dados, avisar para retornar a Alto antes de corrigir.
3. **Polimento/animações/acessibilidade — Sol Médio** após fluxos; **fragmentos/inventário — Alto nos contratos, Médio na UI**. Esses nomes são frentes, não promessa de prazo/número de rodadas.


## 1B3 — conferência de disponibilidade / dependência externa, 29/10/2026

Não há novo código ou release nesta rodada. Inspeção foi necessária antes de tentar ligar a interface a um serviço incapaz de preservar todo o progresso. Fontes/migrations e exports foram conferidos; o grep de consumidores de AssociationReader/prepareRemoteAssociationReview fora do próprio módulo não encontrou integração no produto. As implementações de leitor existentes estão nos testes sintéticos. As funções exportadas pelo serviço atual são recuperação local legada, fingerprint, hidratação e persistência parciais, sem recibo/coordenador de migração integral. A main do GitHub permanece em b11ed9d85bc000e9b8fb0eb48de0d8f647823b0b, conferida por ls-remote; não foi encontrado update de main a incorporar. Outras branches/PRs não foram presumidas ou investigadas sem referência do usuário. Isso não certifica o estado do banco remoto, que não foi consultado.

### Entrega mínima para Matheus permitir a próxima integração

1. Referência concreta da branch/PR/implementação aprovada e contrato de autenticação/propriedade; distinguir usuário remoto do perfil local e informar a regra de escopo/conflito acordada com Fábio.
2. Adaptador readonly que satisfaça AssociationReader, com validação confiável de identidade e leitura integral; resposta compatível com AssociationReadResponse ou mapeamento explícito revisado. Cobertura declarada deve refletir dados efetivamente lidos, incluindo XP/recibos/histórico e Treinos, nunca um snapshot fabricado sobre o serviço parcial.
3. Protocolo backend de escrita coordenada, revisão esperada, idempotência e recibo durável que possa ser conferido por leitura posterior. Esta implementação não deve criar outro motor de XP nem reaplicar conclusões históricas. Não há nome de endpoint/schema novo aprovado neste relatório.
4. Testes delimitados com contas temporárias: autorização/RLS, conflito de revisão, interrupção/falha parcial, timeout/retry, duas tentativas concorrentes, troca de usuário/perfil e resposta tardia. Evidências remotas separadas dos testes sintéticos existentes.
5. Só após esses contratos/decisões e QA, integrar um chamador explícito de confirmação e transição de isolamento. Não usar login/initialize, remover a chave local ou reaproveitar o sync atual como se confirmassem commit integral.

A solicitação desta rodada não foi interpretada como autorização para alterar o backend reservado a Matheus. Nenhum schema, RPC, função ou persistência paralela foi criado para esconder a dependência. Nenhuma mensagem foi enviada a Matheus por ferramenta; este documento é o repasse disponível para revisão.

### Caminho de progresso sem depender do backend

QA/revisão de navegação e usabilidade das telas já implementadas pode avançar como frente independente com **Sol Médio**, preservando 1B3 pendente. É necessário avisar antes de iniciar, conforme preferência do usuário. Sem acesso funcional ao navegador (bloqueio anteriormente informado), avançar apenas nos testes/revisão locais, sem contornar e sem chamar isso de aceite visual. Com branch/contrato novo, retomar 1B3 em **Sol Alto**. Isso corrige a ordem de dependências: não continuar criando subetapas preparatórias e anunciar como conexão pessoal implementada.

Verificação desta rodada: estático, Git remoto/main e diff-check; SHA-256 de fontes/manifests/migrations preservado. Sem novos testes/lint/build/TypeScript, sem SDK/banco/sessão/secret/dado pessoal/navegador/publicação. Versão 0.1.99 mantida; resultados de 416 testes/build permanecem históricos do lote 1B2.


## 1B3 — backend implementado localmente — 0.1.100, 29/10/2026

### Autorização e escopo

Fábio pediu explicitamente que Astro Boy faça a integração sem depender de Matheus agora e confirmou Sol Alto. Isso autoriza este lote backend de conta, preservando o produto, sem estender a fórmulas, deploy, execução remota/destrutiva ou secrets. A dependência de outro desenvolvedor foi removida; não a dependência de revisão, testes e implantação autorizada. [ADR-004](../04-ADRs/ADR-004-Progresso-Integral-Opt-In.md) registra por que a nova representação não tem dois escritores ativos por usuário.

### Contrato concreto

Migration gerada pela CLI 2.119.0: `20261029182304_progress_account_atomic.sql` (não aplicada no Supabase do projeto). Usa o arquivo integral existente, preservado em text com SHA-256 do arquivo e checksum interno validado no PostgreSQL. Profundidade, chaves duplicadas/inseguras, limite de 20 MB, metadados/versão, formatos dos dois stores e alinhamento de conta são conferidos. JSON é compactado mantendo ordem original de objetos/arrays para verificar o checksum do exportador. Campos de domínio não são recalculados; a auditoria crítica do cliente continua parte do contrato, e o banco não se apresenta como autoridade matemática de recibos passados.

- `progress_account_read(p_expected_user_id)` obtém estado/revisão/cobertura do dono autenticado. Sem estado integral e com domínio legado, retorna complete false/kind legacy, nunca empty. Com estado, retorna o arquivo exato. Sem ambos, vazio explícito. Nome/avatar do perfil público não são sobrescritos por esse RPC.
- `progress_account_commit(p_expected_user_id, p_expected_revision, p_operation_id, p_archive, p_all_profiles_confirmed)` exige usuário correspondente a auth.uid, gate de release, consentimento de todos os perfis, integridade, revisão exata e tentativa UUID. Serializa por usuário; commit e recibo são a mesma transação. Nova tentativa sobre revisão antiga falha. Mesma tentativa/bytes/revisão retorna recibo original; reaproveitar ID com conteúdo diferente falha. Não há exclusão/merge ou crédito de XP.
- `progress_account_receipt(p_expected_user_id,p_operation_id)` consulta a tentativa do mesmo dono, permitindo descobrir commit após perda de resposta. Um recibo não é confirmação de que o estado atual ainda seja aquela revisão.
- Tabelas/recibos/gate ficam em schema privado com RLS e sem grants cliente. RPCs públicas são invoker; três entrypoints privados definer são estritamente owner-bound e têm search_path vazio. Privilégios default PUBLIC/anon são revogados. As rotinas compactar/validar/guard não são APIs de cliente.
- Trigger de write legado usa a mesma coordenação por usuário: usuários sem estado integral mantêm o fluxo existente; usuários opt-in não podem continuar gravando por profile/tabelas parciais antigas. Tabelas/linhas antigas não são apagadas. Manutenção administrativa sem contexto de usuário continua sob autoridade administrativa, fora desse protocolo.
- Gate privado nasce **false**, não é configurável por cliente, URL ou env. É aberto apenas por dono do banco temporário nas fixtures. Não há ativação real nesta entrega.

### Transporte de cliente

`account-transport.ts` não importa sessão/stores/cliente global e não cria client. Factory recebe client explícito, usuário esperado, getter atual e guarda obrigatória de geração/fingerprint/perfil. A ponte `createSupabaseAccountTransport` compila contra o SDK instalado com import somente de tipo; não foi instanciado um SDK real nos testes. `verifyIdentity` usa getUser da dependência, não user_metadata. RPCs incluem destino esperado também no servidor, para recusar troca de sessão entre a validação e a execução.

Preparo congela arquivo/revisão/UUID/consentimento antes de hashing e audita o backup existente. Comando só é aceito pela factory que o preparou, sem retarget/cópia fabricada. Nenhum upload no preparo. Commit não faz retry automático. Consulta de recibo + leitura exata verifica proprietário/tentativa/hash/revisão/bytes; revisão posterior invalida confirmação antiga. Cancelamento/troca após gravação pode deixar operação já confirmada no servidor, portanto nunca é apresentado como rollback: deve consultar recibo deliberadamente. Confirmar armazenamento mantém associationAllowed false e não mexe em marker, auth ou stores.

### Evidência executada

- Onze testes SQL sobre a migration real no PostgreSQL 18.6/PGlite 0.5.13: bytes/cobertura/XP/Fitness, idempotência/reuso/revisão obsoleta, usuário divergente/anon/acesso direto e recibo alheio, corrupção/versão/chaves/consentimento, falha entre state e receipt revertendo ambos, conta legada recusada, writes legados protegidos e contas independentes, catálogo de privilégios/definer, gate fechado, perfis inativos/identidades/contadores/recibos, duas intenções CAS com uma aceitação. PGlite tem conexão serial: o último caso NÃO comprova lock multissessão real.
- Oito testes de transporte ligados ao mesmo SQL via SDK substituto: pipeline prepare/commit/readback, compatibilidade com pré-conferência 1B2, guards antes de escrever, troca de sessão entre getUser/RPC, timeout depois do commit com recuperação de recibo sem novo upload, revisão posterior e CAS, legado/backend ausente, abort/geração/usuário após resposta e recuperação deliberada. Grafo sem SDK/stores/serviços runtime.
- **435 testes globais aprovados**; após corrigir narrowing TypeScript e adicionar ponte de tipos SDK, **19 direcionados repetidos**. TypeScript/lint passaram e build final Vite `envDir:false` em **7,33s**. Diff-check e versões sincronizadas. Logs `/tmp/r25-1b3a-{tests-final,verified,types-final,lint-final,build-final}.log`. Avisos de bundle/Browserslist permanecem.
- Fixture aplica SQL legado real, removendo apenas o comando opcional de extensão pgcrypto porque UUID/SHA são built-ins no banco de teste, e aplica nova migration literalmente. Roles/Auth UID são exclusivamente sintéticos, banco em memória sem porta/conexão externa. Dependência de teste PGlite fixada como devDependency; sem runtime/asset WASM no bundle do app.
- Corrigidos erros de sintaxe/ambiguidade de variável durante desenvolvimento da nova SQL e narrowing de erro never no novo transporte. Não foram defeitos inferidos do backend de Matheus. SHA-256 confirma stores core/Treinos/auth, sync legado, tipos core/Treinos, cliente/main/App preservados. Quatro migrations anteriores intactas. O cache CLI de versão foi restaurado após seu update automático.

Não executados: Supabase/JWT real, PostgREST, banco do projeto, DB Advisors remoto, configuração/exposição/grants remotos, concorrência nativa multissessão, limites de HTTP reais, QA de navegador. Não acessados secrets/.env, sessões ou progresso pessoal. Sem commit/push/deploy; CLI apenas criou arquivo, não aplicou migration. Nenhum crédito, migração pessoal ou gate real aberto.

### Limites e próximo lote

1. **Continuar em Sol Alto:** ligar confirmação/readback e retomada durável à UI, com cliente Auth isolado e bootstrap completo. Esse cliente deve reconhecer estado integral ANTES de executar reset/hidratação/autosync legado e manter IDs de personagem/perfis. Não usar a remoção do marker como ponte para o initialize antigo.
2. Não liberar gate/implantar como solução pronta antes disso. Trigger bloqueia escrita antiga, mas não transforma clientes antigos em leitores integrais; versões anteriores podem ler legado incompleto. Garantir upgrade e caminho correto de startup é critério de release.
3. Conta já com domínio legado fica em revisão; não apagar suas tabelas para aparecer vazia. Conversão exige prévia/preservação específica e não foi implementada automaticamente nesta versão. A primeira adesão é segura apenas para conta sem domínio legado, ou conta já integral via revisão CAS.
4. Implantação/migração remota e aceite hospedado terão autorização própria, backup e verificação de ownership/RLS/concorrência. Nada no teste em memória autoriza remover isolamento em dados pessoais.
5. **Sol Médio somente quando entrarmos no QA mobile/tablet ou ajustes visuais delimitados**, com aviso antes; qualquer defeito crítico de dados retorna a Alto antes da correção. Matheus pode revisar/documentar o protocolo produzido, sem ser dependência para escrever o próximo trecho autorizado.


## 1B4 — confirmação isolada e retomada local — 0.1.101, 29/10/2026

### Fluxo implementado, com release fechado

`main.tsx` monta `AccountWorkspace` por `/?progresso=conta` ou pela barreira de tentativa pendente, antes do grafo App/Auth/stores. Link disponível em Grimório → Guarde sua jornada → Preparar conta pessoal. Sem dados locais válidos, diário de restauração ou tentativa inválida, não avança. Download e seleção da cópia salva conferem os bytes locais atuais; consentimentos são invalidados por mudança de progresso/arquivo. A sessão Auth é transitória, sem persistência/autorefresh/URL-session, construída somente após login/cadastro explícito. Não altera sessão global nem revoga sessão de outro cliente.

O código de envio exige conta validada, cópia conferida, abas fechadas, exclusividade e consentimento de todos os perfis. Aceita somente destino vazio; nenhum merge/replace de progresso existente. `account-intent.ts` valida origem, operação/usuário, arquivo auditado, checksums e baseline. `account-transfer.ts` salva/verifica a tentativa ANTES do commit e mantém o registro até confirmação posterior. Não há token/senha/email no registro; contém cópia do progresso, que continua dado pessoal e não deve ser publicada.

Após timeout/recarga, consultar recibo nunca chama commit. Reenvio tem consentimento separado e a mesma chave/arquivo; é recusado se os dados locais mudaram. Confirmar requer leitura exata do arquivo remoto atual e recibo. O fechamento **continua somente local**, grava/verifica isolamento antes de remover a tentativa e preserva os dois stores byte a byte. Edições posteriores exigem confirmação para permanecerem locais; não se promete que já estejam online. A pausa offline mantém o registro em estado paused, instala o marcador local primeiro e permite App somente isolado. Pausa não cancela uma operação remota incerta.

**Limite importante:** tentativa pausada sem recibo, cujo baseline local mudou, não permite reenviar arquivo antigo nem descartar/mesclar automaticamente. Requer futura resolução explícita preservando as duas versões. A interface não remove proteção para entrar no sync legado. Restauração recusa tentativa de conta (ativa ou pausada); a leitura desse metadado no escritor ocorre dentro da exclusividade. O evento de storage invalida previews/consentimentos; respostas atrasadas, desmontagem e duplo toque não liberam navegação indevida nos cenários testados.

`ACCOUNT_TRANSFER_WRITES_RELEASED=false` bloqueia Auth e ações de transferência no produto. `RESTORE_WRITES_RELEASED=false` preservado; `release_gate.writes_enabled=false` no SQL preservado. A interface pode guardar/conferir uma cópia local, mas não permite conectar/enviar para conta real nesta versão. Abrir só um gate não conclui a integração.

### Verificação executada

- 18 testes novos: oito protocolo/SQL (`account-transfer`), dois sessão transitória (`account-session`), cinco workspace (`account-workspace-ui`) e três de entrada/preview/continuação local.
- Suíte completa: **453 aprovados, zero falhas** (`/tmp/r25-1b4-tests-final.log`). Após o último ajuste de indicação de edições locais: **30 direcionados aprovados** (`/tmp/r25-1b4-reviewed.log`).
- TypeScript e lint aprovados; Vite via API com `envDir:false`, **10,74s** (`/tmp/r25-1b4-types-final.log`, `...-lint-final.log`, `...-build-final.log`). Avisos existentes de bundle/Browserslist permanecem.
- SHA-256 contra `/tmp/r25-1b4-before.json` confirma nove fontes protegidas idênticas: appStore/workoutStore/authStore, supabaseCloudSync, tipos core/Fitness, cliente global, App e bootstrap-app. `main` mudou deliberadamente para roteamento pré-bootstrap. Manifests/whitelist e a migration ainda não aplicada aceitam 0.1.101; sem nova dependência neste lote. Diff-check conferido.
- Protocolo usa SQL real em PGlite temporário com identidade/cliente/locks sintéticos; SDK real instalado exercitado com todos os HTTP interceptados e credenciais sintéticas. UI por harness de hooks/DOM, não navegador. Não é prova de Auth/JWT/PostgREST/RLS hospedado, rede, concorrência multissessão ou fidelidade visual em 360/390/768px.
- Sem leitura/escrita de dados pessoais, sessão real, .env/secrets, Supabase remoto, migração aplicada, deploy, commit/push ou mensagem a Matheus. Bloqueio do navegador não foi contornado.

### Próxima etapa e modelo

**1B5 — Sol Alto:** inicialização online compatível e vínculo durável. Antes de qualquer cloud-first/reset/autosync legado, reconhecer a conta integral e manter um escritor; autenticação, revisão remota, recarga/logout/troca de usuário e conflito precisam de cobertura. Ainda faltam aceite hospedado com contas temporárias, concorrência e QA real da restauração. Não habilitar conta pessoal por apagar marcador ou diário.

**Depois — Sol Médio**, com aviso antes da troca: QA mobile/tablet e refinamento de interface/acessibilidade/movimento. Não são quatro rodadas garantidas nem escopo encerrado. Fragmentos/inventário permanecem frente separada; contratos/durabilidade em Alto e UI em Médio. Revisão/custódia deste lote em sequência pelo Astro Boy; sem agente ativo presumido.


## 1B5 — vínculo durável e envios posteriores — 0.1.102, 29/10/2026

### Contrato entregue

`account-binding.ts` guarda referência ao recibo confirmado, revisão/expectedRevision, hash do arquivo, digest da baseline local, origem e identidade de destino. Checksum/estrutura estritos, sem token/email/senha, conteúdo de atividades ou store paralelo. **Metadado local não é autenticação.** Revisão remota usa getUser/RPC/arquivo auditado e confirmação do recibo original. Outra revisão online, formato legado, identidade diferente, erro ou resposta incompleta não viram conta vazia nem autorização para sobrescrever.

A interface acrescenta consentimento separado e inicialmente desmarcado para guardar vínculo após recibo. Sem esse consentimento, o fechamento inicial continua somente local, sem criar vínculo. Se não houver vínculo e o destino já contiver dados, envio segue recusado; adoção/recebimento de conta existente será fluxo próprio, não inferido pelo nome ou por login. Vínculos existentes têm a revisão atualizada no próximo fechamento confirmado. UI explica que edições posteriores continuam locais até novo envio. Inputs de credenciais também ficam desabilitados no release fechado.

Envios posteriores continuam explícitos no workspace antes de App, exigem cópia salva atual/readback/consentimento de todos os perfis e exclusividade. Conferem recibo+arquivo da revisão vinculada e preparam commit com expectedRevision correspondente. O SQL existente recusa mudança concorrente mesmo se ocorrer depois da conferência. Registro da tentativa precede o commit; getReceipt não repete envio, inclusive nos updates. No fechamento, modo local e vínculo são gravados/verificados antes de limpar a tentativa. Interrupção nesse handoff conserva barreira; confirmação pode ser refeita com mesmo recibo. Tentativa cujo vínculo desapareceu/incompatibilizou não é descartada automaticamente.

`progress-startup.ts` valida vínculo antes de importar App/stores/cliente global. Vínculo inválido/estranho à origem bloqueia; válido torna o documento local isolado mesmo sem o marcador local. Isso preserva a conta e impede que remover só o marcador acione sync parcial; **não carrega arquivo online nem abre sessão autenticada contínua**. AuthStore/cliente global/stores permanecem preservados. Mudança de metadado durante validação recusa início.

`legacy-account-guard.ts`, chamado pelo serviço existente, protege clientes atualizados no futuro rollout: getUser validado e RPC de formato antes de leitura/publicação legada e de novo antes da hidratação local. Snapshot integral é recusado; erro de RPC/Auth ou formato desconhecido falha fechado. Só legacy e empty comprovados mantêm o caminho antigo. A conferência do fingerprint foi posicionada após a nova espera, impedindo substituição de edição local feita durante ela. O gate compartilhado de release **false** mantém esse guard sem RPC no fluxo legado atual. Ao abrir release, ele se torna obrigatório; migration/RPC precisam estar disponíveis antes. Clientes antigos já instalados não recebem essa proteção por mágica. Nenhuma mudança de cálculos ou projeção dos payloads.

### Evidência e limites

- **467 testes globais aprovados**: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs` (`/tmp/r25-1b5-all.log`). Incluem 14 testes novos nesta execução.
- Após a suíte, mais um teste de disputa entre conferência e commit: **27 direcionados aprovados** (`account-transfer`, `account-workspace-ui`, `legacy-account-guard`; `/tmp/r25-1b5-reviewed.log`). Exercita SQL CAS real e preservação de tentativa após rejeição. Não é concorrência simultânea multissessão de Postgres hospedado.
- TypeScript/lint finais aprovados; build Vite via API `envDir:false`, **16,98s**. Logs `...-types-final2.log`, `...-lint-final.log`, `...-build.log`; avisos existentes de bundle/Browserslist permanecem.
- SHA-256 contra `/tmp/r25-1b5-before.json`: appStore/workoutStore/authStore, tipos core/Fitness, cliente global, App e bootstrap-app idênticos. Serviço tem somente as chamadas de guarda novas. Manifests/whitelist e versão aceita na migration ainda não aplicada atualizados para 0.1.102; nenhuma dependência nova. Diff-check e links locais conferidos.
- PGlite executa SQL em memória; cliente Auth/RPC/DOM/locks/eventos substitutos e usuários sintéticos nos testes novos. Nenhuma sessão, .env/secret, usuário pessoal, banco ou API remota do projeto acessados. Sem navegador/QA visual, deploy/migração, commit/push ou comunicação com Matheus. Skill Supabase/changelog público e docs getUser/getSession consultados; aviso TLS de 10/11/2026 lido, sem mudar configuração remota.

### Próximo passo: 1B6 — continuar em Sol Alto

Implementar retomada online/sincronização do arquivo integral com um escritor, identidade e geração estáveis; recebimento em outro dispositivo e substituição local têm prévia/cópias/consentimento próprios. Definir resolução explícita quando o remoto divergir ou uma tentativa sem recibo colidir; não rebasear arquivo antigo, somar XP, excluir versões ou remover pendência automaticamente. Garantir ciclo logout/troca de conta/recarga e feedback de dados ainda não enviados. Nenhum sync contínuo habilitado neste lote.

Antes de release: migração delimitada e testes hospedados de Auth/JWT/PostgREST/permissões/concorrência, plano para clientes legados e aceite real da restauração. Gates continuam fechados e não devem ser abertos isoladamente. Avisar ANTES de Sol Médio no QA mobile/tablet e polimento, depois de fechar os contratos críticos. Fragmentos/inventário continuam frente separada. Revisão/custódia em sequência pelo Astro Boy; reserva encerrada.


## 1B6A — sync durante a sessão e conferência de versões — 0.1.103, 29/10/2026

### Fluxo e integridade

Conta vinculada, cópia atual salva/readback, identidade validada, abas fechadas, consentimento de todos os perfis e autorização adicional de sync são necessários antes de **Sincronizar enquanto uso o app**. Workspace confere recibo/revisão e transfere a posse do cliente transitório ao novo coordenador; unmount do workspace não o descarta prematuramente. A entrada de sessão só vem desse callback em memória, nunca de URL/sessionStorage. Em release fechado, nem Auth nem esse botão/factory podem ativá-la.

`startProgressSession` aceita lease exclusivo para o handoff; falta de Web Locks ou outra aba cooperativa impede a entrada. Mantém exclusividade por toda a vida do documento, inclusive após falha parcial de import. `mount-account-app` exige lease e isolamento, confere remoto antes de bootstrap e recusa montar App se a sessão mudar durante o import. App e SDK/Auth globais são carregados já no modo local isolado: o cliente transitório não é compartilhado com autosync parcial antigo. Não existe store de domínio ou motor de pontuação novo.

`account-live-sync.ts` envia o mesmo arquivo completo, com CAS/recibo do SQL existente. Sequência: verificar vínculo/arquivo remoto → capturar par local consistente/auditar → intent durável → commit → recibo+readback → isolamento/vínculo duráveis → limpar intent. Metadata write tem readback. Outra revisão remota para o fluxo sem rebase automático. Uma única promise serializa flush; intent pendente ou erro bloqueia novos envios automáticos. Resposta perdida consulta-se depois pelo workspace, com a mesma operação. Edições feitas durante o envio não são apagadas: o digest reconhece que continuam locais e o próximo envio usa revisão nova. XP/Prana/recibos históricos são transportados como dados, sem reaplicar comandos de conclusão.

`attach-account-sync.ts` observa os stores existentes com debounce de 900 ms, lendo persistência depois do callback. Conferência também pode ocorrer por ação manual, foco e retorno visível. Não tenta uma publicação incerta de unload: pagehide para/limpa os listeners e preserva intent já gravado. Mudança externa em stores/metadados invalida a sessão; callbacks/timers são removidos no encerramento. Perda/troca de identidade invalida o coordenador, sem await de Auth dentro do callback. O botão de parar encerra o coordenador local e recarrega; não afirma revogar JWT de outros clientes. Cada recarga recomeça localmente, exigindo nova entrada explícita para sync; credenciais continuam fora de storage.

`AccountSyncStatus` usa estado externo estável/aria-live, controles >=48px e aparência escura/dourada existente. Mensagens distinguem conferindo/salvando/salvo, dados mais recentes ainda locais, pendência e parada. A nota anterior de sync desativado não é exibida simultaneamente neste documento. Sem QA visual real: não declarar fidelidade mobile aprovada por JSX/harness.

### Conferência de conflitos, sem substituição automática

`account-conflict.ts` lê local e online sem writes/hidratação, valida identidade e arquivo, reutiliza auditor/comparador existentes e invalida por mudança em dados/metadados/geração durante awaits. Workspace mostra quantidades, XP e diferenças por perfil e solicita download das cópias local, online e tentativa pendente quando existe. Igualdade de quantidade não é igualdade de conteúdo. Não agrega XP, seleciona vencedor ou altera revisão. Essa conferência prepara uma decisão; **resolver por substituição/recebimento em outro dispositivo ainda não foi implementado**.

Tentativa antiga pode já ter sido recebida; apagar intent/rebasear cegamente perde a referência à operação. A futura decisão precisa preservar arquivos e recibos, conferir revisão atual e impedir commit atrasado de vencer depois de uma substituição anunciada. Contas com domínio legado continuam exigindo conversão própria, sem apagar tabelas para simular vazio. Clientes antigos distribuídos continuam fora das novas guardas: rollout antes de release permanece obrigatório.

### Verificação executada

- Suíte completa `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **486 aprovados**, zero falhas (`/tmp/r25-1b6-all.log`). Inclui 18 testes novos comparados aos 468 existentes no início desta rodada; o 468º era o teste CAS direcionado acrescentado depois da suíte anterior de 467.
- Depois da suíte, duas provas adicionais de montagem/identidade tardia foram acrescentadas; `account-sync-lifecycle.test.mjs` passou com **5 testes direcionados** (`/tmp/r25-1b6-lifecycle-final.log`). Não alegar 488 globais executados. O lote direcionado anterior teve 38 aprovados antes dessas duas inclusões.
- Tipos/lint finais aprovados; corrigido prefer-const encontrado no primeiro lint. Build Vite por API `envDir:false`, **29,98s** (`...-types-final.log`, `...-lint-final.log`, `...-build.log`). Avisos de bundle/Browserslist existentes permanecem. Versões/diff-check/links conferidos.
- SQL real em PostgreSQL/PGlite temporário, roles/identidade/clientes/eventos/locks sintéticos. Exercita commit integral, edições durante envio, falha antes/depois das gravações, silêncio de storage, timeout sem retry, recibo, CAS, outra identidade/lease, serialização e comparação read-only. Lifecycle/entrada/React por harness, não navegador ou Auth real.
- SHA-256 contra `/tmp/r25-1b6-before.json`: appStore/workoutStore/authStore, supabaseCloudSync, tipos core/Fitness, cliente global e App idênticos. Main/bootstrap/mounts, guard de lease, sinalização e workspace mudaram para integrar a sessão. Whitelist aceita 0.1.103 na migration ainda não aplicada. Sem nova dependência, segredo ou dado pessoal.
- Supabase skill/changelog público e docs getUser/getSession consultados. Sem navegador/contorno de bloqueio, sessão pessoal, .env/secrets, Supabase remoto, Advisors hospedado, deploy/migração, commit/push ou mensagens externas. Gates de conta/Auth/restauração/servidor continuam **false**.

### Próximo lote e modelo

**1B6B — Sol Alto:** resolução explícita de conflitos/intent incerto e recebimento em outro dispositivo. Preservação/cópias, readback, revisão/consentimento e recuperação devem acompanhar cada escolha; nenhum merge, soma ou descarte silencioso. Só depois concluir aceite hospedado de Auth/PostgREST/concorrência, rollout e QA real da restauração. Não basta abrir o gate para declarar conta pronta.

**Sol Médio**, somente após aviso: QA mobile/tablet (360/390/768px), usabilidade/acessibilidade/acabamento. Fragmentos/inventário continuam frente própria. Custódia/revisão deste lote sequencial pelo Astro Boy; reserva encerrada, sem aceite remoto/visual.


## 1B6B — escolha explícita e recebimento integral — 0.1.104, 29/10/2026

### Escolha e proteção de pedidos atrasados

`reviewAccountVersions` aceita identidade explicitamente validada também sem vínculo prévio; origem nova sem dados tem localArchive/localSummary/comparison null e não pode escolher local inexistente. A revisão é congelada e ligada por WeakMap à baseline/usuário/arquivos/revisão; cópia do objeto não autoriza operação. Mudanças durante awaits invalidam comparação. Não interpreta erro ou conta legada como conta vazia.

`AccountResolutionPanel` exige selecionar os arquivos salvos correspondentes às versões local/online e à tentativa quando existirem, além das confirmações de todos os perfis e substituição. Arquivo diferente, grande demais, leitura atrasada/concorrente ou falta de consentimento não habilita ação. Workspace explicita receber de outra conta/dispositivo antes do login sem cópia local, somente para conferir; escolha continua exigindo readback. Painel de escolha vem após a confirmação de abas; controles de upload/sync antigos não aparecem junto com a comparação. É possível fechar a comparação sem substituir nada.

`resolveAccountVersions` usa lease exclusivo pré-App e congela direção/consentimentos/arquivos. Revalida baseline, identidade e arquivo/revisão remota; prepara nova operação com CAS existente. **Mesmo para receber online, faz commit dos mesmos bytes online sob a revisão conferida**, obtendo revisão/recibo novos: não altera conteúdo nem pontuação do servidor. É a barreira para um pedido anterior sem resposta não vencer depois. Se outro pedido vencer antes, CAS recusa a escolha e conserva journal; não anuncia conclusão nem faz rebase. Receber requer gate de conta liberado no futuro; não existe login que remova barreiras por si só.

`account-resolution.ts` registra journal validado/checksum/origem/identidade, arquivo escolhido, before/target brutos, intent/vínculo/modo anteriores e operação antes de enviar. Não contém credenciais. Só depois de recibo e readback aplica modo local, pares de persistência escolhidos, vínculo e limpeza de intent/journal. **Local** preserva bytes locais exatamente; **online** serializa as duas projeções existentes do arquivo, mantendo valores, IDs, histórico, outros perfis e recibos sem chamar comandos do domínio. Origem do arquivo recebido pode diferir do dispositivo: vínculo pertence à origem atual, conteúdo é autorizado por Auth/recibo/hash, sem alterar a proveniência do arquivo.

### Interrupções, retomada e limites

Startup impede App diante de qualquer journal de resolução, inclusive inválido. Transferência/restauração/sync/preview/listeners também o observam. Journal sobrevive a falha antes/depois das gravações; pares parcialmente aplicados não hidratam App. `resumeAccountResolution` exige confirmação explícita, confere que cada parte ainda é before/target e que metadados continuam reconhecidos. Consulta recibo sem repetir envio; retry tem consentimento separado e usa exatamente a mesma operação/arquivo/revisão. Mudança externa desconhecida não é sobrescrita.

Quando o remoto divergir e os dados/metadados locais ainda forem os originais, **Manter progresso local e reavaliar** pode encerrar a escolha: verifica servidor/arquivo e prova revisão diferente da esperada, garantindo que o pedido antigo não poderá gravar depois. Não publica, apaga dados remotos nem elimina intent anterior. Marca isolamento e retorna ao workspace; intent antigo pode ser comparado ou pausado pelo fluxo já existente. O servidor pode já conter a escolha anterior: UI informa essa possibilidade, não promete rollback remoto. Isso não é cancelamento offline; sem revisão nova comprovada, rede ou com aplicação local iniciada, mantém barreira e pede retomada/revisão. Se duas versões foram alteradas independentemente, nenhuma fusão/soma é inferida.

Journal pode conter dados pessoais, como backups: deve ser preservado no navegador/arquivos do usuário, nunca publicado no repositório. Limite de 150 MB protege envelope com versões completas; falha de quota antes do envio não inicia commit. Suporte a uma conta remota integral não converte conta com domínio legado nem autoriza apagar tabelas. Clientes antigos distribuídos e limites de HTTP/storage reais exigem aceite e rollout próprios.

### Evidência executada

- **504 testes globais aprovados**, zero falhas: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs` (`/tmp/r25-1b6b-all.log`). Base real tinha 488: os dois testes extras do lote anterior já estavam no checkout. São 16 testes novos: 10 protocolo/SQL, 4 painel, 2 integração do workspace.
- Após arranjo final de UI: **42 direcionados aprovados** (`account-resolution`, `account-resolution-ui`, `account-workspace-ui`, `startup`, `workspace-preview`; `/tmp/r25-1b6b-reviewed2.log`). Não foi repetida a suíte inteira sem necessidade.
- TypeScript/lint e Vite `envDir:false` finais passaram; build **11,98s** (`...-types-final2.log`, `...-lint-final2.log`, `...-build-final2.log`). O build global anterior foi 19,79s; o rearranjo intermediário falhou por JSX e foi corrigido. Duas expectativas antigas de metadados/import não usado também corrigidas. Harness de UI passou a exigir ausência de diagnóstico de parse e um único painel de resolução.
- Testes SQL executam banco PGlite temporário com identidade/cliente substitutos. Verificam escolha local/online, outro dispositivo/origem vazio, cópias/consentimentos, pedidos antigos com e sem recibo, CAS concorrente serializado, resposta perdida, retry separado, before/after das gravações, comparação obsoleta, usuário errado, metadado corrompido e reavaliação segura. Não são Auth/JWT/PostgREST hospedado nem disputa simultânea entre conexões Postgres reais. UI/arquivos/locks/eventos são harness; sem aceite visual.
- SHA-256 contra `/tmp/r25-1b6b-before.json` confirma dez fontes preservadas: appStore/workoutStore/authStore, serviço de sync, tipos core/Fitness, cliente global, App, main e bootstrap-app. Sem novo motor/store/fórmula ou dependência; manifests/whitelist e migration ainda não aplicada aceitam 0.1.104. Diff-check/versões/links conferidos.
- Skill Supabase/changelog e docs públicas consultados; nenhuma sessão real, .env/secret, dado pessoal, banco/Advisors remoto, navegador, deploy/migração, commit/push ou comunicação externa. Gates **false**, avisos existentes de bundle/Browserslist mantidos.

### Próxima frente e modelo

**Frontend mobile/tablet — Sol Médio**, com aviso feito antes da troca. Revisar os fluxos e estados reais da interface, toque/teclado, 360/390/768px e preservação de navegação. Bloqueio de navegador não será contornado; código/testes não viram aceite visual. Se surgir contrato/auth crítico, voltar a Alto após informar o usuário.

Conta/restauração não estão liberadas para uso real: faltam aceite hospedado com contas temporárias, permissões/Auth/PostgREST/concorrência, limites, plano de rollout de clientes antigos e migração/release com escopo próprio. Não abrir gates porque testes locais passaram. Papéis de Fábio/frontend e Matheus/backend/revisão preservados; ele não precisa implementar este código para permitir QA frontend. Revisão/custódia deste lote em sequência pelo Astro Boy; reserva encerrada.
