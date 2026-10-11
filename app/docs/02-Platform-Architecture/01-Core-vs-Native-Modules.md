---
title: "Platform Architecture: Core Engine vs. Módulos Nativos"
version: "3.0"
date: "2026-10-09"
status: "Canonical — Padrão Adapter e Módulos Nativos"
---

# 01. Core Engine vs. Módulos Nativos Específicos

Documenta o padrão **Adapter** que separa o motor genérico de listas e pontuação (Core Engine) das experiências especializadas dos Módulos Nativos, incluindo Grimório (leitura), Módulo de Treino (atividade física) e Diário de Sonhos. A Forja é a inbox de Rascunhos e triagem; não é um módulo de treino.

Convenções de persistência: tabelas `snake_case` no plural; modelos TypeScript `PascalCase` no singular; colunas e propriedades JSON `snake_case`. Todo ID/FK, inclusive `source_ref_id`, é UUID v4 representado como string; IDs numéricos sequenciais são proibidos nas tabelas de domínio.

---

## 1. Por que essa separação existe

O Core Engine (banco de dados, entidades macro, árvore `actions`, Motor de Pontuação e Lista Diária) é **agnóstico de domínio nativo**: conhece `ACTION`/`HABIT` na raiz e `semantic_type` (`VALUABLE`/`VALUELESS`/`NOTE`) nos descendentes recursivos de `actions`. Não existe tabela `action_items`. O Core não sabe o que é "uma página de livro" ou "uma série de treino".

Módulos Nativos, por outro lado, têm **modelos de domínio próprios**: o Grimório acompanha progresso por página/capítulo, o Módulo de Treino calcula volume de treino e o Diário de Sonhos acompanha registros de sonhos. Essa lógica **não pertence ao Core**. O módulo transforma sua métrica em dados consolidados compatíveis com o contrato de injeção; o Core permanece responsável pelo cálculo canônico de pontos e Prana.

A ponte entre os dois mundos é o padrão **Adapter**, já parcialmente formalizado pela interface `IActionLike` do domínio.

### Definição de Módulo Nativo

Um **Módulo Nativo não é uma entidade de domínio alienígena ou independente**. É uma experiência funcional encapsulada sobre uma ou mais **Áreas** do sistema: apresenta UI especializada, fluxo de planejamento próprio e lógica de domínio adequada à atividade, mas classifica seus resultados usando as áreas, elementos e entidades estruturais do Core.

| Módulo | Área(s) de referência | Elemento(s) | Exemplo de especialização |
|---|---|---|---|
| **Grimório** | Leitura & Conteúdo (`area-leitura-conteudo`) | Ar | Planejamento de livros, sessões e progresso por páginas/capítulos. |
| **Módulo de Treino** | Saúde Física (`area-saude-fisica`, Terra) e Alta Performance (`area-alta-performance`, Fogo), conforme o foco definido pelo usuário | Terra e Fogo | Planejamento de exercícios, séries, repetições e carga. |

O módulo pode manter seus próprios dados operacionais (por exemplo, catálogo de livros ou séries e repetições), mas a atividade que participa da gamificação deve ser representada no Core por uma `Action` ou `Habit` com uma ou mais áreas válidas. O módulo não cria um novo Elemento nem uma entidade estrutural paralela para substituir `Action`/`Habit`.

