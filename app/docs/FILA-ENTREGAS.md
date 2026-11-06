## H02 — repasse 0.1.127 pronto para publicação (06/11/2026)

[Começar pelo repasse para Matheus](plans/REPASSE-BACKEND-0.1.127.md): frontend entregue, contratos a revisar, F6/conta, compatibilidade, associação pessoal, fragmentos e GymMane. Kimono/faixa substitui o ícone de artes marciais. Branch de revisão codex/fitness-ui-integration, base/main be78b1e conferidas; publicar sem force/merge direto. README raiz/app apontam o repasse.

668 testes completos (66,40s), TypeScript, lint e build envDir:false (30,09s) passaram. Inventário integral e busca por padrões de credenciais revisados; cache Supabase retirado do índice/ignorado e preservado localmente. Branch desativada para auto-deploy Vercel em configuração versionada; leitura de configuração hospedada recusada 403, sem contorno. Três gates seguem false; candidato SQL 127 somente local, sem alteração em migrações anteriores, dados pessoais ou banco remoto. Sem aceite visual do app/mobile por bloqueio salvo. Registrar hash/PR após push; estado abaixo histórico.

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

**0.1.93 local**, branch `codex/fitness-ui-integration`, base `b11ed9d`. Retomada com Luna Baixo; auditoria somente estática/documental. [Matriz](plans/R25-A-BACKUP-DO-PROGRESSO.md). Cobertura ausente confirmada em `exercisesCatalog`, `nativeCatalog`, `ratings`, `strengthRecords`, `strengthProgressPoints`, `strengthStat` e referências cruzadas; sem evidência de corrupção em dados pessoais. Nenhuma mudança de código ou versão.

**Executado:** inspeção dos validadores, tipos, projeções persistidas, documentação canônica e procedimentos. Sem suíte/build/browser/dado pessoal. Árvore de trabalho ampla e pré-existente preservada; sem commit/push/deploy.

**Próximo:** Sol Médio para revisar produtores, remoções e compatibilidade legada dessas estruturas, implementar uma parte por vez com fixtures reais em memória e regressões de preservação. Depois fechar critérios pré-bootstrap e interrupção/reload antes de habilitar escrita. R25-B, QA mobile e fragmentos seguem independentes.

## R25-A2b4 — conferência isolada na interface (28/10/2026)

**0.1.93 local**, branch codex/fitness-ui-integration/base b11ed9d. Sol Médio solicitado pelo usuário. [Registro](plans/R25-A-BACKUP-DO-PROGRESSO.md). Grimório → Guarde sua jornada → Conferir restauração com o app pausado (`/?progresso=restaurar`). Tela antes de App/stores/auth permite exportar estado atual, selecionar arquivo e comparar perfis/XP/atividades. Diário pendente encaminha à tela e pausa controles sem ler um par misturado. Eventos storage/cancelamento invalidam resultados atrasados; não há handler de gravação ou parâmetro de URL que habilite restore.

**Executado:** 14 testes novos; suíte completa **334 aprovados**. Após ajuste final de erro JSON sem conteúdo bruto, **85 testes de backup** repetidos, TypeScript/lint limpos e build `envDir:false` **11,34s**. Diff-check e versões conferidos; oito arquivos stores/auth/sync/tipos/journal/coordenador preservados por SHA-256. Avisos bundle/Browserslist permanecem. Sem browser/QA mobile, dados pessoais, download pessoal observado, gravação/restore, rede do app, commit/push/deploy.

**Próximo:** inventário R25-A2b5 confirmou as estruturas de Treinos que faltam à prévia; consultar o registro mais recente acima. Aplicação permanece desabilitada até fechar critérios de domínio e teste real de interrupção/reload. R25-B conta online, QA global mobile e fragmentos separados. Implementação incremental de validação deve ocorrer em Sol Médio; elevação apenas se surgir complexidade demonstrada. Reserva encerrada, revisão sequencial pelo Astro Boy; Fábio frontend/mobile, Matheus backend/contratos.

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

## R44 — escolher tipo de subitem na edição (01/11/2026)

Removidas do menu rápido as ações para converter subitem em Pontuável, Checklist ou Nota. O modal Editar subitem agora oferece três cards selecionáveis; Checklist e Nota ocultam área, tempo e pontuação, e Nota fica sem checkbox na lista após salvar. Conversão e limpeza são aplicadas somente ao salvar; cancelamento mantém os dados. ESLint de Ciclos.tsx e TypeScript da aplicação passaram; sem testes automatizados ou QA visual.

## R40 — simplificar cards e tirar streak em Ciclos (01/11/2026)

Removidos selo/ranque de streak e badge de atividade recente. Cards de tarefa mostram checkbox de concluir/desfazer antes do nome; botão textual “Concluir” removido, “Iniciar” segue separado. Badge elemental agora mostra ícone e nome em tamanho legível. Nenhuma alteração em streak persistido, bônus, XP, Prana ou cálculo. TypeScript/ESLint/diff-check em validação; sem testes automatizados/QA visual.

## R41 — editar sequência normal direto pelo item atual (01/11/2026)

O menu de três pontos do ciclo na vez oferece “Editar sequência” e abre o editor na aba Sequências. Nome, dias, membros e ordem são rascunhados sem persistência imediata; um único “Salvar alterações” aplica o conjunto e “Cancelar” descarta. ESLint/TypeScript/diff-check aprovados; sem testes automatizados/QA visual.

## R42 — filhos em Ciclos com hierarquia visual mais clara (01/11/2026)

Subitens agora usam o checkbox do pai, alinhado antes do nome. Removida a aparência de pequenos cards escuros repetidos; a lista usa recuo e guia lateral para mostrar a relação de subtarefa. Identidade de ação/checklist/nota, comandos e pontuação preservados. ESLint/TypeScript/diff-check aprovados; sem teste automatizado/QA visual.

## R43 — disclosure simples para subitens de Ciclos (01/11/2026)

Controle “Ações concluídas/total” substituído por um chevron discreto no cabeçalho de cada item com filhos, conforme padrão dos cards de Treino. A seta indica aberto/fechado; sem botão, texto ou contagem adicional. ESLint/TypeScript/diff-check aprovados; sem teste automatizado/QA visual.

## R39 — editor salva plano sem iniciar execução (31/10/2026)

Removido o botão “Salvar e iniciar agora” do editor. Salvamento apenas atualiza a biblioteca; executar segue pelo botão da tela de treinos. Sem alteração de store ou regra de execução.

## R38 — ocultar subcard de perfil muscular informado (31/10/2026)

Removida do editor nativo a seção manual de percentuais musculares por exercício. Perfis/overrides preexistentes continuam sendo preservados ao salvar; filtros anatômicos do catálogo e ficha do exercício continuam disponíveis. A remoção não altera pontuação ou cálculo.

## R37 — exercício adicionado ao editor inicia recolhido (31/10/2026)

Exercícios incluídos do catálogo ou criados manualmente no modal de edição passam a entrar com card e todas as séries recolhidos, seguindo o padrão pedido para o treino existente. É possível expandir para inspecionar/editar os valores. Sem impacto em store ou pontuação.

## R36 — editor inicia treino existente recolhido (31/10/2026)

Ao editar um template existente, cards de exercícios e séries começam fechados e mostram os resumos já disponíveis. O usuário pode expandir qualquer nível para ajustar campos; itens novos continuam acessíveis. Sem alteração de dados, cálculo ou pontuação.

## R35 — lista oficial usa apenas WorkoutTemplate (31/10/2026)

Removido da lista canônica de modalidade o card dos registros `Workout` legados, que mostrava somente Ver treino/Editar. A lista e a grade de modalidades agora derivam de catálogo e `WorkoutTemplate`. Nenhuma store ou registro legado apagado; histórico e fluxo legado permanecem preservados fora da biblioteca oficial.

## R33 — variações de abdômen na Calistenia (31/10/2026)

Quatro novas fichas: crunch curto, toque nos tornozelos, bicicleta para oblíquos e elevação/descida de pernas com pausa sem tocar o chão. O V-Up já existia e foi mantido. Catálogo 65 → 69; filtro anatômico agora distingue oblíquos. TypeScript, ESLint direcionado, inventário estático e `git diff --check` passaram. Instruções/fontes e limites em `docs/03-Project-Management/reports/CATALOGO-CALISTENIA-ABDOME.md`. Pontuação inalterada; sem testes automatizados/QA visual/commit/push.

## R34 — elevação lateral suspensa para oblíquos (31/10/2026)

Adicionada Elevação Lateral de Joelhos na Barra, com ênfase explícita nos oblíquos e nos filtros anatômicos. Padrão: joelhos sobem em direção a um lado, retornam ao centro com controle e alternam lado; windshield wiper fica como variação avançada. Uma ficha, sem alteração de pontuação/persistência. Fonte e validação em `docs/03-Project-Management/reports/CATALOGO-CALISTENIA-ABDOME.md`.

## R32 — catálogo de Calistenia expandido (31/10/2026)

Catálogo ampliado de 21 para 65 exercícios, preservando IDs. Inclui variações de flexão/barra solicitadas e progressões de pernas, panturrilhas, core e isometrias. Holds por segundos; movimentos dinâmicos/negativos por reps. Tags para filtros anatômicos incluem serrátil anterior e tibial anterior sem percentuais fictícios. Relatório e fontes: `docs/03-Project-Management/reports/CATALOGO-CALISTENIA-EXPANSAO.md`. Pontuação e persistência não alteradas. Validações no relatório; sem commit/push.

## R31 — expansão dos catálogos de esportes (31/10/2026)

138 modelos por tempo em Corrida (18), Natação (16), Ciclismo (21) e Artes marciais (83, 25 disciplinas), preservando IDs antigos. Busca e filtro por categoria/disciplina seguem o fluxo existente. Detalhes e fontes em `docs/03-Project-Management/reports/CATALOGO-ESPORTES-EXPANSAO.md`. Pontuação e persistência inalteradas. Validação e QA visual descritos no relatório; sem commit/push.

## R30 — catálogo Musculação e filtros (31/10/2026)

