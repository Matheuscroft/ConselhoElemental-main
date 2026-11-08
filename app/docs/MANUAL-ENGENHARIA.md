## Entrada144

[Introdução e acesso mobile](plans/MOBILE-M10-INTRODUCAO-E-ACESSO.md): apresentação read-only, aliases de conta isolada, recuperação consistente e onboarding com comandos existentes. Guards de progresso precedem primeiro acesso. Dados e XP não mudam por visitar/login; conexão explícita preservada.

## Atualização143 — fluxo de entrega e classificação

Rituais agora alinham elemento com área primária ao criar/editar; recibos existentes preservados. Cronômetro é apresentação sobre runtimeM07. Build de produção passa por verify:release (testes+lint) e tipos/build; Git main do repositório Matheus é o destino vigente, Vercel conselho-elemental-main. Configuração/histórico e limites em [M08–M09](plans/MOBILE-M08-M09-RITUAIS-E-PUBLICACAO.md). A mudança de domínio exige transferência explícita do progresso; não limpar storage.

## M07 — operação mobile, 0.1.142

[Fluxo, aceite e limitações](plans/MOBILE-M07-CRONOMETRO-E-ATUALIZACOES.md). Deploys verificados vão para o mesmo Vercel de testes, sem limpar progresso. Metadados de versão e aviso permitem atualização explícita. Timer por âncora/pausa com recuperação na mesma aba; não é execução nativa com app fechado nem timer sincronizado entre aparelhos. Registro operacional não faz parte do arquivo de progresso. Compatibilidade hospedada142 mantém dados/gate. Não confundir Chromium com teste físico; preservar revisão/recibos e pedir aceite de bloqueio no iPhone.

## F6-N12 — pontuação visual, 0.1.141

[Diagnóstico e limites](plans/FECHAMENTO-F6-N12-PAINEL-EVOLUCAO.md). Painel aceita VALUABLE/valuable como o core existente; sem alterar pontuação ou stores. Banco aceita arquivos141 mantendo gate/versões/dados anteriores. Não confundir ensaio de saldo XP/Grimório com validação de ScoreHierarchyPanel; testar o componente indicado pelo usuário.

## Atualização F6-N10 — 0.1.140

[Conta conectada: contratos, publicação, evidências e limites](plans/FECHAMENTO-F6-N10-CONTA-CONECTADA.md). Build Vercel usa Config pública de build, Auth/bootstrap legados permanecem false; cliente integral e gate remoto true. Compatibilidade hospedada140. SMTP e aceite real de conta/associação continuam pendentes. Preservar revisões/CAS/recibos e nunca reenviar tentativa incerta ou limpar o progresso para habilitar login.

## Importação e quota — F6-N09 / 0.1.139

[Contrato e evidências](plans/FECHAMENTO-F6-N09-QUOTA-IMPORTACAO.md). Ao medir quota, contabilize UTF16 de todas as chaves/valores mais before/target no journal e as stores durante a gravação. `restore-journal-codec` compacta só o artefato, com limite de expansão e legado. Não usar JSON.parse direto no payload: valide pelo journal, ou decoder nos testes. Retomada pendente exige coordenador exclusivo e revisão exata; nunca remover o journal/limpar dados para liberar. Testes: `node --test tests/backup/restore-quota.test.mjs tests/backup/restore-journal-codec.test.mjs tests/backup/document-lifecycle.test.mjs tests/backup/recovery-review.test.mjs`. Público139 testado em Chromium com limite5MiB simulado; aceite físicoiPhone pendente. Não confundir importação local com sync online.

## Compatibilidade135 instalada — F6-N03

[Instalação e próximos critérios](plans/FECHAMENTO-F6-N03-COMPATIBILIDADE-INSTALADA.md). Migração real20261107042615, conteúdo idêntico ao candidato135 aprovado. Não reaplicar candidato anterior ou intermediários arquivados. Validador aceita120/135 em ensaio puro real; gatefalse e proteções preservados. Próxima etapa Auth requer login no painel para conferir URLs, sem credenciais no chat. Nenhuma conta/progresso pessoal transferido; app135local e Vercel134 continuam separados.

## Compatibilidade hospedada — F6-N02 / 135 preparada

[Pacote e retomada](plans/FECHAMENTO-F6-N02-COMPATIBILIDADE-HOSPEDADA.md). Banco122/gatefalse reconfirmados; preflight real somente leitura passou. Patch135 agora consolidado122→135; intermediários123–134 preservados em review-candidates e usados só no ensaio sequencial. Não usar db push geral nem aplicar arquivos arquivados. Aguardar autorização específica; app135local e Vercel134 preservados, contas não liberadas. Após apply, conferir ID real da migração antes de alinhar filename/loader. Nenhuma conta ou progresso pessoal foi transferido.

## Conta nova — F6-N01 / 0.1.135 local

[Início vazio e preservação do progresso existente](plans/FECHAMENTO-F6-N01-CONTA-NOVA.md). Defaults de personagem/onboarding compartilhados; snapshot vazio inicializa somente quando local e remoto estão vazios e usa journal/intent/CAS/recibo existentes. Falhas retomam pelos mesmos workspaces. 690 testes e checks passaram; conta ainda false. SQL remoto não validado por timeout do conector/CLI sem login; candidato135 local, Vercel134 mantido. Próximo: acesso hospedado e pacote/aceite de liberação em Sol Alto. Não iniciar do zero ao associar o progresso pessoal.

## Ambiente de testes permanente e transferência guiada — P04

Fábio autorizou publicar atualizações verificadas no projeto conselho-elemental-testes / fr-prodiction. Usar sempre https://conselho-elemental-testes.vercel.app para conservar a origem. Não publicar fixtures no lugar do app, limpar storage ou incluir backup pessoal no build. Conta/sync ficam para etapa posterior; GitHub/banco/projetos antigos exigem seu escopo. [Decisão e manual curto](plans/TRANSFERENCIA-GUIADA-P04-0.1.132.md).

Download de cópia anterior durante uma comparação retém o preview somente enquanto o baseline continua igual; falhas e concorrência o invalidam. Não retirar verifyPreviousSafetyCopy, consentimentos, locks, journal ou readback para simplificar apresentação.

## Biblioteca direta de Treinos — T06 / 0.1.130

SavedWorkoutLibrary recebe templates/catálogo existentes e callbacks; não lê ou escreve storage nem inicia sessão. onOpen mantém o ID existente para a prévia; onExplore move foco ao título das modalidades e respeita movimento reduzido. Ordenar cópia, nunca o array do store. Busca/paginação não precisam de persistência. [Plano e retomada](plans/EVOLUCAO-T06-BIBLIOTECA-0.1.130.md). Compatibilidade 130 somente local; gates preservados.

## XP/elementos — T05 / 0.1.129

Usar ElementalXpBadge com valor já formatado pelo chamador, elemento e tamanho; não calcular/conceder XP no componente. ExperienceIcon e ColoredElementIcon usam IDs próprios via useId; testes de painéis devem distinguir IDs de gradientes de aria-controls, mantendo unicidade global. ElementIcon usa cor por padrão e tone=outline para compatibilidade. Rodapé/main e estimativa/recibo mantêm funções separadas. [Recebimento e evidências](plans/XP-ELEMENTOS-PUBLICACAO-0.1.129.md). Main e branch de integração com auto-deploy desativado; futura release requer escopo explícito. Candidatos 128/129 locais, gates false.

Ícones de treino/exercício: usar getWorkoutPresentation/getExercisePresentation, priorizando modalidade salva em esportes. Foco muscular só em força/hipertrofia/calistenia. Não inferir categoria pelo título nem modificar dados para corrigir representação.

## Superfícies auxiliares — T04 / 0.1.128

Portais ficam fora da casca Fitness: seus estilos devem usar --el-* na própria classe de conteúdo. ExerciseDetailSheet compartilha a composição entre variantes e preserva o callback/objeto; não duplicar outro tema. Conteúdo rola e CTA fica no rodapé próprio. Campos numéricos e texto usam 16px; excluir checkbox/radio das regras de altura de campos. .fitness-dialog é escopo de portal e SheetContent aceita closeLabel. [Testes e limites](plans/TREINOS-SUPERFICIES-0.1.128.md). Não assumir que build confirma teclado/scroll/foco no celular. Candidato SQL 128 permanece local após 127, gates false; sem nova publicação deste lote.

## Recebimento backend — H02 / 0.1.127

Usar [repasse/inventário atual](plans/REPASSE-BACKEND-0.1.127.md), preservar branch/trabalho local e instalar pelo lockfile. Configuração Vercel desativa auto-deploy exclusivamente em codex/fitness-ui-integration; não confundir push com release. Cache supabase/.temp é local/ignorado. Candidatos SQL 123–127 exigem revisão de histórico, hash e gate fechado; as instalações 120–122 foram registradas em lotes anteriores, sem nova consulta/aplicação hospedada aqui. Não rodar db push indiscriminado. Astro Boy registra hash/PR após publicação.

