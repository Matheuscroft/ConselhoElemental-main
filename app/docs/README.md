> Atualização 25/10/2026 · **0.1.68**: [repasse R15–R26](REPASSE-FRONTEND-PARA-BACKEND.md), [verificações e publicação](03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md) e [continuidade](CONTINUIDADE.md). Constância programada parcial implementada; fragmentos, backup/conta e QA mobile continuam pendentes.

# Arquitetura — Conselho Elemental

**Chegando após o pull da repaginação?** Leia o [repasse para Matheus e Astro Boy](REPASSE-FRONTEND-PARA-BACKEND.md): mudanças I03/R01–R26, responsabilidades, contratos preservados e próximos lotes de Fábio.

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
├── ADR-002-Prana-e-Modulos.md
└── ADR-003-Recompensa-Native-Treino-Por-Bloco.md
```

Os registros de versões e execução foram arquivados em `03-Project-Management/`; não são fonte de regras atuais. A estrutura técnica canônica fica nas seções `00` a `02` e as decisões registradas ficam em `04-ADRs`.

## O que foi removido nesta reestruturação

Os documentos monolíticos `SYSTEM-MODEL-MASTER.md`, `E5-MODULES-ARCHITECTURE.md` e `SEQUENTIAL-PROGRAM-ARCHITECTURE-PROPOSAL.md` foram fragmentados por domínio na estrutura acima e removidos. Nenhuma regra técnica crítica foi perdida — todo o conteúdo foi migrado:

- Regras imutáveis (tipos semânticos, LEAF/AGGREGATOR, distribuição multi-área, multiplicadores, presença) → `01-Domain-Core/`.
- Arquitetura dos módulos de plataforma (Ações, Hábitos, HabitRotation) → `02-Platform-Architecture/`.
- Correções históricas (Presence Bonus, modelagem de Hábitos) → `04-ADRs/`.
- Taxonomia (Elementos, Corpos, Áreas, SEM_CATEGORIA) → `00-Overview/Glossario.md`.

Novas camadas foram injetadas nesta reestruturação: Energia (Prana), Motor Astrológico, padrão Core vs. Módulos Nativos, e Integração com LLM/Voz.
## Engenharia e continuidade do aplicativo

A fonte canônica principal permanece `/Users/fabioandre/Developer/docs-conselho-master/README.md`. Para executar e retomar trabalho neste app:

- [Ponto de retomada](CONTINUIDADE.md): checkout, estado e próximo passo.
- [Manual de engenharia](MANUAL-ENGENHARIA.md): operação, validação e versionamento.
- [Dossiê técnico](DOSSIE-TECNICO.md): origem verificável, escopo e arquitetura.
- [Responsável por versões e documentação](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md): atribuição e reporte.
- [Coordenação](COORDENACAO-AGENTES.md) e [fila local](FILA-ENTREGAS.md): consultar a autoridade operacional indicada no ponto de retomada antes de alterar estado.

- [Política de modelos](POLITICA-MODELOS.md): seleção e escalonamento por tarefa.
- [Auditorias Core, Astrolábio e assistente](AUDITORIA-CONTRATOS-CORE.md): evidências estáticas e limitações.
- [Decisão inicial de provedor de IA](DECISAO-PROVEDOR-IA.md): comparação oficial e limites para piloto.
- [Protótipo do assistente](ASSISTENTE-PROTOTIPO.md): escopo, consentimento, segurança e validação delimitada do I03.
- [Repaginação elemental — R01](03-Project-Management/reports/REPAGINACAO-ELEMENTAL-2026-10.md): diagnóstico frontend, personagem protagonista, referências, proposta por telas e critérios dos próximos lotes. Proposta visual em discussão; não atesta implementação.

## Colaboração e publicação

[Entrada de Matheus e Fábio](ASTRO-BOY-BOAS-VINDAS.md), [auditoria das pastas/publicação](AUDITORIA-PUBLICACAO.md). Os capítulos de arquitetura acima são a cópia portável dos contratos para este repositório. Caminhos absolutos em relatórios anteriores preservam a origem das evidências; não são requisito para clonar e usar.

- [Santuário como home e Pilares — 0.1.41](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md): promoção autorizada, compatibilidade de links, cronômetro/conta e limites de validação.
- [Navegação elemental — R03](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md): histórico das rotas da prévia, filtros e preservação do backend; promoção posterior em 0.1.41.

- [Identidade, cartões e cronômetro — R04](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md): padrão aprovado para todas as telas, aplicação das referências, alcance atual, testes e limites.

- [Temporal, Lua e Estações — R05 / 0.1.42](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md): Lua 3D por horário, Expanded/Showcase, navegação por mês, preservação e QA pendente.

- [Ícones e exploração transversal — R06 / 0.1.43](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md): iconografia, menu expansível, Showcase no Mapa e continuidade por área.

- [Cabeçalhos e composição — R08 / 0.1.45](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md): home definitiva, calendário, formulários, preservação e limites.
- [Redesign de Ciclos — R07 / 0.1.44](03-Project-Management/reports/R07-CICLOS-REDESIGN.md): calendário Expanded, Showcase, filtros, diálogos, preservação e QA pendente.

- [Grimório — R09 / 0.1.46](03-Project-Management/reports/R09-GRIMORIO.md): ficha elemental, recursos em vidro, maestria, histórico e limites de validação.

## Quests e trilhas elementais — R10

[Relatório 0.1.47](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md): adaptação do kit Figma, Rituais/Jornadas/Grandes Obras, próximas quests no Santuário, integração preservada e QA pendente.
