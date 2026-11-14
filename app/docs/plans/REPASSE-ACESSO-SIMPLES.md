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

## O que vem depois (ainda NÃO feito)
Passos pós-login em uma pergunta por tela (conta vazia / com dados / aparelho com dados / os dois / conta `legacy`), com leitura só de consulta logo após o login (`lookAtAccount`), e "Opções avançadas". O caso do Matheus (conta legacy + aparelho vazio) vira a tela "Seu progresso está em outro aparelho", com os passos numerados. "Começar do zero (progresso antigo guardado)" **não existe** no código; precisaria de função nova e talvez servidor: decisão com você.

## O que conferir
- Lógica de conta intacta: `git diff` de `lib/backup/` mostra só a mensagem de `account-auth-messages.ts`.
- Testes de `tests/backup/` são sensíveis a tempo sob carga (dois do retorno do Google falharam já uma vez com 1 s de espera; subi para 6 s).
- WebKit e iPhone real não foram vistos.
