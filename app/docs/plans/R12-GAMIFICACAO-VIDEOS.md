# R12 — preparação da progressão elemental a partir dos vídeos

- Data: 23/10/2026.
- Base: `987e09e`, branch `codex/fitness-ui-integration`, versão 0.1.48; checkout inicialmente limpo.
- Estado: análise e plano, sem implementação. Próxima rodada pode iniciar pelo piloto visual; saldo real de fragmentos depende do contrato abaixo.
- Pedido: aproveitar UI/UX, animações e progressão das gravações; estimular constância com streak e conceder fragmentos conforme a atividade, preservando identidade elemental.
- Limites: sem código, backend, dados, secrets, dependências, deploy, commit ou push neste lote. Não atualizar versão por planejamento.

## 1. Evidência e alcance

Gravações locais fornecidas pelo usuário:

| Arquivo | Duração por ffprobe | Resolução | Método |
| --- | --- | --- | --- |
| ScreenRecording_10-23-2026 12-56-36_1.MP4 | 105,117438 s | 1290 × 2796 | Panorama a cada 5 s e trecho 40–50 s a 1 fps |
| ScreenRecording_10-23-2026 13-02-39_1.MP4 | 31,101587 s | 1290 × 2796 | Panorama a cada 2 s e trechos de conclusão/coleta/retorno a 3–4 fps |

Não foi reprodução audiovisual contínua nem inspeção de todos os frames; não foi analisado áudio/haptic. O segundo vídeo é HDR PQ/BT.2020, yuv420p10le. Miniaturas SDR sem tone mapping ficam mais escuras; não usar amostragem delas como paleta. Os valores de cor vêm dos tokens Figma e do app. Nenhum vídeo contém CSS, curvas de easing ou contratos de backend extraíveis. Durações abaixo são propostas, não engenharia reversa exata.

Evidências temporárias: `/tmp/elemental-video-review/`, com panoramas, `receipt-0-to-4.jpg`, `streak-7_5-to-10_5.jpg`, `collect-14_5-to-17_5.jpg`, `collection-17_5-to-20_5.jpg`, `select-40-to-50.jpg`, `return-27-to-31.jpg`. As gravações e miniaturas não são copiadas ao Git: contêm contexto de conta/social sem necessidade para o produto. Este documento conserva as observações úteis sem nomes/saldos sociais.

