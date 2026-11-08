# T06 — evolução e biblioteca direta — 0.1.130

06/11/2026. Astro Boy, papéis de implementação/validação/custódia executados em série. Base 67bb6e5, branch codex/fitness-ui-integration, checkout inicialmente limpo. Fetch confirmou main igual à base, sem alterações novas de Matheus. A rodada anterior 0.1.129 está publicada; esta rodada inicia um novo lote local.

## Onde paramos

T04/T05 modernizaram superfícies restantes de Treinos, símbolos coloridos de XP/elementos e seleção de ícone por modalidade; 674 testes foram a evidência daquela publicação. Não comprovam automaticamente o lote atual. O repasse e os candidatos SQL anteriores estão no Git; publicar código não associou progresso local à conta nem ativou gates de escrita. F6/conta nova e aceite hospedado continuam pendentes. GymMane continua avaliação, sem código/arte importados.

Servidor Vite reativado em 127.0.0.1:5173 com envDir:false. Abertura de /treinos?tab=workouts no painel direito solicitada pela ferramenta oficial; retorno queued. Isso não confirma que a página apareceu. Inspeção do browser anteriormente recusada por permissão salva, sem alteração informada nesta rodada; não houve nova tentativa de inspeção nem contorno por Playwright/HTTP/outro perfil. O processo Vite anunciou a URL, sem validar tela ou dados pessoais.

## Plano de evolução e dependências

| Ordem | Frente e entrega | Responsável e modelo adequado | Critério de fechamento |
|---|---|---|---|
| 1 | Conta/F6: fechar bootstrap, conta vazia, reload/saída, compatibilidade dos produtores e associação pessoal com cópia/readback | Matheus no backend; Sol Alto para contratos/Auth/persistência | Integração hospedada isolada verificada e transferência pessoal explicitamente conferida antes de ativar gates; não basta login |
| 2 — iniciada aqui | Usabilidade mobile: acesso direto ao treino salvo, busca, prévia/retomada; depois execução, descanso, conclusão e histórico | Fábio frontend; Sol Médio em lotes integrados | Fluxo simples com os mesmos IDs/stores, estados vazios claros, foco/teclado/movimento reduzido; aceite visual em celular/tablet ainda próprio |
| 3 | Piloto de evolução Treinos guiado pelo mapa GymMane: plano → série → descanso → resumo → histórico | Sol Alto apenas em novos contratos/adapters; Médio na apresentação | Primeiro fechar licença e paridade; nenhuma cópia de motor de XP, Auth ou persistência. Recursos nativos, sensores e importação são lotes separados |
| 4 | Fragmentos/inventário e movimento: um fragmento por conclusão válida do elemento; feedback após confirmação real | Alto em idempotência/persistência; Médio em UI/animações | Saldo persistente, reversão/deduplicação e isolamento; animação nunca concede recompensa nem se repete ao hidratar histórico |

Esta tabela organiza as frentes existentes; FILA-ENTREGAS permanece a fila operacional única. Não há troca automática de modelo ou agentes ativos por este documento. As dependências de conta não impedem melhorias de apresentação isoladas, mas impedem anunciar sincronização pronta. Antes de passar à frente de contratos, avisar o usuário sobre Sol Alto.

## Diagnóstico e implementação deste lote

FitnessRoot mostrava modalidades e sequências na entrada; Meus treinos só existia depois de escolher uma modalidade. Assim, localizar um plano salvo exigia lembrar em qual categoria ele estava. Sessões ativas já tinham retomada direta e foram preservadas acima da biblioteca.

SavedWorkoutLibrary agora recebe os templates/catálogo existentes e callbacks de navegação. Mostra nomes, modalidade, quantidade de exercícios e ícone contextual; abre /treinos/preview/<id>, sem iniciar sessão. Busca combina palavras do nome/modalidade, ignorando acentos/caixa. Seis resultados por vez, ordenados por edição/criação; a ordenação opera sobre uma cópia filtrada e não altera o store. Mostrar mais/menos limita o tamanho da página; limpar pesquisa devolve foco ao campo. Sem resultados é diferente de não ter treinos salvos.

Novo treino leva à seção Explorar modalidades, com foco no título e scroll respeitando prefers-reduced-motion. Modalidades, catálogo, criação/edição, sequências, ponte com Ciclos e todas as rotas anteriores continuam disponíveis. A biblioteca é leitura/navegação e não cria persistência paralela ou novas recompensas.

## Direção de interface

Reutilizados os tokens de vidro escuro, ouro, texto claro e cinza da identidade aprovada, sem introduzir outra paleta: --el-canvas/--el-surface/--el-gold/--el-text/--el-muted. Cinzel nos títulos e Inter em nomes/controles. Alinhamento à esquerda, biblioteca com linhas compactas de toque amplo; ícone contextual à esquerda, nome legível e modalidade secundária. Pesquisa com 16px e controles de pelo menos 44px. A assinatura visual continua nos símbolos elementais e no personagem, sem animação decorativa contínua nesta lista.

Hierarquia: sessão em andamento → Meus treinos/busca → Explorar modalidades → sequências. O CTA principal desta entrada é abrir um treino existente; execução e sua confirmação continuam na prévia. Isso aplica os conceitos de conteúdo progressivo/Showcase à navegação sem replicar todos os detalhes de cada cartão na tela inicial.

## Compatibilidade e preservação

Versão/lock/changelog sincronizados em 0.1.130. Whitelist local revisada para esse produtor e candidato 20261106180121_account_archive_version_130.sql criado pela CLI. Apenas acrescenta produtor permitido ao validador anterior, protegido pelo hash da função e pelo gate fechado; formato do arquivo, schema e bytes de progresso anteriores não mudam. Teste SQL sintético verifica rejeição antes/aceitação após a revisão, arquivo armazenado preservado e escrita false. Nenhuma aplicação remota ou novo segredo.

Fontes consultadas: [CLI migration new](https://supabase.com/docs/reference/cli/supabase-migration-new) e índice changelog oficial, obtido em Markdown após o leitor web recusar esse content-type. Não se introduz nova API Supabase nem mudança de Auth/RLS nesta interface. Migrações anteriores, stores, tipos, catálogos, fórmulas e gates permanecem intactos. Base SHA em /tmp/treinos-t06-before.json para verificação de preservação.

## Verificações e próximos passos

**Executado:** 677 testes completos, zero falhas/pulados (71,86s; concorrência 4); 12 direcionados de biblioteca/identidade/catálogo (0,52s); um SQL sintético de compatibilidade de versão (5,77s); TypeScript, ESLint, build envDir:false (31,13s), diff-check e links locais. Build conserva avisos anteriores de tamanho de chunk/Browserslist. Três testes novos cobrem biblioteca e interação; fixture não inicializa stores ou perfil real. Revisão React: hooks estáveis, derivação memoizada sobre cópia, imports específicos e callbacks sem mutação. Comparados 83 arquivos protegidos por SHA, sem diferenças. A única mudança em lib/backup é a whitelist de produtor 130. [Evidências](evidence/treinos-biblioteca-0.1.130/verificacoes.json). Sem aceite visual real. Custódia sequencial concluída, reservas encerradas, sem commit/push nesta rodada. Próximo lote de frontend: melhorar o percurso prévia → execução → descanso → resumo, aproveitando contratos atuais. Backend prioritário continua F6; não ativar gates ou transferir dados pessoais por inferência deste plano.
