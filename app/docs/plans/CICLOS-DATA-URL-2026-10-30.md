# Ciclos — continuidade da data na URL — 0.1.118

30/10/2026 · Sol Alto confirmado · Astro Boy sequencial · codex/fitness-ui-integration, base b11ed9d. Continuação de [calendário UX](CICLOS-CALENDARIO-UX-2026-10-30.md). Sem browser: inspeção anteriormente recusada não retentada.

## Falha e correção

Diagnóstico anterior executou callback de cartão isolado: dia 30 → 31 sem chamada navigate (`/tmp/cycle-calendar-url-review.json`). O leitor de entrada continuava usando a query antiga, portanto havia risco de restaurar a data anterior ao recarregar. Não foi alegada reprodução no navegador.

`selectCalendarDate` passa a atualizar selectedDate e a query data via replace/preventScrollReset. Calendário completo/Hoje também centralizam a janela; cartão mantém a janela navegada. Setas só mudam a janela de nove cartões, como antes, sem selecionar outro dia.

Novo helper `cycle-date-navigation` preserva query existente e apenas o retorno Temporal validado no state. A seleção manual remove atividade da URL para sair do deep link antigo, sem apagar filtros ou workspace atuais em memória. Reload conserva dia, não promete persistir filtros não representados na URL.

Marcador de seleção interna vinculado à intenção e à conta distingue essa troca da abertura externa de link. Ao receber a própria URL, Ciclos atualiza a intenção/data sem reaplicar filtro de atividade ou forçar aba Rotina. Na primeira montagem/reload, centraliza o dia escolhido. Mudança de conta ou deep link externo continua usando o tratamento anterior, com identificação de hábito e aplicação dos filtros/aba existentes. Não antecipa a confirmação da intenção antes de o router publicar a URL, evitando que uma renderização com a URL antiga restaure o dia anterior.

`ScrollToTop` reconhece somente esse marcador em navegação da mesma rota /ciclos; demais rotas continuam com comportamento anterior. O retorno Temporal é permitido só por safeTemporalReturn, descartando state arbitrário/externo.

Virada do dia mantém `advanceDailyView` inalterado: segue Hoje quando estava no dia anterior e mantém histórico selecionado. Só quando a regra existente avança a data chama o mesmo seletor com preservação de atividade e sem recentralizar à força. Janela continua avançando pela regra existente. Em execução ou documento oculto continua sem avançar; listeners/intervalo são removidos e recriados com o contexto atual para não escrever query antiga. Nenhuma regra de horário, XP, hábito ou recompensa mudou.

## Evidência e limites

Quatro testes novos executam callback real do seletor e bloco de interpretação de intenção com hooks/setters simulados, além de regras puras: query nova/data recuperável; filtros/aba preservados na seleção interna; tratamento externo/conta/hábito inexistente; centralização após reload simulado; retorno seguro; virada do ano/dia e histórico; scroll limitado à seleção interna. Não usam dados pessoais ou navegador. Log `/tmp/cycle-date-focused.log`. TypeScript inicial passou.

TypeScript, lint e Vite envDir:false passaram (build 37,80s). A primeira global encontrou duas fixtures antigas extraindo callbacks sem seus novos auxiliares (calendar.test e mobile-agenda.test). Atualizados os contextos desses harnesses, mantendo as asserções originais; nenhuma validação do produto foi afrouxada. Log inicial `/tmp/cycle-date-all.log`. **Finais: 19 direcionados aprovados** (`/tmp/cycle-date-focused-reviewed.log`) e **614 globais aprovados** (`/tmp/cycle-date-all-reviewed.log`, 18,43s). Logs tipos/lint/build: `/tmp/cycle-date-types.log`, `...-lint.log`, `...-build.log`. Versões/links/diff-check conferidos; custódia sequencial encerrada. Baseline `/tmp/cycle-date-before.json`. Das 562 entradas preexistentes, 554 preservadas; oito diferenças apenas em Ciclos.tsx/ScrollToTop, duas fixtures de testes e versionamento/whitelists. Novo helper/teste separados. Sem stores/serviços/core/persistência ou gates alterados; SQL NÃO aplicado só versão. Sem secrets/.env, conta/banco remoto, migração/deploy/commit/push ou subagentes. A whitelist é a mesma manutenção local de versão já revista; nenhuma API Supabase nova.

## Próximo — Sol Médio

Conferir manualmente escolher outro dia, recarregar, Hoje, retorno à agenda e deep link de atividade. Registrar relato do usuário separadamente do teste local. Mobile/tablet real e harness de lembretes continuam pendentes; gates permanecem false. Não prometer fidelidade visual, recarga real ou cliente multitab a partir de testes Node.

**Aceite manual confirmado pelo usuário em Sol Médio (30/10/2026):** cartão 31/10 atualizou query data=2026-10-31; recarga manteve 31; Voltar para hoje alinhou tela/query. Usuário respondeu que os três passos funcionaram. Ambiente de continuidade: navegador lateral do Codex no computador, sem nova largura informada. Não é inspeção independente nem aceite mobile/tablet. Sem alteração de produto/dados/gates ou nova tentativa de browser. Correção de seleção/recarga/Hoje aceita neste percurso manual; demais pendências preservadas.
