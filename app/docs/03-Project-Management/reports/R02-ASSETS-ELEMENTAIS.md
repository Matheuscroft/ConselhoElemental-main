# R02 — assets de magia elemental

21/10/2026 · versão 0.1.36. Pedido: ícones realistas/vívidos orbitando o corpo; água pulsante, terra sólida, ar em esfera espiral inspirada no Rasengan, fogo como bola de chama viva.

## Produção e arquivos

Quatro gerações separadas pela ferramenta integrada image_gen, sem referência externa de imagem, CLI de geração ou credenciais. Todas as artes foram inspecionadas visualmente na saída da ferramenta. Arquivos gerados em 1254 × 1254 com alpha; cópias finais no projeto, codificadas com `cwebp -lossless -exact -m 6`, sem redimensionamento ou alteração da composição. PNGs originais permanecem na pasta de saída da ferramenta; cópias intermediárias locais foram removidas.

- `public/sanctuary/elements/agua-v1.webp`
- `public/sanctuary/elements/terra-v1.webp`
- `public/sanctuary/elements/ar-v1.webp`
- `public/sanctuary/elements/fogo-v1.webp`

PNG total: 9.415.564 bytes; WebP total: 6.631.038 bytes (~29,6% menor). São masters em alta resolução; não houve benchmark de carregamento/mobile. Derivativos menores são uma otimização futura, sem alegação de performance validada.

## Movimento e integração

PNGs/WebPs são imagens estáticas. Os efeitos são animações CSS: água varia escala e rotação levemente; ar gira em seis segundos; fogo oscila em escala/ângulo e aura; terra não recebe deformação. Não há simulação física de fluido, vídeo ou sequência de frames. A órbita mantém sua profundidade e controles anteriores. Pausa manual, interação, preferência de movimento reduzido e visibilidade da cena/aba controlam os efeitos. Rótulos e alvos de link ficam fora da transformação da arte.

Hero de cada elemento reutiliza a imagem sem animação autônoma. Ícones pequenos de navegação e áreas mantêm sigilos para leitura em tamanhos reduzidos. Se a imagem não carregar, o componente mostra o sigilo existente, mantendo o nome e o destino do link.

Verificações executadas e limites atuais em [CONTINUIDADE.md](../../CONTINUIDADE.md). Sem inspeção renderizada do app por bloqueio salvo de localhost já documentado.

## Prompts finais

### agua

Use case: stylized-concept. Asset type: realistic elemental magic game UI icon, single isolated WATER orb. Create a vivid physically convincing spherical mass of flowing clear azure water, held together by magic, with curling liquid currents, rippled surface, translucent volume, bright cyan caustics and a few attached splash crests and droplets. Looks like actual liquid, never a solid glass marble or ice crystal. Premium cinematic VFX realism, detailed yet readable at 80 pixels, bright clean silhouette for an obsidian UI. Centered front three-quarter view, approximately circular shape occupying 76% of a square 1024x1024 canvas, small margin for all droplets. Self-lit edge details with convincing shaded volume. The entire background must be truly transparent alpha, including spaces between droplets. No floor, cast shadow, pedestal, hands, character, scenery, text, badge, frame, checkerboard or opaque background. One asset only, not a sprite sheet. Designed as a matching set with realistic rock, wind and fire elemental spheres.

### terra

Use case: stylized-concept. Asset type: realistic elemental magic game UI icon, single isolated EARTH orb. A substantial roughly spherical cluster of rugged basalt, brown stone and mineral strata, dense and solid, richly textured fractures, sharp natural rock facets, restrained deep green moss in a few crevices. Tiny separated rocky fragments close to its silhouette imply levitation. Real geological materials, physically convincing roughness and weight, not a planet, not polished crystal, not glowing lava. Premium cinematic VFX rendering, clear readable silhouette at 80 pixels, warm top-left light and gentle sage rim illumination for an obsidian UI. Centered three-quarter view on a square 1024x1024 canvas, orb occupies 76% with generous clear margins. Transparent alpha background throughout, including gaps between small fragments. No floor, shadow plane, pedestal, hands, characters, text, frame, badge, scenery or opaque backdrop. One asset only. Cohesive with realistic liquid-water, wind-energy and fire spheres.

### ar

Use case: stylized-concept. Asset type: realistic elemental magic UI icon, single isolated AIR / WIND sphere. A concentrated rotating wind energy orb inspired by Naruto's Rasengan, reinterpreted as premium photoreal cinematic magic VFX. Many delicate luminous silver-white and pale icy-blue curved air filaments swirl rapidly around a brilliant airy core in several crossing spiral bands; wispy vapor and directional streaks give a palpable spherical vortex. Pale mostly-white light, distinguishable from saturated blue liquid water. No water, no droplets, no hard glass shell, no lightning bolts. Bright and vivid but preserve readable spiral texture instead of overexposed white blob. Centered approximately circular volume occupying 76% of a square 1024x1024 canvas, detached short wisps contained within generous transparent margin. Physically dimensional atmospheric volume; clean readable silhouette at 80 pixels, for an obsidian UI. Real transparent alpha background including spaces between wind trails. No hands, character, floor, scenery, shadow plane, text, symbols, badge, frame, checkerboard or opaque background. Single standalone asset in a coherent set with realistic rock, water and fire spheres.

