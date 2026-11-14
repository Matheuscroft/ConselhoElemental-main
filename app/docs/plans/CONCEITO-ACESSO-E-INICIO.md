# Conceito: acesso simples à conta e tela inicial (13/11/2026)

Briefing do Líder de design (Opus 5.5, alto), só leitura de código e imagens; nada foi executado no navegador. Fonte do problema: Matheus entrou na conta, viu "A conta possui registros anteriores, mas este aparelho não contém uma jornada completa para adotar…" e pensou em excluir a conta; os dados dele estão em outro computador. Fábio pediu uma só tela de login (a bonita), acesso fácil para leigo e melhorias na tela inicial.

## Defeitos achados na leitura do código (corrigir primeiro)
1. O nome "Fábio" está escrito na tela de qualquer usuário: `AccountWorkspace.tsx:507` ("Fábio deve abrir a conta no aparelho onde estão os dados dele…"). É o texto da foto do Matheus.
2. Consentimento promete "retomado nesta aba por até 12 horas" (linha 497) e três mensagens dizem "Conta conectada nesta aba" (152, 244, 278). Hoje são 90 dias com "Manter conectado" ligado.
3. Nas boas-vindas, 3 dos 5 links levam ao login sem explicação ("Experimentar sem conta", "Já uso o app…", "Conhecer os quatro elementos"). `shouldShowWelcome` não está ligada a nada: um usuário novo em "/" provavelmente cai direto no login (confirmar no navegador: o `/` sem login redirecionou a `/auth` na produção, o que confirma).
4. "Usar dados já salvos na conta" chama `compareVersions`, que lança "A conta ainda não possui um arquivo integral para comparar." (`account-conflict.ts:42`): é a segunda foto do Matheus.
5. Para conta nova com aparelho vazio, o botão certo ("Começar minha jornada", `startNewJourney`) está escondido dentro de "Cópias, versões e recuperação".
6. `Auth.tsx` e `authStore.ts` são código morto (a build hospedada exige `VITE_ENABLE_SUPABASE_AUTH=false`).

## Princípios
1. Uma pergunta por tela, um botão principal; o resto vira link discreto.
2. Dizer primeiro onde está o progresso, com números (XP, rituais, ciclos, data), e só depois perguntar.
3. Cada ação tem um só nome do começo ao fim ("Salvar meu progresso na conta").
4. A caixa de confirmação só aparece quando algo é trocado; quando nada se perde, o botão é o consentimento, com uma frase acima.
5. O técnico (arquivos, versões, recibos, recuperação, códigos) fica em "Opções avançadas".
Vocabulário: "progresso", "conta", "este aparelho", "salvar na conta", "trazer para este aparelho". Fora da interface principal: sincronizar, adotar, conferir, recibo, perfil, versão, arquivo integral.

## Fluxo
```
/auth ─ E0 Entrada (Google | e-mail que abre embaixo | criar conta | esqueci a senha)
  └─ após entrar → P0 "Procurando seu progresso…" (só leitura)
       ├─ blocked ........ P8 Ajuste necessário
       ├─ pending/resolution P7 Terminar o que ficou pela metade
       ├─ binding ........ P6 Este aparelho já está ligado
       ├─ conta vazia ─┬─ aparelho com dados .. P1 Salvar na conta
       │               └─ aparelho vazio ...... P1b Tudo pronto
       ├─ conta com dados ─┬─ aparelho vazio .. P2 Trazer para este aparelho
       │                   └─ aparelho com dados P3 Qual progresso usar?
       └─ conta legacy ─┬─ aparelho vazio ..... P4 Está em outro aparelho (caso do Matheus)
                        └─ aparelho com dados . P5 Atualizar a conta com este aparelho
Rodapé de toda tela pós-login: "Opções avançadas" e "Sair desta conta".
```
Escolha do passo (derivação no render, sem lógica nova): `hasLocal = !!baseline?.snapshot && !localJourney.empty`; `remote` vem de uma sondagem só de leitura logo após o login (`lookAtAccount`: `resolutionTransport(token).readProgress(id)`; se for `snapshot`, `reviewAccountVersions` como `compareVersions` já faz). Não usar `connectJourney()` como sonda: ele escreve.

