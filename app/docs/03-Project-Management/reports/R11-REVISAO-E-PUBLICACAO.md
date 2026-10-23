# R11 — revisão integrada e publicação da repaginação

23/10/2026 · 0.1.48 · Astro Boy, execução sequencial. Checkout `app`, branch `codex/fitness-ui-integration`, base `f07292f`. Usuário autorizou revisão, correções, repasse completo para Astro Boy/Matheus e push em `Matheuscroft/ConselhoElemental-main:main`.

## Resultado da revisão

Revisão estática focal das alterações acumuladas I03/R01–R10, lint global, compilação, testes existentes/ampliados, leitura de contratos e conferência do remoto. Não foi uma prova exaustiva de ausência de bugs. Inspeção visual/fluxos reais continuam pendentes; não houve contorno do bloqueio salvo do navegador.

Problemas encontrados e corrigidos:

1. **Quatro avisos de hooks:** callbacks de execução de Ciclos agora são estáveis e dependências de Ano/Mês estão completas. Busca recursiva de hábito foi movida para escopo de módulo. Os corpos das operações de tracking/finalização/reset/busca foram preservados; nenhuma fórmula/recorrência mudou.
2. **Atalhos do Santuário:** “Ver todos” e títulos de rituais apontam para `view=lista`, evitando abrir a nova tela de quests quando a intenção é consultar rituais avulsos.
3. **Propriedade da execução:** timer simples do Santuário/quests recusa tarefas nativas de treino e agregadores com subetapas. A home encaminha para Treinos ou lista de Rituais; a retomada de tarefa nativa no hub também usa o módulo de Treinos. Não substitui timer de outra atividade, nem concede recompensas por novo motor.
4. **Dados fictícios de evolução:** Astrolábio usava `Math.random()` para quatro séries históricas. Agora apresenta pontos registrados por dia a partir da projeção deduplicada de histórico. Registros sem data/pontos não são estimados; sem histórico mostra estado vazio. Distribuição elemental atual permanece separada, sem reconstrução histórica inventada. Filtros indicam explicitamente período do gráfico (7/30/365 dias).
5. **Teste Fitness obsoleto:** `native-reward-projection.test.ts` tinha fixture sem campos/UUIDs tipados e comparava as projeções vigentes com o calculador por blocos rejeitado. Foi alinhado à restauração explícita de Matheus registrada no ADR-003: ER × 0.10, sessão consolidada, esforço global, tempo declarado/medido e RPE informativo. Testa valores esperados de preview/check-in/LIVE e recibo Core sem alterar qualquer calculador. Os quatro testes da proposta antiga continuam separados, sem reativar o código no produto.
6. **Execução dos testes Deno:** configuração em `tests/deno.json` resolve o alias do app e usa `date-fns` já instalado. Comando `--cached-only` não baixa dependências. Não altera dependências do produto.
7. **Onboarding desatualizado:** Astro Boy mostrava apenas F59. Agora apresenta I03/R01–R11, aponta o repasse portável e distingue Fábio/frontend de Matheus/backend. Perfis antigos recebem uma atualização por revisão, confirmada por `ack`, sem sobrescrever a identidade/data original.

## Repasse e escopo acumulado

[REPASSE-FRONTEND-PARA-BACKEND.md](../../REPASSE-FRONTEND-PARA-BACKEND.md) reúne visão, decisões do usuário, cronologia 0.1.32–0.1.48, referências, arquivos/contratos, limites e próximas responsabilidades. Boas-vindas, índice, manual, dossiê, continuidade, fila e changelog apontam para ele.

A publicação inclui a confirmação I03, identidade compartilhada, assets elementais, home/órbita/páginas de elementos, navegação/Pilares, Showcase/Expanded, timer, Temporal/Lua/Estações, ícones, Ciclos, Grimório, quests e regressões/documentos correspondentes. A UI antiga exclusiva do Santuário foi removida com redirecionamento de rotas antigas. O trabalho preexistente de Fitness/backend foi mantido.

## Verificações executadas nesta revisão

| Verificação | Resultado |
| --- | --- |
| `git fetch origin main` e comparação `HEAD...origin/main` antes da integração | 0 à frente / 0 atrás; remoto na base f07292f |
| `node --test scripts/astro-boy.test.mjs tests/elemental/*.test.mjs tests/cycles/*.test.mjs tests/temporal/*.test.mjs tests/grimorio/*.test.mjs tests/quests/*.test.mjs` | **92/92 passaram**; inclui perfil antigo/ack, timer simples, projeção de histórico e suites anteriores |
| `deno test --cached-only --config tests/deno.json tests/workout/` | **10/10 passaram**, com checagem de tipos; inclui 4 testes do calculador histórico isolado |
| `deno test supabase/functions/assistant-suggest/index_test.ts` | **7/7 passaram**, auth/provedor simulados; sem chamada remota/secrets |
| `tsc -b` | Passou |
| `npm run lint` | Passou, **0 erros e 0 avisos** |
| Build Vite por API com `envDir:false` | Passou em 8,15 s; chunks grandes/Browserslist antigo continuam como avisos |
| SHA-256 dos 64 arquivos protegidos contra início de R11 | Idênticos |
| `git diff --name-only HEAD -- src/stores src/lib src/types src/services src/constants supabase` | Vazio: publicação acumulada não modifica esses diretórios |

Houve falhas intermediárias de configuração/tipagem na ampliação da suíte Fitness, corrigidas antes dos resultados finais. Não foi usado `--no-check` para declarar a suíte aprovada. Testes Node/Deno são isolados; não certificam produção, persistência remota ou UX renderizada.

Evidências temporárias: `/tmp/r11-tests-final.log`, `/tmp/r11-lint-final.log`, `/tmp/r11-build.log`, `/tmp/r11-before.json`. Resultados essenciais preservados neste relatório; `/tmp` não é arquivo permanente de evidência.

## Publicação e pendências

Push autorizado para main, sem force, reset, limpeza destrutiva, deploy ou migração. Manifestos/changelog sincronizados em 0.1.48. Perfil `.astro-boy`, ambientes, configurações globais, builds e credenciais não integram o lote. Ver confirmação do commit/publicação em [CONTINUIDADE](../../CONTINUIDADE.md).

Pendências principais: QA visual/fluxo em conta isolada e 360/390/768/1440; performance real; acabamento das telas ainda parciais com Fábio. Matheus mantém backend e pode auditar snapshots/progresso macro, Undo/idempotência, isolamento/sincronização e divergências documentadas sem presumir autorização para novas regras. Repaginação geral não está declarada 100% concluída.

Revisão documental executada pelo coordenador; revisão independente não realizada neste lote. Não houve mensagem externa nem agente permanente iniciado; o repasse acompanha o repositório e o CLI.
