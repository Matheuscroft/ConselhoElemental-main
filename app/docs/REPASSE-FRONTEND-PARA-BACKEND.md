# Repasse atual — R15–R26 · 0.1.68 · 25/10/2026

Matheus, Astro Boy consolidou as mudanças de Fábio desde a versão publicada 0.1.54. **Você continua responsável pelo backend; Fábio continua no frontend, UX/UI e aceite mobile.** O histórico anterior I03/R01–R14 permanece abaixo para não perder o contexto.

## O que chega neste push

| Área | O que foi implementado |
| --- | --- |
| Grandes Obras | Navegação por capítulos e acesso às etapas na trilha existente, preservando IDs e comandos. |
| Invocar | Escolhas com ícones temáticos, explicação dos tipos, hierarquia visual e base compartilhada de design, mantendo o fluxo de criação. |
| Forja | Captura com notas expansíveis, busca, cartões com detalhes, edição ligada a `updateDraft` e confirmações nos comandos existentes. |
| Astrolábio | Leituras reorganizadas, contexto temporal e visual elemental consistente. |
| Domínios | Expanded Cards por elemento, Showcase no detalhe, criação refinada, filtros/retorno na URL, grupos recolhíveis e modo explícito de gerenciar vínculos. |
| Pilares / Mapa / navegação | Descoberta por elementos, busca/categorias, pontuação em níveis e símbolos próprios para 26 destinos. |
| Roda do Destino | Escolha gratuita entre atividades reais, filtros e acesso à execução. Fábio autorizou remover custo de stamina e XP automático do sorteio; conclusão normal mantém recompensas. |
| Ciclos de hoje | Barra compacta com Todos/Pendentes/Feitos, progresso, busca/filtros/ordem; Iniciar/Concluir/Desfazer nomeados; expansão em linha inteira; formulário compartilhado de subitem. |
| Subitens | Papéis ação/checklist/nota/etapa, caminho hierárquico e compatibilidade de tipos legados/canônicos; notas ficam fora da contagem visual de ações. |
| Constância | Runa e detalhes de histórico, recorde e última conclusão; breve animação somente com nova conclusão que aumenta o contador. Cálculo diário/semanal/mensal por datas programadas, com descanso preservado, aprovado explicitamente por Fábio. |

## Atenção ao contrato de backend

Aprovação de Fábio: **“Contar execuções programadas: dias de descanso não quebram a sequência.”** Foi aplicada em `appStore`, conclusão/Undo de ciclo e treino vinculado; subitens herdam agenda da raiz. Um helper compartilhado serve comandos e apresentação. Predicado de agenda apenas extraído do store; nenhuma nova recorrência ou fórmula de recompensa.

O cálculo é uma sequência registrada até a última execução, baseada na agenda atual. Não existe histórico versionado de mudanças da agenda. Conclusões fora da agenda não somam ocorrências, mas seus recibos/pontos não são apagados. UI projeta a regra sem migração em massa; conclusão/Undo atualiza o contador persistido. Streak geral do personagem permanece inalterado.

**Rotações e YEARLY ainda usam regra anterior**: faltam histórico completo de turnos e configuração anual. Não confundimos os dias de outros membros com faltas do usuário. A UI informa o limite. [Contrato, código e casos R26-D](plans/R26-D-CONSTANCIA-PROGRAMADA.md).

Foram preservados recibos, dados pessoais, contratos de autenticação/sync e fórmulas de XP/Prana. Teste comparativo confirmou paridade de recompensa/recibos nos cenários executados; não é uma garantia não testada de todo o backend. Sem schema novo, secrets, deploy ou migração cloud.

## Como retomar

Após atualizar seu checkout com segurança, entre em `app`, execute `npm ci`, `npm run astro:status -- --json` e `npm run astro:welcome`. Perfil que já reconheceu R14 recebe o briefing R26 como pendente; `npm run astro:ack` marca leitura somente nessa máquina. O CLI não inicia agentes automaticamente nem envia mensagens fora do projeto.

