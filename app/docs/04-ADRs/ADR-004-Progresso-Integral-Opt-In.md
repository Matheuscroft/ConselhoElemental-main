---
title: "ADR-004: persistência integral opt-in da conta pessoal"
date: "2026-10-29"
status: "Migração hospedada instalada; escrita e aceite integral de conta pendentes"
---

# Persistência integral opt-in da conta pessoal

Fábio autorizou explicitamente que Astro Boy implemente a integração de conta sem esperar Matheus, mantendo cálculos e recursos existentes. Esta autorização permite o lote de código backend; não autoriza deploy, aplicação remota de migração, leitura de secrets, mesclagem destrutiva ou alteração de fórmulas. Os papéis e a revisão posterior de Matheus continuam preservados.

## Autorização adicional de instalação — 30/10/2026

Após revisar o pacote F3, Fábio autorizou explicitamente “Sim, aplicar somente essa migração com escrita desativada”. Aplicação concluída no DominioDoMagoDB, histórico/local 20261030202517_progress_account_atomic, mesmo conteúdo/hash do arquivo original 20261029182304. Gate permanece false e catálogo/permissões conferidos. Essa autorização adicional não ativa conta, transfere progresso pessoal, cria usuários ou publica Vercel. [Evidências e próximos critérios](../plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md). A descrição da autorização de código local acima é histórica e não substitui este escopo restrito.

## Aplicação de compatibilidade135 — 07/11/2026

Após pergunta específica de compatibilidade122→135 com escrita desativada, usuário instruiu continuar. Executado somente o pacote revisado SHA d9f1704ca2e8b8669ab85ebd1469a1c1c0076973d2972b2f44dc225ac6a5d9ba no projeto correto. Migração real20261107042615, gatefalse e protocolos/permissões preservados. [F6-N03](../plans/FECHAMENTO-F6-N03-COMPATIBILIDADE-INSTALADA.md). Não autoriza abrir escrita, criar usuário, enviar progresso pessoal ou publicar app. Auth/aceite integral seguem separados.

## Problema

O sync legado persiste parte do core em tabelas com payload, mas não o conjunto de XP/recursos, histórico, perfis e Fitness do backup. Reaplicar conclusões para recompor o saldo muda fatos históricos; manter dois escritores ativos produz divergência. Login cloud-first atual tampouco é uma migração integral segura.

## Decisão implementada neste lote

Para uma conta que opte explicitamente pelo novo contrato, um único registro privado `progress_private.account_state` contém **o mesmo arquivo dos dois persist projections existentes**, com revisão e hash dos bytes. Não há store frontend paralelo, novo modelo de hábitos ou motor de pontuação. O arquivo é preservado byte a byte; inclui IDs/perfis/recibos, não credenciais. A unidade remota é todo o backup de todos os perfis locais, exigindo consentimento explícito. Não selecionar/publicar perfis automaticamente pelo nome da conta.

`account_receipts` contém somente identidade da tentativa, revisão/hash/data, sem outro saldo ou cópia das atividades. Commit e recibo são gravados na mesma transação. Revisão esperada impede sobrescrever edição posterior; tentativa repetida com mesmos bytes/revisão retorna o recibo original. Reutilização da tentativa para outro conteúdo falha. Leitura posterior deve confirmar o estado exato; recibo antigo não prova que a revisão ainda seja atual.

Para evitar persistência paralela **ativa**, contas sem opt-in continuam no caminho legado, e contas com estado integral não podem continuar escrevendo pelo legado. Os dados/tabelas legados não são apagados. Triggers serializam gravações de clientes antigos com o commit por usuário e recusam insert/update/delete quando existe o estado integral. O código de sync e suas regras não foram reescritos.

A primeira versão recusa opt-in quando já há domínio nas tabelas legadas: não declara essa conta vazia, não fabrica os campos ausentes e não converte/mescla automaticamente. Uma conversão de conta legada exigirá prévia e preservação própria. Perfil público isolado (nome/avatar) não é apagado nem reescrito pelo commit integral.

