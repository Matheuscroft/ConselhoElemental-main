# F6-N05 — importação real destravada e acesso Auth isolado — 0.1.136

07/11/2026 · Astro Boy sequencial · Sol Alto. Checkout codex/fitness-ui-integration, base67bb6e5, alterações preexistentes preservadas. Pedido atual: levar todo o progresso e XP local ao app usado no celular, mantendo a evolução para contas individuais.

## Causa real de importação e solução

Com autorização atual para transferir o próprio progresso, foi localizado e lido somente o JSON exportado pelo usuário na pasta Downloads. Não houve extração de storage do navegador, acesso a sessões, .env ou credenciais. O arquivo0.1.130 passa checksum/estrutura, mas ainda gera14 avisos de vínculo. M06 havia corrigido TaskItem direto; a cópia real também contém rituais de jornadas e missões.

`addTaskToQuest`/`addTaskToMission` e equivalentes de hábitos chamam `addTask`/`addHabit`, cujas Actions canônicas mantêm parentId=null. As representações nativas plana e aninhada guardam o pai contextual. A auditoria comparava null com esse pai e recusava a restauração. Caso reproduzido com APIs reais da store em fixture sintética; não se alterou a regra de criação nem a hierarquia persistida.

`auditProgressLinks` agora compara o pai efetivo da raiz canônica SOMENTE quando: Action de perfil com pai estritamente null e tipo/lifecycle raiz válidos; pai único e concordante em AMBAS as representações nativas plana e aninhada; aninhamento pertence a MISSION/QUEST e o parentId aponta para seu contêiner. Não substitui pai explícito, não infere com uma projeção isolada e não resolve ambiguidade. Referências ausentes/circulares e divergências reais continuam recusadas, incluindo testes de pai errado, pertencimento duplo e ausência de uma das representações. Cada perfil é auditado separadamente. O caso TaskItem anterior permanece.

Cópia real revisada: checksum intacto, auditoria sem avisos após a correção. Restauração executada SOMENTE em memória isolada, com os helpers reais e origem-alvo Vercel; ambas as projeções persistidas correspondem exatamente ao arquivo. Após hidratação com a store, XP por elemento, pontuação, Prana, melhor constância, atividades e histórico conferidos. O arquivo original permaneceu byte a byte igual. Não foi carregado em fixture distribuída, navegador real de produção ou banco.

Limite observado: a comparação integral do objeto de usuário após hidratar inicialmente falhou porque a constância atual é recalculada pela rotina existente conforme o dia/histórico. Não foi registrada como igualdade integral nem corrigida por migração. O ensaio final exige preservação de todos os demais campos e verifica essa diferença derivada separadamente. Não alteramos cálculos ou históricos para conservar um indicador diário antigo. A cópia é de06/11; registros posteriores precisam de nova exportação local. Dados/identificadores/conteúdo pessoal não entram neste relatório nem na evidência versionada.

## Auth sem transferência automática

Novo gate estático `ACCOUNT_ACCESS_RELEASED=true` habilita somente os formulários isolados existentes: cadastro, login/getUser, reenvio e recuperação de senha. `ACCOUNT_TRANSFER_WRITES_RELEASED` continua false e não é habilitado por esse gate. Início de jornada, vínculo, envio, recebimento, resolução e sync continuam fechados; seus guards de handlers são preservados.

Página de acesso apresenta o caminho já liberado para importar a cópia neste aparelho. Controles de transferência ainda indisponíveis ficam ocultos para contexto sem tentativa/resolução pendente, reduzindo a página no celular. Ferramentas locais/handlers e conferências pendentes são preservados. Sessão só em memória; signup descarta sessão e pede confirmação/login explícito. Testes exercitam login/cadastro com Auth liberado e transferência fechada, inclusive handlers forçados: nenhum RPC de progresso, handoff ou alteração local.

Não foi criado usuário real, enviado e-mail nem digitada senha. Recuperação/e-mail real e recebimento em duas contas/aparelhos continuam pendentes. Liberação de campos não é comprovação de entrega de e-mail para qualquer pessoa ou sincronização pronta. URLs aprovadas/persistidas emN04 foram reaproveitadas, sem nova edição administrativa.

