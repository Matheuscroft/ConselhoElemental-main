## H02 — repasse atualizado para Matheus — 0.1.127

[Resumo, recebimento e prioridades backend](plans/REPASSE-BACKEND-0.1.127.md). Kimono/faixa em artes marciais; 668 testes, tipos/lint/build passaram. Publicação preparada em branch de revisão com auto-deploy desativado somente nela. Gates false, revisão SQL 127 somente local, F6/conta pessoal e fragmentos pendentes. Histórico de T01–T03 e H01 preservado; usar este repasse/inventário mais recente.

## T03 — Treinos 0.1.126: navegação do catálogo

[Catálogo em seis grupos, busca e paginação](plans/TREINOS-CATALOGO-AGRUPADO-0.1.126.md). Os 124 exercícios permanecem com IDs/objetos/conteúdo intactos; stores/cálculos preservados. 668 testes completos, tipos/lint/build passaram. Aceite visual/mobile pendente; candidato SQL 126 somente local após 125, gates false. Atualizar inventário H01 antes de publicar; GymMane/F6 continuam separados.

## T02 — ícones intuitivos de Treinos — 0.1.125 (06/11/2026)

Fábio reprovou a família T01 por baixa identificação. [Revisão e evidências](plans/TREINOS-ICONES-INTUITIVOS-0.1.125.md): os 45 ícones foram redesenhados com corpo contextual/região dourada, silhuetas de movimento e equipamentos reconhecíveis. Selos/filtros ampliados e nomes visíveis no editor. APIs/IDs/stores/catálogos/cálculos preservados. Nova proposta implementada, aceite visual do usuário pendente.

9 testes direcionados, TypeScript, lint e build passaram; prancha própria em 24/32/48px inspecionada. Não repetir como atual a suíte completa de 665 testes de T01. Sem inspeção do app/mobile por bloqueio salvo, sem contorno. Backup/versão 125 e candidato SQL 20261106033034 somente local; candidatos 123/124/125 ainda exigem escopo hospedado. Gates false; sem dados pessoais, SQL remoto ou publicação. Custódia sequencial/reservas encerradas. Próximo: avaliar nova família e conferir UI em Sol Médio quando disponível; GymMane/F6 permanecem separados. Registros abaixo históricos.

## T01 — Treinos: ícones e identidade — 0.1.124 (06/11/2026)

[Entrega, evidências e retomada](plans/TREINOS-IDENTIDADE-0.1.124.md). 45 SVGs originais; emojis/recortes antigos substituídos em modalidades, foco muscular, editor, catálogo, widget e XP. Casca/cartões/abas/botões/hero alinhados ao ouro e vidro escuro elemental. Filtros principais acessíveis, refinamentos agrupados, limpeza explícita e nomes com mais espaço. Stores/tipos/catálogos/cálculos preservados.

665 testes completos passaram; TypeScript, lint e build locais aprovados. Prancha vetorial inspecionada; sem aceite visual do app/mobile, pois a inspeção local permanece bloqueada. Versão/backup 124 e candidato SQL 20261106031901 somente local; candidatos 123/124 ainda não aplicados. Gates false, sem dados pessoais, push/deploy/SQL remoto. Reservas encerradas após custódia sequencial. Próximo: aceite visual em Sol Médio; GymMane continua plano G01, F6/conta permanece pendente. Atualizar inventário H01 antes de publicar. Registros abaixo históricos.

## Integração frontend/catálogos/main — 0.1.123 / 05/11/2026

Main be78b1e incorporada ao checkout local, com catálogos/editor remotos e fluxo de Ciclos simplificado. Contadores, recorrências/URL, recibos de XP, isolamento e F6 parcial locais preservados. Auditor de backup agora reconhece os novos grupos/tipos do catálogo e opcionais em memória; não recalcula históricos. [Escopo e evidências](plans/INTEGRACAO-MAIN-2026-11-05.md). Compatibilidade SQL 123 apenas candidata local, gates fechados; conta/progresso pessoal ainda sem aceite hospedado.

## F5 — fronteira entre Auth e progresso

Helpers de acesso não importam domínio/storage nem constroem cliente. Workspace aguarda inspeção inicial, autentica por ação e só envia pelo protocolo já existente. Callback padrão é limpo e abre conferência isolada; não seta sessão pela URL. [Decisões, compatibilidade e limitações](plans/FECHAMENTO-F5-CADASTRO-CONFIRMACAO.md). 654 testes/checks; escrita continua false, retomada persistida/conta nova/aceite real permanecem próximos.

## F4 — autenticação separada de progresso

Recuperação usa documento pré-bootstrap/cliente temporário PKCE; não hidrata estado ou adota Auth legado. Map customizado agora é realmente selecionado pelo SDK na conferência, com descarte de sessão comprovado. Arquivo de progresso permanece schemaVersion:1; patch separado autoriza produtor 121 sem reescrever base F3 ou abrir escrita. [Arquitetura e evidências](plans/FECHAMENTO-F4-RECUPERACAO-ACESSO.md). 640 testes/checks; Auth real/mobile/conta pessoal ainda pendentes.

## F3-R — contrato instalado, conta ainda não ativada

SQL integral revisado/aprovado aplicado em PG17.11, ID remoto/local 20261030202517; mesmo hash aprovado. Gate false e privilégios/RLS/triggers conferidos em catálogos. 625 testes locais após alinhar o arquivo. [Escopo e evidências](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). Sem Auth real, transferência pessoal ou Vercel; acesso cotidiano integral continua próximo em Sol Alto.

## F3 — preflight do contrato integral — 0.1.120

