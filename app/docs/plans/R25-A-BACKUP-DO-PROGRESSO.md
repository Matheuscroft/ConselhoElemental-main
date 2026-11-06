# R25-A — preservação do progresso

Estado atual: **0.1.98 / R25-1A — código implementado, aceite de navegador pendente**. Confirmação, recuperação e continuação local integradas antes de App/auth; metadado durável impede construção do cliente no documento local. **Trava estática de gravação da UI permanece fechada** até QA real isolado. Registros abaixo preservam a evidência de cada rodada; fila única em `../FILA-ENTREGAS.md`.

## A1 implementado localmente — 0.1.85, 27/10/2026

Escopo: exportar uma cópia conjunta e conferir um arquivo sem restaurá-lo. Integração em Grimório → Cópia de segurança. Esta entrega é parcial em relação ao backup/restauração e à associação futura de conta. Não comprova que o usuário baixou uma cópia pessoal.

### Arquitetura e cobertura

`src/lib/backup/capture-progress.ts` usa `persist.getOptions().partialize` dos stores existentes, sem enumerar localStorage nem incluir authStore. A captura preserva o estado ativo e os mapas de contas existentes. Nenhum segundo store, cálculo ou motor de persistência foi criado.

Formato `conselho-elemental-progress`, schemaVersion 1, versão do app, timestamp, origem, conta ativa e envelopes dos stores `conselho-elemental-storage` e `dominio-do-mago-workout-storage-v1` (versão 0). Inclui personagem, atividades, contadores, conclusões, jornadas, obras, rascunhos, áreas e projeções nativas/legadas de Treinos; todos os perfis locais contidos nessas projeções. A serialização ocorre antes do primeiro await para congelar o snapshot.

SHA-256 verifica integridade do conteúdo serializado. Campos raiz estritos, chaves/versões de store e alinhamento de conta são conferidos. Arquivos acima de 20 MB, formatos futuros, JSON truncado, chaves inseguras, profundidade excessiva ou números não finitos falham sem gravação. Isso não autentica o arquivo nem valida todas as regras aninhadas do domínio.

Não inclui senhas/sessões, formulários não salvos, cronômetro transitório de ritual, preferências externas de calendário/localização ou mídia externa. O JSON contém dados pessoais e deve ser guardado em local privado. A interface distingue download solicitado de arquivo efetivamente salvo.

### UX e operações

- Baixar cópia: captura, serializa, confere e solicita download. Nenhum envio remoto.
- Conferir arquivo salvo: limite antes de ler, estrutura/checksum e resumo. Nenhuma substituição de dados.
- Proteções contra clique duplo, resultado após cancelamento/desmontagem/troca de conta e operação antiga interferindo em nova tentativa.
- Resumo distingue atividades principais da conta ativa de sessões nativas/legadas somadas em todas as contas; subitens permanecem no arquivo.
- Estilo elemental, controles mínimos de 44px e botões empilhados no mobile. Aceite visual/toque ainda não executado.

### Evidências executadas

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **258 passaram**, zero falhas; nove testes novos em `tests/backup`.
- `tsc -b`, `npm run lint`, build Vite com `envDir:false` (20,84s) e `git diff --check`: passaram. Avisos conhecidos de bundle/Browserslist permanecem.
- Stores reais empacotados por esbuild, storage somente em memória e dados sintéticos: exportação, congelamento, múltiplas contas, exclusão de sessão/timer, adulteração/limites e roundtrip em instância isolada.
- Roundtrip preservou IDs/atividades testados, campos de XP e projeção de Treinos. A hidratação atual recalcula campos derivados do personagem; o teste não afirma igualdade integral de todo o domínio nem segurança da restauração em produção.
- Testes do componente com dublês verificaram cancelamento, conta, desmontagem, arquivo, download e limpeza de URL; não equivalem a navegador.
- Logs locais: `/tmp/conselho-r25a1-{tests,types,lint,build}.log`. SHA-256 comparado ao snapshot `/tmp/conselho-r25a1-core-before.json`: appStore, workoutStore, authStore, supabaseCloudSync e types/index preservados neste lote.

Sem leitura/gravação de progresso pessoal, navegador, chamada remota, commit, push ou deploy. XP retroativo pessoal continua sem aplicação observada.

## Achados para A2 — não corrigidos neste lote

1. **Criação de conta local:** `createAccount` não captura as edições atuais da conta de saída como `switchAccount` faz. Reproduzido em memória com os comandos reais: criar A, adicionar rascunho, criar B, voltar a A → rascunhos passam de 1 para 0. A exportação mantém o estado atual disponível; não recupera conteúdo já perdido. Prioridade antes de orientar migração/criação de conta para preservar progresso.
2. **Inicialização de Treinos:** o callback síncrono de reidratação acessa `useWorkoutStore` antes de concluir a inicialização; o flag de hidratação permanece falso embora os mapas sejam carregados e a sincronização local posterior preencha a projeção. Diagnóstico isolado: core true, fitness false. A captura exige readiness do core e usa mapas vivos de Treinos com alinhamento de conta, sem forçar reidratação. Não comprova durabilidade de dados ausentes nem autoriza restauração.

Reprodução registrada em `/tmp/conselho-r25a1-account-diagnostic.log`; achados também na auditoria de contratos. Nenhum dado do usuário foi usado. Tratar esses pontos como correções delimitadas de preservação, registrando impacto com Matheus, sem mudar economia.

## Próximos critérios

A2: corrigir captura da conta de saída e inicialização de Treinos com regressões; projetar aplicação coordenada dos dois stores com prévia/diff, confirmação, cópia anterior verificada, rollback e testes de quota/interrupção/conta obsoleta. Não permitir replay de XP nem sincronização automática durante restauração. Só habilitar após demonstrar integridade.

R25-B: associação à conta online e cobertura da sincronização são lote separado. Não assumir que o serviço atual cobre todo o backup. Fábio mantém frontend/mobile; Matheus contratos/backend. QA mobile/renderizado continua em R28-F; fragmentos e encerramento global permanecem pendentes.

## R25-A2a — correções de preservação, 0.1.86

27/10/2026. Lote delimitado decorrente do pedido de continuar após o diagnóstico A1. Corrige os dois defeitos acima; o texto A1 permanece como evidência histórica. Não implementa restauração nem altera persistência remota/economia.

### Mudanças

- `createAccount` captura a conta de saída antes de montar a nova, usando `captureAccountData` existente. Vale tanto para conta vazia quanto para importação explícita do estado atual. A cópia mantém os IDs das atividades e snapshots de recompensa existentes.
- `captureAccountData` mantém o ID do personagem ao salvar a própria conta; somente importação para novo perfil gera outro ID. A função anterior gerava ID a cada alternância. Nenhuma migração ou reconciliação retroativa.
- `workoutStore.onRehydrateStorage` usa o argumento fornecido pelo Zustand, sem referenciar a constante ainda em inicialização. Falha de carregamento fornece estado ausente e não executa esse callback de projeção.
- `captureProgress` volta a exigir `hasHydrated()` de ambos os stores; leitura pendente/falha impede exportação, em vez de produzir uma cópia apresentada como completa.
- Fixtures em memória compartilhadas em `tests/backup/load-progress.mjs`; nenhum acesso ao armazenamento pessoal.

### Testes realmente executados

`tests/backup/account-preservation.test.mjs`: seis casos, quatro falhas reproduzidas antes do patch (duas criações de perfil, readiness e guarda do backup). Após correção, seis passaram. Cobrem criação com/sem importar, edição separada, alternância, recarga, identidade do personagem, XP/atividades/contadores, primeira importação, nome inválido, isolamento de planos de Treinos, histórico nativo, callback de hidratação, leitura pendente e erro de leitura. A importação de perfil continua com a semântica existente do core; não foi acrescentada clonagem automática dos dados de Treinos entre perfis.

