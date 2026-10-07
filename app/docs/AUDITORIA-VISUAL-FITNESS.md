# Auditoria Visual - Fitness UI Kit
Data: 2026-10-04
Versão analisada: 0.1.5

## Metodologia
Comparação visual entre:
- **Referências**: `/Users/fabioandre/Pictures/PRINT/Fitness-app/` (8 capturas do Figma)
- **Implementação atual**: Capturas em 390x844px do app rodando em http://127.0.0.1:5174
- **Normalização**: Área útil comparada em ~390px CSS, excluindo status bar e elementos do sistema

## Resumo executivo

### Estados das telas
| Tela | Status | Observações |
|------|--------|-------------|
| 1. Seleção | ⚠️ Funcional com diferenças | Grid simplificado, só 2 categorias |
| 2. Preview | ❌ Erro | Rota retorna "treino não existe" |
| 3. Sessão ativa | ❌ Erro | Rota retorna "sessão não existe" |
| 4. Resumo | ❌ Erro | Rota retorna "sessão não existe" |
| 5. Painel | ✅ Funcional com adaptações | Métricas personalizadas, widgets diferentes |
| 6. Insights | ✅ Funcional vazio | Estrutura correta, aguardando dados |
| 7. Semana | ✅ Funcional vazio | Estrutura correta, aguardando dados |
| 8. Histórico | ✅ Funcional vazio | Empty state correto |

### Prioridades de correção
**P0 - Bloqueadores**: Preview e sessão ativa retornando erro  
**P1 - Visual crítico**: Grid de seleção muito simplificado, painel com elementos extras  
**P2 - Refinamento**: Validar detalhes visuais com dados reais

---

## 1. Seleção de Treino (/treinos)

**Referência**: `21.26.22.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/1-selecao.png`

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Layout** | Grid 2 colunas, 6 cards com alturas alternadas | Grid 2 colunas, apenas 2 cards | P1 |
| **Categorias** | Running, Core Training, Pool Swim, Martial Arts, Yoga, Cycling | Yoga, Calistenia | P1 |
| **Seleção** | Card selecionado com borda violeta ~3px, sem deslocar layout | Mesma implementação observada | ✓ |
| **CTA** | Botão "Start" pill grande, ativo | Botão "Iniciar" desabilitado (cinza) | P2 |
| **Elementos extras** | Apenas título e grid | Seção "Meu progresso" com collapse | P1 |
| **Título** | "Select Workout" centralizado | "Escolher treino" alinhado à esquerda | P2 |

### Análise
- Grid está funcional mas muito simplificado
- Seção de progresso não existe na referência e empurra o grid para baixo
- Faltam categorias reais do sistema (a implementação usa apenas Yoga/Calistenia filtradas)
- Estrutura de cards e espaçamento seguem o padrão

### Recomendação
**P1**: Remover ou minimizar seção "Meu progresso", mostrar todas as categorias disponíveis no grid (não apenas filtradas), ajustar alinhamento do título

---

## 2. Preview do Treino (/treinos/preview/:workoutId)

**Referência**: `21.27.06.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/2-preview.png`

### Status: ⏳ Requer dados de teste criados pela UI

**Nota**: O teste inicial com ID fictício `yoga-flexibilidade` retornou erro porque a validação da store exige IDs no formato `workout-<uuid>` gerados pelo sistema. Isso não é um defeito - é a validação correta de propriedade de dados.

Para validar esta tela:
1. Criar treino pela UI (botão "Iniciar" após selecionar categoria)
2. Usar o ID real retornado pela store
3. Verificar composição, hero com overlay, badges de dificuldade/duração

### Especificação da referência
- **Hero**: ~200-230px com overlay violeta gradiente, imagem de fundo
- **Conteúdo**: Curva assimétrica superior (~52px), nome do treino + duração no canto
- **Badges**: Dois pills (Difficulty •••, Duration •••) com fundo lavanda
- **Programa**: Seção "Program" com cards de exercícios (ícone circular lavanda, nome, tempo)
- **CTA**: Botão "Start workout" pill grande

### Ação necessária
**P2**: Executar teste com IDs reais criados pela UI

---

## 3. Sessão Ativa (/treinos/ativo/:sessionId)

**Referência**: `21.27.20.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/3-sessao.png`

### Status: ⏳ Requer dados de teste criados pela UI

**Nota**: Mesma situação do preview - requer ID formato `session-<uuid>` gerado ao iniciar treino pela UI. A validação está correta.

Para validar:
1. Criar e iniciar treino pela UI
2. Usar sessionId real retornado
3. Verificar composição, cards expansíveis, progresso