Banco confirmado ativo; progress_private/RPCs ausentes no catálogo. Instalação local exige dependências mínimas reais e ausência de colisões antes de qualquer CREATE; não alinha colunas legadas por reescrita. Testada variante hospedada com dados sintéticos. [Metadados, pacote/hash e limites](plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). 625 testes/checks locais; nenhum SQL de escrita remoto ou progresso pessoal transferido.

## F2 — disponibilidade remota em preparação (30/10/2026)

Projeto confirmado DominioDoMagoDB: retomada aceita, status COMING_UP; schema/RPCs hospedados ainda não conferidos. Migração integral continua local, gates mantidos. 11 testes SQL PGlite aprovados nesta rodada; produto 0.1.119 sem mudança. [Evidências/limites](plans/FECHAMENTO-F2-BANCO-HOSPEDADO.md).

## F1 — sessão online — 0.1.119

account-session-refresh serializa start/stop com visibilidade; AccountWorkspace fornece callback no handoff e mount-account-app executa/descarta sob lease protegido. Conferência continua memory-only sem refresh; dispose recusa novas escritas de token. [Contrato/evidências/limites](plans/FECHAMENTO-F1-SESSAO-ONLINE.md).

## Continuidade da data de Ciclos — 0.1.118

cycle-date-navigation gera destino de apresentação com replace, retorno Temporal validado e marcador por conta/intenção. Ciclos diferencia essa navegação interna dos deep links externos para preservar filtros; ScrollToTop respeita só mudanças internas na mesma rota. Sem nova persistência ou regra temporal. [Contrato e testes](plans/CICLOS-DATA-URL-2026-10-30.md).

## Seletor de datas de Ciclos — 0.1.117

CycleCalendarNavigation é apresentação sobre callbacks existentes: abre Dialog/Calendar, seleciona data local, cancela sem aplicar e restaura foco. Nenhuma persistência ou regra nova. [Evidências e limites](plans/CICLOS-CALENDARIO-UX-2026-10-30.md).

## Controles/preparação de lembretes na agenda — 0.1.116

`TemporalDayAgenda` inclui launcher fechado/lazy para fontes existentes task/habit/commitment. O controle importa `activity-reminder-adapter` apenas por interação; ele reaproveita captureProgress, enquanto `reminder-preparation` compara a revisão mostrada às projeções existentes e prepara transporte sem mutar domínio. `reminder-return` carrega dia/período em URL validada e o workspace usa esse destino ao sair. Gate false, sem aviso entregue/sync online ou novo store. [Detalhes e limites](plans/R27-C2-CONTROLES-E-PREPARACAO-LEMBRETES.md).

## Workspace isolado de lembretes — 0.1.115

`main.tsx` consulta `reminder-entry.ts` antes da sessão normal, monta `mount-reminder-workspace.tsx` para seleção explícita ou plano pendente e preserva prioridade de conta/restauração. Sem stores/Auth no grafo do workspace. `reminder-workspace.ts` vincula ambas as cópias de recuperação ao plano exato e aplica proteção de revisão/conta/modo/consentimento sobre os coordenadores anteriores. Interface reaproveita estilos da conferência, com gate false. Compatibilidade com sync online não foi liberada. [Detalhes e limites](plans/R27-C1-WORKSPACE-PROTEGIDO-LEMBRETES.md).

## Transporte de planos de avisos — 0.1.114

`reminder-handoff.ts` valida cópia temporária de plano por aba, sem novo store de atividades/diário de recuperação. `reminder-handoff-commit.ts` vincula o plano exato às verificações do coordenador existente. Cancelamento/retorno removem apenas transporte depois da conferência; journal e isolamento local continuam nos mecanismos anteriores. Gate false, sem rota ou workspace montado. [R27-B2B e próxima integração protegida](plans/R27-B2B-TRANSPORTE-E-RETORNO.md).

## Coordenador isolado de avisos — 0.1.113

Planner de domínio separado do grafo pré-bootstrap; coordenador constrói alvo internamente e reutiliza restauração exclusiva/diário existentes para patch do User. `REMINDER_WRITES_RELEASED=false`, sem rota/integração UI ativa. App hidratado é recusado. B2B precisa fechar handoff/retomada e ergonomia sem persistência paralela antes da ativação. [Detalhes](plans/R27-B2A-ESCRITA-ISOLADA-LEMBRETES.md).

## Metadados locais de avisos — 0.1.112

`User.reminderState` opcional segue o User completo nos mecanismos existentes de persistência, troca de perfil e snapshot integral, sem chave/store/raiz nova. `mutateOccurrenceReminder` verifica perfil/revisão; `profile-reminders` consulta projeções Temporal. `profile-reminder-codec` valida dados sem dependência de seletores/serviços, mantendo isolamento do startup/backup. Sync legado não ganha cobertura automática. Sem UI/timer/push; coordenação durável/multitab ainda pendente. [Contrato](plans/R27-B1-PERSISTENCIA-LEMBRETES.md).

## Base de lembretes — 0.1.111

`src/lib/reminders/occurrence-reminder.ts` é módulo puro não conectado ao runtime de UI. Consome projeções Temporal, identifica a ocorrência por origem/ID/dia e calcula horário/adiamento com revisão. Não substitui recorrência/store/histórico nem concede recompensas. Ainda não persistido ou entregue; próxima integração ao progresso/backup existente requer revisão em Alto. [Contrato e limites](plans/R27-A-CONTRATO-LEMBRETES.md).

## Formulários e navegação Temporal — 0.1.108

