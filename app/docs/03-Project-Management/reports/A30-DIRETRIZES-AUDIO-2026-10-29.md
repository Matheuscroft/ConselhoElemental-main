# A30 — diretrizes da conversa e confronto com o app

29/10/2026 · Astro Boy · análise sequencial · versão preservada **0.1.105**. Checkout `codex/fitness-ui-integration`, base `b11ed9d`, com alterações preexistentes. Este relatório é diagnóstico e proposta de continuidade; não altera contratos nem autoriza migração pelo conteúdo de uma gravação.

## Resultado principal

A conversa define um sistema de organização pessoal em diferentes escalas: **Ritual** para uma execução pontual; **Ciclo** para uma atividade recorrente; **Jornada** para um objetivo com etapas; **Grande Obra** para um objetivo amplo dividido em **Missões**. Dia, semana, mês e ano devem mostrar os mesmos registros sob perspectivas diferentes.

A estrutura principal já existe no frontend. O maior desvio encontrado está na agenda: as telas não compartilham completamente os mesmos critérios de recorrência e nem todas recebem os mesmos compromissos. Antes de ampliar animações, é necessário fechar essa coerência funcional. Repetir uma atividade não deve exigir recriá-la; aparecer em mais de uma tela não deve duplicar a atividade, sua conclusão ou seu XP.

## Método, cobertura e privacidade

- Arquivo fornecido: áudio de **317,952 segundos**. Transcrição automática local com Hyperframes/whisper.cpp, modelo multilíngue `small`, idioma `pt`. A ferramenta concluiu com sucesso; transcrição produzida com 908 palavras, marcações de 0,07s até 318s arredondados, cobrindo o arquivo inteiro.
- O áudio não foi enviado a um serviço de transcrição. Houve download de ferramentas/modelo para executar o reconhecimento local. Os artefatos privados e a transcrição completa permanecem em `/tmp/conselho-audio-diretrizes`, fora do repositório.
- A transcrição não é uma edição literal certificada. Há erros reconhecíveis em nomes/termos, como “emissões” no contexto de Missões. A abertura e algumas falas sobre planilhas no trecho final são menos claras; nenhuma regra depende dessas palavras incertas. Não foi atribuída identidade a vozes ou turnos individuais.
- Foram consultados o índice original `/Users/fabioandre/Developer/docs-conselho-master/README.md`, os capítulos pertinentes de hierarquia, hábitos e Lista Diária, sua cópia portável e o código atual. Documentação descreve intenção; a implementação foi verificada separadamente.
- Sem navegador, dados pessoais do app, secrets, banco remoto, alteração de código, economia, conta ou deploy. Não há aceite visual de celular/tablet neste lote.

## Diretrizes extraídas do áudio completo

| Trecho aproximado | Diretriz compreendida | Consequência para o produto |
|---|---|---|
| 00:00–00:38 | Distinguir algo feito uma vez de uma rotina que se repete. | Ritual e Ciclo precisam ter criação, agenda e conclusão compreensíveis. A frequência não é determinada pelo nome da atividade. |
| 00:38–01:20 | Jornada é uma sequência de passos para atingir um objetivo, possivelmente em vários dias. | Reutilizar a trilha existente e manter vínculo com os Rituais reais; não criar cópias para cada tela. |
| 01:20–01:59 | Grande Obra tem escopo maior e subdivisões chamadas Missões; a fala restringe Missão ao interior do projeto. | Mapear a apresentação de “capítulos” às Missões existentes; reconciliar a restrição com os contratos antes de mudar persistência. |
| 01:59–02:37 | Ciclos oferece a execução diária; Temporal deve ajudar a visualizar e planejar a semana. | A visão semanal precisa mostrar pendências/compromissos acionáveis, além de estatísticas de conclusões. |
| 02:37–03:05 | Existem atividades diárias, semanais, mensais, anuais e compromissos agendados. | Recorrência e data pontual são propriedades diferentes. Um compromisso isolado não vira um hábito só por estar no calendário. |
| 03:05–03:31 | Desejo de definir um objetivo da semana, reconhecendo dúvida sobre sua relação com Ciclo. | Tratar como foco temporal de um Ritual/Jornada já existente, salvo decisão posterior por outra semântica. Não inventar um novo tipo de entidade automaticamente. |
| 03:31–04:27 | Mês e ano devem mostrar obrigações periódicas e permitir antecipar o que será feito. | Configuração explícita de dia(s) do mês e mês/dia anual; cada ocorrência mantém histórico próprio. |
| 04:27–04:51 | A obrigação anual também deve aparecer na execução diária na data adequada; assinaturas são um caso de uso. | O mesmo ID deve ligar visão anual e ocorrência do dia, sem recompensa por apenas visualizar ou agendar. |
| 04:51–05:18 | Discussão sobre controle de assinaturas/planilhas e criação pela dinâmica mensal/anual, sem contrato financeiro fechado. | Começar por lembretes recorrentes. Valores, cobranças, conciliação e integração bancária não estão definidos pela conversa. |

