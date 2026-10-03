---
title: "ADR-001: Hábitos como Actions (não uma entidade separada)"
date: "2026-02-20"
status: "Aceito — Severidade Crítica"
---

# ADR-001: Hábitos como Actions

## Status
Aceito. Severidade **crítica** — corrige o modelo de versionamento temporal de Hábitos anteriormente especificado (3 tabelas: `habit_entities`, `habit_versions`, `habit_completions`, com arquitetura SCD Type 2).

## Contexto
O modelo anterior tratava Hábito como um agregado totalmente independente de Action, com versionamento temporal completo (cada edição de hábito criava uma nova "versão" imutável, preservando configurações históricas por período de validade). Isso implicava:

- Tabelas próprias (`habit_entities`, `habit_versions`, `habit_completions`, `habit_items`).
- Serviço próprio (`webHabitService.ts`), slice Redux próprio (`habitsSlice.ts`).
- Componentes de UI próprios (`components/habits/*`).
- Lógica de bifurcação temporal (editar hoje vs. editar passado vs. editar futuro) com múltiplos casos de borda.

Essa complexidade duplicava toda a stack de Actions sem ganho proporcional: a garantia de "o passado nunca muda" já é resolvida de forma mais simples pelo `ExecutionLog` (histórico imutável) que Actions já usam.

## Decisão
**Hábito não é uma entidade separada. Hábito É uma Action com `lifecycle_type = 'HABIT'`**, usando as mesmas tabelas (`actions`, `action_items`), os mesmos componentes de UI, e o mesmo serviço de persistência que Actions regulares. As únicas diferenças são campos adicionais de recorrência e um filtro por data na UI.

```typescript
interface Action {
  lifecycle_type: 'ACTION' | 'HABIT' | 'QUEST' | 'PROJECT' | 'MISSION';
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
- Histórico é resolvido pelo `ExecutionLog`, o mesmo padrão que Actions já usam — sem necessidade de versionamento temporal (SCD Type 2).
- Zero duplicação de UI: `ActionCard`, `ActionList`, `ActionModal` servem tanto Actions quanto Hábitos via interface unificada `IActionLike`.
- **HabitRotation permanece válido:** a rotação sequencial de hábitos (`habit_rotations`, `rotation_memberships`, `controlled_by_rotation_id`) continua se aplicando normalmente — apenas a tabela subjacente de Hábito muda (de agregado próprio para Action com `lifecycle_type='HABIT'`); a máquina de estados de rotação não é afetada por esta correção.

## Referências
- Modelo consolidado de Ações e Hábitos + HabitRotation → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md)
- Interface `IActionLike` → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md#2-iactionlike--interface-unificada-de-consumo)
