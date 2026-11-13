# Repasse para o Matheus — login persistente ("Manter conectado neste aparelho")

Continuação de `REPASSE-AUTH-OAUTH.md` e `REPASSE-AUTH-MENSAGENS.md`. Só autenticação: pontuação, XP, stores, `supabase/` e migrações **não foram tocados**. Nenhuma credencial foi lida ou digitada; não houve login real (veja "Não verificado").

## O problema
O registro de acesso (tokens + metadados, chave `conselho-elemental-tab-access-v1`) vivia em `sessionStorage` (some ao fechar a aba ou o PWA) e valia 12 h fixas desde o login. Resultado: login a cada abertura.

## Decisão do Fábio
Manter conectado por **90 dias sem uso** (prazo deslizante: renova a cada abertura/refresh bem-sucedido), opção **ligada por padrão**, com caixa "Manter conectado neste aparelho" na tela de acesso.

## O que mudou
- **Novo** `src/lib/backup/account-access-storage.ts` — único ponto de decisão do armazenamento. `accountAccessStorage(remember, window)`:
  - `true` → `localStorage` (este aparelho); `false` → `sessionStorage` (esta aba); `undefined` → onde o registro já está (retomada, "esquecer", checagem de entrada).
  - Leitura olha os dois lugares (aparelho primeiro). Escrita vai a um lugar e **apaga a outra cópia** (nunca tokens duplicados). Remoção limpa os dois.
  - `localStorage` indisponível/cheio (Safari privado, cota) cai para a aba, sem erro; sem nenhum dos dois, erro seguro em português. Leitura de `sessionStorage` quebrada continua lançando (tela protetora do startup).
  - Um **v1 em `localStorage` é ignorado** (v1 só existiu por aba); v1 em `sessionStorage` ainda é aceito.
  - A escolha do Google sobrevive ao redirecionamento como **apenas um booleano** em `sessionStorage` (`conselho-elemental-account-remember-v1`), lido e apagado uma vez no retorno; marcador ausente = só esta aba.
- `account-tab-access.ts`: registro **versão 2** com `lastUsedAt`; validade `ACCOUNT_TAB_ACCESS_TTL = 90 dias` desde o **último uso** (v1: 12 h desde o consentimento, só para a aba atual). Todas as validações rígidas de `inspectTabAccess` continuam (formato, origem, projeto, userId, tamanho/espaços nos tokens, chaves exatas). `lastUsedAt` é renovado a cada gravação (ativação, restauração, `control.capture` ao refresh do SDK). Novos: `withAccountAuthLock`, `persistRestoredAccess`, `watchAccessDeadline`.
- `account-live-access.ts`: o timer de `deadline` agora acompanha o prazo deslizante via `watchAccessDeadline` (re-armado em passos de até 24 h, porque `setTimeout` estoura em ~24,8 dias e 90 dias dispararia na hora).
- `resume-authenticated-account.ts` e `resume-account-session.ts`: restauração dentro de `navigator.locks.request('conselho-elemental-auth-refresh-v1')`; dentro do lock relê o registro mais novo, faz `setSession`, valida a identidade e **grava o par rotacionado antes de soltar o lock**.
- `account-auth-messages.ts`: ação `'resume'` + `accountSessionEnded()` (`refresh_token_already_used`, `refresh_token_not_found`, `session_expired`, `session_not_found`, `bad_jwt`, `user_not_found`, `invalid_grant`).
- `main.tsx` (`hasValidAccountAccess`) e `mount-account-resume.ts` usam o acessor. `main.tsx` ganhou **um** import eager (`account-access-storage`, sem dependências).
- `AccountWorkspace.tsx`: caixa "Manter conectado neste aparelho" (ligada) abaixo do formulário e do botão Google, com "Use só em aparelhos seus. Você pode sair a qualquer momento." As duas caixas antigas "Retomar o acesso após recarregar (até 12 horas)" foram **removidas** (a escolha agora é uma só, no login). **Sair desta conta** apaga o registro nos dois lugares e chama `auth.signOut({ scope: 'local' })`.
- Testes: `tests/backup/` 395 → 413 (novo `account-persistent-access.test.mjs` com 14; ajustes em `account-resume`, `account-workspace-ui`, `workspace-entry`).

