# R13 — Rituais com apresentação Showcase

23/10/2026 · 0.1.53 local · branch `codex/fitness-ui-integration` · base `987e09e`.

## Pedido e referência

Fábio pediu evolução da página mostrada na captura, usando [Showcase Card](https://www.scrolltide.co/#c-showcase-card) e vídeo de apoio. A captura é da lista de Rituais com evolução aberta. Vídeo local: 28,5705 s, 820×1652, 60 fps; inspeção por folha de contato com quadros a cada quatro segundos, não reprodução audiovisual integral. A referência mostra capa compacta que revela descrição, etiquetas e detalhes. Página pública consultada, sem extração de código premium. Arquivos pessoais e quadros não foram adicionados ao Git.

## Direção de interface

Preservada a paleta existente: fundo #080b12, superfície #141b27, texto #f2efe7, apoio #aab4c4 e ouro #d5b66f, mais acentos dos quatro elementos. Cinzel permanece nos títulos de página; títulos de tarefas usam a fonte de leitura existente. Conteúdo alinhado à esquerda.

Estrutura: título/criação → guia recolhível → busca/filtros/abas → capas de tarefas → evolução recolhível. Cada capa contém arte elemental, estado, título integral e resumo. Descrição e ferramentas ficam nos detalhes; Iniciar/Concluir/Desfazer ficam fora do acionador, sempre acessíveis. Essa separação evita que abrir um cartão dispare conclusão. O gesto visual vem da referência; texto permanece nítido para leitura.

## Implementado

- Novo `RitualShowcase`, componente de apresentação sem acesso a store: disclosure nativo, conteúdo preservado ao recolher, IDs vinculados, imagens locais decorativas e ações separadas.
- Capa com orb elemental, estado e nome completo; descrição sem truncamento nos detalhes, ferramentas de edição/ordenação/duplicação/conversão e itens mantidas.
- Revelação visual curta (opacidade/deslocamento), realce da arte e indicador de abertura. CSS respeita movimento reduzido; MotionConfig cobre os componentes Framer da página. Não há medição de FPS nem promessa de expansão de altura animada em todos os navegadores.
- Busca/filtros e abas com alvos de toque maiores; remover filtro é botão acessível. Busca sem resultado oferece limpar filtros; lista vazia cria Ritual no diálogo atual.
- Evolução após a lista com apresentação Showcase já disponível, imagens realistas e cartões compactos; dados e cálculo do painel não alterados.
- Diálogo de edição recebe o contêiner elemental. Rótulos de campos de itens e controles de conclusão/expansão melhorados.

## Verificações realmente executadas

- 56/56 testes Node existentes em quests/elemental passaram.
- `tsc -b`, `npm run lint` sem avisos e build Vite `envDir:false` passaram; build 14,45 s. Avisos de chunks grandes e Browserslist desatualizado permanecem.
- Checagem SSR nos quatro elementos: assets existentes, disclosure fechado, IDs vinculados, título escapado, ações fora do summary/details e nenhum callback executado pela renderização.
- Comparação AST: 13 handlers e três auxiliares de cálculo idênticos à cópia antes do lote.
- Snapshot SHA256: somente `src/pages/Rituais.tsx` alterado entre fontes preexistentes; novos `RitualShowcase.tsx` e `rituals.css`. Alterações R12 preservadas.
- Diff acumulado de domínio/backend/stores/services/types/constants/lib/Supabase, ScoreHierarchyPanel e comandos/projeção das quests vazio.
- Versões/manifests, links locais deste relatório e diff-check conferidos no fechamento.

Logs temporários: `/tmp/r13-tests.log`, `/tmp/r13-lint.log`, `/tmp/r13-build.log`. Não são evidência versionada nem substituem testes futuros.

## Limites e retomada

Nova tentativa direta no navegador interno foi recusada por preferência salva que bloqueia localhost, mesmo com acesso de filesystem ampliado. Nenhum contorno executado. Não houve QA renderizado, teste real de clique, comparação visual ou validação mobile nesta rodada. SSR comprova estrutura, não interação real.

QA pendente: em 360/390/768/1440 px, abrir/recolher capas, título longo, editar/adicionar/reordenar itens, timer, concluir/desfazer, limpar filtros, abrir áreas da evolução, teclado/zoom/movimento reduzido. Validar rotas `/rituais` e `/rituais?view=trilhas`; o refinamento de capas pertence à lista de Rituais, não substitui o mapa de trilhas.

Próximo: aceite visual e refinamento de capítulos/detalhes em Jornadas/Grandes Obras. Fragmentos e streak continuam dependentes de R12-D/E, sem carteira fictícia. Sem alterações em backend, fórmulas, persistência ou recorrência; sem secrets, deploy, commit/push. Revisão React/documental feita sequencialmente pelo coordenador; revisão independente pendente. Reservas encerradas. [Fila operacional](../FILA-ENTREGAS.md).
