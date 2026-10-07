## 0.1.11 — 05/10/2026

- Formulários de criação de treino e avaliação corporal anunciam seus títulos reais para leitores de tela.
- Associação explícita de títulos preserva o componente compartilhado e demais diálogos.

## 0.1.10 — 05/10/2026

- Painel identifica widgets semanais; indicadores permitem quebra de texto.
- Insights informa data real da avaliação corporal.
- Variantes Fitness para avaliação e detalhes, preservando tema padrão fora do módulo.
- Estrelas: alvos de 44px, tema Fitness e navegação por setas/Home/End.

## 0.1.9 — 05/10/2026

- Fundo aurora global decorativo com estrelas determinísticas, camadas adaptadas ao celular e movimento reduzido.
- Layouts transparentes preservam cartões, navegação e rolagem. Removido fundo duplicado do AppLayout.

## 0.1.8 — 05/10/2026

- Sessão: exercícios inteiramente pulados têm ícone próprio; transições do acordeão respeitam movimento reduzido.
- Ilustrações de exercício exibidas inteiras, sem corte.
- Resumo: histórico e distribuição muscular agrupados em seção expansível, preservando métricas e avaliação.

## 0.1.7 — 05/10/2026

- Seleção de treino: contagem real de exercícios e orientação contextual; CTA distingue montar de abrir treino.
- Prévia: dificuldade/duração legíveis e orientação para detalhes do exercício.
- Categorias: nomes longos e movimento reduzido. Sem alterações no core ou dados.

## 0.1.6 — 2026-10-04

- **Correção de regressões da auditoria visual:**
  - WorkoutSelect: botão "Continuar sessão" restaurado para sempre visível quando há sessão ativa, independente de categoria selecionada ou lista de treinos planejados.
  - WorkoutSelect: removido truncamento `.slice(0, 8)` no catálogo de exercícios dentro de "Mais opções" - todos os exercícios filtrados são acessíveis ao expandir.
  - HealthDashboard: restaurados botões "Meu corpo" e "Esta semana" com explicação compacta sobre Stamina/Prana e referência visual de 30min.
- Build e lint verificados: 0 erros, 4 warnings preexistentes em Ciclos.tsx e temporal/*.tsx.
- Metadados sincronizados: package.json e package-lock.json → 0.1.6.

## 0.1.5 — 2026-10-04

- Histórico: removido botão sticky que se sobrepunha a navegação inferior; acesso "Ver todo o histórico" agora via header (ação "Ver tudo" quando mês vazio) e empty state.
- WorkoutHistoryCard restaurado para layout em linha em 360px+: badge esquerda, nome/métrica quebram no centro (min-w-0), data à direita com max-width; removido flex-col mobile.
- Metadados de versão sincronizados: package.json e package-lock.json → 0.1.5.

## 0.1.4 — 2026-10-04

- Resumo semanal (HealthWeeklySummary): layout responsivo para 360px+; nomes de dia quebram linha; sparkline condicional (apenas dias com ≥2 séries); link superior "Ver histórico" em vez de "Ver tudo".
- Histórico (WorkoutHistory + WorkoutHistoryCard): card responsivo (flex-col mobile / flex-row ≥sm); nome e métrica quebram linha; data à direita preservada; ações contextuais em estados vazios (mês vazio → "Ver todo o histórico", nenhum treino → "Iniciar treino"); botão sticky "Ver todo o histórico" ao final da lista.

## 0.1.3 — 2026-10-04

- Painel prioriza anéis e widgets, com acessos corporais e semanais abaixo.
- Insights permite registrar novas avaliações após o primeiro registro.
- Medidas corporais não são truncadas; link semanal tem rótulo explícito.

## 0.1.2 — 2026-10-04

- Sessão mostra progresso com séries concluídas e puladas separadas.
- Músculos e recompensas ficam em seção expansível; campos se adaptam ao tipo de exercício.
- Avaliação ganha destaque no resumo; nomes longos permanecem legíveis.

## 0.1.1 — 2026-10-04

- Seleção prioriza categorias; estatísticas preservadas em Meu progresso.
- Prévia permite consultar detalhes dos exercícios antes de iniciar.
- Títulos longos quebram linha; mudança de categoria recolhe o catálogo expandido.

# Changelog

## 0.1.0 — 2026-10-04

- Integração seletiva do Health UI Kit nas telas de seleção, prévia, sessão, resumo, histórico, insights e semana; novo painel diário.
- Componentes e adapters isolados em fitness-kit, mantendo stores, dados, avaliações corporais, assets e navegação global existentes.
- Compatibilidade com URLs de prévia existentes e filtros Yoga/Calistenia.
- Correção do redirecionamento ao criar treino pelo botão central; preservação das métricas de progresso no hub.
- Cronômetro com descrição explícita da pausa apenas visual e referência de 30 minutos identificada no painel.
