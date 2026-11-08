# F6-N04 — URLs de confirmação e recuperação — configuração persistida

07/11/2026 · Sol Alto · Astro Boy sequencial. Configuração aprovada pelo usuário e conferida após recarregar o painel do DominioDoMagoDB (`myvxvgeyseoyugskqlqr`). Escopo limitado a Site URL e cinco Redirect URLs; escrita de progresso não liberada.

## Aplicação e readback

Resposta explícita ao pedido com os endereços concretos: **“Sim, salvar esses endereços”**. Na retomada, o diálogo já estava fechado e os cinco retornos exatos apareciam na lista; não foi necessário repetir Save URLs e não se atribui esse clique ao agente. Site URL ainda era `http://localhost:3000`. O agente preencheu o domínio Vercel aprovado e clicou Save changes. O painel respondeu **Successfully updated site URL**.

Após reload completo, a árvore acessível mostrou Site URL igual a `https://conselho-elemental-testes.vercel.app`, Save changes desativado e **Total URLs: 5**, com cada endereço exatamente igual à proposta abaixo. A lista preserva `http://localhost:3000`. Nenhum wildcard ou destino adicional observado. [Readback estruturado](evidence/conta-auth-urls-0.1.135/verificacao-salva.json) e [captura após reload](evidence/conta-auth-urls-0.1.135/configuracao-salva.jpg). A captura estreita corta visualmente o final do campo; os valores completos foram conferidos no AX, não inferidos da imagem.

Nenhum código/manifests/SQL alterado nesta conclusão; app135 local e Vercel134 permanecem nas versões anteriores. Gates locais reconferidos: conta=false, restore=true, lembretes=false. Gate remoto false foi conferido em N03; não houve nova consulta SQL nesta conclusão nem ação para abri-lo. Sem migração, deploy, push, e-mail real, cadastro/login, leitura de credenciais ou transferência de progresso pessoal.

**Próximo lote F6-N05, Sol Alto:** separar o aceite de acesso Auth da liberação de escrita de progresso, reaproveitando os helpers e a UI atuais. Hoje AccountWorkspace/RecoveryWorkspace também bloqueiam cadastro/login/recovery pelo gate de transferência; salvar URLs não os habilita. Preparar acesso restrito para validar confirmação de e-mail, login e recuperação reais, com credenciais digitadas pelo usuário, sem transferência automática. Depois decidir liberação de sincronização/associação com cópia, recibo e readback. O cadastro real e a sincronização permanecem pendentes; importação pessoal no iPhone ainda sem aceite informado.

Custódia documental revisada sequencialmente, reserva encerrada. A proposta original e seus testes abaixo ficam preservados como histórico; os 15 testes não foram reexecutados nesta conclusão.

## Histórico da proposta (antes da aprovação)

## Estado observado

Site URL: http://localhost:3000. Redirect URLs: lista vazia. Confirmado por campo/heading visíveis, sem visitar usuários, sessões ou páginas de chaves. Esse estado pode fazer retornos não permitidos usarem o fallback local antigo, em vez do app hospedado. A documentação oficial [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) descreve a allowlist e o fallback Site URL.

## Configuração concreta proposta

Site URL: https://conselho-elemental-testes.vercel.app

Redirect URLs (sem wildcard de domínio):

```
https://conselho-elemental-testes.vercel.app/?progresso=conta
https://conselho-elemental-testes.vercel.app/?progresso=recuperar
http://127.0.0.1:5173/?progresso=conta
http://127.0.0.1:5173/?progresso=recuperar
http://localhost:3000
```

Os dois endpoints por origem correspondem exatamente ao código existente: accountConfirmationRedirect/cadastro/reenvio usa /?progresso=conta; recuperação usa /?progresso=recuperar com prova PKCE do navegador solicitante. 127.0.0.1:5173 é o ambiente de desenvolvimento atual. O endereço antigo fica permitido explicitamente para preservar seu uso anterior quando deixar de ser o padrão. Não incluir todos os domínios Vercel, portas arbitrárias ou redirects vindos de input do usuário.

## Preparo e confirmação

Preenchido o novo Site URL, sem clicar Save changes. Aberto Add URL; paste multiline distribuiu os cinco endereços em cinco campos. Valores observados no AX correspondem à proposta. Save URLs NÃO foi clicado. [Captura da proposta](evidence/conta-auth-urls-0.1.135/proposta-nao-salva.jpg) e [valores exatos](evidence/conta-auth-urls-0.1.135/proposta.json).

A política da ferramenta de navegação exige confirmação no momento de criar/ampliar acesso sensível; uma allowlist Auth nova autoriza destinos de retorno da autenticação. Pedido de login no painel não foi convertido automaticamente em autorização para salvar. Usuário recebeu uma única pergunta cobrindo Site URL e os cinco retornos; aguardar resposta antes de Save URLs ou Save changes. O preparo é reversível e não altera servidor até salvar.

Após aprovação: revalidar os valores e a ausência de edição alheia; salvar URLs, depois conferir Site URL (a atualização do painel pode resetar campo não salvo), preencher novamente se necessário e salvar o endereço padrão. Capturar configuração persistida, recarregar e observar os valores. Se houver destinos novos criados pelo usuário/Matheus entre as leituras, preservar e reconciliar; não substituir a lista inteira silenciosamente.

Sem aprovação: fechar o diálogo sem salvar e descartar a edição local de Site URL. Não alegar a correção aplicada.

## Verificação e limites

Quinze testes locais de account-access e account-recovery passaram (0,23s) nesta rodada, usando SDK com fetch substituído; git diff --check passou. Sem mudança em fonte/manifests/schema ou nova versão do app. Não houve e-mail real, cadastro/login de usuário do app, recuperação real, leitura de credentials, escrita de progresso, migração, deploy ou push. Não apresentar testes SDK com fetch substituído como aceite hospedado.

Versão135 segue local, Vercel134. Gate de progresso continua fechado conforme N03; esta proposta não o abre. Depois de configurar retornos, a próxima etapa é preparar o aceite real de Auth e liberação delimitada das contas/sync em Sol Alto. O progresso pessoal continua dependendo da importação/associação explícita com cópia/readback.

Na proposta, a reserva documental e a aba ficaram em handoff aguardando confirmação. O resultado aplicado está no início deste relatório.
