---
title: "Domain Core: Motor de Pontuação e Energia"
version: "6.0"
date: "2026-10-09"
status: "Canonical — Regras de negócio"
---

# Motor de Pontuação e Energia

Este documento especifica o cálculo de pontos por execução, a alocação dos pontos entre áreas e os efeitos energéticos do Prana. A mesma regra deve ser aplicada a execuções iniciadas pela interface, pela Lista Diária ou por um Módulo Nativo.

## 1. Modelo de valor

O domínio distingue três valores:

| Valor | Definição | Persistência |
|---|---|---|
| `base_value` | Valor-base da folha definido pelo usuário ou calculado pelo módulo de origem. | Persistido no item. |
| `planned_value` | Projeção calculada com os parâmetros planejados disponíveis. | Derivado; não editável diretamente. |
| `executed_value` | Resultado calculado na conclusão, usando os dados registrados para aquela execução. | Registrado no `ExecutionLog`. |

`ExecutionLog` é imutável enquanto existir: parâmetros e resultados de uma execução persistida não podem ser editados nem recalculados retroativamente. Essa imutabilidade não impede sua exclusão física pelo fluxo explícito de Undo. Undo não cria log de estorno.

O Core valida e calcula a pontuação. Um módulo nativo pode fornecer um `base_value` fracionário, mas não pode substituir as regras de cálculo do Core.

### 1.1 Origem do valor-base

- **Item genérico:** `base_value` padrão igual a `1`, editável pelo usuário e maior que zero.
- **Item originado em módulo nativo:** `base_value` calculado a partir da métrica de domínio e bloqueado para edição manual. O valor pode ser fracionário.
- O item deve identificar a origem por `source_module` e `source_ref_id`, permitindo rastreabilidade e reconciliação.

O **Módulo de Treino** é responsável por calcular o valor-base consolidado do treino conforme a seção 5. A **Forja** é exclusivamente a inbox de Rascunhos e triagem; não calcula exercícios nem representa o Módulo de Treino.

## 2. Cálculo de pontos por folha

O Core pontua unidades elegíveis da árvore `actions`: a raiz pode usar seu próprio `base_value` quando não há descendentes `VALUABLE`; havendo passos `VALUABLE`, as folhas pontuáveis desses ramos fornecem seus valores e a raiz agrega os resultados concluídos. A regra é recursiva em qualquer profundidade. `VALUELESS` e `NOTE` nunca geram XP/base_value. Os multiplicadores são aplicados uma vez à unidade pontuável concluída; ancestrais somam os resultados projetados sem reaplicá-los.

### 2.1 Multiplicador de esforço

| `effort_level` | Multiplicador |
|---:|---:|
| 1 | ×1.0 |
| 2 | ×1.2 |
| 3 | ×1.5 |
| 4 | ×2.0 |
| 5 | ×2.8 |

`effort_level` é inteiro de 1 a 5. Item sem esforço explicitamente definido usa o padrão de domínio `1`; o sistema não infere esforço a partir do título, área ou duração.

### 2.2 Multiplicador de tempo

O multiplicador de tempo usa a duração real registrada para a execução. Esta tabela substitui a curva anterior, cujo teto era ×80.0.

| Duração real | Multiplicador |
|---|---:|
| Menos de 5 min | ×1.0 |
| `5 ≤ t < 16` min | ×1.2 |
| `16 ≤ t < 31` min | ×1.5 |
| `31 ≤ t < 61` min | ×2.0 |
| `61 ≤ t < 91` min | ×2.5 |
| `91 ≤ t ≤ 120` min | ×3.0 |
| `t > 120` min | ×4.0 (teto) |

`t` é a duração real registrada em minutos e pode ser fracionária. As condições da tabela são exaustivas e sem sobreposição. Duração nula significa que o usuário não informou tempo: nesse caso, `time_multiplier = 1.0`. Não inferir duração. Valores negativos ou não numéricos são inválidos.

### 2.3 Bônus de presença

O bônus de presença é determinado pela duração real informada e aplicado uma única vez por folha. Não depende de streak nem de histórico anterior.

| Duração real | Bônus | Fator aplicado `(1 + presence)` |
|---|---:|---:|
| Menos de 30 s | 0.0 | ×1.0 |
| 30–59 s | 0.1 | ×1.1 |
| 60–119 s | 0.3 | ×1.3 |
| 120 s ou mais | 0.5 (teto) | ×1.5 |

Sem duração real informada, `presence = 0`. O tempo usado para presença e para a faixa de multiplicador deve vir do mesmo registro de execução.

### 2.4 Teto rígido por esforço

