# Conceito: céu dos Ciclos (botões Lua e Estação) e moldura do cartão ativo do Reel

Líder de design (Opus 5.5, esforço alto), 09/11/2026. Só leitura, nada visto em
navegador, WebKit ou aparelho real. Contrastes são cálculos, não medições.
Pedido de Fábio: botões que mudam com a luz da Lua e com a estação, vidro real,
VFX/3D; e uma moldura de mago elemental com partículas 3D no cartão ativo.
Decisões já tomadas por Fábio: vidro real (até +2 no TETO_VIDRO), efeito rico com
canvas/WebGL.

## Fatos do código

- O guarda de vidro conta 15 hoje; cada par `-webkit-` + sem prefixo conta 1.
- `.cycle-day-panel` é opaco: o vidro só tem o que desfocar se o botão trouxer o
  próprio céu dentro dele.
- `lunarSnapshot` (`lunar-presentation.ts`) já está no pacote principal; three.js
  já é sob demanda (MoonScene, AuraElemental).
- `getMoonPhase` usa nomes diferentes de /lua ("Lua Gibosa" vs "Gibosa Crescente").
- `SeasonExplorer` já tem cor por estação: spring #a3ce9b, summer #d5b66f,
  autumn #f5ad83, winter #8bcee3; `SEASON_STORIES[name].tone` liga nome e tom.
- Cor e elemento da pessoa: `useZodiacPreference()` (`{ element, modality, colour }`);
  sem nascimento, ouro #d6b66f.
- Nenhum teste cita `cycle-sky-*`; `reel.test.mjs` testa só `reel.ts`.

## 1. Conceito dos botões

Cada botão é uma janela para o céu de verdade, com um peitoril de vidro fosco
embaixo onde se lê o texto. A Lua fica parada e só a fase muda a luz; a Estação
tem clima e se move.

**Coisa memorável:** a borda do botão da Lua acende do lado em que a Lua está
acesa, na mesma medida (Cheia: anel inteiro; Nova: reflexo de 60°). As partículas
passam do céu nítido para o vidro fosco e ganham profundidade de campo.

Geometria: 162px de largura; altura de 56px para **104px** (+48 abaixo do Reel);
compacta 88px (+32, astro 44px). A partir de 768px, mesma altura e astro maior.

```
┌──────────────────────┐ 162 x 104
│ céu nítido      (◐)  │  astro: centro (largura-38, 32), raio 26px
│                 (◐)  │  (>=768px: largura-52, 36, raio 30)
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  peitoril de vidro (~56px)
│ Gibosa Crescente     │  nome: --ds-text-small 500
│ 78% iluminada      › │  apoio: --ds-text-micro
└──────────────────────┘
```

Camadas em `button.ceu-botao` (`position: relative; overflow: clip; border-radius: 16px`):
1. `.ceu-fundo`: céu em CSS e astro estático (plano B e estado de carregamento);
2. `canvas.ceu-tela`: o efeito;
3. `.ceu-peitoril`: o vidro, com o texto;
4. `::after` (`.ceu-anel`): borda acesa por máscara.

## 2. Lua

Dados: `lunarSnapshot(selectedDate)` (`phaseAngle`, `illuminated`, `waxing`,
`name`); hemisfério por `getHemisphereFromLatitude(userLatitude)`.
`sanctuary-sky.ts` não serve (exige cidade, calcula altitude).

Função pura `luzDaLua(snapshot, south)` → variáveis CSS, com `luz` contínua:

| Variável | Fórmula | Nova | Crescente | Quarto | Gibosa | Cheia |
|---|---|---|---|---|---|---|
| `--lua-arco` | 30deg + 150deg·luz | 31° | 60° | 105° | 150° | 180° |
| `--lua-borda` | .18 + .62·luz | .19 | .30 | .49 | .68 | .79 |
| `--lua-halo` | .10 + .50·luz | .10 | .20 | .35 | .50 | .60 |
| estrelas | 1 − .8·luz | 1 | .84 | .60 | .36 | .21 |
| luz da Terra | .06·(1−luz)² | .06 | .04 | .015 | ~0 | 0 |

