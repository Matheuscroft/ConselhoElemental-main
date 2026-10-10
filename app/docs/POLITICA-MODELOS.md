# Escolha de modelos — 09/10/2026

Autorização: usuário pediu seleção por tarefa e escalonamento de raciocínio, com aviso prévio quando a troca depender dele. Esta política é uma heurística revisável, não um benchmark nem promessa de modelo ideal.

| Trabalho | Ponto de partida |
|---|---|
| Extração, checagem documental, edição pequena bem definida | Luna (`gpt-6-luna`), baixo; médio/alto se exigir rastreamento |
| Coordenação corrente, frontend/backend delimitado, testes e integração | Sol (`gpt-6.1-sol`), médio |
| Debug complexo, contratos conflitantes, mudanças em vários módulos | Sol alto; escalar para Astra quando necessário |
| Arquitetura ambígua, análise difícil ou falhas persistentes de raciocínio | Astra (`gpt-6-astra`), médio/alto conforme complexidade |

Antes de delegar, registrar tarefa, escopo, modelo, esforço, motivo e aceite. Selecionar apenas IDs/esforços disponíveis na ferramenta atual. O responsável MAIN não fica preso a um modelo: a tarefa determina a escolha. Para pequenas tarefas, evitar criar agente se o custo de coordenação superar o trabalho.

Escalar primeiro quando há complexidade real: aumentar esforço um nível ou usar modelo mais capaz após resultado insuficiente com evidência. Não repetir tentativas idênticas. Acesso ausente, serviço indisponível, limite de uso ou contexto faltante não se resolvem automaticamente com modelo maior. Extra-alto/máximo só com justificativa registrada. Após resolver a parte difícil, voltar à opção suficiente para tarefas simples. Não executar comparações redundantes de modelos sem benefício esperado.

## O que pode ser alterado

Nesta sessão, spawn_agent aceita model/reasoning_effort para subagentes com contexto explícito (fork_turns none ou número); fork completo herda configuração e não aceita override. A seleção explícita foi exercitada com Sol/médio no reteste I01. Não alegar troca no chat principal: não há ferramenta exposta aqui para alterar seu próprio modelo durante o turno. Configuração de CLI ou novo processo não troca a conversa atual.

Se a tarefa exigir troca do chat principal ou modelo indisponível, avisar ANTES: “Para [tarefa], selecione [modelo] com raciocínio [nível]. Motivo: [razão curta]. Retomada: [arquivo/ID]”. Aguardar a troca somente para o trabalho dependente e continuar tarefas independentes. Nunca relatar uma troca não confirmada. Não criar outro chat ou alterar configurações globais apenas para contornar essa limitação.

Disponibilidade/esforços podem mudar. Reconsultar ferramentas e documentação quando necessário. Não garantir economia exata ou acesso ao modelo pelo nome.

Fontes oficiais consultadas em 09/10/2026: https://learn.chatgpt.com/docs/model-selection e https://learn.chatgpt.com/docs/models . As fontes orientam Luna para tarefas delimitadas, Sol para desenvolvimento complexo com atenção a custo e Astra para tarefas mais exigentes; os níveis da tabela são política local ajustável.

## Preferência vigente do usuário — 09/10/2026

Chat principal selecionado pelo usuário em **Luna leve**. Respeitar essa configuração para trabalho simples. Para V02, o coordenador informou previamente que navegador + fluxo de estado exigem conferência mais cuidadosa e despachou somente o subagente com **Sol médio**; o chat principal não foi alterado. Após esse lote, tarefas de leitura/documentação podem usar Luna baixo. Qualquer etapa complexa futura deve receber aviso explícito do modelo e esforço antes de sua execução se não for possível selecionar no próprio chat.

Atualização I03: usuário confirmou troca do chat principal para **GPT-6.1 Sol médio** para implementar e validar UI/Auth/gateway. Custódia documental delegada a **Luna baixo**, com aviso prévio, sem alterar o chat principal. Voltar a Luna baixo é recomendação para planejamento/documentação curta; implementação, ativação de Auth e validação real continuam recomendadas em Sol médio. Nenhuma ferramenta de troca automática do chat foi usada.