Suíte completa: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`, **264 passaram**, zero falhas. `tsc -b`, `npm run lint`, build Vite `envDir:false` em **16,03s**, `git diff --check`: passaram. Avisos conhecidos de bundle/Browserslist permanecem. Logs locais `/tmp/conselho-r25a2-{before-tests,tests,types,lint,build}.log`.

Revisão comparada ao snapshot de início de lote confirma mudanças delimitadas em appStore/workoutStore e guarda de exportação. SHA-256 confirma authStore, supabaseCloudSync e tipos intactos nesta rodada. Alterações preexistentes preservadas. Fórmulas e comandos de recompensa não foram alterados.

### Limites e continuidade

Não há teste de navegador/mobile, conta online, aplicação de restauração, falta de espaço real ou dado pessoal. Não afirmar recuperação do que já foi perdido nem transferência online concluída. Uma conta nova vazia continua vazia; importar é escolha explícita existente. A2b ainda deve coordenar restauração dos dois stores, incluindo falhas de escrita, quota, sincronização e rollback. Não há botão de restaurar disponível.

## R25-A2b1 — prévia de restauração, 0.1.87

27/10/2026. O lote avança a revisão anterior à aplicação. **Restauração continua desabilitada.** A divisão em A2b1/A2b2 decorre de dependências encontradas no código, não de teste de gravação aprovado.

### Entrega e operação

Grimório → Cópia de segurança → Conferir arquivo salvo → Comparar com meu progresso. Somente um arquivo selecionado/conferido oferece comparação; exportar não abre automaticamente uma restauração. O componente não possui comando de aplicação.

`restore-comparison.ts` confere o checksum/formato do arquivo e valida o snapshot local, congelado antes dos awaits. Agrupa por IDs de perfil, usando a projeção ativa do core em preferência ao cache antigo. Inclui perfis sem cadastro encontrados nos mapas de Treinos; origem diferente não é tratada como prova de mesma conta online.

Compara rituais/ciclos principais (incluindo conteúdo aninhado), jornadas/obras, rascunhos, actions, execuções, sequências/vínculos, compromissos, áreas e planos/históricos nativos/legados. Mesma quantidade com IDs diferentes aparece como entrada/saída; mesmo ID com conteúdo diferente aparece alterado. Demais campos, inclusive personagem, catálogos, medidas e sessões ativas, são comparados em um bloco por perfil, sem convertê-lo em contagem de atividades. Registro do perfil também participa. Ordenação de chaves de objetos não cria alteração falsa; ordem dos arrays permanece significativa dentro dos registros. A ordem global dos perfis/listas não é uma contagem de alteração de entidade.

XP por elemento é mostrado como valor registrado antes/depois, sem calcular recompensa, nível ou realizar soma. Ausência não é zero. Versão, origem e perfil ativo diferentes geram avisos. Isso ainda não certifica compatibilidade para aplicação nem valida todas as regras de domínio.

A interface mantém a identidade elemental existente, controles de 44px e detalhes recolhíveis por perfil para evitar uma lista extensa no celular. `RestoreComparison` invalida resultados pendentes/exibidos em atualização de qualquer store, cancelamento ou desmontagem; comparação final também reconfere fingerprint. Essa invalidação é conservadora e pode pedir nova comparação por mudança transitória. Nenhuma inscrição grava dados. Não houve QA renderizado ou medição de performance em celular.

### Evidências

- Seis testes de comparação com stores reais em memória: mesma contagem/IDs diferentes, conteúdo alterado, conta ativa versus cache, outros perfis, mapas órfãos, valores de XP, metadados, congelamento assíncrono, chaves reordenadas, IDs ausentes/duplicados e arquivo adulterado.
- Três testes de interface com dublês: visualização dos dados/avisos, clique duplo, cancelamento, conta/estado alterados, desmontagem, resultado antigo, falha e nova tentativa. Teste existente do painel também confirma seleção de arquivo e descarte de comparação ao falhar nova leitura.
- Suíte completa: **273 testes passaram**. Ajuste de cleanup indicado por lint foi seguido de **24 testes de backup** aprovados, TypeScript, lint limpo e build `envDir:false` final em **14,01s**. Diff-check e versões conferidos. Avisos de bundle/Browserslist permanecem.
- Logs `/tmp/conselho-r25a2b-{tests,backup-final,types,lint,build}.log`. Snapshot de início `/tmp/conselho-r25a2b-before.json`: appStore, workoutStore, authStore, supabaseCloudSync e types/index mantidos por SHA-256.

Sem navegador, perfil pessoal, restauração real, rede do app, secrets, commit/push/deploy. Uma prévia aprovada não é backup de segurança da situação anterior nem autorização futura automática de sobrescrita.

## R25-A2b2 — aplicação ainda pendente: critérios técnicos

### Evidência da dependência

`authStore.startCloudAutoSync` assina mudanças do core, agenda envio, reage a foco/visibilidade e pode estar em chamada de rede. Trocar dois stores por setState/rehydrate pode expor estado intermediário ao sync. `main.tsx` importa App estaticamente; stores hidratam antes de uma recuperação que fosse executada apenas no corpo do entrypoint. A restauração deve resolver esses pontos, sem substituir o serviço de Matheus ou presumir que logout cancela chamadas já iniciadas.

### Ordem proposta de implementação

1. Diário temporário versionado da operação, com envelopes anterior/destino, integridade e estados explícitos; não é novo armazenamento de domínio. Uma cópia anterior para download precisa de verificação e confirmação de salvamento pelo usuário.
2. Recuperação antes da importação/hidratação dos stores (bootstrap isolado). Operação interrompida não pode carregar silenciosamente um core novo com Treinos antigos. Diário inválido ou rollback impossível deve bloquear inicialização com caminho de recuperação, sem apagar evidência.
3. Coordenação de escrita sob guarda de origem/conta/fingerprint e concorrência entre abas. Verificar as duas gravações e preservar o diário até confirmar coerência. Tratar quota, leitura negada, falha na segunda escrita, falha de rollback e interrupção em cada fronteira.
4. Política de sync explícita: fase local deve recusar aplicação se contexto de autenticação/sync não estiver comprovadamente isolado. Associação à conta online é R25-B; não enviar automaticamente snapshot importado ao remoto.
5. Validação aninhada suficiente para o domínio, compatibilidade por versão e roundtrip real dos stores sem comandos de conclusão/XP. A conferência estrutural atual não basta para habilitar aplicação.
6. Só então habilitar confirmação com escopo completo de substituição (inclusive outros perfis), prévia atual, descarte de operações obsoletas e teste de recuperação. QA no navegador e teste de reload/armazenamento permanecem critérios separados.

Este plano não declara diário, rollback, integração de sync ou botão de restauração implementados. Prioridade permanece preservar dados existentes antes de avançar à conta pessoal.

## R25-A2b2a — protocolo isolado de recuperação, 0.1.88

28/10/2026. Primeiro recorte dos critérios A2b2 acima; a afirmação de ausência de diário na seção anterior descreve o estado 0.1.87. O novo módulo `src/lib/backup/restore-journal.ts` não é importado pelo app, bootstrap, stores ou interface. Sua execução nesta rodada ocorreu exclusivamente nos testes com storage injetado em memória. Não existe restauração disponível ao usuário nem diário criado no navegador pessoal.

### Contrato implementado

- `prepareRestoreJournal` congela os valores anteriores antes dos awaits, valida o arquivo destino com o leitor existente e prepara um diário com formato/versão/origem, pares anterior/destino e fase. Preserva bytes originais e ausência de chave; rollback não inventa defaults. SHA-256 verifica corrupção, não autenticidade nem compatibilidade integral do domínio.
- `executePreparedRestore` rejeita diário pendente ou estado anterior alterado. Grava/verifica o diário, core e fitness; só depois de conferir ambos grava o marcador `committed` e limpa o diário. Falha não dispara retry automático nem comando de recompensa.
- `recoverRestoreJournal` reverte `prepared` para os valores anteriores ou apenas limpa `committed` se o destino continua íntegro. Falha durante rollback conserva o diário para nova tentativa. JSON/checksum/schema/origem incompatíveis, leitura negada e mudanças externas detectáveis interrompem a operação. Antes de reverter, confere as duas partes para evitar sobrescrever uma edição externa já detectável.
- Apenas as duas chaves já existentes e a chave temporária `conselho-elemental-restore-journal-v1` são endereçadas. Não há enumeração de storage, auth, rede, novo store de domínio ou cálculo de XP.
- Limites de tamanho: 20 MB por envelope bruto e 100 MB para diário escapado. A alocação de espaço real e durabilidade física ainda não foram testadas. Verificar leitura após escrita detecta falhas silenciosas simuladas, não garante fsync do dispositivo.

### Pré-condições ainda NÃO implementadas

O chamador deve garantir acesso exclusivo entre todos os escritores, abas, hidratação e sync. As comparações do módulo **não são lock** e não resolvem a corrida entre verificar e gravar. Não ligar o módulo à UI/entrypoint enquanto faltarem protocolo de exclusão, suspensão comprovada de sync/in-flight, validação aninhada/versionamento, confirmação/cópia anterior e bootstrap de recuperação antes de importar stores. Caso integração futura encontre recuperação inválida ou impossível, deve impedir hidratação e preservar evidência. Nada disso é ativado nesta versão.

### Evidências desta rodada

`node --test tests/backup/restore-journal.test.mjs`: **12 passaram**. Matriz inclui interrupção antes/depois das cinco escritas do caminho de aplicação e das três de rollback; quota simulada; retry de rollback; marcador confirmado versus não confirmado; chaves ausentes/bytes originais; estado obsoleto, origem errada e diário existente; alterações externas; JSON/checksum/schema adulterados; leitura negada; escrita ignorada; congelamento assíncrono e substituição de diário durante validação. Recarga de stores reais em memória preservou IDs/rascunhos, sessão sintética e XP=17 sem nova concessão. Não equivale a cobertura de todas as formas válidas do domínio.

Primeira execução falhou na montagem da fixture, que pressupunha mapa nativo local inicializado; corrigida a fixture explícita antes da execução válida. TypeScript apontou narrowing de campo unknown, corrigido antes das verificações finais. Não foram defeitos observados no app do usuário.

`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **285 passaram**, zero falhas. `npx tsc -b` e `npm run lint`: passaram. Logs `/tmp/conselho-r25-journal-{tests,suite,types,lint,build}.log`; snapshot SHA-256 de início `/tmp/conselho-r25-journal-before.json`. Build/diff/integridade final registrados abaixo após execução. Sem navegador/QA mobile, gravação pessoal, sync remoto, secrets, commit/push/deploy.

### Próximo recorte

A2b2b: completar validação de destino e compatibilidade, projetar/integrar bootstrap e exclusão de escritores, demonstrando que nenhum store hidrata um par intermediário e nenhum sync envia a importação. Depois, confirmação e aplicação na interface com cópia anterior verificada. R25-B conta online permanece separado. Este recorte não conclui o escopo de backup/restauração.

### Fechamento verificado

Build Vite via API com `envDir:false` passou em **6,96s**; avisos de tamanho de bundle/Browserslist permanecem. `git diff --check` passou. Versões package/lock sincronizadas em 0.1.88. SHA-256 confirmou seis arquivos preservados: appStore, workoutStore, authStore, supabaseCloudSync, types/index e main.tsx. Busca em `src` confirmou que nenhum módulo de produção importa restore-journal. Revisão sequencial de código/documentação concluída pelo Astro Boy; reserva encerrada. Sem publicação.

## R25-A2b2b — proteção de inicialização, 0.1.89

