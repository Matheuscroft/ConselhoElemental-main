# T03 — catálogo de Treinos agrupado e pesquisável — 0.1.126

06/11/2026. Pedido de Fábio: organizar os 124 exercícios para fácil acesso no celular. Astro Boy, execução/custódia sequenciais; branch `codex/fitness-ui-integration`, base `be78b1e`. Skill frontend-design aplicada à navegação do catálogo, preservando a família de ícones T02.

## Experiência implementada

A entrada deixa de montar uma lista de 124 cartões. Mostra seis grupos recolhidos com símbolo, nome, músculos presentes e contagem real:

| Região principal | Exercícios do catálogo atual |
| --- | ---: |
| Peito | 17 |
| Costas | 19 |
| Ombros | 13 |
| Braços | 35 |
| Abdômen | 5 |
| Pernas | 35 |

Só um grupo abre por vez. Começa com oito exercícios; “Ver mais” libera outros oito e “Recolher” devolve o foco ao botão do grupo sem navegação de rota. Contadores/resultados derivam do array fornecido, incluindo futuras adições; não são valores fixos da UI.

Busca direta por nome, músculo ou equipamento, sem distinção de caixa/acentos, com múltiplos termos literais. Ex.: `supino halteres`. Busca e filtros mostram os resultados diretamente, sem exigir abrir grupos; opção “Ver em lista” mantém esse modo disponível. Resultados em lista aparecem em lotes de 12. A busca só inclui músculos secundários quando a opção correspondente está marcada.

Refinamentos por região, músculo específico, equipamento e contração continuam disponíveis num painel recolhível. Limpar busca preserva os demais filtros; limpar filtros remove também o termo e retorna ao modo anterior. O grupo aberto permanece na memória do componente ao pesquisar/abrir detalhes. A busca não acessa servidor, histórico pessoal ou storage.

Controles com nomes acessíveis, disclosure por botão nativo/aria-expanded/aria-controls, IDs únicos via useId e painéis fechados realmente ocultos. Foco visível, campo de busca em 16px, safe widths e estilos específicos do catálogo. Sem animação decorativa nova.

## Dados e contrato

Agrupamento de apresentação pela primeira região muscular principal de cada exercício. Cada objeto aparece uma única vez; ordem dentro de cada grupo e referências originais preservadas. Exercício sem marcação não é descartado: aparece em “Outros exercícios”. Filtrar por músculo secundário não reclassifica o exercício nem altera seus músculos.

`catalog-navigation.ts` agrupa/pesquisa; `MuscleExerciseCatalog.tsx` mantém estado local e repassa `onSelect` com o mesmo objeto. Nenhuma mudança em stores, tipos, exercícios/IDs, planejamento, séries, pontuação, histórico ou persistência.

Versão/lock/changelog 0.1.126. Auditor de backup aceita esse produtor mantendo schemaVersion:1. Candidato `20261106033906_account_archive_version_126.sql` gerado pelo CLI, somente local; exige revisão 125/hash e gate fechado. Aceitação/rejeição de versão, bytes antigos e gate testados em PostgreSQL PGlite em memória. Migrações anteriores preservadas. Candidatos 123–126 permanecem sem aplicação hospedada neste lote; não executar db push indiscriminado da pasta histórica. Gates false, sem SQL remoto, secrets/.env, dados pessoais, commit/push/deploy ou importação GymMane.

## Evidências

- 12 testes direcionados passaram (4,61s). Três casos novos verificam os 124 exercícios reais particionados sem duplicação/perda/mutação; disclosure compacto/paginação/seleção exata/troca de grupo; busca literal com acentos/caixa/termos múltiplos/composição de filtros e opção de secundários. Cobertura anterior de ícones/ações/backup mantida.
- A primeira execução do teste de paginação detectou uma limitação do harness: ele não juntava filhos de texto/expressão no rótulo do botão. O seletor de teste foi corrigido para ler o texto composto; não houve bypass nem mudança da regra do produto para satisfazer o teste.
- **668 testes completos passaram**, 0 falhas/pulados, concorrência 4 (76,37s). TypeScript, lint e build Vite com envDir:false (36,27s) passaram; avisos preexistentes de chunk/Browserslist mantidos. Diff-check e links conferidos.
- Comparação SHA e resumo em [verificacoes.json](evidence/treinos-catalogo-0.1.126/verificacoes.json).

O navegador continua com inspeção negada por permissão salva, sem mudança de autorização neste pedido. Não houve tentativa de contorno, captura do app ou aceite mobile. Testes sintéticos não comprovam layout/fidelidade visual no dispositivo real.

## Retomada e custódia

Código e documentação concluídos após as verificações finais; reservas T03 encerradas por custódia sequencial do Astro Boy. Próximo: Fábio conferir agrupamento/busca/abertura de detalhe em Sol Médio, em 360/390px e tablet quando houver acesso à inspeção. Preservar posição ao abrir detalhes, navegação e dados pessoais. GymMane e F6 continuam nos respectivos planos. Inventário H01 precisa ser atualizado antes de publicar a entrega integrada. Astro Boy mantém a fila única; sem novos chats ou subagentes.
