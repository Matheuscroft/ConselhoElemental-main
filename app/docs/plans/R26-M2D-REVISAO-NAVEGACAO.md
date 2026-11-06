# R26-M2D — Revisão local da navegação Temporal — 0.1.109

30/10/2026 · Astro Boy sequencial · Sol Médio confirmado · checkout `codex/fitness-ui-integration`, base `b11ed9d`. Continuação de [M2C](R26-M2C-FORMULARIOS-TEMPORAL.md). A inspeção do navegador interno foi recusada na tentativa anterior por permissão salva para a origem local. Não houve nova tentativa nem contorno por outro navegador/host/porta/CDP/HTTP. Este lote é revisão de código e testes locais, não aceite visual.

## Defeitos reproduzidos e correções

1. **Dia perdido ao trocar de aba:** no Calendário `?mes=2027-01&dia=2027-01-20`, Semana recebia `data=2027-01-01`, pois TemporalLayout usava só o anchor mensal. Agora encaminha o dia selecionado, quando válido, a Semana/Mês/Calendário. Ano continua recebendo somente o ano, conforme seu contrato de apresentação. Sem seleção válida, permanece o primeiro dia do período, sem inventar ocorrência. Datas locais, virada de ano e retorno seguro preservados. Nenhum comando de atividade é chamado pela navegação.
2. **Resumo recorrente com data enganosa:** o agrupamento mensal selecionava uma ocorrência do cadastro; o resumo mostrava a última data do mês (31/01), embora a recorrência começasse em 01/01. Agora o texto “A partir de” usa `source.date` normalizada pelo helper existente. A quantidade e todas as ocorrências diárias continuam iguais; não altera a agenda.

Dois testes falharam antes de editar o produto: `/tmp/r26-m2d-reproduction.log` (9/11 aprovados). Após a correção, 42/42 testes Temporal passaram em `/tmp/r26-m2d-temporal.log`. Há dois testes novos de navegação; o teste de Calendário existente também confere o início do cadastro. Compilação de JSX/handlers/router sintéticos e Zustand real em memória: sem navegador/dados pessoais.

## Preservação e revisão

Baseline `/tmp/r26-m2d-before.json`. Somente TemporalLayout, o resumo de TemporalCalendarPage, testes e custódia de versão/documentos são o escopo deste lote. Não reescrever mudanças preexistentes. Versionamento progressivo para 0.1.109; whitelists frontend/SQL NÃO aplicado recebem apenas a nova versão. Stores, serviços, tipos, helper de recorrência, recibos, economia, bootstrap e gates permanecem iguais ao início. Skill Supabase já consultada na custódia anterior; não há alteração de API/SQL funcional ou acesso a banco remoto. Sem secrets, sessão pessoal, migração, deploy, commit/push ou subagentes.

Revisão React sequencial: estado derivado da URL sem novo efeito/store/cache; cálculo de links puro, sem chamadas de gravação, mantém retorno local validado. Helper de normalização de data existente reutilizado; nenhum seletor ou regra de recorrência alterado. Alterações funcionais não justificam outro redesign ou biblioteca.

## Verificações finais

- **542 testes globais aprovados**, zero falhas, 29,71s: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- **42 testes Temporal aprovados**: `node --test tests/temporal/*.test.mjs`.
- `npx tsc -b` e `npm run lint`: exit 0.
- `build({ envDir: false })`: exit 0 em **30,54s**, avisos de tamanho de chunks/Browserslist existentes mantidos.
- SHA-256 de 90 fontes protegidas idênticas; whitelists somente versão, três campos de versão iguais a 0.1.109, links novos e diff-check conferidos. `/tmp/r26-m2d-final-review.json`.

Logs: `/tmp/r26-m2d-all.log`, `...-types.log`, `...-lint.log`, `...-build.log`. Guardar as falhas iniciais de reprodução separadas dos resultados finais.

## Ponto de retomada

Manter **Sol Médio** para a validação mobile/tablet dos fluxos existentes. Aceite real em 360/390px/tablet (toque, teclado, foco, rolagem, overflow, fluidez, retorno/recarga) continua pendente. Não repetir a tentativa do navegador sem mudança confirmada da permissão; não contornar a recusa. Código/testes locais não liberam esse aceite. Se houver nova evidência visual fornecida pelo usuário, analisar diretamente sem acessar a origem bloqueada.

Conta hospedada/restauração real continuam desativadas; fragmentos/inventário, lembretes com horário/adiamento/push e corpo-ecossistema não foram iniciados. Novos contratos requerem aviso e Sol Alto antes da implementação; publicação tem escopo próprio. Revisão/custódia documental sequencial pelo Astro Boy.