28/10/2026. `main.tsx` passou a importar `bootstrap-app.tsx` dinamicamente, somente após a checagem de `progress-startup.ts`. O bootstrap conserva os providers, AuroraBackground e estilos anteriores. Nenhuma fórmula ou store foi alterado.

### Comportamento integrado

- Antes de importar App/stores/auth, lê somente a chave temporária de restauração. Ausência permite uso normal; qualquer valor (inclusive vazio ou corrompido) bloqueia carregamento. Não interpreta, apaga ou recupera automaticamente o diário nesta fase.
- Leitura negada bloqueia inicialização em vez de hidratar defaults como se não houvesse progresso. A tela explica o estado e oferece apenas recarregar; não limpa dados nem expõe erro bruto/conteúdo privado.
- Onde Web Locks está disponível, mantém lease compartilhada `conselho-elemental-progress-session-v1` durante a vida do documento. Abas normais compatíveis podem coexistir. Uma operação exclusiva cooperativa impede nova inicialização e precisa aguardar o encerramento das abas vivas. A lease também cobre o import assíncrono e permanece retida se import/mount falhar, pois módulos podem já ter sido inicializados parcialmente. Reload é a nova tentativa.
- Navegador sem Web Locks conserva uso normal com a checagem de diário; aplicação de backup continua indisponível. Erro na API presente não desvia silenciosamente para execução sem coordenação.
- Tela pré-React usa DOM nativo e CSS isolado: fundo existente #050508, dourado #d5b66f, texto #eceae3/#adb8c8, Cinzel/Inter, largura máxima 36rem, CTA mínimo 48px, foco visível e sem movimento automático. A estética segue o tema aprovado; não é uma nova tela de onboarding. Estados têm status/alert e foco no título da falha, sem rolagem forçada.

### Limites importantes

As leases só coordenam documentos atualizados que usam o mesmo protocolo. Não cobrem abas antigas, extensões ou escritores alheios. Não suspendem o autosync de uma aba já carregada. Portanto uma futura aplicação exclusiva precisa ocorrer ANTES de importar App/auth e após resolver presença de documentos antigos; não liberar a lease de uma aba viva para importar um backup. Nenhuma alteração foi feita no serviço remoto do Matheus.

A recuperação automática continua bloqueada até validar aninhamento/compatibilidade dos dois snapshots, isolamento de todas as abas/sync e fluxo de confirmação com cópia anterior. O diário não é criado pelo app atual; a tela de pendência é preventiva para uma operação futura. Não instruir usuário a remover manualmente a chave. A2b2 não está concluído.

### Verificação

Nove testes novos com dublês de locks/storage/DOM: ordem de leitura/import, retenção durante carregamento e falha, duas sessões compartilhadas, recusa com exclusividade, diário vazio/corrupto/futuro, leitura negada, API falha/ausente, tentativa em novo documento e tela acessível/reload. Teste do grafo estático confirma que main não importa stores/services antes da checagem. Locks simulados não equivalem a teste real de abas/BFCache/fechamento abrupto/mobile.

Logs: `/tmp/conselho-r25-startup-{suite,types,lint,build}.log`; preservação SHA-256 registrada contra `/tmp/conselho-r25-startup-before.json`. Sem inspeção de browser, dado pessoal, restore, conexão remota, commit/push/deploy. Abertura solicitada pela ferramenta do Codex retornou `queued`, sem confirmação visual de carregamento.

Próximo recorte: validar destino/compatibilidade para recuperação; desenhar execução exclusiva anterior ao bootstrap com tratamento de abas antigas e garantir ausência de auth/sync. Só depois habilitar restauração confirmada. R25-B associação online permanece separado.

Fechamento: **294 testes aprovados**, TypeScript/lint limpos, build `envDir:false` em **17,18s**. Diff-check passou. SHA-256 confirma cinco arquivos de stores/auth/sync/tipos preservados; versões sincronizadas em 0.1.89. Reserva encerrada, revisão sequencial de código/documentação pelo Astro Boy. Avisos de bundle/Browserslist permanecem.

## R25-A2b2c — conferência de dados críticos, 0.1.90

28/10/2026. Auditoria somente leitura em `critical-progress.ts`, chamada pela comparação de arquivos e pelo preparo do diário. Não habilita restauração nem certifica o domínio completo.

### Entrega

- Confere personagem/XP, IDs e listas, datas registradas, elementos, recibos de recompensa, contadores quantitativos, dias de recorrência, registros de conclusão e descendentes em atividades/jornadas/obras. Percorre raiz ativa E caches dos demais perfis, sem assumir que o cache ativo é mais atual. Ausência histórica de recibo XP continua válida; recibo parcialmente preenchido é apontado.
- Em Treinos, este recorte confere somente formato/identidade das coleções de contas nativas e legadas. Campos de séries/sessões, relações de domínio e referências cruzadas completas ainda precisam de validação. Não recalcula XP, totais, progressão, agenda ou medidas.
- Versões de arquivo explicitamente revisadas neste preflight: 0.1.85–0.1.90, mantendo envelope schema 1/store version 0. Outras versões pedem revisão; isso não é migração automática nem promessa de que todas essas cópias podem ser aplicadas.
- Máximo de 30 achados detalhados com flag de truncamento; texto da UI deduplica as mensagens e não exibe caminhos internos/IDs/valores dos registros. Não remove campos desconhecidos nem preenche defaults. O checksum ainda é responsabilidade do leitor de arquivo anterior à auditoria.
- No Grimório, a prévia mostra “Esta cópia precisa de revisão” quando encontra problemas. Sem achados, diz explicitamente que os campos conferidos passaram e a restauração continua indisponível. Não há botão de aplicação.
- `prepareRestoreJournal` recusa preparar destino com problemas críticos, mesmo com checksum válido. Execução/recuperação de diário permanece isolada, sem aplicação automática; validação completa do conteúdo de diário e compatibilidade são requisitos futuros antes de ativar recuperação.

### Verificações e limitações

Oito testes novos: seis de auditoria com stores reais em memória, um da apresentação e um da recusa de preparo. Cobrem múltiplos perfis, dados válidos produzidos por comandos reais, recibos históricos sem XP, corruptela em perfil inativo/descendentes, IDs duplicados, listas inválidas, dias impossíveis, recibos/quantidades incompletos, versões desconhecidas, limite de achados e ausência de mutação. Não há uso de progresso pessoal.

Os testes de infraestrutura foram ajustados para reconhecer importações TypeScript somente de tipo e resolução de index.ts; o compilador do teste de UI agora usa ES2022 como o app para suportar iteração de Set. Duas falhas iniciais estavam nesses dublês/resolvers, não em dados do usuário. Logs `/tmp/conselho-r25-critical-{backup,suite,types,lint,build}.log`; SHA de início `/tmp/conselho-r25-critical-before.json`.

### Servidor e navegador

Diagnóstico local encontrou porta 5173 sem listener. Servidor Vite iniciado no MESMO `http://127.0.0.1:5173`, com `envDir:false` (sem carregar .env), strictPort e host restrito a loopback; sem alterar configurações de backend. Usuário confirmou “O Santuário abriu” após recarregar. Isso confirma a abertura segundo o usuário, não teste visual do agente. Tentativa direta via navegador interno foi recusada por política salva/administrada; nenhuma alternativa de contorno usada. Processo ativo conferido por lsof; não há garantia de reinício automático ao fechar a sessão do executor.

### Próximo

Completar validação das estruturas de Treinos, compatibilidade e vínculos dos snapshots/diário. Depois, fluxo exclusivo anterior ao bootstrap, sem abas antigas nem auth/sync inicializados, com cópia anterior e confirmação explícita. Restauração, associação online R25-B e QA mobile pelo agente ainda não concluídos. Sem commit/push/deploy, mudança de fórmulas, secrets ou gravação pessoal.

Fechamento: 53 testes de backup passaram; suíte completa **302 aprovados**. TypeScript e lint sem avisos; build `envDir:false` em **15,67s**, diff-check limpo. Sete arquivos stores/auth/sync/tipos/main/bootstrap preservados por SHA-256; versões sincronizadas em 0.1.90. Avisos de bundle/Browserslist permanecem. Reserva encerrada após revisão sequencial pelo Astro Boy.

## R25-A2b2d — validação aninhada de Treinos, 0.1.91

28/10/2026. `fitness-audit.ts` integra a auditoria crítica já usada pela comparação e preparo de diário. Sem alterações nos stores/tipos, fórmulas, autenticação ou sincronização. A auditoria não escreve no arquivo nem no progresso.

### Cobertura acrescentada

- Planos nativos/legados: datas, nome, duração estimada, esforço, instâncias, ordem e séries. Identificadores nativos seguem UUID v4; identificadores legados continuam aceitos como strings.
- Séries nativas: modo reps/duration sem mistura de campos, repetições inteiras, número da série, métricas não negativas, flags booleanas, conflito feita/pulada, fator registrado e RPE opcional. Séries legadas preservam seu próprio formato e não exigem measureMode nativo.
- Sessões: estado, datas, duração, totais registrados, resultados e referências com formato válido. Registros históricos mantêm snapshots mesmo se o template não existir mais; não exigir presença do plano é intencional para preservar histórico.
- Sessão nativa ativa, mapas de check-in e perfis inativos também são percorridos. Recibos core verificam campos críticos e correspondência de coreExecutionLogId quando ambos existem. EarnedXp/coreReceipt ausentes em registros antigos não são inventados nem creditados novamente.
- Sequências: IDs, datas, nome e lista de planos sem repetição. Legado: ledger, versão do recibo, valores registrados e medidas corporais com data/números válidos. Não calcula volume/ER, XP, calorias ou indicadores de saúde.
- Erros usam o limite de achados e a apresentação já existentes. A coleção de catálogo permanece com verificação rasa; referências cruzadas completas, ratings/strengthRecords e todos os campos opcionais ainda não compõem uma certificação integral do domínio.

