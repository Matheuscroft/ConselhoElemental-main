# Integração seletiva Fitness — 0.1.0

## Base e candidato

Base: commit `2c4abe7`, branch de trabalho `codex/fitness-ui-integration`.
Checkpoint anterior: `codex/pre-fitness-ui-integration`.
Candidato analisado: `/Users/fabioandre/Developer/app` (projeto-app-fitness).

A comparação revelou melhorias de legibilidade, textos em português, estados vazios,
componentes reutilizáveis e telas de atividade. A substituição integral foi rejeitada:
a cópia candidata não continha o mapa global, alguns assets de Yoga e mudanças mais
recentes nos componentes compartilhados. O candidato foi mantido intacto em código;
apenas suas dependências e artefatos locais de execução foram preparados.

## Aproveitado

- Seleção de treinos, prévia, sessão ativa, resumo, histórico, insights e resumo semanal.
- Painel diário em `/treinos/painel`, sem métricas fisiológicas inventadas.
- Componentes `src/components/fitness-kit`, adapters e formatadores em `src/lib/fitness-kit`.
- Raios `fit-*` adicionais no Tailwind. Cores e sombras existentes foram preservadas.

## Preservado e corrigido

- Stores, tipos, serviços, Supabase, dependências, imagens, CSS global e componentes compartilhados sem substituição.
- Avaliações e histórico corporal em `/treinos/corpo` preservados.
- `/mapa`, navegação global e `/treinos/preview/:workoutId` mantidos; `/treinos/plano/:workoutId` é um alias compatível.
- Acesso ao mapa no novo shell e ao painel no catálogo de rotas.
- Força, Terra acumulado, avaliação média e total de treinos preservados no hub.
- Criar via `?novo=1` agora abre a prévia: no candidato, o fechamento do diálogo desfazia a navegação.
- Controle do cronômetro explicitamente rotulado como congelamento visual: não existe pausa persistida no contrato atual do store.
- Referência de 30 minutos do anel de exercício identificada como escala visual.
- Componentes antigos continuam disponíveis para Corpo e compatibilidade; sua remoção não faz parte desta integração.

## Validação executada

- Build TypeScript/Vite aprovado; lint sem erros, com quatro avisos preexistentes.
- 32 combinações: Treinos, Corpo, Insights, Semana, Histórico, Painel, Mapa e Santuário
  em 360, 390, 768 e 1440 px: conteúdo renderizado, sem pageerror e sem overflow horizontal.
- Navegador isolado: criar treino pelo botão central → prévia automática → iniciar →
  concluir série → recarregar preservando registro → finalizar → resumo → histórico.
  Sessão concluída e gamificação aplicada, sem erros de JavaScript capturados.
- Links `?source=yoga&exercise=tadasana` e `?source=calistenia` verificados.
- Mapa do novo shell abre o Santuário.
- Avaliação corporal criada nos Insights aparece no Corpo existente.
- IDs inexistentes em prévia (ambas URLs), sessão e resumo mostram estados vazios.
- Dados de teste permaneceram no perfil temporário do navegador, sem editar dados do usuário.

## Limitações

- Não houve comparação pixel a pixel com o Figma: limite do plano Starter já atingido.
- Autenticação e sincronização remota Supabase não foram testadas; validação foi offline.
- Quatro avisos de hooks e aviso de tamanho de chunks já existiam; não foram tratados com mudanças indiscriminadas.
- Não se promete ausência de regressões fora dos fluxos verificados. Compartilhamento nativo, múltiplas contas e fluxos cloud não foram exercitados.
- O Nemotron executou a auditoria e a cópia inicial, mas recebeu HTTP 429 antes de concluir.
  A integração e a verificação final foram concluídas nesta sessão. O relatório do modelo
  foi confrontado com arquivos e navegador; afirmações imprecisas não foram adotadas.
- Nenhum push, deploy ou alteração de banco remoto foi feito.

### Refinamento 0.1.1 — seleção e prévia (04/10/2026)
Categorias agora antecedem as estatísticas, preservadas em Meu progresso expansível. Prévia abre detalhes dos exercícios; títulos longos quebram linha. Build passou; lint sem erros, quatro avisos preexistentes. Fluxo completo validado em navegador isolado, incluindo persistência após recarga, histórico e gamificação. Detalhes da prévia e expansão de progresso testados. Seleção e prévia sem overflow horizontal em 360, 390, 768 e 1440 px. Capturas de 390 px inspecionadas. Próximo bloco: sessão ativa e resumo; depois painel, insights, semana e histórico. Fidelidade integral ao kit ainda não concluída.

### Refinamento 0.1.2 — sessão ativa e resumo (04/10/2026)
Progresso visível distingue séries concluídas e puladas. Músculos e recompensas permanecem disponíveis em seção expansível. Campos sem carga usam duas colunas. Avaliação aparece antes dos gráficos no resumo; títulos longos quebram linha. Build aprovado; lint com zero erros e os quatro avisos anteriores. Fluxo criar/iniciar/concluir série/recarregar/finalizar/histórico validado em navegador isolado, com persistência e gamificação. Sessão e resumo verificados em 360, 390, 768 e 1440 px sem overflow horizontal, sem erros de JavaScript; capturas mobile inspecionadas. Próximo bloco: painel e insights. Congelar relógio continua sendo apenas pausa visual, explicitada na tela.

### Refinamento 0.1.3 — painel e insights (04/10/2026)
Painel prioriza anéis e widgets. Acessos Meu corpo/Esta semana permanecem abaixo, com explicação dos recursos do jogo. Insights oferece Registrar nova avaliação após o primeiro registro, e medidas quebram linha. Build aprovado; lint sem erros e quatro avisos preexistentes. Navegador isolado confirmou registro de 75 kg compartilhado com Corpo, reabertura do formulário, links existentes e estados inválidos. Painel e insights sem overflow em 360/390/768/1440 px; capturas mobile inspecionadas e sem pageerrors. Próximo bloco: resumo semanal e histórico.
