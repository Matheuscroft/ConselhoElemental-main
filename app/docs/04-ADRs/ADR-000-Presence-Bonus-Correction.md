---
title: "ADR-000: Correção do Bônus de Presença"
date: "2026-01-07"
status: "Aceito — Vinculante"
---

# ADR-000: Correção do Bônus de Presença

## Status
Aceito. Correção oficial e vinculante — substitui qualquer definição de bônus de presença fora deste registro.

## Contexto
A definição original de "Presence Bonus" havia sido implementada (ou proposta) como uma métrica derivada de consistência/streak (`0.1 × consistency_days`). Essa abordagem introduzia dependência de histórico do usuário no cálculo de um único evento de execução, quebrando o princípio de determinismo por item (mesma entrada → mesma saída, independente de dias anteriores).

## Decisão
Bônus de Presença passa a ser um **lookup determinístico baseado exclusivamente na duração real registrada** da execução de uma folha Task, aplicado uma única vez por folha, no momento do cálculo:

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

Fórmula corrigida por folha:

```
executed_leaf_value = base_value
                    × (1 + presence_bonus)
                    × effort_multiplier
                    × time_multiplier
```

## Propriedades da Correção
- Determinístico: mesma duração sempre produz o mesmo bônus.
- Independente de histórico/streak — não depende de `consistency_days` ou qualquer estado acumulado.
- Teto em +0.5 — nunca decresce, nunca ultrapassa.
- Aplica-se apenas a folhas Task com tempo real registrado; não se aplica a itens estruturais/texto nem a agregadores.
- Distinto do multiplicador de tempo, definido pela tabela vigente em [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md). A tabela de presença deste ADR registra a decisão histórica; o documento de domínio é a fonte canônica para fórmula, faixas de tempo e teto por esforço.

## Consequência
A definição antiga (`0.1 × consistency_days`) foi removida do domínio. Nenhum parâmetro `consistencyDays` deve ser passado a funções de cálculo em nenhuma camada do código.

## Referências
- Fórmula completa e tabelas de multiplicadores → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
