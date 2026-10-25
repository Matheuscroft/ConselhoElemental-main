# R15 — capítulos navegáveis de Grandes Obras

23/10/2026 · 0.1.55 local · base publicada 91fa5a5 · branch codex/fitness-ui-integration.

## Retomada e decisão

Checkout limpo após publicação R14. Fábio pediu continuar o progresso; a fila indicava capítulos/detalhes e QA visual. Astro Boy executa o lote frontend sequencialmente. Matheus mantém backend, sem concessão nova de XP/Prana, carteira ou mudanças de recorrência.

Direção visual: manter fundo #080b12, superfície #141b27, ouro #d5b66f, texto #f2efe7 e apoio #aab4c4, com runas por elemento. Títulos de capítulo em Cinzel; tarefas na fonte de leitura existente. Cartões expansíveis alinhados à esquerda: capítulo → contagem → ação de continuar → atividades. A expansão segue o padrão Showcase; nenhuma conclusão automática ao abrir o cartão.

## Implementado

- Detalhes de Grandes Obras consultam o projeto atual por ID e conta. Removida a cópia antiga de projeto que podia impedir a atualização visual após adicionar campanha; comando `addMissionToProject` e payload mantidos.
- Campanhas aparecem como capítulos na apresentação, compatível com o compositor existente; entidades persistidas não renomeadas.
- Cartões expansíveis por capítulo, contagem dos rituais na projeção atual, link para continuar o primeiro ritual disponível e links individuais usando o destino existente `trailHref`.
- Referência removida aparece indisponível, sem link de execução. Obra arquivada/concluída não sugere continuar, mas permite consulta dos itens disponíveis conforme a trilha existente.
- Progressos gravados da obra e dos capítulos permanecem explícitos, separados da contagem de rituais; nenhum percentual macro recalculado.
- Metadado opcional `chapterId` na projeção de leitura separa capítulos de nomes iguais. `chapters.progress` só é incluído quando existe valor numérico; fontes legadas sem progresso mantêm a forma anterior.
- Campo de novo capítulo com rótulo, confirmação desabilitada quando vazio e cancelamento visível; o formulário limpa ao abrir outra obra.

## Verificações executadas

- 104/104 testes Node passaram, incluindo os novos casos de capítulos homônimos, leitura de tarefas atuais, entrada imutável, links exatos, referências indisponíveis e obra arquivada.
- Primeira execução: 103 passaram e uma expectativa de capítulo legado falhou porque a propriedade opcional aparecia com valor undefined. Ajustada a projeção para omitir a propriedade ausente; teste anterior preservado; suíte final passou.
- TypeScript, lint sem avisos e build Vite `envDir:false` passaram; build final em 7,43 s, com avisos de chunks grandes/Browserslist já conhecidos.
- Diff vazio em stores/lib/types/services/constants/Supabase e quest-commands. Alteradas três fontes preexistentes de apresentação/projeção e criado ProjectChapters.
- Sem alterações de ordenação, seleção de próxima etapa, deduplicação, regras de pontos, status persistido ou contratos de backend. A projeção apenas acrescenta metadados de leitura.

Logs temporários: `/tmp/r15-tests-final.log`, `/tmp/r15-lint-final.log`, `/tmp/r15-build-final.log`.

## Pendências e limites

Sem QA de navegador: bloqueio salvo permanece; nenhuma nova tentativa/contorno nesta rodada. Testes SSR não comprovam expansão/click/foco reais. Conferir em 360/390/768/1440 px: adicionar/cancelar capítulo, atualização imediata, abrir/recolher, nomes longos/iguais, link direto, conta trocada, referência removida, obras concluídas/arquivadas e teclado.

O capítulo vazio explica como adicionar uma etapa pela trilha escolhendo o capítulo no seletor existente. Não foi criado editor avançado de capítulo, reordenação ou exclusão. Jornadas e tarefas diretamente vinculadas à obra continuam acessíveis pela trilha completa; este lote foca nos capítulos.

Próximo: QA deste detalhe, depois navegação dos demais vínculos e detalhes de Jornadas. Fragmentos/streak permanecem no contrato R12-D/E. Versões/manifests, links e diff-check conferidos. Reservas encerradas após verificações; documentação pelo coordenador, revisão independente pendente. Sem secrets, migração, commit/push ou deploy. [Fila única](../FILA-ENTREGAS.md).
