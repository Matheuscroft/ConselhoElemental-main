# Expansão do catálogo de Calistenia

## Escopo

Catálogo ampliado de 21 para **65 fichas**, mantendo todos os IDs anteriores. As novas fichas cobrem variações de flexão, barra e remada, pernas/panturrilhas, core e habilidades isométricas. Cada ficha tem instruções e valores iniciais editáveis; são referências para montar o treino, não prescrição individual.

## Itens solicitados

- Pegada neutra na barra; chin-up hold; elevação escapular; suspensão passiva e ativa por tempo; isometria escapular; negativas de barra/chin-up.
- Agachamento sumô; panturrilha no step bilateral/unilateral.
- Flexões na parede, inclinada (já existente), com joelhos, declinada, aberta/fechada, negativas, com descida lenta/pausa, escapular, arqueiro e explosiva. A flexão tradicional e Pike também já existiam.

## Outras adições

Barra peito-à-barra e assistida, remada escapular, tibial anterior, avanço reverso/lateral, step-up, wall sit, agachamento com tempo/salto, prancha lateral, dead bug, abdominal reverso, elevação de pernas e isometria de joelhos na barra, handstand na parede, tuck planche, apoio nas paralelas, tuck front lever, elevação pélvica unilateral e arch hold.

## Tags e execução

Tags principais/secundárias suportam os filtros anatômicos da biblioteca e os emojis nos cards. Incluídos grupos específicos **serrátil anterior** (flexão escapular) e **tibial anterior** (elevação de ponta dos pés), em vez de escondê-los em peito/panturrilha. Tags são classificação para descoberta, não percentuais de ativação.

Isometrias (suspensão, chin-up hold, wall sit, skills) usam `measureMode: 'duration'` e segundos como padrão. Repetições negativas e exercícios dinâmicos permanecem em `measureMode: 'reps'`. A UI/Store existente incorpora fichas do catálogo pelo ID legado; nenhuma migração manual de catálogo salvo, fórmula de pontuação, ER/XP/Prana ou persistência remota foi feita.

## Referências consultadas

- [ACE — progressões e regressões de agachamento, puxada e flexão](https://www.acefitness.org/resources/pros/expert-articles/7076/progressions-and-regressions-what-do-they-look-like/).
- [NASM — pull-up](https://www.nasm.org/resource-center/exercise-library/pull-up) e [chin-up vs. pull-up, negativas e hang escapular](https://www.nasm.org/resource-center/blog/training/chin-ups-vs-pull-ups-the-difference-the-benefits-muscles-worked).
- [Guia de progressão de pull-up do U.S. Marine Corps](https://www.marines.mil/portals/1/docs/pulluptrainingguide.pdf), para negativas e sustentação no topo.
- [Navy Fitness — progressão de flexão](https://www.navyfitness.org/modules/media/?do=download&id=5151bee7-b8c2-4cdd-be76-d1ad6ff416bc), incluindo variações na parede, joelhos e excêntrica.
- [Catalyst Athletics — pull-up com pegada neutra](https://www.catalystathletics.com/exercise/864/Neutral-Grip-Pull-Up/).

As fontes apoiam nomes e formas comuns de progressão; as tags musculares são classificações de catálogo e não medição eletromiográfica.

## Verificações

Inventário estático via transpile TypeScript: 65 itens, IDs únicos, todos com músculo primário; os itens pedidos existem; holds definidos com medida de duração. `tsc --noEmit -p tsconfig.app.json`, ESLint direcionado e `git diff --check` passaram. Testes automatizados e QA visual não executados.
