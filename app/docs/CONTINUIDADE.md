# Retomada vigente — P01 / 0.1.21, 10/10/2026

## UI04 — Editor de template de treino (em revisão)

Pedido: preservar todas as telas e prosseguir com o primeiro ponto da proposta (catálogo/editor). Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; base `55d3e17 navbar`. Contratos lidos: `02-Platform-Architecture/01-Core-vs-Native-Modules.md` e `01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md`. O formulário existente agora aceita editar template planejado na rota ativa `/treinos` (`pages/fitness/WorkoutSelect.tsx`) e no Hub alternativo (`pages/WorkoutHub.tsx`), manter exercício/plano IDs, configurar cada série individualmente (repetições inteiras ou isometria inteira em segundos, carga, descanso e fator canônico), adicionar/remover séries e programar data; templates com exercício ausente no catálogo ficam bloqueados para preservar dados. A projeção mostra ER e `base_value` com fatores 0.8/1.0/1.5, sem anunciar XP/Prana concedidos. Campo opcional `loadFactor` é normalizado para 1.0 em planos antigos e copiado ao snapshot da série iniciada. Impacto Frontend: editor e projeção no Módulo de Treino. Impacto Core/Backend: contrato de planejamento/snapshot estendido sem mudança nas fórmulas, recompensa, adapter, recorrência ou persistência remota; o fluxo atual de pontuação continua separado e a integração canônica segue pendente. Todas as páginas e rotas anteriores foram mantidas. Também foi corrigida a ordem do alias `FitnessModuleFab` que causava TDZ no HEAD `55d3e17`. Skill aplicada: `app/.agents/skills/frontend-design/SKILL.md`; direção manteve Inter, canvas escuro, grafite e violeta existentes. `git diff --check` passou. Testes, build, lint e verificação visual não executados; regressão de leitura dos dados persistidos antigos pendente antes de aceitar o campo opcional.

## App Shell / Fitness — implementação local pendente de revisão visual (10/10/2026)

Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; perfil explícito Matheus/fullstack. Implementado shell global com quatro destinos fixos (Santuário, Ciclos, Pilares, Mais), e FitnessPageShell agora preserva navegação global mesmo em páginas focadas. Antiga barra inferior Fitness removida: o componente compatível renderiza top tabs Treinos/Histórico/Saúde; ação Criar treino é FAB nas telas de hub/dashboard. `hideNav` não suprime mais a navegação global. Arquivos de layout e páginas Fitness alterados; sem mudança em stores/contratos.

Verificações executadas em 10/10: `npm run build` e `npm run lint` passaram; `git diff --check` passou. Nenhum teste visual de navegador executado. Próximo: revisar 360/390/768px e desktop, conferir posicionamento de FAB e barra global nas rotas Fitness e atualizar fila com resultado. Não houve bump, commit, push ou deploy.

Astro Boy/Sol médio. Fábio autorizou publicar o estado acumulado em Matheuscroft/ConselhoElemental-main e preparar a colaboração de Matheus/backend/documentação. Regras raiz para Codex/Cursor/Claude, oito skills portáveis, perfil explícito local e roteiro inicial implementados. Matheus configura `node app/scripts/astro-boy.mjs setup --name Matheus --role backend` na raiz; depois pede ao agente da IDE para continuar. Perfil ignorado, sem IP. Fábio/frontend usa seu próprio perfil.

Pastas inventariadas por astro:audit; plugin dev sem uso removido com 99 pacotes do lockfile, sem atualizar outras dependências. Metadados macOS removidos; assets/páginas/contratos preservados. Build/lint/astro:test e sete testes Deno com mocks passaram; cópia limpa instalou 482 pacotes com npm ci --ignore-scripts, build/astro:test e presença das oito skills/regras/docs conferidos. Zero erros de lint, quatro avisos anteriores. npm audit e limites de performance em AUDITORIA-PUBLICACAO. Não houve novo teste visual neste lote.

Próximo de Matheus: ler auditoria core e escolher teste de execução/reversão/idempotência na fila antes de alterar regra. Próximo de Fábio: revisão visual Fitness e edição de planos em lote próprio. I04 remoto segue pendente; muscle split é estimativa, atividade física continua Terra conforme contrato atual. Publicação confirmada em main: push sem force 03f0588 → 4f180f9 aceito pelo GitHub em 10/10/2026. Este registro documental encerra P01; conferir git fetch/log ao retomar. IDE de Matheus ainda precisa comprovar carregamento das regras; não alegar ativação universal automática.

---

# Retomada vigente — M01 / 0.1.20, 10/10/2026

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; Astro Boy/Sol médio. Pedido das oito imagens: contexto específico dos esportes, ficha/preview/execução coerentes, registro real de esforço/tempo e distribuição/recompensas. Implementação descrita em [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md). 21 modelos nativos adicionados sem substituir catálogo legado; sete artes, contexto filtrado, registro de tempo ativo/esforço/distância/notas e perfil muscular editável. Fluxo visual unificado; histórico não recalculado, snapshots v2 novos e ledger idempotente. Física permanece Terra; não afirmar pontos automáticos dos quatro elementos ou medição exata de músculos.

Próximo: revisão do usuário do fluxo; eventual integração elemental via áreas/ações canônicas deve ser lote próprio, após resolver divergência de adapter registrada. Sem GPS/IA clínica ou texto transformado em ativação muscular. UI de edição de treino continua lote futuro. Servidor 5174; sem commit/push/deploy. Evidências atuais em fitness-modalities-20261010; verificar encerramento M01 na fila. Não usar as capturas históricas como aprovação atual.

---

# Retomada vigente — UI03 / 0.1.19

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Astro Boy/Sol médio; usuário pediu melhorar formulário Criar treino (captura 23.28.14). Reformulação local de CreateWorkoutDialog.tsx e create-workout.css concluída, mantendo store e contratos. Campos consistentes, seleção/configuração clara, catálogo e ação final visível. Corrigida substituição de valores numéricos; calendário localizado e foco de fechamento restaurado.

Evidências em conselheiro-backups/fitness-create-20261009 e STATUS-FRONTEND-FITNESS: mobile 360/390, tablet 768; busca/filtros/remoção, salvar data/duas séries, foco e fluxo de treino temporário até histórico. Sem commit/push/deploy. Servidor 5174 mantido; próximo: revisão deste formulário e depois preview/edição. Nenhuma troca de modelo ou instalação necessária.

---