### Evidências

Seis testes novos em `tests/backup/fitness-audit.test.mjs`: dados produzidos pelos comandos reais saveTemplate/startSession/logSet/finishSession/createWorkout/startWorkout/finishWorkout/addBodyMeasurement com storage somente em memória; aceitação sem mutação, regras diferentes para legado/nativo, corrupções de séries/recibos/datas, histórico sem template, sessões ativas/check-ins/perfis inativos, ausência histórica de snapshot opcional, IDs repetidos e listas malformadas.

Fixture de recuperação recebeu sessão sintética completa com UUID v4, datas e campos exigidos; o teste não foi enfraquecido para permitir sessões truncadas. Logs `/tmp/conselho-r25-fitness-{tests,suite,types,lint,build}.log`; snapshot SHA-256 `/tmp/conselho-r25-fitness-before.json`. Verificação final registrada abaixo após os comandos.

Sem navegador, perfil pessoal, restauração, chamada remota, secrets, commit/push/deploy. Restauração permanece desabilitada. Nenhuma política nova de recompensa foi implementada.

### Próximo passo delimitado

Fechar verificação de vínculos/compatibilidade e validação dos dois lados do diário; executar restauração exclusivamente antes de importar stores/auth, com isolamento entre abas e cópia anterior/consentimento. Depois habilitar interface e executar os testes reais de interrupção/reload/mobile. A conta online é R25-B, separada.

### Visão resumida do restante do escopo

Quatro frentes de entrega, não quatro rodadas nem estimativa de prazo: (1) concluir restauração e associação segura de conta; (2) validar navegação/ações no celular e tablet; (3) fechar consistência visual, acessibilidade e animações funcionais; (4) implementar fragmentos/inventário e contratos de persistência correspondentes. Não atribuir percentual enquanto validações e contratos continuam pendentes. Fábio mantém frontend/mobile; Matheus backend/contratos. A fila operacional é FILA-ENTREGAS.md.

Fechamento: **308 testes aprovados**, TypeScript e lint limpos, build `envDir:false` em **18,25s**. Diff-check passou; versões sincronizadas em 0.1.91. Seis arquivos de stores/auth/sync/tipos de Treinos/main preservados por SHA-256. Avisos de bundle/Browserslist permanecem. Reserva encerrada, revisão sequencial pelo Astro Boy.

## R25-A2b3 — vínculos, revalidação e exclusividade, 0.1.92

28/10/2026. Lote realizado após o usuário confirmar Sol Alto. Módulos de auditoria/coordenação preservam stores, auth, serviço cloud, tipos e fórmulas.

### Lacunas fechadas

1. `restore-journal.inspect` conferia apenas checksum/schema do diário e pares de strings, sem revalidar o JSON contido nos envelopes antes de escrever ou reverter. Agora ambos os lados passam por `validateStoredProgress`: envelopes exatos state/version, store version 0, formato completo, segurança de chaves/profundidade, contas alinhadas, auditorias críticas e vínculos. Um checksum recalculado não autoriza escrever dados incompatíveis. Validado tanto em execução quanto em recuperação, antes da primeira gravação.
2. Baseline parcial (somente um store ausente) ou inválido recusa preparo/recuperação. Ambos ausentes representam origem vazia e continuam aceitos. Dados válidos preservam whitespace/bytes exatos no rollback. Esta mudança substitui o teste antigo que permitia baseline arbitrário inválido; não se afirma que tal baseline permitiria inicialização íntegra. Não existe diário pessoal criado pelo app neste estágio.
3. `progress-links.ts` confere perfil ativo, referências de parent/children, divergência de parent entre projeções, ciclos de parent, conclusão vinculada a outro hábito e memberships de sequência sem destino/repetidas/posição inválida. Percorre contas em cache também. Não exige que planos deletados do histórico de Treinos ainda existam. Caminho de parent é iterativo com marcação de visitados; fixture de 10 mil nós exercita cadeia longa/ciclo sem recursão nesse caminho.
4. A hidratação atual converte experience legado para xp_earth quando os quatro saldos estão zerados. Reproduzido em memória (experience 9 → xp_earth 9). Esse estado agora pede revisão de compatibilidade antes de restaurar; a regra existente do core foi preservada, sem recalcular cópias nem migrar usuário.

### Coordenação exclusiva isolada

`exclusive-restore.ts` exige Web Locks exclusivo com ifAvailable, origem, confirmação booleana explícita de fechamento das outras abas e documento que ainda não iniciou import do app. `progress-startup` registra permanentemente para aquele documento quando o import começa, inclusive se falhar parcialmente. A coordenação recusa restauração nessa mesma página; é necessário outro carregamento anterior ao bootstrap.

Na aplicação, exige confirmação de substituição e arquivo de cópia anterior válido que corresponda ao fingerprint dos dois stores atuais e à origem. Origem completamente vazia aceita ausência de cópia anterior. A operação captura confirmação/origem/bytes selecionados antes dos awaits e reconfere a guarda depois da validação assíncrona. Toda leitura/gravação fica dentro da lease; execução reconfere baseline após os awaits. Falha deixa diário para recuperação exclusiva e libera lease ao retornar; nenhum comando de completion/XP é chamado. Recuperação percorre a mesma guarda e validação.

**Ainda sem chamador de produção/UI.** otherTabsClosed é confirmação humana, não descoberta técnica de abas antigas. Web Locks só coordena abas cooperativas atualizadas; não prova ausência de escritor antigo/externo nem cancela sync remoto em outro documento. Por isso este módulo não habilita aplicação, recuperação automática ou integração de conta. A tela de bloqueio de diário continua preventiva. A próxima interface precisa ocorrer antes de App/auth e tratar explicitamente as abas antigas, cópia anterior e confirmação, sem liberar a lease de uma página viva. Não acessar auth storage nem tentar inferir isolamento via logout.

### Verificações

Doze testes novos: seis de compatibilidade/diário e seis de coordenação. Dados sintéticos/storage/locks em memória, stores reais para hidratação/recompensas. Casos: par parcial/JSON inválido/store futuro/chave perigosa, checksum recalculado com ambas as partes inválidas, vínculos ausentes/circulares/divergentes, migração legado reproduzida, cadeia de 10 mil nós, exclusividade em cada leitura/escrita, cópia anterior ausente/obsoleta/outra origem, consentimento ausente/tipo errado, lock ausente/ocupado, substituição assíncrona de argumento, recusa após import normal/falho e recuperação após quota simulada.

Logs `/tmp/conselho-r25-compat-{backup,suite,types,lint,build}.log`; snapshot SHA-256 `/tmp/conselho-r25-compat-before.json`. Verificações gerais e encerramento registrados abaixo após execução. Nenhum dado pessoal ou teste real de abas/mobile; nenhuma rede do app, secret, commit/push/deploy.

### Limites e próximo lote

Ainda não é certificação integral de todos os campos/relacionamentos do domínio: catálogos, ratings/strengthRecords e outras estruturas opcionais têm cobertura parcial. Não anunciar restauração segura concluída enquanto esses contratos e o fluxo pré-bootstrap/QA real não forem fechados. Próximo: interface isolada de confirmação/recuperação, abordagem explícita para abas antigas e compatibilidade restante; testes de interrupção/reload no navegador quando a inspeção estiver disponível. R25-B conta online separado. Manter Sol Alto para o recorte crítico de integração; voltar ao Médio após a integração ser demonstrada, sem alegar troca automática.

Fechamento: **320 testes aprovados**, TypeScript/lint limpos; build `envDir:false` em **19,99s**. Diff-check passou, versão 0.1.92 sincronizada. Oito arquivos de stores/auth/sync/tipos/main/bootstrap preservados por SHA-256. Avisos de bundle/Browserslist permanecem. Reserva encerrada; revisão sequencial pelo Astro Boy.

## R25-A2b4 — conferência pré-bootstrap na interface, 0.1.93

28/10/2026. Usuário selecionou Sol Médio; execução permaneceu sequencial. O lote integra uma interface funcional de leitura/exportação isolada, mantendo gravação/recuperação desabilitadas por pendência de compatibilidade integral e QA real.

### Como acessar e usar

Grimório → Guarde sua jornada → **Conferir restauração com o app pausado**. Link de navegação completa para `/?progresso=restaurar`, preservando a mesma origem do progresso. Voltar ao Grimório recarrega `/grimorio#grimoire-backup`. Não usa novo host, porta, sessão remota ou chave de armazenamento; formulários/timers transitórios não passam a ser persistidos.

A tela permite baixar cópia do estado atual e selecionar um arquivo JSON de até 20 MB. Compara contas/atividades/registros e os valores de XP antes/depois, exibe origem/versão, resumo do arquivo e achados críticos. Perfis ficam recolhidos em detalhes; nenhum recibo/XP é recalculado. Origem vazia é informada sem montar defaults. Conteúdo dinâmico é texto React; caminhos privados dos achados não são exibidos. Download solicitado não é tratado como confirmação de arquivo salvo.

### Inicialização e proteção

`main.tsx` importa dinamicamente `mount-restore-workspace.tsx` para a query exata ou para um bloqueio por diário pendente. A montagem usa React sem App/stores/auth; teste do grafo estático também percorre esse mount. Nenhuma lease de página viva é liberada para entrar em restore: o link carrega outro documento. Parâmetros adicionais não liberam aplicação.

`workspace-preview.ts` lê somente as duas chaves existentes e o slot de diário. Diário presente, mesmo vazio/corrompido, interrompe antes de ler core/fitness; a interface informa a pendência e desativa seleção/cópia enquanto ela existir. Essa página não recupera/apaga o diário nem importa stores para tentar resolver. Armazenamento negado permanece erro explícito.

