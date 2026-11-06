## 0.1.127 — 06/11/2026 · artes marciais e repasse para backend

- Ícone de artes marciais redesenhado como kimono com faixa dourada; mesmos nomes/APIs/modalidade. Prancha vetorial em tamanhos reais inspecionada.
- Pacote local integrado preparado para Matheus: README raiz/app, repasse, inventário e prioridades de conta/F6/compatibilidade/fragmentos. Configuração Vercel impede auto-deploy apenas da branch de revisão; cache CLI fora do Git, arquivo local preservado.
- Compatibilidade de backup do produtor 127 em candidato SQL separado somente local; migrações anteriores/gates preservados.
- 668 testes completos, tipos/lint/build passaram. [Repasse e limites](../../plans/REPASSE-BACKEND-0.1.127.md). Sem aceite visual do app/mobile, dados pessoais ou SQL remoto.

## 0.1.126 — 06/11/2026 · catálogo de Treinos organizado

- 124 exercícios em seis grupos recolhidos com contadores e músculos; abertura progressiva em lotes de oito, recolhimento com foco e lista opcional.
- Busca direta sem acentos/caixa por nome, músculo e equipamento, filtros preservados e resultados em lotes de 12. IDs/objetos/catálogos/stores/cálculos intactos.
- Compatibilidade de backup 126 em candidato SQL separado somente local, sem alterar migrações anteriores/gates.
- 668 testes completos, tipos/lint/build passaram. [Evidências e limites](../../plans/TREINOS-CATALOGO-AGRUPADO-0.1.126.md). Aceite visual ainda pendente; sem publicação ou banco remoto.

## 0.1.125 — 06/11/2026 · ícones de Treinos mais intuitivos

- Redesenhados os 45 símbolos após feedback de baixa identificação: contexto corporal cinza com região dourada, modalidades em movimento e equipamentos mais literais.
- Escala ampliada em selos/filtros e rótulos visíveis no editor. APIs, catálogos, seleção, stores e cálculos preservados.
- Backup aceita produtor 125; candidato SQL separado somente local, sem alterar revisões anteriores/gates.
- 9 testes direcionados, tipos/lint/build passaram; prancha em 24/32/48px inspecionada. [Evidências e limites](../../plans/TREINOS-ICONES-INTUITIVOS-0.1.125.md). Aceite visual no app ainda pendente; sem publicação/banco remoto.

## 0.1.124 — 06/11/2026 · Treinos com identidade elemental

- 45 SVGs originais para modalidades, regiões/músculos e equipamentos; substituídos emojis/recortes antigos no catálogo, editor, foco dos treinos, widgets e XP.
- Cartões, selos, abas, botões, FAB, cabeçalhos e hero alinhados ao ouro/vidro escuro do app. Filtros agrupados com reset, nomes de exercícios em até duas linhas e controles com foco visível.
- Dados, IDs, stores e cálculos preservados. Compatibilidade de backup do produtor 124 em revisão SQL candidata **somente local**, sem alterar migrações anteriores ou gates.
- 665 testes completos, tipos/lint/build locais aprovados; prancha de ícones inspecionada. Aceite visual do app/mobile pendente. [Evidências e limites](../../plans/TREINOS-IDENTIDADE-0.1.124.md). Sem GymMane importado, SQL remoto, push ou deploy.

## 0.1.123 — 05/11/2026 · integração da main e compatibilidade

- Pull ff-only de 3026e75/be78b1e com snapshot local preservado; catálogos/editor de treino remotos integrados ao frontend local.
- Ciclos combina checkbox/árvore simplificados e edição contextual remotos com contador diário, recorrência/URL e feedback/recibos locais. Corrigido reset indevido da recorrência ao editar.
- Backup compatível com os novos grupos musculares, fonte musculacao e opcionais do catálogo; campos inválidos continuam rejeitados. Sem alterar fórmulas ou recalcular progresso.
- Tipos de UI e fixtures de regressão reconciliados. F6 de acesso retomável preservada, ainda parcial. Candidato SQL 123 apenas local; gates fechados e migrações instaladas intactas.
- [Custódia, resultados e limites](../../plans/INTEGRACAO-MAIN-2026-11-05.md). Sem push, deploy, conta real ou transferência pessoal.

## 0.1.122 — 2026-10-30

- F5: modos separados de login/cadastro, confirmação de senha, reenvio explícito de e-mail e feedback junto ao acesso. Autenticar não exige cópia; transferir progresso mantém proteções e consentimentos existentes.
- Retorno de Auth na URL padrão é limpo e isolado antes de App/legado, sem adotar tokens. Signup não concede autoridade de transferência; login confere getUser/identidade e aguarda inspeção do contexto.
- Compatibilidade do produtor 122 aplicada por revisão privada separada com gate false, mantendo SQL anterior/formato/regras intactos.
- 33 direcionados e 654 testes globais, TypeScript/lint e build envDir:false (36,81s) passaram. Sem conta/e-mail real, transferência pessoal, inspeção visual ou deploy/push. Próximo retomada após reload em Sol Alto.

## 0.1.121 — 2026-10-30

- F4: recuperação isolada PKCE com código retirado da URL, verificação de conta, confirmação de senha e saída apenas da sessão temporária. Gate continua false, sem envio real de e-mail/conta pessoal.
- Corrigido uso do SDK: persistSession:true seleciona Map próprio, sem tokens no disco; descarte e resposta tardia testados no SDK instalado.
- Validador hospedado aceita produtor 121 por revisão separada/condicionada ao hash e gate fechado, sem alterar migração-base, formato, XP ou arquivos guardados.
- 640 testes finais, TypeScript/lint e build envDir:false (21,66s) passaram. Validador puro PG17 conferido com estrutura sintética, sem Auth/commit real, deploy ou transferência pessoal.

## 0.1.120 — 2026-10-30

- F3: preflight da migração integral recusa instalação existente, dependências incompatíveis, propriedade sem UUID obrigatório e tabelas legadas sem RLS antes de criar objetos.
- Teste da variante de colunas observada no banco hospedado, preservando linhas sintéticas, colunas, políticas e triggers anteriores. Escrita continua fechada por padrão.
- 23 testes direcionados e 625 globais, TypeScript/lint e build envDir:false (35,47s) aprovados.
- Após autorização explícita, migração integral aplicada no DominioDoMagoDB com escrita false e permissões/RLS/triggers conferidos. Arquivo alinhado ao ID remoto 20261030202517, hash aprovado preservado. 625 testes novamente após o alinhamento; login/sync reais e progresso pessoal ainda pendentes, sem deploy.

## 0.1.119 — 2026-10-30

- F1: renovação de tokens somente no handoff online confirmado; visibilidade e cleanup serializados, sem credenciais persistidas.
- Dispose idempotente impede repopulação tardia do armazenamento em memória.
- 621 testes globais, tipos/lint/build (43,06s) passaram. Projeto Supabase confirmado inativo; sem validação hospedada, ativação de gates ou deploy.

## 0.1.118 — 2026-10-30

- Ciclos sincroniza seleção de dia/Hoje/calendário com URL; replace sem scroll e contexto de retorno validado.
- Seleção interna preserva filtros/aba; deep links e conta mantêm tratamento anterior. Virada do dia conserva regra existente e atualiza URL quando segue Hoje.
- Quatro testes novos; 614 globais, tipos/lint/build (37,80s) aprovados. Aceite browser/mobile pendente; dados e gates preservados.

## 0.1.117 — 2026-10-30

- Ciclos: data selecionada abre calendário; Hoje separado. Diálogo/sheet com mês pt-BR, salto direto e cancelamento sem seleção.
- Mantidos callbacks de janela/data e Expanded Cards; foco retorna ao seletor sem scroll.
- Cinco testes novos, 610 globais, tipos/lint/build (44,01s) aprovados. Sem aceite visual/mobile; dados e regras preservados.

## 0.1.116 — 2026-10-30

- R27-C2: controles inline da agenda conectados ao planner/transporte/conferência existentes, por lazy import e ainda ocultos pelo gate false.
- Preparação confere projeções live/persistidas, perfil/modo/ocorrência e readback; campos mantidos em falha, sem gravação de domínio no App hidratado.
- Retorno seguro ao período/dia Temporal; cancela só o próprio transporte quando seguro e conserva plano/journal em falha ambígua.
- 16 testes novos; 605 globais, tipos/lint/build (40,74s) e parse CSS passaram. Sem browser real, notificações ou sync online. Próximo aceite em Sol Médio.

## 0.1.115 — 2026-10-30

- R27-C1: entrada pré-bootstrap e conferência isolada dos planos de lembretes, com retorno/cancelamento/recuperação associados ao plano revisado.
- Consentimentos separados, revogação por alterações, proteção de toque duplo; sem mudança silenciosa do modo local ou sincronização de contas.
- 16 testes novos; 589 globais, TypeScript/lint/build (32,32s) aprovados. Gate de gravação false; sem controles ativos nas atividades/timer/push ou aceite visual.
- Dados/stores/serviços/cálculos preservados; whitelist SQL NÃO aplicada somente versão. Próximo C2 integração da preparação em Sol Alto.

## 0.1.114 — 2026-10-30

- R27-B2B: transporte temporário por aba com cópia validada, checksum/origem, readback e vínculo do plano exato ao coordenador existente.
- Cancelamento limpa só o plano; recuperação pendente é preservada. Retorno exige alvo conferido, journal encerrado, modo local e confirmação nova.
- Oito testes novos; 29 de lembretes e 573 globais aprovados; TypeScript/lint/build envDir:false (25,83s). Testes usam storage/locks sintéticos, sem QA real.
- Servidor local reiniciado na porta 5173; painel solicitado, retorno queued, renderização não confirmada. Gate/UI/push seguem fechados. Próximo R27-C em Sol Alto.

## 0.1.113 — 2026-10-30

