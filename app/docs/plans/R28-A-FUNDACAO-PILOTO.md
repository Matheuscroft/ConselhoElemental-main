# R28-A — fundação de movimento e piloto de Ciclos

25/10/2026 · 0.1.70 local · base Git b11ed9d, sobre R27 não commitado. Fábio aprovou iniciar a sequência de R28. Astro Boy implementou sequencialmente usando frontend-design; a auditoria improve-animations anterior serviu de referência, não de alegação de execução. Sem novos subagentes neste lote.

## Implementado

- `elemental-motion.css` centraliza os tokens existentes de feedback (160ms), revelação (240ms) e curva. Receita opt-in de pressionamento usa 100ms ao tocar; removida a escala genérica imposta a todos os botões. Transição global agora enumera cores/borda/opacidade em vez de all.
- `ElementalMotion` conecta a preferência do sistema ao MotionConfig já disponível. `useMotionPreference` acompanha mudanças de preferência e remove listeners; sem nova dependência.
- AppLayout retira blur de navegação, reduz deslocamento e usa apenas opacidade quando a preferência reduzida está ativa. Barras do HUD existente não começam mais em zero a cada montagem; seus cálculos não mudaram.
- Diálogos e sheets reutilizam tokens; modo reduzido preserva fade de 120ms, sem zoom/deslocamento. Centralização, foco, close e tratamento modal continuam no Radix. Botão principal de quest não desloca no modo reduzido.
- Piloto em Ciclos: pressionamento nas ações Iniciar/Concluir/Desfazer e Somar ao dia; barra do contador usa scaleX, mantendo aria-valuetext real e visual limitado à meta. Aviso local de registro deixa de remontar a cada incremento.
- Confirmação de conclusão mantém o mesmo nó visual enquanto recebe recibos consecutivos; agrupa por ID e atualiza texto/total sem reiniciar a entrada. Undo remove recibos revertidos do aviso, inclusive o último. A contagem é de conclusões registradas, podendo incluir pai/filhos; não é contagem de novos ciclos.
- Avisos seguem após comando salvo, com status acessível, sem bloquear próximo toque e sem condicionar persistência à animação.

## Preservação e limites

SHA-256 comparado ao início deste lote confirmou `appStore.ts`, `workoutStore.ts`, `types/index.ts` e `Ciclos.tsx` idênticos. Isso preserva inclusive as alterações R27 preexistentes; não significa diff vazio contra main, pois R27 adicionou campos/comandos anteriormente. Sem alteração de XP/Prana, tempo, agendas, contratos, cloud, conta ou dados reais. A lista de recibos do aviso é efêmera e somente de apresentação; não é ledger/persistência paralelo.

Órbita/Lua/arte aprovadas não foram redesenhadas. Outros módulos ainda mantêm receitas locais e precisam de migração posterior; provider não prova cobertura de todo CSS, WebGL e WAAPI. Não declarar todas as ações/abas concluídas. R25-A/B, fragmentos e demais contratos seguem pendentes.

## Verificação executada

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **174 testes passaram**, zero falhas.
- Quatro testes novos: agrupamento/deduplicação/Undo com store real em memória isolada; data e quantidade sem reencenar conclusão; mudança/cleanup da preferência do sistema simulada; SSR do contador acima da meta com fill limitado.
- TypeScript e lint passaram.
- Build Vite pela API com `envDir:false` passou em **10,11s**. Avisos de chunks grandes/Browserslist permanecem.
- Diff-check limpo; versões 0.1.70 sincronizadas nos manifests/changelog.
- Logs temporários: `/tmp/conselho-r28a-{tests,lint,types,build}.log`; manifesto de preservação `/tmp/conselho-r28a-preserved.json`.

## Ainda não verificado

Não houve navegador nesta rodada e o bloqueio de inspeção anterior não foi contornado. Sem prova nova de aparência, toque, frames, interrupção visual, Safari ou desempenho real. Testes de eventos/SSR não substituem execução renderizada. Não foram medidos FPS ou consumo de bateria.

Roteiro de aceite em 360/390px, depois 768px: contador com vários toques; soma acima da meta; Undo de registro; duas conclusões rápidas; Undo durante aviso; executar etapas; trocar data/conta; abrir/fechar diálogo e menu; teclado/foco; mudar preferência de movimento durante uso. Conferir ausência de sobreposição com navegação inferior, saltos e duplicação de comandos. Histórico e valores devem permanecer idênticos com/sem animações.

## Continuidade

Fundação e primeiro piloto implementados, aceite mobile pendente. Próximo: corrigir diferenças comprovadas no piloto e aplicar receitas à criação/organização (Invocar/Forja/Rituais/Jornadas/Obras), mantendo proteção de progresso R25 prioritária no eixo funcional. Próxima rodada não precisa repetir aprovação de início já dada; respeitar dependências e contratos. Sem commit/push/deploy deste lote. Revisão documental pelo coordenador; independente pendente.