Depois de calcular o valor bruto da folha, o Core aplica o teto correspondente ao `effort_level`. O teto é por folha e por execução, antes da divisão entre áreas.

| `effort_level` | Teto por execução |
|---:|---:|
| 1 | 10 pontos |
| 2 | 25 pontos |
| 3 | 50 pontos |
| 4 | 100 pontos |
| 5 | 200 pontos |

```text
raw_leaf_value = base_value
               × (1 + presence)
               × effort_multiplier(effort_level)
               × time_multiplier(actual_time)

projected_leaf = MIN(raw_leaf_value, effort_cap(effort_level))
```

Para execução sem tempo registrado, `time_multiplier = 1.0` e `presence = 0`. Portanto, `raw_leaf_value = base_value × effort_multiplier`. `projected_leaf` não pode exceder o teto do esforço associado à folha.

O teto não aumenta por haver várias áreas. O valor limitado é o orçamento total gerado pela execução, e a distribuição da seção 3 apenas aloca esse orçamento.

Neste documento, `final_value` é um alias de `projected_leaf`: o valor pós-teto e pré-distribuição por áreas. A distribuição de base mantém soma de 100% desse valor. Bônus de Ressonância Elemental são lançamentos independentes e não alteram `final_value`, seu teto ou suas parcelas multiárea.

## 3. Distribuição multiárea com orçamento constante

`projected_leaf` representa 100% dos pontos gerados. Se a folha for associada a mais de uma área, o Core divide esse orçamento conforme o número de áreas. A soma das parcelas deve ser sempre 100% de `projected_leaf`.

| Áreas atribuídas | Primária | Secundária | Terciária | Total |
|---:|---:|---:|---:|---:|
| 1 | 100% | — | — | 100% |
| 2 | 70% | 30% | — | 100% |
| 3 | 60% | 25% | 15% | 100% |

```text
primary_points   = projected_leaf × primary_share
secondary_points = projected_leaf × secondary_share  // se houver
tertiary_points  = projected_leaf × tertiary_share   // se houver
```

As participações são determinadas pelo número de áreas efetivamente associadas. Não criar parcelas para áreas ausentes. `base_value` permanece singular e não existe valor-base independente por área.

### 3.1 Exemplo

Execução com `base_value = 1`, esforço 5, duração de 90 min e três áreas:

```text
presence = 0.5
raw_leaf_value = 1 × 1.5 × 2.8 × 2.5 = 10.5
effort_cap = 200
projected_leaf = MIN(10.5, 200) = 10.5

Área primária:    10.5 × 0.60 = 6.30 pontos
Área secundária:  10.5 × 0.25 = 2.625 pontos
Área terciária:   10.5 × 0.15 = 1.575 pontos
Total alocado:    10.5 pontos
```

Arredondamento para exibição não altera o valor canônico armazenado nem o total alocado. A precisão e a estratégia de arredondamento de persistência devem ser únicas no Core para impedir divergências acumuladas.

### 3.2 Agregadores

Agregadores somam os valores efetivamente alocados pelas unidades pontuáveis descendentes da árvore `actions`, área por área e em qualquer profundidade. Não recebem teto próprio, não recebem multiplicadores e não redistribuem a soma. `VALUELESS` e `NOTE` não pontuam.

## 4. Prana — Energia Vital

`prana_level` representa a energia vital disponível ao usuário, limitado ao intervalo `[0, 100]`. O Prana não é uma recompensa de interface nem um prêmio por limpar listas: a única operação de domínio que o recupera é a conclusão de uma tarefa ou hábito com `task_energy_type = 'RESTORATIVE'`, processada pelas regras desta seção. Conclusões comuns, Ressonância, bônus diários, Marcos de Consistência, badges, Quests e Projetos nunca restauram Prana. Débitos por esforço e reversões explícitas por Undo continuam permitidos. O delta efetivamente aplicado deve ser registrado em cada execução.

### 4.1 Custo de esforço

Execuções neutras e venenosas debitam Prana uma vez por folha conforme o esforço:

| `effort_level` | Delta de Prana |
|---:|---:|
| 1 | −5 |
| 2 | −10 |
| 3 | −15 |
| 4 | −25 |
| 5 | −35 |

```text
prana_after = CLAMP(prana_before + prana_delta, 0, 100)
```

### 4.2 Natureza energética

| `task_energy_type` | Pontos elementais | Efeito de Prana |
|---|---|---|
| `NEUTRAL` (padrão) | Calculados normalmente. | Débito pelo `effort_level`. |
| `RESTORATIVE` | Calculados normalmente, sujeitos ao teto por esforço. | Recuperação pela duração real, conforme tabela 4.3; não debita custo de esforço. |
| `POISON` | Zero pontos-base nas áreas atribuídas, independentemente do valor bruto calculado. | Débito pelo `effort_level`. |

