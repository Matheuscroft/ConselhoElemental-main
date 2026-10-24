# R12 — alinhamento de atividades com Matheus

23/10/2026 · versão 0.1.52 local · branch `codex/fitness-ui-integration` · base `987e09e`.

## Decisão de produto

Fábio solicitou aplicar o retorno de Matheus apresentado em uma captura. A captura foi lida localmente; arquivo e conversa pessoal não foram adicionados ao repositório.

| Área | Significado apresentado ao usuário |
| --- | --- |
| Rituais | Tarefas pontuais, sem repetição automática |
| Ciclos | Hábitos com dias/datas de recorrência |
| Jornadas | Quests, conquistas intermediárias organizadas em etapas |
| Grandes Obras | Projetos maiores que reúnem fases, jornadas e ações |

A documentação canônica de hierarquia e ações/hábitos foi consultada. Este alinhamento é de apresentação: não cria novas entidades nem impõe que todo ritual pertença a uma Jornada. A descrição de tarefas sem data foi interpretada como uma lista comum, distinta do calendário de hábitos; datas já existentes foram preservadas. Não houve migração, reclassificação ou alteração de regras.

## Implementado

- `/rituais` abre a lista de tarefas. `?view=trilhas` abre as trilhas; links existentes com `trilha`/`etapa` continuam válidos e `?view=lista` mantém precedência.
- Guia recolhível com as quatro áreas e links diretos; evolução elemental recolhida inicialmente para priorizar as tarefas.
- O Hub passa a se apresentar como Trilhas de conquistas. Criação de conquistas fica nos catálogos Jornadas/Grandes Obras; retirado o botão genérico de criação do Hub.
- Santuário mantém atalhos individuais e aponta “Ver trilhas” para o destino explícito. Textos dos catálogos, Ciclos e compositor reforçam a distinção.
- Criação rápida de Ritual recebe o diálogo elemental, descrição específica e rótulo associado ao campo. Handlers preservados.

## Verificações executadas

- `node --test tests/quests/*.test.mjs tests/elemental/*.test.mjs`: 56/56 passaram; inclui entrada padrão, compatibilidade dos links e guia de atividades.
- `tsc -b` e `npm run lint`: passaram; lint sem avisos.
- Build Vite com `envDir:false`: passou em 9,10 s. Avisos de chunks grandes e Browserslist antigo permanecem.
- Comparação AST com cópia anterior da página: 13 handlers de Rituais idênticos.
- Snapshot SHA256: nove fontes preexistentes de apresentação/navegação alteradas e um novo componente `ActivityGuide`. Alterações anteriores de R12 preservadas.
- Diff acumulado contra HEAD vazio em stores/lib/types/services/constants/Supabase e em quest-commands/quest-path.

Logs locais temporários: `/tmp/r12-taxonomy-tests.log`, `/tmp/r12-taxonomy-build.log`, `/tmp/r12-taxonomy-lint-final.log`. Não são artefatos versionados nem provas duráveis de execução futura.

## Limites e retomada

Sem QA renderizado nesta rodada: bloqueio salvo do navegador continua pendente, sem nova tentativa ou contorno. Testes e build não comprovam aparência, fluidez ou navegação real. Conferir tarefas → criação, guia, Santuário → trilha, catálogos → trilha, mobile/teclado/zoom e movimento reduzido.

Próximo lote frontend: capítulos/detalhes de Jornadas e Grandes Obras, preservando essa separação. Streak/fragmentos seguem R12-D/E: quantidade de um fragmento aprovada, mas elegibilidade, classificação multiárea, dia/fuso, concessão/Undo e persistência ainda precisam de contrato com Matheus. Não há carteira nem recompensa fictícia.

Sem secrets, deploy, migração, commit ou push. Revisão documental feita pelo coordenador; independente pendente. Reservas encerradas. Fila única: [FILA-ENTREGAS](../FILA-ENTREGAS.md).
