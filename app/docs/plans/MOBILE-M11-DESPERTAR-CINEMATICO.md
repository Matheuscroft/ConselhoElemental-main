# M11 — Despertar Elemental e altar sazonal

07/11/2026 · Astro Boy · concepção, ainda sem implementação.
Base inspecionada: 65161c8, versão 0.1.144, checkout inicialmente limpo.

## Decisões de Fábio

- Santuário ancestral com os quatro elementos.
- Personagem no altar; os quatro elementos despertam ao redor dele (resposta explícita).
- Cidade escolhida manualmente; iluminação acompanha o céu local (resposta explícita).
- Cena interativa de 20–30 segundos. Proposta apresentada inclui pular e rever.
- “Domínio do Mago.mp3” pertence ao momento posterior à introdução.
- Discutir ideias e mudanças visuais antes de executá-las.
- Santuário como altar do personagem, fundo animado sazonal e iluminação lunar noturna.

## Evidências atuais

- EntryWelcome/EntryVisuals implementam boas-vindas, acesso, entrada local e importação. Preservar os guards e os caminhos existentes.
- ElementalPreview usa imagem do corpo, imagens elementais, canvas de efeitos e órbita. Isso não constitui um personagem 3D articulado.
- MoonScene já renderiza esfera com mapas NASA LRO, iluminação derivada da fase e fallback MoonDisc. A apresentação usa astronomy-engine; não é transmissão ao vivo da NASA. Lua.tsx distingue orientação simplificada de inclinação local.
- Estacoes usa getSeason com hemisfério; Ciclos também admite latitude. Não criar outro calendário de domínio.
- Música informada: metadados ffprobe indicam 61,397 segundos, estéreo, 48kHz. Não houve escuta ou análise musical. Trilha da introdução não recebida.
- Uma arte existente do mago segurando quatro cristais foi inspecionada visualmente na pasta local de referências. Pode orientar a identidade; não foi aprovada como novo personagem nem enviada a serviços externos.

## Roteiro proposto, sujeito à composição escolhida

| Momento | Cena | Experiência |
| --- | --- | --- |
| Entrada | Altar visível em imagem leve enquanto recursos carregam | Despertar, controle de som e acesso direto permanecem disponíveis |
| 0–5s | Revelação da pedra, relevos e luz ambiente | Movimento de câmera lento, sem giro brusco |
| 5–16s | Quatro elementos despertam ao redor do altar | Toque provoca resposta localizada; não altera pontos ou perfil |
| 16–23s | Convergência dos elementos e revelação do personagem | Momento principal, com poucos efeitos bem coordenados |
| 23–28s | Câmera estabiliza e interface aparece | Transição para o Santuário; música posterior somente com som autorizado |

Interações não devem obrigar gestos rápidos, sustentar toques ou encontrar alvos escondidos. Tempo é estimativa artística, ajustável na prévia. Retorno de usuário existente e recuperação de conta não podem exigir assistir novamente.

## Direção visual proposta

Pedra escura com desgaste e relevos; metal dourado envelhecido; água e reflexos controlados; brasas e fumaça ascendentes; ar em filamentos com trajetória coerente. Terra usa massa, fragmentos e vegetação, evitando deformar uma imagem para simular vida.

Paleta inicial reaproveita a identidade: base #0B1018, pedra #263139, ouro #D5B66F, terra #A3CE9B, fogo #F5AD83, água #8BCEE3; ar #D2E6DF como luz secundária. Manter fontes existentes, serifada nos títulos e sem serifa nas instruções. Cena ao centro; controles legíveis na faixa inferior, respeitando safe-area. Vidro escuro apenas em controles necessários, sem painel de cards sobre toda a cena.

As estações mudam vegetação, partículas e paleta. Não representar previsão meteorológica nem assumir neve no inverno de qualquer cidade. Sol define dia/crepúsculo/noite; Lua fornece posição/fase para a camada noturna. Lua abaixo do horizonte não deve aparecer como posição real: eventual representação simbólica precisa ser identificada como artística. Iluminação de destaque mantém personagem e controles legíveis na lua nova.

## Arquitetura proposta