### fogo

Use case: stylized-concept. Asset type: realistic elemental magic game UI icon, single isolated FIRE orb. A living ball of turbulent flame: dense incandescent amber-orange core wrapped in curling yellow-gold and orange-red flame tongues, luminous hot filaments, a few tiny sparks following the spherical outline. Photoreal cinematic fire VFX, volumetric translucent flames, energetic and vivid, retain fine flame detail without a flat white overexposed disk. NOT a sun, rocky lava meteor, campfire, candle, water or glass sphere. Slightly upward flame tips but overall compact roughly circular silhouette, centered and occupying 76% of a square 1024x1024 canvas, all flame tips contained with clear margins. Clean strong silhouette at 80 pixels against a dark obsidian UI. Real transparent alpha background including flame edges and spaces between sparks. No floor, shadow plane, pedestal, hands, characters, environment, opaque backdrop, checkerboard, text, badge or frame. One asset only, matching a premium set of realistic water, rock and wind magic spheres.


## Refinamento 0.1.37 — material em movimento

Relato do usuário: apenas o ar parecia animado. Inspeção do código confirmou terra deliberadamente estática e transformações muito discretas em água/fogo. Auditoria focal com improve-animations; implementação prosseguiu por solicitação explícita do usuário, sem auditoria global ou delegação.

Água e fogo agora usam textura raster dentro de SVG com feTurbulence/feDisplacementMap. Duas frequências variam continuamente em ritmos diferentes; o deslocamento de água oscila entre 8 e 14 unidades no viewBox 100, fogo entre 13 e 21. Filtros ficam restritos a 100 × 100 unidades e atualizam no máximo 30 vezes por segundo, sem atualizar estado React por quadro. São efeitos procedurais, não simulação física de fluidos. Documentação técnica consultada: [feDisplacementMap, MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap).

Água recebe ondulações em fases diferentes; fogo recebe brasas ascendentes; rocha levita sem deformar e tem quatro fragmentos texturizados em ritmos defasados; ar gira em 10 segundos com uma camada externa em sentido oposto a cada 14 segundos. Imagens originais não foram modificadas.

Hover e foco agora param somente a trajetória. Os materiais continuam animados para permitir observar os detalhes. Pausa explícita/posicionamento manual suspendem todos os efeitos; movimento reduzido também remove deslocamento de textura. Fora da área visível/aba oculta, rAF e CSS param. Retomada preserva os tempos acumulados e descarta tempo da aba oculta. Heroes continuam estáticos.

Não houve inspeção renderizada, medição de FPS ou teste de compatibilidade de filtros em dispositivos; esses itens continuam necessários após liberação do navegador.

## Refinamento 0.1.38 — abandono da distorção

Usuário avaliou 0.1.37 como distorções, não movimento natural. A implementação de feTurbulence/feDisplacementMap foi removida, junto dos transforms que esticavam o fogo. Texturas WebP originais intactas; renderizador `src/components/elemental/material-effects.ts` desenha somente uma camada Canvas 2D transparente sobre os assets.

Água: faixas de reflexão curvas atravessam a superfície esférica com luminosidade suave; cinco gotas acompanham uma trajetória elíptica. Fogo: dezoito plumas estreitam e sobem com fases/velocidades diferentes, mais dez brasas; envelope de opacidade com seno ao quadrado evita saltos no reinício de partículas. Ar: seis correntes com circulação coerente, sem duas cópias da imagem em sentidos contrários. Terra: seis fragmentos texturizados com recortes em runtime, shading e ordem por profundidade; fragmentos posteriores são omitidos ao passar pelo núcleo. A rocha não se deforma.

Tempo acumulado independente da trajetória, sem sorteio aleatório por frame; pausa não avança o relógio. Canvas limitados a DPR 2 e dimensionados por ResizeObserver. O mesmo requestAnimationFrame controla as quatro superfícies e a órbita; não há estado React atualizado por frame. CSS de movimento reduzido oculta a camada de efeitos e o loop não inicia. Sem dependências, créditos de geração, upload ou novo serviço externo. Capacidades de geração de vídeo foram apenas consultadas no catálogo, não utilizadas.

`node --test tests/elemental/material-effects.test.mjs`: três testes passam, cobrindo geometria/alpha/estado em 481 instantes por material, repetibilidade do mesmo instante, mudança ao avançar o tempo, limite DPR e fallback sem contexto 2D. Contexto Canvas simulado; não renderiza pixels e não comprova naturalidade, compatibilidade ou FPS.

Usuário declarou remover bloqueios e autorizou acesso total; nova tentativa pela mesma ferramenta foi novamente recusada por preferência salva para localhost. Não houve uso de outro browser/porta/CDP/automação indireta. Validação visual permanece pendente, sem alegação de qualidade aprovada pelo executor.
