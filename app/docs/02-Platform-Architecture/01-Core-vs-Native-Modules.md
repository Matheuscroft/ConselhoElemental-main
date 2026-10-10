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

### Templates de Módulo e agendamento no Core

Um Módulo Nativo pode manter **Templates** reutilizáveis em seu próprio armazenamento. Template é uma definição de planejamento do módulo (por exemplo, treino A com exercícios e séries); não é, por si só, uma ocorrência gamificada nem substitui uma entidade do Core. Ao agendar um template, o adapter cria ou associa uma entidade estrutural no Core:

| Agendamento | Entidade Core | Comportamento |
|---|---|---|
| Tarefa única | `Action`, `lifecycle_type = 'ACTION'`, `due_date` definida | Uma ocorrência. Após conclusão, a pendência diária desaparece; o Template continua disponível no módulo para novo agendamento. |
| Recorrência avulsa | `Action`, `lifecycle_type = 'HABIT'`, `recurrence_config` definida | Uma ocorrência em cada data programada. |
| Recorrência em sequência | `Action`, `lifecycle_type = 'HABIT'`, associada a `HabitRotation` | Ciclos escolhe um membro por data programada; conclusão ou Skip resolve a ocorrência e avança a rotação. |

O adapter persiste os dados ricos do Template e suas sessões nas tabelas isoladas do módulo. No Core, cada vínculo agendado permanece uma `Action` ou `Habit` normal, com `source_module` e `source_ref_id` apontando para o módulo e o Template de origem. Ao concluir uma sessão, o módulo consolida a métrica (no Módulo de Treino, ER → `base_value`) e o Core aplica suas próprias regras de execução. Remover ou concluir um vínculo não apaga o Template.

Quando uma Action única originada de um Template é ignorada, o usuário pode escolher Snooze para alterar seu `due_date`; a política padrão de Snooze/Rollover e a exceção de Skip para ocorrências de Módulos Nativos estão em [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md).

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
│   • base_value derivado│ • ER × 0.03       │  • temas     │
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
