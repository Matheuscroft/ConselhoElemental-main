# R23 — Domínios agrupado e compacto

24/10/2026. **0.1.63 local**, base publicada `91fa5a5`, branch `codex/fitness-ui-integration`. Astro Boy sequencial. R15–R22 preservados. Fábio pediu reduzir a lista extensa de cartões repetidos mostrada na captura enviada.

## Entrega

- Catálogo inicial organizado em até quatro grupos: Terra, Fogo, Água e Ar. Grupos sem resultados não aparecem. Abre um por vez, com contagem e prévia dos nomes quando recolhido.
- Cada área vira uma linha compacta com nome, pontos/rituais existentes e link direto. Não há paginação ou corte de áreas; todos os resultados ficam disponíveis.
- Busca e filtro de elemento revelam diretamente as linhas correspondentes, sem um segundo toque para abri-las.
- **Gerenciar vínculos** habilita os comandos existentes de vincular/desvincular. O uso padrão prioriza navegar; ações de gestão deixam de se repetir em todos os cartões. O controle de gestão permanece montado em estado vazio para preservar o foco após um vínculo remover o último resultado.
- O grupo aberto fica no parâmetro opcional `grupo` da URL, validado contra os quatro elementos. Retorno do detalhe conserva grupo, filtros e busca. Isso preserva o contexto, não uma posição exata de pixel/linha.
- Rail elemental e Showcase do detalhe aprovados anteriormente preservados. Formulários, valores, IDs, stores, cálculos e comandos de vínculo não foram alterados.

## Apresentação e acessibilidade

Coluna única com largura fluida, alvos de 48px para gestão e cabeçalhos de grupo/linhas maiores; nomes completos com quebra, prévias recolhidas com elipse. Cabeçalhos usam botões com aria-expanded/aria-controls e regiões fechadas usam hidden. Busca/elemento selecionado usa cabeçalho simples, sem controle de expansão desnecessário. Ícones decorativos; links nomeados por área. Movimento segue a preferência reduzida já existente em Domínios.

Revisão React pelo próprio executor: agrupamento derivado das áreas fornecidas, estado de gestão local, sem effects, dependências novas ou gravação paralela. Somente o callback existente executa mudanças de vínculo mediante ação explícita. Sem revisão independente.

## Evidências executadas

- 8 testes direcionados de catálogo/navegação passaram.
- Suíte completa: **128/128 testes Node passaram**, `/tmp/conselho-r23-tests.log`.
- TypeScript e lint passaram: `/tmp/conselho-r23-tsc-final.log`, `/tmp/conselho-r23-lint.log`.
- Build Vite com `envDir:false` passou em **17,21s**, `/tmp/conselho-r23-build.log`. Avisos preexistentes de chunks grandes/Browserslist permanecem.
- Comparação AST com `/tmp/conselho-r23-Dominios-before.tsx`: **26 inicializadores/handlers existentes idênticos**, incluindo criação, vínculo e cálculos de seleção. Acrescentada apenas apresentação e estado opcional de navegação.
- Diff de stores/types/lib/backend vazio, manifests sincronizados e `git diff --check` conferido.
- Testes novos cobrem agrupamento, recuperação de todas as áreas, estados filtrados, valores fracionários e retorno seguro com grupo aberto. São testes Node/SSR, não evidência de interação ou dimensões reais no navegador.

## Pendências e retomada

QA visual 360/390/768px, rolagem, expansão por toque/teclado, ida/volta pelo detalhe e modo de gestão com dados isolados ainda pendentes. Nenhum contorno ao bloqueio anterior de navegador. Não afirmar redução percentual de altura ou aceite visual sem medição.

Reservas encerradas; continuidade atualizada pelo coordenador. Sem commit/push, deploy, migração ou alterações do backend. A pendência R19 sobre primeiro desvínculo de subárea e os contratos de fragmentos/constância continuam para Matheus; não foram tratados neste lote.