- R27-B2A: planner e coordenador isolado reutilizam lease global/journal/readback/recuperação; alvo limitado aos metadados de avisos.
- Gate de escrita de lembretes permanece false; sem UI/timer/push ou gravação pessoal.
- Sete testes novos, 565 globais, tipos/lint/build envDir:false (27,78s); interrupções em quatro gravações e concorrência cooperativa em mocks.
- Fontes anteriores intactas salvo whitelists; sem remoto/deploy/push. Próximo B2B handoff/cancelamento em Sol Alto.

## 0.1.112 — 2026-10-30

- R27-B1: metadados opcionais de avisos no User, persistência/recarga/troca de perfil e backup integral existentes, sem raiz/store novo.
- Comando com conta/usuário/revisão e elegibilidade por projeção/histórico; auditoria rejeita metadados inválidos e conserva compatibilidade sem campo.
- Codec separado da agenda para preservar grafo de startup/recuperação após regressão detectada na primeira global.
- 558 globais finais, 14 lembretes/35 direcionados, tipos/lint/build (30,32s) aprovados. Sem QA visual/remoto, UI/timer/push, migração ou publicação. Próximo B2 durabilidade/multitab em Sol Alto.

## 0.1.111 — 2026-10-30

- R27-A: contrato/módulo puro de lembretes por ocorrência Temporal, horário explícito, adiamento e dispensa com revisão/comandos verificáveis.
- Oito testes novos, incluindo virada do ano/DST; 552 globais, tipos/lint/build envDir:false (29,09s) aprovados.
- Sem UI/persistência/timer/push ativados; 90 fontes preexistentes protegidas idênticas. Whitelists frontend/SQL não aplicado somente versão.
- Abertura do app no painel solicitada (queued), sem confirmar exibição ou inspeção. Próxima integração de persistência em Sol Alto.

## 0.1.110 — 2026-10-30

- R26-M2E: retorno seguro ao Ano permanece ao selecionar/fechar dia e trocar período; estado externo/arbitrário não é propagado.
- Regressões ampliadas para retorno, cancelamento e retry após falha anterior à gravação, sem duplicação.
- 544 testes globais e 44 Temporal, tipos/lint/build envDir:false (31,29s) aprovados. 90 fontes protegidas idênticas; whitelists SQL/frontend somente versão, gates false.
- Sem QA visual, dados pessoais, remoto, migração, deploy ou push. Próximo contrato de lembretes em Sol Alto; aceite visual permanece pendente.

## 0.1.109 — 2026-10-30

- R26-M2D: abas temporais mantêm o dia selecionado ao trocar entre Mês, Calendário e Semana; Ano conserva o ano.
- Compromissos recorrentes exibem a data inicial do cadastro, sem mudar ocorrências ou pontuação.
- Reprodução de dois defeitos antes da correção; 42 testes Temporal e 542 globais finais, tipos/lint/build (30,54s) aprovados.
- 90 fontes protegidas idênticas; somente whitelists de versão na custódia de backup/SQL não aplicado. QA visual ainda pendente; sem remoto, migração ou push.

## 0.1.108 — 2026-10-30

- R26-M2C: formulários anual/compromissos acessíveis com datas completas, notas e limites validados, preservando campos em falha.
- Calendário agrupa cadastros recorrentes, confirma exclusão e alinha cabeçalhos à semana configurada; contexto celeste/prazos recolhíveis.
- Ano/período na URL e retorno seguro dos cartões de mês/ciclo, sem alterar comandos ou recompensas.
- 540 testes globais, nove novos; tipos/lint/build envDir:false (23,96s) aprovados. Sem QA visual real.
- Domínio/dados/gates preservados; whitelist frontend/SQL não aplicado aceita a versão. Sem secrets, remoto, migração, deploy ou push.

## 0.1.107 — 2026-10-29

- R26-M2B: semana com agenda inline, mês em grade compacta e estatísticas recolhíveis; detalhes do dia compartilhados.
- Data/período na URL de Semana/Mês/Calendário; contexto seguro de retorno e rolagem preservada apenas em navegação interna marcada.
- Ciclos aceita entrada só por data, oferece planejamento semanal e criação rápida com editor mensal/anual, sem mudar os padrões de pontuação.
- 531 testes globais, TypeScript/lint/build envDir:false (8,43s), parse CSS e diff-check aprovados. Sem QA visual real.
- Stores/services/contratos/XP intactos; whitelist aceita a versão sem aplicar migration ou abrir gates. Sem dados pessoais/secrets/deploy/push. Próximo M2C Calendário/Ano em Sol Médio.

## 0.1.106 — 2026-10-29

- R26-M2A: agenda única para Ciclos/Temporal/rotações; edição conserva frequência, dias explícitos no formulário e limite opcional.
- Data planejada de Ritual em chave local independente de createdAt/fuso; adapter usa coluna existente; compromissos nas quatro visões e links por ID.
- Novas entradas anuais usam Habit/Commitment recorrentes; antigos registros/recibos mantidos com aviso, sem conversão ou recálculo de XP.
- 521 testes globais + 28 direcionados finais, TypeScript/lint/build envDir:false (9,40s) e diff-check aprovados. Sem QA visual real ou validação hospedada.
- Versão/whitelist atualizadas sem aplicar migration; gates false, sem secrets/dados pessoais/deploy/push. Próximo M2B mobile em Sol Médio; constância anual/legado ficam em lote próprio.

## 0.1.105 — 2026-10-29

- R26-M1: campos file separados dos checkboxes; controles próprios com foco/largura/toque adequados no CSS.
- Melhorias de texto longo, espaçamento, safe areas e nota de sync; busca elemental com 48px/16px e metadados de formulário.
- 22 direcionados + 504 globais, TypeScript/lint/build envDir:false (52,92s) e parse CSS aprovados. Sem QA visual real ou medições de layout.
- Stores/auth/XP/protocolos/gates preservados; whitelist da versão atualizada sem aplicar migration. Sem dados pessoais, secrets, deploy/push.
- Próximo R26-M2: Ciclos/mobile em Sol Médio; matriz visual continua pendente.

## 0.1.104 — 2026-10-29

- R25-1B6B: escolha explícita local/online com cópias salvas/readback, recebimento em novo dispositivo e escopo completo.
- Nova revisão CAS cerca pedidos atrasados; journal antes de commit e recuperação após gravação parcial. Nenhum merge, soma de XP ou replay de domínio.
- Guardas impedem restore/transfer/sync de passar por resolução pendente; reavaliação segura preserva local/intent. Painel único e consentimentos separados.
- 504 globais + 42 direcionados finais, tipos/lint/build `envDir:false` (11,98s), diff-check/versões. Sem QA visual/hospedado, dados pessoais, secrets, deploy/push.
- Gates false. Próxima revisão frontend/mobile em Sol Médio; aceite online/rollout/release com escopo próprio, contratos críticos em Alto.

## 0.1.103 — 2026-10-29

- R25-1B6A: sync integral durante sessão explícita, cliente transitório e lease exclusivo antes de App; mantém cliente/Auth legado isolados.
- Intent antes de commit, CAS/recibo/readback, vínculo durável, preservação de edições durante envio e parada sem retry automático em erro/conflito.
- Adapter dos stores existentes e estado acessível da sincronização; comparação/exportação de versões sem substituir/mesclar.
- 486 globais + 5 direcionados finais aprovados; tipos/lint/build `envDir:false` (29,98s). Sem QA visual/hospedado, dados pessoais, secrets, deploy ou push.
- Gates false. Próxima 1B6B: resolução explícita e recebimento em outro dispositivo, Sol Alto; Médio depois com aviso no QA mobile.

## 0.1.102 — 2026-10-29

- R25-1B5: vínculo explícito sem credenciais, próximos envios integrais por revisão/CAS e recibo recuperável.
- Inicialização reconhece vínculo antes de App/cliente legado e mantém isolamento; guard de identidade/formato preparado no serviço legado sob release false.
- Fingerprint rechecado depois da confirmação remota, preservando edições durante a espera. Sem mudar fórmulas/payloads/stores.
- 467 testes globais + 27 direcionados finais aprovados; TypeScript/lint/build `envDir:false` (16,98s). Sem QA visual/remoto, dados pessoais, secrets, deploy ou push.
- Gates continuam fechados. Próximo 1B6: sync integral/retomada online e conflitos em Sol Alto; QA mobile depois em Médio com aviso.

## 0.1.101 — 2026-10-29

- R25-1B4: workspace de conta pré-App, cópia salva/consentimentos e Auth transitório; envio/recibo preparados, com UI/Auth e servidor ainda fechados.
- Tentativa durável anterior ao commit, consulta sem reenvio e retry explícito; pausa/fechamento preservam dados e continuam somente locais. Sem integração online ativa.
- Restauração recusa tentativa pendente; leitura do metadado protegida pela exclusividade. Whitelist de arquivo atualizada sem aplicar migration remota.
- 453 testes globais e 30 direcionados finais aprovados; TypeScript/lint/build (envDir:false, 10,74s) e diff-check. Sem QA visual, dados pessoais, secrets, deploy ou push. Stores/cálculos/auth/sync preexistentes preservados neste lote.
- Próximo: 1B5/bootstrap online compatível em Sol Alto; QA mobile/tablet em Médio após aviso.

## 0.1.100 — 29/10/2026

- R25-1B3: backend integral opt-in e transporte de conta, assumidos após autorização explícita de Fábio. Migração local aditiva com revisão CAS, transação estado/recibo, idempotência, validação de arquivo, identidade esperada, privilégios restritos e gate de servidor fechado por padrão.
- Um escritor integral por conta opt-in; legado preservado e bloqueado para novas escritas nesse modo. Domínio legado existente exige revisão, sem conversão automática. Nenhum cálculo/store/tipo/autenticação/serviço legado preexistente alterado.
- Transporte explícito com preparo de arquivo/consentimento de todos os perfis, confirmação exata e recuperação de recibo após timeout. Sem cliente global nem associação/hidratação automática. Ainda falta chamador de confirmação/bootstrap compatível.
- 19 testes novos, SQL real em PostgreSQL temporário/PGlite 0.5.13 (dev fixada); 435 testes globais aprovados. Após revisão final, 19 direcionados, TypeScript/lint/build sem .env (7,33s) aprovados. Sem migração remota, secrets, dados pessoais, navegador ou publicação.