## Catálogo de Treinos — T03 / 0.1.126

`catalog-navigation.ts` agrupa pela primeira região muscular principal sem alterar os objetos. Busca literal sem acentos/caixa inclui secundários apenas com a opção marcada. MuscleExerciseCatalog mantém estado local: grupos fechados, oito itens por abertura e mais oito por ação; busca/lista em lotes de 12. Sem URL/storage/servidor nesse fluxo. Testes de navegação em `tests/elemental/fitness-identity.test.mjs`; aceite visual separado. [Evidências e limites](plans/TREINOS-CATALOGO-AGRUPADO-0.1.126.md). Candidato SQL 126 aceita somente a versão do produtor, após 125, gate fechado; não aplicar remotamente por este lote.

## Ícones intuitivos — T02 / 0.1.125

`fitness-glyph-data.ts` separa anatomia (contexto humano + alvo) de movimentos/equipamentos. Preservar chaves/APIs; renderizador em FitnessGlyph continua decorativo por padrão ou informativo com label. Usar 24–32px nos controles, com rótulos visíveis; selos reservam espaço real. Comparar desenhos em tamanhos reais antes de aprovar. [Pranchas, testes e limites](plans/TREINOS-ICONES-INTUITIVOS-0.1.125.md).

Compatibilidade do produtor 125 tem candidato SQL local separado após 124; gates seguem false. Não executar a cadeia remota por este lote de UI.

## Treinos elemental — T01 / 0.1.124

Adicionar símbolos à família `FitnessGlyph.tsx`, mantendo `currentColor`, nomes acessíveis quando informativos e rótulo de texto nos filtros. Não gravar nomes de ícones nos exercícios/stores. `fitness-elemental.css` usa classes específicas; não aplicar seletores genéricos a outras abas. `node --test tests/elemental/fitness-identity.test.mjs tests/elemental/fitness-actions.test.mjs` verifica apresentação/filtros e ações sintéticas, sem navegador.

Candidato SQL 124 aceita a versão do produtor, exige revisão 123 e gate fechado; somente local, sem schema/formato novo ou reescrita pessoal. [Escopo, verificações e limites](plans/TREINOS-IDENTIDADE-0.1.124.md). Antes de liberar conta hospedada, revisar candidatos 123/124 em escopo próprio. Prancha de ícones não equivale a aceite mobile.

## Integração de main com trabalho local — 0.1.123 / 05/11/2026

Pull ff-only incorporou be78b1e, após snapshot local c41b2bd. Reaplicação/resolução preservou trabalho anterior; não reaplicar o stash sobre a mescla. [Decisões, compatibilidade e evidências](plans/INTEGRACAO-MAIN-2026-11-05.md). Versão 123 requer revisão SQL candidata local antes de liberar a conta hospedada; nenhum gate foi aberto. Testes usam armazenamento sintético; nunca limpar localStorage pessoal para validar a integração.

## Cadastro e confirmação sem transferência — F5 / 0.1.122

`node --test tests/backup/account-access.test.mjs tests/backup/account-workspace-ui.test.mjs tests/backup/workspace-entry.test.mjs tests/backup/account-version.test.mjs` verifica autenticação independente da cópia, signup sem adoção, resend, identidade remota, URL padrão isolada e inspeção inicial concluída. Arquivo segue obrigatório antes de enviar/substituir dados. [Contrato e evidências](plans/FECHAMENTO-F5-CADASTRO-CONFIRMACAO.md). Gates false; revisão 122 instalada/local 20261030211424, sem reescrever SQL anterior.

## Recuperação de senha isolada — F4 / 0.1.121

`/?progresso=recuperar` captura/limpa callback antes do Auth e não carrega App/stores. Prova PKCE própria aceita até uma hora, mesmo navegador/origem; tokens só no Map. SDK persistSession:true seleciona o adapter em memória; false o ignora. Nunca trocar isso por localStorage para tokens ou usar sessão recuperada para importar progresso. [Decisões/testes/limites](plans/FECHAMENTO-F4-RECUPERACAO-ACESSO.md). Testes: `node --test tests/backup/account-recovery*.test.mjs tests/backup/account-session.test.mjs tests/backup/account-version.test.mjs tests/backup/workspace-entry.test.mjs`. Revisão de versão instalada 20261030204257, base F3 intacta; gates false.

## Migração integral instalada — F3-R / 0.1.120

Destino confirmado myvxvgeyseoyugskqlqr, versão remota/local **20261030202517_progress_account_atomic**. Conteúdo aprovado originalmente como 20261029182304; hash preservado. Escrita false, instalação/permissões conferidas. [Evidências, limites e retomada](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). Não reaplicar o arquivo nem rodar db push da pasta histórica; as demais migrações antigas não foram baselined/registradas por suposição. As entradas abaixo que dizem “não aplicada” descrevem entregas anteriores.

## Instalação integral sobre o schema existente — F3 / 0.1.120

