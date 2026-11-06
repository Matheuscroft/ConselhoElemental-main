# R27 — contador genérico por atividade e organização diária

25/10/2026 · 0.1.69 local · branch `codex/fitness-ui-integration` · base `b11ed9d`.
Astro Boy executou e revisou sequencialmente; Fábio conduz frontend, Matheus backend. Continuação das alterações R27 ainda não publicadas, sem sobrescrever R26.

## Decisões e problema corrigido

Fábio aprovou contar quantidades sem XP adicional e confirmar a conclusão separadamente. Depois rejeitou os atalhos Água/Aulas/Banhos porque pareciam restringir a rotina a três atividades. Esses atalhos foram removidos: o contador pertence à atividade criada pelo usuário, independentemente do nome ou elemento. Não há classificação por palavras-chave.

## Uso e apresentação

1. No cartão de um ciclo comum, abrir **Adicionar contador**.
2. Definir a meta diária. O padrão soma uma repetição por toque.
3. Se necessário, abrir **Personalizar unidade e quantidade**, escrever qualquer unidade (até 24 caracteres) e definir quanto cada registro soma. Exemplos possíveis: páginas, arquivos, minutos, quilômetros ou itens. A prévia mostra o incremento e a meta antes de ativar.
4. **Somar ao dia** registra uma quantidade para a data selecionada. Pode ultrapassar a meta e funcionar após concluir o ciclo, em Todos/Feitos.
5. O histórico do dia permite desfazer cada registro. A conclusão permanece uma ação separada.

A configuração mantém rótulos, foco, alvos de toque mínimos de 44px e entrada de números a 16px. Detalhes de medida ficam recolhidos na ativação; em edição ficam visíveis. Campo inválido em detalhes fechados revela o painel para correção. Feedback de registro e conclusão tem movimento reduzido.

A identidade mantém fundo elemental escuro, texto claro, dourado nas ações e acento do elemento na barra. Layout: nome da atividade → meta → personalização recolhível → prévia → ativar. Sem nova biblioteca ou assets.

## Ciclo, sequência e subitens

- Ciclo: atividade recorrente; para aparecer diariamente, selecionar todos os dias na agenda. Cada data tem sua própria conclusão.
- Sequência: alternância de um ciclo por data programada; não é uma lista para realizar todas as atividades no mesmo dia.
- Subitens: etapas fixas da atividade, preservadas para as próximas execuções.
- Contador: soma repetições/quantidades da atividade, sem criar novos subitens nem recibos de conclusão.

Escopo entregue: ciclos comuns raiz e membro comum exibido em sequência. O contador não foi propagado a Rituais, subitens individuais ou widgets de treinos nativos. Estes últimos mantêm suas medições próprias. Não alegar contador universal em todas as entidades do app.

## Contrato e persistência

`Habit` continua sendo projeção de `Action`. Campos opcionais `dailyTracking {target, step, unit}` e `dailyEntries [{id, dateKey, quantity, unit, recordedAt}]` usam o store e os snapshots existentes. Comandos `configureHabitDailyTracking`, `recordHabitQuantity` e `removeHabitQuantity` delegam a `updateHabit`, que atualiza action e projeção. Nenhuma store, tabela ou serviço paralelo.

Cada registro usa chave de data local e UUID; quantidades positivas entre 0,001 e 1.000.000, até três casas decimais. Meta e incremento podem ser ajustados sem apagar registros. Unidade fica protegida quando há registros para evitar misturar medidas. Duplicação mantém configuração e começa com diário vazio. Dados legados sem campos novos não precisam de migração.

A virada do dia troca a vista que estava em Hoje quando ociosa/visível; não apaga dados nem muda seleção histórica. Execuções em andamento conservam sua data. Valores do contador não alteram XP, Prana, constância, subitens ou conclusão. As regras R26 permanecem.

Animação de conclusão observa recibos novos na página Ciclos, incluindo filhos e treino vinculado; não simula uma recompensa no incremento. Ignora abertura, troca de conta, hidratação local e Undo. A reconciliação da execução agenda atualizações de UI em animation frame com cancelamento, mantendo comandos e tempo calculado existentes. Revisão do lint identificou cascata de estado nesse efeito e foi corrigida.

Leitura local anterior de `supabaseCloudSync.ts` mostra payload integral do hábito e snapshots; isso é compatibilidade estrutural, não teste de sincronização remota. Não foram alterados SQL, auth, serviços cloud ou credenciais. Associação segura à conta e backup R25-A/B continuam pendentes.

## Evidências executadas

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **170 passaram**, zero falhas. Inclui 11 testes de quantidades/feedback/vista/contas, com store real e armazenamento isolado em memória; nunca dados pessoais.
- Testes cobrem unidades arbitrárias em atividades distintas, meta excedida, frações, Undo, conclusão independente, ausência de XP extra, espelho action/habit, recarga local, duplicação, contas locais e datas. SSR verifica rótulos/barra/histórico/entrada genérica, não interação de navegador.
- TypeScript e lint passaram; build Vite `envDir:false` passou em 7,60s; diff-check limpo e manifests 0.1.69 sincronizados. Avisos de chunks/Browserslist permanecem. Logs temporários `/tmp/conselho-r27-generic-{tests,types,lint,build}.log`.
- Revisão React: estado transitório reiniciado por conta/data/ciclo, listeners/timeout com cleanup, comandos nos handlers, rótulos e reduced motion. Sem dependências novas.

## Limites e próximo passo

QA renderizado de 360/390/768px, teclado, toques, abertura/personalização, fluidez, rolagem e execução completa com relógio ainda pendente. Bloqueio de localhost previamente retornado pela ferramenta não foi contornado. Screenshot do usuário fundamentou o diagnóstico, não comprova o resultado novo.

Próximo: verificar no celular qualquer ciclo → contador → unidade personalizada → registrar → concluir → acrescentar → desfazer registro → trocar data → retornar ao histórico. Não usar atividades reais para testes destrutivos. Futuro módulo visual de hidratação deverá consumir estes registros, sem criar outro histórico; ainda não implementado.

Revisão documental feita pelo coordenador, sem revisão independente. Sem commit, push ou deploy deste lote. Não confundir salvar código com backup do progresso pessoal.
