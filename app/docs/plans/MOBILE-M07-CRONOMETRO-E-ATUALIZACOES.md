# M07 — cronômetro elemental, atualização e primeiro passo de usabilidade mobile

07/11/2026 · 0.1.142 · Astro Boy/Sol Alto, responsabilidades cumpridas sequencialmente, sem subagentes. Lote autorizado pelo pedido de transformar o celular no ambiente principal diário, corrigir cronômetro em segundo plano/bloqueio e iniciar simplificação da experiência.

## Entrega funcional

O cronômetro compartilhado por Rituais, Ciclos e Santuário usava callbacks de setInterval como unidade de tempo. Agora calcula segundos pelo intervalo desde a âncora temporal; pausa captura o instante atual, retomada rebasa a âncora e parada inclui o último intervalo mesmo sem callback. Conversões de segundos/minutos, fórmulas e concessão de XP continuam com os donos existentes. Passar tempo não conclui nem concede recompensa.

Um único lifecycle acompanha a raiz do app e confere visibilidade, foco e retorno da página. Evita callbacks de pintura desnecessários quando oculto. Metadados operacionais pequenos ficam em **sessionStorage da mesma aba**, sob formato próprio e conferência do perfil/usuário local e entidade ainda em andamento. Não entram no backup, conta, banco ou sincronização entre aparelhos. Estado pausado continua pausado; entidade ausente/concluída ou outro dono local recusa recuperação. Falha de storage informa o limite sem apagar dados nem impedir o relógio atual. Cronômetro runtime continua fora da projeção de domínio; não foi criado outro motor de atividade/XP.

Não é um serviço executando continuamente no iOS bloqueado. Quando o sistema suspende o navegador, a contagem é acertada ao retornar; a recuperação depende da mesma aba/sessão e de seu armazenamento disponível. Encerrar/descartar a sessão pelo sistema, abrir outra aba/origem ou mudar o relógio do aparelho não tem garantia de continuidade equivalente a um app nativo. Não foi implementada notificação/alarme com o app fechado, Live Activity ou execução contínua nativa.

Uma faixa inferior mantém título, tempo e pausa/retomada durante navegação e retorna ao cronômetro da atividade. Fechar o modal de Ciclos agora recolhe sem parar; terminar/pausar são escolhas explícitas. Reabrir a mesma atividade não zera a contagem e iniciar outra não sobrescreve a sessão atual. Dia selecionado é guardado como metadado do timer para o retorno ao ciclo correto. Recupera-se o total do ciclo; rastreamento transitório por etapa no modo de execução composto não é prometido como uma sessão completa de subetapas restaurada. Fitness tem lifecycle próprio e não foi substituído.

## Identidade e acessibilidade

A base escura/dourada, fontes Cinzel/Inter e os assets elementais existentes foram preservados. Foco visual único é o mostrador: fogo com brasas/arcos quentes, água com ondulações e bolhas, ar com correntes em sentidos distintos, terra com cristais sólidos. Números permanecem estáveis e legíveis. Toque no elemento produz resposta breve, sem alterar tempo/recompensa. Pausar o relógio pausa o ambiente; Pausar efeitos controla só a decoração. Movimento reduzido remove as animações contínuas. Botões de ação permanecem com alvo mínimo44px e rótulos explícitos.

O menu ganha três atalhos cotidianos (Nova atividade, Minha rotina, Meu progresso) e explicações dos destinos. Busca e grupos mantêm todas as rotas; não abre teclado automaticamente. Essa é a primeira melhoria da revisão para iniciantes, não uma declaração de que todo o app já foi validado como intuitivo.

## Atualização no celular e publicação contínua por lote

A autorização permanente para este projeto/endereço foi registrada no AGENTS.md. Após cada lote concluído/verificado, publicar nesse Vercel e conferir o resultado. Não há CI/daemon automático configurado por esta instrução e não há autorização de push implícita.

O build emite app-version.json público, sem dados/configurações privadas. Durante o uso, o app consulta ao abrir, retornar ao foco/conexão e periodicamente (cinco minutos visível, limite de30s entre verificações). Versão igual/antiga/inválida ou falta de rede não interrompem a experiência. Uma nova versão mostra Atualizar agora/Depois. Não há reload forçado durante formulários. Ao atualizar, confere o salvamento da conta e bloqueia intent/resolução/restauração pendentes; preserva origem, rota e armazenamento, e o lifecycle guarda o timer no pagehide.

A checagem existe no app normal montado; workspaces de recuperação/conferência não são reiniciados em silêncio. Quem ainda está numa versão anterior ao142 precisa reabrir/recarregar uma vez para receber esse mecanismo. Não é possível alterar o código já suspenso pelo iOS remotamente nem garantir download com o app fechado/offline. Não orientar reinstalação/limpeza do progresso.

HTML de rotas SPA e metadados passam a revalidar sem cache; assets com hash mantêm seu tratamento normal. Scheduler da conta ignora mudança exclusiva de timer, evitando uma conferência integral por segundo. Outras mudanças continuam agendando o salvamento existente.

## Compatibilidade e limites de segurança

Versão142 alinhada no package/lock/changelog e auditor local. Migração20261107215418_account_archive_version_142.sql amplia somente a allowlist141→142 sobre hash exato; formato/contas/grants/gate/dados preservados. Aplicação remota retornou sucesso; readback gate=true, hash bf63b6461cbbeea06a401940c68ddf957f73ffe1f8bd8782a5f482fbbea47080, zero contas integrais, duas contas Auth e cinco tarefas/34hábitos legados. Nenhum arquivo de progresso pessoal foi enviado pelo agente. Avisos preexistentes de segurança de N12 não foram alterados fora do escopo.