`TemporalEntryForms` trata apenas rascunho/validação e entrega entradas aos comandos existentes. Ano usa Dialog existente e query `ano`; abas e MonthShowcase conservam período/retorno local validado. Calendário agrupa controles por cadastro, preserva ocorrências no dia e exige confirmação de exclusão. Stores/helpers de domínio/economia preservados; whitelist SQL não aplicada só aceita versão. 540 testes locais, tipos/lint/build; nenhum aceite remoto ou visual. [Detalhes](plans/R26-M2C-FORMULARIOS-TEMPORAL.md).

## Hoje e Temporal — 0.1.107 / R26-M2B

Semana com agenda inline, mês compacto, links de atividade/retorno por dia e criação rápida com recorrência explícita. 531 testes, tipos/lint/build 8,43s; CSS analisado, sem QA visual. 87 fontes protegidas idênticas por SHA-256; stores/contratos/recibos/gates preservados. [Detalhes](plans/R26-M2B-HOJE-TEMPORAL-MOBILE.md). Próximo M2C Calendário/Ano em Sol Médio.

## Agenda coerente — 0.1.106 / R26-M2A

Predicado único de recorrência, edição preservada, Ritual com data local e compromissos nas quatro visões. Formulários explícitos e novas entradas anuais sobre Habit/Commitment; registros antigos preservados. 521 testes, tipos/lint/build 9,40s; sem navegador/remote/conta ativada. Constância anual e conversão de anuais legados continuam separadas. [Contrato e evidências](plans/R26-M2A-AGENDA-COMPATIVEL.md). Próximo M2B mobile em Sol Médio.

## Usabilidade mobile — 0.1.105 / R26-M1

Lote apenas de apresentação/marcação: campos file separados dos checkboxes, foco/leitura/quebra e safe areas nos workspaces; busca elemental e nota de sync ajustadas. Protocolos/stores/auth/XP intactos por SHA-256; whitelist aceita a versão nova sem schema/gates liberados. 504 globais + 22 direcionados e tipos/lint/build passaram. Sem execução visual; matriz permanece pendente. [Detalhes](plans/R26-M-REVISAO-MOBILE-ATUAL.md). Próximo Ciclos/mobile em Sol Médio.

## Escolha integral e recebimento — 0.1.104 / R25-1B6B

