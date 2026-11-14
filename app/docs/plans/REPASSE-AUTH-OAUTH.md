# Repasse para o Matheus — login social (Google)

> **Atualização 10/11/2026:** por decisão do Fábio o app expõe **somente Google**. GitHub e Apple foram removidos da interface (o resto do texto abaixo, escrito para GitHub/Apple, vale igual para o Google: PKCE, retorno fixo, sem adoção automática). Provedor Google configurado pelo Fábio: projeto Google Cloud "Conselho Elemental" (`graceful-karma-514317-e5`), cliente OAuth Web com redirect `https://myvxvgeyseoyugskqlqr.supabase.co/auth/v1/callback`, Client ID/Secret no painel do Supabase (segredo nunca no repositório). Pendências: publicar o app OAuth no Google (hoje em modo de teste) e desligar GitHub/Apple no painel do Supabase (estão ENABLED com configuração inválida). Vinculação: o Supabase vincula identidades com o mesmo e-mail verificado; contas Google novas criam usuário novo.

Continuação de `REPASSE-AUTH-MENSAGENS.md`. Só autenticação: nada de XP, stores, `supabase/` ou migrações.

## O que mudou
- **Novo** `src/lib/backup/account-oauth.ts`: `startAccountOAuth` (chama `signInWithOAuth` com `skipBrowserRedirect: true`, valida que a URL devolvida é `<projeto>/auth/v1/authorize` e só então o componente navega), `completeAccountOAuth` (troca o `code` por sessão, confere identidade com `getUser`, como o login por e-mail), `oauthReturnFailure`, `appleIdentityNotice`.
- `account-return.ts`: `captureAccountReturn` (já chamado por `main.tsx`, **sem novos imports lá**) agora reconhece o retorno OAuth quando existe um marcador fresco (10 min) em `sessionStorage` e guarda o `code`/código de erro **só em memória** (`takeOAuthReturn`). A URL é limpa para `/?progresso=conta` como antes. Sem marcador, o comportamento antigo (descartar credenciais, exigir login) continua.
- `account-session.ts`: `createAccountReviewSession` ganhou um 3º parâmetro opcional (PKCE). Sem ele, nada muda (e-mail continua `implicit`, tudo em memória).
- `account-auth-messages.ts`: ação `'oauth'` e códigos `provider_disabled`, `oauth_provider_not_supported`, `access_denied`, `provider_email_needs_verification`, `bad_oauth_callback`/`bad_oauth_state`/`bad_code_verifier`/`flow_state_*`/`oauth_error`. Código técnico discreto como hoje.
- `AccountWorkspace.tsx`: botões "Continuar com GitHub" e "Continuar com Apple" abaixo do formulário (valem para Entrar e Criar conta); `startOAuth` e `finishOAuthReturn` (mesmo estado de "acesso autenticado": `rememberAuthenticatedAccountAccess`, TTL 12h, mesmas checagens de conta do recibo). CSS em `account-journey.css`.
- Testes: novo `tests/backup/account-oauth.test.mjs` (11) e 4 casos em `account-workspace-ui.test.mjs` (harness passou a carregar `account-oauth`/`account-return` reais).

## Decisões e riscos
- **PKCE, não implicit.** Implicit devolveria `access_token`/`refresh_token` no fragmento da URL; PKCE devolve só um `code` de uso único, inútil sem o *code verifier*. O custo: o verifier precisa sobreviver ao redirecionamento. Ele fica em `sessionStorage` (chave `ce-account-oauth-code-verifier`, por aba, apagado após a troca ou falha). A **sessão continua só em memória**, depois persistida pelo mesmo `account-tab-access` (12h). Recuperação de senha e e-mail seguem `implicit`.
- **Redirect fixo** `https://conselho-elemental-main.vercel.app/?progresso=conta` (mesma entrada da confirmação por e-mail; a allow-list só tem esse e `?progresso=recuperar`). Em localhost o retorno vai para a produção (comportamento já adotado): não dá para concluir o login social em dev local.
- **Nada é registrado**: `code`, token e URL de retorno nunca vão a log, `localStorage`, história ou mensagem; erros guardam só um rótulo `[a-z0-9_]` curto.
- **Sem adoção/sincronização automática.** O retorno só deixa a aba autenticada; `legacy`, envio e sync continuam exigindo os botões e consentimentos de sempre.
- **Apple**: clique 1 mostra o aviso ("a Apple pode ocultar seu e-mail; isso cria uma conta nova…") e troca o botão para "Entendi, continuar com a Apple"; só o clique 2 sai do app. Se o retorno vier com `privaterelay.appleid.com` ou `provider=apple`, repete o aviso depois do login.
- **Vinculação por e-mail**: não é prometida nem impedida; é decisão do Supabase (GitHub com e-mail verificado idêntico tende a vincular à conta existente, o que dá acesso aos dados dessa conta, conferir se isso é aceitável; Apple com relay cria conta nova). As mensagens são neutras e não revelam que o e-mail já existe.
- Possíveis pontos fracos: voltar pelo botão "Voltar" (bfcache) depois de sair para o provedor pode deixar a tela em "Aguarde…" até recarregar; o marcador expira em 10 min; PWA no iPhone pode perder a `sessionStorage` ao sair para o provedor (não verificado).

## O que você precisa configurar (os provedores ainda NÃO estão prontos)
**GitHub** (Settings → Developer settings → OAuth Apps → New):
- Homepage URL: `https://conselho-elemental-main.vercel.app`
- Authorization callback URL: `https://myvxvgeyseoyugskqlqr.supabase.co/auth/v1/callback`
- Copie o **Client ID real** (começa com `Ov23…` ou `Iv1.…`; o cadastrado hoje parece um nome) e gere um **Client Secret** (40 caracteres; o atual tem 11). Cole ambos em Authentication → Providers → GitHub. Os valores não entram no repositório.

**Apple** (exige conta Apple Developer paga):
- Services ID (identificador do site) com "Sign in with Apple" e Return URL `https://myvxvgeyseoyugskqlqr.supabase.co/auth/v1/callback`, domínio `myvxvgeyseoyugskqlqr.supabase.co`.
- Key (.p8) com Sign in with Apple, Team ID e Key ID; o *client secret* da Apple é um JWT que **expira em até 6 meses** e precisa ser regerado (ver a doc do Supabase).
- Em Authentication → Providers → Apple: Client IDs = Services ID. Para e-mails de retransmissão, registrar o domínio/e-mail de envio na Apple se for usar e-mails do app.

**Painel, conferir:** Authentication → URL Configuration continua com Site URL de produção e as duas Redirect URLs; "Allow manual linking" não é necessário. Teste real (depois de configurar) com uma conta descartável: GitHub e Apple, cancelando também uma vez no provedor para ver `access_denied`.

## Não verificado
Login real em qualquer provedor; Safari/WebKit; retorno em PWA no iPhone. Verificado: testes unitários com o SDK instalado e `fetch` sintético, e no navegador a tela, o aviso da Apple e o retorno de erro simulado (sem tocar nos provedores).
