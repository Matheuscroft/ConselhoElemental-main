# R12-B — movimento, runas e conclusão

23/10/2026 · 0.1.50 local · branch `codex/fitness-ui-integration` · HEAD `987e09e`.

**Implementado, em revisão visual.** Fábio pediu continuar animações do vídeo, melhorar ícones e fazer leve redesign. O lote estende R12-A e preserva suas alterações locais. Não equivale à implementação integral de todos os módulos/animações da referência.

## Entrega

- Quatro runas SVG próprias em camadas: mineral facetado, chama com núcleo, gota/corrente e vórtice. Substituem ícones na trilha, no cabeçalho e na escolha de elemento do compositor. Sem imagens remotas, filtros pesados ou dependências novas.
- Ao selecionar: acomodação da Terra (300 ms), subida do Fogo (420 ms), corrente de Água (480 ms), giro de Ar (550 ms) e brilho curto. Gestos finitos, sem loop ou avanço automático. Na primeira exibição, a etapa já selecionada também pode executar seu gesto de entrada.
- Face do nó responde ao toque sobre base fixa. Não anima box-shadow a cada frame; transforms de posicionamento e pressão estão em elementos separados.
- Painel entra por escala .97→1 e opacidade .5→1 em 180 ms, origem junto ao nó. Fechamento continua imediato; não há animação de saída com controles ocultos recebendo foco. Layout/altura entre seleções ainda precisa de avaliação visual; não alegar interpolação completa de layout.
- Barra de progresso usa preenchimento por scaleX em 300 ms. ARIA expõe imediatamente a contagem existente; nenhum contador de domínio é recalculado por animação.
- Conclusão confirmada mostra medalhão arcano, halo, runas orbitais e check desenhado; três métricas entram com intervalos de 40 ms. Duração decorativa máxima de 650 ms, sem bloquear o botão de continuar/fechar. Valores finais legíveis vêm do recibo atual; não há contador fictício subindo.
- Métricas em `dl/dt/dd`, valores desconhecidos permanecem “—”; em telas estreitas viram linhas. Dialog, foco, Escape e comandos existentes preservados.
- `prefers-reduced-motion` remove entrada, giro, brilho, stagger e resposta espacial ao toque; mantém conteúdo/estados. Não foram adicionados som, vibração ou notificações.

## Direção visual e revisão

Cinzel nos títulos e Inter na leitura; fundo `#080b12`, superfície `#141b27`, texto `#f2efe7`, dourado `#d5b66f`, cores elementais existentes. A trilha mantém composição centrada e detalhe na largura disponível; o recibo usa selo como foco, seguido de resultados e ação. O compositor recebe as novas runas, sem reestruturar seus campos nesta rodada.

Revisão de componentes React feita pelo executor com a skill react-best-practices: componentes novos puros, sem store, efeitos, listeners ou loop JS por frame; ícones decorativos fora da árvore acessível; valores numéricos provenientes de props. Não houve revisão independente ou benchmark. A consulta à skill improve-animations orientou o plano existente; execução atende o pedido explícito de implementação.

## Vídeo: aplicado e ainda pendente

| Referência | Situação |
| --- | --- |
| Trilha, seleção e profundidade dos botões | R12-A + refinamento R12-B |
| Entrada de conclusão, selo e métricas em sequência | Implementado sobre recibo existente |
| Barra de progresso | Transição visual implementada, contagem existente preservada |
| Retorno à próxima sugestão | Comando/foco existentes preservados; sem início automático |
| Fragmento gira e viaja para a coleção | Ainda não implementado: depende de recibo/concessão R12-D/E |
| Streak antes/depois e checks da semana | Ainda não implementado: faltam evento/dia/fuso e contrato confiável |
| Desafio/marco/coleção | Futuro lote de produto, sem metas ou moedas inventadas |
| Liga, assinatura, social e aulas de idioma | Fora do escopo de gestão pessoal aprovado |

O medalhão é celebração da conclusão, não um fragmento adquirido. O elemento do desenho da trilha não determina recompensas futuras. Quantidade de fragmentos já aprovada (1 por conclusão válida), demais detalhes de contrato permanecem no plano R12.

## Preservação e verificações executadas

- `node --test tests/quests/*.test.mjs tests/elemental/*.test.mjs`: **54/54 passaram**, incluindo cinco casos novos de valores reais/ausentes/zero, progresso vazio, runas e decoração sem controles. São unidade/SSR, não navegação.
- `./node_modules/.bin/tsc -b`: passou.
- `npm run lint`: passou sem erros/avisos.
- Build Vite pela API com `envDir:false`: passou, 17,94 s; avisos de chunks grandes e Browserslist desatualizado permanecem.
- Comparação AST dos cinco handlers `select`, `begin`, `finish`, `restoreFocus` e `detail`: idênticos à cópia de início deste lote.
- Snapshot SHA-256 de fontes preexistentes: somente QuestHub, QuestComposer, QuestTrailMap e quests.css mudaram nesta rodada. Novos: QuestRune e QuestResultStats.
- Diff contra HEAD vazio em stores/lib/types/services/constants/Supabase e em quest-commands/quest-path. Criação, conclusão, persistência, XP/Prana, recorrência e relógio de domínio não editados.
- `git diff --check`, versões e links conferidos no encerramento. Logs: `/tmp/r12-b-tests.log`, `/tmp/r12-b-build.log`; snapshot `/tmp/r12-b-before.json`.

Navegador permanece com recusa de acesso registrada em R12-A. Nenhuma nova tentativa ou contorno nesta rodada. **Sem QA visual de mobile/desktop, FPS, animação em velocidade reduzida, interação real ou persistência remota.** Não afirmar que a fluidez foi medida ou que todas as animações do vídeo estão concluídas.

## Retomada

QA 360/390/768/1440, zoom 200%, foco/teclado, seleção rápida, fechamento durante celebração, reduced motion, título longo, timer ocupado e conclusão/Undo. Depois, R12-C: página Jornadas/Grandes Obras e composição consistente; R12-D/E: recibos, streak e fragmentos reais. Reservas encerradas; revisão documental pelo coordenador, independente pendente. Sem secrets, deploy, commit ou push.
