# R26-B — comandos claros e leitura da rotina

25/10/2026 · 0.1.66 local · Astro Boy, execução sequencial.

## Pedido e base preservada

Fábio confirmou que o alvo é Ciclos de hoje, apesar do Santuário aberto, e pediu abertura do app no Codex para acompanhar. Retomada em codex/fitness-ui-integration, commit 88c9021, com R26-A/0.1.65 ainda local. Alterações preexistentes preservadas; esta entrega continua o refinamento, sem marcar todo o projeto como concluído.

## Mudanças

- Ciclos comuns e ciclos atuais de sequências não fitness usam ações explícitas Iniciar e Concluir. Quando concluídos, mostram Concluído e Desfazer. Ações chamam os mesmos comandos anteriores; nenhuma conclusão automática ou recompensa visual inventada.
- O botão de conclusão saiu da lateral do título. Nome/descrição ganham largura e mantêm o menu de gestão separado. A identidade do elemento aparece na borda, a partir do elemento já calculado na página.
- Expansão de subitens virou uma linha inteira de toque, com contagem e indicador de progresso fornecidos pela página. A expansão persistida existente é preservada.
- Busca e estados continuam expostos. Elemento e ordenação compartilham um disclosure nativo recolhível; menos controles permanentes. Composição por children, sem estado de filtro paralelo.
- Etiquetas com texto de 12px, botões de execução com 48px de altura e campos de 16px. Ícones acompanham texto nas ações principais. Transições apenas de interação, com movimento reduzido respeitado.
- Widgets de treinos e calendário Expanded Cards preservados. Os handlers de tempo, conclusão/desmarcação, recorrência, criação e ordenação não foram reescritos.

Novos componentes: CycleExecutionActions e CycleSubitemsToggle. Nenhuma dependência, asset, store ou infraestrutura adicionada. Revisão React local: componentes de apresentação sem efeitos ou assinaturas, callbacks explícitos, sem escrita no render e CSS restrito a Ciclos.

## Verificações realmente executadas

| Verificação | Resultado |
| --- | --- |
| node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs | 141 testes passaram, zero falhas |
| tsc -b | Passou após correção de um rótulo de menu que referenciava habit no ramo sequenceHabit |
| npm run lint | Passou |
| Vite build com envDir:false | Passou em 12,23s |
| Comparação AST contra /tmp/conselho-r26b-Ciclos.tsx | 367 inicializadores anteriores preservados; excluídos componente externo e renderChildHabits por conter JSX alterado |
| git diff --check | Passou |
| Diff src/stores, src/services, src/types e supabase | Vazio |

Os três testes novos verificam despacho exclusivo de Iniciar/Concluir/Desfazer com stopPropagation, estado/callback da expansão e posição da ordenação dentro do disclosure. Somam-se aos quatro testes da rotina de R26-A. Nenhum deles substitui teste integrado de criação/conclusão no navegador.

Avisos de chunks grandes e base Browserslist antiga continuam. Não atualizamos dependências para silenciar avisos.

## Prévia e limites

A ferramenta open_in_codex recebeu /ciclos com placement right e retornou queued. Não afirmou que a página já estava visível. lsof não encontrou listener em 5173; o servidor Vite foi iniciado com envDir:false, host 127.0.0.1 e strictPort, anunciando http://127.0.0.1:5173/. O servidor ficou ativo para acompanhamento do usuário. Isso comprova inicialização, não renderização.

O bloqueio anterior de inspeção do navegador não foi contornado; não foram capturadas telas novas nem realizados testes de toque em dados pessoais. QA pendente em 360/390px e 768px: nomes extensos, menu, filtro e ordenação, fluxo iniciar/concluir/desfazer, expansão de três níveis, foco ao mudar estado e teclado no compositor, sem sobreposição da navegação inferior. Fazer ações de escrita apenas com dados isolados de teste.

## Continuidade

Reservas encerradas, documentação revisada pelo coordenador; revisão independente pendente. Versões package/lock e changelog sincronizadas em 0.1.66. Sem commit/push/deploy. Dados pessoais não exportados. Próximo: aceite visual/interações da rotina e retomada de R25-A/B para backup verificável e conta segura com Matheus. R19, R12-D/E e QA integrado seguem na fila.
