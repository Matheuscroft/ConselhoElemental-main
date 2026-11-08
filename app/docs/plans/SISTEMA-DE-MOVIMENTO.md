# Sistema de movimento

08/11/2026. Fábio pediu animação em todo o app, estilo Duolingo, com resultado
"nível cinema". O primeiro passo não é animar telas: é o app passar a ter um
senso de tempo próprio, para que uma animação nova em qualquer lugar seja uma
linha e não uma invenção.

## O que já existia

Não era terreno virgem, e o que havia era bem-feito: `--ds-duration-feedback`,
`--ds-duration-reveal`, `--ds-ease`, a classe `.elemental-press`, o
`.elemental-reveal-panel` e um `useMotionPreference` com `useSyncExternalStore`.
Movimento reduzido já era tratado com cuidado em todos eles, e isso foi
preservado inteiro.

O problema era a escala: **duas durações e uma curva para o app inteiro**,
enquanto 26 arquivos chamavam framer-motion com o número que parecesse certo
naquele dia.

## Os quatro tempos

| Tempo | Duração | O que é |
|---|---|---|
| `press` | 120 ms | O dedo está no controle e ele sabe |
| `feedback` | 160 ms | A menor resposta visível: um estado, uma cor |
| `reveal` | 240 ms | Algo abre, expande ou chega à tela |
| `settle` | 420 ms | Algo pousa e encontra o seu lugar |
| `conjure` | 720 ms | Energia chega: XP, nível, ofensiva |

Curvas: `--ds-ease` (a padrão, que já existia), `--ds-ease-exit` e
`--ds-ease-conjure`.

**Só o `conjure` ultrapassa o alvo e volta.** É isso que separa ganhar algo de
um número mudando num campo, e é a mesma curva com que o Despertar já acende os
elementos — então os dois leem como uma mão só.

A escolha de fundo: neste app, movimento deve ler como **energia chegando e
assentando**, não como interface deslizando. É também o que a skill de design
recomenda — movimento que responde a uma ação e mostra o que mudou, em vez de
entrada deslizante em toda seção, que é o padrão genérico.

## A garantia

`src/lib/motion/motion.ts` carrega os mesmos números para o framer-motion, e
`tests/motion/motion-tokens.test.mjs` **falha se o CSS e o TypeScript
divergirem**, nos dois sentidos. O CSS anima a maior parte do app e o
framer-motion anima o resto; sem esse teste os dois se separam com o tempo e
nada mais perceberia. Esse teste é o que impede o sistema de apodrecer.

`beat('conjure')` devolve a transição pronta, já com a curva certa, para não
haver número digitado na mão. `beatUnless(reduzido, ...)` entrega o estado
final na hora em vez de remover a informação.

## As primitivas

`Contagem` conta até o novo valor em vez de trocar para ele, para a pessoa ver
que ganhou algo. **Nunca roda na primeira renderização**: abrir uma página não
é conquista. Interromper é seguro — um alvo novo parte de onde o número está, e
não de onde a corrida anterior começou. O estado é ajustado durante o render,
que é a receita do próprio React para estado que segue uma prop, com estado e
não refs, porque uma ref não pode ser lida durante o render.

`Conjurar` marca a chegada do que foi conquistado: um pop na curva que
ultrapassa, com um clarão atrás, para não ler como uma caixa escalando.

## Onde foi aplicado

No Santuário, que é onde esses números mais aparecem. O selo de nível é o
**único** elemento autorizado a ultrapassar — gastar a ousadia num lugar só é
deliberado. O XP conta. HP, Stamina e Prana usam `settle`, porque são estado e
não conquista: assentam, não comemoram.

## Limites

O sistema está de pé e aplicado numa tela. As outras 25 que usam framer-motion
com números próprios continuam como estavam — migrar cada uma é trabalho
seguinte, e agora é mecânico. Nada foi visto em WebKit nem em aparelho real, e
o painel do navegador interno roda a cerca de 3 fps, o que impede julgar
movimento daqui: a aprovação estética do ritmo depende do olho de vocês.

Testes: 12 casos novos — 7 em `motion-tokens.test.mjs` (paridade nos dois
sentidos, a ordem dos tempos, só o `conjure` ultrapassando, as transições por
nome, movimento reduzido chegando ao estado final) e 5 em `contagem.test.mjs`
(começo e fim exatos, monotonia, número inteiro, a maior parte da distância
cedo, e contagem decrescente).

## A migração (08/11/2026)

Eram 19 transições em 13 arquivos, não 25 telas — e boa parte é cena ambiente,
que o próprio sistema sempre disse que mantém o tempo próprio. Migrar não foi
cosmético.

**O que a migração revelou:** três barras de progresso, em três arquivos
diferentes, com três durações diferentes para o mesmo gesto — `HabitCard` a
0,5 s, `Ciclos` a 0,5 s e `ElementCard` a 1 s. **Nenhuma das três respeitava
movimento reduzido.** Todas passaram a `settle`, e as três violações de
acessibilidade caíram junto. Seis dos sete arquivos tocados não tinham nenhuma
noção de movimento reduzido; agora têm.

Também entrou `--ds-stagger: 60ms`, porque seis das transições eram atrasos de
escalonamento escritos à mão — o `WorkoutSummary` já usava 0,06 / 0,12 / 0,18,
que é exatamente o passo de 60 ms, e o `Ciclos` usava 0,15 / 0,18 / 0,2 sem
critério.

Ficaram com tempo próprio, por natureza e não por esquecimento: o pulso
infinito do `ElementCard`, o giro infinito do `TaskCard`, o aviso de recompensa
do `FitnessHabitWidget`, que é uma sequência de quadros-chave com tempos
próprios e precisa ser lido antes de sumir, e a roda do `DestinyWheel`, que tem
a curva de uma roleta.

### O guarda

`tests/motion/motion-uso.test.mjs` varre os `.tsx` e falha se alguém escrever
uma duração à mão. A regra não é uma lista de exceções: só escapam um laço
`repeat: Infinity`, que não é uma batida e sim um loop, e uma sequência com
`times:`, que é coreografia. A roda do destino está nomeada à parte, com o
motivo escrito.

A primeira versão da regra aceitava qualquer `repeat:`, então `repeat: 0`
passava. Foi apertada depois de o guarda ser testado contra uma violação de
propósito e **não pegar** — um teste de guarda que não sabe falhar não vale
nada.
