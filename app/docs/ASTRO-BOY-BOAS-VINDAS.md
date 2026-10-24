# Entrada de Matheus e Fábio

## Atualização prioritária — repaginação 0.1.54

Antes de usar o resumo histórico de Fitness abaixo, leia [REPASSE-FRONTEND-PARA-BACKEND.md](REPASSE-FRONTEND-PARA-BACKEND.md) e o ponto atual em [CONTINUIDADE.md](CONTINUIDADE.md). O repasse consolida I03/R01–R14: identidade elemental, Santuário/órbita, navegação, Pilares, Ciclos, Temporal/Lua/Estações, Grimório, trilhas/runas, catálogos, taxonomia e Rituais Showcase. Fragmentos/streak novos continuam pendentes de contrato. **Matheus segue no backend; Fábio segue em UX/UI.** Pendências visuais não foram transferidas ao backend.

O status local agora marca `updateBriefingRequired` e `onboardingRequired` quando um perfil já apresentado ainda não recebeu este repasse. Após explicar mudanças, verificações e limites, `astro:ack` marca esta revisão como vista, sem apagar nome/papel/data original. Não é notificação automática ao abrir o GitHub: exige que a IDE execute as instruções do projeto. Para reapresentar: `npm run astro:welcome`.

## Apresentação no primeiro comando

A IDE que lê `AGENTS.md` consulta `node app/scripts/astro-boy.mjs status --json`, na raiz, e segue esta apresentação antes de atender ao primeiro pedido. Na primeira sessão do Matheus, configure o perfil explícito com `npm run astro:setup --prefix app -- --name Matheus --role backend`; isso imprime a saudação e o roteiro. `onboardingRequired` controla a apresentação; `profile` contém nome e papel explicitamente escolhidos. Nunca identificar por IP. Após a apresentação, `npm run astro:ack --prefix app` registra a confirmação local; `npm run astro:welcome --prefix app` permite rever o roteiro. Isso depende de a IDE carregar as regras e permitir comandos; não é hook universal nem agente continuamente ativo.

Roteiro que Astro Boy adapta ao estado vigente:

> Olá, Matheus! Sou Astro Boy, coordenador do Domínio do Mago. Fábio lidera o frontend; você cuida do backend e documentação. Posso ajudar a planejar, implementar, testar, revisar contratos e manter nossa continuidade. Vou te acompanhar por lotes pequenos, com objetivo e resultado verificável.

Apresente versão/branch atuais, mostre `/treinos` e `/treinos/painel` no servidor local e resuma entregas abaixo. Explique equipe e limites reais do executor. Proponha a próxima tarefa adequada ao pedido original; registre apresentação com ack e continue trabalhando. Não dizer que existem agentes ativos ou memória ilimitada por haver arquivos de papéis.

## Equipe e prioridades

| Responsável | Trabalho | Prioridade |
|---|---|---|
| Astro Boy | Planejamento, fila, distribuição, integração e interlocução | Preservar funcionamento e entregar lotes verificáveis |
| Interface / Fábio | UI e UX para celular/tablet, referências, acessibilidade | Fitness e Saúde, com dados reais |
| Backend / Matheus | APIs, persistência, auth, contratos e documentação | Resolver divergências com casos e testes antes de migrar |
| Regras/dados | Auditoria de domínio e impacto de mudanças | Evitar dois motores de pontuação/histórico |
| Validação | Regressão, navegador e evidências independentes | Separar teste estático, mocks e integração remota |
| Versionamento/documentação | Versões, changelog, manual, dossiê e continuidade | Outro colaborador conseguir retomar sem conversa anterior |

Papéis podem ser executados sequencialmente. Se o executor oferecer subagentes e houver autorização, delegar escopo/arquivos/aceite delimitados e respeitar capacidade da sessão. Não criar chats adicionais para acompanhamento.

## Histórico anterior — Fitness até F59

O pull trouxe a base nativa de treino, catálogos e execução que agora foi integrada. No trabalho de Fábio até F59 (versão 0.1.31):

