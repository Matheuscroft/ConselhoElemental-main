# Progresso salvo e próxima fase: uso diário no celular

24/10/2026 · versão 0.1.64 · Astro Boy · Fábio frontend/UX, Matheus backend.

Este é o resumo de retomada solicitado por Fábio. A fila operacional continua em [FILA-ENTREGAS](FILA-ENTREGAS.md); este documento detalha prioridades e critérios, sem criar uma segunda fila.

## O que está construído

| Área | Estado registrado |
| --- | --- |
| Santuário e identidade | Home elemental, personagem central, órbita, páginas de elementos, tokens, ícones, cabeçalho e cronômetro. A antiga home foi substituída. |
| Tempo e personagem | Lua realista, Estações/Ano reorganizados, Grimório com recursos e histórico, Astrolábio atualizado. |
| Atividades | Rituais/tarefas, Ciclos/hábitos, calendário e sequências refinados; trilhas de Jornadas com próxima etapa sugerida e acesso livre. Grandes Obras com capítulos. |
| Criação e descoberta | Invocar, Forja, Domínios/detalhe/formulários atualizados; catálogo de áreas compacto em grupos; Pilares e Mapa com descoberta e navegação. |
| Roda do Destino | R24: escolha gratuita entre atividades reais, filtros, resultado e link de execução. Sem stamina ou XP automático, conforme aprovação explícita. |
| Progresso futuro | Fragmentos e nova mecânica de streak NÃO implementados. Regra inicial de um fragmento por conclusão aprovada, contratos restantes pendentes em R12-D/E. Inventário funcional novo também não implementado. |

Histórico I03/R01–R14: [repasse anterior](REPASSE-FRONTEND-PARA-BACKEND.md). Mudanças R15–R24: [índice de entregas](plans/README.md). Não confundir presença no código com validação visual de todas as telas.

## Proteger os dados pessoais antes da conta — prioridade P0

**Salvar código em Git não faz backup das atividades do navegador. Não foi exportado nem restaurado o armazenamento pessoal nesta rodada. Não foi feito login, logout, cadastro ou migração.** O acesso renderizado anterior estava bloqueado; não se tentou contornar o bloqueio para ler dados locais.

Inspeção de código executada em 24/10/2026:

1. `appStore` persiste em `conselho-elemental-storage`: usuário/progresso, contas, ações, tarefas, hábitos/conclusões, sequências/vínculos, compromissos, projetos, quests, rascunhos, áreas e executionLogs. Persistência local é dependente deste navegador e origem; não é prova de backup externo.
2. Conta local e login Supabase são fluxos distintos. `createAccount(name, true)` captura dados do core, mas gera novo ID de usuário. Não prova transferência dos dados de outros stores.
3. Treinos têm armazenamento separado (`dominio-do-mago-workout-storage-v1`) e mapas por conta, inclusive `nativeDataById`. `syncAccountContext` muda a projeção para o identificador recebido; não há nesse método migração do conteúdo da conta local para o novo ID.
4. `authStore.migrateLocalData` está desativado. Ao entrar em conta cloud nova sem dados/perfil, `resetAppStoreForFreshCloudUser` pode esvaziar tarefas, hábitos, áreas, projetos, quests, rascunhos e sequências. Isso é uma condição identificada no código, não uma perda observada na conta de Fábio.
5. `hydrateAppStoreFromCloud` aplica o snapshot remoto quando encontra dados. A proteção por fingerprint é opcional e não é fornecida no login inicial. O fluxo precisa reconciliar os dados locais antes de substituir a projeção.
6. `CloudSnapshot`/fingerprint não contemplam todos os campos persistidos localmente: ações nativas, executionLogs, compromissos, todos os atributos do usuário e o store de treinos exigem inventário e contrato específicos. Recalcular progresso a partir de um subconjunto não é garantia de preservar todas as conquistas.
7. O backup de emergência existente salva um snapshot cloud no mesmo localStorage e ignora falhas de quota. Não substitui exportação completa verificável. A recuperação legado escolhe o primeiro backup local com dados; precisa ser vinculada explicitamente à origem/conta antes de servir como migração confiável.

