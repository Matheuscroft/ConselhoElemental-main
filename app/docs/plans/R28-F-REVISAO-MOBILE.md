# R28-F — revisão transversal; fechamento parcial

26/10/2026 · **0.1.76 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. Astro Boy sequencial. R28-A/E continuam implementados localmente, com aceite renderizado pendente.

## Bloqueio confirmado nesta rodada

A tentativa de observar a aba existente `http://127.0.0.1:5173/treinos?tab=workouts` com o navegador interno foi recusada: permissão salva/gerenciada não concedeu autoridade para observar a origem. Não foram usadas superfícies alternativas, headless, CDP ou outros contornos. Foi solicitado ao usuário revisar a permissão no Codex; uma autorização textual anterior não removeu a configuração.

Nenhuma captura, medida de viewport, teste de toque, foco real, FPS ou leitura assistiva foi executada. Esta etapa **não está concluída como QA mobile**. A skill webapp-testing orientou o roteiro; disponibilidade de ferramentas não equivale a validação.

## Correção F1 executada por inspeção de código

Os links de Rituais/Mapa para `/grimorio#grimoire-history` tinham destino declarado, mas `ScrollToTop` resetava a rota ao topo e o Grimório não tratava a âncora de entrada. O defeito foi identificado por leitura de código, não reproduzido no navegador bloqueado.

`useGrimoireAnchor` agora agenda a navegação após a montagem e o reset global. Somente Personagem, Elementos e Histórico são destinos aceitos. A seção recebe foco sem rolar duas vezes e rolagem instantânea respeita o movimento reduzido. Margem do cabeçalho existente preservada. `tabIndex=-1` permite foco programático sem acrescentar etapas à ordem de Tab.

Trocar âncora ou desmontar cancela o frame anterior. Hash desconhecido, malformado ou seção ausente não causa exceção nem observação/polling. A correção é local ao Grimório; preservação de filtros de Domínios/Mapa não mudou. Stores, tipos e projeção do histórico preservados por SHA-256 de quatro arquivos do início do lote.

## Matriz de retomada

Todos os cenários renderizados abaixo continuam **pendentes**, a executar primeiro em 360/390px e depois 768px. Usar dados temporários isolados, sem editar atividades pessoais para testar.

| Área | Conferência de código nesta rodada | Cenários renderizados pendentes |
| --- | --- | --- |
| Domínios/Mapa | Marcador de filtros preserva scroll; painéis recolhidos inertes | Alternar grupos longe do topo, busca, limpar, abrir área e voltar; confirmar posição e foco |
| Ciclos | Recibo vinculado a conta/data; counter separa somar e concluir | Somar rápido, extra além da meta, Undo, cancelar/salvar contador, trocar data; observar foco ao remover formulário |
| Invocar/Forja | Confirmação e destinos explícitos; restauração de foco na Forja | Criar/editar/cancelar, validação de campos, teclado mobile, dispensar recibo e navegar |
| Treinos | Recibo após estado registrado; controles fechados inertes | Série/bloco, pular, recolher/reabrir, finalizar, histórico, preferência reduzida, foco após sumir botão de conclusão |
| Trilhas | Recibo contextual de origem; etapas continuam livres | Último ritual, subida de nível, sem nível novo, títulos longos, fechar/Escape/próxima; foco e posição reais |
| Grimório | F1 corrige destino de âncora; dados preservados | Entrar pelo link Meu histórico, links internos, voltar, cabeçalho não cobrir alvo |
| Roda | Giro pulável sem repetir escolha; preferência dinâmica | Sortear, pular, sair durante giro, abrir resultado e voltar, sem XP/custo |

Critérios comuns: nenhuma sobreposição com navegação inferior, ausência de overflow lateral, leitura sem cortes, alvos de toque adequados, foco visível, ação disponível durante feedback, erro sem perda de entrada, reduced motion sem perda de informação. Desempenho requer medição real; não declarar 60fps.

A inspeção registrou foco após substituição/remoção de formulários como ponto de atenção em Ciclos/Treinos. Isso ainda não é falha reproduzida e não foi alterado por suposição nesta rodada.

