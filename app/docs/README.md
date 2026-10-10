# Arquitetura — Conselho Elemental

A documentação de arquitetura é dividida por domínio. Comece por [00-Overview/README.md](./00-Overview/README.md).

## Estrutura

```
00-Overview/                      Visão geral do sistema + glossário de taxonomia
├── README.md                     Sumário oficial: o que é o sistema, mapa da documentação
└── Glossario.md                  Elementos, Corpos, Áreas, regra do SEM_CATEGORIA

01-Domain-Core/                   Regras imutáveis do domínio
├── 01-Hierarquia-e-Tipos.md      Tabelas macro, Action/Habit e árvore recursiva `actions`
├── 02-Motor-de-Pontuacao-e-Energia.md   Pontuação, Prana, Ressonância e progressão de níveis
└── 03-Astrology-Engine.md        Contexto narrativo astrológico sem efeitos mecânicos

02-Platform-Architecture/         Como o sistema é construído
├── 01-Core-vs-Native-Modules.md  Padrão Adapter: Core Engine vs. Grimório/Módulo de Treino/Diário de Sonhos
├── 02-Acoes-e-Habitos.md         Hábito = Action + recorrência, HabitRotation
├── 03-A-Lista-Diaria.md          Funil agnóstico + webhook de retorno para Módulos Nativos
├── 04-Integracao-LLM-e-Voz.md    Supabase Edge Functions + Function Calling (Gemini)
├── 05-Grimorio-e-Perfil.md       Perfil, níveis derivados, títulos e projeção de maestria
├── 06-Diagramas-e-Fluxos.md      Diagramas técnicos e de navegação
└── 07-Principios-de-UX-e-Fluxos.md Acessibilidade, integridade visual e fluxos de interface

03-Project-Management/            Registros históricos, status, auditorias e planejamento
└── README.md                     Índice e política de arquivamento

04-ADRs/                          Histórico de decisões arquiteturais
├── ADR-000-Presence-Bonus-Correction.md
├── ADR-001-Habits-as-Actions.md
└── ADR-002-Prana-e-Modulos.md
```

Os registros de versões e execução foram arquivados em `03-Project-Management/`; não são fonte de regras atuais. A estrutura técnica canônica fica nas seções `00` a `02` e as decisões registradas ficam em `04-ADRs`.

## O que foi removido nesta reestruturação

Os documentos monolíticos `SYSTEM-MODEL-MASTER.md`, `E5-MODULES-ARCHITECTURE.md` e `SEQUENTIAL-PROGRAM-ARCHITECTURE-PROPOSAL.md` foram fragmentados por domínio na estrutura acima e removidos. Nenhuma regra técnica crítica foi perdida — todo o conteúdo foi migrado:

- Regras imutáveis (tipos semânticos, LEAF/AGGREGATOR, distribuição multi-área, multiplicadores, presença) → `01-Domain-Core/`.
- Arquitetura dos módulos de plataforma (Ações, Hábitos, HabitRotation) → `02-Platform-Architecture/`.
- Correções históricas (Presence Bonus, modelagem de Hábitos) → `04-ADRs/`.
- Taxonomia (Elementos, Corpos, Áreas, SEM_CATEGORIA) → `00-Overview/Glossario.md`.

Novas camadas foram injetadas nesta reestruturação: Energia (Prana), Motor Astrológico, padrão Core vs. Módulos Nativos, e Integração com LLM/Voz.