## Segurança e release

- Usuário é obtido de `auth.uid()` no servidor e precisa coincidir com o ID de destino esperado enviado pelo chamador. Nunca usar `user_metadata` ou o ID local do personagem como autorização.
- Tabelas privadas têm RLS e nenhuma permissão de leitura/escrita para clientes. RPCs públicas são invoker; apenas três rotinas privadas estritamente owner-bound elevam privilégios para executar o protocolo sem dar acesso direto que contorne CAS/recibos. `search_path` é vazio, objetos qualificados, grants explícitos só para authenticated e PUBLIC/anon revogados.
- A validação SQL confere limite de 20 MB, formato/versão/estrutura dos dois módulos, alinhamento da conta, profundidade/chaves e SHA-256 do arquivo existente. Mantém ordem JSON para reproduzir checksum do exportador; jsonb sozinho não é esse checksum. Não executa cálculos ou migração semântica do domínio. A auditoria crítica completa do cliente continua obrigatória; banco não vira um segundo motor do jogo.
- `release_gate.writes_enabled` nasce **false**. Cliente authenticated não pode abri-lo. Nos testes, só o dono do PostgreSQL temporário o abre. O produto não tem URL/env/storage que remova essa proteção do servidor.
- **Não liberar o gate nem implantar como conta pronta antes do bootstrap/confirmador compatível.** Clientes antigos ainda podem ler tabelas legadas; impedir escrita não os torna leitores do formato integral. A retomada online precisa reconhecer o contrato completo antes de executar cloud-first/reset/autosync legado. Na entrega 0.1.100 nenhum chamador de escrita estava montado; a 0.1.101 acrescentou workspace isolado com Auth/escrita bloqueados em fonte (ver complemento abaixo).

## Verificação e limites

0.1.100: 19 testes novos (11 SQL, 8 transporte), incluídos em 435 testes globais aprovados. Migração executada em PostgreSQL 18.6 via PGlite 0.5.13, em memória, com roles e `auth.uid()` sintético. Testam propriedade/permissões, arquivo inteiro, perfis/contadores/recibos, revisão, repetição, falha transacional, gate e bloqueio de writes legados. Transporte usa o mesmo SQL por cliente substituto; ponte estrutural ao SDK instalado passa TypeScript.

PGlite tem uma conexão serial: os testes de duas intenções verificam CAS, não comprovam disputa entre sessões reais/advisory locks. Não foram exercitados Supabase Auth/JWT/RLS hospedado, PostgREST, grants/configuração Data API remota, latência/limites de HTTP reais, DB Advisors remoto ou navegador. Nenhum segredo, usuário real ou banco existente foi acessado. Migração apenas criada localmente, não aplicada no projeto Supabase.

Próximo: confirmação/retomada e bootstrap com cliente isolado, consentimento/readback da cópia anterior e recuperação durável; seguir em Sol Alto. QA mobile/tablet e polimento em Sol Médio, com aviso antes da troca. [Plano e evidências](../plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).


## Complemento 0.1.101 — confirmação não é ativação online

Workspace pré-App preparado com sessão transitória, cópia/readback, consentimento de todos os perfis, tentativa durável antes de commit e consulta de recibo sem reenvio. Retry exige consentimento separado, reutiliza operação e recusa baseline local alterado. Pausa mantém tentativa e instala isolamento antes de App. Fechamento após recibo preserva stores e continua somente local; edições posteriores requerem confirmação de preservação local. Não vincula sessão global nem ativa autosync. UI/Auth e servidor continuam fechados; sem alteração remota.

453 testes globais e 30 direcionados finais aprovados; tipos/lint/build passaram. SQL temporário/SDK com HTTP interceptado/DOM sintético não comprovam Auth hospedado, concorrência ou QA visual. Próximo: 1B5, bootstrap online compatível/vínculo durável em Sol Alto; avisar antes de mudar para Médio no QA mobile. A regra de conversão de contas legadas e resolução de tentativas sem recibo com dados locais posteriores não é substituída por limpeza automática. [Detalhes atuais](../plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).


