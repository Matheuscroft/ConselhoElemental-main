# Coordenação operacional — 08/10/2026

## Ambiente comprovado

O executor desta entrega é Codex Desktop, com CLI `0.162.0-alpha.2`. `codex --help` e `codex agents --help` confirmam navegação de sessões; não confirmam carregamento de personas em `.cursor/agents`. A skill create-subagent foi consultada em `/Users/fabioandre/.agents/skills/create-subagent/SKILL.md`: aplicam-se escopo específico, instruções reutilizáveis e formato de reporte. Sua convenção de arquivos Cursor não foi instalada como se fosse configuração nativa Codex.

No executor original desta entrega, `collaboration.spawn_agent`, `send_message`, `followup_task`, `list_agents` e `wait_agent` permitem delegação interna. O executor original exercitou a delegação com um subagente de inspeção somente leitura, já concluído. A revisão C00 não iniciou agentes. Os papéis abaixo são instruções a incluir no pedido de delegação; não são agentes persistentes registrados nem exigem modelo específico. Em outro executor, conferir ferramentas e limites antes de delegar. Sem suporte, cumprir os papéis sequencialmente no mesmo contexto.

Há quatro vagas simultâneas na equipe desta sessão, incluindo o agente principal. Coordenador + três responsáveis ocupam todas. Para um responsável criar um subagente delimitado, liberar capacidade antes; não supor quatro vagas adicionais por nível. Agentes compartilham arquivos: contexto separado não isola alterações. Trabalho em worktree também exige verificar estado inicial e integração. Não há execução infinita, agendamento ou retomada automática instalada.

## Responsabilidades reutilizáveis

| Papel | Instrução de delegação | Limites e entrega |
|---|---|---|
| Astro Boy — coordenação | Priorize a fila única; atribua item, responsável, arquivos e aceite; consolide evidências e decisões para o usuário. | Único escritor da fila durante trabalho paralelo. Revise o diff e a validação antes de aceitar/integrar. Não encaminhe o usuário a outros chats. |
| Interface | Inspecione tela e referência atual; reproduza diferenças; faça somente o lote visual autorizado com componentes e dados existentes. | Não alterar stores, cálculo, progressão, inventário ou backend. Reportar capturas, resoluções, interações, acessibilidade e diferenças restantes. |
| Regras/dados | Compare implementação e fonte canônica; rastreie contratos, efeitos, persistência e reversão. | Nesta fase apenas diagnóstico. Não migrar, ajustar fórmulas ou reconciliar divergência documental sem lote específico. Reportar caminho/símbolo e caso reproduzível. |
| Validação | Verifique critérios do lote de forma independente e registre resultado real. | Não corrigir durante validação sem redistribuição do escopo. Perfil temporário, dados criados pela UI, sem perfil real ou saúde/GPS fictícios. Diferenciar estático, build/lint e execução visual/funcional. |

Cada responsável pode decompor seu lote se autorizado, mas continua dono do resultado; subagentes retornam a ele, que consolida para Astro Boy. Bloqueios/decisões são relatados ao coordenador no contexto atual. Comunicação entre chats exige autorização própria; uma delegação recebida não autoriza mensagem de retorno por ferramenta a outro chat.

## Fluxo e exclusão por arquivo

1. Coordenador lê estado atual e escolhe entrada da fila. Registra checkout, revisão base, alterações preexistentes, responsável concreto e reserva de arquivos. Atribuição por papel na fila ainda não inicia execução.
2. Delegação contém: ID, objetivo, fonte canônica pertinente, arquivos permitidos/proibidos, dependências, critério de aceite, verificações e destino de reporte.
3. Antes de escrever, responsável confere novamente o estado. Cada arquivo tem um único escritor. `src/stores/*`, `src/types/*`, `src/App.tsx`, `src/index.css`, `src/components/layout/*`, manifests/lockfile e documentos de status exigem reserva explícita; outros agentes apenas leem. Não usar staging global.
4. Se outro lote precisar do mesmo arquivo, escalonar em série. Ao detectar edição alheia, não sobrescrever nem reverter: reportar conflito e aguardar redistribuição. Não atribuir alterações preexistentes à entrega.
5. Executor retorna diff delimitado e evidências. Validação verifica os critérios, distinguindo falha de ambiente de defeito reproduzido. Coordenador revisa efeitos cruzados e a situação preexistente antes de integrar.
6. Só o coordenador marca aceita. Push, publicação e merge não fazem parte desta fase. Novos defeitos entram na mesma fila; documentos de status existentes são evidências, não filas concorrentes.

Estados: `fila` → `em execução` → `em revisão` → `aceita`. `bloqueada` exige motivo, dependência e próxima ação; teste pendente nunca vira aceite. Reservas são retiradas ao terminar ou suspender o lote.

## Modelo de reporte

- Item e responsável; checkout/revisão base; arquivos reservados.
- Resultado e arquivos alterados (caminhos absolutos no reporte ao coordenador).
- Evidência atual: comando/caso, resultado, data e artefato; separar inspeção estática de execução.
- Alterações preexistentes preservadas; limitações, conflitos e testes não executados.
- Próximo passo e decisão necessária, se houver. Sem porcentagens de conclusão subjetivas.

