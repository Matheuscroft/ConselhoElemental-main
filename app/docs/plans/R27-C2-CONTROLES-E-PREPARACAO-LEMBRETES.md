# R27-C2 — Controles e preparação dos avisos — 0.1.116

30/10/2026 · Astro Boy sequencial · Sol Alto confirmado · `codex/fitness-ui-integration`, base `b11ed9d`. [Integração anterior](R27-C1-WORKSPACE-PROTEGIDO-LEMBRETES.md). **Controles ligados ao código da agenda, ainda ocultos pelo gate de release false. Nenhum aviso foi gravado ou entregue nos dados pessoais.**

## O que foi implementado

`TemporalDayAgenda` integra o mesmo controle nas ocorrências pendentes de Ritual (`task`), Ciclo (`habit`) e compromisso (`commitment`). Ele serve à Semana e aos detalhes de Mês/Calendário que já usam a agenda compartilhada. Não adiciona ações nos registros concluídos ou nas fontes ainda não suportadas (sequência, projeto, jornada, missão, Google). Não muda os links existentes, horários de atividades ou contagens.

`TemporalReminderControl` mantém a implementação pesada em lazy import. Gate fechado: retorna null, sem ler progresso ou carregar o adapter de preparação. Ao ser liberado futuramente, o controle inline abre sob demanda; não cria outro modal dentro do diálogo do dia. `ActivityReminderControl` também confere o gate, inclusive em handlers chamados diretamente. Verificação e formulário de aviso não compartilham campos com o cadastro original da atividade.

