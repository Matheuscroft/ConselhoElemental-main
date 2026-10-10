---
title: "Platform Architecture: Ações e Hábitos"
version: "7.0"
date: "2026-10-09"
status: "Canonical — raiz executável e árvore recursiva em actions"
---

# 02. Ações e Hábitos

Este documento especifica o modelo temporal de `actions`. As raízes têm `lifecycle_type='ACTION'` ou `lifecycle_type='HABIT'`; filhos, netos e demais descendentes permanecem na mesma tabela por `parent_id`. Agregadores macro (`projects`, `quests`, `missions`) continuam em tabelas próprias. A antiga tabela `action_items` está abolida. O modelo relacional completo está em [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).

## 0. Convenções de persistência e nomenclatura

- Todas as chaves primárias e estrangeiras de entidades de domínio são UUID v4 serializados como texto/string. Isso inclui `id`, `parent_id`, `rotation_id`, `project_id`, `quest_id`, `mission_id`, `source_ref_id` e IDs de usuário/área. IDs sequenciais são proibidos em tabelas de domínio.
- Tabelas físicas usam `snake_case` plural (`actions`, `projects`, `quests`, `missions`, `habit_rotations`, `rotation_memberships`). Modelos TypeScript usam `PascalCase` singular (`Action`, `Project`, `Quest`, `Mission`, `HabitRotation`). Propriedades de payload e nomes de coluna usam `snake_case`, inclusive em JSON de API.
- UUID deve ser gerado pelo cliente ou camada de domínio com versão 4 antes da gravação para suportar criação offline-first e sincronização assíncrona. FKs preservam o mesmo formato textual e referenciam UUIDs, sem conversão para números.

| Interface (PT) | Modelo (TS) | Tabela | Regra de identidade |
|---|---|---|---|
| Tarefa/Ação | `Action` | `actions` | `lifecycle_type = 'ACTION'`; execução única agendada por `due_date`. |
| Ciclo | `Habit` | `actions` | `lifecycle_type = 'HABIT'`; recorrência definida por `recurrence_config`. |
| Etapa/Subtarefa | `Action` descendente | `actions` | `parent_id` aponta para o pai imediato; `semantic_type` define VALUABLE/VALUELESS/NOTE. |
| Sequência | `HabitRotation` | `habit_rotations` | Estado separado de fila diária de membros Habit. |

### Payload JSON canônico

O contrato de API espelha as colunas em `snake_case`. Os valores abaixo são UUIDs v4 textuais; exemplos de IDs numéricos não são válidos para entidades ou relacionamentos de domínio.

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "parent_id": null,
  "project_id": null,
  "quest_id": null,
  "lifecycle_type": "ACTION",
  "semantic_type": null,
  "title": "Preparar refeição",
  "due_date": "2026-10-10",
  "effort_level": 3,
  "area_primary_id": "2f47c10b-58cc-4372-a567-0e02b2c3d479",
  "controlled_by_rotation_id": null,
  "source_ref_id": null
}
```

Um descendente usa a mesma tabela `actions`; recebe `parent_id` UUID v4, herda semanticamente o `lifecycle_type` da raiz (a coluna local é `null`) e declara obrigatoriamente seu próprio `semantic_type`:

```json
{
  "id": "bbaac10b-58cc-4372-a567-0e02b2c3d479",
  "parent_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "lifecycle_type": null,
  "semantic_type": "VALUABLE",
  "title": "Preparar os ingredientes",
  "base_value": 1.0,
  "effort_level": 1,
  "is_completed": false
}
```

---

## 1. Hábito = Action + Recorrência

```typescript
interface Action {
  id: string;                        // UUID v4 em representação textual
  title: string;
  parent_id?: string | null;         // null na raiz; UUID do pai nos descendentes
  lifecycle_type: 'ACTION' | 'HABIT' | null; // definido apenas na raiz
  semantic_type?: 'VALUABLE' | 'VALUELESS' | 'NOTE' | null; // obrigatório em descendentes
  project_id?: string | null;         // UUID v4 textual
  quest_id?: string | null;           // UUID v4 textual; N:N via join quando compartilhada
  mission_id?: string | null;         // UUID v4 textual
  base_value?: number;             // aceita decimais (Motor de Pontuação)
  effort_level?: number;           // 1–5
  planned_time_minutes?: number;
  due_date?: string | null;        // data operacional de ACTION; também pode limitar uma ocorrência de HABIT
  area_primary_id?: string;           // UUID v4
  area_secondary_ids?: string[];
  task_energy_type?: 'NEUTRAL' | 'RESTORATIVE' | 'POISON';

