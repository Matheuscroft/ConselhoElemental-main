# R27-D1 — Aceite mobile/tablet dos lembretes

30/10/2026 · Sol Médio · Astro Boy sequencial · versão 0.1.116, sem alteração de produto. Continuação de [R27-C2](R27-C2-CONTROLES-E-PREPARACAO-LEMBRETES.md). Este documento é roteiro, não laudo de aprovação. A fila operacional continua em FILA-ENTREGAS.

## Estado conferido nesta rodada

CLI Astro Boy confirma versão 0.1.116, branch codex/fitness-ui-integration, base b11ed9d e onboarding já reconhecido. Listener 127.0.0.1:5173 presente (PID 11208). `git diff --check` passou. Inspeção do código confirmou gate false e os pontos de horário/consentimento/retorno; nenhum acesso HTTP, screenshot, toque ou recarga foi executado. Não repetir os 605 testes da rodada anterior como se fossem aceite atual de navegador.

A ferramenta de inspeção foi bloqueada anteriormente por permissão salva. Perguntado nesta rodada se a configuração mudou; não retentar nem usar outro browser, endereço, porta, CDP ou requisição HTTP para contornar a recusa. A aba visível na interface não demonstra acesso permitido ao agente. Nenhuma nova recusa foi produzida nesta rodada; o bloqueio é evidência anterior.

## Pré-condições do ensaio

- Acesso de inspeção aprovado pela ferramenta. Se a configuração mudou, fazer uma tentativa regular e respeitar o resultado.
- Contexto de teste descartável, sem cookies/conta/progresso pessoal. Não usar o storage do usuário para semear exemplos ou aplicar recuperações.
- Release do produto permanece false. O ensaio de escrita precisa de build/harness separado e explicitamente isolado, substituindo o módulo de release só nesse harness, como os testes Node existentes. Não criar parâmetro URL/env/storage que habilite gravação no produto.
- Fixtures mínimas com um Ritual agendado, Ciclo raiz e compromisso; progresso carregado/persistido alinhado. Sessão previamente local, sem vínculo/intenção/resolução de conta. Não fazer login remoto nem incluir secrets.
- Antes/depois comparar os dois stores e confirmar que só metadados esperados do aviso mudaram. Capturas não devem exibir payloads, IDs de conta ou progresso pessoal.

O harness real ainda precisa ser montado e inspecionado quando o acesso estiver disponível. Os testes sintéticos existentes não são um harness de navegador pronto nem comprovam recarga entre documentos.

## Matriz de aceite (todos pendentes)

| Fluxo | Evidência esperada | 360px | 390px | 768px |
| --- | --- | --- | --- | --- |
| Abrir controle em Semana e detalhes de Mês/Calendário | Nome/dia corretos, painel inline, link original operante | Pendente | Pendente | Pendente |
| Escolher horário e confirmar saída | Picker utilizável, consentimento separado, teclado não cobre ação | Pendente | Pendente | Pendente |
| Editar horário após consentimento | Consentimento desmarcado, campo preservado | Pendente | Pendente | Pendente |
| Falha de preparação | Sem saída ou gravação de domínio, input mantido, retry possível | Pendente | Pendente | Pendente |
| Descartar plano no workspace | Só transporte removido; retorno ao dia/período correto | Pendente | Pendente | Pendente |
| Aplicar e retornar | Confirmações separadas, readback, uso local explícito, metadados corretos | Pendente | Pendente | Pendente |
| Adiar e dispensar | Quatro ações existentes; não concluir atividade nem conceder XP | Pendente | Pendente | Pendente |
| Teclado, foco e scroll | Foco visível, sem overflow horizontal/sobreposição da navegação | Pendente | Pendente | Pendente |

