---
title: "Domain Core: Hierarquia e Tipos Semânticos"
version: "1.0"
date: "2026-09-20"
status: "Canonical — Regras Imutáveis"
---

# 01. Hierarquia e Tipos (Regras Imutáveis)

Este documento define as regras estruturais **não-negociáveis** do domínio: os 3 tipos semânticos, a transição LEAF ↔ AGGREGATOR, e a hierarquia global de entidades. Violar qualquer regra aqui torna a estrutura **inválida**.

---

## 1. Os Três Tipos Semânticos (Hard Constraint)

Todo nó da árvore (`ActionItem`/`HabitItem`) tem exatamente um `semantic_type`. O usuário vê rótulos amigáveis; o sistema persiste o valor interno.

| Rótulo (usuário) | Valor interno (`semantic_type`) | Papel |
|---|---|---|
| **Task** | `valuable` | Carrega esforço, é pontuável |
| **Check** | `structural` | Checkbox binário, organiza, NUNCA pontua |
| **Note** | `text` | Informação, somente leitura, nunca pontua |

### Task (`valuable`) — Carregador de Esforço
- É o único tipo que gera pontuação.
- Como **LEAF** (sem filhos Task): tem `base_value`, `effort_level`, `planned_time` editáveis.
- Como **AGGREGATOR** (com filhos Task): perde esses campos, vira nó de soma pura (ver seção 2).
- Pode ter filhos de qualquer tipo (Task, Check, Note).

### Check (`structural`) — Confirmação Binária
- Checkbox completável (feito/não feito). Não pontua, não organiza, não é "etapa".
- Pode ter filhos **apenas** de tipo Check ou Note.
- **PROIBIDO:** um Check com QUALQUER descendente Task torna a estrutura inválida.

```
✅ VÁLIDO                          ❌ INVÁLIDO
[CHECK] Aquecimento                [CHECK] Aquecimento
├─ [CHECK] Cardio                  ├─ [TASK] Cardio  ← PROIBIDO
└─ [NOTE] ~10 minutos              └─ ...
```

### Note (`text`) — Informação Pura
- Sem checkbox, sem pontos, sem tempo, **sem filhos** (sempre folha).
- Somente leitura; nunca é marcado como completo.

### Regra sobre `semantic_type` e raiz da árvore
`semantic_type` só existe em **ActionItem** (nós internos). Entidades-raiz (Action, Habit, Project, Mission, Quest) **não têm** esse campo — ele só é atribuído quando um item é inserido como filho via Quick Add Internal.

---

## 2. Transição Estrutural LEAF ↔ AGGREGATOR (Regra Crítica)

Esta é a regra estrutural mais importante do sistema: **um item Task tem exatamente dois estados, nunca os dois ao mesmo tempo.**

### Estado A — LEAF (sem filhos Task)
```
✓ Tem base_value (editável, default = 1)
✓ Tem effort_level (editável, default = 1)
✓ Tem planned_time (editável, pode ser null)
✓ É PONTUÁVEL: contribui valor próprio ao sistema
✓ Pode ter área própria (area_primary_id, secondary_1, secondary_2)
```

### Estado B — AGGREGATOR (≥1 filho Task)
```
✗ NÃO tem base_value (substituído por soma dos filhos)
✗ NÃO tem effort_level (cada filho tem o seu)
✗ NÃO tem planned_time (substituído por soma dos filhos)
✗ NÃO tem área editável (derivada dos filhos)
✓ value = sum(valores projetados dos filhos)
✓ time = sum(tempos dos filhos)
✗ NÃO é pontuável diretamente — só agrega
```

### Transição é automática
```
Adicionar 1º filho Task  →  LEAF vira AGGREGATOR (perde campos próprios)
Remover o último filho Task  →  AGGREGATOR volta a ser LEAF (campos reaparecem com defaults)
```

Check/Note filhos **não disparam** essa transição — só filhos `Task` (`valuable`) fazem o pai virar agregador.

### A regra é recursiva e vale para TODOS os tipos de entidade
O mecanismo pai-perde-pontuação se aplica identicamente a Project, Mission, Quest, Action/Habit e ActionItem — não existe caso especial por tipo de entidade. A implementação deve usar **um único algoritmo** para toda a árvore, independente da posição (raiz vs. descendente).