Adicionadas 124 fichas de resistência externa com tipos descritivos de equipamento, padrão, contração, pegada, lateralidade, cues/cuidados e tags musculares. WorkoutStore incorpora e clona os perfis; catálogo filtra região, secundários, equipamento e isometria/dinâmico; detalhes mostram a ficha e a origem legado lista Musculação. Barra/anilhas ficam em Musculação; peso corporal dedicado segue Calistenia. Nenhuma regra de XP/ER/Prana mudou; source musculacao usa a conversão já vigente. Fontes e taxonomia em `docs/03-Project-Management/reports/CATALOGO-MUSCULACAO-EXPANSAO.md`. TypeScript e ESLint dos arquivos alterados passaram; sem teste funcional/visual, commit ou push.

## R29 — catálogo Yoga ampliado (31/10/2026)

Catálogo ampliado de 12 para 41 posturas (29 adições), mantendo IDs existentes. Perfil Yoga tipado com categoria, focos, estimativa muscular, articulações, referências e confiança; workoutStore preserva o perfil e ExerciseDetailSheet o exibe. Percentuais são provisórios e apenas informativos; nenhuma mudança em XP/ER/Prana ou persistência remota. Fontes/licença e limites em `docs/03-Project-Management/reports/CATALOGO-YOGA-EXPANSAO.md`. Revisão funcional/visual pendente; sem commit/push.

## R28 — navegação global no Santuário (31/10/2026)

O Santuário usava `ElementalPreview` como casca própria e não montava `MobileBottomNav`. A mesma falta se aplicava às páginas de detalhe elemental e aos aliases de prévia (4 definições de rota, 2 vistas conceituais). Pilares e Ciclos já usam `AppLayout`; Fitness usa `FitnessPageShell`. Barra global adicionada à casca elemental e espaço inferior reservado. QA visual/toque em celular pendente; sem teste automatizado, commit ou push.

## R27 — painel “Todas as páginas” em mobile (31/10/2026)

Implementado localmente no Santuário e nos demais pontos que compartilham AllRoutesSheet. No celular, o painel ocupa até 92dvh, mantém título e busca à vista, rola apenas a lista, respeita áreas seguras e apresenta destinos como linhas largas com alvo de toque maior. Em telas maiores, a grade de cartões permanece. Sem mudanças em rotas, stores ou dados. Revisão estática e `git diff --check` passaram; QA visual/toque real em 360/390/768px não executado. Sem commit/push.

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

## Visão do restante — seis frentes abertas, 24/10/2026

Agrupamento do escopo aprovado para orientar a evolução; não representa seis sessões, estimativa de prazo ou percentual concluído. As entradas anteriores permanecem como histórico/evidência, sem fila paralela.

| Frente | O que falta | Dependência/aceite |
| --- | --- | --- |
| 1. Design system e Invocar | Revisar piloto em tela real; consolidar tokens/receitas, estados, ícones e movimento; catálogo de componentes e adoção gradual | Fábio; layout, teclado, toque, contraste e movimento reduzido comprovados |
| 2. Jornadas e Grandes Obras | Detalhes atualizados por ID/conta, vínculos diretos, navegação da obra à atividade; delimitar edição/reordenação/exclusão de capítulos | Preservar comandos atuais; qualquer contrato novo com Matheus |
| 3. Cobertura do app | Forja, Domínios/detalhes, Astrolábio/Cassino, onboarding/auth, editores antigos e áreas especializadas Temporal/Fitness ainda não uniformes | Auditoria por rota, dados/funcionalidades preservados; referências openGym delimitadas antes de integrar |
| 4. Constância e fragmentos | Definir dia/fuso, elegibilidade, multiárea, Undo/reconclusão/idempotência e persistência; depois UI de recompensa/saldo reais | Fábio decide produto; Matheus contratos/backend. Quantidade já aprovada: 1 fragmento por conclusão válida, separado XP/Prana |
| 5. Qualidade integrada | QA 360/390/768/1440, zoom, acessibilidade, fluxo completo, animações e desempenho; tratar chunks relevantes | Navegador local liberado; usar dados isolados e registrar evidências reais |
| 6. Fechamento e repasse | Revisão integrada, atualização Astro Boy/Matheus, versão/relatório e publicação quando solicitada | Sem incluir credenciais/perfis; push/deploy têm escopos distintos |

Sleek é apoio opcional à frente 1. Autenticação pendente não bloqueia evolução local. Backend e pontuação continuam sob responsabilidade de Matheus, sem alteração silenciosa pela repaginação.

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

## R02 — prévia implementada; validação visual bloqueada (21/10/2026)

Astro Boy, execução/revisão documental sequenciais, base `f07292f`, versão local **0.1.33**. Alterações I03/R01 preservadas. `/previa-elemental` carrega sob demanda a composição do Santuário e páginas dos elementos via `?elemento=terra|fogo|agua|ar`. Personagem existente, progressão/recursos por getters atuais, giro controlado, ficha visual de equipamentos, busca/expansão de áreas e destinos existentes. Estilos escopados; home vigente, stores, contratos e persistência não alterados.

Reservas encerradas: `src/App.tsx`, `src/pages/ElementalPreview.tsx`, `src/pages/elemental-preview.css`, manifests/lockfile, changelog, fila e continuidade. Aceite visual não concedido. Executados: TypeScript, build Vite `envDir:false`, ESLint focal, diff-check, inspeção estática e paridade das três versões. Build mantém avisos de Browserslist/chunks grandes. Sem novos testes funcionais ou capturas.

Bloqueio: navegador recusou acesso a `http://127.0.0.1:5173`; após autorização explícita do usuário, nova tentativa informou preferência salva de bloqueio. Nenhuma tentativa de contornar por outro browser, porta ou automação. Próximo: usuário remover bloqueio salvo; então conferir 360/390/768/1440, quatro portais/giro, ficha/foco, busca, áreas personalizadas, reload/voltar, movimento reduzido e ausência de escrita no perfil. Não promover a composição à home antes da avaliação. Revisão independente pendente; sem secrets, deploy, migração, commit ou push.

## R01 — diagnóstico e arquitetura da repaginação elemental (21/10/2026)

Decisão de navegação atualizada em 21/10/2026 por Astro Boy: página própria de cada elemento e retorno ao Santuário. Reserva documental encerrada após atualização deste arquivo, CONTINUIDADE.md e relatório R01; nenhum arquivo de produto alterado.

Diagnóstico e proposta documental concluídos; direção visual em revisão com o usuário. Base `f07292f`, branch `codex/fitness-ui-integration`. [Relatório R01](03-Project-Management/reports/REPAGINACAO-ELEMENTAL-2026-10.md) cobre prioridades, famílias de rotas, referências Scrolltide/X/openGym, arquitetura, Wizard e sequência R02–R08. Personagem protagonista com elementos ao redor é decisão explícita; página própria do elemento com botão para voltar ao Santuário foi confirmada explicitamente pelo usuário em 21/10/2026. Sem alteração de produto. Reservas documentais encerradas: este arquivo, `CONTINUIDADE.md`, `README.md` e relatório R01. Alterações I03 preexistentes preservadas. Auditoria de movimento por `/root/auditoria_movimento`, somente leitura; consolidação e revisão documental sequenciais por Astro Boy. Preferência informada: Astra Médio; nenhuma troca automática. Inspeções estáticas e observações de navegador discriminadas no relatório; sem novo build/lint/testes funcionais. Revisão documental independente pendente.

Sequência do programa; estado atual de R02 na entrada acima, demais lotes sem reserva:

| ID | Escopo | Dependência e aceite |
|---|---|---|
| R02 | Base visual e composição piloto — código 0.1.38 | Direção aprovada pelo usuário em 21/10; QA visual/interativo do executor pendente por bloqueio do navegador. |
| R03 | Santuário/navegação — parcial 0.1.40 em revisão | Prévia com busca global e tick existente. Faltam ações de início/retomada/conclusão e QA antes de promoção. |
| R04 | Rituais/Ciclos/Invocar/Forja — parcial 0.1.40 em revisão | Cronômetro simples e tema entregues; preservar operações e verificar UI/regressão I03 no acabamento. |
| R05 | Jornadas/Grandes Obras/Temporal — piloto parcial 0.1.40 | Showcase em listas; detalhes, Temporal, hierarquia/vínculos/datas aguardam QA/refinamento. |
| R06 | Fitness e incrementos selecionados | R02; subdividir visual, desempenho anterior, descanso e demais recursos; manter histórico/recibos. |
| R07 | Perfil, análises e superfícies restantes | R02; D01/D02 e decisão de domínio quando aplicável; nenhuma métrica fictícia. |
| R08 | Revisão transversal | Lotes migrados; matriz responsiva/acessibilidade/performance com evidência atual. |

Os detalhes e critérios estão no relatório; esta é a única fila de estados. Inventário funcional, economia de recompensas, séries especiais e importação exigem delimitação própria; não estão aprovados implicitamente como mudança de domínio.

## I03 — retomada concluída em 20/10/2026 / 0.1.32

Astro Boy executou e revisou sequencialmente no checkout principal, branch `codex/fitness-ui-integration`. Preferência do usuário: Astra Médio; nenhuma troca automática de modelo. Pull autorizado `git pull --ff-only origin main` integrou `fe1a8fe → f07292f` sem conflitos, partindo de árvore limpa. Matheus encerrou a restauração da recompensa consolidada e o tratamento de sessões vazias Fitness; código e decisões recebidos preservados. Não houve nova mudança de domínio.

I03 já existia e estava aceito com mocks em 09/10. A retomada confirmou consentimento explícito, corpo somente message/consent, JWT da sessão, validação Auth no gateway, proposta editável e gravação pelo `addDraft` existente. Lacuna estática corrigida: resumo final de DRAFT não mostrava o conteúdo a confirmar; agora exibe nome/descrição revisados e informa que nada foi salvo. Nenhuma store, regra, schema, função remota ou configuração Auth alterada.

Evidências desta execução:

