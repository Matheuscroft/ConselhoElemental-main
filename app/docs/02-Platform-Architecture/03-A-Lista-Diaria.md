---
title: "Platform Architecture: A Lista Diária (Funil Agnóstico)"
version: "2.0"
date: "2026-10-09"
status: "Canonical — Dispatcher, resolução diária e gamificação"
---

# 03. A Lista Diária

A Lista Diária (Daily List) é a tela central de execução **e planejamento** do dia. Arquiteturalmente, ela é um **funil agnóstico**: não guarda conhecimento de domínio complexo nem classifica sozinha — mas oferece CRUD completo (criar, editar, excluir, check/uncheck), roteando criação e classificação para o Questionário correto (padrão ou de Módulo Nativo) e **notificando** o módulo de origem sobre qualquer interação do usuário.

---

## 1. O que a Lista Diária É

```
Filtro da Lista Diária (datas interpretadas no fuso IANA local do usuário):
  SELECT * FROM actions
  WHERE lifecycle_type IN ('ACTION', 'HABIT')
    AND (due_date <= local_today OR recurrence_matches(recurrence_config, local_today))
  ORDER BY priority / display_order
```

- Mostra **somente** itens já classificados (`lifecycle_type ∈ {ACTION, HABIT}`) — nunca Rascunhos (`lifecycle_type = null`), nunca Quest/Project/Mission diretamente (esses precisam ser decompostos em Actions primeiro).
- É **read+write de execução e planejamento**: marcar conclusão, logar tempo real, ver Planned Value em tempo real, e também criar/editar/excluir itens diretamente (ver seção 3).
- Não sabe se uma Action foi criada manualmente pelo usuário ou injetada por um Módulo Nativo (Grimório, Módulo de Treino, Diário de Sonhos) — trata ambas de forma idêntica via `IActionLike`.

## 2. O que a Lista Diária NÃO É

- ❌ Não guarda os dados complexos nativos. Ela serve como ponto de exibição e edição rápida, mas delega a persistência de regras complexas para os módulos de origem.
- ❌ Não classifica Rascunhos sozinha (a classificação em si é sempre feita por um Questionário — próprio ou do módulo — ver seção 3).
- ❌ Não calcula progresso de domínio específico (páginas lidas, séries de treino) — isso já vem pronto do Módulo Nativo antes de chegar aqui.
- ❌ Não infere tempo, esforço ou área — apenas exibe o que já foi definido.

O dia operacional é a data civil do fuso horário IANA configurado para o usuário. A virada ocorre à meia-noite local; cálculos não devem assumir dias fixos de 24 horas, devido a transições de horário de verão. Action com `due_date < local_today` reaparece como atrasada (Rollover) até ser resolvida ou ter a data alterada por Snooze.

## 3. Criação Contextual e Roteamento (Dispatcher)

A Lista Diária expõe edição, exclusão, conclusão e Undo de itens executáveis. A criação de novas entidades é contextual à tela principal correspondente (Ciclos, Tarefas, Quests ou Projetos); a Lista Diária não é um atalho para criar Rascunhos nem para escolher arbitrariamente o tipo de raiz.

### 3.1 Criação exclusiva de Rascunho no Inbox

Um Rascunho só pode ser criado pela tela **Rascunhos (Inbox/Forja de Triagem)**. No momento da criação, o payload contém somente o título textual. O registro de Inbox mantém `lifecycle_type = null` e `area_primary_id = null`; ele não é uma linha de `actions`. Não contém esforço, duração, recorrência ou dados de módulo, e não integra a Lista Diária. Após classificação, o sistema materializa a entidade na tabela apropriada (`actions`, `quests`, `projects` ou `missions`).

O Inbox disponibiliza exatamente dois métodos para transformar um Rascunho em entidade classificada:

