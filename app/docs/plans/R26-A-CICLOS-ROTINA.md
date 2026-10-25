# R26-A — Ciclos de hoje: execução mobile

25/10/2026 · 0.1.65 local · base limpa 88c9021 · branch codex/fitness-ui-integration.

## Escopo e decisão

Fábio priorizou a captura da rotina com 13 itens e subitens aninhados. Astro Boy executou sequencialmente, preservando o trabalho de backend de Matheus. R25-A/B (backup e conta pessoal) continua pendente; este lote não exporta dados nem habilita migração.

A inspeção identificou recuo cumulativo na árvore, ações disputando largura com títulos e formulário de subitem sem rótulos visíveis. A alteração segue a identidade elemental existente, com foco em execução diária e menos controles concorrentes.

## Implementado

- Resumo do dia com quantidade concluída e barra; os números representam cartões da rotina, usando o predicado existente, não pontos ou quantidade de folhas concluídas.
- Todos, Pendentes e Feitos acessíveis em um toque. Busca, filtro de elemento, limpeza e ordenação usam o estado existente. Minha ordem e Pendentes primeiro mantêm suas regras e restrições de reordenação.
- Cartões com conclusão, título e menu no cabeçalho; metadados e subitens usam a largura do cartão. Etiquetas podem quebrar linha, sem o truncamento anterior.
- Recuo limitado na árvore; nomes, menu e expansão ocupam posições separadas. Adicionar subitem fica nomeado no menu de ações, reduzindo ícones concorrentes.
- Formulário reutilizado nos três pontos de criação: campos rotulados, cancelar explícito, envio por Enter e fechamento por Escape. O formulário usa noValidate para manter a normalização existente no comando da página, sem acrescentar restrições numéricas de domínio.
- Alvos de toque de pelo menos 44px nos controles da rotina, campos de 16px e transição curta da barra respeitando movimento reduzido.

Componentes novos: CycleRoutineToolbar e CycleSubitemComposer. Nenhum efeito, armazenamento, assinatura de store ou biblioteca nova. Revisão React: estado controlado na página, useId para rótulos, sem escritas ao renderizar. Skills frontend-design, auto-versionamento e revisão react-best-practices aplicadas.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs | 138 passaram, 0 falhas; inclui 4 testes novos |
| tsc -b | Passou |
| npm run lint | Passou |
| Vite build via API com envDir:false | Passou em 14,38s, sem carregar .env |
| Comparação AST com cópia anterior de Ciclos.tsx | 367 inicializadores preservados; excluídos componente externo e renderChildHabits, cujo JSX mudou |
| Diff de src/stores, src/services, src/types e supabase | Vazio |
| git diff --check | Passou |

Os novos testes verificam filtros sem reordenação/execução implícita, contagens independentes da busca, limpeza de filtros e rótulos/IDs únicos do formulário. São testes de componentes/SSR; não simulam toque, drag, teclado mobile ou armazenamento real.

Avisos preexistentes de chunks acima de 500 kB e base Browserslist antiga persistem. Não foi feita atualização de dependências nesta entrega.

## Limite de validação e próximo passo

A tentativa de inspeção de http://127.0.0.1:5173/ciclos foi recusada pela ferramenta de navegador por permissão salva. Nenhuma alternativa foi usada para contornar essa recusa. A evidência visual disponível é a captura fornecida pelo usuário, anterior à alteração. Não há screenshot novo nem aceite visual desta versão.

Conferir em 360/390px e 768px: títulos longos, árvores de pelo menos três níveis, etiquetas, teclado aberto, filtros sem resultados, criação/cancelamento, concluir/desmarcar, iniciar, ordenar e retorno entre datas. Usar dados isolados para testes de escrita; não concluir atividades reais apenas para validar. Verificar barra inferior e foco ao sair do menu para o formulário.

Depois, retomar R25-A (backup/restauração demonstrável), R25-B com Matheus e a validação integrada R26. R19 e R12-D/E permanecem na fila. O app inteiro não está declarado concluído.

Reservas deste lote encerradas. Revisão documental feita pelo coordenador; revisão independente pendente. Alterações locais sem commit/push/deploy. Nenhuma alteração ou cópia dos dados pessoais reais.