```
[PROJECT] "Programa de Fitness" (AGGREGATOR, NÃO pontuável)
└─ [MISSION] "Força Central" (AGGREGATOR, NÃO pontuável)
   └─ [QUEST] "Programa de Musculação" (AGGREGATOR, NÃO pontuável)
      ├─ [ACTION] "Treino A" (LEAF, pontuável)
      └─ [ACTION] "Treino B" (LEAF, pontuável)
```

**Nunca há dupla contagem:** cada multiplicador (esforço, tempo, presença) é aplicado **uma única vez, na folha**. Pais somam valores já projetados — nunca reaplicam multiplicadores. Ver fórmulas completas em [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md).

### Tempo e Esforço só existem em folhas
Ambos os campos (`planned_time`, `effort_level`) seguem o mesmo ciclo de vida de `base_value`: existem só em LEAF, desaparecem ao virar AGGREGATOR, reaparecem com default se todos os filhos forem removidos. Nunca são herdados/propagados de pai para filho.

---

## 3. Completude (Case A / Case B)

```
Case A — Pai sem nenhum filho marcado:
  Marcar o pai como completo → TODOS os descendentes se auto-completam.

Case B — Pai com ALGUNS filhos marcados:
  Pai fica "parcial". Usuário deve confirmar explicitamente.
  Marcar o pai NÃO auto-completa os filhos restantes.
  Pontuação = soma apenas dos itens efetivamente completados (execução parcial).
```

Completude afeta somente status — nunca afeta `base_value` ou valores planejados.

---

## 4. Hierarquia Global: Projeto > Missão > Quest > Action > ActionItem

A hierarquia conceitual de decomposição estratégica, usada para agregação e visualização em profundidade, é:

```
PROJECT  (container estratégico, fases: planning → execution → review → complete)
  └─ MISSION  (marco/fase dentro do projeto — NUNCA existe standalone)
      └─ QUEST  (objetivo estratégico de médio/longo prazo — conquista, marco)
          └─ ACTION  (unidade de execução tática — o que você "faz")
              └─ ACTIONITEM  (granularidade operacional — passos internos, árvore infinita)
```

Cada nível segue a mesma regra LEAF/AGGREGATOR da seção 2: um Project/Mission/Quest sem filhos diretos é tecnicamente um LEAF pontuável; a partir do primeiro filho Task, vira AGGREGATOR puro.

### Afazeres, Hábitos e Quests — Distinção de Game Design

Do ponto de vista de UX/Game Design, três "personalidades" de entidade materializam a hierarquia acima e **não devem ser confundidas** entre si, apesar de todas compartilharem a mesma base estrutural (Action + regras LEAF/AGGREGATOR):

- **Afazeres (`Action`, `lifecycle_type='ACTION'`):** tarefas operacionais *one-off*. Fez, sumiu — não retornam ao calendário. Ex.: "Pagar uma conta", "Buscar um exame". São a unidade atômica de execução tática da hierarquia.
- **Hábitos (`Action`, `lifecycle_type='HABIT'`, ciclo temporal):** Actions com flag de recorrência (`recurrence_config`) que **não são Projetos**. Vivem no calendário do banco de dados e "brotam" na Lista Diária automaticamente na frequência configurada (Diária, Semanal, Mensal ou Anual). Ver modelo completo em [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md).
- **Quests (`lifecycle_type='QUEST'`, a Jornada de RPG):** representam marcos e conquistas de médio/longo prazo. Ao contrário de Afazeres e Hábitos, Quests têm **aba própria, com apresentação visual rica** (estilo "livro de missões" à Skyrim — barra de progresso, narrativa, recompensas), reforçando a fantasia de RPG do Conselho Elemental. Os passos internos de uma Quest (as Actions vinculadas via `quest_actions`) **não** ficam confinados à aba de Quests para execução — eles caem na Lista Diária como Actions comuns, para o usuário executar no dia a dia; a Quest apenas acompanha o progresso agregado desses vínculos (ver seção 5 abaixo).

Essa distinção é de **apresentação/UX**, nunca estrutural: as três continuam obedecendo rigorosamente à mesma regra LEAF/AGGREGATOR da Seção 2 e ao mesmo Motor de Pontuação — Hábito é fisicamente uma Action (ver ADR-001); Quest não é "dona" das Actions, apenas as referencia (ver nuance relacional abaixo).

### Nuance relacional importante (não perder esta regra)

Na implementação atual, nem toda relação da hierarquia acima é uma árvore estrita de contenção 1:N. Vale o seguinte modelo relacional:

