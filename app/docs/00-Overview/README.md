---
title: "Conselho Elemental — Visão Geral da Arquitetura"
version: "4.0"
date: "2026-09-20"
status: "Canonical — Documentação Dividida por Domínios"
---

# Conselho Elemental — Visão Geral da Arquitetura

## O que é o Conselho Elemental?

**Conselho Elemental** é um sistema de **gestão de vida gamificada** baseado nos **4 elementos** (Terra, Fogo, Água, Ar) e em uma linguagem de **magia/RPG pessoal**. O usuário conduz rituais, desenvolve hábitos e conquista jornadas que fortalecem áreas da vida.

Por baixo da camada narrativa existe um **motor de pontuação determinístico e não-ambíguo**: toda ação tem um valor calculado a partir de regras explícitas (esforço, tempo, presença, distribuição multi-área), nunca inferido ou "mágico" na implementação — só a apresentação é mágica, o cálculo é engenharia.

## Os Três Eixos do Sistema

1. **Estrutura (o quê):** `projects`, `quests` e `missions` persistem agregadores macro; `actions` contém raízes Tarefa/Ciclo e descendentes em uma árvore `parent_id` recursiva. A raiz define `lifecycle_type`; descendentes usam `semantic_type` (`VALUABLE`, `VALUELESS`, `NOTE`). A antiga `action_items` foi abolida. Ver [01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).
2. **Energia (com que custo):** esforço pode consumir **Prana**, o recurso de energia vital do usuário; somente atividades `RESTORATIVE` recuperam Prana. Bônus de gamificação e Marcos de Consistência nunca restauram essa energia. Ver [01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).
3. **Contexto (quando/por quê):** um serviço passivo de astrologia calcula o "clima" do dia (fases da lua, trânsitos) para contextualização narrativa, sem alterar Prana ou pontuação. Ver [01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md).

## Plataforma: Core + Módulos Nativos

O app não é um monólito de checklist. Existe um **Core Engine** genérico (persistência, regras de domínio, pontuação e Lista Diária) e Módulos Nativos especializados — Grimório (leitura), Módulo de Treino (atividade física) e Diário de Sonhos, entre outros — que traduzem dados de domínio em Ações/Hábitos consolidados para o Core. A **Forja** é exclusivamente a inbox de Rascunhos e triagem. Ver [02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md).

Um assistente de IA (voz e texto) conversa com o usuário e pode criar, classificar e concluir itens diretamente via Function Calling. Ver [02-Platform-Architecture/04-Integracao-LLM-e-Voz.md](../02-Platform-Architecture/04-Integracao-LLM-e-Voz.md).

## Mapa da Documentação

```
docs/
├── 00-Overview/
│   ├── README.md              ← você está aqui
│   └── Glossario.md           ← Elementos, Corpos, Áreas, SEM_CATEGORIA
├── 01-Domain-Core/             ← regras imutáveis do domínio
│   ├── 01-Hierarquia-e-Tipos.md
│   ├── 02-Motor-de-Pontuacao-e-Energia.md  ← pontuação, Prana e progressão
│   └── 03-Astrology-Engine.md
├── 02-Platform-Architecture/    ← como o sistema é construído
│   ├── 01-Core-vs-Native-Modules.md
│   ├── 02-Acoes-e-Habitos.md
│   ├── 03-A-Lista-Diaria.md
│   ├── 04-Integracao-LLM-e-Voz.md
│   ├── 05-Grimorio-e-Perfil.md  ← níveis e maestria apresentados no Perfil
│   ├── 06-Diagramas-e-Fluxos.md
│   └── 07-Principios-de-UX-e-Fluxos.md
├── 03-Project-Management/       ← registros históricos e acompanhamento
└── 04-ADRs/                     ← decisões arquiteturais
    ├── ADR-000-Presence-Bonus-Correction.md
    ├── ADR-001-Habits-as-Actions.md
    └── ADR-002-Prana-e-Modulos.md
```

## Princípios Não-Negociáveis (Resumo)

Estes princípios são detalhados em [01-Domain-Core](../01-Domain-Core/), mas resumem o "espírito" do sistema:

- **Determinismo:** nada é inferido (tempo, esforço, área nunca são adivinhados pelo sistema).
- **Separação Planejamento vs Execução:** valores planejados são preview; valores de execução não podem ser editados enquanto o `ExecutionLog` existir. Undo explícito pode excluí-lo fisicamente e reverter seus efeitos sem log de estorno.
- **Unidades pontuáveis e agregação:** Actions sem descendentes `VALUABLE` podem pontuar por si; Actions com descendentes `VALUABLE` agregam seus resultados em qualquer profundidade. Agregadores macro conservam tabelas e metadados próprios.
- **Prana é energia vital finita:** esforço pode custar energia e somente atividades `RESTORATIVE` a recuperam; recompensas de XP não criam Prana. A gamificação de longo prazo reconhece Ciclos Concluídos e Marcos de Consistência, sem streak punitivo.
- **Áreas recebem, não criam valor:** a distribuição multiárea aloca 100% do orçamento da execução (100%; 70/30%; ou 60/25/15%, conforme o número de áreas).

## Histórico

Esta estrutura substitui os documentos monolíticos anteriores (`SYSTEM-MODEL-MASTER.md`, `E5-MODULES-ARCHITECTURE.md`, `SEQUENTIAL-PROGRAM-ARCHITECTURE-PROPOSAL.md`), que foram fragmentados por domínio e removidos após a migração de todo conteúdo crítico. Decisões pontuais e correções históricas ficam registradas em [04-ADRs](../04-ADRs/).