## Verificações e fechamento

Suíte final742/742 passou após adaptar o teste dos controles para a composição React com estado visual; execução anterior teve um único teste antigo chamando diretamente um componente que agora usa hooks, sem defeito de contagem. Tipos/build/lint e15 testes finais direcionados passaram. Testes cobrem callbacks omitidos por minutos, pausa/retomada/parada, recarga rodando/pausado, dono/entidade incompatível, storage indisponível, conclusão externa sem duplicar XP, reinício recusado, contrato dos controles, versões e scheduler que ignora timer. Não são prova de iPhone físico.

Publicação final **READY dpl_JD3uEgJd5c9ifvYMo7pi6cK6qGhy** no mesmo domínio https://conselho-elemental-testes.vercel.app. Fonte525arquivos por SHA, sem env/SQL/documentos/fixtures/backup pessoal. app-version.json142, HTML da rota e entry142/HTTP200 conferidos; ambos HTML/metadados com no-store/no-cache/must-revalidate. Builds intermediários142 foram substituídos durante revisão; usar somente este deployment como aceite final. Sem push GitHub.

Ensaio final no app publicado, Chromium descartável com IDs criados pelas APIs reais da store e dados exclusivamente sintéticos: iniciar/recolher/retornar, aba em segundo plano por3,1s e foco, pausa mantida na recarga, retomada, oferta de nova versão simulada143, atualização explícita na mesma origem com relógio rodando recuperado e conclusão somente por ação. Quatro animações CSS distintas confirmadas; toque, pausa de efeitos independente e movimento reduzido passaram. Layout360/390/768px sem overflow horizontal, botões150/162×48px. Menu com três atalhos, descrições e sem foco automático na busca; Nova atividade abriu Invocar. Ensaio adicional de menu com perfil vazio descartável mediu360/390/768px após transição, dentro da viewport, atalhos104/114/240×76px e busca16px. Isso não simula teclado físico. Zero erro de página ou chamada Supabase. Assets carregados antes das capturas finais; fogo/água/terra/ar/menu inspecionados. Não é teste de bloqueio físico do iPhone, de nova versão143 realmente publicada ou de envio de progresso pessoal.

A revisão funcional identificou interferência entre modal e aviso de atualização e uma intenção de retorno que podia reabrir o modal; aviso fica oculto enquanto há modal aberto e o fechamento consome cronometro=1 sem parar a sessão. Ensaios iniciais com CDP congelado foram interrompidos e descartados como evidência; o percurso aceito usa alternância real de abas, mais testes determinísticos de callbacks ausentes. Harness também passou a aguardar o fim da transição dos modais antes de clicar; tentativas prematuras não foram convertidas em aceite.

[Evidências, capturas e hashes](evidence/mobile-cronometro-0.1.142/). Suíte final742/742 em85,999s, repetida depois dos ajustes do retorno; tipos/build/lint/diff-check finais passaram. O único ajuste posterior à última suíte foi documental, sem código de produto. Revisão documental sequencial concluída, reservasM07 encerradas. Próximo: Fábio reabrir uma vez o app142 no iPhone e testar um minuto com a tela bloqueada; sem reinstalar ou apagar dados. Depois seguir a revisão da rotina/criação em Sol Médio, mantendo conta/syncN10 pendente em Sol Alto.

Plano visual aplicado: canvas#0b111b, superfície#101923, texto#f0eee8, dourado#d5b66f, água#7dcfe5 e secundário#aeb9c7; tintas dos quatro elementos vêm da identidade existente. Cinzel nos títulos, Inter nos controles e números tabulares. Estrutura: atividade → mostrador/elemento → efeitos → pausar/concluir → nota de continuidade. A magia se concentra no instrumento; navegação e texto ficam tranquilos e explícitos.

## Próximas frentes para quem nunca usou o app

1. **Rotina diária:** abrir → encontrar próximo hábito → registrar quantidade → concluir/desfazer. Revisar densidade dos cartões, diferenciar contador e conclusão e deixar o resultado visível. Após retorno focado em uma atividade, tornar Ver toda a rotina mais evidente que Limpar filtros. Sol Médio.
2. **Criar sem entender a taxonomia:** explicar com exemplos atividade única, hábito recorrente, sequência e projeto; manter opções avançadas em divulgação progressiva. Revisar cada formulário com teclado e uma mão. Sol Médio; Alto apenas se mudar contrato/regras.
3. **Encontrar e retomar:** medir busca, Mais, voltar, histórico de contexto e retorno do cronômetro nas rotas reais. Atalhos e descrições deste lote são a primeira etapa. Sol Médio.
4. **Conta e continuidade:** cadastro/login/recuperação, escolha de qual progresso salvar/receber, estado offline e conflitos em dois aparelhos. Depende ainda do envio de e-mail e aceite realN10; manter Sol Alto.
5. **Aceite físico:** telefone360/390px e tablet768px, teclado, safe areas, bloquear/desbloquear, alternar apps, reload e rede interrompida. Não registrar painel estreito do computador como iPhone. Sol Médio, sem inventar aprovação.

Critérios: nenhuma rota perdida, ações principais com rótulos comuns e alvos44px, opção clara de voltar/cancelar, dados preservados, feedback sem bloquear a ação, efeitos controláveis e nenhuma conclusão/recompensa automática.

Referências técnicas consultadas: [visibilidade e suspensão de callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [relógios e suspensão do sistema](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now), [diretrizes de interface](https://github.com/vercel-labs/web-interface-guidelines). A escolha de relógio por âncora inclui a suspensão do aparelho; mudanças manuais no relógio continuam uma limitação explícita.