  // Campos exclusivos de recorrência (só relevantes quando lifecycle_type = 'HABIT')
  recurrence_enabled?: boolean;
  recurrence_type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  recurrence_config?: RecurrenceConfig | null;

  // Ownership por rotação (seção 3)
  controlled_by_rotation_id?: string | null;
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos' | null;
  source_ref_id?: string | null;      // UUID v4 do registro nativo
}

type RecurrenceConfig =
  | { days_of_week: number[] }              // DAILY/WEEKLY: 0=Domingo .. 6=Sábado
  | { day_of_week: number; interval: number } // WEEKLY com intervalo
  | { day_of_month: number; interval: number } // MONTHLY
  | { month: number; day: number };           // YEARLY
```

**Regra:** Action e Habit são raízes da tabela `actions`, distinguidas por `lifecycle_type`; descendentes de qualquer profundidade são linhas da mesma tabela ligadas por `parent_id`, com `lifecycle_type=null` e `semantic_type` obrigatório. A coluna `semantic_type` não define o tipo da raiz. Projetos, Quests e Missões mantêm tabelas macro próprias.

1. `lifecycle_type = 'ACTION'`: execução única agendada por `due_date`.
2. `lifecycle_type = 'HABIT'`: recorrência configurada por `recurrence_config`.
3. A Lista Diária filtra cada modelo pelo campo de agenda correspondente.

Não criar tabela física `habits` ou `action_items`. Habit continua sendo a raiz `actions` com `lifecycle_type='HABIT'`; Projetos, Quests e Missões continuam em suas tabelas próprias. Todos os IDs da árvore são UUID v4 e cada descendente referencia o pai imediato por `parent_id`.

### Criação contextual por tela

O botão Criar da tela Ciclos cria diretamente uma entidade classificada, sem passar por Rascunhos: `lifecycle_type = 'HABIT'`, recorrência diária inicial e área provisória invisível `area-sem-categoria`. O usuário substitui a área ao concluir a edição do domínio. Os botões de Tarefas, Quests e Projetos aplicam as mesmas regras contextuais descritas em [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md). Rascunhos só são criados no Inbox de Rascunhos. Se uma edição posterior selecionar área controlada por Módulo Nativo, o Dispatcher abre o modal específico e o Adapter preenche os metadados de origem, conforme [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md).

### Herança das regras estruturais

Hábitos seguem **exatamente** as mesmas regras de [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md):
- Podem ser LEAF (pontuável diretamente) ou AGGREGATOR conforme seus descendentes `VALUABLE` em `actions`, em qualquer profundidade.
- Podem ter `task_energy_type` = `RESTORATIVE` (ex.: Sono, Meditação) — recuperam Prana em vez de consumir.
- `base_value` pode ser fracionário quando originado de um Módulo Nativo (ver [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)).

Etapas e subtarefas são nós `actions` descendentes. Cada nível pode ter novos filhos via `parent_id`; os descendentes herdam a agenda e o contexto da raiz e devem ter `semantic_type` próprio. Não há tabela `action_items` nem limite de profundidade. Regras de tipo, constraints e efeito de `VALUABLE`/`VALUELESS`/`NOTE` estão em [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).

### Conversão de entidade após criação

Action↔Habit conserva a mesma linha e UUID, com validação e substituição do tipo de agenda. Conversões entre Actions/Habits e agregadores macro passam pelo Data Migration Service: cria-se o registro destino na tabela correta, move-se a árvore e seus vínculos, migram-se referências históricas sem recalcular valores e só então remove-se a origem na mesma transação. Falhas geram rollback integral. A especificação, incluindo Action→Project e Quest→Project, está em [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md#4-conversão-de-entidades-data-migration-service).

### Marcos de Consistência do Hábito

Consistência não é um streak de dias consecutivos com reset histórico. Ela é medida por ocorrências concluídas nas datas programadas e pelo avanço em ciclos definidos para o Hábito. Se uma execução programada for perdida, o ciclo corrente perde avanço ou reinicia conforme sua meta configurada; medalhas e marcos anteriormente conquistados permanecem no histórico do usuário.

Metas semanais e mensais podem conceder badges colecionáveis ao Grimório/Perfil e bônus de XP Elemental configurados por marco. Nenhum marco ou badge concede Prana. Para o estado diário (`MANAGED`/`FLAWLESS`) e o Bônus de Harmonia, ver [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md) e [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

### Filtro de exibição por data (Lista Diária)

```typescript
function shouldHabitAppear(habit: Action, targetDate: Date): boolean {
  if (habit.lifecycle_type !== 'HABIT') return false;
  if (habit.controlled_by_rotation_id) return false; // controlado por rotação, ver seção 3

  const dayOfWeek = targetDate.getDay();
  const allowedDays = habit.recurrence_config?.days_of_week ?? [0, 1, 2, 3, 4, 5, 6];
  return allowedDays.includes(dayOfWeek);
}
```

---

## 2. `IActionLike` — Interface Unificada de Consumo

A UI nunca deve distinguir Action de Habit por tipo — ambos são normalizados para `IActionLike` antes de chegar aos componentes:

```typescript
interface IActionLike {
  id: string;                         // UUID v4 textual
  lifecycle_type: 'ACTION' | 'HABIT' | null; // null em descendentes
  parent_id: string | null;
  semantic_type: 'VALUABLE' | 'VALUELESS' | 'NOTE' | null;
  title: string;
  description?: string;
  area_id: string | null;            // UUID v4 textual
  display_order: number;
  time: number;
  score: number;
  completed: boolean;
  children: IActionLike[];            // recursividade de profundidade ilimitada
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
  source_ref_id?: string;             // UUID v4 textual
}

