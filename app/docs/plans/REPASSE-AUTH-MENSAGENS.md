# Repasse para o Matheus — mensagens de erro de conta

## O que mudou
- Novo `src/lib/backup/account-auth-messages.ts`: função pura `accountAuthMessage(error, action, fallback)` (ações `login | signup | resend | reset`), mais `AccountAuthError` (mensagem segura + `code`) e `accountErrorCode`.
- `account-access.ts`: login, cadastro e reenvio passam a lançar `AccountAuthError`. `accountAccessFailure` agora devolve um `Error` (antes devolvia string).
- `account-recovery.ts`: `request()` usa o mesmo mapeamento (ação `reset`). O sucesso continua genérico.
- `AccountWorkspace.tsx` e `AccountRecoveryWorkspace.tsx`: mostram, abaixo da mensagem, `código: <code>` em texto pequeno (novo estado `authCode`/`errorCode`).
- Testes: novo `tests/backup/account-auth-messages.test.mjs`; harnesses de `account-recovery`, `account-recovery-ui` e `account-workspace-ui` passaram a carregar o módulo novo.

## Por quê
O app mostrava uma frase única para qualquer falha, escondendo a causa real (ver `DIAGNOSTICO-AUTH.md`).

## Códigos mapeados
- Login: `email_not_confirmed`, `invalid_credentials` (mesma frase para conta inexistente), `over_request_rate_limit`/429.
- Cadastro/reenvio: `over_email_send_rate_limit`, `email_address_not_authorized`; só cadastro: `weak_password`, `signup_disabled`. E-mail já cadastrado segue sem revelar existência.
- Recuperação: 429/`over_email_send_rate_limit` → "limite de envio". `email_address_not_authorized` e `user_not_found` NÃO são mapeados aqui, de propósito (enumerariam contas).
- Todas as ações: rede (fetch rejeitado) e 5xx. Qualquer outro caso cai no texto genérico anterior. Sem código, mostra `http_<status>` ou `network`.

## O que conferir
- **Painel (Authentication → Logs):** confirmar o que o Supabase devolve em cada caso. A afirmação de que `email_not_confirmed` só vem depois de validar a senha vem do meu conhecimento do GoTrue; não foi verificada no SDK. Se vier antes, troque por texto combinado.
- **Limite de e-mails:** o print do Fábio mostrou `over_email_send_rate_limit` no cadastro. O SMTP padrão do Supabase tem limite baixo por hora; considere SMTP próprio (Authentication → SMTP) e revisar Rate Limits.
- **Allow-list do beta:** `email_address_not_authorized` ocorre com o SMTP padrão para e-mails fora do time do projeto.
- Nenhuma migração nem `supabase/` foi alterado.

## Riscos
- Mensagens específicas aparecem só quando o SDK devolve `code`; versões antigas do servidor podem cair no genérico.
- `accountAccessFailure` mudou de retorno; só havia usos internos e no teste.
- Nenhum login real foi feito nem conta criada por mim.
