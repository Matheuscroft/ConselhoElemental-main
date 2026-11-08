# P02 — preservar e levar progresso ao celular

06/11/2026. Fábio confirmou que salvou a cópia privada pelo Grimório. Não recebemos, abrimos ou publicamos o arquivo pessoal. Pausada a evolução visual até preparar a transferência. Produto permanece 0.1.130; fonte distribuída não foi modificada nesta rodada, somente ferramenta/fixture de QA e documentação.

## Entregue nesta rodada

scripts/build-restore-qa.mjs gera um site estático separado usando RestoreWorkspace/RestoreActions e os helpers reais. Seed offline sintético: perfil “Ensaio descartável”, um rascunho anterior e dois no destino. O bundle recusa qualquer entrada diferente do JSON sintético gerado, exclui stores/Auth/Supabase/bootstrap e não usa .env. Gate true existe apenas no bundle de QA, sem parâmetro/flag que habilite a gravação do app real. RESTORE_WRITES_RELEASED do produto continua false.

A fixture usa localStorage e Web Locks reais do navegador, numa origem de deployment própria, sem compartilhar o alias do app. Inicialização recusa dados preexistentes sem marcador de QA; nunca os adota ou limpa. Arquivo de teste é público porque contém somente seed sintético. A saída usa o mesmo par Core/Fitness, cópia anterior obrigatória, conferência explícita e retomada após reload. Interrupção opcional ocorre após a primeira gravação; a próxima recarga permite revisar recuperação. Não manipula relógio/XP nem chama App.

## Publicação autorizada para validação da transferência

- [Ensaio separado](https://dominio-do-mago-48nnk1yyh-fr-prodiction.vercel.app).
- Deployment dpl_6WbtRothoCZcZudyZ5xAgJ1F4Hhn, READY/preview confirmado por CLI inspect.
- Mesmo projeto dominio-do-mago-app / fr-prodiction; sem promoção ou alteração do alias dominio-do-mago-testes.vercel.app.
- Upload somente de seis arquivos estáticos, cerca de 5,1 MB; sem arquivo pessoal ou SQL. A proteção Vercel continua a exigir login autorizado.

## Evidência executada e limite

Build esbuild do ensaio aprovado, metafile confere exclusão de módulos de stores/Auth/Supabase/bootstrap e gate do produto false. ESLint passou; 41 testes direcionados de workspace/ações/journal/exclusividade passaram, sem falhas/pulados, 2249,769 ms. Não repetir os 677 do lote T06 como nova suíte desta rodada. O build final só acrescentou ao indicador de conclusão a exigência do marcador local de continuação; recompilado e lint repetido. Sem navegador automatizado, inspeção visual/mobile ou confirmação de operação real de restauração.

## Aceite pendente no celular

1. Acessar o ensaio no navegador do celular, autenticar na Vercel se pedido e baixar fixture-progresso.json.
2. Baixar cópia do estado atual sintético, selecionar fixture-progresso.json e conferir a cópia anterior salva; fechar outras abas deste ensaio, confirmar substituição e restaurar.
3. Após recarga, conferir recuperação pendente; confirmar continuação somente local. Ver “Ensaio restaurado” com “Ideia anterior de QA” e “Ideia importada de QA”; recarregar e conferir ambas.
4. Em um novo ensaio independente ou após guardar o estado sintético atual, repetir com interrupção armada e confirmar recuperação sem perda. Não apagar armazenamento pessoal ou usar seu backup real neste teste. A simulação de interrupção não comprova interrupção física em todo ponto nem outro navegador/plataforma.

Só após os aceites relevantes, revisar liberação estática do restaurador real, testes de regressão/compatibilidade, redeploy no alias fixo e importação do arquivo pessoal com conferência/backup do destino. Transferência real ainda não executada; origem permanece preservada. Manter modelo adequado a persistência (Sol Alto). Conta/sincronização contínua F6 não será concluída pela cópia manual.