Leia [continuidade](CONTINUIDADE.md), [fila](FILA-ENTREGAS.md) e [revisão/publicação](03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md). Validação final: **159 testes Node, TypeScript, lint e build passaram**. O relatório diferencia teste integrado com armazenamento em memória, SSR e QA de navegador. Não houve validação visual completa em celular nesta rodada.

## Próximos passos por responsabilidade

- **Fábio / Astro Boy frontend:** validar jornadas reais em 360/390px, depois tablet 768px; teclado, toque, rolagem, barra inferior, filtros, criar/executar/Undo e retorno contextual. Medir bundle/fluidez antes de novos efeitos.
- **Matheus / backend:** priorizar R25-A/B com Fábio — backup exportável/restauração e associação explícita à conta sem perda ou duplicação. O usuário pediu preservar atividades/conquistas, mas a garantia ainda não está implementada/testada.
- **Contratos a revisar juntos:** histórico de agenda/turnos para constância completa; propagação do pai incluindo NOTE; snapshots/progresso macro das quests; primeiro desvínculo R19 e diferenças documentadas da Forja.
- **Gamificação futura:** 1 fragmento por conclusão válida foi escolhido; distribuição por elemento, idempotência/Undo, persistência e demais contratos continuam pendentes. Fragmentos não foram adicionados neste push.

Este push salva **código e documentação**, não o armazenamento pessoal do navegador. Nenhum login/logout/cadastro/importação foi realizado nesta revisão.

---

## Histórico do repasse R14

> Atualização 24/10/2026: [checkpoint 0.1.64, mudanças R15–R24 e proteção dos dados](PROGRESSO-ATUAL-E-PROXIMOS-PASSOS.md). Conteúdo abaixo registra o repasse histórico R14. A próxima integração de conta precisa tratar reset local, cobertura de core/treinos e backup verificável; nenhum contrato de backend foi alterado.

# Repasse para Matheus e Astro Boy — repaginação elemental

**Atualização: 23/10/2026 · versão 0.1.54 · lotes I03/R01–R14.** Resumo consolidado para retomar após o pull, sem depender do chat. [Estado e publicação](CONTINUIDADE.md) · [fila única](FILA-ENTREGAS.md) · [verificações desta publicação](03-Project-Management/reports/R14-REVISAO-E-PUBLICACAO.md).

## O que mudou desde o último push

Matheus, o trabalho desde 0.1.48 ficou concentrado no frontend de gamificação. A trilha passou a usar nós elementais em relevo, seleção livre, runas próprias e retorno de conclusão com os valores já registrados. Jornadas e Grandes Obras ganharam criação contextual e acesso direto à trilha. Rituais ganhou capas Showcase, detalhes expansíveis e ações de execução separadas.

Sua orientação foi aplicada: **Rituais = tarefas; Ciclos = hábitos recorrentes; Jornadas = quests intermediárias; Grandes Obras = projetos maiores.** `/rituais` abre a lista de tarefas; `/rituais?view=trilhas` abre o mapa. Links antigos com `trilha` e `etapa` permanecem válidos. Não apagamos datas nem migramos registros.

As referências Figma e vídeos orientaram apresentação e movimento. **Fragmentos e uma nova mecânica de streak ainda não foram implementados.** Fábio confirmou 1 fragmento por conclusão válida, separado de XP/Prana; elegibilidade, elemento em atividades multiárea, dia/fuso, concessão/Undo e persistência continuam para definição conjunta antes de backend. [Plano de contratos](plans/R12-GAMIFICACAO-VIDEOS.md).

**Matheus conduz o backend:** contratos, APIs, autenticação, persistência, sincronização, isolamento e documentação técnica. **Fábio continua conduzindo frontend, UX/UI, referências e aceite visual. Astro Boy coordena ambos.** A publicação da repaginação não transfere o frontend pendente ao Matheus nem autoriza mudar suas fórmulas.

