# Superfície, vidro e os cartões de elemento

08/11/2026. Primeira camada do redesign pedido por Fábio: estética premium com
glassmorphism, começando pelo que o design system ainda não tinha.

## A decisão que define a camada

Vidro não é decoração para espalhar. `backdrop-filter` é das coisas mais caras
que um navegador faz, e o alvo é celular — "nível AAA" é precisamente o
oposto de travar. Então a camada tem duas receitas e um orçamento:

- `.ds-glass` e `.ds-glass-float`, para o que **de fato flutua** sobre
  conteúdo: sobreposições, barras fixas, o cartão em foco.
- `.ds-pane`, o mesmo material **sem o custo** — tinta, borda e rim. Num tema
  escuro lê quase igual.
- Teto: no máximo duas camadas desfocadas sobrepostas.

Tokens: `--ds-surface-sunken/raised/float`, `--ds-edge`, `--ds-edge-lit`,
`--ds-rim`, `--ds-lift`, `--ds-lift-near`, `--ds-blur-soft/strong`.

## O defeito que a auditoria achou de novo

O app tinha **7 `backdrop-filter` e só 2 com prefixo**. Safari 17 e anteriores
só desfocam atrás de `-webkit-backdrop-filter`: cinco painéis eram chapados
num iPhone, e de um navegador de desktop ninguém via. Os 11 blurs do app estão
pareados agora, e um teste recusa qualquer novo sem o par.

Duas duplicatas apareceram no caminho, porque o script olhava só para trás e
dois arquivos já tinham o prefixo **depois** do valor. Colapsadas.

## Os cartões de elemento

A referência: cartões-pílula de vidro, o em foco acendendo por dentro com o
elemento vivo em volta, espelhado num piso escuro.

O app já tinha o trunfo: `createMaterialEffect`, que anima o material de cada
elemento no Santuário. É literalmente "o elemento ganhando vida", e foi
reaproveitado em vez de reinventado.

Grade de 2 por 2. O cartão em foco atravessa a largura, acende por dentro, a
borda pega a cor do elemento e o material cresce e começa a animar. Os outros
três ficam **quietos, não ausentes**: 62% de opacidade e uma pitada menores,
com os alvos de toque intactos.

O material só anima no cartão aberto. Quatro canvas ao mesmo tempo num
celular não compram nada: três deles estão apagados a ponto de o movimento
não ser legível.

O reflexo usa `-webkit-box-reflect`, que é WebKit e Blink. Onde falta, o
cartão simplesmente não tem espelho — não custa nada e não perde nada
legível.

**O contrato continua verde sem alteração nos testes**: quatro botões com
`aria-controls`, nenhum aberto de início, quatro painéis `inert`, ids únicos
entre duas instâncias e o destino de cada elemento. 827 testes passam.

## Consolidação

As regras antigas de `.pillar-element-*` viviam em `pilares.css` e brigavam
com as novas por ordem de importação — o estado fechado saía com o texto
quebrado e o chevron por cima. Elas pertencem ao arquivo do componente, e é
onde estão agora.

## Limites

Nada em WebKit nem em aparelho real. O reflexo e o desfoque são exatamente o
tipo de coisa que só se julga numa tela de verdade.
