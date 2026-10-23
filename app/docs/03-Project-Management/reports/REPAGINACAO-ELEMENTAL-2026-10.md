# Repaginação elemental — diagnóstico e arquitetura proposta

Data: 21/10/2026. Lote R01. Coordenação: Astro Boy. Base inspecionada: `f07292f`, branch `codex/fitness-ui-integration`, versão local 0.1.32 com alterações I03 anteriores preservadas. Estado operacional exclusivamente em [FILA-ENTREGAS](../../FILA-ENTREGAS.md).

Este documento entrega análise e proposta. Não representa implementação, aceite visual, auditoria funcional completa ou publicação. A decisão explícita recebida do usuário é: **personagem como protagonista, com avatar, evolução e equipamentos, e elementos ao redor**. Posicionamentos e funcionalidades abaixo ainda são propostas, salvo quando identificados como existentes.

## 1. Diagnóstico principal

O app já tem uma base funcional extensa: ações, hábitos, sequências, projetos, rascunhos, execução de treinos, histórico e recursos de jogo. O maior ganho agora é tornar essas capacidades compreensíveis e visualmente coerentes. O trabalho não pede um segundo aplicativo nem um novo motor de progressão.

A interface divide-se hoje em três linguagens: painel de personagem com equipamentos e arena; páginas gerais com vidro, violeta, dourado, emojis e Cinzel; Fitness com superfícies cinza, lavanda, cartões arredondados e tipografia funcional. A diferença aparece no código e nas vistas observadas. A proposta é uma mesma estrutura visual, com intensidade de magia diferente conforme a tarefa: Santuário expressivo; execução e formulários legíveis e diretos.

### Prioridades sustentadas pelo código

| Prioridade | Evidência atual | Consequência e encaminhamento |
|---|---|---|
| Alta — informação verdadeira | `src/pages/Astrolabio.tsx`, `generateHistoryData`, gera séries com `Math.random()` e as usa como histórico. | Reconciliar D02 antes de valorizar esses gráficos no redesenho. Usar agregação de registros existentes ou estado sem histórico; nunca preencher ausência com progresso fictício. Nenhuma mudança executada aqui. |
| Alta — seleção elemental acessível | `ElementCard.tsx:42` usa `motion.div` clicável, sem semântica/teclado. `Santuario.tsx` envia todos os elementos para `/pilares`. | Usar controles nativos, foco e seleção identificável. Preservar o elemento na URL para abrir o destino correto e suportar voltar/recarregar. |
| Alta — linguagem compartilhada | `tailwind.config.cjs`, `src/index.css`, `components/fitness-kit` e `CharacterStage` possuem famílias de cores/formas distintas. | Criar tokens semânticos e componentes comuns antes de migrar telas. Conservar as cores-base elementais do Glossário. |
| Alta — hierarquia da home | `Santuario.tsx` mostra personagem, cartões Invocar/Cassino, quatro tarefas pendentes e só então elementos. `pendingTasks` não é uma seleção por data. | Dar protagonismo ao personagem e aos portais; manter um acesso rápido à execução. Não chamar a lista atual de “Hoje” até usar o seletor diário canônico. |
| Alta — navegação consistente | `app-routes.ts` marca itens mobile diferentes dos hardcoded em `MobileBottomNav.tsx`; `moreActive` não cobre Temporal/Lua/Estações/Cassino/Mapa. | Uma definição efetiva para destinos, grupos e estado ativo. Preservar rotas/aliases e conteúdo até validar a migração. |
| Alta — limites do personagem | `CharacterStage.tsx` informa que os seis espaços são visuais e não há inventário. HP é calculado localmente, também no layout. | Evoluir a apresentação agora; inventário real, desbloqueios e atributos exigem contrato próprio. Conferir D01 antes de mudar a fórmula de HP. |
| Média — vocabulário | Registro de rotas descreve Forja como assistente, Grimório como conhecimento e Astrolábio como astrologia; telas efetivas são respectivamente triagem de rascunhos, perfil e análises. | Conservar nomes do universo e acrescentar subtítulos funcionais corretos: “Forja · ideias e rascunhos”, por exemplo. Evitar prometer módulos ainda não implementados. |
| Média — controles e movimento | Botão iniciar da home é 40×40 e não tem nome acessível. Redução de movimento é parcial; cards pulsam continuamente; há `transition-all` e animação de `width`. | Política global de foco, alvos de 44px, movimento reduzido e transições por finalidade. Risco de custo de layout é estático; não houve medição de frames. |
| Separada — regras do Cassino | `CassinoArcano.tsx` chama `addExperience` em sorteios e mantém gasto de stamina no estado da sessão. | Há comportamento real além do comentário de rota que o chama de fase futura. Reconciliar com o responsável de domínio antes de ampliar recompensas/equipamentos. Não mudar a economia sob escopo visual. |

