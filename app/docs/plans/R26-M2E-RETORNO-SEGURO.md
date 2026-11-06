# R26-M2E — Retorno seguro após seleção de data — 0.1.110

30/10/2026 · Astro Boy sequencial · Sol Médio confirmado · checkout `codex/fitness-ui-integration`, base `b11ed9d`. Continuação da [revisão local M2D](R26-M2D-REVISAO-NAVEGACAO.md). Sem navegador: permanece a recusa anterior por permissão salva; nenhuma tentativa nova/contorno. QA visual mobile/tablet não realizado.

## Reprodução e correção

Ao abrir um mês pelo cartão de Ano, o router recebe `temporalReturn=/temporal/ano?ano=2032`. `useTemporalView` substituía todo o state por `{ temporalViewSelection: true }` ao selecionar/fechar um dia ou trocar de mês, apagando esse caminho. A regressão do hook real falhou antes da alteração (`/tmp/r26-m2e-reproduction.log`: 9/10 aprovados, origem esperada ausente).

O hook agora lê a origem com `safeTemporalReturn` e conserva somente essa propriedade validada junto ao marcador de seleção interna. Não copia state arbitrário; URL externa/inválida não propaga. Mantém replace, preservação de rolagem interna e identidade da data, sem persistir atividade, executar comando ou conceder recompensa. Ano → Mês → selecionar dia → fechar → mudar mês mantém origem local; retorno não depende de um novo store.

## Cobertura complementar

Teste do hook existente ampliado para selecionar/fechar/trocar mês mantendo origem e descartar estado estranho/externo. Dois testes novos de formulários: cancelar usa somente callback de cancelamento sem gravar; falha ANTES da gravação mantém preenchimento e permite retry com exatamente um compromisso. O teste de retry não afirma recuperação de falha após uma gravação parcial/ambígua.

44 testes Temporal aprovados em `/tmp/r26-m2e-temporal.log`. React/router/hooks sintéticos, handlers/SSR e store real isolado em memória, sem perfil do usuário. Fechar/reabrir o Dialog real, foco, toque e teclado não são comprovados por esse harness.

## Preservação e custódia

Baseline `/tmp/r26-m2e-before.json`. Somente hook de apresentação, testes, versão e documentação alterados neste lote. Whitelists frontend/SQL NÃO aplicado aceitam 0.1.110, sem alteração funcional de SQL. Domínio, regras/recorrência, economia, recibos, stores/services/tipos, bootstrap e gates preservados. Sem secrets, dados pessoais, conta/banco real, migração, deploy, commit/push ou subagentes. Revisão React/custódia pelo Astro Boy em sequência: estado de retorno derivado do router, não há novo efeito nem propagação de estado não validado.

## Resultados finais

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **544 aprovados**, zero falhas, 29,12s.
- `node --test tests/temporal/*.test.mjs`: **44 aprovados**, zero falhas.
- `npx tsc -b` e `npm run lint`: exit 0.
- Vite `build({envDir:false})`: exit 0 em **31,29s**, avisos existentes de chunks/Browserslist.
- 90 fontes protegidas idênticas por SHA-256; whitelists apenas versão; três campos 0.1.110 coerentes. Links e diff-check conferidos. Custódia documental sequencial e reserva encerrada.

Logs: `/tmp/r26-m2e-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`, revisão `...-final-review.json`. Reprodução falha mantida separada.

## Próximo passo

Revisão funcional local de Temporal encerrada neste recorte; **aceite visual mobile/tablet permanece pendente**, sem transformação em concluído por mais testes locais. Manter Sol Médio para esse aceite quando houver acesso autorizado efetivo ou evidência visual fornecida. Não repetir suites sem mudança/risco novo.

Próximo lote de nova implementação proposto pelo roadmap: contratos de lembretes com horário/adiamento, **Sol Alto antes de começar**; depois interface em Médio. Ainda não foi iniciado ou definido saldo/persistência paralelo. Push/app fechado, conta hospedada, fragmentos/inventário e ecossistema continuam separados. QA visual pendente deve acompanhar essas frentes, sem ser ocultado ou considerado resolvido pelo avanço de código. Nenhuma publicação autorizada por esta revisão.
