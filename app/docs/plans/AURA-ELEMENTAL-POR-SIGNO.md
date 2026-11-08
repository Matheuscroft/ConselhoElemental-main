# Aura elemental por signo

08/11/2026. Fábio pediu uma aura em volta do personagem, estilo anime, que cresça
com o nível e tenha a cor da personalidade da pessoa pelo signo.

## Antes: por que não havia aura

O `AppLayout` tinha um bloco de aura com `AuraAvatar3D` e um GLB de 3,4 MB, mas
ele dependia de `AURA_ROUTES = ['/santuario', '/grimorio']` e nenhuma página
ativa satisfazia a condição — `/santuario` renderiza `ElementalPreview`, que não
usa `AppLayout`. Em produção o `.glb` nunca era requisitado. Foi removido antes
deste trabalho, e nada dele foi reaproveitado.

## O signo vem do céu, não de uma tabela de datas

`src/lib/sanctuary/zodiac.ts`. A data de nascimento vira longitude eclíptica do
Sol pelo mesmo `astronomy-engine` que o Astrolábio e o Despertar já usam, e a
longitude vira signo. Faixas de data fixas seriam aproximações: as fronteiras
andam cerca de um dia de ano para ano, e quem nasce na virada receberia o signo
errado.

Elemento e modalidade **não são tabelas digitadas**: contando de Áries, os
elementos se repetem a cada quatro signos e as modalidades a cada três, então
saem de `índice % 4` e `índice % 3` e não têm como divergir da ordem. Libra é
índice 6: Ar, cardeal.

A cor sai de uma base por elemento, mais saturada que os acentos de interface,
deslocada em matiz conforme a posição do signo no seu trio — o signo do meio
fica com a cor base. Libra é o do meio do Ar, então recebe `#b8f0e4` puro.

A modalidade move a aura: cardeal sobe mais rápido, fixo segura, mutável agita.

`auraScale` é logarítmica, de 1 no nível 1 a 1,75 no nível 50. Os primeiros
níveis são onde ela visivelmente cresce, que é quando a pessoa ainda está
decidindo se volta ao app.

Nada disso alimenta regra de jogo: decide como uma luz se parece.

## A aura

`src/components/sanctuary/AuraElemental.tsx`. Um shader sobre um quad, não
geometria: uma aura é um campo, não um objeto, e assim custa uma chamada de
desenho só no celular. Carregada sob demanda, pausa fora da tela e em aba
oculta, e tem reserva em gradiente CSS para quem não tem WebGL ou perde o
contexto.

Duas armadilhas encontradas e corrigidas, ambas registradas no código:

- O vertex shader escreve direto em espaço de clipe, então o quad fica em cima
  da câmera em termos de mundo e o three o **descartava no frustum culling**
  antes de desenhar: sem erro, contexto íntegro e tela vazia. `frustumCulled =
  false`.
- A primeira versão era mais forte no centro — exatamente onde o sprite opaco
  do personagem a esconde. O campo foi refeito como uma casca que começa na
  silhueta e queima para fora, com o quad ao dobro do corpo em cada eixo para
  o brilho chegar a zero antes da borda do canvas, senão ele corta em linha
  reta e lê como uma caixa.

## A pergunta

A pesquisa de primeiro acesso passou de duas para três perguntas. A data de
nascimento é pulável, fica neste aparelho e não serve a mais nada; o signo
aparece no instante em que a data fica completa, para a pergunta se explicar
sozinha. Sem data, a aura fica dourada.

## Limites

Não foi visto em WebKit nem em aparelho real. As línguas de luz ainda leem
discretas: o campo está correto, mas a intensidade e o contraste do ruído
merecem outra passada com o olho de vocês, e o painel do navegador interno roda
a cerca de 3 fps, o que torna impossível julgar movimento daqui.

Testes: `app/tests/sanctuary/zodiac.test.mjs`, 8 casos — a estrutura de
elementos e modalidades, Libra, os trios não colapsando numa cor só, o signo
pela posição do Sol, o equinócio na entrada de Libra, a curva de crescimento,
a leitura da data ao meio-dia local e o índice fora da roda.