### E0 Entrada
- Título (Cinzel): "Sua jornada continua" (cadastro: "Comece sua jornada"). Texto: "Entre para ver seu progresso em qualquer aparelho."
- Botão principal "Continuar com Google" (branco oficial; `startOAuth('google')`); abaixo, a caixa "Manter conectado neste aparelho" (ligada) com a nota "Desmarque se o aparelho não for seu."
- Divisor "ou"; botão de contorno "Entrar com e-mail" abre embaixo (batida `reveal`): E-mail, Senha, botão dourado "Entrar", link "Esqueci minha senha". Link "Não tem conta? Criar conta com e-mail" (acrescenta "Confirme a senha"; botão "Criar minha conta"); inverso: "Já tem conta? Entrar".
- "Reenviar confirmação" só depois do aviso de cadastro ou com `authCode==='email_not_confirmed'`. Rodapé: "Privacidade".
- Saem: abas de modo, "Acesso à conta", "Voltar ao app" (sem login), a nota de aparelho protegido, a seção "Dados deste aparelho conferidos", o `details` de confirmação fixo, a faixa dos quatro elementos acima do título.
- Erro logo abaixo do botão que falhou (`role=alert`), mensagem de `accountAuthMessage`; o código em linha à parte "Código para suporte: x", sem estilo inline.

### P0 Procurando
Título "Procurando seu progresso…"; "Você entrou como {email}."; erro "Não deu para olhar sua conta agora. Nada foi alterado." com "Tentar de novo" e "Usar só neste aparelho por enquanto" (`/santuario`).

### P1 Salvar na conta (conta vazia, aparelho com dados)
"Salvar seu progresso na conta" / "Encontramos seu progresso neste aparelho: {xp} XP, {tasks} rituais e {habits} ciclos. Salve na conta para usar em outros aparelhos." Frase: "Ao tocar, o progresso deste aparelho e o que você fizer depois ficam salvos na sua conta." Botão "Salvar meu progresso na conta" (`connectJourney()`; espera "Salvando na conta…"). Link "Usar só neste aparelho por enquanto". Erro: "Não deu para salvar agora. Seu progresso continua neste aparelho." + "Tentar de novo".

### P1b Tudo pronto (conta nova, aparelho vazio)
"Tudo pronto" / "Sua conta é nova. Comece agora e o que você fizer fica salvo nela." Botão "Começar minha jornada" (`startNewJourney()` ou `connectJourney()` com `emptyJourneyConsent`).

### P2 Trazer para este aparelho (conta com dados, aparelho vazio)
"Seu progresso está na conta" / "Salvo em {data}: {xp} XP, {tasks} rituais e {habits} ciclos." Linha "Você entrou como {email}. Não é essa conta? Sair e entrar com outra." Frase "Este aparelho ainda não tem atividades, então nada se perde. O XP não é somado de novo." Botão "Trazer meu progresso para este aparelho" (`connectJourney(true)`).

### P3 Qual progresso usar? (os dois com dados)
"Qual progresso você quer usar?" / "Há progresso na conta e neste aparelho. Eles não se juntam: escolha um." Dois cartões lado a lado (grupo de rádio): "Na conta — Salvo em {data}, XP, rituais, ciclos" e "Neste aparelho — Última atividade em {data} (se houver campo confiável), XP, rituais, ciclos". Escolha "conta": "O progresso deste aparelho será trocado pelo da conta." botão "Usar o progresso da conta" (`connectJourney(true)`), link "Guardar uma cópia deste aparelho antes". Escolha "aparelho": subpasso P3b (3 passos numerados: baixar cópia da conta; escolher o arquivo; caixa "Entendo que o progresso da conta será trocado pelo deste aparelho" + botão `chooseVersion('local', copies)`).

### P4 Está em outro aparelho (legacy, aparelho vazio — caso do Matheus)
"Seu progresso está em outro aparelho" / "Sua conta tem progresso de uma versão antiga do app. Ele está guardado; nada foi apagado. Para trazê-lo, use o aparelho onde você usava o app." Quadro "No aparelho onde você usava:" 1) Abra o app no mesmo navegador e no mesmo endereço de antes. 2) Entre com {email}. 3) Toque em "Salvar meu progresso na conta". 4) Volte aqui e toque no botão abaixo. Botão principal "Já fiz isso, procurar de novo" (repete a sondagem; nunca `connectJourney`); se ainda legacy: "Ainda não encontramos. Confira se entrou com a mesma conta no outro aparelho." Contorno "Usar só neste aparelho por enquanto" (nota: "O que você fizer aqui fica só neste aparelho. Depois, você escolhe qual progresso usar."). Link "Tenho um arquivo de cópia" (`/?progresso=restaurar`). "Começar do zero (o progresso antigo fica guardado)" NÃO existe no código (`startNewAccountProgress` recusa conta que não esteja `empty`): só se a decisão D2 for aprovada, com o Matheus.