Casos funcionais adicionais no contexto descartável: toque duplo; fechar/desmontar controle durante preparação; recarga antes de aplicar; interrupção antes/depois de cada write; perda da sessão com journal mantido; outra aba cooperativa com lease; conta/modo/projeção alterada durante hash; journal estrangeiro; retorno externo rejeitado. Registrar caso, ação, resultado, captura/log e limitação. Não pedir fechamento das abas pessoais para o teste: usar só abas da sessão descartável.

## Critérios de saída

Somente marcar aprovado o caso efetivamente executado. Correções de UX delimitadas podem seguir em Médio após reprodução; mudança de contrato/recuperação/isolamento exige aviso e Sol Alto antes da edição dependente. Sem acesso real, registrar aceite pendente; não substituir por novos bumps, testes Node repetidos ou abrir gate por inferência.

Timer de entrega, app fechado/push, sync online, outras fontes e reativação de aviso dispensado permanecem fora deste aceite. Aprovar o harness não autoriza deploy, push ou uso dos dados pessoais.

## Atualização após resposta do usuário

Usuário informou alteração da configuração, mas persistência do bloqueio. Foi feita uma tentativa regular por `cua.getTab` no iab para `/ciclos`. A ferramenta recusou por permissão salva ou política gerenciada; não concedeu autoridade para observar a origem. Nenhum screenshot, leitura de página, HTTP alternativo ou contorno realizado. Matriz permanece pendente. Evidência é a recusa atual da ferramenta, não novo teste do produto.

## Primeiro caso manual solicitado

Abrir `/temporal/mes?mes=2026-10&dia=2026-10-30`, seguir “Abrir rotina deste dia” e depois “Voltar à agenda selecionada”. Conferir mês/dia, sem concluir ou excluir atividades. Resultado aguardando resposta do usuário. Nenhuma aprovação ainda. É navegação existente, não validação dos controles de lembretes ocultos.

## Resultado manual: retorno para a agenda

Usuário respondeu “Sim, mês e dia foram preservados” ao percurso Mês (outubro/2026, dia 30) → rotina → Voltar à agenda selecionada. Resultado relatado pelo usuário em 30/10/2026; sem inspeção independente, captura ou largura/aparelho informados. Confirma esse caso de navegação existente, sem aprovar a matriz 360/390/768px ou os lembretes ocultos. Próximo caso: recarga no mesmo endereço e conferência do mês/dia. Produto permanece 0.1.116, sem edição de código, dados ou gates.

## Resultado manual: recarga e ambiente informado

Em 30/10/2026 o usuário confirmou que outubro/2026 e o dia 30 permaneceram selecionados após recarregar a agenda. Informou que o teste foi realizado no navegador lateral do Codex, no computador. Assim, há dois casos manuais relatados nesse ambiente: retorno rotina → agenda e recarga da agenda. Sem inspeção independente do agente ou largura de viewport informada. Não aprova celular/tablet, persistência de atividades, gravação de avisos ou recuperação entre documentos.

Próximo aceite: em celular/tablet, repetir navegação/recarga e conferir toque, teclado, overflow e navegação inferior; gravação dos lembretes continua dependente de harness descartável e acesso permitido. Não pedir conclusões/exclusões no perfil pessoal. Sol Médio adequado; versão 0.1.116 e gates mantidos.

## Harness compilado — ainda não executado no navegador

Em 30/10/2026 foram criados `scripts/build-reminder-qa.mjs` e `tests/fixtures/reminder-qa.tsx`. `node scripts/build-reminder-qa.mjs --help` e build final passaram; lint e diff-check passaram. Logs `/tmp/r27-d1-qa-build-final.log` e `/tmp/r27-d1-qa-lint.log`. Build em `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-s2hwdl`, com HTML/JS/CSS e `qa-build.json`. Não iniciou servidor, navegador ou chamada à origem bloqueada. Produto 0.1.116 mantido: alteração de ferramentas de QA, sem nova funcionalidade distribuída, gate ou dependência.

