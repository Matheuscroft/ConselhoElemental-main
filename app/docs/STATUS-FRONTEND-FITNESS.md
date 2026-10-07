# Estado do frontend

## Situação atual — 0.1.11

A/B entregues em incrementos 0.1.7/0.1.8; aurora global 0.1.9 preservada. C/D receberam acabamento em 0.1.10: data da avaliação, seção semanal, rótulos sem truncamento, variantes Fitness de avaliação/detalhes e teclado nas estrelas. Novo treino já utilizava tokens Fitness e foi preservado.

Build aprovado (aviso de chunks); lint 0 erros/4 avisos anteriores. Testes atuais: criar treino, prévia, registrar série, recarregar, finalizar, avaliar por teclado, histórico; avaliação corporal pela UI e persistência. Quatro páginas de saúde em 360/390/768/1440 sem overflow/pageerrors. Revisão visual de insights e formulário 390px realizada. Scripts e capturas em /Users/fabioandre/Developer/conselheiro-backups/fitness-020/.

Não declarar encerramento integral ainda: cobertura histórica de múltiplos meses, duas avaliações/compatibilidade com Corpo, catálogo completo e revisão visual de todos os estados permanecem a concluir. Sem alterações em stores, domínio ou backend. Registros abaixo são histórico e não substituem esta situação.

0.1.11: títulos acessíveis explícitos nos formulários de treino e avaliação corporal, confirmados no navegador interno como “Criar Treino” e “Registrar avaliação corporal”. Build aprovado; lint 0 erros/4 avisos anteriores. Catálogo de 24 exercícios e passagem do último item para o formulário verificados sem salvar dados no perfil real. Painel mantido aberto na porta 5174. Checkpoint em /Users/fabioandre/Developer/conselheiro-backups/fitness-021/. Histórico entre meses e duas avaliações isoladas continuam pendentes.

# Histórico de execução

Base 0.1.6, branch codex/fitness-ui-integration. Preparação pelo Codex em 04/10/2026.

- Backup e smoke reutilizável: /Users/fabioandre/Developer/conselheiro-backups/frontend-handoff-016/.
- Recursos da seleção e atalhos/contexto do painel restaurados.
- O relatório anterior não comprova validação completa. O roteiro atual prioriza acabamento visual com evidências.
- Próximo item: bloco A de FINALIZAR-FRONTEND-FITNESS.md; leia referências de seleção/preview e capture estados atuais antes de decidir mudanças.
- A/B/C/D aguardam execução do roteiro atual. As telas já existem; avaliar acabamento antes de alterar.

Após cada bloco registre alterações, arquivos, comparações visuais, testes, caminhos de evidências e próximo item. Não marque testes não executados como aprovados.

## Verificação do preparo pelo Codex

Smoke reutilizável executado com sucesso nesta preparação: criação pela UI, preview, sessão ainda ativa, série concluída, reload com persistência, finalização, resumo e histórico. Doze capturas fullPage (preview/active/summary × 360/390/768/1440) no diretório externo; nenhum pageerror/overflow detectado nesses estados. JSON smoke-5174.json e smoke.log no mesmo diretório. Não equivale à aprovação visual de todo o kit nem prova isoladamente recompensas não duplicadas.

Atalho Abrir-CLAUDE-Projeto.command atualizado para o roteiro de implementação; sintaxe zsh validada. Nenhuma fonte do frontend modificada neste preparo.

## Troca de rota de IA

Em 04/10/2026, por solicitação do usuário, DEV_FITNESS passou a usar gemini/gemini-3.7-flash. Sonnet/KiRo retornou limite mensal; NVIDIA/Nemotron repetia erro interno. A nova rota respondeu HTTP200 com eventos Anthropic de streaming completos e respondeu a chamada com imagem. A chamada não streaming retornou formato OpenAI, portanto a compatibilidade completa do executor ainda precisa ser confirmada. Backup da configuração anterior em /Users/fabioandre/Developer/conselheiro-backups/DEV-FITNESS-before-gemini-switch.json. Não alterar fontes do app para resolver falhas do provedor.

## 05/10/2026 — Parte A, incremento 0.1.7

Plano em partes autorizado: A seleção/prévia; B sessão/resumo; C painel/insights/semana/histórico; D formulários, detalhes e revisão integrada. Executar um lote por vez, sem modificar o core durante acabamento visual.