## Limite desta entrega

Somente AGENTS.md, documentos novos de coordenação/fila e uma exceção em .gitignore para permitir versionar AGENTS.md (a regra do repositório pai ignora Markdown fora de docs). Nenhuma regra, tela, dado, dependência ou infraestrutura alterada. O checkout original possui AGENTS.md com preferências do projeto, fontes canônicas e skills. Na revisão C00, seu conteúdo foi preservado integralmente e as instruções de coordenação foram acrescentadas; a ausência observada antes se restringia ao worktree inicial. A pasta `.agents/` existente foi preservada. A fila recomenda validação das mudanças presentes antes de iniciar outra reformulação.

## Revisão C00 e suporte efetivamente verificado

Executor original: chat `01a11cf3-3e91-7d12-a254-b3dda87de94a`; subagente de inventário `01a11cf3-c506-78d3-bfff-3d9d1d61947b`. Metadados locais associam ambos ao worktree abaixo; consultas Codex confirmaram ambos ociosos com turnos concluídos antes desta revisão. A ausência na listagem lateral não foi diagnosticada como falha de criação.

Revisor documental: chat `01a11cf6-15b8-7003-9c6f-2fe59c39faf1`. Checkout desta entrega: `/Users/fabioandre/.codex/worktrees/e2b6/Conselheiro_Elemental_MAIN/app`. Astro Boy permanece no chat `01a11cef-d7fc-7ba1-98d1-309e25e61558`. Todos os trabalhos deste fluxo usam Codex; não delegar a Claude.

A documentação oficial atual descreve personas nativas em `.codex/agents/*.toml`, com `name`, `description` e `developer_instructions`: https://learn.chatgpt.com/docs/agent-configuration/subagents . A ferramenta de delegação disponível nesta revisão não expõe seleção de persona por nome; carregamento desses arquivos não foi testado. Portanto esta entrega usa AGENTS.md, protocolo e instruções explícitas de delegação, sem instalar personas ou mudar configurações globais. A configuração persistente aqui é instrucional, não um agendador automático.

A exceção `!/AGENTS.md` no `.gitignore` do app é necessária: a regra `app/**/*.md` no repositório pai ignora esse arquivo. Nenhuma outra exceção foi acrescentada na revisão.

## Dependência local a resolver antes de V01

A conferência de referências encontrou os cinco SKILL.md referenciados ausentes neste worktree: frontend-design, web-design-guidelines, composition-patterns, webapp-testing e improve-animations. Todos existem na pasta original do app. As instruções originais foram preservadas, mas a referência não pode ser tratada como disponível neste checkout. Antes de qualquer criação/reformulação visual, Astro Boy deve verificar e disponibilizar a skill exigida no executor escolhido. Esta revisão não copiou skills nem iniciou trabalho visual.

Verificação C00: conteúdo original de AGENTS.md preservado como prefixo integral; 293 arquivos fora do escopo documental permaneceram idênticos por SHA-256; `git diff --check` passou e os três documentos foram verificados quanto a marcadores de conflito e espaços finais. As referências documentais locais existem; a verificação de skills encontrou a pendência acima. Não houve testes do produto.

## Checkout efetivo após integração

Em 08/10/2026 Astro Boy aceitou C00 e autorizou integração documental em `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`. Esta é a pasta efetiva da fila e de V01. As notas de ausência de skills e arquivos somente no worktree acima são históricas; os cinco SKILL.md existem no checkout original e nenhuma skill foi copiada. Sem git merge, commit, push ou publicação.

## C01 — custódia de versões e documentação (09/10/2026)

Papel adicional: **Versionamento e documentação**, instruções em [AGENTE-VERSIONAMENTO-DOCUMENTACAO.md](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md). Mantém manual, dossiê e ponto de retomada, revisa versões/manifests/changelog após lotes de código e reporta a Astro Boy. Não decide regras de produto nem aceita o próprio lote. O executor inicial é o subagente `/root/versionamento_documentacao`, acionado nesta sessão. O papel é reutilizável; sua sessão não é serviço permanente.

Este papel não cria uma quinta vaga simultânea: escalonar revisão documental após liberar capacidade ou executar os papéis sequencialmente. Reservar manifests/changelog somente na etapa de versionamento e após conferir trabalhos em andamento em outros checkouts. Para esta entrega documental, esses arquivos não são editados.

Retomada obrigatória em [CONTINUIDADE.md](CONTINUIDADE.md). A fila do checkout principal avançou além desta cópia; não sobrescrevê-la durante integração. O coordenador recebe um diff documental delimitado e reconcilia apenas C01.

## P01 — colaboração em outra máquina

Fábio lidera frontend; Matheus backend/documentação. Backend assume contratos, APIs, auth, sync e integração conforme backend-conselho/SKILL.md; começa por auditorias/testes, sem herdar acesso ou credenciais do executor de Fábio. Entrada portável em ASTRO-BOY-BOAS-VINDAS.md e AGENTS.md da raiz. A restrição de publicação dos lotes anteriores era daquele escopo; P01 tem autorização expressa para publicar no GitHub indicado. A capacidade de agentes/modelos precisa ser conferida em cada executor, sem reproduzir limites de uma sessão como configuração permanente.
