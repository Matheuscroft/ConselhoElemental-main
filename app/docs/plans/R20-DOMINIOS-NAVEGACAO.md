# R20 — Domínios: continuidade de navegação

24/10/2026 · 0.1.60 local · base publicada 91fa5a5 · branch codex/fitness-ui-integration. Astro Boy sequencial. R15–R19 preservados. Fábio aprovou nos prints a aparência dos Expanded Cards e do Showcase e pediu melhorar o restante da UX.

## Escopo e entrega

Mantidas as composições visuais aprovadas. Aplicação das orientações frontend-design às ações e navegação, usando os mesmos tokens e controles. Sem troca de biblioteca ou geração remota de design.

- Atalhos no início da biblioteca para ir à lista ou à busca; abaixo do rail, botão com a quantidade de áreas encontradas. A lista oferece retorno rápido aos elementos.
- Filtros de elemento, vínculo e busca passam a usar parâmetros de URL (`elemento`, `vinculo`, `q`). Alterações usam replace para não criar uma entrada de histórico por tecla. O retorno explícito do detalhe reconstrói somente esses campos conhecidos.
- Contexto enviado no state do Link para a área e preservado ao navegar entre áreas. “Voltar às áreas” recupera o filtro e a busca, levando ao título da lista. Acesso direto ao detalhe sem contexto retorna à biblioteca padrão. O estado de retorno acompanha a entrada de histórico; não é persistência de domínio nem configuração da conta.
- Filtros visíveis removíveis e Limpar filtros; limpeza direta da busca de subáreas. A busca continua limitada ao elemento e vínculo selecionados, com quantidade real de resultados.
- Navegador de áreas com select nativo agrupado pelos quatro elementos e links anterior/próxima entre áreas do mesmo elemento. Inclui as áreas cadastradas, sem alterar seu vínculo.
- No detalhe, acesso direto às subáreas. Atalhos transferem foco e rolam para a seção; rolagem instantânea com movimento reduzido. Troca de área leva ao início do detalhe. Não foi implementada restauração exata de pixels de rolagem.
- Formulários continuam remount por conta/área. Filtros na URL são estado da rota, não dados persistidos. Criação atualiza elemento/vínculo/busca numa única atualização de URL para evitar perda de filtros por chamadas concorrentes.

Arquivos: páginas Dominios/DominioDetalhe; DomainPresentation (somente contexto no link de área); novos DomainNavigation.tsx/navigation.ts; CSS adicional de navegação; testes e documentação.

## Verificações executadas

- Cinco testes novos: round trip com acentos/vínculo; retorno restrito à biblioteca; seletor com todas as áreas e vizinhos no mesmo elemento; contexto no Link; transferência de foco e movimento reduzido com DOM simulado.
- Suíte Node geral: **122/122 passaram**; log em `/tmp/conselho-r20-tests.log`.
- TypeScript e lint passaram. Build Vite com `envDir:false`: **passou em 14,50 s**; log em `/tmp/conselho-r20-build.log`.
- Comparação AST de **18 inicializadores/handlers** com a fonte anterior: consultas, ordenação, filtros de domínio, contagens, vínculos, criação de subárea e rotas dedicadas idênticos. Na criação de área, as chamadas addCustomArea e selectArea mantêm argumentos e ordem; apenas setters de estado visual foram unificados na URL.
- Diff vazio em stores, lib, types, services, constants e Supabase. Nenhuma fórmula, vínculo real ou persistência alterada durante a verificação.
- Versões e diff-check conferidos. Avisos históricos de tamanho de chunks/Browserslist continuam.

## Limites e continuidade

Testes de DOM simulado não comprovam foco/rolagem em navegador real. QA renderizado de R20 pendente pelo bloqueio salvo; nenhum contorno. Os prints enviados validam a direção visual anterior, não as novas interações.

Conferir em 360/390/768 px: catálogo filtrado → detalhe → outra área → Voltar às áreas; busca com acentos; atualização/recarregamento de URL; botão nativo Voltar do navegador; atalhos/foco/teclado/zoom/movimento reduzido e criação com filtro ativo. A navegação direta a uma área continua possível; sem estado de origem, não se inventa um filtro anterior.

O problema preexistente de primeiro desvínculo de subáreas registrado em R19 continua pendente de revisão com Matheus. Não foi corrigido ou contornado neste lote. Frontend de Fábio e backend de Matheus preservados.

Reservas encerradas. Revisão documental pelo coordenador; revisão independente e aceite visual pendentes. Sem commit/push, deploy ou migração. Próximo estado operacional em FILA-ENTREGAS.md, sem nova fila paralela.