1. Cena isolada usando Three/React Three Fiber já disponíveis; uma composição WebGL por tela, sem vários renderizadores concorrentes para o mesmo altar.
2. Objetos e texturas comprimidos, carregamento progressivo e qualidade adaptativa. Imagem estática como fallback; pausar trabalho visual quando oculto. Metas de peso/FPS serão medidas no protótipo, não declaradas como atingidas.
3. Controlador da introdução com estados explícitos: pronto, carregando, executando, pausado, concluído/pulado. Cancelar timers, áudio e efeitos na saída. Não criar segundo motor de progressão.
4. Som iniciado por gesto, opção silenciosa, mute e transição de volume. Definir comportamento ao sair/retornar ao app. Música posterior não deve tocar automaticamente sem escolha.
5. Céu depende de data e posição do observador, não apenas da fase lunar. Cidade escolhida manualmente pelo usuário, sem exigir GPS. Usar coordenadas e fuso da cidade para cálculo; não inferir localização por IP ou conta. A cidade específica ainda não foi informada.
6. Preferência de movimento reduzido oferece revelação curta/estática; teclado e leitores de tela têm acesso equivalente às ações.
7. Higgsfield pode apoiar conceitos ou assets aprovados. Vídeo pré-renderizado não substitui o cálculo real de céu/fase nem é necessário para hospedar o app.

## Escolhas pendentes

- Identidade final do personagem/modelo 3D e composição da cena de referência, antes de produzir assets finais.
- Música/ambiência da introdução e uso único ou repetição da música posterior.

## Próximos lotes e aceite

1. Fechar escolhas e apresentar uma composição visual para aprovação.
2. Protótipo isolado do altar e sequência, sem alterar entrada pública nem dados.
3. Integrar céu sazonal/lunar e áudio com escolhas confirmadas.
4. Validar carga, falhas WebGL, pausa, pular, retorno, reduced motion e legibilidade em360/390/768px; aceitar no iPhone real separadamente.
5. Integrar à entrada sem interromper auth/importação/sessões, verificar e publicar no destino vigente confirmado. Destino atual documentado é conselho-elemental-main.vercel.app; Fábio confirmou em 08/11/2026 o link final do Vercel mantido por Matheus, https://conselho-elemental-main.vercel.app/auth, verificado com HTTP 200. Não retornar ao domínio antigo por conveniência.

Calendário com gesto horizontal e foto diária permanece ideia separada; não implementado por este lote. Fotos exigem desenho de quota, privacidade e persistência antes de adicionar imagens ao backup.

## Fontes técnicas consultadas

- NASA CGI Moon Kit: https://svs.gsfc.nasa.gov/4720/
- React Three Fiber, performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- MDN Web Audio: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- MDN autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Three KTX2: https://threejs.org/docs/pages/KTX2Loader.html
- glTF Transform: https://gltf-transform.dev/
- Poly Haven, licença dos assets: https://polyhaven.com/license
- W3C, pausa de movimento: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide

## Verificações e limites deste lote

Inspeção de Git, documentação, componentes atuais, metadados do áudio e uma referência visual local. Pesquisa nas fontes acima. Sem alteração de produto, novo build, testes funcionais, validação visual no navegador, geração paga, envio de mídia, push ou deployment. Evidências de M10 são históricas e não validação desta proposta.

## Retomada — escolhas confirmadas e conceito A

Fábio confirmou personagem no altar com despertar dos quatro elementos e escolha manual de cidade para iluminação local. Não foi escolhida uma cidade específica.

Gerada uma imagem vertical pelo image_gen integrado, apenas para avaliação: altar circular de basalto com detalhes dourados, arquitetura ancestral aberta, água refletindo, quatro elementos e personagem provisório. Imagem revisada visualmente: os quatro elementos estão distintos e o personagem ocupa o centro; a figura encapuzada e a Lua desenhada são ilustrativas, não identidade aprovada nem fase astronômica calculada. Cenário ainda aguarda aceite de Fábio.

Arquivo local de prévia, não dependência do app: `/Users/fabioandre/.codex/generated_images/01a15a72-aaea-73f2-ab5c-961629c8b9dd/exec-bd0e6139-b962-4d0d-ab2a-3a8c5f156c49.png`. Não copiado para public nem incluído no build. Nenhuma mídia pessoal enviada como referência ao gerador.

