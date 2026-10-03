---
title: "ADR-002: Prana e Módulos Nativos"
date: "2026-09-20"
status: "Aceito"
---

# ADR-002: Prana e Módulos Nativos

## Status
Aceito.

## Contexto
O modelo original do Conselho Elemental tratava toda pontuação como puramente aditiva: esforço e tempo geravam pontos, sem nenhum conceito de custo ou limite de energia do usuário. Ao mesmo tempo, a arquitetura de plataforma previa apenas um conjunto fixo de "módulos" genéricos (Ações, Hábitos, Projetos, Missões, Quests) todos operando sobre a mesma árvore genérica de `ActionItem` — sem espaço arquitetural para experiências ricas e especializadas (leitura, treino, sonhos) que têm sua própria matemática de domínio.

Isso gerava duas lacunas:
1. **Nenhuma noção de custo/exaustão:** o sistema recompensava esforço infinito sem penalizar sobrecarga, e não diferenciava hábitos recuperadores (sono, meditação) de hábitos nocivos (vícios, "venenos").
2. **Nenhum canal para módulos ricos:** para implementar Grimório (leitura) ou Forja (treino) como cidadãos de primeira classe, seria necessário ou (a) forçar toda a lógica de domínio para dentro do Core genérico, ou (b) duplicar toda a stack de pontuação dentro de cada módulo.

## Decisão

### 1. Introdução do Prana (Energia)
Adiciona-se um medidor de energia vital por usuário (`prana_level`, 0–100). Esforço custa Prana; tarefas restauradoras recuperam; tarefas nocivas ("Venenos") custam Prana sem gerar pontos elementais; Prana em 0 aplica um corte global de 50% nos multiplicadores até se recuperar. Ver especificação completa em [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).

### 2. Padrão Core Engine + Módulos Nativos (Adapter)
Formaliza-se a separação entre um Core Engine agnóstico de domínio (persistência, Motor de Pontuação, Lista Diária) e Módulos Nativos ricos (Grimório, Forja, Diário de Sonhos) que fazem sua própria matemática e **injetam** instâncias consolidadas de `ACTION`/`HABIT` no Core via um contrato Adapter (`IActionLike` estendido com `source_module`/`source_ref_id`). Ver [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md).

### 3. `base_value` decimal
Para suportar micro-ações produzidas por Módulos Nativos (ex.: 0.1 por página lida, 0.1 por repetição de treino), `base_value` deixa de ser exclusivamente inteiro e passa a aceitar qualquer valor positivo.

### 4. Motor Astrológico como camada opcional
Um serviço passivo diário calcula modificadores de Prana e de Elemento a partir de fase lunar e trânsitos planetários, aplicados como fator multiplicativo adicional (não-stacking) sobre o cálculo já existente. Ver [../01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md).

## Consequências

**Positivas:**
- O sistema ganha uma camada de risco/recompensa (Prana) sem alterar as regras estruturais imutáveis (LEAF/AGGREGATOR, tipos semânticos, distribuição multi-área).
- Módulos ricos podem evoluir independentemente do Core, desde que respeitem o contrato Adapter.
- `base_value` fracionário abre caminho para granularidade fina sem exigir milhares de `ActionItem` triviais.

**Negativas / trade-offs assumidos:**
- Introduz estado global por usuário (`prana_level`) que deve ser sincronizado com cuidado em cenários offline-first (last-write-wins pode gerar pequenas inconsistências de energia, aceitável dado que Prana é um mecanismo de jogo, não um dado financeiro).
- Módulos Nativos agora precisam implementar o webhook de retorno (ver [../02-Platform-Architecture/03-A-Lista-Diaria.md](../02-Platform-Architecture/03-A-Lista-Diaria.md)) para manter seu estado interno sincronizado com conclusões feitas a partir da Lista Diária.

## Referências
- [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- [../01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md)
- [../02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md)
