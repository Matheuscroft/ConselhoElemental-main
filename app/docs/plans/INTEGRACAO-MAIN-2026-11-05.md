# Integração local da main — 05/11/2026

## Escopo e custódia

Pedido: pull de Matheuscroft/ConselhoElemental-main/main e correção de incompatibilidades entre os trabalhos. Astro Boy sequencial. Checkout codex/fitness-ui-integration; base b11ed9d85bc000e9b8fb0eb48de0d8f647823b0b, remoto incorporado be78b1e8f4c5f378ff2efade69753b86bd19b2da. Sem push, deploy, SQL remoto, leitura de .env/credenciais ou acesso a dados do navegador.

Fetch encontrou dois commits: 3026e75 (catálogos/editor de treino) e be78b1e (Ciclos). Pull --ff-only avançou o HEAD para be78b1e. Trabalho local foi guardado no stash **c41b2bdcf6035566a0ca259f777a770c39d55f39**, mantido após reaplicação. Contém arquivos do checkout, não o progresso pessoal de localStorage. Não reaplicar sobre esta mescla: repetiria alterações. Para recuperação, comparar o snapshot em checkout separado preservando esta pasta.

Baseline SHA em `/tmp/conselho-merge-20261105-before.json`: 339 caminhos. Revisão de produto antes da custódia final: 318 idênticos, 20 reconciliados e somente CycleStreakBadge removido conforme a decisão remota; original preservado no stash. Evidência `/tmp/conselho-merge-20261105-review.json`; /tmp é temporário. Migrações 120/121/122 idênticas byte a byte e ancestralidade remota conferidas.

## Decisões de mescla

- Treinos: catálogos ampliados de Calistenia, Yoga, Musculação e esportes, descrições/perfis/filtros, editor recolhido e salvar sem iniciar mantidos. Feedback, movimento e isolamento locais coexistem. IDs/planos/históricos existentes preservados.
- Ciclos: checkbox junto ao nome, chevrons de filhos, badges e edição contextual remotos mantidos. Não restaurados ranking/badge de streak retirados da main; cálculo local de constância nas datas programadas e histórico preservados.
- Ciclos locais: calendário/data na URL, recorrência mensal/anual/personalizada, contadores genéricos diários, XP por conclusão válida, reversão por recibo, recuperação retroativa e feedback preservados. Contagem extra segue informativa, conclusão separada.
- Editor: trecho remoto remanescente sobrescrevia recorrência por DAILY. Corrigido: editar nome preserva agenda; alterações explícitas são validadas; subitem herda frequência e não grava recorrência própria. Tipos, integridade área/subárea e rascunho da sequência mantidos.
- Backup: auditor antigo rejeitava obliques/serratus/tibialis, origem musculacao e propriedades opcionais undefined antes da serialização. Compatibilizado aos tipos atuais, com Record exaustivo de grupos musculares. Valores inválidos/null e grupos desconhecidos continuam rejeitados, sem reparo dos dados ou recálculo de recompensas.
- Testes: contexto do handler real de edição atualizado; assertivas antigas de rótulos alinhadas ao componente remoto. JWT expirado sintético da F6 corrigido para base64url válido, sem Auth real.
- Documentos de ambos os lados preservados; entradas históricas descrevem a própria entrega, não o estado atual.

## Versão e compatibilidade de conta

Produto/lock/auditor local **0.1.123**, arquivo schema 1. A main estava em 0.1.70; mantida a linha local posterior sem rebaixar versão.

CLI criou `20261106022901_account_archive_version_123.sql` (timestamp UTC; data do usuário 05/11). **Candidato local, não aplicado** neste pull. Só estende produtor aceito pelo validador privado, condicionado ao hash exato do corpo 122 e gate fechado. SQL instalado/esquema/gates intactos. PGlite testa cadeia local completa. Banco hospedado não consultado nem alterado; última evidência histórica é suporte até 122. Conferir/aplicar compatibilidade no escopo de ativação antes de liberar conta. Não executar db push da pasta histórica.

## F6 preservada e ainda parcial

Retomada após reload estava em andamento. Helpers, consentimento separado, identidade/vínculo, sessionStorage até 12h e esquecer acesso foram preservados. Gates false. Testes sintéticos da mescla não comprovam Auth hospedado, nova conta vazia, migração pessoal, concorrência real entre abas ou celular/tablet. Nenhuma sessão pessoal acessada.

## Validação desta integração

- Diagnóstico inicial: 658 testes, 495 aprovados/163 falhos, principalmente pela incompatibilidade compartilhada do catálogo/auditor; TypeScript/lint também identificaram import obsoleto após a mescla. Corrigidos, sem descartar testes.
- Compatibilidade dirigida: 35/35 aprovados em 3,26s, incluindo backup/catálogos, recibos/contadores, versão SQL em PGlite, sessão resumível sintética e handler real da agenda. `/tmp/conselho-merge-compat.log`.
- Primeira suíte ampla após correções: 660/661; única falha em fixture que criava hábito na data atual mas solicitava ocorrência anterior ao início. A fixture ganhou início explícito em outubro; não alterado o filtro do produto. Os 10 testes do arquivo passaram (2,66s), mais ESLint direcionado. `/tmp/conselho-merge-reminder-fix.log` e `...reminder-lint.log`.
- **Final: 661/661, sem skips, 45,46s**, comando `node --test --test-concurrency=4 tests/**/*.test.mjs scripts/astro-boy.test.mjs`. `/tmp/conselho-merge-release-tests.log`.
- **TypeScript:** tsc -b, exit 0. **Lint:** npm run lint, exit 0, sem erros/avisos ESLint; teste alterado posteriormente também passou no lint direcionado. Logs `/tmp/conselho-merge-final-types.log` e `...final-lint.log`.
- **Build:** API Vite com envDir:false, exit 0 em 54,32s, sem ler arquivos .env. `/tmp/conselho-merge-final-build.log`. Permanecem avisos de chunks acima de 500 kB e caniuse-lite antigo; otimização futura não executada aqui.
- Git diff --check, index sem conflitos/staging, ancestralidade e ls-remote confirmaram HEAD/remoto be78b1e. Snapshot local preservado; nenhuma alteração remota publicada.
- Cenários Auth/SDK/HTTP/storage/SQL são sintéticos. Nenhuma inspeção visual, navegador/celular/tablet real, Auth hospedado ou transferência de progresso pessoal validada. Permissão salva do navegador não foi contornada.

Revisão de versionamento/documentação cumprida sequencialmente: manifests/lock/whitelist 123 alinhados, testes da cadeia SQL candidata preservam arquivos 120/121/122 e escrita fechada. Continuidade/fila/manual/dossiê/repasse/changelog/índices atualizados e links novos conferidos. Reservas encerradas.

## Próximo passo

Fechar revisão F6 e aceite hospedado essencial em Sol Alto: login/cadastro/confirmar/recuperar/reload/saída, conta nova sem conteúdo de terceiros, readback/recibos e redirects. Depois preparar liberação e associação pessoal com cópia integral conferida. Matheus recebe repasse documental; Fábio segue frontend/mobile. Sem nova fórmula ou ativação automática de escrita.
