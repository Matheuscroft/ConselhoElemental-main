# F6-N12 — painel Sua evolução: ciclos VALUABLE

07/11/2026 · versão0.1.141 · Astro Boy/Sol Alto, execução e revisão sequenciais, sem subagentes.

## Diagnóstico reproduzido

Fábio esclareceu pela captura que a divergência estava no painel **Sua evolução → Sua energia em cada elemento**, em Ciclos, e não na barra de XP. A investigação anterior N10/N11 verificou saldo/recibos e o Grimório, mas não esse componente. Aquela conclusão não validava esta tela.

Renderização SSR isolada do ScoreHierarchyPanel com a cópia autorizada reproduziu exatamente a captura: Terra102/Fogo11/Água0/Ar1, total114. O painel reconhecia apenas semanticType=valuable; o appStore cria/persiste VALUABLE e já aceita ambas as grafias. A soma visual descartava esses ciclos. Não houve perda comprovada do saldo XP.

## Correção delimitada

ScoreHierarchyPanel agora aceita VALUABLE e valuable, mantendo default para ausência do campo e zero para checks/notas. Mesma regra de folhas e agregadores, pontos, recortes e distribuição anteriores. Não se mudou fórmula, store, receipt, IDs ou arquivo pessoal; não se gerou XP retroativo. Conclusões existentes passam a aparecer automaticamente, sem remarcação ou importação.

A cópia antiga passou a renderizar268/11/74/134, total487, apenas em memória. Esses números pertencem à cópia de06/11, não são alegação do estado atual do telefone. O arquivo não foi alterado e seu conteúdo não foi incluído no Git/deploy/evidências.

## Regressão e compatibilidade

Teste de apresentação com APIs reais da store: Água2/Ar5, totais em explorer/default/showcase, recarga, repetição sem duplicar e desfazer. Cobre também valuable/ausente, checks/notas zero e filhos VALUABLE sem duplicação do pai. Antes da correção dois dos três casos falharam pelos zeros visuais; após a correção os12testes de painel/recompensa passaram.

Versão141 alinhada no package/lock/changelog e allowlist local. Migração aditiva20261107213207_account_archive_version_141.sql aplicada no DominioDoMagoDB: altera somente aceitação do produtor141 sobre hash140 exato, sem tabelas, dados, grants, schema de arquivo ou gate. A validação antiga140 continua aceita. Não houve pausa da escrita ou envio de progresso do usuário.

Testes PGlite exercitam gate aberto e fechado, arquivo anterior preservado, metadados/grants idênticos, todas as demais funções idênticas, rejeição142 e recusa de validador inesperado. O loader histórico foi ajustado para testar a ativação140 no seu estado original e instalação atual no141. Uma primeira suíte carregou a fixture de instalação ainda140 e falhou nesse caso; o cenário foi atualizado e repetido, não tratado como defeito do produto nem omitido.

Readback remoto após aplicação: gate=true, hash141=1e6fb1d65b71b6110ec305b310cfe01c10e627d3d6d6c7fa047f791c18045dda, zero contas integrais, duas contas Auth, cinco tarefas e34hábitos legados. Nenhum dado foi lido por identidade ou gravado pelo agente. Advisors antes/depois mantêm INFO de três tabelas privadas sem política e WARN preexistentes de touch_updated_at/search_path e leaked-password protection; sem alterações não relacionadas. Referências: [search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [RLS privado](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Aceite e encerramento

Suíte final completa: **733 passaram**, zero falha/skip,71,326s, após ajuste da fixture histórica. Tipos/build/lint/diff-check passaram; oito testes de instalação/compatibilidade e12 de painel/recompensas passaram nos ensaios direcionados. O build mantém aviso preexistente de chunks grandes e Browserslist antigo, sem falha.

Publicação **READY dpl_dzJamDCGD2tv6xsnbtESsB4tUkHc**, https://conselho-elemental-testes.vercel.app/ciclos?atualizar=141, entry141/HTTP200 conferidos. Cache dessa rota: public,max-age=0,must-revalidate. Upload source-only518arquivos por SHA no mesmo projeto/team/origem; sem dados pessoais, env, SQL ou fixtures. Não foi necessário alterar SMTP/Auth/gates/grants ou criar contas.

Chromium descartável390×844 no app público141, com IDs criados pelas APIs reais da store e dados apenas sintéticos: concluir dois ciclos pela UI produziu Água2/Ar5 **no painel exato indicado pelo usuário**, feedback e recibos corretos. Após recarga o painel manteve2/5, saldosXP53/98 preservados e Grimório coerente. Zero erro de página/chamada Supabase. Captura do painel inspecionada. Não equivale a aceite físico do Safari ou ao estado atual do telefone.

[Evidências e hashes](evidence/ciclos-painel-0.1.141/). ReservasN12 encerradas e revisão documental sequencial concluída. Sem push GitHub. Contas/e-mails seguem pendênciasN10; esta correção não afirma associação pessoal ou sincronização real já concluída. Próximo: usuário recarregar o mesmo app no telefone e conferir Sua evolução; não remarcar atividades, limpar dados ou reinstalar para corrigir o painel.
