---
title: "Domain Core: Motor de Pontuação e Energia (Prana)"
version: "2.0"
date: "2026-09-20"
status: "Canonical — Regras Imutáveis + Nova Camada de Energia"
---

# 02. Motor de Pontuação e Energia

Este documento define como um valor de pontos é calculado (modelo herdado, imutável) e como a nova camada de **Prana** (energia vital) se integra ao cálculo.

---

## 1. Modelo de Três Camadas de Valor

```
Base Value (Intenção)     — manual, semântico, definido pelo usuário
Planned Value (Expectativa) — derivado, somente leitura, preview
Executed Value (Realidade)  — logado, histórico, nunca afeta o planejamento
```

Estas camadas nunca são o mesmo campo. Valores derivados **nunca** são editáveis manualmente. Valores executados **nunca** retroalimentam o planejamento (histórico é imutável).

| Camada | Quando é calculada | Onde vive |
|---|---|---|
| **Base Value** | Definida na criação/edição do item | `base_value` na folha |
| **Planned Value** | Recalculada a cada edição (preview) | Nunca persistida — computada sob demanda |
| **Executed Value** | Calculada no momento da conclusão | `ExecutionLog` (imutável) |

### Regra do Valor Base Duplo (Dual Base Value)

**Decisão de Game Design:** `base_value` tem uma origem — e uma política de edição — estritamente diferente conforme a proveniência do item. Isso existe para impedir que o usuário infle pontos arbitrariamente mexendo na base em vez de investir tempo real (ver escalonamento agressivo do multiplicador de tempo, seção 2.2).

#### 1. Tarefas Genéricas (criadas manualmente pelo usuário)
```
base_value padrão = 1
Usuário PODE editar livremente (1, 2, 3, ...)
```
O ganho de pontos real deve vir da **execução do tempo** (multiplicador de tempo, seção 2.2), não de inflar `base_value` artificialmente. `base_value` alto sem tempo investido continua gerando pouco valor, já que o multiplicador de tempo domina a fórmula.

#### 2. Tarefas de Módulos Nativos (Treino, Leitura, Diário de Sonhos, etc.)
```
base_value = derivado estritamente da micro-métrica do módulo
  Ex.: 0.1 por página lida (Grimório)
       0.05 por repetição de exercício (Forja)
Usuário NÃO edita base_value neste caso — campo bloqueado (read-only) na UI.
```
O valor é calculado internamente pelo Módulo Nativo e **injetado já pronto** na Lista Diária (ver [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md)) — o Core apenas exibe e pontua o valor recebido, sem permitir edição manual.

| Origem do item | `base_value` default | Editável pelo usuário? | Aceita decimais? |
|---|---|---|---|
| Genérica (manual) | `1` | ✅ Sim, livremente | Sim, mas tipicamente inteiro |
| Módulo Nativo (injetada) | derivado da micro-métrica (ex. `0.1`, `0.05`) | ❌ Não — bloqueado/read-only | ✅ Sim, obrigatoriamente fracionário |

Micro-ações tipicamente chegam em lote (ex.: "30 páginas lidas hoje" gera um único `ActionItem` consolidado com `base_value = 30 × 0.1 = 3.0`, não 30 itens separados) — ver injeção de instâncias consolidadas no documento de Módulos Nativos.

Em ambos os casos, `base_value` aceita qualquer número positivo (`> 0`) — a diferença é exclusivamente **quem controla o valor e se ele é editável**, nunca o tipo de dado em si. O comportamento de agregação (soma de filhos) e distribuição multi-área é idêntico para os dois casos.

---

## 2. Multiplicadores (Aplicados na Folha, Não Empilham)

Multiplicadores só se aplicam em **Task leaves** (itens Task sem filhos Task). Pais nunca reaplicam multiplicadores — apenas somam os valores já projetados dos filhos.

### 2.1 Multiplicador de Esforço (`effort_level`)