Prompt resumido: composição cinematográfica vertical para Domínio do Mago, santuário ancestral de pedra e ouro envelhecido, personagem provisório central em altar, rocha musgosa/água/fogo/vórtice de ar orbitando, reflexos e iluminação coerentes, espaço inferior para controles; sem texto, HUD ou moldura de celular.

Verificação desta retomada: git status e diff --check; documentação atualizada. Sem alteração de código, teste funcional, build, publicação ou mudança de dados. Próximo: aceite ou ajuste da direção de arte, depois protótipo isolado.

## Decisões de Fábio (08/11/2026) e análise do conceito A

Respostas: cena em camadas 2.5D com parallax e partículas (MVP), 3D real só na Lua; cidade salva no perfil, opções Olinda e Recife; estações aparecem em vegetação, cor da luz e partículas; final de tarde com lua nascendo, sol de um lado e lua do outro; qualquer ordem de toque; botão pular sempre visível e sutil; só no primeiro acesso, com "rever introdução" nas configurações; Higgsfield autorizado, com fallback ao modelo interno quando faltarem créditos.

Análise do conceito A: altar, arcos e espelho d'água funcionam; céu pintado mistura pôr do sol e lua cheia fixa (deve virar camada dinâmica); lua é desenho, não a MoonScene; água e ar ambos à direita e terra solta no alto (reorganizar em quatro pontos); ar quase invisível e fogo domina a luz; rosto do personagem totalmente preto; sem estação visível.

Cidades (coordenadas aproximadas, fuso America/Recife, sem horário de verão): Recife −8,05 / −34,88; Olinda −8,01 / −34,86. Hemisfério Sul para estação. Reaproveitar getSeason e astronomy-engine; não criar calendário novo.

Assets locais em ~/Downloads/Dominio do mago INTRO (não copiados ao repositório): 5 imagens de grimório/joias/mago, 12 vídeos de 7–10 s (verticais 720x1280 ou 1080x1920; um 1920x1080 e um 1664x1248) e video.mp4 de 34 s. Referências visuais apenas: peso incompatível com carga mobile; só seriam usados após aprovação e compressão.

### Áudio
- Música pós-introdução: "Domínio do Mago.mp3" (61,4 s), ao entrar no app.
- Música da introdução: link do YouTube informado. Não baixar nem embutir sem licença/arquivo próprio; pendente de arquivo ou licença. Até lá, ambiência sintetizada (vento, água, brasas, rocha) e fade para a música só com som autorizado.

### Skill ai-avatar-video (skills.sh, bankai-skills/superpowers)
Não instalada por este executor: exige o CLI externo belt/inference.sh com login próprio e a página registra aviso do Snyk. Instalação fica com Fábio (comando na resposta da sessão); não é dependência do app.

### Plano de ação (cada lote: confirmar modelo antes)

| Lote | Entrega | Modelo/esforço |
| --- | --- | --- |
| A | Conceito B revisado (quatro pontos cardeais, sol e lua opostos, ar legível, personagem com identidade) e aceite | Sonnet 5.5 Médio |
| B | Assets: camadas separadas (fundo, altar, personagem, elementos), compressão WebP/AVIF, fallback estático | Sonnet 5.5 Médio |
| C | Núcleo: cidade no perfil (Olinda/Recife), cálculo Sol/Lua/estação por cidade e testes unitários | Opus 5.5 Alto |
| D | Cena 2.5D isolada: parallax, partículas por elemento, toque em qualquer ordem, pular, reduced motion, pausa em segundo plano | Opus 5.5 Alto |
| E | Controlador da introdução e áudio (ambiência, fade, mute, música posterior), estados explícitos e limpeza de timers | Opus 5.5 Alto |
| F | Lua 3D noturna com MoonScene e fase real; iluminação de destaque | Opus 5.5 Alto |
| G | Integração à entrada só no primeiro acesso, "rever introdução" em configurações, sem tocar auth/importação | Sonnet 5.5 Alto |
| H | Verificação 360/390/768, carga, falha WebGL, testes, build; aceite no iPhone real à parte; publicação só com autorização | Sonnet 5.5 Médio |

