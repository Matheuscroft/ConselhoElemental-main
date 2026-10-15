# Decisão de Matheus — pontuação Fitness consolidada

Data: 13/10/2026. Referência restaurada: b1575e4. Versão importada comparada: fe1a8fe. Perfil local explicitamente configurado Matheus/backend.

## Relato da entrega importada

O handoff documentado em CONTINUIDADE/F59, changelog e ASTRO-BOY-BOAS-VINDAS informa: editor/biblioteca/prévia compartilhados, exercícios próprios, mídia/imagem/vídeo, notas/distância, pausa persistida, resumo com avaliação/evolução, histórico nativo+legado e Saúde/Corpo/Semana. O changelog relata testes no ambiente de Fábio; eles não foram repetidos nesta sessão. Não houve mensagem enviada a outro chat ou comunicação externa para elaborar este relato.

## O que significava pontuação por blocos

Uma série completed e não skipped era convertida em um objeto de cálculo com baseValue e effortLevel. Core calculava XP e teto individualmente para cada objeto e somava. Não era uma nova tarefa, hábito ou subtarefa no banco; os arrays eram entrada da função. O resultado continuava a gerar um único ExecutionLog. O ponto de divergência era a matemática interna: soma de valores limitados por série em lugar de limitação única sobre o treino inteiro.

Exemplo isolando o teto: três parcelas brutas de30 XP, esforço3/teto50. Sessão consolidada: MIN(90,50)=50. Tetos individuais: MIN(30,50)+MIN(30,50)+MIN(30,50)=90. Esse exemplo só demonstra a diferença de teto; não prescreve séries nem deriva uma sessão real específica.

## Regra vigente restaurada

```text
ER realizado = SOMA(séries completed e não skipped)
dinâmico: reps × fatorCarga
isometria/tempo: (segundos / 2) × fatorCarga
baseValue = ER total × 0.10
XP = MIN(baseValue × presença × esforçoGlobal × multiplicadorTempoSessão, tetoEsforçoGlobal)
```

- Carga leve/manutenção/progressão:0.8/1/1.5.
- Esforço global1–5, multiplicadores1/1.2/1.5/2/2.8 e tetos10/25/50/100/200, conforme regra original.
- Prana por esforço global, uma vez por sessão, sem ponderar RPE individual.
- Preview usa tempo planejado e presença de preview; CHECKIN usa tempo declarado proporcional ao planejamento sem iniciar cronômetro; LIVE usa tempo entre startedAt/completedAt como na referência original.
- Um recibo por sessão, core-native-leaf-v3. Série isolada só atualiza rascunho/badge; crédito apenas quando o treino encerra total/parcialmente, manual ou automaticamente.
- Tempo ativo estimado, notas, distância, mídia e RPE podem permanecer como informações de interface/histórico; não alimentam a fórmula atual.
- Recibos anteriores, inclusive block-v1/v2, ficam intactos. Nenhum ajuste de XP já concedido foi executado.

## Comparação e pontos para debate

| Tema | b1575e4 / sua regra restaurada | fe1a8fe / proposta importada | Decisão ou debate |
|---|---|---|---|
| Unidade de pontuação | Sessão consolidada | Série pontuada separadamente | Restaurado: sessão |
| Base de reps | ER×0.10 | ER×0.10×2 | Restaurado:0.10 sem fator extra |
| Base por segundos | ER×0.10, com ER=segundos/2 | Mesma base | Mantido original |
| Teto | Único por treino | Por série e somado | Restaurado único |
| Esforço | Global1–5 | RPE1–10 por série convertido para1–5 | Global pontua; RPE informativo. Debater utilidade e rótulos do RPE |
| Tempo LIVE | Relógio entre início/fim | Tempo ativo estimado/observado dos blocos | Restaurado relógio original. Debater se pausas devem ser descontadas: não alterar automaticamente |
| Tempo CHECKIN | Declarado a partir do plano, proporcional ao realizado | Tempo ativo dos blocos determina XP | Restaurado declarado. Debater override de tempo informado e transparência |
| Presença | Faixas pelo tempo da sessão; preview/CHECKIN presumidos com tempo | Faixas pelo tempo ativo dos blocos | Restaurada entrada original |
| Prana | Custo pelo esforço global | Esforço médio ponderado por base | Restaurado global |
| Sessão sem séries válidas | Caminho original pode debitar Prana do esforço apesar de XP0 | Zero XP e Prana | Restaurado original. Debater se deve obrigar descartar ou impedir conclusão vazia |
| Badge de cada exercício | Parcela do total limitado, proporcional ao ER | Soma do XP dos blocos do exercício | Restaurado proporcional; não credita série individual |
| Tempo ativo em gráficos | Informação adicionada pela UX, separada da pontuação | Também passou a alimentar pontuação | Mantido apenas informativo. Debater mostrar tempo ativo e relógio lado a lado |
| Valores em hábitos criados no período importado | Persistência contém snapshot no momento da ativação | Alguns podem conter base dobrada | Não migrados silenciosamente. Prévia Fitness calcula base original pelo template, novos despachos usam0.10; decidir revisão dos snapshots de hábitos existentes |
| Recibos já emitidos | Histórico imutável | Alguns usam bloco-v1/v2 | Preservados; qualquer reparação de valores históricos exige escopo explícito |
| Chaves de XP/Nível | Campos canônicos de elementos | Correções de compatibilidade no Core/layout | Mantidas correções de chaves/leitura que não mudam multiplicadores; debater separado se necessário |
| Navegação de modalidades | Grade → conteúdo dedicado | Seleção inline com Corrida padrão | Restaurada a navegação; conceito continua Modalidade |

## Arquivos e estado

Calculador consolidado e Adapter restaurados da referência; preview/progressão restaurados, com tempo ativo informativo preservado para compatibilidade de UI. finishSession consolida ER×0.10 antes do despacho. ADR-003 preservado como proposta histórica rejeitada para a regra vigente. Motor por blocos permanece no código, mas não é chamado pelos caminhos atuais de pontuação.

Não há commit/push ou migração remota desta decisão. Verificações estáticas devem ser registradas em CONTINUIDADE; nenhum teste funcional foi executado nesta etapa.

## Decisão aprovada por Matheus — 14/10/2026

Sessões nativas LIVE incluem descansos no tempo total e descontam apenas pausas explícitas persistidas. CHECKIN continua usando o tempo planejado proporcional ao trabalho concluído, sem iniciar cronômetro. ER × 0.10, esforço global e teto único permanecem vigentes.

Sessão sem volume realizado (séries concluídas, não puladas, com repetições ou duração positivas) não emite execução, XP ou Prana. LIVE vazia é descartada; CHECKIN vazio não é finalizado.

Histórico oferece limpeza conservadora de sessões nativas concluídas com XP real zero, duração inferior a 60 segundos e nenhuma série realizada. Exclusão requer recibo do Core e reversão do eventual Prana; registros sem comprovação ficam preservados. Não é uma migração automática nem uma limpeza de históricos legados.

Prana ponderado permanece proposta para debate futuro; não implementado.
