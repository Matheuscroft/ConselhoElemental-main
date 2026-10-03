---
title: "Platform Architecture: Core Engine vs. Módulos Nativos"
version: "1.0"
date: "2026-09-20"
status: "Nova Lógica — Padrão Adapter"
---

# 01. Core Engine vs. Módulos Nativos Específicos

**Novo componente arquitetural.** Documenta o padrão **Adapter** que separa o motor genérico de listas/pontuação (Core Engine) das experiências ricas e especializadas (Módulos Nativos) como Grimório (leitura), Forja (treino) e Diário de Sonhos.

---

## 1. Por que essa separação existe

O Core Engine (banco de dados, árvore de itens, Motor de Pontuação, Lista Diária) foi desenhado para ser **agnóstico de domínio**: ele só entende Task/Check/Note, LEAF/AGGREGATOR, e as fórmulas de [01-Domain-Core](../01-Domain-Core/). Ele não sabe o que é "uma página de livro" ou "uma série de treino".

Módulos Nativos, por outro lado, têm **matemática própria e rica**: o Grimório sabe calcular progresso de leitura por página/capítulo, a Forja sabe calcular volume de treino (séries × repetições × carga), o Diário de Sonhos sabe pontuar lucidez e recorrência de temas. Essa lógica **não pertence ao Core** — pertence ao módulo.

A ponte entre os dois mundos é o padrão **Adapter**, já parcialmente formalizado pela interface `IActionLike` do domínio.

---

## 2. O Padrão Adapter

```
┌──────────────────────────────────────────────────────────┐
│                     MÓDULOS NATIVOS                        │
│         (interfaces ricas, matemática própria)             │
├──────────────────────────────────────────────────────────┤
│   Grimório (Leitura)   │   Forja (Treino)   │  Diário de   │
│   • páginas lidas      │   • séries/reps    │  Sonhos      │
│   • progresso/capítulo │   • carga/volume   │  • lucidez   │
│   • base_value = 0.1/pg│   • base_value=0.1 │  • temas     │
│                        │     por repetição  │  recorrentes │
└───────────┬────────────┴─────────┬──────────┴──────┬───────┘
            │                      │                 │
            │   injeta ACTION/HABIT consolidado       │
            │   (via adapter, formato IActionLike)    │
            ▼                      ▼                 ▼
┌──────────────────────────────────────────────────────────┐
│                        CORE ENGINE                          │
│   • Banco de dados genérico (actions, action_items)         │
│   • Motor de Pontuação (base/planned/executed)               │
│   • Lista Diária (funil agnóstico)                            │
│   • Não sabe nada sobre "páginas" ou "séries" — só vê         │
│     um ACTION/HABIT com base_value, effort_level, área.       │
└──────────────────────────────────────────────────────────┘
```

### Responsabilidades do Core Engine
- Persistência genérica (`actions`, `action_items`, `ExecutionLog`).
- Motor de Pontuação e Energia (fórmulas de [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)).
- Lista Diária como funil de exibição (ver [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md)).
- Nunca conhece a lógica de domínio de nenhum Módulo Nativo.

### Responsabilidades de um Módulo Nativo
- UI e fluxo especializados (tela de leitura, tela de treino, diário de sonhos).
- Cálculo de progresso específico do domínio (páginas, séries, lucidez).
- Tradução do progresso interno em uma ou mais instâncias consolidadas de `ACTION` ou `HABIT` — usando `base_value` fracionário quando fizer sentido (ver seção 1 do Motor de Pontuação).
- Assinatura de eventos vindos do Core (ver seção 4) para atualizar seu próprio estado interno quando o usuário interage a partir da Lista Diária.

---

## 3. Contrato de Injeção (Adapter Interface)

O contrato reaproveita a interface `IActionLike` já definida no domínio — módulos nativos **produzem** objetos compatíveis com ela; o Core **consome** sem conhecer a origem.

```typescript
interface IActionLike {
  id: string;
  entityType: 'ACTION' | 'HABIT';
  title: string;
  description?: string;
  area_id: number | null;
  display_order: number;
  time: number;                 // minutos (planejado ou executado)
  score: number;                 // base_value consolidado (pode ser fracionário)
  completed: boolean;
  items: IActionItemLike[];
  source_module?: NativeModuleId;    // NOVO: identifica o módulo de origem
  source_ref_id?: string;            // NOVO: id do registro interno do módulo (ex.: id da sessão de leitura)
}

type NativeModuleId = 'grimorio' | 'forja' | 'diario_de_sonhos';
```

### Exemplo: Grimório (Leitura) injeta uma Action consolidada

```typescript
// Módulo Grimório calcula: usuário leu 32 páginas hoje no livro X
function buildDailyReadingAction(session: ReadingSession): IActionLike {
  return {
    id: `grimorio-${session.id}`,
    entityType: 'ACTION',
    title: `Leitura: ${session.bookTitle} (${session.pagesRead} páginas)`,
    area_id: session.areaId, // ex.: area-leitura-conteudo
    display_order: 0,
    time: session.minutesSpent,
    score: session.pagesRead * 0.1,   // base_value fracionário (Motor de Pontuação, seç. 1)
    completed: true,
    items: [],
    source_module: 'grimorio',
    source_ref_id: session.id,
  };
}
```

O Core recebe esse objeto, normaliza-o para `Action`/`ExecutionLog` e o processa com **as mesmas fórmulas** de qualquer outro item — o Core não sabe (nem precisa saber) que a origem foi uma sessão de leitura.

---

## 4. Fluxo de Sincronização Inversa (Core → Módulo)

Quando o usuário interage com o item **a partir da Lista Diária** (ex.: dá check numa Action injetada pela Forja), o Core precisa avisar o módulo de origem para que ele atualize seu próprio estado (ex.: marcar a série de treino como concluída no histórico da Forja). Este fluxo é detalhado em [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md) (seção "Webhook de Retorno").

```
[Usuário dá check na Lista Diária]
        ↓
[Core marca ExecutionLog + dispara evento]
        ↓
[Evento: { source_module: 'forja', source_ref_id: '...', completed_at }]
        ↓
[Módulo Forja escuta o evento e atualiza seu histórico interno de treino]
```

---

## 5. Regras Invariantes

- ✅ Módulos Nativos **nunca** escrevem diretamente nas tabelas de agregação do Core além de criar/atualizar a `Action`/`Habit` consolidada via adapter — toda pontuação passa pelo Motor de Pontuação central.
- ✅ O Core **nunca** importa código ou tipos específicos de um Módulo Nativo — a dependência é unidirecional (módulo → Core), nunca o inverso.
- ✅ Cada Módulo Nativo é responsável por manter `source_module` + `source_ref_id` consistentes para permitir o webhook de retorno.
- ✅ `base_value` fracionário é permitido apenas em itens com `source_module` definido (micro-ações de módulo); itens criados manualmente pelo usuário continuam com o comportamento padrão (default 1, editável).

## 6. Referências

- Fórmulas de pontuação e `base_value` fracionário → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- Lista Diária como funil agnóstico → [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md)
- Interface `IActionLike` (base para Action/Habit unificados) → [02-Acoes-e-Habitos.md](./02-Acoes-e-Habitos.md)