Baseline congelado e rechecado após awaits protege comparação e preparo de download contra mudanças concorrentes. Eventos storage das chaves pertinentes ou clear invalidam resultado/operação pendente; não é lock de escrita nem garante exclusividade. Cancelar/desmontar invalida respostas antigas e impede download atrasado. Origem/perfil atual é lido do par persistido, sem auth storage ou enumeração de localStorage. JSON malformado do baseline agora retorna erro genérico, sem trecho bruto dos registros.

### Confirmação e limites

A seção “Antes de confirmar” explica cópia anterior, revisão de perfis e fechamento de abas. **O botão de restauração está permanentemente desabilitado nesta versão**, sem handler de gravação, feature flag por URL ou chamada de produção ao coordenador exclusivo. Conferência sem erros não habilita aplicação. Interface de consentimento acionável/recuperação e tratamento de abas antigas continuam para o próximo lote após fechar critérios; não apresentar esta tela como restauração concluída.

Identidade: fundo e dourado existentes, Cinzel/Inter, superfícies escuras, conteúdo de largura limitada, controles de 44–48px, layout empilhado no celular e perfis recolhíveis. Nenhum movimento automático. Essas medidas foram implementadas por código; toque/viewport/leitor de tela reais ainda não foram verificados.

### Testes desta rodada

14 novos: cinco com projeções reais dos stores em memória; seis de UI com dublês/hooks/eventos/URLs; três de entrypoint transpilado. Cobrem leitura limitada sem escrita, XP exato/contas, diário antes do domínio, adulteração, baseline vazio/parcial/malformado, storage negado, invalidação durante hash, cancelamento/storage/unmount, download e limpeza de Blob URL, limite de arquivo, mensagens deduplicadas e dados privados, roteamento direto/normal/pendente, falha de chunk sem fallback ao App. Grafo de imports confirma isolamento do mount; não equivale a navegador ou prova de rede real.

Primeira execução do teste de entrypoint falhou porque o dublê CommonJS não fornecia exports; corrigido o harness. Nenhuma falha correspondente observada no app do usuário. Suíte completa **334 testes aprovados** antes do ajuste final da mensagem de JSON malformado; suite de backup e checks foram repetidos após esse ajuste. Logs `/tmp/conselho-r25-workspace-{data,ui,entry,suite,backup-final,types,lint,build}.log`. SHA-256 de início `/tmp/conselho-r25-workspace-before.json`; encerramento registrado abaixo.

Sem tentativa de navegador bloqueado, dado pessoal, download pessoal observado, restauração, chamada remota, secrets, commit/push/deploy. Manter Sol Médio para o trabalho delimitado; elevar somente se surgir problema complexo com evidência. Não alegar troca automática de modelo.

### Próximo passo

Completar campos/contratos de compatibilidade ainda pendentes e definir o fluxo de confirmação/recuperação realmente acionável anterior ao bootstrap, incluindo abas antigas e isolamento. Exigir teste de interrupção/reload e fluxo real de armazenamento antes de habilitar escrita. R25-B conta online e QA global mobile seguem separados.

Fechamento: suíte completa **334 aprovada**; após ajuste final, **85 testes de backup** repetidos, TypeScript/lint limpos e build `envDir:false` em **11,34s**. Diff-check passou, versões sincronizadas em 0.1.93. SHA-256 confirma oito arquivos stores/auth/sync/tipos/journal/coordenador preservados. Nenhuma chamada de escrita/coordenador nos arquivos novos de UI/dados. Avisos bundle/Browserslist permanecem; reserva encerrada após revisão sequencial pelo Astro Boy.

## R25-A2b5 — inventário de compatibilidade de Treinos

28/10/2026. Rodada documental/estática realizada com Luna Baixo para delimitar uma etapa de menor risco antes de editar a auditoria crítica. Versão do app permanece 0.1.93: nenhum código alterado.

### Cobertura verificada e lacunas

- A projeção persistida do store de Treinos contém `accountDataById` e `nativeDataById`; os campos derivados da conta ativa são reconstruídos e não são a fronteira do backup.
- Em contas legadas, `auditFitnessAccount` percorre `workouts`, `sessions`, `gamificationLedger` e `bodyMeasurements`. Não percorre `exercisesCatalog`, `ratings`, `strengthRecords`, `strengthProgressPoints` nem `strengthStat`.
- Em dados nativos, `nativeCatalog` é verificado como lista de objetos, sem validação de ID/campos do catálogo. `templates`, `nativeHistory`, sessão ativa/check-ins e `sequences` têm validação estrutural já descrita nas rodadas anteriores.
- Referências de exercício, template, sequência, sessão e avaliação são validadas hoje sobretudo pelo formato local do valor; não há reconciliação geral dos IDs contra catálogos e listas relacionadas. A regra de vínculo precisa considerar sessões avulsas, templates removidos e snapshots históricos.
- `WorkoutRating` e `StrengthRecord` têm tipos explícitos em `src/types/workout.ts`; a próxima implementação deve revisar também os comandos de gravação/atualização/remoção antes de decidir quais campos são obrigatórios, opcionais, não negativos, únicos ou referenciados. Não inferir regras de dados a partir somente do tipo TypeScript.

Estas lacunas descrevem a fronteira do validador; **não provam defeito ou corrupção nos dados do usuário**, nem autorizam recusar estruturas históricas sem compatibilidade documentada. O arquivo original deve permanecer intacto quando a prévia encontrar algo não reconhecido.

### Escopo recomendado para A2b6

1. Traçar cada estrutura ausente até seus produtores, atualizações, remoções e fixtures históricas; conferir versões e comportamento legado/native.
2. Acrescentar validadores puros incrementais para catálogo, avaliações, recordes e estatísticas somente após derivar as invariantes executadas no código. Separar aviso de incompatibilidade histórica de erro que impede aplicação.
3. Auditar referências cruzadas sem exigir a existência atual de templates usados apenas como snapshots; documentar políticas para rating de sessão removida, exercício customizado e catálogo nativo/legado.
4. Testar dados válidos produzidos pelos comandos reais em memória, corrupções de cada campo, duplicatas e referências; confirmar que a auditoria não modifica o snapshot nem recalcula recompensas.
5. Revalidar aplicação e recuperação do diário por esse mesmo caminho. **Não habilitar restore** até o fluxo pré-bootstrap, isolamento de todos escritores/abas e interrupção/reload real estarem demonstrados.

### Evidência e limite desta rodada

Inspeção estática de `src/lib/backup/fitness-audit.ts`, `critical-progress.ts`, `progress-links.ts`, `stored-progress.ts`, `src/types/workout.ts` e `src/stores/workoutStore.ts` (incluindo `partialize`), cruzada com a documentação canônica e manual. Não foram executados testes, build, navegador ou acesso ao perfil/storage pessoal. A execução do próximo lote está recomendada em **Sol Médio**; esta etapa de inventário coube em Luna Baixo.


## R25-A2b6 — catálogos, avaliações e recordes, 0.1.94

28/10/2026, Astro Boy em execução sequencial após o usuário selecionar Astra Médio. Apenas `fitness-audit.ts` e `critical-progress.ts` mudaram no código de produção. Sem mudança de store, tipo, cálculo, autenticação ou sincronização.

### Comportamento implementado

- Ambos os catálogos: listas/objetos, IDs únicos (UUID v4 no nativo, string no legado), nome, classificações reconhecidas, campos numéricos finitos não negativos, textos/listas, grupos e distribuição muscular. Campos de mídia/equipamentos/tags opcionais podem continuar ausentes. Não exige somatório de 100% nem distribuição preenchida em exercício customizado; não carrega URLs nem altera conteúdo.
- Avaliações: referência textual de sessão, estrelas inteiras de 1 a 5, datas e unicidade por sessão. A coleção vive na conta legada e também guarda avaliações de sessões nativas.
- Recordes: identificação única, exercício, data, valores numéricos, repetições inteiras e flag booleana. Indicadores `strengthProgressPoints`/`strengthStat` são conferidos sem recalcular sua relação ou reproduzir recompensas.
- Catálogo nativo deixou de usar a checagem superficial duplicada em `critical-progress`; o mesmo auditor profundo atende dados legados/nativos e perfis inativos. Versão 0.1.94 incluída no conjunto revisado, sem ampliar suporte a versões desconhecidas.
- A integração existente faz com que essas verificações também sejam usadas na leitura dos pares do diário antes de aplicação/recuperação. Cópias e valores desconhecidos não são normalizados ou descartados.

### Produtores e preservação histórica

Inspecionados `ensureNativeCatalog`, `saveCustomExercise`, `rateWorkout`, `finalizeSessionState`, `deleteWorkout`, `deleteTemplate`, `cleanupEmptyNativeSessions` e `partialize` em `workoutStore.ts`, além dos tipos. Catálogo nativo deriva referências padrão/legadas e exercícios customizados; estes podem ter distribuição vazia. `rateWorkout` atualiza por sessionId e aceita sessões dos dois formatos. Recordes/indicadores são gerados na conclusão legada; não há novo cálculo no auditor.

`deleteWorkout`/`deleteTemplate` não apagam snapshots de sessões; `cleanupEmptyNativeSessions` pode remover histórico nativo sem retirar sua avaliação da conta legada. Portanto não exigir alvo presente para toda referência histórica. Também não inferir que todos os exercícios precisam estar no catálogo persistido: o getter legado consulta catálogos padrão e esportes. Esta rodada não adiciona uma reconciliação global de vínculos; políticas para vínculos ativos e outras estruturas críticas ainda precisam ser fechadas antes da restauração.

### Evidência executada