## 0.1.99 — 29/10/2026

- R25-1B2: Grimório → Preparar conta pessoal permite conferir perfil, atividades, XP e sessões locais sem enviar/alterar registros. Relatório invalidado por mudanças; cancelamento e tentativas antigas protegidos.
- Contrato/validador somente de leitura para futuro adaptador de conta, com guardas de identidade/perfil/origem/conteúdo/geração, cobertura completa e leitura vazia explícita. Nenhum adaptador/escritor online; resultado sempre associationAllowed false. Backend, stores, tipos e cálculos preservados.
- 12 testes novos; 416 globais aprovados. Após revisão final, 15 direcionados, TypeScript/lint/build sem .env (14,64s) aprovados. Sem navegador/conta pessoal; restauração segue com gate fechado. Próxima integração Sol Alto; QA mobile/ajustes de UI Sol Médio, com aviso prévio.

## 0.1.98 — 29/10/2026

- R25-1A: confirmação pré-bootstrap de restauração/recuperação/continuação local, com readback da cópia anterior, consentimentos separados, cancelamento de conferência obsoleta e prevenção de clique duplo. Falha com diário retido encaminha à revisão após recarga.
- Handoff local grava/confere metadado antes de remover o diário committed; startup valida origem e impede construção do cliente Supabase/auth/sync no documento local. Aviso global e acesso ao backup no Grimório. Diário v1, stores, tipos, backend e cálculos preservados.
- 21 testes novos; 399 testes globais, TypeScript/lint e build sem .env (7,37s) aprovados. SDK/storage sintéticos, sem navegador ou dados pessoais. Trava estática de escrita na UI permanece fechada até QA real; conta online 1B separada.

## 0.1.97 — 29/10/2026

- R25-A2b11: diário confirmado permanece como barreira durável antes de App/auth/cliente; revisão, downloads e recuperação committed não liberam associação automática à nuvem.
- Rollback prepared preserva devolução dos bytes anteriores. Conferência explica cópia confirmada/isolada; uso local completo, associação e gravação pela UI continuam pendentes.
- Quatro testes novos; 378 testes globais, TypeScript/lint e build sem .env (19,50s) aprovados. Auth/serviço cloud/stores/tipos/main preservados; sem browser, dado pessoal ou publicação.

## 0.1.96 — 29/10/2026

- R25-A2b8: coordenador de recuperação exige consentimento explícito e baseline conferido, congelados antes de waits e revalidados antes de escrita; corrige duas regressões reproduzidas.
- Cópias anterior/destino do diário podem ser exportadas na conferência isolada, preservando valores/IDs e detalhes visíveis durante download; cancelamento/obsolescência impedem o download. Gravação da recuperação/restauração continua desabilitada na UI.
- Nove testes novos; 359 totais aprovados. Após ajuste final de UI, 110 de backup repetidos, TypeScript/lint e build sem .env (15,00s) passaram. Stores/auth/sync/tipos preservados; sem navegador, dados pessoais ou publicação.

## 0.1.95 — 29/10/2026

- R25-A2b7: conferência somente leitura de restauração pendente, com versões protegidas anterior/destino e indicação de retorno, confirmação ou conflito; nenhuma gravação habilitada.
- Auditoria de identidade/fase de sessões, vínculo de check-ins e correlação de recibos, preservando snapshots após exclusão de planos/ciclos e ausência de campos históricos opcionais.
- 12 testes novos; suíte completa com 350 aprovados. Após ajustes finais, 101 testes de backup, TypeScript/lint e build sem .env (8,29s) passaram. Stores/auth/sync/tipos preservados; sem navegador, dados pessoais, restore real ou publicação.

## 0.1.94 — 28/10/2026

- Amplia auditoria de backup para catálogos nativo/legado, avaliações, recordes e indicadores de força, incluindo perfis inativos.
- Preserva referências históricas após exclusão e metadados opcionais; dados inválidos também bloqueiam aplicação/recuperação do diário antes de escrever.
- 89 testes de backup aprovados (quatro novos), TypeScript/lint/build (7,77s). Stores e fórmulas preservados; restauração continua desabilitada e QA real pendente.

## 0.1.93 — 28/10/2026

- Adiciona conferência isolada de restauração no Grimório, antes de carregar App/stores/auth: seleção de cópia, comparação por perfil e download do estado atual.
- Encaminha diário pendente para tela de proteção; invalida resultados em mudanças/cancelamento; substituição continua desabilitada.
- 14 testes novos, 334 totais; após mensagem JSON ajustada, 85 de backup repetidos e TypeScript/lint/build (11,34s) aprovados. QA real de navegador/mobile e restauração permanecem pendentes.

## 0.1.92 — 28/10/2026

- Revalida os dois lados do diário antes de aplicação/recuperação; rejeita par parcial, estruturas incompatíveis e vínculos inválidos. Detecta experiência legado que seria convertida ao carregar.
- Prepara coordenador exclusivo sem chamador de produção: bloqueia app já iniciado, exige locks/consentimento/cópia anterior e preserva diário em falha.
- 12 testes novos, 320 totais; TypeScript/lint/build (19,99s) aprovados. Restore/UI, QA real e conta online permanecem pendentes. Stores/auth/sync/tipos preservados.

## 0.1.91 — 28/10/2026

- Auditoria de dados aninhados de Treinos nos backups: planos/séries/sessões, check-ins, recibos e medidas; preserva legado e snapshots históricos.
- Seis testes novos com comandos reais em memória; 308 totais, TypeScript/lint/build (18,25s) aprovados.
- Nenhuma fórmula, store ou dado pessoal alterado. Restauração e QA real de navegador continuam pendentes.

## 0.1.90 — 28/10/2026

- R25-A2b2c: auditoria somente leitura de personagens/XP/recibos/contadores/descendentes/perfis e coleções de Treinos; avisos na prévia e recusa de preparo incompatível.
- Oito testes novos; 302 totais, TypeScript/lint/build (15,67s) aprovados. Não habilita restauração nem altera economia.
- Servidor 5173 reiniciado; usuário confirmou abertura do Santuário. Validação visual do agente segue bloqueada.

## 0.1.89 — 28/10/2026

- R25-A2b2b: checagem de restauração pendente antes de importar stores/auth; tela de proteção com recarga e sem escrita.
- Lease compartilhada Web Locks para sessões compatíveis, mantida durante import e vida do documento. Não implementa isolamento de abas antigas nem altera autosync.
- Nove testes novos; 294 totais, TypeScript/lint/build (17,18s) aprovados. Recuperação automática, aplicação e QA real de browser seguem pendentes.

## 0.1.88 — 28/10/2026

- R25-A2b2a: protocolo isolado de diário, confirmação e recuperação dos dois envelopes de progresso; storage injetado, sem integração com UI/boot/auth.
- 12 testes novos de interrupção/quota/conflito/rollback/recarga; suíte completa 285 aprovada, TypeScript e lint limpos. Build registrado no plano R25-A.
- Restauração pessoal, concorrência real, sync e QA visual ainda pendentes. Nenhuma regra de XP/Prana alterada.

## 0.1.87 — 27/10/2026 · prévia comparativa de backup

- Arquivo conferido pode ser comparado ao progresso atual por perfil: entradas, alterações, saídas, XP e históricos de Treinos.
- Identifica mudanças mesmo com totais iguais, avisa diferenças de versão/origem/perfil e invalida resultado obsoleto.
- Suíte completa 273 testes; 24 de backup repetidos após cleanup; TypeScript, lint e build passaram. Core preservado; restauração/gravação permanecem desabilitadas. Ver R25-A2b1/A2b2.

## 0.1.86 — 27/10/2026 · preservação entre contas e carregamento de Treinos

- Criar conta preserva o estado atual da anterior; salvar/alternar mantém o ID do personagem.
- Callback de Treinos conclui hidratação síncrona sem acessar store antes da inicialização. Backup exige ambos os stores carregados.
- Seis regressões novas; 264 testes, TypeScript, lint e build passaram. Fórmulas, auth e sync remoto preservados; sem migração pessoal ou restauração habilitada. Ver R25-A2a.

## 0.1.85 — 27/10/2026 · cópia do progresso no Grimório

- Exportação conjunta das projeções persistidas de atividades/personagem e Treinos; conferência de JSON com SHA-256, sem aplicar dados.
- Cancelamento, conta e concorrência protegidos; autenticação e estado transitório excluídos.
- 258 testes, TypeScript, lint, build e diff-check passaram. Core preservado neste lote. Restauração, backup pessoal e QA mobile ainda pendentes; ver R25-A.

## 0.1.84 — 27/10/2026 · contexto e cancelamento dos formulários

- Invocar isola campos/consentimento por conta. Cancelar sugestão e Voltar preservam texto manual; respostas obsoletas não sobrescrevem nova tentativa.
- Invocar e Forja bloqueiam comandos de callbacks ligados à conta anterior. Cancelar/reabrir diálogos e persistência somente após confirmação verificados por testes.
- 249 testes, TypeScript, lint, build e diff-check passaram. Stores/cálculos/tipos preservados neste lote; QA mobile e I03 remoto pendentes. Sem publicação; ver R28-F5.

## 0.1.83 — 27/10/2026 · recibos e animações de recompensa

- Painel elemental compartilhado para XP, elementos e nível em Ciclos, Rituais, conquistas e resumo de Treinos; zero/ausência/reversão explícitos.
- Lista de Rituais ganha aviso de conclusão real com agrupamento, Undo e proteção contra replay de histórico/hidratação/conta. Histórico de treino permanece sem celebração nova.
- Movimento breve, redução de animação e fechamento acessível. Stores/cálculos preservados neste lote.
- 243 testes, TypeScript, lint, build e diff-check passaram. QA mobile e sync pendentes; sem publicação. Detalhes em R29-D-RECOMPENSAS-VISUAIS.

