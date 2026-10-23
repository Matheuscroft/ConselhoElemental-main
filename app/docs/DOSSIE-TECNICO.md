# Dossiê técnico — Conselho Elemental / Domínio do Mago

## Publicação da repaginação — 0.1.48

Repasse acumulado I03/R01–R11 preparado por pedido explícito de Fábio. Backend permanece com Matheus; frontend e acabamento seguem com Fábio. Correções integradas incluem navegação/timer, hooks, histórico real no Astrolábio e onboarding atualizado. Stores, fórmulas e contratos existentes preservados; dados e infraestrutura não migrados. [Repasse completo](REPASSE-FRONTEND-PARA-BACKEND.md) · [Evidências R11](03-Project-Management/reports/R11-REVISAO-E-PUBLICACAO.md).

## Trilhas de quests — 0.1.47

Padrões de percurso, seleção e retorno do kit comunitário Duolingo adaptados à magia elemental. Jornadas/Grandes Obras existentes viram trilhas de rituais; Santuário oferece próximas etapas. Acesso livre confirmado pelo usuário. Contagem de rituais é projeção visual, sem segundo motor ou sincronização silenciosa de snapshots/progresso macro. Conclusão e persistência continuam no store atual. Implementado localmente; QA visual/fluxo de navegador pendente. [Escopo, evidências e retomada R10](03-Project-Management/reports/R10-QUESTS-E-TRILHAS.md).

## Ficha e histórico do Grimório — 0.1.46

Uma ficha substitui a duplicação de avatar/status: corpo elemental aprovado, recursos em vidro, maestria geral/elemental e histórico somente leitura. Fontes reais de progresso e gravação do perfil preservadas; nenhum inventário/badge ou evento de domínio fabricado. Projeção de histórico não recalcula totais. Divergências existentes de Prana/precisão de XP registradas, sem alteração de contrato. [Decisões e evidências R09](03-Project-Management/reports/R09-GRIMORIO.md); validação renderizada pendente por bloqueio efetivo do navegador.

## Home definitiva e UI compartilhada — 0.1.45

Autorização explícita do usuário aposentou a UI clássica. Removidos somente página, palco e CSS exclusivos; modelos/recursos compartilhados preservados. Cabeçalho e composição de Ciclos são apresentação sobre contratos existentes. Sem alteração de backend, cálculos ou dados. [Evidências R08](03-Project-Management/reports/R08-CABECALHOS-E-COMPOSICAO.md).

## Redesign de Ciclos — 0.1.44

Camada de descoberta/organização visual sobre a composição existente: calendário Expanded Cards e Showcase de sequências/evolução/estados vazios. A única mudança no efeito antigo de datas é rolagem de apresentação. Novo Showcase de sequência recebe membros, atual e callbacks; não substitui o motor de recorrência. Ciclos conserva cálculo, relógios, completion, reordenação e integrações de Fitness. Autorização atual cobre UX/UI, não mudanças de regras. Revisão renderizada permanece pendente. [Escopo e evidências](03-Project-Management/reports/R07-CICLOS-REDESIGN.md).

## Iconografia transversal — 0.1.43

Família SVG autoral separada de constants e persistência. Navegação reaproveita catálogo de rotas; Expansão/Showcase organizam descoberta sem novo estado de domínio. Emojis especializados continuam pendentes; não confundir camada compartilhada com migração integral. [Escopo, preservação e evidências](03-Project-Management/reports/R06-ICONES-E-EXPLORACAO.md).

## Apresentação temporal — 0.1.42 / 22/10/2026

Lua passa a usar efemérides da Astronomy Engine existente e uma esfera Three.js com mapas NASA locais. Esta camada é somente leitura, separada dos helpers legados e sem impacto em XP/Prana/persistência. Vista de referência por hemisfério não simula a orientação exata do céu local. Estações mantém calendário aproximado existente; Ano/Mês mantêm handlers e métricas. Expanded em Estações e Showcase nos meses complementam a identidade transversal. [Fontes, divergência lunar e limites de validação](03-Project-Management/reports/R05-TEMPORAL-LUA-ESTACOES.md).

## Santuário canônico e Pilares — 0.1.41 / 22/10/2026

Home canônica em `/santuario`, elementos em `/santuario/elementos/:elementId`. Prévia redireciona; home clássica permanece como alternativa. TopBar em modo accountOnly reutiliza conta; SanctuaryRituals delega operações existentes com proteção por conta/ritual/sessão. Não montar AppLayout junto com a casca elemental, que já mantém o tick existente. Pilares usa os getters reais e leva às páginas elementais. [Implementação, testes e QA pendente](03-Project-Management/reports/R03-SANTUARIO-HOME-PILARES.md). Este registro atualiza as pendências de promoção/início/conclusão mencionadas no histórico abaixo, sem declarar paridade visual validada.