Os exemplos pessoais foram substituídos aqui por descrições genéricas. A transcrição integral não foi incorporada aos documentos compartilhados.

## O que já existe e pode ser aproveitado

### Organização e progressão

- `src/types/index.ts` já representa `Task`, `Habit`, `Quest`, `Project` e `Mission`; `Mission` tem `projectId` no frontend.
- `src/lib/quest-trails.ts` projeta Jornadas/Grandes Obras a partir dos IDs reais e dá preferência ao estado atual dos Rituais. Preserva ordem, etapas indisponíveis e próxima etapa sugerida; não regrava progresso ou paga recompensas por renderização.
- `QuestComposer`, `quest-commands.ts` e `ProjectChapters` criam e apresentam conquistas, etapas e capítulos usando os comandos existentes. Os capítulos da Grande Obra correspondem às Missões; essa equivalência ainda não fica clara no vocabulário da interface.
- O Santuário já inclui `QuestNextSteps`, com links para os próximos Rituais. Uma Jornada não precisa ser uma rotina diária; seus passos podem ser executados em dias diferentes.
- Os testes de trilha/commands/conclusão executados neste lote verificam referências atuais, hierarquia, etapas, conclusão explícita e proteção contra bônus repetido. Isso não equivale a testar todos os fluxos visuais no aparelho.

### Ciclos, contadores e recompensas

- `CycleDailyCounter` já é genérico: meta, unidade e incremento definidos para qualquer atividade. Não há restrição aos exemplos antigos de água, aulas e banhos.
- Registros quantitativos são separados dos subitens fixos. Um novo dia consulta seus próprios registros, sem apagar o anterior. É possível ultrapassar a meta e desfazer um registro individual.
- A conclusão continua separada de somar quantidades, conforme escolha anterior do usuário. Quantidade extra não gera XP adicional automaticamente.
- Os testes executados verificam XP creditado na conclusão elegível, recibo persistido, idempotência, reversão exata e ausência de pagamento em notas/checks estruturais. Um pai agregador não deve receber novamente o valor de filhos já recompensados.
- A constância por datas programadas funciona nos casos diários/semanais e mensais configurados cobertos pelos testes. Anual e rotações ainda declaram fallback legado; não se deve apresentar esse cálculo como suporte completo a toda recorrência.
- `CycleCompletionFeedback` e o feedback de Rituais já acompanham novas conclusões/recibos. A próxima fase de movimento deve estender esse padrão, sem criar outra fonte de recompensa.

### Visões temporais e progresso protegido

- As rotas `/temporal/semana`, `/temporal/mes`, `/temporal/ano` e `/temporal/calendario` existem. Há métricas, seleção de dia, compromissos próprios no Calendário e datas de agregadores.
- A preparação de backup/conta permanece no checkout, com os gates de conta e restauração fechados. Foi conferido o estado dos gates, mas os testes de integração da conta não foram repetidos nesta análise. Não significa que o progresso pessoal já foi enviado à nuvem.
- O inventário funcional ainda aparece como indisponível no Santuário. Não foi localizado saldo funcional de fragmentos no código inspecionado. A regra anteriormente aprovada de um fragmento por conclusão elegível continua uma frente própria; o áudio não a redefine.

## Lacunas e defeitos encontrados

### 1. A agenda anual diverge entre telas — prioridade alta

`src/lib/temporal/habit-schedule.ts:habitMatchesDate`, usado por `getHabitsForDate` em Ciclos, retorna `true` para `YEARLY` após a data inicial. Já `src/lib/temporal/selectors.ts` compara mês/dia da data inicial para o Temporal.

**Reprodução local:** Ciclo anual sintético com início em 15/11/2025, consultado entre 14 e 16/11/2026. Ciclos aceita os três dias; Temporal produz só 15/11. Não foi usado um cadastro real.

**Ajuste necessário:** uma definição de agenda compartilhada, com configuração anual explícita e tratamento de dados antigos. Não inferir a data da obrigação a partir de `createdAt` sem uma regra de compatibilidade revisada.

### 2. A criação mensal pode produzir uma rotina diária — prioridade alta

