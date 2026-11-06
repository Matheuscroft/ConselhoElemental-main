# R26-M2C — Formulários e navegação Temporal — 0.1.108

30/10/2026 · Astro Boy sequencial · Sol Médio confirmado por Fábio · checkout `codex/fitness-ui-integration`, base `b11ed9d`. Continuação do [M2B](R26-M2B-HOJE-TEMPORAL-MOBILE.md). Fonte canônica consultada via índice de arquitetura e contratos existentes; não redefine recorrência/economia.

## Entrega

- Ano: o formulário anual deixa de usar sobreposição manual, trava global de toque e dois seletores por arraste. Usa Dialog existente, formulário semântico, rótulos, data inicial completa, notas e limite inclusivo opcional com ano explícito. Um limite anterior ao início é rejeitado, sem ajuste silencioso. `createAnnualEntry` permanece intacto: um Habit YEARLY para ciclo ou Commitment YEARLY para aniversário. Cancelar fecha; erro mantém campos. Aniversário não conclui atividade nem gera XP.
- Ano/período na URL (`ano=YYYY`), links de abas conservam período e cartões de mês recebem contexto seguro de retorno ao ano. Links do ciclo anual carregam ID/data e retorno, usando helpers existentes. Nenhuma navegação concede recompensa.
- Calendário: criação/edição em Dialog e formulário compartilhado, envio por submit e preservação de preenchimento em falha. Recorrência original e notas existentes mantidas na edição; limite pode ser removido. Confirmar exclusão é obrigatório; remover um cadastro recorrente remove suas repetições na agenda, sem replay de conclusões.
- Gestão mensal agrupa ocorrências por cadastro e mostra sua quantidade, evitando repetir Editar/Excluir a cada dia. Detalhe diário continua recebendo todas as ocorrências, inclusive datas adjacentes visíveis na grade. Outros prazos não repetem os cadastros próprios nem são cortados silenciosamente após 16 itens.
- Cabeçalhos dos dias seguem início de semana configurado; removida a semana extra posterior ao mês. Dia tem rótulo completo e data atual indicada. Contexto celeste e outros prazos são recolhíveis, preservando seu conteúdo.
- Identidade existente: fundo escuro, dourado, Cinzel, formulários em coluna com campos 16px/48px, safe area inferior, foco declarado e diálogo sem animação na preferência de movimento reduzido. Não adicionadas bibliotecas/efeitos contínuos.

## Preservação

Baseline `/tmp/r26-m2c-before.json`. Comparação SHA-256 confirma 90 fontes protegidas de stores/services/types/lib e bootstrap idênticas; exceção única em lib é whitelist de versão. SQL NÃO aplicado recebe somente a aceitação de 0.1.108, sem mudança de função/política/schema ou gate. Skill Supabase consultada para essa custódia; changelog público lido após o leitor web recusar markdown; nenhuma API/CLI/projeto remoto foi acessado. Versão/manifests/changelog sincronizados. Dados pessoais, .env/secrets, fórmulas, recibos, backend, sessão e conta real não acessados ou alterados. Sem subagentes, migração, deploy, commit/push. Conta/restauração continuam false.

## Verificação

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **540 aprovados**, zero falhas, 33,69s; `/tmp/r26-m2c-all-final.log`.
- `node --test tests/temporal/entry-forms.test.mjs`: **9 aprovados**, `/tmp/r26-m2c-forms-final.log`. Temporal inicial finalizou 39/39 antes do nono teste novo. A primeira global 539/539 foi repetida após acrescentá-lo; só a global final inclui os nove.
- `npx tsc -b` e `npm run lint`: exit 0, `/tmp/r26-m2c-types-final.log`, `/tmp/r26-m2c-lint-final.log`.
- `build({ envDir: false })`: exit 0 em **23,96s**, `/tmp/r26-m2c-build-final.log`. Avisos de bundle/Browserslist existentes permanecem.
- CSS PostCSS, versões, links e `git diff --check` conferidos. Baseline e revisão de preservação em `/tmp/r26-m2c-before.json`, `/tmp/r26-m2c-preservation.json`.
 Nove testes novos exercitam handlers/formulários com React/router substitutos, JSX/SSR, store Zustand real em memória e comandos de recorrência existentes. Incluem 29/02, data final em outro ano, erro sem perda de campos, edição/remoção de limite, agrupamento de 31 ocorrências, exclusão confirmada e retorno de Ano/Mês/Calendário.

A revisão encontrou referência a `DayAggregate.commitments` no rótulo acessível; corrigida para `commitmentsCount` e TypeScript repetido. O primeiro teste de agrupamento falhou por alvo legado do compilador do harness convertendo spread de MapIterator incorretamente; ajustado para ES2022, igual aos testes de componentes existentes. Não são falhas ocultadas nem validação de navegador.

## Limites e próxima etapa

**Sem inspeção no navegador/dispositivo.** Dialog da biblioteca, SSR e harness não comprovam foco, teclado, contraste, rolagem, hitboxes, overflow ou fluidez real. QA 360/390px/tablet permanece pendente; não houve tentativa de contornar permissão salva ou tocar no perfil pessoal. Não afirmar equivalência visual ao vídeo.

Próxima etapa: **validação mobile/tablet dos fluxos existentes, Sol Médio**. Se o navegador continuar indisponível, registrar o limite e continuar apenas verificações locais autorizadas. Lembretes com horário/adiamento/push, fragmentos/inventário, corpo-ecossistema e conta hospedada NÃO foram iniciados; novos contratos requerem Sol Alto antes de começar e publicação tem escopo próprio. Legado anual/constância histórica permanece preservado e separado. Custódia documental executada em sequência pelo Astro Boy, sem inventar revisor externo.
