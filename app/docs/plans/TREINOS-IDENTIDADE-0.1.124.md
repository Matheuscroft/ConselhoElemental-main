# T01 — identidade elemental de Treinos — 0.1.124

06/11/2026. Astro Boy, execução e custódia sequenciais, Sol Alto solicitado por Fábio. Checkout `codex/fitness-ui-integration`, base `be78b1e`; alterações anteriores preservadas. Pedido: substituir símbolos antiquados e aproximar Treinos da identidade visual do app antes da fase GymMane. A captura enviada pelo usuário orientou o diagnóstico do catálogo com escudos duplicados.

## Entrega

- `FitnessGlyph.tsx`: 45 SVGs originais de regiões/músculos, modalidades, equipamentos e Terra; traço consistente, cor herdada, versão decorativa ou nome acessível. Sem recortes raster, emoji, dependência nova ou arte de terceiros. [Prancha PNG](evidence/treinos-identidade-0.1.124/icones.png), [SVG](evidence/treinos-identidade-0.1.124/icones.svg).
- Aliases de `WorkoutReferenceIcons` preservam os imports existentes, agora usando os SVGs. `CATEGORY_ICONS`, metadados de regiões/foco, cartões de treino, editor, widget em Ciclos, histórico e resumo de XP usam a mesma família. A escolha do foco ainda dá um voto por exercício e desempata pela ordem do treino.
- Catálogo: regiões com ícone e nome; músculos/equipamentos/contração em “Refinar exercícios”; resumo de filtros ativos e ação “Limpar filtros”. Mantidas as combinações OR dentro do filtro e AND entre filtros, inclusão opcional de músculos secundários e seleção do objeto de exercício original.
- Linhas permitem duas linhas de nome e descrição, com texto completo no nome acessível/atributo title. Metadados sem emoji duplicado. Filtros têm alvo mínimo de 44px e foco visível.
- Casca, cartões, selos, abas, FAB, botões, cabeçalhos e hero aproximados do ouro/vidro escuro elemental. Títulos de navegação em tipografia de exibição; dados e métricas seguem legíveis. Gráfico de tendência usa dourado; cores semânticas de saúde/conclusão preservadas. CSS limitado a classes do módulo; movimento reduzido e cores forçadas contemplados nos novos controles.

## Limites de domínio e publicação

Sem alterar stores, tipos, conteúdo/IDs dos catálogos, cálculos, economia, registro de séries, sessões, histórico ou dados pessoais. Nenhum backend do GymMane ou asset GPL/CC foi incorporado. A análise G01 continua separada, conforme [plano](GYMMANE-AVALIACAO-INTEGRACAO-2026-11-05.md).

Versão sincronizada em package/lock/changelog: 0.1.123 → **0.1.124**. Auditor local de restauração revisado para esse produtor. O formato permanece `schemaVersion:1`; nenhum dado é migrado por essa mudança.

`20261106031901_account_archive_version_124.sql` é **somente candidato local**, gerado por `supabase migration new`. Atualiza exclusivamente o produtor aceito pelo validador; exige hash da revisão 123 e gate fechado. Nenhuma migração preexistente foi reescrita. Testado em PostgreSQL PGlite em memória, incluindo rejeição com gate aberto, reaplicação indevida, aceitação 123/124 e preservação dos bytes de um arquivo 120 armazenado. Os candidatos 123/124 precisam de revisão/aplicação em escopo hospedado próprio, antes da liberação de escrita. Não executar `db push` indiscriminado da pasta histórica.

`ACCOUNT_TRANSFER_WRITES_RELEASED` e `RESTORE_WRITES_RELEASED` seguem `false`. Sem SQL remoto, secrets/.env, conta/sessão real, transferência pessoal, commit, push ou deploy.

## Verificações executadas

- 4 testes novos de apresentação: cobertura vetorial/nomes acessíveis e aliases; foco por voto/desempate; filtros combinados/músculos secundários/reset/callback exato e catálogo intacto; nome acessível completo das linhas.
- 5 testes direcionados de identidade + compatibilidade de versão passaram. Após os últimos ajustes cosméticos no editor, 8 testes de identidade/ações de séries passaram e TypeScript foi repetido.
- **665 testes completos**, 0 falhas, 0 pulados, concorrência 4 (76,07s): `node --test --test-concurrency=4 tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- `tsc -b`, `npm run lint`, build Vite com `envDir:false`, diff-check e comparação SHA com o snapshot de início. Build mantém avisos preexistentes de chunks grandes/Browserslist. Resultado final e hashes em [verificacoes.json](evidence/treinos-identidade-0.1.124/verificacoes.json).
- Prancha dos 45 desenhos renderizada localmente com Sharp e inspecionada. Isso verifica os desenhos, **não** o layout ou interações do app em navegador.

TypeScript detectou inicialmente uma colisão do atributo SVG `name` com a chave tipada do glifo; corrigida na composição de props antes das verificações finais. Inspeção de fonte encontrou e removeu também os emojis restantes no resumo de XP do editor e o aviso de segurança, agora um ícone vetorial.

## Aceite e retomada

Implementação e validação local concluídas; **aceite visual no app/mobile pendente**. O navegador já tinha acesso local recusado por permissão salva; não houve nova liberação neste pedido, nova tentativa nem contorno por outro driver. A captura do usuário e a prancha própria não comprovam uso em 360/390/768px.

Próxima rodada: Sol Médio para conferir catálogo, seleção de modalidade, editor, treino ativo/descanso, resumo e histórico em 360/390px e tablet quando a inspeção estiver disponível, preservando atividades pessoais. Depois retomar G01 pelo fechamento de licença/escopo/paridade/piloto (Astra Médio ou Sol Alto). F6/conta e fragmentos não foram concluídos por este lote. Antes de publicar, atualizar o inventário H01 e revisar todos os arquivos novos/dependências da entrega integrada.

Custódia documental feita pelo próprio Astro Boy, sem subagente: versão, links, escopo, testes e limites separados; fila única e continuidade atualizadas, reservas T01 encerradas. Relatórios anteriores continuam históricos.
