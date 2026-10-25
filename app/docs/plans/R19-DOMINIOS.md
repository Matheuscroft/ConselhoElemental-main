# R19 — Domínios: Expanded Cards, Showcase e criação

24/10/2026 · versão 0.1.59 local · branch codex/fitness-ui-integration · base publicada 91fa5a5. Astro Boy executou frontend e revisão documental sequencialmente. R15–R18 preservados. Fábio mantém UX; Matheus backend.

## Referências e composição

Pedido explícito: Expanded Cards na página principal, Showcase ao abrir uma área, reformulação de Nova área. Prints de 14:28:48 e 14:38:59 mostram a lista longa, filtros horizontais e formulário antigo. Dois vídeos fornecidos foram inspecionados por quadros com ffmpeg: 14:30:31 (4,57 s, amostragem 2 fps) mostra Showcase com capa e revelação inferior; 14:35:03 (8,46 s, 1 fps) mostra uma faixa de cartões que amplia a seleção mantendo vizinhos visíveis. Montagens temporárias em `/tmp/dominios-reference-1.png` e `-2.png`; não são capturas do app implementado.

Aplicação deliberada de frontend-design: manter tokens elementais `--el-*`, Cinzel nos títulos e Inter nos controles. Identidade já aprovada prevalece sobre preferências genéricas. Estrutura principal: cabeçalho/criação → quatro elementos expansíveis → vínculo/busca → áreas. Detalhe: voltar → capa Showcase → resumo revelável → subáreas e ações.

A faixa contém os quatro elementos, não dezenas de áreas: isso conserva acesso aos vizinhos em mobile. Selecionar amplia e filtra; selecionar de novo ou usar Todos restaura a visão geral. A expansão depende de toque/clique/teclado, não de hover. Adaptação original em CSS/React a partir das referências, sem extrair código premium.

## Implementação

- `DomainElementRail`: quatro botões nativos, arte existente e fallback por runa, estados aria, ampliação flex e descrição da seleção. Estado inicial mantém todos os elementos, como o filtro anterior.
- `DomainAreaCard`: link à rota existente separado do botão de vínculo; pontuação/contagem atuais, identificação personalizada e status textual. Busca por nome/descrição e estados vazios com ação útil.
- `DomainShowcase`: capa com elemento e nome da área; painel inferior com descrição, Rituais, Ciclos e subáreas. Transição por linhas de grid; conteúdo recolhido usa inert e aria-hidden. Sem dados inventados nem pontuação nova.
- Subáreas: busca, vínculo explícito, links próprios de Yoga/Calistenia fora dos controles e confirmação para remover apenas subáreas personalizadas. Removido o contêiner inteiro com role=button envolvendo outros botões.
- Nova área: formulário com envio nativo, rótulo, quatro escolhas radio, descrição do elemento e prévia do nome. Validação de vazio/duplicata e sequência addCustomArea→selectArea preservadas. Ao criar, limpa somente a busca da UI.
- Nova subárea: contexto da área/elemento, validação existente, envio nativo e retorno à lista vinculada após criação. Comando addCustomSubarea recebe os mesmos argumentos.
- UI reinicia por conta e, no detalhe, por área. Fechar diálogos devolve foco ao botão de criação como destino estável, inclusive após remoção de um item. Controles com 44/48 px mínimos, limite de altura dos diálogos e movimento reduzido.

Principais arquivos: `src/pages/Dominios.tsx`, `src/pages/DominioDetalhe.tsx`, `src/components/domains/DomainPresentation.tsx`, `src/components/domains/domains.css`. Nenhuma biblioteca adicionada.

## Preservação e verificações

- Comparação AST de 16 inicializadores/handlers com cópias anteriores: fontes de áreas, ordenação, scores, filtros de vínculo, mesclagem/deduplicação de subáreas, compatibilidade legada, contagens e comandos de vínculo idênticos. A expressão dedicada de rotas teve diferença de quebra de linha no printer; scanner TypeScript confirmou tokens idênticos para Yoga/Calistenia.
- Chamadas de criação e argumentos preservados por inspeção. Mensagens receberam acentuação; limpeza de busca e modo vinculado são apenas estado visual. Remoção delega ao mesmo removeCustomSubarea após confirmação.
- Diff vazio em `src/stores`, `src/lib`, `src/types`, `src/services`, `src/constants` e `supabase`.
- `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs`: **117/117**, incluindo quatro testes novos de rail/seleção, identidade e separação de ações, radios e Showcase recolhido. SSR/callbacks não equivalem a interações em navegador.
- `tsc -b` e `npm run lint`: passaram; repetidos após ajuste de foco.
- Build Vite pela API com `envDir:false`: passou em **7,64 s** na execução final após o ajuste de foco (primeiro build: 14,76 s). Avisos de chunks grandes/Browserslist permanecem.
- `git diff --check`, versões e caminhos conferidos.

Logs temporários: `/tmp/conselho-r19-{tests,tsc,lint,build}.log`; cópias anteriores `/tmp/conselho-r19-Dominios-before.tsx` e `-DominioDetalhe-before.tsx`.

## Atenção backend — comportamento preexistente confirmado em isolamento

A UI trata ausência de `linkedSubareasByAreaId[areaId]` como todas as subáreas vinculadas. O comando `unlinkSubarea` atual parte de `[]` nessa mesma situação. Reprodução executada extraindo o callback atual via TypeScript, com setter em memória e sem inicializar store/persistência reais:

- Subáreas fictícias: isolated-a e isolated-b; mapa de vínculos vazio.
- Antes: leitura compatível da UI apresenta ambas vinculadas.
- `unlinkSubarea('isolated-area', 'isolated-a')`.
- Depois: mapa contém array vazio; leitura da UI apresenta nenhuma vinculada.

Isso já existia antes de R19. Não foi corrigido nem ocultado por um segundo motor de vínculos no frontend. Matheus deve revisar a inicialização do conjunto explícito e os fluxos de primeiro vínculo/primeira criação, com testes próprios e escopo de backend. O teste isolado acima cobre apenas o primeiro desvínculo, não comprova os demais fluxos. Prioridade registrada na fila única; não atribuir essa correção à entrega visual.

## Pendências de aceite

Navegador local permanece com bloqueio salvo previamente informado; não houve contorno. QA real pendente: 360/390/768 px, zoom, tamanhos de toque, expansão e fluidez, filtros/busca, criação/duplicata/cancelamento, foco após diálogo, rotas dedicadas, contas e vínculos. Os vídeos analisados são referências, não prova de funcionamento do app.

Sem teste com dados reais do usuário, push, deploy, migração ou alteração de regras. Reservas encerradas; revisão documental pelo coordenador, revisão independente pendente. Retomar a fila: aceite visual e caso de vínculos para Matheus, seguido dos demais lotes de frontend já planejados.
