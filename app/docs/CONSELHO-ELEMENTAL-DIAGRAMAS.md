# 🧙‍♂️ CONSELHO ELEMENTAL — DIAGRAMAS VISUAIS

## Diagrama de Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONSELHO ELEMENTAL                                 │
│                     Arquitetura de Dados - System Model                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ENTIDADES PRINCIPAIS                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ELEMENTO   │     │    ÁREA      │     │   TAREFA     │     │   HÁBITO     │
├──────────────┤     ├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │────▶│ id           │◀────│ id           │     │ entity_id    │
│ name         │     │ name         │     │ title        │     │ version_id   │
│ color        │     │ element_id   │     │ lifecycle    │     │ completion   │
│ icon         │     │ parent_id    │     │ base_value   │     │ recurrence   │
└──────────────┘     │ color_hex    │     │ effort       │     └──────────────┘
                     └──────────────┘     │ time         │
                                          │ area_id      │
                                          │ element_id   │
                                          │ is_completed │
                                          └──────────────┘
                                                   │
                                                   │ 1:N
                                                   ▼
                                          ┌──────────────┐
                                          │  TASK ITEM   │
                                          ├──────────────┤
                                          │ id           │
                                          │ task_id      │
                                          │ parent_id    │
                                          │ semantic_type│
                                          │ title        │
                                          │ is_completed │
                                          │ base_value   │
                                          └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              HIERARQUIA DE TIPOS                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PROJETO (Grandes Obras)                                                    │
│  ├── MISSÃO (Campanha)                                                      │
│  │   └── AÇÃO (Ritual)                                                      │
│  │       └── ACTION ITEM                                                    │
│  │           ├── Task (valuable) - Pontua                                   │
│  │           ├── Check (structural) - Não pontua                           │
│  │           └── Note (text) - Informação                                  │
│  │                                                                          │
│  └── QUEST (Jornada) - Standalone, agrupa ações                            │
│                                                                              │
│  HÁBITO (Ciclo) - Standalone, recorrente                                   │
│                                                                              │
│  RASCUNHO (Forja) - Não classificado, sem área                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         REGRA DE AGREGAÇÃO (LEAF vs AGGREGATOR)             │
└─────────────────────────────────────────────────────────────────────────────┘

    LEAF (Sem filhos Task)                    AGGREGATOR (Com filhos Task)
    ┌─────────────────────┐                   ┌─────────────────────┐
    │ ✓ base_value: 1     │                   │ ✗ base_value: NULL  │
    │ ✓ effort_level: 3   │                   │ ✗ effort_level: NULL│
    │ ✓ planned_time: 30  │                   │ ✗ planned_time: NULL│
    │ ✓ SCORABLE          │                   │ ✗ NOT SCORABLE      │
    │                     │                   │                     │
    │ Pontuação própria   │                   │ Soma dos filhos     │
    └─────────────────────┘                   └─────────────────────┘
              │                                          ▲
              │ Adiciona primeiro filho Task             │
              └──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FÓRMULA DE PONTUAÇÃO                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  VALOR PLANEJADO (Planned Value)                                    │
    │                                                                     │
    │  projected_leaf = base × (1+presence) × effort × time × exhaustion  │
    │                                                                     │
    │  ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐│
    │  │   base     │ │  presence   │ │   effort    │ │      time       ││
    │  │ default: 1 │ │ +0.0 a +0.5 │ │ ×1.0 a ×2.8 │ │  ×1.0 a ×80.0   ││
    │  │ (aceita    │ │             │ │             │ │  Escalonamento  ││
    │  │ decimais)  │ │             │ │             │ │  Agressivo:     ││
    │  │            │ │             │ │             │ │  > 120m = ×80   ││
    │  └────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘│
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  PRANA (Energia) — modificador global do usuário                   │
    │                                                                     │
    │  Custo por effort_level:   1=-5   2=-10   3=-15   4=-25   5=-35     │
    │  Restaurador (Sono/Meditação): recupera Prana em vez de custar     │
    │  Veneno: custa Prana normalmente, mas gera 0 pontos elementais      │
    │  exhaustion = ×0.5 em TODOS os multiplicadores se prana_level <= 0  │
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  DISTRIBUIÇÃO POR ÁREA (Multi-Area)                                 │
    │                                                                     │
    │  final_value = base × (1+presence) × effort × time × exhaustion    │
    │                                                                     │
    │  ┌─────────────────────────────────────────────────────────────┐   │
    │  │  Área Primária:    final_value × 1.00 = 100%               │   │
    │  │  Área Secundária 1: final_value × 0.60 = 60%               │   │
    │  │  Área Secundária 2: final_value × 0.30 = 30%               │   │
    │  └─────────────────────────────────────────────────────────────┘   │
    │                                                                     │
    │  Total distribuído: 190% do final_value (cross-pollination)        │
    └─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUXO DE DADOS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │   CRIAR     │────▶│  CLASSIFICAR│────▶│   PLANEJAR  │────▶│  EXECUTAR   │
    │  (Quick Add)│     │(Questionário)│     │  (Editar)   │     │ (Timer)     │
    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
          │                   │                   │                   │
          ▼                   ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │ lifecycle:  │     │ lifecycle:  │     │ base_value  │     │ actual_time │
    │ null        │     │ ACTION/etc  │     │ effort      │     │ completed   │
    │ area: null  │     │ area: set   │     │ time        │     │ items       │
    │ base: null  │     │ base: 1     │     │             │     │             │
    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                        │
                                                                        ▼
                                                               ┌─────────────┐
                                                               │ EXECUTION   │
                                                               │ LOG         │
                                                               │ (imutável)  │
                                                               └─────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              TELAS DO SISTEMA                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 SANTUÁRIO (Dashboard)                                                   │
