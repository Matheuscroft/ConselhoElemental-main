---
title: "ADR-003: Recompensa Native do Treino por Bloco"
date: "2026-10-13"
status: "Rejeitado para pontuação pelo proprietário — preservado como proposta histórica"
---

# ADR-003: Recompensa Native do Treino por Bloco

## Revisão do proprietário — 13/10/2026

O proprietário informou que alterações de pontuação precisam passar por sua aprovação e que o papel de Fábio é UX/UI. O status anterior "Aceito" não comprova essa aprovação. As regras v1/v2 descritas abaixo já estão implementadas no commit fe1a8fe, mas ficam pendentes do crivo do proprietário. Esta anotação não altera a matemática nem recalcula recibos; eventual reversão exige uma mudança de código específica.

### Decisão posterior de Matheus

Matheus determinou restaurar ER × 0.10 e a pontuação de sessão consolidada do commit b1575e4. Preview, CHECKIN, LIVE e despacho Core voltam ao teto único/esforço global/tempo da sessão. O calculador por blocos permanece como código de proposta, sem chamadas de pontuação no fluxo atual. RPE pode permanecer como informação registrada, sem alterar XP/Prana. Recibos emitidos anteriormente não são recalculados. Texto abaixo descreve a proposta histórica rejeitada para a regra vigente, não o contrato em execução.

## Contexto

O fluxo Native de Fitness concluía a sessão como uma folha única, com esforço global. Assim, uma atividade leve e uma sessão com séries em intensidades variadas podiam receber o mesmo teto. O catálogo e as séries já distinguem repetições, duração e fator de carga; a execução ainda precisava capturar o esforço percebido feito em cada série. Os `ExecutionLog` existentes são recibos históricos e não devem ser recalculados.

## Decisão

- Cada série concluída e não pulada é um bloco elegível. Seu valor-base vem do ER e do fator de carga documentados na seção 5 do [motor Core](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).
- A UI coleta RPE de 1–10 por série. O Adapter converte-o deterministicamente para o nível Core 1–5; quando não há observação, usa o esforço global da sessão como fallback. Nenhuma intensidade é inferida de modalidade ou descrição textual.
- O Core aplica multiplicador/teto do nível a cada bloco. Presença e tempo ativo entram uma vez por sessão. Repetições têm duração ativa estimada de 4 segundos cada; blocos temporizados usam o valor medido. Descanso não conta como atividade.
- Os resultados são consolidados em um único `ExecutionLog` por sessão. Esforço do recibo é ponderado pelo valor-base; Prana é debitado uma vez por sessão usando esse esforço agregado. Sem blocos elegíveis: zero XP e zero custo de Prana.
- A regra usa `core-native-workout-block-v1`. Recibos anteriores e futuras regras versionadas não são recalculados retroativamente. Prévia é estimativa e não concede pontos.

## Consequências

Mais trabalho concluído e esforço observado afetam o resultado, séries puladas não contam e a idempotência por sessão permanece. Como cada bloco recebe um teto próprio, dividir trabalho equivalente em séries pode mudar o total; séries são unidades de execução explícitas e o app não promete invariância a essa divisão. Os pontos são uma convenção de jogo e não uma métrica fisiológica. Esse fluxo não altera migrações, sincronização remota nem fórmulas de rotas legadas.

## Verificação

Implementação em `src/lib/core/native-workout-reward.ts`, `src/lib/core/native-action-completion.ts` e `src/lib/workout/fitness-core-adapter.ts`; cobertura em `tests/workout/native-workout-reward.test.ts`. A conclusão funcional e os resultados de testes ficam registrados no [changelog Fitness](../03-Project-Management/fitness/CHANGELOG.md) e na [continuidade](../CONTINUIDADE.md).

## Evolução F57 — regra v2 (0.1.29)

Divergência reproduzida no código: uma série de 10 repetições gerava 10 ER e 40 segundos ativos estimados; um bloco de 40 segundos gerava 20 ER. Com esforço/fator iguais, a base de XP de repetições era metade. A normalização v2 mantém ER canônico e usa `baseValue = ER × 0.10 × 2` exclusivamente para séries por repetições. Por duração permanece `ER × 0.10`. Assim, blocos equivalentes em tempo ativo, fator e esforço têm a mesma base e recompensa, sujeitos aos mesmos tetos existentes por bloco. A divisão em blocos ainda pode afetar tetos; não se promete invariância entre segmentações diferentes.

Novas conclusões gravam `core-native-workout-block-v2`; recibos v1, XP concedido, fórmulas de rotas legadas e histórico permanecem intactos. Prévia e conclusão usam o mesmo construtor de blocos. Tempo manual de planejamento nunca concede trabalho realizado: três séries de dez repetições representam 120 segundos estimados, mesmo que o plano tenha 120 minutos. A interface explicita essa diferença. Não se infere intensidade pelo nome “costas”, modalidade, peso absoluto ou duração planejada.

Rating Native reutiliza WorkoutRating na conta existente, aceita apenas sessão concluída e não concede pontos. Resumo lê snapshots para séries, mídia, notas, volume kg·reps e perfil muscular ponderado por tempo; dados musculares ausentes são apresentados como ausentes. Evolução compara apenas sessões do mesmo template, até a data do registro aberto.

Prévia de check-ins/widgets foi alinhada ao mesmo construtor/calculador por bloco; duração planejada proporcional ainda identifica o tempo declarado da sessão, mas não substitui tempo ativo no XP. Teste de projeções cobre igualdade com editor e conclusão. UI de rotações permanece para validação funcional posterior.
