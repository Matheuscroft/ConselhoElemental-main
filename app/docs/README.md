# Arquitetura — Conselho Elemental

A documentação de arquitetura é dividida por domínio. Comece por [00-Overview/README.md](./00-Overview/README.md).

## Estrutura

```
00-Overview/                      Visão geral do sistema + glossário de taxonomia
├── README.md                     Sumário oficial: o que é o sistema, mapa da documentação
└── Glossario.md                  Elementos, Corpos, Áreas, regra do SEM_CATEGORIA

01-Domain-Core/                   Regras imutáveis do domínio
├── 01-Hierarquia-e-Tipos.md      Tipos semânticos (Task/Check/Note), LEAF/AGGREGATOR,
│                                  hierarquia Projeto > Missão > Quest > Action > ActionItem
├── 02-Motor-de-Pontuacao-e-Energia.md   Multiplicadores, distribuição multi-área, Prana
└── 03-Astrology-Engine.md        Modificadores globais por clima astrológico (novo)

02-Platform-Architecture/         Como o sistema é construído
├── 01-Core-vs-Native-Modules.md  Padrão Adapter: Core Engine vs. Grimório/Forja/Diário de Sonhos
├── 02-Acoes-e-Habitos.md         Hábito = Action + recorrência, HabitRotation
├── 03-A-Lista-Diaria.md          Funil agnóstico + webhook de retorno para Módulos Nativos
└── 04-Integracao-LLM-e-Voz.md    Supabase Edge Functions + Function Calling (Gemini)

03-ADRs/                          Histórico de decisões arquiteturais
├── ADR-000-Presence-Bonus-Correction.md
├── ADR-001-Habits-as-Actions.md
└── ADR-002-Prana-e-Modulos.md

CONSELHO-ELEMENTAL-DIAGRAMAS.md   Diagramas visuais da arquitetura de dados (mantido)
```

## O que foi removido nesta reestruturação

Os documentos monolíticos `SYSTEM-MODEL-MASTER.md`, `E5-MODULES-ARCHITECTURE.md` e `SEQUENTIAL-PROGRAM-ARCHITECTURE-PROPOSAL.md` foram fragmentados por domínio na estrutura acima e removidos. Nenhuma regra técnica crítica foi perdida — todo o conteúdo foi migrado:

- Regras imutáveis (tipos semânticos, LEAF/AGGREGATOR, distribuição multi-área, multiplicadores, presença) → `01-Domain-Core/`.
- Arquitetura dos módulos de plataforma (Ações, Hábitos, HabitRotation) → `02-Platform-Architecture/`.
- Correções históricas (Presence Bonus, modelagem de Hábitos) → `03-ADRs/`.
- Taxonomia (Elementos, Corpos, Áreas, SEM_CATEGORIA) → `00-Overview/Glossario.md`.

Novas camadas foram injetadas nesta reestruturação: Energia (Prana), Motor Astrológico, padrão Core vs. Módulos Nativos, e Integração com LLM/Voz.

## Documentos movidos anteriormente (nao sao arquitetura, mas nao foram apagados)

- `epic-01-database-schema-and-architecture-foundation.md` -> `../02-epics`
- `1-2-implement-tree-structure-constraints.md`, `5-0-frontend-architecture.md`, `E5-0-FRONTEND-ARCHITECTURE-*-PHASE.md` -> `../03-sprints-stories`
- Guia de agente TEA (`test-architecture.md`) -> `.github/agents`
- Referencia de workflow BMAD (`workflow-architecture-reference.md`) -> `_bmad/`
