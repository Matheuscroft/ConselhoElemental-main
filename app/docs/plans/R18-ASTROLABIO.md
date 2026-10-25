# R18 — Astrolábio: leitura clara da evolução

24/10/2026 · 0.1.58 local · branch codex/fitness-ui-integration · base publicada 91fa5a5. Continuação do frontend autorizada; Astrolábio examinado a partir do contexto aberto. Astro Boy executou implementação e revisão documental sequencialmente. R15–R17 preservados; Fábio mantém UX e Matheus backend.

## Decisão visual e UX

Aplicada frontend-design com identidade existente: canvas #080b12, superfície #141b27, superfície elevada #202b3a, texto #f2efe7, secundário #aab4c4 e ouro #d5b66f, por tokens `--el-*`. Cinzel para títulos; Inter para leitura. Estrutura: cabeçalho e histórico → panorama atual → leituras em abas → Rituais concluídos por elemento.

O seletor 7/30/365 dias antes aparecia acima de toda a página, mas só filtrava a evolução. Agora fica dentro dessa aba, com intervalo explícito e contagem de registros. Totais acumulados, equilíbrio e Rituais concluídos estão identificados como dados atuais sem esse filtro.

O ponto visual de destaque são os cartões de elementos com artes existentes e expansão nativa de descrição/áreas. Gráficos e números permanecem discretos para facilitar comparação. Inspiração Showcase/Expanded Cards aplicada por composição local; nenhum código premium importado ou design atribuído ao Sleek.

## Entrega

- Runa própria para Astrolábio no cabeçalho e mapa de ícones de rota.
- Panorama com Rituais, pontuação, hábitos cadastrados e streak registrado. “Ciclos Ativos” foi ajustado para hábitos cadastrados porque a fonte é `habits.length`, sem filtro de atividade.
- Abas Evolução, Equilíbrio e Elementos com controles de 48 px e navegação Radix existente.
- Evolução conserva série linear, inclui intervalo civil e tabela expansível com todos os valores diários. A tabela permite consultar os números sem tooltip e mantém zeros/valores negativos registrados.
- Equilíbrio com gráfico de distribuição, legenda numérica e estado vazio explícito; sem meta inventada.
- Elementos com imagem, nome, pontos, participação, descrição e acesso às rotas existentes do Santuário. Fallback de ícone se a imagem falhar.
- Rituais concluídos apresentados em barras horizontais rotuladas. Mesma contagem anterior; escala visual relativa ao maior valor atual, sem alegar meta ou progresso histórico.
- Atalho ao histórico do Grimório e aos Rituais. Estado visual remonta por conta. Removida sequência de animações automáticas da página; gráficos sem animação e transições de disclosure respeitam movimento reduzido.

Arquivos: `src/pages/Astrolabio.tsx`, `src/components/astrolabio/AstrolabioReadings.tsx`, `src/components/astrolabio/astrolabio.css`, `src/components/elemental/ArcaneIcon.tsx`, testes e documentos. Nenhuma dependência nova.

## Preservação e evidências executadas

- Comparação via AST TypeScript dos inicializadores `entries`, `series`, `historyData`, `elementScores` e `elementTasks` contra a cópia anterior: idênticos. Nenhum cálculo de domínio refeito. O limite visual de preenchimento não altera valores exibidos/persistidos.
- Diff vazio em stores, lib, types, services, constants, Supabase e projeções `history.ts`/`recorded-history-series.ts`.
- `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs`: **113/113**. Três testes novos cobrem os quatro elementos e destinos existentes; tabela com zero/negativo/datas; ausência de meta fictícia. São testes SSR/apresentação, não navegador.
- Primeira execução dos testes novos falhou por resolução de pasta no carregador de testes (`EISDIR`). Corrigido para aceitar somente arquivos e resolver `index.ts`/`index.tsx`. Testes novos e suíte geral passaram depois.
- `tsc -b`, `npm run lint`: passaram.
- Build Vite com `envDir:false`: passou em **8,90 s**. Avisos de chunks e Browserslist continuam.
- `git diff --check` e sincronização de versões/changelog conferidos.

Artefatos temporários: `/tmp/conselho-r18-{tests,tsc,lint,build}.log`; fonte anterior `/tmp/conselho-astrolabio-r18-before.tsx`. Não são arquivos publicados.

## Integração Sleek

Após a substituição de credencial pelo usuário, consulta autenticada a `/api/v1/references` retornou HTTP 200. Credencial guardada no Chaves do macOS, fora do Git e do app. Isso confirma acesso de leitura ao catálogo; não comprova escopos de escrita, geração ou exportação. Não houve geração paga, projeto remoto novo nem envio de dados do app. Não registrar credenciais ou códigos de aprovação na documentação.

## Limites e próxima verificação

QA renderizado e interações ainda pendentes pela restrição de localhost anteriormente informada; nenhum contorno. Conferir 360/390/768 px, zoom, teclado/abas/disclosures, gráfico com 365 dias, tooltip, legenda, navegação, mudança de conta e ausência de sobreposição do rodapé. Conferir valores com dados reais, sem escrever eventos artificiais no perfil do usuário.

Revisão documental pelo coordenador; revisão independente e aceite visual pendentes. Reservas encerradas. Sem commit/push, deploy, migração ou alteração de regras. Retomada pela fila única: QA acumulado, detalhes de Jornadas/vínculos de Obras e outras áreas; fragmentos/constância novos dependem de R12-D/E.