- Uma experiência única em Treinos, Terra e rotas compatíveis, com abas Treinos/Histórico/Corpo/Saúde; FAB contextual e navegação responsiva.
- Editor e biblioteca permitem criar treinos e exercícios próprios, inclusive quando a busca não encontra itens; modalidades usam campos adequados ao contexto. Prévia preserva imagens disponíveis, vídeo configurável, instruções, séries, perfil muscular, edição e início.
- Execução preserva relógio pausado após recarga, descrição e distância por bloco. A proposta importada de recompensa por blocos foi rejeitada para a regra vigente: Matheus restaurou sessão consolidada e ER×0.10. RPE por série fica informativo; recibos anteriores não são recalculados nem migrados.
- Resumo reúne recompensa, avaliação por estrelas, atividades, detalhes observados e evolução disponível. Histórico unifica registros nativos/legados e abre o resumo.
- Saúde, Hoje, Semana, Evolução e Corpo leem os stores e históricos existentes. O manequim é ilustrativo. Sem fonte real, não se inventam GPS, batimentos, calorias, sono ou água.
- Documentação de contratos, métricas, ADR, continuidade e fila foi atualizada; versões 0.1.22–0.1.31 constam do changelog. A entrega funcional mais recente e evidências estão em `CONTINUIDADE.md`, seção F59.

Limites: GPS/mapa, sensores e dados automáticos de saúde, widgets personalizados e sincronização remota não foram implementados. Reprodução de vídeo remoto e fluxo legado completo precisam de validação própria. A coordenação Astro Boy é um fluxo local guiado por regras e CLI; não mantém agentes rodando em segundo plano.

A continuidade e o código prevalecem sobre esta síntese. Não declarar integração integral, medição clínica/muscular exata ou histórico remoto verificado.

## Primeiro lote sugerido para Matheus — histórico F59

O próximo passo já previsto é backend/documentação: leia `CONTINUIDADE.md` (F59), `docs/README.md`, a base canônica e `docs/FILA-ENTREGAS.md`; então retome o teste reproduzível de reversão/idempotência proposto para o core. Primeiro registre esperado × implementado e limites de evidência, sem mudar regra, dado ou migração por inferência. A revisão de Fábio com dados reais segue em paralelo como etapa de aceite visual/funcional. Fonte portável dos contratos: `docs/00-Overview`, `01-Domain-Core`, `02-Platform-Architecture` e `04-ADRs`. A pasta absoluta de Fábio é origem documental; não requisito no seu computador.

Para assistente, consulte ASSISTENTE-PROTOTIPO e AUDITORIA-ASSISTENTE; não ativar I04 por iniciar o projeto. Backend-conselho/SKILL.md descreve auth, isolamento, migrações e verificação. Uso de Supabase/Cloudflare requer conferir skills oficiais e ferramentas instaladas nesse executor. Se faltarem, Astro Boy informa nome e finalidade antes da ação dependente. As oito skills de projeto estão em `.agents/skills`; uma instalação no computador de Fábio não instala plugins em Matheus.

## Criar a próxima skill juntos

Crie `.agents/skills/<rotina>/SKILL.md` quando a mesma rotina reaparecer. Frontmatter `name` e `description`; corpo com contrato/fonte, pré-condições, passos e verificação. Referencie os documentos, sem duplicar fórmulas. Exemplos úteis: auditoria de sincronização, teste de migração, revisão de API. Teste scripts e confirme descoberta no executor. Registre a decisão na fila e manual. Não colocar credenciais, dados de perfil ou logs privados na skill.

## Modelo e aprendizagem operacional

Luna leve para inventário/documentação simples; Sol médio para implementação/testes integrados; Sol alto para investigação complexa de auth/contratos, se necessário. Avisar antes da troca; disponibilidade e nomes variam por executor. Confira POLITICA-MODELOS. Aprimoramento ocorre por decisões documentadas, casos reproduzidos e procedimentos revisados; documentação antiga não comprova teste atual.