### P5 Atualizar a conta com este aparelho (legacy, aparelho com dados)
"Atualizar sua conta com este aparelho" / "Sua conta tem registros de uma versão antiga do app. Este aparelho tem seu progresso atual: {xp} XP, {tasks} rituais e {habits} ciclos. Os registros antigos ficam guardados à parte, sem apagar, e a conta passa a usar o progresso deste aparelho. Os números não se somam." Caixa mantida (ato explícito, `legacyConsent`): "Entendo: a conta passa a usar o progresso deste aparelho e os registros antigos ficam guardados." Botão "Salvar meu progresso na conta" (`connectJourney(false,true)`), desativado até marcar. Link "Agora não".

### P6, P7, P8
P6 "Este aparelho já está ligado à sua conta" + "Abrir o app" (`connectJourney()`). P7 "Terminar o que ficou pela metade": "Uma gravação na conta foi interrompida. Seu progresso está protegido." com "Verificar e terminar" (e, se falhar, caixa `pendingRetryConsent` + "Gravar de novo"); resolution: `AccountResolutionPanel` com texto reescrito. P8 por `blockKind`: progress ("Alguns dados deste aparelho precisam de ajuste", `repairConsent`, "Ajustar e continuar"), restore ("Uma importação ficou pela metade", "Terminar importação"), connection ("Reconectar este aparelho", `resetLocalConnection`). Sempre: "Nada do seu progresso é apagado."

### Tela "Opções avançadas"
"Para guardar arquivos de cópia ou resolver um problema. Você não precisa disto no dia a dia." Botão "Voltar". Contém o `details` atual (cópia local, vínculo, receber de uma conta, comparar versões, confirmações, "Sincronizar durante o uso", painel de resolução fora do fluxo, "Código para suporte").

### Tokens
Movimento: abrir o e-mail em `reveal` (0fr→1fr); troca de passo em `settle` (só opacidade); cartão escolhido do P3 em `feedback`; toque em `press`; sem `conjure`; trocar os `.15s ease` à mão em `account-journey.css` e `entry.css`. Cor: `--entry-gold` só no botão principal de cada tela; branco do Google só no E0. Tipografia: h1 Cinzel com `--ds-fluid-title`; texto em `--ds-text-body` (hoje quase tudo é `micro`); consentimento em `--ds-text-small`; `micro` só no código de suporte; XP do P3 em `--ds-text-title` tabular. Superfície: `.ds-pane`. Vidro: nenhum `backdrop-filter` novo; apagar `Auth.tsx` remove um `backdrop-blur-xl`, e `TETO_VIDRO` pode baixar de 16 para 15.

## Tela inicial: melhorias por impacto
1. Boas-vindas só com o que funciona: principal "Começar" (`/auth?modo=cadastro`), secundária "Já tenho conta" (`/auth`); tirar "Experimentar sem conta", "Já uso o app. Quero trazer meu progresso." e "Conhecer os quatro elementos" enquanto levarem ao login; um só "Entrar" (o do topo ou o secundário). Arquivos: `src/components/entry/EntryWelcome.tsx`, `tests/updates/access-entry.test.mjs`. Custo baixo.
2. CTA principal dourado sólido; secundário em contorno; conferir contraste depois do fade. `boas-vindas.css`. Baixo.
3. Uma voz só: h1 de Georgia para Cinzel com `--ds-fluid-display`. `boas-vindas.css`. Baixo.
4. Movimento no sistema: `boas-entrada 900ms cubic-bezier(...)` vira uma entrada `settle`, só opacidade e 8px. Baixo.
5. "/" sem login abre as boas-vindas se o aparelho não tem dados (`shouldShowWelcome` já existe no módulo importado pelo `main.tsx`). Médio (risco nos testes de entrada).
6. Santuário: "Nível {n}" ganha "faltam {xpToNextLevel} XP para o nível {n+1}" (`level.xpToNextLevel` já existe); remover o rótulo-sobrancelha "Da intenção à prática". `ElementalPreview.tsx`. Baixo; conferir duplicação com o anel e o HUD.
7. Santuário, estado da conta em palavras simples ("Salvo na conta", "Salvar agora", "Seu progresso é salvo na conta enquanto você usa o app."). `AccountSyncStatus.tsx`, `AccountConnectionCard.tsx` (zona de backup). Médio.
8. Lembrete discreto para quem escolheu "Usar só neste aparelho": "Seu progresso ainda está só neste aparelho. Salvar na conta". Médio; exige ler a chave de vínculo.
Não mudar: a arte do Santuário, os quatro elementos, a paleta escura com dourado, o botão oficial do Google, "Manter conectado" ligado, a cerimônia de nível, a recuperação de senha, a lógica de conta.