1. **Edição Direta (Quick Edit):** o usuário abre a edição do Rascunho, define manualmente tipo e área no modal e salva. Se a área selecionada pertencer a um Módulo Nativo, o Dispatcher pode abrir o formulário especializado desse módulo para coletar seus dados de domínio.
2. **Questionário de Triagem (Wizard):** fluxo guiado por perguntas de intenção — por exemplo, recorrência, existência de etapas ou natureza de marco — que recomenda/define qualquer entidade do sistema (`ACTION`, `HABIT`, `PROJECT`, `QUEST` ou `MISSION`) e coleta os campos necessários antes de salvar.

Ambos os caminhos removem o item da condição de Rascunho apenas após persistir uma classificação válida. No caso de área de Módulo Nativo, a entidade Core continua sendo do tipo estrutural escolhido; dados ricos permanecem nas tabelas do módulo e o Adapter preenche `source_module`, `source_ref_id` e os valores consolidados cabíveis.

### 3.2 Criação contextual nas telas principais

Cada tela principal oferece seu próprio botão Criar. Esse comando cria imediatamente uma entidade do tipo correspondente, sem criar Rascunho e sem enviar o item ao Inbox:

| Tela de origem | Entidade criada | Tipo inicial |
|---|---|---|
| Ciclos | Hábito/Ciclo | `lifecycle_type = 'HABIT'` |
| Tarefas | Afazer | `lifecycle_type = 'ACTION'` |
| Quests | Marco narrativo | Criado em `quests`; associa Actions por FK ou vínculo N:N. |
| Projetos | Projeto | Criado em `projects`; Actions/Missions são vinculadas ao Projeto. |

Quando o usuário ainda não informa uma área de vida, a entidade contextual recebe temporariamente a área invisível `area-sem-categoria`. Esse valor não equivale a `null`: identifica uma entidade já classificada cujo domínio de vida está pendente. A edição completa substitui o marcador por uma área real. A área de sistema não deve aparecer em seletores comuns nem ser tratada como área de usuário.

### 3.3 Dispatcher para áreas controladas por Módulo Nativo

Se a criação contextual ou a edição/classificação de um item selecionar uma área controlada por Módulo Nativo, o Dispatcher encaminha a interação ao modal especializado correspondente. Em classificação de Rascunho, isso ocorre durante Quick Edit ou Wizard. Em criação contextual, a entidade permanece no tipo pré-selecionado pela tela de origem.

```
[Usuário classifica Rascunho ou cria/edita item contextual]
        ↓
[Dispatcher identifica se a área pertence a um Módulo Nativo]
        ↓
   ┌───────────────────────────────┬────────────────────────────────┐
   │ Área controlada por módulo      │ Área sem módulo nativo          │
   │ (ex.: "Leitura", "Treino")     │ (domínio Core)                  │
   ↓                                ↓
[Dispatcher abre o modal específico [Dispatcher mantém o formulário
 do módulo (ex.: Grimório/Treino)]   de domínio do Core]
   ↓                                ↓
[Grimório pergunta: "Qual livro?"]   [Core coleta os campos do tipo]
[Treino configura exercícios]         [ex.: esforço e tempo]
   └───────────────────────────────┴────────────────────────────────┘
        ↓                                ↓
[Item Core recebe metadados de      [Entidade Core mantém o tipo
 origem quando aplicável]           contextual/classificado]
```

Regras:
- ✅ A Forja é exclusivamente o Inbox de ideias cruas e não é módulo de treino nem caminho de criação contextual.
- ✅ O Quick Edit e o Wizard são os únicos caminhos de classificação de Rascunhos.
- ✅ Botões de criação contextual nas telas Ciclos, Tarefas, Quests e Projetos criam imediatamente os tipos indicados na tabela; não criam Rascunhos.
- ✅ Se uma área selecionada corresponde a um Módulo Nativo, o Dispatcher invoca o fluxo especializado daquele módulo, sem duplicar sua lógica de domínio.
- ✅ O resultado destinado à Lista Diária deve ser uma entidade executável `Action`/`Habit` normalizada em `IActionLike`; Quest/Project permanecem nas próprias telas e contribuem itens à lista somente por suas Actions executáveis vinculadas.