## Complemento 0.1.102 — vínculo explícito e início protegido

Referência durável a recibo/revisão/hash/digest, sem credenciais ou arquivo de domínio, é guardada somente por confirmação separada no primeiro fechamento. Vínculo não autentica: startup reconhece-o e isola documento antes do legado; inválido bloqueia. Próximos envios explícitos conferem revisão anterior e usam CAS; interrupção mantém tentativa, sem rebase automático. Handoff grava modo local e vínculo antes de remover tentativa.

Serviço legado recebe guardas de identidade/formato antes de I/O e antes de hidratar, preparadas sob o gate compartilhado ainda false. Não afetam clientes antigos já distribuídos; rollout e concorrência hospedada continuam critérios. 467 globais + 27 direcionados finais aprovados; tipos/lint/build. Sync contínuo, retomada online completa, importação em outro dispositivo e resolução de conflitos ficam para 1B6 em Sol Alto. [Plano atual](../plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).


## Complemento 0.1.103 — coordenador de sessão e conferência

Sync integral preparado sob consentimento adicional, lease exclusivo por documento e cliente transitório próprio. Arquivo do domínio existente; intent antes do commit, revisão CAS, recibo/readback e vínculo antes da limpeza. Edições durante envio continuam locais até próxima revisão; timeout/identidade/conflito param sem retry automático. Recarga não reativa sessão. Auth/global legado permanecem isolados; sem segundo store ou motor.

Conferência exporta arquivos e mostra diferenças sem selecionar/substituir/mesclar. Resolução e recebimento em outro dispositivo são próxima 1B6B em Sol Alto. Gates permanecem false. 486 globais + 5 direcionados finais, tipos/lint/build; SQL e lifecycle sintéticos não são aceite hospedado/visual. [Plano atual](../plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).


## Complemento 0.1.104 — resolução explícita e recebimento

Escolha de arquivo completo local/online exige revisão congelada, cópias salvas/readback e consentimento de substituição/escopo. Commit CAS cria revisão nova mesmo para receber os mesmos bytes online, impedindo pedido antigo de vencer após a confirmação. Journal local before/target/operação precede o envio; pares locais/vínculo só mudam depois do recibo/readback. Falha mantém bloqueio pré-App e retoma mesma escolha sem retry automático. Não soma XP, mescla ou reexecuta domínio.

Nova origem sem arquivo pode receber após Auth e escolha explícita; vínculo é local à origem, hash/recibo autorizam proveniência diferente. Reavaliar preservando local depende de revisão remota diferente, estado local original e consentimento; não cancela offline nem apaga intent antigo. Gates false, 504 globais + 42 finais e tipos/lint/build aprovados. Aceite hospedado/rollout/visual permanecem separados; próxima revisão frontend em Sol Médio, contratos críticos em Alto. [Plano atual](../plans/R25-B-ASSOCIACAO-CONTA-PESSOAL.md).


## Complemento 0.1.120 — disponibilidade e compatibilidade hospedadas

Banco confirmado ACTIVE_HEALTHY; catálogos inspecionados sem linhas pessoais confirmam schema integral ainda ausente e diferenças legítimas do legado. Instalação local agora recusa colisões/dependências mínimas inválidas antes de CREATE, com variante de colunas hospedada exercitada em PostgreSQL sintético. Não reexecutar init/alinhamentos antigos. 625 testes/checks locais aprovados; SQL remoto/gates/cadastro real ainda não executados. [Pacote exato/hash e próximo escopo remoto](../plans/FECHAMENTO-F3-INSTALACAO-INTEGRAL.md).


## Complemento 0.1.121 — recuperar acesso não escolhe progresso

