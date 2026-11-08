# M10 — introdução, login e cadastro mobile — 0.1.144

## Revisão do que existia

Base do checkout8b1cafa/main, limpa; pipeline GitHub/Vercel anterior143 reconferido como success. M08–M09 preservados. Não houve auditoria manual de cada tela: suíte ampla e caminhos de acesso foram revisados, com atenção aos limites abaixo. Na143, /auth era rota legada que redirecionava ao Santuário, enquanto a conta integral ficava em /?progresso=conta. Formulário misturava instruções técnicas/conferência com acesso e não oferecia mostrar senha. Onboarding exigia authStore legado e retornava/auth mesmo quando o escritor legado estava desativado. Conta/e-mail pessoal hospedados ainda sem aceite.

## Implementação e UX

- Apresentação curta do produto em primeiro acesso sem QUALQUER projeção core/Fitness. Escolhas reais: criar conta, entrar, experimentar sem conta, importar progresso e conhecer os elementos. Sem recompensa/XP fictício, carrossel obrigatório ou nova persistência de onboarding.
- Primeiro acesso na raiz é decidido DENTRO do load já protegido por startProgressSession. Restauração/conexão/resolução/acesso lembrado mantêm precedência. Qualquer store existente, inclusive JSON inválido/vazio, impede interpretar a origem como nova: dados não são descartados/decodificados para decidir mostrar a introdução.
- /auth, /entrar, /cadastro e links /?progresso=conta abrem a MESMA conta integral isolada, antes de App/auth legado/stores. /boas-vindas e /?progresso=inicio mostram a apresentação; /santuario continua sendo acesso direto ao app. Views explícitas de recuperação/restauração têm prioridade sobre aliases. Credenciais nos retornos dos aliases são removidas antes do mount, exigindo login explícito como antes.
- Login/cadastro/recuperação com uma mesma marca e paleta. Cinzel em títulos, Inter nos controles; base#080b12, painel#141b27, texto#f2efe7, ouro#d5b66f e acentos dos quatro elementos. Arte existente do personagem/elementos, sem alterar assets ou incluir loops decorativos. Formulário é o foco no celular; ilustração maior no tablet/desktop. Imagens ocultas do login usam lazy loading.
- Labels/names/autocomplete, e-mail sem autocorreção, campos16px, controles≥44px, mostrar/ocultar senha por escolha, confirmação de senha e respostas de espera/erro. Paste não bloqueado. E-mail preservado ao mudar o modo, senhas limpas e ocultas; nenhuma sessão construída por trocar modo ou visibilidade. Modo escolhido refletido no URL e título de página útil.
- Importação com link próprio. Textos deixam claro que entrar/criar não substitui o progresso; conectar/receber continua sendo passo explícito após validar conta. Cópias/recibos/recuperação avançada preservados e recolhidos para não competir com o formulário.
- Onboarding visual com apresentação dos elementos e áreas agrupadas em disclosures nativos; usa OS MESMOS comandos de seleção e completeOnboarding. Dados ou onboarding completo continuam evitando repetição. Modo local pode conhecer os elementos sem authStore legado; legado habilitado conserva seu guard. Nenhum campo novo de store, XP, taxa, recompensa ou cálculo.
- Cor de tema e fundo do manifest alinhados ao canvas escuro; ícone, nome, start_url e scope preservados. Manifest URL144 para atualização de apresentação. Sem apagar caches, reinstalar ou forçar reload de formulários.

## Auth e dados

accessAccount, account-session, recuperação/transportes, JWT, CAS, gates de produto e autorização de gravação não foram substituídos. Não há novo SDK, provedor, secret ou motor de persistência. A conta só é conectada após o passo existente; signup não adota automaticamente uma sessão. Não criado usuário real, não enviado e-mail, não importado progresso pessoal.

Consulta pública /auth/v1/settings retornou200: email enabled, signup permitido, confirmação exigida. Isso NÃO comprova SMTP, entrega de e-mail ou redirects do novo domínio. Aceite de cadastro/login/recuperação com e-mail REAL e conexão de uma jornada pessoal seguem pendentes; não afirmar contas universais prontas ou sincronização com app fechado.

Compatibilidade144 aditiva aplicada via ferramenta oficial após teste PGlite. Histórico real20261108014325_access_onboarding_version_144, validador a7d8b1f160e36695f218bd8c21dcbcaf3c0b81080306398d73e7573ef3b1939b. Gate true e0contas integrais preservados. Arquivo alinhado ao timestamp remoto sem alterar bytes; dois testes de versões143/144 repetidos depois. Advisors antes/depois sem novos avisos: search_path de public.touch_updated_at e proteção de senha vazada desativada continuam para revisão do backend; 3tabelas privadas RPC-only com RLS e sem políticas diretas. Sem novas permissões ou alteração de Auth hospedado.