## Regra de rotação do refresh token (por que o lock)
O Supabase rotaciona o refresh token a cada uso e **reutilizar um já rotacionado revoga a sessão**. Cada cliente do app tem `storageKey` próprio, então o lock interno do SDK não protege entre abas. Por isso:
1. O par novo é gravado de forma síncrona quando o SDK emite `TOKEN_REFRESHED`/`SIGNED_IN` (`control.capture`).
2. A restauração no startup roda sob um lock fixo e relê o registro **dentro** do lock (outra aba pode ter rotacionado). Há um teste que prova a corrida: sem lock as duas abas gastam o mesmo token e a sessão morre; com lock a segunda usa o par que a primeira gravou.
3. Fim definitivo da sessão (token já usado/revogado/expirado, registro corrompido ou vencido) → o registro é apagado, aparece "Entre novamente" via `accountAuthMessage` (sem texto do servidor), nenhum redirecionamento em laço (a tela `/auth` não redireciona) e o progresso local não é tocado. Falha de rede/servidor **mantém** o registro (só pede para tentar de novo).

## Risco principal: XSS e `localStorage`
Tokens em `localStorage` ficam legíveis por qualquer script que rode na origem (XSS ou dependência comprometida); em `sessionStorage` o alcance é parecido, só dura menos. Mitigações feitas: **nenhum script de terceiros foi adicionado**; nada é logado (token, e-mail, URL); o registro persistente só existe com a caixa ligada; a retomada continua **sem** autorizar leitura/escrita de progresso remoto nem adoção `legacy` (isso segue exigindo ação explícita).
**Sugestão para você (`app/vercel.json`, não alterado por mim):** adicionar um `Content-Security-Policy` restritivo (`default-src 'self'`; `script-src 'self'`; `connect-src 'self' https://myvxvgeyseoyugskqlqr.supabase.co`; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`), começando em `Content-Security-Policy-Report-Only` para não quebrar fontes/imagens/Service Worker. Também vale `Referrer-Policy: strict-origin-when-cross-origin`.

## O que conferir no Supabase (Authentication → Sessions)
- **Inactivity timeout** / **Time-box**: se estiverem ativos, vencem antes dos 90 dias do app (o app não consegue estender além do servidor). Para 90 dias sem uso, deixar o timeout de inatividade em ≥ 90 dias ou desligado, e o time-box desligado.
- **Refresh token reuse interval** (segundos de tolerância para reutilização): manter o padrão (10 s); o lock já evita a corrida, não dependemos da tolerância.
- **JWT expiry**: o valor padrão (1 h) serve; o SDK atualiza enquanto o app está visível.
- O "Sair" do app revoga só **esta** sessão (`scope: 'local'`). Já o botão "Parar e esquecer acesso" **dentro do app** (`forgetResume`) apaga o registro local mas **não** revoga no servidor: o refresh token continua válido até expirar. Se quiser, é um acréscimo pequeno em `account-live-access.ts`.

## Limites conhecidos / não verificado
- Login real com e-mail/senha e com Google **não foi exercitado** (sem credenciais); cobertos por testes com SDK simulado e pela tela real só até o formulário (caixa visível e marcada, registro corrompido → "Entre novamente" e registro removido).
- **Safari/ITP** apaga `localStorage` de sites **não instalados** após ~7 dias sem interação: fora da tela inicial, "90 dias" pode virar 7 no iPhone. PWA instalado não é afetado da mesma forma, mas **não foi testado no iPhone**.
- Início a frio **offline** continua pedindo a conferência de acesso (a retomada exige `setSession` + `getUser` na rede); comportamento já existente, agora mais visível porque o login persiste.
- O fluxo Google no PWA do iPhone (o redirecionamento pode abrir outro contexto e perder `sessionStorage`, inclusive o booleano) segue sem verificação.
- Duas abas abertas ao mesmo tempo: o progresso continua exclusivo (uma por vez); o lock cobre a corrida entre a aba do app e a tela `/auth`.