## 0.1.82 — 27/10/2026 · fechamento de Jornadas e Grandes Obras

- Conclusão/reabertura explícita com bônus configurado, snapshot original, proteção contra duplicação e ciclos recorrentes preservados.
- Painel compartilhado nas trilhas/detalhes com revisão, feedback e movimento reduzido. Barras de catálogo leem os rituais atuais; seleção da Jornada vinculada à conta e ao ID.
- 238 testes, TypeScript, lint, build e diff-check passaram. QA mobile e sincronização pendentes. Sem publicação; ver R29-C-CONQUISTAS.

## 0.1.81 — 27/10/2026 · recuperação de XP e Rituais

- Recuperação de Ciclos com prévia por elemento, confirmação, cópia local anterior e proteção contra crédito duplicado. Valor baseado nos recibos válidos, sem estimar pelo planejamento atual.
- Rituais/subitens recebem snapshot de XP por folha e Undo exato; pais não duplicam, native adapter preservado.
- 231 testes, TypeScript, lint, build e diff-check passaram. XP pessoal não aplicado; QA mobile e sync pendentes. Sem publicação. Detalhes em R29-RECUPERACAO-E-RITUAIS.

## 0.1.80 — 27/10/2026 · XP e confirmação elemental dos Ciclos

- Corrigida ausência de crédito de XP nas novas conclusões válidas de Ciclos. Snapshot por recibo, elemento original e reversão simétrica, sem duplicação por pai/filho ou repetição.
- Recibo visual com XP real, barra de nível, elementos e marco de subida; sem replay na hidratação ou troca de conta, com movimento reduzido.
- Histórico anterior preservado sem retrocrédito; contagens extras continuam sem XP. Pedido global ainda parcial: ver R29-XP-E-RECOMPENSAS.
- 221 testes, TypeScript, lint, build e diff-check passaram. Navegador/mobile e sync remota não verificados. Sem publicação.

## 0.1.79 — 27/10/2026 · recuperação de falhas em Forja e Invocar

- Mensagens de erro acessíveis preservam os formulários; confirmação depende do resultado no estado local. Falha após escrita orienta conferir o destino, sem nova tentativa automática.
- Mantidos comandos, dados, regras e fluxo de IA. Proteção local contra repetição após sucesso.
- 211 testes, TypeScript, lint e build passaram. Sem navegador/sincronização remota; QA mobile pendente. Detalhes no plano R28-F4. Sem publicação.

## 0.1.78 — 26/10/2026 · confirmação e erro em séries de Treinos

- UI confere resultado de concluir/pular, informa recusa ou exceção e preserva os campos. Impede novo envio antes de receber atualização confirmada.
- Foco no recibo após confirmação, sem rolagem ou interferência ao abrir histórico. Stores, cálculos, cronômetro e páginas de execução/resumo preservados.
- 206 testes, TypeScript, lint e build passaram; validação renderizada/sessão real pendentes. Ver R28-F3 no plano R28-F. Sem publicação.

## 0.1.77 — 26/10/2026 · foco no contador diário

- Salvar/desfazer retorna foco a Somar ao dia; cancelar volta ao controle de configuração. Erros preservam o formulário; renders comuns não movem foco.
- Comandos, pontuação e registros preservados. 202 testes, TypeScript, lint e build passaram; validação renderizada pendente por escolha atual de revisão somente código. Ver R28-F2 no plano R28-F. Sem publicação.

## 0.1.76 — 26/10/2026 · destino das seções do Grimório

- Links para Histórico/Personagem/Elementos agora posicionam e focam a seção após montagem; hashes desconhecidos e navegação cancelada tratados.
- Revisão transversal documentada; inspeção no navegador recusada por permissão salva. R28-F permanece parcial.
- 198 testes, TypeScript, lint e build passaram; stores, tipos e histórico preservados. Detalhes em docs/plans/R28-F-REVISAO-MOBILE.md. Sem publicação.

## 0.1.75 — 26/10/2026 · marcos nas trilhas

- Resultado do ritual mostra progresso da trilha de origem, conclusão dos rituais pontuais e subida de nível quando confirmada pelo cálculo existente.
- Próxima sugestão contextual, fechamento explícito e modal compacto com rolagem; movimento reduzido mantém informação. Sem prêmio adicional ou conclusão automática de ciclos/agregados.
- 194 testes, TypeScript, lint e build passaram. QA mobile pendente; detalhes em docs/plans/R28-E-MARCOS.md. Sem alterações de domínio/publicação.

## 0.1.74 — 26/10/2026 · confirmação e movimento em Treinos

- Recibo compacto de série/bloco com valores registrados e animação somente em conclusão nova, sem repetir histórico ou celebrar itens pulados.
- Exercícios com expansão acessível compartilhada; barras por transformação, botões e recibos respeitam movimento reduzido.
- 189 testes, TypeScript, lint e build passaram. QA mobile/execução real pendentes; relatório em docs/plans/R28-D2-TREINOS.md. Stores, sessão, cronômetro e economia preservados. Sem publicação.

## 0.1.73 — 26/10/2026 · correção da rolagem e controle do giro

- Corrigido salto ao topo ao expandir grupos/editar filtros em Domínios; mesma proteção no Mapa. Navegação real continua com reset.
- Roda do Destino permite pular a animação, preservando a escolha original; movimento reduzido dinâmico e cancelamento de apresentação ao sair.
- 185 testes, TypeScript, lint e build passaram. QA visual/mobile pendente; relatório em docs/plans/R28-D1-ROLAGEM-E-RODA.md. Sem alteração de stores/economia ou publicação.

## 0.1.72 — 26/10/2026 · expansão e navegação de exploração

- Domínios/Pilares: painel compartilhado com estados acessíveis, expansão consistente e movimento reduzido.
- Mapa/Explorar: resultados de busca revelados sem controle de recolher conflitante; navegação normal com botão e painel identificados.
- Mapa preserva busca/categoria na URL para retorno pelo histórico; limpar devolve foco ao campo.
- 181 testes, TypeScript, lint e build passaram. QA mobile pendente; evidências em docs/plans/R28-C-EXPLORACAO-LEITURA.md. Sem publicação ou alteração de stores/regras.

## 0.1.71 — 26/10/2026 · movimento em criação e organização

- Invocar: transições direcionais, bloqueio de controles em saída e confirmação persistente com destinos explícitos; removido redirecionamento de dois segundos.
- Forja: resultado com nome da ideia e recuperação de foco após diálogo. Pressionamento compartilhado e preferência dinâmica de movimento.
- Seleção de runas das trilhas mais breve; comandos, stores e recompensas preservados.
- 177 testes, TypeScript, lint e build passaram; QA mobile pendente. Detalhes em docs/plans/R28-B-CRIACAO-ORGANIZACAO.md. Sem publicação.

## 0.1.70 — 25/10/2026 · fundação de movimento e piloto de Ciclos

- Tokens compartilhados, preferência dinâmica de movimento, navegação sem blur e feedback de pressionamento opt-in.
- Diálogos/sheets com duração consistente e alternativa reduzida; barra do contador por transformação, feedback local sem reinício a cada toque.
- Conclusões consecutivas agrupadas por recibo no mesmo aviso; reversões removidas, sem alterar comandos ou recompensas.
- 174 testes, TypeScript, lint e build passaram. QA visual/mobile pendente; evidências em docs/plans/R28-A-FUNDACAO-PILOTO.md. Sem publicação.

## 0.1.69 — 25/10/2026 · organização e quantidades diárias

- Ciclo × sequência explicado no formulário e na rotina; subitens identificados como etapas fixas. Corrigido exemplo de sequência que sugeria reunir tarefas da manhã.
- Contador genérico por atividade, sem presets Água/Aulas/Banhos; configuração progressiva, prévia e ação Somar ao dia. Contador opcional por hábito: meta/unidade/incremento configuráveis, registros por data, quantidades extras, histórico e desfazer individual. Sem pontuação ou conclusão automática, conforme escolha de Fábio.
- Vista de hoje acompanha a virada do dia quando ociosa; datas históricas e execuções em andamento preservadas. Nenhuma limpeza de histórico.
- Feedback de conclusão baseado em recibo novo inclui ciclo/subitem/treino vinculado nesta página, com runa de confirmação e movimento reduzido. Quantidades têm retorno visual próprio, sem fingir conclusão.
- Campos opcionais no hábito/store existente; cópias não herdam consumo. Evidências e limites: docs/plans/R27-QUANTIDADES-DIARIAS.md.

## 0.1.70 — 01/11/2026 · simplificação dos cards em Ciclos

- Removidos o selo/ranque de streak e o badge de atividade recente dos cards.
- A conclusão/desmarcação de hábitos usa checkbox junto ao nome; removido o botão textual separado “Concluir”. O botão de iniciar continua independente.
- Badge elemental maior, com ícone e nome legível. Sem alteração de streak, bônus, XP, Prana ou cálculo.
- Menu do item atual em sequência normal abre o editor da sequência. Nome, dias, inclusão/remoção e ordem dos ciclos ficam em rascunho e são aplicados por um único botão “Salvar alterações”; “Cancelar” descarta o rascunho.
- Expansão de itens com filhos indicada por um chevron discreto no cabeçalho, seguindo os cards de Treino; removidos botão/contador “Ações 0/2” e badge de quantidade.
- Itens de ação mostram o nome e checkbox sem os rótulos redundantes “Ação”/“Conclua quando realizar”; Checklist, Nota e Etapa continuam identificados.
- Removidos os números de posição exibidos abaixo do nome dos subitens; a hierarquia é comunicada pelo recuo e chevrons.
- Badges de área/subárea dos subitens passam a seguir o formato compacto do agregador, em uma linha com reticências quando necessário.
- Nos subitens, o nome ocupa a linha superior; os badges compactos do elemento (ex.: Terra) e da área/subárea ficam alinhados lado a lado logo abaixo.
- Correção: badges de elemento pertencem aos cards principais, não aos subitens; nos cards principais ficam alinhados à área/subárea abaixo do nome.
- Badge elemental permanece maior que o badge de área/subárea, com alinhamento vertical central na mesma linha.