Itens `POISON` mantêm seu registro de execução e delta de Prana, mas não distribuem pontos-base às áreas atribuídas. Como toda folha `Action`/`Habit` concluída, ainda podem gerar o bônus separado de Ressonância de Fogo definido na seção 8. A condição `POISON` não permite contornar validações de esforço ou de duração.

### 4.3 Recuperação de Prana

A recuperação de tarefas `RESTORATIVE` usa o tempo real registrado:

| Duração real | Recuperação |
|---|---:|
| `t < 10` min | +10 |
| `10 ≤ t < 30` min | +20 |
| `30 ≤ t < 60` min | +35 |
| `t ≥ 60` min | +50 |

Sem duração real registrada, não há recuperação por tempo (`+0`). O resultado é limitado a 100 pelo `CLAMP`. Exemplos comuns incluem Yoga, Mobilidade, Alongamento, meditação e sono, desde que o item tenha `task_energy_type = 'RESTORATIVE'` explicitamente definido.

### 4.4 Custo do Módulo de Treino

O Módulo de Treino calcula o `base_value` pela métrica detalhada de exercícios, mas a pontuação e o custo energético são processados pelo Core. Treinos normais usam o `effort_level` global da sessão, associado às folhas injetadas, para determinar o débito de Prana. Na faixa normalmente utilizada por sessões de treino:

- Esforço 3: −15 Prana.
- Esforço 4: −25 Prana.
- Esforço 5: −35 Prana.

Se o treino tiver `task_energy_type = 'RESTORATIVE'` — por exemplo, Yoga ou Mobilidade — não há débito por esforço. O Core aplica a tabela de recuperação da seção 4.3 com base no tempo real investido. Essa é a única recuperação de Prana disponível no sistema. O módulo não altera diretamente o saldo de Prana.

### 4.5 Ordem de processamento da conclusão

1. Validar usuário, item, estado de conclusão, esforço, duração e idempotência da solicitação.
2. Identificar as unidades pontuáveis concluídas: raiz quando não há descendentes `VALUABLE`, ou nós `VALUABLE` folha em cada ramo recursivo; obter os dados de execução de cada unidade.
3. Calcular presença, multiplicador de tempo e valor bruto de cada folha.
4. Aplicar o teto de esforço por folha.
5. Se `task_energy_type = 'POISON'`, definir pontos alocados como zero; caso contrário, dividir o orçamento entre áreas conforme a seção 3.
6. Calcular o delta de Prana conforme a natureza energética e aplicar o limite `[0, 100]`.
7. Persistir atomicamente o registro de execução, pontos por área e delta de Prana para impedir aplicação duplicada.
8. Propagar somas aos agregadores sem novo cálculo de multiplicador ou teto.
9. Avaliar os gatilhos de Ressonância Elemental e registrar cada bônus elegível uma única vez, conforme a seção 8.

O tratamento de Undo e a definição operacional de imutabilidade estão na seção 6.

## 5. Módulo de Treino: Equivalentes de Repetição

O Módulo de Treino converte o volume de uma sessão em um único `base_value` fracionário consolidado antes de enviar o item ao Core. O Core então aplica presença, esforço, tempo, teto e distribuição multiárea pelas regras deste documento.

### 5.1 Unidade de volume

Um **Equivalente de Repetição (ER)** é a unidade normalizada de trabalho do Módulo de Treino:

- Uma repetição dinâmica = `1 ER`.
- Dois segundos de isometria = `1 ER`.
- `1 ER = 0.03` de `base_value`.

Para isometria, a duração válida é inteira em segundos; o total de ER pode ser fracionário se o tempo não for múltiplo de dois. A precisão numérica aplicada deve ser consistente na consolidação.

### 5.2 Fator de carga/progressão

Cada série recebe exatamente um fator, definido pelo usuário ou pelo programa do treino:

| Classificação da série | Fator |
|---|---:|
| Leve / Aquecimento | ×0.8 |
| Manutenção / Atual | ×1.0 |
| Progressão / PR | ×1.5 |

O fator classifica a carga relativa da série; não é uma nova dimensão de pontuação do Core.

### 5.3 Consolidação

Para cada série, o módulo calcula ER conforme o tipo de exercício e multiplica pelo fator de carga. Soma os resultados de todas as séries e exercícios concluídos da sessão e converte o total em `base_value`:

```text
series_er = repetition_count
          OR (isometric_seconds / 2)

weighted_er = series_er × load_factor
session_er = SUM(weighted_er for completed sets and exercises)
base_value = session_er × 0.03
```