### O que preservar

- Stores, IDs, recibos, histórico e adapters existentes; estimativa, execução e recompensa continuam distintas.
- Biblioteca Fitness unificada, modalidades, exercícios próprios, sequências, sessão ativa, pausa, resumo e histórico misto. A existência foi inspecionada; regressão completa não foi reexecutada neste lote.
- Kit Fitness como base de componentes reutilizáveis, sem descartar componentes por preferência estética.
- `AuraAvatar3D` já limita DPR e pausa fora de vista/aba oculta; manter essas proteções e evitar Canvas duplicado.
- Feedback de conclusão de `FitnessHabitWidget` já tem anúncio acessível e redução de movimento; candidato a padrão comum acionado por resultado confirmado.
- I03: consentimento explícito → texto mínimo/JWT → sugestão editável → confirmação → `addDraft` existente. A reformulação deve manter esse fluxo e seu fallback manual.

## 2. Direção visual proposta

**Um santuário arcano pessoal, onde a evolução cotidiana dá significado ao personagem.** Magia aparece em materiais, símbolos, luz e transições; nomes, números e ações continuam fáceis de ler.

Base de trabalho a experimentar no primeiro protótipo, sem ratificação de novos tokens:

| Papel | Proposta inicial |
|---|---|
| Fundo profundo | Obsidiana `#080B12` |
| Superfície | Ardósia `#141B27` |
| Superfície elevada | `#202B3A` |
| Texto principal | Marfim `#F2EFE7` |
| Texto secundário | `#AAB4C4` |
| Destaque de progressão | Ouro envelhecido `#D5B66F` |

Terra `#3E5F44`, Fogo `#D14900`, Água `#1B4965`, Ar `#A8DADC` continuam referências semânticas canônicas. Tons claros/escuros derivados serão necessários para texto, borda e fundo; contraste ainda precisa ser medido. Não usar a cor-base escura diretamente em texto pequeno sobre fundo escuro. Estado de erro/sucesso e elemento são conceitos distintos.

Cinzel fica nos nomes de locais e títulos de fantasia; Inter continua em dados, formulários e execução. Reduzir títulos decorativos repetidos e textos em caixa alta. Lucide é a família funcional; símbolos elementais podem ganhar arte própria consistente. Equipamentos podem ter ilustrações mais ricas sem misturar vários estilos de ícones na mesma função.

Escala proposta: espaçamento 4/8/12/16/24/32; poucos raios por papel (campo, cartão, painel); hierarquia definida por tamanho, alinhamento e contraste antes de glow. Texto de tarefas alinhado à esquerda; personagem centralizado; números comparáveis com alinhamento consistente. Um brilho principal por contexto, com ornamentação mais discreta nas listas.

## 3. Santuário com o personagem no centro

### Composição proposta

```text
Identidade do mago                  nível e evolução

            Fogo              Ar
                 PERSONAGEM
            Terra             Água

              Ver equipamentos
          recursos reais em faixa compacta

     Continuar atividade / Criar ritual
     Lista diária conectada ao Core
     Progresso recente e acesso às demais áreas
```