## 0.1.69 — 31/10/2026 · catálogos e biblioteca de Treinos

- Expandido o catálogo de Calistenia com variantes de empurrar, puxar, pernas, core e abdômen; filtros anatômicos incluem oblíquos.
- Ampliados os catálogos de Yoga, Musculação, Corrida, Natação, Ciclismo e Artes marciais, com perfis descritivos e filtros adequados.
- A lista oficial de treinos exibe somente `WorkoutTemplate`; editor inicia exercícios/séries recolhidos, inclusive os recém-adicionados, remove o subcard de perfil muscular manual e salva sem iniciar a sessão.
- Fórmulas, XP, Prana e persistência Core inalterados. TypeScript, ESLint direcionado e `git diff --check` passaram nos arquivos alterados; sem QA visual/funcional nesta publicação.

## 0.1.68 — 25/10/2026 · constância programada e repasse R15–R26

- Aprovação explícita de Fábio: descanso não quebra constância; ciclos diários/semanais/mensais contam uma conclusão por data elegível na agenda atual.
- Cálculo compartilhado entre conclusão/Undo, subitens (agenda da raiz), treino vinculado e leitura de Ciclos. Sem reescrever recibos nem fórmulas de XP/Prana. Rotações e anual mantêm fallback anterior, explicitado na UI.
- Selo celebra somente aumento acompanhado por nova conclusão na mesma conta/ciclo. Leituras não migram armazenamento.
- Testes integrados com store real e armazenamento em memória; repasse consolidado e briefing Astro Boy atualizados. Evidências finais em `docs/03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md`.

## 0.1.67 — subitens e constância contextual, 25/10/2026

- Tipos canônicos e legados reconhecidos pela execução da UI; notas separadas das ações na contagem visual.
- Hierarquia numerada, identificação de ação/checklist/nota/etapa e botão Executar etapas.
- Selo de constância próprio, recorde/última conclusão/registros semanais e animação condicionada ao aumento do mesmo contador.
- Cálculo persistido de streak inalterado; escolha entre dias corridos e agenda pendente. Dados/recompensas/backend preservados.
- 148 testes Node passaram; QA renderizado e animação no aparelho pendentes. Evidências completas em R26-C.

## 0.1.66 — execução clara em Ciclos, 25/10/2026

- Iniciar, Concluir e Desfazer explícitos, títulos com mais espaço e acentos elementais nos cartões.
- Expansão de subitens com linha inteira de toque; elemento/ordenação reunidos em painel recolhível.
- 141 testes, TypeScript, lint e build passaram; QA visual/toque pendente. Servidor local iniciado e abertura no Codex encaminhada.
- Comandos, dados e backend preservados; sem backup pessoal, migração ou publicação.

## 0.1.65 — rotina diária de Ciclos, 25/10/2026

- Filtros rápidos por estado, contagens do dia, busca e ordenação compactas.
- Cartões e árvore de subitens com largura útil, etiquetas legíveis e ações agrupadas; criação de subitem com rótulos e cancelamento explícito.
- 138 testes Node, TypeScript, lint e build passaram. QA renderizado/mobile pendente por bloqueio do navegador.
- Regras, comandos e persistência preservados; backup/conta pessoal R25-A/B permanece pendente.

## 0.1.64 — Roda do Destino e checkpoint de progresso, 24/10/2026

- Roda elemental com escolha gratuita de tarefas, ciclos elegíveis e jornadas; filtros, lista e resultado com navegação contextual.
- Removidos custo de stamina e XP automático do Cassino conforme aprovação explícita; conclusão e recompensas normais intactas.
- Plano de proteção do progresso antes da conta pessoal e consolidação da usabilidade mobile. Backup pessoal/migração ainda não executados.
- 134 testes Node, TypeScript, lint e build passaram. QA visual pendente; stores/services/types/Supabase sem alterações.

## 0.1.63 — catálogo compacto de Domínios, 24/10/2026

- Áreas agrupadas por elemento com expansão e linhas compactas; busca/filtro mostram resultados diretamente.
- Gerenciar vínculos separado da navegação; grupo aberto recuperado no retorno do detalhe.
- 128 testes Node, TypeScript, lint e build passaram; QA visual/mobile pendente. Backend, dados e regras preservados.

## 0.1.62 — descoberta mobile e ícones de navegação, 24/10/2026

- R21: Pilares/Domínios separados; 26 destinos com símbolos próprios e botão Mais distinto do Grimório.
- R22: pontuação expansível em Ciclos com atalho e detalhamento local; Pilares prioriza elementos e mantém equilíbrio recolhível; Mapa tem busca, categorias e Showcase por destino.
- Controles de toque, foco, movimento reduzido e colunas por largura disponível. Sem alteração de pontuação, stores ou backend.
- 125 testes Node, TypeScript, lint e build passaram. Conferência visual/mobile ainda pendente; continuidade nos relatórios R21/R22.

## 0.1.60 — navegação contextual de Domínios, 24/10/2026

- Atalhos à lista/busca/subáreas, filtros na URL e retorno ao catálogo com contexto preservado.
- Seletor de áreas e anterior/próxima por elemento; limpeza de filtros e foco com movimento reduzido. Rail e Showcase aprovados preservados.
- 122 testes Node, TypeScript, lint e build passaram; QA visual/navegação real pendente. Backend e problema legado de vínculos R19 preservados para revisão de Matheus.

## 0.1.59 — Domínios com Expanded Cards e Showcase, 24/10/2026

- Navegação elemental expansível, busca e organização das áreas; Showcase no detalhe e links de módulo separados dos controles.
- Formulários de área/subárea refinados com escolhas visuais, prévia, validação, confirmação de remoção e retorno de foco.
- 117 testes Node, TypeScript, lint e build passaram; QA visual pendente. Backend preservado; comportamento antigo de primeiro desvínculo reproduzido em isolamento e registrado para Matheus em R19.

## 0.1.58 — Astrolábio e leitura da evolução, 24/10/2026

- Panorama atual separado do filtro de evolução; tabela diária, distribuição com estado vazio e cartões elementais expansíveis com rotas existentes.
- Runa própria, navegação e barras rotuladas de Rituais concluídos; dados, regras e backend preservados.
- 113 testes Node, TypeScript, lint e build passaram. QA visual/interações pendente. Acesso de leitura Sleek confirmado, sem geração remota.

## 0.1.57 — Forja elemental e edição funcional, 24/10/2026

- Captura com anotações expansíveis, busca, cartões com ações visíveis e ícone próprio; edição agora usa updateDraft existente.
- Classificação e exclusão com confirmação, feedback persistente e acesso ao catálogo; estado de interface isolado por conta.
- Stores, regras e backend preservados. 110 testes Node, TypeScript, lint e build passaram; QA visual/interações pendente. Divergência documental registrada em R17.

## 0.1.56 — Invocar e base incremental do design system, 24/10/2026

- Invocar com runas, seleção nativa, etapas nomeadas, revisão completa e receitas visuais reutilizáveis; movimento reduzido e rótulos refinados.
- Comandos, consentimento/JWT, payloads, pontuação e backend preservados; 107 testes Node, TypeScript, lint e build passaram. QA visual pendente.
- Avaliação de bibliotecas e sete skills pessoais instaladas; integração Sleek preparada sem chave no projeto. Detalhes em R16.

## 0.1.55 — capítulos navegáveis de Grandes Obras, 23/10/2026

- Capítulos expansíveis com atividades atuais, referências indisponíveis e links diretos à trilha; progresso registrado preservado.
- Detalhe resolve projeto por ID/conta e acompanha adição de capítulos; cancelamento e controles de criação refinados.
- Metadados de capítulo na projeção de leitura, sem alterações em backend, pontuação ou persistência. 104 testes Node passaram; QA visual pendente.

## 0.1.54 — revisão integrada e repasse R14, 23/10/2026

- Compositor de Jornadas/Grandes Obras reinicia ao trocar conta; comandos de domínio preservados.
- Repasse I03/R01–R14 consolidado, índices/boas-vindas corrigidos e novo briefing do Astro Boy para perfis que já leram R11.
- 102 testes Node, 10 Fitness Deno, 7 assistente Deno, TypeScript, lint e build passaram. QA visual/remoto pendente; publicação registrada na continuidade.

## 0.1.53 — capas Showcase na lista de Rituais, 23/10/2026

- Capas elementais com detalhes expansíveis, execução sempre acessível e ferramentas existentes preservadas.
- Busca/filtros/estados vazios e campos de itens refinados; evolução compacta após a lista e contêiner de edição atualizado.
- 56 testes Node, TypeScript, lint, build e checagem SSR passaram. 16 handlers/auxiliares preservados por AST. QA renderizado pendente por recusa de acesso do navegador; backend/dados/cálculos intactos.

## 0.1.52 — distinção de atividades e entrada de Rituais, 23/10/2026

- Rituais abre tarefas; trilhas mantêm acesso explícito e links anteriores. Guia diferencia tarefas, hábitos, quests e projetos conforme orientação de Matheus.
- Textos, atalhos do Santuário e compositor alinhados; diálogo de criação rápida modernizado com rótulo acessível.
- 56 testes Node, TypeScript, lint e build passaram. 13 handlers de Rituais preservados por AST; domínio/backend intactos. QA visual pendente.

## 0.1.51 — catálogos de quests e composição contextual, 23/10/2026

- Jornadas/Grandes Obras com acesso direto à trilha nos cartões, cabeçalhos e diálogos na identidade elemental.
- Compositor completo disponível nos catálogos com tipo inicial contextual e abertura da trilha criada; criação rápida preservada.
- Campos/rótulos/alvos de toque refinados; ações do compositor aderentes durante rolagem e preferência de movimento reduzido nos catálogos.
- 54 testes Node, TypeScript, lint e build passaram. Cinco handlers anteriores preservados por AST; domínio/backend intactos. QA de navegador pendente.