| Nível | Resistência | Multiplicador |
|-------|-------------|---------------|
| 1 | Automático, sem fricção | ×1.0 |
| 2 | Resistência leve | ×1.2 |
| 3 | Resistência moderada | ×1.5 |
| 4 | Resistência forte | ×2.0 |
| 5 | Altamente evitado | ×2.8 |

`effort_level` sempre existe (default = 1) e **sempre multiplica**, mesmo quando = 1 (×1.0 nunca é "pulado").

### 2.2 Multiplicador de Tempo (Escalonamento Agressivo)

**Decisão de Game Design (revisão):** a curva de tempo foi reformulada para recompensar de forma acentuada o **trabalho profundo** (sessões longas e focadas) frente a muitas tarefas curtas e triviais, combatendo a inflação de pontos por volume de itens pequenos.

| Tempo | Multiplicador |
|-------|---------------|
| < 5 min | ×1.0 |
| 5–15 min | ×2.0 |
| 16–30 min | ×6.0 |
| 31–60 min | ×15.0 |
| 61–90 min | ×30.0 |
| 91–120 min | ×50.0 |
| > 120 min | ×80.0 (teto) |

O multiplicador de tempo agora cobre **todo o espectro de duração** (inclusive tarefas muito curtas, com fator neutro ×1.0) — não é mais condicionado a um piso mínimo de 3 minutos para começar a valer. Ele só é aplicado quando o tempo é **explicitamente registrado**; ausência de tempo continua sem gerar nenhum multiplicador (ver fórmula 2.4). Tempo **nunca** é inferido — só existe se explicitamente definido pelo usuário (planejamento) ou logado na execução.

### 2.3 Bônus de Presença (correção oficial — ver [ADR-000](../03-ADRs/ADR-000-Presence-Bonus-Correction.md))

Bônus de presença é uma **tabela de busca por tempo**, não uma métrica de streak/consistência. Aplica-se uma vez por folha, no momento do cálculo.

| Duração real | Bônus | Multiplicador |
|---|---|---|
| < 30 segundos | +0.0 | 1.00x |
| 30–59 segundos | +0.1 | 1.10x |
| 60–119 segundos (1–2 min) | +0.3 | 1.30x |
| ≥ 120 segundos (≥ 2 min) | +0.5 | 1.50x (teto) |

```typescript
function getPresenceBonus(actualTimeMinutes: number): number {
  const seconds = actualTimeMinutes * 60;
  if (seconds < 30) return 0.0;
  if (seconds < 60) return 0.1;
  if (seconds < 120) return 0.3;
  return 0.5; // teto
}
```

### 2.4 Fórmula por folha (herdada, imutável)

```
projected_leaf = base_value × (1 + presence_bonus) × effort_multiplier × time_multiplier
```

Ausência de tempo (`null`) ≠ tempo zero: sem tempo definido, não há bônus de presença nem multiplicador de tempo — `value = base_value × effort_multiplier`.

---

## 3. Distribuição Multi-Área (100% / 60% / 30%)

Toda Action tem **exatamente um** `final_value` (após todos os modificadores) e de 1 a 3 áreas atribuídas (primária, secundária, terciária — as duas últimas opcionais).

```
final_value = base_value × (1 + presence) × effort_mult × time_mult

area_primary_points   = final_value × 1.00   (100%)
area_secondary_points = final_value × 0.60   (60%)
area_tertiary_points  = final_value × 0.30   (30%)
```

**Princípios críticos:**
- `base_value` é atômico e singular — nunca existe "base por área".
- Multiplicadores aplicam **uma vez** para gerar um único `final_value`; distribuição acontece **depois**.
- Áreas **recebem** frações do valor já calculado — não criam valor novo.
- A soma distribuída **pode exceder** `final_value` (ex.: 100%+60%+30% = 190%) — isso é intencional (sinergia entre áreas de vida), não é dupla contagem porque cada área rastreia seu total de forma independente.
- 1.00 / 0.60 / 0.30 são **constantes fixas do sistema**, nunca editáveis pelo usuário.