- `deno test supabase/functions/assistant-suggest/index_test.ts`: 7/7, dependências simuladas, sem permissões de rede/secrets.
- `node tests/assistant/i03-browser.mjs`: passou, Auth/provedor simulados somente no módulo Invocar, app/store reais, perfil temporário e rede externa bloqueada. Consentimento, payload mínimo/JWT de fixture, sugestão/etapa de revisão sem gravação, edição, confirmação/addDraft/reload, falhas 401/429/503/502/resposta incompleta/sessão ausente e fallback manual. Snapshots de user/tasks/habits/projects/quests/executionLogs preservados. Zero page errors. Sem overflow do resumo em 360/390/768px; captura 390 inspecionada visualmente. Artefatos: `/var/folders/t5/3qr37hs14vv_6k_7yd4_92kr0000gn/T/conselho-i03-PlxdcC`. Tentativas iniciais corrigiram seletores da automação (cartão, resumo e botão homônimo da sidebar); não eram falhas adicionais do produto.
- TypeScript `npx tsc -b` e build Vite por API com `envDir:false` aprovados; arquivos .env não carregados. Build avisa Browserslist/chunks grandes. Lint: 0 erros / 4 avisos em Ciclos/Temporal. `git diff --check` e paridade das três versões passaram.
- Skill Supabase e documentação oficial Auth/changelog consultadas. Aviso TLS/CBC publicado em 12/10 trata clientes antigos; não requer modificação deste handler local. Sem teste de compatibilidade TLS remota.

Reservas de Invocar, teste, manifests/changelog, guia, fila e continuidade encerradas. Versão 0.1.32 sincronizada nos três campos dos manifests e changelog vigente. Revisão documental pelo coordenador; revisão independente pendente. Sem secrets lidos/criados, deploy, migração, commit ou push. Aceite: protótipo local no escopo I03. Chamada real/Auth remoto/quotas continuam não verificados; I04 exige escopo próprio. Fitness recebido teve checagem estática/build/lint, não um novo teste funcional completo. Próximo: revisão do usuário da confirmação; manter ativação remota fora deste lote.

## F59 — concluído: integração Fitness / 0.1.31

Astro Boy, Astra Alto. Navegação canônica Treinos/Histórico/Corpo/Saúde; Hoje/Evolução/Semana recuperados e alimentados por sessões Native e legadas. Prévia Native com hero/programa/mídia/edição/início; capa compartilhada com legado. Relógio com pausa persistida, distância e notas por bloco, resumo com ritmo manual e imagens Yoga, semanas anteriores e histórico por dia. Planejar data abre editor existente. Prana lido do Core; nenhuma fórmula ou recompensa histórica recalculada. CTAs/FAB/navegação alinhados em mobile/tablet.

Aceite executado: Deno 8/8; criação/prévia/edição/início/pausa-reload/conclusão/estrelas/histórico/painel/semana/avaliação corporal em perfil temporário; distância/notas/reload e finalização parcial de corrida; FAB e descarte. 360/390/768 sem overflow, zero page errors; hit tests das ações positivos. Build aprovado; lint 0 erros/4 avisos anteriores; diff-check e versões sincronizadas. Sem publicação. Revisão documental sequencial pelo coordenador; independente pendente.

Mapa das nove referências, arquivos de evidência e limites em [CONTINUIDADE.md, F59](CONTINUIDADE.md). GPS/mapas, sensores/calorias/sono/água e widgets personalizados não tinham fonte funcional; permanecem como integrações futuras, sem simulação. Vídeo remoto válido e fluxo completo de execução legada não retestados. Reserva encerrada; revisão de Fábio é o próximo passo.

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

# Fila única de entregas — 08/10/2026

## F56 — editor único, exercícios próprios e mídia

Implementado, versão 0.1.28. Corrigidos menu/app-routes e alias legado para FitnessRoot. Editor único prioriza exercícios, mídia, notas e data; esforço/estimativa expansíveis. Cadastro próprio persistido nos catálogos existentes da conta, sem dados musculares inventados; campos opcionais de mídia em snapshots e clone legado. Esportes por tempo usam minutos/descanso sem kg. UI em perfil temporário confirmou três entradas iguais, criação sem busca positiva, reload de exercício/template/data/imagem/vídeo, execução com imagem e conclusão XP; 360/390/768 sem overflow e zero page errors. Reprodução de vídeo real não testada. Build final passou; lint 0 erros/4 avisos anteriores; Deno 3/3; teste de Ciclismo confirmou 0,5min→30s e ausência de kg. Diff-check/paridade de versões passaram. Revisão documental independente pendente; coordenação registrou evidências. Sem migração ou mudança de fórmula de XP.

## F55 — interface única Fitness e FAB contextual

Implementado, versão 0.1.27. Terra/Mais usam FitnessRoot/editor Native compartilhados; planos antigos aparecem na biblioteca com edição compatível sem migração. Histórico/Corpo abrem a casca canônica. FAB observa Montar treino e some/volta conforme visibilidade. Execução Native mantém navegação/mídia e conclusão reconhece registro concluído antes de redirecionar, corrigindo corrida que pulava resumo. Teste UI 390px: criação/edição/executar/três séries/concluir/resumo XP/histórico; FAB hide/restore; zero page errors e sem overflow. Teste de edição legada preservou ID e séries; 360/768px sem overflow. Build final passou; lint final 0 erros/4 avisos preexistentes; diff-check e versões sincronizadas passaram. Revisão documental independente pendente por indisponibilidade; coordenador conferiu registros. Modelos Sol 6.1 Médio para implementação/arquitetura, Luna Leve para documentação simples. Próximo: revisão visual e plano de runtime Astro Boy. Regras/XP/dados anteriores preservados; compatibilidade de execução legada continua sem migração.

## F54 — histórico e conclusão unificados do Fitness (13/10/2026)

Estado: implementado, versão 0.1.26. `WorkoutHistory` reúne sessões nativas/Core e legadas numa lista cronológica, com filtros mensais e cartões acionáveis; todos abrem `WorkoutSummary`. A conclusão nativa agora navega ao mesmo resumo. A recompensa usa o recibo/Core ou ledger legado existente; nenhum XP histórico foi convertido, recalculado ou migrado. Verificação em navegador: registros de 50 XP (Core) e 11 XP (legado) abriram resumo compartilhado e mantiveram o valor; resumo mobile checado em 390px, sem overflow e com CTA visível. Build passou; lint 0 erros/4 avisos preexistentes; `git diff --check` passou. Responsável de Versionamento/Documentação indisponível; revisão do coordenador registrada, revisão independente posterior. Sem alteração de fórmula/persistência ou publicação.

## F53 — ações de continuar/iniciar/concluir no fluxo legado de treino (13/10/2026)

Estado: concluído em 13/10/2026, versão 0.1.25. Ação fixa acima da navegação inferior (64px + safe area), com espaço de rolagem para as duas barras; sessão ativa em WorkoutSelect mostra CTA “Continuar treino”; ActiveWorkout mostra “Finalizar treino” com blocos pendentes e “Concluir treino” quando todos foram processados, mantendo confirmação para sessão incompleta. Smoke Puppeteer em perfil temporário 390×844: treino corrida criado via UI, CTA “Finalizar treino” para sessão incompleta abriu confirmação, cartão de sessão reabriu mesma sessão, bloco completado com 10min/RPE5, CTA “Concluir treino” levou ao resumo; botão estava totalmente acima da navegação, toque central atingiu botão, overflow horizontal ausente e sem page errors. Build passou; lint 0 erros/4 avisos preexistentes em Ciclos/Temporal; `git diff --check` passou. Agente de Versionamento/Documentação indisponível; revisão pelo coordenador registrada em CONTINUIDADE, revisão independente fica para lote posterior. Sem alterações em XP, persistência, dados pessoais ou publicação.

## F52 — alinhamento do botão fechar na ficha de exercício (13/10/2026)

Estado: concluído em 13/10/2026, versão 0.1.24. Checkout principal, branch `codex/fitness-ui-integration`, base de trabalho `b1575e4`; outras alterações locais preservadas. Reserva F52: `src/components/workout/exercise-detail.css`, manifests/changelog Fitness, fila e continuidade. Ícone centralizado no botão X 44×44px; teste de navegador temporário 390×844 confirmou fechamento, retorno a `/treinos`, sem overflow ou erros. Build, lint focal e diff-check passaram; nenhum dado ou navegação alterado.

## F50 — sincronização e compatibilidade pós-Matheus (13/10/2026)

Estado: atualização integrada por fast-forward em b1575e4; nenhuma divergência Git foi mesclada. A branch main local e o worktree separado foram preservados. O build da base anterior passou e o recebido inicialmente acusou 156 erros TypeScript; após correções de compatibilidade, mapeamento de XP e loop de renderização, build/lint passam. Deno: 7/7; smoke de /treinos, /fitness, /treinos/painel e /treinos/historico em 360/390/768px sem overflow horizontal nem erros de página.

Pendências: revisar UI em 360/390/768px e fluxo completo; executar conclusão/reversão/histórico em perfil de teste, incluindo 0 séries concluídas (zero recompensa esperado) e pelo menos 1 série concluída (XP positivo esperado); confirmar sincronização remota só em etapa autorizada. Migrações 20261011 não aplicadas. Há diferença entre semântica/XP da referência externa e capítulos versionados neste repo, sem decisão/migração. Ver evidências, branch, versão e próximos passos em CONTINUIDADE.md, seção de 13/10/2026.

## F51 — recompensa proporcional por bloco e esforço percebido

Estado: implementação concluída e validação principal executada em 13/10/2026, versão 0.1.23; aceite funcional parcial enquanto repetição/idempotência e leitura de histórico preexistente não forem retestadas. Reserva utilizada: `src/types/workout.ts`, `src/stores/workoutStore.ts`, `src/pages/fitness/ActiveFitnessSession.tsx`, `src/lib/core/native-action-completion.ts`, `src/lib/workout/fitness-core-adapter.ts`, `src/lib/core/native-workout-reward.ts`, `src/lib/workout/native-reward-preview.ts`, `src/components/workout/NativeSessionHistory.tsx`, `tests/workout/native-workout-reward.test.ts`, documentação Core/arquitetura/modalidades, ADR-003, manifests e changelog. Preservados `ExecutionLog` único/idempotência; histórico antigo imutável. Nenhuma migração Supabase.

Validação executada: cada bloco registra RPE; volume e esforço variam XP; descanso/blocos pulados não pontuam; Core calcula XP/Prana; recibo mostra métricas. Testes Deno 3/3; smoke temporário 390×844 concluiu duas séries mistas e exibiu +85,6 XP em 10 min ativos. Build e `git diff --check` passaram; lint passou com quatro avisos fora dos arquivos F51. Repetição/idempotência e histórico preexistente precisam de reteste antes do aceite integral; reversão e sync remota permanecem fora desta etapa. Versão e docs revisadas no changelog e ADR-003.