## 0.1.50 — runas e celebração de quests, 23/10/2026

- Runas elementais próprias na trilha, cabeçalho e compositor, com gestos finitos de seleção e pressão sobre base fixa.
- Progresso animado por transform; conclusão confirmada com medalhão/check e entrada sequencial de métricas reais. Reduced motion respeitado.
- 54 testes Node, TypeScript, lint e build passaram; cinco handlers preservados por comparação AST. Sem alterações de domínio.
- QA visual pendente. Fragmentos, evolução de streak e coleção ainda dependem de contrato; nenhum saldo simulado.

## 0.1.49 — piloto de trilha elemental, 23/10/2026

- Percurso sinuoso centralizado, nós elementais em relevo, títulos completos e painel de seleção com largura estável; seleção livre preservada.
- Estados de referência removida e IDs de painéis entre trilhas refinados; movimento reduzido respeitado.
- Referências JSON/CSS do Figma preservadas em documentação; nenhum asset remoto ou saldo de recompensa importado.
- 49 testes Node, TypeScript, lint e build passaram; QA renderizado pendente por recusa de acesso do navegador. Core, QuestHub/QuestComposer, comandos, dados e backend intactos.

## 0.1.48 — revisão integrada e repasse, 23/10/2026

- Corrigidos quatro avisos de hooks e destinos dos atalhos de rituais; timer simples encaminha treinos/agregadores ao fluxo adequado.
- Astrolábio deixa de inventar séries aleatórias e apresenta pontuações históricas registradas, com estado vazio explícito.
- Teste Fitness tipado e alinhado ao contrato consolidado de Matheus; nenhum calculador/store alterado.
- Astro Boy entrega atualização única a perfis antigos e repasse completo I03/R01–R11, distinguindo Fábio/frontend e Matheus/backend.
- 92 testes Node, 10 Fitness Deno, 7 assistente Deno, TypeScript, lint global e build passaram. QA visual/remoto pendente; publicação Git autorizada, confirmação em CONTINUIDADE.

## 0.1.47 — Quests e trilhas elementais, 23/10/2026

- Rituais ganha trilhas de Jornadas/Grandes Obras, com próxima etapa sugerida e acesso livre às demais; lista e operações anteriores preservadas.
- Compositor cria etapas pelos métodos existentes; execução reutiliza cronômetro, conclusão e resultados reais. Sem novo motor de recompensas.
- Santuário mostra próximas quests; Jornadas/Obras abrem suas trilhas. Seleção expansível mantém a rolagem.
- 87 testes Node, TypeScript, lint delimitado e build passaram; 64 arquivos protegidos e 34 funções anteriores preservados. QA visual e fluxo no navegador pendentes.
- Referência Figma e divergência dos snapshots macro documentadas no relatório R10. Sem publicação.

## 0.1.46 — Grimório, personagem e histórico, 22/10/2026

- Ficha única com corpo elemental, barras translúcidas de HP/Stamina/Prana/XP, nível/título e consistência; edição de identidade preservada.
- Showcases expansíveis de maestria elemental, radar opcional e navegação interna; histórico com busca, filtros e valores registrados, sem contabilidade paralela.
- 67 testes Node, TypeScript, lint delimitado e build passaram; 64 arquivos protegidos e operações/cálculos anteriores preservados.
- Documentação R09 atualizada. QA visual e interação no navegador pendentes por bloqueio salvo; sem publicação.

## 0.1.45 — cabeçalhos e composição elemental, 22/10/2026

- Santuário clássico aposentado: link/página/palco/CSS exclusivos removidos; endereço antigo redireciona à home nova.
- Cabeçalho comum com marca, Explorar e selo de conta; removidos sino sem ação e indicador fixo, operações de conta preservadas.
- Calendário expande o dia sem recentrar a janela e revela itens reais; criação de ciclos/sequências refeita, painéis mobile e detalhes refinados.
- 49 testes Node, TypeScript e build passaram; lint sem erros/dois avisos anteriores. Domínio preservado; QA visual pendente, sem publicação.

## 0.1.44 — redesign de Ciclos, 22/10/2026

- Calendário Expanded Cards com dia selecionado ampliado, seleção completa sempre acessível e movimento reduzido; Rotina/Sequências separadas.
- Showcase nos estados vazios e evolução com assets elementais; criação de sequência em diálogo.
- Busca e filtros reais por elemento/estado, contagens e limpar; ordem original preservada, reorganização disponível na visão completa.
- Showcase expansível de sequências com ciclo atual, composição e operações existentes; cartões/diálogos/execução alinhados à identidade elemental e acessibilidade refinada.
- 41 testes Node, TypeScript e build passaram; lint sem erros/dois avisos anteriores. 64 arquivos protegidos, operações e cálculos de Ciclos/pontuação preservados; apenas efeito visual de rolagem substituído. QA de navegador bloqueado pela preferência salva, sem publicação.

## 0.1.43 — ícones e exploração transversal, 22/10/2026

- Vinte ícones vetoriais próprios e selos elementais na navegação, cartões compartilhados, consumidores principais, cronômetro e estados vazios selecionados; dados/catalogação preservados.
- Expanded por grupo no menu Explorar e Mapa; Showcase dos destinos com links reais, descrição e status existente. Atalhos de treino também aparecem no Mapa.
- Cartões de área/elemento operáveis por teclado; painéis elementais têm IDs por instância e não mudam ao receber foco.
- 32 testes Node passaram; limites/evidências completos em R06/CONTINUIDADE. QA renderizado e migração dos demais ícones especializados pendentes; sem publicação.

## 0.1.42 — Temporal, Lua e Estações, 22/10/2026

- Navegação temporal unificada com identidade elemental e destinos reais.
- Lua 3D com mapas NASA locais e fase/iluminação calculadas por Astronomy Engine já instalada; atualização por minuto e retorno à aba, próximas fases e fallback SVG. Vista de referência por hemisfério, sem efeito em regras de jogo.
- Estações com cartões expansíveis e calendário existente preservado; Ano com Showcase dos meses, métricas atuais e acesso ao mês correto por URL.
- 28 testes Node, TypeScript e build passaram; lint sem erros e dois avisos anteriores. 63 arquivos protegidos e lógica de Ano/Mês preservados. QA visual/WebGL no navegador pendente. Sem publicação.

## 0.1.41 — Santuário como home e exploração de Pilares, 22/10/2026

- Composição elemental promovida a `/santuario`; links da prévia redirecionam preservando filtros e home clássica continua acessível.
- Conta existente integrada; HP e recursos preservados; rituais com cronômetro e proteções contra substituição de sessão, troca de conta e conclusão repetida. Operações e cálculos existentes mantidos.
- Pilares organiza equilíbrio e cartões expansíveis com navegação para páginas próprias, áreas personalizadas e metadados; cabeçalho/identidade mobile compactados.
- 19 testes Node, TypeScript, lint e build passaram. 63 arquivos de domínio e lógica/dialog de conta intactos. QA visual e fluxo real no navegador pendentes; sem publicação.

## 0.1.40 — identidade compartilhada, cartões e cronômetro, 22/10/2026

- Paleta aprovada aplicada aos tokens compartilhados e aliases de componentes/Fitness, com superfícies, abas, foco e controles alinhados. Acabamento de cada tela permanece em andamento.
- Cronômetro elemental nos modais simples de Rituais/Ciclos, preservando handlers, contagem e conclusão. Prévia passa a chamar o tick existente enquanto montada.
- Expanded Cards em Pilares; Showcase Cards em Jornadas e Grandes Obras, com metadados e ações de detalhe existentes.
- Busca de páginas no menu global e botão Explorar acessível na prévia, incluindo destinos específicos de Fitness nos resultados.
- 12 testes locais, TypeScript e build passaram; lint 0 erros/2 avisos anteriores. 63 arquivos de domínio e 57 handlers preservados. Sem QA do produto no navegador devido a bloqueio efetivo; sem publicação.

## 0.1.39 — R03, navegação elemental, 21/10/2026

- Páginas próprias dos quatro elementos na prévia, com compatibilidade de links anteriores e retorno ao Santuário.
- Acessos fixos complementam a órbita; busca/filtro de áreas ativas ficam na URL. Alterar filtros preserva a rolagem somente nessa página.
- Atalhos aos módulos existentes e acesso às subáreas de Exercício Físico. Sem mudança de backend, domínio, cálculo, persistência ou Fitness.
- Oito testes locais, TypeScript, lint e build passaram; 79 arquivos protegidos idênticos por SHA-256. QA de navegador e integração do cronômetro da home ainda pendentes. Home atual não substituída.

## 0.1.38 — R02, efeitos sobre textura preservada, 21/10/2026

- Removidos feTurbulence/feDisplacementMap e oscilações que deformavam água/fogo. Artes preservadas com camada Canvas 2D transparente.
- Água recebe reflexos curvos e gotas; fogo recebe plumas ascendentes/brasas com dissipação; ar recebe correntes no mesmo sentido; terra recebe fragmentos rígidos e sombreados.
- Relógio contínuo, partículas determinísticas, DPR limitado a 2, pausa/visibilidade e movimento reduzido mantidos. Nenhuma dependência ou serviço externo novo.
- Três testes numéricos do renderizador passaram; não substituem inspeção visual ou medição de FPS. Evidências e bloqueio atual na continuidade.

## 0.1.37 — R02, movimento dos materiais, 21/10/2026

- Água e fogo recebem deformação de textura com ruído SVG contínuo, além de ondulações/brasas; não apenas escala da imagem.
- Terra ganha levitação rígida e fragmentos com ritmos próprios. Ar usa duas camadas de vento em sentidos opostos.
- Hover/foco suspendem a trajetória para seleção, mantendo os materiais vivos; pausa explícita e movimento reduzido continuam suspendendo os efeitos. Fora da tela/aba oculta também suspendem o loop.
- Filtros limitados às duas superfícies de água/fogo, atualizados em até 30 Hz. Sem benchmark ou validação visual atual; limites na continuidade.

