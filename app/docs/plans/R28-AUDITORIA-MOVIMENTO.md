# R28 — balanço do escopo e proposta de animações por ação

25/10/2026 · auditoria estática, sem implementação · versão local 0.1.69 · base Git b11ed9d, com R27 não commitado.

Pedido: avaliar progresso, pendências e como iniciar posteriormente uma fase de animações em todas as áreas. Este relatório propõe a ordem; não declara a nova fase implementada nem substitui a fila operacional. Astro Boy coordenou duas inspeções somente leitura com a skill improve-animations e conferiu as evidências no código. Nenhum navegador, build, teste, serviço remoto, commit ou push nesta rodada. Os 170 testes e build/lint/TypeScript aprovados pertencem à rodada R27 anterior.

## Balanço atual

| Frente | Presente no projeto | Falta / limite |
| --- | --- | --- |
| Identidade e Santuário | Nova home, corpo elemental, quatro elementos orbitando, destinos por elemento, cabeçalhos, ícones e cronômetro | Aceite visual recebido em partes da conversa; uniformidade e performance de todo app ainda sem QA completo |
| Descoberta | Expanded Cards/Showcase em superfícies selecionadas; Domínios agrupados, busca, detalhes e formulários; Pilares e Mapa reorganizados | Testar ida/volta, foco, teclado e filtros no celular; primeiro desvínculo legado R19 ainda pendente |
| Rituais/Jornadas/Grandes Obras | Catálogos, trilhas, runas, próxima etapa sugerida, seleção livre, painéis e capítulos | Detalhes/vínculos, progresso macro e snapshots precisam fechamento; não equivale a todo o sistema Duolingo reproduzido |
| Ciclos | Agenda, filtros, sequência, subitens fixos, constância por agenda e contador genérico R27 | QA real de execução/contagem; contador só em ciclos comuns raiz e membro comum de sequência, não Rituais/subitens/treinos nativos |
| Constância | Descanso preservado nos ciclos diários/semanais/mensais; feedback condicionado a novo recibo | Agenda histórica não versionada; rotações/anual com fallback; streak geral do personagem permanece separado |
| Invocar/Forja | Criação, edição, classificação e linguagem visual renovadas | Validação de formulários/destinos; divergências canônicas da Forja permanecem para revisão de contrato |
| Grimório/Astrolábio/Temporal | Recursos, histórico e leituras; Lua realista; Estações e vistas temporais reorganizadas | Conferência integrada dos dados apresentados, navegação e leitura mobile; ausência de medição não vira estatística |
| Treinos | Biblioteca, execução/pausa/retomada, histórico, Corpo e Saúde integrados ao fluxo existente | QA com sessão isolada, acabamento transversal, medição real de desempenho; sensores/saúde automática não inferidos |
| Roda do Destino | Sorteio gratuito de atividades reais, filtros, resultado e acesso à execução | QA de zero/uma/muitas opções, atividade alterada e retorno contextual |
| Recompensas | XP/Prana existentes preservados; resultados visuais e conclusão já presentes | Fragmentos e novo inventário funcional ainda não implementados; um fragmento por conclusão foi aprovado, demais contratos pendentes |
| Dados/conta | Persistência local existente; R27 testou snapshots/contas locais em memória isolada | R25-A backup exportável/restauração e R25-B associação segura à conta ainda não entregues; teste local não comprova nuvem |

O histórico de publicação registra 0.1.68 em main; não se consultou novamente o remoto nesta auditoria. 0.1.69 está local. Não usar porcentagem subjetiva para dizer que o escopo inteiro terminou.

## Prioridades antes de ampliar efeitos

1. **Proteção de progresso R25-A/B:** exportação/restauração verificável de core e treinos; associação explícita e reversível à conta, conflitos e isolamento com Matheus. `authStore.ts:80` ainda contém reset para conta cloud nova; `:484` mantém migrateLocalData desativado. Não prometer preservação sem testar fluxo completo.
2. **QA R26/R27 no celular:** criar → encontrar → executar/contar → concluir → desfazer → trocar data → consultar histórico. Validar 360/390px, depois 768px, teclado virtual e barra inferior. Bloqueio anterior de inspeção não foi contornado.
3. **Contratos pendentes:** primeiro desvínculo R19; propagação de conclusão envolvendo NOTE; progresso macro/vínculos de Jornadas/Obras; agenda histórica/turnos para constância completa. UI não deve resolver essas divergências inventando outra regra.
4. **Gamificação restante:** elegibilidade, granularidade (pai/filho), multiárea, retroativos, Undo, isolamento/idempotência dos fragmentos. Regra aprovada de 1 fragmento não aprova automaticamente essas decisões. Hidratação visual é módulo futuro alimentado pelo diário R27, sem segundo histórico.

