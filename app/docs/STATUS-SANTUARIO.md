# Santuário — 0.1.12

Referência: IMG_2388.jpg enviada pelo usuário em 06/10/2026. Composição com personagem central, seis espaços de equipamento laterais, HUD compacto e base de atributos. Preserva avatar procedural existente e recursos derivados dos stores; não introduz inventário nem bônus fictícios. Espaços clicáveis explicam sua condição visual.

Arquivos: components/sanctuary/CharacterStage.tsx, pages/Santuario.tsx, components/layout/AppLayout.tsx e index.css. AppLayout deixa de montar avatar oculto quando showAura=false, evitando canvas duplicado.

Lint: 0 erros, 4 avisos preexistentes. Validação visual no navegador pendente por bloqueio da ferramenta de navegador nesta sessão. Não declarar equivalência visual à referência ou teste responsivo concluído. Próximo: inspecionar em 360/390/768px, conferir enquadramento do mago, espaçamento lateral e interação dos espaços. Não publicar automaticamente este incremento.

Checkpoint: /Users/fabioandre/Developer/conselheiro-backups/santuario-012/before.tar.gz.

## V01 — validação executada em 08/10/2026

Executor: Codex `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`. Checkout: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Servidor Vite local e Puppeteer existente (Chrome 154.0.8037.57), sem migração de ferramenta. Perfil temporário de navegador vazio, isolado do perfil real; nenhum storage importado ou alterado diretamente, nenhuma entidade ou dado de saúde/GPS fabricado. Estado inicial do próprio app: Mago Iniciante, nível 1, XP 0/100, HP 70, Stamina 60, Prana 0. Não se trata de perfil autenticado nem teste de sincronização.

Referência localizada e inspecionada: `/Users/fabioandre/Downloads/IMG_2388.jpg`.

| Viewport | Overflow horizontal | Canvas no Santuário | Interações por clique | Resultado |
|---|---|---|---|---|
| 360 × 844 | Não | 1 visível, 0 fora do palco | 6/6 selecionam e desmarcam corretamente | Critérios funcionais exercitados passaram |
| 390 × 844 | Não | 1 visível, 0 fora do palco | 6/6 selecionam e desmarcam corretamente | Critérios funcionais exercitados passaram |
| 768 × 1024 | Não | 1 visível, 0 fora do palco | 3/6: Cajado, Grimório e Amuleto encobertos | Reprovado por sobreposição |

Defeito reproduzido em 768px: centro do Cajado aciona Chapéu; Grimório aciona Vestes; Amuleto aciona Botas. Retângulos medidos: coluna esquerda x=331, largura 96; segunda coluna x=345, largura 96, mesmas posições verticais; sobreposição de 82px. Evidência estática associada: `src/index.css:152` define left:24px em `.character-slots` no breakpoint >=640px e right:24px em `.side-1` sem limpar left; `.side-0` mantém left:10px por especificidade. Não corrigido neste lote.

Teclado: foco programático no primeiro espaço, Espaço seleciona/desmarca; outline de 3px observado nas três larguras. Isso não substitui auditoria completa da ordem de Tab ou leitor de tela. Console sem warnings/errors, sem pageerror e sem respostas HTTP >=400 durante a execução capturada. Observer registrou máximo de 1 Canvas no DOM e nenhum evento de perda de contexto. Navegação pela UI Santuário → Rituais removeu o Canvas (0); retorno remontou 1. Ausência de Canvas oculto confirmada no DOM; não é medição exaustiva de memória/GPU.

Comparação visual: em 360/390px há personagem central, três espaços de cada lado, HUD superior e faixa inferior, compatíveis com a estrutura da referência. A implementação preserva seu mago existente e usa ícones, não os equipamentos ilustrados da imagem; não reproduz inventário, níveis ou moedas da referência. O personagem ocupa quase toda a altura do palco; laterais do chapéu, braços e livro ficam parcialmente atrás dos espaços. Em 768px a sobreposição rompe a composição de duas colunas. Não declarar equivalência visual integral.

Evidências absolutas:
- `/tmp/conselho-v01-20261008/santuario-360.png`
- `/tmp/conselho-v01-20261008/santuario-390.png`
- `/tmp/conselho-v01-20261008/santuario-768.png`
- `/tmp/conselho-v01-20261008/personagem-360.png`
- `/tmp/conselho-v01-20261008/personagem-390.png`
- `/tmp/conselho-v01-20261008/personagem-768.png`
- `/tmp/conselho-v01-20261008/results.json` (medidas, cada interação, console e navegação)
- `/tmp/conselho-v01-20261008/check.mjs` (roteiro reproduzível; artefato de validação fora do produto)