> Atualizado em 13/10/2026 após a sincronização de Matheus. Para estado operacional e próximo passo, consultar CONTINUIDADE.md; este dossiê registra escopo e limites arquiteturais.

Edição documental: 09/10/2026. Custódia: Versionamento e documentação; decisões: Astro Boy. Descreve origem verificável, escopo e evidências; não substitui os contratos canônicos ou a fila operacional.

## Identidade e escopo

Gestão pessoal gamificada com magia elemental: atividades, hábitos, projetos, lazer, estudos, casa, treino, saúde e acompanhamento emocional. Evoluir o aplicativo existente preservando conteúdos, dados e progressão. Os nomes Conselho Elemental / Domínio do Mago são usados no pedido; não implicam renomeação técnica do pacote (`my-app`).

Limites: não criar motor paralelo de pontuação/hábitos/persistência, inventário fictício, métricas de saúde/GPS inventadas ou reformulação geral sem escopo. Recursos de jogo não são medições clínicas. Assistente, astrologia e módulos conceituais exigem comprovação própria de implementação.

## Identidade transversal — 22/10/2026 / 0.1.40

A decisão do usuário tornou a identidade da prévia o padrão de todo o app. Fundação de tema integrada aos aliases compartilhados; primeiro lote inclui ExpandedElements em Pilares, ShowcaseCard nas listas de Jornadas/Grandes Obras, ElementalTimer nos modais simples e busca de navegação. Componentes de apresentação recebem dados/callbacks; não duplicam stores ou regras. Prévia agora mantém o tick existente; início/conclusão na home nova e paridade integrada continuam pendentes. [Alcance e evidências R04](03-Project-Management/reports/R04-IDENTIDADE-CARTOES-CRONOMETRO.md). Os relatos anteriores abaixo representam suas datas, não o estado operacional atual.

## Camada visual elemental — R02/R03, 21/10/2026

Prévia lazy e protegida reutiliza getters atuais de progresso, recursos e áreas, com estilos escopados e assets locais. Órbita/material Canvas são apresentação; não escrevem pontuação ou atributos. R03 adiciona rotas dos quatro elementos, filtros em URL e links aos módulos existentes. A exceção de rolagem em ScrollToTop aplica-se somente à edição marcada de filtros na mesma página elemental. Backend/stores/Fitness permanecem preservados. `/santuario` vigente continua independente: ciclo do cronômetro e ações da home ainda exigem integração/QA antes de substituição. [Relatório R03 e evidências delimitadas](03-Project-Management/reports/R03-NAVEGACAO-ELEMENTAL.md).

## De onde veio — evidência disponível

- A fonte principal `/Users/fabioandre/Developer/docs-conselho-master/README.md` registra a decomposição de documentos monolíticos em Overview, Domain Core, Platform Architecture e ADRs. Não inferir data de fundação, autores ou trajetória anterior não documentada.
- ADR-001, datado de 20/02/2026, decide hábito como Action com recorrência. É uma decisão de contrato, não evidência de que cada store atual já está conforme.
- O histórico Git local contém `2c4abe7` (04/10/2026), restauração de funções do treino após conflitos, e `03f0588` (06/10/2026), integração Fitness UI Kit e fundo aurora. As mensagens documentam intenção; aceitação exige diff e evidência.
- O changelog local registra até 0.1.12, com palco de personagem no Santuário. Há mudanças ainda não commitadas. Não confundir versão declarada com release entregue ou publicada.
- Em 08/10 houve organização da coordenação e validação V01 no checkout principal; em 09/10, esta entrega estrutura a manutenção documental. Consulte CONTINUIDADE para diferenças entre checkouts.

## Arquitetura observada e arquitetura pretendida

| Camada | Evidência atual | Limite da conclusão |
|---|---|---|
| Aplicativo | package.json: React, TypeScript, Vite, Zustand; src/App.tsx: composição das rotas | Dependências/rotas não provam cada fluxo |
| Apresentação | src/pages, src/components; telas Fitness ativas importadas de pages/fitness | Arquivos de páginas antigas coexistem; rastrear imports antes de editar |
| Estado | src/stores/appStore.ts, workoutStore.ts, authStore.ts | Não certificar persistência remota ou invariantes só pela presença |
| Domínio | src/types, src/constants, src/lib; contratos canônicos separados | Auditoria D01 reconcilia contrato e implementação; não migrar automaticamente |
| Contrato de plataforma | Core genérico + módulos nativos via adapters, descritos no índice canônico | I03 acrescenta somente sugestão textual autenticada e confirmada pelo fluxo local de rascunho; a implementação integral do assistente e dos adapters permanece sem comprovação |
| Evidências | STATUS-SANTUARIO, STATUS-FRONTEND-FITNESS, fila e relatórios por lote | Relatórios são datados e vinculados ao checkout; não herdar aprovação em outro estado |

