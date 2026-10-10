# Manual de engenharia — Conselho Elemental

> Atualizado em 09/10/2026: o protótipo I03 do assistente está descrito em [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md). Estado operacional e próximo passo permanecem em CONTINUIDADE.md.

Atualizado em 09/10/2026 por inspeção estática do checkout de coordenação. Escopo: operar e evoluir o app existente com segurança. Este manual não certifica fluxos, implantação, sincronização remota ou cobertura de testes.

## Fontes e ordem de consulta

AGENTS.md define as instruções locais. COORDENACAO-AGENTES.md e FILA-ENTREGAS.md definem atribuição, reserva de arquivos e aceite. BASE-CANONICA-E-EVOLUCAO.md conecta o app à referência principal `/Users/fabioandre/Developer/docs-conselho-master/README.md`. Consultar esse índice antes dos capítulos de domínio, plataforma e ADRs pertinentes. O dossiê técnico e o registro de continuidade indicados no índice local complementam a retomada; não substituem esses contratos nem o estado atual do código.

A visão canônica é gestão pessoal gamificada com Terra, Fogo, Água e Ar. A camada visual deve preservar conteúdos, core, progressão e funcionalidades. Não criar pontuação, hábitos ou persistência paralelos para acomodar uma reformulação. As inconsistências de histórico/reversão, presença, rotação e valores decimais registradas na base canônica exigem reconciliação antes de mudanças de regra.

## Mapa prático do código

| Local | Uso observado e cautela |
|---|---|
| src/main.tsx e src/App.tsx | Entrada e rotas React. App inicializa auth, aplica proteção condicional e direciona a raiz para /santuario. Conferir a importação efetiva antes de editar páginas homônimas. |
| src/pages/ e src/pages/fitness/ | Experiências do produto. Rotas /treinos importam as páginas fitness; existem arquivos de treino também na raiz de pages. Não inferir código ativo pelo nome. |
| src/pages/temporal/ | Páginas de semana, mês, ano e calendário registradas no roteador. |
| src/components/ | Componentes compartilhados e por domínio. Layout, componentes UI e CSS podem afetar várias rotas. |
| src/stores/appStore.ts, workoutStore.ts e authStore.ts | Pontos de entrada do estado de aplicação, treino e autenticação. Mudanças exigem rastrear consumidores e persistência, não apenas o componente visível. |
| src/types/, src/constants/ e src/lib/ | Tipos, catálogos e funções auxiliares. Existem helpers específicos de treino, Fitness e temporal. Preservar IDs e contratos existentes. |
| src/services/ | Serviços de integração presentes. Existência de arquivo não certifica conexão, configuração ou comportamento remoto. |
| src/index.css, src/App.css e vite.config.ts | Estilos globais e configuração de build. Vite usa base / e alias @ para src. |
| scripts/optimize-yoga-images.mjs | Script ligado ao comando images:yoga; não faz parte das verificações normais de código. |
| docs/ | Contratos locais, status, fila, changelog e evidências. Relatórios anteriores têm data e escopo próprios. |

package.json declara React 19, TypeScript 5, Vite 7, Zustand 5, React Router 7, Tailwind 3 e bibliotecas de UI, movimento e 3D. Essas são famílias declaradas; conferir o lockfile/instalação antes de discutir a versão efetivamente instalada. Puppeteer aparece como dependência de desenvolvimento; isso não prova existência de suíte automatizada.

## Comandos existentes

Executar na raiz do app, confirmando checkout e estado antes de alterações.

| Comando | Propósito e limite |
|---|---|
| npm run dev | Inicia Vite para desenvolvimento. Usar a URL/porta realmente informada pelo processo; verificar isolamento dos dados antes do navegador. |
| npm run build | Executa tsc -b e vite build. Confirma compilação/build quando passa; não testa fluxos ou layout. |
| npm run lint | Executa eslint .; registrar erros e avisos, separando os preexistentes quando houver evidência. |
| npm run preview | Serve o build local existente; gerar build compatível antes de usá-lo para validar alterações. |
| npm run images:yoga | Executa otimização de imagens; usar somente em lote de imagens com arquivos reservados. |
| git status --short e git diff --check | Inspecionam alterações e erros de whitespace; não avaliam comportamento do produto. Arquivos novos precisam também de inspeção direta. |

Não existe script test no package.json inspecionado. Não anunciar npm test ou cobertura como disponíveis. Instalação de dependências não foi necessária nem executada para esta entrega; conferir runtime, lockfile e condições do ambiente antes de instalar. Não deduzir uma versão mínima de Node deste manual.

O protótipo I03 tem testes Deno próprios para `supabase/functions/assistant-suggest/index.ts`; eles usam dependências simuladas e não substituem uma chamada real ao provedor. Consulte [ASSISTENTE-PROTOTIPO.md](ASSISTENTE-PROTOTIPO.md) para comandos, configuração e limites da validação.

## Ciclo de mudança segura

1. Ler o estado de continuidade e o lote da fila; confrontá-los com git status, código atual e fila operacional indicada pelo coordenador. Se houver divergência entre checkouts, registrar a origem e não substituir trabalho mais recente pelo snapshot local. Reservar arquivos com Astro Boy e preservar mudanças anteriores.
2. Ler as skills aplicáveis. Em criação/reformulação visual, frontend-design é exigida pelo projeto; verificar o arquivo no checkout, sem supor instalação compartilhada entre executores.
3. Reproduzir o problema ou delimitar a lacuna; registrar comportamento esperado conforme contrato e referência. Documentação não autoriza reescrever regras contraditórias.
4. Fazer o menor lote coerente. Para estado/dados, rastrear criação, conclusão, reversão, recarga e consumidores antes de mudar um contrato. Para UI, preservar ações, nomes acessíveis e dados existentes.
5. Executar verificações pertinentes e revisar o diff. Reportar limites; não converter teste pendente em aprovação.
6. Responsável documental consolida versão quando cabível e atualiza os documentos reservados; Astro Boy revisa, aceita e libera a reserva.

