# R28-D2 — retorno visual de Treinos

26/10/2026 · versão local **0.1.74** · base `b11ed9d`, branch `codex/fitness-ui-integration`. Astro Boy executou e revisou sequencialmente. Entrega dentro da fase de movimento aprovada, preservando alterações R27/R28 anteriores.

## Implementado

- `WorkoutSetReceipt` substitui a linha simples de série/bloco concluído por confirmação compacta com selo, valores realmente registrados e região de anúncio estável. Pular tem estado distinto, sem celebração.
- A animação de 240ms observa a transição pendente → concluído do mesmo ID. Não dispara para histórico montado, troca de ID, repetição de render ou item pulado. Não envia comandos, não concede recompensa e não depende do fim da animação para mostrar o registro.
- Preferência de movimento reduzido dinâmica cancela a apresentação; desmontagem também cancela. Sem suporte à API de animação, a confirmação textual permanece.
- `ExerciseCard` usa `RevealPanel`: conteúdo continua montado e campos fechados ficam inertes, com identificação acessível do painel.
- Barras de exercício/distribuição muscular usam transformação de escala em vez de animar largura. Botões e ação flutuante respeitam movimento reduzido. Navegação, altura dos controles e afastamento da barra inferior preservados.

## Preservação e revisão

SHA-256 comparado ao início deste lote confirma `appStore.ts`, `workoutStore.ts`, `types/workout.ts`, `pages/fitness/ActiveWorkout.tsx` e `pages/fitness/WorkoutSummary.tsx` inalterados. Os comandos/valores enviados por `ExerciseSetRow` continuam os existentes; revisão do diff não encontrou alterações de persistência, economia, sessão ou relógio.

Revisão React: efeito com dependências escalares, cancelamento na limpeza, ausência de estado derivado em efeito, confirmação fora do evento de gravação e painel fechado inerte. A confirmação não desloca foco nem rolagem. Revisão documental pelo coordenador; não houve revisão independente.

## Verificações executadas

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **189 passaram**. Novos quatro testes cobrem detecção de conclusão, HTML dos estados, painel fechado e efeito real com dublês de hooks/animação (cancelamento/preferência/histórico).
- `node --test tests/elemental/fitness-motion.test.mjs`: quatro passaram novamente após agrupar o recibo/formulário em um único contêiner de linha.
- `tsc -b`, `npm run lint`: passaram.
- Build via API Vite com `envDir:false`: passou em **6,87s**. Avisos de chunks grandes e Browserslist permanecem.
- Versões de package/lock sincronizadas e `git diff --check` limpo.
- O primeiro teste isolado encontrou ausência de interoperabilidade de import default no carregador de testes. Corrigido `esModuleInterop` no carregador, seguido pela suíte completa. Não era falha do runtime do app.

Logs desta máquina: `/tmp/conselho-r28d2-{tests,lint,types,build}.log`. Snapshot SHA: `/tmp/conselho-r28d2-preserved.json`.

Não executados: suíte Deno legada de workout, sessão real de ponta a ponta, sincronização remota, inspeção renderizada, leitura por leitor de tela, toque e FPS. Testes SSR e dublês não comprovam qualidade visual ou anúncio real em tecnologia assistiva. Bloqueio anterior de inspeção local não contornado. Sem commit/push/deploy; dados reais não foram usados nos testes.

## Aceite mobile e próxima etapa

1. Em dados isolados criados pela UI, abrir uma sessão com séries e um bloco de atividade. Registrar valores e confirmar que o recibo corresponde ao registro e aparece uma única vez.
2. Pular uma série, recolher/reabrir exercício e retornar à sessão: sem celebração de histórico, sem perder valores de campos pendentes.
3. Alternar movimento reduzido durante apresentação; conferir confirmação imediata e botões sem escala.
4. Verificar 360/390px e depois 768px: textos longos, teclado, foco após concluir, toque e ausência de sobreposição da navegação.
5. Continuar R28-E (marcos/feedback de progressão), depois revisão R28-F e QA acumulado. R25-A/B (backup/associação de conta) e contratos de fragmentos permanecem pendentes; este lote não garante proteção cloud.