## Primeiro acesso após o pull

Na raiz do repositório:

```sh
cd app
npm ci
npm run astro:status -- --json
npm run astro:welcome
# Só se ainda não houver perfil explícito nesta máquina:
npm run astro:setup -- --name Matheus --role backend
# Depois de receber e ler o resumo:
npm run astro:ack
npm run dev
```

O CLI agora informa `handoffDocument`, `briefingId` e `updateBriefingRequired`. Perfis antigos, mesmo já apresentados, recebem **uma atualização desta entrega**; `ack` registra que o resumo foi visto, preservando nome/papel e a data original. A IDE segue AGENTS.md ao iniciar trabalho. Apenas abrir o GitHub, clonar ou abrir uma pasta não executa um agente automaticamente. Não há daemon, equipe continuamente ativa ou mensagem externa enviada ao Matheus.

Comece por `/santuario`, `/rituais`, `/ciclos`, `/grimorio`, `/lua`, `/estacoes`, `/temporal/ano` e `/treinos`. Para rotas exatas de todas as vistas, use Explorar/Mapa ou `src/App.tsx`. Não copiar perfis, `.env` ou credenciais de outro computador.

## Objetivo e decisões do Fábio

O produto continua sendo **gestão pessoal gamificada**, com magia elemental como identidade. Abrange hábitos, tarefas, projetos, estudos, lazer, casa, saúde, treino e vida emocional. Não foi transformado num jogo isolado dos registros pessoais.

Decisões explícitas recebidas nesta conversa:

- Personagem protagonista no Santuário, acompanhado de evolução/recursos e quatro elementos ao redor.
- Escolher um elemento abre sua própria página, com volta ao Santuário.
- Corpo elemental com vestes coerentes; quatro assets realistas/vivos em órbita. Água pulsante, terra sólida, ar em vórtice e fogo como chama.
- Refinar efeitos naturais; remover a aparência de deformação global que foi rejeitada.
- A nova home substitui definitivamente a clássica; acesso visual antigo removido e bookmarks redirecionados.
- Expandir a identidade a todo o app, incluindo cabeçalhos, ícones, formulários, estados vazios, cronômetro e cartões.
- Usar padrões Expanded Cards/Showcase onde melhoram descoberta e detalhes, sem impor o mesmo cartão a todas as ações.
- Ciclos, Lua e Grimório receberam prioridade específica. A Lua deve apresentar fase/iluminação atualizadas e aparência 3D realista.
- Quests inspiradas no Duolingo: **próxima etapa sugerida, com acesso livre às demais**, ligadas a Rituais/Jornadas/Grandes Obras e ao Santuário.
- Preservar backend, dados, fórmulas de XP/Prana, fontes de tempo e regras de Matheus. Sem secrets/deploy/migrações neste escopo.

As aprovações e elogios visuais de Fábio orientaram os lotes. Não equivalem a teste automatizado ou aceite de todos os estados/resoluções.

## Tudo que foi acrescentado e implementado

