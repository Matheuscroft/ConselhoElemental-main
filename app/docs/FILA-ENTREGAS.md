## Ponto de retomada — R11 / revisão e repasse / 0.1.48 (23/10/2026)

Pedido de Fábio: revisar erros, consolidar toda a repaginação para Astro Boy e Matheus e publicar no main indicado. **Matheus continua responsável pelo backend; Fábio continua UX/UI.** [Repasse completo I03/R01–R11](REPASSE-FRONTEND-PARA-BACKEND.md). Astro Boy sequencial; branch codex/fitness-ui-integration, base f07292f; main remoto conferido igual antes da publicação. **Publicado em main:** commit `b8c51a286b311cbfcbe09d986c0236a28218f308`, push sem force e SHA remoto confirmado por `git ls-remote origin refs/heads/main` em 23/10/2026. Este encerramento documental segue em commit próprio.

**Corrigido:** quatro avisos de hooks; atalhos de rituais no Santuário; proteção/encaminhamento de treinos e agregadores fora do timer simples; gráfico aleatório do Astrolábio substituído por registros reais; fixture/expectativa de teste Fitness alinhada à regra consolidada já restaurada por Matheus. Boas-vindas/CLI agora apresentam o novo repasse uma vez por revisão mesmo em perfis antigos.

