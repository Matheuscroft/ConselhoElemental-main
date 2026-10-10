# Base canônica e evolução do Conselho Elemental

Alinhamento de 05/10/2026, após indicação expressa do usuário. Este documento orienta continuidade; não atesta implementação ou testes do core.

## Fonte principal

`/Users/fabioandre/Developer/docs-conselho-master/README.md`

Consultar Overview/Glossário para visão e vocabulário; Domain Core para hierarquia, pontuação, energia e astrologia; Platform Architecture para módulos, hábitos, lista diária e assistente; ADRs para decisões históricas. Ler os capítulos pertinentes antes de alterar cada domínio. Preservar os documentos originais.

## Contratos a preservar

- Terra: corpo, estrutura e material; Fogo: ação, expansão e impacto; Água: emoções, relações e interioridade; Ar: intelecto, comunicação e ideias. IDs legados `body-*` representam elementos, não o eixo opcional de Corpos pessoais.
- Task pontua apenas como folha; agregadores somam. Check não pontua e não pode conter Task; Note não pontua nem contém filhos. Não reaplicar multiplicadores nos pais.
- Separar valor base, previsão e execução histórica; não inferir tempo, esforço ou área. Distribuição por área 100/60/30 não significa somar novamente tudo ao valor global.
- Hábito é Action com recorrência; reutilizar contratos e componentes. Quest referencia Actions por vínculos: excluir Quest não exclui suas Actions.
- Santuário/Lista Diária reúne execução e planejamento com tratamento uniforme. Questionários especializados são delegados aos módulos de origem.
- Prana é recurso de jogo, limitado a 0–100, com natureza energética explícita. Não apresentá-lo como medição clínica ou criar valores fictícios de saúde.
- Grimório, Forja e demais módulos conectam-se ao core por adapters e eventos, sem duplicar pontuação. Preservar integrações existentes até comprovar necessidade de alteração.
- Assistente de texto/voz usa operações de domínio limitadas, autenticadas e auditadas; não escreve SQL livre nem inventa classificação silenciosamente.
- Astrologia é camada opcional de jogo; sua especificação não comprova que esteja implementada.

## Pontos que precisam de reconciliação antes de alterar regras

1. Motor de pontuação declara histórico imutável, enquanto exemplo de desfazer em Ações e Hábitos apaga ExecutionLog. Verificar contrato efetivo e mecanismo de reversão existente; não apagar histórico por seguir o exemplo.
2. Exemplo multi-área de 90 minutos omite presença, embora a fórmula geral a inclua. Não usar esse exemplo isolado para mudar o cálculo.
3. Rotação pausada deve devolver recorrência original, mas o pseudocódigo filtra qualquer hábito com ownership. Conferir implementação e testes dessa condição.
4. Há divergência sobre decimais manuais: o motor permite qualquer base positiva; o contrato de módulos contém restrição mais estreita. Não alterar validação automaticamente.

Esses pontos são inconsistências documentais identificadas, não defeitos comprovados do app.

## Execução aprovada: evoluir o existente

1. Relacionar módulos/rotas, contratos e testes atuais à documentação. Classificar cada capacidade como verificada, parcial, apenas especificada ou divergente, com evidência.
2. Definir sistema visual elemental sobre os componentes existentes: tokens, tipografia, iconografia, estados, movimento e acessibilidade. Aplicar frontend-design e preservar referências explícitas.
3. Concluir blocos A–D do Fitness com referências locais e expandir a apresentação por módulos existentes, preservando conteúdo, dados e comportamento.
4. Implementar lacunas funcionais comprovadas em lotes próprios, reutilizando core e integrações. Ideias adicionais complementam a arquitetura; não justificam reescrita geral.
5. Integrar e validar o assistente conforme contratos documentados, com comportamento útil quando o provedor estiver indisponível.
6. Validar fluxos completos, persistência, reversão, acessibilidade, responsividade e performance. Relatar apenas verificações executadas; não usar porcentagens subjetivas como aprovação.

Próxima entrega: mapa de implementação versus documentação e seleção de um lote visual concreto. A leitura e este alinhamento não alteraram regras, dados ou frontend, nem confirmam ausência de regressões no código existente.

## Primeiro mapa produzido

Consultar `docs/MAPA-IMPLEMENTACAO-ELEMENTAL.md`: inspeção estática com divergências concretas e próximo lote visual selecionado. Validação funcional integral permanece pendente.

## Distribuição portável — P01

Em clones de outros colaboradores, começar por `docs/README.md` e capítulos versionados de Overview, Domain Core, Platform Architecture e ADRs. O caminho absoluto citado acima registra a fonte original de Fábio; não exige acesso a essa pasta. Conferir divergências entre contrato e código; relatórios históricos não autorizam reescrita automática.