`src/pages/Invocar.tsx` oferece Diário/Semanal/Mensal, mas salva `recurrenceConfig: {}`. Ambos os predicados tratam `MONTHLY` sem `daysOfMonth` como correspondente a qualquer dia.

**Reprodução local:** configuração mensal vazia gerou ocorrências em 14, 15 e 16/11; o controle com `daysOfMonth: [15]` correspondeu somente a 15/11. O caminho de criação foi inspecionado em código; não houve clique na UI.

**Ajuste necessário:** a escolha Mensal precisa coletar a agenda de verdade e mostrar sua prévia. Semanal também precisa declarar os dias; anual precisa estar acessível no formulário apropriado.

### 3. Editar o nome de um ciclo altera sua frequência — prioridade alta

`src/pages/Ciclos.tsx:handleSaveEdit` grava `recurrenceType: 'DAILY'` independentemente do tipo original. O campo mensal antigo fica no objeto, mas deixa de governar o filtro.

**Reprodução local:** o handler atual, extraído por AST e executado com valores sintéticos, recebeu um Ciclo `MONTHLY` e enviou atualização `DAILY`. Não é teste de DOM real.

**Ajuste necessário:** preservar tipo/configuração ao editar outros campos; só trocar recorrência por escolha explícita. A agenda de filhos deve continuar herdando a raiz e o histórico não deve ser reinterpretado silenciosamente.

### 4. Calendário e visões de semana/mês/ano não recebem os mesmos compromissos — prioridade alta

O Calendário lê `state.commitments` e usa `buildOwnTemporalCommitments`. Semana/Mês/Ano usam `buildTemporalCommitments` com snapshot que não contém essa coleção; esse seletor também não a inclui. `DayDetailsDialog` lista informações, mas ainda não oferece acesso direto a cada atividade.

**Reprodução local:** um compromisso `ONCE` sintético retornou um item no seletor do Calendário e zero no seletor compartilhado, mesmo fornecendo a coleção no snapshot.

**Ajuste necessário:** unificar projeção e navegação por ID, deduplicando origens e preservando a diferença entre compromisso, execução pontual e rotina. Google Agenda não foi consultado/testado.

### 5. O agendamento pontual de Rituais não está completo no frontend — prioridade alta

O contrato canônico prevê `ACTION` com `due_date`. O `Task`/`Action` atual não declara esse campo, a criação de Ritual em Invocar não o coleta e `buildTemporalCommitments` não inclui pendências de Task; Tasks concluídas entram como eventos históricos.

**Sondagem de contrato:** acrescentar `dueDate` a um objeto Task sintético não o fez aparecer na agenda. Esse campo foi fornecido apenas pelo diagnóstico; **não é um campo disponível na UI atual**. A ausência no tipo/formulário é evidência estática.

**Ajuste necessário:** fechar contrato e compatibilidade de data operacional, depois expor agendamento e atalhos de execução. Usar `createdAt` como data planejada mistura duas informações diferentes.

### 6. “Repetir anualmente” não está fechado no fluxo da página Ano

`TemporalYearPage` cria um Task, registra marcadores `[ANUAL_*]` na descrição e muda `createdAt` para a data planejada. A lista `annualTasks` filtra o ano de `createdAt`. Não foi encontrada nesse fluxo a geração de ocorrências seguintes; os marcadores de repetição são lidos para apresentação.

Esse é um **achado estático**, sem teste de interação/browser. Não se deve prometer repetição anual apenas porque o formulário mostra a opção. O ajuste deve preservar esses registros legados e separar data de cadastro, agenda e conclusão por ocorrência.

### 7. Missão, capítulo, etapa e sequência precisam de vocabulário consistente

A conversa trata Missão como parte da Grande Obra. O frontend já a apresenta como “capítulo”; a documentação relacional portável admite `project_id` nulo em `missions`. Isso é uma divergência de contrato a registrar, não motivo para apagar Missões ou migrar dados automaticamente.

“Sequência” em Ciclos é uma **rotação de hábitos**, enquanto uma Jornada é um **objetivo com etapas**. A mesma palavra “sequência” na explicação de uma Jornada não torna as duas entidades equivalentes. Também é necessário distinguir etapa fixa de contador quantitativo.

## Organização recomendada para o usuário

