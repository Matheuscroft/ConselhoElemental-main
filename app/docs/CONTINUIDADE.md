## M11 — núcleo de céu e cidade entregue, cena pendente (08/11/2026)

[Plano, conceitos e lotes](plans/MOBILE-M11-DESPERTAR-CINEMATICO.md). Base 65161c8/0.1.144. Fábio aprovou santuário ancestral com os quatro elementos, cena interativa de 20–30s, cidade escolhida à mão entre Olinda e Recife, sol e lua em lados opostos, pular sempre visível, introdução só no primeiro acesso e botão de rever nas configurações. Plano de ação A–H registrado, com o modelo indicado por lote.

Direção de arte: conceito B vetorial recusado em duas rodadas; conceito C aprovado, composto com ffmpeg sobre o conceito A (lua reposicionada, sol criado no horizonte oposto, ar realçado, grade e vinheta), script reprodutível junto. Geração nova no Higgsfield segue bloqueada no plano gratuito; links de upgrade repassados, nada comprado. Lote B produziu as camadas de produção: placa-base sem Sol e sem Lua, sprite da Lua, Sol procedural e manifesto, 63,8 KB num aparelho 2x.

Lote C entregue em código: `sanctuary-city.ts` com Recife e Olinda como preferência local em localStorage, fora do appStore, sem inferir de IP ou conta; `sanctuary-sky.ts` com altitude, azimute, horizonte, fase lunar, estação pelo hemisfério e luz do momento, reaproveitando getSeason e astronomy-engine, sem novo calendário e sem alimentar regra de jogo; `sanctuaryAnchor` converte para as frações da cena, e o Sol calculado às 17h15 em Recife cai em x=0,831 contra 0,835 da arte. 760 testes passam (9 novos), lint limpo, tipos e build concluídos. Sem push e sem publicação.

Protótipo de coreografia em Remotion 4.0.541 vive em `prototipos/despertar-video/`, fora de `app/` porque o `eslint .` varreria a pasta e quebraria o CI; não entra no Git. MP4 de referência de 28s exportado, mais a versão de 6s para movimento reduzido. Vinte skills instaladas em `.agents/skills/`, também fora do Git, documentadas em [SKILLS-INSTALADAS.md](SKILLS-INSTALADAS.md); seis dependem da CLI belt, cuja instalação foi bloqueada por vir de instrução externa. Música da introdução segue pendente de arquivo ou licença; a skill `soundtrack` é a saída sem licença. Destino confirmado por Fábio: https://conselho-elemental-main.vercel.app/auth, HTTP 200.

Limites: a arte é composição sobre o conceito A, não geração nova, e o personagem ainda é o encapuzado sem rosto, não o mago barbudo da referência. Nada foi integrado à entrada do app nem publicado. Próximo: lote D, a cena 2.5D com parallax, toque em qualquer ordem, pular e movimento reduzido; conta/e-mail hospedados continuam pendentes de aceite em M10.

## M10 — introdução e acesso mobile publicados — 0.1.144 (07/11/2026)

[Entrega, verificações e limites](plans/MOBILE-M10-INTRODUCAO-E-ACESSO.md). Boas-vindas só na raiz sem projeções, depois dos guards; quem já tem progresso mantém o caminho. /auth e aliases abrem a conta integral; login/cadastro/recuperação com identidade elemental, senha visível por escolha, campos16px e ações≥44px. Introdução dos elementos/áreas usa comandos existentes; sem authStore legado obrigatório no modo local. Configuração de tema PWA alinhada, ícone/identidade preservados.751testes/lint/tipos/build passaram; browser sintético360/390/768 com Auth simulado e jornada com XP preservada. Sem conta/e-mail/pessoal reais ou iPhone físico. Compatibilidade144 aplicada/hash a7d8b1f1..., gatetrue e0contas preservados, advisors inalterados. Commit1decdaf → CI42436358696 success (751testes, lint/build) → Vercel9PcQ2QnVASCnnaubX8vD2KLrpAyv success; metadados144/HTTP200 conferidos. Chromium PÚBLICO repetiu percurso/medidas/XP sintético preservado com Auth interceptado; IAB abriu/auth novo, sem digitar credenciais. Sem logs administrativos Vercel; não equivale a e-mail/conta pessoal hospedados nem iPhone. Revisão documental sequencial concluída, reservas encerradas. Próximo: aceite de e-mail/redirects e conexão pessoal, depois segundo aparelho. Histórico abaixo.

## M08–M09 — rituais corrigidos e Git → Vercel verificado — 0.1.143 (07/11/2026)

[Entrega, diagnóstico e instruções para Matheus](plans/MOBILE-M08-M09-RITUAIS-E-PUBLICACAO.md). Rituais/subitens alinham elemento à área primária; criação rápida tem quatro escolhas, filtro inclui sem área, Invocar não usa área global de Terra para outro elemento. Recibos/XP/fórmulas preservados; atividades existentes corrigidas por edição explícita, sem migração automática. Cronômetro refinado, Terra estável, efeitos suaves/pausáveis/reduced motion; runtime/tipos SHA idênticos ao baseline M08.746testes/tipos/lint/build locais passaram. Primeiro CI detectou lint Linux; corrigido sem desativar regra. Segundo CI42431957928 passou instalação limpa/746testes/lint/build. Build com guard hospedado/configuração pública também passou.

Publicação Git automática comprovada: origin/main `ba6df2e0030410af3ca678f19a8b592a310d52a6` → Vercel de Matheus, deployment BoXyoE8iZfcSzqJGRhMgvzP2EN3y/success. **https://conselho-elemental-main.vercel.app** serve metadados143/HTTP200. Chromium público sintético conferiu criação dos quatro elementos, Invocar Água, recarga/layout360/390/768; zero erro/Auth/RPC. Timer integrado local conferiu efeitos, pausa, segundo plano e atualização com sessão; não iPhone físico. IAB recarregado de/auth redirecionou ao Santuário atualizado; nenhum dado pessoal importado.

Compatibilidade143 aplicada/readback35514778..., gatetrue e0contas preservados. Build usa somente URL/chave publicável existente, com override por env e flags legadosfalse; nenhum secret gerado/lido. Workflow/verify:release/publish:main documentados, sem staging/commit ou SQL automático. Novo repositório privado criado por pedido intermediário ficou vazio e não é o destino vigente; ligação temporária no Vercel anterior revertida. Progresso NÃO acompanha mudança de domínio: exportar do app/aparelho mais recente e importar explicitamente no novo link. Conta real/SMTP/redirects novos seguem sem aceite hospedado. Revisão documental sequencial concluída, reservas encerradas. Próximo: importação pessoal no novo domínio e conta/retornos/e-mail em Sol Alto; UX mobile em Sol Médio. Histórico abaixo.

## M07 — cronômetro e atualização mobile publicados — 0.1.142 (07/11/2026)

[Entrega, limites, evidências e plano mobile](plans/MOBILE-M07-CRONOMETRO-E-ATUALIZACOES.md). Fábio definiu o celular como ambiente principal e autorizou publicar melhorias verificadas no mesmo Vercel; instrução registrada no AGENTS.md, sem CI automático ou push implícito. Cronômetro usa intervalo decorrido, preserva pausa/retomada/parada e recuperação operacional por aba/perfil, sem alterar fórmulas/recompensas. Faixa de retorno mantém sessão; quatro efeitos elementais com toque, pausa independente e movimento reduzido. Aviso de nova versão aplica por escolha explícita; headers SPA/metadados revalidam, sem apagar progresso ou recarregar formulários silenciosamente. Menu com atalhos cotidianos e descrições.

742testes completos finais, tipos/build/lint/diff-check passaram. Chromium público sintético conferiu aba em segundo plano, recarga/pausa, atualização com sessão em andamento, quatro efeitos/reduced motion,360/390/768px e menu; zero erro/Auth/RPC. Não equivale ao bloqueio físico do iPhone ou envio pessoal à conta. Compatibilidade142 aplicada, gate true/dados/grants preservados, hashbf63b646..., banco0contas integrais/2Auth/5tarefas/34hábitos legados no readback. Publicação final READY dpl_JD3uEgJd5c9ifvYMo7pi6cK6qGhy, versão142/HTTP/cache conferidos,525fontes por SHA. Sem dados pessoais no upload/push; contas/e-mailN10 seguem pendentes. Revisão documental sequencial/reservas encerradas. Próximo: primeiro reload no telefone e aceite de um minuto bloqueado; rotina/criação para iniciantes em Sol Médio, conta/contratos em Sol Alto. Histórico abaixo.

## F6-N12 — painel Sua evolução corrigido e publicado — 0.1.141 (07/11/2026)

[Diagnóstico, correção e evidências](plans/FECHAMENTO-F6-N12-PAINEL-EVOLUCAO.md). Captura identificou outro painel, não validado no ensaio anterior de XP. Reproduzidos exatamente102/11/0/1=114: ScoreHierarchyPanel ignorava VALUABLE aceito pelo core. Agora aceita as duas grafias, mantendo fórmulas/stores/IDs/saldos; conclusões existentes aparecem sem remarcação/importação. Não concedido XP retroativo.

733testes completos, tipos/build/lint/diff-check passaram. App público141 em Chromium descartável390×844: conclusão UI aparece no painel2Água/5Ar, persiste após recarga, feedback/XP/Grimório corretos, zero erro/chamada Supabase. Não é teste físico/pessoal. Compatibilidade aditiva141 aplicada/hash1e6fb1d6..., gate true e dados/grants preservados. Publicação READY dpl_dzJamDCGD2tv6xsnbtESsB4tUkHc no mesmo Vercel; entry141/HTTP200 e518fontes por SHA conferidos. Sem dados pessoais no upload, push ou alteração de Auth/SMTP. Revisão documental sequencial/reservas encerradas. Próximo: recarregar no telefone e conferir; conta/e-mail real seguemN10 em Sol Alto. Histórico abaixo.

## F6-N10 — conta conectada publicada; e-mail aberto ainda pendente — 0.1.140 (07/11/2026)

[Entrega, evidências e retomada](plans/FECHAMENTO-F6-N10-CONTA-CONECTADA.md). Importação no celular aceita pelo usuário. Minha conta/conexão em uma ação/salvamento integral e recuperação preservam XP/IDs/Fitness; configuração pública de build Vercel corrigida. Compatibilidade140 aplicada e gate remoto true após validação, mantendo contas e dados legados. Publicação final READY dpl_99BnsuDSywCwPFg2DrfG9z6u6b4n no mesmo domínio, versão140/HTTP/cache conferidos. Nenhum progresso pessoal enviado pelo agente; sem push.

727 testes completos passaram antes do último ajuste somente CSS; tipos/build finais, lint e medições360/390/768px passaram nos escopos registrados. SDK com Auth sintética + SQL PGlite conferiu salvar/editar/recarregar/receber em segundo contexto. Não equivale a Auth/e-mail/transferência pessoal hospedados ou iPhone físico. SMTP custom desativado com confirmação exigida: cadastro/login de Matheus existem, mas beta para qualquer e-mail ainda exige provedor. Sem Gmail obrigatório: remetente individual verificado pode servir ao teste, sem custos/plano confirmados.

Água/Ar: cópia antiga isolada e UI pública sintética creditam2/5XP e pontuação corretamente, persistindo após recarga; nove testes direcionados passaram. Não reproduzida perda no telefone, nenhum saldo/fórmula alterado. Áudio novo indisponível no caminho anexado, não ouvido/transcrito. Revisão documental sequencial e reservasN10 encerradas. Próximo Sol Alto: obter áudio, fechar entrega de e-mails e aceite de conta/associação no celular com progresso, depois segundo aparelho. Manter autorização12h/aba, sync durante uso e conflitos explícitos; não prometer salvamento com app fechado. Histórico abaixo.

## F6-N09 — quota corrigida e retomada publicada — 0.1.139 (07/11/2026)

[Diagnóstico, implementação e evidências](plans/FECHAMENTO-F6-N09-QUOTA-IMPORTACAO.md). QuotaExceeded reproduzido com cópia correta: journal duplicado + stores excediam5MiB. Compactado só artefato de recuperação, com SHA/leitura limitada/compatibilidade JSON antiga. Nova importação simples preservada; **Concluir importação** retoma journal legado interrompido com uma ação, sob o mesmo lease/readback e marcador local. Sem segundo arquivo, limpeza, replay de XP, novo store, mudança de gates ou SQL remoto.

716testes completosMJS, tipos/lint/build passaram. Arquivo pessoal130 conferido somente em memória: falha antiga reproduzida, importação nova e retomada mantêm projeções/XP e arquivo original intacto; pico novo2,70MB. Chromium390×844 público com limite5MiB simulado: ambos percursos abriram Santuário e preservaram35notas/4XP sintéticos após reload, zero erro/Auth/RPC. Não equivale a Safari/iPhone. Publicado READY dpl_3EACSrNL5zvLQDz1svUvKFa8iJ3E no domínio fixo, entry139/HTTP200/cache conferidos;512arquivos por SHA sem dados pessoais. Stores/motores/assets preservados desde início deste lote. Sem push; candidato139 só local, banco135 conforme últimoN03.

Próximo: reabrir versão139 no mesmo aparelho; Concluir importação se pendente, senão escolher JSON correto e Importar e usar neste aparelho. Não repetirN07 nem limpar/reinstalar. Aceite pessoal no iPhone pendente; depois conta/sync em Sol Alto, com transferência ainda fechada. Revisão documental sequencial concluída, reservas encerradas. Histórico abaixo.

## F6-N08 — importação simples publicada — 0.1.138 (07/11/2026)

[Decisão e evidências](plans/FECHAMENTO-F6-N08-IMPORTACAO-SIMPLES.md). Usuário autorizou em voz remover a segunda cópia e confirmações manuais. Percurso normal agora é escolher JSON, conferir totais/XP e tocar **Importar e usar neste aparelho**; abre Santuário diretamente. Segurança anterior preparada/conferida internamente; mesmo journal/lease/readback e continuação local sob uma exclusividade. Recuperação em falha preservada. Backup extra opcional; não é arquivo permanente automático após sucesso. Não repetir o roteiroN07 de segundo JSON/checklists no percurso normal.

705testes completos passaram antes do último guard UI;25 direcionados finais, tipos/lint/build passaram depois. Cópia real130 em memória conferiu estados e XP, arquivo intacto. Navegador Chromium headless390×844 com fixture130:1input,0checkboxes/segurança manual,1clique → Santuário; atividade/4XP preservados após recarga, sem Auth/RPC. Não equivale a aceite do iPhone. Publicado READY dpl_ARSSySgzYScP839SXfBb7GfHJZgH no domínio fixo; HTML/entry200 e138 conferidos. Fonte/stores/motores preservados, sem dados pessoais no upload/SQL remoto/push; candidato138 só local, banco135.

Próximo: usuário reabrir app do celular, selecionar o arquivo certo e importar com a única confirmação. Se houver falha, pedir mensagem explícita, sem voltar à cópia anterior manual. Importação pessoal/conta/sync ainda a confirmar; manter Sol Alto para associação depois. Custódia sequencial concluída, reservas encerradas. Histórico abaixo.

## F6-N07 — botão de restauração com motivo explícito — 0.1.137 (07/11/2026)

[Entrega e evidência](plans/FECHAMENTO-F6-N07-REQUISITOS-RESTAURACAO.md). Usuário afirmou que já conferiu a segurança anterior e marcou os dois consentimentos; causa específica no iPhone NÃO confirmada. UI agora lista cada condição que ainda bloqueia o botão e confirma quando está pronto. Mesmos guards/ready/journal/readback, nenhum bypass. Textos distinguem progresso de origem da segurança a baixar/conferir no próprio destino.

699testes completos, tipos/lint/build passaram. Ensaio Chromium headless390×844 com perfil/arquivos sintéticos: bloqueado sem segurança mesmo com checkboxes; habilitado após conferência; restauração → recarga → continuar local → Santuário; atividade/4XP preservados em outra recarga, sem Auth/RPC. Não equivale ao iPhone/progresso pessoal. Publicado READY dpl_GWu8NzntTZHWCPQJnZH2B2USZnxq no domínio fixo; HTML/entry200 e versão137 conferidos. Sem dados pessoais/SQL remoto/gates/push; candidato137 só local, banco135.

Próximo: usuário recarregar no celular e ler a lista junto ao botão; se persistir, pedir texto/captura desse bloco. Não repetir a pergunta sobre os dois consentimentos já respondida nem assumir segurança faltante. Aceite pessoal e sync ainda pendentes. Custódia sequencial concluída, reservas encerradas. Histórico abaixo.

## F6-N06 — arquivo correto identificado;136 republicada sem cache (07/11/2026)

[Diagnóstico e publicação](plans/FECHAMENTO-F6-N06-REPUBLICACAO.md). Novo JSON zerado era a segurança do destino Vercel; cópia local original segue não vazia. Usuário confirmou arquivo errado e já tem o correto. Nenhum arquivo pessoal alterado/importado automaticamente. Pedido atual autorizou build forçado no mesmo projeto/domínio.

Staging antigo incompleto detectado; uma falha de encadeamento iniciou tentativa incidental, que terminou ERROR (dpl_HRLkqCqRDpMKfz11pE5zNGbtcSe5). Rotina corrigida reconstruiu509arquivos por SHA e só então executou --force. Publicação válida READY **dpl_5JhuMc8JBJouBGUmPmpJkFKVek6Z**, domínio fixo preservado; log confirma build sem cache. HTML/entry200, entry136 e cache-control no-store/no-cache/must-revalidate conferidos. Sem fonte/gates/versão/banco/push alterados ou testes locais repetidos; build remoto passou. Custódia sequencial e reservas encerradas.

Próximo: usuário fechar completamente/reabrir app no celular (ou recarregar navegador), escolher arquivo correto e conferir atividades/XP antes de restaurar. Não limpar dados/reinstalar. Versão130 nos detalhes do JSON é da cópia, não do site136. Aceite no telefone e sync integral continuam pendentes conformeN05. Histórico abaixo.

## F6-N05 — importação real corrigida e acesso Auth publicado — 0.1.136 (07/11/2026)

[Entrega, publicação e limites](plans/FECHAMENTO-F6-N05-ACESSO-E-IMPORTACAO.md). Cópia pessoal exportada130 tinha14 conflitos de projeções: raízes canônicas null vs vínculos nativos planos/aninhados de jornadas/missões, reproduzidos com as APIs da store. Auditor compara pai efetivo só com ambas as representações concordantes; ambiguidades/pais explícitos errados continuam bloqueados. Arquivo intacto; restauração isolada em memória confirmou estados e XP/histórico. Constância atual recalcula no carregamento pela regra existente; não alegar igualdade integral do usuário. Conteúdo pessoal fora do Git/deploy.

Auth isolado agora tem gate próprio true para cadastro/login/recovery; transferência/início/vínculo/syncfalse, restoretrue/lembretesfalse. Banco não alterado, limite hospedado135; candidato136 só local/PGlite. 697testes completos passaram;34 direcionados repetidos após último ajuste de visibilidade, tipos/lint/build passaram. Publicado READY dpl_Dhxu8RiV7W8acbnqTPcKbJzGtUBB no mesmo domínio Vercel; HTML/entry200 e versão136 confirmados. Navegador conferiu importação e alternância de cadastro sem submit/arquivo pessoal. Sem Auth real, importação no telefone ou push.

Próximo imediato: usuário gerar nova cópia LOCAL para incluir registros após06/11 e importar no MESMO app/navegador do celular, conferir XP/atividades e recarga. Correção de compatibilidade não significa que os dados já chegaram ao telefone. Depois Sol Alto para aceite Auth real, compatibilidade136 e associação/sync com identidade/recibo/readback existentes. Documento atualizado, custódia sequencial concluída e reservas encerradas. Histórico abaixo.

## F6-N04 — retornos de Auth salvos e conferidos após recarga (07/11/2026)

[Configuração e evidências](plans/FECHAMENTO-F6-N04-URLS-AUTH.md). Usuário aprovou explicitamente “Sim, salvar esses endereços”. Na retomada, os cinco redirects já apareciam na lista; agente salvou Site URL no domínio fixo do Vercel. Após reload, campo exato e cinco retornos (conta/recuperar no Vercel e127.0.0.1:5173, maislocalhost:3000 preservado) permaneceram. Sem wildcard; captura e readback AX registrados, proposta original preservada. Não se atribui ao agente o clique Save URLs, não observado nesta conclusão.

Sem alteração de código/versão/manifests/SQL, deploy, push, criação de conta, e-mail real ou transferência pessoal. Gates locais reconferidos: contafalse/restoretrue/lembretesfalse; gate remoto não alterado, última leitura false emN03. Os15testes SDK da proposta não foram repetidos nem convertidos em aceite hospedado. App135local/Vercel134. Custódia documental sequencial concluída, reservas encerradas.

Próximo F6-N05 em **Sol Alto**: preparar aceite Auth real separado da escrita de progresso, usando helpers/UI existentes. O gate atual também bloqueia cadastro/login/recovery; URLs corretas não liberam esses fluxos. Validar acesso antes de abrir sync/associar cópia pessoal, com credenciais digitadas pelo usuário e sem envio automático. Importação real no iPhone continua sem confirmação. Histórico abaixo.

## F6-N03 — compatibilidade135 instalada; próxima verificação é Auth (07/11/2026)

[Instalação e evidências](plans/FECHAMENTO-F6-N03-COMPATIBILIDADE-INSTALADA.md). Continuação do usuário à pergunta específica executada só no pacote122→135, SHA d9f1704c... Preflight repetido passou; apply_migration success:true. Histórico real20261107042615_account_archive_version_135, arquivo/loader alinhados sem alterar bytes (origem20261107030703). Validador-alvo16bbb83d... confirmado, gatefalse;9outros corpos/permissões preservados,3tabelas privadas comRLS/sem acesso direto,10gatilhos ativos. Dois envelopes sintéticos120/135 aceitos pelo validador puro hospedado, SHA idênticos; sem gravar arquivos ou criar contas.

13testes locais direcionados após alinhamento passaram (10,65s); diff-check passou. Advisors sem novos avisos, detalhes no relatório. Sem secrets, dados pessoais, transferência, push/deploy ou nova execução de suíte global/build. Produto135local/Vercel134, contafalse/restoretrue/lembretesfalse.

Próximo Sol Alto: conferir Site URL/Redirect URLs no painel administrativo; conector sem esse recurso e navegador interno pede login. Usuário recebeu handoff para entrar, sem informar credenciais no chat. Não alterar URLs por suposição. Depois aceite Auth real e decisão separada de escrita/sync/associação pessoal. Custódia registrada; reserva SQL encerrada, Auth aguardando acesso ao painel. Histórico abaixo.

## F6-N02 — conexão retomada; compatibilidade135 pronta para aprovação (07/11/2026)

[Pacote revisado e autorização pendente](plans/FECHAMENTO-F6-N02-COMPATIBILIDADE-HOSPEDADA.md). Auth/Data API responderam; leitura SQL voltou após mensagem de hibernação. Reconferidos baseline122 (hash a1673918...), gate=false,10rotinas/grants,3tabelas privadas comRLS/sem acesso direto,10gatilhos ativos. Auth permite cadastro/e-mail com confirmação; chamada anônima de RPC foi negada401/42501. Preflight do pacote passou no banco real em transação READ ONLY/ROLLBACK. Nenhum dado pessoal/secret lido, conta criada, arquivo enviado ou configuração alterada.

Candidato135 consolidado para passagem direta122→135, somente validador; outros protocolos/permissões/dados/gate intactos.12candidatos123–134 arquivados com SHA preservado em supabase/review-candidates/producer-versions; loader alinhado, não são etapas de deploy.324testes de backup passaram antes da guarda final de gatilhos;13direcionados finais passaram depois. Fonte de app idêntica aN01; produto135local/Vercel134, contafalse/restoretrue/lembretesfalse. Custódia sequencial registrada; pacote/testes reservados aguardando autorização específica. Não aplicar SQL/abrir escrita por inferência de “continue”.

Próximo Sol Alto: autorização para aplicar APENAS o arquivo135 revisado no DominioDoMagoDB com escrita fechada; então readback de hash/gate/grants/histórico e envelope sintético, sem conta real. Depois redirects/aceite Auth e decisão separada de liberação/associação pessoal. Importação real no iPhone continua pendente de confirmação do usuário. Histórico abaixo.

## F6-N01 — início de conta nova implementado — 0.1.135 local (07/11/2026)

[Fluxo, verificações e retomada](plans/FECHAMENTO-F6-N01-CONTA-NOVA.md). Conta/aparelho vazios recebem início explícito com defaults compartilhados do appStore, journal e pipeline de intent/CAS/recibo existentes. Não substitui progresso existente nem altera XP/Prana/IDs; primeira edição posterior foi salva em teste PGlite pelo coordenador live. UI com consentimento próprio e proteção contra duplo toque/resultado tardio. Código de contas permanece false; restoretrue/lembretesfalse.

690 testes completos (59,38s), 28 direcionados iniciais e oito do novo início repetidos, tipos/lint/build (13,38s) passaram. Sem navegador/conta/JWT reais. Supabase lista DominioDoMagoDB ativo, mas duas leituras SQL expiram; fallback CLI oficial sem login. Nenhum segredo/SQL remoto/progresso pessoal/conta real alterado. Candidato135 somente local; Vercel continua134.

Custódia sequencial encerrada/reservas liberadas. Próximo Sol Alto: restabelecer acesso SQL hospedado, confirmar versão/hash/gate/grants, preparar pacote revisável e escopo explícito de aplicação/liberação; depois aceite Auth real e associação pessoal com cópia/readback. Não anunciar contas ou sincronização liberadas. M06 corrigiu importação; reteste pessoal no iPhone segue pendente. Histórico abaixo.

## M06 — importação corrigida e menu mobile — 0.1.134 publicada (06/11/2026)

[Correção, evidências e conta F6](plans/IMPORTACAO-MOBILE-M06-0.1.134.md). Reproduzido falso positivo: TaskItem direto parentId=null/taskId=raiz vs Action parentId=raiz. Auditoria compara pai efetivo apenas nessa representação comprovada; arquivo/IDs/XP intactos e conflitos reais bloqueados. Menu compacto, busca sem teclado automático e ajuste ao visualViewport.

680 testes completos, 21 direcionados, tipos/lint/build passaram; sete de compatibilidade repetidos após ampliar regressão com cópia 130, XP não zero e restauração/hidratação. Publicado READY dpl_8D6uVVJ7Jceatavv2THJPbBseT8N no domínio fixo https://conselho-elemental-testes.vercel.app; HTML/entry200 e versão134 conferidos. Ensaio CUA em origem isolada restaurou cópia sintética130 e preservou ritual/4XP após recarga. Menu inspecionado em360/390/768px, busca/navegação e alvo fechar44px; altura reduzida390×460 não equivale ao teclado físico.

Progresso pessoal não aberto/importado; usuário deve repetir com MESMO JSON no iPhone e conferir recarga. Restoretrue/contafalse/lembretesfalse; SQL134 candidato local, nenhum SQL remoto/push/secrets. Custódia sequencial encerrada/reservas liberadas. Prioridade seguinte renovada: fechar F6/conta nova/acesso/retomada e associação integral com recibo/readback em Sol Alto. Não anunciar conta pronta ou sincronização pela importação local. Histórico abaixo.

## I05 — imagem de Fábio como ícone do app — 0.1.133 publicada (06/11/2026)

[Assets, instalação e evidências](plans/ICONE-APP-I05-0.1.133.md). Mago_app.jpeg do usuário redimensionado sem recorte/redesenho: Android/manifest 192/512, iPhone 180, favicon 32. URLs por hash e manifest versionado; corrigidas dimensões falsas anteriores, identidade/start_url/scope preservados. Arte PNG 512 inspecionada.

Dimensões/formato/sem EXIF e manifest conferidos; teste SQL local de versão (1, 8,51s), TypeScript/lint/build (10,50s) passaram. Sem suíte global nova para assets. Deployment dpl_AVx2Bgg3uvpFA1zU6RwRx6nQJeaz READY no endereço fixo https://conselho-elemental-testes.vercel.app. HTML/manifest/4 PNGs remotos 200 e SHA iguais aos arquivos locais. Instalação física e atualização de ícone já instalado ainda não verificadas.

Sem dados de progresso alterados, reset do celular, mudança de runtime, SQL remoto ou push. Candidato 133 somente local, flags de liberação preservadas. Custódia concluída e reservas encerradas. Próximo: usuário abrir/instalar pelo endereço fixo e confirmar o ícone; preservar o backup antes de qualquer eventual orientação de reinstalação. Transferência pessoal e conta/sync continuam pendentes conforme decisões anteriores.

## P04 — transferência guiada e ambiente permanente de testes — 0.1.132 (06/11/2026)

[Entrega e combinado de evolução](plans/TRANSFERENCIA-GUIADA-P04-0.1.132.md). Interface em três etapas; seletor como primeira ação. Corrigido reset indevido da comparação ao baixar backup anterior, com revalidação e bloqueio das ações de escrita durante preparo. Cópias/consentimentos/locks/journal/readback preservados; engines/stores/tipos/XP inalterados. Restore true, conta/lembretes false; SQL 132 só local.

679 testes completos passaram antes do último guard de renderização (84,16s). Depois dele, 13 de workspace, TypeScript/lint/build (8,23s) repetidos e aprovados; suíte completa não repetida como evidência nova. Build remoto final 19,97s/45s; deployment dpl_66XBoXzMsT24Bp6eXgwXML6JZDds READY no endereço fixo https://conselho-elemental-testes.vercel.app. Tela inicial guiada inspecionada no navegador interno, sem dados pessoais. Importação pessoal e aceite físico móvel continuam pendentes.

Fábio autorizou neste pedido atualizar esse projeto com melhorias verificadas enquanto usa o celular como testes; manter mesmo projeto/origem, sem publicar fixtures no lugar do app ou limpar storage. Criação de conta/sync ficam para depois. Não inclui outros projetos, GitHub, banco remoto ou mudança de economia. Próximo: importação real pelo usuário no celular, conferência dos registros e recarga; depois melhorias validadas → mesmo ambiente Vercel. Custódia sequencial concluída, reservas encerradas; sem push/SQL remoto/alteração do progresso pessoal.

## P03 — importação local liberada no projeto de testes — 0.1.131 (06/11/2026)

[Entrega, decisão e evidências](plans/IMPORTACAO-LOCAL-P03-0.1.131.md). Grimório com entrada direta Importar progresso neste dispositivo; restauração LOCAL true com cópia anterior/consentimento/locks/journal/readback preservados. Conta online e lembretes false. Versão 131/candidato SQL local; nenhum SQL remoto. 677 testes completos (79,16s), TypeScript/lint/build (41,38s) passaram.

Agente executou restauração sintética completa e recarga no navegador interno, depois conferiu entrada/workspace reais publicados. Downloads automatizados expiraram; cópia anterior sintética foi obtida do seed exato, sem extrair storage pessoal. Não testou celular físico nem importou backup real. Deployment READY dpl_9THEro78eBMRhgaqLSXr4Q7g36Np no domínio https://conselho-elemental-testes.vercel.app, projetos anteriores preservados. Sem push/SQL remoto/dados reais alterados.

Usuário esclareceu que tentou importar no Chrome do computador. Agora orientar mover o JSON privado ao celular e importar nesse dispositivo pelo link real /?progresso=restaurar. Importar no computador não sincroniza telefone; F6 permanece separado. Cópia pessoal confirmada salva; transferência real ainda pendente. Revisão/custódia concluídas, reservas encerradas; seguir conferência de conteúdo e recarga após a importação real, sem declarar concluída antes disso.

## V02 — app completo em projeto de testes próprio — publicado (06/11/2026)

[Destino, acesso e limites](plans/VERCEL-PROJETO-TESTES-V02.md). Criado conselho-elemental-testes / prj_2feHjC8XBOmFRRxbL39qGvTXQb0r em fr-prodiction, conforme pedido explícito. App completo 0.1.130 em https://conselho-elemental-testes.vercel.app. Deployment dpl_5zNwMfwxWzA6p6WdAdAZBsscSfPa READY/production só nesse projeto novo; projetos anteriores preservados. Painel: https://vercel.com/fr-prodiction/conselho-elemental-testes.

Build remoto passou; rotas /, /treinos e /grimorio responderam HTML do SPA com 200 sem login Vercel; entry JS/CSS 200. Sem aceite visual/mobile. Upload isolado não inclui QA, .env, perfis/backup pessoal ou SQL; fonte do app conferida igual ao checkout. Gates false e transferência pessoal ainda pendente. O usuário confirmou backup salvo, mas ficou confuso com o ensaio técnico; priorizar um fluxo compreensível no destino real. Sem novos testes locais, código alterado, push/SQL remoto. Custódia sequencial concluída, reservas encerradas.

## P02 — backup pessoal salvo; ensaio no celular preparado (06/11/2026)

[Estado e roteiro](plans/TRANSFERENCIA-P02-ENSAIO-CELULAR.md). Fábio confirmou cópia privada salva. Ensaio sintético separado publicado e READY: https://dominio-do-mago-48nnk1yyh-fr-prodiction.vercel.app. Usa workspace/helpers reais, recusa arquivo pessoal, mantém gate true só na fixture; produto false e alias real preservados. Sem leitura/transferência do backup pessoal.

41 testes direcionados/lint/build do ensaio passaram; fonte src comparada ao staging V01 e preservada byte a byte. Usuário ainda precisa realizar aceite no celular (restaurar/continuar local/recarregar e recuperação de interrupção). Só depois revisar liberação real e importar com conferência no destino. Conta/F6 continua independente. Custódia sequencial concluída, reservas encerradas; transferência ainda pendente, sem novos testes de navegador, SQL remoto ou push. Produto mantido 0.1.130 porque esta rodada adiciona ferramentas de QA, não funcionalidade distribuída.

## V01 — prévia Vercel publicada — 0.1.130 (06/11/2026)

[Deploy, limites e acesso pelo celular](plans/VERCEL-PREVIA-0.1.130.md). Preview READY dpl_GsC5JLcsiYikFBoECYwdi9Nbdwc8 no projeto dominio-do-mago-app/fr-prodiction. Alias fixo https://dominio-do-mago-testes.vercel.app, produção preservada. Build remoto passou; acesso público redireciona ao login Vercel, proteção mantida. Verificação autenticada incompleta por limitações CLI, detalhadas no relatório; sem aceite visual/mobile.

Upload isolado de código/assets, sem progresso pessoal, arquivos de ambiente ou SQL. A CLI criou automaticamente credencial técnica de acesso durante a tentativa de smoke; valor não lido/exposto/versionado. Gates false, sem SQL remoto/transferência de progresso/push. Conta/F6 permanece pendente; celular e computador têm armazenamento separado. Reservas encerradas. Próximo: teste pelo usuário no celular e evolução do fluxo de Treinos em Sol Médio; Matheus mantém Auth/conta em Sol Alto.

## T06 — biblioteca direta e plano de evolução — 0.1.130 local (06/11/2026)

[Plano, entrega e evidências](plans/EVOLUCAO-T06-BIBLIOTECA-0.1.130.md). Treinos salvos agora na entrada do módulo: busca por nome/modalidade, mais recentes primeiro, seis itens por vez e prévia pelo ID existente. Novo treino leva às modalidades com foco/movimento reduzido; sessão ativa preservada acima da biblioteca. Sem edição de stores/catálogos/cálculos.

677 testes completos passaram (71,86s), 12 direcionados de UI/identidade e um SQL sintético de versão, TypeScript/lint/build envDir:false (31,13s). 83 arquivos protegidos preservados por SHA; gates false, candidato 130 somente local. Servidor 5173 reativado e abertura no painel solicitada (queued); sem inspeção visual por permissão salva/contorno ou aceite mobile. Sem dados pessoais, push/deploy/SQL remoto. Custódia sequencial encerrada e reservas liberadas; aceite visual ainda pendente.

Próximo frontend: prévia → execução → descanso → resumo em Sol Médio. Matheus segue F6/conta e associação pessoal em Sol Alto; GymMane depende de licença/paridade, fragmentos dependem de persistência. Publicação anterior 0.1.129 em main 67bb6e5 permanece distinta deste lote local. Registros abaixo históricos.

## T05 — XP e elementos coloridos; envio para main — 0.1.129 (06/11/2026)

[Entrega, recebimento e evidências](plans/XP-ELEMENTOS-PUBLICACAO-0.1.129.md). Medalhão XP original, quatro miniaturas elementais coloridas e selo compartilhado na biblioteca/editor/prévia/histórico/Ciclos/recibos. Valores, fórmulas, estados parcial/meta superada e dados preservados. T04/0.1.128 local incluída. Pedido atual autoriza main; preflight confirmou be78b1e, sem commits novos de Matheus para mesclar. Commit técnico **3e48d3c** confirmado em main e integração; PR #1 marcado MERGED pelo GitHub.

674 testes completos, nove direcionados, TypeScript, lint e build passaram; prancha vetorial própria inspecionada, sem aceite visual do app/mobile por bloqueio salvo ou contorno. Estágio/inventário/segredos por padrões revisados antes de publicar. Gates false; candidatos SQL 128/129 somente locais, versões/formato preservados. Deploy Git desativado em main e branch de integração para enviar apenas código; sem dados pessoais, SQL remoto ou deploy. Próximo: Matheus fecha F6/compatibilidade/associação pessoal; fragmentos e GymMane continuam pendentes. Reservas encerradas após conferência remota e custódia sequencial. Registros abaixo históricos.

Correção incluída antes da publicação: ícone do treino/exercício segue a modalidade salva (bike/nado/corrida etc.), sem fallback indevido para halter; foco muscular preservado em força. Resolvedor compartilhado em biblioteca/editor/catálogo/Ciclos, sem alteração de dados.

## T04 — áreas auxiliares de Treinos modernizadas — 0.1.128 local (06/11/2026)

[Escopo, diagnóstico e evidências](plans/TREINOS-SUPERFICIES-0.1.128.md). Captura de Fábio comprovou ficha antiga; fonte mostrou hardcodes independentes em ficha/editor/portais. Busca em 455 arquivos e inventário de 90 de Fitness. Padronizados ficha em ambas as entradas, criar/editar, diálogos de sequências/Ciclos/avaliação, confirmações, componentes antigos e gráficos/widgets. Tokens de vidro escuro/ouro e campos/foco/alvos móveis; informações e callbacks preservados. Rótulo acessível de fechar compartilhado, sem mudança de domínio.

670 testes completos, tipos/lint/build passaram; 14 direcionados e, após últimos ajustes cosméticos, 13 de apresentação/lint/build repetidos. Sem inspeção visual/mobile por bloqueio salvo ou contorno. Stores/tipos/catálogos/cálculos preservados, gates false, SQL 128 candidato somente local. Sem dados pessoais, commit/push/deploy/SQL remoto. Esta rodada é posterior ao PR #1/0.1.127; não publicada automaticamente. Reservas encerradas após custódia sequencial. Próximo: aceite visual das superfícies/fluxos em celular/tablet quando disponível; atualizar repasse/inventário antes de eventual nova publicação. Registros abaixo históricos.

## H02 — publicado para Matheus — 0.1.127 (06/11/2026)

Commit técnico **68a5004** enviado a origin/codex/fitness-ui-integration; [PR #1 em rascunho](https://github.com/Matheuscroft/ConselhoElemental-main/pull/1) para main, conferido MERGEABLE. Main continua be78b1e, sem merge/force/deploy. [Matheus: começar pelo repasse](plans/REPASSE-BACKEND-0.1.127.md). README raiz/app apontam o pacote; Fábio frontend/mobile, Matheus backend, Astro Boy coordena.

668 testes completos, TypeScript, lint e build passaram; ajuste de EOF em arquivo novo conferido por JavaScript emitido idêntico e seis testes de lembretes. Inventário integral/stage e padrões de credenciais revisados; cache Supabase ignorado/fora do Git e preservado na máquina. Três gates false, candidatos SQL 123–127 somente locais; conta/F6, associação pessoal, fragmentos e GymMane pendentes. Sem aceite visual do app/mobile por permissão salva. Branch tem auto-deploy Vercel desativado em configuração; metadados hospedados recusados 403. PR criado via gh após 403 do conector GitHub; sem alteração de permissões. Sem dados pessoais/SQL remoto/deploy. Custódia sequencial concluída/reservas encerradas; próximo Matheus revisar PR e fechar F6/compatibilidade em Sol Alto. Registros abaixo históricos.

## T03 — catálogo agrupado e pesquisável — 0.1.126 (06/11/2026)

[Implementação, testes e retomada](plans/TREINOS-CATALOGO-AGRUPADO-0.1.126.md). 124 exercícios em seis grupos inicialmente recolhidos: Peito 17, Costas 19, Ombros 13, Braços 35, Abdômen 5, Pernas 35. Cada exercício aparece uma vez, com mesmo ID/objeto. Grupo abre oito itens por vez; busca direta por nome/músculo/equipamento, filtros combinados e lista opcional em lotes de 12. Ícones T02 preservados; sem mudança de dados/cálculos.

668 testes completos, 12 direcionados, TypeScript, lint e build passaram; sem aceite visual do app/mobile por permissão salva, sem contorno. Compatibilidade de produtor 126 e candidato 20261106033906 somente locais; candidatos 123–126 ainda sem aplicação hospedada. Gates false, sem dados pessoais, SQL remoto ou publicação. Reservas encerradas. Próximo: avaliar navegação em Sol Médio quando houver inspeção; GymMane/F6 seguem separados, inventário H01 precisa atualização antes de publicar. Registros abaixo históricos.

## T02 — ícones intuitivos de Treinos — 0.1.125 (06/11/2026)

Fábio reprovou a família T01 por baixa identificação. [Revisão e evidências](plans/TREINOS-ICONES-INTUITIVOS-0.1.125.md): os 45 ícones foram redesenhados com corpo contextual/região dourada, silhuetas de movimento e equipamentos reconhecíveis. Selos/filtros ampliados e nomes visíveis no editor. APIs/IDs/stores/catálogos/cálculos preservados. Nova proposta implementada, aceite visual do usuário pendente.

9 testes direcionados, TypeScript, lint e build passaram; prancha própria em 24/32/48px inspecionada. Não repetir como atual a suíte completa de 665 testes de T01. Sem inspeção do app/mobile por bloqueio salvo, sem contorno. Backup/versão 125 e candidato SQL 20261106033034 somente local; candidatos 123/124/125 ainda exigem escopo hospedado. Gates false; sem dados pessoais, SQL remoto ou publicação. Custódia sequencial/reservas encerradas. Próximo: avaliar nova família e conferir UI em Sol Médio quando disponível; GymMane/F6 permanecem separados. Registros abaixo históricos.

## T01 — Treinos: ícones e identidade — 0.1.124 (06/11/2026)

[Entrega, evidências e retomada](plans/TREINOS-IDENTIDADE-0.1.124.md). 45 SVGs originais; emojis/recortes antigos substituídos em modalidades, foco muscular, editor, catálogo, widget e XP. Casca/cartões/abas/botões/hero alinhados ao ouro e vidro escuro elemental. Filtros principais acessíveis, refinamentos agrupados, limpeza explícita e nomes com mais espaço. Stores/tipos/catálogos/cálculos preservados.

665 testes completos passaram; TypeScript, lint e build locais aprovados. Prancha vetorial inspecionada; sem aceite visual do app/mobile, pois a inspeção local permanece bloqueada. Versão/backup 124 e candidato SQL 20261106031901 somente local; candidatos 123/124 ainda não aplicados. Gates false, sem dados pessoais, push/deploy/SQL remoto. Reservas encerradas após custódia sequencial. Próximo: aceite visual em Sol Médio; GymMane continua plano G01, F6/conta permanece pendente. Atualizar inventário H01 antes de publicar. Registros abaixo históricos.

## G01 — GymMane analisado; implementação não iniciada (06/11/2026)

Astro Boy sequencial. Análise iniciada em 05/11 e encerrada em 06/11. [Relatório e plano de portabilidade](plans/GYMMANE-AVALIACAO-INTEGRACAO-2026-11-05.md). Recomendação: experiência funcional GymMane em React/TypeScript sobre WorkoutStore/adapters/recibos atuais. Flutter/Dart nativo não é biblioteca React; não importar segundo store/XP/Auth. Nova fase depende de licença/escopo e piloto aprovado; produto permanece 0.1.123, HEAD be78b1e.

Snapshot inspecionado: main 129349d; referência estável v2.0.0/7579501. Metadados, fonte, licenças, testes, CI externo e três screenshots do repo examinados. CI da release observada passou Analyze/Test/APK; não comprova a main posterior nem a adaptação React. 96 arquivos de teste na main; suites com fixtures privadas podem pular. Flutter/Dart ausentes no PATH; sem execução própria de SDK/APK/testes GymMane. Nenhuma inspeção do navegador local bloqueado.

Matriz: núcleo de treino/descanso/catálogo/rotinas → portar e integrar; séries avançadas/progressão/métricas/importação/mídia → contratos compatíveis; widgets/sensores/alarmes fechados/Wear/nutrição beta → lotes de plataforma/expansão. Código GPL-3.0-only + atribuição, arte CC BY-SA 4.0; revisar condições antes de incorporar. Link público suficiente, sem exigir credenciais/ZIP/APK do usuário.

Modelo recomendado para próxima rodada: Astra Médio no fechamento do mapa/arquitetura (alternativa Sol Alto); Sol Alto em adapters/contratos, Sol Médio na UI/polimento/validação funcional delimitada. Preservar cálculos/IDs/conta/perfis/histórico; alterações de economia não estão implícitas no pedido de UI. Primeiro piloto: Hoje → plano → série → descanso → concluir → resumo → histórico/recarga.

Custódia: relatório, painel analítico original e índices/repasse atualizados; links/diff-check/preservação de código conferidos. Canvas passou TypeScript contra SDK local; não é UI implementada no app. Sem código de produto/versão alterado, dependências/Flutter instalados, dados pessoais, SQL remoto, commit/push/deploy ou subagentes. F6 continua parcial e H01 ainda sem publicação; o inventário H01 é snapshot anterior e deve ser atualizado antes de um futuro commit que inclua G01. Reservas documentais encerradas. Registros abaixo históricos.

## H01 — repasse preparado para Matheus (05/11/2026)

Astro Boy sequencial; lote documental concluído, produto mantido 0.1.123/HEAD be78b1e. [Plano de entrega, prioridades e critérios](plans/REPASSE-BACKEND-0.1.123.md), [repasse principal](REPASSE-FRONTEND-PARA-BACKEND.md) e inventário `docs/plans/evidence/REPASSE-0.1.123-INVENTARIO.json` para seleção/revisão do commit. Entrada inicial tinha 86 modificados + 257 novos, sem commit. A branch remota ainda está em 03f0588; push de HEAD sozinho não leva as alterações.

Servidor Vite reiniciado em 127.0.0.1:5173 com envDir:false, HTTP 200. Abertura solicitada ao painel direito retornou queued; inspeção do Santuário negada por permissão salva. Não alegar app visualmente conferido, celular testado ou corrigir via driver alternativo. Limite registrado sem nova rodada de perguntas ao usuário.

Próximas frentes, nesta ordem: Matheus fecha F6/conta nova e compatibilidade/aceite hospedado (Sol Alto), depois associação pessoal integral; Fábio faz aceite mobile/polimento/movimento (Sol Médio); contrato de fragmentos/inventário após persistência estabilizada (Alto nos contratos, Médio na UI). Detalhes no repasse; não é fila paralela. Gates false, SQL 123 candidato local e progresso pessoal sem transferência.

Verificação deste lote: inventário Git/nome de arquivos, vínculos documentais, diff-check e preservação SHA de 584 arquivos de código/testes/scripts/migrações. Sem edição de código/versão ou nova suíte; 661 testes/checks continuam evidência da integração anterior, não deste lote. Sem commit/push/deploy, banco, secrets/.env, dados reais de browser ou subagentes. Reservas documentais encerradas após custódia sequencial. Antes de publicar: selecionar/rever todos os paths novos necessários, excluir arquivos privados/ambiente, registrar commit e verificar destino remoto/autodeploys no escopo de publicação.

## Integração da main — concluída localmente — 0.1.123 (05/11/2026)

Astro Boy sequencial. Pull ff-only incorporou 3026e75/be78b1e ao checkout codex/fitness-ui-integration, após preservar o trabalho local no stash c41b2bdcf6035566a0ca259f777a770c39d55f39 (mantido). Dez caminhos com conflito reconciliados, sem deixar entradas unmerged/staged. [Escopo, decisões, evidências e custódia](plans/INTEGRACAO-MAIN-2026-11-05.md).

Catálogos/editor de treino e checkbox/árvore simplificados de Ciclos remotos coexistem com contador genérico diário, recorrência/URL, recibos de XP e feedback locais. Corrigidos reset indevido de recorrência na edição e incompatibilidade do auditor de backup com novos grupos musculares/opcionais. Sem nova fórmula, alteração de histórico pessoal ou reprocessamento de recompensas.

**Executado nesta integração:** 35 verificações direcionadas de compatibilidade, 10 de preparação de lembretes após fix de fixture e **661 testes finais (45,46s; concorrência 4)**, TypeScript, ESLint, build Vite envDir:false (54,32s), diff-check, ancestralidade e preservação SHA. Logs `/tmp/conselho-merge-*`; relatório registra limites e etapas diagnósticas. Build conserva avisos de tamanho de chunk/Browserslist, não falhas. Sem aceite visual/mobile/conta hospedada, dados pessoais, secrets/.env, push, deploy, SQL remoto ou subagentes.

Versão/lock/auditor 0.1.123. Migrações instaladas 120/121/122 preservadas; 20261106022901_account_archive_version_123.sql é apenas candidato local e precisa de revisão/aplicação no escopo de ativação. Gates continuam false. Reservas de integração encerradas após revisão sequencial; não reaplicar o stash sobre a mescla.

**Retomada:** F6 foi interrompida e preservada (helpers/consentimento/retomada após reload); ainda requer fechamento e aceite hospedado essencial, nova conta vazia e associação pessoal com cópia/readback. Sol Alto nos contratos/Auth; avisar antes de passar para Médio na UX delimitada. Matheus backend, Fábio frontend; repasse atualizado. Registros abaixo históricos.

## F6 — retomada de acesso após recarga — em execução (30/10/2026)

Astro Boy sequencial, Sol Alto. Consentimento separado para guardar acesso em sessionStorage, máximo 12h, sem dados de domínio ou inclusão no backup. Validar identidade/vínculo sob lease exclusivo antes de App; pending intents/journals continuam conferência manual. Parar/esquecer separado de descarte por pagehide. Gates permanecem false; nenhuma sessão pessoal será acessada nos testes.

Reserva: main, mount-account-app, AccountWorkspace, AccountSyncStatus, account-live-sync e novos helpers resume/control/entry/tela; testes correspondentes; manifests/whitelist/revisão versionada CLI/loader e docs F6/custódia/ADR. Nenhum store, serviço legado ou fórmula. Baseline `/tmp/account-f6-before.json`.

## F5 — acesso/cadastro e confirmação sem adoção de progresso — 0.1.122 (30/10/2026)

Astro Boy sequencial, Sol Alto, codex/fitness-ui-integration/base b11ed9d. [Decisões, evidências e limites](plans/FECHAMENTO-F5-CADASTRO-CONFIRMACAO.md). Acesso separado da cópia: login/cadastro explícitos não exigem arquivo; enviar/receber mantém todas as proteções de cópia/readback/escopo/CAS. Modos separados, confirmação da senha, resend signup e feedback local, campos sensíveis limpos ao mudar modo/acesso. Inspeção inicial de vínculo/intent/journal e mudanças de storage precisam terminar antes das ações; toque rápido não cancela essa conferência.

Signup usa retorno fixo de mesma origem e não adota sessão nem envia dados, mesmo com autoconfirm. Login verifica getUser e consistência do ID, mais os vínculos/tentativas existentes. Retorno Auth inclusive na raiz padrão é limpo e isolado antes de importar App; aviso não autentica, falha não cai no legado. Callback distinto Google Calendar e navegação normal preservados. Nenhuma conta/e-mail real, senha pessoal, storage do usuário ou arquivo pessoal acessado; gates seguem false.

Compatibilidade 122 instalada por revisão separada **20261030211424_account_archive_version_122**, gerada inicialmente pela CLI como 20261030211040. Só estende produtor do schema 1, condicionada ao corpo 121 revisado e gate fechado; migrações aplicadas anteriores intactas. SELECT puro PG17 com envelope estrutural sintético confirmou hash, ACL invoker/search_path e escrita fechada; não é Auth ou commit. Advisors mantém avisos anteriores, sem correção automática.

**Executado:** 33 direcionados e **654 globais finais (36,28s)**, TypeScript/lint/build envDir:false **36,81s**. Logs `/tmp/account-f5-release-*`, `/tmp/account-f5-final-targeted.log`; prova reduzida e revisão no relatório. SDK/HTTP/hooks/PGlite sintéticos, sem inspeção visual/mobile, Auth real, deploy/push ou subagentes. Produto/lock/auditor 0.1.122, schema e economia preservados. Documentação/custódia sequenciais encerradas; registros abaixo históricos.

**Próximo F6 em Sol Alto:** retomada após reload com consentimento próprio e bootstrap integral, renovação/expiração/saída, nova conta vazia e aceite hospedado essencial antes de abrir gates/associar progresso pessoal. Não persistir tokens por conveniência ou voltar ao sync legado. Conferir redirect/template público no aceite; nenhuma configuração Auth foi alterada aqui. Fábio mantém seu progresso local; migração pessoal continua pendente. Avisar antes de mudar para Médio no UX delimitado.

## F4 — recuperação de acesso e descarte real de sessão — 0.1.121 (30/10/2026)

Astro Boy sequencial, Sol Alto, codex/fitness-ui-integration/base b11ed9d. [Fluxo, decisões e limites](plans/FECHAMENTO-F4-RECUPERACAO-ACESSO.md). Recuperação pré-bootstrap PKCE, prova própria com origem/projeto/expiração, código removido da URL, usuário validado antes da senha, logout só da sessão temporária, bloqueio de duplo toque/abas e sem App/stores/Auth legado. Gate cliente continua false; nenhum pedido de e-mail ou usuário real nesta rodada. Interface reutiliza workspace/ícones existentes.

Corrigido account-session: SDK ignora adapter com persistSession:false. Agora true seleciona Map exclusivo (sem persistir tokens no browser), chave única e dispose nega writes tardios. Testes do SDK instalado comprovam sessão null após dispose e resposta tardia. Histórico F1 permanece, garantia ampliada/corrigida nesta revisão.

Compatibilidade 0.1.121 adicionada por **migração separada** 20261030204257_account_archive_version_121, sem reescrever base instalada. CLI gerou inicialmente 20261030203429; ID/loader alinhados ao registro remoto. Patch aplicado como ajuste necessário da integração atual, condicionado ao hash do validador anterior e gate fechado. Só valida versão adicional do mesmo formato; não muda esquema/saldos/dados armazenados ou abre escrita. SELECT hospedado com envelope estrutural sintético confirmou hash esperado e gate false; não é Auth/commit/conta completa. Advisors permanece com dois WARN e três INFO anteriores, registrados com links.

**Executado:** 640 testes finais (23,78s), TypeScript/lint/build envDir:false (21,66s), SDK/HTTP/hooks/PGlite sintéticos; validação pura adicional em PG17.11 hospedado. Logs `/tmp/account-f4-*`; evidência reduzida e revisões no relatório. Nenhum dado pessoal, secret/.env, deploy/push, inspeção visual/contorno ou subagente. Produto/lock/auditor sincronizados em 0.1.121, formato de progresso preservado. Revisão e custódia documentais sequenciais; reservas encerradas.

**Próximo em Sol Alto:** entrada/cadastro/confirmação e retomada após reload integrados ao coordenador integral, depois aceite hospedado essencial e associação pessoal com cópia/readback. Conferir redirect/configuração pública antes de liberação; não recorrer ao sync legado nem abrir gates por testes sintéticos. Troca para Médio só depois, na UX delimitada, com aviso prévio. Progresso pessoal permanece sem transferência. Registros abaixo históricos.

## F3-R — migração integral instalada com escrita desativada — 0.1.120 (30/10/2026)

Fábio autorizou explicitamente “Sim, aplicar somente essa migração com escrita desativada”. Astro Boy sequencial, Sol Alto; codex/fitness-ui-integration, base b11ed9d. [Pacote, autorização e evidência hospedada](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). `apply_migration` aceitou o SQL revisado; histórico remoto 20261030202517_progress_account_atomic. Arquivo local alinhado a esse ID, loader atualizado, hash aprovado 9d0d074a51e62f4a98248ff699948546aab6a8203f586bd5d556b4b65bf85809 idêntico ao nome original 20261029182304. Não manter duplicata ou reaplicar init/align antigos.

**Hospedado conferido:** três tabelas privadas com RLS, privilégios diretos bloqueados, dez funções com search_path fixo/PUBLIC e anon revogados, wrappers invoker, dez guards ativos, 12 triggers de updated_at anteriores e duas tabelas Google Calendar presentes. Gate com writes_enabled=false; cliente permanece false. Advisors: dois WARN antigos preservados, três INFO novos de RLS sem policy são esperados para tabelas privadas sem acesso direto; não criar policies permissivas. Nenhuma linha de progresso/Auth pessoal foi lida ou transferida; sem mudança de fórmula/colunas legadas, Auth/config/secrets ou deploy/push.

**Local executado:** 625 testes aprovados após alinhar arquivo (19,40s); 23 direcionados, TypeScript/lint/build envDir:false anteriores desta rodada e lint final do loader/teste aprovados. Logs `/tmp/account-f3-*`; evidência de permissões reduzida versionável no relatório. Não é aceite JWT/PostgREST/sync/concorrência por conta real.

**Próximo em Sol Alto:** acesso integral cotidiano (cadastro/confirmação, recuperação, reload, logout e feedback de salvamento) e aceite hospedado essencial; só depois avaliar ativação e associação pessoal com cópia integral. Não pedir de novo autorização da instalação concluída; escopo aprovado mantém gates fechados. Documentação/custódia sequenciais encerradas; versão 0.1.120. Registros F3/F2 abaixo são históricos.

## F3 — banco ativo e instalação integral preparada — 0.1.120 (30/10/2026)

Astro Boy sequencial, Sol Alto; codex/fitness-ui-integration, base b11ed9d. [Pacote exato, impacto e evidências](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). DominioDoMagoDB ACTIVE_HEALTHY, PG17.11; catálogo confirma ausência de progress_private/RPCs integrais. Tabelas legadas/RLS/políticas/triggers existentes inspecionados, sem selecionar linhas pessoais; histórico vazio não é banco vazio. Diferenças reais de Sequências/Rascunhos preservadas.

Migração local ganhou preflight de instalação/identidade/colisões/RLS, com teste da variante hospedada e preservação de linhas sintéticas/schema/políticas/triggers. **23 direcionados e 625 globais aprovados**, tipos/lint/build envDir:false (35,47s). Logs `/tmp/account-f3-*`; hash e metadados reduzidos no relatório. Whitelists/manifests/changelog sincronizados em 0.1.120. Não aplicado SQL remoto, aberto gate, acessado secret/.env/progresso ou feito deploy/push/browser/subagente. Dois WARN existentes do Advisors registrados com remediação, sem ajuste automático.

**Próximo em Sol Alto:** aguardar resposta à confirmação específica do pacote remoto revisável, já solicitada conforme ADR-004, aplicar só essa migração com escrita false e conferir segurança/contrato; depois fechar acesso integral cotidiano e aceite hospedado essencial. Nenhuma associação pessoal feita. Reserva encerrada após revisão sequencial de escopo/versões/links; não retomar microtestes de lembretes. Usuário não precisa executar testes deste lote.

## F2 — retomada do banco solicitada; inicialização em andamento (30/10/2026)

Astro Boy sequencial, Sol Alto; codex/fitness-ui-integration, base b11ed9d, produto **0.1.119 mantido**. [Resultado, evidências e próximo passo](plans/FECHAMENTO-F2-BANCO-HOSPEDADO.md). DominioDoMagoDB confirmado pelo usuário: restore_project retornou success:true e status passou INACTIVE → COMING_UP. Ainda sem disponibilidade/contrato hospedado comprovados. Consultas de migrações/tabelas/catálogos falharam durante inicialização; não inferir schema ausente.

**Executado:** 11 testes SQL locais aprovados (`/tmp/account-f2-database.log`), PostgreSQL PGlite/Auth sintéticos; não Auth/RLS hospedados. Sem código de produto, build/lint/global repetidos ou bump. Nenhuma migração, gate, secret/.env, usuário/progresso pessoal, browser/contorno ou deploy/push. Não retomar microtestes de lembretes.

**Próximo em Sol Alto:** confirmar fim da retomada; conferir histórico/schema/privilégios por metadados; preparar a aplicação aditiva em escopo específico conforme ADR-004. Depois fechar acesso integral/cadastro/recuperação/reload e aceite remoto essencial. Progresso pessoal ainda local, sem associação feita. Reserva documental encerrada; custódia sequencial. Arquivos de produto conferidos contra `/tmp/account-f2-before.json`.

## F1 — renovação da sessão online implementada — 0.1.119 (30/10/2026)

Sol Alto, Astro Boy sequencial, codex/fitness-ui-integration, base b11ed9d. [Entrega/limites](plans/FECHAMENTO-F1-SESSAO-ONLINE.md). Conferência de conta continua sem refresh e sem persistir tokens. Handoff online fornece início explícito de refresh; mount protegido gerencia visibilidade/cleanup/falha. Início assíncrono não sobrevive ao descarte; sessão encerrada não recebe tokens por writes tardios. Sem store/core ou gate novo.

**Executado:** 17 direcionados e **621 globais aprovados**, TypeScript/lint/build envDir:false (43,06s). Quatro casos novos, Auth/HTTP/eventos sintéticos; não conta hospedada. Logs `/tmp/account-f1-focused.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`. Baseline `...-before.json`: 557/566 entradas anteriores idênticas; nove diferenças no escopo e versões. Novo helper/teste, SQL NÃO aplicado só whitelist. Reserva encerrada, custódia sequencial/versões/links/diff conferidos.

**Remoto:** conexão Supabase list_projects retornou DominioDoMagoDB INACTIVE; usuário confirmou ser destino correto. Não retomado, sem query de dados, secrets, usuários reais, migração ou deploy/push. Status não comprova configuração ausente, só impede aceite hospedado agora. Progresso pessoal e gates preservados; cópia pessoal/associação continuam pendentes. Sem browser/contorno/subagentes.

**Próximo em Sol Alto:** disponibilidade/contrato do projeto confirmado e lacunas de acesso único, cadastro/recuperação de senha/sessão após reload e transferência integral. Não promover legacy sync a garantia de preservação integral ou prometer conta pronta por testes sintéticos. Não retomar microtestes de layout. Modelo Médio depois na UX delimitada, com aviso prévio.

## Prioridade vigente — fechar conta e preservação do progresso (30/10/2026)

Usuário pediu acelerar, interromper a sequência demorada de testes e priorizar app acessível por contas com progresso salvo, sem perder seu progresso ao publicar na Vercel. [Plano de fechamento](plans/FECHAMENTO-CONTA-E-PUBLICACAO.md). QA manual adicional de lembretes/microajustes suspensa por diretriz do usuário; aceites já relatados preservados. Não é abertura dos gates nem comprovação remota. Produto 0.1.118 mantido, só planejamento/inspeção nesta rodada.

Inspecionados Auth/AuthStore e workspace/account-session/live-sync/attach, gate cliente e migração integral local: cadastro/login e infraestrutura integral existem, mas gate de transferência false, SQL hospedado/configuração real não conferidos. Vercel não transfere localStorage; preservar cópia integral e associação explícita à conta, com readback/isolamento e recuperação. Não usar fixture como backup pessoal ou somar XP na importação.

**Próximo: Sol Alto para conta/migração/sync e aceite integrado essencial**, antes de editar contratos. Depois Sol Médio na interface de acesso/feedback e polimento delimitado. Os testes indispensáveis de preservação/isolamento/retry continuam; não repetir microtestes de layout. Sem secrets/.env, dados pessoais, acesso remoto, deploy/push ou alteração de src/gates nesta rodada. Custódia sequencial; documentação de fechamento reservada e concluída.

## R27-D2 — recuperação controlada confirmada manualmente (30/10/2026)

Sol Médio, Astro Boy sequencial; produto 0.1.118 mantido. Usuário confirmou: falha sintética de uma vez após o write de core da fixture → recarga → recuperação oferecida → Recuperar progresso anterior → descartar plano → formulário inicial sem aviso atual, com Ritual QA preservado. **Aceite manual desse ponto específico de falha na QA no computador**, sem inspeção independente do agente ou prova de igualdade byte a byte de todos os dados.

O erro foi lançado por JavaScript na fixture; não é fechamento real do processo/browser, falta física de disco, todos os limites de write, cliente antigo ou concorrência compartilhada entre abas. Projeção live e armazenamento do harness continuam simulados/isolados. O gate do produto segue false; não promover escrita com base somente nesse resultado. Sem nova alteração de código, dados pessoais, secrets, browser/contorno ou publicação. Registro completo no [roteiro D1/D2](plans/R27-D1-ACEITE-MOBILE-LEMBRETES.md).

**Próximo em Sol Médio:** aceite mobile/tablet dos fluxos já implementados, com evidências de largura/aparelho, teclado/foco/overflow. Integração com stores/hidratação reais e critérios de ativação precisam de lote próprio em Sol Alto com aviso prévio. Não repetir testes locais como substituto de aceite pendente. Servidor QA mantido para continuidade manual. Custódia documental sequencial encerrada.

## R27-D2 — falha controlada da fixture preparada (30/10/2026)

Sol Médio, Astro Boy sequencial; versão de produto 0.1.118 mantida. Ferramentas QA: qa-storage.mjs extraído da fixture, teste qa-storage.test.mjs e controles de reiniciar/armar interrupção em reminder-qa.tsx. Falha uma única vez após persistir core no envelope QA; mantém journal e desarma antes de lançar para permitir recuperação. Reset apaga exclusivamente a chave QA; nenhuma leitura/escrita do localStorage real. Três testes direcionados, lint dos arquivos e compilação do harness passaram (`/tmp/qa-interruption-tests.log`, `/tmp/qa-interruption-lint.log`, `/tmp/reminder-qa-manual-build.json`). Nenhuma nova global do app executada.

Artefato `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-AnsqOa`; servidor da fixture reiniciado em http://127.0.0.1:50845/ (PID 25666, exec 93694). Sem inspeção/HTTP/screenshot pelo agente. Gate do produto false; somente release do bundle sintético substituído. Sem src/stores/contratos/dados pessoais/secrets/remoto/deploy/push alterados. Não é simulação de fechamento real do processo nem prova de disco/concorrência compartilhada: erro JS controlado depois de um write da fixture.

Solicitado ao usuário: Reiniciar dados QA → armar interrupção → preparar 09:00 → salvar → erro simulado → recarregar → Atualizar conferência → conferir Recuperar progresso anterior. **Resposta pendente**; não declarar recovery aprovada. Não reiniciar dados durante recuperação. Próximo em Sol Médio: validar revisão/rollback manual depois do relato. Reserva encerrada após revisão documental/diff-check.

**Aceite manual D2 parcial (30/10/2026):** usuário confirmou interrupção simulada e exibição da recuperação após recarga/conferência. Próximo solicitado: confirmar Recuperar progresso anterior → descartar plano → retornar → abrir controle e verificar formulário inicial sem aviso atual, mantendo Ritual QA. Rollback ainda não aprovado; resultado aguardando relato. Não reiniciar fixture durante esse percurso. Sem alteração de produto/gates/dados pessoais ou nova execução de testes.

## R27-D1 — percurso manual da fixture confirmado no computador (30/10/2026)

Astro Boy sequencial, Sol Médio; versão do produto 0.1.118 mantida. Usuário confirmou: abertura da QA após correção do JSX; preparar/conferir/descartar/retornar; salvar/continuar local/retornar; estado adiado carregado após recarga (captura + confirmação de adiamento); dispensar/recarregar com Ritual QA preservado. **Aceite manual deste percurso na fixture sintética no computador**, sem inspeção independente do agente, largura ou aparelho mobile confirmados. Não comprova entrega de notificação ou a data inicial em ensaio controlado.

[Registro completo e limites](plans/R27-D1-ACEITE-MOBILE-LEMBRETES.md). Harness tem somente um Ritual, projeção live simulada e estado exclusivo da aba em chave QA de sessionStorage. Não comprova hidratação dos stores reais, troca de conta, interrupção entre writes, concorrência de progresso entre abas, quota física, BFCache ou mobile/tablet. Não abrir gate com base neste aceite parcial. Produto, dados pessoais, backend/economia e gates permanecem inalterados; nenhuma nova execução de testes globais, deploy/push ou tentativa de browser.

**Próximo:** Sol Médio no aceite mobile/tablet e organização dos casos de recuperação ainda pendentes, usando apenas fixture descartável. Nova alteração de contrato/isolamento/ativação exige avaliação em Sol Alto com aviso prévio. Servidor QA permanece no loopback 50845 para continuidade manual; não encerrar enquanto houver teste autorizado em uso. Registros anteriores abaixo são históricos. Custódia documental sequencial, reserva encerrada.

## R27-D1 — runtime JSX do harness corrigido (30/10/2026)

Usuário relatou que a página QA não abriu. Listener anterior confirmado, mas inspeção do JS compilado encontrou React.createElement na entrada sem binding React: falha de compilação do harness, potencial causa de tela branca; erro real da página ainda não observado. Script passou a usar jsx automatic e exigir react/jsx-runtime.js no metafile, mantendo proteção contra stores/Auth e gate do produto false. Build e eslint direcionado passaram; servidor reiniciado no mesmo endereço http://127.0.0.1:50845/ com PID 24630 (exec 34530). Artefato atual `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-Qgb3vM`. Sem HTTP/screenshot/inspeção de página pelo agente.

Solicitado recarregar e informar tela ou mensagem exata. Resultado pendente; não declarar renderização validada. Produto continua 0.1.118, sem alteração de src/dados/gates ou novo servidor do app. Mudança apenas da ferramenta de QA. Sem secrets, deploy/push ou contorno da recusa de inspeção. Sol Médio adequado.

**Aceite manual parcial do harness (30/10/2026):** após correção do JSX, usuário confirmou que a página “Ensaio descartável de avisos” apareceu. É confirmação manual de abertura no computador, sem observação independente do agente. Próximo caso solicitado: horário 09:00 → consentimento → Continuar → Atualizar conferência → verificar Ritual QA → Descartar → retornar ao ensaio. Resultado pendente, sem gravação de aviso solicitada. Produto/gates/progresso pessoal preservados.

**Aceite manual parcial — descarte (30/10/2026):** usuário confirmou preparação → conferência → descarte → retorno ao ensaio sem erro. Só fixture sintética e relato manual no computador; sem inspeção do agente. Próximo solicitado: configurar 09:00 novamente, conferir, confirmar Salvar aviso, confirmar separadamente Continuar somente local e Voltar ao app. Fechar somente outras abas QA se existentes, sem fechar app pessoal (origem/progresso distintos). Resultado da gravação aguardando resposta. Produto 0.1.118/gates false, sem alteração de código ou dados pessoais.

**Aceite manual parcial — gravação (30/10/2026):** usuário confirmou Salvar aviso → Continuar somente local → Voltar ao app sem erro, exclusivamente na fixture QA. Confirma percurso relatado, sem observação independente de payload, invariantes ou disco. Próximo solicitado: recarregar QA e abrir Aviso da atividade para conferir “Aviso atual” 09:00 e opções de adiar/dispensar. Resultado de persistência após recarga pendente. Não habilitar release do produto por esse relato; mobile, interrupção/recuperação e concorrência real seguem pendentes. Sem novo código/bump; produto 0.1.118 preservado.

**Captura fornecida pelo usuário — persistência parcial (30/10/2026):** imagem Captura de Tela 2026-10-30 às 16.21.17 mostra a QA, Ritual QA/atividade em 30/10/2026, “Aviso atual: 31/10/2026, 09:00:00” e quatro opções de adiar/dispensar. Confirma visualmente que existe aviso carregado, mas não confirma a data originalmente esperada 30/10 às 09:00. Perguntado se houve adiamento antes da captura; resposta pendente. Não inferir bug/timezone nem aprovar igualdade da data. Captura fornecida voluntariamente é evidência visual, não inspeção de página pela ferramenta; sem acesso ao storage, alteração de dados/código/gates ou novo teste executado.

**Esclarecimento do adiamento (30/10/2026):** usuário confirmou que aplicou um adiamento antes da captura. Aviso carregado em 31/10 às 09:00 é coerente com essa ação; não tratar a diferença da data da atividade (30/10) como bug de timezone. Evidência combinada: relato de recarga, captura mostrando aviso existente/ações e confirmação do adiamento. Aceite parcial de persistência do estado adiado no harness, não teste controlado da data inicial nem entrega de notificação. Próximo caso solicitado: dispensar aviso na QA, confirmar fluxo, recarregar e conferir mensagem de dispensado com Ritual QA preservado. Resultado pendente; sem alteração de produto/dados pessoais/gates.

## R27-D1 — fixture disponível para aceite manual (30/10/2026)

Sol Médio; produto 0.1.118 mantido. Harness recompilado com dados sintéticos em `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-reminder-qa-0BjJZF` e servidor temporário loopback iniciado para abertura manual pelo usuário: `http://127.0.0.1:50845/` (PID 24453; sessão exec 30738). Build `/tmp/reminder-qa-manual-build.json`; servidor `/tmp/serve-conselho-reminder-qa.mjs`, estado `/tmp/reminder-qa-manual-server.json`. Não serve checkout/progresso real; só HTML/JS/CSS explicitamente permitidos e fallback das rotas da fixture. CSP bloqueia connect-src e framing, sem I/O remoto. Sem request HTTP, screenshot ou inspeção da página pelo agente; não é nova instância do app bloqueado nem contorno da recusa de inspeção. Alternativa é observação manual pelo usuário de fixture sintética independente.

Solicitado ao usuário confirmar abertura de “Ensaio descartável de avisos” e percurso Aviso da atividade → horário/consentimento → Continuar para conferência. **Resposta pendente**, sem renderização ou fluxo aprovados. Progresso QA só Map e chave QA de sessionStorage, sem localStorage real; gates do produto preservados. Limites do harness continuam: projeção live simulada, um Ritual, sem prova de tabs compartilhadas/hidratação real/fidelidade total. Próximo em Sol Médio: analisar resposta e depois testar aplicação/continuação local somente nessa fixture. Sem alteração de código de produto, secrets, deploy/push ou subagentes.

## Ciclos — data sincronizada com URL — 0.1.118 (30/10/2026)

Sol Alto, Astro Boy sequencial, codex/fitness-ui-integration, base b11ed9d. [Correção e evidências](plans/CICLOS-DATA-URL-2026-10-30.md). Seleção explícita de dia/calendário/Hoje atualiza query por replace, sem scroll. Marcador vinculado à conta/intenção preserva filtros e aba da seleção interna; links externos/conta continuam usando tratamento anterior. Reload restaura a data escolhida. Virada automática mantém advanceDailyView e atividade quando já existentes; histórico e execução/ocultação mantêm regra anterior.

**Executado:** quatro testes novos, 19 direcionados finais e **614 globais aprovados**, TypeScript/lint/build envDir:false (37,80s). Primeira global apontou dois harnesses sem dependências novas; corrigidos mantendo asserções e repetida global. Logs `/tmp/cycle-date-focused-reviewed.log`, `...-all-reviewed.log`, `...-types.log`, `...-lint.log`, `...-build.log`. Baseline `...-before.json`: 554 de 562 entradas anteriores idênticas; oito diferenças restritas ao escopo, mais helper/teste novos. Whitelists/manifestos somente versão; SQL não aplicado. Custódia sequencial/reserva encerradas; versões/links/diff conferidos.

Sem stores/serviços/economia/recorrência/gates/dados pessoais alterados. Sem secrets/.env, browser/contorno, remoto/migração/deploy/commit/push ou subagentes. Reload/foco/scroll reais não comprovados por testes sintéticos. **Próximo: Sol Médio** para escolher outro dia, recarregar, Hoje e retorno à agenda no app; mobile/tablet e harness de lembretes ainda pendentes. Não abrir gates por passar Node.

**Aceite manual confirmado pelo usuário em Sol Médio (30/10/2026):** cartão 31/10 atualizou query data=2026-10-31; recarga manteve 31; Voltar para hoje alinhou tela/query. Usuário respondeu que os três passos funcionaram. Ambiente de continuidade: navegador lateral do Codex no computador, sem nova largura informada. Não é inspeção independente nem aceite mobile/tablet. Sem alteração de produto/dados/gates ou nova tentativa de browser. Correção de seleção/recarga/Hoje aceita neste percurso manual; demais pendências preservadas.

## Ciclos — sincronização de data com URL pendente (30/10/2026)

Astro Boy sequencial, Sol Médio; produto 0.1.117 mantido, sem edição de código. Inspeção encontrou seleção de cartão/Hoje/calendário alterando selectedDate sem atualizar query data. Callback selectRelativeVisibleDay executado isoladamente com dia 30 + offset 1: selectedDay=31, navigationCalls=0; evidência `/tmp/cycle-calendar-url-review.json`. Não é teste de recarga/browser; o risco de retorno à data antiga é inferido do leitor de query existente. Sem dados pessoais/stores ou nova tentativa de inspeção.

Próximo lote: alinhar seleção explícita, links atividade/data, estado de retorno e virada automática do dia sem mudança de regras. Coordenador pediu **Sol Alto antes da edição integrada**; Médio permanece adequado para aceite visual depois. Não adicionar sincronização ingênua por effect que reverta deep links, limpe filtros ou force scroll. Critérios: escolher dia e recarregar; Hoje; entrada por atividade; troca de conta; retorno Temporal; descanso/histórico e virada do dia preservados. Harness de lembretes/aceite mobile seguem pendentes. Registro diagnóstico somente; nenhuma nova aprovação de teste global ou bump.

## Ciclos — seletor de datas refinado — 0.1.117 (30/10/2026)

Sol Médio, Astro Boy sequencial, base b11ed9d, checkout codex/fitness-ui-integration. [Entrega e limites](plans/CICLOS-CALENDARIO-UX-2026-10-30.md). Cabeçalho da data abre escolha; Hoje separado; setas mantêm handlers por sete dias. Popover substituído por Dialog/sheet existente, mês pt-BR, salto direto por campo de data, seleção fecha, Cancelar não aplica e foco retorna sem scroll. Expanded Cards preservados. Usuário confirmou Novo ciclo/Cancelar acessível no computador estreito antes deste pedido; calendário novo ainda sem aceite visual.

**Executado:** cinco testes novos e **610 globais**, TypeScript/lint/build envDir:false (44,01s), PostCSS 403 nós, versões/diff conferidos. Logs `/tmp/cycle-calendar-focused-final.log`, `...-all-reviewed.log`, `...-types-reviewed.log`, `...-lint-reviewed.log`, `...-build-reviewed.log`. Baseline `...-before.json`: 554 de 560 entradas anteriores idênticas; diferenças só Ciclos.tsx/CSS e versão/whitelists. Correções intermediárias de imports registradas. Novo componente e teste separados. Custódia sequencial; reserva encerrada.

Sem alteração de stores/serviços/XP/Prana/recorrência/dados, SQL NÃO aplicado só versão. Sem secrets/.env, browser/contorno, remoto/deploy/commit/push ou subagentes. Gates de lembretes/conta/restore mantidos fechados. **Próximo em Sol Médio:** usuário conferir seletor, Hoje, salto direto e Cancelar; aceite mobile/tablet real e harness de lembretes continuam pendentes. Não inferir fidelidade visual ou foco/picker reais dos testes sintéticos.

## R27-D1 — harness descartável compilado, aceite browser pendente (30/10/2026)

Sol Médio, Astro Boy sequencial. Versão de produto 0.1.116 mantida; somente ferramentas de QA novas: `scripts/build-reminder-qa.mjs`, `tests/fixtures/reminder-qa.tsx`. Help/build do harness, lint e diff-check passaram. Artefato temporário em `/tmp/r27-d1-qa-build-final.log`; detalhes no [roteiro D1](plans/R27-D1-ACEITE-MOBILE-LEMBRETES.md). Nenhum servidor/browser novo, acesso à origem bloqueada, dado pessoal, secret, remoto/deploy/push ou subagente.

Fixture com um Ritual sintético e UI/coordenadores existentes; adapter e estado live simulados. Release habilitado só no bundle de QA; gate do produto false. Metafile impede stores/Auth/sync; permite somente calculador puro de nível. Progresso do harness usa Map e uma chave de sessionStorage exclusiva de QA; nunca localStorage real. Outra aba não compartilha a fixture, e tema global/hidratação real não foram validados. Não importar fixture em src ou servir na origem principal. Reserva documental/ferramentas encerrada.

**Aceite manual em andamento:** aguardando relato de Novo ciclo → foco no nome → Cancelar em painel estreito do computador, sem criar dados. Não é teste de celular real.

**Pendência real:** servir e executar o artefato em contexto descartável com acesso de inspeção permitido, sem contornar a recusa da origem principal. Sem browser iniciado ou observado neste lote; matriz 360/390/768px e recarga/recuperação ainda pendentes. Os dois casos manuais anteriores (retorno e recarga no computador) continuam relatos do usuário, não provas do harness. Próximo permanece em Sol Médio, com honestidade sobre acesso e limites.

## R27-D1 — retorno e recarga confirmados no computador (30/10/2026)

Sol Médio; versão 0.1.116 mantida, sem alteração de produto. Inspeção do navegador continua recusada; não retentada. Código de retorno e CLI/status conferidos, diff-check passou. Solicitado ao usuário o primeiro caso não destrutivo: abrir Mês em outubro/2026, dia 30, ir à rotina e usar “Voltar à agenda selecionada”. **Usuário confirmou que mês e dia foram preservados.** Usuário também confirmou mês/dia após recarga e informou navegador lateral do Codex no computador. Dois casos manuais relatados, sem inspeção independente ou largura informada; não é aceite mobile/tablet. Nenhuma conclusão/exclusão ou dado de teste solicitado no perfil pessoal. Isso valida apenas navegação existente; controles de lembretes continuam ocultos pelo gate e dependem de harness isolado. Próxima ação: aceite mobile/tablet de navegação/toque/teclado e harness descartável para escrita, ainda pendentes; não repetir testes globais ou fazer bump por pendência visual. Custódia documental sequencial.

## R27-D1 — nova tentativa recusada pela ferramenta (30/10/2026)

Após usuário informar que alterou a configuração, uma tentativa regular de `cua.getTab` no navegador interno para `http://127.0.0.1:5173/ciclos` foi recusada: “A saved user permission setting blocks this action”; o gate de origem não concedeu acesso, citando permissão salva ou política gerenciada. Não houve observação de página ou nova tentativa por outra ferramenta/endereço. Não é evidência de defeito do app. Aceite visual/mobile e harness real continuam pendentes; versão 0.1.116 e gates preservados. Sol Médio permanece adequado. Próximo: resolver o acesso da ferramenta ou realizar aceite manual guiado pelo roteiro, sem usar progresso pessoal para testes destrutivos. Custódia documental sequencial; sem alteração de produto.

## R27-D1 — roteiro de aceite preparado; inspeção pendente (30/10/2026)

Astro Boy sequencial, Sol Médio confirmado; `codex/fitness-ui-integration`, base `b11ed9d`. Versão **0.1.116 mantida**, sem mudança de produto. [Roteiro e matriz mobile](plans/R27-D1-ACEITE-MOBILE-LEMBRETES.md) para 360/390/768px, dados descartáveis, navegação/recarga/recuperação e quatro comandos. Harness real ainda não construído; não dizer que está pronto ou validado.

**Conferido nesta rodada:** status CLI, listener 127.0.0.1:5173 (PID 11208), inspeção de código/gate e diff-check. Sem HTTP/browser/capturas, dados pessoais, escrita, testes globais repetidos, secrets, remoto/deploy/push ou subagentes. Gate false. Os 605 testes anteriores continuam evidência histórica da C2, não aceite D1. Reserva documental encerrada após conferência de links.

**Retomada:** aguardar resposta sobre mudança da permissão salva de inspeção. Não houve nova tentativa ou nova recusa neste lote. Se a configuração tiver mudado, tentar acesso regular pela ferramenta e respeitar o resultado; não contornar. Com acesso permitido, montar harness descartável e executar matriz real em **Sol Médio**. Sem acesso, manter aceite pendente, sem bump ou ativação por inferência. Mudança de contrato/isolamento exige Sol Alto com aviso prévio.

## R27-C2 — controles da agenda conectados — 0.1.116 (30/10/2026)

Astro Boy sequencial, Sol Alto, `codex/fitness-ui-integration`, base `b11ed9d`. [Implementação e limites](plans/R27-C2-CONTROLES-E-PREPARACAO-LEMBRETES.md). Agenda compartilhada de Semana/Mês/Calendário integra controles de avisos para ocorrências pendentes task/habit/commitment. UI lazy e adapter por interação; horário ou quatro comandos existentes, consentimento antes de sair, preenchimento preservado em erro e bloqueio de toque duplo. Compara projeção live/persistida e plano revisado, valida modo/perfil/ocorrência antes/depois de stage/readback. Só escreve transporte da aba; a gravação de domínio segue no workspace isolado anterior.

Retorno da conferência preserva dia/período Temporal por URL interna validada (somente data/dia/mes/ano); sem destino externo ou switch de workspace. Sem marcador local prévio ou com vínculo/intenção/resolução de conta, recusa preparar sem alterar sincronização. Falha durante stage limpa só plano próprio quando comprovadamente seguro; journal/erro ambíguo conserva transporte para revisão. Não restaura automaticamente formulário de atividade não salvo, scroll ou cadeia de state anterior.

**Executado:** 69 direcionados antes do último caso adicional; **605 globais finais aprovados**, TypeScript/lint/build `envDir:false` (**40,74s**), PostCSS (17 regras). Dezesseis testes novos. Logs `/tmp/r27-c2-targeted.log`, `...-all.log`, `...-types-final.log`, `...-lint.log`, `...-build.log`, `...-css.json`; baseline `...-before.json`, revisão `...-final-review.json`. Versões/links/diff conferidos; revisão React e custódia sequenciais; reserva encerrada.

`REMINDER_WRITES_RELEASED=false`: controles conectados no código, mas ocultos/inativos no produto; nenhuma gravação real de avisos ou notificação entregue. Hooks/storage/DOM sintéticos não comprovam UI, quotas, BFCache, recarga/abas reais ou sync online. Dados/stores/serviços/regras preservados; SQL NÃO aplicado somente versão. Sem dados pessoais, secrets/.env, conta/banco remoto, migração/deploy/commit/push ou subagentes. Inspeção bloqueada anteriormente não retentada nem contornada.

**Próximo: aceite mobile/tablet e percurso isolado — avisar troca para Sol Médio antes da próxima rodada.** Conferir 360/390/768px, horário, consentimento, erros/retorno, recarga/interrupção e outras abas em dados temporários, com release substituído apenas no harness. Não substituir por repetir Node ou abrir gate por inferência. Acesso de inspeção continua pendente. Uso online, reativação de aviso dispensado, outras fontes e entrega app fechado/push separados; contratos novos desses itens pedem Sol Alto após aviso. Não declarar lembretes prontos para uso cotidiano.

## R27-C1 — workspace de lembretes integrado — 0.1.115 (30/10/2026)

Astro Boy sequencial, Sol Alto, `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega e limites](plans/R27-C1-WORKSPACE-PROTEGIDO-LEMBRETES.md). Bootstrap seleciona conferência isolada por rota explícita ou plano pendente na aba, sem App/stores/Auth. Conta/restauração explícitas conservam prioridade. Conferência manual mostra alterações, invalida consentimento ao mudar progresso e oferece somente ações do estado revisado. Recuperação vinculada às duas versões exatas do plano; descarte limpa apenas transporte. Novas aplicações recusam progresso sem modo local prévio ou com qualquer vínculo/intenção/resolução de conta; não alteram sync silenciosamente.

**Executado:** 50 direcionados (44 lembretes + seis entrada); **589 globais aprovados**, TypeScript/lint/build `envDir:false` (**32,32s**). Dezesseis testes novos, inclusive eventos/concorrência/interrupção/recuperação estrangeira. Logs `/tmp/r27-c-reminders-final.log`, `...-all.log`, `...-types-final.log`, `...-lint.log`, `...-build.log`. Baseline `...-before.json`, revisão `...-final-review.json`; sete entradas anteriores mudaram no escopo, demais preservadas. Correção intermediária de tipagem registrada no relatório. Versões/links/diff conferidos; revisão React/custódia sequenciais, reserva encerrada.

`REMINDER_WRITES_RELEASED=false`; UI de conferência integrada, mas escrita/recuperação real de lembretes, botões nas atividades, timer/push não liberados. Tests substituem release apenas no harness; dados/locks/hooks sintéticos não comprovam navegador/mobile, quotas, BFCache, cliente antigo ou sync online. Nenhum dado pessoal, .env/secrets, conta/banco real, migração aplicada, deploy/commit/push ou subagentes. Sem nova tentativa/contorno da permissão do navegador.

**Próximo R27-C2 — manter Sol Alto:** ligar preparação dos avisos aos controles das atividades e tratar entrada/retorno/disponibilidade local sem perder formulário. QA real ainda obrigatório antes de abrir gate. Depois avisar para Sol Médio no aceite e refinamento visual mobile/tablet. Uso online de lembretes/conta hospedada e entrega app fechado permanecem separados; não declarar lembretes prontos para uso cotidiano.

## R27-B2B — transporte e retorno testados — 0.1.114 (30/10/2026)

Astro Boy sequencial, Sol Alto, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega e limites](plans/R27-B2B-TRANSPORTE-E-RETORNO.md). Transporte temporário da própria aba, plano copiado/validado por origem/perfil/revisão/checksum, readback antes de sair e ligação ao coordenador existente. Cancelamento limpa só transporte antes de recuperação; retorno exige alvo exato, ausência de journal, modo local válido e nova confirmação. Não é store de progresso ou fila de notificações.

**Executado:** oito testes novos, **29 lembretes / 573 globais aprovados**, TypeScript/lint/build `envDir:false` (**25,83s**). Falhas iniciais do harness JSON e de narrowing TypeScript corrigidas, sem afrouxar validação. Logs `/tmp/r27-b2b-reminders-final.log`, `...-all-reviewed.log`, `...-types-reviewed.log`, `...-lint-reviewed.log`, `...-build-reviewed.log`. Baseline `...-before.json`, revisão `...-final-review.json`. Das 542 entradas preexistentes, só whitelists, teste de coordenação e manifests mudaram; novo código separado. Versões/links/diff conferidos; custódia sequencial, reserva encerrada.

Servidor estava sem listener: Vite reiniciado em 127.0.0.1:5173 com `envDir:false`; mantido para recarga pelo usuário. `open_in_codex` retornou **queued**; renderização/HTTP/inspeção não confirmados. Sem contorno da permissão salva, dados pessoais, secrets, conta/banco remoto, migração/deploy/commit/push ou subagentes. Testes são sintéticos, não recarga/abas/quota reais.

**Próximo R27-C — manter Sol Alto:** integrar workspace/bootstrap protegido com confirmações e retorno; resolver ergonomia e compatibilidade com sync online antes da entrega cotidiana. Gate `REMINDER_WRITES_RELEASED=false`; interface/timer/push continuam desativados. Confirmação de uso local não deve ser silenciosa nem imposta como snooze instantâneo. Avisar para Sol Médio somente no polimento visual posterior; QA mobile/tablet/conta hospedada continuam pendentes.

## R27-B2A — escrita isolada de avisos testada — 0.1.113 (30/10/2026)

Astro Boy sequencial, Sol Alto, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Contrato e limites](plans/R27-B2A-ESCRITA-ISOLADA-LEMBRETES.md). Planner confirma perfil/revisão pela projeção atual; coordenador pré-bootstrap sem stores/services constrói alvo alterando somente metadados do aviso. Reutiliza trava global e diário/readback/recuperação existentes. `REMINDER_WRITES_RELEASED=false`; UI/timer/push não ativados. Não fecha toda a B2.

**Executado:** 21 testes lembretes, sete novos do coordenador; **565 globais aprovados**, TypeScript/lint/build `envDir:false` (**27,78s**). Sete testes de coordenação repetidos após ampliar fixture de formatação JSON. Logs `/tmp/r27-b2-reminders-final.log`, `...-coordinator-final.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`; baseline `...-before.json`, revisão `...-final-review.json`. Versões/links/diff-check conferidos. Avisos existentes de build mantidos; reserva encerrada após custódia sequencial.

Recusa aba ativa/concorrente cooperativa, ausência de lock/consentimento, origem/revisão alteradas e intenção de conta. Interrupções antes/depois das quatro gravações ficam recuperáveis no diário. Sucesso conserva dados de domínio/Fitness, mas pode normalizar formatação JSON; não alegar byte-identidade total. Startup permanece bloqueado enquanto diário exige conferência. Sem testes de abas/disco/navegador reais.

**Próximo R27-B2B — manter Sol Alto:** handoff do plano entre app e workspace isolado, cancelamento/retomada e ergonomia antes de ativar escrita ou interface. Não inserir botão chamando gravação B1 nem abrir gate por inferência. Fontes preexistentes preservadas salvo whitelists da versão; sem dados pessoais, secrets, conta/banco remoto, migração, deploy, commit/push, subagentes ou contorno de navegador. QA visual continua pendente; cliente antigo sem lease não é protegido automaticamente.

## R27-B1 — persistência local de avisos implementada — 0.1.112 (30/10/2026)

Astro Boy sequencial, Sol Alto, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Contrato e evidências](plans/R27-B1-PERSISTENCIA-LEMBRETES.md). Metadados opcionais `User.reminderState` seguem o perfil/progresso/backup integral existentes, sem raiz/chave/store novo. Comando exige conta/usuário/revisão; projeção real de Ritual agendado/Ciclo raiz/compromisso suprime fontes concluídas/excluídas/alteradas. Arquivos antigos sem campo continuam válidos. Metadados inválidos são apontados na auditoria de todos os perfis, sem remoção silenciosa.

**Executado:** 14 testes de lembretes e 35 direcionados com startup/recuperação, **558 globais finais aprovados**, TypeScript/lint/build `envDir:false` (**30,32s**), versões/links/diff-check conferidos. Logs `/tmp/r27-b1-reminders-final.log`, `...-reviewed.log`, `...-all-reviewed.log`, `...-types-reviewed.log`, `...-lint-reviewed.log`, `...-build-reviewed.log`. A primeira global detectou import indireto de serviços no startup; corrigido separando codec da agenda, sem relaxar testes. Falhas de preparação de fixture também registradas no relatório.

Baseline `/tmp/r27-b1-before.json`, revisão `...-final-review.json`: de 92 fontes preexistentes protegidas, 89 idênticas; alterações aprovadas só appStore/User/auditor de backup. SQL NÃO aplicado recebe somente versão; sem mudança de economia/recorrência/serviços/gates. Custódia sequencial, reserva encerrada. Sem navegador/contorno, dados pessoais, secrets, conta/banco real, migração, deploy, commit/push ou subagentes.

**Próximo R27-B2 — manter Sol Alto:** lease/journal/readback/falhas e concorrência entre abas antes de ativar UI. CAS atual é só por instância do store; não é garantia durável/distribuída e falha de storage após mudar memória ainda exige coordenação. Sync legado não envia esses metadados; não alegar conta hospedada completa. UI/timer/push continuam não ativados. Origens de projeto/quest/missão/sequência permanecem pendentes de contrato de conclusão específico nesta integração. QA visual mobile/tablet segue pendente, sem transformar teste local em aceite visual. Interface depois em Médio, com aviso.

## R27-A — base de lembretes implementada — 0.1.111 (30/10/2026)

Astro Boy sequencial, **Sol Alto confirmado**, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Contrato e limites](plans/R27-A-CONTRATO-LEMBRETES.md). Novo módulo puro aponta para ocorrência Temporal por origem/ID/data, exige horário, calcula +1h/amanhã 9h/amanhã mesmo horário e dispensa somente aviso. Revisão/comando recusam repetição alterada ou antiga; disponibilidade/conclusão são dados fornecidos pelo chamador. Datas locais resolvem para instante UTC; DST testado. Não cria atividade, recorrência ou recompensa.

**Executado:** oito testes novos e **552 globais aprovados**, TypeScript/lint/build `envDir:false` (**29,09s**), versões/links/diff-check conferidos. Logs `/tmp/r27-a-reminders.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`; baseline `...-before.json` e revisão `...-final-review.json` confirmam 90 fontes preexistentes protegidas idênticas. Whitelists frontend/SQL NÃO aplicado apenas versão. Avisos existentes de bundle/Browserslist preservados. Revisão/custódia sequencial; reserva encerrada.

**Limite:** módulo ainda não conectado a UI, persistência, backup, timer ou entrega de notificações. Não alegar idempotência distribuída/multitab; apenas transição em memória. Nenhuma preferência pessoal gravada ou atividade notificada. Conta/gates/dados/economia preservados, sem secrets, banco remoto, migração, deploy, commit/push ou subagentes.

Pedido de abrir Grandes Obras no painel interno retornou **queued** por `open_in_codex`; exibição/servidor/inspeção não confirmados. Não leu nem contornou origem bloqueada. QA mobile/tablet permanece pendente. **Próximo R27-B: persistência/backup/isolamento e ligação com ocorrências reais — manter Sol Alto.** Definir fuso/atraso/concorrência antes de ativar; depois interface em Médio, com aviso prévio. Push/app fechado e publicação têm escopo separado.

## R26-M2E — retorno seguro corrigido — 0.1.110 (30/10/2026)

Astro Boy sequencial, Sol Médio confirmado, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega e evidências](plans/R26-M2E-RETORNO-SEGURO.md). O hook Temporal conserva a origem local validada ao selecionar/fechar um dia e trocar de período, mantendo Ano → Mês → voltar. Não propaga estado arbitrário ou origem externa. Testes também conferem cancelamento sem gravação e retry após falha anterior à gravação com um único compromisso.

**Executado:** regressão falhou antes da mudança (`/tmp/r26-m2e-reproduction.log`, 9/10); **44 testes Temporal e 544 globais finais aprovados**, TypeScript/lint/build `envDir:false` (**31,29s**), versões/links/diff-check conferidos. Logs `/tmp/r26-m2e-temporal.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`. Baseline `...-before.json` e revisão `...-final-review.json` confirmam **90 fontes protegidas idênticas**. Whitelists frontend/SQL não aplicado somente versão. Avisos de bundle/Browserslist existentes mantidos. Custódia sequencial, reserva encerrada.

**Retomada:** revisão funcional local de Temporal encerrada neste recorte; **QA visual mobile/tablet ainda pendente** pela permissão salva do navegador, sem nova tentativa/contorno. Médio permanece adequado para esse aceite; não substituir por testes locais repetidos. Próximo lote de código proposto: **contratos de lembretes com horário/adiamento, trocar para Sol Alto antes de iniciar**; interface depois em Médio. Não iniciado neste lote. Conta real/push, fragmentos/inventário e ecossistema separados. Sem dados pessoais/secrets, economia/recorrência/backend novos, abertura de gates, migração, deploy, commit/push ou subagentes. Não declarar todo o app concluído.

## R26-M2D — revisão local de navegação concluída — 0.1.109 (30/10/2026)

Astro Boy sequencial, Sol Médio confirmado, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Reprodução e evidências](plans/R26-M2D-REVISAO-NAVEGACAO.md). Corrigido dia perdido ao trocar de Mês/Calendário para Semana: abas passam o dia local selecionado, inclusive na virada do ano; Ano mantém só o ano. Sem seleção válida, permanece o período escolhido. Compromisso recorrente mostra “A partir de” com a data inicial do cadastro, em vez da última ocorrência mensal. Quantidades/ocorrências não mudaram.

**Executado:** dois casos falharam antes da correção (`/tmp/r26-m2d-reproduction.log`); **42 testes Temporal e 542 globais finais aprovados**, TypeScript/lint/build `envDir:false` (30,54s), versões/links/diff-check conferidos. Logs `/tmp/r26-m2d-temporal.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`; baseline `...-before.json` e revisão `...-final-review.json`. SHA-256 confirma 90 fontes protegidas idênticas; whitelists frontend/SQL não aplicado recebem apenas versão. Avisos existentes de bundle/Browserslist preservados. Custódia documental sequencial, reserva encerrada.

**Limite e próximo:** inspeção do navegador recusada na tentativa anterior por permissão salva; não repetida nem contornada neste lote. **QA real mobile/tablet continua pendente — manter Sol Médio**, sem alegar foco/toque/fluidez/overflow por testes locais. Sem dados pessoais, secrets, backend/economia novos, abertura de gates, conta/banco real, migração, deploy, commit/push ou subagentes. Lembretes com horário/adiamento/push, fragmentos e ecossistema ainda não iniciados; contratos novos em Sol Alto após aviso. Não declarar escopo concluído.

## R26-M2C — Calendário/Ano implementados — 0.1.108 (30/10/2026)

Astro Boy sequencial, **Sol Médio confirmado por Fábio**, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega e limites](plans/R26-M2C-FORMULARIOS-TEMPORAL.md). Formulários anual/compromisso em Dialog existente, datas completas, limite anual em outro ano, rótulos e validação sem perda de campos em falha. Removidos seletores sobrepostos/arraste e trava global de toque do formulário anual. Anuais continuam criando um Habit ou Commitment pelo helper existente; nenhuma recompensa automática.

Calendário agrupa os controles por cadastro recorrente, mostra quantidade de ocorrências, pede confirmação para excluir e conserva todas as ocorrências no dia. Cabeçalhos seguem início de semana; removida semana extra após o mês. Contexto celeste/outros prazos recolhíveis; sem repetir compromissos próprios nem cortar lista em 16 itens. Ano na URL, abas conservam período e links carregam retorno seguro do ciclo/mês para a visão anual.

**Executado:** **540 testes globais aprovados**, nove novos; nove direcionados finais; TypeScript/lint aprovados; Vite `envDir:false` em **23,96s**, CSS parseado. Logs `/tmp/r26-m2c-all-final.log`, `...-forms-final.log`, `...-types-final.log`, `...-lint-final.log`, `...-build-final.log`, `...-css.json`. Avisos existentes de bundle/Browserslist mantidos. Revisão React/validação/custódia documental feitas sequencialmente. Correções intermediárias e limites descritos no relatório.

**Preservação:** 90 fontes protegidas idênticas por SHA-256; baseline `/tmp/r26-m2c-before.json`, conferência `/tmp/r26-m2c-preservation.json`. Whitelist frontend/SQL NÃO aplicado apenas aceita 0.1.108. Stores/services/tipos/recorrência/XP/gates intactos; sem dados pessoais, .env/secrets, navegador/contorno, conta/banco real, migração, deploy, commit/push ou subagentes. Versão/changelog/índices sincronizados; reserva encerrada ao revisar links/diff.

**Próximo: validação mobile/tablet dos fluxos existentes — manter Sol Médio.** QA visual/toque/teclado/rolagem/fluidez em 360/390px/tablet continua pendente, não comprovado por SSR/harness/CSS. Respeitar bloqueio do navegador, sem contorno/perfil pessoal. Lembretes com horário/adiamento/push, fragmentos/inventário, ecossistema e conta hospedada não iniciados. Novos contratos/legado anual/constância histórica exigem Sol Alto com aviso; publicação tem escopo próprio. Não declarar escopo global concluído.

## R26-M2B — Hoje/Temporal mobile implementado — 0.1.107 (29/10/2026)

Astro Boy sequencial, **Sol Médio confirmado por Fábio**, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega, evidências e limites](plans/R26-M2B-HOJE-TEMPORAL-MOBILE.md). Identidade elemental preservada; sem backend ou economia novos.

**Implementado:** Semana com dias compactos e agenda inline; Mês com grade alinhada ao início da semana e resumo recolhível; agenda compartilhada nos diálogos de Mês/Calendário. Links por ID levam às atividades com retorno ao período/dia via URL, validado apenas para páginas temporais locais. Mudanças internas preservam rolagem; entrada externa continua iniciando no topo. Identidade da data estabilizada para não invalidar o calendário ao trocar o dia no mesmo mês. Ciclos aceita link só com data, oferece planejamento semanal e reutiliza o editor mensal/anual na criação rápida, preservando preenchimento em falha. Nenhuma atividade é concluída pela navegação.

**Executado:** **531 testes globais aprovados**, dez testes novos de frontend, TypeScript/lint e Vite `envDir:false` em **8,43s**. Logs `/tmp/r26-m2b-all.log`, `...-mobile-final.log`, `...-types-complete.log`, `...-lint-complete.log`, `...-build.log`; CSS PostCSS com 173 regras/5 media queries em `/tmp/r26-m2b-css.json`. Revisão de React: cache local de apresentação substituiu memoização manual rejeitada pelo lint; teste de aria-hidden ajustado à string do JSX. Aceite usa só as execuções finais, sem ocultar as intermediárias.

**Preservação:** SHA-256 confirma **87 fontes protegidas** (stores, services, helpers/tipos/App/main/bootstrap) idênticas. Em src/lib, apenas whitelist de versão mudou; migration não aplicada também só aceita 0.1.107. Dados, fórmulas, histórico, recibos e gates preservados. Baseline `/tmp/r26-m2b-before.json`, diff `/tmp/r26-m2b-scoped.diff`, revisão `/tmp/r26-m2b-preservation.json`. Sem browser/contorno, dados pessoais, .env/secrets, conta pessoal, banco remoto, migração, deploy, commit/push ou subagentes. Gates false. Revisão/custódia documental sequencial; reserva encerrada após links/versões/diff-check.

**Próximo R26-M2C — manter Sol Médio:** formulários e organização restantes de Calendário/Ano, gestão dos lembretes e matriz de navegação/retorno. QA real em 360/390px/tablet continua pendente enquanto o navegador não estiver disponível; SSR/handlers/CSS não comprovam fluidez, teclado, foco ou hitboxes. Ano/Lua/Estações não receberam estado de URL neste lote. Legado/constância anual, novos contratos e release hospedado permanecem separados em Sol Alto. Não considerar o escopo inteiro finalizado.

## R26-M2A — agenda compartilhada implementada — 0.1.106 (29/10/2026)

Astro Boy, sequencial, checkout `codex/fitness-ui-integration`, base `b11ed9d`. Fábio autorizou iniciar após A30; nenhuma troca automática de modelo foi feita. [Contrato, compatibilidade e evidências](plans/R26-M2A-AGENDA-COMPATIVEL.md).

**Implementado:** predicado compartilhado de recorrência para Ciclos/rotações/Temporal; edição não força mais DAILY; Invocar/editor com dias mensais, mês/dia anual e limite opcional. Semana/Mês/Ano/Calendário recebem os mesmos compromissos próprios e Rituais agendados. Subitens e membros controlados não duplicam compromissos da raiz/rotação. Rituais recebem data operacional local `YYYY-MM-DD`, independente de createdAt/fuso, com criação/edição e links por ID. Adapter usa a coluna due_date existente e mantém a chave no payload; nenhum schema novo. Iteração de dias inclui a borda em mudança de horário de verão.

**Ano:** novas atividades anuais criam um único Habit YEARLY; aniversários são Commitments YEARLY. Ocorrências futuras, limite inclusivo e notas usam os comandos existentes. Tasks antigos com marcadores anuais não foram convertidos; a UI informa a limitação da repetição antiga. Mensais antigos sem dias continuam na leitura anterior até edição explícita. Anuais antigos sem mês/dia seguem a data inicial, alinhando Ciclos ao Temporal anterior; recibos preservados. Constância anual/rotações mantém a regra legada; não há recálculo de XP ou nova economia.

**Executado:** **521 testes globais aprovados**, zero falhas; **28 direcionados finais**; TypeScript e lint aprovados; Vite `envDir:false` em **9,40s**. Logs `/tmp/r26-m2-all-final.log`, `...-reviewed-final.log`, `...-types-verified.log`, `...-lint-verified.log`, `...-build.log`. Testes de agenda, recarga e adapters com dados sintéticos; SQL de conta no PGlite local dentro da suíte, sem chamadas ao projeto real. Primeira global 518/519 por harness antigo de criação; corrigida a inicialização lazy/helpers e o passo dos dois novos casos. Só a execução final acima é aceite.

**Custódia:** baseline `/tmp/r26-m2-before.json`, revisão `/tmp/r26-m2-preservation.json`; 11 fontes protegidas de auth/Fitness/App/bootstrap/gates/recompensas idênticas por SHA-256. Versão/manifests/changelog e whitelist da migration NÃO aplicada atualizados. Diff-check/links/versões conferidos no encerramento. Sem subagentes, dados pessoais, .env/secrets, navegador/contorno, login pessoal, banco remoto, migração, deploy, commit/push. Gates de conta/restauração false. Avisos de chunks/Browserslist permanecem. Revisão React e custódia documental em sequência; reserva encerrada.

**Próximo R26-M2B — pode usar Sol Médio:** melhorar Hoje/Temporal e consistência de criação/edição no celular, com resumo da agenda e retorno preservado. Aceite visual real 360/390px/tablet continua pendente; testes locais não o substituem. Conversão explícita de anuais legados, constância anual/rotações/histórico de agenda e novas mudanças de contrato ficam para lote próprio em Sol Alto; inventário/fragmentos e release hospedado continuam separados. Não considerar o app inteiro concluído.

## A30 — análise integral do áudio e diagnóstico da agenda concluídos (29/10/2026)

Astro Boy, sequencial, checkout `codex/fitness-ui-integration`, base `b11ed9d`, versão **0.1.105 preservada**. [Análise de diretrizes, confronto com código e plano](03-Project-Management/reports/A30-DIRETRIZES-AUDIO-2026-10-29.md). Áudio de **317,952s** transcrito integralmente em português por reconhecimento local (`small` multilíngue); artefatos privados em `/tmp/conselho-audio-diretrizes`, sem transcrição/conversa pessoal no repositório. Download de ferramentas/modelo ocorreu; não houve upload do áudio para transcrição. Falas gravadas foram analisadas, sem aplicação automática de alterações de regra.

**Confirmado nesta rodada:** estrutura de Ritual/Ciclo/Jornada/Grande Obra/Missão já representada; contadores genéricos por data, conclusão/Undo/XP e trilhas têm **75 testes direcionados aprovados**. Cinco cenários sintéticos executados confirmaram divergência anual entre Ciclos/Temporal, mensal vazio correspondendo a todos os dias, edição rápida alterando mensal para diária e compromissos próprios fora do seletor de semana/mês/ano. A quinta sondagem aponta lacuna de contrato: `dueDate` em Task sintético é ignorado, mas o campo ainda não existe no tipo/formulário de Ritual; não é reprodução de campo disponível na UI. Fluxo anual por marcadores/createdAt e inconsistência Missão/capítulo são achados estáticos, sem aceite de navegador.

**Evidências:** `/tmp/conselho-audio-diretrizes/testes-direcionados.log`, `reproduzir-agenda.mjs`, `reproducao-agenda.json`, `transcricao-result.json` e `transcript.json`. Não foram repetidos build/lint/tipos/suíte global por ser análise sem alteração de código. Custódia final: **523 arquivos de fontes/testes/scripts/SQL/manifests idênticos por SHA-256**, nenhum arquivo acrescentado nesses diretórios, três posições de versão 0.1.105 coerentes, links locais conferidos e `git diff --check` aprovado. Resultado em `/tmp/conselho-audio-diretrizes/verificacao-final.json`. Sem browser/contorno de bloqueio, dados pessoais do app, secrets, migração, deploy, commit/push ou ativação de conta/restauração. Gates false. Revisão documental sequencial; reserva de relatório/continuidade/fila/índice/plano mobile encerrada ao conferir o diff.

**Próxima implementação continua R26-M2, agora com prioridade funcional da agenda.** Recomendar **Sol Alto antes de iniciar contratos/compatibilidade de recorrência e data pontual**; a execução desta análise não trocou modelo nem iniciou esse código. Depois, **Sol Médio** para formulários/Hoje/Temporal mobile e movimento por recibos. Decidir explicitamente datas inexistentes e preservar históricos antigos; não criar motor/persistência paralelo. Conta hospedada, inventário e aceite real de celular/tablet continuam separados. O áudio não redefine XP/Prana nem aprova migração de Missões ou financeiro completo.

## R26-M1 — revisão mobile de formulários e áreas — 0.1.105 (29/10/2026)

Astro Boy em **Sol Médio**, sequencial, checkout `codex/fitness-ui-integration`, base `b11ed9d`. Revisão frontend após a implementação local de 1B6B. [Relatório e matriz de aceite](plans/R26-M-REVISAO-MOBILE-ATUAL.md). Navegador continua fora do aceite; não houve contorno do bloqueio nem inspeção de dados pessoais.

Corrigida colisão comprovada nos seletores: campos file de AccountResolutionPanel usavam a classe de consentimento e recebiam largura/altura de checkbox de 22px. Agora têm linha própria, largura limitada ao contêiner, controle >=48px e foco visível; apenas checkbox recebe 22px. Consentimentos/validações de escolha preservados. Ajustados quebra de texto/valores, espaço entre botões, detalhes tocáveis, safe areas laterais e campos de Auth com name/autocomplete adequados. Nota de sync centralizada e botões empilhados em telas estreitas. Busca de áreas no Santuário tem 48px/16px, rótulo preservado, name/autocomplete/spellcheck, foco no grupo e suporte a conteúdo longo, sem mudar filtros/rotas.

**Executado:** 22 testes direcionados e **504 globais aprovados**, TypeScript/lint/build `envDir:false` aprovados; build **52,92s**. CSS/seletores analisados por PostCSS/selector-parser (49/15/273 regras nos três arquivos). Diff-check/versões/links conferidos. SHA-256 confirma fontes protegidas de stores/auth/sync/transportes/cliente/App/main preservadas. Nenhum teste novo para simples estilo; testes funcionais existentes repetidos. A whitelist de backup e a migration não aplicada somente aceitam a versão corrente 0.1.105. Sem mudança de schema, domínio ou gate.

Logs `/tmp/r26-mobile-targeted.log`, `...-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`; snapshot `...-before.json`. Avisos existentes de bundle/Browserslist permanecem. **Não há medição real de overflow, hitboxes, teclado/zoom nem capturas em 360/390/768/1440px**; parse CSS/harness não substituem navegador. Sem dados reais, .env/secrets, banco remoto, deploy, commit/push ou comunicação externa. Conta/restauração continuam com gates false.

**Próximo: R26-M2, Ciclos de hoje/formulários e navegação de execução, manter Sol Médio.** Depois completar demais abas e aceite real da matriz mobile/tablet quando o acesso funcionar. Defeito de auth/contrato/persistência exige aviso e retorno a Alto antes de mudar essa camada; release remoto continua escopo separado. Reserva encerrada; revisão/custódia em sequência pelo Astro Boy.

## R25-1B6B — resolução e recebimento implementados localmente — 0.1.104 (29/10/2026)

Astro Boy em **Sol Alto**, sequencial, checkout `codex/fitness-ui-integration`, base `b11ed9d`. [Plano e limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md#1b6b--escolha-explícita-e-recebimento-integral--01104-29102026). Conta pessoal real não ativada; sem publicação/migração remota.

**Implementado:** escolha integral local ou online após comparação válida, cópias salvas/readback de local/online/tentativa quando existirem e duas confirmações de escopo/substituição. Dispositivo sem dados pode entrar em modo explícito de recebimento antes de Auth, comparar e receber arquivo de outra origem após validar identidade. Vínculo local mantém origem do dispositivo; hash/recibo autenticados validam o arquivo original sem exigir que a origem do arquivo seja a mesma. Não há merge, soma de XP, replay de conclusões ou novo store.

Cada escolha usa novo commit CAS e recibo do protocolo existente, inclusive ao escolher o arquivo online sem alterá-lo. Essa revisão nova cerca envios antigos: depois da confirmação, um pedido atrasado não substitui a escolha; repetição idempotente de recibo antigo não regrava estado. Journal de resolução guarda versões anterior/destino e metadados antes do commit. Domínio local só muda após recibo/readback; gravação parcial continua bloqueada no startup e pode retomar a mesma escolha. Nenhum reenvio automático na recuperação: consulta e retry têm ações/consentimentos separados.

Conflito após comparação conserva o journal. Reavaliar mantendo local exige leitura atual que prove revisão diferente da esperada e nenhum início/alteração local; não faz escrita remota, não apaga intent anterior e retorna ao workspace. Sem prova de revisão, sem rede, com dados locais externos ou recebimento parcial não é cancelamento offline: permanece protegido para revisão/retomada. Restauração, transferência e sync observam o novo journal e não passam por cima dele. Painel único, cópias/escopo claros, opção de fechar comparação e consentimento de abas antes dos botões de escolha.

**Executado:** **504 testes globais aprovados** (`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`); após o ajuste final de organização da UI, **42 direcionados repetidos e aprovados**. Tipos/lint/build finais aprovados, Vite `envDir:false` **11,98s**. Logs `/tmp/r25-1b6b-all.log`, `...-reviewed2.log`, `...-types-final2.log`, `...-lint-final2.log`, `...-build-final2.log`. Diff-check/links/versões conferidos. SHA-256 confirma dez fontes protegidas de stores/auth/sync/tipos/cliente/App/main/bootstrap idênticas ao início. SQL só aceita versão corrente na migration ainda não aplicada; nenhuma dependência nova.

Primeira execução direcionada identificou duas expectativas antigas de leitura de metadados e import não usado; corrigidos. O rearranjo final de JSX revelou erro de sintaxe no TypeScript/build; corrigido e conferido novamente. Harness de UI agora também recusa diagnósticos de parse e painel duplicado. Apenas logs finais acima são aceite do lote.

SQL real em PGlite temporário, identidade/cliente/locks/DOM/files sintéticos; não são Auth/JWT/PostgREST hospedado, concorrência real multissessão ou QA visual/mobile. Sem navegador/contorno de bloqueio, dados pessoais, .env/secrets, sessão pessoal, Advisors remoto, deploy, commit/push ou comunicação externa. Gates de conta/Auth/restauração/servidor **false**; avisos de bundle/Browserslist existentes permanecem. Testes verificam valores/IDs preservados, não alteram seus dados pessoais.

**Próxima frente: revisão e validação mobile/tablet do frontend — pode trocar para Sol Médio na próxima rodada.** Não iniciar migração/release nesse modelo por inferência. Aceite hospedado da conta/restauração, plano de rollout para clientes antigos e abertura de gates continuam separados, sem autorização nova de deploy. Contratos/auth/concorrência que apareçam nessa frente voltam a Sol Alto com aviso. Navegador real precisa funcionar para aceite visual; até lá, somente código/testes locais, sem contornar bloqueio. Reserva encerrada; revisão/custódia em sequência pelo Astro Boy.

## R25-1B6A — sync de sessão e conferência de conflitos preparados — 0.1.103 (29/10/2026)

Astro Boy em **Sol Alto**, sequencial, checkout `codex/fitness-ui-integration`, base `b11ed9d`. Implementação local sob gates fechados; **não houve ativação da conta pessoal**. [Plano e evidências](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md#1b6a--sync-durante-a-sessão-e-conferência-de-versões--01103-29102026).

**Entregue:** consentimento adicional para sincronizar durante o uso, com sessão transitória cedida pelo workspace e lease exclusivo pré-App. `account-live-sync` usa o arquivo integral e protocolo/recibo existentes, persiste intent antes do envio, CAS por revisão e vínculo após readback; nunca hidrata/recalcula domínio. Debounce de core/Fitness, conferência manual/foco/retorno visível, sinalização acessível do estado e parada antes de sair. Edições durante commit ficam locais e seguem em outro envio. Timeout/erro/recarga não reenviam automaticamente; outra identidade, perda de lease, conflito remoto ou metadado estrangeiro bloqueiam/param. Global Auth/cliente legado continuam desativados no documento online isolado. Recarga exige nova entrada explícita; não há sessão persistida nem flush de rede presumido no pagehide.

**Conflitos:** workspace compara local/online e exporta as versões, inclusive arquivo da tentativa pendente; mostra quantidades/diferenças e XP por perfil sem somar recompensas. Mudança durante leitura invalida comparação. Nenhum comando de substituir/mesclar/rebasear está habilitado. Parar sincronização é encerramento local do coordenador, não alegação de revogação do JWT em outros dispositivos.

**Executado:** **486 testes globais aprovados** (`node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`); depois foram acrescentadas duas provas de mount/identidade tardia e o arquivo de ciclo de sessão passou com **5 testes direcionados**. Tipos/lint finais limpos; build Vite `envDir:false` **29,98s**. Diff-check, versões e links conferidos. SHA-256 confirma oito fontes protegidas de stores/auth/sync/tipos/cliente/App idênticas; bootstrap/main/entradas mudaram deliberadamente. SQL só ampliou whitelist na migration não aplicada; sem nova dependência. Logs `/tmp/r25-1b6-all.log`, `...-lifecycle-final.log`, `...-types-final.log`, `...-lint-final.log`, `...-build.log`; baseline `...-before.json`.

Testes do coordenador/transporte usam SQL real no PGlite temporário, identidade e cliente sintéticos; lifecycle/UI/locks/timers em harness. Não comprova Supabase Auth/JWT/PostgREST hospedado, concorrência real multissessão nem QA visual em celular/tablet. Skill Supabase/changelog/docs públicos consultados, sem query/credencial do projeto real. Sem navegador/contorno do bloqueio, dados pessoais, .env/secrets, sessão real, migração remota, deploy, commit/push ou comunicação externa. Gates de conta/Auth/restauração/servidor **false**; avisos existentes de bundle/Browserslist permanecem.

**Próxima 1B6B — permanecer em Sol Alto:** resolver explicitamente versões divergentes/tentativas incertas e receber progresso em outro dispositivo, com prévia/cópias/consentimento, revisão e recuperação após interrupção. Este lote conclui o coordenador da sessão e a conferência, não toda a integração online. Depois faltam aceite hospedado/rollout para clientes antigos e QA real. Avisar ANTES de mudar para **Sol Médio** no mobile/tablet/acabamento. Reserva encerrada; custódia/revisão em sequência pelo Astro Boy.

## R25-1B5 — vínculo e proteção de início implementados — 0.1.102 (29/10/2026)

Astro Boy em **Sol Alto**, execução sequencial no checkout `codex/fitness-ui-integration`, base `b11ed9d`. Entrega local, sem conta pessoal ativada. A autorização para assumir a integração sem esperar Matheus permanece; não inclui deploy, secrets, migração remota ou alteração de economia. [Plano e limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md#1b5--vínculo-durável-e-envios-posteriores--01102-29102026).

**Implementado:** vínculo durável opcional por consentimento separado, contendo só referência ao recibo/revisão/hash/baseline/origem e usuário, sem credenciais ou cópia paralela do domínio. Depois de confirmado, próximos envios explícitos conferem o arquivo/recibo remoto e usam CAS contra a revisão vinculada. Tentativas duráveis aceitam revisão UUID, preservando leitura das primeiras tentativas empty. Handoff grava isolamento e vínculo verificados ANTES de retirar a tentativa; falha mantém barreira recuperável. Vínculo inválido impede início; vínculo válido isola o documento antes de App/cliente legado, mesmo se o marcador local estiver ausente. Isso não autentica o usuário nem ativa sync.

**Caminho legado:** novo guard no serviço, preparado para o rollout, verifica identidade/formato antes de ler/publicar tabelas parciais e novamente antes de hidratar. Conta integral, identidade diferente, RPC indisponível e resposta desconhecida são recusadas. Rechecagem de fingerprint ocorre depois dessa última espera, preservando edições durante Auth/RPC. **Esse guard de rollout só fica ativo com o gate da integração aberto; atualmente false**, sem chamadas novas no fluxo legado existente. Não corrige leitores de clientes antigos já distribuídos; plano de rollout e concorrência real continuam pendentes.

**Executado:** suíte completa `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`, **467 aprovados**. Depois, um teste adicional de disputa CAS entre conferência e commit foi acrescentado: **27 direcionados aprovados**, incluindo esse caso e recuperação da pendência. TypeScript/lint finais e Vite `envDir:false` aprovados; build **16,98s**. Diff-check/versões/links conferidos. SHA-256 confirma oito fontes protegidas (stores/auth/tipos/cliente/App/bootstrap) preservadas; serviço mudou somente pelas guardas, sem alterar fórmulas/payloads. SQL só ajustou whitelist de versão na migration ainda não aplicada; sem dependência nova. Logs `/tmp/r25-1b5-all.log`, `...-reviewed.log`, `...-types-final2.log`, `...-lint-final.log`, `...-build.log`.

Dados de teste sintéticos: PGlite/SQL real em memória, SDK/cliente/DOM/locks substitutos conforme harness. Não prova Auth/JWT/PostgREST hospedado, múltiplas sessões reais ou QA visual. Sem navegador/contorno de bloqueio, dados pessoais, .env/secrets, sessão real, banco remoto, deploy, commit/push ou mensagem externa. Gates de conta/Auth/restauração/servidor **continuam false**; avisos de bundle/Browserslist existentes permanecem.

**Próximo: 1B6, sincronização integral/retomada online e resolução explícita de conflitos — manter Sol Alto.** Recebimento em outro dispositivo, bootstrap autenticado integral, transições logout/conta e sync contínuo ainda não implementados. Pendência sem recibo após conflito conserva as versões; não faz rebase/limpeza automática. Depois virão aceite hospedado/concorrência e QA real; avisar ANTES de trocar para **Sol Médio** para mobile/tablet e acabamento. Reserva encerrada; revisão e custódia documental pelo Astro Boy sequencialmente. Não apresentar o lote como integração online completa.

## R25-1B4 — confirmação e retomada local preparadas — 0.1.101 (29/10/2026)

Astro Boy executou sequencialmente em **Sol Alto**, no checkout `codex/fitness-ui-integration`, base `b11ed9d`, após a autorização de Fábio para assumir esta integração sem esperar Matheus. Entrega local; **não é conta pessoal online habilitada**. [Implementação e limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md#1b4--confirmação-isolada-e-retomada-local--01101-29102026).

Novo workspace `/?progresso=conta`, acessível pela preparação de conta no Grimório, carrega antes de App/stores/cliente global. Confere cópia salva e consentimento de todos os perfis; Auth transitório é construído apenas por ação explícita, sem sessão persistida. Registro durável da tentativa precede o commit. Consulta de recibo não reenvia; retry separado reutiliza a mesma operação/arquivo e recusa arquivo antigo quando o progresso mudou. Pausa conserva a tentativa e instala isolamento local antes de liberar App; fechamento exige recibo/leitura exata, confirmação de uso local e, se necessário, consentimento para preservar edições posteriores. Nenhuma hidratação ou ativação de sync automático.

**Proteções:** gate estático da UI/Auth e gate privado do servidor continuam **false**; restauração também fechada. Contas remotas com progresso integral/legado são recusadas, sem substituir/mesclar. Restauração e transferência não podem escrever uma sobre a pendência da outra; guardas de geração/origem/identidade/baseline e exclusividade continuam. Corrigida leitura de metadado de conta na restauração para ocorrer somente após obter a exclusividade. Alteração na migration ainda não aplicada restringiu-se a aceitar o arquivo de versão 0.1.101.

**Executado:** **453 testes globais aprovados**, incluindo 18 novos; após o ajuste final da indicação de edições locais, **30 direcionados aprovados**. TypeScript, lint e Vite build `envDir:false` aprovados; build final **10,74s**. Diff-check e versões conferidos; SHA-256 confirma nove fontes protegidas (stores/auth/sync/tipos/cliente/App/bootstrap) idênticas ao início deste lote. Testes de protocolo usam PostgreSQL/PGlite em memória; Auth/HTTP/DOM/locks são sintéticos, e o SDK instalado também foi exercitado com fetch interceptado. Não demonstram Auth/JWT/PostgREST hospedado, concorrência real entre sessões ou QA visual/toque. Sem navegador, dados pessoais, .env/secrets, login real, banco remoto, deploy, commit/push ou comunicação externa. Avisos de bundle/Browserslist permanecem.

**Próxima etapa: 1B5, inicialização online compatível e vínculo durável**, ainda em **Sol Alto**. Reconhecer o arquivo integral antes do cloud-first/reset/autosync legado; definir retomada/conflitos sem segundo escritor, preservar ambos os lados e testar troca de conta/recarga. Tentativa pausada sem recibo e com edições locais não pode reenviar o arquivo antigo nem ser descartada automaticamente. Aceite remoto e navegador continuam pendentes; não liberar gates isoladamente. Depois, avisar ANTES da troca para **Sol Médio** para QA mobile/tablet e polimento. Reserva deste lote encerrada; revisão/custódia documental realizadas sequencialmente pelo Astro Boy.

## R25-1B3 — backend integral implementado localmente — 0.1.100 (29/10/2026)

Fábio autorizou explicitamente implementar agora sem esperar Matheus; a dependência operacional anterior foi revogada para este lote de código. Astro Boy em Sol Alto, execução sequencial, checkout `codex/fitness-ui-integration`, base b11ed9d. Sem autorização de deploy/migração remota/secrets ou mudança de economia. [ADR-004](04-ADRs/ADR-004-Progresso-Integral-Opt-In.md) e [plano](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

Migração aditiva local gerada por CLI implementa estado integral autoritativo opt-in com os mesmos bytes do backup, revisão CAS, idempotência e recibo na mesma transação; não recalcula XP. Tabelas privadas/RLS, auth.uid comparado ao destino esperado, wrappers invoker e helpers privados owner-bound com grants restritos. Gate de escrita do servidor inicia false. Triggers preservam legado sem opt-in e impedem dois escritores ativos após adesão. Contas já com domínio legado são recusadas para revisão, sem sobrescrita/mesclagem automática.

`account-transport.ts` oferece leitor, preparo explícito de todos os perfis, commit, consulta de recibo e confirmação por leitura exata. Identidade validada via getUser do cliente fornecido; nenhuma instância/sessão global criada. Ponte ao SDK passa TypeScript. Timeout pode recuperar recibo sem novo pagamento/reenvio. Confirmar armazenamento não autoriza associação/hidratação; resultado continua associationAllowed false, sem chamador de escrita montado. Stores/core/auth/sync/tipos/cliente/bootstrap/App preexistentes preservados por SHA-256.

**Executado:** 19 testes novos (11 SQL + 8 transporte), **435 globais aprovados**. Depois do ajuste de narrowing TypeScript e ponte de tipos, **19 direcionados repetidos**, tipos/lint e build `envDir:false` aprovados; build final **7,33s**. SQL real executado só em PostgreSQL 18.6/PGlite 0.5.13 temporário em memória (dependência dev fixada). Roles/identidade são sintéticas, uma conexão serial: não é prova de Supabase Auth/JWT/PostgREST, rede, versão hospedada ou concorrência multissessão real. Sem DB Advisors remoto/navegador/dados pessoais/secrets, commit/push/deploy. Avisos existentes de bundle/Browserslist permanecem. Migração NÃO aplicada no Supabase do projeto; nenhum gate real aberto. CLI alterou seu cache de atualização; o arquivo foi devolvido ao valor anterior, sem alteração restante.

**Próxima etapa/modelo:** confirmação e retomada durável na UI e bootstrap online que reconheça o arquivo integral antes de auth/reset/sync legado — **continuar em Sol Alto**. Não remover isolamento nem liberar o servidor antes desse caminho e dos testes de conta/abas. Migração de contas legadas não é automática. Abertura/QA real ainda pendentes. Ao entrar na validação mobile/tablet ou polimento visual, avisar ANTES para trocar a **Sol Médio**. Matheus continua com documentação e revisão do backend; já não é necessário esperar que escreva este protocolo. Reserva encerrada, revisão/custódia sequenciais pelo Astro Boy; implementação local não é conta pessoal habilitada.

## R25-1B3 — dependência de backend confirmada; integração não executada (29/10/2026)

Astro Boy em Sol Alto, execução sequencial, checkout `codex/fitness-ui-integration`, versão 0.1.99 preservada. `git ls-remote origin refs/heads/main` retornou **b11ed9d85bc000e9b8fb0eb48de0d8f647823b0b**, igual a `origin/main` e à base do checkout. Não houve pull/merge, pois nenhuma revisão nova foi identificada. Inventário de fontes/migrations do repositório, exports do sync e consumidores do contrato confirma: existe interface/validador no frontend, mas não há adaptador de leitura completa/commit conectado para 1B3.

**Dependência real:** Matheus precisa fornecer/revisar implementação de identidade e vínculo de perfil, leitura integral com revisão/cobertura, commit coordenado/idempotente e recibo verificável. O sync parcial existente e a função de hidratação não satisfazem esse contrato. Não criar outra camada de persistência nem remover isolamento para fazer login. Orientação vigente do usuário mantém backend com Matheus; continuar genericamente não foi interpretado como autorização para nova política/schema ou perda parcial.

**Executado nesta rodada:** inspeção estática local, conferência da revisão pública de main via Git, links/versões e diff-check. Nenhum teste/build/TypeScript/lint novo, pois não houve mudança de produto/testes. Os 416 testes e build de 0.1.99 continuam evidência do lote anterior, não desta rodada. Fontes/manifests/migrations preservados por SHA-256. Sem navegador, dados pessoais, sessão/secret, banco, deploy/push ou comunicação com Matheus.

**Retomada:** pergunta pendente ao usuário sobre branch/PR/contrato já disponível com Matheus. Com contrato disponível, integração 1B3 em **Sol Alto**. Sem ele, a validação/revisão de frontend pode avançar independentemente em **Sol Médio**, sem declarar conta integrada ou restauração liberada. Aviso de modelo feito antes de iniciar essa próxima frente; nenhum QA foi iniciado nesta rodada. Bloqueio de navegador anterior continua: inspeção real só com acesso funcional, sem contorno; até lá apenas código/testes locais. [Critérios para retomar](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md). Reserva documental encerrada; 1B3 aguardando dependência, 1A/QA real ainda pendentes.

## R25-1B2 — pré-conferência implementada; associação online pendente — 0.1.99 (29/10/2026)

Astro Boy em Sol Alto confirmado, execução sequencial; checkout `codex/fitness-ui-integration`, base `b11ed9d`. Implementada a conferência acionável em Grimório → Guarde sua jornada → Preparar conta pessoal → Conferir progresso local. Mostra valores reais da captura existente (perfil/atividades/XP/sessões) sem conectar conta, enviar ou gravar pela operação. Alterações no progresso invalidam o relatório; cancelamento, desmontagem e tentativas antigas não interferem em nova solicitação.

`association-review.ts` reutiliza captura/arquivo/auditoria/comparação existentes e mantém a revisão somente em memória. Contrato para FUTURO adaptador remoto exige identidade coincidente, revisão, declaração de leitura completa, todos os campos atuais e arquivo válido; erro não é tratado como conta vazia. Guardas de perfil/origem/conteúdo/usuário/geração recusam respostas atrasadas. Resultado SEMPRE `associationAllowed:false`: não existe escritor, associação, remoção de isolamento ou adaptador conectado ao SDK. Contrato de backend/política de conflito ainda precisa de Matheus/Fábio; não foi aprovado como novo endpoint/schema.

**Executado:** 12 testes novos; suíte global **416 aprovados**, TypeScript/lint limpos. Após revisão de cópia/ícone e tipos, **15 testes direcionados repetidos** e tipos/lint/build novamente; Vite `envDir:false` **14,64s**. Versões sincronizadas e diff-check limpo; SHA-256 confirma nove fontes protegidas de stores/auth/sync/tipos/cliente/bootstrap/App preservadas. Avisos de bundle/Browserslist existentes permanecem. Sem navegador/QA visual, dado pessoal, sessão/secret, banco, rede do app, commit/push/deploy.

**Próximas etapas e modelos:** 1B3 = integração do adaptador de leitura completa e protocolo de commit/recibo com Matheus, **Sol Alto**; associação permanece indisponível enquanto esses contratos/decisões não existirem. QA real da restauração 1A segue pendente e gate estático false. Ao iniciar validação mobile/tablet ou correções visuais delimitadas, avisar ANTES para trocar a **Sol Médio**; polimento/acessibilidade/animações também Médio. Fragmentos: contratos/durabilidade Alto, interface Médio. Fábio conduz frontend, Matheus backend. [Contrato e critérios](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md). Revisão/custódia em sequência pelo Astro Boy; reserva encerrada, sem aceite online/visual.

## R25-1B1 — cobertura e contrato preparados; associação não habilitada (29/10/2026)

Astro Boy, Sol Alto solicitado; execução sequencial em `codex/fitness-ui-integration`, base `b11ed9d`. **0.1.98 mantida**, lote somente de testes/documentação; fontes/backend/manifests preexistentes idênticos por SHA-256. [Contrato e matriz](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md) classificam os 21 campos persistidos: 7 coleções com payload, 5 projeções parciais e 9 campos fora do sync atual. Payloads testados preservam IDs/recibos/contadores; saldo independente do personagem, outros perfis e Treinos não acompanham o serviço. Falha intermediária pode deixar snapshot remoto parcial. Nenhuma associação pessoal foi tentada.

**Executado:** cinco testes novos de cobertura/roundtrip/reenvio/falha usando stores/serviço reais e cliente/storage sintéticos; **155 testes de backup aprovados**, lint e diff-check limpos. Sem build/TypeScript/suíte global novos neste lote. Changelog/docs públicos Supabase consultados; nenhuma query remota ou sessão/secret/dado pessoal/browser, commit/push/deploy.

**Próximo:** 1B2 precisa do contrato de identidade/perfil, leitura completa, cobertura, commit/recibo e idempotência com Matheus; política de conflito/escopo é proposta, não nova regra aprovada. Nenhum marcador local removido, auth/autosync alterado ou handler de associação criado. QA real 1A continua pendente e `RESTORE_WRITES_RELEASED=false` permanece. Sol Alto adequado à integração crítica; mobile/polimento/animações/fragmentos permanecem frentes separadas. Revisão documental/validação pelo Astro Boy em sequência; reserva encerrada.

## R25-1A — código concluído, aceite de navegador pendente — 0.1.98 (29/10/2026)

Astro Boy executou sequencialmente em Sol Alto, conforme autorização. Checkout `codex/fitness-ui-integration`, base `b11ed9d`; alterações preexistentes preservadas. Usuário confirmou o bloqueio persistente do navegador e pediu código/testes locais; não houve tentativa de contorno.

Implementado o fluxo de confirmação, recuperação e continuação somente local antes de App/auth. A cópia anterior precisa ser selecionada e corresponder ao progresso atual; consentimentos separados exigem fechamento das outras abas e substituição/recuperação/uso local. Operações recusam resultado obsoleto e clique duplo; falha com diário retido exige recarregar a revisão. O metadado operacional de modo local é verificado/gravado antes de remover o diário committed, sobrevive à recarga e impede a construção do cliente Supabase; o app usa os stores existentes e exibe aviso de progresso local. Não há API para apagar o isolamento ou vincular conta online.

**Executado:** 21 testes novos; **399 testes globais aprovados**, TypeScript/lint limpos, build Vite `envDir:false` **7,37s**. Versões dos manifests sincronizadas; SHA-256 confirmou appStore/workoutStore/authStore/serviço cloud/tipos de core e Treinos preservados neste lote. Backend, regras de XP/Prana, schemas de domínio e dependências mantidos. Avisos existentes de bundle/Browserslist permanecem. Logs: `/tmp/r25-a1a-{tests,types,lint,build}-final.log`. Nenhum dado pessoal, sessão, secret, banco, rede do app, commit/push/deploy ou teste visual.

**Limite e próximo:** `RESTORE_WRITES_RELEASED=false` é uma trava estática; não há parâmetro/ambiente/storage que habilite gravação na UI distribuída. Código exercitado com armazenamento e SDK substituto em memória; não é teste do SDK/serviço real nem prova de Web Locks/BFCache, quota real ou mobile. Fechar QA real isolado antes de liberar a restauração. R25-1B (conta pessoal/reconciliação online com Matheus), QA mobile/tablet, polimento/animações e fragmentos/inventário continuam separados. [Contrato, procedimento e evidências](plans/R25-A-BACKUP-DO-PROGRESSO.md). Revisão de implementação e custódia documental feita em sequência pelo Astro Boy; reserva encerrada, aceite de produto ainda pendente.

## R25-A2b11 — barreira pós-confirmação implementada (29/10/2026)

**0.1.97 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`; Sol Médio solicitado, execução sequencial. Diário confirmado agora permanece salvo como barreira durável anterior a App/auth/cliente. Aplicação confirma os dois envelopes sem remover o marcador; revisão, cópias e recuperação committed não o limpam. Rollback prepared continua devolvendo os bytes anteriores e só então remove seu diário. Formato versão 1 e stores preservados; nenhuma chave/store paralelo. [Detalhes](plans/R25-A-BACKUP-DO-PROGRESSO.md) e [isolamento de auth/sync](plans/R25-A-ISOLAMENTO-AUTH-SYNC.md).

**Executado:** quatro testes novos de barreira, incluindo bloqueio antes de inicializar auth em cliente sintético, e regressões existentes adaptadas à retenção do commit. **378 testes globais aprovados**, TypeScript/lint limpos, build `envDir:false` **19,50s**, diff-check e versões sincronizados. 129 testes de backup passaram antes do ajuste final da fixture de XP; suíte global final inclui os casos ajustados. SHA-256 confirma quatro fontes modificadas; stores/auth/serviço cloud/tipos/main/coordenador exclusivo intactos. Avisos de bundle/Browserslist permanecem.

**Próximo:** implementar/revisar continuação local isolada ou associação explícita, com contrato de perfil/identidade e I/O tardio com Matheus. Ainda não existe operação que libere um commit para a nuvem/uso local completo. Writer da UI segue desabilitado; compatibilidade restante e teste real de abas/reload/quota continuam critérios. Sem navegador, SDK real, dados pessoais, banco, secrets, rede do app, commit/push/deploy. R25-B, QA mobile, animações e fragmentos separados. Reserva encerrada após revisão sequencial pelo Astro Boy.

## R25-A2b10 — auth/autosync auditados com cliente sintético (29/10/2026)

**0.1.96 mantida**, branch `codex/fitness-ui-integration`, base `b11ed9d`; Sol Alto, execução sequencial. AuthStore e serviço cloud reais foram exercitados com cliente/eventos/timers simulados, sem importar o cliente real ou acessar dados pessoais. Sessão salva pode aplicar nuvem sobre estado local; perfil remoto novo pode limpar atividades; troca de perfil local pode publicar sob a mesma identidade remota; refresh pendente pode alterar domínio após logout. Sync atual não cobre backup integral. [Achados, limites e contrato proposto](plans/R25-A-ISOLAMENTO-AUTH-SYNC.md).

**Executado:** nove testes de caracterização novos; **125 testes de backup aprovados**, lint e diff-check limpos. Fontes .ts/.tsx e manifests preservados por SHA-256/conferência; sem versão nova. Sem suíte global/TypeScript/build novos. Skills Supabase/backend aplicadas; somente documentação pública consultada (MCP/changelog), nenhuma query de banco ou rede do app. Testes não demonstram perda pessoal, SDK/Auth real ou configuração remota efetiva.

**Próximo:** implementar/revisar barreira pós-restauração durável antes de App/auth/cliente e definir com Matheus o vínculo de perfil/identidade e invalidação de I/O tardio. Contrato proposto, não aprovado como nova política/schema. Restauração/recuperação seguem desabilitadas; não abrir cloud-first após importação como se o isolamento estivesse fechado. QA real, R25-B, polimento/animações e fragmentos permanecem pendentes. Preservado o backend de Matheus; sem browser, secrets, dados pessoais ou publicação. Reserva encerrada; revisão sequencial pelo Astro Boy.

## R25-A2b9 — ciclo de documentos/recuperação validado em memória (29/10/2026)

**0.1.96 mantida**, branch `codex/fitness-ui-integration`, base `b11ed9d`; Sol Médio solicitado. Lote somente de testes/documentação. Novo teste integra startup, coordenador exclusivo, diário e hidratação real dos stores em documentos simulados independentes com armazenamento compartilhado em memória. Duas abas impedem substituição; diário pendente bloqueia hidratação; recuperação e recargas preservam perfis, IDs, XP, contadores, recibos e históricos. [Evidências R25-A2b9](plans/R25-A-BACKUP-DO-PROGRESSO.md).

**Executado:** seis testes integrados novos; **116 testes de backup aprovados**, lint e diff-check limpos. SHA-256 confirma todas as fontes .ts/.tsx do produto idênticas ao início da rodada; manifests mantidos. Sem suíte global/TypeScript/build novos nesta rodada, pois fontes/dependências não mudaram. Um caso de teste foi ajustado para que anterior/destino realmente alterassem os dois envelopes e exercitassem as três fronteiras de rollback; não era um defeito demonstrado no produto.

**Limites/próximo:** simulação não comprova Web Locks/BFCache, abas antigas, quota/reload real ou auth/autosync. Próximo lote deve auditar o bootstrap de autenticação/sincronização após a recarga, preservando o backend de Matheus e sem chamadas remotas/secrets; o teste atual só hidrata os stores de domínio. Compatibilidade final, isolamento e QA de navegador continuam critérios antes de habilitar gravação. R25-B conta online, QA mobile/polimento e fragmentos seguem separados. Nenhum dado pessoal, navegador, restauração real ou publicação; reserva encerrada, revisão sequencial pelo Astro Boy.

## R25-A2b8 — confirmação vinculada e cópias protegidas (29/10/2026)

**0.1.96 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`; Sol Médio solicitado pelo usuário, lote delimitado executado sequencialmente pelo Astro Boy. Coordenador de recuperação agora exige confirmação explícita e os bytes conferidos, congelados antes de esperar pela exclusividade; mudanças antes/depois do hashing recusam a operação. Tela isolada permite baixar **versão anterior** e **versão de destino** de um diário válido, inclusive em conflito externo, sem exportar um par parcialmente gravado. [Registro R25-A2b8](plans/R25-A-BACKUP-DO-PROGRESSO.md).

**Executado:** duas regressões reproduzidas antes da correção; nove testes novos; suíte global **359 aprovados**. Após ajuste final de retenção dos detalhes durante o download, **110 testes de backup** repetidos, TypeScript/lint limpos e build `envDir:false` em **15,00s**. SHA-256 confirma somente quatro fontes alteradas neste lote; stores/auth/sync/tipos/main preservados. Versões sincronizadas, diff-check limpo; avisos de bundle/Browserslist existentes permanecem. Sem navegador, dados pessoais, recuperação real, rede do app, commit/push/deploy.

**Próximo:** fechar compatibilidade e isolamento restante, confirmação/recuperação acionáveis antes do bootstrap e teste real de interrupção/abas/reload. O coordenador segue sem chamador de gravação na UI; recuperação/restauração permanecem desabilitadas. A cópia exportada usa a versão protegida do diário, não prova sincronização online nem que o usuário guardou um arquivo pessoal. R25-B conta online, QA mobile, animações e fragmentos seguem separados. Sol Médio foi suficiente para este lote; reavaliar esforço conforme a próxima integração. Reserva encerrada; revisão sequencial de código/documentação pelo Astro Boy.

## R25-A2b7 — conferência de recuperação e vínculos internos (29/10/2026)

**0.1.95 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`; Sol Alto confirmado pelo usuário. Sessões/check-ins/recibos passam por correlação interna de identidade, fase e atividade; referências históricas ausentes por exclusão continuam preservadas. A tela isolada permite **Conferir recuperação pendente**: distingue retorno ao estado anterior, manutenção do destino confirmado e conflito externo. Resumos vêm das duas versões validadas do diário, nunca de um par parcialmente gravado. [Escopo e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md).

**Executado:** 12 testes novos; suíte global **350 aprovados**. Após ajuste final de texto e ampliação das regressões, **101 testes de backup** repetidos, TypeScript/lint limpos e build sem .env em **8,29s**. Versões sincronizadas e diff-check limpo; SHA-256 confirma stores/auth/sync/tipos/main/coordenador exclusivo preservados. Avisos conhecidos de bundle/Browserslist permanecem. Sem browser/QA visual, dados pessoais, recuperação real, rede do app, commit/push/deploy.

**Próximo:** fechar compatibilidade restante e fluxo acionável de confirmação/recuperação anterior ao bootstrap, incluindo isolamento de abas antigas e auth/sync; testar interrupção/reload/concorrência em navegador antes de liberar escrita. A conferência desta rodada não certifica todas as relações do domínio nem altera dados. R25-B conta online, QA mobile, polimento e fragmentos permanecem separados. Manter Sol Alto na integração crítica; Sol Médio após esse fechamento. Reserva encerrada; revisão sequencial de implementação e documentação pelo Astro Boy.

## R25-A2b6 — catálogos, avaliações e recordes conferidos (28/10/2026)

**0.1.94 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`. Retomada com Astra Médio. Auditoria pura cobre catálogos nativo/legado, avaliações, recordes e indicadores de força. Achados entram na prévia e na revalidação dos dois lados do diário; nenhuma correção automática ou alteração de stores/fórmulas. [Escopo e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md).

**Executado:** 89 testes de backup aprovados (quatro novos e casos ampliados de diário), TypeScript/lint limpos, build sem .env em **7,77s**. SHA-256 confirma que, entre os arquivos de fonte preexistentes ao lote, somente os dois validadores mudaram. Versões sincronizadas; avisos de bundle/Browserslist permanecem. Sem teste visual, dados pessoais, restore real, rede do app ou publicação. Suíte global não repetida nesta rodada.

**Próximo:** revisar vínculos ativos e demais estruturas críticas antes de integrar confirmação/recuperação pré-bootstrap; preservar referências históricas após exclusão. A limpeza nativa pode deixar uma avaliação sem sessão, portanto ausência de alvo histórico não é motivo isolado para rejeitar a cópia. Restauração continua desabilitada até concluir os critérios e validar interrupção/reload real. R25-B conta online, QA mobile e fragmentos permanecem separados. Reserva encerrada; revisão sequencial de código/documentação pelo Astro Boy.

## R25-A2b5 — inventário de compatibilidade de Treinos (28/10/2026)

**0.1.93 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`; pedido retomado com Luna Baixo. Rodada apenas documental/estática, sem alterar código ou dados. Revisados `fitness-audit.ts`, `critical-progress.ts`, `progress-links.ts`, `stored-progress.ts`, tipos e projeção persistida de Treinos, além dos capítulos canônicos e do plano R25-A.

**Lacunas confirmadas no código:** `accountDataById` valida planos/sessões, ledger legado e medidas, mas não percorre `exercisesCatalog`, `ratings`, `strengthRecords`, `strengthProgressPoints` ou `strengthStat`. `nativeDataById.nativeCatalog` verifica que é uma lista de objetos, sem validar campos/IDs. Sessões e sequências validam formatos de referências, mas não conferem se os alvos existem no respectivo catálogo/plano; referências a histórico também exigem respeitar exclusões e snapshots legados. Isso demonstra cobertura parcial, não dados pessoais corrompidos nem que esses itens devam ser rejeitados.

**Verificações desta rodada:** leitura estática dos validadores, tipos e `partialize`; nenhuma suíte, build, navegador ou dado pessoal foi executado/acessado. Versão mantida, pois não houve mudança de código. Alterações locais anteriores preservadas. [Matriz e critérios do próximo lote](plans/R25-A-BACKUP-DO-PROGRESSO.md).

**Próximo:** em Sol Médio, mapear produtores/deletores e versões de cada estrutura ausente; então implementar validação incremental orientada pelos tipos e fixtures de comandos reais, sem inventar invariantes históricos. Ainda não habilitar restore. A confirmação/recuperação pré-bootstrap, isolamento de abas antigas e teste real de interrupção/reload continuam pendentes; QA mobile, R25-B e fragmentos permanecem separados.

## R25-A2b4 — conferência isolada na interface (28/10/2026)

**0.1.93 local**, branch codex/fitness-ui-integration/base b11ed9d. Sol Médio solicitado pelo usuário. [Registro](plans/R25-A-BACKUP-DO-PROGRESSO.md). Grimório → Guarde sua jornada → Conferir restauração com o app pausado (`/?progresso=restaurar`). Tela antes de App/stores/auth permite exportar estado atual, selecionar arquivo e comparar perfis/XP/atividades. Diário pendente encaminha à tela e pausa controles sem ler um par misturado. Eventos storage/cancelamento invalidam resultados atrasados; não há handler de gravação ou parâmetro de URL que habilite restore.

**Executado:** 14 testes novos; suíte completa **334 aprovados**. Após ajuste final de erro JSON sem conteúdo bruto, **85 testes de backup** repetidos, TypeScript/lint limpos e build `envDir:false` **11,34s**. Diff-check e versões conferidos; oito arquivos stores/auth/sync/tipos/journal/coordenador preservados por SHA-256. Avisos bundle/Browserslist permanecem. Sem browser/QA mobile, dados pessoais, download pessoal observado, gravação/restore, rede do app, commit/push/deploy.

**Próximo:** compatibilidade restante e confirmação/recuperação acionáveis pré-bootstrap, incluindo tratamento de abas antigas. Aplicação permanece desabilitada até fechar critérios de domínio e teste real de interrupção/reload. R25-B conta online, QA global mobile e fragmentos separados. Manter Sol Médio para trabalho delimitado; elevar só diante de complexidade demonstrada, sem troca automática. Reserva encerrada, revisão sequencial pelo Astro Boy; Fábio frontend/mobile, Matheus backend/contratos.

## R25-A2b3 — compatibilidade e coordenação exclusiva (28/10/2026)

**0.1.92 local**, branch codex/fitness-ui-integration/base b11ed9d. Usuário confirmou Sol Alto. [Registro técnico](plans/R25-A-BACKUP-DO-PROGRESSO.md). Ambos os pares do diário são validados antes de executar/recuperar; baseline parcial recusa. Auditoria aponta vínculos ausentes/circulares/divergentes e experiência legado que a hidratação converteria. Regra existente preservada.

Coordenador exclusivo isolado exige página anterior ao import do app, Web Locks, confirmação de fechamento de abas/substituição e cópia anterior correspondente. Bloqueia operação na página já iniciada, inclusive import parcialmente falho. Guarda bytes/consentimento antes de awaits. Sem chamador de UI/produção; restauração continua desabilitada e recuperação automática não integrada. Fechamento de abas antigas é confirmação humana, não prova técnica de ausência de escritor externo.

**Executado:** 12 testes novos; **320 testes totais**, TypeScript e lint limpos, build `envDir:false` **19,99s**, diff-check e versões sincronizadas. Oito arquivos stores/auth/sync/tipos/main/bootstrap preservados por SHA-256. Avisos bundle/Browserslist permanecem. Sem browser, dados pessoais, restore real, rede do app, secrets, commit/push/deploy.

**Próximo:** confirmação/recuperação pré-bootstrap e compatibilidade restante; tratar abas antigas/isolamento e testar interrupção/reload real. R25-B conta online, QA mobile e fragmentos permanecem pendentes. Manter Sol Alto na integração crítica; voltar ao Médio após evidência de fechamento. Reserva encerrada, revisão sequencial de código/documentação pelo Astro Boy; Fábio frontend/mobile, Matheus backend/contratos.

## R25-A2b2d — validação de Treinos nos backups (28/10/2026)

**0.1.91 local**, branch codex/fitness-ui-integration/base b11ed9d. [Registro](plans/R25-A-BACKUP-DO-PROGRESSO.md). Auditoria de planos/séries/sessões nativos e legados, sessão ativa, check-ins, recibos e medidas em perfis ativos/inativos. Integra comparação/preparo de diário; não altera dados nem recalcula recompensas. Histórico não exige template ainda existente.

**Executado:** seis testes novos com comandos reais em memória; **308 totais**, TypeScript, lint limpos, build `envDir:false` **18,25s**. Diff-check e versões conferidos; SHA-256 confirma seis arquivos stores/auth/sync/tipos de Treinos/main intactos. Avisos bundle/Browserslist permanecem. Sem navegador, dados pessoais, restauração, rede do app, commit/push/deploy.

**Próximo:** vínculos/compatibilidade e validação dos dois lados do diário; aplicação exclusiva antes de stores/auth com cópia anterior e confirmação; teste real de interrupção/reload/mobile. Restauração segue desabilitada; auditoria ainda não certifica todo o domínio/catalogo/ratings/strengthRecords. R25-B conta online permanece separado. Reserva encerrada após revisão sequencial pelo Astro Boy.

**Restante geral:** quatro frentes, não quatro rodadas: backup/restauração e conta; QA mobile/tablet; polimento visual/acessibilidade/animações; fragmentos/inventário e persistência. Sem percentual ou prazo inventado. Matheus backend/contratos, Fábio frontend/mobile.

## R25-A2b2c — dados críticos conferidos na prévia (28/10/2026)

**0.1.90 local**, branch codex/fitness-ui-integration/base b11ed9d. [Registro](plans/R25-A-BACKUP-DO-PROGRESSO.md). Auditoria de estruturas críticas, XP/recibos/contadores/descendentes/perfis com avisos na prévia; preparo de diário recusa problemas conhecidos. Não repara dados nem habilita restauração. Treinos ainda tem somente checagem das coleções/IDs; relações e semântica completa permanecem pendentes.

**Executado:** oito testes novos, **302 testes totais**, TypeScript e lint limpos, build `envDir:false` **15,67s**. Diff-check passou, versões sincronizadas. SHA-256 confirma sete arquivos de stores/auth/sync/tipos/main/bootstrap preservados. Avisos de bundle/Browserslist permanecem. Sem dado pessoal, restauração, chamada remota, commit/push/deploy.

**Abertura resolvida segundo o usuário:** porta 5173 estava sem servidor; Vite reiniciado em 127.0.0.1:5173 sem carregar .env, e usuário confirmou “O Santuário abriu”. Processo ativo conferido. Inspeção visual do agente segue recusada por política salva; nenhum contorno. Prévia não reinicia automaticamente após encerramento do processo.

**Próximo:** validação aninhada de Treinos, vínculos/compatibilidade dos snapshots e diário; execução exclusiva antes do bootstrap com tratamento de abas antigas/isolamento de auth e confirmação/cópia anterior. R25-B online e QA visual continuam pendentes. Reserva encerrada, revisão sequencial pelo Astro Boy; Matheus backend, Fábio frontend/mobile.

## R25-A2b2b — inicialização protegida (28/10/2026)

**0.1.89 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`. [Registro técnico](plans/R25-A-BACKUP-DO-PROGRESSO.md). main confere diário pendente antes do import dinâmico do app/stores/auth; pendência ou leitura negada mostra tela de proteção sem gravação. Web Locks compartilhados mantêm sessões compatíveis durante a vida do documento; falha parcial de import também retém lease até recarga. Uso normal preservado quando API ausente; restauração continua desabilitada.

**Executado:** nove testes novos, **294 testes totais**, TypeScript, lint sem avisos, build `envDir:false` **17,18s** e diff-check passaram. SHA-256 confirma appStore/workoutStore/authStore/supabaseCloudSync/types intactos. Avisos de bundle/Browserslist permanecem. Sem QA visual, dados pessoais, restore, rede do app, commit/push/deploy. Codex retornou `queued` ao pedido de abrir Santuário; não é confirmação visual.

**Próximo:** validação de destino/compatibilidade e fluxo exclusivo anterior ao bootstrap, resolvendo abas antigas e isolamento de auth/sync antes de habilitar recuperação e confirmação de restauração. Lease simulada não comprova comportamento real de abas/BFCache. Conta online R25-B, backup pessoal observado e QA mobile continuam pendentes. Reserva encerrada; revisão sequencial pelo Astro Boy; Matheus mantém backend/contratos e Fábio frontend/mobile.

## R25-A2b2a — protocolo de recuperação isolado (28/10/2026)

**0.1.88 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`. [Registro técnico](plans/R25-A-BACKUP-DO-PROGRESSO.md). Implementado diário versionado com integridade, gravação verificada dos dois envelopes e recuperação retomável. Antes do marcador de confirmação, restaura os bytes anteriores; depois, preserva o destino confirmado. Conflitos detectáveis e diário inválido interrompem sem apagar evidência.

**Executado:** 12 testes novos, suíte completa **285 aprovados**, TypeScript e lint sem avisos. Build `envDir:false` (6,96s), diff-check e SHA-256 dos seis arquivos preservados passaram. Dados sintéticos/storage em memória; sem navegador, dados pessoais, rede do app, commit/push/deploy. Nenhum import de produção usa o novo módulo. Stores/core/auth/sync/tipos/entrypoint preservados neste lote.

**Próximo:** A2b2b integrar validação de domínio/compatibilidade, recuperação antes da hidratação e exclusão de escritores/abas com isolamento de autosync. A biblioteca exige acesso exclusivo externo; comparações não são um lock. Restauração segue indisponível na UI. Cópia anterior e confirmação do usuário, associação online R25-B e QA mobile permanecem pendentes. Reserva encerrada; revisão sequencial de implementação e documentação pelo Astro Boy. Matheus mantém contratos/backend; Fábio frontend/mobile.

## R25-A2b1 — prévia comparativa implementada (27/10/2026)

**0.1.87 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Registro e aplicação pendente](plans/R25-A-BACKUP-DO-PROGRESSO.md). Grimório → Cópia de segurança → Conferir arquivo salvo → Comparar com meu progresso. Comparação por perfil de IDs/conteúdo, adições/alterações/remoções, XP e históricos de Treinos. Identifica diferenças de origem/versão/perfil ativo; invalida prévia ao mudar estado. Não soma recompensas nem grava dados.

**Executado:** suíte completa 273 testes; após ajuste de cleanup, 24 testes de backup repetidos. TypeScript, lint sem avisos e build `envDir:false` final (14,01s) passaram. Diff-check limpo. Cinco arquivos core/auth/sync/tipos preservados por SHA-256. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, chamada remota, commit/push/deploy.

**Próximo:** A2b2 diário de recuperação e coordenação de gravação/hidratação, com aplicação ainda desabilitada até demonstrar rollback, quota/interrupção, concorrência e isolamento do autosync. A inspeção do authStore confirmou observador que pode enviar alterações do core automaticamente; dois stores não formam transação atômica. A2b1 é somente prévia, não restauração completa nem validação integral de domínio. R25-B conta online, QA mobile R28-F, fragmentos/sync continuam pendentes. Reserva encerrada; revisão sequencial de código/documentação pelo Astro Boy.

## R25-A2a — preservação de contas e carregamento corrigidos (27/10/2026)

**0.1.86 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Registro A2a](plans/R25-A-BACKUP-DO-PROGRESSO.md#r25-a2a--correções-de-preservação-0186). Criar conta captura o progresso da conta de saída; salvar/alternar mantém o ID do personagem. Treinos usa o estado fornecido pelo callback de hidratação, evitando acesso antes da inicialização. Backup agora exige core e Treinos carregados.

**Executado:** seis regressões novas (quatro falharam antes da correção); 264 testes totais passaram, TypeScript, lint e build `envDir:false` (16,03s). Diff-check limpo. AuthStore, serviço de sync e tipos preservados por SHA-256. Revisão delimitada confirma nenhuma alteração de fórmula de XP/Prana. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, chamada remota, commit/push/deploy.

**Próximo:** R25-A2b restauração coordenada com prévia, cópia anterior, confirmação e rollback; R25-B associação online separada. Não habilitar aplicação de backup antes dos testes de falha/quota/interrupção. Este lote previne o defeito nas operações seguintes; não recupera dados antigos perdidos. Backup pessoal e crédito retroativo pessoal continuam não observados. QA mobile R28-F, fragmentos/sync e fechamento visual global pendentes. Reservas A2a encerradas; revisão sequencial pelo Astro Boy. Matheus mantém contratos/backend; Fábio frontend/mobile.

## R25-A1 — cópia e conferência implementadas (27/10/2026)

**0.1.85 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Escopo e evidências](plans/R25-A-BACKUP-DO-PROGRESSO.md). Grimório → Cópia de segurança exporta as projeções persistidas de personagem/atividades e Treinos, com todas as contas locais. Conferência de arquivo valida estrutura e SHA-256 sem aplicar dados. Não há restauração habilitada nem backup pessoal observado nesta rodada.

**Executado:** 258 testes (nove específicos de backup), TypeScript, lint e build `envDir:false` (20,84s). Diff-check limpo; cinco arquivos de core/auth/cloud/tipos preservados por SHA-256 neste lote. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, sync remoto, secrets, commit/push/deploy.

**Próximo:** R25-A2 deve tratar dois defeitos reproduzidos com dados sintéticos: criação de conta não captura o estado ativo anterior e readiness de Treinos fica falso na inicialização síncrona. Depois, restauração com prévia, confirmação, backup anterior e rollback; associação online R25-B separada. QA mobile R28-F e contratos de fragmentos/sync continuam pendentes. Reservas A1 encerradas; revisão documental sequencial pelo Astro Boy. Matheus backend; Fábio frontend/mobile.

## R28-F5 — cancelamento e contexto verificados por código (27/10/2026)

**0.1.84 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Registro F5](plans/R28-F-REVISAO-MOBILE.md). Invocar isola campos por conta e permite cancelar sugestão; Voltar mantém texto manual e invalida resposta pendente. Respostas antigas não sobrescrevem nova tentativa. Invocar/Forja bloqueiam callbacks de conta anterior. Cancelar diálogos da Forja não grava dados; reabrir lê o salvo.

**Executado:** 249 testes, TypeScript, lint e build `envDir:false` (58,49s). SHA-256 confirma cinco arquivos de core preservados neste lote; versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, chamada Supabase/Cloudflare, secrets, commit/push/deploy. I03 remoto e XP retroativo pessoal não executados.

**Próximo:** R25-A inventário e backup/restauração validável do progresso local, seguido de associação segura à conta R25-B. QA mobile R28-F depende da inspeção disponível; não contornar bloqueio salvo. Formulários não salvos continuam temporários, sem autosave ou persistência paralela. Fragmentos/sync e fechamento visual global continuam pendentes. Reservas F5 encerradas; revisão sequencial pelo coordenador. Matheus backend; Fábio frontend/mobile.

## R29-D — recompensas visuais compartilhadas implementadas (27/10/2026)

**0.1.83 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Escopo, testes e limites](plans/R29-D-RECOMPENSAS-VISUAIS.md). Painel comum em Ciclos, lista/trilhas de Rituais, conquistas e resumo de Treinos. Ganho real, zero, ausência e reversão distintos; nível confirmado e movimento reduzido. Observador da lista suprime histórico/hidratação/conta e reconcilia Undo. Resumo de treino não reproduz celebração histórica.

**Executado:** 243 testes, TypeScript, lint e build `envDir:false` (15,22s). SHA-256 confirma stores/tipos/helpers de recompensa preservados neste lote; versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, sync remoto, commit/push/deploy. Crédito retroativo pessoal ainda não aplicado/observado.

**Próximo:** R28-F5 revisão de cancelamento/contexto dos formulários; QA mobile R28-F ao permitir inspeção. Backup/conta R25 e contratos de fragmentos/sync continuam pendentes. Reservas R29-D encerradas; revisão sequencial pelo coordenador. Matheus backend; Fábio frontend/mobile. Animações globais ainda não encerradas.

## R29-C — conclusão de conquistas implementada (27/10/2026)

**0.1.82 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Contrato, UX e evidências](plans/R29-C-CONQUISTAS.md). Jornadas/Grandes Obras e trilhas ganham Concluir/Reabrir com prévia explícita, bônus já configurado, snapshot e reversão original. Rituais/subitens pontuais devem estar concluídos; ciclos permanecem recorrentes. Barras de catálogo/detalhes leem dados atuais sem regravar progress.

**Executado:** 238 testes, TypeScript, lint, build `envDir:false` (17,11s), diff-check e versões sincronizadas. Avisos de bundle/Browserslist permanecem. Sem navegador, dados pessoais, sync remoto, commit/push/deploy. Crédito retroativo pessoal R29-R ainda não aplicado/observado.

**Próximo:** R29-D recibos/animações compartilhados ligados a concessões reais. QA mobile R28-F, backup/conta R25 e contratos de fragmentos continuam pendentes. Reservas R29-C encerradas; revisão sequencial pelo coordenador. Matheus backend; Fábio frontend/mobile. Trabalho anterior preservado.

## R29-R/B — recuperação preparada e XP de Rituais (27/10/2026)

**0.1.81 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Contrato, operação e evidências](plans/R29-RECUPERACAO-E-RITUAIS.md). Ciclos oferece prévia de XP histórico, confirmação explícita, cópia local anterior e marcadores contra duplicação. Rituais/subitens ganham snapshot por folha e Undo pelo valor/elemento original; pais não duplicam e adapter nativo é preservado.

**Executado:** 231 testes, TypeScript, lint, build `envDir:false` (22,08s), diff-check e versões sincronizadas. Avisos de bundle/Browserslist permanecem. **XP pessoal ainda não aplicado/observado**: navegador recusou acesso mesmo após liberação informada; não contornado. Aplicação disponível em Ciclos → Seu esforço também conta → Conferir recuperação. Não afirmar valor recuperado sem observar execução.

**Próximo:** R29-C conclusão/reabertura explícita e bônus de Jornadas/Grandes Obras; depois R29-D recibos/animações compartilhados. R25 backup/conta, QA mobile R28-F e contratos de fragmentos continuam pendentes. Reservas R29-R/B encerradas, revisão sequencial pelo coordenador. Matheus backend, Fábio frontend. Sem dados pessoais, migração remota, commit/push/deploy.

## R29-A — XP dos Ciclos e recibo elemental (27/10/2026)

**0.1.80 local**, base `b11ed9d`. [Diagnóstico, contrato, cobertura e próximas etapas](plans/R29-XP-E-RECOMPENSAS.md). Reproduzido com store real isolado: concluir Ciclo não creditava XP. Novas conclusões válidas creditam os pontos já calculados como XP no elemento correspondente, com snapshot por recibo e Undo exato. Agregadores não duplicam; histórico antigo e contadores extras não são recalculados.

Recibo de Ciclos mostra ganho real, elemento, barra do personagem e nível alcançado, com movimento reduzido, dispensar e supressão em hidratação/troca de conta. **Executado:** 221 testes, TypeScript, lint, build envDir:false (16,92s) e diff-check passaram. Avisos de bundle/Browserslist permanecem. Sem navegador, persistência remota, dados pessoais, commit/push/deploy.

**Próximo:** R29-B: fechar concessão de XP em subitens de Rituais e simetria do Undo; depois bônus explícitos de Jornadas/Grandes Obras (R29-C), apresentação compartilhada/QA (R29-D). Pedido global de recompensas ainda parcial. Revisão de contexto/cancelamento R28-F5 fica após integridade de XP. R25 backup/conta, fragmentos e QA mobile continuam pendentes. Reservas R29-A encerradas; revisão sequencial pelo Astro Boy. Matheus mantém backend, Fábio frontend; impacto de contrato detalhado no plano.

## R28-F4 — falhas de criação e Forja tratadas (27/10/2026)

**0.1.79 local**, base `b11ed9d`, branch `codex/fitness-ui-integration`. [Registro F4](plans/R28-F-REVISAO-MOBILE.md). Forja preserva campos em falhas de captura/edição; exclusão/classificação só exibem sucesso após conferir o estado local. Invocar trata falhas nos cinco formatos de criação manual e mantém os dados. Guardas locais evitam repetição após sucesso; não substituem idempotência do backend.

**Executado:** 211 testes, TypeScript, lint e build `envDir:false` (8,95s) passaram. SHA-256 confirmou stores app/workout e tipos preservados. Versões sincronizadas e diff-check limpo; avisos de bundle/Browserslist permanecem. Nenhuma tentativa de navegador, gravação em dados pessoais ou chamada remota. Fluxo de IA preservado; não é evidência de persistência durável/sincronização.

Próximo: revisar estado temporário e cancelamento ao sair/trocar contexto em Invocar e demais formulários. Manter revisão somente código. QA mobile R28-F, backup/restauração R25-A/B e contratos continuam pendentes. Reserva F4 encerrada; revisão de código/documentação sequencial pelo Astro Boy. Sem commit/push/deploy.

## R28-F3 — retorno de Treinos revisado (26/10/2026)

**0.1.78 local**, base `b11ed9d`. [Registro F3](plans/R28-F-REVISAO-MOBILE.md). Séries/blocos conferem retorno real do comando, mostram erro em recusa/exceção e preservam campos para tentar novamente. Guarda local evita envio repetido antes da atualização; foco vai ao recibo somente depois de props confirmadas. Histórico não desloca foco.

**Executado:** 206 testes, TypeScript, lint e build `envDir:false` (11,04s) passaram. SHA-256 confirma stores/tipo/páginas ActiveWorkout e WorkoutSummary preservados. Versões sincronizadas e diff-check limpo; avisos de bundle/Browserslist permanecem. Não executados navegador, sessão real ou suíte Deno de domínio.

Próximo: tratar erros de captura/edição/exclusão na Forja e revisar confirmação manual de Invocar. Inspeção inicial encontrou handlers sem captura de exceção; correção ainda não implementada nesses dois módulos. Manter orientação de revisão somente código. R28-F visual, R25-A/B e contratos continuam pendentes. Reservas F3 encerradas; revisão documental sequencial. Sem commit/push/deploy.

## R28-F2 — revisão de foco do contador (26/10/2026)

**0.1.77 local**, base `b11ed9d`. Usuário escolheu continuar somente revisão de código; não tentar navegador por enquanto. [Registro F2 e matriz pendente](plans/R28-F-REVISAO-MOBILE.md). Contador devolve foco a Somar ao dia após salvar/desfazer e ao controle de configuração após cancelar, sem rolar, repetir comandos ou mover foco no erro.

**Executado:** 202 testes, TypeScript, lint e build `envDir:false` (8,93s) passaram. SHA-256 de cinco arquivos confirma stores/tipos/helper/página Ciclos preservados. Versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist permanecem.

Próximo: revisão de código do foco em Treinos e estados de erro/retorno. R28-F continua parcial: testes de navegador/mobile/leitor de tela não executados. R25-A/B e contratos mantidos. Reservas encerradas; revisão documental sequencial. Sem commit/push/deploy.

## R28-F1 — revisão parcial e atalho do Grimório (26/10/2026)

**0.1.76 local**, base `b11ed9d`. [Matriz de revisão e evidências](plans/R28-F-REVISAO-MOBILE.md). Corrigido tratamento dos links para seções do Grimório após reset global de rota, com foco programático e cancelamento de navegação obsoleta. Stores/tipos/histórico preservados por SHA-256.

**Executado:** 198 testes, TypeScript, lint e build `envDir:false` (6,81s) passaram; versões sincronizadas, diff-check limpo. Avisos de bundle/Browserslist permanecem. Revisão de código transversal registrada.

**Bloqueio atual:** navegador interno recusou observação da origem local por permissão salva nesta rodada. Pedido de revisão da permissão enviado; nenhum contorno e nenhuma evidência visual nova. QA 360/390/768px e R28-F não concluídos. Próximo: executar matriz ao liberar inspeção; manter R25-A/B backup/conta e contratos pendentes. Reservas F1 encerradas, revisão documental sequencial. Sem commit/push/deploy.

## R28-E — marcos nas trilhas implementados (26/10/2026)

**0.1.75 local**, base `b11ed9d`. [Escopo e evidências](plans/R28-E-MARCOS.md). Recibo de ritual distingue avanço, todos os rituais da trilha realizados e subida de nível confirmada pelo getter existente. Mostra progresso e próxima sugestão da trilha de origem; ciclos continuam recorrentes. Modal compacto com rolagem, fechar e continuar sem espera. Recorte no QuestHub, não cobertura global de conquistas.

**Executado:** 194 testes, TypeScript, lint e build `envDir:false` (6,69s) passaram. SHA-256 de seis arquivos confirma stores/tipos/comandos/timer/projeção preservados; versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist continuam. Sem validação de navegador/mobile/FPS/cloud.

Próximo: R28-F revisão transversal e QA 360/390/768px; cobertura restante de marcos requer eventos reais. R25-A/B backup/conta e fragmentos continuam pendentes. Reservas encerradas; revisão documental sequencial. Sem commit/push/deploy.

## R28-D2 — Treinos implementado; QA mobile pendente (26/10/2026)

**0.1.74 local**, base `b11ed9d`. [Entrega e evidências](plans/R28-D2-TREINOS.md). Séries/blocos ganham recibo com valores reais, confirmação breve somente após conclusão nova e cancelamento por movimento reduzido. Expansão compartilhada com controles inertes quando fechados; barras por transformação e pressionamento reduzido.

**Executado:** 189 testes, TypeScript, lint e build `envDir:false` (6,87s) passaram; quatro testes do lote repetidos após ajuste do contêiner. SHA-256 confirma stores/tipos/sessão/resumo inalterados. Versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist permanecem. Sem navegador/FPS/execução real ou suíte Deno nova.

Próximo: QA mobile 360/390/768px e R28-E marcos, seguido de revisão R28-F. R25-A/B backup/conta e demais contratos continuam pendentes. Reservas encerradas; revisão documental sequencial. Sem commit/push/deploy.

## R28-C1 / D1 — salto de Domínios corrigido e Roda avançada (26/10/2026)

**0.1.73 local**, base `b11ed9d`. [Causa, implementação e testes](plans/R28-D1-ROLAGEM-E-RODA.md). Alterar grupo/filtro de Domínios e Mapa não dispara mais reset global ao topo; navegação real continua resetando. Roda permite pular apresentação sem repetir sorteio e acompanha movimento reduzido dinâmico. Stores, tipos, recompensas e trabalho preexistente preservados.

**Executado:** 185 testes, TypeScript, lint e build `envDir:false` (7,87s) passaram. Regressão do efeito real de scroll com dublês e testes de timer/skip/desmontagem; não são prova visual de navegador. SHA-256 de stores/tipos preservado, versões sincronizadas e diff-check limpo. Avisos de bundle/Browserslist permanecem.

Próximo: confirmar correção em mobile e R28-D2 Treinos; depois marcos/revisão final. QA acumulado e R25-A/B backup/conta continuam pendentes. Reservas encerradas; revisão documental sequencial. Sem commit/push/deploy.

## R28-C — exploração e leitura implementadas; QA mobile pendente (26/10/2026)

**0.1.72 local**, base `b11ed9d`, R27/R28-A/B preservados. [Entrega e roteiro](plans/R28-C-EXPLORACAO-LEITURA.md). Painel de expansão compartilhado em Domínios, Pilares, Mapa e menu Explorar; controles fechados inertes, movimento reduzido respeitado. Busca/categoria do Mapa na URL; resultados revelados sem controle de recolher conflitante. Dados, pontuação e destinos preservados.

**Executado:** 181 testes, TypeScript, lint e build `envDir:false` (8,80s) passaram. SHA-256 de stores/tipos e páginas Dominios/Pilares/Mapa inalterado desde início. Versões sincronizadas, diff-check limpo. Avisos de bundle/Browserslist permanecem. Sem navegador, medição de FPS ou aceite visual novo.

Próximo: QA 360/390/768px e R28-D Treinos/Roda. R25-A/B backup/conta e contratos anteriores continuam pendentes. Reservas encerradas; revisão documental sequencial pelo coordenador. Sem commit/push/deploy.

## R28-B — criação e organização implementadas; QA mobile pendente (26/10/2026)

**0.1.71 local**, base `b11ed9d`, R27/R28-A preservados. [Entrega, evidências e roteiro](plans/R28-B-CRIACAO-ORGANIZACAO.md). Invocar ganha transição direcional, controles de saída inertes e confirmação com destinos explícitos, sem redirecionamento automático. Forja identifica a ideia no resultado e restaura foco ao fechar diálogos. Seleção elemental das trilhas com resposta breve; celebrações e comandos preservados.

**Executado:** 177 testes, TypeScript, lint e build `envDir:false` (8,34s) passaram. Nove chamadas de domínio idênticas por AST; SHA-256 dos stores/tipos inalterado desde início do lote. Avisos de bundle/Browserslist permanecem. Sem inspeção renderizada/FPS ou teste de sync remoto.

Próximo: aceite 360/390/768px e R28-C exploração/leitura. R25-A/B backup/conta e contratos anteriores permanecem pendentes. Reservas encerradas; revisão documental sequencial pelo coordenador. Sem commit/push/deploy.

## R28-A — fundação e piloto implementados; aceite mobile pendente (25/10/2026)

**0.1.70 local**, sobre R27/base Git b11ed9d. Fábio aprovou começar a sequência. [Entrega e roteiro de aceite](plans/R28-A-FUNDACAO-PILOTO.md). Tokens compartilhados, preferência dinâmica, navegação sem blur, diálogos reduzidos e pressionamento opt-in. Contador usa transform e feedback local estável; conclusões rápidas são agrupadas por recibo no mesmo aviso, com remoção após Undo. Nenhuma premiação pela animação.

**Executado:** 174 testes, TypeScript, lint e build `envDir:false` (10,11s) passaram. Diff-check limpo e versões sincronizadas; SHA-256 confirma appStore/workoutStore/types/Ciclos.tsx idênticos ao início do lote, preservando R27. Avisos de chunks/Browserslist permanecem. Sem navegador, FPS ou aceite visual novo; bloqueio anterior não contornado.

Próximo: validar o piloto 360/390/768px, corrigir diferenças reproduzidas e avançar criação/organização. R25-A/B e contratos continuam pendentes; não prometer preservação cloud. Início da fase já autorizado, sem necessidade de reconfirmar esse escopo. Reservas encerradas; revisão documental sequencial pelo coordenador. Sem commit/push/deploy.

## R28 — auditoria e proposta de próxima fase (25/10/2026)

Fábio pediu balanço do escopo e planejamento para animar ações em todas as abas posteriormente. [Relatório R28](plans/R28-AUDITORIA-MOVIMENTO.md): estado por área, pendências R25/R19/NOTE/fragmentos, cinco achados estáticos de movimento, cobertura de ações e seis lotes propostos. Não implementado. Astro Boy conferiu achados de duas inspeções somente leitura; nenhum agente alterou código. Versão 0.1.69 e trabalho R27 preservados, ainda locais.

Nesta rodada: leitura de código/documentação e revisão do diff documental; sem testes/build/navegador novos, consulta remota, commit/push/deploy. Evidências R27 abaixo são da rodada anterior. Retomada: validar R27 no celular; manter R25-A/B prioritário para proteção do progresso; escolher fundação + piloto de Ciclos para a fase de animações. Planos executáveis serão delimitados depois dessa escolha. Revisão documental pelo coordenador; sem reservas de código abertas.

## R27 — contador genérico implementado; QA mobile pendente (25/10/2026)

**0.1.69 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`. [Entrega, contrato e roteiro de validação](plans/R27-QUANTIDADES-DIARIAS.md). Alterações R27 preexistentes continuadas; Astro Boy sequencial. Fábio confirmou quantidades sem XP adicional e conclusão separada, depois pediu contador para qualquer atividade: presets Água/Aulas/Banhos removidos.

**Entregue:** Adicionar contador em ciclos comuns, padrão de repetições, meta ajustável, medida/incremento personalizados, prévia e Somar ao dia. Histórico por data, Undo individual, valores além da meta e após conclusão. Guia distingue ciclo/sequência/subitem; vista ociosa de Hoje acompanha a nova data sem limpar histórico. Feedback de confirmação observa recibos reais; campos opcionais usam action/hábito e snapshots existentes. Treinos nativos mantêm medição própria; sem contador nos subitens individuais/Rituais neste recorte.

**Executado:** 170 testes passaram (store real em memória isolada + SSR/helpers), TypeScript, lint e build Vite `envDir:false` (7,60s) passaram; versões sincronizadas e diff-check limpo. Lint encontrou cascata no efeito de execução, corrigida com agendamento/cancelamento de frame. Avisos de chunks grandes/Browserslist permanecem. Não foram alterados serviços remotos, fórmulas de XP/Prana ou dados pessoais.

**Pendente:** QA renderizado/toque/fluidez 360/390/768px e execução completa no navegador; bloqueio anterior de localhost não contornado. Sync remoto não foi testado; não prometer proteção da futura conta. Próximo: roteiro genérico do R27 e R25-A/B (backup/associação segura), preservando pendências R19/NOTE/fragmentos. Módulo visual de hidratação é futuro, não implementado. Sem commit/push/deploy R27. Reservas encerradas; revisão documental pelo coordenador, independente pendente.

01/11/2026 — Matheus pediu remover “foguinhos” e depois retirou a preferência pelo badge “Atividade recente”. Ciclos agora não exibe selo/ranque de streak nem badge de atividade nos cards. A conclusão/desmarcação é checkbox junto ao nome; o botão textual “Concluir” saiu e “Iniciar” permanece independente. Badge elemental ampliado com ícone e nome legível. Sem alteração em streak persistido, bônus, XP, Prana ou cálculo. Marcos/ciclos com bônus continuam dependentes da definição de Game Design. UI versionada como 0.1.70. Validação estática final pendente; testes automatizados não executados e QA visual pendente.

01/11/2026 — Matheus pediu que o modal de sequência salvasse tudo junto. Nome, dias da semana, inclusão/remoção e ordem dos membros agora ficam em rascunho no editor; “Salvar alterações” aplica o conjunto e “Cancelar” fecha sem aplicar. O menu “Editar sequência” segue abrindo o editor na aba Sequências. Sem mudança de contrato de armazenamento ou pontuação. ESLint, TypeScript e diff-check passaram; sem teste automatizado/QA visual.

01/11/2026 — Matheus pediu simplificar visualmente os cards com filhos, aproximando-os do checkbox do pai e deixando clara a indentação de subtarefas. Filhos agora usam o mesmo checkbox quadrado/acessível antes do nome, ficam em linhas simples sem subcards escuros e formam uma árvore com recuo/guia lateral. Tipo de subitem, ações, execução e pontuação não foram alterados. ESLint, TypeScript e diff-check passaram; sem teste automatizado/QA visual.

01/11/2026 — Matheus preferiu o padrão de cards de Treino: removido o controle/contador de subitens e colocado um chevron no cabeçalho da tarefa que possui filhos. A seta mostra fechado/aberto e abre/recolhe o conteúdo, sem texto de quantidade. Itens filhos com seus próprios subitens usam o mesmo chevron ao lado do nome. ESLint, TypeScript e diff-check passaram; sem teste automatizado/QA visual.

01/11/2026 — Matheus pediu remover dos itens de ação a microcópia “Ação” e “Conclua quando realizar”. A lista agora mostra nome e checkbox diretamente; os rótulos Checklist, Nota e Etapa continuam para distinguir estruturas que precisam dessa identificação. Sem mudança de semântica/execução. ESLint de Ciclos.tsx, TypeScript da aplicação e diff-check passaram; testes automatizados e QA visual não executados.

01/11/2026 — Matheus observou que os números de posição (1, 2...) ainda apareciam abaixo dos nomes dos subitens. Removidos da UI e da identidade do componente; recuo/chevrons mantêm a indicação hierárquica. ESLint, TypeScript e diff-check aprovados; testes automatizados não executados.

01/11/2026 — Matheus pediu que badge de área/subárea dos subitens fosse compacto como o do agregador. Aplicados altura limitada, texto em linha única e reticências para nomes longos, mantendo cores e título completo no hover. ESLint de Ciclos.tsx, TypeScript da aplicação e diff-check passaram; testes automatizados e QA visual não executados.

01/11/2026 — Matheus pediu dar mais espaço ao nome do subitem e alinhar os badges de elemento e área/subárea na linha inferior. Nome permanece na linha superior; badges compactos de elemento e área ficam lado a lado abaixo, com reticências para área longa. Sem mudanças na pontuação ou nos dados. Validação estática pendente; testes e QA visual não executados.

01/11/2026 — Correção de escopo após esclarecimento: badge elemental não deve aparecer nos subitens. Ele foi removido de lá e movido para a linha de metadados dos cards principais (incluindo o membro de sequência), alinhado ao badge de área/subárea; o nome permanece com mais espaço na linha superior. Validação estática pendente; sem testes/QA visual.

01/11/2026 — Ajuste visual: Matheus prefere badge elemental maior que o badge de área/subárea, mantendo ambos centralizados verticalmente na mesma linha. Removido o tamanho compacto aplicado ao badge elemental; área/subárea continua compacta. Validação estática pendente.

01/11/2026 — Ao editar subitem, o formulário compartilhado de edição de Ciclos agora identifica o contexto: oculta os dias da semana, informa que a frequência vem do agregador e não grava `recurrenceConfig`/`recurrenceType` no subitem. Ciclos pais continuam editando a própria recorrência. Validação estática pendente; sem testes/QA visual.

01/11/2026 — Matheus pediu controles para subir/descer a pontuação base no editor de ciclo. Adicionados botões explícitos de incremento/decremento junto ao campo numérico, respeitando limites 1–100 e estado bloqueado de agregadores; edição manual também é limitada à mesma faixa. Validação pendente.

01/11/2026 — Corrigida origem do badge elemental dos agregadores: cards com subitens agora derivam os elementos das áreas dos descendentes pontuáveis, em vez de usar apenas o elemento atribuído ao pai. Exibe cada elemento distinto presente (ex.: Fogo) alinhado às áreas agregadas; cards sem filhos continuam usando seu próprio elemento. Validação pendente.

01/11/2026 — Corrigida integridade área/subárea em subitens: ao trocar a área no editor, subárea incompatível é limpa; ao salvar, só persiste subárea cujo `parentId` corresponde à área. `addHabitChild` valida o par herdado antes de criar, e `updateHabitChild` normaliza gravações inválidas (incluindo IDs primários sincronizados) e resolve elemento também para áreas customizadas. Evita combinação impossível como Carreira + Suplementação. Validação estática pendente; testes/QA visual não executados.

01/11/2026 — Matheus pediu remover o rótulo “Etapa” mostrado ao adicionar netos. Subitens pontuáveis com filhos agora usam apenas o chevron de expandir/recolher; permanecem os rótulos “Checklist” e “Nota” para tipos não pontuáveis. Sem mudança de semântica. Validação pendente.

01/11/2026 — Matheus pediu tirar também o rótulo “Checklist” dos netos. Removido o rótulo/ícone redundante dos subitens estruturais; checkbox e nome já comunicam sua função. “Nota” permanece identificado. Validação pendente.

01/11/2026 — Matheus pediu remover também “Nota” e alinhar o nome do subitem mais harmoniosamente na linha. Removidos texto e ícone de Nota; identidade do subitem agora centraliza verticalmente o nome e o chevron. O indicador “Feito” permanece para subitens concluídos. Validação pendente.

01/11/2026 — Notas em Ciclos agora são texto puro: ao editar/converter para Nota, a UI oculta área, subárea, pontuação e tempo; a Store zera esses valores e remove a classificação. A agregação de tempo/pontos/áreas/badges ignora notas e checklists sem valor, e agregadores sem descendentes pontuáveis deixam de herdar área/subárea fantasma. Backup de pontuação/tempo para futura conversão de volta continua preservado. Validação estática pendente; testes/QA visual não executados.

31/10/2026 — Matheus pediu remover “Salvar e iniciar agora”. `NativeTemplateDialog` agora apenas salva o template e fecha; removido o caminho submitter que iniciava uma sessão e navegava ao ativo. Execução continua no botão do card/previsão. Sem mudança no store ou regra do domínio. Validação pendente.

31/10/2026 — Matheus pediu retirar por enquanto o subcard “Perfil muscular informado” do editor de treinos. Removido o controle manual de overrides e sua validação impeditiva em `NativeTemplateDialog`; os dados existentes permanecem no plano e continuam a ser serializados ao salvar. Filtros anatômicos e informações do catálogo continuam intactos. Sem alteração em cálculo/pontuação/store. Validação pendente.

31/10/2026 — Matheus pediu que ao adicionar exercício do catálogo ou criar exercício manualmente no modal de edição, o card novo também inicie todo recolhido. `NativeTemplateDialog.addExercise` adiciona o plano e marca como recolhidos o card e os IDs de suas séries. Abrir para editar continua disponível. Sem alteração de store/pontuação/dados persistidos; validação pendente.

31/10/2026 — Matheus pediu que ao editar treino os cards de exercícios e séries iniciem fechados. `NativeTemplateDialog` inicializa o conjunto de recolhimento com IDs dos exercícios/séries existentes no template (ou registro legado quando o editor é aberto desse fluxo); criação nova mantém estado inicial aberto para facilitar configuração. Usuário continua podendo expandir e editar. Nenhum dado/store/pontuação alterado. Validação pendente; mudanças locais anteriores preservadas.

31/10/2026 — Matheus informou que não quer mais o tipo antigo de card na lista de treinos. Removido `LegacyTemplateCard` da Biblioteca oficial em `FitnessRoot`; “Meus treinos” agora renderiza somente `WorkoutTemplate`, e modalidades adicionais vêm do catálogo/templates, não da lista legada. `Workout` persistido, histórico e fluxo legado não foram apagados nem migrados; preservados fora dessa lista. Mudança de apresentação apenas, sem store, persistência ou pontuação. Validação pendente; alterações locais anteriores preservadas.

## R28 — barra global nas páginas elementais (31/10/2026)

Após R27, Matheus observou ausência da barra inferior no Santuário e pediu mantê-la nas páginas principais. Causa localizada: `ElementalPreview` não usa `AppLayout`/`FitnessPageShell` e não montava `MobileBottomNav`. Isso afetava 4 definições no `App.tsx` (`/santuario`, detalhes de elemento e dois aliases `/previa-elemental`), correspondentes a Santuário e detalhe elemental. Pilares e Ciclos já recebem a navegação por `AppLayout`; Fitness pelo `FitnessPageShell`; “Mais” abre o hub a partir da própria barra. Adicionado `MobileBottomNav` à casca elemental e reserva de 4rem + safe area abaixo do conteúdo para evitar sobreposição do rodapé. Auth e onboarding permanecem sem barra por serem fluxos de entrada.

Arquivos: `src/pages/ElementalPreview.tsx` e `src/pages/elemental-preview.css`; sem alteração de rotas, estado ou domínio. Base vista `b11ed9d`, estado preexistente R27 preservado. Revisão estática e `git diff --check` passaram; nenhuma validação visual/toque nem teste automatizado executados nesta tarefa. Sem commit/push.

## R27 — painel de páginas no Santuário, mobile (31/10/2026)

Checkout `main`, base observada `b11ed9d`, árvore inicialmente limpa. Arquivo reservado: `src/components/layout/AllRoutesSheet.tsx`. O painel global compartilhado por Santuário, navegação inferior e Fitness agora tem altura mobile de até 92dvh, cabeçalho/busca fixos e área independente de rolagem; alvos de rota viram linhas de uma coluna em telas estreitas, com cartões em grade preservados em telas maiores. Navegação, destinos e estado de busca continuam usando a implementação existente. Sem stores/persistência/back-end. Skill frontend-design local consultada. Revisão apenas estática até aqui; QA em aparelho/navegador e toque 360/390/768px pendente. Não executar testes automatizados nesta solicitação. Sem commit/push.

## R26-D e publicação R15–R26 — main confirmado (25/10/2026)

**0.1.68**, branch codex/fitness-ui-integration; base 88c9021 e alterações R26-A/B/C preservadas. [Revisão e situação de publicação](03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md), [repasse para Matheus](REPASSE-FRONTEND-PARA-BACKEND.md), [constância R26-D](plans/R26-D-CONSTANCIA-PROGRAMADA.md). Push autorizado concluído: `91fa5a5 → 0a1db75`; `ls-remote` confirmou o SHA completo no relatório. Inclui checkpoint 88c9021 e versão 0.1.68. Registro documental de fechamento vem em seguida, sem mudança de código.

Fábio aprovou **“Contar execuções programadas: dias de descanso não quebram a sequência.”** Regra integrada em ciclos diários/semanais/mensais, subitens pela agenda da raiz e treinos vinculados; leitura sem migração. Rotações e YEARLY mantêm fallback explícito. Streak geral, XP/Prana e recibos preservados. Notas históricas de cálculo pendente abaixo foram superadas apenas nesse recorte.

**Executado nesta revisão:** 159 testes, TypeScript, lint, build envDir:false (11,13s), paridade do store anterior nos cenários de prêmio/Undo/recibos. Avisos de bundle/Browserslist permanecem. QA visual/toque 360/390/768px continua pendente, sem contornar bloqueio anterior; revisão independente não executada.

Reservas de código e documentação encerradas após publicação; revisão documental pelo coordenador. Responsabilidades: Fábio frontend/mobile, Matheus backend, Astro Boy coordena sequencialmente. Próximo: QA R26 e R25-A/B (backup/conta), sem prometer proteção de dados ainda não validada; R19, NOTE, progresso macro e fragmentos permanecem na fila. Sem deploy, migração, dados reais ou credenciais.

## R26-C — subitens e constância contextual implementados (25/10/2026)

**0.1.67 local**, base 88c9021 e R26-A/B preservados. [Entrega, diagnóstico e pendências](plans/R26-C-SUBITENS-CONSTANCIA.md). Astro Boy sequencial.

UI identifica ações/checklists/notas/etapas e caminho hierárquico. Tipos canônicos/legados normalizados na leitura; notas separadas da contagem visual de ações. Executar etapas usa o fluxo existente. Constância ganha runa própria, recorde/última conclusão/registros recentes e animação breve apenas no aumento do mesmo contador/conta.

**Executado:** 148 testes, TypeScript, lint e build envDir:false (9,57s final) passaram. AST confirmou mudanças delimitadas à leitura de tipo e contagens de subitens; comandos preservados, diff de stores/services/types/Supabase vazio, versões sincronizadas e diff-check limpo. Avisos de chunks/Browserslist continuam.

**Pendente explícito:** regra persistida do streak não mudou. Pergunta dias corridos versus agenda ainda sem resposta; capítulo canônico diverge do store. Também registrar com Matheus propagação de conclusão do pai incluindo folhas NOTE, identificada por leitura. Não fingir que a contagem visual resolve esse contrato.

QA visual/toque/fluidez e teste integrado de execução continuam pendentes; bloqueio anterior não contornado. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push/deploy, alteração de dados reais ou backup pessoal. R25-A/B, R19 e R12-D/E mantidos.

## R26-B — Ciclos de hoje refinado; prévia iniciada (25/10/2026)

**0.1.66 local**, branch codex/fitness-ui-integration, commit base 88c9021; R26-A preexistente preservado. [Entrega e evidências](plans/R26-B-CICLOS-EXECUCAO.md).

Ações nomeadas Iniciar/Concluir/Desfazer, títulos com mais largura, acentos elementais, expansão de subitens em linha inteira e ordenação/elementos recolhíveis. Mesmos comandos, regras e stores. Widgets fitness e calendário preservados.

**Executado:** 141 testes, TypeScript, lint e build Vite envDir:false (12,23s) passaram; 367 inicializadores preservados por AST, diff de domínio vazio e diff-check limpo. Avisos de chunks/Browserslist permanecem. Um erro TypeScript introduzido no rótulo do menu da sequência foi corrigido antes da validação final.

Servidor local iniciado na porta 5173; pedido para abrir /ciclos no painel direito retornou queued. Não equivale a página renderizada verificada. Bloqueio anterior de inspeção não contornado; QA de toque/visual em 360/390/768px pendente. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push/deploy. Próximo: aceite da rotina e R25-A/B (backup/conta), ainda pendentes; R19/R12-D/E preservados.

## R26-A — Ciclos de hoje implementado; QA mobile pendente (25/10/2026)

**0.1.65 local**, base `88c9021`, branch `codex/fitness-ui-integration`. Fábio priorizou a rotina diária; Astro Boy executou sequencialmente. [Entrega e evidências](plans/R26-A-CICLOS-ROTINA.md).

Filtros diretos Todos/Pendentes/Feitos, progresso por cartões do dia, busca/ordenação compactas, cartões com subitens em largura útil e formulário rotulado reutilizado. Comandos, recorrência, pontuação, stores e dados preservados.

**Executado:** 138 testes Node, TypeScript, lint e build Vite `envDir:false` (14,38s) passaram. 367 inicializadores anteriores preservados por AST; diff de domínio/backend vazio e diff-check limpo. Avisos de chunks/Browserslist permanecem.

**Pendente:** QA renderizado/toque em 360/390/768px; navegador recusou localhost por permissão salva, sem contorno. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push/deploy. Próximo: validar a rotina e retomar R25-A/B (backup/conta), ainda não implementados. Salvar código não equivale a backup pessoal; R19 e R12-D/E continuam na fila.

## Checkpoint de progresso e próxima fase — 24/10/2026

**0.1.64 local**, branch `codex/fitness-ui-integration`, base publicada `91fa5a5`. Fábio solicitou salvar o progresso e priorizar uso prático no celular, preservando atividades/conquistas na futura conta pessoal. [Resumo consolidado e plano](PROGRESSO-ATUAL-E-PROXIMOS-PASSOS.md). Checkpoint Git local desta entrega reúne R15–R24 e este plano; consulte o commit de mensagem `feat(ui): checkpoint elemental mobile R15-R24 and continuity`. Nenhum novo push/deploy.

**Próximo:** R25-A backup exportável/restauração verificada → R25-B associação segura à conta com Matheus → R26 validação por jornadas mobile (360/390px, depois 768px). R25/R26 planejados, não implementados. Dados reais do navegador NÃO exportados nesta rodada; salvar código não é backup pessoal. Inspeção de auth encontrou importação local desativada e reset possível para conta cloud nova. Não prometer preservação até validar cobertura de core/treinos, conflitos, isolamento e recuperação. Stores/auth/cloud mantidos intactos.

## R24 — Roda do Destino implementada, QA visual pendente

[Entrega e evidências](plans/R24-RODA-DO-DESTINO.md). Aprovação explícita de Fábio: **“Sim, escolher atividades sem custo nem XP automático”**. Nova roda elemental com atividades reais, filtros de tipo/elemento, ciclos hoje/7 dias, resultado e links de execução. Removidos apenas custo/XP automático do sorteio; regras normais de conclusão preservadas.

**Executado:** 134 testes Node, TypeScript, lint e build Vite `envDir:false` (11,79s) passaram. Lint inicial teve dois erros nas novas sincronizações de vista, corrigidos sem suprimir regra. 549 inicializadores internos anteriores de Rituais/Ciclos preservados por AST. Diff de stores/services/types/Supabase vazio. Chunks grandes e Browserslist antiga permanecem. QA renderizado/interações reais pendente; bloqueio anterior não contornado.

Reservas R24 encerradas. Revisão documental pelo coordenador; revisão independente pendente. R15–R23 preservados. Pendências R19 e R12-D/E continuam na fila. Sem alteração de dados reais, migração ou comunicação externa.

## R23 — catálogo compacto de Domínios implementado (24/10/2026)

**0.1.63 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`. R15–R22 preservados. [Entrega e evidências](plans/R23-DOMINIOS-COMPACTO.md). Astro Boy sequencial; Fábio frontend, Matheus backend.

**Entregue:** quatro grupos recolhíveis por elemento, linhas compactas com acesso direto, busca/filtro revelando resultados e modo explícito Gerenciar vínculos. Grupo aberto preservado na URL e no retorno do detalhe. Rail, Showcase, formulários e comandos existentes preservados.

**Executado:** 128 testes Node, TypeScript, lint e build Vite `envDir:false` (17,21s) passaram. 26 inicializadores/handlers da página idênticos por AST; diff de domínio/backend vazio; versões e diff-check conferidos. Avisos de chunks/Browserslist permanecem.

**Pendente:** conferência visual e interação real mobile/tablet, incluindo retorno e gestão com dados isolados. Sem contorno ao bloqueio anterior. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração. Demais pendências R19/R12-D/E preservadas.

## R22 + R21 — descoberta mobile e ícones implementados (24/10/2026)

**0.1.62 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`. R15–R20 preservados. [Entrega e evidências R22](plans/R22-DESCOBERTA-MOBILE.md), [ícones R21](plans/R21-ICONES-NAVEGACAO.md). Astro Boy sequencial; Fábio frontend, Matheus backend.

**Entregue:** 26 destinos com símbolos distintos, Pilares separado de Domínios e Mais separado do Grimório. Ciclos: atalho à pontuação e expansão elemento → área → subárea no mesmo cartão. Pilares: descoberta dos elementos antes do equilíbrio. Mapa: busca, categorias expansíveis e Showcase por destino, com todos os acessos preservados. Layouts priorizam a largura real do conteúdo, toque, foco e movimento reduzido.

**Executado:** 125 testes Node, TypeScript, lint e build Vite `envDir:false` (19,70s) passaram. 186 inicializadores/handlers existentes idênticos por AST; diff de domínio/backend vazio. Primeira execução teve duas falhas de testes antigos sem contexto Router, corrigidas para a navegação por Link; suíte completa repetida passou. Versões/diff-check conferidos. Avisos de chunks/Browserslist permanecem.

**Pendente:** QA renderizado 360/390/768px, toque, teclado, rolagem/foco, navegação inferior e aceite visual. Não houve contorno ao bloqueio anterior. Próximo: validar as três telas e seguir as demais áreas; caso de vínculos R19 e contratos R12-D/E continuam pendentes para Matheus. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração.

## R20 — navegação de Domínios implementada (24/10/2026)

**0.1.60 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`; R15–R19 preservados. [Entrega e limites](plans/R20-DOMINIOS-NAVEGACAO.md). Astro Boy sequencial. Aparência do rail e Showcase aprovada nos prints de Fábio; novas interações ainda sem aceite renderizado.

**Entregue:** atalhos de seção/busca, filtros na URL, retorno contextual à lista, indicadores removíveis de filtros e troca direta entre áreas com select e anterior/próxima. Composição aprovada preservada. Atalhos com foco e movimento reduzido; criação atualiza filtros em uma operação visual.

**Executado:** 122 testes Node, TypeScript, lint e build Vite `envDir:false` (14,50 s) passaram. Cinco testes novos de navegação/retorno/foco simulado. 18 inicializadores/handlers idênticos por AST; diff de domínio/backend vazio; versões e diff-check conferidos. Avisos de chunks/Browserslist permanecem. QA visual e navegação real pendentes pelo bloqueio salvo, sem contorno.

**Próximo:** conferir catálogo filtrado → área → outra área → retorno, atalhos/mobile/teclado e formulários. Caso legado de primeiro desvínculo R19 continua para revisão de Matheus; regras não alteradas. Demais áreas/Jornadas/Obras e contratos R12-D/E permanecem na fila. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração.

## R19 — Domínios implementado; aceite visual pendente (24/10/2026)

**0.1.59 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`; R15–R18 preservados. [Referências, entrega e evidências](plans/R19-DOMINIOS.md). Astro Boy sequencial; frontend de Fábio, backend de Matheus.

**Entregue:** Expanded Cards nos quatro elementos, filtro/busca de áreas, links e vínculos separados; Showcase no detalhe com resumo revelável; criação visual de área/subárea, prévia, radios, confirmação de remoção e foco restaurado. Yoga/Calistenia mantêm rotas próprias. Vídeos fornecidos analisados por quadros.

**Executado:** 117 testes Node, TypeScript e lint passaram. Build Vite `envDir:false` passou em 7,64 s; 16 inicializadores/handlers preservados por AST, rota dedicada com tokens iguais após diferença apenas de formatação. Diff de domínio/backend vazio; versões/diff-check conferidos. QA renderizado/interações pendente pelo bloqueio salvo, sem contorno. Avisos de chunks/Browserslist permanecem.

**Prioridade Matheus:** reproduzido em memória isolada o problema antigo de primeiro desvínculo de subárea: sem configuração explícita, a UI considera todas vinculadas, mas unlinkSubarea grava [] e todas desaparecem da lista vinculada. Sem correção de backend neste lote e sem dados reais alterados. Revisar contrato de inicialização e testar primeira criação/vinculação também; detalhes no relatório R19.

**Próximo:** aceite visual de Domínios/mobile/teclado e regressão dos formulários, junto ao QA acumulado; revisão do caso de vínculos com Matheus. Restante de Jornadas/Obras e contratos R12-D/E permanece na fila. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração.

## R18 — Astrolábio implementado; QA visual pendente (24/10/2026)

**0.1.58 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`; R15–R17 preservados. [Entrega e evidências](plans/R18-ASTROLABIO.md). Astro Boy sequencial.

**Entregue:** panorama atual separado da evolução por período; abas refinadas, intervalo explícito, tabela diária acessível, equilíbrio com estado vazio, cartões elementais expansíveis e barras rotuladas de Rituais concluídos. Runa própria e atalhos ao histórico/áreas. Sem alterações de cálculos, stores ou backend.

**Executado:** 113 testes Node, TypeScript, lint e build `envDir:false` (8,90 s) passaram. Cinco inicializadores de dados idênticos por AST; diff de domínio/projeções/backend vazio. Carregador de testes corrigido após EISDIR inicial; suíte repetida passou. Versões/diff-check conferidos. Avisos de chunks/Browserslist permanecem; QA renderizado/interações pendente, sem contorno ao bloqueio salvo.

**Sleek:** acesso de leitura confirmado por HTTP 200 após substituição da chave. Credencial no Chaves do macOS, fora do projeto. Sem geração paga ou envio de dados do app; não implica validação de escopos de escrita.

**Próximo:** QA mobile/teclado/dados das entregas locais, depois detalhes de Jornadas/vínculos de Obras e demais áreas. Contratos de fragmentos/constância e divergência da Forja permanecem pendentes. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração.

## R17 — Forja implementada; QA visual pendente (24/10/2026)

**0.1.57 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`; R15/R16 preservados. [Entrega e contratos](plans/R17-FORJA.md). Astro Boy sequencial.

**Entregue:** runa própria, captura rotulada com anotações expansíveis, busca, cartões com detalhes e ações visíveis no celular; edição antes inoperante ligada a `updateDraft`; classificação e exclusão confirmadas com comandos existentes. Seleção por ID atual e estado reiniciado por conta. Design system compartilhado, sem biblioteca adicional.

**Executado:** 110 testes Node, TypeScript, lint e build `envDir:false` (10,81 s) passaram. Diff de domínio/backend vazio; versões e diff-check conferidos. Avisos de chunks/Browserslist permanecem. QA de navegador/interações/persistência não executado; sem contornar bloqueio salvo.

**Atenção Matheus:** capítulo 3.1 da Lista Diária prevê área/dispatcher/MISSION/inbox exclusivo; implementação atual tem notas, criação também em Invocar e conversão para quatro tipos com padrões fixos. R17 preserva implementação e registra divergência, sem mudar contrato. Sleek ainda retornou `pending` após usuário informar aprovação da etapa 2; conexão não confirmada.

**Próximo:** QA mobile/teclado/foco e ciclo completo da Forja, Invocar e capítulos de Obras; depois detalhes de Jornadas/vínculos. Fragmentos/constância dependem de R12-D/E. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy ou migração.

## R16 — Invocar implementado; design system iniciado (24/10/2026)

**0.1.56 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`; R15 preservado. [Entrega e avaliação de bibliotecas/skills/Sleek](plans/R16-INVOCAR-DESIGN-SYSTEM.md). Astro Boy sequencial; prioridade mudou para Invocar a pedido de Fábio.

**Entregue:** cinco tipos com runas e seleção nativa; etapas nomeadas; campos/ações/foco refinados; resumo com nome/descrição; movimento finito/reduzido; confirmação sem emojis. Receitas opt-in do design system usando a paleta existente, piloto em Invocar. Chakra/MUI avaliados; recomendada consolidação sobre Radix/Tailwind já presentes. Nenhuma biblioteca npm adicional.

**Executado:** 107/107 testes Node, TypeScript, lint e build Vite `envDir:false` (12,38 s). AST confirmou `requestSuggestion`, `handleSubmit` e `canProceed` idênticos. Diff de domínio/backend vazio; versões e diff-check conferidos. Duas comparações TypeScript e linha vazia de EOF corrigidas antes da checagem final. Avisos de chunks/Browserslist permanecem. QA renderizado local não executado, sem contornar bloqueio salvo.

**Ferramentas:** sete skills instaladas no escopo pessoal; `hyperframes-animation` não encontrada no repositório indicado. Sleek: documentação/OpenAPI lidos e device flow iniciado; usuário informou conexão, mas API ainda retornou `pending`, e navegador interno mostrou “Sign in first”. Solicitado completar etapa Approve. Nenhuma chave persistida, nenhuma geração paga nem código/dados do app enviados. Requer retomar autenticação se o código expirar; não guardar código/chave no Git.

**Próximo:** QA de Invocar e consolidação das receitas; detalhes de Jornadas/vínculos diretos de Obras continuam na fila. Fragmentos/constância dependem dos contratos R12-D/E. Reservas encerradas. Revisão documental pelo coordenador, independente pendente. Sem commit/push, deploy, migração ou alterações de regras.

## R15 — capítulos de Grandes Obras implementados, QA visual pendente (23/10/2026)

**0.1.55 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`. [Entrega, decisões e verificações](plans/R15-CAPITULOS-GRANDES-OBRAS.md). Astro Boy sequencial; frontend de Fábio, backend de Matheus preservado.

**Entregue:** capítulos expansíveis com runas, contagem de rituais atuais e links diretos; sugestão de continuar sem bloquear outras etapas; referências ausentes explícitas. Detalhe consulta projeto por ID/conta, acompanha adição de capítulo e mantém percentuais registrados. Criação com cancelamento visível. Projeção recebe IDs de capítulo para nomes iguais, sem gravação.

**Executado:** 104/104 testes Node, TypeScript, lint sem avisos e build `envDir:false` (7,43 s). Primeira falha de compatibilidade de metadado opcional corrigida e suíte repetida. Diff de domínio/backend/comandos vazio; somente apresentação e metadados de leitura alterados. Versões/links/diff-check conferidos. Avisos de chunks/Browserslist permanecem.

**Limite/próximo:** QA real de expansão/criação/links/conta/teclado/mobile pendente pelo bloqueio salvo, sem nova tentativa ou contorno; depois vínculos diretos da obra e detalhe de Jornadas. Editor/reordenação/exclusão avançados de capítulos não implementados. Fragmentos/streak dependem dos contratos R12-D/E. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, commit/push, deploy ou migração.

## R14 — revisão e publicação concluídas (23/10/2026)

**0.1.54**, base `987e09e`, branch `codex/fitness-ui-integration`. R12/R13 revisados; [repasse consolidado I03/R01–R14](REPASSE-FRONTEND-PARA-BACKEND.md) e [verificações R14](03-Project-Management/reports/R14-REVISAO-E-PUBLICACAO.md). Matheus mantém backend; Fábio frontend.

**Correções:** documentos de topo/boas-vindas atualizados; novo briefing após pull mesmo em perfis antigos; compositor reinicia ao trocar conta. Domínio, cálculos, dados e dependências preservados.

**Executado:** 102 testes Node, 10 Fitness Deno e 7 assistente Deno passaram; TypeScript/lint/build passaram. Primeira chamada Deno corrigida para usar `tests/deno.json`. QA visual pendente; avisos de chunks/Browserslist permanecem. Sem teste remoto/deploy/secrets. Código publicado no main: `4d73183f58e7e66279b87f0921fbac013a6d444d`. Push sem force e SHA remoto confirmados por `git ls-remote origin refs/heads/main`. Este fechamento documental segue em commit próprio. Reservas encerradas.

**Próximo:** Fábio revisa UX/capas/trilhas/mobile e continua capítulos/detalhes/áreas restantes. Matheus confere contratos macro/Undo/sync e participa da definição de fragmentos/streak; nenhuma carteira implementada. Revisão documental pelo coordenador, independente pendente.

## R13 — Rituais Showcase implementado, QA visual pendente (23/10/2026)

Versão **0.1.53 local**, branch `codex/fitness-ui-integration`, HEAD `987e09e`. [Referência, entrega e verificações](plans/R13-RITUAIS-SHOWCASE.md).

**Entregue:** lista de Rituais com capas elementais expansíveis e ações de execução separadas/visíveis; detalhes completos, controles maiores, campos rotulados, filtros e estados vazios refinados. Evolução compacta com arte realista após a lista. Taxonomia de Matheus e mapa de trilhas preservados.

**Executado:** 56/56 testes Node, TypeScript, lint sem avisos, build `envDir:false` (14,45 s), SSR dos quatro elementos. 13 handlers e três auxiliares de cálculo idênticos por AST. Apenas uma fonte preexistente alterada neste lote; duas novas de apresentação. Domínio/backend/painel de cálculos intactos. Avisos de chunks/Browserslist permanecem.

**Limite:** nova tentativa de navegador interno recusada pela preferência salva de localhost; sem contorno e sem QA visual/interações. **Próximo:** revisar capas/itens/edição/timer/conclusão/filtros/evolução em mobile/teclado/zoom e depois capítulos/detalhes de Jornadas/Grandes Obras. Contratos R12-D/E continuam pendentes. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R12 — taxonomia alinhada com Matheus (23/10/2026)

Versão **0.1.52 local**, branch `codex/fitness-ui-integration`, HEAD `987e09e`. [Decisão, implementação e evidências](plans/R12-TAXONOMIA-MATHEUS.md).

**Entregue:** Rituais abre tarefas por padrão; trilhas ficam explícitas e links anteriores continuam válidos. Guia distingue tarefas/Rituais, hábitos/Ciclos, quests/Jornadas e projetos/Grandes Obras. Criação de conquista nos catálogos; textos/atalhos e criação rápida de Ritual alinhados à identidade atual. Datas, dados, regras e handlers preservados.

**Executado:** 56/56 testes Node, TypeScript, lint sem avisos e build `envDir:false` (9,10 s); 13 handlers de Rituais idênticos por AST; diff de domínio/backend/comandos/projeção vazio. Avisos de chunks/Browserslist permanecem. QA renderizado pendente, sem nova tentativa ou contorno ao bloqueio salvo.

**Próximo:** QA de tarefas/criação/guia/atalhos/catálogos em mobile/teclado/zoom; capítulos/detalhes avançados depois. Streak/fragmentos continuam dependentes dos contratos R12-D/E. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push. Histórico abaixo preservado.

## R12-C — catálogos/composição implementados, em revisão visual (23/10/2026)

Versão **0.1.51 local**, branch `codex/fitness-ui-integration`, HEAD `987e09e`. Continuação autorizada por Fábio; [entrega e pendências](plans/R12-C-CATALOGOS.md).

**Entregue:** acesso direto à trilha nos cartões; compositor completo nos catálogos com tipo inicial Jornada/Grande Obra e navegação para a trilha criada; criação rápida preservada; cabeçalhos/diálogos/runas/rótulos/alvos de toque refinados; ações finais do compositor aderentes na rolagem. Campanhas existentes preservadas; navegação avançada por capítulo ainda não implementada.

**Executado:** 54/54 testes Node, TypeScript, lint sem avisos, build `envDir:false` (7,83 s). Cinco handlers idênticos por AST, apenas quatro fontes preexistentes de apresentação alteradas nesta rodada. Domínio/backend/comandos/projeção sem diff. Avisos de chunks/Browserslist permanecem; QA renderizado pendente, sem nova tentativa/contorno ao bloqueio salvo.

**Próximo:** QA de catálogos→criação→trilha, detalhes/campanhas, mobile/zoom/teclado e rodapé aderente; capítulos/edição avançada depois. R12-D/E dependem de contratos antes de streak/fragmentos. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Alterações anteriores preservadas; sem secrets, commit/push, deploy ou migração.

## R12-B — movimento/ícones implementados, em revisão visual (23/10/2026)

Versão **0.1.50 local**, branch `codex/fitness-ui-integration`, HEAD `987e09e`. Pedido atual: continuar animações do vídeo, ícones e leve redesign. [Entrega, mapa da referência e pendências](plans/R12-B-MOVIMENTO.md).

**Entregue:** runas próprias nas quests/compositor; gestos finitos por elemento; toque sobre base fixa; painel com origem no nó; progresso por transform; selo arcano/check e métricas reais em sequência na conclusão. Fluxos de seleção, criação, timer, conclusão e foco preservados. Streak/fragmentos/coleção do vídeo permanecem pendentes de R12-D/E; sem recompensas inventadas.

**Executado:** 54/54 testes Node, TypeScript, lint sem avisos, build `envDir:false` (17,94 s). Cinco handlers idênticos por AST; somente quatro fontes preexistentes de apresentação alteradas nesta rodada. Diff de domínio/backend/comandos/projeção vazio. Avisos de chunks/Browserslist permanecem. QA renderizado ainda pendente; sem nova tentativa ou contorno ao bloqueio salvo do navegador. Não declarar fluidez medida.

**Próximo:** QA visual/funcional, depois R12-C em Jornadas/Grandes Obras/compositor. Decisões de recompensa com Fábio/Matheus antes de integração R12-D/E. Alterações preexistentes preservadas; reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R12-A — piloto implementado / em revisão visual (23/10/2026)

Fábio confirmou iniciar o piloto. Base `987e09e`, branch `codex/fitness-ui-integration`, versão **0.1.49 local**. Astro Boy executou sequencialmente: percurso sinuoso centralizado, nós elementais em relevo, seleção com detalhe estável, estados e IDs acessíveis. [Entrega e evidências](plans/R12-A-PILOTO.md). JSON/CSS extraídos preservados em `docs/plans/references/`; não carregados pelo app.

**Executado:** 49/49 testes Node de quests/elemental, TypeScript, lint sem avisos e build Vite `envDir:false` (23,80 s). Sem QA visual: tentativa atual de acessar a aba local recusada por preferência salva; sem contorno. Avisos de chunks grandes/Browserslist permanecem. Diff-check, links, versões e preservação de domínio conferidos. Não confundir testes SSR com fluidez ou interação real.

**Preservado:** QuestHub/QuestComposer, comandos, fontes de dados, regras, contratos e backend. Piloto aparece no mapa em Rituais acessível por uma Jornada; o catálogo Jornadas e compositor aguardam R12-C. Fragmentos/streak aguardam R12-D/E. Alterações documentais anteriores preservadas.

**Próximo:** QA renderizado em 360/390/768/1440, zoom/teclado/movimento reduzido; depois painel/recibo R12-B e integração R12-C. Reservas encerradas. Revisão documental pelo coordenador; independente pendente. Sem secrets, commit/push, deploy ou migração. Histórico abaixo preservado.

## R12 — revisão de prontidão (23/10/2026)

Pedido vigente: revisar pendências e preparar o início; **não implementar nesta rodada**. Astro Boy executou sequencialmente a revisão; reservas de `docs/plans/`, `docs/CONTINUIDADE.md` e `docs/FILA-ENTREGAS.md` encerradas após o fechamento documental. Base local `987e09e`, branch `codex/fitness-ui-integration`; alterações documentais anteriores preservadas.

Piloto visual R12-A delimitado; recompensas persistidas dependem de R12-D. Ver [prontidão, prioridades e critérios de início](plans/R12-PRONTIDAO.md). Estado da implementação: não iniciada; nenhuma alteração de versão, código ou domínio autorizada por este diagnóstico.

## Ponto de retomada — R12 / preparação por vídeos (23/10/2026)

**Somente análise e planos; implementação não iniciada.** Base `987e09e`, versão 0.1.48 mantida. Fábio solicitou aplicar UI/UX/movimento de duas gravações, constância e fragmentos por elemento na próxima rodada. [Plano completo e contratos propostos](plans/R12-GAMIFICACAO-VIDEOS.md) · [Movimento](plans/001-MOVIMENTO-QUESTS.md) · [Ordem de execução](plans/README.md).

**Executado:** metadados dos vídeos (105,117 s e 31,102 s; 1290×2796), oito folhas de contato e inspeção de trechos; leitura de código, contratos e estado Git. Não houve reprodução audiovisual integral. Segundo vídeo HDR; miniaturas não foram usadas para extrair paleta. Fontes pessoais e quadros não foram adicionados ao repositório.

**Preparado:** mapa por capítulos, seleção contextual, resultado registrado, revelação/coleta de fragmento, selo de constância e retorno à trilha. Reutilizar componentes R10. Sequência global já existe; usa updatedAt em tarefas e exige conclusão hoje para não zerar, divergências a revisar antes de mudar regra. Fragmentos econômicos não encontrados; partículas visuais não são carteira.

**Decisão confirmada por Fábio em 23/10/2026:** 1 fragmento por conclusão válida, do elemento da atividade, em saldo separado sem alterar XP/Prana. Não usar fórmula proporcional aos pontos. **Ainda abertos:** regra de dia/fuso/constância, elegibilidade, resolução multiárea/conflitos, Undo/reconclusão e persistência. A preferência pela área primária segue proposta de resolução, não foi confirmada separadamente. Matheus mantém backend; implementação permanece para a próxima rodada.

**Próximo:** R12-A, piloto visual de Jornada/estados e painel; avançar UI independente enquanto se define R12-D (contrato de recompensas com Matheus). QA renderizado continua pendente; sem nova tentativa de localhost, sem testes de produto/build/lint nesta rodada, sem secrets, deploy, commit ou push. Código/dados/manifests não alterados. Documentação preparada pelo coordenador, revisão independente pendente; reserva documental encerrada. Histórico preservado abaixo.

## Ponto de retomada — R11 / revisão e repasse / 0.1.48 (23/10/2026)

Pedido de Fábio: revisar erros, consolidar toda a repaginação para Astro Boy e Matheus e publicar no main indicado. **Matheus continua responsável pelo backend; Fábio continua UX/UI.** [Repasse completo I03/R01–R11](REPASSE-FRONTEND-PARA-BACKEND.md). Astro Boy sequencial; branch codex/fitness-ui-integration, base f07292f; main remoto conferido igual antes da publicação. **Publicado em main:** commit `b8c51a286b311cbfcbe09d986c0236a28218f308`, push sem force e SHA remoto confirmado por `git ls-remote origin refs/heads/main` em 23/10/2026. Este encerramento documental segue em commit próprio.

**Corrigido:** quatro avisos de hooks; atalhos de rituais no Santuário; proteção/encaminhamento de treinos e agregadores fora do timer simples; gráfico aleatório do Astrolábio substituído por registros reais; fixture/expectativa de teste Fitness alinhada à regra consolidada já restaurada por Matheus. Boas-vindas/CLI agora apresentam o novo repasse uma vez por revisão mesmo em perfis antigos.

**Executado:** 92/92 testes Node, 10/10 Fitness Deno e 7/7 assistente Deno; TypeScript, lint global sem erros/avisos e build Vite envDir:false passaram. 64 arquivos protegidos idênticos e diff acumulado vazio em stores/lib/services/types/constants/Supabase. [Relatório R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

**Limites:** QA visual/fluxo real não executado pelo bloqueio salvo do navegador; testes não provam persistência remota nem ausência de qualquer bug. Avisos de chunks/Browserslist permanecem. Sem secrets, deploy, alterações de fórmulas/backend ou recálculo de histórico.

**Próximo:** Fábio segue QA/acabamento de frontend pela fila; publicação do código concluída. Matheus deve ler o repasse e conferir contratos de snapshots macro, reversão/idempotência e sincronização. Onboarding atualizado depende da IDE executar AGENTS/astro:status; não existe agente automático ao simplesmente abrir GitHub. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Histórico abaixo preservado.

## Ponto de retomada — R10 / Quests elementais / 0.1.47 (23/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. **R10 implementado localmente, em revisão; QA visual e de fluxo no navegador pendente.** Referência Figma comunitária inventariada e fluxos selecionados inspecionados. Decisão explícita do usuário: próxima etapa sugerida, com acesso livre às demais.

**Entregue:** Rituais com trilhas de quests e lista anterior acessível; compositor de Jornada/Grande Obra com etapas e capítulo inicial; seleção expansível, cronômetro existente, recibo do resultado registrado e acesso à próxima etapa. Santuário mostra próximas quests; detalhes de Jornadas/Grandes Obras abrem suas trilhas. Seleção na mesma trilha preserva rolagem. [Relatório R10, decisões e limites](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

**Executado:** 87/87 testes Node (20 novos), TypeScript, lint delimitado sem erros/avisos e build Vite com envDir:false passaram. 64 arquivos protegidos intactos; 34 funções anteriores sem JSX preservadas por AST. Entre os 298 arquivos preexistentes capturados, só Rituais/Jornadas/GrandesObras/ElementalPreview/ScrollToTop mudaram. Versões 0.1.47 sincronizadas; testes são unidade/callbacks/SSR, sem persistência real via UI.

**Limite:** bloqueio salvo de localhost continua como pendência, sem contorno; nenhuma validação visual nova foi alegada. Contagem da trilha lê tarefas atuais por ID e não altera porcentagem/conclusão/bônus macro. Cópias aninhadas e progressos antigos podem divergir; diagnóstico registrado, sem mudar domínio. Sem backend, fórmulas, secrets, deploy, commit ou push.

**Próximo:** QA isolado em 360/390/768/1440: composição, Santuário→etapa, livre seleção, timer ocupado/pausado/reload/conclusão, retorno/foco, Undo, conta e destinos Fitness/Ciclos. Pendências de R09 e demais telas permanecem; não presumir aceite visual. Reservas encerradas. Custódia documental pelo coordenador; revisão independente pendente. Histórico preservado abaixo.

## Ponto de retomada — Grimório / 0.1.46 (22/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Usuário pediu personagem coerente, status em vidro, evolução e histórico; duas capturas orientaram o redesign. **R09 implementado localmente, em revisão visual.**

**Entregue:** ficha única com corpo elemental aprovado; HP/Stamina/Prana/XP translúcidos; título, nível, sequência e recorde; métricas compactas, edição de identidade preservada, Showcases expansíveis dos quatro elementos e radar opcional. Histórico pesquisável com filtros, deduplicação de fontes existentes e ausência de valores tratada explicitamente. [Relatório R09](03-Project-Management/reports/R09-GRIMORIO.md).

**Executado:** 67/67 testes Node (18 novos), TypeScript, lint delimitado sem erros/avisos e build Vite com envDir:false passaram. 64 arquivos protegidos intactos; somente Grimorio mudou entre os arquivos de código preexistentes. Dois handlers e sete derivações anteriores idênticos por AST; HP idêntico ao AppLayout. Diff-check e versões 0.1.46 conferidos.

**Limite:** nova tentativa no navegador interno recusada pela preferência salva de localhost, mesmo após autorização humana. Sem contorno. Capturas são da versão anterior; renderização, interação real, foco e persistência via UI não validados. Histórico não inventa eventos de jornadas/obras sem registros, e não é usado para recalcular totais. Divergências preexistentes de Prana e precisão do LevelingCalculator registradas no relatório, sem correção de domínio.

**Próximo:** QA do Grimório em 360/390/768/1440, identidade, conta, recursos, expansão, filtros, paginação, Undo e virada do dia, com dados isolados após liberação efetiva. Pendências anteriores continuam na fila; não presumir aceite. Sem deploy, secrets, alteração de backend, cálculos ou dados de Matheus.

Reservas encerradas; revisão documental pelo coordenador, independente pendente. Histórico abaixo preservado.

## Ponto de retomada — cabeçalhos e composição / 0.1.45 (22/10/2026)

Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Usuário autorizou aposentadoria da home clássica, refinamento da expansão de datas/formulários e cabeçalho comum; três capturas orientaram o lote.

**Entregue:** link/página/palco/CSS exclusivos do Santuário clássico removidos; rota antiga redireciona para a home nova. TopBar com marca, Explorar funcional e selo de conta, sem sino fictício/emoji no cabeçalho; operações de conta intactas. Calendário seleciona sem reconstruir sua janela e revela nomes reais. Criação de ciclo/sequência usa composição controlada; mobile com painel inferior; edição/detalhes refinados. Criação de ciclo volta à Rotina sem filtros ativos. [Relatório R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

**Executado:** 49/49 testes Node, TypeScript e build Vite com envDir:false passaram; diff-check limpo. Lint sem erros/dois avisos antigos de hooks. 64 arquivos de domínio intactos; 59 funções sem JSX de Ciclos idênticas, única exceção visual selectRelativeVisibleDay. Conta: diálogo byte a byte e operações preservados. Remoção somente de UI exclusiva sem consumidores; Fitness intacto.

**Próximo:** QA real de cabeçalho/conta/Explorar e Ciclos em 360/390/768/1440, seleção de data, teclado/foco/painéis, criação/edição/recorrência/execução e sequências Fitness. Bloqueio de localhost registrado anteriormente permanece sem nova tentativa ou contorno. Capturas do usuário não validam a versão final. Não presumir aceite nem repetir autorização humana já dada.

Versões 0.1.45 sincronizadas. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, backend, fórmulas, persistência, dependências, deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — redesign de Ciclos / 0.1.44 (22/10/2026)

Usuário priorizou Ciclos e enviou sete capturas mobile, pedindo calendário Expanded Cards e Showcase nas demais áreas. Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`, preservando alterações anteriores. Complemento na mesma versão 0.1.44.

**Entregue:** calendário com nove cartões expansíveis, contexto do dia e centralização horizontal; seletor completo sempre acessível; setas descritas como janelas de sete dias. Rotina/Sequências separadas, busca/filtros e guardas de reorganização; sem controles redundantes em listas vazias. Showcase de sequência, estados vazios com ação direta e evolução compacta com assets elementais. Criação de sequência em diálogo; acabamento de cartões, edição, timer e execução. [Decisões e evidências R07](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

**Preservação:** 64 arquivos protegidos idênticos; 60 funções sem JSX e 146 das 147 instruções não JSX originais de Ciclos preservadas. Única substituição nesse conjunto: efeito visual de rolagem das datas. Composição/conclusão/ordenação intactas. Sete funções e todo o bloco de estado/cálculos de ScoreHierarchyPanel intactos; apresentação Showcase opt-in somente em Ciclos. Fontes preexistentes editadas neste lote: Ciclos e apresentação de ScoreHierarchyPanel.

**Executado:** 41/41 testes Node de unidade/SSR/numéricos; TypeScript; build Vite com envDir:false (9,89 s); diff-check. Lint zero erros/dois avisos anteriores de hooks, já reproduzidos na cópia inicial. Build mantém avisos de Browserslist/chunks. Sem backend, fórmulas, persistência, dados reais, dependência nova, secrets, deploy, commit ou push.

**Limite e retomada:** capturas do usuário foram analisadas, mas não mostram este complemento final. Tentativa de acesso ao navegador interno recusada por preferência salva de 127.0.0.1:5173 mesmo após autorização humana; nenhum contorno nem segunda superfície. Próximo: QA real com dados isolados em 360/390/768/1440; expansão/rolagem de datas, virada de mês/ano, seletor, toque/teclado/foco, criação/edição/filtros, evolução, sequências, execução/pausa/reload/conclusão e Fitness. Não presumir aceite ou repetir autorização já dada.

Reservas encerradas: Ciclos, apresentação opt-in de ScoreHierarchyPanel, componentes/CSS/testes cycles, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Histórico abaixo preservado.

## Ponto de retomada — ícones e exploração transversal / 0.1.43 (22/10/2026)

Usuário aprovou visualmente a Lua e reforçou padrões Expanded/Showcase e substituição de emojis por iconografia elemental. Astro Boy executou sequencialmente na branch `codex/fitness-ui-integration`, base `f07292f`. Trabalho preexistente preservado; não houve nova inspeção visual da Lua pelo executor.

**Entregue:** família de 20 ícones SVG, selos elementais nos componentes compartilhados e consumidores principais, navegação lateral/mobile/Explorar e estados vazios selecionados. Menu Explorar usa grupos expansíveis; Mapa combina grupos e Showcase com destinos reais, incluindo atalhos de treino antes ocultos. Rituais/cronômetro/Showcase recebem ícones; cartões de elemento/área ganham teclado; IDs de ExpandedElements são únicos e foco deixa de trocar seleção. [Escopo e matriz por tela](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

**Preservação:** 64 arquivos de domínio idênticos por SHA-256; 114 funções nomeadas sem JSX inalteradas. Catálogo de ícones em constants e registros persistidos permanecem intactos; migração é visual. Lua anterior não editada. Ainda restam emojis/contextos especializados de Fitness, calendário e Cassino; repaginação geral segue parcial.

**Executado:** 32/32 testes Node. Lint delimitado: zero erros e dois avisos de Ciclos reproduzidos na cópia inicial. TypeScript e build Vite sem `.env` passaram; avisos de Browserslist/chunks permanecem. Versões e diff-check conferidos. Evidências no relatório R06. Testes são unidade/SSR/numéricos, não fluxo real.

**Próximo:** QA renderizado de exploração/ícones e Temporal quando a ferramenta permitir; depois badges especializados/Fitness, calendário e conteúdo de Semana/Mês. Instruções oficiais de desbloqueio fornecidas: Configurações → Browser → Agent permissions → exceção de 127.0.0.1:5173. Sem nova tentativa ou contorno, alteração de configurações ou confirmação de liberação efetiva. Não repetir a autorização já dada.

Reservas encerradas: apresentação elemental/cartões/layout, Mapa e ícones de páginas consumidoras, CSS, testes, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Sem backend, fórmulas, dados, secrets, dependência nova, deploy, commit ou push. Histórico preservado abaixo.

## Ponto de retomada — Temporal, Lua e Estações / 0.1.42 (22/10/2026)

Usuário autorizou evolução contínua de UX/UI e reforçou Expanded Cards, Showcase e Lua realista ligada ao horário. Astro Boy executou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`, preservando trabalho anterior.

**Entregue:** navegação temporal compartilhada; Lua em esfera Three.js com mapas NASA, iluminação por efemérides, atualização por minuto/retorno à aba, próximas fases e alternativa SVG; Estações com cartões expansíveis; Ano com métricas existentes e Showcase dos meses, abrindo o mês correto por URL. Hemisfério é vista de referência, não orientação exata do céu. [Escopo, fontes, decisões e limites](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

**Preservação e divergência:** 63 arquivos protegidos idênticos por SHA-256; regras/handlers de Ano e seletores/métricas de Mês preservados. `getSeason` mantém datas aproximadas. `getMoonPhase` legado continua inalterado; somente a página Lua usa Astronomy Engine já instalada e pode diferir perto das transições. Sem efeitos sobre progressão ou persistência.

**Executado:** TypeScript, 28/28 testes Node (nove novos), repetição dos nove em America/New_York e build Vite sem `.env` passaram. Lint delimitado: zero erros e dois avisos preexistentes, confirmados nas cópias iniciais. Build mantém avisos de Browserslist/chunks. Diff-check, versões, referências e paridade dos assets em public/dist conferidos. Não equivalem a teste visual ou fluxo real.

**Próximo:** QA visual de Lua/Estações/Ano em 360/390/768/1440 quando a ferramenta permitir; conferir WebGL, orientação/fallback, cartões e navegação por mês. Depois, acabamento de Semana/Mês/Calendário e acessibilidade do editor anual. Bloqueio salvo do navegador segue registrado; sem nova tentativa/contorno, screenshots ou inspeção do app. Não declarar toda a repaginação concluída nem repetir perguntas já respondidas.

Reservas encerradas: Lua/Estações, layout temporal/Ano/Mês (apresentação/navegação), novos componentes/CSS/assets/testes, manifests/changelog e documentação. Revisão documental pelo coordenador; independente pendente. Sem alteração de backend, fórmulas, dados, secrets, dependências, deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — Santuário promovido / 0.1.41 (22/10/2026)

**Pedido vigente:** usuário aprovou substituir a home antiga pela composição elemental e continuar o refinamento de Pilares. Astro Boy executou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; trabalho anterior preservado. A promoção local foi autorizada neste pedido; não pressupõe aprovação de mudanças de domínio nem QA renderizado.

**Entregue:** `/santuario` usa a composição nova, sem faixa de prévia; links antigos redirecionam mantendo filtros. Home clássica disponível no rodapé. Conta reutiliza TopBar existente. Home integra início/abertura/pausa/retomada/conclusão de rituais com operações atuais e proteção contra sobrescrever sessão, troca de conta e repetição. Pilares passa a equilíbrio compacto + cartões expansíveis → páginas próprias, incluindo áreas personalizadas e contagens existentes. Cabeçalho e identidade mobile compactados. [Detalhes e mapa funcional](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md).

**Executado:** TypeScript, lint delimitado sem avisos, 19/19 testes Node, build Vite com `envDir:false`; passaram. Build mantém avisos de Browserslist/chunks. Comparação SHA-256: 63 arquivos de domínio intactos; hooks/handlers e diálogo de conta intactos. Diff-check, versões e links conferidos. Estes resultados são estruturais/unitários/SSR, não certificam layout, backend remoto ou fluxo real.

**Limite e retomada:** captura do usuário orientou a compactação. Sem novo acesso ou contorno ao bloqueio salvo do navegador local; sem screenshots, hitboxes, matriz 360/390/768/1440, cronômetro/troca de conta na UI ou performance. Próximo: QA visual/funcional da home e Pilares quando a ferramenta permitir; continuar acabamento por famílias R04–R08. Não repetir perguntas de identidade ou autorização já respondidas.

Reservas encerradas: App, TopBar (apresentação), navegação/controles elementais, home TSX/CSS, Pilares TSX/CSS, testes, manifests/changelog, relatório/índice/manual/dossiê e registros. Revisão documental pelo coordenador; independente pendente. Nenhuma edição de backend, stores, fórmulas, dados ou secrets; sem deploy, commit ou push. Histórico abaixo preservado.

## Ponto de retomada — identidade compartilhada / 0.1.40 (22/10/2026)

**Diretriz vigente:** usuário aprovou a identidade R02 para todo o app, todas as abas e detalhes, e autorizou evolução contínua de UX/UI. Nenhuma autorização para mudar backend, lógica, cálculos ou dados de Matheus. Base `f07292f`, branch `codex/fitness-ui-integration`; trabalho I03/R01–R03 preservado. Astro Boy executou/revisou sequencialmente. Início deste lote em 21/10; fechamento em 22/10, America/Recife.

**Entregue:** tema compartilhado conecta aliases mystic/Fitness à paleta aprovada; cronômetro visual reutilizável nos modais simples de Rituais/Ciclos; Expanded Cards em Pilares; Showcase em Jornadas/Grandes Obras; busca no painel Todas as páginas, acessível pelo botão Explorar da prévia. Prévia mantém `tickTimer` existente enquanto sua casca está montada. Home vigente e operações atuais preservadas. [Decisões UX, arquivos, alcance e retomada](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md).

**Evidência atual:** TypeScript passou; lint delimitado com 0 erros/2 avisos de Ciclos, confirmados também na cópia inicial. 12/12 testes Node passaram (navegação em memória, SSR/callbacks e materiais numéricos). Build Vite com `envDir:false` passou, com avisos existentes de Browserslist/chunks. SHA-256: 63 arquivos protegidos idênticos; AST: 57 handlers anteriores idênticos. Cinco pares opacos da paleta com contraste calculado acima de 4,5:1; não é auditoria renderizada. Versões 0.1.40, links novos, whitespace e diff-check conferidos no fechamento.

**Limites:** nova tentativa local foi recusada por preferência salva do navegador apesar de autorização humana; sem contorno. Não executados testes no app, screenshots, hitboxes, matriz 360/390/768/1440, pausa/reload/conclusão real ou performance. Referências públicas Scrolltide foram observadas; não equivalem a QA do produto. Base comum não significa acabamento de cada tela concluído; gráficos/cores inline/componentes específicos ainda exigem revisão. Cronômetros Fitness e execução avançada de Ciclos preservados.

**Próximo passo:** integrar início/retomada/conclusão da home nova sem sobrescrever sessão, e continuar acabamento por famílias R04–R08. Reutilizar operações, fontes de tempo e cálculos existentes; não criar outro motor. Verificar fluxo real e responsividade quando a ferramenta permitir localhost antes de promover `/santuario`. Não repetir perguntas sobre identidade visual ou autorização já respondidas. Consulta inicial: este registro → relatório R04 → fila → estado Git.

Reservas encerradas: tema/Tailwind/main, componentes elementais e testes, prévia TSX/CSS, AllRoutesSheet, apresentação de Pilares/Rituais/Ciclos/Jornadas/GrandesObras, manifests/changelog e documentação. Revisão documental pelo coordenador, independente pendente. Sem secrets, dependência nova, deploy, migração, commit ou push. Histórico preservado abaixo.

## Ponto de retomada — R03 parcial entregue (21/10/2026 / 0.1.39)

**Pedido vigente:** repaginar todo o frontend por etapas; usuário aprovou a direção R02 e autorizou avançar, mantendo integralmente backend, lógica e cálculos de Matheus. R03 implementado na prévia; home vigente preservada. Checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações I03/R01/R02 intactas. Astro Boy executou sequencialmente, sem troca automática de modelo.

**Entregue:** páginas `/previa-elemental/elementos/{fogo,ar,agua,terra}`, compatibilidade com links antigos `?elemento=`, quatro acessos fixos além do anel, busca/filtro de áreas ativas na URL, navegação de retorno e atalhos aos módulos existentes. `ScrollToTop` preserva posição somente durante filtros da mesma página elemental. Nenhuma escrita de domínio adicionada. [Arquivos, evidências e mapa de integração R03](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md).

**Executado:** TypeScript, lint delimitado, 8/8 testes Node (cinco de navegação/filtros/scroll em memória e três numéricos R02), build Vite com `envDir:false`; passaram. Browserslist/chunks grandes continuam como avisos. SHA-256 confirmou 79 arquivos protegidos idênticos à linha de base, incluindo stores, serviços, funções/migrações locais e Fitness. Diff-check, versões e referências documentais conferidos no fechamento. Isso não certifica domínio remoto, layout ou fluxo completo.

**Limite atual:** aceite da direção visual pelo usuário registrado; QA visual/interativo do executor continua pendente pela preferência salva de bloqueio do navegador local. Não houve nova tentativa nem contorno. R03 não encerra a repaginação nem promove a home.

**Próximo passo:** integrar na composição as funções já existentes da home, especialmente o ciclo do cronômetro em AppLayout e início de ritual; conferir navegação global. Preservar operações/calculadores atuais, sem criar outro relógio. Depois, matriz visual/funcional 360/390/768/1440 quando houver liberação efetiva da ferramenta; somente então promover à home e seguir R04. Não repetir perguntas de direção visual ou autorização de localhost já respondidas.

Reservas encerradas: prévia TSX/CSS, helper de navegação, ScrollToTop, App, teste, manifests/changelog, relatório R03, índice, manual/dossiê, fila e continuidade. Revisão documental pelo coordenador; independente pendente. Sem secrets, deploy, migração, commit ou push. Histórico abaixo preservado; retomada começa nesta entrada.

## R02 — efeitos sem distorção implementados (21/10/2026 / 0.1.38)

Usuário rejeitou o efeito de 0.1.37 como distorção e pediu qualidade/fluidez. Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Removidos feTurbulence/feDisplacementMap e deformações globais; assets WebP originais intactos.

Renderizador local `src/components/elemental/material-effects.ts` acrescenta uma camada Canvas 2D transparente: reflexos curvos/gotas na água, plumas ascendentes/brasas no fogo, correntes coerentes no ar e fragmentos rígidos texturizados/sombreados na terra. Ciclos com entrada/saída suave, sem aleatoriedade por frame. Mesmo relógio e rAF para efeitos/órbita, DPR até 2, ResizeObserver com cleanup. Pausa, hover/foco da trajetória, visibilidade e movimento reduzido preservados. Sem alteração de dados, progressão, rotas, assets ou stores. [Detalhes e limites](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Evidências executadas:

- `npx tsc -b` e `npx eslint src/pages/ElementalPreview.tsx src/components/elemental/material-effects.ts`: passaram após alterações finais.
- `node --test tests/elemental/material-effects.test.mjs`: 3/3. Testes numéricos com Canvas simulado, 481 instantes por material, coordenadas/radii/alpha válidos, estado de desenho balanceado, determinismo no mesmo instante, evolução temporal, limite DPR e fallback sem contexto. Não é teste de pixels, navegador, pause/resume da UI ou FPS.
- Build Vite por API com `envDir:false`: passou; avisos existentes de Browserslist/chunks grandes.
- `git diff --check`, whitespace/conflitos dos novos arquivos, três campos em 0.1.38 e ausência do filtro antigo na prévia: passaram.

Navegador: usuário declarou remover permanentemente bloqueios e autorizou acesso total. Nova tentativa pela mesma ferramenta para `/previa-elemental` foi novamente recusada por preferência salva de localhost. Autorização registrada; liberação efetiva não confirmada. Nenhum contorno por porta/browser/CDP ou renderização indireta. Não executados: inspeção visual, filmagem, screenshots, hitboxes, responsividade, compatibilidade e desempenho. A naturalidade desta revisão não está validada; não promover à home por inferência. Próximo: resolver a preferência efetiva da ferramenta e observar os quatro materiais em 360/390/768/1440, incluindo controles e movimento reduzido.

Reservas encerradas: prévia TSX/CSS, renderizador e testes, relatório R02, manifests/changelog, fila e continuidade. Revisão documental pelo coordenador; independente pendente. Sem secrets, deploy, migração, commit, push, serviço externo novo ou geração de vídeo. Catálogo de capacidades de vídeo apenas consultado, sem gasto/upload.

## R02 — materiais animados implementados (21/10/2026 / 0.1.37)

Usuário relatou apenas ar perceptivelmente animado e pediu fluidez/naturalidade em todos os elementos. Astro Boy, execução/revisão documental sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Auditoria focal confirmou terra sem animação própria e água/fogo limitados a transforms discretos; skill improve-animations usada como orientação de auditoria, com implementação explicitamente solicitada pelo usuário.

Água/fogo passam a usar deformação procedural de textura por SVG (ruído contínuo e deslocamento), com atualização máxima de 30 Hz em duas superfícies pequenas. Água adiciona ondulações; fogo, brasas ascendentes. Rocha levita rigidamente, com fragmentos independentes; ar usa duas camadas em sentidos opostos. Assets existentes mantidos. Não é simulação física de fluidos. [Detalhes e referência técnica](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Hover/foco congelam somente a trajetória para facilitar seleção; materiais seguem animados. Pausa explícita/posicionamento manual, preferência de movimento reduzido, aba oculta e saída da área visível suspendem os efeitos. Movimento reduzido remove também a deformação SVG. Nomes, alvos e destinos permanecem estáveis; heroes elementais continuam estáticos. Nenhum dado, regra, store, recurso remoto ou dependência alterado.

Verificações executadas após a alteração final: `npx tsc -b`, `npx eslint src/pages/ElementalPreview.tsx`, build Vite por API com `envDir:false`, `git diff --check`, whitespace/conflitos dos novos arquivos e três campos de versão 0.1.37 — passaram. Build mantém avisos de Browserslist/chunks grandes. Documentação MDN de filtros SVG consultada. Inspeção estática do controle de pausa/cleanup realizada; não equivale a teste de execução.

Não executados: visualização da página, avaliação de naturalidade, FPS, teste de filtros/pausa/links em navegador, screenshots ou hitboxes. Permanece o bloqueio salvo de localhost informado anteriormente; sem nova tentativa nem contorno. Próximo: após liberação efetiva, observar os quatro materiais por um ciclo completo em 360/390/768/1440, conferir pausa/retomada, hover/foco, movimento reduzido e desempenho, ajustando intensidade com base em evidência visual.

Reservas encerradas: prévia TSX/CSS, relatório de assets, manifests/changelog, fila e continuidade. Revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R02 — assets elementais integrados (21/10/2026 / 0.1.36)

Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações preexistentes preservadas. Usuário pediu água pulsante, terra sólida/realista, ar em esfera espiral inspirada no Rasengan e fogo em bola de chama viva. Quatro artes próprias geradas pela ferramenta integrada image_gen, inspecionadas visualmente como assets isolados, com alpha e dimensões 1254 × 1254.

Arquivos em `public/sanctuary/elements/{agua,terra,ar,fogo}-v1.webp`; cópias finais sem perda via `cwebp -lossless -exact -m 6`. Total 6.631.038 bytes, ante 9.415.564 dos PNGs (~29,6% menor). Originais mantidos na saída da ferramenta; PNGs intermediários do projeto removidos. Ainda são masters grandes, sem benchmark mobile; derivativos menores permanecem uma otimização futura. [Prompts, arquivos e limites](03-Project-Management/reports/R02-ASSETS-ELEMENTAIS.md).

Órbita usa os assets em lugar dos sigilos grandes: pulso de escala/rotação na água, espiral de ar em seis segundos, oscilação de forma/aura no fogo, rocha estável. São imagens estáticas animadas por CSS, sem simulação de fluidos/vídeo. Rótulos/alvos ficam fora das animações internas. Pausa, hover/foco, visibilidade e movimento reduzido suspendem os efeitos. Heroes elementais reutilizam as artes estáticas; sigilos pequenos e fallback de erro permanecem. Corpo, destinos, stores, medidas e regras preservados.

Verificações executadas neste lote:

- `npx tsc -b` e `npx eslint src/pages/ElementalPreview.tsx`: passaram.
- Build Vite por API com `envDir:false`: passou; avisos anteriores de Browserslist/chunks grandes.
- `sips` confirmou dimensões e alpha dos quatro PNGs e WebPs; codificação lossless concluiu nos quatro arquivos.
- Conferência SHA-256 confirmou que os quatro assets do `public` estão idênticos no `dist`; nenhuma publicação realizada.
- `git diff --check`, whitespace/conflitos nos novos arquivos e versões 0.1.36 nos três campos: passaram.

Não executados: inspeção renderizada do app, testes de pausa/fallback/links/movimento reduzido, capturas, hitboxes ou responsividade. Bloqueio salvo de localhost persiste conforme registro anterior; sem nova tentativa nem contorno. Visual das artes aprovado pelo executor, não equivale a aprovação visual/interativa da página. Próximo: após liberação efetiva, conferir 360/390/768/1440, leitura dos assets pequenos, trajetória, oclusão, seleção, pausa e carregamento.

Reservas encerradas: novos assets, prévia TSX/CSS, relatório R02, manifests/changelog e registros. Revisão documental pelo coordenador; independente pendente. Sem secrets, nova dependência, deploy, migração, commit ou push.

## R02 — anel em profundidade implementado (21/10/2026 / 0.1.35)

Usuário aprovou a direção e reforçou a referência Carousel Ring. Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Prévia pública do Scrolltide aberta e inspecionada visualmente no navegador interno (anel inclinado e sobreposição); sem consulta a conteúdo pago. [Detalhes](03-Project-Management/reports/R02-PERSONAGEM-ELEMENTAL.md).

Em `/previa-elemental`, quatro portais passam a uma órbita estreita/inclinada ao redor do corpo com escala, opacidade e ordem de camadas conforme profundidade. Corpo permanece na camada central; portais posteriores são ocultados pela silhueta. Foco eleva o alvo para leitura/seleção; setas giram 90 graus e pausam, inclusive com movimento reduzido. Pausa por mouse ocorre no portal, permitindo observar o movimento sobre o restante da cena. Navegação/dados/regra/persistência e asset anterior preservados. Sem nova geração de imagem ou dependência.

Executados: `npx tsc -b`, `npx eslint src/pages/ElementalPreview.tsx`, build Vite por API com `envDir:false`, `git diff --check`, conferência de whitespace/conflitos dos novos arquivos e paridade das três versões em 0.1.35; passaram. Build mantém avisos de Browserslist/chunks grandes. Estes resultados não verificam renderização ou interação.

A referência pública foi inspecionada; o produto local não: permanece bloqueio salvo de localhost já registrado, sem nova tentativa nem contorno. Não executados neste refinamento: screenshots do app, testes de toque/teclado, pausa/retomada, hitboxes ou responsividade. Próximo: após liberação efetiva, conferir 360/390/768/1440, oclusão frente/atrás, foco visível, setas, links, movimento reduzido e corpo inteiro. Direção aprovada pelo usuário; fidelidade visual/interativa ainda em revisão. A home vigente segue intacta.

Reservas encerradas: prévia TSX/CSS, manifests/changelog, relatório R02, fila e continuidade. Revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.

## R02 — corpo elemental e órbita implementados; revisão visual pendente (21/10/2026 / 0.1.34)

Astro Boy, execução e revisão documental sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Pedido do usuário: substituir o boneco pela referência corporal de Treinos → Corpo, adaptada à identidade elemental, com os quatro elementos orbitando. Aplicado na composição `/previa-elemental`; home vigente e tela de medidas Fitness preservadas. Alterações I03/R01/R02 preexistentes mantidas.

Novo asset `public/sanctuary/elemental-body-v1.png`, derivado do manequim original pela ferramenta integrada image_gen, inspecionado visualmente como arte isolada. Órbita elíptica de 48 segundos, rótulos verticais, botão de pausa/retomada, suspensão por mouse/foco/toque, movimento reduzido, aba oculta e saída da área visível. A composição deixa de usar o Canvas 3D; stores, regras, medidas, inventário e destinos continuam existentes. Arte não representa equipamentos adquiridos. [Origem e prompt](03-Project-Management/reports/R02-PERSONAGEM-ELEMENTAL.md).

Verificações realmente executadas neste refinamento:

- `npx tsc -b`: passou.
- `npx eslint src/pages/ElementalPreview.tsx src/App.tsx`: passou, sem saída de erros/avisos.
- Build Vite por API com `envDir:false`: passou; avisos existentes de Browserslist desatualizado e chunks grandes. O bundle de AuraAvatar3D continua usado por outras telas; não há alegação de remoção global ou benchmark.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha`: 913 × 1723, alpha presente. Dimensões declaradas no componente correspondem ao asset.
- `git diff --check`, conferência de whitespace/conflitos nos novos arquivos e paridade das três versões em 0.1.34: passaram.

Não executados: inspeção da página, screenshots, hit tests, testes de navegação/pausa/foco/movimento reduzido ou regressão funcional nesta etapa. Permanece o bloqueio salvo de localhost informado anteriormente; nenhuma tentativa de contorná-lo. Compatibilidade estrutural pelo código/build não equivale a aceite visual.

Reservas encerradas: prévia TSX/CSS, novo asset e relatório, manifests/lockfile/changelog, fila e continuidade. Revisão documental independente pendente. Próximo: remover o bloqueio salvo do navegador e inspecionar `/previa-elemental` em 360/390/768/1440, corpo inteiro, trajetória e quatro alvos, pausa/retomada/teclado/toque, links e retorno, antes de promover à home. Sem secrets, deploy, migração, commit ou push.

## R02 — prévia implementada, validação visual pendente (21/10/2026 / 0.1.33)

Continuação autorizada após escolha do usuário: personagem protagonista, elementos ao redor e página própria de cada elemento com retorno ao Santuário. Código em `src/pages/ElementalPreview.tsx` e `elemental-preview.css`; `src/App.tsx` adiciona rota protegida e lazy `/previa-elemental`. Query `elemento` seleciona as quatro páginas; valor desconhecido mostra orientação para escolher um portal. A home vigente permanece intacta.

Composição: avatar 3D existente/Canvas único na prévia, progressão/recursos lidos dos getters existentes, símbolos elementais em órbita com giro por botão, seis espaços de equipamento numa ficha com descrição explícita de inventário indisponível. Áreas canônicas e personalizadas, estado ativa/disponível, busca sem diferenciação de acento, expansão por controle nativo, acesso a Exercício Físico/Treinos e demais Domínios. Links para funcionalidades atuais. Nenhuma operação de escrita nos stores adicionada; nenhum cálculo de pontuação substituído. Tokens locais, foco visível, movimento reduzido CSS e layouts responsivos implementados, ainda sem validação renderizada.

Evidências executadas: `npx tsc -b` passou; `npx eslint src/pages/ElementalPreview.tsx src/App.tsx` passou sem diagnósticos; build Vite via API com `envDir:false` passou após alterações finais (sem carregar .env), com avisos de Browserslist e chunks grandes. `git diff --check` passou; script Python confirmou três versões 0.1.33 e ausência de espaços finais/marcadores de conflito nos arquivos novos. Revisão estática React aplicada. Nenhum teste funcional/browser, captura, hit-test, contraste instrumental ou benchmark executado no R02.

Navegador: tentativa inicial de abrir localhost recusada. Usuário autorizou explicitamente no chat; repetição foi negada por preferência salva de bloqueio do endereço. Não contornar. Próximo: usuário remover essa preferência e avisar; então abrir `/previa-elemental`, validar 360/390/768/1440, quatro seleções e giro, ficha/fechar/foco, busca/vazio, destinos de áreas, reload/back, movimento reduzido e preservação dos dados. Só após evidência visual e opinião do usuário avançar a R03/substituição da home. A autorização no chat já existe, não perguntar novamente por mera confirmação; falta liberação efetiva na ferramenta.

Versão 0.1.33 sincronizada nos manifests/changelog vigente. Reservas encerradas; implementação em revisão, aceite visual pendente. Alterações anteriores I03/R01 preservadas. Sem secrets, deploy, migração, commit, push ou modificação de configurações globais. Revisão documental por Astro Boy; independente pendente.

## R01 — diagnóstico entregue; composição visual a decidir (21/10/2026)

Pedido vigente: análise geral prioritariamente frontend, referências Scrolltide/X/openGym e arquitetura em partes, com diálogo antes de definir cada aplicação visual. Decisões recebidas: personagem, evolução e equipamentos protagonistas, quatro elementos ao redor; em 21/10/2026 o usuário confirmou página própria do elemento, com botão para voltar ao Santuário. Base local confirmada `f07292f`, branch `codex/fitness-ui-integration`, versão 0.1.32; alterações I03 preservadas. Entrega em [REPAGINACAO-ELEMENTAL-2026-10.md](03-Project-Management/reports/REPAGINACAO-ELEMENTAL-2026-10.md), vinculada no índice. Fila R01 e propostas R02–R08 registradas, sem segunda fila. Reservas documentais encerradas.

Principais achados: linguagens visuais gerais/Fitness/personagem divergentes; seleção elemental sem teclado e sem preservar elemento no destino; metadados de navegação inconsistentes; equipamentos ainda visuais; histórico do Astrolábio parcialmente aleatório. Movimento tem suporte reduzido parcial e proteções 3D existentes a preservar. Cassino tem recompensa direta e gasto em estado de sessão: questão de domínio registrada, não corrigida neste lote.

Inspeção estática e observação no navegador de Santuário/Pilares/Treinos; previews públicos Carousel Ring/Expanded Cards/Showcase Card; posts X lidos no navegador (vídeo do segundo não abriu); artigo Master.dev; README/manifesto/NOTICE e home do demo openGym. Sem sessão completa no demo e sem teste funcional do app nesta análise. Auditoria de movimento somente leitura por `/root/auditoria_movimento`, retomada após interrupção por limite de uso; consolidada pelo coordenador. Sem nova execução de build/lint/Deno/matriz responsiva/medição de performance. Revisão documental sequencial por Astro Boy; independente pendente. Nenhuma edição de produto, secrets, deploy, migração, commit ou push; sem bump por documentação isolada.

Verificação documental: `git diff --check` passou; script Python conferiu links do relatório/índice/continuidade, formatação do relatório e paridade de versões 0.1.32. Não é validação funcional. Wizard: saída completa recuperada do arquivo temporário; serve a procedimentos manuais de infraestrutura, não design. Nenhum script de credencial criado. Próximo: preparar R02 com composição do Santuário e página própria de elemento para avaliação. A escolha de navegação já foi respondida; não perguntar novamente. Preservar I03 e regras restauradas por Matheus. Não retomar pelo histórico F57 como se sua fórmula por blocos fosse vigente.

## I03 — retomada concluída em 20/10/2026 / 0.1.32

Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`. Preferência do usuário: Astra Médio; nenhuma troca automática de modelo. Pull autorizado `git pull --ff-only origin main` integrou `fe1a8fe → f07292f` sem conflitos, partindo de árvore limpa. Matheus encerrou a restauração da recompensa consolidada e o tratamento de sessões vazias Fitness; código e decisões recebidos preservados. Não houve nova mudança de domínio.

I03 já existia e estava aceito com mocks em 09/10. A retomada confirmou consentimento explícito, corpo somente message/consent, JWT da sessão, validação Auth no gateway, proposta editável e gravação pelo `addDraft` existente. Lacuna estática corrigida: resumo final de DRAFT não mostrava o conteúdo a confirmar; agora exibe nome/descrição revisados e informa que nada foi salvo. Nenhuma store, regra, schema, função remota ou configuração Auth alterada.

Evidências desta execução:

- `deno test supabase/functions/assistant-suggest/index_test.ts`: 7/7, dependências simuladas, sem permissões de rede/secrets.
- `node tests/assistant/i03-browser.mjs`: passou, Auth/provedor simulados somente no módulo Invocar, app/store reais, perfil temporário e rede externa bloqueada. Consentimento, payload mínimo/JWT de fixture, sugestão/etapa de revisão sem gravação, edição, confirmação/addDraft/reload, falhas 401/429/503/502/resposta incompleta/sessão ausente e fallback manual. Snapshots de user/tasks/habits/projects/quests/executionLogs preservados. Zero page errors. Sem overflow do resumo em 360/390/768px; captura 390 inspecionada visualmente. Artefatos: `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-i03-PlxdcC`. Tentativas iniciais corrigiram seletores da automação (cartão, resumo e botão homônimo da sidebar); não eram falhas adicionais do produto.
- TypeScript `npx tsc -b` e build Vite por API com `envDir:false` aprovados; arquivos .env não carregados. Build avisa Browserslist/chunks grandes. Lint: 0 erros / 4 avisos em Ciclos/Temporal. `git diff --check` e paridade das três versões passaram.
- Skill Supabase e documentação oficial Auth/changelog consultadas. Aviso TLS/CBC publicado em 12/10 trata clientes antigos; não requer modificação deste handler local. Sem teste de compatibilidade TLS remota.

Reservas de Invocar, teste, manifests/changelog, guia, fila e continuidade encerradas. Versão 0.1.32 sincronizada nos três campos dos manifests e changelog vigente. Revisão documental pelo coordenador; revisão independente pendente. Sem secrets lidos/criados, deploy, migração, commit ou push. Aceite: protótipo local no escopo I03. Chamada real/Auth remoto/quotas continuam não verificados; I04 exige escopo próprio. Fitness recebido teve checagem estática/build/lint, não um novo teste funcional completo. Próximo: revisão do usuário da confirmação; manter ativação remota fora deste lote.

## F59 — concluído: navegação e recuperação integrada Fitness / 0.1.31

13/10/2026. Astro Boy executou sequencialmente no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration; Astra Alto informado pelo usuário. Alterações preexistentes preservadas. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Revisão documental pelo coordenador, independente pendente. Sem commit, push, deploy ou migração remota.

### Referências e entrega

| Referência | Implementação atual e limite |
|---|---|
| 1 — modalidades | Biblioteca/editor existentes preservados. Mesmas quatro abas em Terra, Treinos e aliases. FAB oculta/restaura conforme Montar treino; modalidade preservada ao alternar abas. |
| 2 — prévia | Recuperado WorkoutPreviewHero; planos Native têm prévia com imagem disponível, programa expansível, mídia, instruções, séries, perfil muscular, edição e início/continuação. Preview legado usa a mesma capa/casca. Planejar data abre editor existente; não cria evento Core novo. |
| 3 — execução | Mídia/progresso existentes preservados. Pausa/retomada do relógio persistida na sessão; não altera XP ou tempo ativo declarado. Descrição por bloco e distância manual para corrida/natação/ciclismo recuperadas no fluxo Native. Ações cabem em uma linha e respeitam navegação/sidebar. |
| 4 — resumo | Casca/estrelas/XP histórico preservados; fallback de mídia do catálogo/Yoga recuperado; descrição/distância por bloco e ritmo de corrida informados no resumo. Vídeo tem estado de erro/repetição em vez de rejeição de play não tratada. |
| 5 — corrida | Tempo, pausa/retomada, distância manual, ritmo dos blocos com distância, conclusão parcial e resumo funcionais. GPS/mapa, batimentos e calorias não têm fonte implementada; não há medições simuladas. |
| 6 — painel | Recuperado Saúde → Hoje com anéis/mini gráficos. Usa exercícios registrados e recursos reais do jogo: Prana vem do appStore/Core, não da fórmula legada de pontuação. Anéis de sono/água não são preenchidos sem fonte. Configuração de widgets personalizados não implementada nesta etapa. |
| 7 — corpo/evolução | Manequim/avaliações existentes preservados; Corpo e Evolução navegáveis pela mesma casca. Atividade e treinos recentes passam a incluir históricos novo e legado. |
| 8 — semana | Barras/dias recuperados, navegação por semanas, retorno à atual e filtro de histórico por dia. Minutos ativos incluem estimativa de repetições; registros antigos sem observação usam relógio da sessão. Carga percebida só usa RPE registrado. |
| 9 — histórico | Histórico único preserva recibos e abre resumo. Filtro por dia conectado à semana; limpar filtro e ver todo o histórico disponíveis. Nenhuma recompensa passada recalculada. |

Fonte de leitura compartilhada `activity-history.ts`/`use-fitness-history.ts`, sem persistência paralela. Tipos recebem campos opcionais de pausa, distância e notas; validação na store existente. Dados históricos não convertidos. Rota `/fitness` continua compatível; aliases Saúde/Corpo/Histórico redirecionam para abas canônicas `/treinos`. Ações de execução preservam seleção global Mais em ambas as entradas.

### Evidências executadas

- Deno: 8/8 (recompensa/projeção existentes + histórico misto, deduplicação, séries puladas, ausência de RPE e relógio pausado). Comando usa `/tmp/f57-importmap.json` e `--unstable-sloppy-imports --no-check`; TypeScript validado separadamente no build.
- Regressão `/tmp/f57-check.mjs`: criação/início/resumo, estrelas persistidas, recibo imutável, segunda sessão/gráfico, 360/390/768 sem overflow e zero page errors.
- `/tmp/f59-check.mjs`, perfil temporário: Yoga criado pela UI → prévia/imagem → editar/cancelar → iniciar/pausar/reload/retomar → concluir/estrelas/reload → histórico → Saúde/semana/dia. Corrida com dois blocos: distância/descrição persistidas após reload, um bloco concluído, finalização parcial confirmada, resumo com distância/ritmo/notas. Aliases com quatro abas idênticas; registro corporal/reload. Telas biblioteca/saúde/semana/corpo/histórico sem overflow em 360/390/768, zero page errors. Primeiras tentativas corrigiram seletores ambíguos da automação e fixture de apenas uma série; a execução final passou.
- `/tmp/f59-layout.mjs`: FAB hide/restore, criação de exercício próprio, CTAs finalização/cancelamento em uma linha, hit test positivo, acima da navegação em 360/390/768; tablet respeita sidebar. Cancelamento/descartar confirmado. Zero page errors.
- Inspeção visual das capturas `/tmp/f59-preview-390.png`, `health-{390,768}`, `week-390`, `body-filled-390` e `active-final-{360,768}`. Demais capturas disponíveis em /tmp; não confundir ausência de overflow com inspeção visual de todas elas.
- Build final aprovado (avisos preexistentes Browserslist/chunks); lint final 0 erros/4 avisos preexistentes em Ciclos/Temporal. `git diff --check` passou e as três posições de versão conferidas em 0.1.31. Dados de teste isolados do perfil real. Reprodução de vídeo remoto válido, GPS, sensores, sync cloud e backend não testados/implementados nesta etapa. Fluxo completo de execução legada não retestado; prévia legada teve leitura estática e build.

Reserva F59 encerrada após verificações. Próximo: revisão de Fábio com seus dados reais; integrações de sensores/sono/água e widgets são funcionalidades próprias futuras, não restauração de fonte existente. Astra Alto adequado para integração; Sol 6.1 Médio para ajustes visuais pontuais. Versão 0.1.31; não declarar publicação remota.

## F58 — concluído: Corpo conforme referência Fitness / 0.1.30

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration. Astro Boy executou sequencialmente, Sol 6.1 Médio informado; sem troca automática. Skills frontend-design/imagegen e orientações já lidas de testes/React/versionamento. Alterações preexistentes preservadas. Reserva encerrada: BodySilhouette, BodyMetricsCard, Corpo/FitnessRoot (cabeçalho embutido), asset public/fitness/body/mannequin-front-v1.png, manifests e docs.

Substituído SVG simplificado por manequim 3D branco com roupa esportiva neutra e fundo transparente, gerado para o projeto; ilustrativo, não adapta anatomia às medidas da pessoa. Asset 912×1724, cerca822KiB, copiado para public (origem `.codex/generated_images/.../exec-7636ee69-a984-4fa4-b088-fb6bd8438d60.png`). Composição como referência: título compacto, figura à esquerda, métricas em grade2×2 à direita, botão de avaliação mantido. Cabeçalho Meu corpo removido somente na aba embutida para evitar duplicação; standalone mantém cabeçalho. Card compartilhado com Saúde. Medidas e campos disponíveis preservados; não inventado valor de sono. Histórico, evolução do peso e outras medidas mantidos. Nenhuma alteração de store/cálculo/persistência.

Puppeteer `/tmp/f58-check.mjs`, perfil temporário separado: estado vazio, cadastro via UI de fixture explicitamente de teste (170cm/75kg/43%/20%), reload com valores intactos, imagem carregada, ausência de cabeçalho duplicado, reabertura/cancelamento do formulário. 360/390/768px: scrollWidth=viewport, zero page errors. Capturas `/tmp/f58-empty-390.png`, `/tmp/f58-body-{360,390,768}.png`;390 inspecionada visualmente. Dados do perfil real não usados nem alterados. Não testada rota Saúde visualmente nesta etapa, embora reutilize o mesmo componente. Build final passou (avisos Browserslist/chunks), lint final passou com 0 erros/4 avisos preexistentes Ciclos/Temporal, diff-check e paridade0.1.30 passaram; revisão documental independente pendente, realizada revisão sequencial pelo coordenador. Sem commit/push/deploy/migração. Próximo: revisão de Fábio e demais telas da fila; Sol 6.1 Médio permanece adequado.

## F57 — concluído: resumo completo e equilíbrio Native / 0.1.29

Astro Boy executou no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, preservando alterações anteriores. Modelo informado: Sol 6.1 Médio, sem troca automática. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Revisão documental sequencial pelo coordenador; revisão independente pendente.

Resumo Native restaura estrelas (WorkoutRating já existente, inclusive reload), detalhes de séries concluídas/puladas, RPE observado ou fallback identificado, carga/volume kg·reps, fator, mídia/notas do snapshot, perfil muscular ponderado por tempo ativo e evolução das últimas sete sessões do mesmo template. Sem perfil, mostra ausência; sem duas sessões comparáveis, mostra ponto de partida. Avaliar não altera recompensa. Casca compartilhada tem espaçamento mais compacto. Editor permite Salvar e iniciar agora; bloqueia outro início enquanto há sessão ativa, preservando opção de salvar apenas.

Diagnóstico do exemplo: 120 min eram duração manual planejada, mas três séries contabilizavam 2 min ativos estimados. Isso não autoriza conceder XP por duas horas não registradas. Além disso, uma série de 10 reps tinha metade da base de um bloco de 40s, apesar da heurística de 4s/repetição. Core block-v2 normaliza base de repetições ×2; ER canônico inalterado. Prévia do editor/biblioteca e progressão de check-ins usam o construtor/calculador Core de blocos da conclusão. Tetos por bloco preservados: segmentações diferentes ainda podem alterar o prêmio. Novos recibos identificam v2; históricos não são recalculados. Interface distingue ativo estimado/informado/misto do relógio e do planejamento. Peso absoluto não infere RPE.

Evidências executadas: build final aprovado (avisos Browserslist/chunks); lint global final 0 erros/4 avisos preexistentes Ciclos/Temporal; Deno 5/5, incluindo equivalência reps/tempo, RPE, pulados/zero e paridade preview/check-in/conclusão sem influência do tempo manual. Comando de projeção usa import-map local `@/` e `--unstable-sloppy-imports`; fixture import-map em `/tmp/f57-importmap.json`. Puppeteer `/tmp/f57-check.mjs`, perfil temporário Chrome: criar exercício próprio de musculação com imagem, salvar/iniciar, concluir, resumo +3,3 XP v2, estrelas4/reload, recibo intacto, retorno ao histórico e repetição do plano gerando gráfico; zero page errors. 360/390/768px sem overflow. Capturas `/tmp/f57-editor-390.png` e `/tmp/f57-summary-{360,390,768}.png`; editor e resumo390 inspecionados visualmente. O teste usa mídia Yoga como fixture de carregamento, não uma imagem prescrita para musculação. Vídeo real, fluxo de hábito/rotação na UI e cloud não testados neste lote; a paridade de check-in foi testada na função de projeção.

Versões 0.1.29 nos manifests/changelog. Sem commit/push/deploy ou migração remota. Próximo: avaliação de Fábio com seu treino real; para representar uma sessão longa, cadastrar todos os exercícios/séries realizados ou blocos por tempo. Manter Sol 6.1 Médio para integração/UX; etapa Astro Boy runtime permanece na fila posterior, sem serviço implementado neste lote.

# Retomada vigente — F56 editor único e catálogo livre / 0.1.28, 13/10/2026

Astro Boy, Sol 6.1 Médio informado/recomendado. Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch codex/fitness-ui-integration; alterações locais anteriores preservadas. F55 não atualizara app-routes: menu ainda apontava para /treinos/legado. F56 corrigiu menu para /treinos e fez /treinos/legado montar FitnessRoot, preservando query strings e compatibilidade dos registros sem exibir segundo editor.

Editor único com nome/modalidade/data, exercícios e mídia primeiro; esforço/estimativa num painel expansível, mantendo recibos/regras. Data opcional é metadado do planejamento local e não cria Task/Habit/agendamento Core. Exercícios próprios são criados pelo saveCustomExercise nos dois catálogos existentes da conta com identidade correlacionada; nativeCatalog/exercisesCatalog persistentes existentes, sem novo store. Criar exercício não exige busca positiva. Nome e medida configuráveis; perfil muscular fica vazio enquanto usuário não o informa. UI permite overrides opcionais somando 100%. Corrigida a construção de resultados novos para não transformar distribuição explicitamente vazia em 100% Core; sessões históricas não foram recalculadas.

Campos opcionais imageUrl/videoUrl em catálogos/planos/resultados; snapshot/plano e execução usam mídia configurada, com fallback Yoga preservado. URLs admitidas http(s) e caminho do app; não há upload, biblioteca completa de imagens ou integração YouTube. Clonagem de planos legados preserva mídia/notas. Campo de vídeo direto vinculado ao VideoExercisePlayer existente; reprodução de arquivo real não foi testada. Esportes por tempo apresentam minutos (internamente segundos inteiros) e descanso, sem carga em kg; repetições/Yoga preservam seu contexto.

Testes atuais: /tmp/f56-check.mjs, perfil Chrome temporário 390px, comparou nome/fields do editor nas três entradas; criou movimento próprio em Musculação com busca sem resultado, salvou data/imagem, reload persistiu template/exercício, imagem local carregou na execução, conclusão abriu resumo com +1,7 XP Core, distribuição muscular permaneceu vazia. Editou vínculo de vídeo e reload preservou URL/player. Zero page errors; 390/360/768px sem overflow horizontal. Vídeo de fixture inexistente verifica apenas vínculo/elemento, sem prova de reprodução. /tmp/f55-fitness-check.mjs reexecutado: criação/edição Yoga, três séries, mídia, conclusão +11,1 XP e histórico; FAB hide/restore passou. Capturas /tmp/f56-editor-390.png e /tmp/f56-active-390.png; editor e execução inspecionados visualmente. Build final passou com avisos antigos de Browserslist/chunks; lint final passou com 0 erros e os 4 avisos anteriores. Teste de tempo em /tmp/f56-minutes.mjs confirmou 0,5min persistido como 30s e ausência de campo kg em Ciclismo. Testes Deno de recompensa: 3/3 passaram. Diff-check e paridade de versões conferidos no encerramento.

Versão sincronizada 0.1.28. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Responsável documental independente indisponível; coordenador atualiza evidências/retomada para revisão posterior. Sem commit/push/migração remota. Próximo: revisão visual do usuário, mídias reais para modalidades e teste de reprodução; depois plano de runtime Astro Boy conforme PLANO-ORQUESTRACAO. Não alterar regras de XP nesta etapa.

# Retomada vigente — F55 interface única Fitness / 0.1.27, 13/10/2026

Astro Boy coordenou/executou no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`. Modelo informado por Fábio: Sol 6.1 Médio; sem alteração autônoma do modelo. Alterações preexistentes preservadas. Skills frontend-design, webapp-testing, React best practices e auto-versionamento aplicadas. Reserva: App/rotas, FitnessRoot, NativeTemplateDialog, ActiveFitnessSession, WorkoutSummary (textos de apresentação), FitnessPageShell, fila/continuidade/plano de orquestração, manifests/changelog.

F55 implementado: `/treinos` e `/fitness` montam FitnessRoot; novos planos usam NativeTemplateDialog e execução Native/Core nas duas entradas. Grid preserva ícones exatos e seis modalidades de referência, com Musculação e modalidades adicionais dos catálogos/planos existentes preservadas. Histórico/Corpo antigos são aliases da casca canônica. Planos legados permanecem na biblioteca e usam o mesmo editor via adaptação de apresentação, salvando pelo updateWorkout existente sem migrar IDs. Data, séries, notas e overrides preservados. Sessões legadas pré-existentes ainda usam sua rota de execução compatível; não foram convertidas nem mudaram de fórmula. `/treinos/legado` permanece rota de compatibilidade.

FAB observa o próprio botão Montar treino (90% visível, margem de 80px para navegação) e desaparece enquanto o CTA está utilizável; reaparece na rolagem de volta. Editor usa cabeçalho/rodapé fixos do builder compartilhado. Native tem casca mobile/tablet e navegação global, mídia Yoga real, séries concluídas compactas/reversíveis e ação Concluir treino. O teste detectou a corrida entre sessão ativa removida e Navigate ao histórico; a rota agora reconhece a sessão completa no nativeHistory e navega ao resumo, inclusive ao reabrir a URL concluída.

Evidências atuais: `/tmp/f55-fitness-check.mjs` (Chrome temporário, 390×844) confirmou mesmas entradas, FAB sumir/voltar, criação Yoga com três séries, edição de nome, execução, três conclusões, mídia real, resumo com +11,1 XP Core e retorno ao histórico canônico; scrollWidth=390 e zero page errors. `/tmp/f55-legacy-check.mjs` criou plano via UI compatível, editou no novo editor e comparou snapshot de ID e séries integralmente iguais; zero page errors. Hub em 360/768px com scrollWidth igual à viewport. Capturas `/tmp/f55-editor-390.png`, `/tmp/f55-active-390.png`, `/tmp/f55-summary-390.png`, `/tmp/f55-hub-360.png`, `/tmp/f55-hub-768.png`; editor e execução inspecionados visualmente. Testes abrangem Yoga e edição simples; demais modalidades, alteração de data/overrides e retomada de sessão legada permanecem pendentes.

Versão 0.1.27 sincronizada. Build final passou (avisos de Browserslist/chunks grandes); lint final passou com 0 erros e os 4 avisos preexistentes de Ciclos/Temporal. git diff --check e paridade dos três campos de versão passaram. Agente documental independente indisponível nesta equipe; coordenador mantém continuidade para revisão posterior. Sem commit/push/deploy ou mudança nas regras de XP.

Próximo: revisão visual de Fábio. Em seguida, planejar runtime local do Astro Boy para gerir lotes/agentes, com orçamento, registros, revisão e continuidade por Git, antes de inserir IA no aplicativo. Usar Sol 6.1 Médio para arquitetura/contratos; Luna Leve para inventário/documentação delimitados; sinalizar antes de escalar para Astra Alto em problemas arquiteturais persistentes. Ver PLANO-ORQUESTRACAO. Não foi instalado/implementado serviço de orquestração neste lote.

# Retomada vigente — F54 histórico e conclusão do Fitness / 0.1.26, 13/10/2026

## F54 concluído — histórico e conclusão unificados, 13/10/2026

Pedido: explicar e corrigir a diferença entre “Sessões registradas” (+50 XP Core) e “Treinos” (+11 XP legado), cartões com navegação desigual e ausência de uma recompensa clara no resumo legado. Implementação no checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`; alterações locais anteriores preservadas.

`WorkoutHistory` agora apresenta uma lista cronológica única de sessões completas, usando os dados originais dos dois modelos. Os cartões abrem a mesma rota de resumo. O fluxo Native, ao concluir, também abre `WorkoutSummary`; o resumo legado consulta XP do ledger e o Native consulta recibo/ExecutionLog/Core, mostrando XP indisponível quando não há evidência. Não houve alteração de fórmula, migração, recálculo ou escrita em dados. Valores de 50 XP e 11 XP foram confirmados no navegador e cada registro abriu o resumo com o valor intacto. Visualização verificada em 390px: resumo legível, recompensa destacada em verde Terra e CTA acima da navegação; sem overflow horizontal.

Build passou; lint passou com 0 erros e os mesmos 4 avisos preexistentes em Ciclos/Temporal; `git diff --check` passou após a documentação. Versão sincronizada em 0.1.26. Responsável especializado por Versionamento/Documentação indisponível nesta sessão; revisão local da fila, continuidade, changelog e manifests pelo coordenador, revisão independente pendente. Sem commit, push, migração ou deploy.

Próximo: revisar o diff delimitado e guardar confirmação do responsável documental no próximo lote. Validar com perfil temporário o encerramento Native ponta a ponta; a tela de resumo Native e o resumo legado já foram abertos via cartões no navegador, mas não foi concluído um novo treino Native neste lote.

## F53 concluído — fluxo mobile de treino, 13/10/2026

Checkout principal: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, base `b1575e4`. O worktree `e2b6` informado na instrução de contexto é snapshot separado; a continuidade/fila operacional aponta o checkout principal. Há alterações locais anteriores em diversas áreas; preservá-las. Sem commit/push.

Pedido: nas rotas `/treinos` e `/treinos/ativo/:sessionId`, usuário não localiza claramente continuar/concluir. Capturas mostram CTA fixo coberto pela navegação global. Reserva F53: `src/components/fitness-kit/FitnessStickyAction.tsx`, `FitnessPageShell.tsx`, `src/pages/fitness/WorkoutSelect.tsx`, `src/pages/fitness/ActiveWorkout.tsx`, fila/continuidade, manifests e changelog. Contrato: só UI/layout e clareza de navegação; manter stores, dados, rotas, regras de XP/Prana e recibos.

F53 concluído. A barra sticky agora fica acima da navegação global (64px + safe area); FitnessPageShell reserva espaço para ambas. `/treinos` é montada por `src/pages/fitness/WorkoutSelect.tsx` (não pelo WorkoutHub), então o cartão de sessão ativa mostra “Sessão em andamento” e uma etiqueta destacada “Continuar treino”. ActiveWorkout mostra “Finalizar treino” com blocos pendentes e “Concluir treino” quando todos foram processados; a confirmação de sessão incompleta foi mantida.

Validação em perfil Puppeteer temporário, 390×844: template de Corrida criado na UI; botão “Finalizar treino” ficou totalmente acima da navegação (y 720–768, nav y 779–844), hit test central retornou “Finalizar treino”, sem overflow e sem erros de página. Confirmação de incompleto abriu e permitiu continuar; tela /treinos mostrou o rótulo “Continuar treino” e reabriu a mesma sessão. Um bloco concluído com 10 minutos e RPE 5 mudou o CTA para “Concluir treino” e levou a `/treinos/resumo/:id`. Build passou (avisos de chunk >500 kB e Browserslist desatualizado); lint passou com 0 erros e quatro avisos preexistentes em Ciclos/Temporal; `git diff --check` e revisão documental passaram. Versão sincronizada em 0.1.25. Agente especializado de Versionamento/Documentação estava indisponível na lista de equipe; Astro Boy revisou fila, continuidade, changelog e paridade dos manifests nesta rodada. Revisão independente documental fica registrada para o próximo lote. Sem mudança de fórmula, store, histórico, migração, commit, push ou deploy.

Checkout principal do Mac: /Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app. Branch codex/fitness-ui-integration, HEAD b1575e4 = origin/main; nove commits de Matheus integrados por fast-forward, sem conflito textual. A branch main local em 6dac590 e o worktree /Users/fabioandre/.codex/worktrees/e2b6/Conselheiro_Elemental_MAIN foram preservados. Nenhum commit ou push feito neste lote.

Escopo sincronizado: editor de templates, execução e recompensas Core de treino, séries/ciclos compartilhados, widgets em Ciclos, histórico, catálogo Calistenia/filtros musculares e nova ordem da navegação global. As migrações SQL de cycle_sequences.is_active e sequence_memberships.position foram apenas revisadas; não foram aplicadas ao Supabase.

Durante a integração, o build da revisão anterior d89f202 passou, mas o HEAD recebido produziu 156 erros TypeScript por incompatibilidade do novo tipo Action com as views antigas; também havia um erro de lint. Compatibilidade de tipos foi recomposta, XP elemental foi mapeado para as chaves persistidas em inglês e telas de nível passaram a consultar getLevelProgress(). Em /treinos, selectors de getters derivados causavam loop de renderização; a tela agora lê métodos do store sem selectors instáveis.

Validação atual: npm run build passou (Vite avisa chunks >500 kB e base Browserslist antiga); npm run lint passou com 0 erros/4 avisos de hooks preexistentes; deno test --no-check supabase/functions/assistant-suggest/index_test.ts passou (7/7). Smoke Puppeteer em 360/390/768px: /treinos, /fitness, /treinos/painel e /treinos/historico renderizam sem overflow horizontal nem erros de página; /santuario também abriu sem erros em 390px. A captura /tmp/conselho-sync-treinos-390.png registra Escolher treino em celular. Revisão visual detalhada e fluxos reais de ciclo/recompensa continuam pendentes.

Diagnóstico de XP da captura de 13/10: `/fitness?tab=history` mostra a sessão “Caminhada Condominio” com `+0 XP`. Inspeção estática de `finishSession` (workoutStore.ts), `completeFitnessSession` (fitness-core-adapter.ts), `projectNativeLeafReward` (native-action-completion.ts) e `NativeSessionHistory.tsx` confirma que o histórico exibe o valor do ExecutionLog; a conclusão calcula ER apenas das séries marcadas como concluídas. A regra local em `MODALIDADES-E-METRICAS-TREINO.md` declara zero recompensa para sessão Native sem blocos concluídos. A captura prova zero registrado, mas não distingue ausência de série concluída de defeito no fluxo. Nenhum dado real foi lido ou alterado e nenhuma fórmula foi mudada. F50/V02 exige agora os cenários com zero séries e com pelo menos uma concluída em perfil temporário. Se o usuário concluiu uma série nessa sessão, reproduzir antes de alterar regras.

## F52 — ajuste do botão X da ficha Fitness (concluído em 13/10/2026)

No perfil temporário, o navegador em 390×844 confirmou botão 44×44px, ícone centralizado e ação de fechar; o sheet desaparece, rota retorna a `/treinos`, sem overflow (390px) nem erros de página. `npm run build` passou (avisos de Browserslist/chunks grandes), `npx eslint src/components/workout/ExerciseDetailSheet.tsx` passou, `git diff --check` passou e os três pontos de versão conferem em 0.1.24. Sem alterações de lógica/dados. Versão de trabalho 0.1.24.

## F51 — esforço por bloco e pontuação do treino (concluído em 13/10/2026)

Autorização: Fábio aprovou implementar a recompensa proporcional por atividade/série, considerando intensidade e tempo ativo, sem recalcular histórico. Ele repetiu o fluxo e confirmou +50 XP Terra ao marcar uma série concluída; isso confirma o fluxo positivo, mas não calibra justiça entre intensidades.

Checkout `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`, base `b1575e4`; 19 arquivos tinham alterações locais preexistentes no início desta etapa. Nenhum deles deve ser descartado ou atribuído ao F51. Versão de entrada 0.1.22.

Análise inicial de F51: Native usava ER consolidado e esforço global, enquanto o fluxo legado registra `activityLoad = minutos × RPE` com outra fórmula. A decisão final para esta entrega foi introduzir uma regra versionada no Core para o fluxo Native e preservar as regras/recibos anteriores; não harmonizou rotas legadas.

Implementação encerrada no checkout principal: nova regra `core-native-workout-block-v1` coleta esforço RPE 1–10 por série e pontua blocos concluídos no Core; tempo ativo e presença são aplicados uma vez, descanso fica fora e Prana é debitado uma vez por sessão com esforço ponderado. A confirmação e o histórico leem o recibo real; zero blocos gera zero XP/custo. ADR-003 descreve limites e imutabilidade.

Evidência de navegador em perfil temporário Puppeteer, viewport real 390×844 e sem overflow (390px): treino de Corrida com duas séries de 300s e RPE 2/9 foi iniciado, ambas concluídas e finalizado com +85,6 XP, 10 minutos ativos, 2 blocos e esforço ponderado 3/5; sem erros de página. Teste unitário Deno: 3/3 passou, cobrindo leve, intenso/misto, blocos pulados, nenhum bloco e RPE inválido. `npm run build` passou (avisos de chunks >500 kB e Browserslist antigo); `npm run lint` passou sem erros, com quatro avisos em Ciclos e páginas Temporal; `git diff --check` passou. Não foi aplicado schema/migração Supabase nem comprovada sincronização remota; histórico legado não foi recalculado. Limite: teto por série permite que dividir trabalho equivalente em blocos mude a soma. Reversão/retry idempotente e modalidades não-Corrida não foram incluídos no smoke.

Versão sincronizada: 0.1.23 em package.json, package-lock.json e changelog Fitness. As 19 alterações locais preexistentes e demais áreas fora da reserva F51 foram preservadas. Sem commit, push ou deploy. Próximo passo: validar outros tipos/modalidades e os fluxos de continuar, desfazer e histórico em lote próprio; sincronização remota requer decisão e evidência separadas.

Ponto de atenção de domínio: os capítulos versionados no app agora usam VALUABLE/VALUELESS/NOTE e chaves de XP como xp_terra; a fonte indicada como principal em docs-conselho-master ainda usa semântica legada (valuable/structural/text) e há nomes diferentes de XP. O código mantém os dois formatos de semântica por compatibilidade; não houve migração de dados nem mudança de fórmula. Resolver a autoridade entre esses documentos antes de novas mudanças de regra.

Organização: a pasta principal para continuar é Conselheiro_Elemental_MAIN. Developer/ConselhoElemental-main é outra cópia com Git próprio, package.json 0.0.0 e .env; foi preservada sem ler segredos ou apagar conteúdo. Não confundir com o checkout principal nem copiar .env. Versão local atual 0.1.25 em package.json, package-lock e docs/03-Project-Management/fitness/CHANGELOG.md.

Próximo passo após F53: validar modalidades além de Corrida e cobrir desfazer/idempotência em lote separado. F45–F50 ainda têm pendências de interface/fluxo listadas na fila. Persistência remota não foi confirmada nesta etapa.

## Retomada anterior — P01 / 0.1.21, 10/10/2026

## UI04 — Editor de template de treino (em revisão)

Pedido: preservar todas as telas e prosseguir com o primeiro ponto da proposta (catálogo/editor). Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; base `55d3e17 navbar`. Contratos lidos: `02-Platform-Architecture/01-Core-vs-Native-Modules.md` e `01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md`. O formulário existente agora aceita editar template planejado na rota ativa `/treinos` (`pages/fitness/WorkoutSelect.tsx`) e no Hub alternativo (`pages/WorkoutHub.tsx`), manter exercício/plano IDs, configurar cada série individualmente (repetições inteiras ou isometria inteira em segundos, carga, descanso e fator canônico), adicionar/remover séries e programar data; templates com exercício ausente no catálogo ficam bloqueados para preservar dados. A projeção mostra ER e `base_value` com fatores 0.8/1.0/1.5, sem anunciar XP/Prana concedidos. Campo opcional `loadFactor` é normalizado para 1.0 em planos antigos e copiado ao snapshot da série iniciada. Impacto Frontend: editor e projeção no Módulo de Treino. Impacto Core/Backend: contrato de planejamento/snapshot estendido sem mudança nas fórmulas, recompensa, adapter, recorrência ou persistência remota; o fluxo atual de pontuação continua separado e a integração canônica segue pendente. Todas as páginas e rotas anteriores foram mantidas. Também foi corrigida a ordem do alias `FitnessModuleFab` que causava TDZ no HEAD `55d3e17`. Skill aplicada: `app/.agents/skills/frontend-design/SKILL.md`; direção manteve Inter, canvas escuro, grafite e violeta existentes. `git diff --check` passou. Testes, build, lint e verificação visual não executados; regressão de leitura dos dados persistidos antigos pendente antes de aceitar o campo opcional.

## App Shell / Fitness — implementação local pendente de revisão visual (10/10/2026)

Checkout `C:\Users\mathe\Downloads\Dominio-Atualizado\ConselhoElemental-main`; perfil explícito Matheus/fullstack. Implementado shell global com quatro destinos fixos (Santuário, Ciclos, Pilares, Mais), e FitnessPageShell agora preserva navegação global mesmo em páginas focadas. Antiga barra inferior Fitness removida: o componente compatível renderiza top tabs Treinos/Histórico/Saúde; ação Criar treino é FAB nas telas de hub/dashboard. `hideNav` não suprime mais a navegação global. Arquivos de layout e páginas Fitness alterados; sem mudança em stores/contratos.

Verificações executadas em 10/10: `npm run build` e `npm run lint` passaram; `git diff --check` passou. Nenhum teste visual de navegador executado. Próximo: revisar 360/390/768px e desktop, conferir posicionamento de FAB e barra global nas rotas Fitness e atualizar fila com resultado. Não houve bump, commit, push ou deploy.

Astro Boy/Sol médio. Fábio autorizou publicar o estado acumulado em Matheuscroft/ConselhoElemental-main e preparar a colaboração de Matheus/backend/documentação. Regras raiz para Codex/Cursor/Claude, oito skills portáveis, perfil explícito local e roteiro inicial implementados. Matheus configura `node app/scripts/astro-boy.mjs setup --name Matheus --role backend` na raiz; depois pede ao agente da IDE para continuar. Perfil ignorado, sem IP. Fábio/frontend usa seu próprio perfil.

Pastas inventariadas por astro:audit; plugin dev sem uso removido com 99 pacotes do lockfile, sem atualizar outras dependências. Metadados macOS removidos; assets/páginas/contratos preservados. Build/lint/astro:test e sete testes Deno com mocks passaram; cópia limpa instalou 482 pacotes com npm ci --ignore-scripts, build/astro:test e presença das oito skills/regras/docs conferidos. Zero erros de lint, quatro avisos anteriores. npm audit e limites de performance em AUDITORIA-PUBLICACAO. Não houve novo teste visual neste lote.

Próximo de Matheus: ler auditoria core e escolher teste de execução/reversão/idempotência na fila antes de alterar regra. Próximo de Fábio: revisão visual Fitness e edição de planos em lote próprio. I04 remoto segue pendente; muscle split é estimativa, atividade física continua Terra conforme contrato atual. Publicação confirmada em main: push sem force 03f0588 → 4f180f9 aceito pelo GitHub em 10/10/2026. Este registro documental encerra P01; conferir git fetch/log ao retomar. IDE de Matheus ainda precisa comprovar carregamento das regras; não alegar ativação universal automática.

---

# Retomada vigente — M01 / 0.1.20, 10/10/2026

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; Astro Boy/Sol médio. Pedido das oito imagens: contexto específico dos esportes, ficha/preview/execução coerentes, registro real de esforço/tempo e distribuição/recompensas. Implementação descrita em [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md). 21 modelos nativos adicionados sem substituir catálogo legado; sete artes, contexto filtrado, registro de tempo ativo/esforço/distância/notas e perfil muscular editável. Fluxo visual unificado; histórico não recalculado, snapshots v2 novos e ledger idempotente. Física permanece Terra; não afirmar pontos automáticos dos quatro elementos ou medição exata de músculos.

Próximo: revisão do usuário do fluxo; eventual integração elemental via áreas/ações canônicas deve ser lote próprio, após resolver divergência de adapter registrada. Sem GPS/IA clínica ou texto transformado em ativação muscular. UI de edição de treino continua lote futuro. Servidor 5174; sem commit/push/deploy. Evidências atuais em fitness-modalities-20261010; verificar encerramento M01 na fila. Não usar as capturas históricas como aprovação atual.

---

# Retomada vigente — UI03 / 0.1.19

Checkout principal `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Astro Boy/Sol médio; usuário pediu melhorar formulário Criar treino (captura 23.28.14). Reformulação local de CreateWorkoutDialog.tsx e create-workout.css concluída, mantendo store e contratos. Campos consistentes, seleção/configuração clara, catálogo e ação final visível. Corrigida substituição de valores numéricos; calendário localizado e foco de fechamento restaurado.

Evidências em conselheiro-backups/fitness-create-20261009 e STATUS-FRONTEND-FITNESS: mobile 360/390, tablet 768; busca/filtros/remoção, salvar data/duas séries, foco e fluxo de treino temporário até histórico. Sem commit/push/deploy. Servidor 5174 mantido; próximo: revisão deste formulário e depois preview/edição. Nenhuma troca de modelo ou instalação necessária.

---

# Ponto de retomada vigente — UI02-B, 09/10/2026

Checkout efetivo: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; versão 0.1.18, alterações locais preservadas. Modelo Sol 6.1 médio confirmado; nenhuma troca. Seis ícones da captura original e modalidades portuguesas entregues em Escolher treino; Calistenia usa Core Training. Novas categorias conectadas ao planejamento existente, sem sensores/exercícios inventados.

Build/lint, seleção em 360/390/768, categorias no formulário e fluxo Yoga de um exercício/série em 390 passaram; evidência externa fitness-icons-20261009 e STATUS-FRONTEND-FITNESS. Sem commit/push/deploy. Servidor 5174 mantido. Próximo: usuário revisar seleção; depois preview/criação/edição, preservando IDs/configurações e dados. Seis modalidades agora autorizadas explicitamente; notas anteriores limitando duas são históricas.

---

# Continuidade — leia ao retomar

Atualização: 09/10/2026, America/Recife. Coordenação: Astro Boy; custódia: Versionamento e documentação.

## Estado operacional

Checkout principal: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Fila única: [FILA-ENTREGAS.md](FILA-ENTREGAS.md). HEAD observado: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`; alterações locais presentes. Versão 0.1.15 após I03, aceito como protótipo local com mocks. O worktree e2b6 está em 0.1.12 e não deve sobrescrever produto ou fila desta pasta.

C00 já aceita; C01 (manual/dossiê/custódia) agora integrado com preservação das instruções existentes. C02 acrescenta [política de modelos](POLITICA-MODELOS.md). Cinco skills locais conferidas: frontend-design, web-design-guidelines, composition-patterns, webapp-testing, improve-animations. Nenhuma instalação necessária nesta etapa.

I01: executor anterior ocioso, último turno falhou por limite de uso, conforme consulta atual de status Codex. A correção CSS e versão 0.1.13 estavam presentes antes desta continuação. Reteste atribuído a `/root/validacao_i01`, Sol/médio; apenas STATUS-SANTUARIO e artefatos externos reservados. Não editar produto em paralelo. Evidências em `/tmp/conselho-i01-20261009/`; resultado disponível no encerramento abaixo.

## Próximo passo

I04: preparar ativação com conta Cloudflare/Supabase, token restrito no servidor, quota e escopo de deployment; não pedir segredo na conversa nem presumir autorização remota. Configuração documentada em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). I03 não prova chamada real. I02 e D01/D02/D03 já aceitos nos escopos registrados; V02 segue parcial. Chat principal: Sol médio, troca confirmada pelo usuário. Planejamento curto pode usar Luna baixo; ativação/Auth e teste real recomendam Sol médio. As seções abaixo preservam a história; o encerramento mais recente prevalece.

## Rotina obrigatória

Ler AGENTS.md, índice canônico, este arquivo e item vigente da fila. Conferir checkout, versão, diff, dono e evidências antes de agir. Atualizar este ponto ao iniciar/interromper/transferir/concluir lote; registrar próximo passo, bloqueios e testes não executados. Se documento necessário faltar, criá-lo com fontes e lacunas explícitas. Não criar filas concorrentes.

O [manual](MANUAL-ENGENHARIA.md) orienta execução; o [dossiê](DOSSIE-TECNICO.md) registra origem e escopo; o [responsável documental](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md) mantém versões e continuidade. Relatos históricos desses arquivos distinguem o worktree onde foram produzidos da integração atual. Arquivos não garantem execução contínua ou memória infalível.

## Último resultado e retomada

C01/C02 consolidados. I01 retestado e critérios delimitados aprovados em 360/390/768/1440px, 6/6 controles; build passou e lint 0 erros/4 avisos. Ver encerramento da fila e STATUS-SANTUARIO. Reservas liberadas; servidor encerrado. Próximo trabalho: despachar V02 (Fitness) com escopo e perfil temporário, preferencialmente Sol/médio. D01/D02 e fidelidade visual integral continuam pendentes.

## Preferência e V02 em andamento

Usuário selecionou chat principal em Luna leve. O coordenador avisou antes e delegou V02 ao subagente `/root/validacao_fitness` com Sol médio, adequado ao fluxo longo de navegador/estado; não houve alteração do modelo principal. Reservas: somente STATUS-FRONTEND-FITNESS.md e `/tmp/conselho-v02-20261009/`. Não iniciar trabalho concorrente nessas evidências. Próximo: aguardar relatório, revisar, liberar reserva e atualizar fila. Para novas etapas complexas, informar modelo/esforço ao usuário antes da delegação quando a ferramenta não puder alterar o chat atual.

## Atualização V02/I02 — 09/10/2026

V02 parcialmente aprovada. Fluxo criação → preview → sessão → série → reload → finalização → resumo/histórico passou no perfil temporário; 16 capturas em 4 larguras sem overflow/pageerror. Duas notas independentes preservadas (5 e 2 estrelas); diálogos testados sem salvar medidas. Achado reproduzido: em 360px, área do botão Concluir série interceptada pela barra fixa Congelar/Finalizar. I02 em execução por `/root/fix_v02`, Sol/médio; reserva apenas `src/pages/fitness/ActiveWorkout.tsx`; evidências `/tmp/conselho-i02-20261009/`. Após correção, retestar; depois avaliar próximo lote. Não salvar dados corporais fictícios.

## I02 — encerramento técnico em revisão, 09/10/2026

Executor `/root/fix_v02`, Sol/médio, corrigiu `src/pages/fitness/ActiveWorkout.tsx`: `mt-10` tornou-se `mt-4 min-[375px]:mt-10`. A redução de margem limita-se a larguras abaixo de 375px. Encobrimento de Concluir série pela barra fixa reproduzido antes em 360px; responsável documental não alterou produto.

Reteste informado pelo executor/coordenador: clique real, continuar sessão, reload, finalizar e histórico passaram em 360/390/768/1440px, sem overflow horizontal ou pageerrors. Artefatos em `/tmp/conselho-i02-20261009/` (verify.json, verify-390.json, scripts e capturas). Cobertura: um exercício/uma série; títulos arbitrários, múltiplas séries, todos os exercícios e fidelidade integral não certificados. V02 permanece parcial: avaliações corporais com medidas reais e histórico entre meses pendentes; notas de sessão não substituem avaliações corporais.

Custódia `/root/versionamento_documentacao`: versão 0.1.13 → 0.1.14 sincronizada em package.json, nas duas posições raiz do package-lock.json e CHANGELOG. Dependências preservadas. Lint global/build em andamento pelo coordenador no momento deste registro, sem resultado incorporado. I02 em revisão, aguardando consolidação e aceite de Astro Boy. Chat principal permanece Luna leve; I02 delegado a Sol médio.

Próxima ação: coordenador incorporar lint/build, revisar diff e decidir aceite antes de escolher próximo lote. Não ampliar correção para cenários não testados. Reservas documentais/manifests devolvidas ao coordenador após esta custódia. Sem commit/push/merge/publicação. Evidências em /tmp são temporárias.

## Encerramento I02 e próximo lote

I02 aceito após revisão do coordenador: botão Série acessível a 360px; quatro larguras verificadas no cenário delimitado. Build passou; lint 0 erros/4 avisos preexistentes; versão 0.1.14 sincronizada. Servidor de teste encerrado pelo executor. V02 continua parcial nos itens que exigem outras condições de data ou medidas corporais reais. Próximo: D01, auditoria somente leitura dos contratos core/hábitos/projetos; não há alteração de domínio autorizada. Recomendação de modelo: Sol médio por cruzar várias regras canônicas com implementação; avisar usuário antes do despacho.

## D01 em andamento

Auditoria estática dos contratos Core delegada a `/root/auditoria_core_d01` com Sol/médio. Reserva: novo `docs/AUDITORIA-CONTRATOS-CORE.md` e `/tmp/conselho-d01-20261009/`; código e outros documentos somente leitura. Objetivo é reconciliar documentação/implementação com caminhos e símbolos e propor validações, sem mudar regras. Próximo passo: revisar relatório e aceitar ou devolver lacunas; depois escolher lote funcional a partir de evidência. Chat principal segue Luna leve.

## D01 aceito; D02 em andamento

D01 aceito apenas como auditoria estática em `docs/AUDITORIA-CONTRATOS-CORE.md`. Quatro conflitos documentais continuam pendentes de decisão explícita; nenhum fluxo foi testado e nenhuma regra alterada. D02 está com `/root/auditoria_astrolabio`, Luna/baixo, para rastrear somente histórico Math.random e dados do Astrolábio. Reserva: relatório novo `docs/AUDITORIA-ASTROLABIO.md` e `/tmp/conselho-d02-20261009/`. Depois revisar. Próxima decisão de domínio requer reconciliação; não inferir regra canônica.

## D02 aceito; D03 em andamento

D02 aceito como auditoria estática; relatório `docs/AUDITORIA-ASTROLABIO.md`, script isolado não é teste de browser. D03 delegada a `/root/auditoria_assistente_d03`, Luna/baixo, para inventário do assistente no app. Somente novo `docs/AUDITORIA-ASSISTENTE.md` e `/tmp/conselho-d03-20261009/`; sem secrets. Depois revisar; escolher provider/free tier e implementar exige olhar disponibilidade, custos atuais e credenciais antes de coding. Chat principal permanece Luna leve.

## D03 aceito; D04 pesquisado

D03 relatório aceito em `docs/AUDITORIA-ASSISTENTE.md`. D04 compara provedores oficiais em `docs/DECISAO-PROVEDOR-IA.md`; Cloudflare Workers AI é candidato provisório com cota free limitada e chamadas de ferramentas, Gemini não pago não recomendado para dados pessoais, Azure é alternativa cobrada. Nenhum provedor/credencial foi habilitado. Próxima etapa proposta I03: protótipo textual mínimo em Supabase Edge Function, começando por consulta ou rascunho com confirmação e consentimento. Modelo recomendado para implementação: Sol médio; avisado antes do despacho. Skill Supabase existe em `/Users/fabioandre/.codex/plugins/cache/openai-curated-remote/supabase/1.0.0/skills/supabase/SKILL.md` e deve ser lida ao iniciar I03. Acesso a conta/secret e deploy não presumidos.

## I03 em andamento — protótipo IA no app

Implementação delimitada foi delegada a `/root/implementa_assistente_i03`, Sol/médio. A skill Supabase foi aplicada e docs atuais consultados. O executor encerrou por limite de uso antes de editar. Astro Boy confirmou no checkout principal que `Invocar.tsx` não tem mudanças e que o novo diretório/função `assistant-suggest` não existe. Reservas liberadas; I03 segue incompleta e sem testes ou bump. Retomada requer Luna → Sol/médio nesta conversa ou executor equivalente. Escopo mantido: consentir, enviar texto mínimo a Edge Function autenticada, receber sugestão e confirmar via `addDraft`; nenhuma leitura de outros dados. Sem credencial Cloudflare, chamada real não está disponível. Nenhum secret/deploy.

## I03 encerrado — protótipo local aceito, 09/10/2026

Após usuário confirmar Sol/médio, Astro Boy implementou `src/pages/Invocar.tsx`, `supabase/functions/assistant-suggest/index.ts` e `index_test.ts`. Consentimento/texto mínimo, autenticação servidor, proposta de título/descrição com schema fechado, edição e confirmação no `addDraft` existente. Sem leitura de perfil, operações remotas de domínio ou alterações em stores. Sete testes Deno passaram; build passou; lint 0 erros/4 avisos preexistentes; diff-check passou. Browser com Auth/provedor simulados, app/store reais e dados temporários criados pela UI: fluxo manual, consentimento, falhas, revisão, confirmação e reload passaram; 360/390/768/1440 sem overflow/pageerrors. Automação rola controles ao centro para evitar navegação fixa. Não certifica chamada real, acesso do provedor, hit targets em qualquer posição ou acessibilidade integral.

Custodiante `/root/versionamento_i03`, Luna/baixo, sincronizou 0.1.15 nos manifests/changelog e atualizou índice/manual/dossiê. Astro Boy revisou e aceitou somente o protótipo local; reservas liberadas. Guia [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Evidências temporárias: `/tmp/conselho-i03-20261009/` (browser.json/script/capturas, deno-test.log, build.log, lint.log). Nenhum secret foi lido/configurado, chamada live, commit/push/deploy executado. Próximo: I04 conforme seção Próximo passo.


## Retomada UI01 — 09/10/2026

Prioridade atual: concluir Treino/Saúde com o kit de Pictures/PRINT/Fitness-app. UI01 em execução sequencial por Astro Boy, começando por Corpo e silhueta. Backup e reservas na fila. Baseline atual capturado em perfil Chrome temporário (sem dados reais) em fitness-kit-20261009/before-*.png. Não confundir o worktree e2b6 antigo com produto principal 0.1.15. Próximo: editar componentes de apresentação e validar ações/responsividade; depois continuar refinamento de treinos.


## UI01 concluída — 0.1.16

Primeiro lote de Saúde entregue e validado conforme STATUS-FRONTEND-FITNESS; reservas liberadas. Versão 0.1.16 sincronizada; alterações preexistentes preservadas. Evidências e backup em /Users/fabioandre/Developer/conselheiro-backups/fitness-kit-20261009. Próxima ação exata: UI02, comparar seleção/prévia preenchidas e tratar criação/edição com contratos existentes, preservando séries individuais. Não retomar Cloudflare antes deste foco nem confundir o e2b6 antigo com checkout principal. Kit integral continua em andamento; testes de saúde preenchida/exclusão pendentes de dados reais autorizados. Servidor 5174 mantido para revisão.


## Prioridade atual: UI02-A / escolher treino

Usuário confirmou Sol 6.1 médio; foco exclusivo agora /treinos e referência 21.26.22 antes de preview/edição. Mobile/tablet; PC usa largura de tablet. UI02-A em execução, reservas na fila. Preservar duas categorias reais e todas as ações; documentar adaptações da imagem.


## UI02-A entregue — 0.1.17

Escolher treino agora segue composição da referência adaptada às duas categorias existentes. Evidências em conselheiro-backups/fitness-select-20261009 e topo de STATUS-FRONTEND-FITNESS. Modelo Sol 6.1 médio confirmado; não houve troca. Reservas liberadas. Prioridade permanece revisão/finalização desta tela antes de preview/edição. Diretriz mobile/tablet registrada no manual e roteiro; o layout tablet no PC foi aplicado à seleção, demais páginas aguardam seus lotes. Versão sincronizada, sem commit/push/deploy.

## F02 — Fitness paralelo: biblioteca e navegação (10/10/2026)

Nova raiz `/fitness`, acessada por Pilares → Terra → Exercício Físico. Fluxo original preservado nas URLs `/treinos/*`, com entrada Mais → Treino — Legado (`/treinos/legado`); removida entrada da sidebar e atalhos secundários do mapa/menu. Redirecionamentos de modalidade Yoga/Calistenia agora abrem a biblioteca. Nenhuma página original apagada.

FitnessRoot usa kit visual existente (cards, botões, catálogo, ficha de exercício), navegação global fixa e abas Treinos / Histórico / O Corpo. Histórico/Corpo reutilizam as páginas atuais em contexto embutido; o contexto suprime somente casca/abas duplicadas. A ação vazia do histórico embutido retorna à biblioteca; modo legado mantém destino original.

Aba Treinos: modalidades → Meus Treinos filtrados, Sequências que referenciam treinos da modalidade (ordem integral preservada), Catálogo real. NativeTemplateDialog configura exercícios ordenados, séries, repetições/duração, carga e fator; saveTemplate salva somente na biblioteca. Executar Agora chama startSession, com banner de sessão ativa. Registro completo da execução permanece etapa futura. Agendar/Tornar Ciclo contêm TODO Core e aviso de indisponibilidade.

Store ganhou nativeCatalog/ensureNativeCatalog: reaproveita catálogo original em cópias com UUIDv4 e legacyId, dentro da persistência nativa existente por conta; registros anteriores recebem lista vazia por fallback. Não altera histórico legado nem envia planejamento ao Core. Modalidades sem catálogo mostram estado vazio.

Verificação: TypeScript identificou erros preexistentes de contratos do Core (Habit/User/TaskItem etc.) e helper legado workout-ids; import não usado na nova raiz corrigido. Compilação global continua bloqueada. Sem testes de navegador ou aprovação visual neste lote. Não publicado.
F02: ESLint dos 14 arquivos do lote passou sem erros/avisos; diff-check passou antes do fechamento documental. Sem testes funcionais ou inspeção de navegador; confirmação de comportamento em execução ainda pendente.

## F03 — execução nativa e conclusão Core (10/10/2026)

Implementação: `/fitness/ativo/:sessionId` usa ActiveFitnessSession e o kit legado ExerciseCard/Header/StickyAction. Casca fullscreen remove Sidebar/BottomNav somente nesta rota. Séries editáveis reps ou segundos e kg; check reversível, pular/retomar, confirmação de séries pendentes, cronômetro por startedAt, retorno sem apagar sessão e botão Retomar na biblioteca. Executar Agora inicia sessão e navega. Conclusão retorna `/fitness?tab=history`, agora com nativeHistory (nome/data/duração/ER) acima do histórico legado preservado.

finishSession consolida séries concluídas e chama fitness-core-adapter antes de remover a sessão ativa. Adapter traduz sessão para completeNativeAction na appStore. Despacho Core grava Action concluída (`sourceModule=modulo_treino`, `sourceRefId=session.id`), projeção Task e um ExecutionLog com timestamp, baseValue/rawValue/teto/valor aplicado/Prana/regra. Atualiza totalScore e xp_earth em uma única mudança de estado; Action e log IDs voltam à sessão. Idempotência por referência de sessão, logs persistidos e isolados por conta; guarda de conta na conclusão. Falha mantém sessão ativa para tentativa posterior. Recompute/projeções de áreas/elementos preservam completedScore nativo; Undo remove log e reverte valores efetivamente aplicados; recompilação da mesma Action usa despacho Core.

Escopo energético explícito desta fase: folha neutra em Terra, esforço padrão 1 (sem inferência por modalidade). Core usa presença/tempo/teto canônicos, conserva valor fracionário e debita até 5 Prana, com clamp 0–100 e delta efetivo no log. Perfis anteriores sem pranaLevel recebem 100 como ponto inicial do campo novo. Fórmulas e históricos legados preservados. Não implementa ativação de Habit/Rotation, naturezas energéticas configuráveis, bônus de ressonância/fechamento diário ou sync remoto do novo ledger nesta etapa.

Verificações: ESLint dos arquivos do lote passou. TypeScript continua bloqueado pelas divergências preexistentes User/Habit/TaskItem e helper legado; a saída filtrada não apontou erros nos novos componentes/serviços/workoutStore. Sem testes funcionais ou navegador executados; integração verificada apenas por leitura/tipagem/lint, sem alegar validação ponta a ponta ou publicação. Reservas liberadas; pendente revisão visual e funcional do usuário.

## F04 — XP Terra no planejamento e no extrato (10/10/2026)

Core: projectNativeLeafReward foi extraída da conclusão já existente; preview e buildNativeCompletion usam a mesma função pura (presença, faixas de tempo, esforço padrão 1 e teto 10). Fórmula e efeitos do despacho preservados. native-reward-preview consolida targets de reps ou segundos/2 com fatores 0.8/1/1.5, baseValue ER×0.03 com mesma precisão da conclusão; store expõe previewTemplateReward. Duração estimada opcional no NativeTemplateDialog; sem estimativa, preview usa tempo zero e declara essa ausência, sem duração inventada.

FitnessRoot: badge 🌿 ~XP (Terra), emerald-100/800, rótulo de estimativa e tempo/esforço usados. Histórico destaca Ganho +XP verde e ER secundário cinza; ganho vem do ExecutionLog canônico, sem recalcular história. Log ausente (por exemplo Undo) não é apresentado como recompensa recebida.

ActiveFitnessSession: conclusão abre modal de sucesso com XP grande, ícone Terra e animação respeitando reduced-motion. Resultado concluído fica na página pai, evitando que remoção da sessão ativa cause redirect antes do feedback. Ver Histórico conclui a transição explicitamente; troca de conta não conserva extrato de outra conta. Nenhum novo despacho de recompensa no modal.

Verificações: ESLint dos seis arquivos alterados passou; sem testes funcionais/navegador executados. Compilação global permanece limitada pelas divergências anteriormente documentadas. Sem publicação, commit ou migração de histórico. Reservas liberadas. Próximo passo: revisão visual/funcional pelo usuário.

F04 ajuste visual solicitado: badge do template simplificado para pontuação + XP + 🌿 (ex.: 2,46 XP 🌿), removendo til e (Terra). Indicação de estimativa permanece no texto de apoio. Cálculo preservado.

## F05 — esforço global e autoestimador entregues (10/10/2026)

Auditoria: Motor já documentava ER, esforço 1–5, presença por faixa, tempo e tetos. Não havia a heurística solicitada nem default3 no formulário. Preview anterior aplicava presença/tempo quando recebia duração, mas só esforço1; diagnóstico de ignorar todos os multiplicadores não corresponde integralmente ao código. Adicionadas seções 5.4/5.5 ao Motor e seção de planejamento/feedback ao contrato de Módulos Nativos.

calculateEstimatedDuration aceita planos nativos e legados por estrutura: reps×4s ou duração exata + cada descanso + 60s após primeiro exercício; retorna CEIL(minutos), zero para lista vazia. Legacy estimateWorkoutDurationMinutes continua preservado. Formulário nativo usa cálculo derivado reativo, modo auto/manual explícito, botão de restauração automática e descanso editável. Override não muda com séries até ser removido. Novos formulários sugerem esforço3, com escolha 1–5 e preview verde ao vivo.

Tipos adicionaram esforço opcional em WorkoutTemplate/NativeWorkoutSession/WorkoutCreateInput/WorkoutUpdateInput/Workout e modo de duração no template. Store valida inteiro1–5, computa estimativa auto ao salvar e copia esforço para sessão. Entrada legada guarda o campo opcional sem trocar cálculo legado. Dados anteriores sem esforço mantêm fallback1; template antigo sem tempo passa a obter preview automático, sem reescrever registros concluídos. Duração positiva antiga é respeitada como manual.

Core: multiplicadores/caps/prana por esforço da tabela canônica, effortLevel no Adapter e no despacho/Undo-reconclusão, ruleVersion core-native-leaf-v2 somente em novos logs. Preview usa ER×0.03×presença1.5×esforço×tempo, limitado pelo cap. Mesma função Core concentra esforço/tempo/teto; flag de preview explicita presença presumida1.5. Conclusão usa presença por duração REAL, nunca estimativa. Histórico/modal continuam lendo XP do ExecutionLog; header ativo mostra esforço snapshot. Nenhum histórico recalculado.

Verificações: ESLint onze arquivos passou; diff-check passou; TypeScript global segue bloqueado pelas divergências anteriores, saída filtrada sem erros nos novos/alterados arquivos nativos. Sem testes funcionais ou navegador; não afirmar validação ponta a ponta. Reservas liberadas, sem publicação/commit. Impacto para frontend/backend: campos opcionais de esforço/modo, despacho e custo energético por esforço, detalhes canônicos atualizados.

F05 ajuste de apresentação: XP Terra exibido com uma casa decimal em cards, formulário e modal pelo formatEarthXp compartilhado. Precisão de cálculo e logs preservada.

F05 ajuste de campos: FitnessIntegerField compartilhado no planejamento e execução nativos, botões subir/descer e teclas ArrowUp/ArrowDown. Valor vazio preservado durante edição; conversão de string vazia em zero removida, zeros à esquerda normalizados. Duração inteira usa o mesmo controle. Campos obrigatórios de planejamento impedem salvar séries vazias.

## F06 — balance patch ER 0.10 (10/10/2026)

Conversão oficial centralizada em WORKOUT_ER_BASE_VALUE=0.10 (workout-balance.ts), consumida por finishSession, projectTemplateReward e helper de equivalentes de planejamento. Core continua aplicando esforço/presença/tempo/caps sobre o novo baseValue; histórico/logs concluídos preservados, sem recomputação retroativa. Cálculo legado computeSessionImpactMetrics permanece isolado conforme parallel run, não é o caminho de recompensa da sessão nativa.

Planejamento e treino ativo expõem seletor por série Leve×0.8 / Manutenção×1.0 padrão / Progressão-PR×1.5. Na execução a alteração usa logSet e entra na consolidação das séries concluídas. Carga absoluta em kg não infere intensidade. XP verde e apresentação com uma casa decimal mantidos.

Motor atualizado em 5.1/5.3/5.5 com nova constante e exemplos (prancha60s→30ER→3 baseValue; 72ER/esforço3/12min→19.44XP; força6séries×6reps×1.5→54ER→5.4baseValue→14.58XP com esforço3/10min estimados). Diagrama do contrato Native Modules atualizado. Nota de balanceamento explicita data/aplicação a previews e novas conclusões.

Verificações: ESLint dos sete arquivos de código passou; diff-check passou; buscas conferiram ausência da conversão0.03 no código de cálculo abrangido. Não executados testes funcionais, navegador ou nova compilação global (limitação anterior permanece documentada). Reservas liberadas; sem publicação/commit/migração de dados.

F06 ajuste UX: nome de cada exercício no formulário nativo agora é botão de expandir/recolher séries, com seta, contagem e aria-expanded/controls. Dados permanecem montados; campos inválidos recolhidos são reabertos ao tentar salvar.

F06 polimento: XP inteiro não exibe decimal (10 XP), fracionário mantém até uma casa (14,6 XP). Séries do planejamento agora expandem/recolhem independentemente, com resumo compacto de reps/segundos, kg quando informado, pausa e PR/Leve. Valores preservados; validação reabre campos recolhidos.

F06 ajuste do modal: criação nativa reserva 64px da navegação global mais safe-area inferior. Modal centralizado na área útil, com altura máxima e rolagem interna; overlay termina acima da barra. DialogContent aceita overlayClassName opcional, mantendo os demais modais com comportamento anterior. Sem testes funcionais ou navegador executados.

F06 polimento de séries: resumo de reps/tempo/carga/pausa exibido somente quando a série está recolhida. Aberta mantém título e campos editáveis, sem duplicar os valores no cabeçalho. Sem testes executados.

F06 navegação: selecionar Treinos no segmented control remove modalidade da URL e retorna à grade inicial, inclusive ao clicar na aba já ativa. Troca por teclado usa o mesmo reset. Fecha detalhes/formulário transitórios; biblioteca e sessão ativa preservadas. Sem testes executados.

F07 cancelamento nativo: ação discardNativeSession valida sessão/conta e remove apenas sessão ativa, sem histórico, Adapter ou recompensa. Tela ativa oferece Cancelar treino com confirmação explícita, disponível inclusive nos primeiros segundos, sem limite artificial de duração. Template preservado e retorno à biblioteca. Sem testes executados.

F08 biblioteca editável: TemplateCard mostra composição ordenada e pílulas por série (reps/tempo, kg, descanso, fator). Editar treino reutiliza NativeTemplateDialog com cópia local dos planos, nome, esforço e duração auto/manual. Salvar usa mesmo UUID via saveTemplate, preservando referências das sequências, metadados e snapshots de sessões/histórico; fechar não salva. Permite incluir/remover/reordenar exercícios e incluir/remover/editar séries. Sem testes funcionais ou navegador executados.

F08 cards recolhíveis: treinos em Meus Treinos fechados por padrão. Nome/cabeçalho alterna composição e ações, com chevron e aria-expanded/controls. Nome, contagem e XP permanecem visíveis no resumo. Sem testes executados.

F08 ação primária: Executar Agora movido para fora do conteúdo recolhível, visível com card aberto ou fechado. Guardas de sessão ativa e início nativo mantidas. Sem testes executados.

F09 espaço da execução: FitnessStickyAction informa altura real via ResizeObserver; tela ativa reserva essa altura mais 24px no fim do conteúdo. Medição inclui safe-area, dois botões e responde a mudanças de largura/tamanho. Último card pode rolar acima da barra; outros consumidores mantêm reserva anterior. Sem testes funcionais/navegador executados.

F10 navegação no topo: ScrollToTop global dentro de BrowserRouter reposiciona window antes da pintura a cada entrada de navegação (key/path/search), incluindo modalidades/abas via query e voltar/avançar. Restauração automática do navegador desativada enquanto montado; comportamento instantâneo. Sem testes funcionais/navegador executados. Alteração posterior ao commit 8d39966, ainda sem commit/push.

F11 exclusão na biblioteca: cards expandidos de Meus Treinos oferecem Excluir treino com confirmação. Usa deleteTemplate existente; remove blueprint e referências nas sequências, preservando sessão ativa, histórico e recompensas. Confirmação informa alcance antes de excluir. Sem testes executados; alteração sem commit/push.

F11 organização visual: Editar e Excluir no card expandido compartilham linha em duas colunas iguais, com ícones, labels curtas e exclusão em vermelho. Confirmação mantida. Sem testes executados.

F11 composição compacta: card aberto mostra nome e resumo por exercício (3×10 reps · minutos totais estimados incluindo pausas). Séries com valores distintos mostram média com til e até uma casa decimal. Isometria usa segundos, grupos mistos separam reps/duração. Reutiliza autoestimador por exercício sem transição; formulário de edição mantém detalhes completos. Sem testes executados.

F11 alinhamento: resumo de séries/reps/tempo sempre em linha abaixo do nome do exercício, inclusive nomes curtos. Sem testes executados.

F12 ponte planejamento→Ciclos: MakeCycleModal seleciona dias 0–6, valida seleção não vazia; WorkoutStore valida conta e delega ao Adapter. Cria Habit/Action raiz com fonte/template, ER×0.10, esforço, tempo e área Terra real do catálogo. addHabit preserva campos canônicos/fonte e neutralidade nativa. Indicador Ciclo ativo por habits e deduplicação no Adapter. Não emite recompensas, não sincroniza futuras edições, sem migração de IDs de área. Sem testes funcionais/navegador executados; sem commit/push.

F13 rich widget Fitness em Ciclos: séries inline mantidas apenas em WorkoutStore, início silencioso, edição reps/segundos/kg/fator e conclusão explícita. Restringe a hoje e sessão mesmo template/dia; outra sessão bloqueia início. Widget usa Core preview com esforço/tempo/presença/cap e XP real de ledger após concluir. finishSession(habitId)→Adapter→completeNativeAction ramo HABIT grava um único ExecutionLog, HabitCompletion e recompensa atomicamente no Core, sem Action avulsa/subtarefas nem chamada adicional de pontuação. Mantém rotação por data e snapshots nativos. Editar/Excluir navegam à confirmação/formulário do módulo via query; excluir blueprint continua preservando ciclo. Sem testes funcionais/navegador executados.

F13 verificação: ESLint dos sete arquivos executado sem erros, dois avisos preexistentes de dependências hooks em Ciclos (558/645). Diff-check passou. startSession aceita override opcional validado de esforço para snapshot do ciclo; chamadas anteriores preservam padrão. Sem testes funcionais/navegador, sem publicação.

F13 tipagem: tsc --noEmit executado; compilação global falhou nos contratos preexistentes de appStore (Habit semantic backups/startDate/sortOrder, TaskItem, User). Saída filtrada não apontou erros em FitnessHabitWidget, FitnessRoot, Adapter, native-action-completion ou workoutStore, nem no novo ramo HABIT. Não afirmar build global aprovado.

F14 sequências: WorkoutSequenceLibrary disponível na grade inicial e modalidades, criação nome/descrição/seleção e ordenação com mínimo2 templates distintos (também validado por saveSequence). Modal de dias compartilhado para template/sequence. Adapter scheduleSequenceAsRotation resolve biblioteca/conta/templates/área; helper comum projeta baseValue e duração. Core createRotationWithMembers faz gravação atômica em cycleSequences/actions/habits/sequenceMemberships com UUIDs, sourceRef e posse por rotação. Novos membros independentes de hábitos avulsos; deduplicação pela sequência. Widget já faz dispatcher de membro corrente em Ciclos. Rotação usa máquina temporal existente; divergência histórica com seção3 não reescrita. Dados anteriores preservados, sem recompensas na ativação, sem commit/push.

F14 verificações: ESLint sete arquivos passou; diff-check passou. Tsc global segue limitado pelos contratos preexistentes. Após retorno CycleSequence explícito no Adapter, saída filtrada sem erros nos novos componentes, Adapter, WorkoutStore ou operação atômica Core. Sem testes funcionais/navegador executados.

F15 histórico XP: componente NativeSessionHistory compartilhado nas rotas de histórico, consulta log por UUID/ref da sessão, snapshot earnedXp real retornado pelo Adapter e registros concluídos correlacionados (sem recalcular). Sessões futuras guardam earnedXp; antigas usam evidências Core existentes. Histórico legado mostra xpAwarded real do ledger em vez de volume quando disponível. Ausência de evidência não fabrica recompensa. Sem testes funcionais/navegador executados.

F15 diagnóstico adicional: applyDomainSnapshotToStore em supabaseCloudSync hidrata tasks/habits, sem actions ou executionLogs remotos. Resolver de histórico agora lê tasks além de actions por coreEntityId ou sourceRef sessão; hábito usa completion vinculada por logId ou timestamp exato da sessão. Valores reais finitos, inclusive zero; não recalcula XP. Esta divergência concreta explica falha possível após hidratação cloud; dados específicos do usuário não inspecionados (nenhuma aba disponível no browser conectado).

F16 histórico sem ER e sync de sequências: removido volume ER do card executado. Supabase insert de cycle_sequences admite fallback exclusivo PGRST204 da coluna is_active ausente, mantendo isActive no payload e repetindo insert sem coluna; próximos batches usam compatibilidade. Outros erros propagam. Migração aditiva20261011 adiciona coluna, restaura pausas pelo payload e solicita reloadschema. Não aplicada no banco remoto; sync não validado contra Supabase. Nenhuma exclusão de dados ou alteração de RLS nesta migração.

F17 card Core preservado: removido retorno antecipado que substituía rotação Fitness por card próprio. Motion card original mantém shell, título e passo; membro atual Fitness injeta widget embedded sem borda/card adicionais e sem ações genéricas/subtarefas. Fila usa memberships ordenados e títulos Habit; identificação apenas sourceModule do membro. Editar/Excluir e detalhes de rotações Fitness direcionam /fitness; genéricas preservadas. Widget Abrir Treino inicia/retoma sessão vinculada via coreHabitId e attachSessionToHabit validando conta/template/posse. finishSession sem argumento usa vínculo persistido, fechando hábito/rotação também pela execução fullscreen com único log/recompensa. Nenhuma migração remota, teste funcional/navegador ou publicação.

F18 — perda de membros: diagnóstico estático confirmou sanitizer cloud que validava apenas hábitos raiz (descartava childHabits), nomes sequence_id/habit_id divergentes da migração sequence_local_id/habit_local_id, e janela delete-all/insert com atualização cloud concorrente. Corrigido percurso recursivo, leitura compatível com ambos schemas e fallback restrito de escrita; sync agora reutiliza IDs DB via upsert, só remove obsoletos depois de todas as gravações. Auth serializa escrita, só confirma fingerprint após sucesso, bloqueia refresh com alterações pendentes e rejeita hidratação se houve edição durante fetch. Impacto compartilhado Core/Fitness: mantém memberships e ordem existentes; nenhuma mudança de pontos. Não recupera vínculos já perdidos automaticamente, não garante transação remota entre tabelas/dispositivos. ESLint dos dois arquivos passou; sem testes funcionais/cloud, migração remota ou publicação.

F19 — banco sem sequence_memberships.position: fallback limitado PGRST204 mantém ordem no payload; retries cobrem posição e nomes de referências em qualquer ordem. Migração aditiva20261011_align_sequence_membership_position criada, não aplicada remotamente. deleteCycleSequence desvincula hábitos por memberships OU controlledBySequenceId, preserva recurrenceType/config individuais e libera também actions. addHabitToSequence já não sobrescreve agenda individual; não fabrica configuração anterior. ESLint service/store passou; sem testes funcionais/Supabase/publicação.

F20 — sequência única: CycleSequence compartilhada com status/restrição/templateIds, persistência existente em payload cloud. WorkoutSequence virou DTO. Biblioteca lê Core; saveSequence grava Core sem hábitos; importação aditiva das sequências locais no primeiro acesso Fitness mantém IDs de rotações antigas e limpa coleção duplicada por conta. Ativação usa mesmo ID, reativa membros existentes sem duplicar, bloqueia substituição silenciosa de composição vinculada. Desativação UI retorna PLANNING, mantendo posse para não gerar ciclos avulsos. Ciclos oculta planejamento e oferece restrição Geral/Treinos na criação; store valida adição e ordem refs acompanha reorder/remove. Template/history locais permanecem. ESLint sem erros (2avisos preexistentes Ciclos); TypeScript filtrado sem diagnósticos dos arquivos alterados. Sem testes funcionais/cloud ou publicação. Revisão visual e migrações schema F16/F19 ainda pendentes.

F21 — widget Fitness em Ciclos: cabeçalho de hábito com checkbox (conclusão pelo fluxo nativo, exige séries realizadas), título recolhível, badge XP sem Estimativa e Executar compacto. Cada exercício tem toggle/aria e contagem; série concluída compacta checkbox/Série/reps ou segundos/kg, lápis reabre edição reps/carga/fator, sem alterar logSet/Adapter/pontos. Funciona embedded em rotações e avulso. ESLint passou; sem verificação visual/browser.

F22 — execução Fitness separada: executedClone deixava reps/segundos=0 em todas séries, e checkbox chamava início silencioso. Agora valores previstos são preservados; nativeCheckins separado/persistido por conta/hábito/dia, updateHabitCheckin/finishHabitCheckin/beginHabitWorkout. Pai sem marcações=plano integral; parcial=apenas marcadas; todas=autoconclusão, valores editados consolidam ER. Tempo CHECKIN declarado proporcional à heurística, presença máxima com tempo autorizado pelo usuário; LIVE mede desde início explícito. Logs/sessões identificam durationSource/fullCompletion; histórico mostra tempo informado. Docs distinguidas. tsc completo passou antes dos últimos campos log; ESLint passou antes deles; rerun final em andamento. Sem testes funcionais/Supabase/publicação.

F22 verificação final: tsc --noEmit completo e ESLint dos sete arquivos passaram sem saída de erros. Sem testes funcionais/browser. Reservas liberadas.

F23 — XP acumulado no widget: badge junto ao nome do treino e de cada exercício, derivado apenas de séries completed&&!skipped. projectWorkoutProgress compartilha ER/tempo declarado/Core/cap entre UI e finishHabitCheckin; LIVE usa tempo medido disponível no render. Exercícios recebem parcelas proporcionais de ER do único total limitado, sem caps individuais duplicados. Editar reps/segundos/fator recalcula badges via Zustand; nada concede XP antes da conclusão. Registro concluído usa XP real do log/snapshot, sem recreditar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F24 — badge único do treino pai: início=XP planejado, séries marcadas=acumulado/planejado, conclusão=XP real sem fração. Meta superada usa gradiente verde/dourado e Sparkles; parcial/abaixo usa âmbar, preservando valor real e tooltip/aria explicativo. Comparação na precisão exibida (1decimal) evita destaque por ruído float. XP concluído recupera também HabitCompletion real. Removido segundo badge; nenhuma mudança na pontuação ou persistência. TypeScript completo e ESLint passaram; sem validação visual/browser.

F25 — checkbox pai permite desfazer hoje: undoHabitWorkout preserva árvore/séries/valores como CHECKIN e remove histórico somente após Core aceitar undoNativeHabitCompletion. Core remove completion/log, reverte XP/Terra/Prana pelo extrato, recalcula streaks e restaura snapshot de rotação. Conclusões novas guardam coreReceipt persistido nativo; fallback após cloud valida id/fonte/hábito e completion existente, evitando reversão dupla. Antigos sem extrato têm erro explícito sem alteração. TypeScript/ESLint primeira rodada passaram; rodada final pós receipt em andamento. Sem teste funcional/cloud/publicação.

F25 final: TypeScript completo e ESLint dos seis arquivos passaram. Reservas encerradas; validação funcional/browser pendente.

F26 — widget recolhe card após autoconclusão bem-sucedida de todas as séries. Mantém badge final e checkbox; não recolhe se conclusão falhar. Sem testes executados.

F27 — conclusão widget centraliza card via scrollIntoView e exibe balão +XP real 🌿 Terra que sobe/desaparece em2s; usa resultado earnedXp, não concede pontos adicionais. Aplica conclusão pai/manual e última série, recolhe card. Respeita movimento reduzido, cancela RAF/timer no cleanup. TypeScript completo e ESLint passaram; visual/browser pendente.

F28 — balão XP via portal document.body, fixed z9999 acima dos stacking contexts dos cards; tamanho reduzido para texto14px/label10px, padding menor. Mantém animação/cleanup/movimento reduzido. Sem testes executados.

F29 — exercício recolhe automaticamente após marcar sua última série; usa resultado atualizado da store, ignora skipped e falhas. Demais exercícios mantêm estado e header permite reabrir. Sem testes executados.

F30 — checkbox por exercício marca/desmarca todas suas séries mantendo valores; reflete automaticamente todas concluídas e estado indeterminate se parcial. Mantém CHECKIN sem cronômetro ou LIVE existente, fecha exercício ao marcar tudo e conclui pai quando todos completos. Treino já registrado exige desfazer pai antes de editar. TypeScript completo e ESLint passaram; sem testes funcionais/browser.

F30 ajuste de verificação: primeira rodada ESLint detectou fechamento JSX faltante; corrigido e segunda rodada aprovada. Comando tsc executado na raiz externa apenas exibiu ajuda, sem verificar projeto; repetido a partir de app.

F31 — checkbox exercício segue parcial: se não há séries marcadas, registra todas; se há algumas, preserva realizadas e marca restantes skipped. Checkbox representa exercício encerrado (séries concluídas ou puladas), indeterminate apenas com realizadas e pendências. Treino autoconclui quando todas séries estão resolvidas; ER e tempo incluem apenas realizadas pela consolidação existente. Desmarcar exercício reabre/limpa marcações, preservando valores. ESLint passou; sem teste funcional/browser.

F32 — treino concluído exibe badge âmbar nos exercícios parciais e contagem realizadas/planejadas (ex3/5 séries). Exercícios integrais mantêm verde e contagem simples. Usa séries concluídas não skipped do snapshot, sem alterar pontuação. ESLint passou; sem teste visual.

F33 — desmarcar checkbox de exercício preserva seu estado de abertura; apenas marcar concluído recolhe automaticamente. Cabeçalho continua controlando expandir/recolher. Sem testes executados.

F34 — badge âmbar/contagem parcial por exercício aparecem também durante o treino quando suas séries estão resolvidas (completed/skipped), sem aguardar conclusão pai. Sem testes executados.

F35 — cabeçalho exercício empilha badge XP sobre contagem de séries à direita, nome ocupa coluna flexível restante; checkbox e chevron preservados. Sem testes executados.

F36 — removido Concluir Treino redundante do widget Ciclos. Checkbox continua CHECKIN sem cronômetro; LIVE matching agora exige executionMode LIVE e coreHabitId exato, impedindo adotar sessão apenas por template igual. beginWorkout é chamado somente pelo botão Executar. Sessões antigas não são descartadas silenciosamente; continuam exigindo resolução explícita se ativas. Sem testes funcionais/browser.

F37 — fila Fitness na rotação Ciclos compacta em linha com setas entre nomes, wrap responsivo, sem números/Hoje redundantes. Membro atual verde e aria-current step; Passo no cabeçalho preservado. Sem testes executados.

Publicação F14–F37 solicitada pelo usuário: lote inclui sequências compartilhadas, proteção sync, histórico XP, CHECKIN/LIVE, reversão e refinamentos widget. Commit/push para origin/main nesta operação. Migrações SQL apenas versionadas, sem aplicação remota; validação visual pendente.

F38 — 9novos exercícios enviados pelo usuário adicionados ao catálogo Calistenia, total21. Pike original preservada. Avançado aceito/mapeado; defaults explícitos opcionais precedem parser, Dragon Flag reps4×5. Catálogos existentes recebem defaults ausentes por ID e nativeCatalog gera UUID apenas para novos itens. Templates/histórico/customizações preservados. Primeira inserção detectou sintaxe inválida na validação, corrigida antes de concluir. ESLint dois arquivos passou; tsc -p tsconfig.app.json global segue com falhas preexistentes, saída filtrada sem erros em calistenia/workoutStore. Sem testes funcionais/browser, commit/push ou sync cloud.

F39 — tags primaryMuscles/secondaryMuscles por ID em21 exercícios Calistenia, preservadas no converter e preenchidas nos catálogos salvos apenas quando ausentes, sem alterar muscleDistribution/pontos/UUIDs/templates/histórico. MuscleExerciseCatalog usa FitnessListRow com leading opcional, pílulas regiões multiseleção OR, opção secundários, count/empty/Todos e nomes/emoji principais. FitnessRoot mantém catálogo integral disponível ao criador de treinos. ESLint primeira rodada passou, final em andamento; tsc app filtrado em andamento. Sem teste funcional/browser/commit/push.

F39 final: ESLint sete arquivos aprovado; tsc -p tsconfig.app.json continua limitado por falhas globais preexistentes, saída filtrada sem diagnósticos nos arquivos desta alteração. Reservas encerradas; validar UI no navegador.

F40 — revisão tags: Burpee controlado principais quadríceps/glúteos, peito secundário; Diamante inclui tríceps/peito como principais. Emoji agora segue primeiro principal, não ordem fixa dos filtros. Correção de perfis salvos somente se arrays coincidem exatamente com defaults antigos, preservando customizações/UUIDs e distribuição/XP. Pike foco Ombros mantido; percentuais Empurrar são fallback genérico, não calculam foco principal. Sem teste visual.

F41 — treino exibe emoji da região predominante no card biblioteca e widget Ciclos. getWorkoutFocus conta um voto por exercício pelo primeiro primaryMuscles do catálogo; agrupa músculos na mesma região, empate segue ordem dos exercícios; sem tags mantém ícone padrão. Sem ponderar séries/carga/percentuais, sem alterar pontos. ESLint passou; sem teste browser.

F42 — exercícios internos mostram emoji do primeiro músculo principal, helper getExerciseFocus compartilhado em composição da biblioteca e widget Ciclos. Sem tags omite emoji; preserva séries/badges. Sem teste visual.

F43 — modal criar/editar treino: Adicionar do catálogo tem botões40px apenas emoji por região, com title/aria-pressed/aria-label, Todos por ícone e toggle para limpar. Filtra músculos principais junto à busca, sem afetar exercícios já no plano; regiões compartilhadas com catálogo via muscle-regions.ts. ESLint três arquivos passou; sem teste visual.

F44 — exercícios listados em Adicionar do catálogo no modal exibem emoji principal junto ao nome, compartilhando getExerciseFocus; sem tags omite. Nome quebra linha, botão adicionar preservado. Sem testes executados.

Publicação F38–F44 solicitada: ampliação Calistenia, tags musculares e filtros/emoji em catálogo, cards e modal. Commit/push origin/main nesta operação; sem migração remota ou mudança de pontuação.

F45 — extraído SequenceLibraryCard compartilhado de WorkoutSequenceLibrary; seção Sequências em Ciclos usa mesma superfície FitnessCard/padding/ícone/typografia/composição. Core preserva passo, membro atual verde e Pausar/Retomar/Reiniciar/Detalhes com mesmos handlers; lista de execução/widget abaixo preservada. Sem mudança de stores/pontuação/persistência. ESLint3arquivos sem erros,2avisos hooks preexistentes Ciclos; sem validação visual/browser/commit/push.

F46 — resumo Sequências em Ciclos compacto com membros em linha/setas sem números, padding/ações menores. Clique no corpo da sequência WORKOUT abre /fitness?sequence=id; biblioteca centraliza/foca/destaca card correspondente após importar legado. Botões administrativos separados do botão corpo, sem navegação acidental. Sequências genéricas abrem detalhes Core. ESLint sem erros,2avisos hooks preexistentes Ciclos; sem teste browser.

F46 verificação: primeiro lint detectou sintaxe no link Detalhes; corrigida, segundo lint passou sem erros (2avisos preexistentes).

F47 — edição sequência: formulário preenche nome/descrição/templates/ordem, permite add/remove/reordenar com mínimo2 e valida disponibilidade; botão Editar sequência no card Treinos. saveSharedWorkoutSequence permite edição ativa e reconcilia via Core replaceMembers; preserva IDs/histórico/membershipIDs dos retidos, cria apenas novos hábitos, libera removidos sem apagar registros/agendas. Agenda/status/ID da sequência preservados; posição acompanha membro anterior quando retido, senão primeiro. Impede remover membro com sessão ativa. Planejamento sem vínculos não cria hábitos. ESLint5arquivos passou; tsc app limitado por contratos preexistentes, corrigido fallback updatedAt no DTO; revisão filtrada final em andamento. Sem teste funcional/browser/Supabase/commit/push.

F48 — botão SkipForward pequeno em resumo e card execução da rotação; skipCycleSequence valida hoje/ativa/membros/não concluída/não em progresso e avança circular ilimitado sem recompensas/histórico. cursorDate evita duplo avanço automático após pulos; cálculo posição extraído e compartilhado Core/Ciclos. UI bloqueia sessão nativa ativa; drafts por hábito preservados. Snapshot de rotação no recibo inclui cursorDate e undo restaura. ESLint sem erros2avisos hooks preexistentes; tsc app filtrado em andamento, sem testes funcionais/browser/Supabase/commit/push.

F48 verificação: tsc app mantém falhas legadas Habit semantic/startDate/sortOrder e TaskItem; nenhum diagnóstico na nova resolução/ação skip. Removida declaração updatedAt duplicada de CycleSequence detectada na checagem. Não declarar compilação global aprovada.

F49 — ordem global solicitada: Santuário/Pilares/Ciclos/Mais (Pilares2º, Ciclos3º). Commit/push F45–F49 solicitado nesta operação; cards compartilhados/edição e pulo circular incluídos, sem migração remota. Validação funcional pendente.

13/10/2026 — Matheus solicitou pull/comparação: checkout limpo em b1575e4, fetch encontrou fe1a8fe (um commit à frente); pull --ff-only aplicado sem conflitos. Diff73arquivos,1515adições/374remoções; package0.1.21→0.1.31. Mudanças relevantes Fitness4abas/rotas unificadas/histórico e resumo compartilhados/mídia-exercícios próprios/pausa persistida/recompensa Native block-v2 por série com RPE/tempo ativo. Arquivos catálogo Calistenia/tags/filtros/widget Ciclos/seq edição-pulo/cloudsync idênticos entre commits. Nenhum teste/build executado nesta comparação; evidências do changelog remoto não foram repetidas. HEAD=origin/main fe1a8fe; apenas este registro de continuidade permanece modificado localmente, sem commit/push.

13/10/2026 — auditoria solicitada pelo proprietário: relatório completo em docs/03-Project-Management/reports/AUDITORIA-PULL-2026-10-13.md e diff integral PULL-b1575e4-fe1a8fe.diff (73arquivos). Mudanças de pontuação importadas identificadas como pendentes de aprovação, ADR-003 status corrigido localmente e AGENTS registra Fábio UX/UI/aprovação explícita de domínio. Fórmula não revertida ou editada. FitnessRoot restaura grade raiz sem Corrida padrão, página interna por modalidade, header/voltar e aba Treinos reseta seleção; demais recursos importados preservados. ESLint FitnessRoot passou; sem teste funcional/browser/build, sem commit/push.

13/10/2026 — decisão explícita Matheus/backend: perfil setup executado e ack local; matemática b1575e4 restaurada em Core completion/Adapter/template preview/progressão/finishSession. ER×0.10 para reps e segundos, esforço global, teto único, Prana global e tempo original LIVE/CHECKIN. RPE/tempo ativo/mídia/pausa UI preservados como métricas informativas, sem alimentar XP; relógio pontuado LIVE volta intervalo startedAt/completedAt, tratamento das pausas fica para debate. Badge planejado Fitness deriva base canônica do template para evitar snapshot importado dobrado, sem modificar dados persistidos. Recibos existentes, inclusive block-v1/v2, intocados. ADR rejeitado para regra vigente; motor por blocos arquivado no código sem chamadas na pontuação. Documento DECISAO-MATHEUS-PONTUACAO-2026-10-13 lista comparação/pendências, handoff F59 resumido com limites. tsc -p tsconfig.app.json completo e ESLint8arquivos passaram; sem testes funcionais/navegador/Supabase ou commit/push.

14/10/2026 — Matheus aprovou descanso como tempo de treino e desconto apenas de pausa explícita. sessionClockSeconds agora alimenta finishSession e preview LIVE do widget. Sessões nativas sem ER realizado são descartadas antes do Adapter; CHECKIN vazio e completion nativa base0 são bloqueados. Histórico oferece limpeza de registros nativos XP0/<60s/sem série realizada, exigindo recibo Core; remove registro/Action ou desfaz hábito com reversão exata de Prana, preservando casos sem prova. Nenhum dado real do navegador/Supabase foi apagado nesta operação. Prana ponderado registrado para debate, sem implementação. TypeScript app e ESLint8arquivos passaram; sem testes funcionais, commit ou push.

31/10/2026 — Matheus pediu preservar o máximo de campos descritivos no catálogo Yoga, aceitando ativação muscular estimada como provisória, e criar posturas adicionais. Catálogo local passou de 12 para 41 itens (29 novos), sem substituir IDs existentes; Pombo completo separado da preparação. YogaExerciseProfile tipado e preservado/clonado pelo workoutStore; ficha de detalhes mostra categoria, focos, regiões/articulações, apoios, estimativas e referências. Estimativas marcadas não validadas/informativas e não afetam matemática, tags musculares, XP, ER, Prana ou persistência Core. Fonte externa consultada para nomes/taxonomia; textos e imagens não copiados. Relatório CATALOGO-YOGA-EXPANSAO.md registra fontes e limites. Typecheck/lint/testes/QA visual não executados nesta etapa; sem commit/push. Mudanças R27/R28 preexistentes permanecem no workspace.

31/10/2026 — Matheus pediu adicionar movimentos abdominais ao catálogo de Calistenia. Quatro novas fichas (crunch curto, toque nos tornozelos, bicicleta e elevação/descida das pernas com pausa) ampliaram 65 para 69; o V-Up já existente foi preservado. Adicionado `obliques` como grupo identificável em filtro e rótulo anatômico, associado à região Abdomen. Instruções descritivas e padrões de movimento registrados em `03-Project-Management/reports/CATALOGO-CALISTENIA-ABDOME.md`, com referências ACE. TypeScript (`tsc --noEmit -p tsconfig.app.json`), ESLint direcionado, inventário estático e `git diff --check` passaram. Pontuação/persistência inalteradas; sem testes automatizados/QA visual/commit/push. R32 e demais mudanças locais preservadas.

31/10/2026 — Matheus perguntou pela variação suspensa lateral para abdômen. Pesquisa confirmou a variação Hanging Oblique Knee Raise (joelhos elevados em direção a um lado, retorno ao centro e alternância); adicionada como `hanging-oblique-knee-raise`, com foco primário em oblíquos e tags secundárias de core, dorsais e antebraços. Windshield wiper fica como variação avançada. Fonte consultada: https://instructions.activtrax.com/exercises/show_exercise_instruction/1327 e https://www.skimble.com/exercises/33941-hanging-oblique-knee-raises-how-to-do-exercise. Pontuação/persistência inalteradas; validação desta adição pendente.

31/10/2026 — Matheus solicitou expansão da Calistenia além das variações descritas. Catálogo ampliado de 21 para 65 fichas mantendo IDs anteriores: flexão parede/joelhos/declinada/negativa/tempo/pausa/pegadas/escapular/arqueiro/explosiva; pegada neutra, suspensões ativa/passiva, elevação escapular, chin-up hold, negativas e variações de barra; sumô, panturrilha em step, tibial anterior, avanços, step-up, wall sit, core e holds de skills. Adicionados grupos anatômicos explícitos serrátil anterior e tibial anterior para filtros/emojis; tags são focos de catálogo, sem percentuais de ativação. Isometrias usam duração por segundos; movimentos dinâmicos/excêntricos contam reps. `calistenia-muscles.ts` alimenta filtros e foco de exercício, sem ajustes ao motor de pontuação. Fontes, decisões e limites em `03-Project-Management/reports/CATALOGO-CALISTENIA-EXPANSAO.md`. Inventário estático: 65 itens, IDs únicos, todos com foco primário, IDs pedidos conferidos. TypeScript (`tsc --noEmit -p tsconfig.app.json`), ESLint direcionado e `git diff --check` passaram. Sem testes automatizados/QA visual/commit/push. R31 e alterações locais anteriores preservadas.

31/10/2026 — Matheus solicitou expansão dos modelos de Corrida, Natação, Artes marciais e Ciclismo. `sport-activities.ts` agora contém 138 fichas por tempo: 18 corrida, 16 natação, 21 ciclismo e 83 artes marciais em 25 disciplinas. Preservados IDs existentes; contagem estática encontrou IDs únicos e confirmou amostra dos IDs antigos. Atributos descritivos usam campos legados (família, foco, equipamento, instruções, variações, rótulo de duração); distância/esforço/notas permanecem no fluxo atual. Editor já filtra categoria e, em artes marciais, disciplina. Nenhum cálculo, regra XP/Prana, persistência ou sessão foi alterado. Fontes e taxonomia em `03-Project-Management/reports/CATALOGO-ESPORTES-EXPANSAO.md`. TypeScript (`tsc --noEmit -p tsconfig.app.json`), ESLint direcionado e `git diff --check` passaram; inventário estático confirmou 138 itens, IDs únicos e IDs legados amostrados. Testes automatizados e QA visual não executados. Sem commit/push. R27/R28, Yoga e Musculação preexistentes permanecem.

31/10/2026 — Matheus autorizou expansão do catálogo de Musculação com variações e filtros anatômicos. Adicionadas 124 fichas: pesos livres, máquinas, cabos, Smith, roscas diversas, pernas, costas, peito, ombros, braços, core e antebraços; isometrias medidas por duração. `StrengthExerciseProfile` separado de `YogaExerciseProfile`, deep-clone e merge de metadados no workoutStore, tags primárias/secundárias para filtros, filtros por equipamento e contração; fonte `musculacao` distinta de `native` para não confundir registro de esporte/blocos de tempo. Barra com anilhas pertence à Musculação; barra fixa e exercícios centrados no peso corporal continuam Calistenia. Sem alteração de fórmula: ER × 0,10 e multiplicadores mantidos; fichas `musculacao` passam pela conversão existente. Relatório CATALOGO-MUSCULACAO-EXPANSAO.md lista fontes/limites. TypeScript (`tsc --noEmit -p tsconfig.app.json`) e ESLint direcionado passaram. Sem testes funcionais/QA visual/commit/push. Alterações locais R27/R28 e R29 Yoga preservadas.

01/11/2026 — Matheus pediu que o tipo de subitem fosse escolhido dentro da edição em vez de ações de conversão no menu. Modal de subitem agora apresenta Pontuável, Checklist e Nota em cards selecionáveis; Checklist/Nota ocultam área, pontuação e tempo, e Nota não exibe checkbox na lista depois de salva. A alteração só persiste ao salvar; cancelar descarta a seleção. Dados de categoria e pontuação da Nota são normalizados para sem categoria/zero, sem mudar o motor de pontuação. ESLint direcionado em `Ciclos.tsx` e TypeScript `tsc --noEmit -p tsconfig.app.json` passaram. Testes automatizados e QA visual não executados; alterações preexistentes no workspace preservadas.