## UI Shell — 10/10/2026

| ID | Escopo e dono | Dependências | Estado | Aceite verificável |
|---|---|---|---|---|
| UI04 | Editor de template de treino e projeção ER — Astro Boy, papel Interface | UI-SHELL; contratos canônicos ER/Adapter | em revisão | Preservar páginas/rotas atuais; ligar edição à tela realmente montada em `/treinos` (`pages/fitness/WorkoutSelect.tsx`) e ao Hub alternativo; permitir criar e editar template com exercícios ordenados e configuração individual por série (repetições ou isometria, carga, fator canônico e descanso); exibir projeção ER/base_value sem confundir com recompensa final; salvar via store existente. Corrigir alias TDZ de FitnessModuleFab identificado no HEAD. Sem nova fórmula, migração, Adapter ou exclusão de tela. Evidência: revisão estática e `git diff --check`; testes/build/lint e revisão visual ainda não executados. Campo opcional `loadFactor` exige regressão de compatibilidade antes do aceite final. |
| UI-SHELL | AppLayout/BottomNav e navegação Fitness — Astro Boy, papel Interface | Nenhuma | em revisão | Confirmar quatro itens globais na ordem Santuário/Pilares/Ciclos/Mais, acesso ao hub Mais, top tabs Treinos/Histórico/Saúde e FAB acima da navegação global; revisar 360/390/768px e desktop. Build/lint aprovados; navegador ainda pendente. Sem alteração de stores/contratos. |

Coordenação: Astro Boy. Protocolo em [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md). Donos abaixo são papéis; o coordenador registra agente concreto e reserva ao despachar. Todos os lotes futuros permanecem sem reserva e não iniciados. C00 foi aceita por Astro Boy e integrada documentalmente ao checkout original em 08/10/2026.

## Ordem proposta

| ID | Escopo e dono | Dependências | Estado | Aceite verificável |
|---|---|---|---|---|
| C00 | Coordenação e inventário atual — executor de coordenação; revisão Astro Boy | Nenhuma | aceita | Conferir três documentos novos e exceção de versionamento em .gitignore, integridade das alterações anteriores, suporte/limites declarados e evidências estáticas. Sem modificação do produto. |
| V01 | Santuário já modificado — Validação; Interface só após defeito reproduzido | C00 | parcial; defeito corrigido em I01 | Abrir em 360/390/768px; comparar com IMG_2388.jpg se disponível; registrar capturas, overflow, erros, enquadramento e interação dos seis espaços. Conferir dados reais dos stores e ausência de Canvas oculto. Se referência indisponível, fidelidade fica pendente. |
| V02 | Fitness existente — Validação | C00; V01 para execução sequencial inicial | parcial | Perfil temporário; criar treino pela UI; preview → iniciar → continuar sessão → série → reload → finalizar → resumo → histórico. Conferir duas avaliações independentes e histórico entre meses com dados permitidos, sem fabricar saúde/GPS ou modificar stores. Registrar limites de tempo/dados como pendências. Comparar 360/390px com referências e conferir nomes acessíveis dos diálogos. |
| D01 | Auditoria dos contratos core/hábitos/projetos — Regras/dados | C00 | aceita (estática) | Matriz fonte canônica × função atual × caso de verificação para folha/agregador, Check/Note, vínculos Quest/Action, presença, multi-área, histórico/reversão e rotação pausada. Explicitar quatro inconsistências já listadas na base canônica. Auditar também o HP calculado localmente em CharacterStage.tsx (70 + hábitos concluídos × 5 + bônus de sequência, limitado a 100), comparando com contratos existentes sem alterar a fórmula neste lote. Nenhuma mudança de fórmula ou migração. |
| V03 | Rituais/ciclos/projetos/jornadas/temporal — Validação | D01 | fila | Em perfil temporário, documentar criação/conclusão/reversão/reload e mudança de data com resultados esperados derivados do contrato reconciliado. Calendário externo somente se ambiente e autorização permitirem; integração remota separada de persistência local. |
| D02 | Astrolábio e camada astrológica — Regras/dados; Interface consultada | C00 | aceita (estática) | Rastrear consumidor do histórico Math.random e reproduzir comportamento; distinguir astronomia calculada, métricas de store e série simulada. Propor lote mínimo para decisão do coordenador; não substituir dados silenciosamente. |
| D03 | Assistente e adapters de módulos — Regras/dados | D01 | aceita (estática) | Localizar implementação equivalente ou registrar limites da busca para conversação, operações autenticadas/auditadas, adapters e retorno core→módulo. Separar formulário Invocar de assistente e perfil Grimório de módulo de leitura. Sem implantar integração nesta auditoria. |
| I01 | Integração do primeiro lote corretivo — Astro Boy + Validação | V01/V02 ou auditoria que comprove o defeito escolhido | aceita (Santuário delimitado) | Criar escopo concreto na própria fila antes de editar; reservar arquivos; revisar diff, executar verificações proporcionais e registrar evidências atuais. Não integrar mudanças alheias como autoria própria. Publicação/push/merge fora desta entrega. |

| I02 | Encobrimento de Concluir série — /root/fix_v02; custódia /root/versionamento_documentacao | V02 | aceita (cenário delimitado) | Reteste delimitado em quatro larguras; consolidar lint/build e aceite de Astro Boy. |

| D04 | Provedor IA — Astro Boy | D03 | aceita (pesquisa) | Comparação oficial, decisão provisória e limites em DECISAO-PROVEDOR-IA.md; sem conta/credencial conectada. |
| I03 | Sugestão de rascunho IA — Astro Boy; custódia /root/versionamento_i03 | D03/D04 | aceita (protótipo local com mocks) | Sete testes Deno; build/lint; UI com auth/provedor simulados e addDraft real; chamada live e deployment pendentes. |

Prioridade inicial (histórico): C00 → V01 → V02. D01 pode avançar em leitura paralela com V01/V02 se houver vaga; alterações em arquivos compartilhados nunca ocorrem em paralelo. I01 é uma porta de integração, não autorização para corrigir todo o backlog.

## Inventário atual por módulo

Legenda: **verificado** = presença/conexão confirmada no código nesta inspeção, não aprovação funcional; **parcial** = cobertura limitada ou lacuna explícita; **apenas documentado** = contrato encontrado na documentação, sem equivalente localizado no escopo da busca; **pendente de teste** = execução ainda necessária. As classificações podem coexistir. Evidências relativas à raiz do app, com linhas de referência em 08/10/2026; conferir novamente após mudanças.

| Módulo | Classificação e evidência atual | Pendente / fila |
|---|---|---|
| Rotas e plataforma | Verificado: React/TypeScript/Vite/Zustand em package.json; src/App.tsx:133–169 liga páginas. Scripts build/lint presentes; nenhum script test. | Não executar um teste inexistente nem interpretar dependência como integração aprovada. |
| Santuário/personagem | Verificado/parcial: src/pages/Santuario.tsx:19–21 usa CharacterStage e showAura=false; src/components/layout/AppLayout.tsx:44 deriva renderAura; CharacterStage.tsx:14–16 usa stores e getResourceSnapshot. | Pendente de teste visual e interação; docs/STATUS-SANTUARIO.md é registro anterior, não validação desta entrega. V01. |
| Core e persistência | Verificado/parcial: src/stores/appStore.ts:290–337 calcula nível/XP/sequência; :734 usa persist; :1087 e :1263 tratam concluir/desfazer tarefas. | Aderência canônica, idempotência, reversão e recuperação pendentes. Persistência local não prova sincronização remota. D01/V03. |
| Rituais/hábitos/ciclos | Verificado: src/pages/Rituais.tsx:656–688 conecta conclusão/filhos; appStore.ts:2398/:2480 cria/conclui hábitos; src/pages/Ciclos.tsx:650–654 passa tempo/data. | Rotação, agregação e reversão pendentes de teste. D01/V03. |
| Projetos e jornadas | Verificado: src/pages/GrandesObras.tsx:34; src/pages/Jornadas.tsx:36; appStore.ts:3895–3968 expõe projetos/missões. | Vínculos, exclusão e propagação não certificados. D01/V03. |
| Calendário temporal | Verificado: src/pages/temporal/TemporalCalendarPage.tsx:56–88 combina fontes; :123–129 consulta calendário externo condicionalmente. | Navegação temporal e integração externa pendentes de teste. V03. |
| Fitness/Forja | Verificado: src/App.tsx:1–8 importa pages/fitness; workoutStore.ts:909/:1057/:1183/:1302 cria/inicia/conclui série/finaliza; WorkoutSelect.tsx:154–161 oferece continuar sessão. | Fluxo, persistência, avaliações, histórico, acessibilidade e fidelidade pendentes nesta entrega. Relatos anteriores em STATUS-FRONTEND-FITNESS não foram reexecutados. V02. |
| Astronomia/Lua | Parcial: src/constants/index.ts:6 usa astronomy-engine; :165–179 calcula fase e :303 ingressos; src/pages/Lua.tsx:30 anuncia horários locais/culminação futuros. | Não tratar todo o módulo como fictício; validar cálculo e apresentação no lote D02. |
| Astrolábio | Parcial: src/pages/Astrolabio.tsx:29–52 usa Math.random no histórico; :24–27/:61–68 usa métricas do store. | Histórico simulado é achado estático concreto; impacto visual/funcional precisa reprodução. D02. |
| Modificadores astrológicos | Apenas documentado nesta inspeção: docs/01-Domain-Core/03-Astrology-Engine.md:16 especifica DailyAstroState. Busca em src por DailyAstroState/astro_modifier sem correspondência. | Ausência desses nomes não prova ausência de equivalente. D02. |
| Invocar/assistente | Formulário verificado em src/pages/Invocar.tsx:31–120. Assistente conversacional apenas documentado nesta inspeção em docs/02-Platform-Architecture/04-Integracao-LLM-e-Voz.md:36–54. | Formulário não comprova conversação/voz/ferramentas. Busca não exaustiva; D03. |
| Grimório/adapters | Parcial: src/pages/Grimorio.tsx:26–54 mostra perfil/estatísticas/radar/edição. Contrato de módulo nativo de leitura e retorno ao core está na fonte canônica. | Não declarar módulo de leitura implementado pela existência da rota. D03. |
| Demais páginas e catálogos | Presença de rotas/páginas confirmada para domínios, pilares, corpo, yoga, calistenia, estações, mapa e cassino em src/App.tsx e src/pages. | Inspeção funcional detalhada fora deste levantamento inicial; coordenador abre entrada nesta fila conforme prioridade, sem reformulação automática. |

