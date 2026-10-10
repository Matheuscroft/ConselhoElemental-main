# Dossiê técnico — Conselho Elemental / Domínio do Mago

> Atualizado em 09/10/2026 após I03. Para estado operacional e próximo passo, consultar CONTINUIDADE.md; este dossiê registra escopo e limites arquiteturais.

Edição documental: 09/10/2026. Custódia: Versionamento e documentação; decisões: Astro Boy. Descreve origem verificável, escopo e evidências; não substitui os contratos canônicos ou a fila operacional.

## Identidade e escopo

Gestão pessoal gamificada com magia elemental: atividades, hábitos, projetos, lazer, estudos, casa, treino, saúde e acompanhamento emocional. Evoluir o aplicativo existente preservando conteúdos, dados e progressão. Os nomes Conselho Elemental / Domínio do Mago são usados no pedido; não implicam renomeação técnica do pacote (`my-app`).

Limites: não criar motor paralelo de pontuação/hábitos/persistência, inventário fictício, métricas de saúde/GPS inventadas ou reformulação geral sem escopo. Recursos de jogo não são medições clínicas. Assistente, astrologia e módulos conceituais exigem comprovação própria de implementação.

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