**Executado:** 92/92 testes Node, 10/10 Fitness Deno e 7/7 assistente Deno; TypeScript, lint global sem erros/avisos e build Vite envDir:false passaram. 64 arquivos protegidos idênticos e diff acumulado vazio em stores/lib/services/types/constants/Supabase. [Relatório R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

**Limites:** QA visual/fluxo real não executado pelo bloqueio salvo do navegador; testes não provam persistência remota nem ausência de qualquer bug. Avisos de chunks/Browserslist permanecem. Sem secrets, deploy, alterações de fórmulas/backend ou recálculo de histórico.

**Próximo:** Fábio segue QA/acabamento de frontend pela fila; publicação do código concluída. Matheus deve ler o repasse e conferir contratos de snapshots macro, reversão/idempotência e sincronização. Onboarding atualizado depende da IDE executar AGENTS/astro:status; não existe agente automático ao simplesmente abrir GitHub. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Histórico abaixo preservado.

## Ponto de retomada — R10 / Quests elementais / 0.1.47 (23/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. **R10 implementado localmente, em revisão; QA visual e de fluxo no navegador pendente.** Referência Figma comunitária inventariada e fluxos selecionados inspecionados. Decisão explícita do usuário: próxima etapa sugerida, com acesso livre às demais.

**Entregue:** Rituais com trilhas de quests e lista anterior acessível; compositor de Jornada/Grande Obra com etapas e capítulo inicial; seleção expansível, cronômetro existente, recibo do resultado registrado e acesso à próxima etapa. Santuário mostra próximas quests; detalhes de Jornadas/Grandes Obras abrem suas trilhas. Seleção na mesma trilha preserva rolagem. [Relatório R10, decisões e limites](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

**Executado:** 87/87 testes Node (20 novos), TypeScript, lint delimitado sem erros/avisos e build Vite com envDir:false passaram. 64 arquivos protegidos intactos; 34 funções anteriores sem JSX preservadas por AST. Entre os 298 arquivos preexistentes capturados, só Rituais/Jornadas/GrandesObras/ElementalPreview/ScrollToTop mudaram. Versões 0.1.47 sincronizadas; testes são unidade/callbacks/SSR, sem persistência real via UI.

**Limite:** bloqueio salvo de localhost continua como pendência, sem contorno; nenhuma validação visual nova foi alegada. Contagem da trilha lê tarefas atuais por ID e não altera porcentagem/conclusão/bônus macro. Cópias aninhadas e progressos antigos podem divergir; diagnóstico registrado, sem mudar domínio. Sem backend, fórmulas, secrets, deploy, commit ou push.

**Próximo:** QA isolado em 360/390/768/1440: composição, Santuário→etapa, livre seleção, timer ocupado/pausado/reload/conclusão, retorno/foco, Undo, conta e destinos Fitness/Ciclos. Pendências de R09 e demais telas permanecem; não presumir aceite visual. Reservas encerradas. Custódia documental pelo coordenador; revisão independente pendente. Histórico preservado abaixo.

## Ponto de retomada — Grimório / 0.1.46 (22/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Usuário pediu personagem coerente, status em vidro, evolução e histórico; duas capturas orientaram o redesign. **R09 implementado localmente, em revisão visual.**

**Entregue:** ficha única com corpo elemental aprovado; HP/Stamina/Prana/XP translúcidos; título, nível, sequência e recorde; métricas compactas, edição de identidade preservada, Showcases expansíveis dos quatro elementos e radar opcional. Histórico pesquisável com filtros, deduplicação de fontes existentes e ausência de valores tratada explicitamente. [Relatório R09](03-Project-Management/reports/R09-GRIMORIO.md).

**Executado:** 67/67 testes Node (18 novos), TypeScript, lint delimitado sem erros/avisos e build Vite com envDir:false passaram. 64 arquivos protegidos intactos; somente Grimorio mudou entre os arquivos de código preexistentes. Dois handlers e sete derivações anteriores idênticos por AST; HP idêntico ao AppLayout. Diff-check e versões 0.1.46 conferidos.

**Limite:** nova tentativa no navegador interno recusada pela preferência salva de localhost, mesmo após autorização humana. Sem contorno. Capturas são da versão anterior; renderização, interação real, foco e persistência via UI não validados. Histórico não inventa eventos de jornadas/obras sem registros, e não é usado para recalcular totais. Divergências preexistentes de Prana e precisão do LevelingCalculator registradas no relatório, sem correção de domínio.

**Próximo:** QA do Grimório em 360/390/768/1440, identidade, conta, recursos, expansão, filtros, paginação, Undo e virada do dia, com dados isolados após liberação efetiva. Pendências anteriores continuam na fila; não presumir aceite. Sem deploy, secrets, alteração de backend, cálculos ou dados de Matheus.

Reservas encerradas; revisão documental pelo coordenador, independente pendente. Histórico abaixo preservado.

## Ponto de retomada — cabeçalhos e composição / 0.1.45 (22/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Usuário autorizou aposentadoria da home clássica, refinamento da expansão de datas/formulários e cabeçalho comum; três capturas orientaram o lote.

**Entregue:** link/página/palco/CSS exclusivos do Santuário clássico removidos; rota antiga redireciona para a home nova. TopBar com marca, Explorar funcional e selo de conta, sem sino fictício/emoji no cabeçalho; operações de conta intactas. Calendário seleciona sem reconstruir sua janela e revela nomes reais. Criação de ciclo/sequência usa composição controlada; mobile com painel inferior; edição/detalhes refinados. Criação de ciclo volta à Rotina sem filtros ativos. [Relatório R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

**Executado:** 49/49 testes Node, TypeScript e build Vite com envDir:false passaram; diff-check limpo. Lint sem erros/dois avisos antigos de hooks. 64 arquivos de domínio intactos; 59 funções sem JSX de Ciclos idênticas, única exceção visual selectRelativeVisibleDay. Conta: diálogo byte a byte e operações preservados. Remoção somente de UI exclusiva sem consumidores; Fitness intacto.

**Próximo:** QA real de cabeçalho/conta/Explorar e Ciclos em 360/390/768/1440, seleção de data, teclado/foco/painéis, criação/edição/recorrência/execução e sequências Fitness. Bloqueio de localhost registrado anteriormente permanece sem nova tentativa ou contorno. Capturas do usuário não validam a versão final. Não presumir aceite nem repetir autorização humana já dada.

Versões 0.1.45 sincronizadas. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, backend, fórmulas, persistência, dependências, deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — redesign de Ciclos / 0.1.44 (22/10/2026)

Usuário priorizou Ciclos e enviou sete capturas mobile, pedindo calendário Expanded Cards e Showcase nas demais áreas. Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`, preservando alterações anteriores. Complemento na mesma versão 0.1.44.

**Entregue:** calendário com nove cartões expansíveis, contexto do dia e centralização horizontal; seletor completo sempre acessível; setas descritas como janelas de sete dias. Rotina/Sequências separadas, busca/filtros e guardas de reorganização; sem controles redundantes em listas vazias. Showcase de sequência, estados vazios com ação direta e evolução compacta com assets elementais. Criação de sequência em diálogo; acabamento de cartões, edição, timer e execução. [Decisões e evidências R07](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

**Preservação:** 64 arquivos protegidos idênticos; 60 funções sem JSX e 146 das 147 instruções não JSX originais de Ciclos preservadas. Única substituição nesse conjunto: efeito visual de rolagem das datas. Composição/conclusão/ordenação intactas. Sete funções e todo o bloco de estado/cálculos de ScoreHierarchyPanel intactos; apresentação Showcase opt-in somente em Ciclos. Fontes preexistentes editadas neste lote: Ciclos e apresentação de ScoreHierarchyPanel.

**Executado:** 41/41 testes Node de unidade/SSR/numéricos; TypeScript; build Vite com envDir:false (9,89 s); diff-check. Lint zero erros/dois avisos anteriores de hooks, já reproduzidos na cópia inicial. Build mantém avisos de Browserslist/chunks. Sem backend, fórmulas, persistência, dados reais, dependência nova, secrets, deploy, commit ou push.

**Limite e retomada:** capturas do usuário foram analisadas, mas não mostram este complemento final. Tentativa de acesso ao navegador interno recusada por preferência salva de 127.0.0.1:5173 mesmo após autorização humana; nenhum contorno nem segunda superfície. Próximo: QA real com dados isolados em 360/390/768/1440; expansão/rolagem de datas, virada de mês/ano, seletor, toque/teclado/foco, criação/edição/filtros, evolução, sequências, execução/pausa/reload/conclusão e Fitness. Não presumir aceite ou repetir autorização já dada.

Reservas encerradas: Ciclos, apresentação opt-in de ScoreHierarchyPanel, componentes/CSS/testes cycles, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Histórico abaixo preservado.

## Ponto de retomada — ícones e exploração transversal / 0.1.43 (22/10/2026)

Usuário aprovou visualmente a Lua e reforçou padrões Expanded/Showcase e substituição de emojis por iconografia elemental. Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Trabalho preexistente preservado; não houve nova inspeção visual da Lua pelo executor.

**Entregue:** família de 20 ícones SVG, selos elementais nos componentes compartilhados e consumidores principais, navegação lateral/mobile/Explorar e estados vazios selecionados. Menu Explorar usa grupos expansíveis; Mapa combina grupos e Showcase com destinos reais, incluindo atalhos de treino antes ocultos. Rituais/cronômetro/Showcase recebem ícones; cartões de elemento/área ganham teclado; IDs de ExpandedElements são únicos e foco deixa de trocar seleção. [Escopo e matriz por tela](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

**Preservação:** 64 arquivos de domínio idênticos por SHA-256; 114 funções nomeadas sem JSX inalteradas. Catálogo de ícones em constants e registros persistidos permanecem intactos; migração é visual. Lua anterior não editada. Ainda restam emojis/contextos especializados de Fitness, calendário e Cassino; repaginação geral segue parcial.

**Executado:** 32/32 testes Node. Lint delimitado: zero erros e dois avisos de Ciclos reproduzidos na cópia inicial. TypeScript e build Vite sem `.env` passaram; avisos de Browserslist/chunks permanecem. Versões e diff-check conferidos. Evidências no relatório R06. Testes são unidade/SSR/numéricos, não fluxo real.

**Próximo:** QA renderizado de exploração/ícones e Temporal quando a ferramenta permitir; depois badges especializados/Fitness, calendário e conteúdo de Semana/Mês. Instruções oficiais de desbloqueio fornecidas: Configurações → Browser → Agent permissions → exceção de 127.0.0.1:5173. Sem nova tentativa ou contorno, alteração de configurações ou confirmação de liberação efetiva. Não repetir a autorização já dada.

Reservas encerradas: apresentação elemental/cartões/layout, Mapa e ícones de páginas consumidoras, CSS, testes, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Sem backend, fórmulas, dados, secrets, dependência nova, deploy, commit ou push. Histórico preservado abaixo.

## Ponto de retomada — Temporal, Lua e Estações / 0.1.42 (22/10/2026)

Usuário autorizou evolução contínua de UX/UI e reforçou Expanded Cards, Showcase e Lua realista ligada ao horário. Astro Boy executou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`, preservando trabalho anterior.

**Entregue:** navegação temporal compartilhada; Lua em esfera Three.js com mapas NASA, iluminação por efemérides, atualização por minuto/retorno à aba, próximas fases e alternativa SVG; Estações com cartões expansíveis; Ano com métricas existentes e Showcase dos meses, abrindo o mês correto por URL. Hemisfério é vista de referência, não orientação exata do céu. [Escopo, fontes, decisões e limites](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

**Preservação e divergência:** 63 arquivos protegidos idênticos por SHA-256; regras/handlers de Ano e seletores/métricas de Mês preservados. `getSeason` mantém datas aproximadas. `getMoonPhase` legado continua inalterado; somente a página Lua usa Astronomy Engine já instalada e pode diferir perto das transições. Sem efeitos sobre progressão ou persistência.

**Executado:** TypeScript, 28/28 testes Node (nove novos), repetição dos nove em America/New_York e build Vite sem `.env` passaram. Lint delimitado: zero erros e dois avisos preexistentes, confirmados nas cópias iniciais. Build mantém avisos de Browserslist/chunks. Diff-check, versões, referências e paridade dos assets em public/dist conferidos. Não equivalem a teste visual ou fluxo real.

**Próximo:** QA visual de Lua/Estações/Ano em 360/390/768/1440 quando a ferramenta permitir; conferir WebGL, orientação/fallback, cartões e navegação por mês. Depois, acabamento de Semana/Mês/Calendário e acessibilidade do editor anual. Bloqueio salvo do navegador segue registrado; sem nova tentativa/contorno, screenshots ou inspeção do app. Não declarar toda a repaginação concluída nem repetir perguntas já respondidas.

Reservas encerradas: Lua/Estações, layout temporal/Ano/Mês (apresentação/navegação), novos componentes/CSS/assets/testes, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Sem alteração de backend, fórmulas, dados, secrets, dependências, deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — Santuário promovido / 0.1.41 (22/10/2026)

**Pedido vigente:** usuário aprovou substituir a home antiga pela composição elemental e continuar o refinamento de Pilares. Astro Boy executou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; trabalho anterior preservado. A promoção local foi autorizada neste pedido; não pressupõe aprovação de mudanças de domínio nem QA renderizado.

**Entregue:** `/santuario` usa a composição nova, sem faixa de prévia; links antigos redirecionam mantendo filtros. Home clássica disponível no rodapé. Conta reutiliza TopBar existente. Home integra início/abertura/pausa/retomada/conclusão de rituais com operações atuais e proteção contra sobrescrever sessão, troca de conta e repetição. Pilares passa a equilíbrio compacto + cartões expansíveis → páginas próprias, incluindo áreas personalizadas e contagens existentes. Cabeçalho e identidade mobile compactados. [Detalhes e mapa funcional](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md).

**Executado:** TypeScript, lint delimitado sem avisos, 19/19 testes Node, build Vite com `envDir:false`; passaram. Build mantém avisos de Browserslist/chunks. Comparação SHA-256: 63 arquivos de domínio intactos; hooks/handlers e diálogo de conta intactos. Diff-check, versões e links conferidos. Estes resultados são estruturais/unitários/SSR, não certificam layout, backend remoto ou fluxo real.

**Limite e retomada:** captura do usuário orientou a compactação. Sem novo acesso ou contorno ao bloqueio salvo do navegador local; sem screenshots, hitboxes, matriz 360/390/768/1440, cronômetro/troca de conta na UI ou performance. Próximo: QA visual/funcional da home e Pilares quando a ferramenta permitir; continuar acabamento por famílias R04–R08. Não repetir perguntas de identidade ou autorização já respondidas.

Reservas encerradas: App, TopBar (apresentação), navegação/controles elementais, home TSX/CSS, Pilares TSX/CSS, testes, manifests/changelog, relatório/índice/manual/dossiê e registros. Revisão documental pelo coordenador; independente pendente. Nenhuma edição de backend, stores, fórmulas, dados ou secrets; sem deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — identidade compartilhada / 0.1.40 (22/10/2026)

**Diretriz vigente:** usuário aprovou a identidade R02 para todo o app, todas as abas e detalhes, e autorizou evolução contínua de UX/UI. Nenhuma autorização para mudar backend, lógica, cálculos ou dados de Matheus. Base `f07292f`, branch `codex/fitness-ui-integration`; trabalho I03/R01–R03 preservado. Astro Boy executou/revisou sequencialmente. Início deste lote em 21/10; fechamento em 22/10, America/Recife.

**Entregue:** tema compartilhado conecta aliases mystic/Fitness à paleta aprovada; cronômetro visual reutilizável nos modais simples de Rituais/Ciclos; Expanded Cards em Pilares; Showcase em Jornadas/Grandes Obras; busca no painel Todas as páginas, acessível pelo botão Explorar da prévia. Prévia mantém `tickTimer` existente enquanto sua casca está montada. Home vigente e operações atuais preservadas. [Decisões UX, arquivos, alcance e retomada](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md).

**Evidência atual:** TypeScript passou; lint delimitado com 0 erros/2 avisos de Ciclos, confirmados também na cópia inicial. 12/12 testes Node passaram (navegação em memória, SSR/callbacks e materiais numéricos). Build Vite com `envDir:false` passou, com avisos existentes de Browserslist/chunks. SHA-256: 63 arquivos protegidos idênticos; AST: 57 handlers anteriores idênticos. Cinco pares opacos da paleta com contraste calculado acima de 4,5:1; não é auditoria renderizada. Versões 0.1.40, links novos, whitespace e diff-check conferidos no fechamento.

**Limites:** nova tentativa local foi recusada por preferência salva do navegador apesar de autorização humana; sem contorno. Não executados testes no app, screenshots, hitboxes, matriz 360/390/768/1440, pausa/reload/conclusão real ou performance. Referências públicas Scrolltide foram observadas; não equivalem a QA do produto. Base comum não significa acabamento de cada tela concluído; gráficos/cores inline/componentes específicos ainda exigem revisão. Cronômetros Fitness e execução avançada de Ciclos preservados.

**Próximo passo:** integrar início/retomada/conclusão da home nova sem sobrescrever sessão, e continuar acabamento por famílias R04–R08. Reutilizar operações, fontes de tempo e cálculos existentes; não criar outro motor. Verificar fluxo real e responsividade quando a ferramenta permitir localhost antes de promover `/santuario`. Não repetir perguntas sobre identidade visual ou autorização já respondidas. Consulta inicial: este registro → relatório R04 → fila → estado Git.

Reservas encerradas: tema/Tailwind/main, componentes elementais e testes, prévia TSX/CSS, AllRoutesSheet, apresentação de Pilares/Rituais/Ciclos/Jornadas/GrandesObras, manifests/changelog e documentação. Revisão documental pelo coordenador, independente pendente. Sem secrets, dependência nova, deploy, migração, commit ou push. Histórico preservado abaixo.

## Ponto de retomada — R03 parcial entregue (21/10/2026 / 0.1.39)

**Pedido vigente:** repaginar todo o frontend por etapas; usuário aprovou a direção R02 e autorizou avançar, mantendo integralmente backend, lógica e cálculos de Matheus. R03 implementado na prévia; home vigente preservada. Checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações I03/R01/R02 intactas. Astro Boy executou sequencialmente, sem troca automática de modelo.

**Entregue:** páginas `/previa-elemental/elementos/{fogo,ar,agua,terra}`, compatibilidade com links antigos `?elemento=`, quatro acessos fixos além do anel, busca/filtro de áreas ativas na URL, navegação de retorno e atalhos aos módulos existentes. `ScrollToTop` preserva posição somente durante filtros da mesma página elemental. Nenhuma escrita de domínio adicionada. [Arquivos, evidências e mapa de integração R03](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md).

**Executado:** TypeScript, lint delimitado, 8/8 testes Node (cinco de navegação/filtros/scroll em memória e três numéricos R02), build Vite com `envDir:false`; passaram. Browserslist/chunks grandes continuam como avisos. SHA-256 confirmou 79 arquivos protegidos idênticos à linha de base, incluindo stores, serviços, funções/migrações locais e Fitness. Diff-check, versões e referências documentais conferidos no fechamento. Isso não certifica domínio remoto, layout ou fluxo completo.

**Limite atual:** aceite da direção visual pelo usuário registrado; QA visual/interativo do executor continua pendente pela preferência salva de bloqueio do navegador local. Não houve nova tentativa nem contorno. R03 não encerra a repaginação nem promove a home.

**Próximo passo:** integrar na composição as funções já existentes da home, especialmente o ciclo do cronômetro em AppLayout e início de ritual; conferir navegação global. Preservar operações/calculadores atuais, sem criar outro relógio. Depois, matriz visual/funcional 360/390/768/1440 quando houver liberação efetiva da ferramenta; somente então promover à home e seguir R04. Não repetir perguntas de direção visual ou autorização de localhost já respondidas.

Reservas encerradas: prévia TSX/CSS, helper de navegação, ScrollToTop, App, teste, manifests/changelog, relatório R03, índice, manual/dossiê, fila e continuidade. Revisão documental pelo coordenador; independente pendente. Sem secrets, deploy, migração, commit ou push. Histórico abaixo preservado; retomada começa nesta entrada.

## R02 — efeitos sem distorção implementados (21/10/2026 / 0.1.38)

Usuário rejeitou o efeito de 0.1.37 como distorção e pediu qualidade/fluidez. Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Removidos feTurbulence/feDisplacementMap e deformações globais; assets WebP originais intactos.

Renderizador local `src/components/elemental/material-effects.ts` acrescenta uma camada Canvas 2D transparente: reflexos curvos/gotas na água, plumas ascendentes/brasas no fogo, correntes coerentes no ar e fragmentos rígidos texturizados/sombreados na terra. Ciclos com entrada/saída suave, sem aleatoriedade por frame. Mesmo relógio e rAF para efeitos/órbita, DPR até 2, ResizeObserver com cleanup. Pausa, hover/foco da trajetória, visibilidade e movimento reduzido preservados. Sem alteração de dados, progressão, rotas, assets ou stores. [Detalhes e limites](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Evidências executadas:

- `npx tsc -b` e `npx eslint src/pages/ElementalPreview.tsx src/components/elemental/material-effects.ts`: passaram após alterações finais.
- `node --test tests/elemental/material-effects.test.mjs`: 3/3. Testes numéricos com Canvas simulado, 481 instantes por material, coordenadas/radii/alpha válidos, estado de desenho balanceado, determinismo no mesmo instante, evolução temporal, limite DPR e fallback sem contexto. Não é teste de pixels, navegador, pause/resume da UI ou FPS.
- Build Vite por API com `envDir:false`: passou; avisos existentes de Browserslist/chunks grandes.
- `git diff --check`, whitespace/conflitos dos novos arquivos, três campos em 0.1.38 e ausência do filtro antigo na prévia: passaram.

Navegador: usuário declarou remover permanentemente bloqueios e autorizou acesso total. Nova tentativa pela mesma ferramenta para `/previa-elemental` foi novamente recusada por preferência salva de localhost. Autorização registrada; liberação efetiva não confirmada. Nenhum contorno por porta/browser/CDP ou renderização indireta. Não executados: inspeção visual, filmagem, screenshots, hitboxes, responsividade, compatibilidade e desempenho. A naturalidade desta revisão não está validada; não promover à home por inferência. Próximo: resolver a preferência efetiva da ferramenta e observar os quatro materiais em 360/390/768/1440, incluindo controles e movimento reduzido.

Reservas encerradas: prévia TSX/CSS, renderizador e testes, relatório R02, manifests/changelog, fila e continuidade. Revisão documental pelo coordenador; independente pendente. Sem secrets, deploy, migração, commit, push, serviço externo novo ou geração de vídeo. Catálogo de capacidades de vídeo apenas consultado, sem gasto/upload.

## R02 — materiais animados implementados (21/10/2026 / 0.1.37)

Usuário relatou apenas ar perceptivelmente animado e pediu fluidez/naturalidade em todos os elementos. Astro Boy, execução/revisão documental sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Auditoria focal confirmou terra sem animação própria e água/fogo limitados a transforms discretos; skill improve-animations usada como orientação de auditoria, com implementação explicitamente solicitada pelo usuário.

Água/fogo passam a usar deformação procedural de textura por SVG (ruído contínuo e deslocamento), com atualização máxima de 30 Hz em duas superfícies pequenas. Água adiciona ondulações; fogo, brasas ascendentes. Rocha levita rigidamente, com fragmentos independentes; ar usa duas camadas em sentidos opostos. Assets existentes mantidos. Não é simulação física de fluidos. [Detalhes e referência técnica](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Hover/foco congelam somente a trajetória para facilitar seleção; materiais seguem animados. Pausa explícita/posicionamento manual, preferência de movimento reduzido, aba oculta e saída da área visível suspendem os efeitos. Movimento reduzido remove também a deformação SVG. Nomes, alvos e destinos permanecem estáveis; heroes elementais continuam estáticos. Nenhum dado, regra, store, recurso remoto ou dependência alterado.

Verificações executadas após a alteração final: `npx tsc -b`, `npx eslint src/pages/ElementalPreview.tsx`, build Vite por API com `envDir:false`, `git diff --check`, whitespace/conflitos dos novos arquivos e três campos de versão 0.1.37 — passaram. Build mantém avisos de Browserslist/chunks grandes. Documentação MDN de filtros SVG consultada. Inspeção estática do controle de pausa/cleanup realizada; não equivale a teste de execução.

Não executados: visualização da página, avaliação de naturalidade, FPS, teste de filtros/pausa/links em navegador, screenshots ou hitboxes. Permanece o bloqueio salvo de localhost informado anteriormente; sem nova tentativa nem contorno. Próximo: após liberação efetiva, observar os quatro materiais por um ciclo completo em 360/390/768/1440, conferir pausa/retomada, hover/foco, movimento reduzido e desempenho, ajustando intensidade com base em evidência visual.

Reservas encerradas: prévia TSX/CSS, relatório de assets, manifests/changelog, fila e continuidade. Revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R02 — assets elementais integrados (21/10/2026 / 0.1.36)

Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações preexistentes preservadas. Usuário pediu água pulsante, terra sólida/realista, ar em esfera espiral inspirada no Rasengan e fogo em bola de chama viva. Quatro artes próprias geradas pela ferramenta integrada image_gen, inspecionadas visualmente como assets isolados, com alpha e dimensões 1254 × 1254.

Arquivos em `public/sanctuary/elements/{agua,terra,ar,fogo}-v1.webp`; cópias finais sem perda via `cwebp -lossless -exact -m 6`. Total 6.631.038 bytes, ante 9.415.564 dos PNGs (~29,6% menor). Originais mantidos na saída da ferramenta; PNGs intermediários do projeto removidos. Ainda são masters grandes, sem benchmark mobile; derivativos menores permanecem uma otimização futura. [Prompts, arquivos e limites](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Órbita usa os assets em lugar dos sigilos grandes: pulso de escala/rotação na água, espiral de ar em seis segundos, oscilação de forma/aura no fogo, rocha estável. São imagens estáticas animadas por CSS, sem simulação de fluidos/vídeo. Rótulos/alvos ficam fora das animações internas. Pausa, hover/foco, visibilidade e movimento reduzido suspendem os efeitos. Heroes elementais reutilizam as artes estáticas; sigilos pequenos e fallback de erro permanecem. Corpo, destinos, stores, medidas e regras preservados.

Verificações executadas neste lote:

- `npx tsc -b` e `npx eslint src/pages/ElementalPreview.tsx`: passaram.
- Build Vite por API com `envDir:false`: passou; avisos anteriores de Browserslist/chunks grandes.
- `sips` confirmou dimensões e alpha dos quatro PNGs e WebPs; codificação lossless concluiu nos quatro arquivos.
- Conferência SHA-256 confirmou que os quatro assets do `public` estão idênticos no `dist`; nenhuma publicação realizada.
- `git diff --check`, whitespace/conflitos nos novos arquivos e versões 0.1.36 nos três campos: passaram.

Não executados: inspeção renderizada do app, testes de pausa/fallback/links/movimento reduzido, capturas, hitboxes ou responsividade. Bloqueio salvo de localhost persiste conforme registro anterior; sem nova tentativa nem contorno. Visual das artes aprovado pelo executor, não equivale a aprovação visual/interativa da página. Próximo: após liberação efetiva, conferir 360/390/768/1440, leitura dos assets pequenos, trajetória, oclusão, seleção, pausa e carregamento.

Reservas encerradas: novos assets, prévia TSX/CSS, relatório R02, manifests/changelog e registros. Revisão documental pelo coordenador; independente pendente. Sem secrets, nova dependência, deploy, migração, commit ou push.

## R02 — anel em profundidade implementado (21/10/2026 / 0.1.35)

Usuário aprovou a direção e reforçou a referência Carousel Ring. Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Prévia pública do Scrolltide aberta e inspecionada visualmente no navegador interno (anel inclinado e sobreposição); sem consulta a conteúdo pago. [Detalhes](03-Project-Management/reports/R02-PERSONAGEM-ELEMENTAL.md).

Em `/previa-elemental`, quatro portais passam a uma órbita estreita/inclinada ao redor do corpo com escala, opacidade e ordem de camadas conforme profundidade. Corpo permanece na camada central; portais posteriores são ocultados pela silhueta. Foco eleva o alvo para leitura/seleção; setas giram 90 graus e pausam, inclusive com movimento reduzido. Pausa por mouse ocorre no portal, permitindo observar o movimento sobre o restante da cena. Navegação/dados/regra/persistência e asset anterior preservados. Sem nova geração de imagem ou dependência.

Executados: `npx tsc -b`, `npx eslint src/pages/ElementalPreview.tsx`, build Vite por API com `envDir:false`, `git diff --check`, conferência de whitespace/conflitos dos novos arquivos e paridade das três versões em 0.1.35; passaram. Build mantém avisos de Browserslist/chunks grandes. Estes resultados não verificam renderização ou interação.

A referência pública foi inspecionada; o produto local não: permanece bloqueio salvo de localhost já registrado, sem nova tentativa nem contorno. Não executados neste refinamento: screenshots do app, testes de toque/teclado, pausa/retomada, hitboxes ou responsividade. Próximo: após liberação efetiva, conferir 360/390/768/1440, oclusão frente/atrás, foco visível, setas, links, movimento reduzido e corpo inteiro. Direção aprovada pelo usuário; fidelidade visual/interativa ainda em revisão. A home vigente segue intacta.

Reservas encerradas: prévia TSX/CSS, manifests/changelog, relatório R02, fila e continuidade. Revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R02 — corpo elemental e órbita implementados; revisão visual pendente (21/10/2026 / 0.1.34)

Astro Boy, execução e revisão documental sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Pedido do usuário: substituir o boneco pela referência corporal de Treinos → Corpo, adaptada à identidade elemental, com os quatro elementos orbitando. Aplicado na composição `/previa-elemental`; home vigente e tela de medidas Fitness preservadas. Alterações I03/R01/R02 preexistentes mantidas.

Novo asset `public/sanctuary/elemental-body-v1.png`, derivado do manequim original pela ferramenta integrada image_gen, inspecionado visualmente como arte isolada. Órbita elíptica de 48 segundos, rótulos verticais, botão de pausa/retomada, suspensão por mouse/foco/toque, movimento reduzido, aba oculta e saída da área visível. A composição deixa de usar o Canvas 3D; stores, regras, medidas, inventário e destinos continuam existentes. Arte não representa equipamentos adquiridos. [Origem e prompt](03-Project-Management/reports/R02-PERSONAGEM-ELEMENTAL.md).

Verificações realmente executadas neste refinamento:

- `npx tsc -b`: passou.
- `npx eslint src/pages/ElementalPreview.tsx src/App.tsx`: passou, sem saída de erros/avisos.
- Build Vite por API com `envDir:false`: passou; avisos existentes de Browserslist desatualizado e chunks grandes. O bundle de AuraAvatar3D continua usado por outras telas; não há alegação de remoção global ou benchmark.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha`: 913 × 1723, alpha presente. Dimensões declaradas no componente correspondem ao asset.
- `git diff --check`, conferência de whitespace/conflitos nos novos arquivos e paridade das três versões em 0.1.34: passaram.

Não executados: inspeção da página, screenshots, hit tests, testes de navegação/pausa/foco/movimento reduzido ou regressão funcional nesta etapa. Permanece o bloqueio salvo de localhost informado anteriormente; nenhuma tentativa de contorná-lo. Compatibilidade estrutural pelo código/build não equivale a aceite visual.

Reservas encerradas: prévia TSX/CSS, novo asset e relatório, manifests/lockfile/changelog, fila e continuidade. Revisão documental independente pendente. Próximo: remover o bloqueio salvo do navegador e inspecionar `/previa-elemental` em 360/390/768/1440, corpo inteiro, trajetória e quatro alvos, pausa/retomada/teclado/toque, links e retorno, antes de promover à home. Sem secrets, deploy, migração, commit ou push.

## R02 — prévia implementada; validação visual bloqueada (21/10/2026)

Astro Boy, execução/revisão documental sequenciais, base `f07292f`, versão local **0.1.33**. Alterações I03/R01 preservadas. `/previa-elemental` carrega sob demanda a composição do Santuário e páginas dos elementos via `?elemento=terra|fogo|agua|ar`. Personagem existente, progressão/recursos por getters atuais, giro controlado, ficha visual de equipamentos, busca/expansão de áreas e destinos existentes. Estilos escopados; home vigente, stores, contratos e persistência não alterados.

Reservas encerradas: `src/App.tsx`, `src/pages/ElementalPreview.tsx`, `src/pages/elemental-preview.css`, manifests/lockfile, changelog, fila e continuidade. Aceite visual não concedido. Executados: TypeScript, build Vite `envDir:false`, ESLint focal, diff-check, inspeção estática e paridade das três versões. Build mantém avisos de Browserslist/chunks grandes. Sem novos testes funcionais ou capturas.

Bloqueio: navegador recusou acesso a `http://127.0.0.1:5173`; após autorização explícita do usuário, nova tentativa informou preferência salva de bloqueio. Nenhuma tentativa de contornar por outro browser, porta ou automação. Próximo: usuário remover bloqueio salvo; então conferir 360/390/768/1440, quatro portais/giro, ficha/foco, busca, áreas personalizadas, reload/voltar, movimento reduzido e ausência de escrita no perfil. Não promover a composição à home antes da avaliação. Revisão independente pendente; sem secrets, deploy, migração, commit ou push.

## R01 — diagnóstico e arquitetura da repaginação elemental (21/10/2026)

Decisão de navegação atualizada em 21/10/2026 por Astro Boy: página própria de cada elemento e retorno ao Santuário. Reserva documental encerrada após atualização deste arquivo, CONTINUIDADE.md e relatório R01; nenhum arquivo de produto alterado.

Diagnóstico e proposta documental concluídos; direção visual em revisão com o usuário. Base `f07292f`, branch `codex/fitness-ui-integration`. [Relatório R01](03-Project-Management/reports/REPAGINACAO-ELEMENTAL-2026-10.md) cobre prioridades, famílias de rotas, referências Scrolltide/X/openGym, arquitetura, Wizard e sequência R02–R08. Personagem protagonista com elementos ao redor é decisão explícita; página própria do elemento com botão para voltar ao Santuário foi confirmada explicitamente pelo usuário em 21/10/2026. Sem alteração de produto. Reservas documentais encerradas: este arquivo, `CONTINUIDADE.md`, `README.md` e relatório R01. Alterações I03 preexistentes preservadas. Auditoria de movimento por `/root/auditoria_movimento`, somente leitura; consolidação e revisão documental sequenciais por Astro Boy. Preferência informada: Astra Médio; nenhuma troca automática. Inspeções estáticas e observações de navegador discriminadas no relatório; sem novo build/lint/testes funcionais. Revisão documental independente pendente.

Sequência do programa; estado atual de R02 na entrada acima, demais lotes sem reserva:

| ID | Escopo | Dependência e aceite |
|---|---|---|
| R02 | Base visual e composição piloto — código 0.1.38 | Direção aprovada pelo usuário em 21/10; QA visual/interativo do executor pendente por bloqueio do navegador. |
| R03 | Santuário/navegação — parcial 0.1.40 em revisão | Prévia com busca global e tick existente. Faltam ações de início/retomada/conclusão e QA antes de promoção. |
| R04 | Rituais/Ciclos/Invocar/Forja — parcial 0.1.40 em revisão | Cronômetro simples e tema entregues; preservar operações e verificar UI/regressão I03 no acabamento. |
| R05 | Jornadas/Grandes Obras/Temporal — piloto parcial 0.1.40 | Showcase em listas; detalhes, Temporal, hierarquia/vínculos/datas aguardam QA/refinamento. |
| R06 | Fitness e incrementos selecionados | R02; subdividir visual, desempenho anterior, descanso e demais recursos; manter histórico/recibos. |
| R07 | Perfil, análises e superfícies restantes | R02; D01/D02 e decisão de domínio quando aplicável; nenhuma métrica fictícia. |
| R08 | Revisão transversal | Lotes migrados; matriz responsiva/acessibilidade/performance com evidência atual. |

Os detalhes e critérios estão no relatório; esta é a única fila de estados. Inventário funcional, economia de recompensas, séries especiais e importação exigem delimitação própria; não estão aprovados implicitamente como mudança de domínio.

## I03 — retomada concluída em 20/10/2026 / 0.1.32

Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`. Preferência do usuário: Astra Médio; nenhuma troca automática de modelo. Pull autorizado `git pull --ff-only origin main` integrou `fe1a8fe → f07292f` sem conflitos, partindo de árvore limpa. Matheus encerrou a restauração da recompensa consolidada e o tratamento de sessões vazias Fitness; código e decisões recebidos preservados. Não houve nova mudança de domínio.

I03 já existia e estava aceito com mocks em 09/10. A retomada confirmou consentimento explícito, corpo somente message/consent, JWT da sessão, validação Auth no gateway, proposta editável e gravação pelo `addDraft` existente. Lacuna estática corrigida: resumo final de DRAFT não mostrava o conteúdo a confirmar; agora exibe nome/descrição revisados e informa que nada foi salvo. Nenhuma store, regra, schema, função remota ou configuração Auth alterada.

Evidências desta execução:

- `deno test supabase/functions/assistant-suggest/index_test.ts`: 7/7, dependências simuladas, sem permissões de rede/secrets.
- `node tests/assistant/i03-browser.mjs`: passou, Auth/provedor simulados somente no módulo Invocar, app/store reais, perfil temporário e rede externa bloqueada. Consentimento, payload mínimo/JWT de fixture, sugestão/etapa de revisão sem gravação, edição, confirmação/addDraft/reload, falhas 401/429/503/502/resposta incompleta/sessão ausente e fallback manual. Snapshots de user/tasks/habits/projects/quests/executionLogs preservados. Zero page errors. Sem overflow do resumo em 360/390/768px; captura 390 inspecionada visualmente. Artefatos: `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-i03-PlxdcC`. Tentativas iniciais corrigiram seletores da automação (cartão, resumo e botão homônimo da sidebar); não eram falhas adicionais do produto.
- TypeScript `npx tsc -b` e build Vite por API com `envDir:false` aprovados; arquivos .env não carregados. Build avisa Browserslist/chunks grandes. Lint: 0 erros / 4 avisos em Ciclos/Temporal. `git diff --check` e paridade das três versões passaram.
- Skill Supabase e documentação oficial Auth/changelog consultadas. Aviso TLS/CBC publicado em 12/10 trata clientes antigos; não requer modificação deste handler local. Sem teste de compatibilidade TLS remota.

Reservas de Invocar, teste, manifests/changelog, guia, fila e continuidade encerradas. Versão 0.1.32 sincronizada nos três campos dos manifests e changelog vigente. Revisão documental pelo coordenador; revisão independente pendente. Sem secrets lidos/criados, deploy, migração, commit ou push. Aceite: protótipo local no escopo I03. Chamada real/Auth remoto/quotas continuam não verificados; I04 exige escopo próprio. Fitness recebido teve checagem estática/build/lint, não um novo teste funcional completo. Próximo: revisão do usuário da confirmação; manter ativação remota fora deste lote.

## F59 — concluído: integração Fitness / 0.1.31

Astro Boy, Astra Alto. Navegação canônica Treinos/Histórico/Corpo/Saúde; Hoje/Evolução/Semana recuperados e alimentados por sessões Native e legadas. Prévia Native com hero/programa/mídia/edição/início; capa compartilhada com legado. Relógio com pausa persistida, distância e notas por bloco, resumo com ritmo manual e imagens Yoga, semanas anteriores e histórico por dia. Planejar data abre editor existente. Prana lido do Core; nenhuma fórmula ou recompensa histórica recalculada. CTAs/FAB/navegação alinhados em mobile/tablet.

Aceite executado: Deno 8/8; criação/prévia/edição/início/pausa-reload/conclusão/estrelas/histórico/painel/semana/avaliação corporal em perfil temporário; distância/notas/reload e finalização parcial de corrida; FAB e descarte. 360/390/768 sem overflow, zero page errors; hit tests das ações positivos. Build aprovado; lint 0 erros/4 avisos anteriores; diff-check e versões sincronizadas. Sem publicação. Revisão documental sequencial pelo coordenador; independente pendente.

Mapa das nove referências, arquivos de evidência e limites em [CONTINUIDADE.md, F59](CONTINUIDADE.md). GPS/mapas, sensores/calorias/sono/água e widgets personalizados não tinham fonte funcional; permanecem como integrações futuras, sem simulação. Vídeo remoto válido e fluxo completo de execução legada não retestados. Reserva encerrada; revisão de Fábio é o próximo passo.

## F58 — concluído: Corpo conforme referência Fitness / 0.1.30

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration. Astro Boy executou sequencialmente, Sol 6.1 Médio informado; sem troca automática. Skills frontend-design/imagegen e orientações já lidas de testes/React/versionamento. Alterações preexistentes preservadas. Reserva encerrada: BodySilhouette, BodyMetricsCard, Corpo/FitnessRoot (cabeçalho embutido), asset public/fitness/body/mannequin-front-v1.png, manifests e docs.

Substituído SVG simplificado por manequim 3D branco com roupa esportiva neutra e fundo transparente, gerado para o projeto; ilustrativo, não adapta anatomia às medidas da pessoa. Asset 912×1724, cerca822KiB, copiado para public (origem `.codex/generated_images/.../exec-7636ee69-a984-4fa4-b088-fb6bd8438d60.png`). Composição como referência: título compacto, figura à esquerda, métricas em grade2×2 à direita, botão de avaliação mantido. Cabeçalho Meu corpo removido somente na aba embutida para evitar duplicação; standalone mantém cabeçalho. Card compartilhado com Saúde. Medidas e campos disponíveis preservados; não inventado valor de sono. Histórico, evolução do peso e outras medidas mantidos. Nenhuma alteração de store/cálculo/persistência.

Puppeteer `/tmp/f58-check.mjs`, perfil temporário separado: estado vazio, cadastro via UI de fixture explicitamente de teste (170cm/75kg/43%/20%), reload com valores intactos, imagem carregada, ausência de cabeçalho duplicado, reabertura/cancelamento do formulário. 360/390/768px: scrollWidth=viewport, zero page errors. Capturas `/tmp/f58-empty-390.png`, `/tmp/f58-body-{360,390,768}.png`;390 inspecionada visualmente. Dados do perfil real não usados nem alterados. Não testada rota Saúde visualmente nesta etapa, embora reutilize o mesmo componente. Build final passou (avisos Browserslist/chunks), lint final passou com 0 erros/4 avisos preexistentes Ciclos/Temporal, diff-check e paridade0.1.30 passaram; revisão documental independente pendente, realizada revisão sequencial pelo coordenador. Sem commit/push/deploy/migração. Próximo: revisão de Fábio e demais telas da fila; Sol 6.1 Médio permanece adequado.

## F57 — concluído: resumo completo e equilíbrio Native / 0.1.29

Astro Boy executou no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, preservando alterações anteriores. Modelo informado: Sol 6.1 Médio, sem troca automática. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Revisão documental sequencial pelo coordenador; revisão independente pendente.

Resumo Native restaura estrelas (WorkoutRating já existente, inclusive reload), detalhes de séries concluídas/puladas, RPE observado ou fallback identificado, carga/volume kg·reps, fator, mídia/notas do snapshot, perfil muscular ponderado por tempo ativo e evolução das últimas sete sessões do mesmo template. Sem perfil, mostra ausência; sem duas sessões comparáveis, mostra ponto de partida. Avaliar não altera recompensa. Casca compartilhada tem espaçamento mais compacto. Editor permite Salvar e iniciar agora; bloqueia outro início enquanto há sessão ativa, preservando opção de salvar apenas.

Diagnóstico do exemplo: 120 min eram duração manual planejada, mas três séries contabilizavam 2 min ativos estimados. Isso não autoriza conceder XP por duas horas não registradas. Além disso, uma série de 10 reps tinha metade da base de um bloco de 40s, apesar da heurística de 4s/repetição. Core block-v2 normaliza base de repetições ×2; ER canônico inalterado. Prévia do editor/biblioteca e progressão de check-ins usam o construtor/calculador Core de blocos da conclusão. Tetos por bloco preservados: segmentações diferentes ainda podem alterar o prêmio. Novos recibos identificam v2; históricos não são recalculados. Interface distingue ativo estimado/informado/misto do relógio e do planejamento. Peso absoluto não infere RPE.

Evidências executadas: build final aprovado (avisos Browserslist/chunks); lint global final 0 erros/4 avisos preexistentes Ciclos/Temporal; Deno 5/5, incluindo equivalência reps/tempo, RPE, pulados/zero e paridade preview/check-in/conclusão sem influência do tempo manual. Comando de projeção usa import-map local `@/` e `--unstable-sloppy-imports`; fixture import-map em `/tmp/f57-importmap.json`. Puppeteer `/tmp/f57-check.mjs`, perfil temporário Chrome: criar exercício próprio de musculação com imagem, salvar/iniciar, concluir, resumo +3,3 XP v2, estrelas4/reload, recibo intacto, retorno ao histórico e repetição do plano gerando gráfico; zero page errors. 360/390/768px sem overflow. Capturas `/tmp/f57-editor-390.png` e `/tmp/f57-summary-{360,390,768}.png`; editor e resumo390 inspecionados visualmente. O teste usa mídia Yoga como fixture de carregamento, não uma imagem prescrita para musculação. Vídeo real, fluxo de hábito/rotação na UI e cloud não testados neste lote; a paridade de check-in foi testada na função de projeção.

Versões 0.1.29 nos manifests/changelog. Sem commit/push/deploy ou migração remota. Próximo: avaliação de Fábio com seu treino real; para representar uma sessão longa, cadastrar todos os exercícios/séries realizados ou blocos por tempo. Manter Sol 6.1 Médio para integração/UX; etapa Astro Boy runtime permanece na fila posterior, sem serviço implementado neste lote.

# Fila única de entregas — 08/10/2026

## F56 — editor único, exercícios próprios e mídia

Implementado, versão 0.1.28. Corrigidos menu/app-routes e alias legado para FitnessRoot. Editor único prioriza exercícios, mídia, notas e data; esforço/estimativa expansíveis. Cadastro próprio persistido nos catálogos existentes da conta, sem dados musculares inventados; campos opcionais de mídia em snapshots e clone legado. Esportes por tempo usam minutos/descanso sem kg. UI em perfil temporário confirmou três entradas iguais, criação sem busca positiva, reload de exercício/template/data/imagem/vídeo, execução com imagem e conclusão XP; 360/390/768 sem overflow e zero page errors. Reprodução de vídeo real não testada. Build final passou; lint 0 erros/4 avisos anteriores; Deno 3/3; teste de Ciclismo confirmou 0,5min→30s e ausência de kg. Diff-check/paridade de versões passaram. Revisão documental independente pendente; coordenação registrou evidências. Sem migração ou mudança de fórmula de XP.

## F55 — interface única Fitness e FAB contextual

Implementado, versão 0.1.27. Terra/Mais usam FitnessRoot/editor Native compartilhados; planos antigos aparecem na biblioteca com edição compatível sem migração. Histórico/Corpo abrem a casca canônica. FAB observa Montar treino e some/volta conforme visibilidade. Execução Native mantém navegação/mídia e conclusão reconhece registro concluído antes de redirecionar, corrigindo corrida que pulava resumo. Teste UI 390px: criação/edição/executar/três séries/concluir/resumo XP/histórico; FAB hide/restore; zero page errors e sem overflow. Teste de edição legada preservou ID e séries; 360/768px sem overflow. Build final passou; lint final 0 erros/4 avisos preexistentes; diff-check e versões sincronizadas passaram. Revisão documental independente pendente por indisponibilidade; coordenador conferiu registros. Modelos Sol 6.1 Médio para implementação/arquitetura, Luna Leve para documentação simples. Próximo: revisão visual e plano de runtime Astro Boy. Regras/XP/dados anteriores preservados; compatibilidade de execução legada continua sem migração.

## F54 — histórico e conclusão unificados do Fitness (13/10/2026)

Estado: implementado, versão 0.1.26. `WorkoutHistory` reúne sessões nativas/Core e legadas numa lista cronológica, com filtros mensais e cartões acionáveis; todos abrem `WorkoutSummary`. A conclusão nativa agora navega ao mesmo resumo. A recompensa usa o recibo/Core ou ledger legado existente; nenhum XP histórico foi convertido, recalculado ou migrado. Verificação em navegador: registros de 50 XP (Core) e 11 XP (legado) abriram resumo compartilhado e mantiveram o valor; resumo mobile checado em 390px, sem overflow e com CTA visível. Build passou; lint 0 erros/4 avisos preexistentes; `git diff --check` passou. Responsável de Versionamento/Documentação indisponível; revisão do coordenador registrada, revisão independente posterior. Sem alteração de fórmula/persistência ou publicação.

## F53 — ações de continuar/iniciar/concluir no fluxo legado de treino (13/10/2026)

Estado: concluído em 13/10/2026, versão 0.1.25. Ação fixa acima da navegação inferior (64px + safe area), com espaço de rolagem para as duas barras; sessão ativa em WorkoutSelect mostra CTA “Continuar treino”; ActiveWorkout mostra “Finalizar treino” com blocos pendentes e “Concluir treino” quando todos foram processados, mantendo confirmação para sessão incompleta. Smoke Puppeteer em perfil temporário 390×844: treino corrida criado via UI, CTA “Finalizar treino” para sessão incompleta abriu confirmação, cartão de sessão reabriu mesma sessão, bloco completado com 10min/RPE5, CTA “Concluir treino” levou ao resumo; botão estava totalmente acima da navegação, toque central atingiu botão, overflow horizontal ausente e sem page errors. Build passou; lint 0 erros/4 avisos preexistentes em Ciclos/Temporal; `git diff --check` passou. Agente de Versionamento/Documentação indisponível; revisão pelo coordenador registrada em CONTINUIDADE, revisão independente fica para lote posterior. Sem alterações em XP, persistência, dados pessoais ou publicação.

## F52 — alinhamento do botão fechar na ficha de exercício (13/10/2026)

Estado: concluído em 13/10/2026, versão 0.1.24. Checkout principal, branch `codex/fitness-ui-integration`, base de trabalho `b1575e4`; outras alterações locais preservadas. Reserva F52: `src/components/workout/exercise-detail.css`, manifests/changelog Fitness, fila e continuidade. Ícone centralizado no botão X 44×44px; teste de navegador temporário 390×844 confirmou fechamento, retorno a `/treinos`, sem overflow ou erros. Build, lint focal e diff-check passaram; nenhum dado ou navegação alterado.

## F50 — sincronização e compatibilidade pós-Matheus (13/10/2026)

Estado: atualização integrada por fast-forward em b1575e4; nenhuma divergência Git foi mesclada. A branch main local e o worktree separado foram preservados. O build da base anterior passou e o recebido inicialmente acusou 156 erros TypeScript; após correções de compatibilidade, mapeamento de XP e loop de renderização, build/lint passam. Deno: 7/7; smoke de /treinos, /fitness, /treinos/painel e /treinos/historico em 360/390/768px sem overflow horizontal nem erros de página.

Pendências: revisar UI em 360/390/768px e fluxo completo; executar conclusão/reversão/histórico em perfil de teste, incluindo 0 séries concluídas (zero recompensa esperado) e pelo menos 1 série concluída (XP positivo esperado); confirmar sincronização remota só em etapa autorizada. Migrações 20261011 não aplicadas. Há diferença entre semântica/XP da referência externa e capítulos versionados neste repo, sem decisão/migração. Ver evidências, branch, versão e próximos passos em CONTINUIDADE.md, seção de 13/10/2026.

## F51 — recompensa proporcional por bloco e esforço percebido

Estado: implementação concluída e validação principal executada em 13/10/2026, versão 0.1.23; aceite funcional parcial enquanto repetição/idempotência e leitura de histórico preexistente não forem retestadas. Reserva utilizada: `src/types/workout.ts`, `src/stores/workoutStore.ts`, `src/pages/fitness/ActiveFitnessSession.tsx`, `src/lib/core/native-action-completion.ts`, `src/lib/workout/fitness-core-adapter.ts`, `src/lib/core/native-workout-reward.ts`, `src/lib/workout/native-reward-preview.ts`, `src/components/workout/NativeSessionHistory.tsx`, `tests/workout/native-workout-reward.test.ts`, documentação Core/arquitetura/modalidades, ADR-003, manifests e changelog. Preservados `ExecutionLog` único/idempotência; histórico antigo imutável. Nenhuma migração Supabase.

Validação executada: cada bloco registra RPE; volume e esforço variam XP; descanso/blocos pulados não pontuam; Core calcula XP/Prana; recibo mostra métricas. Testes Deno 3/3; smoke temporário 390×844 concluiu duas séries mistas e exibiu +85,6 XP em 10 min ativos. Build e `git diff --check` passaram; lint passou com quatro avisos fora dos arquivos F51. Repetição/idempotência e histórico preexistente precisam de reteste antes do aceite integral; reversão e sync remota permanecem fora desta etapa. Versão e docs revisadas no changelog e ADR-003.

## UI Shell — 10/10/2026

| ID | Escopo e dono | Dependências | Estado | Aceite verificável |
|---|---|---|---|---|
| UI04 | Editor de template de treino e projeção ER — Astro Boy, papel Interface | UI-SHELL; contratos canônicos ER/Adapter | em revisão | Preservar páginas/rotas atuais; ligar edição à tela realmente montada em `/treinos` (`pages/fitness/WorkoutSelect.tsx`) e ao Hub alternativo; permitir criar e editar template com exercícios ordenados e configuração individual por série (repetições ou isometria, carga, fator canônico e descanso); exibir projeção ER/base_value sem confundir com recompensa final; salvar via store existente. Corrigir alias TDZ de FitnessModuleFab identificado no HEAD. Sem nova fórmula, migração, Adapter ou exclusão de tela. Evidência: revisão estática e `git diff --check`; testes/build/lint e revisão visual ainda não executados. Campo opcional `loadFactor` exige regressão de compatibilidade antes do aceite final. |
| UI-SHELL | AppLayout/BottomNav e navegação Fitness — Astro Boy, papel Interface | Nenhuma | em revisão | Confirmar quatro itens globais na ordem Santuário/Pilares/Ciclos/Mais, acesso ao hub Mais, top tabs Treinos/Histórico/Saúde e FAB acima da navegação global; revisar 360/390/768px e desktop. Build/lint aprovados; navegador ainda pendente. Sem alteração de stores/contratos. |

Coordenação: Astro Boy. Protocolo em [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md). Donos abaixo são papéis; o coordenador registra agente concreto e reserva ao despachar. Todos os lotes futuros permanecem sem reserva e não iniciados. C00 foi aceita por Astro Boy e integrada documentalmente ao checkout original em 08/10/2026.

## Ordem proposta

| ID | Escopo e dono | Dependências | Estado | Aceite verificável |
|---|---|---|---|---|
| C00 | Coordenação e inventário atual — executor de coordenação; revisão Astro Boy | Nenhuma | aceita | Conferir três documentos novos e exceção de versionamento em .gitignore, integridade das alterações anteriores, suporte/limites declarados e evidências estáticas. Sem modificação do produto. |
| V01 | Santuário já modificado — Validação; Interface só após defeito reproduzido | C00 | parcial; defeito corrigido em I01 | Abrir em 360/390/768px; comparar com IMG_2388.jpg se disponível; registrar capturas, overflow, erros, enquadramento e interação dos seis espaços. Conferir dados reais dos stores e ausência de Canvas oculto. Se referência indisponível, fidelidade fica pendente. |
| V02 | Fitness existente — Validação | C00; V01 para execução sequencial inicial | parcial | Perfil temporário; criar treino pela UI; preview → iniciar → continuar sessão → série → reload → finalizar → resumo → histórico. Conferir duas avaliações independentes e histórico entre meses com dados permitidos, sem fabricar saúde/GPS ou modificar stores. Registrar limites de tempo/dados como pendências. Comparar 360/390px com referências e conferir nomes acessíveis dos diálogos. |
| D01 | Auditoria dos contratos core/hábitos/projetos — Regras/dados | C00 | aceita (estática) | Matriz fonte canônica × função atual × caso de verificação para folha/agregador, Check/Note, vínculos Quest/Action, presença, multi-área, histórico/reversão e rotação pausada. Explicitar quatro inconsistências já listadas na base canônica. Auditar também o HP calculado localmente em CharacterStage.tsx (70 + hábitos concluídos × 5 + bônus de sequência, limitado a 100), comparando com contratos existentes sem alterar a fórmula neste lote. Nenhuma mudança de fórmula ou migração. |
| V03 | Rituais/ciclos/projetos/jornadas/temporal — Validação | D01 | fila | Em perfil temporário, documentar criação/conclusão/reversão/reload e mudança de data com resultados esperados derivados do contrato reconciliado. Calendário externo somente se ambiente e autorização permitirem; integração remota separada de persistência local. |
| D02 | Astrolábio e camada astrológica — Regras/dados; Interface consultada | C00 | aceita (estática) | Rastrear consumidor do histórico Math.random e reproduzir comportamento; distinguir astronomia calculada, métricas de store e série simulada. Propor lote mínimo para decisão do coordenador; não substituir dados silenciosamente. |
| D03 | Assistente e adapters de módulos — Regras/dados | D01 | aceita (estática) | Localizar implementação equivalente ou registrar limites da busca para conversação, operações autenticadas/auditadas, adapters e retorno core→módulo. Separar formulário Invocar de assistente e perfil Grimório de módulo de leitura. Sem implantar integração nesta auditoria. |
| I01 | Integração do primeiro lote corretivo — Astro Boy + Validação | V01/V02 ou auditoria que comprove o defeito escolhido | aceita (Santuário delimitado) | Criar escopo concreto na própria fila antes de editar; reservar arquivos; revisar diff, executar verificações proporcionais e registrar evidências atuais. Não integrar mudanças alheias como autoria própria. Publicação/push/merge fora desta entrega. |

| I02 | Encobrimento de Concluir série — /root/fix_v02; custódia /root/versionamento_documentacao | V02 | aceita (cenário delimitado) | Reteste delimitado em quatro larguras; consolidar lint/build e aceite de Astro Boy. |

| D04 | Provedor IA — Astro Boy | D03 | aceita (pesquisa) | Comparação oficial, decisão provisória e limites em DECISAO-PROVEDOR-IA.md; sem conta/credencial conectada. |
| I03 | Sugestão de rascunho IA — Astro Boy; custódia /root/versionamento_i03 | D03/D04 | aceita (protótipo local com mocks) | Sete testes Deno; build/lint; UI com auth/provedor simulados e addDraft real; chamada live e deployment pendentes. |

Prioridade inicial (histórico): C00 → V01 → V02. D01 pode avançar em leitura paralela com V01/V02 se houver vaga; alterações em arquivos compartilhados nunca ocorrem em paralelo. I01 é uma porta de integração, não autorização para corrigir todo o backlog.

## Inventário atual por módulo

Legenda: **verificado** = presença/conexão confirmada no código nesta inspeção, não aprovação funcional; **parcial** = cobertura limitada ou lacuna explícita; **apenas documentado** = contrato encontrado na documentação, sem equivalente localizado no escopo da busca; **pendente de teste** = execução ainda necessária. As classificações podem coexistir. Evidências relativas à raiz do app, com linhas de referência em 08/10/2026; conferir novamente após mudanças.

| Módulo | Classificação e evidência atual | Pendente / fila |
|---|---|---|
| Rotas e plataforma | Verificado: React/TypeScript/Vite/Zustand em package.json; src/App.tsx:133–169 liga páginas. Scripts build/lint presentes; nenhum script test. | Não executar um teste inexistente nem interpretar dependência como integração aprovada. |
| Santuário/personagem | Verificado/parcial: src/pages/Santuario.tsx:19–21 usa CharacterStage e showAura=false; src/components/layout/AppLayout.tsx:44 deriva renderAura; CharacterStage.tsx:14–16 usa stores e getResourceSnapshot. | Pendente de teste visual e interação; docs/STATUS-SANTUARIO.md é registro anterior, não validação desta entrega. V01. |
| Core e persistência | Verificado/parcial: src/stores/appStore.ts:290–337 calcula nível/XP/sequência; :734 usa persist; :1087 e :1263 tratam concluir/desfazer tarefas. | Aderência canônica, idempotência, reversão e recuperação pendentes. Persistência local não prova sincronização remota. D01/V03. |
| Rituais/hábitos/ciclos | Verificado: src/pages/Rituais.tsx:656–688 conecta conclusão/filhos; appStore.ts:2398/:2480 cria/conclui hábitos; src/pages/Ciclos.tsx:650–654 passa tempo/data. | Rotação, agregação e reversão pendentes de teste. D01/V03. |
| Projetos e jornadas | Verificado: src/pages/GrandesObras.tsx:34; src/pages/Jornadas.tsx:36; appStore.ts:3895–3968 expõe projetos/missões. | Vínculos, exclusão e propagação não certificados. D01/V03. |
| Calendário temporal | Verificado: src/pages/temporal/TemporalCalendarPage.tsx:56–88 combina fontes; :123–129 consulta calendário externo condicionalmente. | Navegação temporal e integração externa pendentes de teste. V03. |
| Fitness/Forja | Verificado: src/App.tsx:1–8 importa pages/fitness; workoutStore.ts:909/:1057/:1183/:1302 cria/inicia/conclui série/finaliza; WorkoutSelect.tsx:154–161 oferece continuar sessão. | Fluxo, persistência, avaliações, histórico, acessibilidade e fidelidade pendentes nesta entrega. Relatos anteriores em STATUS-FRONTEND-FITNESS não foram reexecutados. V02. |
| Astronomia/Lua | Parcial: src/constants/index.ts:6 usa astronomy-engine; :165–179 calcula fase e :303 ingressos; src/pages/Lua.tsx:30 anuncia horários locais/culminação futuros. | Não tratar todo o módulo como fictício; validar cálculo e apresentação no lote D02. |
| Astrolábio | Parcial: src/pages/Astrolabio.tsx:29–52 usa Math.random no histórico; :24–27/:61–68 usa métricas do store. | Histórico simulado é achado estático concreto; impacto visual/funcional precisa reprodução. D02. |
| Modificadores astrológicos | Apenas documentado nesta inspeção: docs/01-Domain-Core/03-Astrology-Engine.md:16 especifica DailyAstroState. Busca em src por DailyAstroState/astro_modifier sem correspondência. | Ausência desses nomes não prova ausência de equivalente. D02. |
| Invocar/assistente | Formulário verificado em src/pages/Invocar.tsx:31–120. Assistente conversacional apenas documentado nesta inspeção em docs/02-Platform-Architecture/04-Integracao-LLM-e-Voz.md:36–54. | Formulário não comprova conversação/voz/ferramentas. Busca não exaustiva; D03. |
| Grimório/adapters | Parcial: src/pages/Grimorio.tsx:26–54 mostra perfil/estatísticas/radar/edição. Contrato de módulo nativo de leitura e retorno ao core está na fonte canônica. | Não declarar módulo de leitura implementado pela existência da rota. D03. |
| Demais páginas e catálogos | Presença de rotas/páginas confirmada para domínios, pilares, corpo, yoga, calistenia, estações, mapa e cassino em src/App.tsx e src/pages. | Inspeção funcional detalhada fora deste levantamento inicial; coordenador abre entrada nesta fila conforme prioridade, sem reformulação automática. |

## Registro desta entrega

Inspeção estática e leitura dos documentos canônicos; um subagente somente leitura retornou inventário ao executor. Nenhum navegador, build, lint ou fluxo de produto foi executado nesta entrega documental. Testes anteriores não foram herdados como aprovação atual.

Estado inicial preservado: docs/CHANGELOG.md, package-lock.json, package.json, src/components/layout/AppLayout.tsx, src/index.css, src/pages/Santuario.tsx modificados; .agents/, docs/STATUS-SANTUARIO.md e src/components/sanctuary/ não rastreados. Não atribuir esses arquivos a C00.

Artefatos novos de C00: AGENTS.md, docs/COORDENACAO-AGENTES.md e este arquivo. .gitignore recebeu somente !/AGENTS.md e comentário para permitir versionar as instruções. Revisão do coordenador ainda necessária; não houve publicação, push ou merge.

## Atribuições e reservas

Este registro pertence à mesma fila acima, não cria outro backlog. Checkout C00: `/Users/fabioandre/.codex/worktrees/e2b6/Conselheiro_Elemental_MAIN/app`. Base: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`. Somente Astro Boy altera atribuições durante trabalho paralelo.

| ID | Agente concreto | Checkout | Arquivos reservados | Evidências / estado da atribuição |
|---|---|---|---|---|
| C00 | Original: `01a11cf3-3e91-7d12-a254-b3dda87de94a`; revisão: `01a11cf6-15b8-7003-9c6f-2fe59c39faf1` | Checkout C00 acima | Nenhum após conclusão; escopo documental: AGENTS.md, docs/COORDENACAO-AGENTES.md, docs/FILA-ENTREGAS.md e exceção já existente em .gitignore | Aceita por Astro Boy e integrada ao checkout original; metadados e status Codex confirmaram executor anterior concluído; instruções originais integralmente mescladas |
| V01 | `01a11cf6-15b8-7003-9c6f-2fe59c39faf1` | `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app` | Nenhum após entrega | Executada; sem aceite por sobreposição em 768px; ver STATUS-SANTUARIO.md |
| V02 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D01 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado; inclui auditoria do HP local |
| V03 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D02 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D03 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| I01 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |

A revisão C00 altera somente documentação. Não executa V01, build, lint ou navegador; não modifica produto, regras ou dados. Os arquivos finais permanecem somente no worktree, sem integração no checkout original, push ou merge.

## Integração C00 e despacho V01 — 08/10/2026

C00 aceita explicitamente por Astro Boy. Documentos integrados em `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; nenhuma alteração de produto copiada. AGENTS.md original preservado integralmente e coordenação acrescentada. Exceção mínima de .gitignore aplicada. Registros anteriores descrevem a preparação no worktree e não o checkout efetivo atual.

V01 atribuído ao agente Codex `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`, no checkout original acima. Reservas: somente `docs/FILA-ENTREGAS.md` e `docs/STATUS-SANTUARIO.md`; capturas e evidências em `/tmp/conselho-v01-20261008/`. Produto somente leitura. Skills disponíveis na pasta original; nenhuma copiada.

## Resultado V01 e próximo lote

Validação concluída no checkout original, evidências em `/tmp/conselho-v01-20261008/` e detalhes em `docs/STATUS-SANTUARIO.md`. Em 360/390px: seis controles funcionais, sem overflow. Em 768px: colunas de equipamento sobrepostas, três cliques acionam o controle errado; V01 bloqueada para aceite até correção e reteste. Nas três larguras: 1 Canvas visível, nenhum Canvas fora do palco; sem erros capturados. Navegação para Rituais desmonta Canvas e retorno remonta. Referência IMG_2388.jpg disponível e comparada; equivalência visual integral não aprovada.

Próximo lote proposto I01: corrigir somente posicionamento responsivo das colunas em `src/index.css`, mediante despacho do coordenador; reservar esse arquivo antes de editar e preservar alterações preexistentes. Dependência: defeito V01 reproduzido. Aceite: seis controles independentes e duas colunas em 768px, preservação em 360/390px, sem overflow nem Canvas duplicado. I01 ainda não iniciado; dono concreto e reserva pendentes. D01 mantém auditoria do HP. Nenhuma reformulação, alteração de store, publicação ou alteração de modelo autorizada por este registro.

Reservas documentais desta execução liberadas. Produto e demais arquivos preservados por comparação SHA-256 com o estado anterior à integração. C00 aceita; V01 com execução concluída e aceite bloqueado pelo defeito; V02 não iniciada.

## Despacho I01 — 08/10/2026

Autorizado por Astro Boy. Executor `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`, checkout `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Em execução. Reservas: `src/index.css`, `docs/FILA-ENTREGAS.md`, `docs/STATUS-SANTUARIO.md`; para versionamento obrigatório: `package.json`, `package-lock.json`, `docs/CHANGELOG.md`. Escopo: somente ancoragem das colunas no breakpoint >=640px e incremento patch. Preservar alterações anteriores.

## C01/C02 — consolidação e política de modelos, 09/10/2026

Continuação autorizada diretamente pelo usuário neste chat. C01 integrado documentalmente: manual, dossiê, responsável documental e instruções de continuidade. C02 incorpora escolha de modelos por tarefa. Sem copiar a fila antiga do worktree nem substituir instruções existentes. Estado documental: integrado, verificação final nesta execução.

Retomada I01: consulta Codex confirmou executor anterior ocioso com último turno falho por limite de uso. CSS corretivo e 0.1.13 já presentes. Reserva de STATUS-SANTUARIO transferida ao subagente `/root/validacao_i01` para reteste, sem edição de produto. Modelo solicitado Sol (`gpt-6.1-sol`), esforço médio: roteiro delimitado com navegador. Artefatos novos em `/tmp/conselho-i01-20261009/`. Executor de coordenação reserva esta fila e CONTINUIDADE. Critério: seis controles em 360/390/768/1440px, sem overflow/Canvas oculto e registrar erros. Aceite I01 depende do resultado, não do bump de versão.

## Encerramento C01/C02 e reteste I01 — 09/10/2026

Consolidação documental concluída nesta execução autorizada; 216 arquivos de produto/metadados preservados por hashes. Links locais novos e git diff --check conferidos. Política de modelos integrada em AGENTS.md e POLITICA-MODELOS.md; seleção Sol/médio exercitada no subagente de validação. Sem instalação de skills, alteração global de modelo ou novo bump.

I01: critérios delimitados de reteste aprovados na revisão desta execução. Em 360/390/768/1440px, 6/6 controles, sem overflow, um Canvas e nenhum fora do palco; erros de navegador/HTTP vazios conforme relatório. Evidências: /tmp/conselho-i01-20261009/results.json e STATUS-SANTUARIO.md. Não certifica fidelidade visual integral ou auditoria de HP. A correção/0.1.13 já existia; esta execução concluiu validação, sem atribuir implementação anterior a si.

Verificações adicionais pelo executor de coordenação: npm run lint saiu 0, 0 erros/4 avisos; npm run build saiu 0, avisos de chunks grandes e base Browserslist antiga. Não atualizadas dependências para remover avisos. Reservas desta execução liberadas e servidor temporário encerrado. Próximo lote: V02, fluxo Fitness em perfil temporário; nenhum novo lote de produto iniciado em paralelo. Sem commit/push/merge/publicação.

## V02 — despacho 09/10/2026

Dono: subagente `/root/validacao_fitness`; checkout principal. Em andamento. Modelo Sol (`gpt-6.1-sol`), raciocínio médio, escolha comunicada ao usuário por envolver automação real e ciclo de estado. Preferência vigente do usuário para chat principal: Luna leve. Reservas exclusivas: `docs/STATUS-FRONTEND-FITNESS.md`, `/tmp/conselho-v02-20261009/`; produto em leitura. Atribuição segue critério da fila: perfil isolado e dados criados pela UI, nenhum dado fictício de saúde/GPS. Aceite depende de relatório do validador e revisão do coordenador.

## Resultado V02 e despacho I02 — 09/10/2026

V02 executada por `/root/validacao_fitness`, Sol/médio. Estado: parcial; fluxo principal de treino, duas notas independentes, diálogo e responsividade exercitados. Defeito concreto em 360x844: CTA Concluir série parcialmente encoberto pela barra fixa; clique inferior acionou Congelar relógio, sem concluir série. Detalhes em STATUS-FRONTEND-FITNESS.md; artefatos em `/tmp/conselho-v02-20261009/`. Dados corporais reais e histórico inter-mês permanecem pendentes; nenhum dado médico inventado foi salvo.

I02 autorizado: correção local e teste do encobrimento. Executor `/root/fix_v02`, checkout principal, modelo Sol/médio (aviso ao usuário: ferramenta menor adequada após tarefa browser de múltiplas etapas). Reserva exclusiva de código: `src/pages/fitness/ActiveWorkout.tsx`. Documentos, manifests e changelog reservados ao coordenador/versionamento. Evidências novas em `/tmp/conselho-i02-20261009/`. Aceite exige clique real em 360px acionar Concluir série, ausência de sobreposição funcional em 390px e fluxo preservado em 768/1440 sem erros/overflow. Em execução; não iniciar outro lote Fitness até conclusão.

## I02 — encerramento técnico em revisão, 09/10/2026

Executor `/root/fix_v02`, Sol/médio, corrigiu `src/pages/fitness/ActiveWorkout.tsx`: `mt-10` tornou-se `mt-4 min-[375px]:mt-10`. A redução de margem limita-se a larguras abaixo de 375px. Encobrimento de Concluir série pela barra fixa reproduzido antes em 360px; responsável documental não alterou produto.

Reteste informado pelo executor/coordenador: clique real, continuar sessão, reload, finalizar e histórico passaram em 360/390/768/1440px, sem overflow horizontal ou pageerrors. Artefatos em `/tmp/conselho-i02-20261009/` (verify.json, verify-390.json, scripts e capturas). Cobertura: um exercício/uma série; títulos arbitrários, múltiplas séries, todos os exercícios e fidelidade integral não certificados. V02 permanece parcial: avaliações corporais com medidas reais e histórico entre meses pendentes; notas de sessão não substituem avaliações corporais.

Custódia `/root/versionamento_documentacao`: versão 0.1.13 → 0.1.14 sincronizada em package.json, nas duas posições raiz do package-lock.json e CHANGELOG. Dependências preservadas. Lint global/build em andamento pelo coordenador no momento deste registro, sem resultado incorporado. I02 em revisão, aguardando consolidação e aceite de Astro Boy. Chat principal permanece Luna leve; I02 delegado a Sol médio.

Próxima ação: coordenador incorporar lint/build, revisar diff e decidir aceite antes de escolher próximo lote. Não ampliar correção para cenários não testados. Reservas documentais/manifests devolvidas ao coordenador após esta custódia. Sem commit/push/merge/publicação. Evidências em /tmp são temporárias.

## Aceite I02 — 09/10/2026

Astro Boy revisou patch, evidências de clique real e resultados de quatro viewports; aceite delimitado concedido. `npm run build` passou. `npm run lint` passou com 0 erros e os mesmos 4 avisos reportados anteriormente em Ciclos e temporal. `git diff --check` passou. Versão 0.1.14 sincronizada; I02 encerrada. Limites permanecem: cenário pontual de um exercício/série, V02 parcial em avaliações corporais e histórico entre meses. Próximo lote: D01 auditoria estática dos contratos core; sem editar regras/dados.

## Despacho D01 — 09/10/2026

Auditoria estática do core, responsável `/root/auditoria_core_d01`, modelo Sol (`gpt-6.1-sol`), raciocínio médio. Escolha comunicada pelo cruzamento de hierarquia, fórmulas e reversões em vários módulos. Reserva exclusiva: criar `docs/AUDITORIA-CONTRATOS-CORE.md` e artefatos em `/tmp/conselho-d01-20261009/`. Leitura apenas para todo o produto e documentos existentes; sem mudanças de regras/dados. Aceite: rastreabilidade de contratos/implementação, divergências documentais explícitas e cenários de teste propostos sem declarar resultados executados.

## Aceite D01 e despacho D02 — 09/10/2026

D01 aceita como relatório estático pelo coordenador. Matriz de 14 contratos, quatro conflitos canônicos e cenários propostos; 0 alterações em 330 arquivos preexistentes, `git diff --check` do relatório passou. Não se aceitam conclusões funcionais: nenhum teste de app foi executado. Documentos permanecem contraditórios em histórico/desfazer, fórmula de presença, pausa da rotação e decimais. D02 (Astrolábio) iniciado em leitura estática, executor `/root/auditoria_astrolabio`, Luna (`gpt-6-luna`), raciocínio baixo; escopo bem delimitado. Reserva apenas novo docs/AUDITORIA-ASTROLABIO.md e `/tmp/conselho-d02-20261009/`.

## Aceite D02 e despacho D03 — 09/10/2026

D02 aceita como inspeção estática. `AUDITORIA-ASTROLABIO.md` distingue série simulada a cada render de métricas agregadas; script isolado controlado demonstrou vetores diferentes. Sem teste do browser. Decisão sobre o significado futuro do gráfico permanece produto/coordenação.

D03: inventário delimitado de assistente/LLM, executor `/root/auditoria_assistente_d03`, Luna/baixo. Reserva apenas novo `docs/AUDITORIA-ASSISTENTE.md` e `/tmp/conselho-d03-20261009/`. Não revelar secrets nem alterar código. Critério: localizar evidência, listar pré-requisitos sem escolher provider nem construir integração.

## Aceite D03 e resultado D04 — 09/10/2026

D03 aceita como inventário estático em `docs/AUDITORIA-ASSISTENTE.md`; não localizou assistente conversacional em src/functions dentro do escopo buscado, sem afirmar ausência global. Invocar/Forja são fluxos locais. Edge Functions locais de calendário não têm deploy comprovado. Nenhum secret foi lido.

D04 concluída em pesquisa oficial e registrada em `docs/DECISAO-PROVEDOR-IA.md`. Recomendação provisória para piloto gratuito limitado: Cloudflare Workers AI via Supabase Edge Function, com auth/tokens fechados; Gemini unpaid excluído para conteúdo pessoal por termos de uso de dados. Azure permanece alternativa paga com controles documentados. Nenhum provedor conectado ou segredo criado. Próxima etapa I03 é protótipo, instruções de segurança Supabase obrigatórias; modelo proposto Sol médio por integração UI/backend/auth. Avisar usuário antes do despacho; não assumir credenciais ou publicar.

## I03 — protótipo de sugestão de rascunho com IA, 09/10/2026

Autorizado por solicitação do usuário de incluir agente no app. Executor `/root/implementa_assistente_i03`, modelo Sol (`gpt-6.1-sol`), raciocínio médio. Escrita exclusiva: `src/pages/Invocar.tsx`, novo `supabase/functions/assistant-suggest/index.ts` e testes isolados apenas se necessários sem dependências. Skill Supabase instalada foi lida; consulta aos docs atuais de Edge Functions/Cloudflare realizada. Escopo: consentimento explícito, mensagem de texto mínima, JWT, proposta de rascunho, confirmação humana e gravação via addDraft existente. Sem acesso ao restante do perfil, voz, histórico persistente, deploy, secrets ou alterações remotas. Chave CF ausente pode deixar chamada real não verificada; documentar honestamente. Agente não altera documentação/manifests; coordenador faz revisão após retorno.

Retomada em 09/10: executor atingiu limite de uso antes de implementar. Verificação do checkout principal confirmou nenhuma edição em `Invocar.tsx` e nenhum arquivo `assistant-suggest`; o trabalho permanece incompleto. Reservas liberadas. Requer retomada pelo coordenador em Sol/médio, após troca explícita do modelo principal, ou por executor Sol/médio disponível. Não houve teste, bump de versão, segredo, deployment ou chamada real.

## Retomada e validação I03 — 09/10/2026

Usuário confirmou GPT-6.1 Sol médio no chat principal. Astro Boy retomou a implementação após limite do executor anterior. Código reservado/alterado: Invocar.tsx e assistant-suggest/index.ts/index_test.ts; nenhuma alteração de store/auth/backend existente. Guia em ASSISTENTE-PROTOTIPO.md. Sete testes Deno passaram com mocks sem rede. Browser com módulos Auth/provedor simulados, UI/store reais e perfil temporário: criação manual, consentimento, proposta editável sem salvar, falhas 401/429/503/502, resposta incompleta, sessão ausente, confirmação e reload passaram; quatro larguras sem overflow/pageerrors. Automação ajustada para selecionar botão visível e rolar ao centro antes do clique diante da navegação fixa; não certifica hit targets sem rolagem ou acessibilidade integral. Build passou, lint 0 erros/4 avisos preexistentes.

Custódia em execução por /root/versionamento_i03, Luna/baixo, escolha avisada ao usuário: apenas manifests/changelog/índice/manual/dossiê. Fila/continuidade continuam exclusivas de Astro Boy. Próximo: consolidar versão e aceitar protótipo local, mantendo ativação real pendente de conta, token server-side, quota e escopo remoto. Sem live call, secrets, commit/push/deploy.

## Aceite I03 — 09/10/2026

Astro Boy revisou código, evidências e custódia e aceitou o protótipo local no escopo acima. Versão 0.1.15 coerente nas três posições raiz; changelog/índice/manual/dossiê atualizados por /root/versionamento_i03, Luna/baixo. Deno 7/7, build aprovado, lint 0 erros/4 avisos, diff-check aprovado. Reservas liberadas. Sem chamada live ou publicação. Próxima etapa I04 depende de conta, credencial server-side, quota e escopo de deployment; preparação pode usar Luna baixo e integração/teste real Sol médio.


## UI01 — Saúde e integração visual Fitness, 09/10/2026

Solicitação atual do usuário: concluir abas Treino/Saúde conforme nove imagens em Pictures/PRINT/Fitness-app, com navegação, criação e conclusão funcionais. Primeiro lote prioriza o boneco corporal e a página Corpo legada. Astro Boy executa sequencialmente no checkout principal; reserva componentes fitness-kit/BodySilhouette, BodyMetricsCard, FitnessBottomNav e src/pages/Corpo.tsx, documentos de status/fila/continuidade e manifests/changelog ao encerrar. Stores, serviços e regras fora do escopo. Backup externo: /Users/fabioandre/Developer/conselheiro-backups/fitness-kit-20261009/before.tar.gz.

Plano visual: canvas #101011, superfície #252B3A, violeta #8582F2, texto #F5F5F7 e cinza #9A9AA4; sans existente, silhueta neutra proporcional e medidas reais em grade; navegação única do kit. Referências explícitas prevalecem sobre estética genérica. Critérios: acesso Corpo/Insights, registro e exclusão de avaliação preservados, todos os campos disponíveis, estados vazios honestos, 360/390/768/1440 sem overflow; build/lint e fluxo de treino reutilizável. Estado: em execução.

UI01: reserva ampliada para BodyMeasurementDialog.tsx após falha de foco ao fechar reproduzida pelo navegador; manter API e comportamento de cadastro. Sem alteração de domínio.


## Encerramento UI01 — 0.1.16

Primeiro lote de Saúde aceito no escopo delimitado: componentes integrados, falha de foco corrigida e evidências em fitness-kit-20261009. Build/lint/diff-check passaram; treino crítico e navegação testados em perfil temporário, medidas não inseridas. Reservas liberadas. Pendências e próximos arquivos em STATUS-FRONTEND-FITNESS. UI02 (seleção/prévia e UI de criação/edição preservando séries) é próximo; implantação do agente/Cloudflare permanece fora do foco. Não há conclusão integral do kit.


## UI02-A — escolher treino, prioridade corrigida pelo usuário

09/10/2026: usuário confirmou GPT-6.1 Sol médio e pediu finalizar /treinos primeiro. Somente depois avançar a preview/edição. Mobile primeiro; tablet adaptado e PC com interface de tablet, sem esforço de otimização desktop. Referência 21.26.22. Modalidades vêm do catálogo real (Yoga/Calistenia neste estado); não inventar seis categorias para preencher a imagem. Escrita sequencial Astro Boy: WorkoutSelect, WorkoutCategoryCard e variante opcional focused de FitnessPageShell; documentos/manifests no encerramento. Shell padrão dos outros módulos preservado. Backup em conselheiro-backups/fitness-select-20261009. Estado: em execução.

Plano: canvas #101011 sólido nesta seleção, cards #252B3A com raios arredondados, proporções alternadas e contorno #8582F2; sans e rótulos portugueses; navegação global por botão compacto no header, CTA pill, ações extras abaixo. Critérios: seleção/deseleção real, catálogo/detalhes/criar/preview, retomar sessão; 360/390 e tablet 768/1024; PC somente conferir largura limitada.


## Aceite UI02-A — 0.1.17

Escolher treino entregue no escopo do catálogo real; validações de seleção/catálogo/filtros/navegação e fluxo de treino passaram. Mobile 360/390 e tablet 768/1024; PC 1440 limitado a 576px. Build aprovado, lint 0 erros/4 avisos, diff-check. Documentação e versões sincronizadas; reservas liberadas. Revisão visual do usuário pode ajustar este lote antes de avançar. Nenhuma troca de modelo: Sol 6.1 médio confirmado.


## UI02-B — seis modalidades e ícones exatos da referência

Solicitação explícita do usuário substitui limite anterior de duas categorias: copiar os ícones da captura 21.26.22, trocar Calistenia por Core Training e adicionar os outros cards com nomes em português. Astro Boy/Sol 6.1 médio; reservas: WorkoutSelect, WorkoutCategoryCard, novo WorkoutReferenceIcons, asset de referência, types/workout.ts e lib/workout/workout-labels.ts para quatro categorias adicionais, sem alterar stores/fórmulas. Preservar catálogo e categorias anteriores; não inventar exercícios, GPS ou sensores. Estado: concluído como UI02-B / 0.1.18. Reserva adicional: WorkoutHub.tsx (mapa exaustivo exigido pela compilação) e manifests/changelog/continuidade/status/roteiro para fechamento. Backup/evidências: fitness-icons-20261009. Build passou; lint 0 erros/4 avisos preexistentes; seis cards e navegação/catalogo/filtros em 360/390/768; quatro categorias corretas no formulário; fluxo Yoga completo com retomada e persistência em 390. Revisão visual dos seis recortes em selected-390.png. Sem edição de stores, commit/push/deploy. Próximo: revisão da seleção; restantes do kit ainda pendentes.

## UI03 — reformulação do formulário Criar treino

Solicitação atual: melhorar toda UI/UX do formulário da captura 23.28.14. Astro Boy, Sol médio; execução sequencial. Reserva: CreateWorkoutDialog.tsx e CSS local novo; manifests/changelog/status/continuidade no fechamento. Preservar handlers, store, categorias, séries, ordem, data, catálogo e presets. Diagnóstico: Cinzel/uppercase destoante, controle de categoria desigual, ação final fraca e lista pouco informativa. Plano: Inter, base #101011, superfície #252b3a, campo #191d27, texto #f4f4f6, secundário #b5b8c3 e violeta #8582f2. Título alinhado à esquerda; formulário móvel com header/footer estáveis e um corpo rolável. Dados → escolhidos/configurações → catálogo. Revisão do plano: conservar ícones pedidos na seleção; não acrescentar ornamentos de magia ao formulário nem um fluxo de passos que exija cliques extras. Critérios: seleção/remoção, busca/filtros, configuração, agendamento, criação e retomada reais; 360/390/768px, teclado e overflow. Estado: em execução. Backup externo fitness-create-20261009.


UI03: entregue como 0.1.19. Evidências fitness-create-20261009; leitura canônica do módulo/adapter e frontend-design aplicada. Novo CSS escopado evita alterações nos diálogos externos. Seleção/catálogo/ajustes/Escape em 360/390/768 passaram; fluxo completo de um exercício/série em 390 passou; data e duas séries persistidas e foco de retorno conferidos. Reservas liberadas após verificações finais; sem publicação. Próxima etapa: revisão visual antes de preview/edição.

Verificações finais UI03: build 0.1.19 passou; lint 0 erros/4 avisos preexistentes; git diff --check passou. Versões package.json e duas posições de package-lock.json sincronizadas em 0.1.19.

## M01 — contexto das modalidades, execução e métricas

Usuário autoriza base específica dos esportes, ficha técnica/preview/ativo coerentes e cálculo por registro real. Astro Boy/Sol médio, sequencial. Reservados: types/workout, workoutStore, novo catálogo nativo e helper de carga; CreateWorkoutDialog, ExerciseDetailSheet e CSS local; WorkoutPreview/ActiveWorkout/WorkoutSummary; ExerciseSetRow, ExerciseCard, FitnessStickyAction, WorkoutSummaryView; adapters; docs/manifests. Histórico e fórmulas legadas não serão recalculados. Nova carga de atividade = minutos ativos declarados × esforço percebido (1–10); não representa kg/calorias ou medição muscular. Distribuição é estimativa editorial do tipo de atividade, proporcional somente aos blocos concluídos. Registro livre não é convertido automaticamente em biomecânica. Fonte do catálogo: modalidades presentes em programas oficiais brasileiros (sem afirmar ranking de popularidade). UI segue Inter/dark/violeta e casca focused com largura tablet; ações sem sobreposição. Etapas: catálogo/contexto → execução/ficha → cálculo/histórico/testes. Backup fitness-modalities-20261010. Estado: em execução.

Reserva M01 ampliada: HealthInsights/HealthDashboard, correção de unidade do gráfico legado (índice não equivale a kg). Novos registros com tempo ativo/esforço, inclusive Yoga/Calistenia, usam carga percebida na base de recompensa; registros sem essas observações mantêm volume/fórmula legados. Nenhum histórico recalculado. Física permanece Terra conforme contrato existente; Fogo/Água/Ar explicitados como zero neste módulo, sem fabricar associação pelo esporte.

M01: diferença reproduzida em captura ativa (10 min planejados exibiam estimativa de 5 min): estimateWorkoutDurationMinutes usava 45s fixos para todo bloco. Reserva adicional workout-format.ts: agora considera targetDurationSeconds quando informado e descanso, mantendo fallback anterior para repetições sem tempo. Plano antigo persistido não é reescrito. Preview nativo mostra Registro manual em vez de dificuldade inferida.


## Aceite M01 — 0.1.20

Build/lint/diff-check passaram; lint mantém quatro avisos anteriores. UI/fluxo Taekwondo em360/390/768, Saúde consumindo observações, RPE/persistência/idempotência, perfil100%, distância digitada com ponto e vírgula, proteção de blocos pulados e regressão Yoga verificadas. Fontes/scripts/capturas e limites em MODALIDADES-E-METRICAS-TREINO.md. Corrigido defeito decimal reproduzido e estimativa planejada fixa. Nenhum histórico, dados reais ou motor core reescrito; não houve publicação/commit. Reservas liberadas. Próxima etapa: revisão do usuário; edição de planos e expansão da taxonomia elemental mantidas como lotes próprios, sem afirmar medição muscular exata. Modelo Sol médio mantido.


## P01 — publicação e entrada de Matheus, 10/10/2026

Autorização expressa de Fábio: revisar todas as pastas, otimizar sem perder conteúdo e publicar no GitHub Matheuscroft/ConselhoElemental-main. Astro Boy/Sol médio, execução sequencial; reservas: regras raiz/app, ignores, scripts Astro, skills portáveis, documentação operacional e manifests. Base 03f0588, origin/main idêntico após fetch; alterações dos lotes anteriores preservadas. Identificação por perfil local explícito, nunca IP. Não transportar configurações pessoais, tokens ou sessões do executor. Critérios: onboarding Matheus/Fábio, apresentação inicial com estado real, perfil ignorado, docs/skills disponíveis em clone limpo, build/lint, revisão do conteúdo publicado e push sem force. Estado: em execução.

## Aceite técnico P01 — 0.1.21

Implementação portável e auditoria aceitas no escopo: oito skills com auxiliares existentes, regras raiz e CLI local sem IP, documentação atual e publicação preparada. Testes de perfil/apresentação/idempotência/troca/entrada inválida passaram; cópia limpa do índice com instalação (scripts desativados), build e testes passou, documentos/regras/oito skills conferidos. Build local/lint/diff-check e Deno 7/7 com mocks passaram. Sem revalidação visual ou integração remota nova. Pacotes dev não usados removidos; 25 achados npm audit registrados sem fix forçado. Helper e exemplos webapp-testing presentes, --help/sintaxe verificados; Puppeteer preservado. Reservas liberadas após fechar documentação; commit 4f180f9 publicado por push sem force em main, confirmado pelo GitHub. P01 aceita e encerrada; o fechamento documental acompanha a publicação. Próximo lote backend sugerido: contrato/teste de reversão/idempotência, sem migrar dados.

## F02 — Fitness paralelo, fase 1

Escopo: nova raiz Fitness, navegação via Pilares/Terra, entrada do legado no Mais, três abas, planejamento canônico na primeira aba. Executor sequencial. Arquivos: App/rotas, Pilares/AreaCard, Mapa/menu global, FitnessRoot/NativeTemplateDialog, contexto embutido do kit e WorkoutHistory (somente destino condicionado), workoutStore (identidade do catálogo). Alterações anteriores preservadas. Biblioteca local sem Core; execução inicia sessão nativa e não implementa registro nesta fase. Histórico/Corpo existentes reutilizados. Pendências: revisão visual do usuário; UI de execução nativa e Adapter em lotes posteriores. Build global bloqueado pelos contratos preexistentes; detalhes em CONTINUIDADE. Sem publicação.

## F03 — execução nativa e Adapter (em execução)

Reserva sequencial: ActiveFitnessSession, FitnessRoot, App/rotas, FitnessPageShell, workoutStore, appStore, tipos de Action/ExecutionLog/User, novo serviço Core de conclusão e Adapter, histórico nativo, continuidade. UI legada preservada. Divergência encontrada: completeTask legado não escreve ExecutionLog/Prana e usa fórmula de tempo anterior; novo despacho Core explícito deve seguir capítulo canônico sem reescrever recompensas históricas. source_ref_id da Action executada aponta para sessão; templateId permanece no histórico nativo. Não publicar.

F03 implementada no código: execução fullscreen, histórico nativo, Adapter e despacho único Core com ledger/XP/Prana e isolamento por conta. ESLint passou; compilação global permanece bloqueada por contratos anteriores. Sem testes funcionais/navegador neste lote. Limites/decisões em CONTINUIDADE; reservas liberadas, sem publicação.

## F04 — feedback de XP Terra (em execução)

Reserva sequencial: Core native-action-completion (extração da fórmula existente), native-reward-preview, workoutStore (previewTemplateReward), FitnessRoot (templates/histórico), ActiveFitnessSession (extrato de conclusão), NativeTemplateDialog (duração opcional) e continuidade. Fonte: Motor de Pontuação e Energia. Nenhuma fórmula/recompensa antiga será alterada. Preview deve usar mesmo esforço/presença/tempo/teto do despacho Core. Extratos usam ExecutionLog real; ER passa a informação secundária. Sem publicação.

F04 implementada: preview Core compartilhado, duração estimada opcional, badge verde nos templates, XP do ledger no histórico e modal de recompensa antes de Ver Histórico. ESLint seis arquivos passou. Sem testes funcionais/navegador/publicação; continuidade atualizada e reservas liberadas.

## F05 — esforço global e duração automática (em execução)

Reserva sequencial: tipos workout, utilitário de duração, cálculo Core/preview nativo, Adapter, stores workout/app (passagem do esforço), NativeTemplateDialog, badge FitnessRoot, docs canônicas/continuidade. Verificado: ER/multiplicadores/tetos já normativos; autoestimador 4s/rep+descansos+transições e default3 de formulário ausentes. Preview atual já aplicava tempo/presença, mas esforço1 fixo e ausência de estimativa limitavam recompensa. Natureza heurística de planejamento deve ser explícita; tempo real e presença por faixa permanecem canônicos na conclusão. Histórico não recalculado e páginas legadas preservadas. Sem publicação.

F05 implementada: duração automática com override, seletor global padrão3 nos novos planos, snapshot do esforço e Core aplicando tabelas de XP/cap/Prana, preview1.5 de presença explicitado. Motor seções5.4/5.5 e contrato Native Modules atualizados. ESLint onze arquivos/diff-check passaram; tsc global bloqueado por erros preexistentes, sem novos erros filtrados dos arquivos nativos. Sem testes funcionais/navegador/publicação; reservas liberadas.

## F06 — balance patch ER 0.10 (em execução)

Autorização atual do usuário: conversão 1ER=0.10, atualização dos exemplos e seletor fator0.8/1/1.5 no planejamento/execução. Reserva sequencial: Motor/Native Modules, workout-balance, workout-equivalents, native-reward-preview, workoutStore, NativeTemplateDialog, ActiveFitnessSession, docs continuidade/fila. Prévio .03 é histórico; nenhuma recompensa já emitida será recalculada. Core aplica mesmos multiplicadores/caps sobre novo baseValue. Sem publicação.

F06 implementada: constante compartilhada0.10, nova conversão em preview/conclusão/helpers ER, seletor fator de carga em planejamento e execução, exemplos/docs canônicos atualizados. ESLint sete arquivos/diff-check passaram; sem testes funcionais/navegador/publicação. Histórico preservado, reservas liberadas.

F12 — ativação semanal Fitness implementada: modal de dias, Adapter via addHabit e indicador por template. Core mantém fonte/valores na Action e projeção Habit. Sem publicação, commit ou migração; reservas encerradas. Revisão funcional de Ciclos pendente.

F13 — rich widget Fitness integrado em hábitos/rotacões da tela Ciclos. Preview Core e despacho HABIT único, sem subtarefas/duplicação de recompensa. Revisão funcional pendente; sem commit/push.

F14 — sequências Fitness em execução: reserva sequencial de formulário/biblioteca, modal compartilhado, Adapter, stores/types e documentação. Criação local >=2 treinos; ativação Core atômica com membros próprios e origem da sequência. Sem publicação.

F14 implementado: criação/ordenação local >=2, modal compartilhado, Adapter e operação atômica Core. ESLint sete arquivos passou; validação visual/funcional pendente. Reservas liberadas; sem publicação/commit/push.

F17 — card original de rotação com membro Fitness embedded e dispatcher fullscreen vinculado ao hábito; fila sem XP futuro e administração no módulo. Reservas sequenciais encerradas, validação visual pendente.

F18 — reserva sequencial: supabaseCloudSync/authStore e documentação. Investigar perda de membros comuns/Fitness; preservar alterações F14–F17 e dados existentes.

F18 implementado — supabaseCloudSync/authStore: preservação de membros internos e gravações sem limpeza antecipada; refresh protegido. ESLint passou. Reservas encerradas. Pendentes: validar persistência real e conferir backup para membros previamente perdidos; sem migração remota/commit/push.

F19 — compatibilidade position e exclusão não destrutiva de sequência implementadas. Reservas service/appStore/migration encerradas; aplicação remota e validação funcional pendentes.

F20 — sequência compartilhada implementada, reservas types/stores/adapter/library/Ciclos/docs encerradas. Planejamento cloud sem ocorrências, ativação por UUID, reativação idempotente e importação legado. Validar funcionalmente em navegador; templates/sessões ainda sem sync cloud.

F21 — FitnessHabitWidget ajustado visualmente, exercícios recolhíveis e séries concluídas compactas/editáveis. Reserva encerrada; validação visual pendente.

F22 — reserva stores/types/Adapter/Core completion/widget/history/docs para registro CHECKIN versus LIVE, conclusão integral/parcial/automática. Implementado; validação estática final em andamento, funcional pendente.

F22 concluído localmente — TypeScript completo e ESLint aprovados; reservas encerradas, validação funcional pendente.

F23 — badges acumulados treino/exercício e helper compartilhado implementados. Reservas liberadas, TypeScript/ESLint aprovados; validação visual pendente.

F24 — FitnessHabitWidget badge único planejado/progresso/real e estados meta/parcial. Reserva encerrada; TypeScript/ESLint aprovados, visual pendente.

F25 — desfazer sessão/ciclo preservando séries implementado; reserva stores/widget/types/Adapter/docs, validação estática final e visual pendente.

F25 — TypeScript/ESLint aprovados; reservas liberadas, funcional pendente.

F26 — recolhimento após última série implementado em FitnessHabitWidget; reserva encerrada, sem testes executados.

F27 — feedback XP flutuante e centralização do card implementados; reserva widget encerrada, TypeScript/ESLint aprovados.

F28 — overlay global e balão menor implementados; reserva encerrada, visual pendente.

F29 — recolhimento de exercício completo implementado; reserva encerrada, visual pendente.

F30 — checkbox agregador de exercício implementado; reserva encerrada, TypeScript/ESLint aprovados, visual pendente.

F31 — encerramento parcial do exercício implementado; reserva encerrada, ESLint aprovado, funcional pendente.

F32 — visual parcial por exercício implementado; reserva encerrada, ESLint aprovado.

F33 — checkbox não expande exercício ao desmarcar; reserva encerrada.

F34 — feedback parcial imediato por exercício implementado; reserva encerrada.

F35 — badge/séries empilhados no exercício, reserva encerrada.

F36 — separação visual CHECKIN/LIVE reforçada, reserva widget encerrada; lint final em andamento.

F37 — fila de treinos compacta com setas implementada; reserva Ciclos encerrada.

F38 — ampliação catálogo Calistenia implementada, reservas constants/workoutStore/docs encerradas. ESLint aprovado, TypeScript filtrado sem erros nos arquivos alterados; funcional pendente.

F39 — tags musculares e filtros catálogo implementados, reserva constants/types/store/components/FitnessRoot/docs; validação estática final em andamento, visual pendente.

F39 — reservas liberadas; ESLint aprovado, TypeScript filtrado sem erros nos arquivos alterados, funcional pendente.

F40 — tags/emoji corrigidos, reserva constants/catalog/store encerrada, lint final em andamento.

F41 — emoji predominante treino implementado, reserva helper/Root/widget encerrada; ESLint aprovado.

F42 — emojis internos implementados, reserva helper/Root/widget encerrada; lint final em andamento.

F43 — filtros compactos emoji no modal implementados, reservas constants/modal/catalog encerradas; ESLint aprovado.

F44 — emojis na lista catálogo modal implementados, reserva encerrada.

F45 — estilo de sequência compartilhado Treinos/Ciclos implementado, reserva componente/library/Ciclos encerrada, visual pendente.

F46 — card compacto/setas e link para sequência em Treinos implementados, reservas card/library/Ciclos encerradas, visual pendente.

F47 — edição sequências e reconciliação Core implementadas, reservas modal/library/helper/Adapter/stores/docs encerradas; ESLint aprovado, validação funcional pendente.

F48 — pular fila circular implementado, reservas Core/types/temporal/Ciclos/docs encerradas; lint aprovado, validação funcional pendente.

F49 — navegação reordenada, reserva encerrada; publicação F45–F49 autorizada pelo usuário.

AUD-PULL13 — inventário73arquivos e diff integral entregues, políticas domínio reforçadas e acesso dedicado por modalidade restaurado localmente. Matemática block-v2 aguarda crivo do proprietário e segue ativa no código importado; não aprovada por anotação documental. Reservas docs/AGENTS/FitnessRoot encerradas, visual pendente.

BACK-MAT13 — restauração da matemática autorizada concluída localmente; ER×0.10/sessão/teto único e regra b1575e4. Reservas Core/Adapter/store/previews/widget/docs/welcome encerradas. TypeScript app/ESLint aprovados; debater RPE, pausas, snapshots importados e dashboards antes de mudar domínio.

BACK-MAT14 — pausas explícitas descontadas em LIVE, descansos incluídos; sessão nativa vazia sem registro/Prana. Limpeza opcional no Histórico: XP real0, <60s, nenhuma série realizada, recibo obrigatório e reversão de Prana. Sem acesso aos dados do navegador para executar limpeza real; histórico legado preservado. TypeScript/ESLint aprovados, sem testes funcionais. Pendente: discutir Prana ponderado, preservando custo global até aprovação.
