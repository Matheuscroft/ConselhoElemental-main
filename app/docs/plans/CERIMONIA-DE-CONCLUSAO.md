# A cerimônia de conclusão

08/11/2026. Fábio mandou duas gravações de tela como referência de
gamificação. Extraí os quadros com ffmpeg e analisei.

## O que as referências mostram

A primeira é **o mapa**: caminho sinuoso de nós, personagens na trilha, baú de
ofensiva, e um HUD permanente no topo com ofensiva, gemas, XP e corações. O
balão de cada nó **nomeia a recompensa antes de a pessoa entrar**.

A segunda é a recompensa depois de terminar, e é o achado que importa:

> A recompensa do Duolingo não é um aviso. É uma **cerimônia de telas cheias
> em sequência** — o personagem explode com raios, depois a chama da ofensiva
> sozinha com o número, depois a peça de coleção com a grade de progresso.

Cada beat faz **uma coisa** e mostra **um número**. Um aviso dizendo "+40 XP,
ofensiva 25, nova peça" tem as mesmas palavras e nenhum efeito.

## O diagnóstico do app

O mapa **já existe** — as trilhas de Jornadas e Grandes Obras. Os dados
também. E recompensa existe, mas espalhada em seis lugares com seis ideias
diferentes do que é comemorar: `CycleRewardNotice`, `CycleCompletionFeedback`,
`CycleXpRecovery`, o recibo de série, o aviso do widget de hábito e o
`Conjurar`.

Faltava a cerimônia. Terminar algo aqui era um aviso; terminar algo lá é um
ritual curto.

## O que entrou

`cerimonia.ts` tem a sequência pura e testada. Os beats são derivados do
prêmio: sem número, não há tela de número. Onde o Duolingo explode a coruja,
**este app responde com o elemento da pessoa** — a cor que ele já pinta ela,
vinda do signo.

A primeira batida corre na curva `conjure`, a única do sistema que ultrapassa
o alvo; as telas seguintes são para ler, então assentam.

**Um teto de 4 segundos para a cerimônia inteira, com teste.** Ninguém deve
esperar mais que isso para voltar ao que estava fazendo, e se alguém alongar
uma batida, é o teste que percebe.

Sai a qualquer momento, por botão ou Escape: uma comemoração da qual não se
pode sair deixa de ser uma na segunda vez.

## A régua de raridade

Subir de nível abre a cerimônia. **Marcar um hábito não.** Três telas cheias a
cada hábito marcado viram punição no segundo dia; o cotidiano continua com o
pop pequeno do `Conjurar`.

## O defeito que só a tela mostrou

Ao chegar no fim da sequência, **tudo sumia** e restava só o botão: a
cerimônia terminava no vazio, tirando de volta o que tinha acabado de dar.
Agora, quando a sequência pousa, todos os beats ficam na tela — a pessoa
termina olhando para o que conquistou.

Testes: 5 casos em `cerimonia.test.mjs`.

## O que eu não copiaria

Corações e vidas, e a economia de gemas, são mecânica de monetização. O dano
por falhar, do Habitica, pune justamente quem mais precisa voltar. Vale copiar
a coleção em quebra-cabeça: progresso visível rumo a algo concreto, sem
punição, e encaixa nos quatro elementos.
