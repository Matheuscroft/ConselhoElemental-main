# R22 — descoberta mobile em Ciclos, Pilares e Mapa

24/10/2026. Versão local **0.1.62**, branch `codex/fitness-ui-integration`, base publicada `91fa5a5`. Astro Boy sequencial; frontend de Fábio, backend de Matheus preservado. Inclui [R21 — ícones](R21-ICONES-NAVEGACAO.md). R15–R20 preexistentes mantidos.

## Decisões de UX e resultado implementado

O pedido mantém a direção visual já aprovada: magia elemental, Expanded Cards e Showcase. A adaptação usa expansão vertical no celular, evitando colunas estreitas, texto girado e dependência de hover. Artes existentes, superfície escura, acentos elementais, tipografia e símbolos próprios foram reutilizados; nenhuma biblioteca instalada.

### Ciclos

- Atalho no início abre a seção de pontuação, leva foco ao summary e respeita movimento reduzido.
- Novo modo `explorer` do ScoreHierarchyPanel delega somente a apresentação a ElementScoreExplorer. Os modos anteriores e os demais consumidores continuam disponíveis.
- Cada elemento é um cartão ilustrado expansível com valor legível e barra comparativa. O detalhamento abre áreas e subáreas no mesmo cartão; nomes longos podem quebrar linha.
- Total e descrição explicitam o histórico acumulado de rituais/ciclos, independentemente da data selecionada. Barras não são apresentadas como metas nem progressão percentual de conclusão.
- Estados sem pontuação e áreas sem subáreas têm mensagens próprias. Nenhuma recompensa nova é calculada.

### Pilares

- Os quatro elementos aparecem antes das estatísticas, com arte e contagem de áreas/áreas ativas visíveis mesmo fechados.
- Um cartão por vez revela descrição e link real para a rota existente do elemento; tocar novamente recolhe.
- Equilíbrio permanece disponível em disclosure secundário com todos os valores existentes. Atalhos Gerenciar áreas e Criar ritual preservados.

### Mapa de páginas

- Busca por nome, descrição e categoria, sem sensibilidade a acentos; filtros combináveis por grupo e limpeza explícita.
- As quatro categorias abrem como cartões ilustrados. Busca/filtro revela os destinos correspondentes, sem depender de abrir cada grupo manualmente.
- Showcase por destino com ícone próprio, explicação e botão de acesso. Os 26 destinos e os estados reais fornecidos pelos stores são mantidos.
- Chips técnicos antigos e strings de rotas foram retirados desta UI. A ajuda secundária mantém os nomes dos fluxos e sua origem; nada foi removido do roteamento.
- Caso vazio permite recuperar todas as páginas.

## Mobile, acessibilidade e limites

Controles novos de 48px ou maiores, input de busca 16px, nomes com quebra, foco visível, controles nativos, IDs únicos de disclosure, painéis recolhidos com inert/aria-hidden e movimento reduzido. Duas colunas dependem de **620px de conteúdo disponível**, via container queries; a largura da janela sozinha não força duas colunas em tablets com sidebar. Sem animação contínua ou captura de gesto do usuário.

Esses pontos foram inspecionados no código, **não medidos em navegador**. O bloqueio de acesso registrado nos lotes anteriores não foi contornado. Permanecem pendentes viewport 360/390/768px, teclado, zoom, foco após rolagem, toque, leitura assistiva e sobreposição com a navegação inferior. Não há declaração de experiência mobile aprovada por evidência renderizada.

## Verificações realmente executadas

- `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs`: **125/125 passaram**. Log `/tmp/conselho-r22-tests-final.log`.
- Três novos testes cobrem busca/categorias/destinos, ícones distintos e apresentação de pontos fracionários com expansão controlada/IDs. Dois testes anteriores foram adaptados à navegação por Link e ao estado inicial fechado de Pilares. A primeira execução falhou nesses dois testes por ausência de MemoryRouter; depois da adaptação a suíte completa passou. Testes SSR não simulam toque/rolagem reais.
- `tsc -b`: passou, `/tmp/conselho-r22-tsc.log`.
- `npm run lint`: passou, `/tmp/conselho-r22-lint-final.log`.
- Build Vite com `envDir:false`: passou em **19,70s**, `/tmp/conselho-r22-build.log`. Avisos de chunks grandes/Browserslist permanecem; não houve leitura de .env pelo Vite neste comando.
- Comparação AST com snapshots anteriores: **21** inicializadores/handlers de ScoreHierarchyPanel, **154** de Ciclos, **6** de Pilares e **5** de Mapa idênticos. Exclusões previstas: navegação imperativa substituída por Link em Pilares; metadados/chips de apresentação antigos de Mapa. Script `/tmp/conselho-r22-audit.mjs`.
- Diff de stores/types/lib/backend vazio. Versões sincronizadas e `git diff --check` conferidos no encerramento.
- Revisão React pelo próprio executor: hooks incondicionais, valores derivados sem effects, nenhuma nova leitura de store, nova persistência, import pesado ou dependência de serviço externo. Revisão independente não executada.

## Continuidade

Reservas encerradas. Sem commit, push, deploy, migração ou comunicação externa. Próximo passo: aceite visual das três telas e navegação no celular; seguir demais áreas conforme orientação de Fábio. Problema legado de desvínculo de subáreas R19 e contratos de fragmentos/constância permanecem para revisão com Matheus, sem alterações neste lote.