O sistema visual de movimento pode ser preparado enquanto contratos de conta/recompensas são fechados; animações de recompensa real dependem de resultado real do domínio.

## Auditoria de movimento — achados confirmados

Stack: React/Vite, Framer Motion, CSS e Radix. Já há tokens de movimento em `src/styles/elemental-design-system.css:6–8` (160/240ms) e em `src/components/quests/quests.css:2` (160/180ms e curva própria). Reutilizar e consolidar estes pontos, sem biblioteca ou motor paralelo por padrão.

| Prioridade | Categoria | Local atual | Evidência e encaminhamento |
| --- | --- | --- | --- |
| Média, transversal | Acessibilidade | src/components/layout/AppLayout.tsx:119–124 | Conteúdo anima deslocamento/blur em 300ms sem preferência local; App/main não fornecem MotionConfig. Cobrir ancestral e páginas, preservando confirmação textual |
| Média, transversal | Coesão/performance | src/App.css:91–96; src/components/quests/quests.css:14,153–156 | Todo botão herda transition:all e escala; botão de quest ainda desloca em modo reduzido. Delimitar propriedades e preferências antes de adicionar efeitos |
| Média, uso diário | Interrupção | src/components/cycles/CycleCompletionFeedback.tsx:17–23; src/pages/ciclos.css:390–396 | Aviso troca key por recibo e reinicia entrada/desenho em conclusões rápidas. Planejar agrupamento/transição do aviso sem bloquear comandos e sem perder informação do histórico |
| Média, polimento | Frequência | src/components/quests/quests.css:170–181; QuestTrailMap.tsx:21 | Seleção comum dispara runas de 300–550ms. Avaliar abreviação na exploração repetida e reservar composição maior para marco; usuário já aprovou a personalidade, preservar arte e direção |
| Média, medir | Performance/coesão | src/components/domains/domains.css:13,59; src/pages/grimorio.css:47 | Rail 450ms, grid 350ms, barra width 650ms. Risco de layout e ritmos diferentes, não lentidão medida. Barras candidatas a transform; expansão que precisa redistribuir espaço exige medição, não remoção automática |

Não se mediram FPS, bateria, frame drops ou frequência real de uso. Duração isolada não prova experiência ruim. Não classificar a órbita ou Lua aprovadas como defeituosas: primeiro medir e preservar sua aparência. A órbita já pausa fora da viewport/aba, acompanha movimento reduzido e estabiliza alvos; manter isso.

Boas bases adicionais: Ciclos observa recibos salvos e ignora hidratação/troca de conta; Invocar consulta reduced motion; widget Fitness mantém status textual e reduz deslocamento/escala. Componentes locais já oferecem material reutilizável.

### Oportunidades adicionais

- **Forja:** classificação já confirma por texto e oferece destino (`Forja.tsx:78–83`); dar continuidade visual ao cartão que saiu e ao destino, sem atrasar conversão.
- **Contador genérico:** valor/barra e confirmação curta no próprio controle; evitar novo toast flutuante para cada toque. Água futura pode representar o mesmo valor visualmente, sem novo armazenamento.
- **Conclusão de trilha/marco:** diferenciação visual entre concluir uma tarefa, cumprir a meta do dia e terminar uma Jornada; cada gatilho precisa de dado confirmado, não inferência de animação.

## Proposta de cobertura por área

