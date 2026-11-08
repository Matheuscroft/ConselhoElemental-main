# Momentos do dia e o reel

08/11/2026. Fábio pediu que cada dia dos Ciclos possa guardar uma foto — o
ápice do dia — e que os dias virem um coverflow arrastável com o dedo.

## A gaveta decide o que o reel pode prometer

A decisão foi IndexedDB no aparelho. O original **nunca é guardado**: uma foto
de celular tem 3 a 5 MB e um ano delas passa de um gigabyte, que navegador
nenhum segura. Ficam duas cópias em WebP — uma de exibição com 1600px de lado
e uma miniatura de 480px — o que leva um ano para algo como 125 MB.

A miniatura não é economia de disco, é de CPU: um reel rola trinta dias de uma
vez, e decodificar trinta fotos inteiras para encher um carrossel é como se
trava um telefone. O teste fixa que a miniatura custa pelo menos uma ordem de
grandeza menos para decodificar.

`momento.ts` guarda as regras puras e tem teste: a chave do dia sai do
**calendário local e não do UTC** — à noite no Brasil já é o dia seguinte em
UTC, e a foto de hoje cairia no cartão de amanhã; a imagem é encaixada sem
distorcer e **nunca ampliada**; e um arquivo é recusado por um motivo em que
dá para agir, aceitando HEIC e HEIF, que é o que o iPhone entrega.

`momento-store.ts` abre o banco, reduz com OffscreenCanvas quando existe e com
canvas comum quando não, e distingue falta de espaço de falha genérica. Toda
URL temporária vem com o seu `soltar`: trinta blobs presos por URLs que
ninguém revogou é como uma galeria come a memória do aparelho.

## O reel

O trilho é um **rolador nativo com scroll-snap**. O momentum, o teclado e o
leitor de tela são do navegador, não uma reimplementação — arrastar com o dedo
sai de graça e sai certo. Em cima disso, um laço de rAF lê `scrollLeft` e
escreve a volta e o amaciamento direto nos cartões: uma rolagem dispara vezes
demais para o React estar no meio.

A geometria é pura e testada. Os vizinhos **giram na direção do centro** — é
isso que faz um coverflow em vez de uma fileira passando —, recuam, encolhem e
desfocam, e nada muda além do alcance. Só o cartão do meio aceita ação: um
cartão meio virado na borda não é onde alguém está mirando.

O teste pegou um erro real: eu usava metade do **passo** como centro do
cartão, mas o passo inclui o vão, então todo cartão ficava deslocado pela
largura do intervalo. A função passou a receber as duas medidas.

## Nos Ciclos

Um alternador "Calendário | Momentos" sobre o trilho de dias. A visão de
momentos substitui o trilho; nada do que já existia foi removido, só escondido
com `hidden` enquanto a outra visão está em uso.

## Limites

Nada em WebKit nem em aparelho real — e aqui isso pesa mais do que de costume.
**O Safari do iOS descarta IndexedDB depois de sete dias sem uso do site**,
a menos que o app esteja instalado na tela de início. Para um diário de fotos
isso não é detalhe: vale avisar quem usa, e vale empurrar a instalação.

Testes: 12 casos novos — 5 em `momento.test.mjs` e 7 em `reel.test.mjs`.

## O túnel (08/11/2026)

A terceira visão dos mesmos dias: um corredor que se atravessa voando, rumo a
um ponto de fuga de luz.

`tunel.ts` guarda a geometria, pura e testada. Os dias penduram em **paredes
alternadas**, cada um virado para o meio — é isso que faz um corredor, e não
uma coluna de fotos vindo na direção de quem olha. Um dia já ultrapassado é
solto em vez de desenhado atrás da câmera, e nada é desenhado além do
alcance, por mais longo que o corredor fique.

O voo é mais um rolador nativo: uma coluna alta e vazia cuja `scrollTop` é a
distância percorrida, com o corredor grudado por cima. Momentum, teclado,
barra de rolagem e o senso que o navegador tem de quanto um impulso deve
carregar — nada disso vale reescrever.

**A foto do dia em foco fica atrás de tudo**, ampliada e desfocada, então
atravessar os dias é também atravessar a luz deles. Era o que Fábio descreveu.

Com movimento reduzido o corredor **achata numa grade** de dois por dois: a
mesma informação, sem voar ninguém a lugar nenhum.

### Dois defeitos encontrados na tela

O palco grudado tinha altura zero, então o `46%` que posiciona cada quadro
resolvia para zero e todos ficavam cortados no topo. Agora ele tem a altura da
janela e uma margem negativa de mesmo tamanho, para não somar à rolagem.

E o trilho de dias continuava aparecendo sob a outra visão: o atributo
`hidden` estava no elemento, mas o `display: flex` da folha vence a regra do
agente de usuário. Uma linha resolveu, e vale lembrar da armadilha.

Testes: mais 7 casos em `tunel.test.mjs`.
