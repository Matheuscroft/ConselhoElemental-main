# Expansão do catálogo de Yoga

**Data:** 31/10/2026
**Escopo:** catálogo local do módulo de Treino; sem mudança de pontuação, persistência remota ou regras de execução.

## Resultado

- Catálogo aumentado de 12 para 41 posturas: 12 fichas anteriores preservadas e 29 novas.
- As 11 posturas novas do arquivo proposto pelo usuário foram incorporadas; as demais 18 são nomes adicionais selecionados a partir de bibliotecas públicas de asanas.
- O Pombo preparatório existente mantém seu ID `eka-pada-rajakapotasana`. A variação completa/avançada foi adicionada separadamente como `raja-kapotasana`, evitando substituir uma ficha por outra.
- O novo `YogaExerciseProfile` comporta categoria corporal, focos/pilares, distribuição muscular estimada, articulações, foco energético, tradução, desalinhamentos comuns, apoios, notas de segurança, referências e confiança dos dados.
- A store preserva o perfil ao construir e clonar o catálogo. A ficha de detalhes exibe estes dados também nos contextos Fitness e Treino.

## Qualidade e limites dos dados

As fichas estão marcadas `provisional`. Percentuais são rótulos aproximados para descoberta e comparação, não medições eletromiográficas, prescrições ou evidência clínica. A interface os chama de estimativas. Eles ficam em um campo informativo separado e não alimentam tags musculares existentes, ER, XP, Prana ou distribuição de pontuação.

Instruções e descrições foram redigidas para este catálogo. Não copiamos texto, imagens, SVG ou arte incorporada de datasets externos. A taxonomia recebida no arquivo foi adaptada para incluir `kneeling`, que aparecia nos dados apesar de não existir no union de categoria declarado pelo mesmo arquivo.

## Fontes de nomenclatura e revisão

- Arquivo de posturas fornecido pelo usuário nesta conversa; tratado como proposta de conteúdo, com estimativas não validadas.
- [Yoga Journal — biblioteca de posturas](https://www.yogajournal.com/poses/) e [posturas para iniciantes](https://www.yogajournal.com/poses/poses-by-level/beginners-poses/), consultadas para descoberta de nomes e categorias.
- [Yoga-82: A New Dataset for Fine-Grained Classification of Human Poses](https://openaccess.thecvf.com/content/CVPRW2020/papers/w70/Verma_Yoga-82_A_New_Dataset_for_Fine-Grained_Classification_of_Human_Poses_CVPRW_2020_paper.pdf), referência de diversidade e organização de classes de posturas; não é guia de execução.
- [YogaDB dataset no GitHub](https://github.com/Lambda-zhou/yoga-dataset), consultado como exemplo de esquema rico. O README recomenda revisar direitos para descrições e arte; por isso não importamos seus textos ou recursos visuais.

Não houve alteração de catálogo de Calistenia nem de dados pessoais. Revisão funcional/visual do app ainda não realizada.