| Lote / versões | Resultado no código | Limites relevantes |
| --- | --- | --- |
| I03 · 0.1.32 | Retomada do assistente de rascunho: resumo mostra nome/descrição antes da confirmação; regressão local documentada. Fluxo preserva consentimento explícito → texto mínimo/JWT → sugestão editável → confirmar → `addDraft`. | Gateway já existente não foi implantado; chamada real, quota global e auditoria remota não verificadas. Sem gravação automática da sugestão. |
| R01 · diagnóstico | Inventário de telas, prioridades de UX, referências e plano em partes. Documentação canônica e divisão frontend/backend mantidas. | Relatório de proposta não comprova implementação dos itens futuros. |
| R02 · 0.1.33–0.1.38 | Prévia do novo Santuário; corpo elemental; órbita com perspectiva/oclusão, pausa/setas/alternativa por nomes; quatro assets WebP e materiais animados próprios. Efeitos de distorção global removidos na revisão. | Equipamentos continuam seis espaços visuais; não há inventário funcional novo. Fluidez em dispositivos ainda exige QA. |
| R03 · 0.1.39/0.1.41 | Páginas próprias de elementos, áreas reais, busca/filtros, URLs e volta; novo Santuário promovido a home; Pilares reorganizados. Atalhos de execução existentes mantidos. | Não reclassifica áreas nem cria novos módulos/domínios. |
| R04 · 0.1.40 | Tokens elementais compartilhados, paleta escura/ouro, Cinzel/Inter, superfícies, controles/foco; cartões Showcase e Expanded; cronômetro elemental reutilizável. | Não cria relógio de domínio nem recompensa diferente. Identidade compartilhada não significa todas as telas totalmente redesenhadas. |
| R05 · 0.1.42 | Navegação Temporal; Ano com métricas/meses e links corretos; Estações em cartões; Lua com efemérides, textura NASA em esfera Three.js, iluminação, atualização por minuto/retorno e fallback SVG. | Hemisfério é orientação de referência, não posição observada do céu. `getMoonPhase`/`getSeason` legados e suas aproximações não foram alterados. |
| R06 · 0.1.43 | Família própria de 20 ícones SVG; selos elementais; navegação lateral/mobile/Explorar, busca e Mapa; teclado/semântica de cartões; emojis genéricos substituídos nas áreas delimitadas. | Ainda há contextos especializados antigos, especialmente Fitness/Cassino/calendário. Não houve substituição indiscriminada de dados/catalogação. |
| R07 · 0.1.44 | Ciclos: calendário com nove dias expansíveis, seleção completa, janelas de sete dias, rotina/sequências, filtros, estados vazios, evolução e showcase de sequência. | Recorrência, ordenação, execução e pontuação existentes preservadas. |
| R08 · 0.1.45 | Novo cabeçalho compartilhado com marca, Explorar e conta; removidos sino sem ação e emoji genérico. Formulários/painéis de ciclos e sequências refinados; expansão do calendário permanece na posição. UI exclusiva do Santuário clássico removida. | Conta e operações preservadas; rota clássica redireciona. Arquivos de backend não foram removidos. |
| R09 · 0.1.46 | Grimório com ficha única, corpo elemental, HP/Stamina/Prana/XP em vidro, nível/título/consistência, edição de identidade, maestria em showcases e radar opcional. Histórico pesquisável por tipo/período, com deduplicação e valores registrados. | Não inventa eventos, pontuação, inventário ou dados de saúde. Divergências preexistentes de Prana/precisão registradas para revisão própria. |
| R10 · 0.1.47 | Quests em Rituais, lista anterior acessível, compositor de Jornada/Grande Obra e primeiro capítulo, nós selecionáveis, timer/recibo/próxima etapa; adicionar etapas; próximas quests no Santuário e links em Jornadas/Obras. | Projeção por IDs atuais; não grava porcentagem macro nem concede bônus macro. Hábitos e treinos seguem seus fluxos próprios. |
| R11 · 0.1.48 | Revisão integrada: quatro avisos de hooks corrigidos sem mudar seus corpos de cálculo; destinos dos atalhos de rituais corrigidos; timer simples impede treinos/agregadores; Astrolábio deixa de gerar dados aleatórios; teste de Fitness atualizado para regra consolidada vigente; repasse versionado e boas-vindas atualizadas uma vez. | Estado das verificações e limitações em [relatório R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md). Não se promete ausência de qualquer bug. |
| R12-A · 0.1.49 | Piloto do percurso sinuoso, nós elementais, painel contextual e estados acessíveis. Extração Figma JSON/CSS preservada como referência documental. | Sem bloqueio sequencial; seleção livre. QA visual pendente. |
| R12-B · 0.1.50 | Runas SVG próprias, gestos de seleção, progresso, selo de conclusão e métricas reais em sequência. | Animação não concede recompensa nem cria inventário. |
| R12-C · 0.1.51 | Catálogos de Jornadas/Grandes Obras, compositor contextual, acesso direto às trilhas, diálogos e controles refinados. | Capítulos/edição avançada ainda parciais; criação rápida anterior preservada. |
| R12 · 0.1.52 | Taxonomia alinhada ao retorno de Matheus; tarefas como entrada de Rituais; guia entre áreas; evolução recolhível. | Dados, datas, recorrência e fórmulas preservados. |
| R13 · 0.1.53 | Capas Showcase na lista, orb elemental, descrição completa, execução sempre visível, busca/filtros/estado vazio e evolução compacta após tarefas. | QA de navegador e interação real pendentes. |
| R14 · 0.1.54 | Revisão integrada, compositor reiniciado ao trocar conta, repasse consolidado, índices corrigidos e novo aviso de atualização do Astro Boy após o pull. | Ver resultados atuais no relatório R14; push não equivale a deploy. |

