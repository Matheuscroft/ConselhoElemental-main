# R28-C1 / R28-D1 — rolagem de exploração e Roda do Destino

26/10/2026 · **0.1.73 local** · branch `codex/fitness-ui-integration`, base `b11ed9d`. Fábio relatou salto ao topo ao expandir grupos em Domínios e pediu correção e continuidade. Astro Boy executou sequencialmente; trabalhos anteriores preservados.

## Correção prioritária: Domínios

Causa localizada no código: `setSearchParams` muda a chave de localização ao selecionar grupo/filtro. `ScrollToTop` observa essa chave e fazia `window.scrollTo({top:0})`; suas exceções cobriam páginas de elemento e trilhas, mas não Domínios. O efeito de hash de Domínios não era a causa deste caso.

Criado marcador explícito `DISCOVERY_NAVIGATION_OPTIONS` para alterações internas de `/dominios` e `/mapa`. `ScrollToTop` preserva a posição somente quando o caminho é o mesmo e esse marcador está presente. Navegação real para detalhe/outra página, entrada inicial e navegação não marcada continuam com reset. Filtros, expansão, URLs e comandos de vínculo permanecem. Mapa também corrigido preventivamente, pois a busca na URL introduzida em R28-C percorria o mesmo caminho.

A correção remove o comando global indevido; não adiciona compensação artificial de scroll ou timers. Eventual deslocamento natural por recolher conteúdo acima do ponto de leitura ainda precisa ser avaliado no aparelho.

## Continuidade: Roda do Destino

- Botão **Pular animação e ver atividade** revela a escolha já feita, sem novo sorteio.
- Preferência de movimento reduzido dinâmica: resultado imediato se já ativa; ativá-la durante o giro encerra a espera da apresentação.
- Controlador de apresentação publica uma única vez, bloqueia início concorrente, cancela timers ao desmontar e ignora callbacks de giros anteriores.
- Resultado recebe foco/rolagem apenas quando muda; alterar preferência não volta a focar um resultado antigo. Roda para na posição final quando a apresentação termina.
- Sorteio, elegibilidade, filtros, gratuidade, links e regras de conclusão/XP preservados. Nenhuma atividade inicia automaticamente.

## Verificações executadas

- **185 testes passaram**, zero falhas: `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`.
- Regressão executa o efeito real de `ScrollToTop` com hooks/window isolados: entrada reseta, abrir/trocar/recolher grupo não dispara novo `scrollTo(top:0)`, navegação para detalhe reseta. É teste com dublês, não execução de navegador.
- Casos do marcador verificam escopo, ausência/valor falso, troca de rota e entrada inicial.
- Casos do controlador da Roda verificam escolha original, publicação única, clique concorrente, callback antigo após novo giro, movimento reduzido e descarte ao sair.
- **TypeScript e lint passaram. Build** Vite `envDir:false` passou em **7,87s**. Avisos de chunks grandes/Browserslist antiga permanecem.
- SHA-256 confirma appStore/workoutStore/tipos idênticos ao início desta rodada; versões package/lock sincronizadas; diff-check limpo.
- Logs: `/tmp/conselho-r28d-{tests,types,lint,build}.log`; baseline `/tmp/conselho-r28d-preserved.json`.

## Aceite e próximo passo

Não executada inspeção renderizada: bloqueio anterior do navegador não contornado. Validar 360/390px e 768px: rolar ao catálogo, abrir Fogo/Água, recolher e filtrar mantendo contexto; abrir uma área e conferir navegação real; digitar na busca do Mapa sem salto. Na Roda, pular giro, alternar movimento reduzido durante a espera, sair durante animação, repetir sorteios e conferir destino. Não usar dados pessoais para conclusões de teste.

**Treinos permanece para R28-D2**; este lote avançou na Roda após atender a correção prioritária. Depois vêm marcos/revisão final, mantendo QA R27–R28 aberto. R25-A/B backup/associação segura à conta, fragmentos e demais contratos anteriores continuam pendentes.

Reservas encerradas. Revisão documental pelo coordenador; revisão independente pendente. Sem commit, push, deploy, migração, credenciais ou mudança de dados pessoais.