Não alterar regras/backend silenciosamente para corrigir esses pontos. Matheus mantém contratos, sincronização e isolamento; Fábio aprova UX de preservação/transferência. Nenhum serviço remoto, credencial ou configuração de ambiente foi acessado nesta revisão de código.

### Lote seguinte proposto: R25-A — backup verificável

- Inventariar os dois stores e preferências relevantes por origem/conta, inclusive conquistas derivadas e dados nativos. Preservar IDs e datas.
- Exportação explícita de dados do app com versão do formato, data, manifesto de contagens e checksum; excluir tokens, sessões e credenciais. Arquivo pessoal fora do Git.
- Validar arquivo e tamanho antes de permitir restauração. Prévia de conteúdo, origem/conta e conflitos; cancelamento seguro. Não aplicar automaticamente nem substituir dados por padrão.
- Provar exportar → importar → exportar com fixtures isoladas e equivalência de IDs, relações, conclusões, XP/Prana existentes e histórico, sem premiar novamente.
- Capturar e verificar um backup do estado real apenas pelo fluxo autorizado do navegador. O estado atual ainda não tem esse backup confirmado.

### Depois: R25-B — associação segura à conta, com Matheus

- Ação explícita “Levar meu progresso para esta conta”; preservar snapshot original até confirmação de leitura no destino.
- Resolver conflito entre progresso já existente na conta e dados do dispositivo. Nunca adotar “última escrita vence” indiscriminadamente nem importar dados de outra conta.
- Importação idempotente e retomável, isolamento por usuário, rollback e falhas de rede/quota; sem reemitir recompensas.
- Testar cadastro, login em conta vazia e existente, logout/login, troca de conta, reload, offline e segundo dispositivo em ambiente isolado. Só considerar pronto após conferir cobertura de core e treino.
- Critério de aceite: mesmos registros/IDs/vínculos, datas e progresso antes/depois; nenhuma duplicação de conclusão ou perda silenciosa. Essa garantia ainda NÃO está validada.

## Próxima fase de UX: consolidar antes de ampliar

R26 — revisão por jornadas completas, começando em 360/390px e depois 768px. Cada rodada deve produzir evidência de uso real e um lote pequeno de correções.

1. Santuário → escolher atividade → executar/pausar → concluir/Undo → conferir Grimório/histórico.
2. Invocar/Forja → criar/editar → encontrar a atividade em Rituais, Ciclos ou trilha.
3. Ciclos: escolher data, filtrar, sequência, concluir ocorrência e retornar sem perder contexto.
4. Domínios/Pilares/Mapa: localizar uma área, abrir detalhe e voltar ao mesmo grupo/filtro.
5. Treinos: sessão real isolada, pausa/retomada, término e histórico com IDs criados pela UI.
6. Roda: filtros, zero/uma/muitas opções, resultado disponível/alterado, abrir atividade e voltar.

Em todas: textos longos, teclado virtual, alvos de toque, rolagem, barra inferior sem sobreposição, estados vazios/erro/carregamento, foco e movimento reduzido. Eliminar passos redundantes e preservar contexto ao voltar. Medir carregamento e animações no dispositivo antes de prometer FPS ou experiência premium concluída. Aviso atual de bundle grande é prioridade de medição/code splitting, sem troca geral de bibliotecas.

## O que foi validado agora e o que falta

134 testes Node, TypeScript, lint e build aprovados no fechamento R24; nenhum diff em stores/services/types/Supabase. Isso valida integração estrutural e casos cobertos, não o backup real, migração cloud ou usabilidade renderizada. Conferência visual e interação mobile continuam pendentes. A revisão independente também não foi executada.

Ponto de retomada: **R25-A — preparar exportação/restauração verificável; depois R25-B conta pessoal e R26 usabilidade mobile.** Não habilitar a migração atual para o usuário sob promessa de preservação ainda não demonstrada. Questões anteriores de vínculos R19 e contratos R12-D/E continuam registradas na fila.
