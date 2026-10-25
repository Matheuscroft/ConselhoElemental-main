# R26-C — subitens com função clara e constância contextual

25/10/2026 · versão local 0.1.67 · base Git 88c9021 e R26-A/B locais preservados.

## Pedido e escopo

Fábio pediu melhoria da estrutura/execução dos subitens e ícone, animação e lógica de streak. Astro Boy executou sequencialmente. Frontend-design orientou hierarquia/controles; o capítulo canônico de Ações/Hábitos e as instruções backend-conselho orientaram a auditoria de contrato. Nenhum agente ou comunicação externa iniciado.

A pergunta sobre contar dias consecutivos versus ocorrências programadas continua sem resposta nesta entrega. Mudança do cálculo persistido NÃO implementada. A intenção geral de melhorar streak não resolve detalhes de agenda, rotação, edição retroativa e migração histórica. O backend continua sob responsabilidade de Matheus.

## Implementado

- Compatibilidade explícita entre VALUABLE/valuable, VALUELESS/structural e NOTE/text na leitura da UI. Antes, os tipos em maiúsculas não eram reconhecidos pelos filtros de execução/comandos da tela. A correção não regrava entidades nem altera pontuação.
- Subitens mostram posição na hierarquia (1, 1.1...), nome, função Ação/Checklist/Nota/Etapa e uma indicação breve de uso. Dados e ordem existentes preservados.
- Notas aparecem como referência, sem checkbox/estado de tarefa concluída e sem badges de pontos. Checklists indicam ausência de pontuação; etapas identificam seus filhos.
- Resumo visual dos subitens separa notas das ações marcáveis. Esse resumo não recalcula o status do pai no store. Controles de conclusão e desfazer continuam chamando os comandos existentes.
- Botão Executar etapas torna explícita a entrada no modo guiado existente quando há filhos acionáveis. Não é um novo mecanismo de execução.
- Selo de constância com SVG próprio (chama/runa), detalhes acessíveis, sequência/recorde registrados, última conclusão e sete dias de registros relativos à data selecionada. Dias sem registro não são classificados como faltas.
- Animação de 420ms exclusivamente no aumento do contador do mesmo ciclo/conta montado. Sem animação inicial, em decremento/Undo ou troca de conta; prefers-reduced-motion respeitado e animação cancelada no cleanup. Sem som, vibração, XP ou fragmentos adicionais.

Revisão React: componentes controlados, helpers puros para semântica e projeção dos registros, efeito de animação sem estado React adicional. O histórico semanal é apenas projeção de completionDate, não um segundo cálculo de streak.

## Diagnóstico de domínio para continuidade

1. O store calcula streak de hábito por datas consecutivas, com implementações separadas para completar, desfazer e treino nativo. O contador persistido pode representar a última série registrada, não a série ativa no dia da consulta. A interface agora usa o rótulo Sequência registrada.
2. O capítulo canônico docs/02-Platform-Architecture/02-Acoes-e-Habitos.md prevê consistência por ocorrências programadas. Isso diverge do código. Não criar no frontend um contador alternativo nem somar streak global e do hábito.
3. Antes de mudar o contrato: definir descanso, dia atual ainda em aberto, semana/mês/ano, membros de rotação, alterações de agenda, registros retroativos/futuros, fuso, Undo, recordes e migração. A eventual aprovação de contar datas programadas resolve apenas a direção, não autoriza XP, medalhas ou migração silenciosa.
4. Inspeção do completeHabitChild encontrou que areAllDescendantsCompleted percorre todas as folhas, incluindo notas. O modo guiado filtra notas, mas esse predicado de propagação não faz a mesma distinção. É divergência identificada por leitura, sem teste integrado executado nesta rodada. Resolver com Matheus em lote de contrato; a contagem visual ajustada não finge corrigir essa propagação do backend.

## Verificações

- 148 testes Node passaram, incluindo 7 novos: compatibilidade de tipos, notas fora do total de ações, hierarquia/tipos renderizados, grupo só de notas, gate de animação por aumento/mesmo escopo, registros deduplicados em virada de ano e selo com fonte/estado vazio honestos.
- TypeScript e lint passaram; build Vite envDir:false final passou em 9,57s. Avisos preexistentes de chunks grandes e base Browserslist antiga permanecem.
- Comparação AST com a cópia anterior de Ciclos: entre 367 inicializadores anteriores, só diferem a resolução do tipo/variável auxiliar removida e as duas contagens substituídas por resumo de ações/notas. JSX do componente e renderChildHabits excluídos dessa comparação. Comandos de execução/pontuação preservados.
- Diff de src/stores, src/services, src/types e supabase vazio. Versões package/lock sincronizadas e git diff --check limpo.

Os testes são puros/SSR; não testam o toque no navegador nem a fluidez real da animação. A última tentativa de inspeção foi bloqueada por permissão salva em rodada anterior, sem contorno e sem nova alegação de renderização. Não houve leitura/escrita dos dados pessoais via navegador.

## Próxima validação

Em 360/390px e 768px, com dados isolados: três níveis de filhos, nome extenso, grupo misto de ação/checklist/nota, semântica canônica e legada, executar etapas, marcar/desfazer, abrir/fechar constância, mudar data, motion reduzido e troca de conta. Verificar o contador registrado na integração real antes de aceitar animação como prova de conclusão.

Reservas encerradas. Revisão documental pelo coordenador, independente pendente. Sem commit/push/deploy. R25-A/B backup/conta, R19 e R12-D/E permanecem pendentes. Nova lógica persistida do streak é trabalho pendente explícito.