- `--lua-lado`: 90deg quando `waxing !== south`, senão 270deg.
- Anel: `conic-gradient(from calc(var(--lua-lado) - var(--lua-arco)), prata 0deg,
  prata calc(var(--lua-arco)*2), rgb(255 255 255 / .06) calc(var(--lua-arco)*2 + 30deg),
  rgb(255 255 255 / .06) 330deg, prata 360deg)`, prata = rgb(226 230 240);
  `::after` com `padding: 1.5px`, máscara de anel (`mask-composite: exclude`,
  `-webkit-mask-composite: xor`), intensidade por `opacity: var(--lua-borda)`.
- Shader (three sob demanda), um quad desenhado **uma vez**, sem loop: Lambert com
  `lunarLightDirection(phaseAngle, waxing)` (x e y negados no Sul), terminador
  `smoothstep(-0.03, 0.12, n·L)`, mares em fbm de 2 oitavas (albedo .78–1.0 sobre
  #d6d5cf), luz da Terra rgb(111 132 168), halo rgb(196 210 240) com
  `exp(-(d-r)/(0.55r))`, céu rgb(9 13 26) → rgb(20 27 39), estrelas em grade de
  14px (35%, 0,6–1,2px), ausentes dentro do halo.
- Plano B: `.ceu-fundo` com o mesmo céu, `<MoonDisc>` e halo em `radial-gradient`;
  `data-mode="3d"` esconde o MoonDisc quando o shader desenha.
- Apoio: "78% iluminada"; `aria-label`: "Abrir página da Lua: Gibosa Crescente, 78% iluminada".

## 3. Estação

Dados: `getSeason(selectedDate, { latitude: userLatitude })`, tom de
`SEASON_STORIES[season.name].tone` em `data-estacao` (spring/summer/autumn/winter).
Partículas em Canvas 2D com sprites pré-desenhados; astro em CSS.

| | Primavera | Verão | Outono | Inverno |
|---|---|---|---|---|
| `--ceu-cor` | 163 206 155 | 213 182 111 | 245 173 131 | 139 206 227 |
| `--ceu-cor-2` | 242 184 198 (flor) | 255 154 77 (brasa) | 200 100 60 (ferrugem) | 226 240 248 (gelo) |
| `--ceu-topo` | 18 36 32 | 44 30 14 | 40 24 20 | 12 22 36 |
| `--ceu-vidro` | 16 30 26 / .66 | 30 22 12 / .66 | 30 18 14 / .66 | 14 24 36 / .66 |
| `--ceu-blur` | `--ds-blur-soft` | soft | soft | `--ds-blur-strong` |
| `--ceu-sat` | 1.4 | 1.5 | 1.2 | .9 |
| Astro | sol nascente pálido a 82% 22% | sol com núcleo 18px e coroa 44px | sol baixo raio 26px a 80% 62%, cortado pelo peitoril | sol frio 12px com halo de 22° e geada nos cantos |
| Anel | linear 135deg cor/.7 → cor-2/.55 → cor/.25 | conic com brilho no canto do sol, cor/.75 | linear 180deg cor/.35 → cor-2/.7 | linear 180deg cor-2/.65 → cor/.3 |
| Partículas | 8 pétalas 5x3px + 12 pólens 1,5px | 10 brasas 3px | 5 folhas 8x5px com verso | neve em 3 camadas (18/12/6) |
| Movimento | descem 10px/s, deriva +5, balanço 6px a 0,3Hz, giro 0,6 rad/s; pólen pisca | sobem 14px/s, balanço 3px a 0,7Hz, tremulam e apagam | descem 12px/s, balanço 10px a 0,25Hz, viram em 3D por \|cos\|, rajada a cada 7s | 5/9/15px/s, deriva senoidal 4px a 0,2Hz |

Apoio: "Até 20 de dezembro" (`seasonCycle(...)[0].end` − 1 dia, em `useMemo`).
`aria-label`: "Abrir página da Estação: Primavera, hemisfério Sul, até 20 de dezembro".

## 4. Vidro

Uma regra nova, para os dois botões:
`.ceu-peitoril { -webkit-backdrop-filter: blur(var(--ceu-blur)) saturate(var(--ceu-sat)); backdrop-filter: …; }`
→ **TETO_VIDRO 15 → 16**. O peitoril é irmão do canvas; nenhum ancestral entre os
dois com `opacity`, `filter`, `mask` ou `mix-blend-mode`. Realce: tinta
`rgb(var(--ceu-vidro))`, `inset 0 1px 0 rgb(255 255 255 / .10)` e `--ds-rim`.

Contraste no pior caso (branco puro atrás, sem desfoque, tinta .66): Lua 5,2:1,
Inverno 5,1:1, Verão 5,0:1, Primavera 4,8:1. Para valer: alfa da tinta >= .66;
todo o texto em `rgb(var(--el-text))`, sem `--el-muted`; hierarquia só por tamanho
e peso; chevron em `/ .8` (3:1 basta).

## 5. Movimento

- Ambiente: só as partículas da Estação. A Lua é desenhada uma vez e redesenhada
  quando muda data, hemisfério ou tamanho.
- `press`: `.elemental-press`. `feedback`: anel +.15 e chevron 2px. `reveal`: canvas
  aparece uma vez. `settle`: opacidade do anel e do halo da Lua na troca de dia.
  Estação: corte. `conjure`: nunca nos botões.
- Movimento reduzido: Estação em quadro único (t = 4,2s); Lua igual.
- Pausa: IntersectionObserver, `visibilitychange`, desmontagem; dt limitado a 50ms.
- iOS: loop a 30fps, DPR até 2, WebGL `low-power` sem antialias, na limpeza
  `dispose()` e `forceContextLoss()`.

## 6. Plano dos botões (um escritor por arquivo)

Novos: `src/lib/temporal/ceu-dos-ciclos.ts` (`luzDaLua`, `temaDaEstacao`,
`fimDaEstacao`), `src/components/cycles/ceu/BotaoLua.tsx`, `LuaTela.tsx`,
`BotaoEstacao.tsx`, `EstacaoTela.tsx`, `ceu-dos-ciclos.css`,
`tests/temporal/ceu-dos-ciclos.test.mjs`.

Tocados: `Ciclos.tsx` (imports; `useMemo` com `lunarSnapshot` e `south` logo após
`const season =`; o bloco do céu vira `<BotaoLua/><BotaoEstacao/>`) e `ciclos.css`
(sai `.cycle-sky-button` e afins; fica `.cycle-sky-links`).

Não quebrar: contratos AST de `Ciclos.tsx` (`const destinyHabitId =` até
`const dayShortcuts =`; `const selectCalendarDate =` até `// Navigate days`;
`selectRelativeVisibleDay`; `handleSaveEdit`), `tests/design/*`, `tests/motion/*`,
estouro zero a 390px; nada de stores, pontuação, backup, supabase; `getMoonPhase`
e `getSeason` intocados.

Teto (orquestrador): `TETO_VIDRO = 16` com o comentário do `.ceu-peitoril`.

## 7. Riscos sem aparelho e ordem de corte

Riscos: WebKit pode não desfocar canvas irmão ou piscar durante o `scale(.97)`;
cantos quadrados com `overflow: clip` sobre canvas (dar o raio ao canvas);
`-webkit-mask-composite: xor` (plano B: borda simples); perda de contexto;
calor com dois loops.

Corte: (a) Estação estática; (b) Lua só MoonDisc; (c) sai o `backdrop-filter`,
TETO volta a 15.

## 8. Decisões de Fábio (botões)

1. Altura 104px (+48) ou 88px (+32). Recomendado: 104.
2. Tirar o rótulo "Lua"/"Estação". Recomendado: tirar.
3. Nome e porcentagem por `lunarSnapshot` (como /lua). Recomendado: sim.
4. O botão segue o dia selecionado no Reel. Recomendado: sim.
5. Linha "Até 20 de dezembro" na Estação.
6. TETO_VIDRO 15 → 16.

## 9. Moldura do cartão ativo do Reel

**Conceito.** O cartão aberto vira um selo de mago: filete dourado, quatro
cantoneiras e, no meio de cada lado, os quatro triângulos alquímicos (Fogo △,
Água ▽, Ar △ barrado, Terra ▽ barrado); o do elemento da pessoa acende na cor da
aura. Partículas 3D orbitam o cartão, passando na frente e sumindo atrás.
**Coisa memorável:** a órbita com oclusão.

Cor: `useZodiacPreference()`; filete e triângulos apagados em `--el-gold`;
aceso, brilho e partículas em `profile.colour`; fundo sem foto em
`TINTA[profile.element]`; sem nascimento, ouro #d6b66f e nenhum triângulo aceso.

Arte presa ao cartão (`.reel-moldura[data-ativo=true]`, gira com o trilho):
filete `::before` inset 6px, `1px solid rgb(var(--el-gold) / .55)`, raio 16px;
`<svg class="reel-runas" aria-hidden>` com cantoneiras de 16x16px e losango de 3px,
triângulos de 10px sobre discos de 14px `rgb(7 11 18 / .7)`. Sem foto: véu de
`TINTA[elemento]` a 35% até 60% da altura, número em `--el-gold`. Com foto: filete
com `box-shadow: 0 0 0 1px rgb(7 11 18 / .5)`; película do meio de 30% para 45%;
número com `text-shadow: 0 1px 12px rgb(7 11 18 / .8)`.

Partículas: **um único canvas WebGL** para o Reel (`canvas.reel-feitico` em
`.reel-palco`, centrado no cartão ativo, (largura+48)x(altura+48): 196x245 a
390px, 228x288 a 768px; `pointer-events: none`, `aria-hidden`).
- Desenho 1: quad com distância ao retângulo arredondado; brilho só fora da borda
  (0–24px, aura .35 × respiração); reflexo no perímetro em 9s; interior alfa 0.
- Desenho 2: `Points` com 64 partículas, posição no vertex shader (ângulo, raio,
  altura, fase, `uTime`); atrás do cartão (z < 0 dentro do retângulo) → alfa 0.
- Elemento: Fogo, brasas em espiral; Água, gotas lentas com refração; Terra, pólen
  dourado em órbita baixa; Ar, faíscas rápidas com rastro. Modalidade: cardeal 1,0,
  fixo 0,6, mutável 1,3.
- Configuração pura em `src/lib/momentos/moldura.ts`.

Troca de dia: rolando → canvas apaga em `feedback` e pausa; assentou → arte e
canvas em `reveal` (cantoneiras .85 → 1, partículas nascem das cantoneiras). Dia
já completo ao navegar: triângulos acesos e +50% de partículas, em `reveal`, sem
ultrapassar. `conjure` só quando o último ciclo do dia ativo é concluído ali
(`diaConquistado(anterior, atual)`: mesmo dia, total > 0, feitos de total−1 para
total): cantoneiras 1 → 1,08 → 1 (720ms), `uExplosao` 0 → 1, triângulos em
sequência a 60ms. Movimento reduzido: quadro estático, sem explosão.

Desempenho em Ciclos: 2 contextos WebGL (Lua parada, moldura animada) + 1 canvas
2D; 2 loops a 30fps; ~192 mil px animados na moldura e ~67 mil na Estação. Não
compartilhar um canvas único (área vazia, cobriria o vidro, brigaria com o trilho).
A moldura **não conta** no TETO_VIDRO.

Plano (depois dos botões, um escritor): novos `src/lib/momentos/moldura.ts`,
`MolduraFeitico.tsx`, `RunasMoldura.tsx`, `moldura-feitico.css`,
`tests/momentos/moldura.test.mjs`; tocados `ReelMomentos.tsx` (canvas, `data-rolando`,
runas no ativo, ref do dia anterior) e `reel-momentos.css`. Não tocar `reel.ts`,
`momento.test.mjs`, a regra "só seleciona após gesto", `AcoesMomento`.

Decisões de Fábio (moldura):
- (a) cor pelo signo (recomendado) ou pelo elemento dominante do dia;
- (b) `conjure` junto do recibo de XP ou atrasado 720ms (recomendado: atrasar);
- (c) moldura some durante a rolagem (recomendado) ou fica parada como visor.

Ordem de corte: reflexo; oclusão; loop vira quadro; sai o canvas e ficam filete,
cantoneiras e triângulos em CSS/SVG.