## Lotes para um Sonnet (ordem)
Regra comum: `AccountWorkspace.tsx` tem um só escritor por vez (lotes 1 a 4 em sequência). Nenhum import novo de `.ts/.tsx` em `AccountWorkspace.tsx`: o harness de `tests/backup/account-workspace-ui.test.mjs` transpila o arquivo com `new Function` e só aceita os módulos simulados (só `.css` passa); o teste da linha 106 proíbe stores no grafo estático. Tudo no mesmo arquivo; CSS novo em `account-journey.css`. O teste acha botões pelo texto exato e caixas por índice (`toggle(i)`, ignorando `name="keep-connected"`): trocar texto ou ordem exige atualizar o teste no mesmo lote. Ocultar com `hidden`, nunca remover do render (`f.file()` e `f.submit()` precisam do input e do form sempre na árvore). Escritor roda `tsc --noEmit -p tsconfig.app.json` e `eslint`; o verificador roda `verify:release` e `build`. Aceite visual a 390px: sem estouro, alvos ≥ 44px, nada < 12px, um só botão dourado ou branco por tela, movimento reduzido mostra tudo de uma vez.
- Lote 1 (só texto): linhas 507, 497, 152/244/278, esconder "Voltar ao app" e "Dados deste aparelho conferidos" sem login, código de erro por classe.
- Lote 2 (Entrada E0): reordenar, remover abas de modo, resend condicional, rodapé "Privacidade"; atualizar `click('Criar conta')` no teste.
- Lote 3 (passos P0 a P8, depois de D1 e D4): `remote` + `lookAtAccount`; um componente interno por passo; casos legacy-vazio e legacy-com-dados no teste (hoje o transport simulado devolve sempre `empty`).
- Lote 4 (Avançado): o `details` vira tela com `hidden`.
- Lote 5 (boas-vindas): itens 1 a 4.
- Lote 6 (porta "/"): `main.tsx` + `startup.test.mjs`/`workspace-entry.test.mjs`; risco alto (o teste percorre o grafo estático).
- Lote 7 (Santuário): item 6 (os itens 7 e 8 dependem de D7).
- Lote 8 (só o orquestrador): apagar `Auth.tsx` e `authStore.ts` (usados por `App.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `Onboarding.tsx` e três testes de `tests/backup`), depois baixar `TETO_VIDRO`.
Ordem: 1, 2; 5 e 7 em paralelo com o 2 (arquivos disjuntos); 3 (após D1 e D4); 4; 6 (após D6); 8.

## Decisões de Fábio
D1 ler a conta logo após entrar (só leitura) para mostrar a pergunta certa; D2 "Começar do zero, progresso antigo guardado" no caso legacy (função nova em `lib/backup`, com Matheus; até lá não aparece); D3 no P3 "usar este aparelho" exige baixar e reenviar arquivos (manter, ou pedir ao Matheus que o servidor guarde a cópia); D4 consentimento de um toque onde nada se perde (muda `startNewJourney` para receber o consentimento como argumento); D5 modo convidado: criar de verdade ou remover "Experimentar sem conta"; D6 "/" abre boas-vindas para aparelho sem dados; D7 autorizar o frontend a editar `AccountWorkspace.tsx`, `AccountResolutionPanel.tsx`, `AccountSyncStatus.tsx`, `AccountConnectionCard.tsx` e os testes de `tests/backup/` (zona do Matheus; avisá-lo); D8 título das boas-vindas em Cinzel.

## Sem verificar
Tudo foi lido no código; nada foi executado. Não se sabe se existe campo confiável de "última atividade" local, nem se `receiveReviewedAccountProgress` guarda cópia local, nem onde estão os dados do Matheus (localhost, `-testes` ou produção). WebKit, PWA no iPhone e o retorno do Google no PWA não foram vistos.
