# R28-E — marcos no resultado das trilhas

26/10/2026 · **0.1.75 local** · branch `codex/fitness-ui-integration`, base `b11ed9d`. Astro Boy sequencial. Recorte entregue: resultado de um ritual executado pelo timer de `QuestHub`. Não é um sistema global de conquistas ou fragmentos.

## Experiência implementada

O recibo apresenta a tarefa e seus valores registrados, o progresso da trilha de origem e a próxima etapa sugerida. Quando o último ritual pontual é concluído, o título distingue esse marco. Ciclos vinculados continuam no calendário; a interface não declara que a Jornada/Grande Obra inteira foi concluída nem escreve no agregado.

Se `getLevelProgress()` retornar nível maior depois do comando bem-sucedido, aparece um selo com nível anterior e atual. Não há fórmula alternativa de XP, recompensa ou contagem visual a partir de zero. O selo usa a identidade dourada existente e entrada de 240ms; movimento reduzido remove essa animação e preserva a informação. A runa de vitória e as métricas existentes são reutilizadas.

O modal tem limite de altura, rolagem interna e selo mais compacto para celular. Próxima etapa e Fechar resultado estão disponíveis durante toda a apresentação. Não há fechamento automático, espera obrigatória ou novo comando para “receber” prêmio.

## Implementação e contratos

- `quest-milestone.ts`: projeção pura dos estados anteriores/posteriores. Exige mesma trilha e transição real da tarefa; marco final exige total não vazio e inalterado. Uma troca de seleção não fabrica marco.
- `QuestHub`: mantém exatamente a chamada existente a `finishQuestStep`; acrescenta leituras antes/depois para contextualizar resultado. Identifica a trilha que contém a tarefa, inclusive ao retomar ritual fora da seleção atual. Destino do botão é buscado pela trilha do recibo, evitando usar outra trilha escolhida pelo fallback.
- `QuestCompletionBody`: apresentação extraída, sem store, comandos ou persistência própria. Próxima sugestão continua livre; não cria bloqueios em outras etapas.
- Histórico/refresh não abrem esse recibo: ele continua sendo estado local criado apenas pelo retorno bem-sucedido. `Rituais` mantém `QuestHub` com chave da conta, descartando apresentação ao trocar conta.
- Não modificados: stores app/workout, tipos, `quest-commands`, `quest-path`, `sanctuary-timer`. Comparação SHA-256 de seis arquivos ao início do lote confirmou preservação. Regras/dados anteriores e trabalho R27/R28-D2 mantidos.

## Verificações realizadas

- Cinco testes novos de projeção e renderização: conclusão pontual/recorrência, histórico/identidade/totais, níveis válidos, recibo final e sugestão intermediária.
- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **194 testes passaram**; inclui os testes existentes de comando duplicado, conta obsoleta e falha de conclusão.
- `tsc -b` e `npm run lint`: passaram.
- Build pela API Vite com `envDir:false`: passou em **6,69s**. Avisos de chunks grandes e Browserslist permanecem.
- Versões package/lock sincronizadas; revisão de componentes React e diff pelo coordenador; sem revisão independente.

Logs locais: `/tmp/conselho-r28e-{tests,lint,types,build}.log`; snapshot de preservação `/tmp/conselho-r28e-preserved.json`.

Não executado: navegador, leitor de tela, toque, captura mobile, FPS, sessão real ou sincronização cloud. SSR não comprova foco, layout ou movimento renderizado. Bloqueio anterior de inspeção não contornado. Sem commit/push/deploy, acesso a secrets ou dados reais nos testes.

## Próximo lote e aceite

Revisão transversal R28-F: conferir comportamento real a 360/390px, depois 768px, incluindo resultado com título longo, subida de vários níveis, trilha com ciclos, conclusão sem mudança de nível, Escape/Fechar/próxima etapa, restauração de foco, preferência reduzida e troca de conta. Conferir também Domínios/Mapa (scroll), Ciclos (quantidades) e Treinos (séries) da fase acumulada.

A cobertura de marcos nesta rodada se limita a Rituais executados nas trilhas. Celebrações globais e novos tipos de conquista precisam de eventos verificáveis; fragmentos continuam dependentes de contrato. R25-A/B (backup/restauração e associação segura à conta) permanece prioridade pendente, sem garantia de preservação cloud. A fase visual não equivale ao fechamento total do produto.
