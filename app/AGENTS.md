# Preferências do projeto

- Para tarefas de frontend, avalie a pertinência da skill `frontend-design`. Em criação ou reformulação visual, leia e aplique `.agents/skills/frontend-design/SKILL.md` desde o início. Para alterações estritamente funcionais sem impacto visual, use apenas as orientações relevantes.
- Referências e decisões visuais explícitas do usuário prevalecem sobre preferências estéticas genéricas da skill.
- Visão do produto: gestão pessoal gamificada com magia elemental, incluindo atividades, hábitos, projetos, lazer, estudos, casa, treino, saúde e acompanhamento emocional, preservando os conteúdos existentes.
- Preserve dados, regras de progressão e funcionalidades ao reformular a interface. Valide estados reais e não declare testes não executados como aprovados.
- Skill instalada no Codex não comprova disponibilidade automática no Claude Code ou em outro executor; confira o ambiente de destino.

## Documentação canônica e continuidade

- Referência principal indicada pelo usuário: `/Users/fabioandre/Developer/docs-conselho-master/README.md`. Ao consultar documentação do app, comece por esse índice e leia os capítulos de domínio/arquitetura e ADRs pertinentes à tarefa.
- Preserve o core funcional, dados e conteúdos existentes. Melhorias de frontend e novas ideias devem integrar-se às regras documentadas, sem criar um segundo motor de pontuação, modelo de hábitos ou persistência paralela.
- Documentação descreve contratos e intenção; confirme implementação no código e comportamento por testes. Registre divergências antes de mudar regras. Exemplos contraditórios não autorizam migrações ou reescritas automáticas.
- Consulte `docs/BASE-CANONICA-E-EVOLUCAO.md` para o alinhamento do plano. Relatórios antigos não substituem evidências atuais.

## Skills complementares instaladas no projeto

- `.agents/skills/web-design-guidelines/SKILL.md`: revisão de interface e acessibilidade.
- `.agents/skills/composition-patterns/SKILL.md`: composição de componentes React quando houver necessidade de reutilização ou APIs complexas.
- `.agents/skills/webapp-testing/SKILL.md`: testes no navegador; aproveitar testes existentes, sem migração automática de ferramentas.
- `.agents/skills/improve-animations/SKILL.md`: revisão de movimento na etapa de polimento.
- Aplicar conforme a tarefa, sem carregar todas indiscriminadamente. A documentação canônica e as referências do usuário prevalecem sobre recomendações genéricas.

# Coordenação do Conselho Elemental

Antes de executar um lote, leia `docs/COORDENACAO-AGENTES.md` e a entrada correspondente em `docs/FILA-ENTREGAS.md`.

Astro Boy é o coordenador e único interlocutor do usuário. Executores reportam no contexto da delegação; não criam chats para o usuário acompanhar nem enviam mensagens a outros chats sem autorização explícita.

Preserve core, dados, progressão, conteúdos, funcionalidades e alterações preexistentes. Consulte `docs/BASE-CANONICA-E-EVOLUCAO.md` e a fonte canônica indicada ali antes de trabalhar no domínio. Documentação não comprova implementação. Registre somente testes executados e evidências atuais.

Use subagentes somente no escopo autorizado e respeite a capacidade disponível. As instruções detalhadas de coordenação são um protocolo operacional, não um serviço automático nem uma configuração de modelos.

## Continuidade e custódia documental

- Ao retomar, leia `docs/CONTINUIDADE.md`; confirme checkout, estado atual e fila operacional antes de agir.
- Consulte `docs/MANUAL-ENGENHARIA.md` para procedimentos e `docs/DOSSIE-TECNICO.md` para origem, escopo e arquitetura. Crie e vincule arquivos necessários quando faltarem, sem inventar fatos ou duplicar a fila.
- O responsável por Versionamento e documentação segue `docs/AGENTE-VERSIONAMENTO-DOCUMENTACAO.md`. Inclua sua revisão ao encerrar cada lote; se indisponível, o executor registra a continuidade para revisão posterior.
- Atualize o ponto de retomada ao iniciar, interromper, transferir ou concluir trabalho. Registre decisões, evidências, pendências e próximo passo antes de trocar de contexto.

## Seleção econômica de modelos

Antes de delegar, aplicar `docs/POLITICA-MODELOS.md`: escolher modelo/esforço por complexidade, registrar motivo e escalar somente quando necessário. Se não puder efetuar a troca, informar ao usuário modelo, nível e tarefa antes de prosseguir com o trabalho dependente.

## Colaboração portável — Fábio e Matheus

Ao primeiro comando, siga `../AGENTS.md` e `docs/ASTRO-BOY-BOAS-VINDAS.md`; o comando local é `npm run astro:status -- --json`. Use perfil explícito em `.astro-boy/`, sem IP. Em outro computador, o índice disponível é `docs/README.md` com capítulos canônicos versionados; a pasta absoluta de Fábio registra a origem e não é requisito de execução. Confira divergências antes de alterar contratos.