## Registro desta entrega

Inspeção estática e leitura dos documentos canônicos; um subagente somente leitura retornou inventário ao executor. Nenhum navegador, build, lint ou fluxo de produto foi executado nesta entrega documental. Testes anteriores não foram herdados como aprovação atual.

Estado inicial preservado: docs/CHANGELOG.md, package-lock.json, package.json, src/components/layout/AppLayout.tsx, src/index.css, src/pages/Santuario.tsx modificados; .agents/, docs/STATUS-SANTUARIO.md e src/components/sanctuary/ não rastreados. Não atribuir esses arquivos a C00.

Artefatos novos de C00: AGENTS.md, docs/COORDENACAO-AGENTES.md e este arquivo. .gitignore recebeu somente !/AGENTS.md e comentário para permitir versionar as instruções. Revisão do coordenador ainda necessária; não houve publicação, push ou merge.

## Atribuições e reservas

Este registro pertence à mesma fila acima, não cria outro backlog. Checkout C00: `/Users/fabioandre/.codex/worktrees/e2b6/Conselheiro_Elemental_MAIN/app`. Base: `03f05886e5c8afbc8d28dc8ff54da4945d44f626`. Somente Astro Boy altera atribuições durante trabalho paralelo.

| ID | Agente concreto | Checkout | Arquivos reservados | Evidências / estado da atribuição |
|---|---|---|---|---|
| C00 | Original: `01a11cf3-3e91-7d12-a254-b3dda87de94a`; revisão: `01a11cf6-15b8-7003-9c6f-2fe59c39faf1` | Checkout C00 acima | Nenhum após conclusão; escopo documental: AGENTS.md, docs/COORDENACAO-AGENTES.md, docs/FILA-ENTREGAS.md e exceção já existente em .gitignore | Aceita por Astro Boy e integrada ao checkout original; metadados e status Codex confirmaram executor anterior concluído; instruções originais integralmente mescladas |
| V01 | `01a11cf6-15b8-7003-9c6f-2fe59c39faf1` | `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app` | Nenhum após entrega | Executada; sem aceite por sobreposição em 768px; ver STATUS-SANTUARIO.md |
| V02 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D01 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado; inclui auditoria do HP local |
| V03 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D02 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| D03 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |
| I01 | Pendente | Pendente | Nenhum; atribuir antes de iniciar | Não iniciado |

A revisão C00 altera somente documentação. Não executa V01, build, lint ou navegador; não modifica produto, regras ou dados. Os arquivos finais permanecem somente no worktree, sem integração no checkout original, push ou merge.

## Integração C00 e despacho V01 — 08/10/2026

C00 aceita explicitamente por Astro Boy. Documentos integrados em `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; nenhuma alteração de produto copiada. AGENTS.md original preservado integralmente e coordenação acrescentada. Exceção mínima de .gitignore aplicada. Registros anteriores descrevem a preparação no worktree e não o checkout efetivo atual.

V01 atribuído ao agente Codex `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`, no checkout original acima. Reservas: somente `docs/FILA-ENTREGAS.md` e `docs/STATUS-SANTUARIO.md`; capturas e evidências em `/tmp/conselho-v01-20261008/`. Produto somente leitura. Skills disponíveis na pasta original; nenhuma copiada.

## Resultado V01 e próximo lote

Validação concluída no checkout original, evidências em `/tmp/conselho-v01-20261008/` e detalhes em `docs/STATUS-SANTUARIO.md`. Em 360/390px: seis controles funcionais, sem overflow. Em 768px: colunas de equipamento sobrepostas, três cliques acionam o controle errado; V01 bloqueada para aceite até correção e reteste. Nas três larguras: 1 Canvas visível, nenhum Canvas fora do palco; sem erros capturados. Navegação para Rituais desmonta Canvas e retorno remonta. Referência IMG_2388.jpg disponível e comparada; equivalência visual integral não aprovada.

Próximo lote proposto I01: corrigir somente posicionamento responsivo das colunas em `src/index.css`, mediante despacho do coordenador; reservar esse arquivo antes de editar e preservar alterações preexistentes. Dependência: defeito V01 reproduzido. Aceite: seis controles independentes e duas colunas em 768px, preservação em 360/390px, sem overflow nem Canvas duplicado. I01 ainda não iniciado; dono concreto e reserva pendentes. D01 mantém auditoria do HP. Nenhuma reformulação, alteração de store, publicação ou alteração de modelo autorizada por este registro.

Reservas documentais desta execução liberadas. Produto e demais arquivos preservados por comparação SHA-256 com o estado anterior à integração. C00 aceita; V01 com execução concluída e aceite bloqueado pelo defeito; V02 não iniciada.

## Despacho I01 — 08/10/2026

Autorizado por Astro Boy. Executor `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`, checkout `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Em execução. Reservas: `src/index.css`, `docs/FILA-ENTREGAS.md`, `docs/STATUS-SANTUARIO.md`; para versionamento obrigatório: `package.json`, `package-lock.json`, `docs/CHANGELOG.md`. Escopo: somente ancoragem das colunas no breakpoint >=640px e incremento patch. Preservar alterações anteriores.

## C01/C02 — consolidação e política de modelos, 09/10/2026

Continuação autorizada diretamente pelo usuário neste chat. C01 integrado documentalmente: manual, dossiê, responsável documental e instruções de continuidade. C02 incorpora escolha de modelos por tarefa. Sem copiar a fila antiga do worktree nem substituir instruções existentes. Estado documental: integrado, verificação final nesta execução.

Retomada I01: consulta Codex confirmou executor anterior ocioso com último turno falho por limite de uso. CSS corretivo e 0.1.13 já presentes. Reserva de STATUS-SANTUARIO transferida ao subagente `/root/validacao_i01` para reteste, sem edição de produto. Modelo solicitado Sol (`gpt-6.1-sol`), esforço médio: roteiro delimitado com navegador. Artefatos novos em `/tmp/conselho-i01-20261009/`. Executor de coordenação reserva esta fila e CONTINUIDADE. Critério: seis controles em 360/390/768/1440px, sem overflow/Canvas oculto e registrar erros. Aceite I01 depende do resultado, não do bump de versão.

## Encerramento C01/C02 e reteste I01 — 09/10/2026

Consolidação documental concluída nesta execução autorizada; 216 arquivos de produto/metadados preservados por hashes. Links locais novos e git diff --check conferidos. Política de modelos integrada em AGENTS.md e POLITICA-MODELOS.md; seleção Sol/médio exercitada no subagente de validação. Sem instalação de skills, alteração global de modelo ou novo bump.

I01: critérios delimitados de reteste aprovados na revisão desta execução. Em 360/390/768/1440px, 6/6 controles, sem overflow, um Canvas e nenhum fora do palco; erros de navegador/HTTP vazios conforme relatório. Evidências: /tmp/conselho-i01-20261009/results.json e STATUS-SANTUARIO.md. Não certifica fidelidade visual integral ou auditoria de HP. A correção/0.1.13 já existia; esta execução concluiu validação, sem atribuir implementação anterior a si.

Verificações adicionais pelo executor de coordenação: npm run lint saiu 0, 0 erros/4 avisos; npm run build saiu 0, avisos de chunks grandes e base Browserslist antiga. Não atualizadas dependências para remover avisos. Reservas desta execução liberadas e servidor temporário encerrado. Próximo lote: V02, fluxo Fitness em perfil temporário; nenhum novo lote de produto iniciado em paralelo. Sem commit/push/merge/publicação.

## V02 — despacho 09/10/2026

Dono: subagente `/root/validacao_fitness`; checkout principal. Em andamento. Modelo Sol (`gpt-6.1-sol`), raciocínio médio, escolha comunicada ao usuário por envolver automação real e ciclo de estado. Preferência vigente do usuário para chat principal: Luna leve. Reservas exclusivas: `docs/STATUS-FRONTEND-FITNESS.md`, `/tmp/conselho-v02-20261009/`; produto em leitura. Atribuição segue critério da fila: perfil isolado e dados criados pela UI, nenhum dado fictício de saúde/GPS. Aceite depende de relatório do validador e revisão do coordenador.

## Resultado V02 e despacho I02 — 09/10/2026

V02 executada por `/root/validacao_fitness`, Sol/médio. Estado: parcial; fluxo principal de treino, duas notas independentes, diálogo e responsividade exercitados. Defeito concreto em 360x844: CTA Concluir série parcialmente encoberto pela barra fixa; clique inferior acionou Congelar relógio, sem concluir série. Detalhes em STATUS-FRONTEND-FITNESS.md; artefatos em `/tmp/conselho-v02-20261009/`. Dados corporais reais e histórico inter-mês permanecem pendentes; nenhum dado médico inventado foi salvo.

I02 autorizado: correção local e teste do encobrimento. Executor `/root/fix_v02`, checkout principal, modelo Sol/médio (aviso ao usuário: ferramenta menor adequada após tarefa browser de múltiplas etapas). Reserva exclusiva de código: `src/pages/fitness/ActiveWorkout.tsx`. Documentos, manifests e changelog reservados ao coordenador/versionamento. Evidências novas em `/tmp/conselho-i02-20261009/`. Aceite exige clique real em 360px acionar Concluir série, ausência de sobreposição funcional em 390px e fluxo preservado em 768/1440 sem erros/overflow. Em execução; não iniciar outro lote Fitness até conclusão.

## I02 — encerramento técnico em revisão, 09/10/2026

Executor `/root/fix_v02`, Sol/médio, corrigiu `src/pages/fitness/ActiveWorkout.tsx`: `mt-10` tornou-se `mt-4 min-[375px]:mt-10`. A redução de margem limita-se a larguras abaixo de 375px. Encobrimento de Concluir série pela barra fixa reproduzido antes em 360px; responsável documental não alterou produto.