V01 executada, sem aceite: depende do lote corretivo delimitado I01 e nova validação. Nenhuma alteração de produto; build/lint não executados nesta validação. HP local permanece pendente de auditoria D01, sem mudança de fórmula.


## I01 — reteste independente em 09/10/2026 (0.1.13)

Responsável: subagente Codex de validação, delegado por Astro Boy. Checkout: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`; base Git `03f05886e5c8afbc8d28dc8ff54da4945d44f626`. Escopo somente leitura do produto, com reserva exclusiva deste acréscimo documental e `/tmp/conselho-i01-20261009/`. Alterações preexistentes preservadas; nenhuma edição de código, manifest, lockfile, stores ou fila realizada neste reteste.

Inspeção atual confirmou `src/index.css` no breakpoint >=640px: `left:24px` somente em `.character-slots.side-0`, `right:24px` em `.side-1`; largura 96px. Servidor iniciado com `npm run dev -- --host 127.0.0.1` (Vite 7.3.0, versão 0.1.13). Roteiro anterior `/tmp/conselho-v01-20261008/check.mjs` inspecionado e copiado para diretório novo, trocando apenas caminhos de evidências e incluindo 1440×1024. Comando executado: `node /tmp/conselho-i01-20261009/check.mjs > /tmp/conselho-i01-20261009/run.log 2>&1`; saída 0. Chrome 154.0.8037.57/Puppeteer existente, perfil temporário vazio, sem importação ou escrita direta de storage, sem criação de entidades ou dados fabricados. Horário do relatório: 2026-10-10T00:30:39.382Z, correspondente a 09/10/2026 21:30 em Recife.

| Viewport | Overflow horizontal | Canvas | Controles por clique | Resultado exercitado |
|---|---|---|---|---|
| 360×844 | Não | 1 visível, 0 fora do palco | 6/6 selecionam, mostram nota correta e desmarcam | Passou |
| 390×844 | Não | 1 visível, 0 fora do palco | 6/6 selecionam, mostram nota correta e desmarcam | Passou |
| 768×1024 | Não | 1 visível, 0 fora do palco | 6/6 selecionam, mostram nota correta e desmarcam | Passou; sobreposição anterior não reproduzida |
| 1440×1024 | Não | 1 visível, 0 fora do palco | 6/6 selecionam, mostram nota correta e desmarcam | Passou |

Em 768px, colunas medidas em x=345 e x=615, ambas com largura 96px, sem interseção. Em 1440px, x=377 e x=1255. Capturas completas e do palco foram produzidas nas quatro larguras; os quatro recortes do personagem e as páginas completas 768/1440 foram inspecionados visualmente. Há personagem central, três controles em cada lateral, HUD e faixa inferior. Nos tamanhos menores, partes do chapéu/braços/livro continuam atrás dos espaços, como observado anteriormente; este lote corrigiu a sobreposição entre colunas e não aprovou equivalência visual integral à referência.

Teclado: foco programático no primeiro espaço, Espaço selecionou, foco permaneceu e outline medido em 3px nas quatro larguras; o roteiro pressionou Espaço novamente para desmarcar. Auditoria de Tab/leitor de tela não executada. Console sem warnings/errors, pageerror vazio e nenhuma resposta HTTP >=400 capturada. Observer registrou máximo de 1 Canvas e nenhum evento de perda de contexto. Pela navegação da UI Santuário → Rituais: Canvas 0; retorno Santuário: Canvas 1. Não houve teste exaustivo de memória/GPU, autenticação, sincronização remota, progressão ou fórmula de HP. Build/lint não executados por este responsável. Aceite pertence ao coordenador.

Evidências: `/tmp/conselho-i01-20261009/results.json`, `run.log`, `check.mjs`, `santuario-360.png`, `santuario-390.png`, `santuario-768.png`, `santuario-1440.png`, `personagem-360.png`, `personagem-390.png`, `personagem-768.png` e `personagem-1440.png`, todos dentro daquele diretório. Evidências V01 preservadas. Documentos `CONTINUIDADE.md`, `MANUAL-ENGENHARIA.md`, `DOSSIE-TECNICO.md` e `AGENTE-VERSIONAMENTO-DOCUMENTACAO.md` não localizados em docs neste checkout; nenhuma criação realizada fora da reserva. Próximo: revisão de Astro Boy do resultado I01 e revisão documental/versionamento; D01 mantém auditoria do HP pendente.

Atualização do coordenador após reteste: os quatro documentos ausentes na inspeção inicial foram integrados por Astro Boy durante esta execução; a ausência acima é histórica, não pendência atual. O servidor iniciado pelo validador foi encerrado ao finalizar. Terminal Vite emitiu aviso de base caniuse-lite com dez meses; nenhuma atualização de dependência foi feita. `git diff --check` executado, saída 0.