PKCE/usuário verificado/senha/logout temporário em documento isolado, sem stores ou adoção do Auth legado. Tokens permanecem em Map; somente prova de recuperação própria e expirada logicamente em uma hora usa storage. SDK exige persistSession:true para respeitar o adapter Map; descarte real e retorno tardio comprovados em testes. Patch separado 20261030204257 acrescenta produtor 121 ao mesmo schema, somente se corpo anterior e gate fechado corresponderem ao revisado. Aplicado como compatibilidade necessária da integração, escrita continua false; sem dados pessoais/Auth real. [Decisões e evidências](../plans/FECHAMENTO-F4-RECUPERACAO-ACESSO.md).


## Complemento 0.1.122 — autenticar separado de transferir

Arquivo deixa de ser pré-requisito do login/cadastro explícito, mas permanece obrigatório no envio/recebimento com os consentimentos/readback anteriores. Inspeção inicial de contexto precisa terminar antes de ações. Signup não adota sessão; confirmação de URL é só aviso, seguido de login/getUser consistente com identidade e tentativas. Retorno Auth inclusive na raiz não carrega o legado; callback Google separado preservado. Revisão privada de compatibilidade 122 aplicada sobre hash anterior conferido e gate false, sem reescrever migrações/arquivos anteriores. [Decisões e evidências](../plans/FECHAMENTO-F5-CADASTRO-CONFIRMACAO.md). Retomada persistida, conta vazia e aceite real ainda pendentes.


## Complemento 0.1.136 — acesso isolado antes de enviar progresso

F6-N05 separa ACCOUNT_ACCESS_RELEASED do gate estático de transferência. Acesso habilitado permite somente Auth explícito com os clientes/Map existentes; não monta App, não grava arquivo, não associa conta ou inicia sync. Guards de transferência e gate do servidor continuam fechados. Signup ainda pede confirmação/login e nenhuma sessão é adotada automaticamente. Compatibilidade local136 não amplia o validador hospedado135; candidato SQL separado, não aplicado. [Evidência e limites](../plans/FECHAMENTO-F6-N05-ACESSO-E-IMPORTACAO.md).


## Complemento 0.1.138 — confirmação única da importação local, autorizada pelo usuário

No pedido em voz de07/11/2026, usuário exigiu importar apenas o arquivo com seu progresso/XP, sem segundo JSON ou checklists, antes de criar conta. Esse pedido substitui a exigência de exportação/readback MANUAL de segurança no percurso local normal. Não altera os requisitos de associação/sync online. O cliente prepara/confere internamente a projeção anterior, mantém before/target no journal durante a operação e só conclui uso local após readback sob a mesma exclusividade. Uma única ação, com aviso de substituição/fechamento de outras abas/uso local, abrange os consentimentos manuais anteriores. Não prova ausência de clientes legados; lease real continua obrigatório. A segurança anterior é temporária durante a importação; exportar arquivo separado é opcional. [F6-N08](../plans/FECHAMENTO-F6-N08-IMPORTACAO-SIMPLES.md) distingue percurso real testado, limitações e aceite pessoal pendente.


## Complemento 0.1.139 — compactação do artefato de recuperação e retomada

F6-N09 reproduziu QuotaExceededError com o arquivo correto: before/target completos no journal e as stores simultâneas excediam5MiB. O journal conserva formato lógico1 e envelope payload/checksum, mas o payload admite `gzip-v1:` com gzip/base64, SHA sobre o texto codificado e expansão limitada100MiB. Leitor aceita JSON legado; escritor mantém texto simples quando a API nativa não existe ou a compactação não reduz o tamanho. O JSON exportado e as stores não mudam. Não há dependência adicional, descarte de dados ou compressão do progresso ativo.

A confirmação única autorizada emN08 agora cobre também concluir a cópia já selecionada numa tentativa pendente: revisão do baseline, validação integral, mesma exclusividade, substituição do journal antigo por compacto, gravação/readback do destino, commit e continuação somente local. Consentimento é uma ação explícita; nada é aplicado no mount. Conflito externo não permite concluir. Rollback e retomada priorizam partes que reduzem o uso para não estourar a quota no estado intermediário. A proteção permanece em falhas, inclusive no marcador local. O limite físico continua existindo: um destino que por si só não cabe é recusado e permite recuperação, não limpeza automática. [Relatório e limites](../plans/FECHAMENTO-F6-N09-QUOTA-IMPORTACAO.md).