Riscos: peso da cena em celular, autoplay bloqueado, lua abaixo do horizonte (representação simbólica identificada como artística), licença da música, créditos do Higgsfield.

## Lote A — conceito B (08/11/2026)

Higgsfield indisponível para geração: conta no plano gratuito com 10 créditos ("Requires basic plan or higher"). Fallback interno: cena vetorial em camadas, pensada como base da cena 2.5D.

Arquivos (documentação, fora de public e do build): `conceito-b/conceito-b.svg` (camadas com ids: ceu, agua, arcos, altar, elementos, personagem, particulas, frente) e `conceito-b/conceito-b-previa.png` (780x1688).

Correções sobre o conceito A: quatro elementos em cruz (fogo alto-esquerda, água alto-direita, terra baixo-esquerda, ar baixo-direita) com brilho equilibrado; sol à esquerda e lua nascendo à direita, afastados das colunas; mago de rosto visível com olhos ciano, chapéu e barba, como nos vídeos de referência; luz de contorno quente à esquerda e fria à direita; faixa inferior escura para controles; partículas de folhas como marca da estação.

Limites: estilo vetorial chapado, não fotorrealista; posições de sol/lua encenadas (artísticas), não calculadas; nenhuma integração ao app, teste ou build. Arte final pode ser gerada no Higgsfield após upgrade de plano. Próximo: aceite ou ajustes do conceito B; depois lote B (camadas e compressão).

### Lote A — revisão do conceito B (v3)

Ajustes pedidos por Fábio: estilo mais realista, personagem, elementos, cenário e céu. Personagem refeito a partir da referência local "Wizard_holding_glowing_crystals" (só inspecionada, não copiada): barba e bigode castanhos, olhos turquesa, chapéu largo de copa estrelada com faixa azul-clara, capuz azul com borda dourada, runas ciano nas mangas, faixa marrom. Elementos agora são cristais facetados (rubi/fogo, safira/água, esmeralda/terra, perolado/ar) com efeitos próprios. Cenário: textura de pedra nas colunas e no altar, sol e lua afastados das colunas.

Limite: continua vetorial; o realismo do conceito A só virá com arte gerada (Higgsfield pago). Sem integração, teste ou build.

### Lote A — conceito B v4 (08/11/2026)

Segunda rodada de ajustes de Fábio: mais realista, mago maior e mais perto, cristais mais brilhantes, céu mais cinematográfico, altar mais imponente.

Aplicado: personagem passou de ~170px para ~380px de altura (rosto com sombra da aba, olhos turquesa com reflexo, barba em gradiente, manto com dobras e luz de contorno quente/fria). Céu ganhou gradiente de sete paradas, raios de sol, nuvens com turbulência, três camadas de montanhas com profundidade e estrelas com halo. Altar virou três degraus com runas douradas acesas, halo e reflexo na água. Cristais ficaram maiores, com halo radial, faceta interna, reflexo especular e partículas. Cena recebeu grão, textura de rocha por deslocamento e vinheta.

Correção de leitura: o cristal de terra cobria o sol; terra e ar desceram e o sol subiu, deixando sol à esquerda e lua à direita visíveis ao mesmo tempo. Prévia regerada em `conceito-b/conceito-b-previa.png`.

Limite: continua vetorial e não fotorrealista; posições de sol e lua seguem encenadas. Sem integração ao app, teste, build ou commit.

### Lote A — conceito C fotorrealista (08/11/2026)

Fábio pediu um conceito no nível do conceito A ou superior. Geração nova no Higgsfield ficou bloqueada: conta no plano gratuito, 10 créditos, erro "Requires basic plan or higher" em gpt_image_2_6, seedream_v4_5 e nano_banana; `models_explore` retornou `unlim.available: false` e `use_free_gens` só existe no conector ChatGPT. Links de upgrade/trial foram repassados a Fábio na sessão; nenhuma compra feita.

Rota usada sem custo: composição fotorrealista sobre o próprio conceito A com ffmpeg (`conceito-c-composicao.sh`, reprodutível). Base `~/.codex/generated_images/.../exec-bd0e6139...png`, 1024x1536.