## 0.1.36 — R02, magia elemental realista, 21/10/2026

- Quatro assets próprios transparentes: água líquida, rocha sólida, esfera de ar em espiral e bola de chamas. Gerados por image_gen e empacotados em WebP lossless.
- Portais orbitais usam as artes com pulso de água, rotação do ar e oscilação do fogo; terra estável. Nomes e alvos permanecem separados das animações.
- Pausa, foco/hover, aba oculta/fora da tela e movimento reduzido também suspendem os efeitos. Destaques das páginas elementais usam a mesma arte estática; pequenos símbolos de navegação preservados.
- Fallback para símbolo existente se a imagem falhar. Sem novas dependências, dados/regras alterados ou publicação. Evidências e limites na continuidade.

## 0.1.35 — R02, anel em profundidade, 21/10/2026

- Órbita da prévia passa a um anel inclinado ao redor do corpo, com escala, opacidade e ordem de sobreposição por profundidade, inspirado no Carousel Ring inspecionado.
- Portais de trás passam atrás da silhueta; foco de teclado os traz à frente. Controles esquerda/direita permitem reposicionar o anel parado, inclusive em movimento reduzido.
- Corpo maior na composição, pausa ao apontar para um portal e navegação existente preservada.
- Build/checagens e limites de validação registrados na continuidade; sem promoção automática à home.

## 0.1.34 — R02, corpo elemental e órbita, 21/10/2026

- Personagem da prévia substituído por arte corporal derivada do manequim Fitness, com vestes elementais e transparência. Asset original e medidas preservados.
- Quatro portais em órbita elíptica contínua, pausa/retomada, suspensão por interação/aba oculta/fora da tela e preferência de movimento reduzido. Nomes sempre na vertical.
- Sem Canvas 3D nessa composição; navegação, progressão e persistência existentes preservadas. Prompt e origem em `reports/R02-PERSONAGEM-ELEMENTAL.md`.
- Evidências executadas e pendências de navegador em CONTINUIDADE.md.

## 0.1.33 — R02, 21/10/2026

- Prévia local `/previa-elemental` com personagem existente, progressão/recursos dos stores atuais, portais elementais e giro controlado por botão.
- Página própria por elemento via query, busca de áreas, cartões expansíveis, destinos existentes e retorno ao Santuário da prévia. Ficha de equipamentos explicitamente visual.
- Estilos isolados e carregamento sob demanda; home vigente, domínio e persistência preservados.
- Validação visual/interativa pendente: navegador bloqueou localhost por preferência salva mesmo após autorização no chat. Evidências de código e retomada em CONTINUIDADE.md.

## 0.1.32 — I03, 20/10/2026

- Confirmação de rascunho em Invocar mostra título e descrição revisados antes da gravação pelo `addDraft` existente.
- Regressão de navegador versionada com Auth/provedor simulados, store real, perfil temporário, rede externa bloqueada e Vite sem `.env`.
- Consentimento, payload mínimo/JWT e gateway existentes preservados. Sem mudança de pontuação, secrets, deploy ou ativação remota.
- Evidências atuais e limites em CONTINUIDADE e ASSISTENTE-PROTOTIPO.

## 0.1.31 — 13/10/2026

- Integração das quatro abas Treinos/Histórico/Corpo/Saúde e aliases; painel, evolução e semana recuperados com históricos Native e legado.
- Prévia visual Native com programa/mídia/instruções/edição/início; capa compartilhada com prévia legada. Planejar data abre editor existente.
- Pausa persistida do relógio, distância/descrição por bloco, resumo de corrida e fallback de mídia Yoga. Sem mudança de fórmula ou recálculo de XP.
- Navegação semanal por período/dia, Prana real do Core, CTAs responsivos e FAB contextual preservado.
- 8 testes Deno, fluxo UI em perfil temporário e verificações 360/390/768px. Limites/evidências completos em CONTINUIDADE/F59.

## 0.1.30 — F58, 13/10/2026

- Cartão Corpo alinhado à referência: figura humana clara, proporções compactas e grade de medidas legível.
- Removido cabeçalho duplicado na aba embutida; mantidos registros, histórico, gráficos e ação de avaliação.
- Evidências e limites em CONTINUIDADE/FILA.

## 0.1.29 — F57, 13/10/2026

- Resumo Native com avaliação persistida no registro compartilhado, séries detalhadas, esforço, volume de carga, mídia/notas, perfil muscular estimado e evolução por plano.
- Salvar e iniciar direto do editor; sessão ativa bloqueia início de outro treino, mas permite salvar planejamento.
- Regra Core Native block-v2 normaliza repetições por tempo ativo equivalente sem mudar ER ou recibos antigos. Prévia compartilha o construtor da conclusão; duração planejada e ativa aparecem separadas.
- Verificações do lote registradas em CONTINUIDADE/FILA; nenhuma publicação ou migração remota.

## 0.1.28 — 13/10/2026

- Menu Treinos e URL legada passam a usar FitnessRoot; o editor canônico prioriza exercícios/mídia e recolhe esforço/estimativa. Data opcional de planejamento local preservada no template/snapshot, sem criar agenda Core.
- Criação de exercício próprio desbloqueia modalidades sem catálogo. Usa catálogos existentes da conta com ponte de identidade, sem atribuir perfil muscular automático. Overrides explícitos continuam opcionais e devem somar 100%.
- Imagem, vídeo direto e observações configuráveis por exercício, preservados no plano e execução. Yoga mantém mídia original; execução legada também recebe mídia do plano. Esportes por tempo usam minutos e descanso, sem campo de carga em kg.
- Testes de navegador: editor idêntico nas três entradas; exercício próprio, reload, imagem carregada, vínculo de vídeo/data persistidos e conclusão com XP, sem page errors. Vídeo testado por vínculo/elemento; reprodução real não testada. Build passou; lint sem erros/4 avisos antigos; recompensa Deno 3/3; minutos→segundos verificado. Evidências em F56/CONTINUIDADE.

## 0.1.27 — 13/10/2026

- Terra e Mais/Treinos usam a mesma biblioteca Fitness, ícones de referência, criação e edição canônicas. Planos legados aparecem na biblioteca e usam o editor compartilhado com adaptação de apresentação; IDs, séries, data, notas e distribuição são preservados, sem migração.
- FAB de criação some quando Montar treino está utilizável e reaparece ao sair da tela. Editor compartilha cabeçalho e rodapé fixos; execução nativa preserva navegação global, ilustrações Yoga e fechamento claro.
- Corrigido redirecionamento concorrente após finishSession: a rota reconhece a sessão gravada e abre o resumo de XP. Histórico/Corpo usam a mesma casca nas duas entradas.
- Fluxo e FAB testados em perfil temporário 390px; edição legada preservou ID/séries; 360/768px sem overflow; build final passou e lint 0 erros/4 avisos preexistentes. Evidências e limites em CONTINUIDADE/F55.

## 0.1.26 — 13/10/2026

- Histórico Fitness reúne sessões Core e legadas em uma lista cronológica; todos os registros concluídos abrem o mesmo resumo visual. A conclusão nativa também abre esse resumo, que exibe somente XP comprovado pelo recibo ou ledger e mantém valores antigos sem recalcular.
- Histórico e resumo validados no navegador com registros de 50 XP (Core) e 11 XP (legado); build passou, lint sem erros e 4 avisos anteriores. Revisão documental independente pendente por indisponibilidade do responsável.

## 0.1.25 — 13/10/2026

- Barra de ação da execução Fitness fica acima da navegação inferior e respeita a safe area; conteúdo mantém espaço para alcançar o fim sem esconder ações.
- Sessão ativa em Escolher treino destaca “Continuar treino”; CTA explicita “Finalizar treino” com blocos pendentes e “Concluir treino” quando todos são processados. Build, lint e smoke mobile registrados na continuidade/F53.

## 0.1.24 — 13/10/2026

- Centraliza o ícone do botão de fechar na ficha de exercício Fitness dentro do alvo de 44px, preservando posição e ação.
- Build e verificações de interface registrados na continuidade/F52.

## 0.1.23 — 13/10/2026

- Recompensa Native de Fitness passa a considerar volume e esforço percebido por série concluída; presença/tempo ativo são aplicados uma vez e Prana uma vez por sessão. Séries puladas não pontuam; sessões sem bloco concluído geram zero.
- Execução e histórico exibem XP do recibo Core, blocos, minutos ativos e esforço ponderado. Regra versionada `core-native-workout-block-v1`; históricos anteriores preservados.
- ADR-003 e capítulos Core/Adapter documentam mapeamento, fontes de duração e limite de teto por série. Build, lint, testes Deno e fluxo temporário de navegador registrados na continuidade/F51.

## 0.1.22 — 13/10/2026

- Sincroniza a branch principal de Matheus por fast-forward, preservando a branch local divergente e o worktree separado.
- Recompõe compatibilidade de tipos entre o Core unificado e as telas/stores existentes; nível e XP passam a ler o cálculo atual e os ganhos usam as chaves corretas dos quatro elementos.
- TypeScript passou após a reconciliação. Revisão visual, fluxos funcionais e persistência remota ainda pendentes; nenhuma migração foi aplicada ao Supabase.

## 0.1.21 — 10/10/2026

- Entrada portável do Astro Boy para Fábio/frontend e Matheus/backend: regras Codex/Cursor/Claude, perfil local explícito, apresentação inicial e comandos status/welcome/ack.
- Skills Astro Boy, backend e versionamento incluídas no Git com as cinco skills existentes; índice/guia de colaboração usam contratos versionados, sem depender do caminho absoluto de Fábio.
- Auditoria recursiva das pastas e inventário reproduzível; removidos metadados macOS e regra ignore duplicada. Removida dependência de desenvolvimento kimi-plugin-inspect-react sem consumidores, reduzindo lockfile em 99 pacotes; versões das dependências mantidas.
- Credenciais, perfis locais, dependências e builds permanecem fora do Git. Publicação autorizada no repositório Matheuscroft/ConselhoElemental-main.

