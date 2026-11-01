# Expansão dos catálogos de esportes

## Escopo

Expansão dos modelos nativos de Corrida, Natação, Ciclismo e Artes marciais. São fichas para iniciar registros por tempo; não são prescrições, treinos fixos ou avaliação clínica. A execução já permite informar tempo ativo, esforço, distância e notas por bloco.

## Catálogo incluído

- **Corrida — 18:** contínua, intervalada, regenerativa, longa, tempo run, fartlek, progressiva, subidas, esteira, pista, rua, trilha, cross-country, montanha, ultradistância, corrida/caminhada e prova.
- **Natação — 16:** crawl/livre, peito, costas, borboleta, medley, águas abertas, técnica, prancha, pull buoy, nadadeiras, palmares, intervalos, resistência, tiros e recuperação.
- **Ciclismo — 21:** estrada, gravel, MTB (cross-country, trilha, enduro e downhill), ciclocross, pista, BMX racing/freestyle, trial, indoor/spinning, rolo, deslocamento, cicloturismo e e-bike.
- **Artes marciais — 83:** 25 disciplinas com modelos de técnica e rounds, e modelos complementares contextualizados para formas/kata, manoplas/saco, rolagem, roda de capoeira e Wai Kru. Disciplinas: Taekwondo, Jiu-jitsu, Judô, Karatê, Boxe, Muay Thai, Capoeira, Kickboxing, luta olímpica, luta greco-romana, Sambo, Sanda, MMA, Aikido, Kung fu/Wushu, Hapkido, Krav Maga, Savate, Pencak Silat, Luta Livre, Sumô, Kendo, Esgrima, Jiu-jitsu tradicional e Lethwei.

Total: **138 fichas**. IDs antigos foram preservados e as novas variantes usam IDs estáveis; nenhum ID repetido foi encontrado na checagem estática.

## Fonte e taxonomia

Modalidades e formatos foram organizados a partir de referências de federações esportivas: [World Athletics — modalidades de corrida](https://worldathletics.org/our-sport), [World Aquatics — esportes aquáticos](https://www.worldaquatics.com/about), [UCI — disciplinas de ciclismo](https://www.uci.org/uci-the-federation/7xhBYbVFdymwzNedJF36Wx), [SportAccord — federações esportivas](https://sportaccord.org/) e [IFMA — Muaythai](https://muaythai.sport/about-muaythai/muaythai-disciplines/). São referências para nomes e agrupamento, não atestados técnicos de execução ou intensidade.

## Regras preservadas

- Todos os novos itens mantêm `source: native`, categoria da modalidade e medida por duração. Treinos/execuções existentes continuam sendo registros por tempo; não foram convertidos para séries e repetições.
- Os dados de distância, esforço e notas continuam usando os campos existentes. O seletor do editor já filtra Artes marciais pela disciplina `family`; as demais modalidades são filtradas pela categoria e busca por nome.
- Nenhuma alteração à fórmula ER × 0,10, multiplicadores, XP, Prana ou persistência foi feita.
- Distribuições musculares presentes em algumas fichas são metadados estimados e não medição; esporte por tempo segue o tratamento de atividade nativa.

## Verificações

Inventário estático executado via transpile TypeScript: 138 registros (Corrida 18, Natação 16, Ciclismo 21, Artes marciais 83), IDs únicos e IDs legados amostrados preservados. `tsc --noEmit -p tsconfig.app.json`, ESLint direcionado e `git diff --check` passaram. Testes automatizados e QA visual não executados.