Reteste informado pelo executor/coordenador: clique real, continuar sessão, reload, finalizar e histórico passaram em 360/390/768/1440px, sem overflow horizontal ou pageerrors. Artefatos em `/tmp/conselho-i02-20261009/` (verify.json, verify-390.json, scripts e capturas). Cobertura: um exercício/uma série; títulos arbitrários, múltiplas séries, todos os exercícios e fidelidade integral não certificados. V02 permanece parcial: avaliações corporais com medidas reais e histórico entre meses pendentes; notas de sessão não substituem avaliações corporais.

Custódia `/root/versionamento_documentacao`: versão 0.1.13 → 0.1.14 sincronizada em package.json, nas duas posições raiz do package-lock.json e CHANGELOG. Dependências preservadas. Lint global/build em andamento pelo coordenador no momento deste registro, sem resultado incorporado. I02 em revisão, aguardando consolidação e aceite de Astro Boy. Chat principal permanece Luna leve; I02 delegado a Sol médio.

Próxima ação: coordenador incorporar lint/build, revisar diff e decidir aceite antes de escolher próximo lote. Não ampliar correção para cenários não testados. Reservas documentais/manifests devolvidas ao coordenador após esta custódia. Sem commit/push/merge/publicação. Evidências em /tmp são temporárias.

## Aceite I02 — 09/10/2026

Astro Boy revisou patch, evidências de clique real e resultados de quatro viewports; aceite delimitado concedido. `npm run build` passou. `npm run lint` passou com 0 erros e os mesmos 4 avisos reportados anteriormente em Ciclos e temporal. `git diff --check` passou. Versão 0.1.14 sincronizada; I02 encerrada. Limites permanecem: cenário pontual de um exercício/série, V02 parcial em avaliações corporais e histórico entre meses. Próximo lote: D01 auditoria estática dos contratos core; sem editar regras/dados.

## Despacho D01 — 09/10/2026

Auditoria estática do core, responsável `/root/auditoria_core_d01`, modelo Sol (`gpt-6.1-sol`), raciocínio médio. Escolha comunicada pelo cruzamento de hierarquia, fórmulas e reversões em vários módulos. Reserva exclusiva: criar `docs/AUDITORIA-CONTRATOS-CORE.md` e artefatos em `/tmp/conselho-d01-20261009/`. Leitura apenas para todo o produto e documentos existentes; sem mudanças de regras/dados. Aceite: rastreabilidade de contratos/implementação, divergências documentais explícitas e cenários de teste propostos sem declarar resultados executados.

## Aceite D01 e despacho D02 — 09/10/2026

D01 aceita como relatório estático pelo coordenador. Matriz de 14 contratos, quatro conflitos canônicos e cenários propostos; 0 alterações em 330 arquivos preexistentes, `git diff --check` do relatório passou. Não se aceitam conclusões funcionais: nenhum teste de app foi executado. Documentos permanecem contraditórios em histórico/desfazer, fórmula de presença, pausa da rotação e decimais. D02 (Astrolábio) iniciado em leitura estática, executor `/root/auditoria_astrolabio`, Luna (`gpt-6-luna`), raciocínio baixo; escopo bem delimitado. Reserva apenas novo docs/AUDITORIA-ASTROLABIO.md e `/tmp/conselho-d02-20261009/`.

## Aceite D02 e despacho D03 — 09/10/2026

D02 aceita como inspeção estática. `AUDITORIA-ASTROLABIO.md` distingue série simulada a cada render de métricas agregadas; script isolado controlado demonstrou vetores diferentes. Sem teste do browser. Decisão sobre o significado futuro do gráfico permanece produto/coordenação.

D03: inventário delimitado de assistente/LLM, executor `/root/auditoria_assistente_d03`, Luna/baixo. Reserva apenas novo `docs/AUDITORIA-ASSISTENTE.md` e `/tmp/conselho-d03-20261009/`. Não revelar secrets nem alterar código. Critério: localizar evidência, listar pré-requisitos sem escolher provider nem construir integração.

## Aceite D03 e resultado D04 — 09/10/2026

D03 aceita como inventário estático em `docs/AUDITORIA-ASSISTENTE.md`; não localizou assistente conversacional em src/functions dentro do escopo buscado, sem afirmar ausência global. Invocar/Forja são fluxos locais. Edge Functions locais de calendário não têm deploy comprovado. Nenhum secret foi lido.

D04 concluída em pesquisa oficial e registrada em `docs/DECISAO-PROVEDOR-IA.md`. Recomendação provisória para piloto gratuito limitado: Cloudflare Workers AI via Supabase Edge Function, com auth/tokens fechados; Gemini unpaid excluído para conteúdo pessoal por termos de uso de dados. Azure permanece alternativa paga com controles documentados. Nenhum provedor conectado ou segredo criado. Próxima etapa I03 é protótipo, instruções de segurança Supabase obrigatórias; modelo proposto Sol médio por integração UI/backend/auth. Avisar usuário antes do despacho; não assumir credenciais ou publicar.

## I03 — protótipo de sugestão de rascunho com IA, 09/10/2026

Autorizado por solicitação do usuário de incluir agente no app. Executor `/root/implementa_assistente_i03`, modelo Sol (`gpt-6.1-sol`), raciocínio médio. Escrita exclusiva: `src/pages/Invocar.tsx`, novo `supabase/functions/assistant-suggest/index.ts` e testes isolados apenas se necessários sem dependências. Skill Supabase instalada foi lida; consulta aos docs atuais de Edge Functions/Cloudflare realizada. Escopo: consentimento explícito, mensagem de texto mínima, JWT, proposta de rascunho, confirmação humana e gravação via addDraft existente. Sem acesso ao restante do perfil, voz, histórico persistente, deploy, secrets ou alterações remotas. Chave CF ausente pode deixar chamada real não verificada; documentar honestamente. Agente não altera documentação/manifests; coordenador faz revisão após retorno.

Retomada em 09/10: executor atingiu limite de uso antes de implementar. Verificação do checkout principal confirmou nenhuma edição em `Invocar.tsx` e nenhum arquivo `assistant-suggest`; o trabalho permanece incompleto. Reservas liberadas. Requer retomada pelo coordenador em Sol/médio, após troca explícita do modelo principal, ou por executor Sol/médio disponível. Não houve teste, bump de versão, segredo, deployment ou chamada real.

## Retomada e validação I03 — 09/10/2026

Usuário confirmou GPT-6.1 Sol médio no chat principal. Astro Boy retomou a implementação após limite do executor anterior. Código reservado/alterado: Invocar.tsx e assistant-suggest/index.ts/index_test.ts; nenhuma alteração de store/auth/backend existente. Guia em ASSISTENTE-PROTOTIPO.md. Sete testes Deno passaram com mocks sem rede. Browser com módulos Auth/provedor simulados, UI/store reais e perfil temporário: criação manual, consentimento, proposta editável sem salvar, falhas 401/429/503/502, resposta incompleta, sessão ausente, confirmação e reload passaram; quatro larguras sem overflow/pageerrors. Automação ajustada para selecionar botão visível e rolar ao centro antes do clique diante da navegação fixa; não certifica hit targets sem rolagem ou acessibilidade integral. Build passou, lint 0 erros/4 avisos preexistentes.

Custódia em execução por /root/versionamento_i03, Luna/baixo, escolha avisada ao usuário: apenas manifests/changelog/índice/manual/dossiê. Fila/continuidade continuam exclusivas de Astro Boy. Próximo: consolidar versão e aceitar protótipo local, mantendo ativação real pendente de conta, token server-side, quota e escopo remoto. Sem live call, secrets, commit/push/deploy.

## Aceite I03 — 09/10/2026

Astro Boy revisou código, evidências e custódia e aceitou o protótipo local no escopo acima. Versão 0.1.15 coerente nas três posições raiz; changelog/índice/manual/dossiê atualizados por /root/versionamento_i03, Luna/baixo. Deno 7/7, build aprovado, lint 0 erros/4 avisos, diff-check aprovado. Reservas liberadas. Sem chamada live ou publicação. Próxima etapa I04 depende de conta, credencial server-side, quota e escopo de deployment; preparação pode usar Luna baixo e integração/teste real Sol médio.


## UI01 — Saúde e integração visual Fitness, 09/10/2026

Solicitação atual do usuário: concluir abas Treino/Saúde conforme nove imagens em Pictures/PRINT/Fitness-app, com navegação, criação e conclusão funcionais. Primeiro lote prioriza o boneco corporal e a página Corpo legada. Astro Boy executa sequencialmente no checkout principal; reserva componentes fitness-kit/BodySilhouette, BodyMetricsCard, FitnessBottomNav e src/pages/Corpo.tsx, documentos de status/fila/continuidade e manifests/changelog ao encerrar. Stores, serviços e regras fora do escopo. Backup externo: /Users/fabioandre/Developer/conselheiro-backups/fitness-kit-20261009/before.tar.gz.

Plano visual: canvas #101011, superfície #252B3A, violeta #8582F2, texto #F5F5F7 e cinza #9A9AA4; sans existente, silhueta neutra proporcional e medidas reais em grade; navegação única do kit. Referências explícitas prevalecem sobre estética genérica. Critérios: acesso Corpo/Insights, registro e exclusão de avaliação preservados, todos os campos disponíveis, estados vazios honestos, 360/390/768/1440 sem overflow; build/lint e fluxo de treino reutilizável. Estado: em execução.

UI01: reserva ampliada para BodyMeasurementDialog.tsx após falha de foco ao fechar reproduzida pelo navegador; manter API e comportamento de cadastro. Sem alteração de domínio.


## Encerramento UI01 — 0.1.16

Primeiro lote de Saúde aceito no escopo delimitado: componentes integrados, falha de foco corrigida e evidências em fitness-kit-20261009. Build/lint/diff-check passaram; treino crítico e navegação testados em perfil temporário, medidas não inseridas. Reservas liberadas. Pendências e próximos arquivos em STATUS-FRONTEND-FITNESS. UI02 (seleção/prévia e UI de criação/edição preservando séries) é próximo; implantação do agente/Cloudflare permanece fora do foco. Não há conclusão integral do kit.


## UI02-A — escolher treino, prioridade corrigida pelo usuário