# Ponto de retomada vigente — UI02-B, 09/10/2026

Checkout efetivo: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; versão 0.1.18, alterações locais preservadas. Modelo Sol 6.1 médio confirmado; nenhuma troca. Seis ícones da captura original e modalidades portuguesas entregues em Escolher treino; Calistenia usa Core Training. Novas categorias conectadas ao planejamento existente, sem sensores/exercícios inventados.

Build/lint, seleção em 360/390/768, categorias no formulário e fluxo Yoga de um exercício/série em 390 passaram; evidência externa fitness-icons-20261009 e STATUS-FRONTEND-FITNESS. Sem commit/push/deploy. Servidor 5174 mantido. Próximo: usuário revisar seleção; depois preview/criação/edição, preservando IDs/configurações e dados. Seis modalidades agora autorizadas explicitamente; notas anteriores limitando duas são históricas.

---

# Continuidade — leia ao retomar

Atualização: 09/10/2026, America/Recife. Coordenação: Astro Boy; custódia: Versionamento e documentação.

## Estado operacional

Checkout principal: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Fila única: [FILA-ENTREGAS.md](FILA-ENTREGAS.md). HEAD observado: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`; alterações locais presentes. Versão 0.1.15 após I03, aceito como protótipo local com mocks. O worktree e2b6 está em 0.1.12 e não deve sobrescrever produto ou fila desta pasta.

C00 já aceita; C01 (manual/dossiê/custódia) agora integrado com preservação das instruções existentes. C02 acrescenta [política de modelos](POLITICA-MODELOS.md). Cinco skills locais conferidas: frontend-design, web-design-guidelines, composition-patterns, webapp-testing, improve-animations. Nenhuma instalação necessária nesta etapa.

I01: executor anterior ocioso, último turno falhou por limite de uso, conforme consulta atual de status Codex. A correção CSS e versão 0.1.13 estavam presentes antes desta continuação. Reteste atribuído a `/root/validacao_i01`, Sol/médio; apenas STATUS-SANTUARIO e artefatos externos reservados. Não editar produto em paralelo. Evidências em `/tmp/conselho-i01-20261009/`; resultado disponível no encerramento abaixo.

## Próximo passo

I04: preparar ativação com conta Cloudflare/Supabase, token restrito no servidor, quota e escopo de deployment; não pedir segredo na conversa nem presumir autorização remota. Configuração documentada em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). I03 não prova chamada real. I02 e D01/D02/D03 já aceitos nos escopos registrados; V02 segue parcial. Chat principal: Sol médio, troca confirmada pelo usuário. Planejamento curto pode usar Luna baixo; ativação/Auth e teste real recomendam Sol médio. As seções abaixo preservam a história; o encerramento mais recente prevalece.

## Rotina obrigatória

Ler AGENTS.md, índice canônico, este arquivo e item vigente da fila. Conferir checkout, versão, diff, dono e evidências antes de agir. Atualizar este ponto ao iniciar/interromper/transferir/concluir lote; registrar próximo passo, bloqueios e testes não executados. Se documento necessário faltar, criá-lo com fontes e lacunas explícitas. Não criar filas concorrentes.

O [manual](MANUAL-ENGENHARIA.md) orienta execução; o [dossiê](DOSSIE-TECNICO.md) registra origem e escopo; o [responsável documental](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md) mantém versões e continuidade. Relatos históricos desses arquivos distinguem o worktree onde foram produzidos da integração atual. Arquivos não garantem execução contínua ou memória infalível.

## Último resultado e retomada

C01/C02 consolidados. I01 retestado e critérios delimitados aprovados em 360/390/768/1440px, 6/6 controles; build passou e lint 0 erros/4 avisos. Ver encerramento da fila e STATUS-SANTUARIO. Reservas liberadas; servidor encerrado. Próximo trabalho: despachar V02 (Fitness) com escopo e perfil temporário, preferencialmente Sol/médio. D01/D02 e fidelidade visual integral continuam pendentes.

## Preferência e V02 em andamento

Usuário selecionou chat principal em Luna leve. O coordenador avisou antes e delegou V02 ao subagente `/root/validacao_fitness` com Sol médio, adequado ao fluxo longo de navegador/estado; não houve alteração do modelo principal. Reservas: somente STATUS-FRONTEND-FITNESS.md e `/tmp/conselho-v02-20261009/`. Não iniciar trabalho concorrente nessas evidências. Próximo: aguardar relatório, revisar, liberar reserva e atualizar fila. Para novas etapas complexas, informar modelo/esforço ao usuário antes da delegação quando a ferramenta não puder alterar o chat atual.

## Atualização V02/I02 — 09/10/2026

V02 parcialmente aprovada. Fluxo criação → preview → sessão → série → reload → finalização → resumo/histórico passou no perfil temporário; 16 capturas em 4 larguras sem overflow/pageerror. Duas notas independentes preservadas (5 e 2 estrelas); diálogos testados sem salvar medidas. Achado reproduzido: em 360px, área do botão Concluir série interceptada pela barra fixa Congelar/Finalizar. I02 em execução por `/root/fix_v02`, Sol/médio; reserva apenas `src/pages/fitness/ActiveWorkout.tsx`; evidências `/tmp/conselho-i02-20261009/`. Após correção, retestar; depois avaliar próximo lote. Não salvar dados corporais fictícios.

## I02 — encerramento técnico em revisão, 09/10/2026

Executor `/root/fix_v02`, Sol/médio, corrigiu `src/pages/fitness/ActiveWorkout.tsx`: `mt-10` tornou-se `mt-4 min-[375px]:mt-10`. A redução de margem limita-se a larguras abaixo de 375px. Encobrimento de Concluir série pela barra fixa reproduzido antes em 360px; responsável documental não alterou produto.

Reteste informado pelo executor/coordenador: clique real, continuar sessão, reload, finalizar e histórico passaram em 360/390/768/1440px, sem overflow horizontal ou pageerrors. Artefatos em `/tmp/conselho-i02-20261009/` (verify.json, verify-390.json, scripts e capturas). Cobertura: um exercício/uma série; títulos arbitrários, múltiplas séries, todos os exercícios e fidelidade integral não certificados. V02 permanece parcial: avaliações corporais com medidas reais e histórico entre meses pendentes; notas de sessão não substituem avaliações corporais.

Custódia `/root/versionamento_documentacao`: versão 0.1.13 → 0.1.14 sincronizada em package.json, nas duas posições raiz do package-lock.json e CHANGELOG. Dependências preservadas. Lint global/build em andamento pelo coordenador no momento deste registro, sem resultado incorporado. I02 em revisão, aguardando consolidação e aceite de Astro Boy. Chat principal permanece Luna leve; I02 delegado a Sol médio.

Próxima ação: coordenador incorporar lint/build, revisar diff e decidir aceite antes de escolher próximo lote. Não ampliar correção para cenários não testados. Reservas documentais/manifests devolvidas ao coordenador após esta custódia. Sem commit/push/merge/publicação. Evidências em /tmp são temporárias.

## Encerramento I02 e próximo lote

I02 aceito após revisão do coordenador: botão Série acessível a 360px; quatro larguras verificadas no cenário delimitado. Build passou; lint 0 erros/4 avisos preexistentes; versão 0.1.14 sincronizada. Servidor de teste encerrado pelo executor. V02 continua parcial nos itens que exigem outras condições de data ou medidas corporais reais. Próximo: D01, auditoria somente leitura dos contratos core/hábitos/projetos; não há alteração de domínio autorizada. Recomendação de modelo: Sol médio por cruzar várias regras canônicas com implementação; avisar usuário antes do despacho.

## D01 em andamento

Auditoria estática dos contratos Core delegada a `/root/auditoria_core_d01` com Sol/médio. Reserva: novo `docs/AUDITORIA-CONTRATOS-CORE.md` e `/tmp/conselho-d01-20261009/`; código e outros documentos somente leitura. Objetivo é reconciliar documentação/implementação com caminhos e símbolos e propor validações, sem mudar regras. Próximo passo: revisar relatório e aceitar ou devolver lacunas; depois escolher lote funcional a partir de evidência. Chat principal segue Luna leve.

## D01 aceito; D02 em andamento

D01 aceito apenas como auditoria estática em `docs/AUDITORIA-CONTRATOS-CORE.md`. Quatro conflitos documentais continuam pendentes de decisão explícita; nenhum fluxo foi testado e nenhuma regra alterada. D02 está com `/root/auditoria_astrolabio`, Luna/baixo, para rastrear somente histórico Math.random e dados do Astrolábio. Reserva: relatório novo `docs/AUDITORIA-ASTROLABIO.md` e `/tmp/conselho-d02-20261009/`. Depois revisar. Próxima decisão de domínio requer reconciliação; não inferir regra canônica.

## D02 aceito; D03 em andamento

D02 aceito como auditoria estática; relatório `docs/AUDITORIA-ASTROLABIO.md`, script isolado não é teste de browser. D03 delegada a `/root/auditoria_assistente_d03`, Luna/baixo, para inventário do assistente no app. Somente novo `docs/AUDITORIA-ASSISTENTE.md` e `/tmp/conselho-d03-20261009/`; sem secrets. Depois revisar; escolher provider/free tier e implementar exige olhar disponibilidade, custos atuais e credenciais antes de coding. Chat principal permanece Luna leve.

## D03 aceito; D04 pesquisado

D03 relatório aceito em `docs/AUDITORIA-ASSISTENTE.md`. D04 compara provedores oficiais em `docs/DECISAO-PROVEDOR-IA.md`; Cloudflare Workers AI é candidato provisório com cota free limitada e chamadas de ferramentas, Gemini não pago não recomendado para dados pessoais, Azure é alternativa cobrada. Nenhum provedor/credencial foi habilitado. Próxima etapa proposta I03: protótipo textual mínimo em Supabase Edge Function, começando por consulta ou rascunho com confirmação e consentimento. Modelo recomendado para implementação: Sol médio; avisado antes do despacho. Skill Supabase existe em `/Users/fabioandre/.codex/plugins/cache/openai-curated-remote/supabase/1.0.0/skills/supabase/SKILL.md` e deve ser lida ao iniciar I03. Acesso a conta/secret e deploy não presumidos.

## I03 em andamento — protótipo IA no app

Implementação delimitada foi delegada a `/root/implementa_assistente_i03`, Sol/médio. A skill Supabase foi aplicada e docs atuais consultados. O executor encerrou por limite de uso antes de editar. Astro Boy confirmou no checkout principal que `Invocar.tsx` não tem mudanças e que o novo diretório/função `assistant-suggest` não existe. Reservas liberadas; I03 segue incompleta e sem testes ou bump. Retomada requer Luna → Sol/médio nesta conversa ou executor equivalente. Escopo mantido: consentir, enviar texto mínimo a Edge Function autenticada, receber sugestão e confirmar via `addDraft`; nenhuma leitura de outros dados. Sem credencial Cloudflare, chamada real não está disponível. Nenhum secret/deploy.

## I03 encerrado — protótipo local aceito, 09/10/2026

Após usuário confirmar Sol/médio, Astro Boy implementou `src/pages/Invocar.tsx`, `supabase/functions/assistant-suggest/index.ts` e `index_test.ts`. Consentimento/texto mínimo, autenticação servidor, proposta de título/descrição com schema fechado, edição e confirmação no `addDraft` existente. Sem leitura de perfil, operações remotas de domínio ou alterações em stores. Sete testes Deno passaram; build passou; lint 0 erros/4 avisos preexistentes; diff-check passou. Browser com Auth/provedor simulados, app/store reais e dados temporários criados pela UI: fluxo manual, consentimento, falhas, revisão, confirmação e reload passaram; 360/390/768/1440 sem overflow/pageerrors. Automação rola controles ao centro para evitar navegação fixa. Não certifica chamada real, acesso do provedor, hit targets em qualquer posição ou acessibilidade integral.

Custodiante `/root/versionamento_i03`, Luna/baixo, sincronizou 0.1.15 nos manifests/changelog e atualizou índice/manual/dossiê. Astro Boy revisou e aceitou somente o protótipo local; reservas liberadas. Guia [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Evidências temporárias: `/tmp/conselho-i03-20261009/` (browser.json/script/capturas, deno-test.log, build.log, lint.log). Nenhum secret foi lido/configurado, chamada live, commit/push/deploy executado. Próximo: I04 conforme seção Próximo passo.


## Retomada UI01 — 09/10/2026

Prioridade atual: concluir Treino/Saúde com o kit de Pictures/PRINT/Fitness-app. UI01 em execução sequencial por Astro Boy, começando por Corpo e silhueta. Backup e reservas na fila. Baseline atual capturado em perfil Chrome temporário (sem dados reais) em fitness-kit-20261009/before-*.png. Não confundir o worktree e2b6 antigo com produto principal 0.1.15. Próximo: editar componentes de apresentação e validar ações/responsividade; depois continuar refinamento de treinos.


## UI01 concluída — 0.1.16

Primeiro lote de Saúde entregue e validado conforme STATUS-FRONTEND-FITNESS; reservas liberadas. Versão 0.1.16 sincronizada; alterações preexistentes preservadas. Evidências e backup em /Users/fabioandre/Developer/conselheiro-backups/fitness-kit-20261009. Próxima ação exata: UI02, comparar seleção/prévia preenchidas e tratar criação/edição com contratos existentes, preservando séries individuais. Não retomar Cloudflare antes deste foco nem confundir o e2b6 antigo com checkout principal. Kit integral continua em andamento; testes de saúde preenchida/exclusão pendentes de dados reais autorizados. Servidor 5174 mantido para revisão.


## Prioridade atual: UI02-A / escolher treino

Usuário confirmou Sol 6.1 médio; foco exclusivo agora /treinos e referência 21.26.22 antes de preview/edição. Mobile/tablet; PC usa largura de tablet. UI02-A em execução, reservas na fila. Preservar duas categorias reais e todas as ações; documentar adaptações da imagem.


## UI02-A entregue — 0.1.17

Escolher treino agora segue composição da referência adaptada às duas categorias existentes. Evidências em conselheiro-backups/fitness-select-20261009 e topo de STATUS-FRONTEND-FITNESS. Modelo Sol 6.1 médio confirmado; não houve troca. Reservas liberadas. Prioridade permanece revisão/finalização desta tela antes de preview/edição. Diretriz mobile/tablet registrada no manual e roteiro; o layout tablet no PC foi aplicado à seleção, demais páginas aguardam seus lotes. Versão sincronizada, sem commit/push/deploy.

## F02 — Fitness paralelo: biblioteca e navegação (10/10/2026)

Nova raiz `/fitness`, acessada por Pilares → Terra → Exercício Físico. Fluxo original preservado nas URLs `/treinos/*`, com entrada Mais → Treino — Legado (`/treinos/legado`); removida entrada da sidebar e atalhos secundários do mapa/menu. Redirecionamentos de modalidade Yoga/Calistenia agora abrem a biblioteca. Nenhuma página original apagada.

FitnessRoot usa kit visual existente (cards, botões, catálogo, ficha de exercício), navegação global fixa e abas Treinos / Histórico / O Corpo. Histórico/Corpo reutilizam as páginas atuais em contexto embutido; o contexto suprime somente casca/abas duplicadas. A ação vazia do histórico embutido retorna à biblioteca; modo legado mantém destino original.

Aba Treinos: modalidades → Meus Treinos filtrados, Sequências que referenciam treinos da modalidade (ordem integral preservada), Catálogo real. NativeTemplateDialog configura exercícios ordenados, séries, repetições/duração, carga e fator; saveTemplate salva somente na biblioteca. Executar Agora chama startSession, com banner de sessão ativa. Registro completo da execução permanece etapa futura. Agendar/Tornar Ciclo contêm TODO Core e aviso de indisponibilidade.

Store ganhou nativeCatalog/ensureNativeCatalog: reaproveita catálogo original em cópias com UUIDv4 e legacyId, dentro da persistência nativa existente por conta; registros anteriores recebem lista vazia por fallback. Não altera histórico legado nem envia planejamento ao Core. Modalidades sem catálogo mostram estado vazio.

Verificação: TypeScript identificou erros preexistentes de contratos do Core (Habit/User/TaskItem etc.) e helper legado workout-ids; import não usado na nova raiz corrigido. Compilação global continua bloqueada. Sem testes de navegador ou aprovação visual neste lote. Não publicado.
F02: ESLint dos 14 arquivos do lote passou sem erros/avisos; diff-check passou antes do fechamento documental. Sem testes funcionais ou inspeção de navegador; confirmação de comportamento em execução ainda pendente.

## F03 — execução nativa e conclusão Core (10/10/2026)

Implementação: `/fitness/ativo/:sessionId` usa ActiveFitnessSession e o kit legado ExerciseCard/Header/StickyAction. Casca fullscreen remove Sidebar/BottomNav somente nesta rota. Séries editáveis reps ou segundos e kg; check reversível, pular/retomar, confirmação de séries pendentes, cronômetro por startedAt, retorno sem apagar sessão e botão Retomar na biblioteca. Executar Agora inicia sessão e navega. Conclusão retorna `/fitness?tab=history`, agora com nativeHistory (nome/data/duração/ER) acima do histórico legado preservado.

finishSession consolida séries concluídas e chama fitness-core-adapter antes de remover a sessão ativa. Adapter traduz sessão para completeNativeAction na appStore. Despacho Core grava Action concluída (`sourceModule=modulo_treino`, `sourceRefId=session.id`), projeção Task e um ExecutionLog com timestamp, baseValue/rawValue/teto/valor aplicado/Prana/regra. Atualiza totalScore e xp_earth em uma única mudança de estado; Action e log IDs voltam à sessão. Idempotência por referência de sessão, logs persistidos e isolados por conta; guarda de conta na conclusão. Falha mantém sessão ativa para tentativa posterior. Recompute/projeções de áreas/elementos preservam completedScore nativo; Undo remove log e reverte valores efetivamente aplicados; recompilação da mesma Action usa despacho Core.

Escopo energético explícito desta fase: folha neutra em Terra, esforço padrão 1 (sem inferência por modalidade). Core usa presença/tempo/teto canônicos, conserva valor fracionário e debita até 5 Prana, com clamp 0–100 e delta efetivo no log. Perfis anteriores sem pranaLevel recebem 100 como ponto inicial do campo novo. Fórmulas e históricos legados preservados. Não implementa ativação de Habit/Rotation, naturezas energéticas configuráveis, bônus de ressonância/fechamento diário ou sync remoto do novo ledger nesta etapa.

Verificações: ESLint dos arquivos do lote passou. TypeScript continua bloqueado pelas divergências preexistentes User/Habit/TaskItem e helper legado; a saída filtrada não apontou erros nos novos componentes/serviços/workoutStore. Sem testes funcionais ou navegador executados; integração verificada apenas por leitura/tipagem/lint, sem alegar validação ponta a ponta ou publicação. Reservas liberadas; pendente revisão visual e funcional do usuário.

## F04 — XP Terra no planejamento e no extrato (10/10/2026)

Core: projectNativeLeafReward foi extraída da conclusão já existente; preview e buildNativeCompletion usam a mesma função pura (presença, faixas de tempo, esforço padrão 1 e teto 10). Fórmula e efeitos do despacho preservados. native-reward-preview consolida targets de reps ou segundos/2 com fatores 0.8/1/1.5, baseValue ER×0.03 com mesma precisão da conclusão; store expõe previewTemplateReward. Duração estimada opcional no NativeTemplateDialog; sem estimativa, preview usa tempo zero e declara essa ausência, sem duração inventada.

FitnessRoot: badge 🌿 ~XP (Terra), emerald-100/800, rótulo de estimativa e tempo/esforço usados. Histórico destaca Ganho +XP verde e ER secundário cinza; ganho vem do ExecutionLog canônico, sem recalcular história. Log ausente (por exemplo Undo) não é apresentado como recompensa recebida.

ActiveFitnessSession: conclusão abre modal de sucesso com XP grande, ícone Terra e animação respeitando reduced-motion. Resultado concluído fica na página pai, evitando que remoção da sessão ativa cause redirect antes do feedback. Ver Histórico conclui a transição explicitamente; troca de conta não conserva extrato de outra conta. Nenhum novo despacho de recompensa no modal.

Verificações: ESLint dos seis arquivos alterados passou; sem testes funcionais/navegador executados. Compilação global permanece limitada pelas divergências anteriormente documentadas. Sem publicação, commit ou migração de histórico. Reservas liberadas. Próximo passo: revisão visual/funcional pelo usuário.

F04 ajuste visual solicitado: badge do template simplificado para pontuação + XP + 🌿 (ex.: 2,46 XP 🌿), removendo til e (Terra). Indicação de estimativa permanece no texto de apoio. Cálculo preservado.

## F05 — esforço global e autoestimador entregues (10/10/2026)

Auditoria: Motor já documentava ER, esforço 1–5, presença por faixa, tempo e tetos. Não havia a heurística solicitada nem default3 no formulário. Preview anterior aplicava presença/tempo quando recebia duração, mas só esforço1; diagnóstico de ignorar todos os multiplicadores não corresponde integralmente ao código. Adicionadas seções 5.4/5.5 ao Motor e seção de planejamento/feedback ao contrato de Módulos Nativos.

calculateEstimatedDuration aceita planos nativos e legados por estrutura: reps×4s ou duração exata + cada descanso + 60s após primeiro exercício; retorna CEIL(minutos), zero para lista vazia. Legacy estimateWorkoutDurationMinutes continua preservado. Formulário nativo usa cálculo derivado reativo, modo auto/manual explícito, botão de restauração automática e descanso editável. Override não muda com séries até ser removido. Novos formulários sugerem esforço3, com escolha 1–5 e preview verde ao vivo.

Tipos adicionaram esforço opcional em WorkoutTemplate/NativeWorkoutSession/WorkoutCreateInput/WorkoutUpdateInput/Workout e modo de duração no template. Store valida inteiro1–5, computa estimativa auto ao salvar e copia esforço para sessão. Entrada legada guarda o campo opcional sem trocar cálculo legado. Dados anteriores sem esforço mantêm fallback1; template antigo sem tempo passa a obter preview automático, sem reescrever registros concluídos. Duração positiva antiga é respeitada como manual.

Core: multiplicadores/caps/prana por esforço da tabela canônica, effortLevel no Adapter e no despacho/Undo-reconclusão, ruleVersion core-native-leaf-v2 somente em novos logs. Preview usa ER×0.03×presença1.5×esforço×tempo, limitado pelo cap. Mesma função Core concentra esforço/tempo/teto; flag de preview explicita presença presumida1.5. Conclusão usa presença por duração REAL, nunca estimativa. Histórico/modal continuam lendo XP do ExecutionLog; header ativo mostra esforço snapshot. Nenhum histórico recalculado.

Verificações: ESLint onze arquivos passou; diff-check passou; TypeScript global segue bloqueado pelas divergências anteriores, saída filtrada sem erros nos novos/alterados arquivos nativos. Sem testes funcionais ou navegador; não afirmar validação ponta a ponta. Reservas liberadas, sem publicação/commit. Impacto para frontend/backend: campos opcionais de esforço/modo, despacho e custo energético por esforço, detalhes canônicos atualizados.

F05 ajuste de apresentação: XP Terra exibido com uma casa decimal em cards, formulário e modal pelo formatEarthXp compartilhado. Precisão de cálculo e logs preservada.

F05 ajuste de campos: FitnessIntegerField compartilhado no planejamento e execução nativos, botões subir/descer e teclas ArrowUp/ArrowDown. Valor vazio preservado durante edição; conversão de string vazia em zero removida, zeros à esquerda normalizados. Duração inteira usa o mesmo controle. Campos obrigatórios de planejamento impedem salvar séries vazias.

## F06 — balance patch ER 0.10 (10/10/2026)

Conversão oficial centralizada em WORKOUT_ER_BASE_VALUE=0.10 (workout-balance.ts), consumida por finishSession, projectTemplateReward e helper de equivalentes de planejamento. Core continua aplicando esforço/presença/tempo/caps sobre o novo baseValue; histórico/logs concluídos preservados, sem recomputação retroativa. Cálculo legado computeSessionImpactMetrics permanece isolado conforme parallel run, não é o caminho de recompensa da sessão nativa.

Planejamento e treino ativo expõem seletor por série Leve×0.8 / Manutenção×1.0 padrão / Progressão-PR×1.5. Na execução a alteração usa logSet e entra na consolidação das séries concluídas. Carga absoluta em kg não infere intensidade. XP verde e apresentação com uma casa decimal mantidos.

Motor atualizado em 5.1/5.3/5.5 com nova constante e exemplos (prancha60s→30ER→3 baseValue; 72ER/esforço3/12min→19.44XP; força6séries×6reps×1.5→54ER→5.4baseValue→14.58XP com esforço3/10min estimados). Diagrama do contrato Native Modules atualizado. Nota de balanceamento explicita data/aplicação a previews e novas conclusões.

Verificações: ESLint dos sete arquivos de código passou; diff-check passou; buscas conferiram ausência da conversão0.03 no código de cálculo abrangido. Não executados testes funcionais, navegador ou nova compilação global (limitação anterior permanece documentada). Reservas liberadas; sem publicação/commit/migração de dados.

F06 ajuste UX: nome de cada exercício no formulário nativo agora é botão de expandir/recolher séries, com seta, contagem e aria-expanded/controls. Dados permanecem montados; campos inválidos recolhidos são reabertos ao tentar salvar.

F06 polimento: XP inteiro não exibe decimal (10 XP), fracionário mantém até uma casa (14,6 XP). Séries do planejamento agora expandem/recolhem independentemente, com resumo compacto de reps/segundos, kg quando informado, pausa e PR/Leve. Valores preservados; validação reabre campos recolhidos.

F06 ajuste do modal: criação nativa reserva 64px da navegação global mais safe-area inferior. Modal centralizado na área útil, com altura máxima e rolagem interna; overlay termina acima da barra. DialogContent aceita overlayClassName opcional, mantendo os demais modais com comportamento anterior. Sem testes funcionais ou navegador executados.

F06 polimento de séries: resumo de reps/tempo/carga/pausa exibido somente quando a série está recolhida. Aberta mantém título e campos editáveis, sem duplicar os valores no cabeçalho. Sem testes executados.

F06 navegação: selecionar Treinos no segmented control remove modalidade da URL e retorna à grade inicial, inclusive ao clicar na aba já ativa. Troca por teclado usa o mesmo reset. Fecha detalhes/formulário transitórios; biblioteca e sessão ativa preservadas. Sem testes executados.

F07 cancelamento nativo: ação discardNativeSession valida sessão/conta e remove apenas sessão ativa, sem histórico, Adapter ou recompensa. Tela ativa oferece Cancelar treino com confirmação explícita, disponível inclusive nos primeiros segundos, sem limite artificial de duração. Template preservado e retorno à biblioteca. Sem testes executados.

F08 biblioteca editável: TemplateCard mostra composição ordenada e pílulas por série (reps/tempo, kg, descanso, fator). Editar treino reutiliza NativeTemplateDialog com cópia local dos planos, nome, esforço e duração auto/manual. Salvar usa mesmo UUID via saveTemplate, preservando referências das sequências, metadados e snapshots de sessões/histórico; fechar não salva. Permite incluir/remover/reordenar exercícios e incluir/remover/editar séries. Sem testes funcionais ou navegador executados.

F08 cards recolhíveis: treinos em Meus Treinos fechados por padrão. Nome/cabeçalho alterna composição e ações, com chevron e aria-expanded/controls. Nome, contagem e XP permanecem visíveis no resumo. Sem testes executados.

F08 ação primária: Executar Agora movido para fora do conteúdo recolhível, visível com card aberto ou fechado. Guardas de sessão ativa e início nativo mantidas. Sem testes executados.

F09 espaço da execução: FitnessStickyAction informa altura real via ResizeObserver; tela ativa reserva essa altura mais 24px no fim do conteúdo. Medição inclui safe-area, dois botões e responde a mudanças de largura/tamanho. Último card pode rolar acima da barra; outros consumidores mantêm reserva anterior. Sem testes funcionais/navegador executados.

F10 navegação no topo: ScrollToTop global dentro de BrowserRouter reposiciona window antes da pintura a cada entrada de navegação (key/path/search), incluindo modalidades/abas via query e voltar/avançar. Restauração automática do navegador desativada enquanto montado; comportamento instantâneo. Sem testes funcionais/navegador executados. Alteração posterior ao commit 8d39966, ainda sem commit/push.

F11 exclusão na biblioteca: cards expandidos de Meus Treinos oferecem Excluir treino com confirmação. Usa deleteTemplate existente; remove blueprint e referências nas sequências, preservando sessão ativa, histórico e recompensas. Confirmação informa alcance antes de excluir. Sem testes executados; alteração sem commit/push.

F11 organização visual: Editar e Excluir no card expandido compartilham linha em duas colunas iguais, com ícones, labels curtas e exclusão em vermelho. Confirmação mantida. Sem testes executados.

F11 composição compacta: card aberto mostra nome e resumo por exercício (3×10 reps · minutos totais estimados incluindo pausas). Séries com valores distintos mostram média com til e até uma casa decimal. Isometria usa segundos, grupos mistos separam reps/duração. Reutiliza autoestimador por exercício sem transição; formulário de edição mantém detalhes completos. Sem testes executados.

F11 alinhamento: resumo de séries/reps/tempo sempre em linha abaixo do nome do exercício, inclusive nomes curtos. Sem testes executados.

F12 ponte planejamento→Ciclos: MakeCycleModal seleciona dias 0–6, valida seleção não vazia; WorkoutStore valida conta e delega ao Adapter. Cria Habit/Action raiz com fonte/template, ER×0.10, esforço, tempo e área Terra real do catálogo. addHabit preserva campos canônicos/fonte e neutralidade nativa. Indicador Ciclo ativo por habits e deduplicação no Adapter. Não emite recompensas, não sincroniza futuras edições, sem migração de IDs de área. Sem testes funcionais/navegador executados; sem commit/push.

F13 rich widget Fitness em Ciclos: séries inline mantidas apenas em WorkoutStore, início silencioso, edição reps/segundos/kg/fator e conclusão explícita. Restringe a hoje e sessão mesmo template/dia; outra sessão bloqueia início. Widget usa Core preview com esforço/tempo/presença/cap e XP real de ledger após concluir. finishSession(habitId)→Adapter→completeNativeAction ramo HABIT grava um único ExecutionLog, HabitCompletion e recompensa atomicamente no Core, sem Action avulsa/subtarefas nem chamada adicional de pontuação. Mantém rotação por data e snapshots nativos. Editar/Excluir navegam à confirmação/formulário do módulo via query; excluir blueprint continua preservando ciclo. Sem testes funcionais/navegador executados.

F13 verificação: ESLint dos sete arquivos executado sem erros, dois avisos preexistentes de dependências hooks em Ciclos (558/645). Diff-check passou. startSession aceita override opcional validado de esforço para snapshot do ciclo; chamadas anteriores preservam padrão. Sem testes funcionais/navegador, sem publicação.

F13 tipagem: tsc --noEmit executado; compilação global falhou nos contratos preexistentes de appStore (Habit semantic backups/startDate/sortOrder, TaskItem, User). Saída filtrada não apontou erros em FitnessHabitWidget, FitnessRoot, Adapter, native-action-completion ou workoutStore, nem no novo ramo HABIT. Não afirmar build global aprovado.

F14 sequências: WorkoutSequenceLibrary disponível na grade inicial e modalidades, criação nome/descrição/seleção e ordenação com mínimo2 templates distintos (também validado por saveSequence). Modal de dias compartilhado para template/sequence. Adapter scheduleSequenceAsRotation resolve biblioteca/conta/templates/área; helper comum projeta baseValue e duração. Core createRotationWithMembers faz gravação atômica em cycleSequences/actions/habits/sequenceMemberships com UUIDs, sourceRef e posse por rotação. Novos membros independentes de hábitos avulsos; deduplicação pela sequência. Widget já faz dispatcher de membro corrente em Ciclos. Rotação usa máquina temporal existente; divergência histórica com seção3 não reescrita. Dados anteriores preservados, sem recompensas na ativação, sem commit/push.

F14 verificações: ESLint sete arquivos passou; diff-check passou. Tsc global segue limitado pelos contratos preexistentes. Após retorno CycleSequence explícito no Adapter, saída filtrada sem erros nos novos componentes, Adapter, WorkoutStore ou operação atômica Core. Sem testes funcionais/navegador executados.

F15 histórico XP: componente NativeSessionHistory compartilhado nas rotas de histórico, consulta log por UUID/ref da sessão, snapshot earnedXp real retornado pelo Adapter e registros concluídos correlacionados (sem recalcular). Sessões futuras guardam earnedXp; antigas usam evidências Core existentes. Histórico legado mostra xpAwarded real do ledger em vez de volume quando disponível. Ausência de evidência não fabrica recompensa. Sem testes funcionais/navegador executados.

F15 diagnóstico adicional: applyDomainSnapshotToStore em supabaseCloudSync hidrata tasks/habits, sem actions ou executionLogs remotos. Resolver de histórico agora lê tasks além de actions por coreEntityId ou sourceRef sessão; hábito usa completion vinculada por logId ou timestamp exato da sessão. Valores reais finitos, inclusive zero; não recalcula XP. Esta divergência concreta explica falha possível após hidratação cloud; dados específicos do usuário não inspecionados (nenhuma aba disponível no browser conectado).

F16 histórico sem ER e sync de sequências: removido volume ER do card executado. Supabase insert de cycle_sequences admite fallback exclusivo PGRST204 da coluna is_active ausente, mantendo isActive no payload e repetindo insert sem coluna; próximos batches usam compatibilidade. Outros erros propagam. Migração aditiva20261011 adiciona coluna, restaura pausas pelo payload e solicita reloadschema. Não aplicada no banco remoto; sync não validado contra Supabase. Nenhuma exclusão de dados ou alteração de RLS nesta migração.

F17 card Core preservado: removido retorno antecipado que substituía rotação Fitness por card próprio. Motion card original mantém shell, título e passo; membro atual Fitness injeta widget embedded sem borda/card adicionais e sem ações genéricas/subtarefas. Fila usa memberships ordenados e títulos Habit; identificação apenas sourceModule do membro. Editar/Excluir e detalhes de rotações Fitness direcionam /fitness; genéricas preservadas. Widget Abrir Treino inicia/retoma sessão vinculada via coreHabitId e attachSessionToHabit validando conta/template/posse. finishSession sem argumento usa vínculo persistido, fechando hábito/rotação também pela execução fullscreen com único log/recompensa. Nenhuma migração remota, teste funcional/navegador ou publicação.

F18 — perda de membros: diagnóstico estático confirmou sanitizer cloud que validava apenas hábitos raiz (descartava childHabits), nomes sequence_id/habit_id divergentes da migração sequence_local_id/habit_local_id, e janela delete-all/insert com atualização cloud concorrente. Corrigido percurso recursivo, leitura compatível com ambos schemas e fallback restrito de escrita; sync agora reutiliza IDs DB via upsert, só remove obsoletos depois de todas as gravações. Auth serializa escrita, só confirma fingerprint após sucesso, bloqueia refresh com alterações pendentes e rejeita hidratação se houve edição durante fetch. Impacto compartilhado Core/Fitness: mantém memberships e ordem existentes; nenhuma mudança de pontos. Não recupera vínculos já perdidos automaticamente, não garante transação remota entre tabelas/dispositivos. ESLint dos dois arquivos passou; sem testes funcionais/cloud, migração remota ou publicação.

F19 — banco sem sequence_memberships.position: fallback limitado PGRST204 mantém ordem no payload; retries cobrem posição e nomes de referências em qualquer ordem. Migração aditiva20261011_align_sequence_membership_position criada, não aplicada remotamente. deleteCycleSequence desvincula hábitos por memberships OU controlledBySequenceId, preserva recurrenceType/config individuais e libera também actions. addHabitToSequence já não sobrescreve agenda individual; não fabrica configuração anterior. ESLint service/store passou; sem testes funcionais/Supabase/publicação.

F20 — sequência única: CycleSequence compartilhada com status/restrição/templateIds, persistência existente em payload cloud. WorkoutSequence virou DTO. Biblioteca lê Core; saveSequence grava Core sem hábitos; importação aditiva das sequências locais no primeiro acesso Fitness mantém IDs de rotações antigas e limpa coleção duplicada por conta. Ativação usa mesmo ID, reativa membros existentes sem duplicar, bloqueia substituição silenciosa de composição vinculada. Desativação UI retorna PLANNING, mantendo posse para não gerar ciclos avulsos. Ciclos oculta planejamento e oferece restrição Geral/Treinos na criação; store valida adição e ordem refs acompanha reorder/remove. Template/history locais permanecem. ESLint sem erros (2avisos preexistentes Ciclos); TypeScript filtrado sem diagnósticos dos arquivos alterados. Sem testes funcionais/cloud ou publicação. Revisão visual e migrações schema F16/F19 ainda pendentes.

F21 — widget Fitness em Ciclos: cabeçalho de hábito com checkbox (conclusão pelo fluxo nativo, exige séries realizadas), título recolhível, badge XP sem Estimativa e Executar compacto. Cada exercício tem toggle/aria e contagem; série concluída compacta checkbox/Série/reps ou segundos/kg, lápis reabre edição reps/carga/fator, sem alterar logSet/Adapter/pontos. Funciona embedded em rotações e avulso. ESLint passou; sem verificação visual/browser.

F22 — execução Fitness separada: executedClone deixava reps/segundos=0 em todas séries, e checkbox chamava início silencioso. Agora valores previstos são preservados; nativeCheckins separado/persistido por conta/hábito/dia, updateHabitCheckin/finishHabitCheckin/beginHabitWorkout. Pai sem marcações=plano integral; parcial=apenas marcadas; todas=autoconclusão, valores editados consolidam ER. Tempo CHECKIN declarado proporcional à heurística, presença máxima com tempo autorizado pelo usuário; LIVE mede desde início explícito. Logs/sessões identificam durationSource/fullCompletion; histórico mostra tempo informado. Docs distinguidas. tsc completo passou antes dos últimos campos log; ESLint passou antes deles; rerun final em andamento. Sem testes funcionais/Supabase/publicação.

F22 verificação final: tsc --noEmit completo e ESLint dos sete arquivos passaram sem saída de erros. Sem testes funcionais/browser. Reservas liberadas.

F23 — XP acumulado no widget: badge junto ao nome do treino e de cada exercício, derivado apenas de séries completed&&!skipped. projectWorkoutProgress compartilha ER/tempo declarado/Core/cap entre UI e finishHabitCheckin; LIVE usa tempo medido disponível no render. Exercícios recebem parcelas proporcionais de ER do único total limitado, sem caps individuais duplicados. Editar reps/segundos/fator recalcula badges via Zustand; nada concede XP antes da conclusão. Registro concluído usa XP real do log/snapshot, sem recreditar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F24 — badge único do treino pai: início=XP planejado, séries marcadas=acumulado/planejado, conclusão=XP real sem fração. Meta superada usa gradiente verde/dourado e Sparkles; parcial/abaixo usa âmbar, preservando valor real e tooltip/aria explicativo. Comparação na precisão exibida (1decimal) evita destaque por ruído float. XP concluído recupera também HabitCompletion real. Removido segundo badge; nenhuma mudança na pontuação ou persistência. TypeScript completo e ESLint passaram; sem validação visual/browser.

F25 — checkbox pai permite desfazer hoje: undoHabitWorkout preserva árvore/séries/valores como CHECKIN e remove histórico somente após Core aceitar undoNativeHabitCompletion. Core remove completion/log, reverte XP/Terra/Prana pelo extrato, recalcula streaks e restaura snapshot de rotação. Conclusões novas guardam coreReceipt persistido nativo; fallback após cloud valida id/fonte/hábito e completion existente, evitando reversão dupla. Antigos sem extrato têm erro explícito sem alteração. TypeScript/ESLint primeira rodada passaram; rodada final pós receipt em andamento. Sem teste funcional/cloud/publicação.

F25 final: TypeScript completo e ESLint dos seis arquivos passaram. Reservas encerradas; validação funcional/browser pendente.

F26 — widget recolhe card após autoconclusão bem-sucedida de todas as séries. Mantém badge final e checkbox; não recolhe se conclusão falhar. Sem testes executados.

F27 — conclusão widget centraliza card via scrollIntoView e exibe balão +XP real 🌿 Terra que sobe/desaparece em2s; usa resultado earnedXp, não concede pontos adicionais. Aplica conclusão pai/manual e última série, recolhe card. Respeita movimento reduzido, cancela RAF/timer no cleanup. TypeScript completo e ESLint passaram; visual/browser pendente.

F28 — balão XP via portal document.body, fixed z9999 acima dos stacking contexts dos cards; tamanho reduzido para texto14px/label10px, padding menor. Mantém animação/cleanup/movimento reduzido. Sem testes executados.

F29 — exercício recolhe automaticamente após marcar sua última série; usa resultado atualizado da store, ignora skipped e falhas. Demais exercícios mantêm estado e header permite reabrir. Sem testes executados.

F30 — checkbox por exercício marca/desmarca todas suas séries mantendo valores; reflete automaticamente todas concluídas e estado indeterminate se parcial. Mantém CHECKIN sem cronômetro ou LIVE existente, fecha exercício ao marcar tudo e conclui pai quando todos completos. Treino já registrado exige desfazer pai antes de editar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F30 ajuste de verificação: primeira rodada ESLint detectou fechamento JSX faltante; corrigido e segunda rodada aprovada. Comando tsc executado na raiz externa apenas exibiu ajuda, sem verificar projeto; repetido a partir de app.

F31 — checkbox exercício segue parcial: se não há séries marcadas, registra todas; se há algumas, preserva realizadas e marca restantes skipped. Checkbox representa exercício encerrado (séries concluídas ou puladas), indeterminate apenas com realizadas e pendências. Treino autoconclui quando todas séries estão resolvidas; ER e tempo incluem apenas realizadas pela consolidação existente. Desmarcar exercício reabre/limpa marcações, preservando valores. ESLint passou; sem teste funcional/browser.

F32 — treino concluído exibe badge âmbar nos exercícios parciais e contagem realizadas/planejadas (ex3/5 séries). Exercícios integrais mantêm verde e contagem simples. Usa séries concluídas não skipped do snapshot, sem alterar pontuação. ESLint passou; sem teste visual.

F33 — desmarcar checkbox de exercício preserva seu estado de abertura; apenas marcar concluído recolhe automaticamente. Cabeçalho continua controlando expandir/recolher. Sem testes executados.

F34 — badge âmbar/contagem parcial por exercício aparecem também durante o treino quando suas séries estão resolvidas (completed/skipped), sem aguardar conclusão pai. Sem testes executados.

F35 — cabeçalho exercício empilha badge XP sobre contagem de séries à direita, nome ocupa coluna flexível restante; checkbox e chevron preservados. Sem testes executados.

F36 — removido Concluir Treino redundante do widget Ciclos. Checkbox continua CHECKIN sem cronômetro; LIVE matching agora exige executionMode LIVE e coreHabitId exato, impedindo adotar sessão apenas por template igual. beginWorkout é chamado somente pelo botão Executar. Sessões antigas não são descartadas silenciosamente; continuam exigindo resolução explícita se ativas. Sem testes funcionais/browser.

F37 — fila Fitness na rotação Ciclos compacta em linha com setas entre nomes, wrap responsivo, sem números/Hoje redundantes. Membro atual verde e aria-current step; Passo no cabeçalho preservado. Sem testes executados.

Publicação F14–F37 solicitada pelo usuário: lote inclui sequências compartilhadas, proteção sync, histórico XP, CHECKIN/LIVE, reversão e refinamentos widget. Commit/push para origin/main nesta operação. Migrações SQL apenas versionadas, sem aplicação remota; validação visual pendente.
