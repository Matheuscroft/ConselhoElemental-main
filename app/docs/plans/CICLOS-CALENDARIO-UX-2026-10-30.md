# Ciclos — escolha de datas — 0.1.117

30/10/2026 · Sol Médio · Astro Boy sequencial · checkout codex/fitness-ui-integration, base b11ed9d. Pedido do usuário após confirmar que Novo ciclo/Cancelar funcionou no painel estreito. O resultado é relato do usuário no computador; sem aceite independente ou celular real.

## Implementação

`CycleCalendarNavigation` separa abrir a data selecionada de “Voltar para hoje”. Setas continuam chamando os handlers existentes de navegação por sete dias. O cabeçalho identifica dia da semana, data por extenso e ação de escolher outra data. Seleção/Hoje mantêm normalização e atualização da janela existentes no pai.

O popover estreito foi substituído por Dialog existente, reutilizando o estilo de sheet de Ciclos no mobile. Mês em português com locale pt-BR já instalado; abre no mês selecionado e fecha após escolher um dia. Campo nativo de data + “Abrir dia” permite saltar para mês/ano distante, com erro sem perder o valor inválido. Cancelar não aplica o rascunho; reabrir começa na data selecionada. Fechar devolve foco ao seletor com preventScroll. Não adiciona limites de anos nem altera recorrências/atividades.

Frontend-design aplicado sobre tokens atuais, Cinzel e ouro elemental. Controles explícitos, alvos de 48px, dias de 44px, input de 16px, layout fluido e rolagem do Dialog existente. Preservados Expanded Cards e a lista de rotinas. Não foram adicionadas animações ou dependências novas. Identidade/foco/overflow no browser continuam pendentes; CSS não comprova a experiência visual.

## Verificação e limites

Cinco testes novos com React/elementos simulados: separar abertura/Hoje/janela, mês/locale e seleção única, data inválida/bissexto, cancelar/reabrir e callback de restauração de foco sem scroll. Logs `/tmp/cycle-calendar-focused-final.log`. PostCSS parseou ciclos.css (403 nós). Testes não simulam picker nativo/teclado virtual nem posicionamento real do Dialog.

Primeira checagem TypeScript apontou import ChevronRight não usado e WEEKDAYS ainda necessário em outra região; corrigidos sem mudança de regra. Primeiros checks globais passaram com 609 testes; após acrescentar restauração de foco e quinto teste, checks finais foram repetidos. Resultados finais: **610 testes aprovados** (`/tmp/cycle-calendar-all-reviewed.log`, 39,84s), TypeScript (`...-types-reviewed.log`), lint (`...-lint-reviewed.log`) e Vite envDir:false (`...-build-reviewed.log`, 44,01s). Avisos anteriores de bundle/Browserslist mantidos. De 560 entradas do baseline, 554 idênticas; seis diferenças restritas ao escopo reservado, whitelist/manifests somente versão. Versões/links/diff conferidos; custódia sequencial encerrada.

Baseline `/tmp/cycle-calendar-before.json`. Fontes anteriores alteradas somente Ciclos.tsx/ciclos.css e versionamento frontend/SQL não aplicado/manifests. Novo componente/teste separados. Não toca stores, serviços, regras de XP/Prana, recorrências ou progresso pessoal. Sem .env/secrets, conta remota, migração aplicada, deploy/push, browser/contorno ou subagentes. Gatilhos de lembretes/conta/restauração permanecem fechados. Sem bump por mera pendência: versão 0.1.117 corresponde à alteração funcional/visual efetiva.

## Aceite seguinte — Sol Médio

Usuário pode abrir Ciclos, tocar a data do cabeçalho, navegar meses/selecionar um dia e usar Hoje; conferir que Cancelar não seleciona a data digitada. Não concluir/excluir atividades. A versão mantém navegação de datas em memória como antes; não promete salvar essa escolha após reload fora dos links de entrada já existentes. Validação em 360/390/768px, picker, toque, teclado e foco real permanece pendente pelo bloqueio de inspeção. O harness de lembretes continua separado e não foi executado no navegador.

## Continuidade de data — revisão posterior

Callback de cartão altera a data em memória sem atualizar a URL. Execução isolada em `/tmp/cycle-calendar-url-review.json`: dia 30 + 1 → 31, nenhuma chamada navigate. A implementação também lê data de entrada pela URL; inferência: recarregar um link antigo pode desfazer a seleção manual. Não foi testado no browser. Correção integrada com deep links/retorno/virada do dia requer Sol Alto antes da edição; ainda não implementada. Produto 0.1.117 mantido.
