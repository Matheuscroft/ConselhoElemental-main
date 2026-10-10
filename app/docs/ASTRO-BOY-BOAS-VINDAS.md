# Entrada de Matheus e Fábio

## Apresentação no primeiro comando

A IDE que lê AGENTS.md consulta `node app/scripts/astro-boy.mjs status --json`, na raiz. `onboardingRequired` controla a apresentação; `profile` contém nome e papel explicitamente escolhidos. Sem perfil, pedir o nome uma vez, sem usar IP. Configure com `setup --name Matheus --role backend` ou Fábio/frontend. Após a apresentação, `ack` registra a confirmação local. `welcome` permite rever o roteiro a qualquer momento. O primeiro comando não precisa ser especial depois do setup: a regra orienta apresentar e então atender o pedido. Isso depende de a IDE carregar as regras e permitir comandos; não é hook universal nem agente continuamente ativo.

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

## O que já foi feito

- Santuário: ajuste responsivo e apresentação do personagem, com evidências delimitadas no status do módulo.
- Fitness: seleção de seis modalidades e ícones da referência, formulário de criação, ficha técnica e execução visualmente alinhadas. Saúde/Corpo preservam medidas e stores existentes.
- Modalidades: Yoga/Calistenia legadas mais Corrida/Natação/Ciclismo e sete artes; tempo ativo/RPE/distância/notas declarados, perfil muscular ajustável, cálculo/snapshot e ledger de recompensa. Ver MODALIDADES-E-METRICAS-TREINO.
- Assistente: proposta editável e confirmação local em Invocar; gateway protegido e testes com mocks. Conta, quota, secrets, deploy e chamada real permanecem etapa I04.
- Coordenação: fila, manual/dossiê, políticas de modelo e skills portáveis. Esta estrutura guia o agente da IDE; não treina modelos automaticamente.

A continuidade e o código prevalecem sobre esta síntese. Não declarar integração integral, medição clínica/muscular exata ou histórico remoto verificado.

## Primeiro lote sugerido para Matheus

Leia README de arquitetura → BASE-CANONICA → AUDITORIA-CONTRATOS-CORE → capítulos Domain Core/ADRs pertinentes. Escolha um cenário de execução/reversão/idempotência e escreva teste que demonstre o comportamento vigente. Documente esperado × implementado antes de corrigir uma divergência. Fonte portável dos contratos: `app/docs/00-Overview`, `01-Domain-Core`, `02-Platform-Architecture`, `03-ADRs`. A pasta absoluta de Fábio é origem documental; não requisito no seu computador.

Para assistente, consulte ASSISTENTE-PROTOTIPO e AUDITORIA-ASSISTENTE; não ativar I04 por iniciar o projeto. Backend-conselho/SKILL.md descreve auth, isolamento, migrações e verificação. Uso de Supabase/Cloudflare requer conferir skills oficiais e ferramentas instaladas nesse executor. Se faltarem, Astro Boy informa nome e finalidade antes da ação dependente. As oito skills de projeto estão em `.agents/skills`; uma instalação no computador de Fábio não instala plugins em Matheus.

## Criar a próxima skill juntos

Crie `.agents/skills/<rotina>/SKILL.md` quando a mesma rotina reaparecer. Frontmatter `name` e `description`; corpo com contrato/fonte, pré-condições, passos e verificação. Referencie os documentos, sem duplicar fórmulas. Exemplos úteis: auditoria de sincronização, teste de migração, revisão de API. Teste scripts e confirme descoberta no executor. Registre a decisão na fila e manual. Não colocar credenciais, dados de perfil ou logs privados na skill.

## Modelo e aprendizagem operacional

Luna leve para inventário/documentação simples; Sol médio para implementação/testes integrados; Sol alto para investigação complexa de auth/contratos, se necessário. Avisar antes da troca; disponibilidade e nomes variam por executor. Confira POLITICA-MODELOS. Aprimoramento ocorre por decisões documentadas, casos reproduzidos e procedimentos revisados; documentação antiga não comprova teste atual.
