# Evolução de gamificação e design system — R12–R26

23/10/2026. Base anterior: `987e09e`, versão 0.1.48. Planejamento seguido de implementação R12-A/B/C, taxonomia e R13 até 0.1.53; revisão e repasse em 0.1.54. Estado final da publicação na continuidade. Esta pasta detalha a entrada R12 da [fila operacional](../FILA-ENTREGAS.md), não cria uma segunda fila.

Publicação R15–R26 confirmada em main (`0a1db75`, 0.1.68); [evidência e situação remota](../03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md). A coluna de estado dos lotes anteriores registra o fechamento de cada rodada.

| Plano | Estado | Dependência |
| --- | --- | --- |
| [R26-D — constância programada](R26-D-CONSTANCIA-PROGRAMADA.md) | 0.1.68; cálculo integrado e testes de comandos reais | Histórico de turnos/anual e QA visual pendentes |
| [R26-C — subitens e constância](R26-C-SUBITENS-CONSTANCIA.md) | 0.1.67 local; papéis, compatibilidade e selo | QA mobile; cálculo diário/semanal/mensal avançou em R26-D |
| [R26-B — execução de Ciclos](R26-B-CICLOS-EXECUCAO.md) | 0.1.66 local; ações explícitas e controles recolhíveis | QA visual/toque pendente |
| [R26-A — rotina de Ciclos](R26-A-CICLOS-ROTINA.md) | 0.1.65 local; filtros, cartões e subitens | QA mobile pendente; R25-A/B segue planejado |
| [R24 — Roda do Destino](R24-RODA-DO-DESTINO.md) | 0.1.64 local; escolha gratuita de atividades reais | QA mobile/interações pendente |
| [R23 — Domínios compacto](R23-DOMINIOS-COMPACTO.md) | 0.1.63 local; grupos e linhas compactas | QA visual/interação pendente |
| [R22 — descoberta mobile](R22-DESCOBERTA-MOBILE.md) | 0.1.62 local; Ciclos, Pilares e Mapa | QA visual/mobile pendente |
| [R21 — ícones próprios](R21-ICONES-NAVEGACAO.md) | Incorporado a 0.1.62; 26 destinos distintos | Aceite visual pendente |
| [R20 — navegação de Domínios](R20-DOMINIOS-NAVEGACAO.md) | 0.1.60 local; retorno, filtros e atalhos | QA de navegação real pendente |
| [R19 — Domínios](R19-DOMINIOS.md) | 0.1.59 local; Expanded Cards, Showcase e formulários | QA visual e revisão de vínculo legado com Matheus |
| [R18 — Astrolábio](R18-ASTROLABIO.md) | 0.1.58 local; leituras e elementos | QA visual/interações pendente |
| [R17 — Forja](R17-FORJA.md) | 0.1.57 local; captura, edição e classificação | QA visual/interações e revisão de divergência com backend |
| [R16 — Invocar e design system](R16-INVOCAR-DESIGN-SYSTEM.md) | 0.1.56 local; base e piloto em Invocar | QA visual e autenticação Sleek pendentes |
| [R15 — capítulos de Grandes Obras](R15-CAPITULOS-GRANDES-OBRAS.md) | 0.1.55 local; navegação por capítulo | QA visual pendente |
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

Próxima fase definida em 24/10/2026: [R25-A/B — proteção do progresso e conta; R26 — usabilidade mobile](../PROGRESSO-ATUAL-E-PROXIMOS-PASSOS.md). R25-A/B ainda sem implementação ou backup pessoal confirmado. Em 25/10, Fábio priorizou o refinamento R26-A de Ciclos; o QA integrado continua pendente.
