# R26-M2B — Hoje e Temporal: execução no celular — 0.1.107

29/10/2026 · Astro Boy sequencial · Sol Médio confirmado por Fábio · checkout `codex/fitness-ui-integration`, base `b11ed9d`. Continuação de [R26-M2A](R26-M2A-AGENDA-COMPATIVEL.md), com os contratos existentes. Sem mudança de stores, regras, dados pessoais ou release remoto.

## Entrega de interface

- **Semana:** sete dias compactos e agenda do dia diretamente na página. Próxima/anterior têm rótulos e controles de 48px declarados. “Ir para hoje” escolhe a data atual. Estatísticas completas ficam em “Resumo da semana”, sem esconder atividades atrás de um diálogo para cada consulta.
- **Mês:** grade compacta alinhada ao início da semana escolhido, em lugar de até 31 cartões grandes. Cada botão mantém os totais recebidos e abre o dia. Estatísticas permanecem em “Resumo do mês”; “Melhor dia” só aparece quando houve conclusão real, evitando premiar visualmente um dia vazio com zero pontos.
- **Dia:** `TemporalDayAgenda` é compartilhado por Semana e pelos diálogos de Mês/Calendário. As atividades vêm das projeções existentes, com links por ID. Um Ciclo já registrado no histórico não reaparece como pendência na mesma agenda. Compromissos externos/lembretes não recebem uma conclusão ou recompensa inventada. Registros de conclusão continuam acessíveis em disclosure, inclusive pontuação zero.
- **Retorno:** links para atividades carregam o endereço temporal com período/dia. `TemporalReturnLink` oferece “Voltar à agenda selecionada”. O destino é validado contra páginas temporais locais, sem aceitar URL externa. A reentrada preserva data/seleção; não é restauração de posição exata em pixels.
- **Navegação:** `useTemporalView` mantém período/dia na URL para Semana, Mês e Calendário. As trocas explícitas dentro da mesma página não chamam o reset de rolagem; entrada externa continua iniciando no topo. Estado de período foi estabilizado para não invalidar grids/requisições do calendário ao abrir outro dia do mesmo mês ou atualizar um campo sem relação com a data.
- **Ciclos de hoje:** acesso a “Planejar esta semana” com a data selecionada. O caminho `/ciclos?data=YYYY-MM-DD` agora seleciona o dia mesmo sem ID de atividade; o caminho anterior com `atividade` mantém sua seleção/filtro. Nenhum deles inicia ou conclui uma atividade.
- **Criação rápida:** Ciclos reutiliza `RecurrenceEditor` para diário, semanal, mensal e anual, com data final opcional. O formulário conserva os dados e a mensagem em falha, validando antes do comando; só fecha e altera a visualização após sucesso. Os padrões anteriores da criação rápida (`plannedPoints: 1`, tempo zero) foram mantidos. Sequências conservam o editor de dias e a rotação existentes. Textos/ícone do compositor passaram a representar uma atividade recorrente, sem sugerir que todo Ciclo é diário.

## Direção visual e acessibilidade

Aplicada a skill frontend-design com a identidade já aprovada: fundo escuro, ouro elemental, Cinzel nos títulos e tipografia de leitura nos comandos. A agenda é o conteúdo principal; contadores secundários ficam recolhidos. Não foram introduzidos novos efeitos contínuos ou bibliotecas.

Controles possuem nomes acessíveis, estados de seleção e foco declarado. Títulos longos quebram linha; o calendário compacto usa células de 88px de altura declarada. Em largura inferior ao mínimo da grade, o conteúdo tem rolagem horizontal local, sem ampliar a página. O diálogo recebeu descrição e organização comum da agenda, com limite de altura dinâmico e safe area. Essas são propriedades de código/CSS: **não são medições reais de hitbox, contraste computado, teclado ou overflow em dispositivo**.

## Preservação e limites

`src/stores/*`, `src/services/*`, tipos, App/main/bootstrap, helpers de agenda, recibos e cálculos permaneceram idênticos ao início por SHA-256: **87 fontes protegidas**. A exceção entre `src/lib` é apenas a whitelist de versão em `critical-progress`; a migration ainda não aplicada só ganhou 0.1.107 na mesma whitelist. Os gates de conta/restauração continuam false.

Não houve leitura de `.env`/secrets, dados pessoais do app, browser/contorno de permissão, chamada ao projeto Supabase, migração, deploy, commit/push ou subagentes. Preferência de início da semana continua usando o mecanismo de UI existente. Os caminhos de navegação são estado de apresentação, não uma persistência paralela de atividades. A evolução do cadastro anual legado, constância anual/rotações e qualquer novo contrato permanecem separados em Sol Alto.

## Verificações executadas

- **531 testes globais aprovados**, zero falhas: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`; `/tmp/r26-m2b-all.log`.
- **10 testes novos de frontend** aprovados em `/tmp/r26-m2b-mobile-final.log`, depois incluídos na global: datas/virada de ano, retornos seguros, estabilidade do mês, hook real com router/hooks substitutos, agenda/HTML, ausência de pendência duplicada, contagem zero, formulário rápido com store real isolado, entrada em Ciclos só por data e alinhamento/leap year da grade mensal. A passagem direcionada inicial teve 32 aprovados; a seguinte, com a entrada por data, 33. Esses números são históricos de conjuntos menores, não validação adicional de dispositivo.
- `npx tsc -b` aprovado: `/tmp/r26-m2b-types-complete.log`.
- `npm run lint` aprovado: `/tmp/r26-m2b-lint-complete.log`.
- Vite `build({ envDir: false })` aprovado em **8,43s**: `/tmp/r26-m2b-build.log`. Avisos existentes de tamanho de chunks e Browserslist permanecem.
- CSS analisado com PostCSS: **173 regras, 5 media queries**, `/tmp/r26-m2b-css.json`. É análise sintática; não mede o layout.
- Baseline `/tmp/r26-m2b-before.json`, diff do lote `/tmp/r26-m2b-scoped.diff` e conferência de preservação `/tmp/r26-m2b-preservation.json`; versões/links/diff-check conferidos no encerramento.

A revisão detectou rejeição de memoização manual pelo lint React Compiler; o hook passou a usar cache de apresentação guardado pela chave da data, sem desativar a regra. A estabilidade de referência é executada em teste, inclusive ao trocar o dia dentro do mesmo mês. Um teste novo de geometria esperava `aria-hidden` como booleano em vez da string emitida pelo JSX; corrigido e aprovado. Não foram ocultadas falhas nem registrados esses logs intermediários como aceite final.

Sem execução no navegador: os testes usam handlers, stores em memória, router/hooks sintéticos e SSR conforme o cenário. Não comprovam foco/rolagem/teclado reais, fluidez ou fidelidade a 360/390px e tablet. **O aceite visual continua pendente.**

## Próximo lote

**R26-M2C, manter Sol Médio:** refinar os formulários e a hierarquia visual restantes de Calendário/Ano, reduzir atrito na gestão dos lembretes e completar a matriz de navegação/retorno. Quando o acesso ao navegador estiver disponível, percorrer a matriz real de celular/tablet. Não contornar o bloqueio nem criar atividades fictícias no perfil pessoal.

Não considera fechados: QA visual, navegação temporal completa entre todas as abas (Ano/Lua/Estações não receberam estado de URL neste lote), constância histórica/anual, conversão de anuais legados, inventário/fragmentos ou conta hospedada. Animações futuras continuam vinculadas a eventos/recibos reais, preservando movimento reduzido.