## 4. Webhook de Retorno (Core → Módulo Nativo)

Quando o usuário marca como concluído um item cuja origem é um Módulo Nativo (`source_module` definido — ver [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)), a Lista Diária **não sabe** como atualizar o estado interno daquele módulo. Em vez disso, ela dispara um evento que o módulo de origem escuta.

```typescript
interface DailyListCompletionEvent {
  action_id: string;
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
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
 sincronizada e atualiza o contador de páginas e os ciclos/marcos de leitura, quando configurados.]
```

### Regras do Webhook

- ✅ O evento é disparado **depois** que o `ExecutionLog` já foi persistido — nunca antes (garante que a pontuação nunca dependa de o módulo responder).
- ✅ O Core não espera resposta síncrona do módulo — é fire-and-forget (o módulo pode reprocessar em segundo plano).
- ✅ Se o item não tem `source_module`, nenhum evento é disparado — comportamento padrão de Action/Habit criado manualmente permanece inalterado.
- ✅ O mesmo mecanismo cobre **desfazer conclusão** (`daily_list.item_uncompleted`). Antes de publicar o evento, o Core conclui a transação de Undo: Hard Delete do `ExecutionLog` exato, exclusão dos bônus de execução vinculados, subtração das parcelas de área e inversão do delta efetivo de Prana. Não cria log de estorno.

```typescript
interface DailyListUncompletedEvent {
  action_id: string;
  execution_log_id: string; // ID removido pelo Undo
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
  source_ref_id?: string;
  undone_at: string; // ISO timestamp do commit
}

async function onDailyListUncheck(action: IActionLike, executionLogId: string) {
  await undoExecutionAtomically(executionLogId); // apaga log e reverte pontos/Prana/Ressonância

  if (action.source_module) {
    eventBus.emit('daily_list.item_uncompleted', {
      action_id: action.id,
      execution_log_id: executionLogId,
      source_module: action.source_module,
      source_ref_id: action.source_ref_id,
      undone_at: new Date().toISOString(),
    } satisfies DailyListUncompletedEvent);
  }
}
```

O módulo recebe a notificação após o commit e reconcilia apenas seu estado de domínio. Não pode recriar a execução removida como reação ao evento.

### Edição e Exclusão (mesmo mecanismo de evento)

Editar ou excluir, a partir da Lista Diária, um item cuja origem é um Módulo Nativo segue exatamente o mesmo padrão de fire-and-forget do check/uncheck — o Core persiste a mudança e dispara um evento para o módulo de origem manter seus próprios dados consistentes:

