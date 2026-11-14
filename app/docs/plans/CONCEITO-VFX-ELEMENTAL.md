# Conceito: VFX elemental em três níveis (Reel de Ciclos) e o céu mais vivo

Orquestrador em Opus 5.5 alto, como líder de design, 09/11/2026. Base: a moldura de
mago e os botões do céu já publicados (`CONCEITO-CEU-E-MOLDURA.md`, commit 6dc0a71).

## Decisões de Fábio

- A moldura atual é o **nível 1** (básico). Haverá três níveis, com mais efeito e
  animação a cada um; o nível 3 tem **fluidez total**, uma borda premium com muito
  efeito e partículas que **saltam da tela**.
- Todo efeito está ligado a um elemento. A partir de agora, toda animação desta área
  é elemental, no estilo **Avatar: dobrar elementos**.
- O nível sobe pelo **domínio do elemento**: o nível de maestria do elemento que
  lidera o dia (`getMasteryProgress()`, a mesma régua do Grimório).
- No nível 3 as partículas podem voar **sobre a tela toda**.
- Botões do céu: a **Lua escura parece apagada** e as **estações pedem mais
  espetáculo**. (Os botões não ganham níveis.)

## 1. A régua

`nivelDeVfx(maestria)` em `src/lib/momentos/nivel-vfx.ts`:

| Nível VFX | Nome | Maestria do elemento do dia | Título no Grimório |
|---|---|---|---|
| 1 | Faísca | 1–9 (e dia sem elemento) | Iniciado |
| 2 | Fluxo | 10–24 | Aprendiz |
| 3 | Domínio | 25+ | Adepto em diante |

Os limites ficam em uma constante (`LIMIARES = [10, 25]`) para Fábio ajustar sem
mexer em código de efeito. Em desenvolvimento, `?vfx=1|2|3` força o nível para ver
os três sem ter o XP (só `import.meta.env.DEV`; nunca em produção).

## 2. O verbo de cada elemento (dobra)

Cada elemento tem um verbo de movimento que vale para os três níveis; o nível só
aumenta a amplitude, a quantidade e o alcance.

| Elemento | Verbo | Forma | Física das partículas |
|---|---|---|---|
| Fogo | **lança** | línguas de chama lambendo a borda para cima; chicote de fogo em arco | sobem, aceleram, tremulam, apagam do amarelo ao vermelho |
| Água | **corre** | uma fita d'água que circula a borda com brilho de cáustica; chicote líquido | arcos balísticos que caem, gotas que se alongam na velocidade |
| Ar | **gira** | rajadas em espiral, vórtice em volta do cartão | rápidas, em redemoinho (curl), rastros alongados, sem gravidade |
| Terra | **ergue** | veios dourados que racham e brilham na borda; lascas de pedra orbitando | pesadas, sobem num impulso curto e caem com gravidade forte, giram |
| Neutro | **respira** | o ouro atual | como hoje |

## 3. Os três níveis da moldura

### Nível 1 · Faísca (o atual, com o verbo)
- O que já existe: filete, cantoneiras, triângulos, brilho externo, 64 partículas em
  órbita com oclusão.
- Acrescenta só o verbo do elemento na órbita (Fogo sobe mais, Terra cai, Ar gira
  mais rápido, Água ondula). Custo igual ao de hoje.

### Nível 2 · Fluxo (a borda vira o elemento)
- **Borda viva no shader do brilho**: um campo de ruído (fbm de 2–3 oitavas) amarrado à
  distância até o contorno do cartão desenha o elemento *sobre a borda*, fora do
  cartão:
  - Fogo: chamas que nascem na borda e sobem (ruído deslocado para cima, cor em
    rampa branco→aura→vermelho escuro), mais altas no topo.
  - Água: uma fita de 6–10px que circula a borda (fase que corre ao longo do
    perímetro), com realces de cáustica.
  - Ar: arcos de vento que varrem a borda em espiral, translúcidos.
  - Terra: veios que pulsam pela borda como rachaduras incandescentes.
- **128 partículas** (era 64), com o verbo mais forte e a órbita mais larga.
- **Troca de dia vira dobra**: quando a rolagem assenta, o elemento "puxa" o cartão
  novo: Fogo acende de baixo para cima pela borda, Água desenha a borda num
  movimento contínuo, Ar a varre num giro, Terra a ergue de baixo. Batida `reveal`.
- O canvas da moldura cresce para dar espaço ao elemento: margem de 24px → 40px.

### Nível 3 · Domínio (fluidez total, borda premium, partículas saltando da tela)
- Tudo do nível 2, mais:
- **Borda premium**: filete duplo com filigrana (um segundo filete interno e o
  externo), as cantoneiras ganham um adorno a mais e um brilho que percorre a
  filigrana; os quatro triângulos giram devagar em seus discos.
- **Fluidez total**: o loop da moldura corre a 60fps (nos níveis 1 e 2, 30fps), e a
  transição de cor e de forma entre elementos é interpolada, nunca cortada.
