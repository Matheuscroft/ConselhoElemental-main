# R12-A — piloto visual da trilha

23/10/2026 · versão 0.1.49 · base `987e09e` · `codex/fitness-ui-integration`.

**Implementado localmente, em revisão visual.** Fábio confirmou o início do piloto. Escopo executado: apresentação do mapa compartilhado; QuestHub/QuestComposer foram inspecionados, seus handlers e arquivos permanecem intactos. A nova apresentação aparece em Rituais; uma Jornada abre esse percurso pelo seu botão “Explorar trilha de quests”. O catálogo de Jornadas ainda não recebeu R12-C.

## Tradução da referência

A peça principal é o percurso: nós em relevo de 72 × 66 px, curva alternada e seleção com anel. Detalhes mantêm largura estável, enquanto somente o botão do nó acompanha a curva. Labels completos ficam centrados abaixo do selo; detalhe alinhado à largura do mapa. Preservei Cinzel/Inter, fundo elemental e as quatro cores existentes. Evitei importar o fundo branco, fontes ou cores de marca do kit. Painel usa espaçamento adaptável; CTA interno de 48 px e raio de 13 px seguem proporções inspecionadas no Figma.

Tokens reutilizados: canvas `#080b12`, surface `#141b27`, text `#f2efe7`, gold `#d5b66f`; estados usam a cor do elemento da trilha. Não representam uma previsão do elemento de futuros fragmentos. O tema de cada atividade e a distribuição de pontos continuam no domínio atual.

Estados distintos: próxima sugestão, seleção, concluído, disponível e referência indisponível. Hábitos mantêm símbolo e texto próprios. Conectores não recebem eventos e ficam fora da árvore acessível. Todas as etapas continuam selecionáveis; selecionar não inicia timer. Detalhes têm IDs que incluem a chave da trilha. Um snapshot antigo concluído, mas sem referência atual, não recebe tratamento visual de conclusão.

Movimento: resposta curta ao toque/hover e abertura de detalhe em 220 ms, sem loops decorativos. `prefers-reduced-motion` remove animação e deslocamento de pressão/hover. Fluidez real ainda precisa de inspeção no dispositivo.

## Fontes preservadas

- [JSON original da extração](references/figma-gamificacao-extracao.json): 51 entradas de tokens/conteúdo e oito contextos selecionados.
- [CSS de referência](references/figma-gamificacao-referencia.css): 41 cores extraídas.

Cópias conferidas byte a byte contra os arquivos fornecidos em `/tmp`. São documentação, não imports de produção. Código gerado pelo Figma é referência, não CSS original do Duolingo; valores de vidas/gemas/contadores são exemplos. URLs de assets podem expirar e não são dependências do app. Nenhum vídeo ou dado de conta foi incorporado.

Mapa de uso: `track`/`tooltip` orientam QuestTrailMap neste lote; `completion`/`quest-summary` orientarão QuestHub em R12-B; `planning` orientará QuestComposer em R12-C. `streak` e desafios aguardam contratos de R12-D/E. Não copiar módulos fora do escopo para alegar uso integral do kit.

## Verificações executadas

- `node --test tests/quests/*.test.mjs tests/elemental/*.test.mjs`: **49/49 passaram**. Inclui três casos adicionais: vínculo único dos painéis entre trilhas, referência removida e 100 etapas/títulos completos. Testes de unidade/callbacks/SSR, não browser.
- `./node_modules/.bin/tsc -b`: passou.
- `npm run lint`: passou sem erros ou avisos.
- Build pela API Vite com `envDir:false`: passou, 23,80 s; avisos de chunks acima de 500 kB e base Browserslist desatualizada permanecem. Não houve leitura de secrets pelo build.
- `git diff --check`: passou; links dos planos e três posições de versão conferidos. Diff contra HEAD vazio nos diretórios de domínio/backend, QuestHub, QuestComposer, quest-commands e quest-path.
- Tentativa real de selecionar a aba localhost via navegador interno: recusada pela política por preferência salva. Sem contorno por outra superfície. Sem screenshots, verificação de foco real, overflow ou matriz mobile.

Logs locais: `/tmp/r12-a-tests.log` e `/tmp/r12-a-build.log`. Manifests/changelog sincronizados em 0.1.49; não há import da versão nos arquivos `src` segundo busca executada. Revisão documental pelo coordenador; independente pendente.

## Próximo passo

QA em 360/390/768/1440 px, zoom 200%, teclado/foco, seleção rápida, texto longo e movimento reduzido; aceitar visualmente antes de declarar R12-A concluído. Depois R12-B (painel/recibo) e R12-C (catálogo/compositor), preservando timers e comandos atuais. Carteira e regra de streak continuam fora deste piloto. Sem commit/push/deploy.
