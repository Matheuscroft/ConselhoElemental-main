# Auditoria estática — Astrolábio (D02)

Data: 09/10/2026 (America/Recife)\
Checkout: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`\
HEAD observado: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`\
Escopo: leitura estática de `/astrolabio`, store e consumidores diretamente ligados. Sem alterações em produto, regras ou documentação existente.

## Resultado

A série “Evolução por Elemento” é simulada no cliente. `generateHistoryData` cria 7, 30 ou 365 linhas de datas recentes e sorteia, para cada linha, quatro inteiros entre 10 e 59 (`src/pages/Astrolabio.tsx:29-52`). O `LineChart` recebe essa série em `:165-193`. Ela não deriva de conclusões, pontuação, hábitos ou registros de execução. `Math.random` é chamado outra vez em todo render, de modo que a série não é estável entre renders e não representa histórico recuperável.

Isso é achado estático, confirmado no código e no comentário “Generate mock historical data”. A aparência da mudança durante interações e em uma sessão real de browser não foi verificada nesta auditoria.

## Dados usados e consumidores

| Apresentação | Fonte observada | Cálculo/consumidor | Limite do dado |
|---|---|---|---|
| Evolução por elemento | `timeRange` local e `new Date()` | Quatro chamadas aleatórias por linha; `LineChart` | Não consulta a store nem encontra registros históricos. O seletor muda o tamanho da amostra, não seu significado. |
| Distribuição de pontos | `getElementScores()` da `useAppStore` | `pieData` e `PieChart` em `:27, 54-59, 210-253` | Agregado atual calculado pela store, sem série temporal. |
| Detalhes elementais | O mesmo `elementScores` | `ElementDetailCard` em `:255-262` | Mesmo agregado atual. |
| Rituais por elemento | `tasks` da store | Conta tarefas `isCompleted` por `elementId`, `BarChart` em `:61-69, 266-272` | Contagem atual das tasks de topo, não agrupamento temporal. |
| Cartões | `tasks`, `habits`, `user` da store | Quantidade de tasks, concluídas, hábitos raiz, `user.totalScore` e `user.streak` em `:120-147` | Métricas atuais; não são a fonte do gráfico de evolução. |

A implementação de `getElementScores` agrega tasks concluídas usando `baseValue` e multiplicador de esforço, contribuições de completions de hábitos por data, e bônus de projetos e quests concluídos (`src/stores/appStore.ts:4327-4384`). O agregado mistura contribuições acumuladas e não entrega buckets por dia/semana/mês/ano. A store persiste `tasks`, `habits`, `projects` e `quests`, entre outros campos (`appStore.ts:4532-4553`); isso não transforma `historyData` em dado persistido.

A página chama `useAppStore()` sem seletor (`Astrolabio.tsx:24`), logo consome a store inteira; não há seleção estreita que limite rerenders a campos usados. Um render decorrente de mudança de estado reexecuta o corpo do componente, inclusive `generateHistoryData` (`:29-52`). A mudança de `timeRange` também agenda render e nova amostra (`:25, 101-118`). A série é criada antes da renderização condicional das abas e o componente do gráfico de evolução usa o array resultante (`:52, 165-171`). Staticamente, portanto, até uma atualização de store não relacionada pode substituir a amostra exibida. Browser deve confirmar se essa atualização específica causa redesenho perceptível.

## Relação com a especificação astrológica

A fonte canônica define Astrology Engine como serviço passivo e determinístico que produz um `DailyAstroState`, cacheado por dia/timezone e consultado pelo motor de pontuação (`01-Domain-Core/03-Astrology-Engine.md:10-27`). O modelo especificado é de estado diário com fase/signo lunar, trânsitos e modificadores (`:30-45` e demais seções). A tela observada apresenta análise de equilíbrio e evolução elemental, mas não consome esse contrato astrológico. `src/constants/index.ts` importa `astronomy-engine`; a existência desse cálculo astronômico em outro ponto do app não demonstra integração com o histórico do Astrolábio nem implementação de `DailyAstroState`.

Busca estática em `src` por `DailyAstroState`, `astro_modifier`, `daily_astro_state`, `moon_phase` e `moon_sign` não encontrou ocorrências. `src/constants/index.ts:6,165-179` importa `astronomy-engine` e expõe `getMoonPhase`; isso é cálculo astronômico localizado, mas não o modelo diário/cacheado especificado. A busca por nomes não prova ausência de contratos equivalentes com outros nomes. Este relatório não decide se a página deve mostrar evolução de pontuação ou astrologia diária: isso requer decisão explícita do coordenador/produto após reconciliação de escopo.

## Reprodução e validação

Reprodução estática mínima: executar `node /tmp/conselho-d02-20261009/repro-static.cjs`. O script replica a fórmula de quatro séries com `Math.random` controlado por duas fontes diferentes e imprime `changed: true`. Isso demonstra que o mesmo algoritmo e período aceitam produzir valores diferentes; não inicializa a aplicação e não certifica a interação de browser. Artefato de saída: `/tmp/conselho-d02-20261009/repro-static.json`.

Caso manual proposto para validação futura no app, com perfil temporário vazio: abrir `/astrolabio` em “Semana”, registrar os valores do gráfico, clicar “Mês” e retornar a “Semana” sem alterar dados. Pela implementação, os sete valores são recalculados; atualizar a store por uma ação não relacionada também deve provocar novo render e amostra. A execução no browser é necessária para confirmar repaint/visibilidade e descartar efeitos de cache/render do gráfico. O resultado aleatório tem possibilidade teórica de coincidir, embora a amostra seja ampla.

Não foram executados browser, testes, lint ou build. Não foi criado perfil nem alterada store. Somente o script demonstrativo Node foi executado; saída indica dois vetores diferentes sob aleatoriedade injetada.

## Menor escopo seguro para decisão futura

1. Primeiro decidir o significado esperado da aba “Evolução”: histórico de métricas/pontuação do jogo, estado astrológico diário, ou outra apresentação. Não derivar essa escolha da especificação sozinha.
2. Se a intenção confirmada for histórico de métricas, delimitar uma fonte histórica real já disponível (incluindo regra de agrupamento e intervalo); verificar se o modelo atual mantém granularidade suficiente. `getElementScores` é agregado e, sozinho, não reconstrói série diária.
3. Implementar apenas o consumidor da fonte aprovada e uma mensagem vazia/indisponível apropriada se não houver registros. Não fabricar pontos retroativos nem alterar dados/progressão em silêncio.
4. Validar no browser a estabilidade entre renders, troca de período e atualização de estado, além do contrato de persistência escolhido.

## Limitações

Esta análise observa implementação estática e um script isolado, não comportamento end-to-end. Não certifica a semântica de `user.totalScore`/`streak`, a atualização visual de Recharts, a existência de histórico alternativo fora dos arquivos ligados consultados, nem a integração completa das efemérides com regras do core. Não houve decisão de produto nem correção.