O script gera um Ritual com ID sintético usando a fixture existente em memória no Node, inclui só as duas projeções de persistência e compila as interfaces/coordenadores existentes. O release é substituído só nesse bundle. O adapter é substituído por projeção da própria fixture; stores, Auth, sync e bootstrap reais são rejeitados por inspeção do metafile. A primeira verificação foi ampla demais e recusou `leveling-calculator.ts`: inspecionado e permitido exclusivamente esse calculador puro. Nenhum serviço de I/O foi liberado; a checagem de stores/Auth permanece.

No runtime do harness, as chaves de domínio apontam a um Map de fixture. Só uma chave real de sessionStorage, `conselho-elemental-disposable-reminder-qa-v1`, guarda essa fixture para recarga. Não lê localStorage real nem progresso pessoal. Não apagar outras chaves, copiar dados pessoais ou usar o harness na origem do app principal. Outra aba tem sua própria cópia; isso NÃO valida progresso compartilhado entre abas.

Limites: apenas Ritual na fixture inicial; contexto local e projeção live simulados. Não comprova hidratação real, troca de conta, tabs compartilhadas ou sync. Fontes do tema global não foram carregadas; não é prova de fidelidade visual integral. O artefato ainda precisa ser servido em contexto descartável e observado após resolver acesso permitido. Nenhum servidor/endereço alternativo foi usado para contornar o bloqueio. Não confundir build compilado com percurso browser aprovado. A matriz permanece pendente.

## Próximo caso manual solicitado — Ciclos em painel estreito

Em 30/10/2026, solicitado estreitar o painel do navegador no computador, abrir Novo ciclo, focar nome e cancelar sem criar. Conferir enquadramento, acesso aos botões e retorno sem mudança de atividades. Resultado aguardando resposta. Registrar como desktop estreito, sem largura confirmada; não equivale a celular real/teclado virtual. Código inspecionado confirma separação entre submit e botão Cancelar; comportamento visual não observado pelo agente. Sem alteração de produto ou novos testes globais.

## Resposta sobre Ciclos em painel estreito

Usuário relatou formulário acessível e cancelamento funcionando; solicitou melhorar calendário. Caso manual de criação/cancelamento confirmado apenas no computador estreito, sem largura informada. Pedido visual tratado separadamente em CICLOS-CALENDARIO-UX-2026-10-30.md; não aprova lembretes ou matriz mobile.

## R27-D1 — fixture disponível para aceite manual (30/10/2026)

Sol Médio; produto 0.1.118 mantido. Harness recompilado com dados sintéticos em `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-0BjJZF` e servidor temporário loopback iniciado para abertura manual pelo usuário: `http://127.0.0.1:50845/` (PID 24453; sessão exec 30738). Build `/tmp/reminder-qa-manual-build.json`; servidor `/tmp/serve-conselho-reminder-qa.mjs`, estado `/tmp/reminder-qa-manual-server.json`. Não serve checkout/progresso real; só HTML/JS/CSS explicitamente permitidos e fallback das rotas da fixture. CSP bloqueia connect-src e framing, sem I/O remoto. Sem request HTTP, screenshot ou inspeção da página pelo agente; não é nova instância do app bloqueado nem contorno da recusa de inspeção. Alternativa é observação manual pelo usuário de fixture sintética independente.

Solicitado ao usuário confirmar abertura de “Ensaio descartável de avisos” e percurso Aviso da atividade → horário/consentimento → Continuar para conferência. **Resposta pendente**, sem renderização ou fluxo aprovados. Progresso QA só Map e chave QA de sessionStorage, sem localStorage real; gates do produto preservados. Limites do harness continuam: projeção live simulada, um Ritual, sem prova de tabs compartilhadas/hidratação real/fidelidade total. Próximo em Sol Médio: analisar resposta e depois testar aplicação/continuação local somente nessa fixture. Sem alteração de código de produto, secrets, deploy/push ou subagentes.