O desenho representa hierarquia, não posições finais. Desktop pode usar órbita completa; em 360/390px, um arco com quatro alvos nomeados evita disputar espaço com seis equipamentos. Equipamentos abrem ficha/painel próprio. A escolha do usuário é o protagonismo do personagem; o tipo final de avatar e a disposição dos slots ainda precisam ser comparados visualmente.

Anel com quatro elementos, perspectiva moderada e possibilidade de giro. Nenhum elemento deve ficar inacessível atrás do avatar. Primeira opção de protótipo: rotação por gesto/setas e destaque de seleção; se houver giro automático, oferecer pausa, interromper ao foco/toque e desativar com movimento reduzido. Acesso direto por nome e teclado continua disponível. A órbita é apresentação; não cria nova classificação ou pontuação.

Ao escolher Terra, por exemplo, preservar a escolha e mostrar **as áreas reais daquele elemento**, com exercício físico conectado ao módulo existente. Não reduzir Terra a treino nem transformar todos os elementos em novas ferramentas desconectadas dos Domínios.

Decisão explícita do usuário em 21/10/2026: **página própria do elemento, com botão para voltar ao Santuário**. O destino é interno ao aplicativo. Proposta técnica inicial: `/pilares?elemento=terra`, mantendo `/pilares` como visão geral; o formato da URL ainda não foi implementado. A página reúne as áreas e os recursos existentes daquele elemento, preserva a seleção ao recarregar e oferece retorno claro ao personagem. Painel sobreposto e expansão na home não são a direção escolhida.

## 4. Referências e lugar recomendado