- **Project → Mission:** 1:N estrito. Mission **só existe** dentro de um Project (não há tela/rota separada — Mission vive dentro do `ProjectDetailModal` do módulo Projetos).
- **Mission → Action:** 1:N estrito.
- **Quest ↔ Action:** relação **N:N** via tabela de junção (`quest_actions`), não containment. Uma Quest pode agregar Actions já existentes de múltiplas origens, e a mesma Action pode contribuir para várias Quests simultaneamente. Quest também pode existir **sem nenhuma Action vinculada** (completude manual).
- **Action → ActionItem:** 1:N estrito, árvore recursiva (ActionItem pode ter ActionItem-filho).

Ou seja: a "seta" Quest → Action da hierarquia global acima representa **vínculo (link)**, não posse exclusiva — trate Quest como uma camada de agrupamento estratégico que aponta para Actions, e não como um nó pai tradicional na árvore de agregação de pontos. Isso não muda a regra de pontuação (Quest ainda soma o valor das Actions vinculadas quando exibida), mas muda a regra de exclusão/cascata ao deletar: apagar uma Quest remove só os vínculos, nunca as Actions.

### Critério de decisão (Quest vs. Action)

| Pergunta | Resposta | Resultado |
|---|---|---|
| Cabe em uma única sessão de trabalho? | Sim | **ACTION** |
| Representa um marco/conquista celebrável? | Sim | **QUEST** |
| Leva mais de ~3 dias corridos? | Sim | **QUEST** (provavelmente) |
| Envolve múltiplos passos distribuídos no tempo? | Sim | **QUEST** (com Actions vinculadas) |

### Completude por nível

```
ACTION:
  Sem ActionItems → completude manual.
  Com ActionItems → auto-completa quando todos os itens 'structural' (Check) completam;
                     itens 'valuable' (Task) e 'text' (Note) não bloqueiam a auto-completude do pai.

QUEST:
  Sem Actions vinculadas → completude manual (ex.: "Ler 12 livros no ano").
  Com Actions vinculadas → auto-completa quando todas as Actions vinculadas completam.
```

---

## 5. A Lista Diária (Santuário): Funil de UX

A Lista Diária — também chamada de "Santuário" na linguagem narrativa do produto — é o **funil de execução único** do sistema: o lugar onde tudo que "precisa ser feito hoje" converge, independentemente da sua origem estrutural.

```
Convergem na Lista Diária, sem distinção visual entre si:
  • Afazeres (Action) agendados/criados para hoje
  • Hábitos (Action + recorrência) cuja recorrência bate com a data de hoje
  • Passos de Quest (Actions vinculadas via quest_actions) que o usuário decidiu executar hoje
  • Ações injetadas por Módulos Nativos (Grimório, Forja, Diário de Sonhos)
```

**Regra de UX explícita:** dentro da Lista Diária, o usuário **não diferencia visualmente** se um item é um Afazer, um Hábito ou o passo de uma Quest — todos aparecem como o mesmo tipo de checkbox executável, com o mesmo tratamento visual e a mesma mecânica de conclusão. A origem estrutural só é relevante para:

- **De onde o item veio** (qual tela/aba o gerou ou o mantém).
- **Para onde o evento de conclusão se propaga** (ex.: Quest atualiza sua barra de progresso agregada; Hábito atualiza streak/avança HabitRotation; Módulo Nativo recebe webhook de retorno — ver [../02-Platform-Architecture/03-A-Lista-Diaria.md](../02-Platform-Architecture/03-A-Lista-Diaria.md)).
- **Como a recorrência é recalculada no dia seguinte** (Afazer não retorna; Hábito reaparece conforme `recurrence_config`; passo de Quest só reaparece se o usuário voltar a agendá-lo).

Fora isso, a experiência de execução é **idêntica**: mesmo checkbox, mesmo cálculo de pontos (Motor de Pontuação), mesmo impacto em Prana.

---

## 6. Referências Cruzadas

- Distribuição de pontos multi-área e Prana → [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md)
- Hábitos como Action com `lifecycle_type='HABIT'` → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md)
- Lista Diária como funil agnóstico e webhook de retorno → [../02-Platform-Architecture/03-A-Lista-Diaria.md](../02-Platform-Architecture/03-A-Lista-Diaria.md)
- Decisão histórica de modelagem de Hábitos → [../03-ADRs/ADR-001-Habits-as-Actions.md](../03-ADRs/ADR-001-Habits-as-Actions.md)