## R27-D1 — runtime JSX do harness corrigido (30/10/2026)

Usuário relatou que a página QA não abriu. Listener anterior confirmado, mas inspeção do JS compilado encontrou React.createElement na entrada sem binding React: falha de compilação do harness, potencial causa de tela branca; erro real da página ainda não observado. Script passou a usar jsx automatic e exigir react/jsx-runtime.js no metafile, mantendo proteção contra stores/Auth e gate do produto false. Build e eslint direcionado passaram; servidor reiniciado no mesmo endereço http://127.0.0.1:50845/ com PID 24630 (exec 34530). Artefato atual `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-Qgb3vM`. Sem HTTP/screenshot/inspeção de página pelo agente.

Solicitado recarregar e informar tela ou mensagem exata. Resultado pendente; não declarar renderização validada. Produto continua 0.1.118, sem alteração de src/dados/gates ou novo servidor do app. Mudança apenas da ferramenta de QA. Sem secrets, deploy/push ou contorno da recusa de inspeção. Sol Médio adequado.


**Aceite manual parcial do harness (30/10/2026):** após correção do JSX, usuário confirmou que a página “Ensaio descartável de avisos” apareceu. É confirmação manual de abertura no computador, sem observação independente do agente. Próximo caso solicitado: horário 09:00 → consentimento → Continuar → Atualizar conferência → verificar Ritual QA → Descartar → retornar ao ensaio. Resultado pendente, sem gravação de aviso solicitada. Produto/gates/progresso pessoal preservados.

**Aceite manual parcial — descarte (30/10/2026):** usuário confirmou preparação → conferência → descarte → retorno ao ensaio sem erro. Só fixture sintética e relato manual no computador; sem inspeção do agente. Próximo solicitado: configurar 09:00 novamente, conferir, confirmar Salvar aviso, confirmar separadamente Continuar somente local e Voltar ao app. Fechar somente outras abas QA se existentes, sem fechar app pessoal (origem/progresso distintos). Resultado da gravação aguardando resposta. Produto 0.1.118/gates false, sem alteração de código ou dados pessoais.

**Aceite manual parcial — gravação (30/10/2026):** usuário confirmou Salvar aviso → Continuar somente local → Voltar ao app sem erro, exclusivamente na fixture QA. Confirma percurso relatado, sem observação independente de payload, invariantes ou disco. Próximo solicitado: recarregar QA e abrir Aviso da atividade para conferir “Aviso atual” 09:00 e opções de adiar/dispensar. Resultado de persistência após recarga pendente. Não habilitar release do produto por esse relato; mobile, interrupção/recuperação e concorrência real seguem pendentes. Sem novo código/bump; produto 0.1.118 preservado.

**Captura fornecida pelo usuário — persistência parcial (30/10/2026):** imagem Captura de Tela 2026-10-30 às 16.21.17 mostra a QA, Ritual QA/atividade em 30/10/2026, “Aviso atual: 31/10/2026, 09:00:00” e quatro opções de adiar/dispensar. Confirma visualmente que existe aviso carregado, mas não confirma a data originalmente esperada 30/10 às 09:00. Perguntado se houve adiamento antes da captura; resposta pendente. Não inferir bug/timezone nem aprovar igualdade da data. Captura fornecida voluntariamente é evidência visual, não inspeção de página pela ferramenta; sem acesso ao storage, alteração de dados/código/gates ou novo teste executado.

**Esclarecimento do adiamento (30/10/2026):** usuário confirmou que aplicou um adiamento antes da captura. Aviso carregado em 31/10 às 09:00 é coerente com essa ação; não tratar a diferença da data da atividade (30/10) como bug de timezone. Evidência combinada: relato de recarga, captura mostrando aviso existente/ações e confirmação do adiamento. Aceite parcial de persistência do estado adiado no harness, não teste controlado da data inicial nem entrega de notificação. Próximo caso solicitado: dispensar aviso na QA, confirmar fluxo, recarregar e conferir mensagem de dispensado com Ritual QA preservado. Resultado pendente; sem alteração de produto/dados pessoais/gates.

