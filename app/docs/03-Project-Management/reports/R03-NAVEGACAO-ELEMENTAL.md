# R03 — navegação elemental na prévia

21/10/2026 · versão local 0.1.39 · base f07292f · branch codex/fitness-ui-integration. Astro Boy executou implementação, revisão React e custódia documental sequencialmente. Estado operacional somente em [FILA-ENTREGAS.md](../../FILA-ENTREGAS.md).

## Decisão e limite

Usuário aprovou a direção de R02 e pediu a próxima fase, preservando integralmente backend, lógica e cálculos de Matheus. Esse aceite permite evoluir a prévia; não é evidência de QA do executor. R03 continua parcial: `/santuario` e `/pilares` vigentes não foram substituídos. Nenhuma alteração de stores, contratos, pontuação, persistência, serviços ou Fitness.

Plano visual: manter os tokens obsidiana/superfície azul, dourado, Cinzel nos títulos e Inter na leitura da R02. Personagem e materiais continuam como foco; navegação secundária usa links discretos e separadores. Quatro acessos fixos complementam o anel, sem depender de esperar a órbita ou acertar um elemento em movimento. Áreas mantêm expansão nativa; filtros usam estados pressionados e texto, sem depender apenas de cor.

## Implementação

- Rotas protegidas e lazy `/previa-elemental` e `/previa-elemental/elementos/:elementId`. IDs aceitos: fogo, ar, agua e terra; destino inválido apresenta escolha dos quatro elementos e retorno explícito.
- Links antigos `?elemento=terra` redirecionam com replace, mantendo parâmetros de busca/filtro. Rotas anteriores do app permanecem registradas.
- Busca `busca` e filtro `areas=ativas` vivem na URL; replace evita histórico por tecla. Leitura considera áreas canônicas e personalizadas, estado ativo de `onboarding.selectedAreas` e pontuação dos getters existentes. Não grava área nem recalcula pontuação.
- `ScrollToTop` preserva posição somente para uma alteração marcada de filtro na mesma página elemental válida. Entrada direta, troca de elemento e demais rotas mantêm o comportamento anterior. Foco muda para o conteúdo ao navegar, não ao digitar. O link explícito Voltar ao Santuário solicita foco no acesso fixo do elemento de origem. Inspeção de código, não teste de foco real.
- Caminhos visíveis para Forja, Jornadas, Grandes Obras, Planejamento, Treinos e Mapa, além dos acessos anteriores a Rituais, Ciclos, Invocar e Grimório. São links para módulos existentes, sem novas operações.
- Exercício Físico conserva Treinos e ganha acesso às suas subáreas por Domínio. ID real conferido no catálogo: `area-saude`; não renomeado para os IDs do documento canônico.
- Equipamentos e renderizador R02 preservados. Nenhum asset ou nova dependência neste lote.

Arquivos principais: `src/pages/ElementalPreview.tsx`, `src/pages/elemental-preview.css`, `src/components/elemental/navigation.ts`, `src/components/layout/ScrollToTop.tsx`, `src/App.tsx`. Testes: `tests/elemental/navigation.test.mjs`.

## Evidências executadas

- `npx tsc -b`: passou.
- `npx eslint src/pages/ElementalPreview.tsx src/App.tsx src/components/elemental/navigation.ts src/components/layout/ScrollToTop.tsx`: passou, sem diagnósticos.
- `node --test tests/elemental/*.test.mjs`: 8/8. Cinco casos de navegação/filtros/scroll e três casos numéricos do renderizador R02. Navegação usa React Router em memória, caminhos literais extraídos de App.tsx, sem iniciar navegador, Auth ou stores. Entrada direta simula reconstrução do roteador, não recarga HTTP do app.
- Build Vite por API, `node --input-type=module -e 'import { build } from "vite"; await build({ envDir: false });'`: passou, sem carregar `.env`. Avisos de Browserslist desatualizado e chunks acima de 500 kB permanecem. Prévia: 21,18 kB JS / 18,88 kB CSS; não é benchmark de carregamento.
- Comparação SHA-256: 79 arquivos enumerados antes da edição permaneceram idênticos. Inclui stores, tipos, constantes, lib, serviços, funções/migrações locais, páginas Fitness, Invocar, Santuário e AppLayout. Artefatos locais temporários: `/tmp/r03-preserved-files.json` e `/tmp/r03-preservation-result.json`. Não testa dados remotos nem comportamento de domínio.
- `git diff --check` passou antes da revisão documental; fechamento documental e versões conferidos separadamente na continuidade.

Não executados: navegador, captura, hitbox, contraste instrumental, teclado/toque real, desempenho/FPS, Auth remoto ou fluxo completo de treino/ritual. Bloqueio salvo de localhost permanece conforme última recusa registrada; autorização humana já recebida, sem nova pergunta nem contorno por outra superfície. Não houve secrets, deploy, migração, commit ou push. Revisão independente pendente.

## Retomada e integração restante

1. Conferir a entrada atual da fila e estado Git. Não reimplementar I03 ou alterar fórmulas recebidas de Matheus.
2. Antes de promover a home, integrar a responsabilidade do cronômetro de `AppLayout` (efeito com `tickTimer`) e o acesso `startTimer(task.id, 'TASK')` da home vigente. A prévia ainda não hospeda esse ciclo; não presumir equivalência funcional quando houver timer ativo. Reutilizar operações existentes, sem outro relógio/cálculo.
3. Conferir paridade de navegação global, ações do personagem e acesso ao Cassino/recursos do Mapa. Inventário segue visual; não fabricar aquisição ou equipamentos funcionais.
4. Quando a ferramenta liberar efetivamente localhost, verificar 360/390/768/1440: quatro links fixos e orbitais, foco após retorno, pesquisa sem salto, limpar/filtro vazio, áreas personalizadas, URL direta/voltar/avançar/reload, ficha de equipamentos e suspensão de movimento. Manter perfil de teste isolado; não preencher dados reais fictícios.
5. Só então decidir promoção para `/santuario` e entrada de R04. Roadmap completo em [R01](REPAGINACAO-ELEMENTAL-2026-10.md); não criar segunda fila.