| Referência inspecionada | O que aproveitar | Aplicação proposta |
|---|---|---|
| [Carousel Ring](https://www.scrolltide.co/#c-carousel-ring) | Profundidade e seleção circular; a demonstração é uma galeria com muitos cartões. | Adaptar para quatro símbolos ao redor do personagem; prototipar alcance, legibilidade e pausa antes de giro automático. |
| [Expanded Cards](https://www.scrolltide.co/#c-expanded-cards) | Faixa em que um cartão ganha largura e revela conteúdo. | Áreas internas de um elemento no desktop. Mobile usa expansão por toque, com cabeçalho sempre legível. |
| [Showcase Card](https://www.scrolltide.co/#c-showcase-card) | Capa compacta que revela resumo e detalhes. | Grandes Obras/Jornadas ou prévia de plano de treino; não transformar cada tarefa cotidiana em uma capa. |
| [Hover proximity — Master.dev](https://blog.master.dev/hover-proximity-using-modern-css/) | Destaque gradual do alvo e dos vizinhos. | Seletores de elementos/equipamentos com ponteiro fino. Foco e toque têm estado equivalente; variante simples com fallback. |
| [Lista de Himanshu](https://x.com/himanshubuildss/status/2106411655055974640?s=48) | Catálogo de referências para sistemas, navegação, componentes e movimento. | Consultar exemplos conforme o problema do lote. Não instalar coleções inteiras nem mesclar linguagens de dezenas de kits. |

Previews públicos do Scrolltide foram vistos; prompts/código completos estão atrás de plano pago. A proposta é uma implementação original dos padrões, sem alegação de acesso/licença aos componentes. O artigo de proximidade usa CSS moderno e ressalva suporte da variante mais complexa na data de publicação; compatibilidade atual entre navegadores ainda será verificada no lote de implementação.

Os dois posts do X foram lidos no navegador interno após falha de leitura pelo serviço web. O vídeo embutido no segundo post não abriu; seu conteúdo audiovisual não foi avaliado. A primeira referência remete ao artigo acima. Não houve auditoria individual dos 40 sites da lista.

Skillion, Gamify Your Life e Habitica permanecem referências históricas de produto: ligar ação pessoal a evolução visível. Nenhuma equivalência funcional atual foi presumida a partir desses nomes; não foram auditados nesta rodada.

## 5. Cobertura do app e mudanças propostas por família

Inventário fundamentado nas rotas de `src/App.tsx`, componentes e leituras estáticas focais. Vistas locais observadas nesta análise: Santuário, Pilares e Treinos/Corrida. As demais linhas não significam validação visual ou teste de todos os fluxos.

| Família / rotas | Atenção principal | Proposta e preservação |
|---|---|---|
| `/auth`, `/onboarding` | Entrada no universo e compreensão dos termos. | Aplicar a mesma tipografia/campos, explicar elementos com poucas etapas, manter autenticação e seleção real de áreas. Não acessar credenciais para desenhar. |
| `/santuario` | Personagem e navegação elemental; acesso à execução. | Órbita + evolução compacta + ação contextual. Lista diária usa contrato existente, sem duplicar cálculo. |
| `/pilares`, `/dominios`, `/dominios/:areaId` | Seleção duplicada e continuidade entre visão geral, áreas e módulo. | Página de elemento, áreas reais e busca/filtros coerentes. Manter ativação/desativação e áreas personalizadas. |
| `/rituais` | Leitura e execução rápida em listas densas. | Prioridade de título/estado/ação, filtros claros, timer e estados vazios consistentes; preservar concluir/reverter. |
| `/ciclos` | Hábitos, sequência e ocorrência atual precisam ser distinguíveis. | Cartão comum com passo atual e próxima ação; detalhes progressivos para agenda e rotação. Preservar pausa/pulo/reinício existentes. |
| `/invocar`, `/forja` | Criar, sugerir e classificar são momentos diferentes. | Reduzir densidade do formulário; Forja como inbox. Manter resumo antes de confirmar e gravação via operação existente. |
| `/jornadas`, `/grandes-obras` | Hierarquia, vínculos e progresso. | Showcase discreto para obra/jornada, visão de lista alternativa e detalhes de missão. Não duplicar entidades vinculadas. |
| `/temporal/semana`, `/mes`, `/ano`, `/calendario` | Datas, navegação entre períodos e densidade mobile. | Mesma casca e legenda; agenda compacta em mobile e grade quando couber. Não prometer sincronização externa sem verificação. |
| `/treinos`, `/fitness`, prévia, ativo, resumo | Continuidade entre planejamento e execução; dados legados/nativos. | Preservar quatro abas e aliases, aplicar linguagem elemental ao kit, evoluir execução guiada por lotes próprios. |
| Fitness Histórico, Saúde, Corpo, Evolução, Semana | Diferenciar métricas observadas, estimativas e recursos do jogo. | Gráficos com fonte/período e ausência explícita; corpo ilustrativo não simula anatomia nem diagnóstico. |
| Yoga/Calistenia e detalhes por ID | Preservação de catálogos e rotas antigas. | Mesma ficha de exercício e tratamento de mídia; não apagar conteúdo com a unificação visual. |
| `/grimorio` | Hoje é perfil, não biblioteca de leitura completa. | Ficha do mago, avatar, progressão e distribuição real; leitura/inventário são expansões separadas se aprovadas. |
| `/astrolabio` | Histórico simulado em tela de análise. | Resolver fonte dos gráficos primeiro; depois narrativa elemental e tendências verificáveis. |
| `/lua`, `/estacoes` | Superfícies pequenas com informações contextuais. | Integrar como contexto opcional na experiência temporal, mantendo rotas. Não atribuir efeito mecânico a essas informações. |
| `/cassino-arcano` | Experiência de recompensa com implicações de domínio. | Refinar apresentação só após separar decisão visual de discussão de economia. Acesso continua preservado. |
| `/mapa`, menu Mais, sidebar e navegação inferior | Excesso de caminhos e metadados divergentes. | Uma taxonomia de navegação com estados ativos corretos, busca de destinos e acesso a tudo que já existe. |

## 6. Fitness: aproveitar openGym sem substituir o módulo

[openGym](https://github.com/DuarteSantos8/openGym) documenta rotinas/rotações, execução guiada, carga anterior, descanso, RPE/RIR, recordes, mapas musculares e importação. O demo público mostrou home com treino do dia, semana, peso e atalhos. Não foi executada uma sessão completa no demo. README, manifesto frontend e avisos de terceiros foram consultados; não houve auditoria integral do backend externo.

| Capacidade | Situação encontrada no Conselho | Próximo incremento proposto |
|---|---|---|
| Planos e rotações | `FitnessRoot`, `NativeTemplateDialog`, `WorkoutSequenceLibrary` e `MakeCycleModal` já existem. | Melhorar leitura de plano atual/próximo e pontos de entrada. Não criar outro calendário/rotador. |
| Execução e esforço | `ActiveFitnessSession` registra séries, carga, duração, distância, notas e RPE. | Mostrar exercício atual e resumo das séries com menos competição visual. RIR é campo novo, não substituição automática do RPE. |
| Desempenho anterior | Histórico e snapshots disponíveis; não localizado comparador da última sessão na tela nativa inspecionada. | Consulta por identidade do exercício e modalidade, com data/origem. “Repetir valores” exige ação explícita e não marca série realizada. |
| Descanso | `restSeconds` existe e é exibido; tela nativa inspecionada não mostra countdown dedicado. | Timer de descanso explícito, recuperação após reload e acessibilidade. Descanso incluído no treino e pausa explícita descontada continuam conforme decisão vigente. |
| Recordes | `StrengthRecord`, histórico de força e consumo em resumos já existem, sobretudo no caminho legado. | Auditar cobertura nativa antes de anunciar novo PR. Integrar comparação onde faltar, sem converter recorde em XP extra. |
| Catálogo e músculos | Filtros e perfil muscular existentes. | Busca combinada com equipamento e mapa selecionável, somente com metadados reais/licenciados. Não inferir “recuperação muscular” clínica. |
| Séries especiais | Tipos atuais distinguem reps/duração; não foi encontrado contrato nativo de supersets/drop sets na inspeção focal. | Lote funcional separado: modelagem opcional, compatibilidade de snapshots e decisão de como executar; sem alterar ER por conveniência visual. |
| Importação | Não auditada como capacidade completa no app. | Futura prévia de importação, validação, deduplicação e confirmação. Nunca gerar recompensas retroativas automaticamente. |

Ordem recomendada no módulo: acabamento do kit → último desempenho + execução mais clara → descanso → cobertura de recordes → catálogo → séries especiais/importação, conforme escolhas do usuário. Reaproveitar os seletores de `activity-history.ts` e `use-fitness-history.ts` antes de criar qualquer nova camada de consulta.

O [NOTICE oficial](https://github.com/DuarteSantos8/openGym/blob/main/NOTICE.md) distingue código AGPL-3.0 e mídia de exercícios da Gym visual com licença própria. Não copiar animações/imagens nem usar hotlinks. Reutilização de código/dataset exige avaliar licença e atribuição do material específico. Esta proposta usa ideias de interação e mantém os assets/contratos do Conselho; não importa aplicativo, autenticação ou banco do openGym.

## 7. Arquitetura de implementação

```text
Tokens semânticos + regras de acessibilidade/movimento
    ↓
Primitivos existentes (Button, Dialog, Tabs, campos, cards)
    ↓
Casca comum + navegação + componentes elementais de apresentação
    ↓
Páginas e módulos existentes
    ↓
Seletores/read models já presentes → operações existentes → stores/adapters/Core
```

Os nomes a seguir são propostas de responsabilidades, não arquivos já criados:

- `ElementTheme`: atributos/variáveis CSS por elemento, sem duplicar árvore de componentes quatro vezes.
- `CharacterOverview` e `ElementSelector`: apresentação do personagem e seleção controlada; receber dados e callbacks, sem calcular XP/HP.
- `PageHeader`, `SectionHeader`, `ActionCard`, `EmptyState`, `MetricDisplay`, `ConfirmationSummary`: consolidar/reutilizar equivalentes existentes antes de criar novos.
- `MotionPolicy`: tokens de pressionar/revelar/navegar/celebrar, redução de movimento e feedback que não depende só de animação.
- Registro de rotas: alinhar `APP_ROUTES`, navegação e aliases. Seleção elemental pertence à URL; expansões transitórias pertencem ao componente. Não criar store persistente apenas para navegação.

Migrar uma família por vez, com pontos de entrada compatíveis. Não fazer substituição global cega de cores. Não introduzir GSAP, outro kit inteiro ou outra biblioteca 3D sem necessidade demonstrada; já existem Motion, Tailwind, componentes UI e Three/R3F. Separar carregamento por rota é candidato, pois páginas são importadas diretamente em `App.tsx`; medir bundle e navegação antes de otimizar. Não houve benchmark nesta análise.

## 8. Sequência de entregas proposta

Esta sequência é o desenho do programa. Estados e reservas ficam somente na fila operacional. R01 não autoriza mudanças de domínio nem equivale a aprovação de todos os layouts.

| Lote | Entrega concreta | Dependência / aceite para avançar |
|---|---|---|
| R01 | Diagnóstico, referências, cobertura e decisões | Relatório rastreável e escolha do protagonista registrada. |
| R02 | Tokens + amostra de componentes + composição do Santuário | Comparar em 390 e 1440px; usuário aprova direção visual antes de espalhar pelo app. |
| R03 | Santuário e destino de elemento | Navegação/foco/reload/voltar, quatro elementos alcançáveis, slots sem sobreposição e operações existentes preservadas. |
| R04 | Rituais, Ciclos, Invocar e Forja | Fluxos criar/revisar/concluir/reverter/reload; regressão I03; nenhuma fórmula modificada. |
| R05 | Jornadas, Grandes Obras e Temporal | Hierarquia/vínculos/datas preservados, detalhes e listas adaptados ao mobile. |
| R06 | Fitness visual + primeiros incrementos escolhidos | Fluxo template → prévia → sessão → pausa/reload → resumo → histórico, Native e legado; recibos invariantes. Subdividir cada incremento funcional. |
| R07 | Grimório, Domínios remanescentes, Astrolábio, Lua, Estações e Cassino | D01/D02 e decisão de domínio para qualquer regra; nenhuma série fictícia apresentada como histórico. |
| R08 | Revisão transversal de acessibilidade, movimento e performance | Matriz de telas/estados com evidências; corrigir regressões reproduzidas, medir antes/depois. |

Critérios de cada implementação: 360/390/768/1440px, conteúdo longo, vazio/preenchido, erro quando aplicável, foco/teclado, toque, movimento reduzido, navegação fixa sem cobrir ações; dados de teste isolados, IDs criados pela UI, reload e retornos corretos. Build/lint e testes relevantes ao fluxo são registrados após execução. Sem alterar arquivos de regras para fazer uma captura parecer correta. Cada lote tem diff e retomada próprios; rollback preserva dados e mudanças alheias.

## 9. Recursos futuros com melhor encaixe

1. **Ficha de evolução do personagem:** explicar de onde veio o avanço com logs existentes, sem transformar ausência de dados em conquista.
2. **Retomar atividade e planejar o dia:** acesso curto no Santuário; reutilizar execução e agenda existentes.
3. **Favoritos de áreas e busca de destinos:** úteis quando houver muitas áreas, depois de estabilizar a navegação.
4. **Inventário cosmético e equipamentos reais:** muito alinhados à visão escolhida, mas exigem entidades, origem dos itens, equipar/desequipar e persistência. Efeitos em atributos/economia dependem de aprovação explícita. Primeiro definir se o lote é apenas cosmético.
5. **Revisão semanal elemental:** baseada em logs reais, com comparação temporal transparente; não pressupõe IA nem nova pontuação.

Casa, estudos, lazer, saúde e acompanhamento emocional continuam parte da visão do produto. Primeiro tornar as áreas/conteúdos existentes acessíveis; cada ferramenta especializada futura precisa de objetivo e contrato próprio. Registros emocionais permanecem voluntários, sem inferência pelo personagem ou pelo assistente.

## 10. Astro Boy e momento da Wizard

Evoluir Astro Boy significa melhorar a coordenação verificável: uma fila, decisões visuais registradas, responsável e arquivos por lote, referências ligadas à tela, critérios de aceite e evidência de regressão. Não significa instalar um daemon, prometer aprendizado automático ou declarar agentes permanentemente ativos.

A saída completa do comando solicitado `npx skills use "https://github.com/mattpocock/skills" --skill "wizard"` foi recuperada de `/tmp/codex-wizard-skill-output.txt`. O diretório de suporte informado é `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/skills-use-VIw4CD/wizard`; caminhos relativos dessa skill pertencem a ele. Esse caminho temporário pode expirar e não deve virar dependência do app.

A Wizard gera um roteiro Bash para etapas manuais que só a pessoa pode realizar. **Não é uma skill de design nem o wizard de criação de entidades do produto.** O momento adequado seria uma futura ativação de infraestrutura/I04 ou onboarding técnico de outro computador que realmente contenha passos humanos, com escopo autorizado. Neste lote não há procedimento humano desse tipo. Não foi criado ou executado script de credenciais/deploy. A instrução genérica de ler arquivos de ambiente não supera a proibição do usuário de acessar secrets.

Antes de uma futura Wizard: listar etapas, origem/destino dos valores e ações manuais, validar as instruções atuais, confirmar o escopo e então gerar o script a partir do template. Verificação sintática não significa execução bem-sucedida do setup. R02/R03 dependem de decisões de design e protótipos, não dessa skill.

## 11. Evidências e limites desta análise

- Conferidos Git status/branch/HEAD, continuidade, fila, coordenação, fonte canônica e capítulos pertinentes. Pull para `f07292f` é entrega anterior registrada no I03, não um novo pull desta análise.
- Leitura estática de rotas, layout, estilos, navegação, Santuário/CharacterStage/Pilares, assistente/Forja/Grimório, Fitness e trechos de listas/projetos/domínios/temporal; inspeção específica de Astrolábio, Lua, Estações e Cassino. Isso não equivale a leitura linha a linha de todo o repositório.
- Auditoria de movimento por `/root/auditoria_movimento`: cinco achados e duas oportunidades; somente leitura, sem build ou medição de desempenho. Referências conferidas pelo coordenador durante consolidação.
- Navegador interno: observadas vistas locais e previews públicos descritos; sem criar/concluir/excluir entidades do usuário. A navegação em abas de pesquisa não exercitou persistência completa nem todos os estados responsivos.
- Fontes externas: Scrolltide público; posts X e artigo original; README, manifesto e NOTICE do openGym; home do demo. Conteúdo premium não acessado, vídeo do segundo post indisponível.
- Build, lint, Deno, testes funcionais, matriz responsiva completa, contraste instrumental e performance **não foram executados para R01**. Evidências anteriores I03/Fitness permanecem históricas e separadas.
- Nenhuma edição de produto, segredo, configuração global, contrato, deploy, migração, commit ou push. Documentação revisada sequencialmente por Astro Boy; revisão documental independente não realizada.
- Verificação documental executada: `git diff --check` passou; script Python conferiu links locais do relatório e seus vínculos no índice/continuidade, ausência de espaços finais/marcadores de conflito no relatório e paridade das três versões em 0.1.32. Não é teste funcional do produto.

## 12. Próximo ponto de decisão

Navegação confirmada: página própria do elemento e retorno ao Santuário. Próximo: apresentar a composição R02 do Santuário e sua página de elemento com a mesma base visual. Primeiro validar hierarquia, legibilidade, tamanho do personagem e lugar dos equipamentos; só então ajustar intensidade de brilho, movimento e acabamento. As posições das três referências são propostas discutíveis, não decisões impostas ao usuário.
