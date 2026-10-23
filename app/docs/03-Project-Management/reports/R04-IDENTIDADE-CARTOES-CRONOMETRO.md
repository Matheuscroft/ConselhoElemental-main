# Identidade compartilhada, navegação, cartões e cronômetro — 0.1.40

Lote iniciado em 21/10 e encerramento em 22/10/2026, horário de referência America/Recife. Checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Astro Boy executou em sequência; fila operacional em [FILA-ENTREGAS.md](../../FILA-ENTREGAS.md).

## Diretriz aprovada

Usuário determinou que a identidade da prévia R02 seja a identidade de **todo o app, cada aba e detalhe**, com refinamento posterior. A autorização é de UX/UI; backend, lógica, cálculos e dados de Matheus permanecem preservados. Aprovação da direção não atesta QA de todas as telas.

Base: obsidiana #080b12, superfície #141b27, camada elevada #202b3a, texto #f2efe7, secundário #aab4c4, dourado #d5b66f. Ação preenchida usa bronze #79613a para manter texto claro legível. Cinzel identifica títulos; Inter atende leitura, navegação e números tabulares. Elementos usam acentos próprios; cores e IDs de domínio não foram regravados.

`src/styles/elemental-theme.css` define tokens e apresentação compartilhada. `tailwind.config.cjs` conecta aliases existentes (mystic/Fitness e semânticos de componentes) à paleta, preservando nomes usados pelas telas. `main.tsx` importa o tema após os estilos existentes e reduz a intensidade/corrige cores do fundo Aurora por props. Superfícies glass, abas, foco, progressos e sliders adotam a base comum. Isso **não equivale à reformulação detalhada ou validação renderizada de cada aba**; cores inline, componentes específicos, gráficos, sombras antigas e telas de execução ainda precisam de revisão.

## Referências inspecionadas e decisões de UX

