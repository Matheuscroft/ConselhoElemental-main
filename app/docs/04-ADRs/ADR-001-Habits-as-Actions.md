---
title: "ADR-001: Hábitos como Actions (não uma entidade separada)"
date: "2026-02-20"
status: "Aceito para Action/Habit; estrutura de agregadores/itens internos substituída por ADR posterior"
---

# ADR-001: Hábitos como Actions

## Status
Aceito para unificar os modelos de Tarefa/Ação e Ciclo/Hábito em `actions`. A revisão atual também coloca Etapas/Subtarefas recursivas nessa tabela auto-relacionada por `parent_id`; o antigo modelo `action_items` foi abolido. Projetos, Quests e Missões continuam em tabelas próprias conforme [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).

## Contexto
O modelo anterior tratava Hábito como um agregado totalmente independente de Action, com versionamento temporal completo (cada edição de hábito criava uma nova "versão" imutável, preservando configurações históricas por período de validade). Isso implicava:

- Tabelas próprias (`habit_entities`, `habit_versions`, `habit_completions`, `habit_items`).
- Serviço próprio (`webHabitService.ts`), slice Redux próprio (`habitsSlice.ts`).
- Componentes de UI próprios (`components/habits/*`).
- Lógica de bifurcação temporal (editar hoje vs. editar passado vs. editar futuro) com múltiplos casos de borda.

Essa complexidade duplicava toda a stack de Actions sem ganho proporcional: o `ExecutionLog` preserva os valores de uma execução sem permitir edição ou recálculo enquanto o registro existe. Um Undo explícito pode excluir fisicamente a execução e reverter seus efeitos, conforme [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

## Decisão
**Hábito não é uma entidade separada. Hábito é a raiz de uma Action com `lifecycle_type = 'HABIT'`**, armazenada na tabela `actions`. Raízes usam `lifecycle_type` (`ACTION`/`HABIT`); descendentes usam `semantic_type` (`VALUABLE`/`VALUELESS`/`NOTE`) e `parent_id`. Agregadores macro permanecem nas tabelas `projects`/`quests`/`missions`.

```typescript
interface Action {
  lifecycle_type: 'ACTION' | 'HABIT';
  // ...campos existentes...
  recurrence_enabled?: boolean;
  recurrence_type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  recurrence_config?: RecurrenceConfig | null;
}

type RecurrenceConfig =
  | { days_of_week: number[] }
  | { day_of_week: number; interval: number }
  | { day_of_month: number; interval: number }
  | { month: number; day: number };
```

## O que NÃO deve ser (re)criado
- ❌ Entidade `HabitEntity`/tabelas `habit_versions`, `habit_completions`.
- ❌ Serviço `webHabitService.ts` separado.
- ❌ Slice Redux `habitsSlice.ts` separado.
- ❌ Componentes `components/habits/*` separados.

## Consequências
- Histórico ativo é resolvido pelo `ExecutionLog`, compartilhado por Actions e Hábitos. Cada registro é imutável enquanto existe e pode ser removido por Undo explícito; não exige versionamento temporal (SCD Type 2).
- Zero duplicação de UI: `ActionCard`, `ActionList`, `ActionModal` servem tanto Actions quanto Hábitos via interface unificada `IActionLike`.
- **HabitRotation permanece válido:** a rotação sequencial de hábitos (`habit_rotations`, `rotation_memberships`, `controlled_by_rotation_id`) continua se aplicando normalmente — apenas a tabela subjacente de Hábito muda (de agregado próprio para Action com `lifecycle_type='HABIT'`); a máquina de estados de rotação não é afetada por esta correção.

## Referências
- Modelo consolidado de Ações e Hábitos + HabitRotation → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md)
- Interface `IActionLike` → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md#2-iactionlike--interface-unificada-de-consumo)