Correções aplicadas: lua recortada do original e reposicionada no céu à esquerda por blend screen com máscara radial; posição antiga removida por cancelamento radial do halo mais remendo de céu desfocado; sol criado por gradiente radial em screen no horizonte à direita, sobre o poente existente — sol e lua em lados opostos; vórtice de ar realçado e terra com leve brilho verde, equilibrando os quatro elementos; grade de contraste e saturação, vinheta e escurecimento do terço inferior para os controles.

Limites: é composição sobre a arte existente, não geração nova; resta um clarão suave onde a lua estava, que lê como nuvem; o personagem continua o encapuzado sem rosto do conceito A, não o mago barbudo da referência — identidade final depende de geração nova. Sem integração ao app, teste, build ou commit.

Arquivos: `conceito-b/conceito-c-fotorrealista.png` e `conceito-b/conceito-c-composicao.sh`.

## Lote B — camadas e compressão (08/11/2026)

O conceito C virou assets de produção em `conceito-b/assets/`, sem integração ao app. Dois scripts reproduzem tudo: `lote-b-camadas.sh` gera as camadas a partir da arte original e `lote-b-exportar.sh` comprime e redimensiona.

Decisão central: Sol e Lua saem da arte e passam a ser desenhados em tempo de execução. A `placa-base` é o cenário sem os dois, já com o cancelamento do halo e o remendo que apagam a Lua original, o realce de ar e terra, a grade, a vinheta e o escurecimento do terço inferior. Assim o lote C pode posicionar Sol e Lua pelo céu real de Olinda ou Recife sem refazer a arte.

A Lua virou `sprite-lua`, recortada da arte original com queda radial para preto e aplicada em blend screen. O Sol não tem asset: ficou procedural, com a fórmula exata registrada em `manifesto.json` (núcleo mais dois brilhos gaussianos, em screen), pronta para um gradiente radial ou um canvas.

`manifesto.json` descreve as camadas, os modos de blend, os fatores de parallax, as âncoras e as áreas de toque normalizadas dos quatro elementos, com a cor amostrada da arte e a cor emissiva da identidade. Os raios de toque dão alvos de 83 px ou mais a 390 px de largura, acima do mínimo de 44 px.

Pesos medidos (AVIF por ffmpeg/libsvtav1 em CRF 34; WebP por cwebp em q80):

| Arquivo | AVIF | WebP |
| --- | --- | --- |
| placa-base 390w | 19,0 KB | 31,1 KB |
| placa-base 780w | 62,5 KB | 95,5 KB |
| placa-base 1024w | 121,0 KB | 171,8 KB |
| sprite-lua 170px | — | 1,3 KB |

Reserva estática do conceito C inteiro, para carregamento, falha de WebGL e movimento reduzido: 27,1 KB em WebP e 50,5 KB em JPEG a 390w; 84,5 KB e 166,2 KB a 780w.

Custo real da cena em um aparelho 2x: 63,8 KB (placa AVIF 780w mais sprite da Lua). A 1x, 20,3 KB.

Limites deste lote: a arte continua sendo composição sobre o conceito A, não geração nova, e o personagem ainda é o encapuzado sem rosto, não o mago barbudo da referência. A placa é uma camada única — fundo, altar, personagem e elementos não estão separados em profundidade, então o parallax é do conjunto; separação real exigiria a arte gerada já em camadas ou um passe de recorte. A densidade 3x (1170 px) não foi exportada porque a arte-base tem 1024 px de largura e ampliar não criaria detalhe. Resta o clarão suave onde ficava a Lua original, que lê como nuvem. Os assets ficam em `docs/`, fora de `public/`, para não pesar o build; o lote G os move. Sem alteração de código, teste, build, commit ou push.

Verificação do lote B: as camadas foram remontadas (placa-base mais `sprite-lua` em screen na âncora 320,30 mais o Sol procedural da fórmula do manifesto) e o resultado reproduz o conceito C, o que confirma que o app consegue reconstruir a cena a partir da placa e das sobreposições em tempo de execução. Os AVIF e WebP exportados foram decodificados de volta e conferidos visualmente. Nenhum teste do produto, build ou publicação.

### Protótipo de coreografia no Remotion (08/11/2026)