## Encerramento deste percurso manual no computador

Usuário confirmou “Sim, aviso dispensado e Ritual QA preservado” após dispensar, gravar, continuar local, retornar e recarregar a fixture. Em conjunto com os relatos anteriores, o percurso básico de preparar/descarte/gravação/retorno/estado adiado/dispensa foi confirmado manualmente na QA. Sem observação independente de storage ou entrega de notificações pelo agente. Captura anterior documenta aviso carregado e suas opções; usuário esclareceu que havia aplicado adiamento.

Aceite parcial limitado ao harness no computador, não liberação de produção. Permanecem pendentes: 360/390/768px e aparelho real, interrupção/recuperação, comportamento entre abas, integração com stores/hidratação reais e modo online. Progresso QA exclusivo da aba não comprova concorrência compartilhada. Produto continua 0.1.118; REMINDER_WRITES_RELEASED permanece false. Sem novos testes globais, mutação de dados pessoais ou publicação nesta rodada.

## R27-D2 — falha controlada da fixture preparada (30/10/2026)

Sol Médio, Astro Boy sequencial; versão de produto 0.1.118 mantida. Ferramentas QA: qa-storage.mjs extraído da fixture, teste qa-storage.test.mjs e controles de reiniciar/armar interrupção em reminder-qa.tsx. Falha uma única vez após persistir core no envelope QA; mantém journal e desarma antes de lançar para permitir recuperação. Reset apaga exclusivamente a chave QA; nenhuma leitura/escrita do localStorage real. Três testes direcionados, lint dos arquivos e compilação do harness passaram (`/tmp/qa-interruption-tests.log`, `/tmp/qa-interruption-lint.log`, `/tmp/reminder-qa-manual-build.json`). Nenhuma nova global do app executada.

Artefato `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-AnsqOa`; servidor da fixture reiniciado em http://127.0.0.1:50845/ (PID 25666, exec 93694). Sem inspeção/HTTP/screenshot pelo agente. Gate do produto false; somente release do bundle sintético substituído. Sem src/stores/contratos/dados pessoais/secrets/remoto/deploy/push alterados. Não é simulação de fechamento real do processo nem prova de disco/concorrência compartilhada: erro JS controlado depois de um write da fixture.

Solicitado ao usuário: Reiniciar dados QA → armar interrupção → preparar 09:00 → salvar → erro simulado → recarregar → Atualizar conferência → conferir Recuperar progresso anterior. **Resposta pendente**; não declarar recovery aprovada. Não reiniciar dados durante recuperação. Próximo em Sol Médio: validar revisão/rollback manual depois do relato. Reserva encerrada após revisão documental/diff-check.


**Aceite manual D2 parcial (30/10/2026):** usuário confirmou interrupção simulada e exibição da recuperação após recarga/conferência. Próximo solicitado: confirmar Recuperar progresso anterior → descartar plano → retornar → abrir controle e verificar formulário inicial sem aviso atual, mantendo Ritual QA. Rollback ainda não aprovado; resultado aguardando relato. Não reiniciar fixture durante esse percurso. Sem alteração de produto/gates/dados pessoais ou nova execução de testes.

## Resultado D2 — rollback confirmado pelo usuário

Usuário respondeu “Sim, recuperou e voltou ao formulário inicial com o ritual preservado”. Confirma manualmente a recuperação após falha JS depois do write de core, com descarte do plano e ausência de aviso atual na UI da fixture. Não comprova todos os limites de escrita nem fechamento real do navegador/igualdade de todos os bytes. Aceite limitado à QA no computador; gate do produto false, versão 0.1.118 mantida. Próximo: mobile/tablet em Médio; integração real/ativação em lote separado de Alto.
