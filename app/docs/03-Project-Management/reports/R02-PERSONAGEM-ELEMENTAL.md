# R02 — corpo elemental e órbita

21/10/2026. Refinamento visual solicitado por Fábio. Interpretação aplicada: usar o manequim de Treinos → Corpo como referência do personagem da prévia `/previa-elemental`. O asset e a interface de medidas Fitness permanecem intactos.

## Arte

- Fonte: `public/fitness/body/mannequin-front-v1.png`, inspecionada antes da edição.
- Resultado: `public/sanctuary/elemental-body-v1.png`, 913 × 1723, canal alpha presente. Gerado pela ferramenta integrada image_gen, sem CLI ou credenciais. Inspeção visual da arte gerada realizada; não equivale a inspeção da página.
- Corpo humano frontal preservado, vestes em obsidiana/dourado e cristal luminoso; símbolos não embutidos na imagem para manter os quatro links independentes.
- A arte é decorativa: não representa equipamentos adquiridos, medidas reais ou atributos do perfil.

Prompt final usado:

> Use case: style-transfer. Edit target: the supplied front-facing white sports mannequin. Asset type: transparent full-body character for an elemental magic personal-gamification app. Preserve the adult human proportions, frontal pose, relaxed arms slightly separated from torso, full visible head, hands and feet, and neutral sculptural face. Adapt its surface and fitted clothing into a refined elemental mage: pearl-silver porcelain body, fitted dark obsidian tunic and trousers with subtle antique gold geometric seams and restrained teal light at the chest. Keep the human silhouette clearly readable, elegant and grounded. No oversized head, no pointed hat, no staff, no cape hiding the body, no weapons. Center one full body vertically with small transparent margins. Soft studio rendering and careful clean edges suitable for a dark UI. Transparent background with real alpha, no scene, no ground or pedestal, no cast background shadow, no words, no watermark. Do not draw orbiting symbols: the four elements will be separate interactive UI controls.

## Interação implementada

Órbita elíptica de 48 segundos, posições calculadas sem atualizar estado React a cada quadro e com transforms de contêineres. Corpo e rótulos permanecem na vertical. Botão de pausa/retomada; aproximação com mouse e foco de teclado suspendem o movimento; toque pausa até retomada explícita. Preferência de movimento reduzido mantém portais estáticos. O loop é suspenso fora da área visível e em aba oculta; cleanup cancela o frame e observadores.

Links, áreas, leitura dos stores e ficha visual de equipamentos usam o fluxo anterior. Sem Canvas 3D nesta composição. A home vigente não foi promovida automaticamente.

## Validação

Resultados atuais registrados em `docs/CONTINUIDADE.md` e `docs/FILA-ENTREGAS.md`. A validação visual/interativa da página e de seus alvos em 360/390/768/1440px continua pendente: bloqueio salvo de localhost já informado pela ferramenta. Não se usou automação alternativa para contorná-lo.

## Refinamento 0.1.35 — anel em profundidade

Direção reforçada pelo usuário em 21/10/2026. Referência [Carousel Ring](https://www.scrolltide.co/#c-carousel-ring) aberta e inspecionada no navegador interno: roda inclinada, rotação e sobreposição por profundidade. Somente prévia pública e descrição foram consultadas; não houve acesso a conteúdo pago.

Adaptação própria com quatro portais legíveis: projeção elíptica estreita e inclinada na altura do corpo, escala pela profundidade, opacidade discreta e z-index recalculado por quadro. O corpo ocupa a camada central e oculta os portais posteriores. Foco de teclado eleva o portal à frente; o corpo intercepta toques em sua área para evitar ativar links escondidos atrás. Setas deslocam um quarto de volta e pausam, permitindo explorar todos os elementos sem depender da animação. Movimentos automáticos continuam desativados com movimento reduzido.

Aprovação da direção pelo usuário não equivale a validação de navegador pelo executor. Comparação visual e testes de oclusão/hitboxes da página permanecem pendentes.

## Assets 0.1.36

Os quatro portais receberam artes realistas e movimentos próprios. Origem, prompts e limites em [R02-ASSETS-ELEMENTAIS.md](R02-ASSETS-ELEMENTAIS.md).
