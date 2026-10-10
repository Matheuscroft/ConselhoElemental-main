---
title: "Domain Core: Hierarquia e Tipos Semânticos"
version: "4.0"
date: "2026-10-09"
status: "Canonical — tabelas separadas e árvore recursiva de execução"
---

# 01. Hierarquia e Tipos

Este documento define a persistência das entidades macro, das entidades executáveis e de sua árvore de passos. `projects`, `quests` e `missions` mantêm tabelas próprias; `actions` contém raízes `ACTION`/`HABIT` e todos os seus descendentes recursivos. A tabela anterior `action_items` foi abolida: não deve ser criada nem usada em novos contratos.

## 0. Identificadores e nomenclatura

Todos os IDs e FKs de domínio são UUID v4 em representação textual. IDs numéricos sequenciais são proibidos como PK/FK. Tabelas usam `snake_case` plural; modelos TypeScript `PascalCase` singular; colunas e payloads `snake_case`.

| Conceito | Modelo | Persistência | Regra principal |
|---|---|---|---|
| Projeto | `Project` | `projects` | Entrega, prazo e escopo. |
| Quest | `Quest` | `quests` | Narrativa, marcos e badges. |
| Missão | `Mission` | `missions` | Propósito/campanha de alto nível. |
| Tarefa/Ação | `Action` | `actions` raiz, `lifecycle_type='ACTION'` | Execução única por `due_date`. |
| Ciclo/Hábito | `Habit` | `actions` raiz, `lifecycle_type='HABIT'` | Recorrência por `recurrence_config` ou `HabitRotation`. |
| Etapa/Subtarefa | `Action` descendente | `actions`, `parent_id` não nulo | Passo da árvore; exige `semantic_type`. |

## 1. Limites relacionais

### 1.1 Agregadores macro

`projects`, `quests` e `missions` são tabelas distintas, com metadados e ciclos de vida próprios. `Project` armazena dados de entrega (por exemplo, prazo e escopo); `Quest`, dados narrativos e recompensas; `Mission`, propósito de alto nível. Essas entidades nunca são valores de `lifecycle_type` nem linhas de `actions`.

Actions são associadas aos agregadores por FKs UUID como `project_id`, `quest_id` e `mission_id` quando o vínculo for exclusivo. Uma Action compartilhada por várias Quests usa `quest_actions` N:N. Uma Action não é duplicada para aparecer em mais de um agregador.

### 1.2 Árvore de execução em `actions`

`actions` é uma tabela auto-relacionada por `parent_id`. A linha raiz não tem `parent_id`, define o ciclo de vida (`ACTION` ou `HABIT`) e possui os metadados de agenda. Filhos, netos, bisnetos e descendentes em qualquer profundidade permanecem em `actions`, com `parent_id` apontando ao pai imediato. Todos os descendentes herdam o `lifecycle_type`, o calendário, a área e o contexto dos agregadores da raiz; não definem ciclo de vida próprio.

O discriminator `semantic_type` aplica-se obrigatoriamente a cada linha descendente e somente a descendentes:

| `semantic_type` | Semântica | Pontuação |
|---|---|---|
| `VALUABLE` | Passo marcável com esforço/valor próprios quando elegível. | Pode gerar XP/base_value conforme o Motor de Pontuação. |
| `VALUELESS` | Passo com checkbox para progresso visual. | Nunca gera XP/base_value. |
| `NOTE` | Conteúdo informativo. | Não possui checkbox e nunca gera XP/base_value. |

Na raiz, `semantic_type` é nulo e `lifecycle_type` é obrigatório (`ACTION` ou `HABIT`). Em qualquer descendente, `lifecycle_type` é nulo e `semantic_type` é obrigatório. Logo, `semantic_type` é coluna de `actions`, mas seu valor é válido exclusivamente em linhas com `parent_id` não nulo. Não existe tabela `action_items`.

```text
actions raiz (parent_id=null, lifecycle_type=ACTION|HABIT, semantic_type=null)
└─ actions filha (parent_id=UUID raiz, lifecycle_type=null, semantic_type=VALUABLE)
   └─ actions neta (parent_id=UUID filha, lifecycle_type=null, semantic_type=VALUELESS)
      └─ actions bisneta (parent_id=UUID neta, lifecycle_type=null, semantic_type=NOTE)
```

Os tipos de passo podem ocorrer em qualquer profundidade. `NOTE` não tem checkbox; `VALUELESS` representa progresso sem pontuação; `VALUABLE` pode gerar pontuação. A presença de descendentes `VALUABLE` transforma a raiz em agregador de pontos: o valor próprio da raiz deixa de ser aplicado e os valores elegíveis descendentes são somados. `VALUELESS` e `NOTE` não geram valor nem transformam, por si sós, a raiz em agregador pontuável. Não há limite estrutural de profundidade definido pelo produto; toda árvore persistida precisa ser finita e acíclica. A camada de domínio deve rejeitar auto-parenting e qualquer reassociação que crie ciclo ou misture raízes/contextos.

