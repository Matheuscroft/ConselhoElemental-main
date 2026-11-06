# R26-M2A — coerência da agenda e compatibilidade — 0.1.106

29/10/2026 · Astro Boy · execução sequencial no checkout `codex/fitness-ui-integration`, base `b11ed9d`. Fábio autorizou iniciar após a [análise A30](../03-Project-Management/reports/A30-DIRETRIZES-AUDIO-2026-10-29.md). Lote local, sem publicação, migração remota ou acesso a dados pessoais.

## Entrega

Ciclos, sequências e as projeções do Temporal usam `recurrenceMatchesDate`. Semana, Mês, Ano e Calendário recebem os compromissos próprios e os Rituais com data planejada. A edição de um Ciclo deixa de forçar `DAILY`. Invocar e a edição de Ciclos permitem declarar agenda diária/semanal/mensal/anual, dias e data final opcional.

Os novos cadastros feitos no formulário da página Ano usam `createAnnualEntry`: atividade recorrente cria um único Habit `YEARLY` pelo comando existente; aniversário cria um Commitment `YEARLY`. Não são cópias de Tasks para cada ano. A agenda mostra as ocorrências seguintes até o limite escolhido, com notas e acesso ao Ciclo na data. Criar ou visualizar agenda não concede XP. A atividade usa os padrões atuais de Ciclos ao ser executada; lembrete não é conclusão de atividade.

Rituais podem receber uma data em Invocar e na edição da lista. Detalhes do dia oferecem links por ID para Rituais, Ciclos e trilhas, preservando o dia selecionado quando aplicável. A navegação não executa nem paga a atividade.

## Contrato e compatibilidade

- `Action.dueDate` é opcional e representa uma data operacional local `YYYY-MM-DD`; ausência/null mantém um Ritual sem agendamento. Não se usa `createdAt` para planejar novos Rituais. A chave de calendário mantém o mesmo dia em dispositivos com fusos diferentes.
- `dateFromInput` valida a data sem normalizar um dia impossível para o mês seguinte; `operationalDate` lê chaves locais e aceita timestamps antigos onde necessário. `dateToInput` não faz `toISOString().slice(0,10)` em uma data local.
- O adapter legado usa a coluna **existente** `tasks.due_date` (`timestamptz`) e mantém a chave local no payload. Ao ler uma linha antiga que só tenha a coluna, recupera sua data no contexto local; uma data explícita do payload tem precedência. Isso é compatibilidade do cliente, não uma alteração de schema nem sincronização integral já liberada.
- `RecurrenceConfig` conserva `daysOfWeek`/`daysOfMonth` e aceita `month` (1–12), `day` e `until` opcional (`YYYY-MM-DD`, inclusivo). Commitment aceita `YEARLY`, descrição e `untilDate` opcionais. O mesmo predicado verifica início e limite; datas inexistentes são puladas, sem antecipação. Essa é a semântica já usada pelo Temporal/dia 31, agora compartilhada.
- Anual antigo sem mês/dia explícitos segue o mês/dia da data inicial (`startDate`, com fallback `createdAt`), como já acontecia no Temporal. A correção alinha a lista de Ciclos a essa projeção. O formulário mostra que essa é uma agenda anterior. Não há escrita de configuração ao ler, nem exclusão de recibos antigos fora dessa agenda.
- Mensal antigo com configuração vazia mantém sua leitura anterior, correspondente a todos os dias, até edição explícita. O formulário avisa essa condição. Novos cadastros recebem dia(s) definido(s); o store usa o dia inicial como padrão apenas na criação quando não veio configuração. Nenhum registro persistido é convertido automaticamente.
- Abrir uma edição e mudar apenas o nome conserva a frequência/configuração original. Alterar a agenda explicitamente exige uma configuração válida. Subitens não recebem agenda independente nesse editor.
- A lista de compromissos usa raízes executáveis: subitens não viram compromissos duplicados e membros controlados por rotação não aparecem novamente ao lado da sequência. O histórico de conclusões dos filhos continua disponível nos eventos, sem reescrever recibos.
- `eachDayOfInterval` avança por dias do calendário local e inclui o último dia mesmo atravessando o início do horário de verão; deixou de dividir um intervalo por durações fixas de 24 horas.

### Registros anuais legados e constância

Os Tasks antigos com marcadores `[ANUAL_*]` permanecem intactos e acessíveis. O texto da página deixa de prometer repetição infinita já funcional e informa que esses registros ainda não são Ciclos configurados. A data operacional tem precedência se o registro tiver sido explicitamente agendado; nos antigos sem ela, a data anterior continua sendo usada para a apresentação. Não há conversão silenciosa de Task em Habit nem novo pagamento do passado.