- Quatro testes novos em `fitness-audit.test.mjs`: catálogos gerados/customizados e avaliações/recordes produzidos por comandos reais em memória; matriz de corrupção e metadados opcionais antigos; perfis inativos/duplicatas; histórico após remoção de planos. A ausência de sessão com avaliação restante foi modelada no snapshot, conforme o comportamento do cleanup inspecionado; não foi teste de limpeza no navegador.
- Teste existente de diário ampliado: campos inválidos de catálogo no destino e de força na origem, mesmo com checksum recalculado, são recusados em aplicação/recuperação antes de qualquer escrita.
- **89 testes de backup passaram**, TypeScript/lint limpos, build Vite `envDir:false` em **7,77s**. Não houve repetição da suíte global. As tentativas iniciais dos testes novos tinham fixtures inadequadas: pressupunham exercício ponderado no catálogo padrão e conclusão de sessão vazia, que o store descarta. Fixtures corrigidas usando exercício customizado real e cenário histórico explícito, sem mudar o store para satisfazer teste.
- SHA-256 de fontes comparado a `/tmp/r25-a2b6-before.json`: somente `fitness-audit.ts` e `critical-progress.ts` foram alterados dentre as fontes existentes ao iniciar. Logs `/tmp/r25-a2b6-{targeted,backup,types,lint,build}.log`. Versões 0.1.94 sincronizadas e `git diff --check` limpo; avisos conhecidos de bundle/Browserslist permanecem.

Restauração indisponível, sem dados pessoais, navegador, chamada remota, commit/push/deploy. Próximo: vínculos ativos e critérios restantes de compatibilidade, depois confirmação/recuperação e validação real de interrupção/reload. Reserva encerrada após revisão sequencial de código e documentação.


## R25-A2b7 — conferência de recuperação e vínculos internos, 0.1.95

29/10/2026. Sol Alto solicitado. Astro Boy executou implementação, validação e revisão documental em sequência no checkout `codex/fitness-ui-integration`, base `b11ed9d`. Árvore anterior preservada; sem subagentes, publicação ou acesso a progresso pessoal.

### Entrega

- `fitness-audit.ts`: sessão nativa não pode compartilhar ID entre histórico, execução e check-in no mesmo perfil; execução/check-in devem estar em andamento. Chave do check-in precisa corresponder ao `coreHabitId`. Recibo existente deve concordar com a atividade/sessão explicitamente vinculada. Esforço/modo/origem de duração, quando presentes, são conferidos. Não exigir referência de catálogo no plano autossuficiente nem existência atual de alvo histórico.
- As inspeções de `saveTemplate`, `beginHabitWorkout`, `finishSession`, `undoHabitWorkout`, `deleteTemplate` e `deleteHabit` fundamentam esses limites. Remover um plano/ciclo pode manter sessão ou check-in; a auditoria conserva esses bytes, sem criar alvo substituto ou recompensa. Campos opcionais antigos e perfis inativos continuam aceitos quando coerentes.
- `restore-journal.ts`: API `reviewPendingRestore` somente lê três chaves fixas. Valida integridade/origem e os dois pares protegidos; usa as chaves atuais apenas para classificar conflito e conferir obsolescência. Resumos nunca vêm de um core novo com Treinos antigos. Nenhum diário é gravado/limpo. Erro de JSON não expõe seu conteúdo bruto.
- `summarizeProgress` extraído do helper já existente em `progress-backup.ts` para reutilizar o resumo de versões validadas. Formato e conteúdo do arquivo preservados. Reserva desse helper incluída na revisão sequencial, sem concorrência de escritores.
- `RestoreWorkspace`: em operação pendente, permite conferir versão anterior/destino em detalhes recolhíveis, explica retorno ao estado anterior, manutenção do destino confirmado ou necessidade de revisão externa. Cancelamento, desmontagem e eventos storage invalidam respostas antigas; recuperação e restauração continuam desabilitadas. Usa estilos elementais existentes e controles de 48px; não houve inspeção visual.
- Nenhum writer novo de produção, comando de conclusão/XP ou inicialização de auth. A API de conferência não é um lock e seu resultado não autoriza futura gravação. `runExclusiveRestore` continua sem chamador na UI.

### Verificação executada

- Três casos novos em `fitness-audit.test.mjs`: comandos reais em memória percorrem check-in → execução → conclusão → Undo → exclusão de plano/ciclo; matrizes detectam identidade duplicada, estado incompatível, chave divergente, recibo de outra atividade e metadados inválidos. IDs entre perfis são independentes; ausência de recibo/alvos históricos não inventa registro nem recompensa.
- Seis casos novos em `recovery-review.test.mjs`: ausência de diário, dependências sem stores/auth, interrupção antes de cada fronteira de gravação do protocolo existente, origem inicialmente vazia, conflitos em fase preparada/confirmada, concorrência e JSON/integridade inválidos. A prévia é comparada ao resultado de recuperação em uma segunda cópia independente em memória. Diário com checksum recalculado e XP inválido em qualquer lado também falha sem escrita. Não são testes reais de quota/interrupção do navegador.
- Três casos de UI com dublês em `restore-workspace-ui.test.mjs`: os três resultados, resumos recolhíveis, ação de escrita desabilitada, cancelamento/conta obsoleta/concorrência/desmontagem, erro/nova tentativa e invalidação posterior. Conteúdo bruto das versões não é renderizado. Não equivalem a navegador/mobile.
- Casos existentes de `restore-compatibility.test.mjs` ampliados: metadados e fase de sessão nos dois lados de diário adulterado são rejeitados antes de execute/recover; fixture cria sessão ativa com comando real.
- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **350 passaram**, zero falhas. Após ajuste final de texto e casos de confronto prévia/recuperação, `node --test tests/backup/*.test.mjs`: **101 passaram**.
- `npx tsc -b`, `npm run lint`: limpos. Build Vite com `envDir:false`: **8,29s**; avisos de bundle/Browserslist existentes permanecem. `git diff --check` limpo; manifests sincronizados em 0.1.95 sem alteração de dependências.
- Snapshot SHA-256 `/tmp/r25-a2b7-before.json`: somente cinco fontes preexistentes mudaram — fitness-audit, critical-progress, restore-journal, progress-backup e RestoreWorkspace. appStore/workoutStore/authStore/supabaseCloudSync/tipos/main/coordenador exclusivo preservados. Logs `/tmp/r25-a2b7-{tests,backup-final,types-final,lint-final,build-final}.log`.

### Limites e próxima etapa

Conferência de recuperação não executa a recuperação; cobertura ampliada não certifica todas as relações/versionamentos do domínio. Falta fechar compatibilidade restante, confirmação e fluxo acionável anterior ao bootstrap, isolamento de escritores/abas antigas e de auth/sync, além de teste real de interrupção/reload/concorrência no navegador. Política salva de acesso ao app não foi contornada nem repetidamente testada nesta rodada. Não houve navegador, leitura/gravação pessoal, backup pessoal observado, crédito retroativo pessoal, rede do app, secrets, commit/push/deploy.

R25-B associação online permanece separado e precisa preservar os perfis/atividades/XP com Matheus responsável por contratos/backend. QA mobile, polimento de animações e fragmentos/inventário continuam outras frentes. Manter Sol Alto para integração crítica e voltar ao Médio quando os critérios desse lote estiverem fechados. Reserva encerrada após revisão sequencial pelo Astro Boy.


## R25-A2b8 — confirmação vinculada e cópias protegidas, 0.1.96

29/10/2026. Usuário solicitou Sol Médio; Astro Boy manteve esse esforço para um lote delimitado de cópias/contrato interno e testes, sem delegação. Checkout `codex/fitness-ui-integration`, base `b11ed9d`; alterações anteriores preservadas. A mudança não habilita gravação pela UI e não altera dados de domínio, backend ou fórmulas.

### Problemas reproduzidos e correção

`tests/backup/exclusive-restore.test.mjs` recebeu duas regressões antes da alteração de fonte. Ambas falharam por ausência da recusa esperada: o coordenador aceitava recuperação sem confirmação específica e podia recuperar bytes diferentes dos conferidos (inclusive diário logicamente igual com serialização diferente ou par parcialmente devolvido ao baseline). O escritor era biblioteca isolada sem chamador na interface; isso não demonstra perda de dados pessoais.

- `runExclusiveRestore` em modo recover agora exige `recoveryConfirmed === true` e `expected: RecoveryBaseline`. Consentimento e bytes do diário/par conferidos são capturados antes da espera pelo lock. Sob exclusividade, a função de baixo nível valida a referência antes e depois dos awaits de integridade, recusando resultado obsoleto antes de escrever.
- `RecoveryBaseline`, `copyRecoveryBaseline` e `assertRecoveryBaseline` centralizam a captura/conferência. A API de baixo nível `recoverRestoreJournal` preserva seu uso em testes com exclusividade do chamador e aceita baseline opcional; o coordenador sempre o exige. Não se trata de autorização remota ou descoberta técnica de abas antigas.
- `createRecoverySafetyCopy` valida origem/diário/ambos os pares, serializa somente a versão protegida escolhida com formato de backup existente, verifica integridade e atualidade após os awaits. Preserva conteúdo de stores, IDs e XP, sem hidratação, recálculo, gravação, enumeração de armazenamento ou envio remoto. Metadados de exportação indicam versão/data da nova cópia; não são a data original da operação.
- Um diário válido com alterações externas admite copiar suas duas versões para preservação; as alterações externas continuam intactas. Uma origem anterior vazia não produz cópia anterior fictícia. Diário inválido/origem divergente/versão incompatível não é exportado como progresso válido. Parsing de JSON do diário usa mensagem genérica, sem conteúdo bruto.
- `RestoreWorkspace` oferece os dois downloads por versão; mantém os detalhes durante a espera para preservar contexto no celular, bloqueia duplo envio e mantém cancelamento. Erro, cancelamento, mudança externa, desmontagem ou resultado obsoleto impedem download tardio; URLs temporárias são limpas. Restauração e recuperação continuam desabilitadas; nenhum writer novo de produção.