Implementado primeiro incremento A: categorias mostram contagem real; orientação explica seleção; CTA informa Montar treino/Ver treino conforme destino. Prévia mostra dificuldade e duração em texto, além das cápsulas; programa explica abertura dos detalhes. Categorias respeitam movimento reduzido e quebram nomes longos. Direção preservada: canvas escuro, superfície azul-acinzentada, violeta, fonte sans e cartões da referência; identidade elemental existente mantida.

Verificação: build aprovado (aviso de chunks grandes); lint 0 erros/4 avisos anteriores. Smoke criação→prévia→sessão→série→reload→finalização→resumo→histórico aprovado em perfil isolado. Prévia/sessão/resumo capturados em 360/390/768/1440, sem pageerror ou overflow nos estados testados. Um seletor experimental Puppeteer de categoria expirou; substituído por seleção DOM e asserção do CTA, sem alteração do app por causa do teste.

Evidências e checkpoint: /Users/fabioandre/Developer/conselheiro-backups/ui-phase-a-017/. before.tar.gz; select-before.png; preview-before.png; capturas posteriores e smoke-5174.json. Revisão visual da prévia em 390px realizada. Não equivale à fidelidade completa: cabeçalho ainda usa fundo abstrato e nenhuma fotografia foi inventada.

Próximo lote: parte B, comparar sessão/resumo com referências e corrigir diferenças observáveis, preservar cálculo e ledger. A etapa A entregue aqui é um incremento de clareza e acessibilidade, não declaração de conclusão de todo o frontend. Versionamento 0.1.7 em package.json, package-lock.json e docs/CHANGELOG.md.

## 05/10/2026 — Parte B, incremento 0.1.8

Sessão/resumo: estado visual próprio para exercício com todas as séries puladas (SkipForward, sem check de concluído); acordeão respeita movimento reduzido; ilustrações usam object-contain para preservar demonstração inteira. Resumo mantém métricas e avaliação em destaque; históricos e distribuição muscular continuam disponíveis em seção expansível. Nenhum store, cálculo ou dado do usuário alterado.

Validação: build aprovado (aviso de tamanho de chunks), lint 0 erros e 4 avisos anteriores. Smoke com série concluída e cenário adicional com série pulada passaram: persistência após reload, finalização, resumo, histórico; seção Evolução abre. Capturas em 360/390/768/1440 sem overflow ou pageerror nos cenários. Revisão visual do resumo em 390px realizada. Não prova ausência de regressões fora desses cenários nem valida recompensas numericamente.

Evidências/checkpoint: /Users/fabioandre/Developer/conselheiro-backups/ui-phase-b-018/ (before.tar.gz, smoke.mjs, skip-check.mjs, smoke-5174.json, skip-5174.json, PNGs). Referências antes: ui-phase-a-017/active-390.png e summary-390.png.

Próximo lote: C, painel e indicadores de saúde, começando por HealthDashboard e HealthInsights. Comparar referências e usar apenas dados existentes; não criar frequência cardíaca/calorias/água fictícias. B é incremento de UX, não certificação de fidelidade integral do kit.

## 05/10/2026 — Aurora global 0.1.9

Pedido de fundo global priorizado durante C. Componente src/components/ui/aurora-background.tsx aplicado em main.tsx; fundo anterior do AppLayout removido, cascas Fitness/Auth/Onboarding transparentes. CSS com gradientes radiais sem blur pesado, estrelas estáveis, menos camadas em mobile, movimento reduzido. Conteúdo mantém semântica/rolagem, decoração aria-hidden e sem interceptar cliques. Sem novas dependências.

Build passou; lint 0 erros/4 avisos anteriores. Evidências em /Users/fabioandre/Developer/conselheiro-backups/aurora-019/. Servidor 5174 reiniciado por estar indisponível. Fase C (painel/insights) ainda pendente; nenhum incremento de saúde declarado concluído.

## Validação acompanhada no navegador interno — 05/10/2026

App respondendo HTTP200 na porta 5174, painel aberto e mantido visível no navegador interno. Catálogo expandido: 24 exercícios acessíveis. Último item (Burpee Controlado) abriu detalhes e Adicionar ao treino abriu formulário com exercício selecionado e categoria Calistenia. Cancelamento retornou sem salvar; painel mantido aberto. Nenhum dado de teste adicionado ao perfil do usuário.

Achado de acessibilidade: formulário anuncia nome genérico “Dialog” por título oculto padrão em components/ui/dialog.tsx. Registrar correção local dos nomes acessíveis antes de encerrar D. Histórico entre meses e duas avaliações em perfil isolado ainda pendentes; esta verificação não os substitui. Versão mantida 0.1.10, sem alteração de código neste lote.
