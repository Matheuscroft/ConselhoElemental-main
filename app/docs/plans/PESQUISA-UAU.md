# Pesquisa para a passada UAU (vidro, movimento, referências)

Feita no navegador interno em 15/11/2026. As ferramentas de busca na web falharam na sessão; estas são as fontes lidas.

## O que a pesquisa estabeleceu

1. **Liquid Glass (Apple, WWDC 2025) na web.** O efeito é refração (lei de Snell) da luz numa borda curva, mais um realce especular. Recriação: mapa de deslocamento SVG (`feDisplacementMap`, R = x, G = y, neutro 128) calculado a partir de uma função de superfície **convexa** (côncava empurra raios para fora do objeto e exige amostrar fora dele). Fonte: kube.io, "Liquid Glass in the Browser: Refraction with CSS and SVG" (set/2025).
2. **Limite crítico de plataforma:** filtro SVG usado como `backdrop-filter` só funciona no **Chrome**. No iPhone (Safari) a refração real **não funciona**. No Safari só valem desfoque, saturação, brilho e camadas de luz por cima. Qualquer efeito de refração deve ser um *aprimoramento progressivo* (Chrome/desktop) com o vidro de desfoque como base que já precisa ficar bonito sozinho.
3. **Animações guiadas por rolagem** (`animation-timeline: scroll()` / `view()`) estão marcadas "Baseline 2026, newly available" no MDN: disponíveis nos três motores atuais. Podem ser usadas para revelações e paralaxe sem JS, com `@supports` e fallback.
4. **Awwwards, categoria Mobile Applications:** a lista pública traz só nomes (sem técnicas). As técnicas abaixo vêm do conhecimento de referências, e devem ser tratadas como proposta a validar no aparelho.

## Técnicas candidatas (prioridade e custo)

| Técnica | Onde no Santuário | Custo |
|---|---|---|
| Coreografia de entrada em camadas (aura, mago, vidro, conteúdo) com stagger e molas | abertura do Santuário | baixo |
| Borda de luz especular de 1px que segue o ponteiro/giroscópio | altar "Seu próximo passo", cartões | baixo |
| Luz que segue o dedo dentro do vidro (radial-gradient com variáveis CSS) | altar, linhas de ritual | baixo |
| Paralaxe do mago por giroscópio/toque, com respiração | herói | médio |
| Números com contagem e barra de XP com brilho que corre | nível, XP | baixo |
| Botões magnéticos com mola e resposta ao toque | "Iniciar", "Criar ritual" | baixo |
| Revelações por rolagem com `animation-timeline: view()` | seções abaixo da dobra | baixo |
| Transições de rota com View Transitions (onde houver) | navegação | médio |
| Granulado (ruído) sutil sobre o vidro para evitar banding | todas as superfícies de vidro | baixo |
| Refração SVG só no herói, só em Chrome | cartão do nível | alto (restrito) |

## Vidro e desempenho
- Decisão do produto: vidro real (`backdrop-filter`) nas superfícies relevantes.
- Guarda atual `TETO_VIDRO = 15` em `app/tests/design/superficie.test.mjs`: soma de superfícies desfocadas no CSS. Subir o teto exige justificativa e um limite de camadas desfocadas **simultâneas na mesma tela**.
- Mitigações: `contain: paint` nos cartões, evitar blur sobre elementos animados por transform, reduzir o raio do blur em aparelhos fracos, `prefers-reduced-transparency` e `prefers-reduced-motion`.