### Verificação executada

- Nove testes novos: três de coordenação/consentimento e bytes obsoletos/congelamento durante lock/hashing; quatro de cópias verificadas/IDs/XP/ausência de auth/origem vazia/conflito/concorrência/JSON inválido; dois de UI com dublês para nomes/versões, retenção de detalhes, cancelamento/obsolescência/erro/desmontagem e limpeza de URLs. Casos anteriores de recuperação após falha adaptados ao contrato explícito.
- Antes do patch, `node --test tests/backup/exclusive-restore.test.mjs`: duas falhas novas reproduzidas; após correção, casos passaram.
- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **359 passaram**, zero falhas. Após ajuste final de retenção dos detalhes, `node --test tests/backup/*.test.mjs`: **110 passaram**. Não alegar suíte global repetida depois desse ajuste.
- `npx tsc -b` e `npm run lint` finais limpos; build com `envDir:false` final em **15,00s**. Avisos de bundle/Browserslist existentes permanecem. Versões sincronizadas em 0.1.96, sem alteração de dependências; `git diff --check` limpo.
- Snapshot `/tmp/r25-a2b8-before.json`: somente quatro fontes preexistentes mudaram — restore-journal, exclusive-restore, critical-progress e RestoreWorkspace. appStore/workoutStore/authStore/supabaseCloudSync/tipos/main preservados por SHA-256. Logs `/tmp/r25-a2b8-{before-tests,targeted,tests,backup-final,types-final,lint-final,build-final}.log`.

### Impacto e limites

Contrato interno de recuperação ficou mais estrito; Matheus deve fornecer consentimento e baseline explícitos ao integrar um futuro chamador. Core, pontuação, persistência remota e regras de domínio não foram alterados. Download solicitado não prova arquivo pessoal salvo. Testes usam storage/locks em memória e UI com dublês; não demonstram comportamento real de Web Locks, abas antigas/BFCache, quota, toque ou reload. Nenhum navegador, dado pessoal, restauração real, chamada remota, secrets, commit/push/deploy.

Próximo: fechar compatibilidade e isolamento pendentes, integração acionável de confirmação/recuperação antes da hidratação e QA real de interrupção/abas/reload antes de liberar escrita. Não contornar política salva do navegador nem apagar diário para entrar no app. R25-B associação online com Matheus, QA mobile/tablet, polimento/animações e fragmentos continuam frentes separadas. Esforço recomendado deve acompanhar a tarefa; Sol Médio foi suficiente nesta entrega delimitada. Reserva encerrada após revisão sequencial de implementação/documentação pelo Astro Boy.


## R25-A2b9 — validação integrada de documentos e recuperação, 29/10/2026

Lote somente de testes/documentação, **0.1.96 mantida**, Sol Médio solicitado. Astro Boy executou e revisou sequencialmente no checkout `codex/fitness-ui-integration`, base `b11ed9d`. Nenhuma fonte do produto, fórmula, manifesto ou configuração alterada. A simulação não autoriza aplicação/recuperação na UI.

### Integração exercitada

`tests/backup/document-lifecycle.test.mjs` avalia um realm novo dos módulos de startup/coordenador/diário para cada documento simulado. Somente o callback `load` posterior à guarda cria uma instância dos stores reais. `load-progress.mjs` recebeu Map opcional para compartilhar armazenamento exclusivamente em memória entre essas instâncias; uso anterior por entradas continua funcionando. Não há navegador, evento DOM real, conta pessoal ou autenticação no harness.

Fixtures criadas com comandos existentes: dois perfis, atividade diária com contador/conclusão, exercício personalizado/sessão concluída, tarefa concluída e rascunhos. O destino altera core e Treinos, inclusive medida corporal puramente sintética para exercitar a segunda gravação. Nada é inferido sobre dados de saúde do usuário.

Seis testes integrados:

1. Dois documentos hidratam stores independentes e mantêm leases compartilhadas; substituição é recusada com ambos abertos e com um só aberto. Após fechar os dois, o baseline e a cópia anterior são renovados a partir dos bytes realmente atuais, considerando possíveis reescritas derivadas da hidratação. Aplicação exclusiva e duas novas hidratações preservam conteúdo/XP.
2. Interrupção antes de cada uma das cinco gravações de aplicação. Sem diário durável, carrega o par antigo coerente; com diário, startup não hidrata nada. Nova revisão/recuperação antes dos stores restitui bytes anteriores ou mantém destino confirmado, conforme a fase. Duas novas instâncias mantêm identidade do personagem/perfis, tarefas/ciclos/quantidades/rascunhos/logs, XP por elemento, histórico nativo e dados legados (sessões, planos, medidas, avaliações, recordes, ledger e força).
3. Documento normal iniciado durante a lease exclusiva é recusado antes de importar stores; um documento novo, após liberação, carrega somente o destino coerente.
4. Interrupção durante cada uma das três gravações reais de rollback. Mesmo com ambos os envelopes já antigos, diário remanescente continua bloqueando hidratação. Confirmação anterior é recusada quando o rollback parcial mudou o baseline; nova revisão permite terminar antes de carregar os stores.
5. Documento que já iniciou a aplicação não pode ser reutilizado como escritor de recuperação, mesmo encerrando sua lease simulada.
6. Grafo do coordenador não importa stores, serviços de rede/autenticação ou UI antecipadamente.

### Evidência e ajuste da fixture

`node --test tests/backup/document-lifecycle.test.mjs`: seis passaram no estado final. Na primeira inclusão do caso de rollback, a fixture mudava somente o core e esperava três gravações; a função corretamente pulava a gravação de Treinos porque seus bytes eram iguais. Corrigida a fixture para alterar ambos os envelopes com comandos reais; não foi demonstrado um defeito do produto nem alterada a implementação para satisfazer o teste.

`node --test tests/backup/*.test.mjs`: **116 passaram**, zero falhas. `npm run lint` e `git diff --check` limpos. SHA-256 de todas as fontes .ts/.tsx comparado a `/tmp/r25-a2b9-before.json`: nenhuma mudança. Manifests permanecem 0.1.96. Logs `/tmp/r25-a2b9-{integration-final,backup-final,lint-final}.log`. Sem nova suíte global, TypeScript ou build nesta rodada; os resultados de rodadas anteriores não são apresentados como novos.

### Critérios que continuam pendentes

Esta é integração de módulos reais com documentos/storage/locks simulados. Não prova semântica de Web Locks/BFCache, existência/fechamento de abas antigas, falha de quota real, renderização/toque ou reload no navegador. Os stores são hidratados sem importar App/auth/autosync; portanto não comprova que recarregar a aplicação completa após recuperação preservaria o isolamento remoto. Próximo lote: auditar esse bootstrap e contrato de isolamento com Matheus, usando skill Supabase se a tarefa envolver sua autenticação/sync, sem alterar backend silenciosamente ou acessar secrets/rede pessoal.

Compatibilidade final e integração acionável com QA de navegador seguem necessárias antes de liberar escrita. Política salva de acesso ao app não foi contornada. R25-B associação online, QA mobile/polimento/animações e fragmentos continuam separados. Sem dados pessoais, recuperação real, rede do app, commit/push/deploy. Reserva encerrada após revisão sequencial pelo Astro Boy.


## R25-A2b10 — auditoria de isolamento auth/sync, 29/10/2026

Relatório completo e contrato proposto em [R25-A-ISOLAMENTO-AUTH-SYNC.md](R25-A-ISOLAMENTO-AUTH-SYNC.md). Astro Boy em Sol Alto, sequencialmente. Nove testes de caracterização usam authStore/serviço reais, core real em memória e cliente/timers/eventos sintéticos. Confirmam que sessão salva e gatilhos de sincronização não são continuação isolada de uma cópia local; incluem troca de perfil, resposta tardia após logout e cobertura parcial do payload. Não verificar configuração/SDK/RLS remotos nem presumir que todos os usuários estejam com auth habilitada.

**125 testes de backup aprovados**, lint/diff-check limpos. Fontes .ts/.tsx idênticas por SHA-256, versão 0.1.96 mantida. Sem build/TypeScript/suíte global novos por não haver alteração de produto. Documentação pública Supabase consultada; sem secrets, sessões pessoais, queries de banco, browser, rede do app, recuperação real, comunicação externa ou publicação.

Próximo: barreira pós-restauração durável anterior a App/auth/cliente e contrato de vínculo/perfil/cancelamento com Matheus. O relatório é uma proposta, não autorização para alterar regras cloud-first, schema ou migrar dados. Gravação na UI continua desabilitada até fechamento do isolamento/compatibilidade e QA real. Reserva encerrada após revisão sequencial de testes/documentação pelo coordenador.


## R25-A2b11 — barreira pós-confirmação antes de auth, 0.1.97

29/10/2026. Astro Boy, Sol Médio solicitado, execução/revisão sequencial no checkout `codex/fitness-ui-integration`, base `b11ed9d`. Implementação delimitada da barreira proposta por A2b10, preservando cloud-first normal, backend de Matheus e domínio. Não aprova nova política de associação/mesclagem ou schema remoto.

### Protocolo implementado

O diário existente já é gravado/confirmado antes de tocar core/Treinos. Sua fase committed agora permanece durável após verificar o destino; não há etapa de limpeza no sucesso. Startup existente identifica qualquer diário antes de importar App/auth/cliente e encaminha à conferência isolada. Dessa forma, não existe janela adicional entre remover a barreira e persistir outro marcador; nenhuma chave/store novo foi criado. Formato versão 1/envelopes permanecem iguais, sem migração. A mudança é de ciclo de vida do protocolo experimental, que continua sem writer de produção/UI.