09/10/2026: usuário confirmou GPT-6.1 Sol médio e pediu finalizar /treinos primeiro. Somente depois avançar a preview/edição. Mobile primeiro; tablet adaptado e PC com interface de tablet, sem esforço de otimização desktop. Referência 21.26.22. Modalidades vêm do catálogo real (Yoga/Calistenia neste estado); não inventar seis categorias para preencher a imagem. Escrita sequencial Astro Boy: WorkoutSelect, WorkoutCategoryCard e variante opcional focused de FitnessPageShell; documentos/manifests no encerramento. Shell padrão dos outros módulos preservado. Backup em conselheiro-backups/fitness-select-20261009. Estado: em execução.

Plano: canvas #101011 sólido nesta seleção, cards #252B3A com raios arredondados, proporções alternadas e contorno #8582F2; sans e rótulos portugueses; navegação global por botão compacto no header, CTA pill, ações extras abaixo. Critérios: seleção/deseleção real, catálogo/detalhes/criar/preview, retomar sessão; 360/390 e tablet 768/1024; PC somente conferir largura limitada.


## Aceite UI02-A — 0.1.17

Escolher treino entregue no escopo do catálogo real; validações de seleção/catálogo/filtros/navegação e fluxo de treino passaram. Mobile 360/390 e tablet 768/1024; PC 1440 limitado a 576px. Build aprovado, lint 0 erros/4 avisos, diff-check. Documentação e versões sincronizadas; reservas liberadas. Revisão visual do usuário pode ajustar este lote antes de avançar. Nenhuma troca de modelo: Sol 6.1 médio confirmado.


## UI02-B — seis modalidades e ícones exatos da referência

Solicitação explícita do usuário substitui limite anterior de duas categorias: copiar os ícones da captura 21.26.22, trocar Calistenia por Core Training e adicionar os outros cards com nomes em português. Astro Boy/Sol 6.1 médio; reservas: WorkoutSelect, WorkoutCategoryCard, novo WorkoutReferenceIcons, asset de referência, types/workout.ts e lib/workout/workout-labels.ts para quatro categorias adicionais, sem alterar stores/fórmulas. Preservar catálogo e categorias anteriores; não inventar exercícios, GPS ou sensores. Estado: concluído como UI02-B / 0.1.18. Reserva adicional: WorkoutHub.tsx (mapa exaustivo exigido pela compilação) e manifests/changelog/continuidade/status/roteiro para fechamento. Backup/evidências: fitness-icons-20261009. Build passou; lint 0 erros/4 avisos preexistentes; seis cards e navegação/catalogo/filtros em 360/390/768; quatro categorias corretas no formulário; fluxo Yoga completo com retomada e persistência em 390. Revisão visual dos seis recortes em selected-390.png. Sem edição de stores, commit/push/deploy. Próximo: revisão da seleção; restantes do kit ainda pendentes.

## UI03 — reformulação do formulário Criar treino

Solicitação atual: melhorar toda UI/UX do formulário da captura 23.28.14. Astro Boy, Sol médio; execução sequencial. Reserva: CreateWorkoutDialog.tsx e CSS local novo; manifests/changelog/status/continuidade no fechamento. Preservar handlers, store, categorias, séries, ordem, data, catálogo e presets. Diagnóstico: Cinzel/uppercase destoante, controle de categoria desigual, ação final fraca e lista pouco informativa. Plano: Inter, base #101011, superfície #252b3a, campo #191d27, texto #f4f4f6, secundário #b5b8c3 e violeta #8582f2. Título alinhado à esquerda; formulário móvel com header/footer estáveis e um corpo rolável. Dados → escolhidos/configurações → catálogo. Revisão do plano: conservar ícones pedidos na seleção; não acrescentar ornamentos de magia ao formulário nem um fluxo de passos que exija cliques extras. Critérios: seleção/remoção, busca/filtros, configuração, agendamento, criação e retomada reais; 360/390/768px, teclado e overflow. Estado: em execução. Backup externo fitness-create-20261009.


UI03: entregue como 0.1.19. Evidências fitness-create-20261009; leitura canônica do módulo/adapter e frontend-design aplicada. Novo CSS escopado evita alterações nos diálogos externos. Seleção/catálogo/ajustes/Escape em 360/390/768 passaram; fluxo completo de um exercício/série em 390 passou; data e duas séries persistidas e foco de retorno conferidos. Reservas liberadas após verificações finais; sem publicação. Próxima etapa: revisão visual antes de preview/edição.

Verificações finais UI03: build 0.1.19 passou; lint 0 erros/4 avisos preexistentes; git diff --check passou. Versões package.json e duas posições de package-lock.json sincronizadas em 0.1.19.

## M01 — contexto das modalidades, execução e métricas

Usuário autoriza base específica dos esportes, ficha técnica/preview/ativo coerentes e cálculo por registro real. Astro Boy/Sol médio, sequencial. Reservados: types/workout, workoutStore, novo catálogo nativo e helper de carga; CreateWorkoutDialog, ExerciseDetailSheet e CSS local; WorkoutPreview/ActiveWorkout/WorkoutSummary; ExerciseSetRow, ExerciseCard, FitnessStickyAction, WorkoutSummaryView; adapters; docs/manifests. Histórico e fórmulas legadas não serão recalculados. Nova carga de atividade = minutos ativos declarados × esforço percebido (1–10); não representa kg/calorias ou medição muscular. Distribuição é estimativa editorial do tipo de atividade, proporcional somente aos blocos concluídos. Registro livre não é convertido automaticamente em biomecânica. Fonte do catálogo: modalidades presentes em programas oficiais brasileiros (sem afirmar ranking de popularidade). UI segue Inter/dark/violeta e casca focused com largura tablet; ações sem sobreposição. Etapas: catálogo/contexto → execução/ficha → cálculo/histórico/testes. Backup fitness-modalities-20261010. Estado: em execução.

Reserva M01 ampliada: HealthInsights/HealthDashboard, correção de unidade do gráfico legado (índice não equivale a kg). Novos registros com tempo ativo/esforço, inclusive Yoga/Calistenia, usam carga percebida na base de recompensa; registros sem essas observações mantêm volume/fórmula legados. Nenhum histórico recalculado. Física permanece Terra conforme contrato existente; Fogo/Água/Ar explicitados como zero neste módulo, sem fabricar associação pelo esporte.

M01: diferença reproduzida em captura ativa (10 min planejados exibiam estimativa de 5 min): estimateWorkoutDurationMinutes usava 45s fixos para todo bloco. Reserva adicional workout-format.ts: agora considera targetDurationSeconds quando informado e descanso, mantendo fallback anterior para repetições sem tempo. Plano antigo persistido não é reescrito. Preview nativo mostra Registro manual em vez de dificuldade inferida.


## Aceite M01 — 0.1.20

Build/lint/diff-check passaram; lint mantém quatro avisos anteriores. UI/fluxo Taekwondo em360/390/768, Saúde consumindo observações, RPE/persistência/idempotência, perfil100%, distância digitada com ponto e vírgula, proteção de blocos pulados e regressão Yoga verificadas. Fontes/scripts/capturas e limites em MODALIDADES-E-METRICAS-TREINO.md. Corrigido defeito decimal reproduzido e estimativa planejada fixa. Nenhum histórico, dados reais ou motor core reescrito; não houve publicação/commit. Reservas liberadas. Próxima etapa: revisão do usuário; edição de planos e expansão da taxonomia elemental mantidas como lotes próprios, sem afirmar medição muscular exata. Modelo Sol médio mantido.


## P01 — publicação e entrada de Matheus, 10/10/2026

Autorização expressa de Fábio: revisar todas as pastas, otimizar sem perder conteúdo e publicar no GitHub Matheuscroft/ConselhoElemental-main. Astro Boy/Sol médio, execução sequencial; reservas: regras raiz/app, ignores, scripts Astro, skills portáveis, documentação operacional e manifests. Base 03f0588, origin/main idêntico após fetch; alterações dos lotes anteriores preservadas. Identificação por perfil local explícito, nunca IP. Não transportar configurações pessoais, tokens ou sessões do executor. Critérios: onboarding Matheus/Fábio, apresentação inicial com estado real, perfil ignorado, docs/skills disponíveis em clone limpo, build/lint, revisão do conteúdo publicado e push sem force. Estado: em execução.

## Aceite técnico P01 — 0.1.21

Implementação portável e auditoria aceitas no escopo: oito skills com auxiliares existentes, regras raiz e CLI local sem IP, documentação atual e publicação preparada. Testes de perfil/apresentação/idempotência/troca/entrada inválida passaram; cópia limpa do índice com instalação (scripts desativados), build e testes passou, documentos/regras/oito skills conferidos. Build local/lint/diff-check e Deno 7/7 com mocks passaram. Sem revalidação visual ou integração remota nova. Pacotes dev não usados removidos; 25 achados npm audit registrados sem fix forçado. Helper e exemplos webapp-testing presentes, --help/sintaxe verificados; Puppeteer preservado. Reservas liberadas após fechar documentação; commit 4f180f9 publicado por push sem force em main, confirmado pelo GitHub. P01 aceita e encerrada; o fechamento documental acompanha a publicação. Próximo lote backend sugerido: contrato/teste de reversão/idempotência, sem migrar dados.

## F02 — Fitness paralelo, fase 1

Escopo: nova raiz Fitness, navegação via Pilares/Terra, entrada do legado no Mais, três abas, planejamento canônico na primeira aba. Executor sequencial. Arquivos: App/rotas, Pilares/AreaCard, Mapa/menu global, FitnessRoot/NativeTemplateDialog, contexto embutido do kit e WorkoutHistory (somente destino condicionado), workoutStore (identidade do catálogo). Alterações anteriores preservadas. Biblioteca local sem Core; execução inicia sessão nativa e não implementa registro nesta fase. Histórico/Corpo existentes reutilizados. Pendências: revisão visual do usuário; UI de execução nativa e Adapter em lotes posteriores. Build global bloqueado pelos contratos preexistentes; detalhes em CONTINUIDADE. Sem publicação.

## F03 — execução nativa e Adapter (em execução)

Reserva sequencial: ActiveFitnessSession, FitnessRoot, App/rotas, FitnessPageShell, workoutStore, appStore, tipos de Action/ExecutionLog/User, novo serviço Core de conclusão e Adapter, histórico nativo, continuidade. UI legada preservada. Divergência encontrada: completeTask legado não escreve ExecutionLog/Prana e usa fórmula de tempo anterior; novo despacho Core explícito deve seguir capítulo canônico sem reescrever recompensas históricas. source_ref_id da Action executada aponta para sessão; templateId permanece no histórico nativo. Não publicar.