Exemplo: uma prancha de 60 segundos classificada como Manutenção gera `30 ER × 1.0 = 30 ER`, equivalente a `0.9 base_value`. O módulo envia um único item consolidado por sessão concluída; não cria um item pontuável por repetição ou por série. Séries incompletas, puladas ou canceladas não entram na soma.

O Core valida que o valor seja numérico e maior ou igual a zero para sessões sem trabalho concluído, ou estritamente maior que zero para uma execução que gere pontos. O `base_value` originado do módulo é somente leitura na interface genérica. O teto por esforço continua aplicável após os multiplicadores do Core; o volume da sessão não remove o teto.

## 6. Undo e imutabilidade do `ExecutionLog`

### 6.1 Semântica de imutabilidade

Uma linha de `ExecutionLog` persistida não pode ser alterada para mudar tempo real, esforço, valores, áreas, presença, Prana ou parâmetros usados no cálculo. Não se recalcula um evento antigo com regras atuais. Se o usuário desfaz a execução, a linha original pode ser removida fisicamente (**Hard Delete**); não se grava um evento financeiro de estorno.

### 6.2 Undo de uma execução

Ao desmarcar uma folha concluída, o Core deve identificar a linha exata de `ExecutionLog` por seu ID e pelo usuário autenticado. Em uma única transação, deve:

1. Ler os valores persistidos da execução: parcelas de pontos por área e `prana_delta_applied` (delta efetivamente aplicado, com sinal).
2. Excluir fisicamente os lançamentos `ResonanceLog` gerados diretamente por aquela execução, incluindo a Faísca de Fogo.
3. Subtrair das áreas cada parcela-base registrada e também os bônus de Ressonância associados, incluindo o crédito de `area-faisca-acao`.
4. Reverter Prana aplicando o inverso do delta efetivo: `prana_after_undo = CLAMP(prana_current - prana_delta_applied, 0, 100)`. Assim, custo negativo é devolvido; recuperação positiva é subtraída. Usar o delta efetivo evita devolver energia que não chegou a ser aplicada por causa do limite 0–100.
5. Excluir fisicamente o `ExecutionLog` exato.

Os totais materializados devem ser decrementados pelas parcelas armazenadas na linha. Se forem derivados de consultas, a exclusão deve remover automaticamente a contribuição. Persistência, exclusão e atualização de saldos devem ser atômicas: todas as alterações são aplicadas ou nenhuma. Repetir Undo para um ID já excluído é uma operação idempotente sem novo débito ou crédito.

Não gerar linha de estorno, compensação ou novo `ExecutionLog`. Após o Hard Delete, aquela execução deixa de fazer parte do histórico ativo. Telemetria técnica sem valores de pontuação não constitui um lançamento de domínio.

### 6.3 Undo de classificação e bônus de Ar

O bônus de Ar pertence ao evento de primeira classificação do Rascunho, não a uma execução. Se uma ação explícita desfizer essa classificação e restaurar o estado de Rascunho, o Core deve excluir fisicamente o `ResonanceLog` daquela classificação e subtrair o ponto de Ar concedido. Um marcador de estado (`planning_resonance_claimed_at`) permanece no item após o Undo para impedir novo pagamento ao reclassificar o mesmo Rascunho; esse marcador não é um log de estorno. Editar ou reclassificar sem desfazer a classificação original não altera nem duplica o bônus.

### 6.4 Reabrir Projeto ou Quest

Ao reabrir um Projeto concluído, o Core exclui fisicamente o `ResonanceLog` do pagamento de Terra vinculado àquela conclusão e subtrai o bônus do total de Terra. Ao reabrir uma Quest, aplica a mesma operação ao pagamento de Água. Não criar lançamento de estorno. O marcador de pagamento vitalício (`resonance_reward_claimed_at`) permanece na entidade, impedindo que concluir novamente o mesmo Projeto ou Quest conceda um segundo pagamento.

O Undo do agregador **não desfaz os filhos**: Actions, Hábitos, Tasks e seus `ExecutionLog`s permanecem concluídos. Cada filho só perde seus pontos e sua Faísca de Fogo se o usuário desfizer aquele filho separadamente. Para cada agregador, o pagamento de conclusão é único; reabri-lo e concluí-lo novamente não concede novo bônus para o mesmo ID.

### 6.5 Consistência e limites