O histórico detalhado está no [changelog](03-Project-Management/fitness/CHANGELOG.md), [manual](MANUAL-ENGENHARIA.md), [dossiê](DOSSIE-TECNICO.md) e relatórios R02–R10 vinculados pelo [índice](README.md). Não usar um relatório antigo como evidência atual.

## Referências e o que realmente foi aproveitado

- **Scrolltide:** [Carousel Ring](https://www.scrolltide.co/#c-carousel-ring), [Expanded Cards](https://www.scrolltide.co/#c-expanded-cards) e [Showcase Card](https://www.scrolltide.co/#c-showcase-card). Padrões reimplementados originalmente; não foi adquirido/copiado código pago. Órbita no Santuário; expansão em elementos/calendário/estações/exploração; showcase em projetos, jornadas, sequências, meses e maestria.
- **Duolingo Community Figma:** [arquivo fornecido](https://www.figma.com/design/g5rrLsKdGs9f5QXsxEsGH6/DuoLingo-Design-System--Community-?node-id=24-482). Inventário de páginas e inspeção dos fluxos/componentes relevantes. Adaptados percurso, etapa selecionada, hierarquia de ação e retorno de conclusão. Não contém nem foi copiado um motor de regras oficial do Duolingo. Sem vidas, ligas, penalidades ou bloqueios novos.
- **openGym:** análise como referência para evolução de Fitness; não houve importação integral do projeto nem substituição dos stores/fluxos atuais. Melhorias futuras continuam sob Fábio e a fila.
- **Skillion, Gamify Your Life e Habitica:** referências de produto de gamificação pessoal; não se afirma equivalência funcional.
- **Referências X/hover proximity:** consultadas no diagnóstico, com limites de acesso/vídeo documentados em R01. Não foram importadas dezenas de bibliotecas.
- **Wizard:** instruções foram recuperadas e avaliadas. O procedimento é voltado a operação/infraestrutura; não foi usado para desenhar telas nem configurar credenciais neste lote.
- **Arte:** corpo e elementos estão em `public/sanctuary`; mapas lunares e atribuição NASA/Astronomy Engine em `public/temporal/moon/CREDITS.txt`. Manter os créditos.

## Contrato que Matheus deve conhecer

**Preservado:** arquivos de `src/stores`, `src/lib`, `src/types`, `src/services`, `src/constants` e `supabase` não foram modificados pela publicação acumulada. Integrações novas usam getters, IDs e comandos existentes. A regra Fitness vigente continua sessão consolidada, ER × 0.10, esforço global e tempo de sessão; RPE por série é informativo. O calculador por blocos ainda existe como proposta histórica, sem ser reativado.

Pontos concretos para diagnóstico de backend, sem correção automática:

1. **Snapshots macro:** cópias de tarefas dentro de quests/missões podem ficar antigas após `completeTask`. A trilha resolve o estado por ID nas tarefas atuais. Sua contagem finita não equivale ao `.progress` persistido da macro. Sincronizar/concluir macro e conceder bônus exige contrato/testes próprios.
2. **Undo/idempotência:** validar reversão de eventos, pontos e delta efetivo de Prana conforme contrato aceito. Este frontend não migra recibos nem recalcula o passado.
3. **Persistência/sincronização:** novas telas leem o store existente; não comprovam sincronização Supabase ou isolamento remoto entre contas. Testar isso com escopo próprio.
4. **Recursos/precisão:** fontes atuais de Prana e serialização/precisão de XP têm divergências históricas registradas. Não harmonizar silenciosamente sob um ajuste visual.
5. **Lua versus calendário legado:** a página Lua apresenta efemérides atualizadas; badges antigos podem continuar usando aproximações. É uma divergência de apresentação conhecida, sem impacto em pontos.
6. **I03:** sugestão não cria registros até confirmação. Ativação, secrets, custo/quota, auditoria remota, voz e ferramentas adicionais não foram autorizados como parte desta publicação.
7. **Grimório/Astrolábio:** histórico é projeção de registros existentes, não um ledger paralelo. Astrolábio não infere a divisão elemental histórica a partir da classificação atual; mostra pontos registrados por dia e mantém distribuição atual separada.

8. **Fragmentos/constância:** quantidade inicial aprovada, demais contratos pendentes conforme plano R12; sem saldo paralelo ou migração implícita.

## O que ainda será conduzido por Fábio

Próximos lotes propostos, sujeitos à fila e ao aceite dele:

- QA visual e funcional de Santuário, navegação, elementos/Pilares, Ciclos, Lua/Estações/Temporal, Grimório e quests em **360/390/768/1440 px**: foco, teclado, toque, formulários, textos longos, movimento reduzido, rolagem e barra inferior.
- Testes reais com dados isolados: criação, edição, recarga, pausa/retomada, conclusão/Undo, troca de conta, sequências e entradas Fitness. Os testes Node/SSR não substituem esses fluxos.
- Refinar capítulos/detalhes das Jornadas e Grandes Obras; validar as novas capas de Rituais e trilhas com dados isolados.
- Completar identidade/UX das áreas ainda parciais: Domínios/detalhes, Forja/Invocar, Astrolábio, Cassino, onboarding/auth, listas/editores antigos, demais vistas Temporal e contextos especializados Fitness. Algumas já receberam tema/ícones, sem reformulação integral.
- Refinar performance, carregamento inicial e movimentos em dispositivos; build ainda alerta chunks grandes e base Browserslist antiga. Não houve benchmark de FPS/Core Web Vitals.
- Avaliar as melhorias de treino inspiradas no openGym mantendo biblioteca, sessões, histórico e adapters existentes.
- Evolução de equipamentos/inventário e novas mecânicas somente com requisitos e contrato próprios. A imagem do personagem não implementa esses sistemas.

Essas pendências **não são tarefas atribuídas automaticamente a Matheus**. Ele pode apoiar contratos/viabilidade; a direção de interface continua com Fábio.

## Evidência e limites de entrega

Ver comandos e resultados atuais no [R14](03-Project-Management/reports/R14-REVISAO-E-PUBLICACAO.md). R11 é evidência histórica da publicação anterior. O bloqueio salvo de acesso do agente ao localhost impediu QA renderizado recente; não foi contornado nem confundido com erro do produto. Capturas e aprovações do usuário não são execução de testes pelo agente.

Publicação solicitada: GitHub `Matheuscroft/ConselhoElemental-main`, branch `main`, sem force-push. Push não significa deploy ou validação de produção. O SHA confirmado e a situação final ficam em CONTINUIDADE e na resposta de publicação; em caso de conflito remoto, integrar preservando o trabalho novo antes de repetir o push.