Fábio aprovou prototipar a cinemática antes de escrever a cena definitiva. Projeto Remotion 4.0.541 criado em `prototipos/despertar-video/`, **fora de `app/`**: o `eslint .` do app varre qualquer subpasta e quebraria o CI; a raiz já é ignorada pelo `.gitignore`, então o protótipo não entra no Git nem no build. Matheus recria com `npx create-video@latest --yes --blank --no-tailwind`.

Composições registradas: `Despertar` (1080x1920, 30 fps, 28 s), `DespertarReduzido` (6 s, para movimento reduzido) e o still `QuadroFinal`.

A geometria sai do `manifesto.json` do lote B, em `src/despertar/geometria.ts`: a placa 2:3 cobre a altura e sangra 100 px por lado no 9:16, e as frações de cada elemento viram pixels por `px`, `py` e `pr`. Mudar `TEMPOS` muda a coreografia inteira.

Batidas: 0–5 s push-in de 1,10 para 1,00 com brilho subindo de 0,32; Sol entra em 2–6 s e Lua em 3–7 s; elementos acendem em 5, 7, 9 e 11 s, cada um com pulso e respiro; 13–16 s respiro conjunto; 16–21 s convergência, com os brilhos caminhando 82% até o altar e encolhendo; clarão em 21 s; 21–25 s luz de contorno revelando o personagem; 25–28 s faixa de controles. O "Pular" aparece em 0,8 s e fica sempre visível.

Sol e Lua são camadas separadas em blend screen, não estão na placa: o app vai reposicioná-las pela posição real calculada para a cidade. O Sol é procedural, pela fórmula do manifesto; a Lua usa `sprite-lua.webp`.

Correções feitas na inspeção de quadros: o Sol estourava o lado direito e apagava o Ar, então o raio caiu de 2,2 para 1,35 sigma e as paradas do gradiente foram suavizadas; a faixa de controles vazava abaixo de 1920, então passou a ancorar em `bottom: 120`, dentro da área segura de 80 px laterais e 100 px inferiores.

`npx tsc --noEmit` passa. Quadros 390, 638 e 810 renderizados e inspecionados. Nenhum MP4 foi exportado: a skill manda só renderizar sob pedido explícito, e o Studio tem interface própria para isso.

Limite: continua sendo a arte do conceito C, com o personagem encapuzado sem rosto. O Remotion é ferramenta de prototipagem de tempo; não substitui o cálculo de céu e fase lunar, que fica no app.

MP4 de referência exportado a pedido de Fábio: `prototipos/despertar-video/out/despertar.mp4`, 28 s, 1080x1920, 30 fps, H.264, 5,9 MB; e `despertar-reduzido.mp4`, 6 s, 973 KB. São referências de tempo para aprovação, não assets do app: a cena final é desenhada em tempo real, porque Sol, Lua e estação dependem da cidade e do horário.

## Lote C — cidade, Sol, Lua e estação (08/11/2026)

Primeiro código de produto do M11. Dois módulos novos em `app/src/lib/temporal/`, exportados pelo barril `index.ts`.

`sanctuary-city.ts`: catálogo com Recife (−8,0476 / −34,877, 4 m) e Olinda (−8,0089 / −34,8553, 10 m), ambos em `America/Recife`, sem horário de verão. A cidade é preferência local do aparelho, em `localStorage` sob `ce:sanctuary:city`, com evento próprio e hook `useSanctuaryCityPreference`, exatamente como `preferences.ts` já fazia para o início da semana. **Não entrou no appStore**: ali ficam dados de conta e pontuação, que este lote não toca. Escolha manual; nada é inferido de IP ou de conta. Valor desconhecido cai no padrão Recife.

`sanctuary-sky.ts`: `sanctuarySky(date, city)` devolve altitude, azimute e se está acima do horizonte para Sol e Lua, mais fase lunar, fração iluminada, crescente ou minguante, a estação pelo hemisfério da cidade e a luz do momento (`day`, `golden`, `dusk`, `night`, pelos limites usuais de crepúsculo). Reaproveita `getSeason` e `getHemisphereFromLatitude` de `@/constants` e o `astronomy-engine` que o projeto já usa; nenhum calendário novo foi criado, e nada disso alimenta regra de jogo.