Direção de UI: mesma paleta noturna (#101721/#0c111a), ouro #d5b66f, texto #eceae3 e apoio #adb8c8; corpo/tipografia já existentes. Controle discreto abaixo do item, painel inline com título real, dia e horário/ação, explicação de saída para conferência e consentimento separado. Alvos de 48px, campos de 16px, labels, status/alert e foco visível. Sem nova biblioteca ou animação automática. São critérios implementados no CSS/markup, **não aceite visual ou medição em celular**.

Sem aviso existente, horário explícito é obrigatório. Com aviso agendado, usa apenas comandos já contratados: +1 hora, amanhã 9h, amanhã mesmo horário, dispensar. Não configura novamente um aviso já dispensado: essa ocorrência permanece na agenda e o controle explica o estado. Ainda não há comando de reativar/editar livremente o horário existente. Não foi criado contrato novo para contornar essa limitação.

Erros deixam os campos preenchidos; uma nova conferência ou alteração de campo desmarca o consentimento. Tocar duas vezes não inicia outra preparação enquanto a primeira está em curso. Desmontar o controle revoga a geração/callback e impede navegação tardia. O formulário explica que preparar um aviso não conclui nem recompensa uma atividade; a conferência continua sendo uma etapa distinta da gravação.

## Preparação e integridade

`reminder-preparation.ts` recebe contexto de storage/sessão/projeção live existente, sem criar stores ou instanciar Auth. `activity-reminder-adapter.ts` é importado por interação após a hidratação normal; reaproveita `captureProgress` das projeções persist originais. Não há nova inscrição automática de sync ou captura de dados ao renderizar os controles.

Revisão exige gate aberto, documento local já isolado (não documento de conta live), marcador local prévio válido, ausência de vínculo/intenção/resolução de conta e de journal/transportes pendentes. Lê apenas as chaves conhecidas. A projeção carregada deve coincidir com as duas partes persistidas por fingerprint; confirma perfil e ocorrência atual pelos seletores Temporal, incluindo histórico de conclusão. O planner B2A continua sendo a autoridade final para a mutação do aviso.

Preparação copia revisão/draft, requer consentimento e compara novamente a revisão inteira ao progresso carregado/salvo. Só então gera o plano por `planReminderWrite` e grava **transporte temporário da própria aba** por `stageReminderHandoff`. Não chama mutação de domínio, comando de conclusão, restore ou sync no documento hidratado. Retorna URL de conferência apenas após readback exato e nova conferência de atividade/projeção/modo/callback.

Se progresso/modo mudar ou controle for desmontado durante o hash, descarta apenas seu próprio transporte com o cancelamento já existente e não autoriza sair. Se surgiu journal, dados ilegíveis ou alteração que impede essa limpeza comprovada, preserva o plano para conferência explícita. Falha de quota/readback antes de receber o raw confirmado não autoriza limpeza cega: informa erro e conserva os campos. Não apaga plano de outra preparação concorrente.

Novas aplicações continuam restritas ao progresso **previamente local e sem vínculo de conta**; não cria marcador nem desliga sincronização para viabilizar o aviso. Isso mantém o uso online indisponível. O gate permanece `REMINDER_WRITES_RELEASED=false`; nem URL nem storage/env o habilitam. Botões de confirmação de restore/conta mantêm seus gates anteriores.

## Retorno sem perder o contexto de agenda

`reminder-return.ts` carrega só destino de apresentação na URL da conferência (`voltar`). Reutiliza a validação de caminhos Temporal existentes e repassa somente `data`, `dia`, `mes`, `ano`, sem hash, destinos externos, switches de workspace ou query arbitrária. A revisão e os consentimentos continuam no fluxo existente; a URL nunca autoriza escrita. Formato/chave do transporte permanecem inalterados.

`ReminderWorkspace` usa esse destino validado ao descartar/finalizar e no link sem plano, com fallback para `/santuario`. Preserva período/dia selecionado da Semana/Mês/Calendário/Ano. Não promete scroll pixel a pixel, formulário de atividade não salvo ou cadeia completa de `location.state` (por exemplo retorno anterior Mês → Ano) através de navegação de documento; isso exige QA/escopo próprio. Campo de aviso leva seu valor no plano após preparação bem-sucedida e permanece no componente se preparar falha. Retornar após descarte significa preparar de novo, sem gravação do aviso.

## Verificações e custódia

69 direcionados aprovados antes do último caso adicional de journal durante hash (`/tmp/r27-c2-targeted.log`): controles sintéticos, preparação, workspace/retorno e agenda. A primeira preparação isolada passou oito testes (`/tmp/r27-c2-preparation-initial.log`); regressão da agenda e interface anterior passou (`/tmp/r27-c2-compat.log`). Não foram usados dados ou navegador reais.

**Checks finais executados:** 605 testes globais aprovados (38,72s, `/tmp/r27-c2-all.log`), TypeScript (`/tmp/r27-c2-types-final.log`), lint (`/tmp/r27-c2-lint.log`) e Vite `envDir:false` (40,74s, `/tmp/r27-c2-build.log`). O último caso de journal durante hash passou na global final. CSS PostCSS parseado com 17 regras dos controles (`/tmp/r27-c2-css.json`). Avisos anteriores de Browserslist/chunks grandes mantidos, sem alegar desempenho mobile. Nenhum check final falhou.

Baseline `/tmp/r27-c2-before.json`; revisão `/tmp/r27-c2-final-review.json`. Alterações anteriores limitadas aos pontos reservados: agenda, estilos Temporal, destino validado do workspace, harness do workspace, whitelists/frontend-SQL NÃO aplicado e manifests. Novos arquivos: dois controles, três helpers/adapter e dois testes. Demais entradas anteriores idênticas por SHA-256. Versões/links/diff-check conferidos; custódia sequencial e reserva encerradas. Novos testes cobrem três fontes, quatro comandos, release/consentimento, estado live versus persist, conta/modo/perfil/ocorrência alterados, quota/readback, cancelamento, recuperação surgindo durante hash, concorrência de preparação, retorno hostil, inputs preservados e navegação tardia. Hooks/DOM/storage são sintéticos; não comprovam toque, picker de horário, foco real, BFCache, quota física ou recarga entre documentos.

Revisão React sequencial: lazy import do controle e adapter, nenhum novo listener de sync, cleanup de geração, entrada controlada com consentimento desmarcado ao editar, refs de exclusão, apresentação do workspace sem browser global em componente puro. CSS parseado separadamente; gate e grafo isolado de startup precisam continuar passando. Só versionamento nas whitelists frontend/SQL NÃO aplicado; sem alteração de stores/serviços/economia/recorrência, dependências, secrets/.env, dados pessoais, conta/banco remoto, migração/deploy/commit/push ou subagentes. Skill Supabase e índice oficial foram consultados na rodada anterior do mesmo dia; não houve nova API/SDK/esquema neste lote.

## Próxima etapa — aceite real em Sol Médio

Preparação, transporte e conferência estão conectados no código neste recorte. **Avisar o usuário para Sol Médio na próxima rodada**: validação mobile/tablet dos controles e percurso isolado completo com dados temporários (360/390/768px), horário, cancelamento, recarga/interrupção, foco, navegação e outras abas. Não substituir esse aceite por novas repetições Node ou abrir gate por inferência. A inspeção do navegador permaneceu indisponível na última autorização; não foi retentada nem contornada neste lote.

A validação de escrita exigirá ambiente de teste isolado com release substituído somente no harness, preservando o gate do produto. Sem acesso de inspeção aprovado no executor, manter aceite pendente e avançar apenas nas verificações permitidas; não alegar app pronto. Entrega de avisos enquanto aberto, app fechado/push, integração online, reativação de aviso dispensado e expansão para outras fontes continuam separados. Novos contratos desses itens exigem retorno a Sol Alto com aviso prévio.