| Área | Ações a cobrir na fase futura | Direção |
| --- | --- | --- |
| Navegação compartilhada | Pressionar, trocar aba, voltar, abrir/fechar menu ou diálogo | Feedback curto, foco restaurado, rolagem preservada, nenhuma espera artificial |
| Santuário/elementos | Pausar/girar órbita, selecionar elemento, abrir quest, atualização de recurso | Manter cena aprovada; seleção inequívoca e atualização apenas do valor alterado |
| Ciclos | Filtrar/trocar data, expandir etapas, somar/desfazer registro, iniciar/pausar, concluir/Undo, constância | Contagem local discreta; confirmação maior por conclusão; histórico nunca reencena prêmio |
| Rituais/trilhas | Selecionar nó, abrir contexto, iniciar/retomar, concluir, ir à próxima sugerida | Runas coerentes, conexão espacial e acesso livre preservados |
| Jornadas/Obras | Abrir capítulo, vincular/desvincular etapa, editar, acompanhar marco | Progresso deriva dos dados; não animar porcentagem calculada por um segundo motor |
| Invocar/Forja | Escolher tipo, avançar/voltar, validar, salvar, classificar, cancelar/excluir | Campo e etapa respondem à ação; confirmação após comando bem-sucedido; erro mantém entrada |
| Domínios/Pilares/Mapa | Expandir elemento/grupo, buscar, filtrar, abrir área, voltar, criar/vincular | Expanded Cards e Showcase mantêm contexto e foco; busca frequente imediata |
| Grimório/Astrolábio | Trocar seção/período, abrir histórico, editar perfil, atualizar barra | Animar diferenças reais; números não partem de zero a cada visita |
| Lua/Estações/Temporal | Trocar data/período, abrir calendário, inspecionar fase e estação | Mudança contextual breve; visuais ambientais pausáveis e custo medido |
| Treinos/Corpo/Saúde | Série/exercício, descanso, pausa/retomada, término, resumo, seleção corporal | Relógio, tempo, cálculos e recibos pertencem ao módulo atual; nada bloqueia exercício seguinte |
| Roda do Destino | Filtrar, sortear, ver resultado, abrir atividade, voltar | Giro interrompível quando aplicável, reduced motion oferece resultado direto; sem XP no sorteio |
| Conta/onboarding | Entrada/erro, carregamento, backup, prévia de transferência, confirmação | Feedback honesto de estado; nunca mostrar sucesso antes de persistência verificada |

## Como construir sem alterar as regras

Cobrir cada ação com estados **pronto → pressionado → processando (se necessário) → sucesso/erro → desfazer quando disponível**. Não significa animação longa em cada clique. Busca, teclado e comandos muito frequentes precisam resposta imediata.

Camada compartilhada proposta: tokens de duração/curva, tratamento global e local de movimento reduzido, receitas de pressionamento/revelação, apresentação de confirmação e política de concorrência. Comandos existentes retornam resultado; UI o apresenta. A animação nunca grava XP, fragmentos, constância, tempo ou conclusões, e terminar/cancelar uma animação não decide se a ação aconteceu.

Personalidade: Terra assenta; Água flui; Ar circula; Fogo emite impulso breve. Dourado marca confirmação do sistema. São variantes do mesmo gesto, não quatro interfaces diferentes. Reservar partículas e cenas maiores para raros marcos, sem dificultar leitura ou toque.

Orçamentos iniciais para protótipo: pressionamento 100–160ms; revelações pequenas 150–250ms; drawers/modal conforme distância e gesto, 200–500ms; celebração pode durar mais sem bloquear. Preservar tokens existentes e decidir consolidação em piloto. CSS/transições para respostas simples; Motion já instalado para composição/gesto dinâmico; SVG para runas. Não gerar um vídeo para cada ação nem instalar uma nova biblioteca sem necessidade demonstrada.

## Seis lotes propostos para a próxima fase

1. **Fundação:** inventário de controles/estados por rota, tokens, reduced motion, casca, botões/diálogos e política de avisos concorrentes.
2. **Piloto Ciclos:** somar, desfazer, executar etapas, concluir, meta e constância. Aceitar num celular antes de replicar.
3. **Criação e organização:** Invocar, Forja, Rituais, Jornadas/Obras e navegação de capítulos.
4. **Exploração e leitura:** Santuário, Domínios/Pilares/Mapa, Grimório/Astrolábio e Temporal/Lua/Estações.
5. **Treinos e Roda:** adaptar receitas às sessões e ao sorteio, sem tocar economia ou fontes de tempo.
6. **Marcos e fechamento:** celebrações de conquistas, fragmentos apenas com contrato funcional, QA transversal, desempenho e consistência final. Hidratação visual pode virar um lote próprio posteriormente.

Esses são lotes de animação propostos, não seis tarefas para terminar todo o produto. R25 e contratos restantes continuam na fila existente. Os planos executáveis por arquivo serão detalhados depois da escolha/priorização de Fábio; nenhuma implementação dessa fase começou.

## Critério de conclusão

Para cada lote: cenário normal, erro, vazio, cancelamento, Undo e toques rápidos quando aplicáveis; sem duplicar comandos/recibos; foco e teclado; redução de movimento com informação preservada; 360/390/768px; barra inferior livre; pausar trabalho invisível; medir desempenho em dispositivo representativo. Tipagem/lint/testes não substituem gravação e uso real. Não prometer 60fps sem medição.

Próxima decisão recomendada: manter proteção de progresso como prioridade do produto e começar a fase visual pela fundação + piloto de Ciclos, após validar R27 no celular. R28 permanece auditoria/proposta, sem execução autorizada por inferência.
