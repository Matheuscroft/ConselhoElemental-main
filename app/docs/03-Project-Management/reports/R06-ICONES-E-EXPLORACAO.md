# R06 — Ícones e exploração transversal / 0.1.43

22/10/2026. Astro Boy, execução/revisão sequenciais. Checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`; alterações anteriores preservadas. Usuário aprovou explicitamente a aparência da Lua de 0.1.42. Esse aceite é do usuário, não uma inspeção do executor.

## Direção visual e escopo

A identidade aprovada permanece: canvas #090c13, superfícies #101620, dourado #d9b96e, texto #eeeae2 e acentos por elemento. Cinzel nos títulos; Inter no conteúdo e ações. Ícones usam traço vetorial de 1,6 em grade de 24 unidades, legíveis em tamanhos pequenos. Cristal facetado para Terra, chama com núcleo para Fogo, gota com onda para Água e correntes para Ar. Símbolos de atividades usam referências reconhecíveis de livro, mapa, selo, edifício e treino. O foco é compreender ações e progresso, não decifrar símbolos mágicos.

`ArcaneIcon.tsx` acrescenta 20 desenhos originais SVG, `ElementIcon` e mapeamento de `RouteIcon` para os destinos atuais. Cor herdada, dimensões explícitas, sem asset externo ou animação contínua. Por padrão são decorativos; `label` adiciona nome e role de imagem quando o ícone é informação independente. Controles comuns continuam usando Lucide, evitando tornar editar/excluir/pausar menos reconhecíveis.

Aplicação nos cartões compartilhados AreaCard, ElementCard, TaskCard, HabitCard e ScoreHierarchyPanel; páginas Rituais, Ciclos, Jornadas, Grandes Obras, Grimório, Invocar, Domínios, detalhe do domínio, Astrolábio e Onboarding; navegação lateral, mobile, Explorar, marca da home, cronômetro e Showcase. Estados vazios/de celebração selecionados também passam a SVG. São substituições na apresentação; constants, dados persistidos, avatar escolhido e texto do usuário não foram convertidos ou apagados.

**Não concluído:** ícones de fases/signos do calendário legado, focos/badges específicos de Fitness, recompensas do Cassino e outros componentes especializados ainda precisam de migração contextual. Não declarar que todos os emojis do app foram removidos. O aceite da Lua não autoriza substituir sua superfície ou seus dados neste lote; ela permaneceu intacta.

## Onde os padrões entram

Adaptações autorais de [Expanded Cards](https://www.scrolltide.co/#c-expanded-cards) e [Showcase Card](https://www.scrolltide.co/#c-showcase-card). Catálogo público consultado novamente; não houve compra, cópia de conteúdo privado ou inspeção visual nova da referência nesta etapa.

| Área | Aplicação atual | Próxima revisão |
|---|---|---|
| Pilares e Estações | Expansão por elemento/estação já implementada | QA mobile e teclado |
| Menu Explorar / Mais | Grupos expansíveis com rótulo, descrição e quantidade; busca revela os grupos encontrados | Interações reais e rolagem no sheet |
| Mapa de páginas | Grupos expansíveis + Showcase de destinos: descrição, estado real quando existente e link explícito | QA de texto longo e teclado |
| Jornadas / Grandes Obras | Showcase existente recebe o selo do próprio elemento | Detalhes/formulários e estados preenchidos |
| Ano | Showcase dos meses já implementado | Planejamento completo e editor anual |
| Rituais / Ciclos | Ícones e cronômetro compartilhados; manter ações rápidas imediatamente acessíveis | Densidade de listas e detalhes secundários |
| Domínios / Grimório | Ícones vetoriais integrados; cartões e métricas existentes preservados | Showcase de área/evolução sem esconder ações essenciais |
| Fitness / Saúde | Navegação global já recebe os padrões; conteúdo interno preservado | Showcase na escolha/prévia e expansão de detalhes; séries e timer continuam diretos |
| Semana / Mês / Calendário | Casca temporal já alinhada em 0.1.42 | Conteúdo, ícones celestes legados e editor acessível |

Não transformar cada botão ou linha de série em um cartão expansível. O padrão é transversal, mas a escolha depende da tarefa: expansão revela opções/detalhes; Showcase ajuda a avaliar um destino/projeto; ações frequentes continuam diretas. Os 26 destinos do catálogo são preservados no Mapa, incluindo atalhos de Treino antes ocultados por filtro de apresentação. Rotas internas e formas alternativas de acesso ficam em disclosures, sem remover informação.

## Acessibilidade e implementação

- Navegação usa links reais em `RouteShowcase`; nome acessível identifica a página. Não inventa percentual ou progresso.
- `NavigationGroup` usa details/summary nativo, foco visível e descrição estável. Busca força exibição dos grupos encontrados; estado não é persistido.
- Cartões do Mapa passam a uma coluna em largura pequena; layout não depende de hover. Detalhes têm alvos de pelo menos 44 px e transições desativadas com movimento reduzido.
- ExpandedElements passa a IDs por instância (`useId`), evitando colisão se houver dois conjuntos na página. Removida seleção automática por foco; ativação fica no botão.
- AreaCard completo e ElementCard recebem Enter/Espaço para executar o callback existente, além do mouse. Não mudam pontuação.
- Revisão com orientações frontend-design e React best practices. Não adicionadas dependências, fetch, timers, persistência ou efeitos de domínio.

## Verificação e preservação

- `node --test tests/elemental/*.test.mjs tests/temporal/*.test.mjs`: **32/32**. Quatro casos novos de nomes/decorativos/distinção dos elementos, links e ações de todos os destinos, grupos visíveis na busca e IDs únicos em dois conjuntos de elementos. Os demais 28 permanecem. São SSR/unidade/numéricos, não navegador.
- Loader local de apresentação atualizado para resolver os novos imports. Não inicializa contas nem stores nos testes novos.
- `npx tsc -b`: passou. Build Vite por API com `envDir:false`: passou em 7,75 s; mantém avisos de Browserslist desatualizado e chunks grandes. Sem carregamento de `.env`.
- Lint dos consumidores: zero erros, dois avisos de hooks em Ciclos, também reproduzidos na cópia inicial desta etapa. Sem supressão.
- SHA-256: **64 arquivos protegidos** de stores/lib/constants/services/types/Supabase idênticos à linha de base desta etapa. Comparação AST: **114 funções nomeadas sem JSX** inalteradas nos consumidores modificados (Mapa excluído dessa comparação; seus getters/expressões de status foram preservados na inspeção do diff). Isso não prova integração remota nem todos os comportamentos do app.
- Evidências temporárias em `/tmp/r043-tests.log`, `/tmp/r043-lint.log`, `/tmp/r043-lint-baseline.log`, `/tmp/r043-preservation.json`, `/tmp/r043-build.log`; não presumir disponibilidade futura.

## Navegador e limite de aceite

Usuário pediu instruções para remover bloqueio. [Documentação oficial](https://learn.chatgpt.com/docs/browser) consultada: Configurações → Browser → Agent permissions; revisar exceção de `http://127.0.0.1:5173`, remover bloqueio ou permitir o endereço. Remover exceção restaura defaults. Não é necessário apagar cookies. Nenhuma configuração global foi lida/editada nem bloqueio contornado; liberação efetiva não confirmada neste lote.

Não executados: novo acesso ao app, screenshot, matriz 360/390/768/1440, hitboxes, interação real de teclado/toque, verificação de sheet/menus ou performance. Aceite visual informado pelo usuário se refere à Lua anterior. Esta etapa permanece pendente de revisão renderizada.

Próximo: conferir exploração/ícones renderizados após liberação, depois migrar badges especializados de Fitness e ícones celestes, e continuar conteúdo temporal/formulários. Reservas encerradas ao fechar; revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, migração, commit ou push.