**Constância anual e de rotações ainda usam o cálculo legado**, identificado no componente. Este lote resolve agenda, não introduz histórico versionado de mudanças de frequência. Fórmulas, pagamento, distribuição, recibos e Undo de XP não foram alterados. Uma conversão de registros anuais antigos ou evolução da constância histórica exige lote próprio em Sol Alto e revisão de impacto.

## Preservação do progresso e limites de liberação

A auditoria de arquivo passa a validar as novas datas/configurações sem reparar entradas inválidas. Backups continuam no formato existente e preservam os campos novos e os perfis. A whitelist local e a migration de conta **ainda não aplicada** aceitam 0.1.106; a mudança no SQL se restringe a essa versão.

Gates de transferência de conta e restauração permanecem `false`. Não houve login pessoal, query no projeto real, migração, Advisors remoto, deploy, commit ou push. O serviço legado continua com as limitações de cobertura integral já documentadas. Clientes antigos podem ignorar os novos campos de agenda; rollout/aceite hospedado continuam separados.

Baseline anterior do lote: `/tmp/r26-m2-before.json`. Conferência SHA-256: 11 fontes protegidas permaneceram idênticas — authStore, workoutStore, cliente Supabase, App, main, bootstrap, gates de conta/restauração e serviços de recompensa de Rituais/conquistas/Ciclos. O `appStore` foi alterado apenas nos trechos de criação/edição/data e seleção de agenda descritos acima. Alterações preexistentes no checkout foram preservadas.

## Validação realmente executada

- **521 testes globais aprovados**, zero falhas, em `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`. Log final `/tmp/r26-m2-all-final.log`.
- **28 direcionados finais aprovados** em agenda, adapter e criação; log `/tmp/r26-m2-reviewed-final.log`. Depois desse direcionado foram ajustados apresentação de notas e tipos/portabilidade de fixtures, cobertos pela execução global final.
- `npx tsc -b` aprovado: `/tmp/r26-m2-types-verified.log`.
- `npm run lint` aprovado: `/tmp/r26-m2-lint-verified.log`.
- Vite via `build({ envDir: false })` aprovado em **9,40s**: `/tmp/r26-m2-build.log`. A configuração do projeto foi conferida; não lê `.env`. Avisos existentes de tamanho de chunks/Browserslist permanecem.
- `git diff --check`, referências documentais, versões e revisão do diff foram conferidos no encerramento.

Os novos testes executam predicados, comandos reais do store em memória, persistência/recarga sintéticas, adapter com cliente substituto e auditoria do arquivo completo. Exercitam datas locais em Recife, Nova York e Auckland, inclusive horário de verão; dia 31/29 de fevereiro; igualdade Ciclos/Temporal; agendas incompletas; edição sem mudança de frequência; criação de anual recorrente; limite inclusivo; preservação de IDs/createdAt/XP; e ausência de gravação diante de input inválido. A suíte global também executa os testes locais do protocolo de conta com PostgreSQL/PGlite. Isso não comprova Supabase Auth/PostgREST hospedado ou concorrência de sessões reais.

A primeira execução global teve **518/519**: o teste de criação usava um substituto de `useState` sem inicialização lazy e não carregava os novos helpers puros. Esse harness foi corrigido para simular o contrato de React, preservando os cenários de falha/double tap. Dois novos casos inicialmente tentaram editar campos na etapa errada do wizard; foram corrigidos para seguir o fluxo real e aprovados. Nenhuma dessas execuções parciais é o aceite final; ele é a execução de 521 testes acima.

Não houve navegador nem contorno da permissão salva. SSR, leitura de JSX/classes e execução de handlers com dependências sintéticas não medem hitboxes, rolagem, teclado, foco visual, 360/390px ou tablet. A revisão React conferiu inicialização/imutabilidade, erros antes dos comandos, rótulos, IDs e controles com mínimos de toque declarados, sem alegar validação visual.

## Próxima etapa

**R26-M2B — Sol Médio:** refinar Ciclos de hoje e a execução/planejamento em Temporal com os contratos agora disponíveis. Tornar criação rápida e edição mais consistentes, melhorar o resumo da agenda e navegar semana → dia → atividade → retorno; então percorrer a matriz real de celular/tablet quando o acesso estiver disponível. Animações devem continuar ligadas aos recibos/eventos reais, sem gerar outra economia.

Continuam separados: tratamento explícito dos anuais legados, constância anual/rotações e histórico de mudanças de agenda (Sol Alto); vocabulário Missão/capítulo e objetivo da semana; inventário/fragmentos; release hospedado da conta/restauração. Não apresentar este lote como fechamento do app inteiro.