### Especificação da referência
- **Header**: Nome do treino + tempo restante em violeta ("15min left")
- **Exercícios**: Cards expansíveis com estados distintos (pendente cinza, ativo card elevado, concluído com check)
- **Progresso**: Barra verde horizontal 4-6px na base de cada card
- **Expansão**: Card ativo pode mostrar vídeo/imagem com overlay de play
- **Controles**: Chevron para expandir/colapsar

### Ação necessária
**P2**: Executar teste com session ID real

---

## 4. Resumo (/treinos/resumo/:sessionId)

**Referência**: `21.27.31.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/4-resumo.png`

### Status: ⏳ Requer dados de teste criados pela UI

**Nota**: Mesma validação - requer sessionId real de treino concluído.

Para validar:
1. Completar fluxo: criar → iniciar → concluir série → finalizar
2. Acessar resumo com sessionId real
3. Testar reload (não deve conceder recompensas novamente)
4. Verificar composição de métricas e gráficos

### Especificação da referência
- **Header**: Título "Summary" + botão share circular violeta no canto
- **Identidade**: Ícone circular + nome + horário do treino
- **Métricas**: Grid 2x2 direto no canvas (Total time, Avg Heart Rate, Active Calories, Total Calories)
  - Labels em violeta claro ~15px
  - Valores grandes brancos ~32-42px
- **Gráficos**: Card com gráfico de barras (Heart rate) em coral/vermelho
- **CTA**: "Save workout" pill grande

### Ação necessária
**P2**: Executar teste completo de fluxo

---

## 5. Painel (/treinos/painel)

**Referência**: `21.28.29.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/5-painel.png`

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Saudação** | "Hello John" | "Olá, Mago Iniciante" | ✓ Adaptação válida |
| **Anéis** | Sleep (verde), Exercise (laranja), Water (azul) | Stamina (verde), Exercício (laranja), Prana (azul) | ✓ Adaptação válida |
| **Legenda anéis** | Labels curtos à direita (7h30m, 2h30m, 1.5L) | Labels à direita (60/60, 0min, 0/0) | ✓ |
| **Widgets** | 2 cards: "Heart rate" + "Sleep cycle" | 2 cards: "Volume" + "Atividade" | P1 |
| **CTA principal** | "New widget" pill grande | Sem equivalente | P2 |
| **Ações extras** | Não existem | 2 botões: "Meu corpo", "Esta semana" | P1 |
| **Texto explicativo** | Não existe | Parágrafo sobre o anel usar 30min | P1 |
| **Ícone superior** | Não existe | Ícone com estrela no canto superior direito | P2 |

### Análise
- **Adaptações legítimas**: Anéis personalizados para o contexto do jogo (Stamina/Prana vs Sleep/Water) são apropriados
- **Diferenças visuais**: Widgets completamente diferentes (Volume/Atividade vs Heart rate/Sleep cycle)
- **Elementos extras**: Botões e texto explicativo não existem na referência e empurram os anéis para baixo
- **Hierarquia**: Card de anéis deve ser mais dominante, ocupando mais espaço vertical

### Recomendação
**P1**: 
- Remover ou reposicionar botões "Meu corpo" e "Esta semana" (podem ir para header ou outro local)
- Remover texto explicativo (substituir por tooltip ou ajuda contextual se necessário)
- Avaliar se widgets Volume/Atividade fazem sentido ou devem mostrar outras métricas
- Aumentar protagonismo do card de anéis

---

## 6. Insights (/treinos/insights)

**Referência**: `21.28.41.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/6-insights.png`

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Card corpo** | Silhueta + grid 2x2 de medidas | Empty state: "Nenhuma medição registrada" | ✓ Estrutura correta |
| **Medidas** | 178cm, 70kg, 43%, 7h30m | N/A (vazio) | - |
| **Gráfico tendência** | Área violeta suave com dias da semana | Empty state com mensagem | ✓ Estrutura correta |
| **Ação Ver tudo** | "Show all" no canto superior direito | "Ver semana" no mesmo local | P2 |

### Análise
- Estrutura visual está correta
- Empty states apropriados
- Layout e proporções seguem a referência
- Ação "Ver semana" é diferente de "Show all" mas pode ser adaptação válida

### Recomendação
**P2**: Testar com dados reais de medições corporais para validar composição completa

---

## 7. Resumo Semanal (/treinos/semana)

**Referência**: `21.28.56.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/7-semana.png`

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Gráfico principal** | 7 barras verticais finas com alturas variadas, label "7h" | Card com texto "Nenhum treino registrado" | ✓ Aguardando dados |
| **Cards diários** | 3 cards: dia + duração + sparkline verde | 1 card: "Domingo" + "Sem treino" | ✓ Aguardando dados |
| **Período** | "This week" | "Esta semana" | ✓ |

