# F6-N07 — requisitos da restauração visíveis — 0.1.137

07/11/2026 · Astro Boy sequencial · Sol Alto · base67bb6e5 emcodex/fitness-ui-integration, alterações preexistentes preservadas. Pedido: botão Restaurar esta cópia desabilitado no celular. Usuário respondeu explicitamente que já conferiu a cópia anterior e marcou as duas confirmações. **Não tratar esse relato como consentimentos faltando sem observar o estado real do telefone.**

## Diagnóstico e interface

Fonte mostra botão condicionado à release, auditoria do arquivo, segurança anterior conferida quando há projeções no destino, dois consentimentos, estado de processamento e ausência de recuperação pendente. A versão anterior não enumerava o requisito que faltava; os checkboxes visíveis sozinhos não comprovam o resultado da verificação do arquivo anterior.

RestoreActions mantém a MESMA expressão ready, os mesmos guards de handlers, journal/lease/readback e flags. Agora lista ao lado do botão as condições pendentes, com aria-live e aria-describedby: release fechada, revisão da cópia, segurança anterior não validada, recuperação conflitante, confirmação de outras abas ou substituição. Depois das verificações, mostra “Tudo conferido. Você já pode continuar.” Erros da leitura continuam explícitos. Não remove bloqueios nem converte um arquivo incompatível em válido.

Texto diferencia dois arquivos: o JSON de progresso vindo do computador permanece selecionado acima; a segurança “conselho-antes-da-restauracao-…” deve ser baixada e conferida no próprio aparelho em que ocorrerá a importação. Mesmo uma instalação com listas vazias pode possuir projeções persistidas de personagem/catálogos. A segurança desse destino não é o arquivo de origem a importar e não pode ser substituída automaticamente por uma cópia de outro navegador.

A resposta do usuário não identifica qual condição está ativa no iPhone. A atualização torna isso observável; causa específica e resolução no telefone continuam pendentes. Próximo dado necessário, se persistir: texto/captura da lista junto ao botão, sem pedir novamente confirmações já informadas.

## Verificação

- 23 testes UI direcionados iniciais passaram. Suíte completa final:699 testes (88,63s), incluindo Astro Boy, passaram. TypeScript, lint e build finais passaram (Vite32,72s). Sem nova dependência ou fórmula.
- Novas regressões: com dois checkboxes mas sem segurança, botão permanece bloqueado e explica o arquivo faltante; verificar a segurança o habilita sem executar I/O; alteração externa revoga confirmação; origem sem dados dispensa arquivo anterior; auditoria e conflito de recuperação são nomeados.
- Comparação SHA contra começo do lote: únicas fontes existentes alteradas RestoreActions.tsx, RestoreWorkspace.tsx e allowlist de produtor emcritical-progress.ts. Stores/motores/catálogos e gates permanecem idênticos. Versões package/lock alinhadas137; candidato137 criado pela CLI, somente local/PGlite, suportando baseline135/136 revisado. Validador hospedado continua135; transferência/syncfalse. Não aplicar candidato ou abrir gate por esta entrega de UI.

## Ensaio no navegador real, dados sintéticos

Skill webapp-testing do projeto orienta reaproveitar Puppeteer instalado. Executado Chromium for Testing headless em perfil TEMPORÁRIO novo, emulação390×844, contra o domínio público atualizado. Nenhum acesso ao navegador pessoal, porta local bloqueada, storage real ou backup do usuário.

Seed de duas projeções sintéticas vazias reproduz destino já inicializado; arquivo130 sintético contém ritual, ciclo concluído e4XP de Ar. Só esse perfil descartável recebe a fixture. Formulário real recebeu o arquivo pelo input, marcou os dois consentimentos: bloqueio e explicação de segurança observados. Depois recebeu a segurança do próprio destino: botão habilitou. Clique Restaurar executou gravação, recarga, conferência da operação pendente e Continuar somente local; Santuário abriu. Atividade e4XP permaneceram após outra recarga, journal encerrado. Nenhuma requisição Auth/RPC de progresso ocorreu. Perfil/arquivos temporários do ensaio descartados ao terminar.

[Resultado e publicação](evidence/restauracao-requisitos-0.1.137/verificacoes.json), [bloqueio explicado](evidence/restauracao-requisitos-0.1.137/antes-da-conferencia.jpg), [botão ativo](evidence/restauracao-requisitos-0.1.137/botao-liberado.jpg). Capturas inspecionadas; a segunda mostra checklist concluído e botão dourado ativo. Isto comprova o percurso em Chromium de teste, **não Safari/iPhone físico nem a importação pessoal**.

## Publicação

Novo staging reconstruído com509arquivos conferidos, fonte/assets/configuração apenas; sem .env, SQL, docs/testes/QA, sessões ou backup pessoal. Deployment **dpl_GWu8NzntTZHWCPQJnZH2B2USZnxq**, READY, mesmo projeto conselho-elemental-testes/fr-prodiction e domínio https://conselho-elemental-testes.vercel.app. URL imutável https://conselho-elemental-testes-q74l90gdw-fr-prodiction.vercel.app. HTML/entry200, entry contém137, cache-control no-store/no-cache/must-revalidate. Fonte publicada igual ao checkout; sem push/migração/gate remoto ou progresso pessoal alterado.

## Retomada

Usuário deve recarregar o próprio app do celular, selecionar a cópia correta e observar a lista imediatamente junto ao botão. Se continuar desabilitado apesar de informar segurança aceita e consentimentos marcados, pedir texto/captura desse bloco para identificar auditoria/recuperação/cópia rejeitada/versão antiga; não atribuir erro ao usuário ou repetir indefinidamente o roteiro. Depois de concluir, conferir XP/atividades e recarga. Conta/sync integral mantém pendênciasN05; próxima prioridade é fechar o aceite pessoal da importação. Custódia documental revisada sequencialmente e reservas encerradas.
