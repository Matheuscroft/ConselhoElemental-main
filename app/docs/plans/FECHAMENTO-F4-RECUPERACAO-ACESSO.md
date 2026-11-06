# Fechamento F4 — recuperação de acesso e sessões descartáveis — 0.1.121

30/10/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base b11ed9d. Continuação do [fechamento da conta integral](FECHAMENTO-CONTA-E-PUBLICACAO.md). Diretriz do usuário: avançar e ajustar o necessário mantendo a lógica explicada. Não é liberação dos gates, transferência pessoal ou publicação na Vercel.

## Decisão de arquitetura

Manter três responsabilidades separadas: autenticação comprova a identidade; a conferência integral escolhe origem/destino e protege a cópia; o coordenador de sincronização envia os dois módulos existentes com CAS/recibos. Recuperar uma senha não escolhe uma versão do progresso, não cria personagem e não executa conclusões. Não conectar o formulário novo ao AuthStore/cloud-first legado como atalho. Backend de progresso e regras de XP continuam os mesmos.

O acesso cotidiano ainda está incompleto: esta entrega fecha a implementação local do percurso de recuperação e corrige descarte de sessão. Cadastro/confirmação, entrada de conta vazia, retomada após reload e experiência de login integral continuam no próximo lote. A instalação do banco ou o êxito dos testes não tornam a conta pronta.

## Fluxo implementado

1. Em Proteja sua jornada, **Esqueci minha senha** abre `/?progresso=recuperar` num documento isolado. Essa entrada não importa App, stores, sync legado ou dados do personagem. Usa identidade visual e controles nativos já existentes do workspace, sem nova biblioteca.
2. Pedido explícito de link usa o SDK Supabase com **PKCE S256** e redirect fixo para a recuperação na mesma origem. Resposta genérica não confirma existência de e-mail. Um novo pedido substitui a prova anterior. Não há e-mail cadastrado ou senha gravados no progresso.
3. Somente a prova PKCE fica em uma chave própria de localStorage, vinculada ao projeto e origem, aceita por até uma hora. Isso permite abrir o e-mail em outra aba do mesmo navegador. Outro navegador/dispositivo/origem não tem essa prova e precisa solicitar novo link. O registro vencido deixa de ser aceito; sua remoção física não depende de timer. A próxima solicitação substitui o registro. Não ler, limpar ou enumerar outras chaves de armazenamento.
4. Ao retornar, main captura o código e remove código/erros/credenciais da URL **antes** de carregar a UI/Auth. Falha ao limpar o endereço impede a entrada; não cai no App. Códigos duplicados, tokens de fluxo implícito ou erro no callback não são aceitos. O código fica em uma closure descartável e só pode ser consumido uma vez pelo botão de validação.
5. A troca do código exige a prova de recuperação e valida o usuário com getUser no servidor. Nenhuma chamada de senha é liberada antes disso. O e-mail conferido é mostrado, sem confiar em user_metadata para autorização. A sessão fica em memória e não vira sessão do app ou vínculo de progresso.
6. Nova senha e confirmação precisam coincidir, com mínimo local de oito caracteres; o servidor continua aplicando sua própria política. Antes do update, a identidade é verificada novamente. Resposta ambígua não é repetida automaticamente. Sucesso é separado da confirmação de logout: signOut(scope:local) encerra somente a sessão temporária, sem pedir saída global de outras sessões. Falha de logout não é apresentada como falha da senha já alterada.

Pedido/troca/alteração usam lock específico de recuperação entre abas e guarda de trabalho em curso. Sem Web Locks, recusam a operação em vez de usar um fallback sem proteção. Essa trava não substitui nem disputa a trava do domínio. Cada documento reutiliza um cliente de recuperação, com storageKey único para não receber eventos Auth dos clientes antigos. Cleanup e verificações após awaits recusam promoção tardia ao fechar a página. A prova antiga só é removida se ainda corresponder ao registro pertencente à operação; uma resposta atrasada não apaga outra prova mais nova.

## Correção comprovada no cliente de conferência

O SDK instalado ignora storage customizado com persistSession:false e usa seu próprio adaptador interno. Portanto, limpar o Map fornecido anteriormente não comprovava limpeza da sessão interna. Isso não significava tokens em disco, mas a garantia de descarte era incompleta.

account-session agora usa persistSession:true **para selecionar o adaptador Map fornecido**, não localStorage/sessionStorage. Auto refresh e detecção de URL continuam desativados na conferência. O storageKey é único por cliente; getItem após dispose retorna null e writes tardios são descartados. Testes com SDK real e HTTP sintético agora comprovam getSession().data.session===null após dispose, inclusive quando a resposta de signIn chega depois do descarte. Dispose não chama signOut global, não faz requisição extra nem apaga progresso. O handoff online/F1 continua iniciando refresh só depois das confirmações existentes.

## Compatibilidade da versão e ajuste hospedado

A versão de produto foi incrementada para 0.1.121. O backup inclui a versão do produtor e o servidor aceita somente versões revisadas. Para não deixar o cliente novo incompatível, a migração instalada F3 **não foi reescrita**. Uma revisão separada, gerada pela CLI 2.119.0, acrescentou somente 121 à validação do mesmo schemaVersion:1, mantendo todas as verificações anteriores.

