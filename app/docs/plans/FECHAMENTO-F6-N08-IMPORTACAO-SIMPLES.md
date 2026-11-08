# F6-N08 — importar o JSON e continuar no app — 0.1.138

07/11/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base67bb6e5, alterações anteriores preservadas. Pedido explícito em voz: remover a burocracia e usar apenas o arquivo com progresso/XP, antes da criação de conta. O encerramento da voz não cancelou esse pedido; somente a fala incidental posterior foi descartada.

## Decisão autorizada e percurso novo

O usuário explicou que havia selecionado a cópia correta, via totais de atividades, mas permanecia impedido pela segunda cópia e confirmações. Autorizou substituir essas exigências manuais por uma importação prática. Essa decisão altera deliberadamente a UX de confirmação anterior: **selecionar o JSON → conferir totais/XP → “Importar e usar neste aparelho”**. O aviso adjacente abrange substituição dos dados de todos os perfis deste destino, fechamento de outras abas e uso local. Não se alega descobrir/provar abas legadas automaticamente; o lease exclusivo continua obrigatório.

No percurso normal não há segundo input de arquivo, checkboxes ou tela intermediária para liberar uso local. Após readback bem-sucedido, abre diretamente o Santuário. A criação/associação da conta acontece depois. Exportar uma cópia extra do destino tornou-se opcional, dentro de detalhes; não condiciona mais a importação. A conferência mostra XP por elemento do arquivo mesmo quando o destino está vazio. A versão da cópia está rotulada como tal, distinta da versão publicada.

**Esta decisão substitui o roteiro manual deN07 no percurso normal. Não voltar a pedir que o usuário baixe e selecione outro JSON para conseguir importar.** Recuperação excepcional de operação antiga/parcial continua disponível; não é o caminho de sucesso.

## Implementação e proteção

`prepareLocalImport` congela seleção/baseline, prepara e confere internamente a segurança da projeção atual e reutiliza `prepareConfirmedRestore`. Nenhuma escrita ocorre no preparo. O JSON original não é modificado.

`runExclusiveRestore` recebeu operação `import-local`. Ela mantém os guards de consentimento, origem, App ainda não iniciado, exclusividade e ausência de resolução/envio de conta pendente; confere a segurança anterior gerada internamente, executa o MESMO journal de before/target e readback. Sob o MESMO lease, revisa o commit e chama `continueRestoreLocally`. O marcador local é durável antes de remover a barreira; só então retorna local-ready. Uma interrupção preserva o journal e não abre App/Auth prematuramente. Não há replay de conclusões, soma de XP, merge de atividades, novo motor/store ativo ou liberação online.

Limite deliberado: a versão anterior fica protegida DURANTE a operação no journal, não como backup permanente após uma substituição concluída. O usuário pode exportar um arquivo extra opcional antes; isso não é obrigatório. A simplificação foi autorizada expressamente, não inferida de um pedido cosmético.

`SimpleImportActions` é o único controle de confirmação do percurso normal. Double tap, resultado tardio, alteração externa, release fechada, auditoria inválida e retorno incompleto do coordenador não navegam. Parent desabilita seleção, download opcional e cancelamento enquanto importa, sem desmontar o controlador durante a operação. Erros são mostrados; falha parcial encaminha para recuperação. Os controles antigos de segurança manual não aparecem na importação normal.

## Testes executados

- Novos testes de protocolo: destinos inicializado/vazio; preparo interno sem escrita; uma única exclusividade até uso local; origem/auditoria/baseline/consentimento inválidos recusados; falha no marcador local conserva commit para recuperação, sem vínculo cloud.
- Novos testes UI: nenhum file picker/checkbox no componente de confirmação; ação única/duplo toque; reset por mudança externa/desmontagem; falha parcial; resultado incompleto não abre App. Regressão de download opcional continua preservando o arquivo de entrada selecionado.
- Suíte completa705 passou (84,82s), antes do último guard de retorno da UI e ajuste de ref para lint. Depois,25 testes direcionados finais passaram (2,01s), incluindo novo caso de retorno incompleto; TypeScript, lint sem avisos e build final8,34s passaram. Não representar a suíte completa como repetida depois desse ajuste. Falha inicial de teste por texto “continua selecionado” foi corrigida preservando essa orientação no download opcional.
- SHA desde início do lote confirma stores, restore-journal e motores preservados. Fontes alteradas: restore-confirmation, exclusive-restore, workspace-preview, RestoreWorkspace, comentário de restore-release e allowlist138; componente SimpleImportActions novo. package/lock alinhados138, candidato SQL138 só local/PGlite, aceitando baselines revisados135–137; banco hospedado permanece135 e escrita online fechada.

## Ensaios de dados e navegador

Cópia real130 anteriormente autorizada foi conferida novamente SOMENTE em memória isolada: novo preparo/ação única retornou local-ready, ambas as projeções iguais ao arquivo, XP de todos os elementos preservado após hidratação, journal encerrado e arquivo original intacto. Nenhum conteúdo/identificador pessoal foi publicado ou injetado no navegador de QA.

Puppeteer instalado do projeto, Chromium headless em perfil novo descartável, emulação390×844, domínio público atualizado: destino inicializado com projeções sintéticas vazias (caso que antes exigia uma segunda cópia); entrada130 sintética com ritual em missão e ciclo concluído. DOM real tinha **um** input de arquivo e **zero** checkboxes/inputs de segurança. Um único clique em Importar e usar neste aparelho abriu Santuário diretamente. Atividade e4XP sintéticos permaneceram após recarga, sem journal pendente ou requisições de Auth/progresso. Perfil e arquivos temporários descartados. Captura inspecionada: botão dourado ativo e nenhum controle de segunda cópia. Não equivale ao Safari/iPhone nem à importação pessoal confirmada.

[Evidência](evidence/importacao-simples-0.1.138/verificacoes.json), [tela simples com dados sintéticos](evidence/importacao-simples-0.1.138/importacao-um-toque.jpg).

## Publicação e retomada

Deployment **dpl_ARSSySgzYScP839SXfBb7GfHJZgH**, READY, mesmo projeto conselho-elemental-testes/fr-prodiction e domínio https://conselho-elemental-testes.vercel.app. URL imutável https://conselho-elemental-testes-e3462cx7d-fr-prodiction.vercel.app. Novo staging510arquivos, fonte/assets/configuração apenas, verificado por SHA; sem .env, sessões, SQL, testes/QA/docs ou backup pessoal. HTML/entry200, entry138 e cache-control no-store/no-cache/must-revalidate conferidos. Sem push, SQL remoto, alteração de gates ou progresso pessoal efetivamente transferido pelo agente.

Próximo imediato: usuário reabrir o app no celular, escolher SOMENTE o JSON correto e tocar Importar e usar neste aparelho; conferir atividades/XP após abertura e recarga. Sem confirmar segurança anterior ou marcar caixas. Se falhar, recolher a mensagem de erro explícita, sem voltar ao roteiro antigo. Depois fechar Auth real/compatibilidade138/associação de conta com o protocolo integral existente em Sol Alto. Não anunciar sync pronto: Authtrue, restoretrue, transferênciacloudfalse/lembretesfalse. Custódia documental revisada sequencialmente, reservas encerradas.
