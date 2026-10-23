# R05 — Temporal, Lua e Estações / 0.1.42

Data: 22/10/2026. Execução e revisão documental sequenciais por Astro Boy, no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Alterações preexistentes preservadas. Entrega local; não é publicação nem aceite visual.

## Escopo e decisões de UX

A identidade aprovada segue a paleta escura/dourada, tipografia e controles elementais. `TemporalLayout` reúne Semana, Mês, Ano, Calendário, Lua e Estações com destinos reais e indicação da aba ativa. AppLayout e seu tick existente permanecem; nenhum segundo relógio de pontuação foi criado.

- **Expanded Cards em Estações:** quatro capítulos, com botão explícito de expansão, apenas um painel aberto, datas e convite de reflexão. Em telas menores a composição é vertical. Não depende de hover. Adaptação autoral do [padrão de referência](https://www.scrolltide.co/#c-expanded-cards), sem copiar código privado.
- **Showcase nos meses do Ano:** cada cartão apresenta métricas existentes, detalhes recolhíveis e acesso ao mês exato. Não inventa percentuais nem recompensas. Adaptação do [padrão Showcase](https://www.scrolltide.co/#c-showcase-card). As aplicações anteriores em Pilares, Jornadas e Grandes Obras permanecem.
- **Ano:** hierarquia mais clara, resumo antes das entradas, navegação por ano e ações com texto. Criação, edição, conclusão e reabertura continuam nos handlers anteriores.
- **Mês:** endereço `/temporal/mes?mes=YYYY-MM` permite abrir o mês escolhido no Ano, recarregar e navegar pelo histórico. Navegação anterior/próxima passa pela URL; seletores e métricas preservados. Não houve reformulação completa do conteúdo de Mês, Semana ou Calendário.

## Lua: fonte, tempo e visualização

`lunar-presentation.ts` usa Astronomy Engine 2.1.19, já instalada, para fase, fração iluminada, distância e próximas quatro fases principais. `useLiveDate` atualiza a cada minuto visível, ao retornar à aba ou focar a janela; há atualização manual. Horários são apresentados no fuso do dispositivo. Não se exige localização nem conexão com serviço astronômico.

`MoonScene.tsx` carrega sob demanda uma esfera Three.js, textura de cor e relevo local, material rugoso e luz direcional vinculada ao ângulo da fase. O hemisfério gira a vista de referência; não representa a inclinação exata da Lua no céu do observador, libração ou relevo para medição científica. Não há rotação decorativa que contrarie a face lunar. DPR limitado a 1,5; renderização sob demanda por tempo, tamanho ou carregamento, sem loop contínuo. Não foi medido desempenho real.

Mapas do [CGI Moon Kit da NASA](https://svs.gsfc.nasa.gov/4720/), sem alteração: `lroc-color-2k.jpg` (2048 × 1024; 457.942 bytes) e `ldem-height-1k.jpg` (1024 × 512; 111.552 bytes), total 569.494 bytes. Origem e créditos em `public/temporal/moon/CREDITS.txt`. A textura de cor isolada foi inspecionada; isso não verifica o resultado da cena.

SVG simplificado mantém a geometria iluminada enquanto carrega ou se WebGL/texturas falharem. Informações textuais ficam fora do canvas. Fallback inicial conferido por SSR; falha real de GPU, perda de contexto e texturas não foram simuladas em navegador.

**Divergência registrada:** o helper legado `getMoonPhase` em constants continua intacto e aproximado. A página Lua passa a usar efemérides para apresentação, podendo diferir de outros consumidores perto das transições. Não unificar helpers nem migrar consumidores como efeito colateral deste lote. Nenhuma informação astronômica foi ligada a XP, Prana ou persistência.

## Estações e preservação

As datas continuam derivadas do `getSeason` existente, por leitura das transições de seu calendário. A página informa que as datas são aproximadas; não foram substituídas por equinócios/solstícios astronômicos. Hemisfério usa a preferência existente quando válida; seleção é apenas estado da página, sem nova gravação ou pedido de geolocalização. Paisagens dos cartões são ilustrações CSS, não fotografias.

Comparação SHA-256 com a linha de base desta etapa: **63 arquivos protegidos idênticos**. Trecho de regras/handlers antes do render de Ano e bloco de seletores/métricas de Mês idênticos às cópias iniciais; alterações de Mês limitadas a apresentação/navegação. Backend, stores, constants, lib, serviços, Supabase e fórmulas não foram editados neste lote. Nenhuma dependência nova, secret, migração, deploy, commit ou push.

## Verificações executadas

- `npx tsc -b`: passou.
- ESLint delimitado às páginas Temporal/Lua/Estações e novos componentes: zero erros; dois avisos de dependências de `useMemo` em Ano e Mês. Os mesmos avisos foram reproduzidos nas cópias iniciais, sem supressão ou mudança de cálculo.
- `node --test tests/elemental/*.test.mjs tests/temporal/*.test.mjs`: **28/28**, incluindo 19 testes anteriores e nove novos. São testes Node numéricos, lifecycle simulado e SSR; não testes de UI no navegador.
- `TZ=America/New_York node --test tests/temporal/*.test.mjs`: **9/9** novamente; variação de fuso, não nove casos adicionais.
- Novos testes: quatro fases publicadas pelo [USNO](https://aa.usno.navy.mil/calculated/moon/phases?date=2024-4-08&format=p&nump=5&submit=Get+Data) com tolerância de dois minutos; iluminação/distância; geometria projetada da luz; evolução pelo horário; estações nos dois hemisférios e virada do ano; mês por URL; atualização/limpeza do relógio; marcação dos cartões e fallback inicial. Não validam pixels ou execução de WebGL.
- Build pela API Vite com `envDir:false`: passou, 4.591 módulos, 8,25 s. Avisos de Browserslist desatualizado e chunks grandes. `MoonScene` separado; biblioteca Three compartilhada continua grande. Sem benchmark de carregamento.
- Dimensões por `sips`, hashes de preservação e comparação dos trechos existentes executados. Evidência temporária: `/tmp/r042-preservation.json`, `/tmp/r042-build.log`; não pressupor disponibilidade futura desses arquivos.

- Fechamento: `git diff --check`, whitespace/conflitos dos arquivos novos, três campos de versão 0.1.42, referências do relatório no índice/continuidade/fila/manual/dossiê e paridade SHA-256 dos dois mapas e créditos entre public/dist passaram.

## Limites e próxima etapa

Bloqueio salvo do navegador local permanece registrado apesar da autorização humana anterior. Não houve nova tentativa ou contorno nesta etapa. **Não executados:** screenshots do app, inspeção renderizada, hitboxes, matriz 360/390/768/1440, interação real por toque/teclado, fluxo de edição anual, WebGL/GPU, avaliação de fluidez, performance ou backend remoto.

Próximo lote: conferir Lua/Estações/Ano visualmente quando a ferramenta permitir; depois refinar conteúdo e estados de Semana/Mês/Calendário e acessibilidade do editor anual existente. O alcance transversal do tema não significa que todas as abas estejam finalizadas. Preservar os handlers e separar qualquer mudança de domínio. Reservas desta etapa encerradas; revisão independente de documentação pendente.