Revisão ligada a baseline/usuário por WeakMap; painel exige readback e confirmação. Coordenador cria revisão CAS mesmo ao receber arquivo online inalterado, cercando pedidos atrasados; journal registra before/target/operação antes do envio. Só aplica pares locais/vínculo após recibo/readback; startup bloqueia qualquer journal. Não hidrata/recalcula domínio. Identidade+hash permitem proveniência diferente do dispositivo após escolha explícita. 504 globais + 42 finais, tipos/lint/build; sem remoto/navegador/dados pessoais. Gates false. Próxima revisão frontend/mobile em Médio; aceite online/rollout separados. [Detalhes](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Sync integral durante a sessão — 0.1.103 / R25-1B6A

Entrada por callback explícito em memória, lease exclusivo, cliente transitório e documento com global Auth/legado isolado. Runtime transporta arquivo integral e serializa intent → commit/recibo → vínculo → limpeza; conserva edições novas e pausa em conflito/timeout. Adapter observa core/Fitness sem mudar stores. Workspace compara/exporta versões; não escolhe vencedor. 486 globais + 5 direcionados finais, tipos/lint/build; sem remoto/navegador. Gates false. Próxima 1B6B em Sol Alto, substituição/recebimento e recuperação próprios. [Detalhes](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Vínculo durável e guardas do rollout — 0.1.102 / R25-1B5

Metadado de recibo em account-binding, sem auth/store paralelo; account-transfer permite próximos envios por revisão e preserva tentativa em interrupção/conflito. Startup isola vínculo válido antes do cliente legado; inválido bloqueia. Serviço legado ganhou guardas de formato/identidade sob release, que continua false; fingerprint é rechecado após o await final. Stores/auth/tipos/cliente/App preservados. 467 globais e 27 direcionados finais, tipos/lint/build; sem acesso remoto/navegador. Próxima 1B6 em Sol Alto, sync contínuo/recebimento ainda pendentes. [Detalhes](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Confirmação e retomada local — 0.1.101 / R25-1B4

`account-intent/account-transfer` e `AccountWorkspace` acrescentam tentativa durável antes do commit, recibo/readback, retry explícito e continuação local isolada. Auth transitório sob ação explícita, fora do cliente global; restauração bloqueia tentativa de conta antes de escrever. Sem alteração dos nove fontes protegidos de domínio/auth/sync. 453 testes globais; 30 direcionados finais, tipos/lint/build aprovados. UI e servidor fechados, sem conta online habilitada, migração remota ou navegador. **1B5 em Sol Alto**, depois QA mobile em Médio com aviso prévio. [Fluxo e evidências](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).

## Conta integral opt-in — 0.1.100 / R25-1B3

[ADR-004](04-ADRs/ADR-004-Progresso-Integral-Opt-In.md) implementada localmente por autorização explícita de Fábio. Uma projeção remota integral do mesmo backup passa a ser o único escritor para contas opt-in; legado preservado sem sincronização paralela ativa. Transação de estado+recibo, CAS, idempotência, validação de arquivo e propriedade, gate false e guardas de writes legados; sem motor novo de XP. Clientes sem opt-in mantêm o código existente. Conta legada não é convertida automaticamente.

19 testes novos, 435 globais aprovados, tipos/lint/build (7,33s) limpos; 19 direcionados repetidos após revisão final. SQL executado em PostgreSQL 18.6/PGlite temporário e transporte ligado a esse SQL por dublê de SDK; ponte real de tipos compilada. Sem servidor/SQL remoto/segredo/conta pessoal/navegador. Stores/auth/sync/tipos/bootstrap preservados. Não há chamador de gravação montado, e confirmador não autoriza associação. [Escopo/retomada](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md): próxima confirmação e bootstrap online em Sol Alto; QA mobile/tablet depois em Sol Médio, com aviso antes.

## Pré-conferência de conta — R25-1B2 / 0.1.99

Frontend ganhou `AccountPreparation`, dentro do componente de backup do Grimório, e biblioteca somente de leitura `association-review`. A captura/arquivo assinado/auditoria/comparação existentes são reutilizadas; WeakMap guarda dados transitórios sem store persistido paralelo. Contrato de leitor remoto futuro recebe apenas usuário e sinal, sem enviar arquivo local, credenciais ou saldo. Valida identidade coincidente, revisão/cobertura completa e arquivos; estado local/usuário/geração são rechecados entre awaits. Sempre retorna autorização de associação false. Não há cliente/adaptador online novo nem política de mesclagem aprovada.

12 testes novos, 416 globais aprovados; 15 direcionados repetidos após revisão final, tipos/lint/build limpos. Stores/auth/sync/tipos/cliente/bootstrap/App preservados por SHA-256. Sem dados pessoais/SDK real/banco/navegador. [Contrato e próximos passos](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md). Sol Alto na próxima integração 1B3; aviso prévio para Sol Médio ao entrar no QA mobile ou ajustes de UI.

## Associação pessoal: cobertura e contrato — R25-1B1, 29/10/2026

[Matriz de associação](plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md) relaciona 18 campos core e 3 Fitness às projeções reais do sync: 7 coleções com payload, 5 campos parciais, 9 fora. Testes verificam roundtrip de IDs/recibos/quantidades, reenvio com mesmas linhas e falha intermediária não transacional. Não há novo motor, store, endpoint ou política de mesclagem. Fontes/manifests preservados; 0.1.98 mantida. Cinco casos novos e 155 testes de backup/lint aprovados; sem navegador/banco/dados pessoais. Contrato de identidade, leitura completa e commit/idempotência precisa de integração com Matheus antes de associar conta.

## Confirmação e continuação local — 0.1.98

[R25-1A](plans/R25-A-BACKUP-DO-PROGRESSO.md) implementa handlers pré-bootstrap e um metadado operacional, sem criar store de domínio ou alterar diário v1. A transferência committed → modo local grava/verifica o marcador antes de liberar o diário. O bootstrap seleciona isolamento por documento; `src/lib/supabase.ts` não constrói o cliente nesse modo. O aviso global explica armazenamento local e oferece exportação no Grimório; não existe associação automática nem API de remoção do isolamento. AuthStore, serviço cloud, stores, tipos e fórmulas preservados neste lote.

21 testes novos, 399 globais aprovados, tipos/lint/build limpos. Frontend de cliente/auth e stores reais foram usados com SDK/storage sintéticos, sem navegador, backend ou dados pessoais. Gravação na UI permanece bloqueada estaticamente até aceite real de abas/interrupção/reload/mobile. A conta pessoal 1B requer contrato próprio com Matheus.

## Barreira durável pós-confirmação — 0.1.97

[R25-A2b11](plans/R25-A-BACKUP-DO-PROGRESSO.md) reutiliza o diário existente, versão 1: a fase committed deixa de ser removida pela aplicação/recuperação e passa a impedir App/auth/cliente antes da hidratação normal. Não há nova chave, migração ou store de domínio; rollback de prepared mantém semântica de bytes anteriores. O frontend de conferência explica o isolamento e mantém downloads protegidos. Quatro testes novos e regressões adaptadas passaram na suíte global de 378 testes; tipos/lint/build aprovados. Backend/stores/main preservados. A liberação para uso local ou associação ainda não existe; writer da UI e testes reais permanecem pendentes.

## Compatibilidade de restauração com auth/sync — R25-A2b10

[Auditoria](plans/R25-A-ISOLAMENTO-AUTH-SYNC.md) demonstra em cliente sintético que o bootstrap cloud-first existente não é uma continuação isolada da recuperação local. Testes exercitam código real de auth/serviço e core; confirmam pull/substituição, reset condicional, uploads automáticos, vínculo remoto não delimitado por perfil local, resposta tardia após logout e escopo parcial de payload. Não houve mudança de backend/produto ou acesso remoto pessoal; 125 testes de backup e lint passaram, versão 0.1.96 mantida. Próxima integração exige barreira anterior ao grafo App/auth/cliente e contrato com Matheus; proposta não equivale a implementação ou aprovação de migração.

## Validação de ciclo de documentos — R25-A2b9, 29/10/2026

Seis testes novos conectam o protocolo existente a instâncias independentes dos stores reais em Map compartilhado de teste: exclusão entre abas, interrupção de aplicação/rollback, revisão obsoleta, bloqueio de hidratação e recargas sem replay de recompensas. Todas as fontes do produto permaneceram idênticas por SHA-256; versão 0.1.96 mantida. 116 testes de backup, lint e diff-check passaram. [Registro](plans/R25-A-BACKUP-DO-PROGRESSO.md). Auth/autosync e execução real de navegador não participam da simulação; são critérios ainda pendentes, sem habilitação de restauração.

## Confirmação vinculada e exportação protegida — 0.1.96

[R25-A2b8](plans/R25-A-BACKUP-DO-PROGRESSO.md) endurece o contrato interno do coordenador exclusivo de recuperação: consentimento booleano e baseline conferido obrigatórios, capturados antes do primeiro await. Dois defeitos foram reproduzidos por regressões antes da mudança. `createRecoverySafetyCopy` serializa somente um dos pares validados do diário e reconfere a atualidade antes de devolver arquivo; não grava em stores. A interface oferece download por versão e mantém detalhes durante a espera. Nenhum chamador de gravação de produção foi ativado; formatos de domínio e backend preservados. 359 testes totais, 110 de backup repetidos após ajuste final; QA real de abas/reload continua pendente.

## Conferência isolada de recuperação — 0.1.95

[R25-A2b7](plans/R25-A-BACKUP-DO-PROGRESSO.md) acrescenta inspeção somente leitura ao protocolo existente e à tela pré-bootstrap. Nenhuma recuperação é executada pela UI; o coordenador exclusivo permanece sem chamador de produção. As versões protegidas são validadas antes de resumir; as chaves atuais servem somente à detecção de conflito/obsolescência. Auditoria adiciona identidade/fase de sessão e correlação de recibos sem exigir alvos históricos ainda presentes. 12 testes novos; 350 totais e 101 de backup repetidos após ajustes finais; sem QA renderizado, dados pessoais ou mudança de domínio/stores.

## Metadados de Treinos — 0.1.94

Auditor puro ampliado para os dois catálogos, avaliações, recordes e indicadores persistidos, incluindo perfis inativos. Reutiliza fronteira de leitura do diário; sem store/schema novo ou cálculo de recompensa. 89 testes de backup e checks aprovados. A reconciliação integral de vínculos e o restore real permanecem pendentes. [Registro R25-A2b6](plans/R25-A-BACKUP-DO-PROGRESSO.md). O inventário anterior abaixo descreve 0.1.93.

## Compatibilidade pendente em Treinos — R25-A2b5

Auditoria estática de `fitness-audit.ts` e `WorkoutAccountData` delimitou campos persistidos que não são validados (`exercisesCatalog`, `ratings`, `strengthRecords`, `strengthProgressPoints`, `strengthStat`) e referências cruzadas ainda não reconciliadas. Isso é lacuna de cobertura, não evidência de dados do usuário corrompidos. O próximo lote deve derivar invariantes dos produtores/remoções e preservar snapshots históricos antes de fechar validação do backup. Sem alteração de código/versão ou testes nesta etapa. [Matriz e critérios](plans/R25-A-BACKUP-DO-PROGRESSO.md).

## Interface R25-A2b4 — 0.1.93

Mount React separado de App/stores/auth, escolhido antes do bootstrap. Compara bytes persistidos e prepara download sem escrita; storage/cancelamento invalidam operações. Roteia pendência sem aplicar recuperação automática. 334 testes totais, 85 de backup repetidos e checks finais aprovados; [limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). Nenhum chamador de produção do coordenador exclusivo; aplicação continua desabilitada.

## Compatibilidade R25-A2b3 — 0.1.92

Validação dos bytes de ambos os stores antes de aplicar/recuperar; auditoria de vínculos/hidratação legado; coordenador exclusivo pré-bootstrap sem chamador de produção. Sem novo motor de domínio ou alteração de auth/sync. 12 testes novos, 320 totais; tipos/lint/build aprovados. [Registro e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). UI/recuperação automática e QA de abas continuam pendentes.

## Auditoria de Treinos R25-A2b2d — 0.1.91

`fitness-audit.ts` amplia a leitura crítica de backup sem importar stores nem alterar contratos. Seis testes com comandos reais em memória; 308 totais e checks aprovados. [Plano](plans/R25-A-BACKUP-DO-PROGRESSO.md). Validação integral de vínculos/diário e aplicação permanecem pendentes.

## Auditoria crítica R25-A2b2c — 0.1.90

Validador puro sobre arquivo já conferido, integrado à comparação e preparo do diário; sem novo modelo de domínio. Oito regressões novas, 302 testes e build aprovados. [Cobertura parcial e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). Preserva estruturas desconhecidas, não migra, não executa recompensa. Validação integral de Treinos/diário e aplicação ainda pendentes.

## Bootstrap R25-A2b2b — 0.1.89

Separação entre entrypoint estático sem stores e montagem dinâmica. Checagem somente leitura de diário; lease Web Locks compartilhada quando disponível. Tela pré-React com identidade existente. Nenhuma integração de recuperação automática ou alteração de sync. 294 testes e build aprovados; [contrato e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). Abas antigas e execução real de browser ainda não cobertas.

## Recuperação R25-A2b2a — 0.1.88

Biblioteca isolada com storage injetado e fases prepared/committed; reaproveita envelopes existentes sem engine de recompensa. 12 testes novos de falhas e recarga, 285 na suíte; sem import de produção. [Plano e limites](plans/R25-A-BACKUP-DO-PROGRESSO.md). Bootstrap, lock entre abas, isolamento de sync e validação integral ainda são dependências de integração.

## Prévia comparativa R25-A2b1 — 0.1.87

Comparação pura por identidade/conteúdo com estado temporário de UI, sem novo store. Interface em Grimório; snapshots inválidos/alterados falham sem gravação. [Plano](plans/R25-A-BACKUP-DO-PROGRESSO.md) registra 273 testes, 24 de backup repetidos e checks finais. Stores/auth/cloud/tipos intactos. Inspeção do autosync e da ordem de imports exige diário/recuperação antes de hidratar e isolamento de rede em A2b2; nada disso foi habilitado neste lote.

## Preservação local R25-A2a — 0.1.86

[Registro técnico](plans/R25-A-BACKUP-DO-PROGRESSO.md). Ajustes delimitados em snapshot de conta de saída/identidade e callback de hidratação de Treinos, sem novo schema/store. Exportação exige carregamento completo. Seis regressões novas, 264 testes totais, tipos/lint/build passaram. Contratos de recompensa e serviço remoto intactos. Restauração transacional é A2b; não houve acesso a dados pessoais.

## Arquivo de progresso R25-A1 — 0.1.85

[Plano e evidências](plans/R25-A-BACKUP-DO-PROGRESSO.md): exportação usa as funções partialize existentes do core e de Treinos, sem nova persistência. Arquivo versionado com SHA-256 e conferência pura; interface no Grimório. Não inclui authStore, não restaura nem sincroniza. 258 testes e checks passaram; roundtrip isolado é evidência limitada, não restauração transacional real. Dois riscos de criação de conta/hidratação foram reproduzidos e registrados para A2. Stores/core preservados neste lote.

## Contexto dos formulários — 0.1.84

[R28-F5](plans/R28-F-REVISAO-MOBILE.md) restringe estado transitório de Invocar à conta atual e cancela sugestões obsoletas. Forja recebe guardas contra callbacks de conta anterior. Stores, tipos e backend preservados; não é migração de dados nem implementação de backup R25. Testes com promises/dublês; QA mobile e I03 remoto não executados.

## Apresentação de recompensas R29-D — 0.1.83

[R29-D](plans/R29-D-RECOMPENSAS-VISUAIS.md) unifica recibos em componentes puros e adiciona observador transitório da lista de Rituais, sem novo store/persistência. Ciclos, trilhas, conquistas e resumo de Treinos reutilizam o visual. 243 testes, tipos, lint e build passaram. Integridade dos stores/tipos/helpers verificada neste lote; QA renderizado/sync permanecem pendentes.

## Conquistas R29-C — 0.1.82

[R29-C](plans/R29-C-CONQUISTAS.md) adiciona comando explícito de bônus no store existente e snapshot opcional em Quest/Project. Reutiliza a projeção de vínculos extraída para lib/quest-trails, sem outro motor de pontuação. Painel nas trilhas e catálogos; progress visual derivado de estado atual. 238 testes e verificações estáticas/build passaram; QA renderizado/sync não executados.

## Extensão local R29-R/B — 0.1.81

[Recuperação e Rituais](plans/R29-RECUPERACAO-E-RITUAIS.md): plano histórico a partir de recibos e recompensa por transição de folha nos comandos existentes. Sem novo store, backend ou motor de níveis. Campos opcionais preservam compatibilidade local; sincronização e unificação de actions/projeções não validadas. 231 testes, tipos, lint e build passaram; saldo pessoal e QA visual não verificados.

# Dossiê técnico — Conselho Elemental / Domínio do Mago

## Exploração compartilhada — 0.1.72

[Entrega R28-C](plans/R28-C-EXPLORACAO-LEITURA.md). `RevealPanel` centraliza expansão e isolamento dos controles recolhidos. `NavigationGroup` é compartilhado por Mapa/Explorar: validar ambos ao alterá-lo. Filtros do Mapa são estado de URL, sem persistência paralela de atividades. Roteiro mobile pendente no plano; testes SSR/MemoryRouter são verificação estrutural.

## Movimento em criação — 0.1.71

[Entrega R28-B](plans/R28-B-CRIACAO-ORGANIZACAO.md). Transições ficam na apresentação; confirmações respondem a comandos existentes. Não atrasar gravação até terminar animação. Invocar mantém o resultado até escolha do usuário; Forja devolve foco após diálogo. Testes de apresentação não substituem roteiro mobile documentado; sem alteração de persistência/economia.

## Contador genérico de atividades — R27

A pedido de Fábio, quantidades diárias são registros opcionais da action/hábito existente, separados de subitens fixos e confirmação de conclusão. Sem categorias de atividade predefinidas, XP adicional ou migração. [Contrato, implementação e limites](plans/R27-QUANTIDADES-DIARIAS.md). Implementado localmente na 0.1.69; sincronização remota e aceite mobile pendentes.

## Publicação da repaginação — 0.1.48

Repasse acumulado I03/R01–R11 preparado por pedido explícito de Fábio. Backend permanece com Matheus; frontend e acabamento seguem com Fábio. Correções integradas incluem navegação/timer, hooks, histórico real no Astrolábio e onboarding atualizado. Stores, fórmulas e contratos existentes preservados; dados e infraestrutura não migrados. [Repasse completo](REPASSE-FRONTEND-PARA-BACKEND.md) · [Evidências R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

## Trilhas de quests — 0.1.47

Padrões de percurso, seleção e retorno do kit comunitário Duolingo adaptados à magia elemental. Jornadas/Grandes Obras existentes viram trilhas de rituais; Santuário oferece próximas etapas. Acesso livre confirmado pelo usuário. Contagem de rituais é projeção visual, sem segundo motor ou sincronização silenciosa de snapshots/progresso macro. Conclusão e persistência continuam no store atual. Implementado localmente; QA visual/fluxo de navegador pendente. [Escopo, evidências e retomada R10](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

## Ficha e histórico do Grimório — 0.1.46

Uma ficha substitui a duplicação de avatar/status: corpo elemental aprovado, recursos em vidro, maestria geral/elemental e histórico somente leitura. Fontes reais de progresso e gravação do perfil preservadas; nenhum inventário/badge ou evento de domínio fabricado. Projeção de histórico não recalcula totais. Divergências existentes de Prana/precisão de XP registradas, sem alteração de contrato. [Decisões e evidências R09](03-Project-Management/reports/R09-GRIMORIO.md); validação renderizada pendente por bloqueio efetivo do navegador.

## Home definitiva e UI compartilhada — 0.1.45

Autorização explícita do usuário aposentou a UI clássica. Removidos somente página, palco e CSS exclusivos; modelos/recursos compartilhados preservados. Cabeçalho e composição de Ciclos são apresentação sobre contratos existentes. Sem alteração de backend, cálculos ou dados. [Evidências R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

## Redesign de Ciclos — 0.1.44

Camada de descoberta/organização visual sobre a composição existente: calendário Expanded Cards e Showcase de sequências/evolução/estados vazios. A única mudança no efeito antigo de datas é rolagem de apresentação. Novo Showcase de sequência recebe membros, atual e callbacks; não substitui o motor de recorrência. Ciclos conserva cálculo, relógios, completion, reordenação e integrações de Fitness. Autorização atual cobre UX/UI, não mudanças de regras. Revisão renderizada permanece pendente. [Escopo e evidências](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

## Iconografia transversal — 0.1.43

Família SVG autoral separada de constants e persistência. Navegação reaproveita catálogo de rotas; Expansão/Showcase organizam descoberta sem novo estado de domínio. Emojis especializados continuam pendentes; não confundir camada compartilhada com migração integral. [Escopo, preservação e evidências](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

## Apresentação temporal — 0.1.42 / 22/10/2026

Lua passa a usar efemérides da Astronomy Engine existente e uma esfera Three.js com mapas NASA locais. Esta camada é somente leitura, separada dos helpers legados e sem impacto em XP/Prana/persistência. Vista de referência por hemisfério não simula a orientação exata do céu local. Estações mantém calendário aproximado existente; Ano/Mês mantêm handlers e métricas. Expanded em Estações e Showcase nos meses complementam a identidade transversal. [Fontes, divergência lunar e limites de validação](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

## Santuário canônico e Pilares — 0.1.41 / 22/10/2026

Home canônica em `/santuario`, elementos em `/santuario/elementos/:elementId`. Prévia redireciona; home clássica permanece como alternativa. TopBar em modo accountOnly reutiliza conta; SanctuaryRituals delega operações existentes com proteção por conta/ritual/sessão. Não montar AppLayout junto com a casca elemental, que já mantém o tick existente. Pilares usa os getters reais e leva às páginas elementais. [Implementação, testes e QA pendente](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md). Este registro atualiza as pendências de promoção/início/conclusão mencionadas no histórico abaixo, sem declarar paridade visual validada.


> Atualizado em 13/10/2026 após a sincronização de Matheus. Para estado operacional e próximo passo, consultar CONTINUIDADE.md; este dossiê registra escopo e limites arquiteturais.

Edição documental: 09/10/2026. Custódia: Versionamento e documentação; decisões: Astro Boy. Descreve origem verificável, escopo e evidências; não substitui os contratos canônicos ou a fila operacional.

## Identidade e escopo

Gestão pessoal gamificada com magia elemental: atividades, hábitos, projetos, lazer, estudos, casa, treino, saúde e acompanhamento emocional. Evoluir o aplicativo existente preservando conteúdos, dados e progressão. Os nomes Conselho Elemental / Domínio do Mago são usados no pedido; não implicam renomeação técnica do pacote (`my-app`).

Limites: não criar motor paralelo de pontuação/hábitos/persistência, inventário fictício, métricas de saúde/GPS inventadas ou reformulação geral sem escopo. Recursos de jogo não são medições clínicas. Assistente, astrologia e módulos conceituais exigem comprovação própria de implementação.

## Identidade transversal — 22/10/2026 / 0.1.40

A decisão do usuário tornou a identidade da prévia o padrão de todo o app. Fundação de tema integrada aos aliases compartilhados; primeiro lote inclui ExpandedElements em Pilares, ShowcaseCard nas listas de Jornadas/Grandes Obras, ElementalTimer nos modais simples e busca de navegação. Componentes de apresentação recebem dados/callbacks; não duplicam stores ou regras. Prévia agora mantém o tick existente; início/conclusão na home nova e paridade integrada continuam pendentes. [Alcance e evidências R04](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md). Os relatos anteriores abaixo representam suas datas, não o estado operacional atual.

## Camada visual elemental — R02/R03, 21/10/2026

Prévia lazy e protegida reutiliza getters atuais de progresso, recursos e áreas, com estilos escopados e assets locais. Órbita/material Canvas são apresentação; não escrevem pontuação ou atributos. R03 adiciona rotas dos quatro elementos, filtros em URL e links aos módulos existentes. A exceção de rolagem em ScrollToTop aplica-se somente à edição marcada de filtros na mesma página elemental. Backend/stores/Fitness permanecem preservados. `/santuario` vigente continua independente: ciclo do cronômetro e ações da home ainda exigem integração/QA antes de substituição. [Relatório R03 e evidências delimitadas](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md).

## De onde veio — evidência disponível

- A fonte principal `/Users/fabioandre/Developer/docs-conselho-master/README.md` registra a decomposição de documentos monolíticos em Overview, Domain Core, Platform Architecture e ADRs. Não inferir data de fundação, autores ou trajetória anterior não documentada.
- ADR-001, datado de 20/02/2026, decide hábito como Action com recorrência. É uma decisão de contrato, não evidência de que cada store atual já está conforme.
- O histórico Git local contém `2c4abe7` (04/10/2026), restauração de funções do treino após conflitos, e `03f0588` (06/10/2026), integração Fitness UI Kit e fundo aurora. As mensagens documentam intenção; aceitação exige diff e evidência.
- O changelog local registra até 0.1.12, com palco de personagem no Santuário. Há mudanças ainda não commitadas. Não confundir versão declarada com release entregue ou publicada.
- Em 08/10 houve organização da coordenação e validação V01 no checkout principal; em 09/10, esta entrega estrutura a manutenção documental. Consulte CONTINUIDADE para diferenças entre checkouts.

## Arquitetura observada e arquitetura pretendida

| Camada | Evidência atual | Limite da conclusão |
|---|---|---|
| Aplicativo | package.json: React, TypeScript, Vite, Zustand; src/App.tsx: composição das rotas | Dependências/rotas não provam cada fluxo |
| Apresentação | src/pages, src/components; telas Fitness ativas importadas de pages/fitness | Arquivos de páginas antigas coexistem; rastrear imports antes de editar |
| Estado | src/stores/appStore.ts, workoutStore.ts, authStore.ts | Não certificar persistência remota ou invariantes só pela presença |
| Domínio | src/types, src/constants, src/lib; contratos canônicos separados | Auditoria D01 reconcilia contrato e implementação; não migrar automaticamente |
| Contrato de plataforma | Core genérico + módulos nativos via adapters, descritos no índice canônico | I03 acrescenta somente sugestão textual autenticada e confirmada pelo fluxo local de rascunho; a implementação integral do assistente e dos adapters permanece sem comprovação |
| Evidências | STATUS-SANTUARIO, STATUS-FRONTEND-FITNESS, fila e relatórios por lote | Relatórios são datados e vinculados ao checkout; não herdar aprovação em outro estado |

Inventário detalhado está em FILA-ENTREGAS; atualizar sua evidência quando o código mudar em vez de manter outra lista de tarefas aqui.

### Assistente — protótipo I03

Em 09/10/2026, o lote I03 implementou em `src/pages/Invocar.tsx` uma ajuda opcional para redigir título e descrição e a Edge Function `supabase/functions/assistant-suggest`. O envio requer consentimento explícito e autenticação; o modelo só propõe campos de rascunho, que a pessoa edita e confirma pelo `addDraft` existente. A função não consulta perfil nem executa operações de domínio. Detalhes, controles e evidências estão em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md).

O capítulo canônico de LLM e voz especifica conversa, Gemini, ferramentas de consulta/classificação/conclusão executadas no backend e auditoria. I03 não implementa esses fluxos: usa Cloudflare para uma sugestão fechada e gravação local após confirmação humana. Portanto, é uma etapa parcial de protótipo, sem chamada live, secrets configurados ou deploy; não certifica a arquitetura conversacional completa.

## Sincronização de Matheus — 13/10/2026

origin/main foi integrado por fast-forward em b1575e4. A linha atual inclui templates e sessões de Fitness, integração nativa de conclusão com Core, sequências compartilhadas com Ciclos, histórico e mudanças na navegação. Build, lint e teste isolado do protótipo I03 foram executados localmente; revisão visual/funcional dos novos fluxos continua pendente. As migrations de sequência estão versionadas, não aplicadas remotamente. A revisão identificou incompatibilidade inicial entre os novos tipos de domínio e telas/stores legados; a compatibilidade foi recomposta e o build passou. A divergência semântica/XP com a fonte externa está registrada em CONTINUIDADE.md.

## Invariantes e divergências

Folhas Task pontuam, agregadores somam; Check/Note têm contratos próprios; valores planejados e históricos são distintos; Quest referencia Actions; hábito compartilha o contrato de Action; Prana é recurso de jogo limitado. Ler a base canônica e os capítulos de domínio antes de alterar qualquer regra.

BASE-CANONICA-E-EVOLUCAO lista quatro inconsistências documentais (reversão/histórico, presença no exemplo multi-área, rotação pausada e decimais). Elas exigem reconciliação, não correção automática do código.

Achados estáticos confirmados em 09/10 neste worktree: CharacterStage calcula HP localmente em linha 18; Astrolabio gera valores de histórico com Math.random em linhas 43–46. D01/D02 devem avaliar contrato e comportamento antes de alterações. A inspeção não atesta defeito numérico nem equivale a teste funcional.

## Fontes e atualização

Ordem: instruções atuais do usuário e AGENTS.md; fonte canônica e ADRs pertinentes; código e evidência executada; fila e registros datados. Divergência entre contrato e código deve ser relatada, sem escolher silenciosamente um deles como regra nova.

Não copiar segredos, dados pessoais ou conteúdo de .env para o dossiê. Referenciar caminhos e nomes de configuração apenas quando necessário. Mudanças arquiteturais relevantes exigem registro de decisão com problema, alternativas, decisão, consequências, estado e evidências; preservar ADRs anteriores. Atualizar este documento quando identidade, estrutura ou limites mudarem; os passos correntes ficam em CONTINUIDADE.


## M01 — modalidades e métricas executadas, 10/10/2026

Ver [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md): armazenamento aditivo, workload v2, compatibilidade do histórico, origem dos modelos e limites de estimativas. Não somar carga percebida e kg como se fossem a mesma medida; não interpretar notas automaticamente. A divergência do adapter entre documentação e implementação é registrada, sem reescrita do core.

## P01 / 0.1.21 — operação portável

Entrada de colaboradores em [ASTRO-BOY-BOAS-VINDAS](ASTRO-BOY-BOAS-VINDAS.md); perfil local em .astro-boy, sem rastrear IP. Regras raiz AGENTS.md, CLAUDE.md e Cursor orientam primeiro comando, com fallback explícito quando a IDE não as carregar. Skills do projeto estão versionadas em .agents/skills, inclusive Astro Boy/backend/auto-versionamento. `npm run astro:status`, `astro:welcome`, `astro:test` e `astro:audit` são comandos locais reproduzíveis. Fonte de contratos portável: docs/README.md e capítulos canônicos versionados. Auditoria estrutural em AUDITORIA-PUBLICACAO.md.