Inventário detalhado está em FILA-ENTREGAS; atualizar sua evidência quando o código mudar em vez de manter outra lista de tarefas aqui.

### Assistente — protótipo I03

Em 09/10/2026, o lote I03 implementou em `src/pages/Invocar.tsx` uma ajuda opcional para redigir título e descrição e a Edge Function `supabase/functions/assistant-suggest`. O envio requer consentimento explícito e autenticação; o modelo só propõe campos de rascunho, que a pessoa edita e confirma pelo `addDraft` existente. A função não consulta perfil nem executa operações de domínio. Detalhes, controles e evidências estão em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md).

O capítulo canônico de LLM e voz especifica conversa, Gemini, ferramentas de consulta/classificação/conclusão executadas no backend e auditoria. I03 não implementa esses fluxos: usa Cloudflare para uma sugestão fechada e gravação local após confirmação humana. Portanto, é uma etapa parcial de protótipo, sem chamada live, secrets configurados ou deploy; não certifica a arquitetura conversacional completa.

## Sincronização de Matheus — 13/10/2026

origin/main foi integrado por fast-forward em b1575e4. A linha atual inclui templates e sessões de Fitness, integração nativa de conclusão com Core, sequências compartilhadas com Ciclos, histórico e mudanças na navegação. Build, lint e teste isolado do protótipo I03 foram executados localmente; revisão visual/funcional dos novos fluxos continua pendente. As migrations de sequência estão versionadas, não aplicadas remotamente. A revisão identificou incompatibilidade inicial entre os novos tipos de domínio e telas/stores legados; a compatibilidade foi recomposta e o build passou. A divergência semântica/XP com a fonte externa está registrada em CONTINUIDADE.md.

## Invariantes e divergências

Folhas Task pontuam, agregadores somam; Check/Note têm contratos próprios; valores planejados e históricos são distintos; Quest referencia Actions; hábito compartilha o contrato de Action; Prana é recurso de jogo limitado. Ler a base canônica e os capítulos de domínio antes de alterar qualquer regra.

BASE-CANONICA-E-EVOLUCAO lista quatro inconsistências documentais (reversão/histórico, presença no exemplo multi-área, rotação pausada e decimais). Elas exigem reconciliação, não correção automática do código.

Achados estáticos confirmados em 09/10 neste worktree: CharacterStage calcula HP localmente em linha 18; Astrolabio gera valores de histórico com Math.random em linhas 43–46. D01/D02 devem avaliar contrato e comportamento antes de alterações. A inspeção não atesta defeito numérico nem equivale a teste funcional.

## Fontes e atualização

Ordem: instruções atuais do usuário e AGENTS.md; fonte canônica e ADRs pertinentes; código e evidência executada; fila e registros datados. Divergência entre contrato e código deve ser relatada, sem escolher silenciosamente um deles como regra nova.

Não copiar segredos, dados pessoais ou conteúdo de .env para o dossiê. Referenciar caminhos e nomes de configuração apenas quando necessário. Mudanças arquiteturais relevantes exigem registro de decisão com problema, alternativas, decisão, consequências, estado e evidências; preservar ADRs anteriores. Atualizar este documento quando identidade, estrutura ou limites mudarem; os passos correntes ficam em CONTINUIDADE.


## M01 — modalidades e métricas executadas, 10/10/2026

Ver [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md): armazenamento aditivo, workload v2, compatibilidade do histórico, origem dos modelos e limites de estimativas. Não somar carga percebida e kg como se fossem a mesma medida; não interpretar notas automaticamente. A divergência do adapter entre documentação e implementação é registrada, sem reescrita do core.

## P01 / 0.1.21 — operação portável

Entrada de colaboradores em [ASTRO-BOY-BOAS-VINDAS](ASTRO-BOY-BOAS-VINDAS.md); perfil local em .astro-boy, sem rastrear IP. Regras raiz AGENTS.md, CLAUDE.md e Cursor orientam primeiro comando, com fallback explícito quando a IDE não as carregar. Skills do projeto estão versionadas em .agents/skills, inclusive Astro Boy/backend/auto-versionamento. `npm run astro:status`, `astro:welcome`, `astro:test` e `astro:audit` são comandos locais reproduzíveis. Fonte de contratos portável: docs/README.md e capítulos canônicos versionados. Auditoria estrutural em AUDITORIA-PUBLICACAO.md.