│  ├── Equilíbrio dos 4 Elementos (Radar/Gráfico)                            │
│  ├── Cards de Elementos com pontuação                                      │
│  ├── Domínios Superiores (Áreas principais)                                │
│  └── Acesso rápido a rituais do dia                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  📜 RITUAIS (Tarefas)                                                       │
│  ├── Lista de tarefas pendentes                                            │
│  ├── Filtros por área/elemento                                             │
│  ├── Cronômetro de execução                                                │
│  └── Visualização hierárquica (TreeView)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔄 CICLOS (Hábitos)                                                        │
│  ├── Visão: Dia / Semana / Mês / Trimestre / Ano                          │
│  ├── Calendário de streaks                                                 │
│  ├── Streak atual                                                          │
│  └── Frequência e evolução                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  🗺️ JORNADAS (Quests)                                                       │
│  ├── Quests ativas                                                         │
│  ├── Progresso por quest                                                   │
│  ├── Tarefas vinculadas                                                    │
│  └── Recompensas                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  🏗️ GRANDES OBRAS (Projetos)                                                │
│  ├── Lista de projetos                                                     │
│  ├── Campanhas (missões) por projeto                                       │
│  ├── Progresso agregado                                                    │
│  └── Timeline                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔨 FORJA (Rascunhos)                                                       │
│  ├── Itens não classificados                                               │
│  ├── Questionário de triagem                                               │
│  └── Sugestão de tipo (Tarefa/Hábito/Quest/Projeto)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔮 ASTROLÁBIO (Analytics)                                                  │
│  ├── Evolução por elemento (gráfico de linha)                              │
│  ├── Evolução por área                                                     │
│  ├── Distribuição percentual (gráfico de pizza)                            │
│  ├── Streaks e heatmap                                                     │
│  └── Linha do tempo elemental                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  📖 GRIMÓRIO (Perfil)                                                       │
│  ├── Avatar do mago                                                        │
│  ├── Nível e XP                                                            │
│  ├── Pontuação por elemento                                                │
│  ├── Barra de progresso para próximo nível                                 │
│  ├── Streak atual                                                          │
│  ├── Estatísticas gerais                                                   │
│  └── Histórico visual                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ➕ INVOCAR (Criar)                                                         │
│  ├── Formulário rápido                                                     │
│  ├── Seleção de tipo                                                       │
│  ├── Seleção de área                                                       │
│  ├── Nível de esforço                                                      │
│  └── Tempo estimado                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SISTEMA DE DESIGN                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  PALETA DE CORES                                                    │
    │                                                                     │
    │  Fundo:                    #0A0A0F (void-black)                    │
    │  Cards:                    #1A1025 (deep-purple)                   │
    │                                                                     │
    │  Terra:  #3E5F44 ──🌿──  #4CAF50  (glow: rgba(62,95,68,0.4))      │
    │  Fogo:   #D14900 ──🔥──  #FF6B35  (glow: rgba(209,73,0,0.5))      │
    │  Água:   #1B4965 ──🌊──  #48CAE4  (glow: rgba(27,73,101,0.4))     │
    │  Ar:     #A8DADC ──💨──  #E0F7FA  (glow: rgba(168,218,220,0.3))   │
    │                                                                     │
    │  Destaque: #FFD700 (mana-gold)                                     │
    │  Magia:    #9D4EDD (arcane-purple)                                 │
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  TIPOGRAFIA                                                         │
    │                                                                     │
    │  Títulos:    Cinzel, Playfair Display (serif)                      │
    │  Corpo:      Inter, Roboto (sans-serif)                            │
    │  Místico:    Cinzel Decorative (display)                           │
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  EFEITOS VISUAIS                                                    │
    │                                                                     │
    │  ✨ Glow elemental por elemento                                     │
    │  🌟 Gradientes etéreos                                              │
    │  💫 Animações de aura pulsante                                      │
    │  🔮 Partículas flutuantes                                           │
    │  ⚡ Transições suaves                                               │
    └─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENTES REUTILIZÁVEIS                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  ElementCard    │  │   TaskCard      │  │   AreaBadge     │
    │  ─────────────  │  │  ────────────   │  │  ────────────   │
    │  🔥 Fogo        │  │  ☐ Ritual       │  │  45 Saúde       │
    │  Ação & Projetos│  │  🌿 Saúde       │  │  +27 Criatividade│
    │  [=======68%]   │  │  ⏱️ 30 min      │  │                 │
    │  1,250 pts      │  │  [Iniciar]      │  │  (com valor!)   │
    └─────────────────┘  └─────────────────┘  └─────────────────┘

    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  TimerModal     │  │  TreeView       │  │  ElementRadar   │
    │  ─────────────  │  │  ────────────   │  │  ────────────   │
    │  ⏱️ 15:32       │  │  ▼ Ritual       │  │      🔥         │
    │  [Pausar]       │  │    ├─ ☐ Item 1  │  │    🌿    💨     │
    │  [Concluir]     │  │    └─ ☐ Item 2  │  │      🌊         │
    └─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUXOS PRINCIPAIS                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  FLUXO: Criar e Executar um Ritual                                  │
    │                                                                     │
    │  1. Invocar → Ritual                                               │
    │  2. Preencher: título, área, esforço, tempo                         │
    │  3. Salvar → aparece na lista                                       │
    │  4. Iniciar → cronômetro começa                                     │
    │  5. Executar → pausar/continuar conforme necessário                 │
    │  6. Concluir → tempo salvo, pontuação calculada                     │
    │  7. Feedback → pontos ganhos, progresso na área/elemento            │
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  FLUXO: Triagem na Forja (Rascunho → Classificado)                  │
    │                                                                     │
    │  1. Criar na Forja → apenas título                                  │
    │  2. Classificar → questionário                                      │
    │  3. Perguntas:                                                      │
    │     - É recorrente? → Hábito                                        │
    │     - Tem etapas? → Quest/Projeto                                   │
    │     - É grande? → Projeto/Missão                                    │
    │     - Senão → Tarefa                                                │
    │  4. Atribuir: área, esforço, tempo, subárea                         │
    │  5. Confirmar → rascunho convertido                                 │
    └─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  FLUXO: Onboarding do Mago                                          │
    │                                                                     │
    │  1. Boas-vindas ao Conselho Elemental                               │
    │  2. Escolha do avatar                                               │
    │  3. Apresentação dos 4 elementos                                    │
    │  4. Seleção de áreas iniciais (mínimo 1 por elemento)               │
    │  5. Primeira invocação (criar ritual/hábito)                        │
    │  6. Santuário inicial com áreas selecionadas                        │
    └─────────────────────────────────────────────────────────────────────┘
