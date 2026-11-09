# O HUD permanente

09/11/2026. Na referência que Fábio mandou, o HUD segue a pessoa por toda
parte. Aqui ele vivia só no Santuário — e um recurso que você não vê enquanto
gasta não é um recurso, é um número em outra página.

## Onde ele entrou

Em dois lugares, porque o app tem **dois cabeçalhos**: o `ElementalTopBar`,
que serve todas as telas do `AppLayout`, e o `.ep-header` que o Santuário
monta sozinho — justamente a tela mais importante, e a única que a barra
compartilhada nunca alcança. Descobri isso porque o HUD não apareceu lá na
primeira tentativa.

Uma linha: selo de nível, barra de XP, e quatro marcas — ofensiva, HP,
stamina e prana. Compacta de propósito: é uma linha de estado, não o painel.
O Santuário mantém a visão detalhada logo abaixo.

Cada número usa `Contagem`, então uma mudança feita numa tela é **vista**
de qualquer outra, em vez de já estar lá quando você chega.

## O que não recebeu HUD, e por quê

`/treinos` usa `FitnessPageShell`, que não tem barra de topo nenhuma e tem
modos `focused` e `fullscreen` explicitamente para concentração. Pôr uma
linha de estado numa tela desenhada para não ter distração trabalharia contra
a intenção dela. Fica de fora até alguém decidir o contrário.

## A fórmula de HP, que estava em três lugares

O HP era calculado à mão na barra lateral, no grimório e no Santuário — três
cópias da mesma aritmética que nada mantinha em sincronia, e o HUD seria a
quarta. Agora é `hpDoDia`, com teste: um recurso mostrado em quatro lugares
tem de ser uma conta só, senão as quatro divergem e o app parece quebrado
para a única pessoa que vê todas.

## A catraca me pegou

Escrevi `font-size: 11px` na linha de XP e o teste da escala tipográfica
barrou: 12px é o piso que eu mesmo defini, por ser o limite do legível num
telefone à distância do braço. Corrigido para o degrau. O guarda funcionou
contra quem o escreveu, que é o único teste de verdade de um guarda.

Conferido em `/santuario`, `/ciclos`, `/grimorio`, `/pilares`, `/jornadas` e
`/mapa`: HUD presente, 35px de altura, zero estouro horizontal a 390px.

Testes: 4 casos em `vitalidade.test.mjs`.