```

**Invariantes:**
- Componentes de UI (`ActionCard`, `ActionList`, `ActionModal`) **nunca** importam tipos `Action`/`Habit` diretamente — só `IActionLike`.
- Normalização acontece na camada de serviço/seletor, nunca dentro de componentes.
- Não existe `HabitCard` nem `HabitList` — reuso total de componentes.

---

## 3. HabitRotation — Rotação Sequencial de Hábitos

**Escopo:** `HabitRotation` controla somente raízes Habit (`actions.parent_id IS NULL AND lifecycle_type='HABIT'`), nunca Actions avulsas. É uma fila sequencial de calendário com avanço no eixo dos dias: no máximo um membro é exigido por data válida programada. Concluir ou pular o membro de hoje move o ponteiro, mas o próximo membro só se torna exigível na próxima data válida. `rotation_memberships.habit_id` referencia a raiz em `actions`; seus descendentes permanecem subordinados pela árvore recursiva `parent_id`.

O agendamento da rotação pertence a `recurrence_type`/`recurrence_config`; `current_position` é um ordinal inteiro de estado, não um identificador. O avanço é atômico, idempotente por `last_resolved_date` e condicionado à conclusão ou Skip explícito do membro corrente. Dias perdidos não avançam o ponteiro.

O termo **Ritual** fica reservado para uma feature futura de rotinas encadeadas dentro do mesmo dia. Não é sinônimo de `HabitRotation` e não deve nomear a sequência atual.

### 3.1 Modelo de Dados (3 tabelas)

```sql
-- Definição + estado da rotação
CREATE TABLE habit_rotations (
  id TEXT PRIMARY KEY,                    -- UUID v4 textual
  name TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('DAILY','WEEKLY','MONTHLY','YEARLY')),
  recurrence_config TEXT NOT NULL,      -- JSON, ex: {"days_of_week":[1,3,5]}
  current_position INTEGER NOT NULL DEFAULT 0,  -- ponteiro de estado
  last_resolved_date TEXT,              -- YYYY-MM-DD; COMPLETED ou SKIPPED, trava de duplo-avanço
  is_active BOOLEAN NOT NULL DEFAULT 1, -- pausa preserva posição
  display_order INTEGER DEFAULT 999999,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Junção: quais hábitos e em que ordem