`node --test tests/backup/account-installation.test.mjs tests/backup/account-database.test.mjs tests/backup/account-transport.test.mjs` verifica preflight, variante de colunas observada e preservação em PostgreSQL sintético. Suíte completa: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`. Não executar db push de toda a pasta: o schema legado hospedado diverge legitimamente do init local. [Pacote/hash/procedimento](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md); instalação remota separada, gates fechados.

## Retomar banco pausado e conferir contrato — F2

Destino confirmado: DominioDoMagoDB. Solicitação de retomada aceita; aguardar disponibilidade antes de consultar migrações/catálogos. Não confundir COMING_UP ou timeout com schema ausente, nem repetir restore por suposição. [Procedimento e limites](plans/FECHAMENTO-F2-BANCO-HOSPEDADO.md). Sem secrets/dados pessoais ou aplicação automática de SQL.

## Verificar ciclo Auth do handoff — F1 / 0.1.119

`node --test tests/backup/account-session.test.mjs tests/backup/account-refresh.test.mjs tests/backup/account-workspace-ui.test.mjs` verifica memória, visibilidade, start atrasado, cleanup e handoff sintéticos. Não valida Auth hospedado ou sessão persistida após reload. [Limites e próximo](plans/FECHAMENTO-F1-SESSAO-ONLINE.md).

## Validar seleção e query de Ciclos — 0.1.118

`node --test tests/cycles/date-navigation.test.mjs tests/cycles/calendar.test.mjs tests/temporal/mobile-agenda.test.mjs` verifica callbacks/intenção/scroll/retorno/virada com fixtures. Marcador interno deve corresponder à conta/intenção; não antecipar acknowledgment antes da URL ou forçar filtros da própria seleção. [Evidências e QA pendente](plans/CICLOS-DATA-URL-2026-10-30.md).

## Conferir calendário de Ciclos — 0.1.117

`node --test tests/cycles/calendar-navigation.test.mjs` verifica abertura/Hoje, locale/mês, seleção, salto, cancelamento e callback de foco em harness sintético. Não comprova picker ou teclado mobile. [Aceite seguinte](plans/CICLOS-CALENDARIO-UX-2026-10-30.md).

## Compilar o harness descartável de lembretes — R27-D1

`node scripts/build-reminder-qa.mjs --help` explica o modo build-only. `node scripts/build-reminder-qa.mjs` gera artefato temporário com fixture sintética, gate substituído somente no bundle e sem stores/Auth reais. Não inicia servidor/navegador nem valida UI. Não servir na origem do app, não usar dados pessoais nem usar outro endereço para contornar recusa de inspeção. [Preparação, limites e aceite pendente](plans/R27-D1-ACEITE-MOBILE-LEMBRETES.md). Versão do produto permanece 0.1.116.

## Conferir preparação na agenda — R27-C2 / 0.1.116

`node --test tests/reminders/*.test.mjs tests/temporal/mobile-agenda.test.mjs` verifica controles, preparação e retorno em memória. Gate false deve impedir render e acesso ao adapter; não habilitar pela URL/env. A preparação só escreve sessionStorage, após comparar projeções persist/live e contexto local. Navegar por documento somente após resolver stage/readback e nova verificação. Falha ambígua conserva plano; nunca apagar journal como parte do formulário. Retorno da conferência usa validação Temporal e query permitida, sem state arbitrário. [Contrato e QA real pendente](plans/R27-C2-CONTROLES-E-PREPARACAO-LEMBRETES.md).

## Conferir entrada e revisão de avisos — R27-C1 / 0.1.115

`node --test tests/reminders/*.test.mjs tests/backup/workspace-entry.test.mjs` exercita a rota `?progresso=lembretes`, retomada de plano da aba, prioridade conta/restauração, consentimentos/eventos e recuperação ligada ao plano em harness sintético. O selector da entrada normal deve depender só da chave/URL, sem importar implementação de escrita. Tela não lê nem grava progresso no mount; exige conferir. Não limpar sessão/journal por erro nem abrir gate por aprovação Node. Novas aplicações exigem marcador local prévio e nenhuma barreira/vínculo de conta. [Contrato, evidências e limites](plans/R27-C1-WORKSPACE-PROTEGIDO-LEMBRETES.md).

## Conferir transporte de avisos — R27-B2B / 0.1.114

`node --test tests/reminders/*.test.mjs`: transporte de sessão injetado, readback/checksum, cancelamento e percurso completo pelo coordenador/recuperação existentes em storage/locks sintéticos. Nunca usar localStorage para a chave de handoff, logar conteúdo privado ou tratar checksum como autorização. Não navegar antes do readback, nem limpar journal pelo transporte. Retorno exige nova confirmação e modo local explícito; sync online e ergonomia sem reload ainda exigem integração. [Contrato e limites](plans/R27-B2B-TRANSPORTE-E-RETORNO.md).

## Conferir escrita isolada de avisos — R27-B2A / 0.1.113

`node --test tests/reminders/exclusive-write.test.mjs`: release substituído só no harness, locks/storage em memória, barreira startup, recusa de app hidratado e recuperação em quatro pontos. Nunca abrir gate por passar teste Node. [Handoff ainda pendente e limites](plans/R27-B2A-ESCRITA-ISOLADA-LEMBRETES.md). Sucesso pode normalizar JSON; recuperação guarda baseline original.

## Validar metadados locais — R27-B1 / 0.1.112

`node --test tests/reminders/*.test.mjs tests/backup/startup.test.mjs tests/backup/recovery-review.test.mjs` verifica metadados opcionais no User, persist/readback em memória, conta e backup integral. Codec do auditor deve permanecer separado dos seletores/serviços: proteção de startup não pode importar domínio. CAS síncrono do store não é lock entre abas; ativação da UI requer B2 (lease/journal/readback/falhas). [Limites](plans/R27-B1-PERSISTENCIA-LEMBRETES.md).

## Testar lógica de lembretes — R27-A / 0.1.111

`node --test tests/reminders/occurrence-reminder.test.mjs`: módulo puro sem storage/timer/push, relógio injetado no comando, DST em processo Node isolado. [Contrato, fuso e próximos critérios](plans/R27-A-CONTRATO-LEMBRETES.md). Não chamar transição em memória de garantia distribuída; persistência futura precisa CAS e isolamento no progresso existente. Não gerar novas atividades por adiamento.

## Conferir retorno de origem — R26-M2E / 0.1.110

`node --test tests/temporal/mobile-agenda.test.mjs tests/temporal/entry-forms.test.mjs` verifica origem segura do Ano após selecionar/fechar dia/trocar mês, descarte de origem externa/state alheio, cancelamento e retry de falha antes da gravação. Não afirma proteção após gravação ambígua nem foco/rolagem em navegador. [Evidências e limites](plans/R26-M2E-RETORNO-SEGURO.md).

## Conferir dia selecionado — R26-M2D / 0.1.109

`node --test tests/temporal/navigation-review.test.mjs tests/temporal/entry-forms.test.mjs` reproduz passagem do dia entre abas, virada de ano, fallback sem seleção e resumo recorrente com data inicial. Harness/JSX e store em memória não substituem QA visual. [Evidências e limite de navegador](plans/R26-M2D-REVISAO-NAVEGACAO.md). Não contornar permissão salva.

## Validar formulários Temporal — R26-M2C / 0.1.108

`node --test tests/temporal/entry-forms.test.mjs tests/temporal/mobile-agenda.test.mjs tests/temporal/agenda.test.mjs`: comandos reais em store isolado, handlers/SSR/router sintéticos. Conferir criação anual e data final em outro ano, rejeição de limite anterior, falha sem perder campos, edição sem alterar recorrência, agrupamento de ocorrências, confirmação de exclusão, Ano → Mês → Ano e Ano → Ciclo → retorno. A repetição anual é responsabilidade do helper/store existente; não gerar cópias. [Evidências e aceite real pendente](plans/R26-M2C-FORMULARIOS-TEMPORAL.md). Para QA real usar perfil temporário autorizado, 360/390px/tablet, teclado/foco/rolagem, sem contornar bloqueios.

## Verificar navegação temporal — R26-M2B / 0.1.107

Regressões locais: `node --test tests/temporal/mobile-agenda.test.mjs tests/temporal/agenda.test.mjs tests/cycles/composer.test.mjs tests/elemental/discovery-scroll.test.mjs`. Testam URL/dia/retorno, componentes e handlers isolados; não são um navegador. Período/dia usa query, sem persistir nova atividade. Somente mudanças internas explicitamente marcadas conservam rolagem; não generalizar essa exceção para outras rotas. Para aceite real, conferir semana → atividade → retorno, fechar/reabrir dia em Mês/Calendário, rolagem, foco e teclado com perfil temporário. [Limites e evidências](plans/R26-M2B-HOJE-TEMPORAL-MOBILE.md).

## Verificar agenda — R26-M2A / 0.1.106

[Contrato e limites](plans/R26-M2A-AGENDA-COMPATIVEL.md). Regressões locais: `node --test tests/temporal/agenda.test.mjs tests/backup/agenda-adapter.test.mjs tests/elemental/creation-errors.test.mjs`. Usam instâncias isoladas e cliente sintético, sem dados reais. Datas de Rituais usam chaves locais YYYY-MM-DD; não substituir por createdAt ou por UTC-midnight. Campos anuais e limite são opcionais por compatibilidade; não normalizar agendas antigas durante leitura nem editar JSON pessoal para testar. Para aceite no aparelho, conferir seleção de dia, teclado, retorno e datas entre fusos com perfil temporário, quando o navegador estiver disponível.

## Revisão mobile — 0.1.105 / R26-M1

Campos file de resolução têm classe própria; estilos de consentimento dimensionam somente type=checkbox. Evitar seletor genérico que volte a limitar file a 22px. Foco, nomes e rótulos devem continuar nativos; não trocar validação/consentimentos por correção estética. Busca elemental mantém query/rotas existentes.

504 globais e 22 direcionados aprovados, tipos/lint/build e parse CSS; não são prova de medidas/overflow/teclado em dispositivo. [Matriz 360/390/768/1440 pendente e comandos](plans/R26-M-REVISAO-MOBILE-ATUAL.md). Sem acesso a dados pessoais, browser ou banco remoto. Manter Sol Médio no próximo lote de Ciclos; auth/contratos críticos voltam a Alto após aviso.

## Escolher ou receber versões — 0.1.104 / R25-1B6B

No workspace, **Quero receber progresso de uma conta** permite Auth transitório sem arquivo local, somente para conferir. Compare, baixe e selecione as cópias correspondentes (local/online/tentativa se existirem), confirme abas, escopo e substituição. Local troca arquivo online; online troca os dois módulos locais. Nenhuma ação soma XP. Gates atuais false: implementação preparada, conta real ainda indisponível.

Se interromper: não apague journal/intent/vínculo nem force App. Entre na mesma conta, confirme a retomada e consulte recibo sem reenviar. Retry separado repete somente mesma operação. Em conflito, reavaliar mantendo local só após provar nova revisão e antes de qualquer aplicação local; intent anterior permanece. Não há cancelamento offline seguro presumido nem overwrite de edição externa. [Contrato/limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

Verificação: `node --test tests/backup/account-resolution.test.mjs tests/backup/account-resolution-ui.test.mjs tests/backup/account-workspace-ui.test.mjs tests/backup/startup.test.mjs tests/backup/workspace-preview.test.mjs` (42 finais). Global 504; tipos/lint/build passaram. Fixtures usam banco/usuários/DOM/arquivos/locks sintéticos, sem perfil real. Próximo QA frontend/mobile em Sol Médio; aceite online/release próprio e contratos críticos em Alto.

## Sync de sessão e versões — 0.1.103 / R25-1B6A

Conta previamente vinculada e cópia salva/readback: sessão futura exige consentimento adicional, outras abas fechadas e lease exclusivo. Sem locks, não entra. Runtime persiste intent antes do envio; em erro/timeout não reenvia sozinho. Confira recibo no workspace. Parar sync/pagehide conserva dados e tentativa; recarga volta local, sem credenciais persistidas. Não apague intent/vínculo para destravar.

Comparar versões exporta local/online/tentativa e não substitui nem mescla. Gates atuais false: ações de Auth/sync continuam indisponíveis ao usuário real. Testes: `node --test tests/backup/account-live-sync.test.mjs tests/backup/account-sync-lifecycle.test.mjs tests/backup/account-workspace-ui.test.mjs tests/backup/startup.test.mjs tests/backup/workspace-entry.test.mjs`; o direcionado anterior teve 38, e o arquivo lifecycle ganhou duas provas depois (5 aprovadas isoladamente). Suíte global executada 486; tipos/lint/build passaram. SQL/DOM/cliente/locks temporários não equivalem a Supabase/navegador reais. [Próxima 1B6B em Alto e limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Vínculo de conta e próximos envios — 0.1.102 / R25-1B5

Ao fechar um envio confirmado, guardar o vínculo exige consentimento separado. Para conta vinculada, cada novo envio exige cópia atual salva/readback e conferência remota da revisão anterior; CAS recusa disputa posterior. Não editar/excluir vínculo/intent/marcador para destravar. Pausa não cancela commit incerto; conflitos conservam as versões. Não há sync automático nem entrada de outro dispositivo pronta. Todos os gates permanecem false. O guard do serviço legado só chama a RPC após release; não abra gate sem migration e bootstrap compatíveis.

Verificação isolada: `node --test tests/backup/account-transfer.test.mjs tests/backup/account-workspace-ui.test.mjs tests/backup/legacy-account-guard.test.mjs` (27 aprovados). Global 467; TypeScript/lint/build passaram. SQL em memória e clientes/DOM sintéticos não substituem QA hospedado/visual. Próxima 1B6 em Sol Alto; Médio depois com aviso. [Procedimento e limites](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Workspace de confirmação de conta — 0.1.101 / R25-1B4

Grimório → Preparar conta pessoal → Conferir envio com o app pausado abre `/?progresso=conta`, sem App/stores/cliente global. Auth/envio estão bloqueados por `account-release.ts=false`; servidor e restauração também fechados. Cópia local pode ser salva/conferida. Nunca apague intent/diário/marcador para destravar login. Pausa mantém tentativa e modo local; retry requer consentimento separado, mesmo arquivo e baseline inalterado; fechamento requer recibo/leitura e preservação explícita de edições novas. Não ativa autosync. [Procedimento, limites e próxima 1B5 em Alto](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

Verificação local sem rede/dados reais: `node --test tests/backup/account-transfer.test.mjs tests/backup/account-session.test.mjs tests/backup/account-workspace-ui.test.mjs tests/backup/local-continuation.test.mjs tests/backup/workspace-preview.test.mjs` (30 aprovados). Global 453; tipos/lint/build passaram. Harness substitui DOM/locks/Auth/HTTP; não equivale a QA visual/hospedado. Não abrir gates nem aplicar migration remotamente por esse resultado.

## Backend de conta integral — 0.1.100 / R25-1B3

`supabase/migrations/20261029182304_progress_account_atomic.sql` foi criada com CLI local e executada SOMENTE no PostgreSQL em memória dos testes. **Não aplicada no Supabase real.** `release_gate` privado inicia writes_enabled false; cliente não o altera. Não liberar esse gate nem remover o modo local para forçar conta antes do cliente de confirmação/bootstrap completo. [Decisão e limites](04-ADRs/ADR-004-Progresso-Integral-Opt-In.md).

Para conferir sem secrets/rede/ambiente: `node --test tests/backup/account-database.test.mjs tests/backup/account-transport.test.mjs`. Usa PGlite 0.5.13 como dependência dev, cria schema Auth/roles sintéticos, aplica o SQL antigo e novo e abre o gate **só dentro desse banco temporário**. Sem localhost/porta ou conexão externa. A fixture remove somente o comando opcional pgcrypto do SQL antigo, pois UUID/hash são funções built-in; a nova migração é executada literalmente. Não é teste de Auth/PostgREST/Supabase hospedado nem concorrência entre sessões.

RPCs: progress_account_read, progress_account_commit e progress_account_receipt recebem expected_user_id e o conferem com auth.uid(). Transporte requer cliente explícito e guardas de perfil/fingerprint/geração; não importa cliente global. Preparar congela bytes/revisão/operação/consentimento de todos os perfis. Commit não faz retry automático; em timeout, consultar recibo e conferir leitura exata. Um recibo antigo não libera nova revisão. Nenhuma dessas operações altera stores locais ou remove isolamento.

Primeiro opt-in com domínio legado é recusado. Não apagar tabelas para passar essa condição nem declarar legacy como empty. Writes no legado de contas integrais são bloqueados, mas clientes antigos ainda podem ler o legado: upgrade/bootstrap compatível é critério obrigatório antes de liberar escrita. Não tratar implantação isolada da migration como integração final pronta. Próximo lote em Sol Alto; QA mobile depois em Sol Médio com aviso prévio.

## Pré-conferência da conta pessoal — R25-1B2 / 0.1.99

No Grimório → Guarde sua jornada → Preparar conta pessoal, use **Conferir progresso local**. O relatório reutiliza a captura dos stores existentes e mostra perfil, atividades, XP e sessões. É somente leitura e não solicita download nem chama SDK/Auth. Mudanças persistidas invalidam o relatório; pode fechar/cancelar e conferir novamente. A captura inclui os dois módulos e todos os perfis; atividades/XP exibidos são do perfil atual e sessões somam contas locais. Essa ação não pausa nem altera o autosync preexistente do fluxo normal.

`association-review.ts` não importa stores/serviços/cliente. `prepareLocalAssociationReview` guarda o vínculo de uma revisão/arquivo somente em WeakMap transitório; copiar o objeto ou recarregar exige preparar outra revisão. `prepareRemoteAssociationReview` recebe um contrato de leitor confiável futuro e valida resposta desconhecida em runtime; nenhuma implementação desse adaptador foi conectada. Não usar o serviço parcial atual para satisfazer a declaração de cobertura completa. `associationAllowed` permanece false em todos os resultados, inclusive conta vazia/comparação completa.

Execute `node --test tests/backup/association-review.test.mjs tests/backup/account-preparation-ui.test.mjs tests/backup/backup-ui.test.mjs` para validar leitura, cancelamento, alterações, cobertura/identidade e resultado antigo. [Contrato/limites e próximos modelos](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md). Não remover marcador local ou diário para conectar conta; gate da restauração segue false, QA real/integração online pendentes.

## Conferência da cobertura online — R25-1B1

Execute `node --test tests/backup/account-association-contract.test.mjs` com dados exclusivamente sintéticos. A matriz de teste `cloud-coverage-contract.mjs` deve classificar cada campo de `captureProgress`; um campo novo/retirado exige revisão da cobertura. “Payload” não equivale a migração integral de saldos/perfis/Treinos. O teste usa serviço/stores reais com cliente em memória; nenhuma query de servidor é executada.

[Contrato e decisões pendentes](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md): não usar hidratação atual como prévia nem publicação atual como migração completa. Nunca remover o marcador local para testar login sobre progresso pessoal. 155 testes de backup passaram; versão 0.1.98 preservada, sem build/TypeScript novos por ser lote somente de testes/documentação.

## Continuação local e confirmação — 0.1.98 / R25-1A

A interface de `/?progresso=restaurar` agora tem handlers de confirmação/recuperação/uso local, mas `src/lib/backup/restore-release.ts` mantém `RESTORE_WRITES_RELEASED=false`. Não existe desbloqueio por URL, variável de ambiente ou storage. Antes da restauração, selecione novamente a cópia anterior salva para conferir fingerprint/origem; as duas caixas de consentimento começam desmarcadas. Operação interrompida com diário retido exige recarga da conferência, sem repetição automática.

A continuação local verifica o diário committed e o destino sob exclusividade, grava/confere `conselho-elemental-local-progress-mode-v1` e só depois remove o diário. Startup valida formato/versão/origem do metadado antes de importar App; o cliente Supabase não é criado no documento local. Marcador inválido bloqueia abertura; diário tem precedência. Edições posteriores continuam nos stores existentes e recargas repetem a seleção de modo. Rollback prepared não modifica esse metadado. Não apagar chaves/diário ou sessão como atalho para conectar a conta; reconciliação online é 1B.

Testes locais: `node --test tests/backup/*.test.mjs`; suíte integral `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`. `local-continuation`, `restore-confirmation` e `restore-actions-ui` exercitam confirmação, cancelamento, falhas de escrita, recargas e edições com dados sintéticos. O módulo frontend de cliente e authStore são avaliados com SDK substituto; nenhuma sessão real é lida. [Procedimento/aceite restante](plans/R25-A-BACKUP-DO-PROGRESSO.md).

## Diário confirmado é barreira de continuação — 0.1.97

`executePreparedRestore` mantém o diário committed após confirmar o destino. `recoverRestoreJournal` em committed só confere o destino e retorna estado, sem limpar o diário ou autorizar App/auth. Startup já recusa qualquer diário antes de imports; recarregar abre a conferência isolada. As versões anterior/destino continuam exportáveis. A UI distingue cópia confirmada/isolada de rollback pendente e não oferece liberação.

Não remover o diário manualmente para entrar no app; isso contornaria a barreira e poderia ativar cloud-first. Prepared só é limpo depois de restabelecer/verificar ambos os bytes anteriores. Ainda não há API de associação/liberação de committed; definir o contrato no lote seguinte, preservando o backend de Matheus. Testes: `post-restore-barrier`, `document-lifecycle` e `restore-journal` em `tests/backup`. [R25-A2b11](plans/R25-A-BACKUP-DO-PROGRESSO.md).

## Auditoria de bootstrap de auth — R25-A2b10

Execute `node --test tests/backup/auth-bootstrap-audit.test.mjs` para caracterizar o comportamento atual com authStore e serviço reais, cliente/eventos/timers sintéticos e fetch proibido. Não fornece tokens ou conecta conta; `src/lib/supabase.ts` real não é avaliado. Esses testes descrevem riscos existentes, não critérios de aceite para replicá-los no fluxo de restauração.

Sessão salva, foco/visibilidade, alteração local, troca de perfil e operação em andamento após logout precisam de isolamento antes de habilitar importação local. O sync deste serviço não corresponde ao backup integral. [Contrato proposto e impacto para Matheus](plans/R25-A-ISOLAMENTO-AUTH-SYNC.md). Não chamar ação legada restoreFromLocalBackupToCloud para aplicar arquivo R25 nem limpar storage/sessão como atalho.

## Teste integrado de documentos — R25-A2b9

Execute `node --test tests/backup/document-lifecycle.test.mjs` para conferir startup → exclusividade → interrupção → revisão → recuperação → nova hidratação dos stores reais com perfis sintéticos. `fixture(entries, sharedMemory)` aceita um Map exclusivo do teste para ligar documentos independentes; nunca forneça armazenamento pessoal. Todos os módulos de coordenação são avaliados por documento antes da criação dos stores. O teste considera a reescrita legítima de campos derivados na hidratação: renova baseline/cópia antes de substituir.

Este teste usa locks/armazenamento/documentos simulados, não navegador/BFCache nem auth/autosync. Não libera writer na UI. Ausência de import de auth no teste não prova isolamento após a carga normal de App; auditar esse fluxo no próximo lote. [Evidências e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md).

## Cópias protegidas e confirmação de recuperação — 0.1.96

Em operação pendente válida, **Conferir recuperação pendente** oferece **Baixar versão anterior** e **Baixar versão de destino** nos detalhes correspondentes. Origem anterior vazia não oferece arquivo anterior; conflito externo permite preservar as versões do diário sem sobrescrever as mudanças atuais. Confira o download no dispositivo; nenhum arquivo pessoal foi observado nesta rodada.

O futuro chamador de `runExclusiveRestore` com `mode: 'recover'` deve fornecer `recoveryConfirmed: true` e `expected: review.baseline`. A biblioteca copia os bytes antes de awaits e os revalida sob exclusividade e após hashing. Resultado obsoleto ou recuperação parcialmente falha exige nova conferência; nunca reaproveitar consentimento para outra versão. Função de baixo nível continua dependendo da exclusividade do chamador. Não habilitar writer de UI antes dos critérios de compatibilidade/isolamento e QA real. [Escopo R25-A2b8](plans/R25-A-BACKUP-DO-PROGRESSO.md); regressões em `exclusive-restore`, `recovery-review` e `restore-workspace-ui`.

## Conferência de recuperação pendente — 0.1.95

A página isolada oferece **Conferir recuperação pendente** sem iniciar stores/auth ou gravar dados. `reviewPendingRestore` confere integridade, origem e ambos os pares do diário; os resumos usam as versões protegidas, nunca as chaves atuais possivelmente misturadas. Alteração externa invalida o resultado; conflito não oferece limpeza automática. Não apagar o diário para prosseguir. Execução da recuperação continua desabilitada até o fechamento de isolamento/compatibilidade e teste real de abas/recarga. Regressores: `recovery-review.test.mjs` e `restore-workspace-ui.test.mjs`. [R25-A2b7](plans/R25-A-BACKUP-DO-PROGRESSO.md).

Identidade de sessão não pode coexistir em histórico/execução/check-in no mesmo perfil; check-in aponta para a chave do seu ciclo e recibo para sua própria sessão/atividade. Não exigir que alvos históricos ainda existam: exclusão de plano/ciclo pode preservar snapshots e rascunhos. Não recalcular XP ou reparar vínculos para passar na auditoria.

## Conferência de metadados de Treinos — 0.1.94

Catálogos, avaliações, recordes e indicadores de força passam por `auditFitnessAccount` na prévia e na revalidação dos pares do diário. Não recalcular força/XP nem exigir que toda avaliação histórica ainda tenha uma sessão: o cleanup nativo pode preservá-la. Testes em `fitness-audit.test.mjs` e `restore-compatibility.test.mjs`; [escopo R25-A2b6](plans/R25-A-BACKUP-DO-PROGRESSO.md). A revisão de lacunas 0.1.93 abaixo é histórica; vínculos ativos e QA real continuam pendentes.

## Próxima revisão de compatibilidade — R25-A2b5

A auditoria atual de Treinos ainda não percorre `exercisesCatalog`, `nativeCatalog` (além de lista de objetos), `ratings`, `strengthRecords`, `strengthProgressPoints` ou `strengthStat`, nem fecha referências entre catálogo, plano, sessão, sequência e avaliação. Confira produtores e remoções antes de rejeitar dados antigos; snapshots históricos podem manter referências cujo template foi removido. Não habilite restauração por ausência de achados. Matriz e escopo em [R25-A2b5](plans/R25-A-BACKUP-DO-PROGRESSO.md). Próxima implementação recomendada em Sol Médio com fixtures reais em memória.

## Conferência isolada — 0.1.93

No Grimório, “Conferir restauração com o app pausado” carrega `/?progresso=restaurar` em navegação completa na mesma origem. Tela usa comparação/exportação sobre bytes existentes, sem importar App/stores/auth. Diário pendente pausa os controles; não apagar a chave para prosseguir. Confirmação de gravação ainda indisponível. Testes `workspace-preview`, `restore-workspace-ui` e `workspace-entry` em `tests/backup`. [Detalhes](plans/R25-A-BACKUP-DO-PROGRESSO.md).

## Protocolo exclusivo e validação do diário — 0.1.92

Antes de qualquer escrita/rollback, validar os dois envelopes e vínculos; checksum sozinho não autoriza conteúdo. `runExclusiveRestore` é biblioteca isolada, sem UI/chamador de produção. Exige documento sem import prévio de App, Web Locks, fechamento confirmado de abas e cópia anterior correspondente para aplicação. Não liberar lease de app vivo nem apagar diário incompatível. [Limites/integração pendente](plans/R25-A-BACKUP-DO-PROGRESSO.md). Testes `tests/backup/restore-compatibility.test.mjs` e `exclusive-restore.test.mjs`.

## Backup de Treinos — 0.1.91

A comparação e o preparo do diário conferem campos internos críticos de planos/séries/sessões, check-ins, medidas e recibos, preservando distinção legado/nativo. Teste `node --test tests/backup/fitness-audit.test.mjs`. Não excluir histórico porque seu template foi removido; não recalcular recibos para corrigir achados. [Cobertura e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). Restore ainda indisponível.

## Conferência crítica de backup — 0.1.90

Ao comparar uma cópia no Grimório, os avisos apontam campos críticos incompatíveis e preservam o arquivo original. Não corrigir/normalizar automaticamente para fazer o aviso desaparecer. Ausência de achados não libera restore: confira o [escopo da auditoria](plans/R25-A-BACKUP-DO-PROGRESSO.md). `prepareRestoreJournal` passa pela mesma auditoria. Teste: `node --test tests/backup/critical-progress.test.mjs`.

## Proteção antes da hidratação — 0.1.89

main importa bootstrap-app somente após conferir a chave de restauração. Diário pendente ou storage negado bloqueia e oferece recarga; não apagar o diário para contornar a proteção. A lease compartilhada permanece enquanto o documento existe, inclusive após import parcialmente falho. A futura restauração precisa de documento exclusivo sem stores/auth importados; não liberar lease de app vivo. [Limites e testes](plans/R25-A-BACKUP-DO-PROGRESSO.md). Teste: `node --test tests/backup/startup.test.mjs`.

## Diário isolado de restauração — 0.1.88

`restore-journal.ts` só é exercitado por testes; não importar no app antes dos critérios de integração do [R25-A2b2a](plans/R25-A-BACKUP-DO-PROGRESSO.md). Exige exclusão de todos os escritores e recuperação anterior à hidratação. Falha retém diário; nunca apagar manualmente um diário pendente para prosseguir. SHA-256 não autentica o conteúdo. Testar: `node --test tests/backup/restore-journal.test.mjs`. Nenhum comando para restaurar dados pessoais está habilitado.

## Prévia de restauração — 0.1.87

Após conferir um arquivo no Grimório, use Comparar com meu progresso. Abra os perfis para conferir registros e XP; alterações incluem conteúdo dos subitens. A prévia é invalidada quando o app muda. Ela não grava, soma recompensas nem certifica compatibilidade integral para aplicação. Não usar setState/rehydrate como restauração sem coordenar sync e recuperação dos dois stores. [Critérios A2b2](plans/R25-A-BACKUP-DO-PROGRESSO.md) devem preceder a habilitação de gravação.

## Preservação entre contas — 0.1.86

Criar conta captura primeiro o estado da conta ativa. `captureAccountData` deve manter a identidade ao salvar a própria conta e gerar novo ID só para novo perfil importado. Hidratação de Treinos deve usar o estado recebido no callback, nunca a constante do store durante sua construção. Backup exige readiness dos dois stores. Regressões em `tests/backup/account-preservation.test.mjs`; [R25-A2a](plans/R25-A-BACKUP-DO-PROGRESSO.md) documenta limites. Restauração e associação online continuam pendentes; não chamar comandos de conclusão ao carregar cópias.

## Cópia do progresso — 0.1.85

Grimório → Cópia de segurança → Baixar cópia do progresso. Confirme o arquivo em Arquivos/Downloads e use Conferir arquivo salvo para verificar sua estrutura e integridade. Guarde-o em local privado: contém registros de todas as contas locais. Não há restauração nem transferência online habilitada. A conferência não substitui dados nem valida toda regra de domínio. [Cobertura, exclusões e pendências R25-A](plans/R25-A-BACKUP-DO-PROGRESSO.md). Antes de restaurar/criar conta como migração, tratar os achados de captura da conta anterior e inicialização de Treinos.

## Formulários por conta — 0.1.84

Invocar remonta o workspace por conta; voltar entre passos preserva campos locais, trocar conta limpa o preenchimento não salvo. Sugestões possuem cancelamento explícito e resultado só é aceito para requisição/conta atuais. Não persistir prompts/consentimento nem usar resposta tardia para salvar. Forja/Invocar conferem conta antes dos comandos; isso é proteção de UI, não autorização de backend. [R28-F5](plans/R28-F-REVISAO-MOBILE.md) registra testes e limites.

## Recompensas visuais — 0.1.83

Reutilizar RewardSummary/RewardNotice com valores registrados e progresso fornecido pelos getters existentes. Nunca conceder XP em animação, montagem ou leitura de histórico. `animate` é opt-in para resultado novo; zero, ausência e reversão são distintos. TaskCompletionFeedback só na lista de Rituais; QuestHub mantém seu modal. Novos observadores devem suprimir hidratação/conta, reconciliar Undo e remover timers ao desmontar. [R29-D](plans/R29-D-RECOMPENSAS-VISUAIS.md) registra escopo e QA pendente.

## Conclusão de conquistas — 0.1.82

Usar `setAchievementCompleted` para Concluir/Reabrir na UI, com conta e assinatura da prévia atual. Nunca atribuir bônus com updateQuest/updateProject nem inferir conclusão por progress=100. `completionBonus` registra valor/elemento originais; preservar na sincronização. Rituais e subitens precisam estar concluídos, ciclos continuam recorrentes. Conquistas sem rituais usam confirmação manual. [R29-C](plans/R29-C-CONQUISTAS.md) documenta decisões e limitações. Novas telas devem reaproveitar AchievementCompletion e a projeção pura quest-trails.

## Recuperação e XP de Rituais — 0.1.81

[Procedimento R29-R/B](plans/R29-RECUPERACAO-E-RITUAIS.md). Recuperar somente por ação explícita em Ciclos, com prévia atual e cópia anterior verificada. Nunca chamar recoverCycleXp na hidratação. A cópia inclui apenas personagem e Ciclos; não substitui R25. Task.completionXp guarda o pagamento original da folha para Undo; não inferir débito de completions legadas sem snapshot. O helper acompanha comandos existentes e exclui native adapter. Preservação no backend/sync ainda precisa de contrato equivalente.

# Manual de engenharia — Conselho Elemental

## XP de Ciclos — 0.1.80

`HabitCompletion.xpAwarded/xpElementId/xpRuleset` registra concessão nova. Conclusão/Undo aplicam `applyCycleXpDelta` no mesmo update local dos recibos; a UI nunca concede XP. Ausência desses campos significa histórico não reconciliado, não autorização para estimar e debitar. Não usar o elemento atual para desfazer um recibo antigo. Respeitar zero nos agregadores/NOTE/VALUELESS e contadores informacionais. [R29](plans/R29-XP-E-RECOMPENSAS.md) contém testes e limites, incluindo sincronização remota pendente.

## Confirmação de criação — 0.1.79

Forja/Invocar conferem o resultado no estado local antes de limpar campos ou apresentar sucesso. `updateDraft` e `deleteDraft` retornam void: a UI consulta o store sem escrever novamente. Exceções preservam entradas e orientam conferir a lista antes da retentativa, pois não comprovam que nenhuma escrita ocorreu. Forja mantém alerta fora do diálogo se o rascunho desapareceu. Guardas locais não substituem transações/idempotência. `creation-errors.test.mjs` executa handlers com dublês, sem persistência real. Não declarar sincronização validada por esses testes.

## Retorno de séries — 0.1.78

`ExerciseSetRow` recebe o retorno já existente de `completePerformedSet`/`skipPerformedSet`. `wasSetRecorded` confere sessão ativa, ID e estado; não basta retorno não nulo. Erro preserva formulário e libera retentativa. Guarda de envio é local, sem substituir idempotência de domínio. Foco aguarda prop concluída/pulada; não focar história na montagem. Testes `fitness-actions.test.mjs` usam efeitos/handlers reais com dublês, não sessão real.

## Foco do contador — 0.1.77

`CycleDailyCounter` agenda o destino somente após sucesso do comando ou cancelamento explícito e consome a intenção no efeito de layout, quando refs dos controles substitutos já existem. Não agendar no render nem no caminho de erro. Sem timer, scroll ou comando adicional. Testes em `tests/cycles/counter-focus.test.mjs` usam dublês; QA real permanece na [matriz R28-F](plans/R28-F-REVISAO-MOBILE.md).

## Âncoras do Grimório — 0.1.76

`useGrimoireAnchor` roda após montagem/reset global e aceita somente as três seções declaradas. Cancelar frame ao trocar hash/desmontar; manter `tabIndex=-1` nas seções e a margem do cabeçalho. Testes do efeito usam dublês; [matriz R28-F](plans/R28-F-REVISAO-MOBILE.md) ainda precisa de navegador. Não contornar permissão salva para fechar QA.

## Marcos de trilha — 0.1.75

[Entrega R28-E](plans/R28-E-MARCOS.md). Recibo só nasce após sucesso de `finishQuestStep`. `describeQuestMilestone` compara projeções e níveis fornecidos pelo store; não escreve conclusão do agregado ou prêmio. Destino de continuar pertence à trilha do recibo; não usar a seleção de fallback atual. Ciclos recorrentes não entram no marco de todos os rituais pontuais. Sem celebração global na hidratação ou sincronização.

## Movimento de Treinos — 0.1.74

[Entrega R28-D2](plans/R28-D2-TREINOS.md). `WorkoutSetReceipt` deve permanecer montado enquanto a série está pendente e observar a conclusão do mesmo ID; não disparar animação a partir do clique nem recompensar a apresentação. Efeito cancela ao desmontar/mudar preferência. `ExerciseCard` compartilha `RevealPanel`; não remover `inert` dos painéis fechados. Testes Node de apresentação não substituem sessão real nem a suíte Deno de domínio.

## Filtros e rolagem — 0.1.73

Mudanças internas de Domínios/Mapa usam `DISCOVERY_NAVIGATION_OPTIONS`; `preventScrollReset` sozinho não substitui o controle customizado `ScrollToTop`. Preservar somente mesmo caminho + marcador explícito, sem desativar globalmente reset de navegação. Regressão em `tests/elemental/discovery-scroll.test.mjs`; [relatório R28-C1/D1](plans/R28-D1-ROLAGEM-E-RODA.md).

## Exploração compartilhada — 0.1.72

[Entrega R28-C](plans/R28-C-EXPLORACAO-LEITURA.md). `RevealPanel` centraliza expansão e isolamento dos controles recolhidos. `NavigationGroup` é compartilhado por Mapa/Explorar: validar ambos ao alterá-lo. Filtros do Mapa são estado de URL, sem persistência paralela de atividades. Roteiro mobile pendente no plano; testes SSR/MemoryRouter são verificação estrutural.

## Movimento em criação — 0.1.71

[Entrega R28-B](plans/R28-B-CRIACAO-ORGANIZACAO.md). Transições ficam na apresentação; confirmações respondem a comandos existentes. Não atrasar gravação até terminar animação. Invocar mantém o resultado até escolha do usuário; Forja devolve foco após diálogo. Testes de apresentação não substituem roteiro mobile documentado; sem alteração de persistência/economia.

## Contador diário — 0.1.69

Os comandos configureHabitDailyTracking/recordHabitQuantity/removeHabitQuantity usam updateHabit e os snapshots existentes. Não emitir completion/XP ao registrar quantidade. Validação local: `node --test tests/cycles/*.test.mjs`; suíte completa e evidências no [R27](plans/R27-QUANTIDADES-DIARIAS.md). QA de navegador e sync cloud não comprovados.

## Revisão e repasse — 0.1.48

O CLI usa briefingId e briefingAcknowledged para apresentar o repasse uma vez a perfis existentes. Não é daemon; a IDE executa o protocolo. Teste de onboarding usa diretórios temporários. SanctuaryRituals usa view=lista e o timer simples recusa treino/agregador. Astrolábio projeta pontos históricos disponíveis, sem classificação elemental inferida. Testes Fitness: `deno test --cached-only --config tests/deno.json tests/workout/`. [Repasse completo](REPASSE-FRONTEND-PARA-BACKEND.md) · [Evidências R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

## Quests — 0.1.47

Rituais alterna Quests/Lista via query. QuestHub compõe seleção, diálogos e timer; quest-path projeta tarefas atuais por ID e não persiste progresso. quest-commands delega criação aos métodos existentes e conclusão ao sanctuary-timer. Estados visuais reiniciam por conta; ações nativas/recorrentes mantêm seus módulos. ScrollToTop preserva somente seleções explícitas dentro de /rituais. Rodar os testes existentes e `tests/quests/*.test.mjs`; build via API Vite com envDir:false. QA de navegador ainda pendente. [Escopo, evidências e retomada R10](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

## Grimório — 0.1.46

Grimorio usa AppLayout com showAura=false e mantém getters/handlers existentes. ResourceMeter e ElementMasteryCard são apresentação. history.ts projeta registros persistidos sem estimar valores nem manter ledger; filtros usam dias locais, dados ausentes são explícitos. Estado visual reiniciado por conta; relógio de minuto apenas atualiza leitura. CSS e diálogos têm escopo próprio. Testes: `node --test tests/grimorio/*.test.mjs tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`. [Fontes, limites e QA R09](03-Project-Management/reports/R09-GRIMORIO.md).

## Cabeçalhos e composição — 0.1.45

ElementalTopBar é apresentação; TopBar mantém conta/serviços e abre AllRoutesSheet. CycleCreationForm recebe estado/callbacks, sem gravação própria. Seleção de data mantém o centro da janela; Hoje/seletor/setas controlam o reposicionamento. Santuário clássico agora é apenas redirect; página/palco/CSS exclusivos removidos. [Evidências R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

## Ciclos — 0.1.44

Visões Rotina/Sequências e filtros são estado de apresentação. ExpandedDayCard recebe data/seleção/contagens e callback existentes; só o cartão ativo mostra seus totais. Centralização rola apenas a faixa de dias, sem foco programático. ScoreHierarchyPanel aceita presentation="showcase" opt-in, sem cálculos novos. `cycle-discovery.ts` filtra a coleção pronta sem reordenar/gravar; regras e handlers continuam em Ciclos/stores existentes. Guardas de UI permitem reorganizar só na visão completa em Ordem. CSS escopado em ciclos.css e classe cycle-dialog nos portais. Testes: `node --test tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`; QA real requer liberação efetiva do navegador. [Escopo e evidências](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

## Ícones e navegação — 0.1.43

Use ArcaneIcon/ElementIcon/RouteIcon na apresentação; não substituir strings persistidas do catálogo. `label` somente quando a imagem carrega informação própria; mantenha rótulos textuais nos controles. NavigationGroup e RouteShowcase recebem destinos do APP_ROUTES existente. Não usar progressos inventados. Testes de apresentação resolvem imports locais, sem stores. [Escopo, preservação e evidências](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

## Operação temporal — 0.1.42 / 22/10/2026

TemporalLayout mantém AppLayout/tick e reúne as seis abas. `useLiveDate` é apenas relógio de apresentação; não usar para pontuação. Lua carrega Three.js sob demanda e assets locais com créditos; `getMoonPhase` legado não foi substituído. Estações lê `getSeason`; não recalcular fronteiras como efeito de layout. Meses usam query `mes=YYYY-MM`. Testes: `node --test tests/elemental/*.test.mjs tests/temporal/*.test.mjs`; não substituem navegador/WebGL. [Implementação e próximos passos](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

## Operação da home elemental — 0.1.41 / 22/10/2026

Home canônica em `/santuario`, elementos em `/santuario/elementos/:elementId`. Prévia redireciona; home clássica permanece como alternativa. TopBar em modo accountOnly reutiliza conta; SanctuaryRituals delega operações existentes com proteção por conta/ritual/sessão. Não montar AppLayout junto com a casca elemental, que já mantém o tick existente. Pilares usa os getters reais e leva às páginas elementais. [Implementação, testes e QA pendente](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md). Este registro atualiza as pendências de promoção/início/conclusão mencionadas no histórico abaixo, sem declarar paridade visual validada.


> Atualizado em 09/10/2026: o protótipo I03 do assistente está descrito em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Estado operacional e próximo passo permanecem em CONTINUIDADE.md.

Atualizado em 09/10/2026 por inspeção estática do checkout de coordenação. Escopo: operar e evoluir o app existente com segurança. Este manual não certifica fluxos, implantação, sincronização remota ou cobertura de testes.

## Tema e componentes compartilhados — 22/10/2026

Tema em `src/styles/elemental-theme.css`, importado por main após os estilos existentes; aliases Tailwind usam variáveis RGB com suporte a opacidade. Preserve os aliases e migre telas gradualmente; não altere cores/IDs no catálogo de domínio apenas por design. ElementalTimer recebe tempo formatado/callbacks e não possui relógio próprio. AppLayout, FitnessPageShell e prévia mantêm o tick existente somente quando cada casca está montada; ao mudar composição, verificar ausência de dois intervalos simultâneos. Testes `node --test tests/elemental/*.test.mjs` são locais, sem execução de browser. [Decisões e limites R04](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md). Estado vigente na continuidade; as seções datadas abaixo são histórico.

## Prévia elemental — operação local, 21/10/2026

Rotas protegidas `/previa-elemental` e `/previa-elemental/elementos/:elementId`; links antigos por query continuam compatíveis. Busca/filtro pertencem à URL, sem store adicional. Testes locais: `node --test tests/elemental/*.test.mjs`. São testes numéricos e de navegação em memória; não substituem execução do app. Build sem carregar `.env`: usar a API Vite com `envDir:false`, como registrado no [R03](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md). Inspeção via browser depende de permissão efetiva; não contornar bloqueios salvos. Antes de substituir a home, integrar seu cronômetro e ações existentes, validar paridade e matriz responsiva. Estado atual fica na continuidade/fila.

## Fontes e ordem de consulta

Após a reestruturação de 11/10/2026, o alinhamento do plano fica em 03-Project-Management/reports/BASE-CANONICA-E-EVOLUCAO.md. O changelog vigente fica em 03-Project-Management/fitness/CHANGELOG.md; CONTINUIDADE.md registra a versão atual. Referências posteriores a docs/CHANGELOG.md e BASE-CANONICA-E-EVOLUCAO.md na raiz são históricas.

AGENTS.md define as instruções locais. COORDENACAO-AGENTES.md e FILA-ENTREGAS.md definem atribuição, reserva de arquivos e aceite. BASE-CANONICA-E-EVOLUCAO.md conecta o app à referência principal `/Users/fabioandre/Developer/docs-conselho-master/README.md`. Consultar esse índice antes dos capítulos de domínio, plataforma e ADRs pertinentes. O dossiê técnico e o registro de continuidade indicados no índice local complementam a retomada; não substituem esses contratos nem o estado atual do código.

A visão canônica é gestão pessoal gamificada com Terra, Fogo, Água e Ar. A camada visual deve preservar conteúdos, core, progressão e funcionalidades. Não criar pontuação, hábitos ou persistência paralelos para acomodar uma reformulação. As inconsistências de histórico/reversão, presença, rotação e valores decimais registradas na base canônica exigem reconciliação antes de mudanças de regra.

## Mapa prático do código

| Local | Uso observado e cautela |
|---|---|
| src/main.tsx e src/App.tsx | Entrada e rotas React. App inicializa auth, aplica proteção condicional e direciona a raiz para /santuario. Conferir a importação efetiva antes de editar páginas homônimas. |
| src/pages/ e src/pages/fitness/ | Experiências do produto. Rotas /treinos importam as páginas fitness; existem arquivos de treino também na raiz de pages. Não inferir código ativo pelo nome. |
| src/pages/temporal/ | Páginas de semana, mês, ano e calendário registradas no roteador. |
| src/components/ | Componentes compartilhados e por domínio. Layout, componentes UI e CSS podem afetar várias rotas. |
| src/stores/appStore.ts, workoutStore.ts e authStore.ts | Pontos de entrada do estado de aplicação, treino e autenticação. Mudanças exigem rastrear consumidores e persistência, não apenas o componente visível. |
| src/types/, src/constants/ e src/lib/ | Tipos, catálogos e funções auxiliares. Existem helpers específicos de treino, Fitness e temporal. Preservar IDs e contratos existentes. |
| src/services/ | Serviços de integração presentes. Existência de arquivo não certifica conexão, configuração ou comportamento remoto. |
| src/index.css, src/App.css e vite.config.ts | Estilos globais e configuração de build. Vite usa base / e alias @ para src. |
| scripts/optimize-yoga-images.mjs | Script ligado ao comando images:yoga; não faz parte das verificações normais de código. |
| docs/ | Contratos locais, status, fila, changelog e evidências. Relatórios anteriores têm data e escopo próprios. |

package.json declara React 19, TypeScript 5, Vite 7, Zustand 5, React Router 7, Tailwind 3 e bibliotecas de UI, movimento e 3D. Essas são famílias declaradas; conferir o lockfile/instalação antes de discutir a versão efetivamente instalada. Puppeteer aparece como dependência de desenvolvimento; isso não prova existência de suíte automatizada.

## Comandos existentes

Executar na raiz do app, confirmando checkout e estado antes de alterações.

| Comando | Propósito e limite |
|---|---|
| npm run dev | Inicia Vite para desenvolvimento. Usar a URL/porta realmente informada pelo processo; verificar isolamento dos dados antes do navegador. |
| npm run build | Executa tsc -b e vite build. Confirma compilação/build quando passa; não testa fluxos ou layout. |
| npm run lint | Executa eslint .; registrar erros e avisos, separando os preexistentes quando houver evidência. |
| npm run preview | Serve o build local existente; gerar build compatível antes de usá-lo para validar alterações. |
| npm run images:yoga | Executa otimização de imagens; usar somente em lote de imagens com arquivos reservados. |
| git status --short e git diff --check | Inspecionam alterações e erros de whitespace; não avaliam comportamento do produto. Arquivos novos precisam também de inspeção direta. |

Não existe script test no package.json inspecionado. Não anunciar npm test ou cobertura como disponíveis. Instalação de dependências não foi necessária nem executada para esta entrega; conferir runtime, lockfile e condições do ambiente antes de instalar. Não deduzir uma versão mínima de Node deste manual.

O protótipo I03 tem testes Deno próprios para `supabase/functions/assistant-suggest/index.ts`; eles usam dependências simuladas e não substituem uma chamada real ao provedor. Consulte [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md) para comandos, configuração e limites da validação.

## Ciclo de mudança segura

1. Ler o estado de continuidade e o lote da fila; confrontá-los com git status, código atual e fila operacional indicada pelo coordenador. Se houver divergência entre checkouts, registrar a origem e não substituir trabalho mais recente pelo snapshot local. Reservar arquivos com Astro Boy e preservar mudanças anteriores.
2. Ler as skills aplicáveis. Em criação/reformulação visual, frontend-design é exigida pelo projeto; verificar o arquivo no checkout, sem supor instalação compartilhada entre executores.
3. Reproduzir o problema ou delimitar a lacuna; registrar comportamento esperado conforme contrato e referência. Documentação não autoriza reescrever regras contraditórias.
4. Fazer o menor lote coerente. Para estado/dados, rastrear criação, conclusão, reversão, recarga e consumidores antes de mudar um contrato. Para UI, preservar ações, nomes acessíveis e dados existentes.
5. Executar verificações pertinentes e revisar o diff. Reportar limites; não converter teste pendente em aprovação.
6. Responsável documental consolida versão quando cabível e atualiza os documentos reservados; Astro Boy revisa, aceita e libera a reserva.

Arquivos globais, stores, tipos, manifests, lockfile e documentos de status têm um único escritor por vez. Subagentes compartilham diretório; contexto separado não protege arquivos. Não usar staging global nem reverter alterações alheias para limpar o checkout.

## Validação proporcional

Documentação isolada: conferir referências, consistência com fontes, limites declarados e whitespace. Não requer build do produto por si só. Mudanças de código: executar lint/build pertinentes e casos funcionais afetados; falhas de ambiente e falhas do produto devem ser distinguidas. Não criar testes que apenas repitam a implementação.

Frontend: capturar estados e resoluções definidos no aceite, comparar referências reais, conferir navegação, overflow, console e acessibilidade pertinente. Para Santuário, V01 pede 360/390/768px; para Fitness, V02 pede 360/390px e o ciclo preview → iniciar → continuar → série → reload → finalizar → resumo → histórico. Esse é o roteiro de referência, não o status global dos lotes. A fila local deste worktree é anterior à operacional: segundo conferência do executor de coordenação em 09/10/2026, a fila do checkout original já registra V01 executada com reprovação em 768px e I01 em execução. Consultar a fila operacional antes de repetir testes, editar arquivos ou afirmar pendências.

Dados de teste devem ser criados pela UI em perfil temporário, sem usar perfil real, IDs fictícios ou inventar saúde/GPS. Não alterar stores/backend para montar evidência. Persistência local e integração remota são verificações diferentes. Limitações de acesso, dados ou tempo são pendências explícitas.

## Versões e releases

Procedimento detalhado em [AGENTE-VERSIONAMENTO-DOCUMENTACAO.md](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md). Em 09/10/2026, os metadados de versão e topo de docs/CHANGELOG.md convergem em 0.1.12. A entrada existente descreve mudanças de Santuário; não atribuí-las ao lote documental atual.

Ao fechar código, reservar manifests/changelog, aplicar incremento coerente e sincronizado conforme auto-versionamento e revisar o diff. A versão atualizada para I03 é 0.1.15 em package.json, nas duas posições raiz do package-lock.json e no topo do changelog. O registro descreve um protótipo local delimitado; não representa release live. Não criar uma versão por subagente dentro da mesma integração.

Este manual não identifica nem valida um pipeline de publicação. Commit, tag, push, merge e deploy dependem do escopo autorizado pelo coordenador e da verificação do destino real; não estão autorizados nesta entrega. Antes de uma release, consolidar evidências, pendências e caminho de recuperação sem sobrescrever dados do usuário.

## Evidências desta edição

Foram lidos AGENTS.md, coordenação/fila/base canônica, índice e Overview canônicos, capítulo Core vs. Módulos Nativos, ADR-001, package.json, metadados iniciais do lockfile, changelog, src/App.tsx e vite.config.ts; a estrutura de fontes foi enumerada. A skill auto-versionamento foi consultada. Não foram executados build, lint, navegador, fluxos do produto ou operações remotas. Não houve alteração de versão, código ou dependências nesta edição.

Conferência adicional do executor de coordenação: a pasta principal já declara 0.1.13 nos manifests e changelog, enquanto este worktree declara 0.1.12. Consultar [CONTINUIDADE.md](CONTINUIDADE.md); não regredir versão na integração. O reteste da correção não foi confirmado nesta entrega.


## Diretriz mobile vigente — 09/10/2026

Usuário confirmou Sol 6.1 médio e priorizou Escolher treino antes das demais telas do kit. Celular primeiro, tablet adaptado; PC deve usar interface com largura de tablet. Verificações prioritárias em 360/390px e tablet; no PC conferir apenas largura limitada e funcionamento. Esta preferência prevalece sobre orientações desktop históricas dos roteiros.


## M01 — modalidades e métricas executadas, 10/10/2026

Ver [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md): armazenamento aditivo, workload v2, compatibilidade do histórico, origem dos modelos e limites de estimativas. Não somar carga percebida e kg como se fossem a mesma medida; não interpretar notas automaticamente. A divergência do adapter entre documentação e implementação é registrada, sem reescrita do core.

## P01 / 0.1.21 — operação portável

Entrada de colaboradores em [ASTRO-BOY-BOAS-VINDAS](ASTRO-BOY-BOAS-VINDAS.md); perfil local em .astro-boy, sem rastrear IP. Regras raiz AGENTS.md, CLAUDE.md e Cursor orientam primeiro comando, com fallback explícito quando a IDE não as carregar. Skills do projeto estão versionadas em .agents/skills, inclusive Astro Boy/backend/auto-versionamento. `npm run astro:status`, `astro:welcome`, `astro:test` e `astro:audit` são comandos locais reproduzíveis. Fonte de contratos portável: docs/README.md e capítulos canônicos versionados. Auditoria estrutural em AUDITORIA-PUBLICACAO.md.
