# T04 — superfícies e fluxos auxiliares de Treinos — 0.1.128

06/11/2026. Astro Boy, execução/custódia sequenciais. Branch `codex/fitness-ui-integration`, base local `c0e4827`/0.1.127, sem alterações locais na entrada. Fábio enviou captura da ficha de Corrida contínua ainda com fundo/botão violeta e pediu varredura das áreas antigas. Esta atualização é **local e posterior ao PR #1**, que continua com a entrega 0.1.127; não houve nova publicação neste lote.

## Diagnóstico e escopo

Busca por marcadores da paleta antiga em 455 arquivos TS/TSX/CSS do app, com inventário de 90 arquivos nas famílias Fitness/workout e páginas fitness. A captura e a fonte confirmaram hardcodes em CSS próprio da ficha/editor e regras de portais em index.css; esses caminhos não herdavam integralmente a atualização dos cartões da T01/T02. Os marcadores fixos #8582f2/#b9b6ff/#c4c1ff/#a5a2ff apareciam em cinco arquivos na base e não aparecem mais na busca de fonte após a correção.

A busca global não equivale a revisar visualmente todas as abas. A implementação desta rodada cobre os remanescentes identificados no módulo Treinos e seus componentes auxiliares compartilhados, sem repaginar indiscriminadamente páginas não relacionadas ou cores semânticas de saúde/risco.

## O que foi modernizado

| Área | Ajuste |
| --- | --- |
| Fichas de exercícios | Uma apresentação para entradas default/fitness, tokens elementais no próprio portal, título/ícone/dados de nível alinhados, categoria/família sem repetição, instruções em etapas legíveis e seções recolhíveis. |
| Ação da ficha | Rodapé separado do corpo rolável, com CTA de adicionar visível na área de ações e safe area. Mesmo objeto e callback existentes. Ficha de consulta omite a ação. |
| Criar/editar treino | CSS do editor nativo/legado com vidro escuro/ouro, campos em 16px, foco dourado, séries/estimativa/seleção/calendário/popover alinhados; salvar com hierarquia de ação primária em ambas as entradas. |
| Sequências e conversão em Ciclos | Diálogos com tema compartilhado de portal, seleção/checkbox dourados e alvos de ordenação maiores; salvar, ativar/desativar e recorrência intactos. |
| Avaliação corporal | A mesma apresentação nas duas variantes, campos/labels mais legíveis e ação alinhada; validações, valores e retorno de foco preservados. |
| Sessão ativa | Confirmações com o tema de diálogo; risco/descarte continuam com tratamento semântico vermelho e comandos anteriores. |
| Componentes Fitness anteriores | Botões, cartões, selos e escolha de modalidade aproximados do kit elemental sem trocar APIs ou migração de consumidores. |
| Gráficos/widgets | Tendência e destaques de ação em dourado; dados, valores e cores semânticas de saúde/conclusão preservados. |
| Acessibilidade | Sheet aceita closeLabel e usa “Fechar” como padrão; a ficha informa “Fechar ficha do exercício”, com descrição acessível. Foco, campos móveis, checkboxes/radios e movimento reduzido tratados nos estilos alterados. |

Instruções, descrição/foco, nome alternativo, nível/duração, respiração, benefícios, variações, contraindicações, perfis de Yoga/musculação e distribuição muscular continuam disponíveis. A composição duplicada foi reduzida sem descartar o conteúdo das fichas. A correção é visual/de navegação local, não uma nova orientação de treino nem mudança de fórmula.

## Verificações executadas

- **670 testes completos**, zero falhas/pulados, concorrência 4 (75,27s): `node --test --test-concurrency=4 tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- **14 testes direcionados** com compatibilidade de versão passaram (5,91s). Dois casos novos da ficha verificam conteúdo das duas variantes, distribuição/nomes acessíveis, categoria sem duplicação, objeto original entregue pelo CTA, leitura sem ação e delegação do fechamento. As primitivas de Sheet são substituídas nesses testes; eles não comprovam focus trap/scroll no navegador.
- `tsc -b`, ESLint e build Vite `envDir:false` passaram. Após os últimos ajustes apenas de cor/alvo dos controles de sequência, foram repetidos **13 testes de apresentação/ações**, lint e build (12,13s). Suíte completa anterior permanece atribuída à execução descrita, sem inventar nova rodada completa.
- O TypeScript detectou um delimitador JSX excedente durante a edição inicial da classe do diálogo corporal; corrigido antes das verificações finais.
- Diff-check, inventário de fonte, links, versões e comparação SHA com `/tmp/treinos-t04-before.json`. [Inspeção e paths alterados](evidence/treinos-superficies-0.1.128/inspecao.json), [resumo final](evidence/treinos-superficies-0.1.128/verificacoes.json).
- Build mantém os avisos anteriores de chunks grandes e Browserslist. Sem dependência nova, leitura de .env ou dados pessoais.

## Preservação e compatibilidade

Stores, tipos, constantes de catálogo e helpers de cálculo/Fitness preservados por comparação SHA. Comandos de salvar/adicionar/concluir, IDs, perfis, recibos e regras de progressão não foram substituídos. O rótulo de fechar compartilhado é mudança textual; demais estilos globais alterados são seletivos para .fitness-dialog.

Versão/lock/changelog 0.1.128. O auditor aceita o produtor mantendo schemaVersion:1; `20261106041510_account_archive_version_128.sql` é candidato **somente local**, gerado pelo CLI e condicionado ao hash da revisão 127/gate fechado. Testado apenas em PostgreSQL PGlite em memória; preserva arquivos antigos e gates. Migrações preexistentes não foram reescritas/aplicadas. Os gates de conta/restauração/lembretes continuam false. Nenhum banco remoto, sessão, atividade pessoal, commit/push/deploy neste lote.

## Aceite e retomada

Captura fornecida usada para diagnóstico, junto do código. Inspeção local segue negada por permissão salva, sem nova autorização material neste pedido; não houve nova tentativa nem contorno por outro driver. Não há screenshots novas do app ou aceite em 360/390px/tablet. Componentes presentes/build aprovado não substituem essa etapa.

Próximo aceite visual: ficha de Corrida/Calistenia e Yoga/musculação; adicionar → criar/editar; séries e calendário; sequência → Ciclos; avaliação corporal; confirmação de sessão; gráficos/histórico. Conferir teclado, rolagem interna/rodapé, botão de fechar, orientação e retorno de foco com dados temporários quando a inspeção estiver disponível. A família de componentes antiga permanece por compatibilidade; novas telas devem preferir fitness-kit e tokens elementais, sem criar outro tema de portal.

F6/conta pessoal, fragmentos e GymMane continuam nos respectivos planos. Se for publicar esta rodada, atualizar inventário/repasse do PR #1; este relatório não autoriza merge/deploy/SQL remoto. Custódia feita pelo Astro Boy: versão, evidências e limites separados, fila única/continuidade atualizadas; reservas T04 encerradas após conferência final.
