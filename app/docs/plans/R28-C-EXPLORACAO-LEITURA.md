# R28-C — exploração e leitura

26/10/2026 · **0.1.72 local** · branch `codex/fitness-ui-integration`, base `b11ed9d`. Astro Boy executou sequencialmente. R27/R28-A/B preservados. Sem publicação.

## O que mudou

- **Domínios:** catálogo de grupos e resumo Showcase usam painel compartilhado, com abertura/recolhimento de 240ms e opacidade de 160ms. Rail elemental passa de 450ms para o tempo compartilhado; setas acompanham o estado. IDs, vínculos, busca e retorno existentes permanecem.
- **Pilares:** os quatro cartões usam o mesmo painel. Bordas e setas respondem com tokens consistentes; equilíbrio continua lendo a mesma distribuição, sem recalcular pontos.
- **Mapa:** busca e categoria persistem em `busca`/`categoria` na URL. Voltar pelo histórico restaura esses filtros; digitação substitui a entrada atual, sem criar um item de histórico por letra. Campos desconhecidos de URL são preservados e categorias inválidas ignoradas. Limpar devolve foco à busca.
- **Mapa e menu Explorar:** `NavigationGroup` deixa de misturar estado controlado com abertura nativa de details. Fora da busca, botão acessível abre/recolhe o painel; durante busca/filtro, título não interativo e resultados abertos. Não há um controle de recolher que contradiz a exibição dos resultados. Destinos e links atuais mantidos.

## Movimento e acessibilidade

`RevealPanel` mantém o conteúdo montado para preservar estado local, aplica `inert` e `aria-hidden` imediatamente ao recolher e anima apenas a apresentação por CSS. IDs continuam ligados a `aria-controls`. Preferência reduzida desliga a transição; não há timers, medição de altura por JavaScript ou espera pela animação para navegar. A grade de altura envolve layout: não foi medida performance/FPS e não se afirma aceleração de GPU. Não adicionada animação de entrada em cada resultado de busca.

Identidade existente preservada: ouro, fundos escuros, imagens dos elementos, fontes e geometria dos cartões. Aplicadas as orientações de frontend-design, revisão React e auto-versionamento. Sem nova biblioteca.

## Verificações executadas

- **181 testes passaram**, zero falhas: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- Quatro casos novos: painel recolhido fora da navegação acessível; resultados revelados sem controle conflitante; round-trip dos filtros/acentos/categorias inválidas; retorno em MemoryRouter com renderização SSR dos destinos filtrados.
- Testes anteriores de catálogo/navegação atualizados para o contrato `inert`/botão, preservando verificação de todas as áreas e destinos.
- **TypeScript, lint e build** Vite `envDir:false` passaram; build **8,80s**. Lint rodou antes do bump, então o cabeçalho do log identifica 0.1.71. Chunks grandes e Browserslist antiga continuam como avisos.
- **SHA-256:** appStore, workoutStore, tipos e páginas Dominios/Pilares/Mapa idênticos ao início R28-C. Mudanças delimitadas aos componentes de apresentação, navegação de URL e estilos. Diff-check limpo; versões package/lock sincronizadas.
- Logs locais: `/tmp/conselho-r28c-{tests,types,lint,build}.log`; baseline `/tmp/conselho-r28c-preserved.json`.

## Limites e próximo passo

Sem execução renderizada, touch, leitor de tela, screenshots ou medição de fluidez. Não contornado o bloqueio anterior de inspeção do navegador. SSR/MemoryRouter não provam comportamento mobile completo.

Aceite pendente em **360/390px e 768px**: abrir/recolher repetidamente; navegar por Tab/Enter/Espaço sem alcançar painéis fechados; procurar no Mapa, abrir destino e voltar; limpar filtros; testar menu Explorar com categoria atual aberta; movimento reduzido alterado com página aberta; títulos longos e ausência de sobreposição com navegação inferior. Usar dados temporários isolados.

Próximo lote de implementação: **R28-D Treinos e Roda do Destino**, seguido de marcos e revisão final de movimento. QA R27/R28-A/B/C continua aberto. **R25-A/B backup/conta continuam prioritários e pendentes**: não há nova garantia de migração de progresso para conta. Fragmentos e demais contratos anteriores mantidos na fila.

Reservas encerradas. Revisão documental pelo coordenador; revisão independente pendente. Sem commit, push, deploy, migrações, credenciais ou alteração de dados pessoais.