O vínculo entre módulo e Área define contexto e experiência de planejamento; não altera as regras de pontuação. A área primária continua sujeita à distribuição multiárea do Core, e efeitos de Ressonância Elemental são calculados separadamente conforme [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

### Planejamento nativo e ativação explícita no Core

O Módulo Nativo separa dois ambientes. **Planejamento** é a biblioteca interna de blueprints reutilizáveis; **Execução** é a ocorrência ativada no Core e exibida na Lista Diária/Ciclos. Criar ou editar conteúdo na biblioteca nunca agenda, publica ou conclui algo no Core automaticamente. A ponte só é acionada por uma escolha explícita do usuário: executar agora, agendar, enviar para recorrência ou ativar uma sequência.

#### Glossário do Módulo de Treino

- **Modalidade**: classificação nativa do catálogo — por exemplo, Yoga, Calistenia ou Musculação. Não é uma `Area` do Core nem cria uma subárea elemental; o vínculo com áreas válidas é escolhido ao ativar a atividade.
- **`Exercise` (catálogo)**: referência reutilizável com instruções, mídia e valores sugeridos. É conteúdo de consulta; executar não altera o exercício de catálogo.
- **`WorkoutExercise<'planned'>` / `WorkoutExercise<'executed'>`**: instância de um exercício dentro de um plano ou sessão. Guarda snapshot identificável do exercício e agrega as séries configuradas ou realizadas.
- **`WorkoutSet`**: uma série. Pode registrar repetições dinâmicas ou duração/isometria, carga, conclusão e, no planejamento, valores-alvo. Séries puladas ou não concluídas não integram o volume executado.
- **`WorkoutTemplate` (treino)**: blueprint ordenado de instâncias planejadas de exercícios na biblioteca do módulo. Sua existência não cria uma `Action` ou `Habit`.
- **`WorkoutSequence` (sequência)**: blueprint ordenado de referências a `WorkoutTemplate`. Continua na biblioteca até ativação; não é, por si, uma `HabitRotation`.
- **`WorkoutSession` (execução nativa)**: snapshot dos exercícios e séries realmente registrados. `templateId` é opcional: sua ausência representa uma sessão avulsa, sem template. Catálogo e plano permanecem preservados.

#### Ativação solicitada e entidade estrutural

| Ação explícita do usuário | Resultado no Core | Efeito |
|---|---|---|
| Executar agora ou agendar um treino para uma data | `Action`, `lifecycle_type = 'ACTION'` | Uma ocorrência na data escolhida. O template continua reutilizável após a execução. |
| Enviar um treino para frequência regular | `Action`, `lifecycle_type = 'HABIT'` | O Core define e mantém a recorrência; o módulo mantém o template e seus dados ricos. |
| Ativar uma sequência | `HabitRotation` e um `Habit` vinculado para cada template ordenado | Ciclos aplica agenda, membro corrente e avanço da rotação. Uma sequência só existe no Core depois dessa ativação. |

O Adapter mantém a relação entre o blueprint nativo e a entidade ativada no Core. Para treino, `source_module = 'modulo_treino'`. Na Action avulsa criada ao concluir uma sessão, `source_ref_id = session.id`; o vínculo ao blueprint permanece em `session.templateId`. Para ativação recorrente/agendada, a referência de planejamento deve permanecer separada da correlação de execução. IDs de template, sessão e entidade Core são UUID v4 distintos. O contrato de persistência/API precisa conservar essas relações sem sobrescrever a referência de planejamento.

#### Execução e consolidação

Uma sessão iniciada a partir de treino agendado conclui a ocorrência Core já vinculada; não cria uma segunda `Action`. A execução avulsa, sem template, também pode ser registrada. Nesse caso, concluir a sessão é a ativação explícita daquela ocorrência: o Adapter cria/resolve uma `Action` única para a data e registra um único `ExecutionLog` no Core. Nunca se cria um `Habit` por inferência de uma execução isolada.

O módulo guarda os detalhes nativos — exercícios, séries, repetições, duração/isometria e carga — e consolida somente séries efetivamente concluídas em ER e `base_value`, conforme [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md#5-módulo-de-treino-equivalentes-de-repetição). Uma sessão completa produz exatamente um `ExecutionLog` no Core, não um por exercício ou série. O Core permanece responsável por pontuação, Prana, recorrência, data de execução e idempotência. A execução na Lista Diária/Ciclos e o histórico do módulo referenciam a mesma sessão, sem duplicar conclusão ou recompensa.

Templates e sequências permanecem na biblioteca ao ativar ou concluir um vínculo. Desativar/remover um vínculo do Core não apaga os blueprints nem as sessões do módulo.

Quando uma Action única originada de um Template é ignorada, o usuário pode escolher Snooze para alterar seu `due_date`; a política padrão de Snooze/Rollover e a exceção de Skip para ocorrências de Módulos Nativos estão em [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md).

### Planejamento de duração, esforço e feedback de Fitness

O template mantém esforço global opcional (1–5) e duração estimada em modo automático ou override manual. Formulários novos sugerem esforço 3; dados sem esforço explícito mantêm padrão Core 1. O autoestimador usa 4 segundos por repetição dinâmica, duração exata de séries por tempo, descansos e 60 segundos de transição após o primeiro exercício. Trata-se de heurística de planejamento, não medição clínica. Fórmula, arredondamento e hipótese de presença do preview estão nas seções 5.4 e 5.5 de [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

Iniciar a sessão copia o esforço para o snapshot nativo. Na conclusão, o Adapter transmite o esforço e a duração real ao Core, junto com o base_value consolidado; duração estimada nunca substitui duração real. O preview e o despacho compartilham multiplicadores e teto do Core; preview assume presença ×1.5, enquanto o despacho calcula presença pela faixa real. A biblioteca continua inerte: calcular preview não cria Action/Habit/ExecutionLog ou recompensa. Cards de histórico e modal de conclusão obtêm XP exclusivamente do log canônico, com destaque verde Terra 🌿 e ER secundário. Registros anteriores não são recalculados.

### Classificação de Rascunhos e Adapter de domínio

Quando Quick Edit ou Wizard classifica um Rascunho e atribui uma área controlada por um Módulo Nativo, o Dispatcher deve encaminhar o usuário ao modal especializado desse módulo. Também se aplica a edições de entidades criadas contextualmente. A seleção de área é o gatilho de roteamento; o modal coleta os dados ricos e validações de domínio.

Essa transição não cria um tipo estrutural paralelo no Core. O resultado continua sendo uma `Action` ou `Habit` de acordo com o ciclo de vida escolhido. Dados específicos (por exemplo, séries, repetições e carga) são persistidos nas tabelas isoladas do Módulo de Treino. O Adapter então devolve ao Core a entidade estrutural atualizada, preenchendo `source_module`, `source_ref_id` e o `base_value` fracionário calculado pelo módulo (no Treino, a partir de ER). O Core conserva a autoridade sobre pontuação, Prana, recorrência e exibição na Lista Diária.

```text
Rascunho genérico → usuário escolhe área controlada → Dispatcher abre modal nativo
                 → módulo persiste dados ricos → Adapter atualiza Action/Habit no Core
                 → Core recebe source_module + source_ref_id + base_value
```

---

## 2. O Padrão Adapter

```
┌──────────────────────────────────────────────────────────┐
│                     MÓDULOS NATIVOS                        │
│         (interfaces ricas, matemática própria)             │
├──────────────────────────────────────────────────────────┤
│   Grimório (Leitura)   │ Módulo de Treino  │  Diário de   │
│   • páginas lidas      │ • séries/reps     │  Sonhos      │
│   • progresso/capítulo │ • carga/volume    │  • lucidez   │
│   • base_value derivado│ • ER × 0.10       │  • temas     │
│                        │     por repetição  │  recorrentes │
└───────────┬────────────┴─────────┬──────────┴──────┬───────┘
            │                      │                 │
            │   injeta ACTION/HABIT consolidado       │
            │   (via adapter, formato IActionLike)    │
            ▼                      ▼                 ▼
┌──────────────────────────────────────────────────────────┐
│                        CORE ENGINE                          │
│   • Executáveis: `actions` (ACTION/HABIT)                    │
│   • Árvore de passos: `actions.parent_id`                    │
│   • Agregadores: `projects`, `quests`, `missions`            │
│   • Motor de Pontuação (base/planned/executed)               │
│   • Lista Diária (funil agnóstico)                            │
│   • Não sabe nada sobre "páginas" ou "séries" — só vê         │
│     um ACTION/HABIT com base_value, effort_level, área.       │
└──────────────────────────────────────────────────────────┘
```

### Responsabilidades do Core Engine
- Persistência da árvore Action/Habit em `actions`, agregadores em `projects`/`quests`/`missions` e histórico de `ExecutionLog`.
- Data Migration Service para conversões entre naturezas, com migração transacional de árvore, associações e referências históricas conforme [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md#4-conversão-de-entidades-data-migration-service). Esse serviço pertence ao Core e não deve ser implementado como lógica de Adapter de Módulo Nativo.
- Motor de Pontuação e Energia (fórmulas de [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)).
- Lista Diária como funil de exibição (ver [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md)).
- Nunca conhece a lógica de domínio de nenhum Módulo Nativo.

### Responsabilidades de um Módulo Nativo
- UI e fluxo especializados (tela de leitura, tela de treino, diário de sonhos).
- Cálculo de progresso específico do domínio (páginas, séries, lucidez).
- Tradução do progresso interno em uma ou mais instâncias consolidadas de `ACTION` ou `HABIT` — usando `base_value` fracionário quando fizer sentido. Para o Módulo de Treino, a conversão normativa é por Equivalentes de Repetição (ER), conforme [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md#5-módulo-de-treino-equivalentes-de-repetição).
- O Módulo de Treino permite encaminhar o treino consolidado à aba Ciclos como Hábito recorrente ou membro de uma `HabitRotation`; a recorrência e o ponteiro da rotação pertencem ao Core, não ao módulo de treino.
- Assinatura de eventos vindos do Core (ver seção 4) para atualizar seu próprio estado interno quando o usuário interage a partir da Lista Diária.

---

## 3. Contrato de Injeção (Adapter Interface)

O contrato reaproveita a interface `IActionLike` já definida no domínio — módulos nativos **produzem** objetos compatíveis com ela; o Core **consome** sem conhecer a origem.

```typescript
interface IActionLike {
  id: string;                         // UUID v4 textual
  lifecycle_type: 'ACTION' | 'HABIT' | null; // null em descendentes
  parent_id: string | null;          // UUID v4; null somente para raiz
  semantic_type: 'VALUABLE' | 'VALUELESS' | 'NOTE' | null; // preenchido nos descendentes
  project_id?: string | null;         // UUID v4 textual
  quest_id?: string | null;           // UUID v4 textual; use vínculo N:N se compartilhada
  mission_id?: string | null;         // UUID v4 textual
  title: string;
  description?: string;
  area_id: string | null;          // UUID v4 textual
  display_order: number;
  time: number;                 // minutos (planejado ou executado)
  score: number;                 // base_value consolidado (pode ser fracionário)
  completed: boolean;
  children: IActionLike[];            // projeção recursiva de actions.parent_id
  source_module?: NativeModuleId;    // NOVO: identifica o módulo de origem
  source_ref_id?: string;            // UUID v4 textual do registro interno do módulo
}

type NativeModuleId = 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
```

### Exemplo: Grimório (Leitura) injeta uma Action consolidada

```typescript
// Módulo Grimório calcula: usuário leu 32 páginas hoje no livro X
function buildDailyReadingAction(session: ReadingSession): IActionLike {
  return {
    id: uuid_v4(),
    lifecycle_type: 'ACTION',
    title: `Leitura: ${session.bookTitle} (${session.pagesRead} páginas)`,
    area_id: session.area_id, // UUID v4 da área de Leitura & Conteúdo
    display_order: 0,
    time: session.minutesSpent,
    score: session.pagesRead * 0.1,   // base_value fracionário (Motor de Pontuação, seç. 1)
    completed: true,
    parent_id: null,
    semantic_type: null,
    children: [],
    source_module: 'grimorio',
    source_ref_id: session.id, // UUID v4 textual
  };
}
```

O Core recebe esse objeto, normaliza-o para `Action`/`ExecutionLog` e o processa com **as mesmas fórmulas** de qualquer outro item — o Core não sabe (nem precisa saber) que a origem foi uma sessão de leitura.

---

## 4. Fluxo de Sincronização Inversa (Core → Módulo)

Quando o usuário interage com o item **a partir da Lista Diária** (ex.: conclui uma sessão consolidada pelo Módulo de Treino), o Core avisa o módulo de origem para que atualize seu estado de domínio. Este fluxo é detalhado em [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md) (seção "Webhook de Retorno").

```
[Usuário dá check na Lista Diária]
        ↓
[Core marca ExecutionLog + dispara evento]
        ↓
[Evento: { source_module: 'modulo_treino', source_ref_id: '...', completed_at }]
        ↓
[Módulo de Treino escuta o evento e atualiza seu histórico interno de sessão]
```

---

## 5. Regras Invariantes

- ✅ Módulos Nativos **nunca** escrevem diretamente nas tabelas de agregação do Core além de criar/atualizar a `Action`/`Habit` consolidada via adapter — toda pontuação passa pelo Motor de Pontuação central.
- ✅ O Core **nunca** importa código ou tipos específicos de um Módulo Nativo — a dependência é unidirecional (módulo → Core), nunca o inverso.
- ✅ Cada Módulo Nativo é responsável por manter `source_module` + `source_ref_id` consistentes para permitir o webhook de retorno.
- ✅ `base_value` fracionário pode ser fornecido por módulo nativo identificado em `source_module`; o Core valida e aplica o teto de pontuação por esforço e a distribuição de orçamento constante.

## 6. Referências

- Fórmulas de pontuação e `base_value` fracionário → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- Lista Diária como funil agnóstico → [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md)
- Interface `IActionLike` (base para Action/Habit unificados) → [02-Acoes-e-Habitos.md](./02-Acoes-e-Habitos.md)

### Ativação semanal de template Fitness (2026-10-10)
Tornar Ciclo pede dias 0–6 (domingo–sábado), todos inicialmente selecionados e ao menos um obrigatório. WorkoutStore delega ao Adapter scheduleWorkoutAsHabit, que resolve Exercício Físico/Terra no catálogo global/customizado e cria raiz HABIT neutra via addHabit. Estado TypeScript usa camelCase (recurrenceConfig.daysOfWeek, sourceModule/sourceRefId), equivalente ao contrato snake_case. BaseValue é ER×0.10, esforço ausente assume3 nesta ativação, tempo planejado vem do template. Core grava actions e projeção habits com mesmo UUIDv4. Vínculo aponta ao template; repetição da ativação retorna ciclo existente sem duplicar. Criação não gera ExecutionLog, XP ou Prana. Treino/valores são snapshot na ativação; editar ou excluir blueprint não modifica ciclo já criado. IDs de área seguem catálogo existente (ainda legado, sem migração nesta etapa).

### Rich Widget de execução em Ciclos
FitnessHabitWidget lê template pelo sourceRefId e mantém séries exclusivamente na sessão nativa. Na conclusão, finishSession(habitId) vincula o log ao HABIT existente; Core registra HabitCompletion e energia/XP no mesmo despacho. Não cria Action extra ou subtarefas, nem concede uma segunda recompensa via completeHabit. Log mantém sourceRefId da sessão, hábito mantém sourceRefId do template. Execução inline somente no dia atual; histórico mostra snapshots reais, preview usa multiplicadores Core. Criar sessão ou editar séries não pontua.
