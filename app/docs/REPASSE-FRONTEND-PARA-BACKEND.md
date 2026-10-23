# Repasse para Matheus e Astro Boy — repaginação elemental

**Atualização: 23/10/2026 · versão 0.1.48 · lotes I03/R01–R11.** Este documento resume o trabalho desta conversa e permite retomar sem o histórico do chat. Estado operacional e publicação: [CONTINUIDADE](CONTINUIDADE.md). Fila única: [FILA-ENTREGAS](FILA-ENTREGAS.md). Não substitui contratos do domínio nem atesta revisão visual integral.

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

## O que ainda será conduzido por Fábio

Próximos lotes propostos, sujeitos à fila e ao aceite dele:

- QA visual e funcional de Santuário, navegação, elementos/Pilares, Ciclos, Lua/Estações/Temporal, Grimório e quests em **360/390/768/1440 px**: foco, teclado, toque, formulários, textos longos, movimento reduzido, rolagem e barra inferior.
- Testes reais com dados isolados: criação, edição, recarga, pausa/retomada, conclusão/Undo, troca de conta, sequências e entradas Fitness. Os testes Node/SSR não substituem esses fluxos.
- Completar identidade/UX das áreas ainda parciais: Domínios/detalhes, Forja/Invocar, Astrolábio, Cassino, onboarding/auth, listas/editores antigos, demais vistas Temporal e contextos especializados Fitness. Algumas já receberam tema/ícones, sem reformulação integral.
- Refinar performance, carregamento inicial e movimentos em dispositivos; build ainda alerta chunks grandes e base Browserslist antiga. Não houve benchmark de FPS/Core Web Vitals.
- Avaliar as melhorias de treino inspiradas no openGym mantendo biblioteca, sessões, histórico e adapters existentes.
- Evolução de equipamentos/inventário e novas mecânicas somente com requisitos e contrato próprios. A imagem do personagem não implementa esses sistemas.

Essas pendências **não são tarefas atribuídas automaticamente a Matheus**. Ele pode apoiar contratos/viabilidade; a direção de interface continua com Fábio.

## Evidência e limites de entrega

Ver comandos e resultados atuais no [R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md). O bloqueio salvo de acesso do agente ao localhost impediu QA renderizado recente; não foi contornado nem confundido com erro do produto. Capturas e aprovações do usuário não são execução de testes pelo agente.

Publicação solicitada: GitHub `Matheuscroft/ConselhoElemental-main`, branch `main`, sem force-push. Push não significa deploy ou validação de produção. O SHA confirmado e a situação final ficam em CONTINUIDADE e na resposta de publicação; em caso de conflito remoto, integrar preservando o trabalho novo antes de repetir o push.
