---
title: "Platform Architecture: Ações e Hábitos"
version: "2.0"
date: "2026-09-20"
status: "Canonical — Modelo Corrigido (Habit = Action)"
---

# 02. Ações e Hábitos

Este documento consolida o modelo atual de Hábitos: **um Hábito NÃO é uma entidade separada — é uma Action com `lifecycle_type = 'HABIT'`**, mais campos de recorrência. Este é o modelo vigente; a modelagem antiga (tabelas temporais separadas) foi oficialmente corrigida e está documentada como histórico em [../03-ADRs/ADR-001-Habits-as-Actions.md](../03-ADRs/ADR-001-Habits-as-Actions.md).

---

## 1. Hábito = Action + Recorrência

```typescript
interface Action {
  id: string;
  title: string;
  lifecycle_type: 'ACTION' | 'HABIT' | 'QUEST' | 'PROJECT' | 'MISSION';
  base_value?: number;             // aceita decimais (Motor de Pontuação)
  effort_level?: number;           // 1–5
  planned_time_minutes?: number;
  area_primary_id?: string;
  area_secondary_ids?: string[];
  task_energy_type?: 'NEUTRAL' | 'RESTORATIVE' | 'POISON';

  // Campos exclusivos de recorrência (só relevantes quando lifecycle_type = 'HABIT')
  recurrence_enabled?: boolean;
  recurrence_type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  recurrence_config?: RecurrenceConfig | null;

  // Ownership por rotação (seção 3)
  controlled_by_rotation_id?: string | null;
}

type RecurrenceConfig =
  | { days_of_week: number[] }              // DAILY/WEEKLY: 0=Domingo .. 6=Sábado
  | { day_of_week: number; interval: number } // WEEKLY com intervalo
  | { day_of_month: number; interval: number } // MONTHLY
  | { month: number; day: number };           // YEARLY
```

**Regra:** Hábitos usam **as mesmas tabelas** (`actions`, `action_items`), os mesmos componentes de UI, e o mesmo serviço de persistência que Actions comuns. A única diferença é:
1. `lifecycle_type = 'HABIT'` em vez de `'ACTION'`.
2. Campos de recorrência preenchidos.
3. Um filtro de exibição na Lista Diária que casa `recurrence_config` contra a data selecionada.

**Não existe** (e não deve ser recriado): entidade `HabitEntity` separada, tabelas `habit_versions`/`habit_completions`, serviço `webHabitService.ts`, slice Redux `habitsSlice.ts`, ou componentes `components/habits/*`. Histórico de execução usa o mesmo `ExecutionLog` que qualquer Action.

### Herança das regras estruturais

Hábitos seguem **exatamente** as mesmas regras de [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md):
- Podem ser LEAF (pontuável) ou AGGREGATOR (soma) dependendo de terem filhos Task.
- Podem ter `task_energy_type` = `RESTORATIVE` (ex.: Sono, Meditação) — recuperam Prana em vez de consumir.
- `base_value` pode ser fracionário quando originado de um Módulo Nativo (ver [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)).

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
  id: string;
  entityType: 'ACTION' | 'HABIT';
  title: string;
  description?: string;
  area_id: number | null;
  display_order: number;
  time: number;
  score: number;
  completed: boolean;
  items: IActionItemLike[];
  source_module?: 'grimorio' | 'forja' | 'diario_de_sonhos';
  source_ref_id?: string;
}
```

**Invariantes:**
- Componentes de UI (`ActionCard`, `ActionList`, `ActionModal`) **nunca** importam tipos `Action`/`Habit` diretamente — só `IActionLike`.
- Normalização acontece na camada de serviço/seletor, nunca dentro de componentes.
- Não existe `HabitCard` nem `HabitList` — reuso total de componentes.

---

## 3. HabitRotation — Rotação Sequencial de Hábitos

**Escopo:** HabitRotation controla **apenas Hábitos**, nunca Actions. Permite orquestrar hábitos em sequência rotativa (ex.: treino ABC, rotação de idiomas) — mostrando **um único item por dia**, avançando apenas por conclusão do usuário.

### 3.1 Modelo de Dados (3 tabelas)

```sql
-- Definição + estado da rotação
CREATE TABLE habit_rotations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('DAILY','WEEKLY','MONTHLY','YEARLY')),
  recurrence_config TEXT NOT NULL,      -- JSON, ex: {"days_of_week":[1,3,5]}
  current_position INTEGER NOT NULL DEFAULT 0,  -- ponteiro de estado
  last_completed_date TEXT,             -- YYYY-MM-DD, trava de duplo-avanço
  is_active BOOLEAN NOT NULL DEFAULT 1, -- pausa preserva posição
  display_order INTEGER DEFAULT 999999,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Junção: quais hábitos e em que ordem
