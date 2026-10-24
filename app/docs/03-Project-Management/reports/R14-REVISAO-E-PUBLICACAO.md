# R14 — revisão integrada e publicação de R12/R13

23/10/2026 · versão 0.1.54 · base 987e09e · branch local codex/fitness-ui-integration.

## Escopo autorizado

Fábio pediu revisar, corrigir erros, organizar documentação e publicar em `Matheuscroft/ConselhoElemental-main`, branch main, com repasse claro para Matheus. Lotes acumulados R12-A/B/C, taxonomia e R13, versões 0.1.49–0.1.53; R14 atualiza revisão/onboarding em 0.1.54. Astro Boy executou revisão e custódia documental sequencialmente. Fábio permanece no frontend; Matheus no backend.

## Correções desta revisão

- Repasse/índice/boas-vindas deixavam a versão 0.1.48 e o estado de planejamento em destaque: consolidado até R14, mantendo o histórico anterior nas entradas próprias.
- Identificador de briefing atualizado; perfis que reconheceram R11 recebem aviso de novo repasse sem perder nome/papel/data. Teste cobre esse upgrade.
- Compositor contextual de Jornadas/Grandes Obras agora usa a conta atual como chave React, reiniciando estado de formulário quando a conta muda. Os comandos e guards de conta existentes não foram alterados. Comportamento real de troca de conta ainda exige QA de navegador.
- Sem correção de backend/fórmula necessária nos testes executados. Não é alegação de ausência de qualquer bug.

## Entrega acumulada

[Repasse completo](../../REPASSE-FRONTEND-PARA-BACKEND.md) contém histórico desde I03/R01, tabela por versão, referências, contratos preservados e o trabalho que Fábio continuará. [Planos R12/R13](../../plans/README.md) detalham trilhas, animações/runas, catálogos/compositor, taxonomia e Showcase de Rituais.

## Verificações atuais

| Comando / inspeção | Resultado |
| --- | --- |
| `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs` | 102/102 passaram |
| `deno test --cached-only --no-prompt --config tests/deno.json tests/workout/` | 10/10 passaram, com tipos |
| `deno test --no-prompt supabase/functions/assistant-suggest/index_test.ts` | 7/7 passaram; dependências de auth/provedor simuladas, sem chamadas remotas |
| `tsc -b` e `npm run lint` | Passaram, lint sem avisos |
| Build Vite com `envDir:false` | Passou em 8,87 s na execução final; não leu arquivos .env |
| Diff acumulado de stores/lib/types/services/constants/Supabase e quest-commands/quest-path | Vazio contra base 987e09e |
| Lockfile | Apenas versão raiz alterada; nenhuma atualização de dependências |
| Git | Fetch confirmou base alinhada; push sem force executado e SHA remoto confirmado |

A primeira chamada Deno sem `tests/deno.json` executou quatro testes e parou por alias `@/` não resolvido. Corrigido o comando de execução, sem alterar código/testes de domínio. Os quatro testes do calculador histórico não significam ativação dele no fluxo consolidado.

Logs locais temporários: `/tmp/r14-node-tests.log`, `/tmp/r14-workout-tests-configured.log`, `/tmp/r14-assistant-tests.log`, `/tmp/r14-lint-final.log`, `/tmp/r14-build-final.log`. Logs não serão adicionados ao Git. Avisos de chunks grandes e Browserslist desatualizado permanecem.

## Publicação e limites

Publicado em main: `4d73183f58e7e66279b87f0921fbac013a6d444d`; push sem force concluído e `git ls-remote origin refs/heads/main` confirmou o mesmo SHA em 23/10/2026. Working tree estava limpo após o commit de código. Este registro de confirmação segue em commit documental próprio. Não há deploy neste escopo. Não publicar .env, perfil local, credenciais, sessões, vídeos/capturas pessoais, node_modules ou dist. Alterações anteriores preservadas; staging explícito do lote.

QA visual e fluxos reais continuam pendentes: acesso ao localhost recusado na rodada anterior, sem contorno. Nesta revisão não houve tentativa de navegador. Testes unitários/SSR/build não comprovam sincronização remota, fidelidade visual ou fluidez em dispositivos. Sem consulta a Supabase remoto/secrets, migração, mudança de XP/Prana ou regras de recorrência.

## Recepção por Matheus e continuidade

Após pull: `cd app`, `npm ci`, `npm run astro:status -- --json`, `npm run astro:welcome`; IDE segue AGENTS e lê repasse/continuidade/fila. `npm run astro:ack` marca o briefing como lido nesta máquina. Isso não envia mensagem automaticamente nem executa agentes ao abrir GitHub.

Matheus: contratos/backend/auth/persistência/sync; revisar snapshots macro, Undo/idempotência e contratos ainda abertos para fragmentos/streak. Fábio: QA visual, interações mobile, capítulos/detalhes de Jornadas/Grandes Obras e evolução das áreas restantes. Quantidade de 1 fragmento foi aprovada; demais regras e carteira não implementadas. Revisão documental pelo coordenador; independente pendente.
