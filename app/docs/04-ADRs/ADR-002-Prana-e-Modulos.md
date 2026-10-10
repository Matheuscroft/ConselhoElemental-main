---
title: "ADR-002: Prana e Módulos Nativos"
date: "2026-09-20"
status: "Aceito"
---

# ADR-002: Prana e Módulos Nativos

## Status
Aceito.

## Contexto
O modelo original do Conselho Elemental tratava toda pontuação como puramente aditiva: esforço e tempo geravam pontos, sem nenhum conceito de custo ou limite de energia do usuário. A modelagem estrutural de passos foi posteriormente definida como uma árvore recursiva na tabela `actions`; referências a `ActionItem` neste ADR descrevem a proposta histórica, não o schema vigente. Agregadores macro permanecem em tabelas próprias, enquanto Módulos Nativos (leitura, treino, sonhos) mantêm seus dados especializados.

Isso gerava duas lacunas:
1. **Nenhuma noção de custo/exaustão:** o sistema recompensava esforço infinito sem penalizar sobrecarga, e não diferenciava hábitos recuperadores (sono, meditação) de hábitos nocivos (vícios, "venenos").
2. **Nenhum canal para módulos ricos:** para implementar Grimório (leitura) ou o Módulo de Treino como experiências de primeira classe, seria necessário ou (a) forçar toda a lógica de domínio para dentro do Core genérico, ou (b) duplicar toda a stack de pontuação dentro de cada módulo. A Forja é a inbox de Rascunhos e triagem.

## Decisão

### 1. Introdução do Prana (Energia)
Adiciona-se um medidor de energia vital por usuário (`prana_level`, 0–100). Esforço custa Prana; tarefas restauradoras recuperam; tarefas nocivas ("Venenos") custam Prana sem gerar pontos elementais. Os custos, a recuperação e as regras de pontuação vigentes estão em [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

### 2. Padrão Core Engine + Módulos Nativos (Adapter)
Formaliza-se a separação entre um Core Engine agnóstico de domínio (persistência, Motor de Pontuação, Lista Diária) e Módulos Nativos ricos (Grimório, Módulo de Treino, Diário de Sonhos) que traduzem seus dados de domínio e **injetam** instâncias consolidadas de `ACTION`/`HABIT` no Core via contrato Adapter (`IActionLike` estendido com `source_module`/`source_ref_id`). A Forja é a inbox de Rascunhos e triagem. Ver [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md).

### 3. `base_value` decimal
Para suportar micro-ações produzidas por Módulos Nativos, `base_value` aceita decimais. O Módulo de Treino deriva o valor consolidado de Equivalentes de Repetição (1 ER = 0.03 `base_value`); consulte a especificação canônica de pontuação. A Forja é a inbox de Rascunhos, não um módulo de treino.

### 4. Motor Astrológico como camada opcional
Um serviço passivo pode gerar contexto astrológico para apresentação narrativa. A versão atual não modifica pontos nem Prana, conforme [../01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md).

## Consequências

**Positivas:**
- O sistema ganha uma camada de risco/recompensa (Prana) sem alterar as regras estruturais imutáveis (LEAF/AGGREGATOR, tipos semânticos, distribuição multi-área).
- Módulos ricos podem evoluir independentemente do Core, desde que respeitem o contrato Adapter.
- `base_value` fracionário abre caminho para granularidade fina sem exigir milhares de nós descendentes na árvore `actions`.

**Negativas / trade-offs assumidos:**
- Introduz estado global por usuário (`prana_level`) que deve ser sincronizado com cuidado em cenários offline-first (last-write-wins pode gerar pequenas inconsistências de energia, aceitável dado que Prana é um mecanismo de jogo, não um dado financeiro).
- Módulos Nativos agora precisam implementar o webhook de retorno (ver [../02-Platform-Architecture/03-A-Lista-Diaria.md](../02-Platform-Architecture/03-A-Lista-Diaria.md)) para manter seu estado interno sincronizado com conclusões feitas a partir da Lista Diária.

## Referências
- [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- [../01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md)
- [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md)
