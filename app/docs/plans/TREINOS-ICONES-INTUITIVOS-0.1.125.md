# T02 — ícones intuitivos de Treinos — 0.1.125

06/11/2026. Astro Boy, Sol Alto, execução/custódia sequenciais. Base `be78b1e`, branch `codex/fitness-ui-integration`. Fábio reprovou os ícones T01 por baixa identificação. Esta revisão substitui a proposta visual anterior; não declara aceite do usuário.

## O que mudou

Os mesmos 45 nomes/APIs agora resolvem para ilustrações de 32px com duas tonalidades. Anatomia esquemática usa o contexto de um corpo humano em cinza e a região de interesse preenchida em dourado. Cabeça/tronco/braços contextualizam membros superiores; quadril/pernas contextualizam membros inferiores. Modalidades mostram pessoas em movimento ou objetos reconhecíveis; equipamentos ganharam volumes/preenchimentos e traços mais diretos. Removidos os motivos abstratos que competiam com o significado.

Definições vetoriais em `fitness-glyph-data.ts`, composição/acessibilidade em `FitnessGlyph.tsx`. Nenhum nome de ícone é gravado em dados. APIs `FITNESS_ICONS`, aliases e nomes acessíveis preservados. SVGs locais, sem imagem externa, recorte raster, dependência nova ou arte de terceiros.

Selos pequenos agora reservam 48px com símbolo de 28px; filtros principais usam 28px e nome abaixo. “Todos” ocupa uma linha e as seis regiões ficam agrupadas. Refinamentos usam 24–26px. Editor recebe rótulos visíveis para cada região, além dos nomes acessíveis. Focos de treinos/exercícios/widgets usam escala maior e ouro consistente; XP continua com suas cores semânticas.

## Evidência visual

- [Prévia resumida](evidence/treinos-icones-0.1.125/previa.png).
- [Todos os 45 desenhos, em 48/32/24px](evidence/treinos-icones-0.1.125/prancha.png), [fonte SVG](evidence/treinos-icones-0.1.125/prancha.svg).
- Renderização local com Sharp, sem navegador. Prancha inspecionada; áreas corporais e equipamentos avaliados em comparação de tamanho. A inspeção motivou tornar o halter horizontal/com anilhas e diferenciar as placas da barra.
- Essas pranchas são ilustrações dos ícones, **não screenshots do app**. Não comprovam usabilidade real, entendimento por terceiros ou layout em celular. A permissão salva do navegador local continua bloqueada; não foi tentado contorno nem nova inspeção sem mudança dessa condição. Aceite visual permanece com Fábio.

## Preservação e compatibilidade

Revisão de apresentação. Mesmos catálogos, IDs, seleção, filtros, callbacks, stores, tipos, cálculos e histórico. Comparação SHA com `/tmp/treinos-t02-before.json`; detalhes em [verificacoes.json](evidence/treinos-icones-0.1.125/verificacoes.json). Trabalho anterior mantido.

Versão 0.1.124 → 0.1.125 em package/lock/changelog. Formato do backup segue schemaVersion:1. Auditor local aceita o produtor 125; `20261106033034_account_archive_version_125.sql`, gerado pelo CLI, é candidato **somente local**. Exige revisão/hash 124 e gate fechado, sem reescrever arquivos de migração anteriores. Testado somente em PGlite em memória; produtor 125 rejeitado antes da revisão e aceito depois, bytes antigos e gate fechado preservados.

Compatibilidades candidatas 123/124/125 continuam sem aplicação hospedada neste lote. Não usar `db push` indiscriminado da pasta histórica. Gates de transferência/restauração permanecem false; nenhum banco remoto, secret/.env, sessão ou progresso pessoal acessado. Sem commit/push/deploy. GymMane/F6 não foram implementados por esta revisão.

## Verificações desta revisão

- **9 testes direcionados passaram**, 0 falhas/pulados (4,03s): `node --test tests/elemental/fitness-identity.test.mjs tests/elemental/fitness-actions.test.mjs tests/backup/account-version.test.mjs`.
- Cobertura: cada modalidade/músculo/região encontra SVG local; contexto/área destacada presentes; acessibilidade/aliases; votos de foco e desempate; combinações de filtro/reset/callback com objeto original; nomes completos; confirmação/erro de ações de séries; compatibilidade de backup em PostgreSQL sintético.
- `tsc -b`, `npm run lint`, build Vite `envDir:false` (14,30s) e diff-check passaram. Avisos de chunks grandes/Browserslist permanecem. Sem dependências instaladas ou leitura de `.env`.
- A suíte completa de 665 testes pertence a T01; **não foi repetida nem atribuída a esta revisão**. Código de domínio preservado e verificações concentradas no escopo alterado.

## Retomada e custódia

Apresentar a nova família para avaliação de Fábio. Sol Médio é suficiente para eventual ajuste visual delimitado e aceite mobile, quando houver inspeção disponível. Não iniciar port GymMane por inferência; seguir G01 após fechamento de licença/escopo/piloto. Conta/F6 e fragmentos continuam nas frentes anteriores.

Versão, links, evidências e preservação revisados pelo Astro Boy; fila única/continuidade atualizadas e reservas T02 encerradas. Inventário H01 é anterior e precisa ser atualizado antes de publicação futura. Registros de T01 preservados como histórico da proposta reprovada visualmente.