## Verificações executadas

- Quatro testes novos executam o efeito real de âncora com dublês de hooks/document/frame: destinos conhecidos, hash ausente/inválido, cancelamento/troca rápida e seção inexistente.
- Suíte `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **198 passaram**.
- `tsc -b` e `npm run lint`: passaram.
- Build Vite com `envDir:false`: passou em **6,81s**; avisos de bundle grande e Browserslist permanecem.
- Revisão do diff/React e documentação pelo coordenador, sem agente revisor independente. Versões sincronizadas; diff-check limpo.

Logs locais: `/tmp/conselho-r28f-{tests,lint,types,build}.log`; preservação `/tmp/conselho-r28f-preserved.json`. Testes com dublês/SSR não são validação de navegador. Não houve alteração de dados pessoais, secrets, commit/push/deploy.

## Próximo passo

Concluir esta matriz quando a permissão permitir a inspeção. Não marcar R28 como finalizado antes do aceite mobile. R25-A/B (backup/restauração e associação segura à conta) segue pendente prioritário; fragmentos, marcos globais e demais contratos não foram implementados por esta revisão. Fábio mantém frontend/aceite; Matheus backend; Astro Boy coordena.

## F2 — continuidade somente por código (0.1.77)

Fábio respondeu: **“Continue apenas com a revisão de código por enquanto.”** Nenhuma nova tentativa de navegador nesta rodada. Aceite visual, toque e leitor de tela continuam explicitamente pendentes, sem novas solicitações para desbloquear durante esse recorte.

A inspeção de `CycleDailyCounter` confirmou ausência de destino de foco quando salvar/cancelar remove o formulário ou desfazer remove o botão da quantidade. A correção usa refs e efeito de layout após a atualização do DOM: salvar → Somar ao dia; cancelar → controle de configuração; desfazer → Somar ao dia. `preventScroll` evita deslocamento provocado pelo foco. O pedido é consumido uma vez, sem timer e sem roubar foco em renders comuns. Falha do comando mantém formulário/erro e não agenda foco. Nenhum comando adicional, fórmula, dado ou efeito de recompensa foi introduzido.

Quatro testes executam os handlers e o efeito real com dublês isolados de hooks/refs, incluindo falha e render repetido. O primeiro ensaio de Undo revelou campo errado na fixture (`date` em vez de `dateKey`); corrigida a fixture para o contrato existente, sem alteração de domínio. Suíte completa: **202 testes passaram**; TypeScript e lint passaram. Build `envDir:false` passou em **8,93s**; avisos de bundle/Browserslist permanecem. SHA-256 confirmou stores, tipos, helper de quantidades e página Ciclos (cinco arquivos) inalterados. Versões sincronizadas, revisão de código/documental pelo coordenador; sem revisão independente, push ou deploy.

Logs locais: `/tmp/conselho-r28f2-{tests,lint,types,build}.log`; snapshot `/tmp/conselho-r28f2-preserved.json`. A matriz acima passa a ter foco do contador corrigido no código, ainda sem validação renderizada. Foco após concluir série em Treinos continua ponto de revisão. Próximo: continuar revisão de código dos controles substituídos em Treinos e cenários de erro/retorno, preservando a escolha de não usar navegador por enquanto.

## F3 — retorno e foco de séries (0.1.78)

Continuidade somente por código, sem tentativa de navegador. Inspeção encontrou que `completePerformedSet`/`skipPerformedSet` podem devolver sessão sem registrar o estado solicitado; `ExerciseSetRow` ignorava o retorno e não informava recusa. A assinatura local agora usa o retorno existente `WorkoutSession | undefined`; o único consumidor continua `ActiveWorkout`, com callbacks e arquivos preservados.

`wasSetRecorded` exige sessão em andamento, o mesmo ID de série e estado correspondente à ação. A UI mostra erro de registro/salto quando o comando recusa ou lança exceção, mantendo os campos e permitindo tentar novamente. Uma guarda síncrona impede disparo repetido antes de atualizar a apresentação. Ela é local à UI e não substitui idempotência de domínio.

Depois do retorno confirmado, a intenção de foco aguarda a prop concluída/pulada para focar o resultado da própria série, com `preventScroll`. Histórico montado e renders comuns não movem foco. Não há sucesso antes do retorno, comandos de recompensa, timers extras ou gravação por animação. O foco programático não acrescenta o recibo à sequência normal de Tab.

Quatro testes novos cobrem retorno ausente/recusado/encerrado/ID errado, payload original e toque duplicado antes da atualização, falha/retentativa, pular e histórico. Executam handlers/efeito com dublês, sem navegador. Suíte completa: **206 testes passaram**; TypeScript e lint passaram. Build `envDir:false` passou em **11,04s**; avisos de bundle/Browserslist permanecem. SHA-256 confirma stores app/workout, tipo de treino, página ActiveWorkout e WorkoutSummary preservados. A suíte Deno legada e sessão real não foram executadas nesta rodada.

Logs: `/tmp/conselho-r28f3-{tests,lint,types,build}.log`; preservação `/tmp/conselho-r28f3-preserved.json`. Versões sincronizadas e diff-check limpo; revisão sequencial de código/documentação, sem revisor independente ou publicação.

A matriz mobile passa a ter foco de Ciclos e séries corrigido no código, com verificação renderizada ainda pendente. Próximo recorte permitido: revisão estática de confirmações/erros e retorno em Invocar/Forja. R28 não é aceite visual completo; R25-A/B e contratos permanecem separados.

### Inspeção inicial do próximo recorte

Forja: createDraft/saveEdit/removeDraft/classifyDraft chamam comandos diretamente; classify trata retorno vazio, mas os caminhos de exceção não têm feedback local. Invocar: handleSubmit também não captura exceções de criação manual. São achados de código; não houve reprodução em navegador ou correção desses módulos no F3. Priorizar preservação de campos e feedback de falha sem mudar contratos. Fluxo IA/Supabase, consentimento e credenciais não foram alterados.

## F4 — falhas e confirmação local de criação (0.1.79 · 27/10/2026)

Escopo sequencial: Forja e criação manual de Invocar. Tratamento de exceções nos comandos existentes, sem modificar stores, payloads de domínio, pontuação ou o fluxo de IA. Mantida a identidade visual; mensagens acessíveis com `role=alert` junto ao formulário/diálogo. Erros de edição agora também são apresentados, antes restritos ao ramo de classificação/exclusão.

- Forja: captura confere ID criado no estado local antes de limpar os campos. Editar confere os valores salvos; excluir confere remoção; classificar confere ID no destino e ausência do rascunho. Erros mantêm os valores, não geram recibo e não fecham deliberadamente o diálogo. Mensagem anterior de sucesso é removida ao iniciar outro comando.
- Se o rascunho desaparecer antes de uma exceção, o diálogo já não pode referenciá-lo: o alerta fica visível na lista. Não há rollback nem nova tentativa automática. A mensagem orienta conferir o destino porque uma exceção pode ocorrer depois de uma escrita parcial; atomicidade continua responsabilidade do domínio.
- Invocar: os cinco formatos mantêm seus comandos e payloads. Confirmação requer ID retornado presente na coleção correspondente. Falha mantém campos/tipo/etapa, informa recuperação e permite nova tentativa explícita. Guarda local impede chamada repetida depois de sucesso. O fluxo de consentimento, JWT e sugestão não foi modificado nem acionado.
- Conferência local não confirma persistência durável, backup ou sincronização remota. A reserva/documentação não é garantia de preservação dos dados quando houver migração para conta.

Cinco testes novos executam handlers das páginas com hooks e store isolados: exceção, ausência de retorno, ID não registrado, sucesso, repetição, manutenção dos campos e dos parâmetros originais dos cinco formatos; falha após escrita local sem nova tentativa automática. Os ensaios iniciais falharam por seleção do formulário errado na fixture e catálogo de esforço incompleto no dublê; corrigidos os testes. Nenhum navegador ou dado pessoal foi acessado.

**Verificações finais:** 211 testes na suíte `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`; TypeScript `tsc -b`; `npm run lint`; build Vite `envDir:false` em 8,95s; todos passaram. Avisos de chunks grandes/Browserslist permanecem. SHA-256 dos stores app/workout e tipos idênticos ao início. Diff-check limpo e versão 0.1.79 sincronizada nos manifests. Revisão React/código/documental pelo coordenador, sem revisor independente.

Logs locais: `/tmp/conselho-r28f4-{tests,lint,types,build}.log`; preservação `/tmp/conselho-r28f4-preserved.json`. Sem publicação. Próximo recorte: revisar estado temporário/cancelamento ao sair ou trocar contexto em Invocar e formulários. Não considerar a matriz mobile aprovada; permanece a orientação de trabalhar somente pelo código.

## F5 — cancelamento e isolamento dos formulários (0.1.84 · 27/10/2026)

Inspeção encontrou Invocar sem fronteira de conta para seu estado temporário. A sugestão já tinha AbortController no unmount, mas não havia cancelamento explícito nem guarda de conta antes/depois das esperas. Forja já remontava por conta, porém callbacks antigos ainda podiam chamar comandos após uma troca antes do próximo render.

Invocar agora monta um workspace por identidade da conta, com chave distinta para conta local e conta nomeada. Trocar conta reinicia os campos, passo, consentimento e mensagens transitórios. Não copia conteúdo não salvo entre contas e não altera atividades já registradas. Voltar entre passos na mesma conta mantém campos manuais; limpa erro de criação antigo e cancela sugestão pendente. Cancelar sugestão interrompe a espera local e mantém título/descrição; o retorno antigo é ignorado inclusive se outra tentativa estiver em andamento. Desmontar aborta e invalida a referência da requisição. Cancelamento local não garante que o provedor interrompa trabalho já recebido.

O cliente confere a conta antes de iniciar uma sugestão, após obter sessão e após a resposta. Continua enviando somente texto/consentimento com JWT pelo fluxo I03 existente; só `addDraft` após confirmação salva a sugestão revisada. Nenhuma chamada remota foi feita nesta revisão. Verificados documentação oficial de invoke, changelog público e suporte a signal/timeout no SDK instalado; sem mudança de dependência, auth ou Edge Function.

Invocar e as quatro operações da Forja conferem a conta atual antes de chamar os comandos existentes. A revisão de Cancelar/fechar na Forja confirmou ausência de writes e reabertura a partir dos campos salvos. Rascunhos de edição cancelados são descartados como antes; erros mantêm os campos. Sair da rota ainda descarta formulário não salvo: não foi criada persistência paralela, autosave ou bloqueio global de navegação.

Seis testes novos exercitam handlers reais da página com dublês isolados de store, React e cliente Supabase, incluindo promises controladas: cancelamento antes/depois da sessão, resposta antiga durante retry, Voltar, desmontagem, troca de conta antes do render, consentimento zerado, callbacks obsoletos e Cancelar nos três diálogos da Forja. Teste de payload mínimo/JWT fictício confirma ausência de gravação até confirmação explícita; não prova autorização real do backend. As cinco regressões anteriores de criação/erro continuam cobertas.

**Verificado nesta rodada:** 249 testes passaram (`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`), TypeScript e lint passaram; build Vite com `envDir:false` passou em **58,49s**. Avisos de bundle/Browserslist permanecem. Versões sincronizadas e diff-check limpo. Cinco arquivos de core preservados (appStore, workoutStore, tipos, task-rewards e achievement-completion). Logs `/tmp/conselho-r28f5-{tests,types,lint,build}.log`. SHA-256 antes/depois: `/tmp/conselho-r28f5-core-before.json`. Revisão de código/React/documentação sequencial pelo coordenador. Nenhum dado pessoal, secret, migração, commit, push ou deploy. QA mobile permanece pendente, assim como aplicação observada do XP retroativo pessoal.

Próximo: R25-A, inventário e exportação/restauração validável do progresso local, antes da associação de conta R25-B. O isolamento do formulário desta rodada não resolve migração/sincronização de dados. Executar matriz mobile quando a inspeção estiver disponível; não considerar R28 encerrado.
