# Mapa inicial: documentação versus implementação

05/10/2026. Inspeção estática do código atual; não é validação funcional no navegador nem auditoria completa. Fonte de domínio: /Users/fabioandre/Developer/docs-conselho-master/README.md.

## Decisão sobre skills

Prosseguir com o inventário e o próximo lote usando capacidades disponíveis. frontend-design já instalada; revisão React e ferramentas de navegador disponíveis. Adiar novas instalações até existir uma necessidade concreta. web-design-guidelines e composition-patterns continuam candidatas, não pré-requisitos. Mais skills não resolvem divergências de domínio.

## Evidências observadas

| Capacidade | Evidência no código | Situação / consequência |
|---|---|---|
| Identidade dos quatro elementos | src/constants/index.ts, ELEMENTS | Cores e significados correspondem ao glossário. Preservar e reutilizar. IDs locais terra/fogo/agua/ar diferem dos IDs legados documentados; não renomear dados automaticamente. |
| Navegação e módulos | src/lib/app-routes.ts | Rotas de Santuário, Rituais, Ciclos, Jornadas, Grandes Obras, Grimório, Forja, calendário, astrologia, domínios e treino cadastradas. Cadastro não prova funcionamento. |
| Presença e esforço | src/constants/index.ts, getPresenceBonus e EFFORT_MULTIPLIERS | Tabelas observadas correspondem às regras principais. Necessária cobertura dos limites e caminhos consumidores. |
| Curva de tempo | src/constants/index.ts, getTimeMultiplier / calculateTaskScore | Divergente: código usa faixas de 3 minutos até teto 4.5; documento revisado usa faixas de 5 minutos até teto 80. Não mudar junto ao frontend nem recalcular histórico. |
| Tarefas e hábitos | src/types/index.ts, Task e Habit; src/stores/appStore.ts | Modelos e caminhos próprios: Habit usa name/plannedPoints/completions, Task usa title/baseValue/completedScore. Diverge do contrato Action unificado. Preservar funcionamento; eventual convergência exige estratégia de compatibilidade e testes. |
| Criação | src/pages/Invocar.tsx | Fluxo existente; esforço 2 e tempo 30 são defaults, hábito sem área selecionada recebe AREAS[0]. Conferir experiência e regra de não inferência em lote funcional próprio. |
| Forja | src/pages/Forja.tsx | Implementa rascunhos e triagem. Documentação chama módulo de treino de Forja; navegação descreve assistente. Há conflito de vocabulário a resolver sem eliminar a tela existente. |
| Treinos | src/stores/workoutStore.ts, src/pages/fitness/* | Sessões, séries, conclusão e ledger implementados. Guarda por sessionId/gamificationApplied observada; não comprova idempotência ponta a ponta ou sincronização. |
| Prana | src/stores/workoutStore.ts, getResourceSnapshot | Derivado de totalScore/500 e custos diários de treino. Difere do estado global persistido e naturezas energéticas documentadas. Não rotular como métrica clínica. |
| Assistente de domínio e HabitRotation | Busca inicial em src | Contratos canônicos complete_item/source_module/controlled_by_rotation não encontrados com esses nomes. Não basta para declarar ausência: auditar nomes alternativos e backend antes de implementar. |
| Verificação automatizada | package.json | Sem script test; existem build/lint e script Puppeteer. Não confundir compilação com validação dos contratos de domínio. |

## Ordem de execução

1. **Próximo lote visual: seleção e prévia de treino (bloco A)**. Ler frontend-design, comparar capturas locais com o app em 390px, selecionar diferenças observáveis, editar apenas apresentação/componentes necessários. Preservar criação, catálogo completo, sessão ativa, IDs, navegação e dados. Validar 360/390px e desktop; registrar evidência antes/depois. Usar docs/FINALIZAR-FRONTEND-FITNESS.md como roteiro operacional.
2. Continuar blocos B–D com o mesmo critério. Reutilizar identidade elemental existente e componentes; não remodelar pontuação durante polimento visual.
3. Em trilha funcional própria, reconciliar core/documentação com testes de caracterização e política explícita para dados históricos. Nenhuma alteração automática de curva de XP, Prana, tipos ou exclusão de logs.
4. Expandir sistema visual aos módulos existentes, após inventário detalhado de cada fluxo. Tratar assistente e integrações como entregas funcionais, não promessas de uma skin.

## Critério de encerramento

Uma tela só está pronta com referência comparada, interações e estados verificados e ausência de quebra nos fluxos testados. O app completo requer ainda cobertura de persistência, integrações e contratos do core. Este mapa não atribui porcentagem de conclusão nem garante ausência de regressões.
