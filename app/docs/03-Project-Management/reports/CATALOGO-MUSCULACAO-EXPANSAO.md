# Expansão do catálogo de Musculação

**Data:** 31/10/2026
**Escopo:** catálogo local de exercícios com resistência externa; sem migração remota e sem mudança da fórmula de pontuação.

## Resultado

- Adicionadas 124 fichas com IDs próprios, organizadas por grupo e padrão de movimento.
- Cobertura: peito, costas/dorsais/trapézio, ombros, bíceps, tríceps, quadríceps, posteriores da coxa, glúteos, adutores, panturrilhas, abdômen e antebraços.
- Inclui barra e anilhas, barra EZ, halteres, kettlebell, polia/cabos, máquinas com placas ou anilhas, Smith, banco, rack, anilhas e faixa elástica.
- Inclui variações de rosca (reta, EZ, alternada/supinada, martelo, inclinada, Scott, concentrada, spider, polia/Bayesian, inversa e Zottman), variantes por máquina, pegada e execução unilateral, além de 10 isometrias com medição por duração.
- `StrengthExerciseProfile` registra equipamentos, padrão de movimento, contração dinâmica/isométrica, multiarticular/isolamento, lateralidade, pegada, preparação, instruções, erros comuns, segurança, alternativas, referências e confiança.
- O catálogo agora alimenta filtros amplos por região e refinamento por músculo (por exemplo, bíceps/tríceps), além de filtros por equipamento e tipo de contração. O seletor legado de origem também passou a incluir Musculação.

## Fronteira dos catálogos

Musculação fica definida neste produto como o catálogo planejável de movimentos com resistência externa. Barra com anilhas e máquinas pertencem a Musculação; barra fixa e exercícios centrados no peso corporal permanecem em Calistenia. Isometria é uma característica de execução e medida em segundos, não uma nova modalidade. A ACE separa sua biblioteca por partes do corpo e equipamentos; a IHS descreve treino resistido em sentido amplo, incluindo pesos livres, máquinas, faixas e peso corporal.

Os alvos musculares primários/secundários são tags de descoberta para filtros, sem percentuais de ativação. Os exercícios usam `source: musculacao`; o cálculo ER/XP continua usando as regras já existentes. Nenhum fator de pontuação, ER × 0,10, multiplicador, cap ou Prana foi alterado neste lote.

## Fontes e limites

- [ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/) — referência para nomenclatura, regiões corporais e equipamentos. Foram usados nomes e categorias; as instruções do app foram redigidas para este catálogo, sem copiar as descrições ou imagens da ACE.
- [ACE — Free Weights vs. Strength-Training Equipment](https://contentcdn.eacefitness.com/assets/education-resources/lifestyle/fitfacts/pdfs/fitfacts/itemid_2655.pdf) — diferenças gerais entre pesos livres e máquinas.
- [Indian Health Service — Increasing Muscle Strength](https://www.ihs.gov/diabetes/education-materials-and-resources/diabetes-topics/physical-activity/increasing-muscle-strength/) — definição ampla de resistência, incluindo peso corporal, máquinas, faixas e pesos de mão.

As tags anatômicas são classificação prática para filtro, não análise biomecânica individual nem indicação médica. Ajuste técnico/carga deve respeitar o equipamento disponível e a experiência da pessoa.
