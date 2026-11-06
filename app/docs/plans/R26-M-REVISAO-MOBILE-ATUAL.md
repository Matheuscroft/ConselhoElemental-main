> Atualização 29/10/2026: [R26-M2B / 0.1.107](R26-M2B-HOJE-TEMPORAL-MOBILE.md) implementou semana/agenda, mês compacto, retorno e criação rápida. Próximo **M2C, Sol Médio**, Calendário/Ano e matriz restante. Aceite visual continua pendente.

> Atualização 29/10/2026: [R26-M2A / 0.1.106](R26-M2A-AGENDA-COMPATIVEL.md) concluiu este lote de contratos/agenda. Próximo **R26-M2B, Sol Médio**, execução e planejamento mobile. Registros abaixo preservam a sequência anterior; aceite visual permanece pendente.

# R26-M — revisão mobile/tablet atual

Registro de análise/aceite, não fila paralela. Operação atual em [FILA-ENTREGAS](../FILA-ENTREGAS.md). R26-M1 entregue em código como **0.1.105**, 29/10/2026, Astro Boy/Sol Médio, checkout codex/fitness-ui-integration/base b11ed9d. As fases R25 de conta seguem fechadas para uso real; este lote não libera backend/restauração. Histórico de movimento e QA anterior em [R28-F](R28-F-REVISAO-MOBILE.md).

## Direção preservada

Paleta existente: superfícies #101721/#0c111a, borda #303b49, dourado #d5b66f, texto #eceae3 e apoio #adb8c8; Cinzel nos títulos existentes e Inter/sistema nos controles. Layout de formulário em uma coluna, campos nativos em linhas próprias e escolhas explícitas. Nenhuma nova animação/decoração; prioridade em leitura, foco e toque. Regras do produto/identidade existentes prevalecem sobre recomendações genéricas. [Princípios canônicos](../02-Platform-Architecture/07-Principios-de-UX-e-Fluxos.md).

## Achados corrigidos em código

- `src/components/backup/restore-workspace.css:41` — regra de dimensões de checkbox era aplicada a todo input de consentimento, incluindo file. Agora restrita a type=checkbox; arquivo recebe classe própria e 100% do contêiner, max-width/min-width, min-height 48px e fonte 1rem.
- `src/components/backup/AccountResolutionPanel.tsx:40` — rótulo de arquivo separado de consentimento, com campo nomeado; mantém label nativo e validação/readback/consentimentos sem alterações.
- `src/components/backup/restore-workspace.css` — foco de inputs, quebra de rótulos/valores, espaço entre ações adjacentes, detalhes com área de toque e safe areas laterais. Padding interno mais compacto até 480px; sem esconder conteúdo para mascarar overflow.
- `src/components/backup/AccountWorkspace.tsx` — nomes/autocomplete de Auth e nome da cópia; email com spellcheck desativado. Sem mudar sessão, handlers, release ou política de resolução.
- `src/components/backup/restored-local-notice.css` — nota de sync centralizada e ações com largura integral até 480px.
- `src/pages/elemental-preview.css:142` e `ElementalPreview.tsx` — busca de áreas com min-height 48px/font 16px, nome, autocomplete off, spellcheck false, placeholder com reticência e foco no grupo. Herói tolera texto longo; safe areas mobile e margem de âncora. Filtros/estado de URL/rotas e todos os conteúdos preservados.

Foram consultadas as [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Aplicadas ao escopo delimitado: rótulos, foco, conteúdo longo, controles nativos e safe areas. Isso não representa auditoria completa de todo o app. Formulários preservam bloqueios de segurança explícitos do produto, mesmo onde recomendações genéricas diferirem.

## Evidência executada

1. `node --test tests/backup/account-resolution-ui.test.mjs tests/backup/account-workspace-ui.test.mjs tests/elemental/navigation.test.mjs`: **22 aprovados** (`/tmp/r26-mobile-targeted.log`). Harness de UI e roteamento, sem browser.
2. `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **504 aprovados** (`/tmp/r26-mobile-all.log`), incluindo testes de SQL em PGlite temporário. Não acessa dados/banco reais.
3. `npx tsc -b`, `npm run lint` e build Vite via API com envDir:false aprovados; build **52,92s**, avisos existentes de bundle/Browserslist. Logs `...-types.log`, `...-lint.log`, `...-build.log`.
4. PostCSS + postcss-selector-parser existentes analisaram os três CSS alterados, com **49/15/273 regras**. É parse de sintaxe, não cálculo de layout/overflow ou captura.
5. SHA-256 contra `/tmp/r26-mobile-before.json`: stores/auth/sync, account-resolution/account-live-sync/account-transfer, cliente global/App/main preservados. Manifests atualizados e apenas whitelist de versão corrente no validador/migration ainda não aplicada. Gates false. Nenhuma dependência nova; sem deploy/push/secrets/dados pessoais.

Não foram escritos testes que simplesmente repetem este CSS; regressões funcionais existentes foram executadas. Nenhuma medição de fidelidade visual foi inferida dos testes.

## Matriz ainda pendente de navegador

| Largura | Verificações reais necessárias | Estado |
|---|---|---|
| 360px | Campos file, botões longos, leitura de escolhas, busca/filtros, navbar inferior, foco/teclado | Pendente |
| 390px | Mesmos fluxos com dados preenchidos/vazios/nomes longos e zoom | Pendente |
| 768px | Navegação/sidebar e largura dos controles, rolagem/foco | Pendente |
| 1440px | Compatibilidade/linha de leitura e nenhuma regressão dos fluxos | Pendente |

O bloqueio salvo de acesso ao app não foi contornado com outro host, porta, cliente HTTP ou browser headless. Não há capturas nem aprovação visual atual. Quando houver acesso funcional, usar dados temporários isolados e percorrer criar/editar/concluir/desfazer/navegar, antes de aceitar globalmente. Revisão estática ≠ validação em dispositivo.

## Próxima continuidade

R26-M2: Ciclos de hoje, formulários e execução — **Sol Médio**. Preservar contadores, constância programada, XP, subitens e recibos. Depois percorrer áreas restantes e consolidar matriz real. Se aparecer problema de contrato/auth/persistência, avisar antes e retomar **Sol Alto** nessa correção; não mudar economia por autorização de UI. Aceite hospedado/rollout da conta e deploy continuam escopos separados. Registro da reserva encerrado; custódia/revisão sequenciais por Astro Boy.

### Atualização de prioridade após A30 — 29/10/2026

A [análise integral da conversa](../03-Project-Management/reports/A30-DIRETRIZES-AUDIO-2026-10-29.md) identificou problemas de agenda antes do acabamento: anual divergente entre telas, mensal sem dia configurado, edição forçando diária, compromissos próprios fora de semana/mês/ano e contrato de data pontual ainda ausente em Ritual. Cinco sondagens locais documentam esses casos; 75 testes existentes passaram, sem cobrir a agenda integral. O fluxo anual legado por marcadores/createdAt também exige revisão.

R26-M2 permanece a entrada operacional, mas a primeira implementação recomendada é contrato/compatibilidade da agenda em **Sol Alto**, com aviso prévio ao usuário. Só depois retornar a **Sol Médio** para formulários/Hoje/Temporal, revisão mobile e animação por eventos reais. Nenhum contrato ou fonte foi alterado na A30; evidências de navegador continuam pendentes. Não inferir autorização para migrar Missões, financeiro completo, abrir gates ou recalcular XP a partir de falas gravadas.