**Exemplo (multi-área completo, com a curva de tempo revisada):**
```
Action: "Dar aula de meditação para a equipe"
  base_value: 1, effort: 5 (×2.8), time: 90min (×30.0 — faixa 61–90min)
  final_value = 1 × 2.8 × 30.0 = 84.0

  Essência (primária):  84.0 × 1.00 = 84.00 pts
  Care (secundária):    84.0 × 0.60 = 50.40 pts
  Carreira (terciária): 84.0 × 0.30 = 25.20 pts
  Total distribuído: 159.60 pts (190% do final_value — sinergia intencional)
```

**Agregadores com filhos:** cada filho calcula seu próprio `final_value` e distribui às suas próprias áreas; o pai apenas **soma as distribuições por área** (área a área) — nunca recalcula ou redistribui.

Este modelo se aplica identicamente a Quests, Projects e Missions (mesmo mecanismo de agregação por área descrito em [01-Hierarquia-e-Tipos.md](./01-Hierarquia-e-Tipos.md)).

---

## 4. NOVA CAMADA: Energia (Prana)

### 4.1 O que é Prana

`prana_level` é um medidor de energia vital do usuário, escala **0–100**, persistido no perfil do usuário (não por item). Representa a capacidade de sustentar esforço ao longo do dia — narrativamente, a "mana" do Conselho Elemental.

```typescript
interface UserEnergyState {
  prana_level: number;       // 0–100, clamped
  last_updated_at: string;   // ISO timestamp
}
```

### 4.2 Custo de Prana por Esforço

Toda execução de uma Task **neutra** (nem restauradora, nem venenosa — ver 4.4) consome Prana proporcional ao `effort_level` da folha executada:

| `effort_level` | Custo de Prana |
|---|---|
| 1 | −5 |
| 2 | −10 |
| 3 | −15 |
| 4 | −25 |
| 5 | −35 |

```
prana_level = clamp(prana_level - prana_cost(effort_level), 0, 100)
```

O custo é debitado **uma vez por folha completada**, no mesmo momento em que o `executed_value` é calculado (Parte 7 do modelo herdado) — nunca por item agregador.

### 4.3 Exaustão (Prana em 0)

Quando `prana_level` chega a `0`, o sistema entra em **estado de exaustão**: todos os multiplicadores de esforço e tempo aplicados a novas execuções sofrem um corte global de **50%** até o Prana subir acima de 0 novamente.

```
if (user.prana_level <= 0) {
  exhaustion_multiplier = 0.5;
} else {
  exhaustion_multiplier = 1.0;
}

executed_leaf_value = base_value
                    × (1 + presence_bonus)
                    × effort_multiplier
                    × time_multiplier
                    × exhaustion_multiplier   // NOVO fator, não-stacking, aplicado 1x por folha
```

`exhaustion_multiplier` é lido do estado global do usuário no momento do cálculo — não é um campo do item, e segue a mesma regra de não-empilhamento dos demais multiplicadores (aplicado uma vez, na folha, nunca reaplicado no pai).

### 4.4 Natureza Energética da Task (`task_energy_type`)

Toda Task leaf ganha um campo opcional `task_energy_type`, com três valores possíveis, além do comportamento neutro padrão:

| `task_energy_type` | Efeito no Prana | Efeito nos pontos elementais |
|---|---|---|
| `NEUTRAL` (default) | Consome Prana conforme tabela 4.2 | Pontua normalmente (distribuição multi-área) |
| `RESTORATIVE` | **Recupera** Prana (ver 4.5) | Pontua normalmente |
| `POISON` | Consome Prana conforme tabela 4.2 | **Sempre gera 0 pontos elementais** (distribuição multi-área anulada) |