CREATE TABLE rotation_memberships (
  id TEXT PRIMARY KEY,
  rotation_id TEXT NOT NULL REFERENCES habit_rotations(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES Action(id) ON DELETE CASCADE, -- SOMENTE Actions com lifecycle_type='HABIT'
  position INTEGER NOT NULL,
  added_at TEXT NOT NULL,
  UNIQUE(rotation_id, habit_id),
  UNIQUE(rotation_id, position)
);

-- Campo de posse no próprio Habit (Action)
ALTER TABLE Action ADD COLUMN controlled_by_rotation_id TEXT
  REFERENCES habit_rotations(id) ON DELETE SET NULL;
```

Padrão estrutural inspirado em `ProjectLink` (entidade + FK polimórfica), mas **conceitualmente independente**: `ProjectLink` serve agrupamento organizacional; `RotationMembership` controla orquestração sequencial com máquina de estados própria.

### 3.2 Regras da Máquina de Estados

1. Apenas a **conclusão do usuário** avança `current_position` (sem auto-avanço em dias perdidos).
2. `current_position` dá loop infinito: `(position + 1) % length`.
3. `last_completed_date` impede avanço duplo no mesmo dia.
4. **Desfazer conclusão NÃO reverte `current_position`** (máquina de estado só avança para frente).
5. Quando `is_active = false` (pausado), o hábito membro renderiza com sua recorrência original — a rotação preserva a posição para retomar depois.

### 3.3 Avanço na Conclusão

```typescript
async function handleHabitCompletion(habitId: string, completionDate: string) {
  const membership = await getRotationMembership(habitId);
  if (!membership) return normalHabitCompletion(habitId, completionDate);

  const rotation = await getRotation(membership.rotation_id);

  if (rotation.last_completed_date === completionDate) return; // guarda 1: já avançou hoje
  if (membership.position !== rotation.current_position) return; // só o item atual avança

  const allMembers = await getRotationMembers(rotation.id);
  const nextPosition = (rotation.current_position + 1) % allMembers.length; // loop infinito

  await updateRotation(rotation.id, {
    current_position: nextPosition,
    last_completed_date: completionDate,
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
    if (rotation.last_completed_date === targetDate) continue; // guarda 2: bloqueio de mesmo dia
    if (!matchesRecurrence(rotation.recurrence_config, targetDate)) continue;

    const currentMember = members.find(m => m.position === rotation.current_position);
    const habit = allHabits.find(h => h.id === currentMember.habit_id);

    rotationItems.push({
      ...habit,
      rotationId: rotation.id,
      rotationName: rotation.name,
      rotationPosition: `${currentMember.position + 1} de ${members.length}`,
    });
  }

  return [...standalone, ...rotationItems].sort((a, b) => a.display_order - b.display_order);
}
```

Proteção de duplo-avanço no mesmo dia é aplicada em **dois pontos** (defesa em profundidade): no handler de conclusão e no filtro de renderização.

### 3.5 Desfazer Conclusão (Forward-Only)

```typescript
async function undoHabitCompletion(logId: string) {
  await deleteExecutionLog(logId); // remove só os pontos
  // current_position NÃO é revertido — máquina de estado é só-avanço
}
```

### 3.6 Exemplo de Ciclo

```
Rotação: "Treino ABC" (Seg/Qua/Sex)
Membros: [Peito (0), Costas (1), Perna (2)]

Segunda: renderiza Peito (1 de 3) → completa → position=1
Quarta:  renderiza Costas (2 de 3) → completa → position=2
Sexta:   renderiza Perna (3 de 3) → completa → position=0 (loop)
Próxima Segunda: renderiza Peito (1 de 3) novamente
```

---

## 4. Referências

- LEAF/AGGREGATOR, tipos semânticos → [../01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)
- Prana, `task_energy_type`, `base_value` fracionário → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- Decisão histórica de modelagem (correção do modelo temporal) → [../03-ADRs/ADR-001-Habits-as-Actions.md](../03-ADRs/ADR-001-Habits-as-Actions.md)
