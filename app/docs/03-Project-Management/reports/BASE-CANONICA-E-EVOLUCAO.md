# Base canônica e evolução do Conselho Elemental

Alinhamento de 05/10/2026, após indicação expressa do usuário. Este documento orienta continuidade; não atesta implementação ou testes do core.

## Fonte principal

O índice canônico desta cópia do projeto é [docs/README.md](../../README.md). Consulte as especificações de domínio e arquitetura listadas nele; caminhos absolutos de outras máquinas não são referências portáveis.

Consultar Overview/Glossário para visão e vocabulário; Domain Core para hierarquia, pontuação, energia e astrologia; Platform Architecture para módulos, hábitos, lista diária e assistente; ADRs para decisões históricas. Ler os capítulos pertinentes antes de alterar cada domínio. Preservar os documentos originais.

## Contratos a preservar

- Terra: corpo, estrutura e material; Fogo: ação, expansão e impacto; Água: emoções, relações e interioridade; Ar: intelecto, comunicação e ideias. IDs legados `body-*` representam elementos, não o eixo opcional de Corpos pessoais.
- Persistência relacional vigente: `projects`, `quests` e `missions` são tabelas macro distintas; `actions` contém raízes `ACTION`/`HABIT` e descendentes recursivos por `parent_id`. A tabela antiga `action_items` foi abolida. A raiz define `lifecycle_type`; descendentes recebem `semantic_type` `VALUABLE`, `VALUELESS` ou `NOTE`.
- Actions sem descendentes `VALUABLE` podem pontuar por seu próprio `base_value`; árvores com descendentes `VALUABLE` agregam a pontuação destes em qualquer profundidade. `VALUELESS` é apenas progresso visual e `NOTE` é texto sem checkbox. Pais não reaplicam multiplicadores.
- Rascunhos podem ser classificados como qualquer entidade do sistema; conversões pós-criação entre naturezas usam o Data Migration Service, migrando árvore, vínculos e histórico sem God Table ou recálculo de XP.
- Separar valor base, previsão e execução histórica; não inferir tempo, esforço ou área. A pontuação por execução usa teto de esforço; a distribuição multiárea aloca 100% do orçamento como 100%, 70/30% ou 60/25/15%.
- Hábito é Action com recorrência; reutilizar contratos e componentes. Quest referencia Actions por vínculos: excluir Quest não exclui suas Actions.
- Santuário/Lista Diária reúne execução e planejamento com tratamento uniforme. Questionários especializados são delegados aos módulos de origem.
- Prana é recurso de jogo, limitado a 0–100, com natureza energética explícita. Não apresentá-lo como medição clínica ou criar valores fictícios de saúde.
- Grimório, Módulo de Treino e demais módulos nativos conectam-se ao Core por adapters e eventos, sem duplicar pontuação. A Forja é exclusivamente a inbox de Rascunhos e triagem.
- Assistente de texto/voz usa operações de domínio limitadas, autenticadas e auditadas; não escreve SQL livre nem inventa classificação silenciosamente.
- Astrologia é camada opcional de jogo; sua especificação não comprova que esteja implementada.

## Pontos que precisam de reconciliação antes de alterar regras

1. A semântica de Undo e imutabilidade do `ExecutionLog` está definida no Motor de Pontuação: Hard Delete do evento e de bônus ligados, reversão de áreas e do delta efetivamente aplicado de Prana na mesma transação, sem log de estorno. A implementação ainda precisa ser comparada com esse contrato. Recuperação de Prana só ocorre por execução `RESTORATIVE`; bônus de XP não alteram o recurso.
2. A integração de pausa de `HabitRotation` continua com um ponto a verificar: a especificação diz que hábitos voltam à recorrência original enquanto a rotação está pausada, mas o pseudocódigo de exibição filtra itens com vínculo de rotação. Conferir o comportamento efetivo antes de implementar.
3. A precisão/serialização de valores decimais precisa permanecer uniforme entre itens genéricos, módulos nativos e Core; validar a regra de persistência na implementação.

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

Consultar [Mapa de Implementação](./MAPA-IMPLEMENTACAO-ELEMENTAL.md): inspeção estática de uma data específica, não status vigente. Validação funcional integral permanece pendente naquele registro.

## Distribuição portável — P01

Em clones de outros colaboradores, começar por `docs/README.md` e capítulos versionados de Overview, Domain Core, Platform Architecture e ADRs. O caminho absoluto citado acima registra a fonte original de Fábio; não exige acesso a essa pasta. Conferir divergências entre contrato e código; relatórios históricos não autorizam reescrita automática.
