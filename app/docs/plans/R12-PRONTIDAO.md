# R12 — prontidão e pontos de atenção

23/10/2026. Complemento da entrada R12 na [fila única](../FILA-ENTREGAS.md). Pedido: preparar e avisar quando puder começar, sem iniciar a implementação. Base local `987e09e`, branch `codex/fitness-ui-integration`, versão 0.1.48. Diagnóstico documental e estático; não é auditoria exaustiva de bugs nem aceite visual.

## Conclusão

**O piloto visual R12-A pode começar na próxima rodada.** Referências, tokens, componentes e preservação de comportamento estão delimitados. Não é necessário outro vídeo ou link para iniciar. A carteira real de fragmentos e uma mudança da regra de streak ainda dependem de contrato; isso não impede o piloto.

O mapa compartilhado está hoje em Rituais; Jornadas e Grandes Obras abrem essa trilha por link. Portanto, o primeiro piloto será uma Jornada real aberta na trilha existente, com entrada pelo catálogo de Jornadas. Não criar uma segunda trilha/persistência para fazer parecer que toda a página Jornadas foi reformulada. A integração e os editores são R12-C.

## Atenção por prioridade

| Prioridade | Situação e evidência | Tratamento |
| --- | --- | --- |
| Antes de aceitar qualquer nova tela | QA renderizado ainda pendente; os testes históricos não verificam toque, foco, fluidez ou persistência real | Conferir acesso efetivo ao navegador na rodada de implementação; usar dados isolados e registrar capturas/interações. A recusa antiga não foi retestada nesta revisão |
| Primeiro lote | `QuestTrailMap.tsx` tem lista, conectores e offsets fixos; a linguagem visual ainda precisa evoluir para percurso e estados mais claros | R12-A: mapa, nós elementais, títulos, próxima sugestão, seleção e movimento curto; preservar ordem livre |
| Integração seguinte | Jornadas/GrandesObras ainda têm diálogos `bg-mystic-purple` e links para a trilha | R12-C: modernizar detalhes/criação preservando todas as operações; compartilhar componentes com Rituais |
| Antes de saldo real | Não há carteira/recibo de fragmentos no contrato atual; conclusão e animação não podem conceder separadamente | R12-D: evento estável, autorização por conta, concessão única, Undo e reconciliação; Matheus mantém backend |
| Antes de mudar constância | Streak global usa `updatedAt`, exige atividade hoje e percorre dias em intervalos de 24 h | Revisar evento/fuso/hoje pendente; risco identificado estaticamente, sem mudar regra nem declarar reprodução |
| Antes de mostrar conclusão macro como garantida | Contagem por IDs vivos e progresso persistido de Jornada/Obra podem divergir | Manter distinção na UI; contrato de conclusão/bônus macro com Matheus |
| Após piloto e integração | Pendências transversais de identidade e desempenho permanecem | Continuar famílias de tela e QA abaixo; não declarar todo app finalizado |

## Decisões e dependências

Confirmado por Fábio: identidade elemental; próxima etapa sugerida com acesso livre; 1 fragmento por conclusão válida, do elemento da atividade, separado de XP/Prana. Nenhuma pergunta adicional sobre a quantidade é necessária.

Antes de R12-D, fechar em um único bloco de decisões: o que constitui conclusão elegível (incluindo hábitos e agregadores); resolução de classificação multiárea/conflitante; efeito de Undo/reconclusão; dia civil/fuso e regra de sequência quando hoje ainda está em aberto. As recomendações e o DTO estão no [plano de contratos](R12-GAMIFICACAO-VIDEOS.md). Não presumir que recomendações já são regras aprovadas.

Antes de R12-E, implementar e testar o contrato do recibo; só então saldo/coleção e animação de coleta consomem uma concessão confirmada. Não premiar retroativamente ou inserir saldo demonstrativo nos dados reais. Não adicionar loja, ligas, vidas ou multiplicadores por inspiração no vídeo.

## R12-A — roteiro de execução preparado