`sanctuaryAnchor(body)` converte azimute e altitude nas frações de tela do manifesto. A câmera é fixa, não um planetário: olha para o sul (`CAMERA_BEARING = 180`), com arco horizontal de 220° e vertical de 90°, e o horizonte em `y = 0,47`. Esses números foram escolhidos para bater com a arte: às 17h15 de 08/11/2026 em Recife o Sol calculado cai em x = 0,831, e o conceito C desenhou o Sol em 0,835. Fora do arco ou abaixo do horizonte, `visible` é falso, e quem desenha decide o que fazer.

Testes: `app/tests/temporal/sanctuary-sky.test.mjs`, 9 casos. Cobrem o catálogo, a queda para o padrão com valor inválido, Sol alto ao meio-dia e fundo à meia-noite, poente ao sul do oeste na primavera do Sul, estação pelo hemisfério, lua cheia do USNO de abril de 2024 conferida, invisibilidade abaixo do horizonte, a geometria das âncoras e a diferença real mas desprezível entre Recife e Olinda. O teste extrai `getSeason` do barril de constantes pela mesma técnica que `presentation.test.mjs` já usava, sem puxar leveling nem armazenamento.

Verificação: **760 testes passam** (eram 751; os 9 novos), `eslint .` limpo, `tsc -b` e `vite build` concluídos. Sem publicação, sem push e sem commit. A interface de escolha da cidade e o desenho da cena ficam para os lotes seguintes; por ora o núcleo existe e está coberto.

## Lote D — cena 2.5D isolada (08/11/2026)

A cena existe e funciona, mas ainda não está ligada a rota nenhuma: a entrada do app segue intacta, e a integração é o lote G.

`app/src/lib/sanctuary/awakening-scene.ts`: geometria e estado puros, sem React e sem DOM. Posições e raios vêm do manifesto do lote B. `sceneDistance` normaliza o eixo vertical pela proporção 2:3, senão a área de toque viraria elipse. `hitTestElement` devolve o elemento mais próximo quando duas áreas se sobrepõem, para um dedo entre Terra e Fogo nunca acender o errado. O estado guarda a ordem em que a pessoa acendeu, acender duas vezes não faz nada, e `completeAwakening` é o caminho de pular e de movimento reduzido.

`app/src/components/sanctuary/DespertarCena.tsx` com `despertar-cena.css`. Placa em `<picture>` com AVIF e WebP em 390, 780 e 1024, e JPEG de reserva; assets em `public/sanctuary/despertar/`, 680 KB no total, dos quais o aparelho baixa um. Sol procedural e sprite da Lua posicionados por `sanctuaryAnchor` do lote C, desenhados só quando `visible`. Quatro alvos são `button` de verdade, com nome acessível e `aria-pressed`, então funcionam no teclado e no leitor de tela. Partículas num único canvas, que para quando a aba fica oculta. Parallax segue ponteiro e `deviceorientation`, com valores limitados. Pular sempre visível no topo. Nada é gravado, nenhuma pontuação é tocada, e a cena só avisa por `onSkip` e `onComplete`.

Movimento reduzido abre com os quatro elementos já acesos, sem parallax, sem canvas e sem transição.

Testes: `app/tests/sanctuary/awakening-scene.test.mjs`, 11 casos, incluindo o toque em cada elemento, o desempate entre áreas vizinhas, o mínimo de 44 px em tela de 390, qualquer ordem, o limite do parallax e a renderização com e sem movimento reduzido.

### Dois defeitos achados só olhando a cena no navegador

`will-change: translate` na camada do céu criava um contexto de empilhamento próprio, então o `mix-blend-mode: screen` da Lua misturava com a camada vazia em vez da placa, e o sprite aparecia como um retângulo preto. O blend passou para a camada inteira, e o `will-change` foi para o palco, que é o que de fato se move.

`margin: auto` não centraliza um elemento maior que o contêiner: o navegador joga todo o excesso para um lado. Com a placa 2:3 cobrindo uma tela estreita, o palco ficava encostado à esquerda e o Ar caía fora da tela, com centro em x=423 numa viewport de 390. Centralização explícita resolveu.

Verificação: **771 testes passam** (eram 760; os 11 novos), `eslint .` limpo, `tsc -b` e `vite build` concluídos, com código de saída conferido. O lint pegou dois erros que as checagens parciais tinham escondido: um `useMemo` sem função embutida e um import sem uso.

