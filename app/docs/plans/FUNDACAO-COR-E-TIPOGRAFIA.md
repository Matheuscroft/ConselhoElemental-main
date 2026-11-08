# Fundação: cor e tipografia

08/11/2026. Depois do sistema de movimento, as duas camadas que faltavam.
Mesmo método: levantar o real, decidir, e terminar com um teste que impeça a
regressão.

## O que a cor já tinha de bom

Sete tokens `--el-*` como triplas RGB, ligados ao Tailwind com suporte a
`<alpha-value>`. Base bem construída, e intocada.

## O que estava espalhado

A cor dos quatro elementos vivia em **cinco lugares**, e três deles eram os
mesmos quatro valores digitados de novo:

- `elemental-theme.css`, em `:root`
- `entry.css`, em `.entry-shell` — **a mesma coisa outra vez**
- `ElementalPreview.tsx`, numa constante `ACCENTS` — **e outra vez**
- `DestinyWheel.tsx`, num `TINT` de valores escuros
- `zodiac.ts`, numa base de aura saturada

A duplicação tinha causa real: `elemental-theme.css` só entra pelo
`bootstrap-app.tsx`, então as telas de abertura nunca o recebiam e precisaram
redeclarar. A correção é a causa, não o sintoma: `elemental-fundacao.css`
nasce carregado pelo `main.tsx`, que serve todos os caminhos.

Os outros dois não eram duplicação: são **papéis diferentes** da mesma cor.
`src/lib/design/palette.ts` guarda os três — `ACENTO` rotula, `TINTA` lava um
fundo, `AURA` é luz saindo de alguém — e um teste falha se o CSS e o
TypeScript discordarem, ou se dois papéis colapsarem no mesmo valor.

Conferido na tela: os quatro elementos da entrada continuam exatamente
`#a3ce9b`, `#f5ad83`, `#8bcee3` e `#d2e6df`. Zero mudança visual.

## A tipografia: 69 tamanhos

Esse era o problema de verdade. O app tinha **69 valores distintos de
`font-size`** em 660 declarações, misturando px, rem e clamp, com coisas como
`.78rem`, `.82rem`, `.83rem` e `.88rem`. Isso não é uma escala; são 69
decisões tomadas uma a uma.

A escala tem sete degraus — micro 12, small 14, body 16, lead 18, title 22,
display 28, hero 36 — escolhidos para **absorver os agrupamentos que já
existem**, e não para ficar bonitos no papel: quase tudo que está no app
encosta num degrau sem mover layout. O piso é 12px porque 10px e 11px juntos
apareciam 66 vezes e são ilegíveis num telefone à distância do braço. O corpo
fica em 16px, que é também o que impede o iOS de dar zoom num campo com foco.

### Por que não migrei os 69

Re-tipografar 660 declarações às cegas, sem conseguir ver o resultado numa
tela de verdade, seria irresponsável. O que entrou no lugar é uma **catraca**:
o número de tamanhos distintos pode cair, nunca subir. Isso estanca a
sangria hoje e deixa a limpeza acontecer aos poucos, com alguém olhando.
Sempre que um tamanho sair, baixe o teto no teste.

## Os guardas, testados contra violação

Os dois foram provados contra uma violação de propósito, porque na migração do
movimento um guarda meu passou numa violação real e eu só descobri testando.

- Trocar um hex no CSS: **3 testes falham**.
- Inventar um `font-size: 13.7px`: a catraca falha.

Na primeira tentativa a catraca **não pegou** — eu tinha fixado o teto em 82,
número que veio de uma contagem no shell diferente da que o teste faz. O teste
conta 69. Teto corrigido, violação reproduzida, guarda confirmado.

Testes: `app/tests/design/fundacao.test.mjs`, 5 casos.