- Um Undo só pode remover o evento exato escolhido pelo usuário; não apagar logs por intervalo de datas, título ou agregação implícita.
- Undo de execução remove bônus diretamente ligados ao `ExecutionLog`. Bônus de classificação de Ar são removidos ao desfazer a classificação; bônus de Terra/Água, ao reabrir o agregador correspondente.
- Desfazer um filho não reabre automaticamente Projeto ou Quest nesta regra. Para retirar o pagamento do agregador, o usuário deve reabrir explicitamente esse Projeto/Quest.
- A rotação `HabitRotation` é forward-only: desfazer um Hábito remove execução, pontos, Prana e Faísca, mas não recua `current_position`.
- O evento de Undo deve ser propagado ao Módulo Nativo somente depois do commit, para que o módulo reconcilie seu estado sem recriar a conclusão removida.

### 6.6 Conversão estrutural e referência histórica

Uma conversão pós-criação pode migrar o vínculo de identidade de um `ExecutionLog` para a entidade destino. Essa operação não recalcula nem edita o snapshot imutável da execução: tempo, effort, valores, parcelas, Prana, timestamps e `rule_version` permanecem idênticos. O vínculo polimórfico (`subject_type`, `subject_id`) e o `conversion_id` registram a nova associação e sua linhagem. Bônus de Ressonância já pagos preservam valor e elemento originais; a conversão não dispara bônus do tipo de destino. Se a migração não puder preservar o snapshot e seus lançamentos derivados, deve ser bloqueada.

## 7. Limites e requisitos de consistência

- O resultado de uma execução com os mesmos dados e a mesma versão de regra deve ser determinístico.
- Conclusão e Undo devem ser idempotentes: repetição não duplica pontos, Prana ou bônus e não produz efeito se o evento original já foi removido.
- O cálculo do Core é a fonte canônica dos pontos; o Módulo de Treino fornece somente dados de domínio e `base_value` consolidado.
- A divisão por áreas preserva o orçamento total, inclusive após agregação.
- Cada `ExecutionLog` deve permitir reconstruir o cálculo enquanto existir: parâmetros, versão da regra, valor bruto, teto aplicado, valor pontuado, parcelas por área e delta efetivo de Prana.

## 8. Ressonância Elemental

Ressonância Elemental é uma camada de bônus passivos disparada por eventos estruturais do ciclo de vida. Os bônus são adicionais às parcelas-base distribuídas por área: não modificam `final_value`, não alteram o teto por esforço e não são redistribuídos pelas regras multiárea.

Os quatro bônus usam os elementos como dimensão de Analytics. O Core persiste cada lançamento de forma atômica com o evento que o dispara e impõe idempotência pela chave do evento de origem. O registro deve conter, no mínimo, `user_id`, `resonance_type`, `subject_id`, `basis_value`, `bonus_value`, `element_id`, `area_id` quando aplicável, `rule_version` e timestamp. `ResonanceLog` não é append-only: o Undo pode removê-lo fisicamente junto ao evento de origem, sem gerar estorno.

### 8.1 Fogo — Faísca da Ação

Na conclusão de cada folha `LEAF` de tipo `Action` ou `Habit`, o Core gera uma única Faísca de Fogo:

```text
fire_resonance_bonus = final_value × 0.10
element_code = 'fire' // código semântico; resolver para elements.id (UUID v4)
area_code = 'area-faisca-acao' // código semântico; resolver para areas.id (UUID v4)
```

O bônus independe das áreas primária, secundária ou terciária do item. `area-faisca-acao` é o `area_code` estável de uma área de sistema invisível vinculada ao elemento Fogo. A FK `area_id` armazena UUID v4 textual; o código serve apenas para resolução semântica. A área é usada exclusivamente para Analytics: não aparece em seletores, não pode ser editada pelo usuário e não participa da distribuição multiárea normal. Uma execução repetida ou reprocessada não deve criar uma segunda Faísca para o mesmo `ExecutionLog`.

`POISON` não recebe pontos-base nas áreas atribuídas, mas sua folha `Action`/`Habit` concluída segue o gatilho universal de Faísca; o bônus é calculado sobre o `final_value` pós-teto da folha e registrado separadamente. Para folhas com `final_value = 0`, o bônus é zero.

### 8.2 Ar — Clareza do Planejamento

Quando o usuário classifica com sucesso um Rascunho — transição de `lifecycle_type = null` para uma entidade classificada com tipo e área — o Core registra um bônus fixo de `1.0` ponto para Ar. A recompensa corresponde ao evento de primeira classificação do Rascunho, não à edição posterior de seus campos.

O bônus não depende do tipo de entidade resultante e não é concedido por correções, reclassificações, migrações de dados ou repetição técnica da mesma solicitação. Ar deve ser registrado como elemento da recompensa (`element_code = 'air'`, resolvido para `element_id` UUID v4); não se atribui uma área de usuário. Se a classificação for revertida e refeita, o identificador original do Rascunho impede novo pagamento.

