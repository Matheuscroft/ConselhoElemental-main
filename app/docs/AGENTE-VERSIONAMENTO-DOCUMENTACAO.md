# Responsável por versionamento e documentação

> Integração em 09/10/2026: documento originado no worktree 0.1.12, agora disponível na pasta principal 0.1.13. Para estado atual, consultar CONTINUIDADE.md; referências a integração pendente abaixo são histórico da elaboração.

Estado: instrução reutilizável para delegação, criada em 09/10/2026. Não registra um processo permanente, não instala persona e não executa tarefas sozinho. Astro Boy atribui este papel a um agente disponível ou o executa sequencialmente. Aplicam-se os limites e as reservas de [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md).

## Missão e autoridade

Manter versões coerentes, histórico de mudanças e documentação suficiente para que outro executor retome o trabalho sem depender da conversa. Trabalhar pautado pela fonte canônica, pelo código inspecionado e pelas evidências de execução. Astro Boy continua responsável pela prioridade, aceite e interlocução com o usuário.

O responsável pode elaborar documentação e conferir versões dentro dos arquivos reservados. Não altera regras, dados, telas, dependências, configurações globais ou infraestrutura para fazer documentação e código parecerem concordar. Divergências entram na fila única para decisão. Não faz commit, tag, push, merge ou publicação sem escopo autorizado.

## Início de cada lote

1. Ler AGENTS.md, o protocolo de coordenação, a entrada atribuída em FILA-ENTREGAS.md e o registro de continuidade vigente apontado pelo coordenador.
2. Começar a consulta de domínio pelo índice `/Users/fabioandre/Developer/docs-conselho-master/README.md`; ler capítulos e ADRs pertinentes e BASE-CANONICA-E-EVOLUCAO.md. Se a fonte não estiver disponível, registrar a limitação; não substituí-la silenciosamente por relatório antigo.
3. Registrar checkout, revisão base, data local, estado do lote, arquivos reservados e alterações preexistentes. Comparar a fila do checkout com a fila operacional indicada pelo coordenador antes de escolher versão ou retomar um lote; snapshots de worktrees não são estado global. Inspecionar o código que sustenta qualquer nova afirmação.
4. Conferir a existência dos documentos necessários. Criar somente os ausentes que pertençam ao escopo atribuído; se já existirem, atualizar preservando decisões e histórico. Não criar uma segunda fila ou manual concorrente.

## Versionamento do produto

Fonte operacional: package.json, package-lock.json e docs/CHANGELOG.md. Na inspeção de 09/10/2026, package.json.version, package-lock.json.version, package-lock.json.packages[""].version e a primeira entrada do changelog indicam **0.1.12**. Isso identifica o checkout; não comprova release publicado nem aceite funcional.

Ao concluir um lote de código, consultar a skill `.agents/skills/auto-versionamento/SKILL.md`, preservar o padrão numérico existente e escolher o incremento conforme impacto. Correção pequena normalmente incrementa patch; funcionalidade relevante exige avaliar incremento intermediário; incompatibilidade estrutural exige decisão explícita sobre escopo e impacto. Não escolher versão por quantidade de agentes, arquivos ou mensagens.

Reservar os três arquivos antes de escrever. Se vários agentes contribuírem para uma mesma entrega integrada, consolidar um incremento no encerramento do lote; evitar bumps concorrentes. Sincronizar as três posições de versão e inserir entrada objetiva no topo de docs/CHANGELOG.md sem apagar o histórico. Não atualizar dependências ou regenerar o lockfile inteiro apenas para mudar a versão; revisar o diff para excluir alterações indiretas. Não executar comandos que produzam commit/tag implicitamente.

Documentação isolada, diagnóstico ou teste sem mudança de código não exige incrementar a versão do produto por esta skill. Registrar a data e o lote na continuidade. Nesta entrega documental, **0.1.12 permanece inalterada**. Se a versão divergir entre arquivos, relatar o estado inicial e reconciliar somente no escopo autorizado, preservando contribuições anteriores.

## Documentação e continuidade

Manter o manual de engenharia orientado a operação, o dossiê técnico orientado a origem/escopo/arquitetura/evidência e o registro de continuidade orientado ao ponto de retomada. Usar os caminhos canônicos definidos pelo coordenador no índice documental; criar documento faltante no lote correspondente, sem inventar histórico.

No início, antes de trocar de lote ou repassar contexto e no encerramento, atualizar o registro reservado com: objetivo vigente; o que foi feito e por quê; arquivos alterados; evidências e testes não executados; decisões e respectivas fontes; bloqueios; próximo passo concreto. Referenciar a fila por ID, sem duplicar seus estados em outro backlog. Se a fila estiver reservada ao coordenador, enviar a atualização no reporte para que ele a aplique.

Distinguir explicitamente: contrato documentado, implementação encontrada, teste executado e pendência. Código presente não comprova comportamento; build/lint não comprova fidelidade visual. Não registrar tokens, credenciais, dados pessoais ou conteúdo de perfis reais. Preferir símbolos/caminhos e artefatos reproduzíveis a transcrições extensas.

Arquivos reduzem perda de contexto, mas não garantem retomada automática. Ao retomar, conferir estado real e data das evidências antes de continuar.

## Aceite e reporte

- Caminhos citados conferidos; comandos correspondem aos scripts atuais; afirmações possuem fonte ou limite explícito.
- Versões coerentes quando houve bump; changelog descreve somente trabalho efetivamente entregue.
- Diff limitado aos arquivos reservados; histórico e mudanças preexistentes preservados; verificações proporcionais registradas.
- Reporte ao coordenador: ID, responsável, checkout/base, arquivos absolutos, versão antes/depois ou motivo de manutenção, verificações e resultados, pendências e próxima ação.

Só Astro Boy aceita a entrega e atualiza a fila durante execução paralela. O papel não acrescenta uma vaga à equipe nem autoriza comunicação entre chats.

## Contexto de C01

Estes arquivos pertencem ao worktree de coordenação, sem integração automática no checkout original. O executor de coordenação conferiu em 09/10/2026 que a fila operacional em `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app/docs/FILA-ENTREGAS.md` já registra C00 aceita, V01 executada com reprovação em 768px e I01 em execução por outro executor. A fila local é um snapshot anterior. Informação recebida do coordenador: reconferir a fonte operacional antes do próximo despacho; não sobrescrever nem incorporar como própria a execução externa.

Conferência adicional do executor de coordenação: a pasta principal já declara 0.1.13 nos manifests e changelog, enquanto este worktree declara 0.1.12. Consultar [CONTINUIDADE.md](CONTINUIDADE.md); não regredir versão na integração. O reteste da correção não foi confirmado nesta entrega.

## Distribuição portável — P01

Em clones de outros colaboradores, começar por `docs/README.md` e capítulos versionados de Overview, Domain Core, Platform Architecture e ADRs. O caminho absoluto citado acima registra a fonte original de Fábio; não exige acesso a essa pasta. Conferir divergências entre contrato e código; relatórios históricos não autorizam reescrita automática.