Escopo necessário dentro da diretriz atual de ajustar a integração: patch transacional da rotina privada validate_archive, condicionado ao hash exato do corpo anterior e gate com uma linha/desativado. Nenhum formato, coluna, fórmula, checksum de arquivo existente ou saldo foi alterado. O patch recusa execução se a rotina já mudou ou se a escrita foi aberta. Não faz UPDATE de arquivos armazenados, não cadastra usuários nem habilita transferência.

Aplicação hospedada retornou success:true. ID remoto/local **20261030204257_account_archive_version_121.sql**; nome gerado inicialmente pela CLI: 20261030203429. Arquivo local/loader alinhados ao histórico real, sem duplicata. SHA-256: `4329eaf485d78d5542c12b8314173a1d14128508b3ce71f19b0c55fb70c9f09b`. A migração-base F3 mantém hash `9d0d074a51e62f4a98248ff699948546aab6a8203f586bd5d556b4b65bf85809`.

[Pós-verificação sem dados pessoais](evidence/CONTA-REVISAO-121-2026-10-30.json): SELECT do validador puro com envelope estrutural mínimo/sintético aceitou 0.1.121 e retornou o mesmo SHA-256 calculado no cliente. O envelope não representa uma conta completa, não passou por Auth/commit e não foi salvo em account_state. Gate continua false; validate_archive continua sem EXECUTE para anon/authenticated. Corpo novo conferido por hash. A primeira tentativa de preparar uma fixture grande falhou ao interpretar stdout com avisos; a seguinte foi recusada pela validação local do transporte. Nenhuma dessas tentativas executou SQL. Usou-se depois um envelope pequeno e explícito, sem confundir falha da ferramenta com defeito do produto.

Advisors após o patch manteve os mesmos dois WARN e três INFO da F3: [search_path da função antiga](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [proteção de senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) e [RLS sem policy nas tabelas privadas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Não abrir policies permissivas; acesso direto privado segue negado. Não mudar Auth/configuração antiga para silenciar avisos.

## Verificação e limites

SDK instalado + HTTP sintético: pedido S256, redirect, reabertura do cliente só com prova, getUser, update, logout local, expiração, origem/projeto/finalidade incorretos, lock ocupado, toque duplo, identidade alterada, descarte tardio, resposta ambígua e cleanup que preserva prova nova. Harness de componentes: gate false impede construção/consumo mesmo ao invocar handlers, validação explícita, senhas correspondentes, um cliente por documento e resultado tardio após unmount. Bootstrap: limpar URL precede mount; falhas não importam App.

SQL PGlite: revisão de versão preserva arquivo anterior byte a byte e gate fechado; recusa aplicar sobre validador alterado/gate aberto. Testes integram base+revisão local, enquanto teste dedicado comprova diferença entre ambas. Não mascarar o estado hospedado usando fixture candidata.

**640 testes globais finais aprovados**, após alinhar o ID local/remoto da revisão, em 23,78s (`/tmp/account-f4-installed-all.log`). TypeScript (`/tmp/account-f4-types-installed.log`), lint (`/tmp/account-f4-lint-installed.log`) e Vite envDir:false em 21,66s (`/tmp/account-f4-build-final.log`) aprovados. Quinze casos novos sobre a base de 625; SDK/HTTP, hooks e banco locais são sintéticos. As execuções intermediárias de 636/640 antes do alinhamento foram substituídas pela final. Avisos preexistentes de bundle/Browserslist mantidos. Revisão sequencial de escopo/versões/links em `/tmp/account-f4-final-review.json`. Nenhuma conta real, envio de e-mail, recuperação por caixa postal real, Auth/JWT/PostgREST ponta a ponta, inspeção visual/mobile ou migração pessoal foi realizada. Redirect allowlist/templates ainda precisam de conferência antes de liberar a conta. Não houve secrets/.env, deploy/push, mudança de economia ou agentes paralelos. O cache cli-latest atualizado pela CLI foi limitado ao marcador de versão e devolvido ao valor anterior versionado; nenhuma instalação global foi atualizada.

Documentação Supabase consultada: [resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [exchangeCodeForSession](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession), SDK instalado GoTrueClient/helpers para storage e PKCE. Revisão React sequencial: import dinâmico do Auth só após ação, efeitos sem escrita de domínio, refs para controle assíncrono, labels/autocomplete/feedback e botões nativos. Não equivale a aceite visual.

## Custódia final

Revisão sequencial concluída: 671 de 690 entradas anteriores idênticas ao baseline; 19 diferenças e dez arquivos novos dentro do escopo, nenhum inesperado. Migração-base F3 com hash original intacto, patch novo/ID remoto alinhados, versões/links/gates e git diff --check conferidos. Nenhum store/regra de progressão alterado. Reservas encerradas, continuidade/fila/manual/dossiê/ADR/changelog atualizados.

## Próxima entrega

**Continuar em Sol Alto:** unificar entrada/cadastro/confirmação e retomada de sessão integral após reload, com feedback de salvamento. Depois, aceite hospedado essencial e associação pessoal usando cópia integral salva/readback, mantendo gates fechados até os critérios. O app não deve chamar o sync antigo para contornar essas pendências. Reavaliar compatibilidade de versões explicitamente a cada mudança de produtor; não liberar versões futuras sem revisão. Sol Médio fica para UX/mobile delimitada após avisar a troca.
