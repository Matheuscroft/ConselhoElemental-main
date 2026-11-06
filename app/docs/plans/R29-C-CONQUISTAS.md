# R29-C — conclusão e bônus de conquistas

27/10/2026 · **0.1.82 local** · branch `codex/fitness-ui-integration` · base `b11ed9d`. Astro Boy executou e revisou sequencialmente; preservado trabalho local R27–R29-R/B. Autorização: pedido de XP nas atividades e continuação da próxima etapa de bônus anunciada. Sem novos valores padrão, multiplicadores ou bônus inventados.

## Diagnóstico e contrato

Jornadas e Grandes Obras exibiam `xpBonus`, mas updateQuest/updateProject apenas atualizavam campos. Não existia fluxo explícito de fechamento com concessão do bônus e reversão. A projeção das trilhas já distinguia rituais pontuais de ciclos recorrentes e usava o estado atual das atividades; as barras dos catálogos ainda liam progress armazenado, potencialmente desatualizado.

`setAchievementCompleted(kind, id, completed, accountId, signature)` passa a ser o comando de fechamento/reabertura da interface. Confere conta, entidade, prévia atual e valor finito não negativo antes de alterar o store. Status, isCompleted, snapshot e XP são escritos juntos. Repetir o estado desejado não paga novamente.

- Usa **exatamente xpBonus já configurado**. Invocar já atribui seus padrões existentes; trilhas criadas sem bônus continuam com zero e a UI informa isso. Não adiciona bônus por tarefa ou por capítulo.
- Novo campo opcional `completionBonus` em Quest/Project: ID, amount, elementId, completedAt, ruleset `achievement-bonus-v1`.
- Confirmar conclusão credita no elemento da conquista e registra o valor original. Reabrir retira somente esse bônus, mesmo após mudar elemento/xpBonus, e preserva tarefas, ciclos, capítulos e respectivas recompensas.
- As projeções existentes de pontos totais/por elemento passam a usar o snapshot quando presente; históricos sem snapshot mantêm fallback legado. XP antigo não é estimado nem debitado. Reabrir legado remove apenas sua contribuição de pontos agregados existente.
- Não existe conclusão automática na hidratação, no avanço da barra, na marcação do último ritual ou ao concluir uma Grande Obra contendo uma Jornada. Cada conquista tem fechamento explícito próprio.
- Exclusão e updates genéricos existentes não são reescritos como comandos de recompensa. Backend futuro deve preservar o snapshot e usar um contrato equivalente; o front não comprova atomicidade remota.

## Quando pode concluir

A projeção pura foi movida para `src/lib/quest-trails.ts`; o caminho anterior reexporta a API para manter compatibilidade. `achievementPlan` reaproveita essa única fonte de vínculos/ordem. A leitura de conclusão agora também confere subitens completáveis, para que um pai encerrado parcialmente não mostre 100% enquanto ainda bloqueia o bônus. Nenhum novo modelo de atividades foi criado.

Rituais pontuais vinculados precisam existir no store atual, estar concluídos e ter seus subitens completáveis concluídos. NOTE/text não exige checkbox. Referências copiadas em projetos não substituem o estado real. Ritual removido deixa uma pendência explícita para revisão. Obra arquivada não pode ser concluída. Ciclos vinculados não entram nessa condição e não são encerrados permanentemente.

Conquista sem rituais pontuais pode ser encerrada por confirmação explícita de que o objetivo foi alcançado, inclusive quando só há ciclos vinculados. Isso não marca os ciclos nem paga suas atividades. A navegação livre nas etapas continua; este critério se aplica apenas ao fechamento com bônus. Essas são decisões operacionais deste lote, não citações literais de regras numéricas do usuário.

## Interface mobile

Painel compartilhado `AchievementCompletion` nos detalhes de Jornadas/Grandes Obras e na trilha de Rituais. Mostra elemento e bônus, ação Concluir/Reabrir, revisão com Cancelar/Confirmar, resultado baseado no retorno do comando e mensagem de falha. A confirmação expira quando muda a prévia; identidade de conta/conquista remonta o painel. Guarda de envio evita toque duplo antes do render.

Design mantém Cinzel/Inter, fundo elemental escuro e superfície translúcida com borda dourada. Botões mínimos 48px e ações quebram em linhas em largura estreita. Confirmação local tem entrada de 240ms por transform/opacity, removida com prefers-reduced-motion. Foco vai ao resultado após ação; abrir página concluída não reproduz a celebração. Nenhuma animação concede XP.

Barras dos catálogos e detalhes agora derivam dos rituais atuais; conquista explicitamente concluída mostra 100%. Ciclos permanecem fora dessa porcentagem. Jornadas guarda seleção por ID/conta em vez de objeto antigo, evitando detalhes congelados após alterações. Essas projeções não regravam o progress persistido.

## Verificações executadas

- **238 testes passaram**: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- Sete testes novos: cinco com store real isolado e dois dos handlers de UI com dublês de React. Casos: escrita atômica, idempotência, recarga, revisão obsoleta/conta, snapshot após edição, legado, zero bônus, capítulos/Jornadas vinculadas, ciclos preservados, subitem pendente, tarefa removida, bônus inválido, toque duplo, falha sem sucesso fictício e confirmação de reabertura.
- TypeScript (`tsc -b`), lint e build Vite com `envDir:false` passaram; build **17,11s**. Avisos de bundle grande e Browserslist permanecem.
- `git diff --check` passou; manifests sincronizados em 0.1.82. Revisão React/código/documentação pelo coordenador, sem revisão independente.
- Logs: `/tmp/conselho-r29c-{tests,types,lint,build}.log`.

Não executados: navegador/QA mobile/FPS/leitor de tela, dados pessoais, execução remota/Supabase ou suíte Deno nativa. Nenhum push, commit, deploy ou leitura de secrets. Não contornado bloqueio salvo do navegador. Crédito retroativo pessoal R29-R continua sem aplicação observada.

## Próximo passo

R29-D: integrar recibos e animações de recompensas de atividades/conquistas, sempre a partir de concessão efetiva, com Undo, troca de conta e movimento reduzido. QA 360/390/768px continua pendente. R25 backup/restauração e associação segura de conta permanece necessário antes da migração pessoal. Fragmentos e bônus de constância têm contrato separado. Matheus mantém backend; Fábio frontend/mobile; revisar preservação dos campos e idempotência remota antes de anunciar sincronização.
