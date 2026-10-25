# R21 — símbolos próprios para cada destino

24/10/2026. Pedido de Fábio: Domínios repetia o ícone de Pilares; cada aba deve comunicar sua função. Incorporado à versão local 0.1.62 com R22, sem publicação ou validação isolada de uma versão intermediária. Astro Boy executou sequencialmente.

## Implementação

`ArcaneIcon.tsx` mantém o traço original de 24 unidades, stroke 1.6 e currentColor. O mapeamento compartilhado abastece menu lateral, navegação mobile, menu Mais e cartões do Mapa.

- Pilares: quatro colunas de sustentação; Domínios conserva a rede de áreas/subáreas.
- Mapa: nós conectados; Jornadas conserva seu mapa de percurso.
- Semana, Mês, Ano e Calendário: agenda semanal, grade mensal, blocos anuais e calendário com relógio.
- Treinos: haltere; modalidades: movimento corporal; Painel: medidor; Semana de treino: calendário marcado; Histórico: relógio; Insights: gráfico; Corpo: silhueta.
- Cassino Arcano: dado com cristal. Mais: grade de destinos, distinta do livro do Grimório.

Todos os 26 destinos registrados têm traçados diferentes. Símbolos decorativos continuam ocultos de leitores de tela, que recebem os rótulos adjacentes; o modo rotulado de ArcaneIcon permanece disponível. Os ícones internos de ação e de elemento continuam reutilizáveis: um mesmo elemento/ação não ganha outro significado por tela.

## Verificação

Teste SSR integrado `tests/elemental/mobile-discovery.test.mjs`: unicidade dos 26 símbolos e distinção Mais/Grimório. Suíte completa, TypeScript, lint e build executados na versão integrada R22; evidências no [relatório R22](R22-DESCOBERTA-MOBILE.md). Não houve inspeção renderizada dos novos ícones no navegador; aceite visual pendente.

Sem alteração de destinos, pontuação, persistência, backend, dependências ou ativos externos. Sem push/deploy.
