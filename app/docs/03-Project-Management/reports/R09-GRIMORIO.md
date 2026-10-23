# R09 — Grimório, personagem e histórico / 0.1.46

22/10/2026. Astro Boy, execução e revisão sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Pedido: modernizar o Grimório a partir das duas capturas das 15:07, unificar personagem/status e oferecer acompanhamento de evolução e histórico. Alterações anteriores preservadas; sem publicação.

## Diagnóstico e direção

A página herdava o mago 3D de AppLayout e apresentava novamente avatar, nome e experiência no conteúdo. Isso produzia dois personagens, dois painéis de progressão e uma primeira dobra extensa. As capturas documentam esse estado anterior; não são evidência do resultado final.

A direção mantém a identidade já aprovada: obsidiana (#090d15), superfície azul escura (#151c29), texto marfim (#eeece5), ouro (#d7b86d), água (#7dcfe5), com acentos específicos para vitalidade e cada elemento. Cinzel em títulos, Inter nos controles existentes. A ficha concentra o destaque visual; indicadores e histórico têm menos decoração. A imagem é o corpo elemental aprovado do Santuário, e não um novo personagem ou inventário.

No mobile, retrato compacto ao lado da identidade e recursos ocupando a largura disponível. Em áreas de conteúdo maiores, retrato à esquerda e ficha à direita. Container queries usam a largura real após a sidebar, evitando tratar a largura total de um tablet como espaço disponível para o conteúdo.

## Entrega

- **Ficha única:** `AppLayout showAura={false}` impede o painel 3D antigo nesta rota. O componente compartilhado não foi modificado/removido. Um nome, retrato elemental, título, nível, dias consecutivos, recorde e início da jornada.
- **Recursos em vidro:** HP, Stamina, Prana e experiência com leitura numérica, barras translúcidas, reflexo breve ao montar, luz localizada e transição ao alterar o valor. Sem partículas contínuas, WebGL adicional ou deformação de imagens. Movimento reduzido desativa os efeitos locais.
- **Identidade:** edição de nome por formulário e seleção do ícone pessoal continuam chamando `updateUser` pelos mesmos handlers. Cancelar nome não grava. Diálogos com rótulos explícitos e retorno de foco aos botões de origem; estado local reiniciado na troca de conta por chave. Catálogo AVATARS e ícone já escolhido preservados; emojis pessoais ficam na seleção, sem repetir um mago gigante na ficha.
- **Navegação:** índice Personagem/Elementos/Histórico; atalhos reais a Rituais, Ciclos e Santuário; métricas anteriores compactadas. “Ciclos cadastrados” descreve corretamente `habits.length`, sem presumir um filtro de ativos.
- **Maestria:** quatro Showcases com assets existentes, título/nível de cada elemento e expansão nativa por clique/teclado. Detalhes revelam XP, próximo nível, pontos e participação no equilíbrio. Em zero pontos, a UI explica a ausência de pontuação, em vez de sugerir que o padrão de 25% do getter é conquista. Radar anterior preservado, agora opcional e dourado, com descrição textual; nenhuma nova fórmula de progressão.
- **Histórico:** projeção somente leitura dos logs, tarefas/ações concluídas e conclusões de hábitos, incluindo filhos. Busca ignora acentos e combina termos; filtros por tipo e últimos 7/30 dias do calendário local; 20 registros inicialmente e botão para mais. Cada registro abre seu estado e tempo. Estados vazios orientam a próxima ação.

## Fontes, integridade e limites de domínio

Nível geral e elemental vêm de `getLevelProgress` / `getMasteryProgress`, que usam o LevelingCalculatorService existente. Os recursos usam `getResourceSnapshot` do workoutStore, como o Santuário; HP mantém exatamente a expressão de AppLayout. O relógio local de minuto/retorno de visibilidade apenas atualiza leituras dependentes da data; não substitui `tickTimer` nem fontes de tempo de pontuação.

`history.ts` não estima recompensas nem datas. Logs usam `executedValue`, `actualTimeMinutes` e `timestamp`. Fallbacks usam somente `completedScore`, `completedAt` e valores já registrados nas conclusões de hábitos. Dados ausentes aparecem como não registrados, sem recorrer a `baseValue`, `updatedAt` ou pontuação planejada. A ordenação põe datas conhecidas recentes primeiro e registros sem data ao final. Filtros de período excluem registros sem data; “Todo o histórico” os mantém.

Logs e representações legadas da mesma conclusão são reconciliados para apresentação: ID de conclusão, sujeito/data local ou filhos explicitamente concluídos no log. Uma execução parcial não apaga a conclusão posterior do sujeito. Registros canônicos repetidos pelo mesmo ID aparecem uma vez. Não se soma essa lista para obter XP/Prana/pontos totais: ela não é um novo ledger nem uma reconstrução completa de eventos que o app não armazenou. Jornadas/obras sem log/data de conclusão próprios não recebem eventos inventados; inventário/badges inexistentes no contrato atual do store também não são fabricados.

Consultados o índice de origem `docs-conselho-master/README.md`, o motor de pontuação/energia e o capítulo versionado `docs/02-Platform-Architecture/05-Grimorio-e-Perfil.md` (o capítulo específico de Grimório não existe na pasta externa de origem). Divergências existentes permanecem explícitas: o serviço atual trunca XP ao calcular sua projeção, apesar do contrato documental de precisão decimal; o HUD usa o snapshot legado de recursos, enquanto conclusões nativas também registram `user.pranaLevel`. Esta entrega não reconciliou nem alterou essas regras. Eventual correção exige escopo de domínio e autorização própria.

## Verificações executadas

- TypeScript: `./node_modules/.bin/tsc -b`, passou.
- ESLint em `src/pages/Grimorio.tsx` e `src/components/grimorio`: zero erros e zero avisos.
- `node --test tests/grimorio/*.test.mjs tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`: 67/67 testes. São 18 novos de unidade/SSR: deduplicação nativa/legada, execuções parciais/filhos, campos ausentes, imutabilidade, zero/fração, ordenação, filtros de texto/tipo, limites de datas/virada de ano, ARIA dos recursos, limites visuais, estados vazios, paginação inicial, escape de conteúdo e maestria com navegação. Sem navegador ou dados reais.
- Build Vite via API com `envDir:false`: passou em 7,64 s. Avisos existentes de Browserslist/chunks grandes permanecem; não é medição de desempenho no dispositivo.
- SHA-256 comparado com o início deste lote: 64 arquivos de stores/lib/constants/services/types/Supabase idênticos. Entre todos os arquivos preexistentes de `src`/Supabase capturados, somente `src/pages/Grimorio.tsx` mudou. Os demais arquivos de código deste lote são novos em `components/grimorio` e `pages/grimorio.css`.
- AST: os dois handlers de gravação e sete derivações anteriores de nível/XP/estatísticas/radar são idênticos. Expressão de HP idêntica à de AppLayout. AppLayout, Fitness, stores e serviços intocados.
- Diff-check e sincronização das três posições de versão dos manifests em 0.1.46 conferidos ao encerrar. Dependências preservadas.

Evidências temporárias: `/tmp/r046-before.json`, `/tmp/r046-Grimorio.tsx`, `/tmp/r046-preserve.cjs`, `/tmp/r046-preserve.log` e `/tmp/r046-{tests,grimorio-tests,tsc,lint,build}.log`. Arquivos temporários podem não existir em outra sessão/máquina. Os testes versionados ficam em `tests/grimorio/`. Revisão React delimitada: derivados sem store paralelo, entradas escapadas pelo React, imagens com fallback, detalhes nativos, labels/foco, listas limitadas e efeito de atualização com cleanup.

## QA pendente e retomada

A nova tentativa CUA no navegador interno em `http://127.0.0.1:5173/grimorio` foi recusada pela preferência salva, apesar da autorização humana. Nenhum contorno por outra superfície, porta, CDP ou renderização indireta foi executado. Não declarar fidelidade visual, fluidez medida, teste de hitbox ou fluxo de persistência aprovado no navegador.

Após liberação efetiva: conferir 360/390/768/1440, nomes longos, imagem carregada/fallback, vidro/contraste, expansão dos quatro elementos, radar reaberto, índice/links, teclado virtual, editar/salvar/cancelar nome, seleção de ícone, troca de conta com diálogo aberto, filtros e “Mostrar mais”, dados vazios/legados/nativos, atualização após conclusão/Undo e virada do dia. Verificar safe area e ausência de sobreposição da navegação inferior. Usar dados isolados e preservar a conta real. O QA dos lotes anteriores permanece pendente conforme a fila.

R09: implementado localmente, em revisão visual. Reservas encerradas. Continuidade e revisão documental executadas pelo coordenador; revisão independente não realizada. Sem secrets, alterações de backend/fórmulas/persistência, dados reais modificados, novas dependências, deploy, commit ou push.