## Verificações executadas

- 46 testes direcionados iniciais passaram. Depois,8 de compatibilidade, com criação de jornada/missão/ritual/ciclo pela store, restauração/hidratação e conflitos, passaram.
- Suíte completa:697 testes passaram (76,43s), incluindo Astro Boy. Após ajuste final de visibilidade e asserção correspondente,34 de workspace/recovery/compatibilidade repetidos passaram (5,90s). Não representar a suíte completa como repetida depois desse ajuste.
- TypeScript, lint e build finais passaram. Vite local6,61s com envDir:false; remoto18,38s. Aviso de chunks grandes permanece; sem mudança de dependências/catálogos.
- Conferência por SHA contra início do lote: appStore/workoutStore e demais fontes fora do escopo preservadas. Versões package/lock raiz/lock pacote alinhadas136; diff-check passou. Novo gate, auditoria, UI e testes são o escopo adicional; contribuições anteriores não são atribuídas a este lote.
- Changelog Supabase e docs oficiais consultados; endpoints Auth existentes mantidos. Conector Vercel respondeu403 nesse escopo; CLI já autenticada confirmou projeto/owner corretos, sem trocar equipe/permissões.

## Publicação e navegador

Publicado no MESMO projeto `conselho-elemental-testes` / prj_2feHjC8XBOmFRRxbL39qGvTXQb0r / fr-prodiction, pela autorização continuadaP04 e pedido atual. Deployment **dpl_Dhxu8RiV7W8acbnqTPcKbJzGtUBB**, READY, alias estável **https://conselho-elemental-testes.vercel.app**. HTML da importação/entry e três chunks relacionados responderam200; entry contém versão136.

Upload privado contém somente fonte/assets/configuração de build (509arquivos), sem .env, sessões, perfil de IDE, SQL, docs/testes/QA ou backup pessoal. Nenhum progresso é incorporado ao JavaScript público; publicar código não transfere armazenamento local.

Navegador interno abriu a importação real com seletor, depois o acesso com campos habilitados; alternância para Criar conta exibiu confirmação de senha. Link da conta voltou à importação. Nenhum formulário Auth enviado, arquivo pessoal selecionado ou substituição no navegador. Capturas são do computador, sem aceite de iPhone físico ou afirmação de viewport móvel.

[Evidência](evidence/conta-acesso-importacao-0.1.136/verificacoes.json), [importação publicada](evidence/conta-acesso-importacao-0.1.136/importacao-publicada.jpg), [cadastro publicado](evidence/conta-acesso-importacao-0.1.136/acesso-publicado.jpg).

## Compatibilidade e próximo passo

Produtor136 aceito no auditor local, mesmo schema1. Candidato `20261107045407_account_archive_version_136.sql` criado pela CLI, exercitado em PGlite após135, guardas/hash/gate fechado preservados. **NÃO aplicado remotamente**; banco continua aceitando até135. Não abrir envios136 antes de aplicar/revisar essa compatibilidade e validar Auth real. Nenhuma escrita remota/gate alterada, secrets acessados ou push realizado.

Próximo: usuário exportar cópia nova no app LOCAL para incluir registros após06/11; mover JSON privado ao celular e importar NO MESMO navegador/app instalado em que usará o produto; conferir XP/atividades e recarga. Não limpar dados nem reinstalar. Abrir a mesma origem no computador não transfere dados ao telefone. Aceite pessoal no iPhone ainda pendente.

Após receber a cópia: validar cadastro/confirmação/login no formulário publicado, com credenciais digitadas pelo usuário. Em Sol Alto, fechar compatibilidade136/aceite hospedado e vincular a identidade à cópia conferida pelo protocolo integral existente (recibo/readback/CAS), antes de liberar sincronização e prometer salvamento para qualquer conta. Sol Médio só para polimento/QA mobile delimitado. Custódia documental revisada sequencialmente e reservas encerradas; fila canônica continua FILA-ENTREGAS.
