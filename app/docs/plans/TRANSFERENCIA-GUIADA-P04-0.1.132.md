# P04 — transferência guiada e ambiente fixo de testes — 0.1.132

06/11/2026. Fábio pede o caminho mais simples para transferir/resgatar seu progresso e define o projeto de testes como ambiente permanente durante a evolução. Pedido autoriza publicar melhorias verificadas nesse projeto; não ativa deploy dos projetos antigos ou sincronização de dados.

## UX entregue

Tela de importação com três etapas: Escolher arquivo → Conferir progresso → Usar neste aparelho. O seletor do JSON é a primeira ação; título/instrução explicam que os dados ficam no navegador atual, sem nuvem. Dados anteriores, consentimentos, cópia externa, locks, journal e readback continuam protegidos.

Corrigido um obstáculo funcional: baixar a cópia de segurança apagava a comparação do arquivo recebido porque run limpava todo preview. O comando agora retém somente o preview previamente escolhido e revalida tanto o baseline dessa comparação quanto o baseline da cópia criada antes de baixar. Erro, cancelamento ou alteração concorrente invalidam a comparação; não se conserva consentimento obsoleto ou baseline diferente. O arquivo recebido não precisa ser escolhido novamente por ter salvo a cópia anterior. Enquanto o download/conferência está em andamento, as ações de escrita ficam desmontadas; ao voltar, exigem confirmações novas, impedindo disparo concorrente durante o preparo. Nenhum motor de gravação, store, tipo, catálogo ou regra de XP foi modificado.

Dois testes novos exercitam seleção → download da cópia anterior → comparação preservada e baseline obsoleto → comparação descartada sem download. Verificações finais registradas abaixo após execução. Produto 132/manifests/whitelist e candidato SQL local correspondentes; nenhuma aplicação remota.

## Combinado permanente

Destino de testes: projeto conselho-elemental-testes / prj_2feHjC8XBOmFRRxbL39qGvTXQb0r / equipe fr-prodiction, endereço https://conselho-elemental-testes.vercel.app. Publicar nesse mesmo projeto após as verificações pertinentes e conferência de build/READY; conservar a origem, sem limpar dados, recriar projeto ou fazer deploy de uma fixture como app. Não inserir JSON pessoal no código/assets/Git/build. Criar conta e sync F6 será uma etapa posterior com preservação/associação explícita.

Autorização continuada de Fábio neste pedido cobre atualizações verificadas do projeto de testes. Não autoriza por inferência banco remoto, publicação nos projetos antigos, mudança de fórmula ou transferência de arquivos pessoais a outros serviços. GitHub e banco continuam com escopos próprios. O deploy não altera o armazenamento local por si só; mudanças de persistência exigem sua própria revisão de compatibilidade antes de publicar.

## Manual curto

1. No computador, baixar o JSON pelo Grimório.
2. Passar esse arquivo para Arquivos/Downloads do celular por um meio privado escolhido pelo usuário.
3. No celular, abrir o endereço fixo → Grimório → Importar progresso neste dispositivo. Escolher o JSON e conferir os registros.
4. Se já houver progresso no destino, guardar/conferir a cópia anterior solicitada. Confirmar substituição, revisar a operação e continuar somente local. Recarregar e conferir as atividades/XP/histórico.

Depois, usar normalmente esse mesmo endereço e navegador do celular. Atualizações do app usam o mesmo projeto; o progresso permanece nesse navegador, sem sincronização automática com o computador. A criação da conta será feita depois e não deve ser anunciada como pronta pela importação manual.

Transferência pessoal ainda pendente de execução/confirmação do usuário. Não há inspeção do arquivo real nesta rodada. Dados de outros perfis também integram o arquivo e a confirmação de substituição, sem soma de XP. Proteções não foram removidas para reduzir o número aparente de cliques.

## Verificações locais executadas

679 testes completos passaram, zero falhas/pulados (84,16s; concorrência 4); 13 direcionados de workspace passaram (1,03s). TypeScript, ESLint, build Vite envDir:false (39,14s) e diff-check passaram. Avisos conhecidos de chunks/Browserslist mantidos. Delta da fonte comparado byte a byte ao staging 0.1.131: apenas RestoreWorkspace, seu CSS e whitelist de produtor; engines/stores/tipos/catálogos inalterados. Migração 132 somente local, sem abrir gate hospedado.

Publicação em andamento; build/READY e inspeção visual serão registrados após conclusão. Nenhum backup real aberto, alteração de dados do usuário, transferência pessoal ou push nesta rodada.

Último ajuste de coordenação visual: ações de restauração não ficam montadas durante o preparo da cópia anterior. Depois desse ajuste, 13 testes de workspace (0,73s), lint, TypeScript e build (8,23s) foram repetidos e passaram. A suíte de 679 passou antes desse ajuste de renderização; não foi reapresentada como nova execução posterior. Nenhum helper de gravação/recuperação mudou.

## Publicação final conferida

Deployment dpl_66XBoXzMsT24Bp6eXgwXML6JZDds, READY/production apenas em conselho-elemental-testes. Endereço fixo mantido: https://conselho-elemental-testes.vercel.app. Build remoto passou (19,97s Vite, 45s etapa completa), 501 arquivos, sem dados pessoais. O primeiro snapshot 132/Bvwyek3t4nADhhrqhGVZP9Tj5wpy foi substituído pelo snapshot final após o ajuste de renderização durante preparo.

Navegador interno abriu o snapshot final em origem isolada de deployment e mostrou as três etapas, título simples, seletor do JSON como primeira ação e orientação de armazenamento local. [Captura](evidence/transferencia-guiada-0.1.132/tres-etapas-publicadas.jpg). Sem seleção de arquivo pessoal ou mutação de dados reais; não equivale a aceite em celular físico.

Revisão/custódia sequenciais concluídas e reservas liberadas. Sem push, SQL remoto, troca de projeto/alias ou alteração dos dados do usuário. Próximo: Fábio usar a importação no celular pelo endereço fixo e confirmar seus registros após recarga; depois seguir evolução/validação/publicação de melhorias nesse mesmo ambiente. Conta/sync ficam para etapa seguinte conforme orientação atual.
