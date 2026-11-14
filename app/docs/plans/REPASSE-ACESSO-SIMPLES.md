# Repasse para o Matheus — acesso à conta mais simples (13/11/2026)

Fábio autorizou o frontend a editar os arquivos de conta **só em interface e texto**. A lógica de autenticação, PKCE, retorno do Google, "Manter conectado", armazenamento do acesso e todas as funções de `lib/backup/` não mudaram. Conceito completo e lotes: [CONCEITO-ACESSO-E-INICIO.md](CONCEITO-ACESSO-E-INICIO.md).

## Por que
Matheus entrou na conta e viu "A conta possui registros anteriores, mas este aparelho não contém uma jornada completa para adotar…", não entendeu e pensou em excluir a conta. A tela tinha jargão (sincronizar, adotar, conferir, recibo, perfil), duas decisões ao mesmo tempo e um texto com o nome do Fábio escrito.

## Lote A (este commit): textos e tela de entrada
- `AccountWorkspace.tsx`: saiu o texto que citava "Fábio" (agora "Este aparelho ainda não tem progresso. Abra o app no aparelho onde você usava e salve o progresso na conta."); saiu "por até 12 horas"; "Conta conectada nesta aba" virou "Você entrou como {email}."; "Voltar ao app" e "Dados deste aparelho conferidos" ficam ocultos (`hidden`) sem login; o código de erro virou a linha "Código para suporte: x" com a classe `.account-error-code`.
- Entrada (`/auth`): Google como ação principal, caixa "Manter conectado neste aparelho", "ou", "Entrar com e-mail" abre o formulário embaixo (`.account-reveal`, 0fr→1fr), links "Criar conta com e-mail" / "Já tem conta? Entrar" no lugar das abas, "Reenviar confirmação" só depois do aviso de cadastro ou com `email_not_confirmed`, rodapé "Privacidade". `/auth?modo=cadastro` abre o cadastro direto. O formulário e o input de arquivo continuam sempre na árvore (o harness de teste depende disso).
- `account-auth-messages.ts`: a mensagem de `email_not_confirmed` agora aponta para "Reenviar confirmação" logo abaixo (o `details` antigo não existe mais).
- `restore-workspace.css`: removidas as regras mortas de `.account-access-modes`.
- Testes: `account-workspace-ui.test.mjs` atualizado para os textos novos; 3 `useState` e 1 `useRef` novos no componente só para saber onde mostrar o erro. Nenhum import novo de `.ts/.tsx`.

## Boas-vindas e Santuário (commits separados)
Só "Começar" (`/auth?modo=cadastro`) e "Já tenho conta" (`/auth`); título em Cinzel; entrada na batida `settle`. No Santuário, a linha "faltam X XP para o nível N+1" (cálculo `xpToNextLevel - (xpTotal - xpAtLevelStart)`; `level.xpToNextLevel` é o tamanho do nível, não o que falta).

## Lote 3 (este commit): uma pergunta por tela depois do login
- `AccountWorkspace.tsx`: estado `remote` e função `lookAtAccount`, **só leitura** (`resolutionTransport(token).readProgress(id)` e, se for snapshot, `reviewAccountVersions`); roda após login por e-mail, retorno do Google, acesso retomado e mudança de storage; nunca chama `connectJourney`. O passo é derivado no render (`entrada | procurando | ajuste | metade | ligado | salvar | novo | trazer | escolher | antigo-sem | antigo-com`), cada um numa função `stepX()` interna (o harness de teste não expande componentes nem hooks).
- Consentimento de um toque (D4): `connectJourney` ganhou o argumento `emptyByTap` e `startNewJourney` ganhou `byTap`, que equivalem a `tabs`/`newJourneyConsent`/`emptyJourneyConsent` **só nos casos em que nada se perde** (conta vazia, aparelho vazio). Funções de `lib/backup` não mudaram. Onde algo é trocado (P3, P5, P7, P8) as caixas continuam.
- Caso do Matheus (conta `legacy` + aparelho sem a jornada): tela "Seu progresso está em outro aparelho" com 4 passos, "Já fiz isso, procurar de novo" (repete a sondagem, nunca escreve), "Usar só neste aparelho por enquanto" e "Tenho um arquivo de cópia" (`/?progresso=restaurar`).
- Números: do aparelho com `summarizeLocalJourney` (função local, ganhou o campo `available`); da conta com `summarizeLocalJourney(JSON.parse(versions.remoteArchive))`, porque `remoteSummary` não tem XP e seus rituais/ciclos são só do perfil ativo. A data "Última atividade" do aparelho foi omitida (não há campo confiável).
- `AccountResolutionPanel.tsx`: só texto dos botões (P3b e P7).
- Sumiram a seção "Dados deste aparelho conferidos", o bloco "Conta confirmada / Continuar no app" e a mensagem "Acesso encerrado nesta aba" (saída: "Você saiu desta conta. O progresso deste aparelho continua guardado.").
- Testes: fixture com `remoteKind` (`empty | legacy | snapshot | fail`); casos novos P0 com falha, P1, P2, P3, P4 (sem escrita), P5, P6. 421/421 em `tests/backup`.

## O que ainda NÃO foi feito
Tela "Opções avançadas" separada (hoje "Opções avançadas" só abre o `details` "Cópias, versões e recuperação"); porta "/" abrindo as boas-vindas em aparelho sem dados; apagar `Auth.tsx` e `authStore.ts`. "Começar do zero (progresso antigo guardado)" **não existe** no código e precisaria de função nova e talvez servidor: decisão com você.

## O que conferir
- Lógica de conta intacta: `git diff` de `lib/backup/` mostra só a mensagem de `account-auth-messages.ts`.
- Testes de `tests/backup/` são sensíveis a tempo sob carga (dois do retorno do Google falharam já uma vez com 1 s de espera; subi para 6 s).
- WebKit e iPhone real não foram vistos.