CREATE TABLE rotation_memberships (
  id TEXT PRIMARY KEY,                    -- UUID v4 textual
  rotation_id TEXT NOT NULL REFERENCES habit_rotations(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE, -- somente rows lifecycle_type='HABIT'
  position INTEGER NOT NULL,
  added_at TEXT NOT NULL,
  UNIQUE(rotation_id, habit_id),
  UNIQUE(rotation_id, position)
);

-- Campo de posse no próprio Habit (Action)
ALTER TABLE actions ADD COLUMN controlled_by_rotation_id TEXT
  REFERENCES habit_rotations(id) ON DELETE SET NULL;
```

Padrão estrutural inspirado em `ProjectLink` (entidade + FK polimórfica), mas **conceitualmente independente**: `ProjectLink` serve agrupamento organizacional; `RotationMembership` controla orquestração sequencial com máquina de estados própria.

### 3.2 Regras da Máquina de Estados

1. A resolução explícita pelo usuário — conclusão ou Skip — avança `current_position` (sem auto-avanço em dias perdidos). O ponteiro só produz outro item na próxima data válida; não cria pendência sucessora no mesmo dia.
2. `current_position` dá loop infinito: `(position + 1) % length`.
3. `last_resolved_date` impede avanço duplo no mesmo dia, seja a resolução `COMPLETED` ou `SKIPPED`.
4. **Undo de conclusão ou Skip NÃO reverte `current_position`** (máquina de estado só avança para frente).
5. Quando `is_active = false` (pausado), o hábito membro renderiza com sua recorrência original — a rotação preserva a posição para retomar depois.

### 3.3 Resolução e avanço da ocorrência

```typescript
async function resolveRotationOccurrence(
  habitId: string,
  resolution: 'COMPLETED' | 'SKIPPED',
  localDate: string
) {
  const membership = await getRotationMembership(habitId);
  if (!membership) return resolveStandaloneHabit(habitId, resolution, localDate);

  const rotation = await getRotation(membership.rotation_id);

  if (rotation.last_resolved_date === localDate) return; // guarda 1: já resolveu hoje
  if (membership.position !== rotation.current_position) return; // só o item atual avança

  const allMembers = await getRotationMembers(rotation.id);
  const nextPosition = (rotation.current_position + 1) % allMembers.length; // loop infinito

  await updateRotation(rotation.id, {
    current_position: nextPosition,
    last_resolved_date: localDate,
  });
}
```

### 3.4 Exibição Diária (Um Item Por Dia)

```typescript
async function getHabitsForDate(targetDate: string): Promise<HabitDisplay[]> {
  const dayOfWeek = new Date(targetDate).getDay();

  const standalone = allHabits.filter(h =>
    !h.controlled_by_rotation_id &&
    shouldHabitAppear(h, new Date(targetDate))
  );

  const rotationItems = [];
  for (const rotation of activeRotations) {
    if (rotation.last_resolved_date === targetDate) continue; // guarda 2: bloqueio de mesmo dia
    if (!matchesRecurrence(rotation.recurrence_config, targetDate)) continue;

    const currentMember = members.find(m => m.position === rotation.current_position);
    const habit = allHabits.find(h => h.id === currentMember.habit_id);

    rotationItems.push({
      ...habit,
      rotation_id: rotation.id,
      rotation_name: rotation.name,
      rotation_position: `${currentMember.position + 1} de ${members.length}`,
    });
  }

  return [...standalone, ...rotationItems].sort((a, b) => a.display_order - b.display_order);
}
```

O Core persiste a execução como `COMPLETED` ou `SKIPPED` antes de avançar a rotação; persistência e atualização do ponteiro devem ser atômicas ou idempotentes por ocorrência. Proteção contra duplo-avanço é aplicada no comando de resolução e no filtro de renderização.

### 3.5 Desfazer Conclusão (Hard Delete e Forward-Only)

```typescript
async function undoHabitCompletion(logId: string) {
  await transaction(async tx => {
    const log = await tx.getExecutionLogForCurrentUser(logId);
    if (!log) return; // idempotente: já desfeito

    const bonuses = await tx.getResonanceLogsForExecution(log.id);
    await tx.subtractAreaPoints(log.area_points);
    await tx.subtractResonancePoints(bonuses);
    await tx.deleteResonanceLogs(bonuses); // inclui a Faísca de Fogo
    const currentPrana = await tx.getCurrentPranaLevel();
    await tx.setPranaLevel(clamp(currentPrana - log.prana_delta_applied, 0, 100));
    await tx.hardDeleteExecutionLog(log.id);
  });
  // current_position NÃO é revertido — a rotação é forward-only.
}
```

O Undo é uma transação atômica: exclui fisicamente o `ExecutionLog` original e seus bônus ligados, subtrai pontos e reverte o delta efetivo de Prana. Não cria log de estorno. O registro é imutável enquanto existe; o usuário pode removê-lo pelo comando explícito de Undo. A especificação completa está em [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

### 3.6 Remoção de um membro da rotação

Remover um Hábito da sequência não apaga a Action/Habit nem seu Template no módulo de origem. Em uma operação atômica, o Core remove a linha `rotation_memberships` correspondente e define `controlled_by_rotation_id = null`. Imediatamente após o commit, o Hábito volta a ser avaliado por sua própria `due_date` ou `recurrence_config` e pode reaparecer independentemente na Lista Diária. Se removido o membro corrente, a sequência remanescente deve normalizar posições e manter um `current_position` válido; a regra de normalização não pode concluir nem avançar itens automaticamente.

### 3.7 Exemplo de Ciclo

```
Sequência: "Treino ABC" (Seg/Qua/Sex)
Membros: [Peito (0), Costas (1), Perna (2)]

Segunda: renderiza Peito (1 de 3) → completa/Skip → position=1; sem outro membro hoje
Quarta:  próxima data válida → renderiza Costas (2 de 3) → resolve → position=2
Sexta:   próxima data válida → renderiza Perna (3 de 3) → resolve → position=0 (loop)
Próxima Segunda: renderiza Peito (1 de 3) novamente
```

---

## 4. Integração do Módulo de Treino com Ciclos

O Módulo de Treino é a experiência nativa para planejar e executar exercícios físicos e pertence ao domínio do Elemento Terra. A Forja continua sendo exclusivamente a inbox de Rascunhos e triagem.

Ao salvar um treino, o usuário pode escolher uma destas opções:

1. **Manter como treino avulso:** o módulo mantém o treino no seu catálogo e histórico; não cria recorrência.
2. **Enviar para Ciclos como Hábito:** cria ou associa uma `Action` com `lifecycle_type = 'HABIT'` e configura a frequência de exibição. O treino passa a obedecer às regras de recorrência da seção 1.
3. **Adicionar a uma rotação existente:** associa o Hábito de Treino a uma `HabitRotation` existente como membro ordenado. A associação segue `rotation_memberships`; o treino deve usar o mesmo identificador de Action/Habit reconhecido pelo Core.

```text
Módulo de Treino: criar/configurar treino
        ├─ Avulso → catálogo/histórico do módulo
        ├─ Ciclos → Action lifecycle_type=HABIT + recurrence_config
        └─ Rotação existente → HABIT + rotation_membership
                                  ↓
                     Ciclos aplica agenda/ponteiro
                                  ↓
                      Lista Diária exibe o treino
```

O módulo pode oferecer diretamente as opções de frequência e rotação no fluxo de criação, mas o Core é a fonte canônica para recorrência, `controlled_by_rotation_id`, posição corrente e seleção diária. A categorização do treino deve estar associada ao Elemento Terra por meio de sua área; não é permitido ao módulo atribuir pontos diretamente.

### 4.1 Execução, Skip e avanço da rotação

Uma rotação de treinos usa a mesma máquina de estados de qualquer `HabitRotation`:

- Em uma data programada, Ciclos apresenta somente o membro cuja posição corresponde a `current_position`.
- Conclusão ou Skip explícito da ocorrência pelo usuário avança a rotação uma posição.
- Skip grava `ExecutionLog.status = 'SKIPPED'`, concede 0 XP, não altera Prana nem gera Ressonância de conclusão, e resolve o item do dia sem Rollover.
- Dias programados sem conclusão não avançam nem pulam membros.
- Repetição de evento ou conclusão duplicada na mesma data não pode avançar mais de uma vez.
- Undo de conclusão ou Skip não recua `current_position`, conforme a regra forward-only já definida.
- Pausar a rotação preserva sua posição; ao reativá-la, a sequência continua desse ponto.

Quando o treino é concluído a partir do Módulo de Treino ou da Lista Diária, ambos os caminhos devem chamar o mesmo comando de conclusão do Core. Isso garante que pontos, Prana, histórico e avanço da rotação sejam aplicados uma única vez. O módulo não deve atualizar o ponteiro diretamente.

## 5. Referências

- LEAF/AGGREGATOR, tipos semânticos → [../01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)
- Prana, `task_energy_type`, `base_value` fracionário → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- Decisão histórica de modelagem (correção do modelo temporal) → [../04-ADRs/ADR-001-Habits-as-Actions.md](../04-ADRs/ADR-001-Habits-as-Actions.md)