| Referência pública | Observação atual | Aplicação autoral | Adaptação ao app |
|---|---|---|---|
| [Expanded Cards](https://www.scrolltide.co/#c-expanded-cards) | Trilho de cartões estreitos; item expande e desloca vizinhos; texto descrito como largura estável. Screenshot do preview público consultado no navegador interno. | `ExpandedElements` no seletor superior de Pilares. | Um painel aberto, botões com nome/aria-expanded e ação Explorar. Clique/foco explícitos, sem exigir hover. Trilho horizontal em desktop amplo, coluna em até 1100px para não comprimir a área ao lado da sidebar. Texto com largura final no trilho; movimento reduzido remove transição. |
| [Showcase Card](https://www.scrolltide.co/#c-showcase-card) | Cartão abre resumo, tags e descrição. Preview público foi clicado e a expansão observada. | `ShowcaseCard` nas listas de Jornadas e Grandes Obras. | Expansão nativa `details/summary`, seguida de Abrir detalhes que chama o fluxo anterior. Dados existentes, sem blur sobre texto necessário; arte ornamental própria CSS. Não transforma abrir um cartão em concluir/alterar entidade. |

Nenhum prompt pago, código comercial ou mídia do site foi copiado. As referências orientam interação; implementação local independente. O anel R02 continua como protagonista da prévia, sem substituir sua interação por outro carrossel. Cards expansíveis não foram aplicados a comandos de execução rápida, onde esconder ações acrescentaria etapas desnecessárias.

## O que mudou

- **Cronômetro:** `ElementalTimer` substitui somente o corpo visual dos modais simples de Rituais e Ciclos. Mostra tempo fornecido pelo formatador anterior, estado rodando/pausado, planejamento/esforço já exibidos e botões textuais Pausar/Retomar/Concluir. Não contém store, intervalo, cálculo de recompensa, duração nova ou persistência. Animação ornamental para ao pausar e com movimento reduzido. `role=timer` não anuncia cada segundo por live region assertiva.
- **Comportamento preservado:** Ciclos mantém a regra anterior de encerrar ao fechar seu modal; Rituais mantém seu comportamento anterior. Não unificamos esses contratos por decisão de design. `handleStopAndComplete`, operações de pausa/retomada e arredondamentos existentes permanecem. Cronômetros especializados de execução de Ciclos e Fitness não foram substituídos neste lote.
- **Prévia:** agora também monta o mesmo intervalo de 1000 ms chamando `tickTimer`, com cleanup, enquanto essa casca independente está ativa. AppLayout e FitnessPageShell continuam intactos. Não há compensação por relógio de parede, segundo contador nem alteração de `tickTimer`; paridade durante navegação/pausa ainda requer browser. Início/conclusão de rituais na home nova ainda não integrados.
- **Pilares:** ExpandedElements usa os scores existentes e abre o mesmo modal pelo `setSelectedElement`. Detalhamento e demais ações da tela preservados.
- **Jornadas/Grandes Obras:** Showcase conserva título, descrição, área, contagens, status, progresso, recompensa e prazo de Jornada quando disponível. Abrir detalhes usa os callbacks existentes. Formulários, criação, vínculos e modais detalhados intactos.
- **Navegação:** AllRoutesSheet ganha busca sem distinção de acento, resultado vazio recuperável, grupos sem seções vazias e alvos maiores. Busca encontra destinos específicos de Treinos (Corpo, Histórico etc.) usando o registro existente; lista sem busca mantém a entrada Treinos consolidada. A prévia passa a abrir o mesmo painel pelo botão Explorar em desktop/mobile. Registro de rotas e seus destinos não foram alterados.

## Verificações executadas e limites

- `npx tsc -b`: passou após remoção de imports que ficaram sem uso.
- ESLint delimitado às páginas/componentes alterados: 0 erros, 2 avisos de dependências de hooks em Ciclos. A cópia inicial de Ciclos foi analisada via stdin para separar os avisos preexistentes. Não corrigimos esses handlers neste lote visual.
- `node --test tests/elemental/*.test.mjs`: **12/12**. Seis casos de navegação/filtros/busca em memória, três numéricos de materiais, três de apresentação SSR/árvore React e encaminhamento dos callbacks. Não é interação DOM real nem integração com stores/Auth.
- Build Vite por API com `envDir:false`: passou, sem leitura de `.env`; avisos existentes de Browserslist/chunks grandes. Não é teste de performance ou funcionamento remoto.
- SHA-256: **63 arquivos** de stores, tipos, constantes, lib, serviços, funções/migrações locais idênticos à linha de base do lote. **57 handlers** das quatro páginas comparados por AST, sem alteração. Artefatos temporários: `/tmp/r04-domain-before.json`, `/tmp/r04-before-*.tsx`, `/tmp/r04-preservation-result.json`.
- Contraste calculado de cinco pares de cores opacas: texto/canvas 17,13:1; secundário/superfície 8,25:1; dourado/superfície 8,84:1; texto/ação 5,10:1; escuro/dourado 10,08:1. Não mede transparência, composição real, todos os estados ou contraste final do app.
- Versões, whitespace, links documentais e diff-check conferidos no fechamento da continuidade.

A nova tentativa de acesso a localhost, depois da autorização expressa, foi recusada pela preferência salva da ferramenta. Sem contorno por outra porta/browser/CDP/renderização indireta. Não executados: screenshots do app, matriz responsiva, foco/toque/teclado reais, timers/reload no app, gravação de conclusão, performance/FPS e testes remotos. As capturas inspecionadas são da referência pública, não do produto. Não declarar excelência visual comprovada ou regressão funcional integral aprovada.

Sem secrets, nova dependência, deploy, migração, commit ou push. Revisão documental pelo coordenador; independente pendente.

## Retomada por famílias

| Família | Já entregue | Próxima verificação/integração |
|---|---|---|
| Santuário | Prévia R02/R03, navegação completa, continuidade do tick existente | Início/retomada/conclusão sem sobrescrever sessão; paridade antes de promover home |
| Pilares | Expanded Cards e base visual | Hitboxes, teclado, quatro escolhas, breakpoint com sidebar e modal |
| Rituais/Ciclos | Novo cronômetro simples | Abrir/pausar/retomar/concluir/cancelar, tempo e recompensa iguais; tratar execução avançada em lote próprio |
| Jornadas/Grandes Obras | Showcase Cards | Abrir/fechar, detalhe, criação e vínculos; dados reais e vazios |
| Fitness | Base de tokens alinhada | Revisar quatro abas e execução sem alterar medidas, relógios, recibos ou contratos de Matheus |
| Invocar/Forja/Grimório/Temporal e demais | Base compartilhada | Refinamento por tela e regressão I03; manter todos os recursos acessíveis |

A próxima tarefa começa pelo estado Git e fila, não pela repetição do diagnóstico. Manter identidade aprovada, preservar todos os handlers e separar apresentação de regras. Browser continua dependência de QA; não repetir pedido genérico de permissão já concedida. A sequência R04–R08 segue na fila única; esta tabela documenta alcance e não cria estados concorrentes.