## Verificações executadas

- npm run build:release: **751 testes, zero falhas**, lint e build passaram; último build8,60s. Tipos passaram. Warning preexistente de chunks>500kB; não é prova de performance no telefone.
- 49 direcionados iniciais de entrada/startup/conta/recuperação/compatibilidade passaram. Testes de senha visível e origem existente adicionados. Após ajuste final da prioridade de views,12testes de routing/introdução repetidos e passaram. Dois de compatibilidade repetidos após alinhamento de nome, lint em CI/production passou. Após o acabamento de teclado/autocorreção e safe areas,40 direcionados, lint e tipos/build repetidos passaram; percurso Chromium completo repetido passou.
- Capturas iniciais de5telas em360/390/768, sem overflow nem Auth. Revisão removeu foco automático que desenhava borda no título. Campos visíveis16px; hero oculto no login mobile. Ícones com rótulo, foco de teclado e safe areas. Spinner respeita reduced motion.
- Chromium/build de produção/conta descartável: boas-vindas sem gravar progresso; login inválido, cadastro confirmado pelo mock e pedido de recuperação com respostas SDK INTERCEPTADAS no navegador (nenhuma chamada/e-mail real); senhas visíveis/ocultas, troca de modo, confirmação desigual, Tab/skip link,360/390/768 e hitboxes≥44px. Primeiro ensaio mediu fontes de inputs ocultos/checkboxes e foi corrigido para controles visíveis que abrem teclado; produto não foi alterado para satisfazer o ensaio.
- Browser com fixture de ritual concluído e XP Água>0: raiz mantém atividade/IDs/XP e abre Santuário, sem reiniciar introdução. Outro contexto vazio escolhe uma área pelo onboarding, conclui com comandos reais e mantém XP0. Perfil real não acessado.
- Não é teste físico do iPhone, teclado nativo, e-mail/conta hospedados ou transferência pessoal. Artefatos em [evidence/entrada-mobile-0.1.144](evidence/entrada-mobile-0.1.144).

## Auditoria de interface aplicada

Diretrizes atuais: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Documentação Supabase de senha: https://supabase.com/docs/guides/auth/passwords. Changelog consultado; mudanças de Flutter3/CLI3 não aplicadas ao lote (CLI2.119 preservada).

- src/main.tsx: fluxo de acesso separado de App e explícita precedência de recuperação.
- src/components/backup/AccountWorkspace.tsx: rótulos/autoComplete, ações nomeadas, e-mail sem spellcheck, mostrar senha, feedback acessível; guards existentes preservados.
- src/components/backup/AccountRecoveryWorkspace.tsx: mesmos tokens/semântica e validação anterior de link/senha.
- src/components/entry/entry.css: alvos≥44, campos16, foco visível nos controles, safe areas, ausência de elementos fixos sobre teclado, reduced motion e motion contido.
- src/pages/Onboarding.tsx: seleção com aria-pressed e agrupamento nativo; sem depender só de cor.

Revisão React Best Practices aplicada sequencialmente: hooks antes de retornos condicionais, identidade/geração dos handlers preservadas, arte fora do formulário e carregamento isolado da introdução; sem novo fetch, provedor ou efeito que grave progresso.

## Publicação e próxima etapa

Publicado no origin/main de Matheus: commit1decdaf369359e7c2742e1cdd78d0ea4e78874bd; CI42436358696 success com instalação limpa,751testes/0falhas, lint/tipos/build. Vercel9PcQ2QnVASCnnaubX8vD2KLrpAyv success na integração Git, sem CLI deploy ou novo projeto. https://conselho-elemental-main.vercel.app/app-version.json confirmou144 e no-store; /auth, /boas-vindas, cadastro, recuperação e manifest retornam200. Chromium público repetiu todos os cenários sintéticos em360/390/768 sem erro; login/cadastro/recuperação continuam com respostas INTERCEPTADAS, sem Auth real. IAB do usuário abriu o novo login (/auth), campos vazios e progresso local reconhecido; nenhuma digitação, submissão ou alteração de dados. Logs administrativos de runtime/drains Vercel não estavam acessíveis; zero erro refere-se ao percurso no navegador. Artefatos públicos e metadados de release anexados. Custódia documental sequencial concluída; reservas encerradas. Fábio continua frontend; Matheus revisa e-mail/redirects/segurança do backend. Em outro domínio, importar explicitamente a cópia mais recente; esta UI não transfere o progresso sozinha.