### 8.3 Terra — Fundação do Projeto

Na primeira transição de um Projeto para concluído, o Core calcula um pagamento único:

```text
project_basis = SUM(pontos-base atribuídos + Faísca de Fogo
                    de cada ExecutionLog único agregado pelo Projeto)
earth_resonance_bonus = project_basis × 0.10
element_code = 'earth' // código semântico; resolver para elements.id (UUID v4)
```

O conjunto de execuções é congelado no instante de conclusão. Cada execução subjacente entra no máximo uma vez no `project_basis`, mesmo se aparecer em mais de um caminho hierárquico do Projeto. Os pontos-base correspondem à soma das parcelas atribuídas às áreas após a regra energética (100% de `final_value` para tipos diferentes de `POISON`; zero para `POISON`). A Faísca de Fogo da execução é incluída uma vez, pois também é pontuação agregada pelos itens filhos. Bônus de classificação de Ar e pagamentos de agregadores Terra/Água não entram na base de outro bônus. `resonance_reward_claimed_at` é definido no primeiro pagamento e permanece após Undo.

Um Projeto sem pontos-base agregados recebe `0` de bônus. Reabrir e concluir novamente o mesmo Projeto não paga outra vez. O pagamento é registrado uma vez por `project_id` e pela transição inicial de conclusão.

### 8.4 Água — Conquista da Quest

Na primeira transição de uma Quest para concluída, o Core calcula um pagamento único:

```text
quest_basis = SUM(pontos-base atribuídos + Faísca de Fogo
                  de cada ExecutionLog único agregado/vinculado à Quest)
water_resonance_bonus = quest_basis × 0.10
element_code = 'water' // código semântico; resolver para elements.id (UUID v4)
```

O conjunto é congelado no instante da conclusão. Para Quests com vínculos N:N, cada `ExecutionLog` entra no máximo uma vez na base daquela Quest, mesmo que as relações estruturais permitam múltiplos caminhos. `POISON` contribui zero pontos-base, mas a Faísca de Fogo associada à execução é incluída uma vez. Bônus de classificação de Ar e pagamentos de agregadores Terra/Água não entram na base. Quest sem pontos agregados gera bônus zero. `resonance_reward_claimed_at` é definido no primeiro pagamento e permanece após Undo, impedindo novo pagamento ao reabrir e concluir a mesma Quest.

### 8.5 Não-conflito e persistência

- Folhas `Action`/`Habit` continuam gerando suas Faíscas de Fogo no momento das conclusões individuais, mesmo quando pertencem a um Projeto ou Quest.
- O bônus de Terra ou Água é um **lump sum** único, disparado somente ao concluir o agregador pai; não substitui nem posterga os bônus das folhas.
- Concluir um agregador não repete a Faísca de folhas já executadas.
- Os bônus de Projeto e Quest usam os pontos-base agregados e as Faíscas de Fogo das folhas. Excluem bônus de classificação de Ar e pagamentos prévios de agregadores Terra/Água, evitando composição e ciclos entre agregadores.
- Chaves idempotentes recomendadas: `(resonance_type, execution_log_id)` para Fogo; `(resonance_type, draft_id)` para Ar; `(resonance_type, project_id)` para Terra; `(resonance_type, quest_id)` para Água.
- O Undo de execução exclui seus lançamentos de Ressonância vinculados. Desfazer classificação ou reabrir Projeto/Quest exclui o bônus correspondente conforme seção 6; não criar lançamentos compensatórios.
- A precisão decimal e o arredondamento dos bônus devem seguir a estratégia canônica de persistência do Core. O valor calculado deve ser preservado no log; arredondamento somente para apresentação.

## 9. Resolução diária: Snooze, Skip e gamificação

### 9.1 Snooze versus Skip

`Snooze` altera o agendamento de uma Action única (`lifecycle_type = 'ACTION'`): atualiza `due_date` para uma data futura no fuso local do usuário. Não cria `ExecutionLog`, não concede XP e não altera Prana. Se não for novamente adiada ou concluída e sua data vencer, a Action entra em Rollover e aparece como atrasada na Lista Diária. Snooze não é aplicável a Hábitos.

`Skip` é resolução explícita de ocorrência de Habit avulso, membro de `HabitRotation` ou treino. Ele persiste um `ExecutionLog` com `status = 'SKIPPED'`, `executed_value = 0`, pontos por área iguais a zero e `prana_delta_applied = 0`. Não gera bônus de Ressonância de conclusão. Resolve somente a ocorrência da data corrente, sem Rollover. Se for membro de rotação, a rotação avança um membro após o Skip persistir. Undo do Skip segue Hard Delete; não reverte o ponteiro forward-only.