F03 implementada no código: execução fullscreen, histórico nativo, Adapter e despacho único Core com ledger/XP/Prana e isolamento por conta. ESLint passou; compilação global permanece bloqueada por contratos anteriores. Sem testes funcionais/navegador neste lote. Limites/decisões em CONTINUIDADE; reservas liberadas, sem publicação.

## F04 — feedback de XP Terra (em execução)

Reserva sequencial: Core native-action-completion (extração da fórmula existente), native-reward-preview, workoutStore (previewTemplateReward), FitnessRoot (templates/histórico), ActiveFitnessSession (extrato de conclusão), NativeTemplateDialog (duração opcional) e continuidade. Fonte: Motor de Pontuação e Energia. Nenhuma fórmula/recompensa antiga será alterada. Preview deve usar mesmo esforço/presença/tempo/teto do despacho Core. Extratos usam ExecutionLog real; ER passa a informação secundária. Sem publicação.

F04 implementada: preview Core compartilhado, duração estimada opcional, badge verde nos templates, XP do ledger no histórico e modal de recompensa antes de Ver Histórico. ESLint seis arquivos passou. Sem testes funcionais/navegador/publicação; continuidade atualizada e reservas liberadas.

## F05 — esforço global e duração automática (em execução)

Reserva sequencial: tipos workout, utilitário de duração, cálculo Core/preview nativo, Adapter, stores workout/app (passagem do esforço), NativeTemplateDialog, badge FitnessRoot, docs canônicas/continuidade. Verificado: ER/multiplicadores/tetos já normativos; autoestimador 4s/rep+descansos+transições e default3 de formulário ausentes. Preview atual já aplicava tempo/presença, mas esforço1 fixo e ausência de estimativa limitavam recompensa. Natureza heurística de planejamento deve ser explícita; tempo real e presença por faixa permanecem canônicos na conclusão. Histórico não recalculado e páginas legadas preservadas. Sem publicação.

F05 implementada: duração automática com override, seletor global padrão3 nos novos planos, snapshot do esforço e Core aplicando tabelas de XP/cap/Prana, preview1.5 de presença explicitado. Motor seções5.4/5.5 e contrato Native Modules atualizados. ESLint onze arquivos/diff-check passaram; tsc global bloqueado por erros preexistentes, sem novos erros filtrados dos arquivos nativos. Sem testes funcionais/navegador/publicação; reservas liberadas.

## F06 — balance patch ER 0.10 (em execução)

Autorização atual do usuário: conversão 1ER=0.10, atualização dos exemplos e seletor fator0.8/1/1.5 no planejamento/execução. Reserva sequencial: Motor/Native Modules, workout-balance, workout-equivalents, native-reward-preview, workoutStore, NativeTemplateDialog, ActiveFitnessSession, docs continuidade/fila. Prévio .03 é histórico; nenhuma recompensa já emitida será recalculada. Core aplica mesmos multiplicadores/caps sobre novo baseValue. Sem publicação.

F06 implementada: constante compartilhada0.10, nova conversão em preview/conclusão/helpers ER, seletor fator de carga em planejamento e execução, exemplos/docs canônicos atualizados. ESLint sete arquivos/diff-check passaram; sem testes funcionais/navegador/publicação. Histórico preservado, reservas liberadas.

F12 — ativação semanal Fitness implementada: modal de dias, Adapter via addHabit e indicador por template. Core mantém fonte/valores na Action e projeção Habit. Sem publicação, commit ou migração; reservas encerradas. Revisão funcional de Ciclos pendente.

F13 — rich widget Fitness integrado em hábitos/rotacões da tela Ciclos. Preview Core e despacho HABIT único, sem subtarefas/duplicação de recompensa. Revisão funcional pendente; sem commit/push.

F14 — sequências Fitness em execução: reserva sequencial de formulário/biblioteca, modal compartilhado, Adapter, stores/types e documentação. Criação local >=2 treinos; ativação Core atômica com membros próprios e origem da sequência. Sem publicação.

F14 implementado: criação/ordenação local >=2, modal compartilhado, Adapter e operação atômica Core. ESLint sete arquivos passou; validação visual/funcional pendente. Reservas liberadas; sem publicação/commit/push.

F17 — card original de rotação com membro Fitness embedded e dispatcher fullscreen vinculado ao hábito; fila sem XP futuro e administração no módulo. Reservas sequenciais encerradas, validação visual pendente.

F18 — reserva sequencial: supabaseCloudSync/authStore e documentação. Investigar perda de membros comuns/Fitness; preservar alterações F14–F17 e dados existentes.

F18 implementado — supabaseCloudSync/authStore: preservação de membros internos e gravações sem limpeza antecipada; refresh protegido. ESLint passou. Reservas encerradas. Pendentes: validar persistência real e conferir backup para membros previamente perdidos; sem migração remota/commit/push.

F19 — compatibilidade position e exclusão não destrutiva de sequência implementadas. Reservas service/appStore/migration encerradas; aplicação remota e validação funcional pendentes.

F20 — sequência compartilhada implementada, reservas types/stores/adapter/library/Ciclos/docs encerradas. Planejamento cloud sem ocorrências, ativação por UUID, reativação idempotente e importação legado. Validar funcionalmente em navegador; templates/sessões ainda sem sync cloud.

F21 — FitnessHabitWidget ajustado visualmente, exercícios recolhíveis e séries concluídas compactas/editáveis. Reserva encerrada; validação visual pendente.

F22 — reserva stores/types/Adapter/Core completion/widget/history/docs para registro CHECKIN versus LIVE, conclusão integral/parcial/automática. Implementado; validação estática final em andamento, funcional pendente.

F22 concluído localmente — TypeScript completo e ESLint aprovados; reservas encerradas, validação funcional pendente.

F23 — badges acumulados treino/exercício e helper compartilhado implementados. Reservas liberadas, TypeScript/ESLint aprovados; validação visual pendente.

F24 — FitnessHabitWidget badge único planejado/progresso/real e estados meta/parcial. Reserva encerrada; TypeScript/ESLint aprovados, visual pendente.

F25 — desfazer sessão/ciclo preservando séries implementado; reserva stores/widget/types/Adapter/docs, validação estática final e visual pendente.

F25 — TypeScript/ESLint aprovados; reservas liberadas, funcional pendente.

F26 — recolhimento após última série implementado em FitnessHabitWidget; reserva encerrada, sem testes executados.

F27 — feedback XP flutuante e centralização do card implementados; reserva widget encerrada, TypeScript/ESLint aprovados.

F28 — overlay global e balão menor implementados; reserva encerrada, visual pendente.

F29 — recolhimento de exercício completo implementado; reserva encerrada, visual pendente.

F30 — checkbox agregador de exercício implementado; reserva encerrada, TypeScript/ESLint aprovados, visual pendente.

F31 — encerramento parcial do exercício implementado; reserva encerrada, ESLint aprovado, funcional pendente.

F32 — visual parcial por exercício implementado; reserva encerrada, ESLint aprovado.

F33 — checkbox não expande exercício ao desmarcar; reserva encerrada.

F34 — feedback parcial imediato por exercício implementado; reserva encerrada.

F35 — badge/séries empilhados no exercício, reserva encerrada.

F36 — separação visual CHECKIN/LIVE reforçada, reserva widget encerrada; lint final em andamento.

F37 — fila de treinos compacta com setas implementada; reserva Ciclos encerrada.

F38 — ampliação catálogo Calistenia implementada, reservas constants/workoutStore/docs encerradas. ESLint aprovado, TypeScript filtrado sem erros nos arquivos alterados; funcional pendente.

F39 — tags musculares e filtros catálogo implementados, reserva constants/types/store/components/FitnessRoot/docs; validação estática final em andamento, visual pendente.

F39 — reservas liberadas; ESLint aprovado, TypeScript filtrado sem erros nos arquivos alterados, funcional pendente.

F40 — tags/emoji corrigidos, reserva constants/catalog/store encerrada, lint final em andamento.

F41 — emoji predominante treino implementado, reserva helper/Root/widget encerrada; ESLint aprovado.

F42 — emojis internos implementados, reserva helper/Root/widget encerrada; lint final em andamento.

F43 — filtros compactos emoji no modal implementados, reservas constants/modal/catalog encerradas; ESLint aprovado.

F44 — emojis na lista catálogo modal implementados, reserva encerrada.

F45 — estilo de sequência compartilhado Treinos/Ciclos implementado, reserva componente/library/Ciclos encerrada, visual pendente.

F46 — card compacto/setas e link para sequência em Treinos implementados, reservas card/library/Ciclos encerradas, visual pendente.

F47 — edição sequências e reconciliação Core implementadas, reservas modal/library/helper/Adapter/stores/docs encerradas; ESLint aprovado, validação funcional pendente.

F48 — pular fila circular implementado, reservas Core/types/temporal/Ciclos/docs encerradas; lint aprovado, validação funcional pendente.

F49 — navegação reordenada, reserva encerrada; publicação F45–F49 autorizada pelo usuário.

AUD-PULL13 — inventário73arquivos e diff integral entregues, políticas domínio reforçadas e acesso dedicado por modalidade restaurado localmente. Matemática block-v2 aguarda crivo do proprietário e segue ativa no código importado; não aprovada por anotação documental. Reservas docs/AGENTS/FitnessRoot encerradas, visual pendente.

BACK-MAT13 — restauração da matemática autorizada concluída localmente; ER×0.10/sessão/teto único e regra b1575e4. Reservas Core/Adapter/store/previews/widget/docs/welcome encerradas. TypeScript app/ESLint aprovados; debater RPE, pausas, snapshots importados e dashboards antes de mudar domínio.

BACK-MAT14 — pausas explícitas descontadas em LIVE, descansos incluídos; sessão nativa vazia sem registro/Prana. Limpeza opcional no Histórico: XP real0, <60s, nenhuma série realizada, recibo obrigatório e reversão de Prana. Sem acesso aos dados do navegador para executar limpeza real; histórico legado preservado. TypeScript/ESLint aprovados, sem testes funcionais. Pendente: discutir Prana ponderado, preservando custo global até aprovação.