1. Conferir novamente checkout, fila e alterações concorrentes; reservar os arquivos do lote. Ler `frontend-design` e o [plano de movimento](001-MOVIMENTO-QUESTS.md).
2. Capturar o estado anterior e criar uma Jornada de teste pela UI em ambiente isolado autorizado. Usar seus IDs reais; não reutilizar ou apagar dados pessoais. Fixtures de unidade podem representar estados extremos sem entrar no store do usuário.
3. Evoluir `src/components/quests/QuestTrailMap.tsx` e `src/components/quests/quests.css`; reutilizar tokens de `src/styles/elemental-theme.css` e ícones existentes. Alterar tokens compartilhados somente se necessário, com revisão dos consumidores. Nenhuma nova dependência é prevista para o piloto.
4. Preservar a API do mapa (`trail`, `selectedKey`, `onSelect`, `detail`), IDs, ordenação, seleção e callbacks. Estados próxima/selecionada/concluída/disponível/indisponível devem ter texto ou símbolo além da cor; hábitos continuam recorrentes, sem falsa conclusão definitiva.
5. Não editar `quest-path.ts`, `quest-commands.ts`, stores, Core, types, services, constants, Supabase, autenticação, fontes de tempo ou cálculo. Necessidade real de contrato sai do lote visual para revisão própria. `QuestHub` e recibo ficam em R12-B; catálogos/compositor em R12-C.
6. Verificar a Jornada piloto entrando por `/jornadas` e pelo link profundo de Rituais; conferir lista anterior, retorno e seleção fora da ordem sugerida. Não iniciar nem concluir uma atividade por simplesmente selecionar um nó.

Aceite visual: 360/390/768/1440 px, zoom 200%, títulos longos, zero/uma/muitas etapas, teclado, foco visível, detalhe aberto, movimento reduzido, barra inferior e ausência de rolagem horizontal indevida. Testar retorno à posição e seleção rápida sem deslocamentos abruptos; medir a fluidez em renderização real, não inferi-la do CSS.

Verificações previstas após a alteração: testes existentes `tests/quests/path.test.mjs` e `tests/quests/commands.test.mjs`, TypeScript, lint e build conforme o procedimento vigente sem leitura de `.env`; casos de apresentação adicionais só quando cobrem uma regressão concreta. Adaptar testes que dependem da estrutura JSX sem enfraquecer garantias de seleção livre e referências indisponíveis. Registrar separadamente unidade/SSR e navegação real. Falha de ambiente não vira aprovação.

Encerramento futuro: revisar diff contra a base, confirmar arquivos protegidos, aplicar versionamento de código conforme skill e atualizar continuidade com resultados realmente executados. Sem deploy ou alteração remota implícita. Se QA estiver impedido, registrar o lote em revisão e o bloqueio, nunca como aceito.

## Cobertura geral ainda pendente

Esta lista consolida o [repasse vigente](../REPASSE-FRONTEND-PARA-BACKEND.md); os estados permanecem na fila, sem backlog concorrente.

- **Telas já repaginadas:** Santuário, elementos/Pilares, Ciclos, Grimório, Lua/Estações/Ano e quests ainda precisam de matriz de interação/responsividade. Aprovação visual do usuário e testes históricos são evidências diferentes.
- **Identidade parcial:** Domínios/detalhes, Forja/Invocar, Astrolábio, Cassino, onboarding/auth, editores antigos, Semana/Mês/Calendário e contextos específicos de Fitness. Fazer lotes por família, incluindo vazio/erro/carregamento e formulários, não apenas cabeçalhos.
- **Regressão funcional:** criação/edição, reload, timer ocupado/pausado, conclusão/Undo, troca de conta, referências apagadas e encaminhamento a Ciclos/Fitness. Não testar gravações na conta real.
- **Performance e acessibilidade:** tamanho de chunks e Browserslist eram avisos históricos; obter medidas atuais antes de otimizar. Testar foco, anúncios de resultado, contraste, movimento reduzido e custo dos efeitos no dispositivo.
- **Backend:** sincronização/isolamento remoto, snapshots macro, reversão/idempotência e divergências de Prana/precisão permanecem para Matheus conforme repasse. A auditoria de hoje não reproduziu esses problemas nem validou serviços remotos.
- **Recursos futuros:** openGym, inventário/equipamentos e uso dos fragmentos precisam de lotes próprios. Personagem visual, efeitos de partículas e carteira econômica são recursos diferentes.
- **Publicação:** os novos planos ainda estão locais. Nenhum push/fetch foi feito nesta revisão; igualdade atual com o remoto não foi conferida. Entrega anterior publicada não inclui automaticamente estes planos.

## Evidência desta revisão

Executados: Git status/log local, `astro-boy.mjs status --json`, leitura de fila/continuidade/repasse/planos, inventário de rotas em `src/App.tsx`, manifesto e arquivos de testes, inspeção do mapa e dos diálogos de Jornadas/Grandes Obras. Referências Figma e vídeos já analisadas anteriormente; não foram reextraídas nesta revisão.

O perfil local explícito está configurado como Matheus/backend e sinaliza briefing pendente. Isso não identifica o interlocutor atual nem transfere a direção de frontend; não foi alterado ou marcado como lido em nome de Matheus.

Fechamento documental executado: nove links locais dos planos válidos, `git diff --check` sem erros e nenhum arquivo modificado/não rastreado fora de documentação em relação a HEAD. Nenhum teste do produto, build, lint, benchmark, QA de navegador, migração, commit, push ou deploy nesta rodada. Revisão pelo coordenador; revisão independente pendente.
