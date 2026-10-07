# Skills e conclusão do produto elemental

Análise de 05/10/2026. Este documento é uma recomendação de capacidades e escopo, não uma declaração de conclusão nem uma ordem para instalar todas as skills. Preferência persistida em AGENTS.md: avaliar e aplicar frontend-design nas tarefas pertinentes.

## Base observada

React 19, TypeScript, Vite, Tailwind, Radix, Zustand, Framer Motion, Recharts e React Three Fiber já estão no projeto. Há páginas de Santuário, Rituais, Domínios, Pilares, Jornadas, Grandes Obras, Grimório, ciclos temporais, Corpo, Yoga, Calistenia e Fitness. A existência desses arquivos não comprova qualidade ou funcionamento completo. O README também contém pendências e pode estar desatualizado; verificar código e navegador antes de tratá-lo como estado atual.

## Escolha de skills

### Adicionar primeiro

1. **web-design-guidelines — vercel-labs/agent-skills**: revisão de formulários, foco, teclado, semântica, layout, movimento e interação. Complementa frontend-design, que orienta criação. Aplicar regras ao contexto PT-BR e ao app; convenções genéricas de texto não substituem decisões explícitas do produto.
   Fonte: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
2. **vercel-composition-patterns — vercel-labs/agent-skills**: composição e APIs de componentes React reutilizáveis. Útil para um sistema visual elemental comum a todos os módulos, evitando cópias e muitas flags de aparência. Não refatorar código estável só para seguir um padrão.
   Fonte: https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns

### Já disponíveis nesta sessão: ativar conforme tarefa

- frontend-design: direção visual principal; já instalada no projeto.
- vercel:react-best-practices e vercel:shadcn: qualidade React e componentes acessíveis existentes.
- vercel:agent-browser, vercel:agent-browser-verify e vercel:verification: evidências reais no navegador e fluxos completos. Aproveitar a infraestrutura Puppeteer já validada; skill não corrige automaticamente seletores ou afirmações erradas.
- supabase:supabase e supabase-postgres-best-practices: autenticação, persistência, sincronização e banco, quando essas áreas forem trabalhadas.
- review-security: revisão de segurança antes da entrega de dados pessoais e funções do assistente.
- imagegen: arte elemental consistente para avatar, emblemas, cenários e recompensas; produzir a partir de direção visual definida.
- vercel:ai-sdk: avaliar ao implementar o assistente pessoal, somente se essa tecnologia se adequar à arquitetura escolhida; não instalar dependência só porque existe uma skill.
- auto-versionamento e time-travel-checkpoint: rastreabilidade e recuperação das alterações, respeitando o fluxo de preservação do workspace.

### Opcionais, depois

- webapp-testing — anthropics/skills: scripts Python/Playwright para testes locais, capturas e logs. Útil para padronizar um executor sem ferramentas equivalentes; parcialmente redundante com as ferramentas atuais. Não exige migrar agora o smoke Puppeteer funcional.
  Fonte: https://github.com/anthropics/skills/tree/main/skills/webapp-testing
- improve-animations — emilkowalski/skills: audita movimento e produz planos, não implementa as correções. Aplicar no polimento, sem iniciar outro ciclo infinito de auditorias.
  Fonte: https://skills.sh/emilkowalski/skills/improve-animations

A página https://skills.sh/hot apresenta popularidade recente, não adequação ao produto. Evitar pacotes extensos de design conflitantes, ferramentas de marketing sem necessidade e migrações para outro framework sem benefício concreto.

## Conhecimento específico que nenhuma skill genérica resolve

A especificação de domínio já existe em `/Users/fabioandre/Developer/docs-conselho-master/`, indicada pelo usuário em 05/10/2026. Usá-la como referência principal, conforme `docs/BASE-CANONICA-E-EVOLUCAO.md`. Antes de uma skill própria, mapear os contratos documentados para o código existente e complementar apenas lacunas de apresentação e critérios de entrega. Não reinventar o core nem substituir associações entre elementos e vida.

Critérios propostos: concluir uma atividade deve produzir uma evolução explicável, registrada uma vez; desfazer deve ser consistente; descanso não deve gerar humilhação; diário emocional deve permitir registro voluntário e controle dos próprios dados. O assistente deve distinguir sugestões de ações e pedir confirmação para ações relevantes. Dados de saúde observados, estimativas e recursos fictícios do RPG precisam ter rótulos distintos. Apoio emocional não deve ser apresentado como diagnóstico ou tratamento.

## Seis frentes para concluir a visão ampliada

1. **Escopo verificável**: inventariar rotas e funcionalidades existentes; definir o que estará na primeira entrega e critérios de pronto. O pedido agora abrange todo o app, além do Fitness.
2. **Direção artística e sistema visual**: tokens elementais, tipografia legível, iconografia, arte, avatar, navegação, componentes e estados. O kit Fitness orienta seu módulo; a identidade elemental une o produto.
3. **Frontend completo por módulo**: finalizar treino/saúde e expandir para Santuário, hábitos/casa/lazer, estudos, projetos, diário e planejamento, preservando conteúdo. Inventariar o que existe antes de criar novos módulos.
4. **Funcionalidades integradas**: persistência real, sincronização, rotina diária, registros de água e saúde quando previstos, recompensas consistentes, histórico e desfazer. Testar falhas e recuperação, não apenas a aparência.
5. **Assistente pessoal**: capacidades limitadas e úteis, memória controlável, dados autorizados, custos e limites conhecidos, funcionamento básico do app mesmo com provedor indisponível. Skills do programador não são recursos automaticamente instalados no assistente do app.
6. **Polimento e entrega**: performance em celular, movimento reduzido, acessibilidade, estabilidade do avatar 3D, segurança, testes entre módulos e validação visual. Medir a qualidade com evidências; "AAA" é uma direção de qualidade, não um certificado produzido por uma skill.

Não há prazo confiável antes do inventário do escopo ampliado. Não instalar skills adicionais foi uma decisão desta análise; instalação pode ser feita em lote após a seleção, sem alterar o frontend.

## Instalação autorizada em 05/10/2026

Instaladas via skill-installer em `.agents/skills`: web-design-guidelines e composition-patterns (vercel-labs/agent-skills), webapp-testing (anthropics/skills), improve-animations (emilkowalski/skills). Arquivos SKILL.md conferidos. frontend-design existente preservada. Esta atualização substitui a decisão anterior de adiar essas quatro instalações. Não foram instaladas dependências dos scripts de teste nem alterado o código do aplicativo.