### 1.3 DDL canônico de referência

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY, -- UUID v4 textual
  title TEXT NOT NULL,
  scope TEXT NULL,
  due_date TEXT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE quests (
  id TEXT PRIMARY KEY, -- UUID v4 textual
  title TEXT NOT NULL,
  lore TEXT NULL,
  reward_badge_id TEXT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE missions (
  id TEXT PRIMARY KEY, -- UUID v4 textual
  title TEXT NOT NULL,
  purpose TEXT NULL,
  project_id TEXT NULL REFERENCES projects(id),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE actions (
  id TEXT PRIMARY KEY, -- UUID v4 textual
  parent_id TEXT NULL REFERENCES actions(id) ON DELETE CASCADE,
  lifecycle_type TEXT NULL CHECK (lifecycle_type IN ('ACTION', 'HABIT')),
  semantic_type TEXT NULL CHECK (semantic_type IN ('VALUABLE', 'VALUELESS', 'NOTE')),
  title TEXT NOT NULL,
  project_id TEXT NULL REFERENCES projects(id),
  quest_id TEXT NULL REFERENCES quests(id),
  mission_id TEXT NULL REFERENCES missions(id),
  due_date TEXT NULL,
  recurrence_config TEXT NULL,
  base_value REAL NULL,
  effort_level INTEGER NULL,
  planned_time_minutes INTEGER NULL,
  area_primary_id TEXT NULL,
  task_energy_type TEXT NOT NULL DEFAULT 'NEUTRAL',
  controlled_by_rotation_id TEXT NULL,
  source_module TEXT NULL,
  source_ref_id TEXT NULL,
  is_completed BOOLEAN NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (parent_id IS NULL AND lifecycle_type IS NOT NULL AND lifecycle_type IN ('ACTION', 'HABIT')
      AND semantic_type IS NULL AND is_completed IS NOT NULL)
    OR
    (parent_id IS NOT NULL AND lifecycle_type IS NULL AND semantic_type IS NOT NULL
      AND semantic_type IN ('VALUABLE', 'VALUELESS', 'NOTE')
      AND ((semantic_type = 'NOTE' AND is_completed IS NULL)
        OR (semantic_type IN ('VALUABLE', 'VALUELESS') AND is_completed IS NOT NULL)))
  )
);

CREATE TABLE quest_actions (
  id TEXT PRIMARY KEY, -- UUID v4 textual
  quest_id TEXT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(quest_id, action_id)
);
```

O exemplo mostra a separação de tabelas, auto-FK recursiva e exclusividade dos discriminadores. Tipos temporais e validações adicionais podem variar por SGBD, mantendo os invariantes. O campo de FK de rotação pode receber a referência declarada pelo schema de `habit_rotations`.

## 2. Pontuação e agregação

Uma raiz `Action`/`Habit` sem descendentes `VALUABLE` pode pontuar por seu próprio `base_value`. Se existirem descendentes `VALUABLE`, a raiz torna-se agregadora e soma as execuções pontuáveis concluídas da árvore; os valores não são recalculados nem multiplicadores reaplicados nos níveis ancestrais. `VALUELESS` e `NOTE` nunca geram XP. Os efeitos energéticos aplicam-se uma vez por ocorrência executável da raiz, segundo [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md).

Execuções de descendentes são interpretadas no contexto de calendário e domínio da raiz. A unidade pontuável, persistência de `ExecutionLog` e cobrança de Prana seguem as regras do Motor de Pontuação. O Undo remove fisicamente o log e seus efeitos conforme essas regras, sem apagar ou reestruturar a árvore.

## 3. Rascunhos, classificação e criação contextual

Rascunho é um registro do Inbox com apenas título, `lifecycle_type=null` e `area_primary_id=null`; não é uma linha de `actions` nem aparece na Lista Diária. Quick Edit ou Wizard pode classificá-lo como **qualquer entidade do sistema**: `ACTION`/`HABIT` em `actions`, Projeto em `projects`, Quest em `quests` ou Missão em `missions`. A classificação só remove o estado de Inbox após persistência bem-sucedida da entidade de destino. O Wizard orienta a escolha com perguntas de recorrência, etapas e natureza de marco.

Botões contextuais criam diretamente na tabela correspondente: Ciclos cria `HABIT`; Tarefas cria `ACTION`; Quests cria em `quests`; Projetos cria em `projects`. A entidade tipada sem área recebe temporariamente `area-sem-categoria`; isso não equivale a Rascunho.

## 4. Conversão de Entidades (Data Migration Service)

O usuário pode converter uma entidade já criada para outra natureza sem misturar metadados em uma God Table. A conversão é uma operação explícita do **Data Migration Service** entre tabelas canônicas, independente de Quick Edit/Wizard de Rascunhos.

### 4.1 Garantias transacionais

Para cada solicitação, o serviço deve:

1. Validar o tipo de origem/destino, autorização, estado e compatibilidade dos campos.
2. Bloquear a entidade de origem e sua árvore/vínculos para impedir edição concorrente durante a migração. Se a origem for um descendente, remover seu vínculo do pai antigo dentro da mesma transação e recalcular somente o estado estrutural derivado para operações futuras; não alterar logs históricos.
3. Criar UUID v4 para o registro de destino quando o destino pertencer a outra tabela. Para Action↔Habit, manter a linha e o UUID de `actions`, alterando apenas o discriminador e os campos de agenda após validação.
4. Criar o registro de destino com os metadados compatíveis e registrar um `conversion_id` (UUID v4)/evento de linhagem com origem, destino, ator, instante e versão do mapeamento.
5. Reassociar descendentes e vínculos em ordem topológica, preservando UUIDs e relações pai-filho sempre que a entidade de destino permitir. Para converter Action/Habit em agregador macro, os filhos diretos são promovidos a novas raízes de `actions` (`parent_id=null`) e recebem o FK do agregador; cada promovido precisa receber `lifecycle_type` válido e `semantic_type=null`. Como a origem desses dados é um descendente, o serviço deve exigir o mapeamento de tipo quando não houver conversão semântica inequívoca. Níveis inferiores mantêm `parent_id` interno e `semantic_type`. O FK do novo agregador deve ser aplicado às raízes promovidas e aos demais nós da árvore conforme a política de integridade relacional. Para converter agregador macro em Action/Habit, criar a raiz executável e mapear as Actions constituintes como descendentes (`lifecycle_type=null`, `semantic_type` explícito), preservando sua árvore interna. Divergências entre agendas das Actions e a agenda única da nova raiz exigem mapeamento confirmado pelo usuário.
6. Reassociar vínculos de módulos, Quests compartilhadas e demais FKs conforme regras de cardinalidade, sem duplicar Actions.
7. Migrar referências a logs e bônus derivados para a identidade de destino sem alterar valores, parâmetros, datas, elementos ou versões de regra já registrados. Para permitir referências a tabelas distintas, `ExecutionLog` deve identificar seu sujeito por (`subject_type`, `subject_id`) polimórficos, validados pelo serviço. A conversão pode atualizar esse vínculo de identidade acompanhado pelo `conversion_id`, mas não pode editar os snapshots imutáveis do cálculo. Bônus já pagos mantêm valor e elemento originais; a conversão não gera a ressonância da entidade de destino. Se o schema atual guardar apenas `action_id`, a migração de schema para o vínculo polimórfico é pré-requisito da conversão entre tabelas. Quando a semântica histórica não puder ser preservada no destino, bloquear a conversão e solicitar resolução explícita; nunca descartar silenciosamente histórico ou pontuação.
8. Validar integridade e confirmar em uma única transação. Em falha, rollback integral; não deixar origem parcialmente removida nem destino duplicado.

Após a migração confirmada, excluir a linha de origem somente quando todos os descendentes, vínculos, logs e referências tiverem sido migrados e as FKs permitirem a exclusão. A operação deve ser idempotente por chave de conversão para evitar duplicação em retry.

### 4.2 Conversões suportadas

O serviço suporta conversões entre entidades macro (`Project`, `Quest`, `Mission`) e raízes executáveis (`Action`, `Habit`), além da conversão Action↔Habit na própria linha de `actions`. Exemplos: Action→Project, Action→Quest, Quest→Project e Habit→Action. Conversões laterais e reversas seguem o mesmo pipeline, aplicando o mapeamento específico de cada par.

Metadados sem campo equivalente não podem ser descartados silenciosamente. O serviço deve manter tais dados em registro de migração/arquivo de origem recuperável, ou exigir confirmação do usuário antes de concluir. Dados de domínio de Módulo Nativo permanecem em suas tabelas e mantêm `source_module`/`source_ref_id` quando o destino suportar esse vínculo.

## 5. Relações estratégicas e consistência

```text
projects ──1:N── missions ──FK opcional── actions raiz
quests ──N:N── actions raiz (via quest_actions quando compartilhada)
actions raiz ──1:N recursivo── actions descendentes (parent_id)
habit_rotations ──N:N── actions raiz com lifecycle_type='HABIT'
```

Uma Quest pode agregar Actions existentes; excluir a Quest remove seus vínculos, nunca Actions compartilhadas. Conclusão/Undo de Projeto ou Quest aplica ou remove somente seu bônus de agregador; logs de execução das Actions vinculadas permanecem até Undo individual. `HabitRotation` avança por dias válidos: conclusão ou Skip resolve o membro corrente, e o próximo membro só é exigido na próxima data válida. O termo `Ritual` fica reservado a rotinas encadeadas no mesmo dia.

## 6. Referências

- Pontuação, Prana, Ressonância e Undo: [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md).
- Action/Habit, recorrência e HabitRotation: [02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md).
- Lista Diária e classificação: [03-A-Lista-Diaria.md](../02-Platform-Architecture/03-A-Lista-Diaria.md).
