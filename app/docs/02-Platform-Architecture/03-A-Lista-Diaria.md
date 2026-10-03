---
title: "Platform Architecture: A Lista Diária (Funil Agnóstico)"
version: "1.1"
date: "2026-09-20"
status: "Canonical + CRUD Completo via Dispatcher + Webhooks de Edição/Exclusão"
---

# 03. A Lista Diária

A Lista Diária (Daily List) é a tela central de execução **e planejamento** do dia. Arquiteturalmente, ela é um **funil agnóstico**: não guarda conhecimento de domínio complexo nem classifica sozinha — mas oferece CRUD completo (criar, editar, excluir, check/uncheck), roteando criação e classificação para o Questionário correto (padrão ou de Módulo Nativo) e **notificando** o módulo de origem sobre qualquer interação do usuário.

---

## 1. O que a Lista Diária É

```
Filtro da Lista Diária:
  SELECT * FROM actions
  WHERE lifecycle_type IN ('ACTION', 'HABIT')
    AND (due_date <= today OR recurrence_matches(recurrence_config, today))
  ORDER BY priority / display_order
```

- Mostra **somente** itens já classificados (`lifecycle_type ∈ {ACTION, HABIT}`) — nunca Rascunhos (`lifecycle_type = null`), nunca Quest/Project/Mission diretamente (esses precisam ser decompostos em Actions primeiro).
- É **read+write de execução e planejamento**: marcar conclusão, logar tempo real, ver Planned Value em tempo real, e também criar/editar/excluir itens diretamente (ver seção 3).
- Não sabe se uma Action foi criada manualmente pelo usuário ou injetada por um Módulo Nativo (Grimório, Forja, Diário de Sonhos) — trata ambas de forma idêntica via `IActionLike`.

## 2. O que a Lista Diária NÃO É

- ❌ Não guarda os dados complexos nativos. Ela serve como ponto de exibição e edição rápida, mas delega a persistência de regras complexas para os módulos de origem.
- ❌ Não classifica Rascunhos sozinha (a classificação em si é sempre feita por um Questionário — próprio ou do módulo — ver seção 3).
- ❌ Não calcula progresso de domínio específico (páginas lidas, séries de treino) — isso já vem pronto do Módulo Nativo antes de chegar aqui.
- ❌ Não infere tempo, esforço ou área — apenas exibe o que já foi definido.

## 3. Criação Contextual e Roteamento (Dispatcher)

A Lista Diária expõe controles completos de **CRUD** diretamente na sua interface: Criar, Editar, Excluir e Check/Uncheck. O usuário nunca precisa sair da Lista Diária para planejar o seu dia.

### A Regra do Roteador Inteligente

Quando o usuário toca em "Criar Tarefa" dentro da Lista Diária e inicia a classificação, o Core não classifica sozinho — ele atua como um **Dispatcher**, decidindo qual questionário exibir:

```
[Usuário toca "Criar Tarefa" na Lista Diária]
        ↓
[Dispatcher abre o Questionário de classificação (categoria/tipo)]
        ↓
   ┌───────────────────────────────┬────────────────────────────────┐
   │ Categoria = Módulo Nativo      │ Categoria = genérica            │
   │ (ex.: "Leitura", "Treino")      │ (Action/Habit comum)             │
   ↓                                ↓
[Dispatcher invoca o Questionário    [Dispatcher usa o Questionário
 ESPECÍFICO do módulo de origem]      PADRÃO do Core]
   ↓                                ↓
[Grimório pergunta: "Qual livro?"]   [Perguntas padrão: área, esforço,
[Forja pergunta: "Quais exercícios?"] tempo — ver Hierarquia e Tipos]
   └───────────────────────────────┴────────────────────────────────┘
        ↓                                ↓
[Item consolidado (source_module    [Action/Habit genérico aparece
 definido) aparece na Lista Diária]  na Lista Diária]
```

Regras:
- ✅ A Lista Diária nunca decide sozinha o conteúdo do questionário — ela apenas identifica a categoria escolhida pelo usuário e delega ao módulo correspondente (padrão Dispatcher).
- ✅ Se a categoria corresponde a um Módulo Nativo (Grimório, Forja, Diário de Sonhos), o Dispatcher invoca o questionário específico daquele módulo — o mesmo modal usado dentro do próprio módulo, reaproveitado sem duplicação.
- ✅ Se a categoria é genérica (sem módulo nativo correspondente), o Dispatcher usa o Questionário Padrão do Core (mesma lógica de [01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)).
- ✅ Em ambos os caminhos, o resultado final é sempre um `IActionLike` consolidado — a Lista Diária exibe o item da mesma forma, independente de qual questionário o originou.

## 4. Webhook de Retorno (Core → Módulo Nativo)