Verificado no navegador em 360, 390 e 768: os quatro alvos ficam dentro da tela nas três larguras, com no máximo 11 px aparados nos extremos. Falta aparelho real.

Limite conhecido: a câmera olha para o sul num arco de 220°, então a Lua só entra no enquadramento em cerca de 30% das horas, e Sol e Lua aparecem juntos em cerca de 22%. É honesto, mas significa que a maioria das noites não terá a Lua que a arte mostra.

## Lote E — controlador e áudio (08/11/2026)

`app/src/lib/sanctuary/awakening-controller.ts`: a única máquina de progressão da introdução, pura, sem timers, sem áudio e sem armazenamento. Fases `idle`, `loading`, `running`, `paused`, `done` e `skipped`, com tabela de transições explícita. Sinal inesperado é ignorado em vez de lançar erro, porque um evento de visibilidade perdido ou um toque duplo não pode quebrar a cena. `done` e `skipped` são terminais; `teardown` sempre volta a `idle`, então remontar nunca herda fase. `onVisibility` pausa ao sair do app e retoma ao voltar, deixando em paz o que já terminou.

Na cena, a conclusão é **derivada**, não guardada: os elementos acesos já dizem isso, e uma segunda cópia em estado ficaria um render atrás. O lint do projeto pegou essa duplicação como render em cascata, e a correção simplificou o componente.

`app/src/lib/sanctuary/awakening-audio.ts`: ambiência sintetizada em Web Audio, sem arquivo. Quatro vozes — pedra com corpo grave e pulso lento, brasas num filtro estreito que respira, água num varrimento mais lento, ar fino e agudo à deriva — cada uma com ganho próprio, sobre ruído marrom em laço. Da skill `soundtrack` veio a disciplina que importa aqui: camadas entram uma a uma, com rampa de 1,4 s, porque uma camada chegando em nível cheio soa como susto.

Nada começa sozinho. `start()` só é chamado pelo botão "Ativar som", que é ao mesmo tempo a exigência do navegador e a autorização da pessoa. O padrão é silêncio. Mute e unmute usam rampa de 0,25 s, nunca corte seco. Sair do app suspende o contexto; voltar retoma respeitando um mute feito enquanto fora. `stop()` para cada fonte, desconecta, fecha o contexto e recusa reabrir, e a cena chama isso ao desmontar.

A música que vem depois da introdução **não é tocada daqui**. A cena só informa, em `onComplete`, se a pessoa ativou o som; é essa a única coisa que pode autorizar a música mais tarde, no lote G. O arquivo `Domínio do Mago.mp3` continua fora do repositório.

Testes: `app/tests/sanctuary/awakening-controller.test.mjs`, 12 casos. Cobrem a tabela de transições inteira, sinais inesperados, terminalidade, pular de qualquer fase, visibilidade e teardown; e, com um `AudioContext` falso, que nenhum contexto nasce antes do gesto, que o início é por rampa e não em nível cheio, que acender a mesma voz duas vezes não empilha, que mute e unmute rampam, que voltar não desfaz um mute, e que depois de `stop()` o áudio não reabre.

### Rota de teste e defeito achado no app real

A cena ganhou a rota pública `/despertar` em `App.tsx`, carregada por `lazy`. Nada aponta para ela; serve para testar a cena dentro do app e no deploy. A ligação à entrada, só no primeiro acesso e com "rever introdução" nas configurações, continua sendo o lote G.

Montada no app de verdade, a cena apareceu com **altura zero**. A causa: `block-size: 100%` só resolve quando o pai tem altura definida, e o elemento da rota não tem; de quebra, isso zerava as unidades de contêiner com que a placa é dimensionada. Passou a `100dvh`, com `100vh` antes como reserva. A página de teste estática não pegaria isso, porque lá o `body` tinha altura.

Depois da correção, no app em 390x844: palco 580x869 e os quatro alvos dentro da tela, nas mesmas posições medidas no teste estático. Fábio exercitou a cena no navegador interno: os toques acenderam os elementos em ordem livre, a fase chegou a `done` e a legenda fechou com a estação e a fase lunar reais da cidade.