## 0.1.20 — 10/10/2026

- Catálogos coerentes para corrida, natação, ciclismo e sete artes marciais, mantendo legado. Modalidade filtra atividades; mistura exige escolha explícita. Ficha, preview, ativo e resumo no padrão Fitness mobile/tablet.
- Registro de tempo ativo, esforço, distância e descrição; perfil muscular personalizado validado em 100%. Carga percebida e distribuição estimada só de blocos concluídos; unidade legada corrigida e gráficos Saúde alimentados por observações.
- Recompensas novas usam observações com fórmula versionada e ledger idempotente, sem recalcular histórico. Native não gera recordes de força/volume em kg fictícios. Terra permanece atribuição física canônica; porcentagens musculares são estimativas explicadas.
- Detalhes e limites em MODALIDADES-E-METRICAS-TREINO.md; evidência de build/lint/navegador em fitness-modalities-20261010.

---

## 0.1.19 — 09/10/2026

- Reformula Criar treino para celular/tablet: tipografia consistente com Fitness, campos uniformes, resumo dos exercícios e configurações recolhíveis, catálogo com metadados e seleção clara; ação de conclusão e orientação sempre visíveis.
- Calendário em português, remoção de data e foco restaurado ao fechar. Edição numérica permite substituir valores sem reposição prematura do mínimo, preservando a validação existente.
- Evidências reais em fitness-create-20261009: busca/filtros/seleção/remoção em 360/390/768, data/duas séries salvas e fluxo de criação até histórico em 390. Stores, regras e dados preexistentes preservados.

---

## 0.1.18 — 09/10/2026

- UI02-B: seis ícones da própria referência em Escolher treino; Corrida, Calistenia/Core Training, Natação, Artes marciais, Yoga e Ciclismo. Rótulos portugueses e Corrida selecionada inicialmente.
- Quatro novas categorias conectadas ao formulário existente, sem alterar stores ou inventar exercícios/sensores; mapas tipados compatíveis e catálogo anterior preservado.
- Build e lint passaram (quatro avisos preexistentes); seleção em 360/390/768, categorias no formulário e fluxo Yoga com retomada/persistência/finalização em 390 verificados. Evidências em fitness-icons-20261009.

---

## 0.1.17 — 09/10/2026

- UI02-A: seleção de treino com canvas sólido, cards proporcionais alternados, seleção por contorno violeta e navegação compacta no header. Celular primeiro; tablet/PC usam composição centralizada com limite de 576px, sem sidebar nesta página.
- Mantidos catálogo real, criação, filtros de origem, detalhes, planos e continuar sessão. Seis modalidades da imagem não foram inventadas; aplicação atual tem Yoga e Calistenia.
- Build passou; lint 0 erros/4 avisos preexistentes; navegação e ações da seleção em 360/390/768/1024, largura de tablet conferida a 1440px. Fluxo de treino temporário com criação/retomada/reload/finalização/histórico passou. Evidências em conselheiro-backups/fitness-select-20261009.

## 0.1.16 — 09/10/2026

- UI01: integra Corpo à casca/navegação fitness-kit; silhueta neutra proporcional compartilhada com Insights, medidas reais e estados vazios, evolução do peso, todas as avaliações e acesso a resumos de sessões reais. Textos em português e Saúde ativa também em Corpo.
- Restaura foco ao fechar o formulário de avaliação, após falha reproduzida. Campos e operações existentes preservados; nenhum store/regra/dado alterado.
- Build passou; lint 0 erros/4 avisos preexistentes. Navegador temporário: seis páginas em 360/390/768/1440 sem overflow/pageerrors, nove campos de avaliação e retorno de foco; treino criado pela UI com continuar/reload/finalização/histórico. Estados corporais preenchidos/exclusão não testados por falta de medidas reais autorizadas.
- Integração completa do kit continua em etapas; esta versão entrega o primeiro lote de Saúde, sem publicação.

## 0.1.15 — 09/10/2026

- I03: protótipo local em Invocar para enviar texto com consentimento, receber sugestão de título/descrição e confirmar manualmente a criação pelo fluxo existente de rascunhos. Segundo o relatório do lote, 7 testes Deno com dependências simuladas, build e navegador passaram; lint teve 0 erros e 4 avisos preexistentes. Sem chamada live, secrets ou deploy.

## 0.1.14 — 09/10/2026

- I02: reduz margem da lista da sessão Fitness abaixo de 375px, corrigindo encobrimento reproduzido de Concluir série em 360px; preserva margem anterior a partir de 375px, regras e dados.
- Reteste informado pelo executor: clique, continuar, reload, finalizar e histórico em 360/390/768/1440px, sem overflow/pageerrors no cenário de um exercício/uma série.

## 0.1.13 — 08/10/2026

- Corrige a sobreposição das colunas de equipamentos do Santuário a partir de 640px, restringindo a ancoragem esquerda à coluna correspondente. Sem alteração de regras ou dados.

## 0.1.12 — 06/10/2026

- Santuário: palco central do mago, seis espaços laterais de equipamento e HUD compacto inspirado na referência.
- Recursos existentes preservados; espaços informam explicitamente ausência de inventário conectado.

## 0.1.11 — 05/10/2026

- Formulários de criação de treino e avaliação corporal anunciam seus títulos reais para leitores de tela.
- Associação explícita de títulos preserva o componente compartilhado e demais diálogos.

## 0.1.10 — 05/10/2026

- Painel identifica widgets semanais; indicadores permitem quebra de texto.
- Insights informa data real da avaliação corporal.
- Variantes Fitness para avaliação e detalhes, preservando tema padrão fora do módulo.
- Estrelas: alvos de 44px, tema Fitness e navegação por setas/Home/End.

## 0.1.9 — 05/10/2026

- Fundo aurora global decorativo com estrelas determinísticas, camadas adaptadas ao celular e movimento reduzido.
- Layouts transparentes preservam cartões, navegação e rolagem. Removido fundo duplicado do AppLayout.

## 0.1.8 — 05/10/2026

- Sessão: exercícios inteiramente pulados têm ícone próprio; transições do acordeão respeitam movimento reduzido.
- Ilustrações de exercício exibidas inteiras, sem corte.
- Resumo: histórico e distribuição muscular agrupados em seção expansível, preservando métricas e avaliação.

## 0.1.7 — 05/10/2026

- Seleção de treino: contagem real de exercícios e orientação contextual; CTA distingue montar de abrir treino.
- Prévia: dificuldade/duração legíveis e orientação para detalhes do exercício.
- Categorias: nomes longos e movimento reduzido. Sem alterações no core ou dados.

## 0.1.6 — 2026-10-04

- **Correção de regressões da auditoria visual:**
  - WorkoutSelect: botão "Continuar sessão" restaurado para sempre visível quando há sessão ativa, independente de categoria selecionada ou lista de treinos planejados.
  - WorkoutSelect: removido truncamento `.slice(0, 8)` no catálogo de exercícios dentro de "Mais opções" - todos os exercícios filtrados são acessíveis ao expandir.
  - HealthDashboard: restaurados botões "Meu corpo" e "Esta semana" com explicação compacta sobre Stamina/Prana e referência visual de 30min.
- Build e lint verificados: 0 erros, 4 warnings preexistentes em Ciclos.tsx e temporal/*.tsx.
- Metadados sincronizados: package.json e package-lock.json → 0.1.6.

## 0.1.5 — 2026-10-04

- Histórico: removido botão sticky que se sobrepunha a navegação inferior; acesso "Ver todo o histórico" agora via header (ação "Ver tudo" quando mês vazio) e empty state.
- WorkoutHistoryCard restaurado para layout em linha em 360px+: badge esquerda, nome/métrica quebram no centro (min-w-0), data à direita com max-width; removido flex-col mobile.
- Metadados de versão sincronizados: package.json e package-lock.json → 0.1.5.

## 0.1.4 — 2026-10-04

- Resumo semanal (HealthWeeklySummary): layout responsivo para 360px+; nomes de dia quebram linha; sparkline condicional (apenas dias com ≥2 séries); link superior "Ver histórico" em vez de "Ver tudo".
- Histórico (WorkoutHistory + WorkoutHistoryCard): card responsivo (flex-col mobile / flex-row ≥sm); nome e métrica quebram linha; data à direita preservada; ações contextuais em estados vazios (mês vazio → "Ver todo o histórico", nenhum treino → "Iniciar treino"); botão sticky "Ver todo o histórico" ao final da lista.

## 0.1.3 — 2026-10-04

- Painel prioriza anéis e widgets, com acessos corporais e semanais abaixo.
- Insights permite registrar novas avaliações após o primeiro registro.
- Medidas corporais não são truncadas; link semanal tem rótulo explícito.

## 0.1.2 — 2026-10-04

- Sessão mostra progresso com séries concluídas e puladas separadas.
- Músculos e recompensas ficam em seção expansível; campos se adaptam ao tipo de exercício.
- Avaliação ganha destaque no resumo; nomes longos permanecem legíveis.

## 0.1.1 — 2026-10-04

- Seleção prioriza categorias; estatísticas preservadas em Meu progresso.
- Prévia permite consultar detalhes dos exercícios antes de iniciar.
- Títulos longos quebram linha; mudança de categoria recolhe o catálogo expandido.

# Changelog

## 0.1.0 — 2026-10-04

- Integração seletiva do Health UI Kit nas telas de seleção, prévia, sessão, resumo, histórico, insights e semana; novo painel diário.
- Componentes e adapters isolados em fitness-kit, mantendo stores, dados, avaliações corporais, assets e navegação global existentes.
- Compatibilidade com URLs de prévia existentes e filtros Yoga/Calistenia.
- Correção do redirecionamento ao criar treino pelo botão central; preservação das métricas de progresso no hub.
- Cronômetro com descrição explícita da pausa apenas visual e referência de 30 minutos identificada no painel.
