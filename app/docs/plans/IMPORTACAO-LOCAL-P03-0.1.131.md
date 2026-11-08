# P03 — importação local de progresso — 0.1.131

06/11/2026. Pedido reiterado de Fábio: levar o backup local para o app publicado; confirmou ter salvo o JSON e esclareceu que a tentativa falhou dentro do app no Chrome. Produto 0.1.130 de entrada, mudanças T06/V01/V02/P02 locais preservadas. Não recebemos ou abrimos seu backup pessoal.

## Diagnóstico e escopo

O Grimório oferecia “Conferir arquivo salvo”, que não importava, e o restaurador continuava com RESTORE_WRITES_RELEASED=false. A combinação levava o usuário a acreditar que havia enviado o arquivo sem carregar seu progresso. Corrigida a entrada: “Importar progresso neste dispositivo” abre um documento separado antes de App/stores/Auth. “Conferir arquivo sem importar” explicita a ação de leitura.

Liberação estática somente da restauração LOCAL, mediante as proteções já implementadas. Gates de conta online e lembretes continuam false. Não há novo endpoint, upload do conteúdo ao servidor, migração remota, alteração de regras/XP ou gravação pelo agente nos dados reais. Confirmação final de substituição cabe ao usuário no dispositivo de destino. O arquivo substitui, não soma, o progresso de todos os perfis locais e Treinos.

## Base da decisão de liberação

A entrega foi priorizada pelo proprietário, que confirmou cópia privada salva. Esta rodada obteve acesso real de inspeção ao app público e à fixture P02 no navegador interno: o bloqueio anteriormente encontrado em localhost não foi contornado. O agente executou seleção de arquivo sintético, conferência de cópia anterior, consentimentos, gravação, recarga, revisão, continuação somente local e nova recarga. As duas ideias permaneceram visíveis. [Captura sintética](evidence/importacao-local-0.1.131/qa-restaurado.jpg).

Não foi teste em celular físico, Chrome do usuário ou do backup real. Não houve nova simulação visual de interrupção nesta rodada; a atomicidade, rollback, conflitos, leases e invalidação de consentimentos continuam cobertos pelos testes automatizados. O fluxo de download automatizado no navegador interno expirou: a cópia anterior sintética foi reconstruída a partir do seed exato do artefato publicado, com origem correta e fingerprint conferido pela UI real. Não afirmar que o download do navegador foi validado. O arquivo de destino foi selecionado via file chooser com o arquivo sintético original do mesmo artefato. Nenhum storage pessoal foi extraído.

A política anterior mantinha a liberação fechada aguardando todos os aceites móveis. A decisão deste lote é permitir a importação local revisada no projeto dedicado de testes após regressão automatizada e percurso real sintético, mantendo aceite móvel explícito pendente. Essa decisão não autoriza abertura de conta/nuvem, remoção das proteções ou transferência automática. Se houver erro real, preservar os dados e o journal e revisar; não limpar localStorage.

## Proteções preservadas

- Workspace isolado antes da hidratação de App/stores/Auth e bloqueio quando o app já iniciou no documento.
- Arquivo completo, checksum, estrutura e auditoria crítica das duas partes, compatibilidade de produtor e conta.
- Cópia anterior salva e conferida quando existe progresso no destino; baseline revalidada antes de escrever.
- Consentimento explícito de substituir e fechar outras abas; não somar XP ou emitir conclusões.
- Web Locks, journal, readback, recuperação explícita e modo local isolado da nuvem.
- Conta online e lembretes fechados; sem alteração em stores/tipos/catálogos ou helpers do motor de restauração.

Versão/lock/changelog/whitelist 131 atualizados. Candidato 20261106190306_account_archive_version_131.sql criado com a CLI e apenas amplia versão aceita sobre hash do validador 130, com escrita hospedada obrigatoriamente false. Não aplicado remotamente. Arquivos anteriores intactos. O teste de release verifica a liberação atual e conserva o cenário em que release false bloqueia handlers; não se removeu a proteção do teste.

## Publicação e próximo passo

Destino único: conselho-elemental-testes / fr-prodiction; publicar app completo 0.1.131 e conferir o novo botão no domínio estável. Projetos anteriores, fonte local e backup original preservados. Importação de dados pessoais permanece ação futura do usuário: não anunciar concluída por publicar o botão. Sync F6 é uma frente separada.

**Verificado localmente:** 677 testes completos, zero falhas/pulados (79,16s; concorrência 4); TypeScript, lint, build envDir:false (41,38s) e diff-check passaram. Avisos prévios de chunks/Browserslist permanecem. Revisão SHA contra o snapshot V02 confirmou delta de fonte restrito a restore-release, whitelist e apresentação/CSS de ProgressBackup. Engines/stores/tipos/catálogos preservados. Publicação em andamento; registrar READY e leitura do controle real após conclusão.

## Publicado e conferido

Deployment dpl_9THEro78eBMRhgaqLSXr4Q7g36Np, READY/production somente no projeto dedicado conselho-elemental-testes, alias https://conselho-elemental-testes.vercel.app. App completo 0.1.131, 501 arquivos; build remoto passou (4775 módulos), sem SQL remoto ou push. Navegador interno recarregou Grimório e mostrou a entrada nova; ao clicar, montou workspace com Escolher arquivo para conferir habilitado e sem bloco de restauração indisponível. Não selecionamos backup pessoal no app real.

Fábio confirmou depois que tentara a importação no Chrome **do computador**. Orientação necessária: a cópia manual precisa ser selecionada no celular para ficar disponível naquele navegador; importar no computador não sincroniza com o telefone. Ainda precisa mover o JSON privado para Arquivos/Downloads do celular e seguir o fluxo do link real. Sua transferência pessoal continua pendente.

Revisão/custódia sequenciais concluídas e reservas encerradas. Aceite físico móvel e importação pessoal ainda não executados; não confundir a publicação do recurso com a conclusão desses passos.