Referência complementar já consultada por MCP nesta conversa: [Figma Community](https://www.figma.com/design/g5rrLsKdGs9f5QXsxEsGH6/DuoLingo-Design-System--Community-?node-id=11-4093), página Existing Flows `11:4093`, componente Start Tooltip `11:2224`, Design Challenge `11:4094`. Inspecionados anteriormente `9:1212`, `11:1892`, `8:2790`, `8:3209`, `14:7779`, `13:5002`, `13:5703`. Consulta Figma não foi repetida nesta análise de vídeo. Extração anterior em `/tmp/conselho-figma-gamificacao-extracao.json` e CSS de referência temporário; não depender desses arquivos para as decisões deste plano.

## 2. Sequência observada e tradução para o app

Tempos aproximados, relativos ao início de cada gravação; esperas do usuário não medem duração da animação.

| Vídeo / trecho | Observação | Aplicação |
| --- | --- | --- |
| V1, 0–20 s | Trilha, seletor de seções, progresso por seção e detalhes | Catálogo de Jornadas e capítulos de Grandes Obras com retorno ao ponto atual |
| V1, 20–40 s | Percurso sinuoso, cores por unidade, nós em relevo, personagens laterais e marcos | Selos elementais, cabeçalho do capítulo, marcos sem esconder títulos/estado |
| V1, 40–50 s | Guia da unidade; retorno; seleção revela painel com ação | Detalhes/contexto da Jornada; painel ancorado na etapa, acessível por toque |
| V1, ~50–60 s | Objetivos diários/temporários, barras e recompensa | Objetivos definidos pelo usuário; não inventar metas ou nova moeda no frontend |
| V1, ~60–90 s | Liga, feed social, atividade e assinatura | Catalogados; fora do primeiro lote de gestão pessoal, sem ranking/assinatura novos |
| V1, ~90–105 s | Catálogo de prática e exercício específico de fala | Reaproveitar descoberta de recursos; não copiar a aula de idioma para um ritual |
| V2, 0–~8 s | Entrada comemorativa, personagem, resumo; métricas entram em sequência | Conclusão com título da atividade, XP/pontos/tempo registrados, efeito elemental breve |
| V2, ~8–14 s | Símbolo antes discreto se transforma; contador de dias aumenta; semana aparece | Selo de constância: antes/depois do valor confirmado e dias reais, uma vez por novo dia |
| V2, ~14–18 s | Progresso de desafio; peça gira e revela a face; brilho de descoberta | Fragmento do elemento confirmado; rotação curta e reflexo; texto explica origem |
| V2, ~18–21 s | Peça se desloca/reduz para a coleção; barra atualiza | Fragmento entra no saldo/coleção do Grimório sem disparar nova concessão |
| V2, ~21–28 s | Desafio de fim de semana e marco acumulado | Futuro: marcos pessoais/cosméticos com regras próprias; não adicionar obrigação diária |
| V2, ~28–31 s | Transição ao mapa e indicação da próxima atividade | Retornar à mesma trilha/rolagem, foco na próxima sugestão, sem iniciar automaticamente |

O vídeo tem várias telas pós-conclusão. Adaptar para um painel contínuo e dispensável: resultado → fragmento → constância quando mudou → continuar. Comemoração maior apenas em marcos. Nenhum botão fica bloqueado aguardando animação, nenhum modal de propaganda/pressão é introduzido.

## 3. Distribuição da experiência

1. **Jornadas:** piloto; objetivo estratégico, percurso de rituais, selo principal, próxima sugestão e gestão acessível.
2. **Rituais:** hub de execução e lista existente; seleção/contexto, timer e resultado. Um componente de trilha compartilhado, não três implementações.
3. **Grandes Obras:** campanha com capítulos correspondentes às missões existentes; selecionar capítulo revela trecho da trilha; estado global preservado.
4. **Santuário:** próximas ações e pequeno indicador de constância/coleção; personagem continua protagonista.
5. **Grimório:** saldo real por elemento, histórico de aquisição e marcos cosméticos futuros. Distinguir XP de fragmentos.
6. **Ciclos/Treinos:** preservam proprietários de execução; integração do mesmo resultado de domínio, sem premiação independente no módulo.

Próxima etapa continua sugestão; nenhuma etapa disponível recebe cadeado por ordem. Concluída, arquivada, removida e indisponível são estados distintos. Mostrar nomes curtos no mapa e título integral no painel; leitura ordenada por lista e alternativa compacta para percursos longos. Visão desktop com detalhe lateral; mobile com painel no fluxo ou sheet acessível, sem encobrir navegação/teclado.

## 4. Tokens e assets

Referência Figma inspecionada: nós de aproximadamente 71 × 65 px; CTA 48 px/raio 13 px; painel 341 × 146 px/padding 13–15 px; margens 16 px no frame 430 px; barra de objetivos 19 px. Esses valores são proporções de referência, não largura fixa para o app. A DIN Rounded da referência não substitui Cinzel/Inter.

Tokens a reutilizar de `src/styles/elemental-theme.css`: canvas `#080b12`, surface `#141b27`, raised `#202b3a`, text `#f2efe7`, gold `#d5b66f`, Terra `#a3ce9b`, Fogo `#f5ad83`, Água `#8bcee3`, Ar `#d2e6df`. Consolidar cores locais de `quests.css` nesses tokens; gerar profundidade/luz sem alterar cores de classificação no domínio.

Assets futuros: quatro fragmentos próprios, legíveis a 24/48/96 px; frente/lateral ou SVG em camadas para giro; selo neutro de constância; estado antes/depois de marco. Água cristal/fluido, Terra mineral, Fogo brasa, Ar núcleo translúcido. Constância não deve parecer um quinto recurso ou premiar apenas Fogo. Usar assets/ícones existentes no piloto; não extrair personagens/música/imagens do vídeo como assets do produto. Não chamar coleção de Forja: no app a Forja é inbox de rascunhos.

## 5. Estado atual confirmado no código

- `src/components/quests/QuestTrailMap.tsx`: lista semântica, offsets `[0,24,48,24]`, seleção, próxima sugestão, conclusão. Evoluir para composição de percurso; preservar nomes, foco e seleção por ID.
- `QuestHub.tsx`: controla query, timer do Core e recibo; `quest-commands.ts` chama ações existentes. `finishQuestStep` retorna título/pontos/delta XP/minutos, **não possui fragmentos nem dados de streak antes/depois**.
- `quest-path.ts`: projeção de leitura e contagem de rituais finitos; hábitos não entram como etapas definitivamente concluídas. Não grava progresso macro. Snapshots de Jornada/Obra podem divergir dos registros vivos; não corrigir via layout.
- `src/types/index.ts`: usuário possui `streak`/`longestStreak`, quatro campos de XP e Prana; não possui contrato de carteira de fragmentos.
- `src/stores/appStore.ts:265–307`: sequência global usa dias de hábitos e `updatedAt` de tarefas concluídas; retorna 0 quando não há conclusão hoje; diferenças de dias usam 24h em milissegundos. Isso exige cuidado com edição posterior, mudança de dia, fuso/DST. É inspeção estática, não defeito reproduzido por execução neste lote.
- Há cálculo de streak por hábito, distinto do global. Não renomear nem somar os dois como se fossem iguais.
- `src/lib/core/native-action-completion.ts`: treino registra execução Core e elemento Terra. Sua sessão é fonte de idempotência; fragmentos não devem ser concedidos de novo por projeção na lista.
- `src/constants/areas-with-subareas.ts` e áreas personalizadas fornecem classificação existente. `src/components/grimorio/history.ts` é projeção visual deduplicada; não é um livro de concessões nem base suficiente para recreditar todo histórico.
- Busca por fragmentos não encontrou recurso econômico implementado; ocorrências em material-effects são partículas decorativas.

## 6. Streak: apresentação e proposta de contrato

**Já autorizado em intenção:** incentivo e recompensa visual pela constância. **Não definido pelo pedido:** janela de dia, tolerância, retrospectivos, marcos e regras de recuperação.

Primeiro lote pode apresentar o streak atual com rótulo claro e fonte existente, sem criar um segundo cálculo. Para a experiência do vídeo, propor ao proprietário e Matheus uma regra única:

- Um dia conta quando existe ao menos uma conclusão elegível confirmada. Várias tarefas no mesmo dia não somam vários dias.
- Se a última conclusão foi ontem, conservar sequência e indicar “Hoje ainda está em aberto”; hoje concluído incrementa uma vez; lacuna maior reinicia. **Isso difere do cálculo atual e precisa de aprovação explícita antes de substituir o domínio.**
- Usar data de conclusão/evento, não data da última edição. Definir fuso da conta e dia civil; não subtrair 24h para percorrer dias locais.
- Undo recalcula com eventos restantes: remover uma tarefa de um dia que ainda tem outra conclusão não remove esse dia.
- Sem punição de XP/Prana, congelamentos comprados ou notificações automáticas nesta fase. Exibir recorde e retomada acolhedora.
- Marcos 3/7/14/30 dias são proposta visual, não regra já aceita; selo cosmético, sem multiplicador de pontos nem bônus de fragmentos implícito.
- Backdating, futuro, offline, troca de fuso e recomposição de histórico precisam de casos definidos antes de uma nova regra. Não extrapolar contadores atuais como calendário histórico completo.

## 7. Fragmentos: decisão proposta e classificação

**Decisão explícita de Fábio, 23/10/2026:** 1 fragmento por conclusão válida, do elemento da atividade, em saldo separado sem alterar XP ou Prana. Quantidade aprovada; não usar fórmula proporcional aos pontos. A implementação fica para a próxima rodada. Os detalhes de elegibilidade, resolução de conflitos de classificação e persistência abaixo continuam propostos.

Recomendação inicial: saldo inteiro separado por elemento, sem conversão para XP/Prana, sem gastos/loja/crafting na V1. Uso inicial é coleção e feedback; futuros cosméticos exigem outra especificação. Sem concessão retroativa nem valores artificiais para preencher o estado vazio.

Classificação automática deve significar resolução dos dados existentes, não adivinhar pelo título:

1. Resolver categoria/área primária e seu elemento no catálogo vigente, inclusive áreas personalizadas e subáreas válidas; guardar snapshot na concessão.
2. Conferir consistência com `elementId` da atividade. Dados ambíguos/conflitantes pedem revisão no editor antes de confirmar o elemento do prêmio; não mudar a atividade silenciosamente.
3. Sem área válida, só aceitar elemento explicitamente confirmado pelo usuário. Defaults legados como `terra` não provam escolha consciente; mostrar confirmação. A tarefa pode ser concluída mesmo se a classificação do fragmento estiver pendente.
4. Prévia “Fragmento de Terra · Exercício Físico” explica o resultado. Área mudada depois não altera fragmentos históricos.
5. Multiárea: para a V1 com 1 fragmento, propor **elemento da área primária**, sem sorteio nem divisão fracionária. A distribuição de pontos 70/30 ou 60/25/15 do Core permanece intocada. Fragmento não representa participação de XP; explicitar isso no texto de ajuda.

Exemplos condicionais ao cadastro: treino em Exercício Físico → Terra; estudo em área de conhecimento → Ar; atividade classificada em ação/projeto → Fogo; atividade em relações/emoções → Água. Uma atividade de mesmo título pode pertencer a outra área; nome sozinho não decide.

## 8. Contrato com Matheus antes de saldo real

Não adicionar `fragmentBalance++` em onClick, useEffect, animação, página ou store visual independente. A conclusão e a premiação são responsabilidade de domínio e devem funcionar por qualquer entrada (Rituais, Ciclos, Treinos, Santuário).

DTO proposto para revisão, **não schema criado**:

```text
CompletionRewardReceipt
  completionId / occurrenceId estável
  accountId
  rootActionId + sourceModule/sourceRefId quando existir
  confirmedAt + dayKey + timezone
  result: pontos, XP e tempo já confirmados pelo Core
  fragmentAward?: { awardId, element, quantity, classificationSnapshot, ruleVersion }
  streak?: { before, after, dayAdvanced, longest, sourceVersion }
  state: confirmed | pendingClassification | pendingSync
```

Invariantes propostas:

- Premiar uma conclusão completa elegível por ação raiz/ocorrência lógica; folha sem filhos ou execução do conjunto com folhas de valor. Checks estruturais/notas, mera criação, timer iniciado e execução parcial não concedem fragmento na V1.
- Mesma ação referenciada por duas Jornadas não ganha duas vezes. Agregadores não premiam novamente os filhos; bônus de fim de Jornada/Obra não entra nesta V1.
- Chave única inclui conta + identidade estável da tarefa/ocorrência + tipo de prêmio. Idempotência deve sobreviver a retry, duplo clique, recarga, dois dispositivos e Undo/reconclusão da mesma ocorrência; não usar apenas um UUID novo de log em cada tentativa.
- Para tarefas únicas, identidade da tarefa; para hábitos, identidade da ocorrência definida pelo Core. Sessões nativas preservam identidade de sessão e vínculos existentes. A política de múltiplas execuções do hábito deve ser definida pelo proprietário de recorrência.
- A conclusão não fica esperando animação. Mostrar concessão somente após confirmação real. Fechar o painel não perde prêmio; replay não concede novamente.
- Undo remove a concessão vinculada e ajusta saldo junto à reversão Core, seguindo contrato vigente de exclusão do log; não introduzir estorno de XP/Prana novo. Redo restaura no máximo a concessão válida correspondente.
- Definir comportamento de exclusão de entidade, exclusão de conta e perda de referência sem inferência silenciosa. Sem loja inicialmente, não há dívida por gasto antes de Undo.
- Persistência da concessão e conclusão deve ser atômica na arquitetura existente ou ter mecanismo explícito de recuperação. Os fluxos legados não expõem todos o mesmo recibo; não presumir transação já disponível.
- Backend deve aplicar unicidade/autorização por conta; estados offline precisam de confirmação/reconciliação, sem duplicar saldos. Não criar outra carteira em localStorage que ignore a sincronização.
- Migração/schema/RLS/API são itens de implementação do backend, não executados nem delegados agora. Não conceder permissão de deploy por este plano.

Decisões que faltam: política de dia/fuso e sequência pendente hoje; elegibilidade/granularidade; multiárea; retroativos/Undo; marcos/uso futuro. Recomendação registrada não equivale à aprovação. A implementação visual não depende de resolver toda economia; carteira real depende.

## 9. Roteiro da próxima rodada

| Lote | Dono | Arquivos/superfície | Entrega e aceite |
| --- | --- | --- | --- |
| R12-A | Fábio / frontend | `QuestTrailMap.tsx`, `quests.css`, tokens elementais | Uma Jornada com mapa, selos, títulos e cinco estados; livre seleção; sem alterar dados |
| R12-B | Frontend | `QuestHub.tsx`, componentes de detalhe/recibo | Painel e resultado fluidos; cronômetro preservado; nenhuma recompensa de animação |
| R12-C | Frontend | `Jornadas.tsx`, `GrandesObras.tsx`, `QuestComposer.tsx`, `QuestNextSteps.tsx` | Capítulos e criação coerentes; links de home; gestão anterior acessível |
| R12-D | Fábio + Matheus | Decisão de domínio, contratos, testes e depois stores/backend delimitados | Regra de streak e fragmentos aprovada, evento estável, unicidade, Undo, sync, casos históricos |
| R12-E | Frontend integrado | Recibo, selo de constância e coleção do Grimório | Animações consomem recibos reais; saldo correto, reduced motion e conta isolada |
| R12-F | Validação | Testes existentes + novos casos | QA mobile/desktop, desempenho, regressão e evidência real |

Componentes candidatos: evoluir `QuestTrailMap`; extrair `QuestStepPanel`/`CompletionSummary`; acrescentar `StreakSeal`/`ElementFragment`/`FragmentCollection` apenas quando necessários. Reutilizar Dialog/Popover/Progress, ArcaneIcon e Framer Motion já instalados; nenhuma biblioteca nova prevista.

UI proposta: `idle → submitting → confirmed(receipt)` ou `error`; após confirmed, camada opcional de celebração. Estados visuais não comandam concessão. Recarregar não reproduz prêmio como novo; usuário pode consultar o histórico sem ser recompensado de novo.

## 10. Critérios de aceite e testes a executar futuramente

- Navegador em 360/390/768/1440 px, zoom 200%, títulos longos, mapa vazio/1/100 etapas, capítulo vazio, arquivado e referência excluída.
- Teclado/foco/escape, leitor de tela com anúncio único do resultado; estado não expresso só por cor; CTA e navegação inferior sem colisões.
- Trocar rapidamente etapas durante abertura, voltar/avançar, recarga, timer ocupado/pausado, concluir uma vez, Undo e reabrir; contextos Fitness/Ciclos corretos.
- Fragments: cada elemento; área primária/personalizada; conflito/sem categoria; multiarea; dupla referência; duplo submit/retry; conta trocada; offline; Undo/redo; mesma ocorrência em duas telas; nenhum retrocrédito.
- Streak: primeiro dia, segundo dia, várias conclusões no mesmo dia, ontem sem hoje, lacuna, virada meia-noite, DST, fuso, futuro/retroativo; Undo de última/penúltima conclusão do dia; edição do título não muda data de conquista.
- Regra de XP/Prana e registros anteriores permanecem iguais; não usar redução de movimento para alterar concessão.
- Validar movimento em dispositivo real e a 10% de velocidade; apontar diferenças de referência sem dizer “idêntico” com base apenas em CSS.
- Reutilizar testes de quests/elemental, TypeScript, lint e build. Não chamar mocks de persistência de teste integrado.

## 11. O que foi efetivamente executado neste planejamento

Git status/base; leitura de continuidade/fila, código e capítulos canônicos; ffprobe dos dois arquivos; oito folhas de contato via ffmpeg e inspeção visual delas; busca por contrato de fragmentos/streak; consulta à skill improve-animations e seu guia/template. Documentação e links locais conferidos ao encerrar. **Nenhum teste do produto, build, lint ou QA do navegador foi executado neste lote.** Bloqueio de localhost registrado no lote anterior não foi retestado nem contornado. Som/música/vibração não foram extraídos.

Para continuidade, ler este plano e [001-MOVIMENTO-QUESTS.md](001-MOVIMENTO-QUESTS.md). Não é preciso novo vídeo para o piloto visual. Permissão efetiva de navegador será necessária para seu aceite. Revisão documental pelo coordenador; sem revisão independente, agentes adicionais ou mensagem enviada ao Matheus.