Quando o usuário marca como concluído um item cuja origem é um Módulo Nativo (`source_module` definido — ver [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)), a Lista Diária **não sabe** como atualizar o estado interno daquele módulo. Em vez disso, ela dispara um evento que o módulo de origem escuta.

```typescript
interface DailyListCompletionEvent {
  action_id: string;
  source_module?: 'grimorio' | 'forja' | 'diario_de_sonhos';
  source_ref_id?: string;
  completed_at: string;   // ISO timestamp
  actual_time_minutes?: number;
  executed_value: number; // calculado pelo Motor de Pontuação
}

// Core dispara o evento após persistir o ExecutionLog
function onDailyListCheck(action: IActionLike, log: ExecutionLog) {
  persistExecutionLog(log);

  if (action.source_module) {
    eventBus.emit('daily_list.item_completed', {
      action_id: action.id,
      source_module: action.source_module,
      source_ref_id: action.source_ref_id,
      completed_at: log.timestamp,
      actual_time_minutes: log.actual_time_minutes,
      executed_value: log.executed_value,
    } satisfies DailyListCompletionEvent);
  }
}
```

```
[Usuário marca "Leitura: Duna (32 páginas)" como completo]
        ↓
[Core: cria ExecutionLog, calcula executed_value via Motor de Pontuação]
        ↓
[Core dispara evento daily_list.item_completed com source_module='grimorio']
        ↓
[Módulo Grimório escuta o evento]
        ↓
[Grimório atualiza seu próprio progresso interno: marca a sessão de leitura como
 sincronizada, atualiza contador de páginas do livro, streak de leitura, etc.]
```

### Regras do Webhook

- ✅ O evento é disparado **depois** que o `ExecutionLog` já foi persistido — nunca antes (garante que a pontuação nunca dependa de o módulo responder).
- ✅ O Core não espera resposta síncrona do módulo — é fire-and-forget (o módulo pode reprocessar em segundo plano).
- ✅ Se o item não tem `source_module`, nenhum evento é disparado — comportamento padrão de Action/Habit criado manualmente permanece inalterado.
- ✅ O mesmo mecanismo de evento cobre **desfazer conclusão** (`daily_list.item_uncompleted`), permitindo que o módulo reverta seu estado interno simetricamente.

### Edição e Exclusão (mesmo mecanismo de evento)

Editar ou excluir, a partir da Lista Diária, um item cuja origem é um Módulo Nativo segue exatamente o mesmo padrão de fire-and-forget do check/uncheck — o Core persiste a mudança e dispara um evento para o módulo de origem manter seus próprios dados consistentes:

```typescript
interface DailyListEditEvent {
  action_id: string;
  source_module?: 'grimorio' | 'forja' | 'diario_de_sonhos';
  source_ref_id?: string;
  changed_fields: Partial<IActionLike>; // apenas os campos alterados na Lista Diária
}

interface DailyListDeleteEvent {
  action_id: string;
  source_module?: 'grimorio' | 'forja' | 'diario_de_sonhos';
  source_ref_id?: string;
  deleted_at: string; // ISO timestamp
}

// Core dispara os eventos após persistir a edição/exclusão
function onDailyListEdit(action: IActionLike, changedFields: Partial<IActionLike>) {
  persistActionUpdate(action.id, changedFields);

  if (action.source_module) {
    eventBus.emit('daily_list.item_edited', {
      action_id: action.id,
      source_module: action.source_module,
      source_ref_id: action.source_ref_id,
      changed_fields: changedFields,
    } satisfies DailyListEditEvent);
  }
}

function onDailyListDelete(action: IActionLike) {
  persistActionDelete(action.id);

  if (action.source_module) {
    eventBus.emit('daily_list.item_deleted', {
      action_id: action.id,
      source_module: action.source_module,
      source_ref_id: action.source_ref_id,
      deleted_at: new Date().toISOString(),
    } satisfies DailyListDeleteEvent);
  }
}
```

Regras:
- ✅ `daily_list.item_edited` carrega **apenas os campos alterados** — o módulo de origem decide como reconciliar (ex.: Grimório recalcula páginas se `base_value` mudou).
- ✅ `daily_list.item_deleted` é disparado **depois** que o Core já removeu o item — o módulo de origem deve tratar a ausência como definitiva, não como um convite para recriar o item.
- ✅ Assim como o evento de conclusão, ambos são fire-and-forget e só disparam quando `source_module` está definido — edição/exclusão de itens criados manualmente não gera nenhum evento.

## 5. Referências

- Padrão Adapter e contrato `IActionLike` → [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)
- Regras de classificação e Rascunhos → [../01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)
- Assistente de IA também pode disparar check via Function Calling → [04-Integracao-LLM-e-Voz.md](./04-Integracao-LLM-e-Voz.md)
