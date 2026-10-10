## 0.1.21 — 10/10/2026

- Entrada portável do Astro Boy para Fábio/frontend e Matheus/backend: regras Codex/Cursor/Claude, perfil local explícito, apresentação inicial e comandos status/welcome/ack.
- Skills Astro Boy, backend e versionamento incluídas no Git com as cinco skills existentes; índice/guia de colaboração usam contratos versionados, sem depender do caminho absoluto de Fábio.
- Auditoria recursiva das pastas e inventário reproduzível; removidos metadados macOS e regra ignore duplicada. Removida dependência de desenvolvimento kimi-plugin-inspect-react sem consumidores, reduzindo lockfile em 99 pacotes; versões das dependências mantidas.
- Credenciais, perfis locais, dependências e builds permanecem fora do Git. Publicação autorizada no repositório Matheuscroft/ConselhoElemental-main.

## 0.1.20 — 10/10/2026

- Catálogos coerentes para corrida, natação, ciclismo e sete artes marciais, mantendo legado. Modalidade filtra atividades; mistura exige escolha explícita. Ficha, preview, ativo e resumo no padrão Fitness mobile/tablet.
- Registro de tempo ativo, esforço, distância e descrição; perfil muscular personalizado validado em 100%. Carga percebida e distribuição estimada só de blocos concluídos; unidade legada corrigida e gráficos Saúde alimentados por observações.
- Recompensas novas usam observações com fórmula versionada e ledger idempotente, sem recalcular histórico. Native não gera recordes de força/volume em kg fictícios. Terra permanece atribuição física canônica; porcentagens musculares são estimativas explicadas.
- Detalhes e limites em MODALIDADES-E-METRICAS-TREINO.md; evidência de build/lint/navegador em fitness-modalities-20261010.

---

## 0.1.19 — 09/10/2026

- Reformula Criar treino para celular/tablet: tipografia consistente com Fitness, campos uniformes, resumo dos exercícios e configurações recolhíveis, catálogo com metadados e seleção clara; ação de conclusão e orientação sempre visíveis.
- Calendário em português, remoção de data e foco restaurado ao fechar. Edição numérica permite substituir valores sem reposição prematura do mínimo, preservando a validação existente.
- Evidências reais em fitness-create-20261009: busca/filtros/seleção/remoção em 360/390/768, data/duas séries salvas e fluxo de criação até histórico em 390. Stores, regras e dados preexistentes preservados.

---

## 0.1.18 — 09/10/2026

- UI02-B: seis ícones da própria referência em Escolher treino; Corrida, Calistenia/Core Training, Natação, Artes marciais, Yoga e Ciclismo. Rótulos portugueses e Corrida selecionada inicialmente.
- Quatro novas categorias conectadas ao formulário existente, sem alterar stores ou inventar exercícios/sensores; mapas tipados compatíveis e catálogo anterior preservado.
- Build e lint passaram (quatro avisos preexistentes); seleção em 360/390/768, categorias no formulário e fluxo Yoga com retomada/persistência/finalização em 390 verificados. Evidências em fitness-icons-20261009.

---

## 0.1.17 — 09/10/2026

- UI02-A: seleção de treino com canvas sólido, cards proporcionais alternados, seleção por contorno violeta e navegação compacta no header. Celular primeiro; tablet/PC usam composição centralizada com limite de 576px, sem sidebar nesta página.
- Mantidos catálogo real, criação, filtros de origem, detalhes, planos e continuar sessão. Seis modalidades da imagem não foram inventadas; aplicação atual tem Yoga e Calistenia.
- Build passou; lint 0 erros/4 avisos preexistentes; navegação e ações da seleção em 360/390/768/1024, largura de tablet conferida a 1440px. Fluxo de treino temporário com criação/retomada/reload/finalização/histórico passou. Evidências em conselheiro-backups/fitness-select-20261009.

## 0.1.16 — 09/10/2026

- UI01: integra Corpo à casca/navegação fitness-kit; silhueta neutra proporcional compartilhada com Insights, medidas reais e estados vazios, evolução do peso, todas as avaliações e acesso a resumos de sessões reais. Textos em português e Saúde ativa também em Corpo.
- Restaura foco ao fechar o formulário de avaliação, após falha reproduzida. Campos e operações existentes preservados; nenhum store/regra/dado alterado.
- Build passou; lint 0 erros/4 avisos preexistentes. Navegador temporário: seis páginas em 360/390/768/1440 sem overflow/pageerrors, nove campos de avaliação e retorno de foco; treino criado pela UI com continuar/reload/finalização/histórico. Estados corporais preenchidos/exclusão não testados por falta de medidas reais autorizadas.
- Integração completa do kit continua em etapas; esta versão entrega o primeiro lote de Saúde, sem publicação.

## 0.1.15 — 09/10/2026

- I03: protótipo local em Invocar para enviar texto com consentimento, receber sugestão de título/descrição e confirmar manualmente a criação pelo fluxo existente de rascunhos. Segundo o relatório do lote, 7 testes Deno com dependências simuladas, build e navegador passaram; lint teve 0 erros e 4 avisos preexistentes. Sem chamada live, secrets ou deploy.

## 0.1.14 — 09/10/2026

- I02: reduz margem da lista da sessão Fitness abaixo de 375px, corrigindo encobrimento reproduzido de Concluir série em 360px; preserva margem anterior a partir de 375px, regras e dados.
- Reteste informado pelo executor: clique, continuar, reload, finalizar e histórico em 360/390/768/1440px, sem overflow/pageerrors no cenário de um exercício/uma série.

## 0.1.13 — 08/10/2026

- Corrige a sobreposição das colunas de equipamentos do Santuário a partir de 640px, restringindo a ancoragem esquerda à coluna correspondente. Sem alteração de regras ou dados.

## 0.1.12 — 06/10/2026

- Santuário: palco central do mago, seis espaços laterais de equipamento e HUD compacto inspirado na referência.
- Recursos existentes preservados; espaços informam explicitamente ausência de inventário conectado.

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