## Complemento 0.1.140 — conexão simples autorizada e beta owner-bound

Após confirmar sucesso da importação no celular, usuário autorizou evoluir Conta ativa para cadastro pessoal, salvar a jornada atual e permitir contas de testadores com sincronização diária. Essa instrução amplia a autorização anterior restrita: cliente de transferência passa a true e gate do servidor é ativado por owner após compatibilidade140/preflight/testes, sem alterar grants, política de propriedade ou dados. [F6-N10](../plans/FECHAMENTO-F6-N10-CONTA-CONECTADA.md) registra evidências e limitações.

A confirmação de conexão passa a ser uma ação explícita com aviso adjacente sobre todos os perfis, próximas alterações e retomada12h nesta aba. Cópia/readback anteriores são preparados internamente; begin/finish/recibo/CAS existentes permanecem autoridade. Primeiro envio aceita somente conta online vazia, sem conversão automática das duas contas legadas encontradas. Vínculo existente exige revisão; receber progresso requer escolha explícita da versão online e fenceCAS do resolver. Tentativa com recibo pode ser concluída sem reenvio; sem recibo, a UI pede conferência. Intent/resolution comprimem só artefato de proteção, aceitam payloads JSON antigos e não mudam archive/schema/store/XP. Não são criados motores ou persistência de domínio paralelos.

Retomada continua opcional/consentida por12h na aba, sem senha salva. O botão direto inclui esse consentimento no aviso; o caminho avançado preserva a escolha anterior. Não foi adicionada sessão persistente entre fechamento de abas nem execução com o app fechado. Saves após alterações, focus/visibilidade e retorno online usam o coordenador existente; offline não cria intent nem faz I/O, e ACK desconhecido permanece protegido. Conflitos entre dispositivos exigem escolha, sem merge automático.

A configuração URL/chave publicável só em vercel.json.env não chegou ao bundleVite hospedado: reproduzido no SDK real antes de Auth. Movida para seis variáveis Config do projeto, em produção/preview, removida declaração runtime-only. Vite falha no build hospedado se faltarem URL/chave pública ou se escritor/bootstrap legado estiverem habilitados. Nenhum secret foi lido/criado. Auth legado e serviço de Matheus permanecem no código; beta usa cliente transitório/documento isolado para preservar o arquivo integral.

Signup/login existiam e duas contas/dados legados hospedados comprovam uso anterior. Isso não comprova cadastro aberto a qualquer e-mail: settings público confirmou mailer_autoconfirmfalse/external.emailtrue/Googlefalse e painel SMTPcustomfalse. Usuário não possui domínio e relatou problema no Gmail; alternativa é provedor com verificação individual de remetente para beta, sem desligar confirmação. Configuração SMTP, e-mail real/JWT e associação pessoal continuam pendentes. Não declarar lançamento público pronto apenas por ativar o gate de persistência.

## Complemento0.1.142 — cronômetro operacional e atualização do app

Fábio autorizou tempo correto em segundo plano/bloqueio e novas publicações verificadas no mesmo Vercel para seu uso diário. M07 mantém fórmulas/recibos e projeções de progresso; tempo passa a usar âncora e a pausa exclui o intervalo pausado. A recuperação do cronômetro é metadado por aba/perfil em sessionStorage e não integra backup/conta nem cria saldo/histórico paralelo. Compatibilidade142 amplia só a allowlist do arquivo sobre hash141 exato, sem tocar gate/dados/permissões. Avisos de atualização não substituem consentimento de troca do progresso e não aplicam reload com intent/resolução/journal pendentes. [Evidência e limites](../plans/MOBILE-M07-CRONOMETRO-E-ATUALIZACOES.md).