- `executePreparedRestore`: quatro gravações (prepared → core → Treinos → committed); verifica o par e mantém committed. Retorno `applied` significa destino armazenado/isolado, não aplicação normal liberada.
- `recoverRestoreJournal` em prepared: confere ambos os lados, devolve bytes anteriores e só depois limpa o diário. Falhas mantêm a proteção conforme protocolo existente.
- Em committed: confere destino e diário, retorna `committed` sem gravar, apagar ou desfazer o destino. Repetir a operação preserva o marcador; referência antiga continua sujeita à guarda de obsolescência do coordenador.
- `reviewPendingRestore` e `createRecoverySafetyCopy`: continuam somente leitura. Conferir/exportar as versões não é escolha de conta e não libera cloud-first.
- `RestoreWorkspace` distingue cópia já confirmada/isolada e explica que a abertura aguarda definição de uso local/associação. Botão de continuação é desabilitado; confronto externo continua pedindo revisão. Mensagem da tela de proteção genérica acompanha a nova semântica.
- Não existe API de liberação de committed nesta entrega. Remover o diário manualmente não é procedimento suportado. Dados do diário são privados e temporários, preservados até existir uma continuação validada.

### Testes e evidências

Quatro testes novos em `post-restore-barrier.test.mjs`:

1. Commit real da biblioteca seguido de três documentos novos mantém `pending-restore`, sem executar a inicialização de auth que usaria cliente sintético. Backend real não é modificado ou conectado.
2. Revisões, exportações protegidas e recuperações committed repetidas preservam todos os bytes e o XP sintético confirmado (7 de Ar), sem gravação/remoção adicional.
3. Interrupção antes/depois de cada uma das quatro gravações deixa dados antigos intactos sem diário apenas antes da primeira; nas demais fronteiras, startup bloqueia. Recuperação mantém barreira se o commit é durável e limpa somente rollback prepared verificado.
4. Rollback devolve bytes anteriores; alteração externa após commit recusa recuperação e mantém proteção de startup.

Regressões existentes foram adaptadas à nova semântica, não removidas: matrizes de interrupção/gravação ignorada usam as quatro fronteiras; teste integrado de documentos agora exige bloqueio pós-commit e só permite hidratação normal após rollback; UI descreve o isolamento. Testes de corpos de domínio continuam verificando valores/IDs sem reaplicar recompensa. Lock manager/documentos/storage são simulados; não são Web Locks/BFCache ou recarga real.

`node --test tests/backup/*.test.mjs`: 129 aprovados antes do ajuste final da fixture de XP. Depois da versão 0.1.97 e desse ajuste, `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **378 passaram**, zero falhas. `npx tsc -b`, `npm run lint` limpos; build Vite com `envDir:false` em **19,50s**. Avisos conhecidos de bundle/Browserslist permanecem. Diff-check limpo; três posições de versão sincronizadas sem dependências novas.

SHA-256 contra `/tmp/r25-a2b11-before.json`: quatro fontes preexistentes alteradas — restore-journal, startup-screen, critical-progress e RestoreWorkspace. appStore/workoutStore/authStore/supabaseCloudSync/tipos/main/coordenador exclusivo intactos. Logs `/tmp/r25-a2b11-{targeted,backup,tests,types,lint,build}.log`.

### Limites e próxima integração

Barreira implementada não é continuação local completa ou associação online. Falta um caminho explícito de uso local sem ativar efeitos remotos e/ou reconciliação com conta, com vínculo por perfil/identidade, I/O tardio e cobertura de dados acordados com Matheus. Nunca chamar diretamente o bootstrap normal para contornar o marcador. A semântica experimental 0.1.96 que apagava committed está documentada historicamente; integrações futuras devem usar o contrato 0.1.97.

A aplicação/recuperação pela UI continuam desabilitadas até fechamento dos critérios restantes de compatibilidade/isolamento e teste real de abas/reload/quota. Abas antigas sem cooperação, SDK real e requests externos ainda não são controlados por prova em memória. Sem browser, SDK Auth real, sessões/segredos pessoais, consulta a banco, rede do app, restauração pessoal, comunicação externa, commit/push/deploy. R25-B, QA mobile, polimento/animações e fragmentos continuam separados. Reserva encerrada após revisão sequencial pelo Astro Boy.


## R25-1A — confirmação, recuperação e uso somente local — 0.1.98

29/10/2026. Sol Alto, execução sequencial por Astro Boy. Usuário autorizou fechar o código da restauração e instruiu seguir só com código/testes locais por bloqueio persistente do navegador. Não houve contorno, QA visual, acesso a dados pessoais/secrets, rede do app, banco, publicação ou restauração pessoal.

### Contrato implementado

- A seleção da cópia inclui o texto exato e baseline bruto dos dois stores e do modo local. `restore-confirmation.ts` confere o arquivo anterior salvo (mesma origem/fingerprint) quando há progresso local e prepara diário sem escrever. Revalida após hashing. Origem vazia não exige cópia inexistente.
- `RestoreActions` exige consentimentos distintos para fechar outras abas e substituir/recuperar/usar localmente. Captura valores, recusa clique duplo e invalida resultados por alteração de storage/seleção/desmontagem. Coordenador recebe `isCurrent` e verifica novamente depois de await/lock/validação, antes da primeira escrita. Escrita síncrona já iniciada não oferece cancelamento intermediário; uma falha retém o diário e pede recarga/revisão, sem retry automático.
- Aplicação confirma ambos os envelopes, conserva o diário committed e recarrega para a conferência. Rollback prepared restaura bytes anteriores e remove somente seu diário verificado. Continuação committed exige confirmação **somente local**, baseline e destino exatos sob exclusividade.
- `conselho-elemental-local-progress-mode-v1` contém somente formato/versão/origem, não atividades, credenciais ou saldos. É gravado/verificado **antes** de remover o diário committed. Interrupção deixa diário ou isolamento durável; falha silenciosa de gravação/remoção é detectada por readback. Não é um store paralelo nem altera o arquivo exportado ou schema v1 do diário.
- Startup verifica diário primeiro; sem diário, valida o marcador (incluindo limite/tipo/versão/origem) antes de importar App. Seleção local é monotônica no documento: `src/lib/supabase.ts` não chama `createClient`, auth fica desabilitada e o fluxo local existente dos stores continua. Sessões salvas não são lidas nem apagadas. Isso isola os conectores de progresso; não bloqueia toda mídia/rede externa do app.
- App exibe aviso de progresso local e link para guardar cópia. Edições posteriores usam a persistência existente; novas recargas preservam modo, IDs, atividades e contadores exercitados. Nova restauração/rollback em documento local mantém o marcador. Não existe API para removê-lo ou associar conta online; não orientar exclusão manual para forçar login.
- A UI tem handlers preparados, mas `RESTORE_WRITES_RELEASED=false` é uma trava estática de release, também verificada no handler. Não existe desbloqueio por URL, ambiente ou storage. Testes de handlers substituem somente esse módulo para exercitar o caminho futuro; não habilitam o produto distribuído.

### Evidências realmente executadas

21 testes novos em `restore-confirmation.test.mjs` (5), `restore-actions-ui.test.mjs` (8) e `local-continuation.test.mjs` (8). Suíte global `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **399 aprovados**, zero falhas. `npx tsc -b` e `npm run lint` passaram; build Vite `envDir:false` em **7,37s**, com avisos já existentes de bundle/Browserslist. Manifests em 0.1.98 e whitelist de arquivo revisada até essa versão. Logs `/tmp/r25-a1a-{tests,types,lint,build}-final.log`.

Cenários: pipeline real de prévia/cópia/confirmar/aplicar/revisar/continuar; recargas simuladas com módulo cliente frontend e authStore reais, SDK substituto e stores reais em memória; edição de identidade/quantidades e hidratação; interrupção antes/depois de cada escrita de handoff; falhas silenciosas; consentimento ausente, revisão obsoleta, cancelamento durante lock/hash; marcador inválido/estrangeiro; segunda restauração com rollback. Testes do componente usam hooks/DOM substitutos e não equivalem a interação visual real. Caso inicialmente falho usava um helper interno não exportado no teste; corrigida a inspeção da fixture, sem alteração do protocolo por esse erro.

SHA-256 comparado a `/tmp/r25-a1a-before.json` confirma appStore, workoutStore, authStore, supabaseCloudSync e tipos core/Treinos intactos. Dez fontes preexistentes alteradas no recorte de backup/bootstrap/cliente/App; seis fontes/estilos novos. Nenhuma dependência, migração ou fórmula nova. Revisão de React: módulos pesados continuam após o guard; inputs rotulados, status acessível, botões >=48px, campos de consentimento com foco nativo. Não equivale a aceite de toque/viewport real.

### Aceite restante / próxima etapa

1. Em navegador autorizado, usar origem/perfil de validação isolado com atividades sintéticas. Preparar um **artefato de validação separado** com o gate aberto apenas nesse artefato; manter o release normal fechado até o aceite. Não usar progresso pessoal nem copiar sessões reais.
2. Percorrer criação/exportação/readback/restauração/rollback/continuação local e recarga real, incluindo negar quota, interromper writes, abrir uma segunda aba cooperativa e testar retorno de aba antiga/BFCache. Confirmar que diário ou modo local impede auth/sync e que edições novas sobrevivem a recargas.
3. Conferir teclado/leitor de tela e 360/390/768px, sem overlap do aviso/navegação, foco preservado e estados de falha claros. Só então revisar a liberação do gate em fonte; nenhuma aprovação por teste sintético substitui esse aceite.
4. Conta pessoal 1B continua separada: definir com Matheus vínculo de perfil/identidade, cobertura/reconciliação do progresso e invalidação de operações online pendentes. Não prometer que a restauração local já fez migração online. Demais frentes: QA global mobile, polimento/animações e fragmentos/inventário.