### Análise
- Estrutura correta, aguardando dados
- Componente de barras (BarTracks) existe no código
- Empty state adequado

### Recomendação
**P2**: Testar com dados reais de treinos para validar gráfico e cards diários

---

## 8. Histórico (/treinos/historico)

**Referência**: `21.29.13.png`  
**Captura atual**: `/tmp/fitness-audit-screenshots/8-historico.png`

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Período** | "March 2021" | "Outubro de 2026" | ✓ |
| **Cards** | 5 cards com ícone, nome, métrica violeta grande, dia | Empty state: "Nenhum treino registrado ainda." | ✓ Aguardando dados |
| **Métrica** | Calorias (220kcal, 562kcal...) em violeta grande | N/A | - |
| **Badge** | Ícone circular com fundo lavanda | N/A | - |

### Análise
- Empty state correto com CTA apropriado
- Estrutura aguardando dados

### Recomendação
**P2**: Testar com histórico real para validar composição dos cards

---

## 9. Bottom Navigation

**Presente em todas as telas**

### Diferenças encontradas

| Aspecto | Referência | Atual | Prioridade |
|---------|-----------|-------|------------|
| **Formato** | Pill de 68-76px de altura | Similar, pill escurecido | ✓ |
| **Botão central** | Circular 56-64px com + | Circular violeta com + | ✓ |
| **Ícones** | Home, Discover, +, Insights, Profile | Início, Treinos, +, Insights, Histórico | P2 |
| **Labels** | Visíveis embaixo dos ícones | Visíveis | ✓ |
| **Estado ativo** | Ícone violeta | Ícone violeta | ✓ |

### Análise
- Estrutura visual correta
- Destinos diferentes mas adaptados ao app (Treinos/Histórico vs Discover/Profile)
- Pode ser adaptação válida ao contexto

---

## Elementos visuais transversais

### Cores
| Token | Referência | Implementação | Status |
|-------|-----------|---------------|--------|
| Canvas | #101011 | A validar | - |
| Surface | #252B3A | A validar | - |
| Primary | #8582F2 | Observado correto | ✓ |
| Verde | #00C99A | Observado correto | ✓ |
| Texto principal | #F5F5F7 | Observado correto | ✓ |
| Texto secundário | #9A9AA4 | Observado correto | ✓ |

### Tipografia
- Títulos parecem corretos (~28-34px)
- Corpo de texto adequado (~15-17px)
- Métricas grandes precisam validação com dados reais

### Espaçamento
- Margens laterais: ~24px (correto observado)
- Gaps entre cards: ~16-20px (correto)
- Padding interno cards: adequado

### Border radius
- Cards: ~24-28px observado (especificado 18-32px)
- Botões pill: corretos
- Bottom nav pill: correto

---

## Próximos passos

### Fase 1: Corrigir bloqueadores (P0)
1. Investigar e corrigir rotas de preview que retornam erro
2. Criar ou ajustar sessões de teste para validação
3. Verificar lógica de validação de propriedade de treinos/sessões

### Fase 2: Ajustes visuais críticos (P1)
1. **Seleção**: Expandir grid com todas as categorias, remover/minimizar seção de progresso
2. **Painel**: Remover botões extras e texto explicativo, ajustar hierarquia dos anéis
3. Avaliar necessidade de widgets diferentes (Volume/Atividade vs referência)

### Fase 3: Validação com dados reais (P2)
1. Criar treino de teste completo e executar fluxo
2. Adicionar medições corporais para validar Insights
3. Gerar histórico de treinos para validar semana e histórico
4. Capturar e comparar telas populadas

### Fase 4: Testes de casos extremos
- Nomes longos de treino e exercícios
- Métricas com valores grandes
- Filtros entre meses no histórico
- Estados vazios em diferentes contextos

---

## Limitações desta auditoria

1. **Sem dados de teste**: Impossível validar composição completa de 3 telas (preview, sessão, resumo)
2. **Rotas com erro**: Bloqueio na validação de fluxo completo
3. **Comparação pixel-perfect**: Não realizada, apenas composição e hierarquia
4. **Medições exatas**: Valores aproximados visualmente, não medidos com ferramentas
5. **Estados interativos**: Não testados (hover, focus, animações)

## Conclusão

A implementação segue a estrutura geral do kit mas apresenta:
- **3 rotas bloqueadas** que impedem validação completa
- **Adaptações válidas** (métricas personalizadas do jogo)
- **Elementos extras** que desviam da composição de referência (painel)
- **Grid simplificado** na seleção que precisa expansão
- **Empty states corretos** onde não há dados

Fidelidade estimada atual: **~60-70%** (considerando bloqueadores e diferenças estruturais).
Fidelidade projetada após correções P0/P1: **~85-90%**.
