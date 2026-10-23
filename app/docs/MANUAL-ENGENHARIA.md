# Manual de engenharia — Conselho Elemental

## Revisão e repasse — 0.1.48

O CLI usa briefingId e briefingAcknowledged para apresentar o repasse uma vez a perfis existentes. Não é daemon; a IDE executa o protocolo. Teste de onboarding usa diretórios temporários. SanctuaryRituals usa view=lista e o timer simples recusa treino/agregador. Astrolábio projeta pontos históricos disponíveis, sem classificação elemental inferida. Testes Fitness: `deno test --cached-only --config tests/deno.json tests/workout/`. [Repasse completo](REPASSE-FRONTEND-PARA-BACKEND.md) · [Evidências R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

## Quests — 0.1.47

Rituais alterna Quests/Lista via query. QuestHub compõe seleção, diálogos e timer; quest-path projeta tarefas atuais por ID e não persiste progresso. quest-commands delega criação aos métodos existentes e conclusão ao sanctuary-timer. Estados visuais reiniciam por conta; ações nativas/recorrentes mantêm seus módulos. ScrollToTop preserva somente seleções explícitas dentro de /rituais. Rodar os testes existentes e `tests/quests/*.test.mjs`; build via API Vite com envDir:false. QA de navegador ainda pendente. [Escopo, evidências e retomada R10](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

## Grimório — 0.1.46

Grimorio usa AppLayout com showAura=false e mantém getters/handlers existentes. ResourceMeter e ElementMasteryCard são apresentação. history.ts projeta registros persistidos sem estimar valores nem manter ledger; filtros usam dias locais, dados ausentes são explícitos. Estado visual reiniciado por conta; relógio de minuto apenas atualiza leitura. CSS e diálogos têm escopo próprio. Testes: `node --test tests/grimorio/*.test.mjs tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`. [Fontes, limites e QA R09](03-Project-Management/reports/R09-GRIMORIO.md).

## Cabeçalhos e composição — 0.1.45

ElementalTopBar é apresentação; TopBar mantém conta/serviços e abre AllRoutesSheet. CycleCreationForm recebe estado/callbacks, sem gravação própria. Seleção de data mantém o centro da janela; Hoje/seletor/setas controlam o reposicionamento. Santuário clássico agora é apenas redirect; página/palco/CSS exclusivos removidos. [Evidências R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

## Ciclos — 0.1.44

Visões Rotina/Sequências e filtros são estado de apresentação. ExpandedDayCard recebe data/seleção/contagens e callback existentes; só o cartão ativo mostra seus totais. Centralização rola apenas a faixa de dias, sem foco programático. ScoreHierarchyPanel aceita presentation="showcase" opt-in, sem cálculos novos. `cycle-discovery.ts` filtra a coleção pronta sem reordenar/gravar; regras e handlers continuam em Ciclos/stores existentes. Guardas de UI permitem reorganizar só na visão completa em Ordem. CSS escopado em ciclos.css e classe cycle-dialog nos portais. Testes: `node --test tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`; QA real requer liberação efetiva do navegador. [Escopo e evidências](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

## Ícones e navegação — 0.1.43

Use ArcaneIcon/ElementIcon/RouteIcon na apresentação; não substituir strings persistidas do catálogo. `label` somente quando a imagem carrega informação própria; mantenha rótulos textuais nos controles. NavigationGroup e RouteShowcase recebem destinos do APP_ROUTES existente. Não usar progressos inventados. Testes de apresentação resolvem imports locais, sem stores. [Escopo, preservação e evidências](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

## Operação temporal — 0.1.42 / 22/10/2026

TemporalLayout mantém AppLayout/tick e reúne as seis abas. `useLiveDate` é apenas relógio de apresentação; não usar para pontuação. Lua carrega Three.js sob demanda e assets locais com créditos; `getMoonPhase` legado não foi substituído. Estações lê `getSeason`; não recalcular fronteiras como efeito de layout. Meses usam query `mes=YYYY-MM`. Testes: `node --test tests/elemental/*.test.mjs tests/temporal/*.test.mjs`; não substituem navegador/WebGL. [Implementação e próximos passos](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

## Operação da home elemental — 0.1.41 / 22/10/2026

Home canônica em `/santuario`, elementos em `/santuario/elementos/:elementId`. Prévia redireciona; home clássica permanece como alternativa. TopBar em modo accountOnly reutiliza conta; SanctuaryRituals delega operações existentes com proteção por conta/ritual/sessão. Não montar AppLayout junto com a casca elemental, que já mantém o tick existente. Pilares usa os getters reais e leva às páginas elementais. [Implementação, testes e QA pendente](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md). Este registro atualiza as pendências de promoção/início/conclusão mencionadas no histórico abaixo, sem declarar paridade visual validada.


> Atualizado em 09/10/2026: o protótipo I03 do assistente está descrito em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Estado operacional e próximo passo permanecem em CONTINUIDADE.md.

Atualizado em 09/10/2026 por inspeção estática do checkout de coordenação. Escopo: operar e evoluir o app existente com segurança. Este manual não certifica fluxos, implantação, sincronização remota ou cobertura de testes.

## Tema e componentes compartilhados — 22/10/2026

Tema em `src/styles/elemental-theme.css`, importado por main após os estilos existentes; aliases Tailwind usam variáveis RGB com suporte a opacidade. Preserve os aliases e migre telas gradualmente; não altere cores/IDs no catálogo de domínio apenas por design. ElementalTimer recebe tempo formatado/callbacks e não possui relógio próprio. AppLayout, FitnessPageShell e prévia mantêm o tick existente somente quando cada casca está montada; ao mudar composição, verificar ausência de dois intervalos simultâneos. Testes `node --test tests/elemental/*.test.mjs` são locais, sem execução de browser. [Decisões e limites R04](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md). Estado vigente na continuidade; as seções datadas abaixo são histórico.

## Prévia elemental — operação local, 21/10/2026

Rotas protegidas `/previa-elemental` e `/previa-elemental/elementos/:elementId`; links antigos por query continuam compatíveis. Busca/filtro pertencem à URL, sem store adicional. Testes locais: `node --test tests/elemental/*.test.mjs`. São testes numéricos e de navegação em memória; não substituem execução do app. Build sem carregar `.env`: usar a API Vite com `envDir:false`, como registrado no [R03](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md). Inspeção via browser depende de permissão efetiva; não contornar bloqueios salvos. Antes de substituir a home, integrar seu cronômetro e ações existentes, validar paridade e matriz responsiva. Estado atual fica na continuidade/fila.

## Fontes e ordem de consulta

Após a reestruturação de 11/10/2026, o alinhamento do plano fica em 03-Project-Management/reports/BASE-CANONICA-E-EVOLUCAO.md. O changelog vigente fica em 03-Project-Management/fitness/CHANGELOG.md; CONTINUIDADE.md registra a versão atual. Referências posteriores a docs/CHANGELOG.md e BASE-CANONICA-E-EVOLUCAO.md na raiz são históricas.

AGENTS.md define as instruções locais. COORDENACAO-AGENTES.md e FILA-ENTREGAS.md definem atribuição, reserva de arquivos e aceite. BASE-CANONICA-E-EVOLUCAO.md conecta o app à referência principal `/Users/fabioandre/Developer/docs-conselho-master/README.md`. Consultar esse índice antes dos capítulos de domínio, plataforma e ADRs pertinentes. O dossiê técnico e o registro de continuidade indicados no índice local complementam a retomada; não substituem esses contratos nem o estado atual do código.

A visão canônica é gestão pessoal gamificada com Terra, Fogo, Água e Ar. A camada visual deve preservar conteúdos, core, progressão e funcionalidades. Não criar pontuação, hábitos ou persistência paralelos para acomodar uma reformulação. As inconsistências de histórico/reversão, presença, rotação e valores decimais registradas na base canônica exigem reconciliação antes de mudanças de regra.

## Mapa prático do código

| Local | Uso observado e cautela |
|---|---|
| src/main.tsx e src/App.tsx | Entrada e rotas React. App inicializa auth, aplica proteção condicional e direciona a raiz para /santuario. Conferir a importação efetiva antes de editar páginas homônimas. |
| src/pages/ e src/pages/fitness/ | Experiências do produto. Rotas /treinos importam as páginas fitness; existem arquivos de treino também na raiz de pages. Não inferir código ativo pelo nome. |
| src/pages/temporal/ | Páginas de semana, mês, ano e calendário registradas no roteador. |
| src/components/ | Componentes compartilhados e por domínio. Layout, componentes UI e CSS podem afetar várias rotas. |
| src/stores/appStore.ts, workoutStore.ts e authStore.ts | Pontos de entrada do estado de aplicação, treino e autenticação. Mudanças exigem rastrear consumidores e persistência, não apenas o componente visível. |
| src/types/, src/constants/ e src/lib/ | Tipos, catálogos e funções auxiliares. Existem helpers específicos de treino, Fitness e temporal. Preservar IDs e contratos existentes. |
| src/services/ | Serviços de integração presentes. Existência de arquivo não certifica conexão, configuração ou comportamento remoto. |
| src/index.css, src/App.css e vite.config.ts | Estilos globais e configuração de build. Vite usa base / e alias @ para src. |
| scripts/optimize-yoga-images.mjs | Script ligado ao comando images:yoga; não faz parte das verificações normais de código. |
| docs/ | Contratos locais, status, fila, changelog e evidências. Relatórios anteriores têm data e escopo próprios. |

package.json declara React 19, TypeScript 5, Vite 7, Zustand 5, React Router 7, Tailwind 3 e bibliotecas de UI, movimento e 3D. Essas são famílias declaradas; conferir o lockfile/instalação antes de discutir a versão efetivamente instalada. Puppeteer aparece como dependência de desenvolvimento; isso não prova existência de suíte automatizada.

## Comandos existentes

Executar na raiz do app, confirmando checkout e estado antes de alterações.

| Comando | Propósito e limite |
|---|---|
| npm run dev | Inicia Vite para desenvolvimento. Usar a URL/porta realmente informada pelo processo; verificar isolamento dos dados antes do navegador. |
| npm run build | Executa tsc -b e vite build. Confirma compilação/build quando passa; não testa fluxos ou layout. |
| npm run lint | Executa eslint .; registrar erros e avisos, separando os preexistentes quando houver evidência. |
| npm run preview | Serve o build local existente; gerar build compatível antes de usá-lo para validar alterações. |
| npm run images:yoga | Executa otimização de imagens; usar somente em lote de imagens com arquivos reservados. |
| git status --short e git diff --check | Inspecionam alterações e erros de whitespace; não avaliam comportamento do produto. Arquivos novos precisam também de inspeção direta. |

Não existe script test no package.json inspecionado. Não anunciar npm test ou cobertura como disponíveis. Instalação de dependências não foi necessária nem executada para esta entrega; conferir runtime, lockfile e condições do ambiente antes de instalar. Não deduzir uma versão mínima de Node deste manual.

O protótipo I03 tem testes Deno próprios para `supabase/functions/assistant-suggest/index.ts`; eles usam dependências simuladas e não substituem uma chamada real ao provedor. Consulte [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md) para comandos, configuração e limites da validação.

## Ciclo de mudança segura

1. Ler o estado de continuidade e o lote da fila; confrontá-los com git status, código atual e fila operacional indicada pelo coordenador. Se houver divergência entre checkouts, registrar a origem e não substituir trabalho mais recente pelo snapshot local. Reservar arquivos com Astro Boy e preservar mudanças anteriores.
2. Ler as skills aplicáveis. Em criação/reformulação visual, frontend-design é exigida pelo projeto; verificar o arquivo no checkout, sem supor instalação compartilhada entre executores.
3. Reproduzir o problema ou delimitar a lacuna; registrar comportamento esperado conforme contrato e referência. Documentação não autoriza reescrever regras contraditórias.
4. Fazer o menor lote coerente. Para estado/dados, rastrear criação, conclusão, reversão, recarga e consumidores antes de mudar um contrato. Para UI, preservar ações, nomes acessíveis e dados existentes.
5. Executar verificações pertinentes e revisar o diff. Reportar limites; não converter teste pendente em aprovação.
6. Responsável documental consolida versão quando cabível e atualiza os documentos reservados; Astro Boy revisa, aceita e libera a reserva.

Arquivos globais, stores, tipos, manifests, lockfile e documentos de status têm um único escritor por vez. Subagentes compartilham diretório; contexto separado não protege arquivos. Não usar staging global nem reverter alterações alheias para limpar o checkout.

## Validação proporcional

Documentação isolada: conferir referências, consistência com fontes, limites declarados e whitespace. Não requer build do produto por si só. Mudanças de código: executar lint/build pertinentes e casos funcionais afetados; falhas de ambiente e falhas do produto devem ser distinguidas. Não criar testes que apenas repitam a implementação.

Frontend: capturar estados e resoluções definidos no aceite, comparar referências reais, conferir navegação, overflow, console e acessibilidade pertinente. Para Santuário, V01 pede 360/390/768px; para Fitness, V02 pede 360/390px e o ciclo preview → iniciar → continuar → série → reload → finalizar → resumo → histórico. Esse é o roteiro de referência, não o status global dos lotes. A fila local deste worktree é anterior à operacional: segundo conferência do executor de coordenação em 09/10/2026, a fila do checkout original já registra V01 executada com reprovação em 768px e I01 em execução. Consultar a fila operacional antes de repetir testes, editar arquivos ou afirmar pendências.

Dados de teste devem ser criados pela UI em perfil temporário, sem usar perfil real, IDs fictícios ou inventar saúde/GPS. Não alterar stores/backend para montar evidência. Persistência local e integração remota são verificações diferentes. Limitações de acesso, dados ou tempo são pendências explícitas.

## Versões e releases

Procedimento detalhado em [AGENTE-VERSIONAMENTO-DOCUMENTACAO.md](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md). Em 09/10/2026, os metadados de versão e topo de docs/CHANGELOG.md convergem em 0.1.12. A entrada existente descreve mudanças de Santuário; não atribuí-las ao lote documental atual.

Ao fechar código, reservar manifests/changelog, aplicar incremento coerente e sincronizado conforme auto-versionamento e revisar o diff. A versão atualizada para I03 é 0.1.15 em package.json, nas duas posições raiz do package-lock.json e no topo do changelog. O registro descreve um protótipo local delimitado; não representa release live. Não criar uma versão por subagente dentro da mesma integração.

Este manual não identifica nem valida um pipeline de publicação. Commit, tag, push, merge e deploy dependem do escopo autorizado pelo coordenador e da verificação do destino real; não estão autorizados nesta entrega. Antes de uma release, consolidar evidências, pendências e caminho de recuperação sem sobrescrever dados do usuário.

## Evidências desta edição

Foram lidos AGENTS.md, coordenação/fila/base canônica, índice e Overview canônicos, capítulo Core vs. Módulos Nativos, ADR-001, package.json, metadados iniciais do lockfile, changelog, src/App.tsx e vite.config.ts; a estrutura de fontes foi enumerada. A skill auto-versionamento foi consultada. Não foram executados build, lint, navegador, fluxos do produto ou operações remotas. Não houve alteração de versão, código ou dependências nesta edição.

Conferência adicional do executor de coordenação: a pasta principal já declara 0.1.13 nos manifests e changelog, enquanto este worktree declara 0.1.12. Consultar [CONTINUIDADE.md](CONTINUIDADE.md); não regredir versão na integração. O reteste da correção não foi confirmado nesta entrega.


## Diretriz mobile vigente — 09/10/2026

Usuário confirmou Sol 6.1 médio e priorizou Escolher treino antes das demais telas do kit. Celular primeiro, tablet adaptado; PC deve usar interface com largura de tablet. Verificações prioritárias em 360/390px e tablet; no PC conferir apenas largura limitada e funcionamento. Esta preferência prevalece sobre orientações desktop históricas dos roteiros.


## M01 — modalidades e métricas executadas, 10/10/2026

Ver [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md): armazenamento aditivo, workload v2, compatibilidade do histórico, origem dos modelos e limites de estimativas. Não somar carga percebida e kg como se fossem a mesma medida; não interpretar notas automaticamente. A divergência do adapter entre documentação e implementação é registrada, sem reescrita do core.

## P01 / 0.1.21 — operação portável

Entrada de colaboradores em [ASTRO-BOY-BOAS-VINDAS](ASTRO-BOY-BOAS-VINDAS.md); perfil local em .astro-boy, sem rastrear IP. Regras raiz AGENTS.md, CLAUDE.md e Cursor orientam primeiro comando, com fallback explícito quando a IDE não as carregar. Skills do projeto estão versionadas em .agents/skills, inclusive Astro Boy/backend/auto-versionamento. `npm run astro:status`, `astro:welcome`, `astro:test` e `astro:audit` são comandos locais reproduzíveis. Fonte de contratos portável: docs/README.md e capítulos canônicos versionados. Auditoria estrutural em AUDITORIA-PUBLICACAO.md.