```typescript
interface DailyListEditEvent {
  action_id: string;
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
  source_ref_id?: string;
  changed_fields: Partial<IActionLike>; // apenas os campos alterados na Lista Diária
}

interface DailyListDeleteEvent {
  action_id: string;
  source_module?: 'grimorio' | 'modulo_treino' | 'diario_de_sonhos';
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

## 5. Snooze, Skip e resolução da ocorrência

`Snooze` e `Skip` são comandos distintos. Ambos removem uma pendência da exibição corrente, mas têm efeitos diferentes sobre agenda, histórico e gamificação.

| Comando | Aplicável a | Efeito de agenda | Registro/efeito gamificado |
|---|---|---|---|
| Snooze | `Action` única (`lifecycle_type = 'ACTION'`) | Atualiza `due_date` para uma data futura escolhida. Não se aplica a Habit. Se não for resolvida e vencer, reaparece como atrasada no próximo dia local. | Sem `ExecutionLog`, XP, Prana ou Ressonância. |
| Skip | Ocorrência de Habit avulso ou membro de `HabitRotation`; treino também pode ser pulado quando agendado como Action única | Resolve e remove a ocorrência da Lista Diária naquele dia; não gera Rollover para a ocorrência pulada. | Persiste `ExecutionLog.status = 'SKIPPED'`, com XP = 0 e delta de Prana = 0; não aciona bônus de conclusão/Ressonância. Rotação avança uma posição. |

Skip de treino é permitido mesmo quando o vínculo do treino é uma Action única originada de Template. O registro `SKIPPED` deve identificar a ocorrência de origem para idempotência e Undo. Undo do registro segue Hard Delete e não reverte ponteiro de rotação, conforme a política forward-only.

## 6. Gamificação diária e fechamento local

No fechamento de cada data civil local, o Core classifica o dia e concede no máximo um resultado diário. O cálculo usa as ocorrências elegíveis exibidas para aquele usuário naquele dia, incluindo Actions vencidas e ocorrências recorrentes.

- **Dia Gerenciado (`MANAGED`)**: todas as ocorrências elegíveis foram resolvidas por `COMPLETED` ou `SKIPPED`, com pelo menos uma ocorrência no dia. Conta como ciclo diário gerenciado, sem bônus extra de XP ou Prana.
- **Dia Impecável (`FLAWLESS`)**: todas as ocorrências elegíveis foram concluídas (`COMPLETED`), nenhuma foi pulada e itens pausados não entram no denominador. Concede o Bônus de Harmonia: +25 XP em cada um dos quatro Elementos (100 XP total), sem restauração de Prana.
- **Dia incompleto**: existe ao menos uma ocorrência elegível sem resolução; não recebe Bônus de Harmonia. Marcos e badges históricos já conquistados permanecem; a regra de avanço do ciclo do Hábito depende da meta de consistência configurada, não de um reset global por falha diária.
- **Dia vazio**: não recebe bônus e não qualifica por vacuidade como Dia Impecável.

`SKIPPED` resolve a pendência para a classificação `MANAGED`, mas impede `FLAWLESS`. `RESTORATIVE` concluído conta como `COMPLETED`; recupera Prana apenas pela tabela de tempo investido no Motor de Pontuação. O estado diário não modifica essa recuperação.

Para evitar que uma pausa posterior altere retroativamente a elegibilidade, o denominador diário deve ser congelado no início do dia local (ou na primeira materialização da Lista Diária, com chave idempotente por usuário/data). Apenas itens pausados antes desse snapshot são excluídos; pausa posterior não remove uma ocorrência já elegível. A avaliação e a recompensa diária devem ser idempotentes por `(user_id, local_date)` e usar a política de Undo documentada no motor de pontuação.

O Bônus de Harmonia usa o valor fixo aprovado de +25 XP por Elemento, uma vez por Dia Impecável, totalizando 100 XP. O fluxo não deve ler nem alterar `prana_level`; a única recuperação é uma execução `RESTORATIVE`.

### 6.1 Marcos de Consistência

A gamificação de longo prazo é baseada em **Ciclos Concluídos** e Marcos de Consistência, não em sequências de dias consecutivos zeradas após uma falha. Para cada Hábito, contam-se execuções bem-sucedidas nas datas programadas dentro do ciclo configurado. Exemplo: concluir as ocorrências planejadas de terça e quinta durante quatro semanas pode completar o ciclo de consistência definido para esse Hábito.

Uma ocorrência perdida interrompe o avanço do ciclo em andamento segundo os critérios configurados para ele; não remove medalhas, badges ou marcos históricos já conquistados. Metas semanais/mensais concluídas podem conceder badges colecionáveis exibidos no Grimório/Perfil e bônus de XP Elemental conforme uma tabela de milestones. Tais recompensas não concedem Prana. Duração do ciclo, critérios de ocorrência perdida e valores de XP dos marcos devem ser configurados pelo Game Design.

## 7. Referências

- Padrão Adapter e contrato `IActionLike` → [01-Core-vs-Native-Modules.md](./01-Core-vs-Native-Modules.md)
- Regras de classificação e Rascunhos → [../01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)
- Assistente de IA também pode disparar check via Function Calling → [04-Integracao-LLM-e-Voz.md](./04-Integracao-LLM-e-Voz.md)