- **Partículas saltando da tela**: um segundo canvas WebGL, do tamanho da janela
  (`position: fixed; inset: 0; pointer-events: none`), montado por portal em
  `document.body`, abaixo dos diálogos.
  - Em repouso ele não existe ou está parado. Ele só desenha durante uma **dobra**:
    1. a troca de dia (quando a rolagem assenta);
    2. a conquista do dia (o `conjure` já existente, 720ms depois do recibo de XP);
    3. tocar no cartão já aberto (um gesto de "invocar").
  - Cada dobra dura cerca de 1,4s: até 240 partículas saem da borda do cartão,
    atravessam a página na física do elemento e somem. A posição é calculada no
    vertex shader a partir do tempo desde o início da dobra (balística + arrasto +
    um campo de curl para o Ar), sem trabalho de CPU por partícula.
  - Fogo: um chicote de brasas em arco para cima e para os lados. Água: um jorro que
    sobe e cai em parábola sobre a página, gotas alongadas. Ar: um redemoinho que se
    abre em espiral e sai pelas bordas. Terra: lascas erguidas em leque que caem com
    peso e quicam uma vez na linha de base do cartão.
  - Na conquista, a dobra dobra de tamanho (480 partículas) e os quatro elementos
    saem juntos, cada um com o seu verbo.

## 4. Movimento, regras e custo

- Batidas: a troca de dia é `reveal`; a mudança de cor é `settle`; só a conquista usa
  `conjure` (a única que ultrapassa o alvo). A dobra do nível 3 na troca de dia não
  ultrapassa; só a da conquista ultrapassa.
- Movimento reduzido: qualquer nível vira o nível 1 em quadro estático. O canvas de
  tela cheia nunca é montado.
- Pausa: fora da tela, aba oculta, durante a rolagem (o de tela cheia termina a dobra
  em curso e para).
- Custo no iPhone:
  - Contextos WebGL em Ciclos: Lua (parado) + moldura + tela cheia (só nível 3) = 3.
  - O canvas de tela cheia usa DPR 1,5 no máximo e só roda ~1,4s por dobra.
  - Se a página perder um contexto, aquele efeito cai para o nível abaixo, nunca para
    uma tela quebrada.
- Vidro: nenhuma declaração nova; o TETO_VIDRO fica em 16.

## 5. O céu (botões Lua e Estação)

### Lua escura com vida
- **Limbo sempre aceso**: mesmo a 1%, uma unha fina de luz no lado aceso (o shader
  soma um anel de Fresnel no limbo do lado do Sol, mais forte quanto mais escura a
  Lua), para a Lua Nova ser lida como Lua e não como um disco cinza.
- **Luz da Terra** azulada mais forte nas fases escuras (até 3× a atual), com o disco
  escuro mostrando os mares.
- **Coroa e halo**: um halo frio fino que existe em todas as fases (piso de .18).
- **Estrelas que cintilam**: uma camada CSS com 6–8 estrelas que piscam devagar
  (opacidade, `animation` com duração por token), parada em movimento reduzido. O
  shader continua desenhando uma vez só.
- **Céu**: um véu de nebulosa muito sutil (fbm) no shader, mais visível na Lua Nova.
- O piso do anel (`--lua-borda`) sobe de .18 para .30.

### Estações mais ricas
- **Profundidade**: duas camadas de partículas (perto e longe) com paralaxe, e uma
  silhueta de horizonte por estação em SVG (colinas floridas, dunas sob o sol,
  árvores desfolhadas, pinheiros com neve), escura, na base do céu, atrás do vidro.
- **Luz**: raios de sol (feixes diagonais suaves que respiram) no Verão e na
  Primavera; o sol do Outono pulsa quente; o Inverno ganha um brilho de cristal de
  gelo que cintila.
- **Mais partículas e eventos raros**: Primavera com pétalas e vaga-lumes; Verão com
  brasas e um cintilar de calor; Outono com folhas e uma rajada que leva várias de
  uma vez; Inverno com neve em três camadas e, de vez em quando, uma estrela cadente.
- Mantém Canvas 2D, 30fps, pausa fora da tela, quadro estático em movimento reduzido.

## 6. Plano de implementação

Ligação de dados (orquestrador): `src/lib/momentos/nivel-vfx.ts` + teste;
`DiaDoReel.nivel: 1 | 2 | 3` calculado em `Ciclos.tsx` a partir de
`getMasteryProgress()` e do elemento do dia; `?vfx=` só em DEV.

Escritor A (moldura, `src/components/momentos/*`, `src/lib/momentos/moldura.ts`):
verbo por elemento, nível 2 (borda viva + 128 partículas + dobra de entrada), nível 3
(borda premium, 60fps, `DobraTelaCheia.tsx` por portal). Testes puros em
`tests/momentos/`.

Escritor B (céu, `src/components/cycles/ceu/*`, `src/lib/temporal/ceu-dos-ciclos.ts`):
Lua escura (limbo, luz da Terra, halo, estrelas CSS, nebulosa) e estações (paralaxe,
horizonte SVG, raios, eventos raros).

Não tocar: contratos AST de `Ciclos.tsx`, `reel.ts`, a regra "rolagem só seleciona
após gesto", stores, pontuação, XP, Santuário, Aura, App.tsx, vite.config.ts,
main.qa.tsx, src/lib/dev, TETO_TAMANHOS e TETO_VIDRO.

## 7. Riscos sem aparelho real

- Três contextos WebGL e um canvas de tela cheia no WebKit: medir no iPhone. Ordem
  de corte: a dobra de tela cheia vira só local (dentro do canvas da moldura); o
  nível 3 roda a 30fps; a borda viva do nível 2 perde uma oitava de ruído.
- Partículas sobre o texto da página durante 1,4s: são aditivas e finas; se
  atrapalharem a leitura, o alcance cai pela metade.
- Os limiares de maestria (10 e 25) podem deixar o nível 3 distante para quem está
  começando. É uma constante.