- **Fazer uma vez:** Ritual. Pode ter uma data e subetapas.
- **Repetir em uma agenda:** Ciclo. Escolher diário/dias da semana/dias do mês/mês e dia anual, com prévia legível.
- **Chegar a um objetivo por vários passos:** Jornada. Próxima etapa sugerida; acesso livre às demais, conforme escolha anterior.
- **Conduzir um objetivo amplo em fases:** Grande Obra → Missões/capítulos → atividades. Não forçar uma cadeia obrigatória que impeça os vínculos já existentes.
- **Alternar atividades recorrentes:** Sequência opcional de Ciclos, com explicação da rotação.
- **Organizar a semana:** foco apontando para uma Jornada/Ritual existente, e não cópia ou novo tipo. Essa solução é uma proposta; a conversa expressa a necessidade, mas não fecha o formato.
- **Lembrar obrigações/assinaturas:** recorrência ou compromisso conforme o caso. Uma obrigação anual deve aparecer na visão anual e no dia correspondente com a mesma identidade. Um módulo financeiro completo exige escopo próprio.

A experiência deve responder: **o que tenho para hoje, qual é o próximo passo e como registro o que fiz?** Uma seção Hoje pode reunir as projeções de execução, mantendo Ciclos como gestão de rotinas e Temporal como planejamento. Sem outro store ou motor de pontuação.

## Continuidade recomendada dentro de R26-M2

Esta sequência detalha a entrada da [fila única](../../FILA-ENTREGAS.md); não inicia execução nem cria um backlog concorrente.

1. **Contrato e correções de agenda — Sol Alto recomendado.** Resolver os cinco cenários diagnosticados e o fluxo anual legado; definir compatibilidade para registros antigos, datas locais, fevereiro/dia 31/29 de fevereiro e efeito de mudanças futuras de agenda. Não escolher silenciosamente entre pular e antecipar datas inexistentes. Preservar recibos/XP e provar equivalência entre telas.
2. **Execução e planejamento mobile — Sol Médio após fechar o contrato.** Formulário contextual com recorrência/data, prévia dos próximos dias, Hoje com acesso direto, navegação semana → dia → atividade e retorno preservando contexto. Explicar Ciclo/Sequência/Jornada e o papel de Missão/capítulo. Reutilizar os padrões Expanded/Showcase sem esconder comandos essenciais.
3. **Feedback e animação por evento — Sol Médio.** Somar quantidade: resposta curta no contador; concluir: confirmação elemental ligada ao recibo; atingir meta: feedback distinto da conclusão; finalizar Jornada/Missão/Obra: marco visual proporcional; desfazer: reversão legível. Nunca animar como recompensa em recarga, hidratação, simples visita ou retry. Movimento reduzido e foco precisam preservar o fluxo.
4. **Aceite real no celular/tablet.** Com acesso ao navegador disponível, validar criar/editar/agendar/concluir/desfazer/retornar, teclado e safe areas em 360/390px e tablet. Os testes locais desta análise não substituem esse aceite. Conta hospedada e inventário continuam frentes com critérios próprios.

Não foi executada recomendação de mudança de modelo nem alteração de configuração do chat. Avisar o usuário antes de iniciar a primeira etapa de contrato; Sol Médio continua suficiente para esta análise documental.

## Evidências executadas neste lote

**Suíte existente: 75 testes aprovados, zero falhas.**

```sh
node --test tests/cycles/daily-tracking.test.mjs tests/cycles/streak.test.mjs tests/cycles/rewards.test.mjs tests/cycles/reward-feedback.test.mjs tests/quests/path.test.mjs tests/quests/commands.test.mjs tests/quests/achievement-completion.test.mjs tests/quests/task-rewards.test.mjs tests/quests/task-feedback.test.mjs tests/temporal/presentation.test.mjs
```

Artefato local: `/tmp/conselho-audio-diretrizes/testes-direcionados.log`. Os testes usam stores isolados em memória, funções reais, comandos com dependências sintéticas e/ou markup de servidor conforme o arquivo. Não exercitam Supabase hospedado, sessões pessoais ou toque/teclado real. A parte celestial do Temporal tem cobertura nesta suíte; isso não comprova a agenda completa, como mostram os diagnósticos.

**Cinco cenários diagnósticos executados:** `node /tmp/conselho-audio-diretrizes/reproduzir-agenda.mjs`. Código atual compilado localmente, sem gravação no app; handler de edição extraído por AST e dependências substituídas. Resultado em `/tmp/conselho-audio-diretrizes/reproducao-agenda.json`. As asserções confirmam o comportamento defeituoso/lacuna observada; não são correções nem testes de regressão incorporados ao projeto.

**Custódia:** revisão documental sequencial pelo Astro Boy; fontes/testes/scripts/SQL/manifests preservados, sem incremento de versão. Validação final de hashes, referências locais e diff registrada no fechamento de [CONTINUIDADE](../../CONTINUIDADE.md). Não foram executados build, lint, TypeScript global ou a suíte global neste lote documental. Aprovações históricas não foram reapresentadas como novas.
