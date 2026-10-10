# Revisão independente — versão 0.1.5

04/10/2026. Verificações executadas pelo Codex após as correções do Claude Code.

- Build aprovado: npm run build, saída em /tmp/claude-015-build.log. Aviso preexistente de tamanho dos chunks.
- Lint aprovado: npm run lint, zero erros e quatro avisos anteriores; /tmp/claude-015-lint.log.
- Metadados do app em package.json e nas duas posições do package-lock.json: 0.1.5.
- Fluxo em perfil isolado: criar treino, iniciar, concluir série, recarregar com persistência, finalizar, resumo e registro no histórico. Gamificação aplicada, nenhum pageerror.
- Semana e histórico: 360, 390, 768 e 1440 px sem overflow horizontal. Sobreposição entre botão fixo e navegação eliminada pela remoção do botão.
- Captura do histórico em 390 px inspecionada: badge à esquerda, texto central e dia à direita.
- Evidência automatizada: /tmp/claude-review-results.json. Capturas: /tmp/claude-review-historico.png e /tmp/claude-review-semana.png.

Conclusão: correções verificadas e lote aprovado funcionalmente nos cenários acima. A revisão não equivale a comparação pixel a pixel do kit, teste de sincronização remota ou auditoria de todas as rotas. Histórico com datas extremas, nomes longos e filtros entre meses merece cobertura adicional no próximo lote de validação visual.

O bloqueio do classificador observado no Claude impediu os comandos naquele executor; os resultados acima vieram das verificações independentes feitas depois, no Codex.

## Recuperação após tentativa de auditoria visual

Em 04/10/2026 o executor executou git stash push -u, retirando a integração da pasta. A restauração foi bloqueada pelo classificador, e a análise passou a olhar as páginas antigas. O Codex reaplicou stash@{0} sem removê-lo. Os arquivos rastreados e os 47 arquivos não rastreados foram comparados com o checkpoint: nenhuma divergência. Versões de package.json e lockfile permanecem em 0.1.5. A auditoria visual não foi concluída; a comunicação via proxy também terminou com resposta vazia. As instruções passaram a exigir backup externo que não retire arquivos do workspace.