- **Tarefas Restauradoras** (ex.: Meditação, Sono, Descanso ativo): não custam Prana — elas **recuperam**. Continuam contribuindo pontos normalmente às suas áreas (ex.: Espiritualidade, Sono & Recuperação).
- **Tarefas Venenosas** ("Venenos", ex.: fast-food, doom-scrolling): **custam Prana como qualquer tarefa neutra**, mas **não geram pontuação elemental** — o `final_value` distribuído às áreas é forçado a `0`, embora a execução seja logada normalmente (histórico + custo de Prana).

### 4.5 Recuperação de Prana (Tarefas Restauradoras)

Tarefas com `task_energy_type = 'RESTORATIVE'` recuperam Prana ao invés de consumir, usando uma tabela análoga (não idêntica) à de custo — a recuperação escala com o tempo real investido, não com o `effort_level` (descanso não é "esforço"):

| Tempo real de execução | Recuperação de Prana |
|---|---|
| < 10 min | +10 |
| 10–29 min | +20 |
| 30–59 min | +35 |
| ≥ 60 min | +50 |

```
prana_level = clamp(prana_level + prana_recovery(actual_time_minutes), 0, 100)
```

Sono (Habit recorrente típico com `task_energy_type='RESTORATIVE'`) tipicamente aplica a faixa ≥ 60 min, restaurando o Prana ao máximo (ou próximo) no início do dia.

### 4.6 Ordem de Cálculo Atualizada (Execução)

```
1. Coletar folhas Task completadas
2. Para cada folha:
   a. presence = getPresenceBonus(actual_time)
   b. leaf_with_presence = base_value × (1 + presence)
   c. leaf_with_effort = leaf_with_presence × effort_multiplier(effort_level)
   d. leaf_with_time = leaf_with_effort × time_multiplier(actual_time)   [somente se tempo foi explicitamente registrado — ver Regra 11 / seção 2.2]
   e. exhaustion = (user.prana_level <= 0) ? 0.5 : 1.0
   f. projected_leaf = leaf_with_time × exhaustion
   g. if (task_energy_type === 'POISON') → distributed_points = 0
      else → distributed_points = distribute_to_areas(projected_leaf)   [100/60/30%]
3. Atualizar prana_level do usuário:
   - NEUTRAL/POISON → prana_level -= prana_cost(effort_level)
   - RESTORATIVE     → prana_level += prana_recovery(actual_time)
4. Somar folhas → subtotal → propagar para a raiz (Parte 1 deste doc)
5. Logar ExecutionLog (imutável), incluindo delta de Prana aplicado
```

### 4.7 Por que Prana não quebra as regras herdadas

- Continua **não-stacking**: exaustão é lida uma vez do estado global e aplicada uma vez por folha — nunca reaplicada no agregador.
- Continua respeitando a separação Planejamento vs. Execução: Prana só é debitado/recuperado na **execução**, nunca no planejamento (Planned Value nunca reflete Prana atual do usuário, apenas estima assumindo `exhaustion_multiplier = 1.0`).
- Continua sem inferência: `task_energy_type` é um campo explícito do item (definido na classificação ou herdado do template do Módulo Nativo), nunca adivinhado a partir do nome/categoria.

---

## 5. Referências

- Hierarquia, LEAF/AGGREGATOR, tipos semânticos → [01-Hierarquia-e-Tipos.md](./01-Hierarquia-e-Tipos.md)
- Modificadores globais de energia por clima astrológico → [03-Astrology-Engine.md](./03-Astrology-Engine.md)
- Correção histórica do Bônus de Presença → [../03-ADRs/ADR-000-Presence-Bonus-Correction.md](../03-ADRs/ADR-000-Presence-Bonus-Correction.md)
- Decisão de introdução do Prana e Módulos Nativos → [../03-ADRs/ADR-002-Prana-e-Modulos.md](../03-ADRs/ADR-002-Prana-e-Modulos.md)
