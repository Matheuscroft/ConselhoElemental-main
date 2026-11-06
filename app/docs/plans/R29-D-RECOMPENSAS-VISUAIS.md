# R29-D — apresentação compartilhada de recompensas

27/10/2026 · **0.1.83 local** · branch `codex/fitness-ui-integration` · base `b11ed9d`. Astro Boy executou e revisou sequencialmente. Trabalho anterior preservado. Fábio conduz frontend/mobile; Matheus mantém backend. Este lote não altera regras de XP, contratos persistidos ou comandos de concessão.

## Entrega

`RewardSummary` reúne XP registrado, elementos, barra atual do personagem e subida de nível quando há comparação válida e ganho positivo. `RewardNotice` acrescenta identificação da atividade e fechar. São componentes de apresentação: não escrevem dados nem calculam recompensas a partir de pontos ou tempo.

- Ciclos mantém seu observador de conclusões e passa a usar o painel compartilhado.
- Lista de Rituais ganha observador de novas conclusões por folha, baseado no snapshot `completionXp` salvo. Agrupa conclusões rápidas, retira eventos desfeitos e ignora pais agregadores, notas e treino nativo. Fecha após cinco segundos ou pelo usuário; cancela timers/subscrições ao desmontar. Não reproduz histórico na montagem, hidratação ou troca de conta.
- Trilhas passam o elemento salvo e o progresso atual no retorno de `finishQuestStep`; os comandos de conclusão e minutos fracionários continuam iguais. O resultado mantém pontos e duração separados. O aviso da lista não fica montado na trilha, evitando duplicação com seu modal.
- Concluir/Reabrir Jornadas e Grandes Obras apresenta o delta retornado pelo comando existente e o nível atual. Reversão aparece como ajuste negativo, sem selo de celebração. Resultado obsoleto deixa de aparecer quando o estado concluído muda externamente.
- Resumo de Treinos nativo/legado usa os valores já registrados nas fontes existentes. Abrir o histórico não dispara animação de nova recompensa. O overlay da sessão ativa não foi reformulado neste lote.

Zero aparece como “Conclusão registrada / Sem XP adicional”. Valor ausente ou não finito aparece como “XP indisponível”; não é convertido em zero. Nenhum fragmento, streak ou bônus novo é criado. O painel não corrige retroativamente dados pessoais.

## Movimento e mobile

Identidade elemental escura/dourada, ícones próprios, entrada de 240ms e selo de 380ms por transform/opacity, sem loop infinito ou bloqueio de ações. `prefers-reduced-motion` remove animações/transições. Avisos têm botão de fechar de 44px, largura limitada e altura máxima de 55dvh com rolagem; posicionamento considera navegação inferior e safe area. São escolhas de implementação, ainda sem aceite renderizado no celular.

## Verificações executadas

- **243 testes passaram:** `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- Cinco novos testes cobrem apresentação de ganho/zero/ausência/reversão/nível e ciclo de vida do observador de Rituais, com store real isolado e dublês de React/timers: agrupamento, Undo parcial/total, fechar, expiração, conta, hidratação, histórico, nativo e cascata sem duplicação de pais.
- Dois testes anteriores atualizados para o contrato aditivo do recibo e mensagem explícita de XP zero; preservadas verificações de tempo fracionário, chamada única e valores desconhecidos.
- TypeScript (`tsc -b`), lint e build Vite com `envDir:false` passaram; build **15,22s**. Avisos de bundle grande/Browserslist permanecem.
- SHA-256 antes/depois confirmou preservação de `appStore`, `workoutStore`, tipos, helper de XP de Rituais e comando de conquistas **neste lote**; eles contêm alterações de lotes anteriores.
- Manifests sincronizados em 0.1.83; `git diff --check` sem erros. Revisão de código/documentação sequencial, sem revisão independente.
- Logs locais: `/tmp/conselho-r29d-{tests,types,lint,build}.log`; baseline de integridade em `/tmp/conselho-r29d-core-before.json`.

Não executados: navegador, QA 360/390/768px, FPS/leitor de tela, dados pessoais, sincronização/Supabase ou suíte Deno nativa. Bloqueio salvo do navegador não foi contornado. **XP retroativo pessoal ainda não aplicado/observado.** Sem commit, push ou deploy.

## Retomada

R29-D implementado e verificado por código; aceite visual continua no R28-F. Próximo lote independente do navegador: R28-F5, revisar cancelamento e estado temporário de Invocar/formulários ao trocar contexto, sem mudar persistência. Executar matriz mobile quando a inspeção estiver disponível. R25-A/B (backup/restauração completa e associação segura à conta), contrato/sync dos snapshots e fragmentos permanecem pendentes; o backup restrito de recuperação de Ciclos não substitui R25. Não declarar animações de todas as abas nem escopo global concluídos.