Treinos oriundos de Template podem receber Skip mesmo quando agendados como Action única; essa exceção de domínio não transforma o item em Habit nem amplia a elegibilidade de Snooze para outros módulos. A chave de idempotência deve identificar usuário, item, origem da ocorrência e data local para impedir múltiplos registros ou avanços.

### 9.2 Dia operacional e elegibilidade

O dia gamificado é a data civil no fuso horário IANA local do usuário e reinicia à meia-noite local. Implementações devem tratar transições de horário de verão como limites de calendário local, não como intervalos fixos de 24 horas. A Lista Diária congela um snapshot das ocorrências elegíveis no início do dia (ou na primeira materialização idempotente daquele dia). Itens pausados antes do snapshot não integram o denominador; pausar depois não remove retroativamente uma ocorrência elegível.

### 9.3 Estados de gamificação diária

O Core classifica cada dia fechado, uma única vez por `(user_id, local_date)`, com base nas ocorrências do snapshot:

| Estado | Critério | Efeito |
|---|---|---|
| `MANAGED` (Dia Gerenciado) | Há ao menos uma ocorrência e todas foram resolvidas por `COMPLETED` ou `SKIPPED`. | Mantém o Marco de Consistência diário, se aplicável. Não concede bônus extra de XP ou Prana. |
| `FLAWLESS` (Dia Impecável) | Há ao menos uma ocorrência, todas foram `COMPLETED`, nenhuma foi `SKIPPED`; itens pausados antes do snapshot estão excluídos. | Concede o Bônus de Harmonia: +25 XP em cada Elemento (Terra, Fogo, Água e Ar), total de 100 XP. Não restaura Prana. |
| `INCOMPLETE` | Pelo menos uma ocorrência elegível permanece sem resolução no fechamento. | Não recebe Bônus de Harmonia nem qualifica como ciclo diário concluído. Conquistas já adquiridas permanecem. |
| `EMPTY` | Nenhuma ocorrência elegível no snapshot. | Sem bônus; não classificar como impecável por vacuidade. |

`RESTORATIVE` concluído conta como `COMPLETED`; sua recuperação ordinária por duração decorre exclusivamente da execução restauradora, nunca do estado do dia. Um `SKIPPED` permite classificar o dia como Gerenciado, mas sempre exclui o status Impecável.

O Bônus de Harmonia é fixo e versionado: `DAILY_FLAWLESS_XP_PER_ELEMENT = 25`, aplicado uma vez a cada um dos quatro Elementos, totalizando 100 XP. Não existe parâmetro de Prana associado. A aplicação é idempotente por `(user_id, local_date)`. Caso um Undo posterior altere o resultado diário, o Core remove fisicamente o registro do bônus diário afetado e subtrai os XP efetivamente aplicados, sem criar lançamento compensatório; o marcador de fechamento permanece para evitar pagamento duplicado. Nenhum caminho desse fluxo pode escrever em `prana_level`.

### 9.4 Marcos de Consistência

O produto não usa streak punitivo de dias consecutivos que zera ao falhar. A consistência é representada por ciclos concluídos e por marcos históricos colecionáveis. Para um Hábito, a unidade elegível é cada ocorrência em sua data programada; por exemplo, cumprir as ocorrências de terça e quinta ao longo de quatro semanas conclui o ciclo configurado. Uma ocorrência perdida interrompe o avanço do ciclo corrente conforme a meta do ciclo, mas não apaga medalhas ou conquistas históricas já adquiridas.

Completar metas semanais ou mensais pode conceder badges visuais ao Grimório/Perfil e bônus de XP Elemental definidos por milestone. Essas recompensas são XP/colecionáveis: não concedem nem recuperam Prana. A configuração do produto deve definir duração, calendário, tolerância, quantidade de ocorrências exigida e tabela de XP de cada marco; esses valores não são inferidos por esta regra. A política detalhada de recorrência/HabitRotation permanece em [02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md).

## 10. Progressão infinita e cálculo de níveis

O sistema mantém dois níveis derivados do XP Elemental bruto. Não há teto de nível (`level_cap`): todo XP válido contribui para uma progressão sem limite definido pelo produto.

### 10.1 Fontes de XP e níveis