Arquivos globais, stores, tipos, manifests, lockfile e documentos de status têm um único escritor por vez. Subagentes compartilham diretório; contexto separado não protege arquivos. Não usar staging global nem reverter alterações alheias para limpar o checkout.

## Validação proporcional

Documentação isolada: conferir referências, consistência com fontes, limites declarados e whitespace. Não requer build do produto por si só. Mudanças de código: executar lint/build pertinentes e casos funcionais afetados; falhas de ambiente e falhas do produto devem ser distinguidas. Não criar testes que apenas repitam a implementação.

Frontend: capturar estados e resoluções definidos no aceite, comparar referências reais, conferir navegação, overflow, console e acessibilidade pertinente. Para Santuário, V01 pede 360/390/768px; para Fitness, V02 pede 360/390px e o ciclo preview → iniciar → continuar → série → reload → finalizar → resumo → histórico. Esse é o roteiro de referência, não o status global dos lotes. A fila local deste worktree é anterior à operacional: segundo conferência do executor de coordenação em 09/10/2026, a fila do checkout original já registra V01 executada com reprovação em 768px e I01 em execução. Consultar a fila operacional antes de repetir testes, editar arquivos ou afirmar pendências.

Dados de teste devem ser criados pela UI em perfil temporário, sem usar perfil real, IDs fictícios ou inventar saúde/GPS. Não alterar stores/backend para montar evidência. Persistência local e integração remota são verificações diferentes. Limitações de acesso, dados ou tempo são pendências explícitas.

## Versões e releases

Procedimento detalhado em [AGENTE-VERSIONAMENTO-DOCUMENTACAO.md](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md). Em 09/10/2026, os metadados de versão e topo de docs/CHANGELOG.md convergem em 0.1.12. A entrada existente descreve mudanças de Santuário; não atribuí-las ao lote documental atual.

Ao fechar código, reservar manifests/changelog, aplicar incremento coerente e sincronizado conforme auto-versionamento e revisar o diff. A versão atualizada para I03 é 0.1.15 em package.json, nas duas posições raiz do package-lock.json e no topo do changelog. O registro descreve um protótipo local delimitado; não representa release live. Não criar uma versão por subagente dentro da mesma integração.

Este manual não identifica nem valida um pipeline de publicação. Commit, tag, push, merge e deploy dependem do escopo autorizado pelo coordenador e da verificação do destino real; não estão autorizados nesta entrega. Antes de uma release, consolidar evidências, pendências e caminho de recuperação sem sobrescrever dados do usuário.

## Evidências desta edição

Foram lidos AGENTS.md, coordenação/fila/base canônica, índice e Overview canônicos, capítulo Core vs. Módulos Nativos, ADR-001, package.json, metadados iniciais do lockfile, changelog, src/App.tsx e vite.config.ts; a estrutura de fontes foi enumerada. A skill auto-versionamento foi consultada. Não foram executados build, lint, navegador, fluxos do produto ou operações remotas. Não houve alteração de versão, código ou dependências nesta edição.

Conferência adicional do executor de coordenação: a pasta principal já declara 0.1.13 nos manifests e changelog, enquanto este worktree declara 0.1.12. Consultar [CONTINUIDADE.md](CONTINUIDADE.md); não regredir versão na integração. O reteste da correção não foi confirmado nesta entrega.


## Diretriz mobile vigente — 09/10/2026

Usuário confirmou Sol 6.1 médio e priorizou Escolher treino antes das demais telas do kit. Celular primeiro, tablet adaptado; PC deve usar interface com largura de tablet. Verificações prioritárias em 360/390px e tablet; no PC conferir apenas largura limitada e funcionamento. Esta preferência prevalece sobre orientações desktop históricas dos roteiros.


## M01 — modalidades e métricas executadas, 10/10/2026

Ver [MODALIDADES-E-METRICAS-TREINO.md](MODALIDADES-E-METRICAS-TREINO.md): armazenamento aditivo, workload v2, compatibilidade do histórico, origem dos modelos e limites de estimativas. Não somar carga percebida e kg como se fossem a mesma medida; não interpretar notas automaticamente. A divergência do adapter entre documentação e implementação é registrada, sem reescrita do core.

## P01 / 0.1.21 — operação portável

Entrada de colaboradores em [ASTRO-BOY-BOAS-VINDAS](ASTRO-BOY-BOAS-VINDAS.md); perfil local em .astro-boy, sem rastrear IP. Regras raiz AGENTS.md, CLAUDE.md e Cursor orientam primeiro comando, com fallback explícito quando a IDE não as carregar. Skills do projeto estão versionadas em .agents/skills, inclusive Astro Boy/backend/auto-versionamento. `npm run astro:status`, `astro:welcome`, `astro:test` e `astro:audit` são comandos locais reproduzíveis. Fonte de contratos portável: docs/README.md e capítulos canônicos versionados. Auditoria estrutural em AUDITORIA-PUBLICACAO.md.
