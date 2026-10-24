# Evolução de gamificação — R12/R13

23/10/2026. Base anterior: `987e09e`, versão 0.1.48. Planejamento seguido de implementação R12-A/B/C, taxonomia e R13 até 0.1.53; revisão e repasse em 0.1.54. Estado final da publicação na continuidade. Esta pasta detalha a entrada R12 da [fila operacional](../FILA-ENTREGAS.md), não cria uma segunda fila.

| Plano | Estado | Dependência |
| --- | --- | --- |
| [R13 — Rituais Showcase](R13-RITUAIS-SHOWCASE.md) | 0.1.53 local; apresentação implementada | QA visual e interações pendentes |
| [Alinhamento de taxonomia com Matheus](R12-TAXONOMIA-MATHEUS.md) | 0.1.52 local; tarefas como entrada padrão | QA renderizado pendente; domínio preservado |
| [R12-C — catálogos e criação integrada](R12-C-CATALOGOS.md) | 0.1.51 local, em revisão visual | QA de criação/navegação; capítulos avançados pendentes |
| [R12-B — movimento e runas](R12-B-MOVIMENTO.md) | 0.1.50 local, em revisão visual | QA; streak/fragmentos dependem de R12-D/E |
| [R12-A — piloto implementado e evidências](R12-A-PILOTO.md) | 0.1.49 local, em revisão visual | QA renderizado pendente |
| [Revisão de prontidão e piloto R12-A](R12-PRONTIDAO.md) | Preparado para iniciar o piloto visual; implementação não iniciada | QA renderizado antes de aceite; economia depende de R12-D |
| [R12 — vídeos, experiência, streak e fragmentos](R12-GAMIFICACAO-VIDEOS.md) | Quantidade aprovada: 1 fragmento por conclusão válida; demais contratos pendentes | Aprovação dos detalhes de domínio antes de recompensas reais |
| [001 — movimento das quests e conclusão](001-MOVIMENTO-QUESTS.md) | Parcial: R12-A/B implementados, QA pendente | Começar pelo piloto visual de Jornada; recibos reais para celebração |

Ordem recomendada: piloto de Jornada → mapa/seleção → execução/recibo → Jornadas/Obras/Santuário → streak visual existente → contrato de recompensas com Matheus → fragmentos persistidos → QA integrado. Não inserir saldo fictício em produção enquanto o contrato não existir.

Propriedade: Fábio decide UX e produto; Matheus mantém backend e contratos; Astro Boy coordena. O pedido atual acrescenta intenção de fragmentos e incentivo por streak, e Fábio confirmou 1 fragmento por conclusão válida do elemento da atividade, separado de XP/Prana. Isso não aprova por implicação outras regras de elegibilidade, alteração de XP/Prana, migração ou deploy.
