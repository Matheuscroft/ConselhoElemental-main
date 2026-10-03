---
title: "Conselho Elemental — Visão Geral da Arquitetura"
version: "4.0"
date: "2026-09-20"
status: "Canonical — Documentação Dividida por Domínios"
---

# Conselho Elemental — Visão Geral da Arquitetura

## O que é o Conselho Elemental?

**Conselho Elemental** é um sistema de **gestão de vida gamificada** baseado em dois pilares narrativos: os **4 elementos** (Terra, Fogo, Água, Ar) e uma linguagem de **magia/RPG pessoal**. O usuário não "faz tarefas" — ele **conduz rituais, forja hábitos e conquista quests** que fortalecem áreas específicas da sua vida.

Por baixo da camada narrativa existe um **motor de pontuação determinístico e não-ambíguo**: toda ação tem um valor calculado a partir de regras explícitas (esforço, tempo, presença, distribuição multi-área), nunca inferido ou "mágico" na implementação — só a apresentação é mágica, o cálculo é engenharia.

## Os Três Eixos do Sistema

1. **Estrutura (o quê):** uma árvore de itens com 3 tipos semânticos (Task/Check/Note) organizada numa hierarquia Projeto → Missão → Quest → Action → ActionItem. Ver [01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).
2. **Energia (com que custo):** toda ação consome ou restaura **Prana**, o recurso de energia vital do usuário. Esforço alto exaure; descanso e meditação recuperam. Ver [01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).
3. **Contexto (quando/por quê):** um serviço passivo de astrologia calcula o "clima" do dia (fases da lua, trânsitos) e aplica modificadores globais discretos sobre a energia e os elementos. Ver [01-Domain-Core/03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md).

## Plataforma: Core + Módulos Nativos

O app não é um monólito de checklist. Existe um **Core Engine** genérico (banco de dados, listas, pontuação bruta, Lista Diária) e uma família de **Módulos Nativos** ricos e especializados — Grimório (leitura), Forja (treino), Diário de Sonhos, entre outros — que fazem suas próprias contas complexas e **injetam** Ações/Hábitos consolidados no Core. Ver [02-Platform-Architecture/01-Core-vs-Native-Modules.md](../02-Platform-Architecture/01-Core-vs-Native-Modules.md).

Um assistente de IA (voz e texto) conversa com o usuário e pode criar, classificar e concluir itens diretamente via Function Calling. Ver [02-Platform-Architecture/04-Integracao-LLM-e-Voz.md](../02-Platform-Architecture/04-Integracao-LLM-e-Voz.md).

## Mapa da Documentação

```
docs/01-architecture/
├── 00-Overview/
│   ├── README.md              ← você está aqui
│   └── Glossario.md           ← Elementos, Corpos, Áreas, SEM_CATEGORIA
├── 01-Domain-Core/             ← regras imutáveis do domínio
│   ├── 01-Hierarquia-e-Tipos.md
│   ├── 02-Motor-de-Pontuacao-e-Energia.md
│   └── 03-Astrology-Engine.md
├── 02-Platform-Architecture/    ← como o sistema é construído
│   ├── 01-Core-vs-Native-Modules.md
│   ├── 02-Acoes-e-Habitos.md
│   ├── 03-A-Lista-Diaria.md
│   └── 04-Integracao-LLM-e-Voz.md
├── 03-ADRs/                     ← histórico de decisões arquiteturais
│   ├── ADR-000-Presence-Bonus-Correction.md
│   ├── ADR-001-Habits-as-Actions.md
│   └── ADR-002-Prana-e-Modulos.md
└── CONSELHO-ELEMENTAL-DIAGRAMAS.md  ← diagramas visuais (mantido)
```

## Princípios Não-Negociáveis (Resumo)

Estes princípios são detalhados em [01-Domain-Core](../01-Domain-Core/), mas resumem o "espírito" do sistema:

- **Determinismo:** nada é inferido (tempo, esforço, área nunca são adivinhados pelo sistema).
- **Separação Planejamento vs Execução:** valores planejados são preview; valores executados são histórico imutável.
- **Folhas pontuam, agregadores somam:** um item com filhos-Task nunca tem pontuação própria — ele só soma os filhos.
- **Prana é finito:** esforço custa energia; o sistema pune exaustão e recompensa recuperação.
- **Áreas recebem, não criam valor:** a distribuição multi-área (100/60/30%) é uma atribuição, não uma multiplicação de pontos.

## Histórico

Esta estrutura substitui os documentos monolíticos anteriores (`SYSTEM-MODEL-MASTER.md`, `E5-MODULES-ARCHITECTURE.md`, `SEQUENTIAL-PROGRAM-ARCHITECTURE-PROPOSAL.md`), que foram fragmentados por domínio e removidos após a migração de todo conteúdo crítico. Decisões pontuais e correções históricas ficam registradas em [03-ADRs](../03-ADRs/).