- **Nível Elemental (`skill_level`)**: calculado separadamente para cada elemento a partir do XP bruto acumulado naquele elemento (`element_xp[element]`).
- **Nível Geral (`avatar_level`)**: calculado a partir da soma do XP bruto dos quatro Elementos: `total_elemental_xp = SUM(element_xp[e] for e in {TERRA, FOGO, AGUA, AR})`.
- Os níveis e títulos são projeções derivadas. A persistência canônica guarda XP bruto por elemento; não trata níveis calculados como saldo de domínio. Cache de leitura é permitido apenas como dado descartável e reconstruível.
- O Grimório apresenta nível, XP atual, XP necessário para o próximo nível, progresso dentro do nível e título para o Avatar e para cada Elemento.

### 10.2 Títulos por bracket

O título é selecionado pelo nível resultante, igualmente para o Avatar Geral e para cada Elemento:

| Nível | Título |
|---:|---|
| 1–9 | Iniciado |
| 10–24 | Aprendiz |
| 25–49 | Adepto |
| 50–74 | Especialista |
| 75–99 | Mestre |
| 100–149 | Grão-Mestre |
| 150–199 | Ancião |
| 200+ | Lenda |

### 10.3 Curva exponencial segmentada

O custo de XP por nível é exponencial e descontínuo nas fronteiras entre brackets. O custo para avançar do nível `L` para `L+1` é calculado usando os parâmetros do bracket do nível de destino, de modo que a mudança de título possa produzir um salto explícito de dificuldade:

```text
bracket(level) = bracket que contém `level`
xp_to_next(level) = CEIL(BASE_XP × level^EXPONENT × BRACKET_MULTIPLIER[bracket(level + 1)])
xp_threshold(1) = 0
xp_threshold(level) = SUM(xp_to_next(k) for k = 1..level-1)
```

`BASE_XP`, `EXPONENT` e `BRACKET_MULTIPLIER` são parâmetros versionados de balanceamento. Os coeficientes numéricos ainda precisam ser definidos pelo Game Design; não há valores implícitos ou defaults normativos nesta especificação. A configuração deve assegurar custo positivo, limiares estritamente crescentes e um salto intencional em **cada** transição de título, com `M[Iniciado] < M[Aprendiz] < M[Adepto] < M[Especialista] < M[Mestre] < M[Grão-Mestre] < M[Ancião] < M[Lenda]`. Os brackets iniciais devem ter multiplicadores baixos; Aprendiz/Adepto, moderados; Especialista/Mestre, altos; Grão-Mestre e superiores, muito altos. A curva deve permanecer sem teto e sem reinício de XP ao atravessar bracket.

O cálculo do nível atual, XP do nível e progresso utiliza os limiares acumulados. O serviço deve operar com precisão numérica que evite overflow ou perda de monotonicidade em progressão longa (por exemplo, inteiros de precisão arbitrária ou comparação por logaritmos), e retornar resultado determinístico para a mesma versão de configuração.

### 10.4 `LevelingCalculatorService`

Um serviço isolado chamado `LevelingCalculatorService` é a única autoridade de cálculo para níveis e projeções. Ele recebe o XP bruto e a versão da configuração de progressão e retorna o nível, título, XP acumulado no início do nível, XP até o próximo nível e progresso normalizado. Deve suportar tanto consultas de um Elemento quanto do Avatar Geral, sem exigir consultas por nível no banco de dados.

```typescript
interface LevelProgress {
  xp_total: string;                 // decimal serializado sem perda de precisão
  current_level: string;            // inteiro serializado, sem limite de domínio ou precisão de Number
  title: string;
  xp_at_level_start: string;
  xp_to_next_level: string;
  progress_fraction: number;        // [0, 1), somente apresentação
  ruleset_version: string;
}
```

O banco de dados persiste XP bruto decimal por Elemento e eventos necessários à auditoria; a representação deve preservar a precisão definida pelo Core. O nível não é gravado como fonte de verdade. O backend e o frontend podem consultar o serviço por contrato compartilhado/versionado, mas não podem manter implementações divergentes da fórmula. Alterar parâmetros exige nova `ruleset_version`; o XP histórico não é recalculado nem reescrito.

Para a composição da tela, títulos e contratos de leitura do Grimório, ver [05-Grimorio-e-Perfil.md](../02-Platform-Architecture/05-Grimorio-e-Perfil.md).

## 11. Referências

- Estrutura macro, árvore recursiva `actions` e `semantic_type` → [01-Hierarquia-e-Tipos.md](./01-Hierarquia-e-Tipos.md)
- Contrato de injeção de Módulos Nativos → [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md)
- Hábitos e rotações sequenciais → [../02-Platform-Architecture/02-Acoes-e-Habitos.md](../02-Platform-Architecture/02-Acoes-e-Habitos.md)
- Decisão histórica sobre bônus de presença → [../04-ADRs/ADR-000-Presence-Bonus-Correction.md](../04-ADRs/ADR-000-Presence-Bonus-Correction.md)
