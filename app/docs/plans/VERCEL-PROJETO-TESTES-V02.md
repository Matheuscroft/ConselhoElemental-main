# V02 — projeto próprio para testar o app no celular

06/11/2026. Pedido explícito de Fábio para criar projeto separado: o ensaio técnico P02 foi confundido com o destino da cópia pessoal. Esclarecido que ele recusa backups reais; a criação de um projeto não conclui a importação. Cópia pessoal permanece privada com o usuário, não recebida pelo agente.

## Destino

Projeto criado: conselho-elemental-testes / prj_2feHjC8XBOmFRRxbL39qGvTXQb0r, equipe fr-prodiction. [Painel do projeto](https://vercel.com/fr-prodiction/conselho-elemental-testes). A equipe deve ser selecionada no painel Vercel; não procurar somente no espaço pessoal.

Deploy de produção apenas deste projeto novo e dedicado ao teste; isso fornece URL estável. Não houve promoção/substituição de dominio-do-mago-app, dominio-do-mago, alias V01 ou fixture P02. Projeto novo não está ligado automaticamente ao Git, main/integração conservam configuração atual. Atualizações futuras de teste devem publicar o app completo no mesmo projeto, preservando a origem do navegador.

## Snapshot

App completo 0.1.130, fonte atual sobre 67bb6e5, incluindo biblioteca T06. Staging isolado de src/public/manifests/configs; conferência SHA da fonte atual contra staging, ausência da entrada restore-qa.js e presença de main.tsx. Sem .env, perfis, storage pessoal, SQL, docs, fixture de QA ou Git no upload. Sem mudança no código do produto, gates ou banco.

A compilação remota executa npm run build (tsc -b e Vite). Os 677 testes pertencem ao lote T06, não foram reexecutados para um deploy da mesma fonte. Resultado de build/READY/domínio e HTTP registrados após conclusão abaixo. Validar HTML/assets não equivale a aceite visual/mobile ou importação pessoal.

## Progresso

O novo domínio terá armazenamento independente. O JSON pessoal está salvo com Fábio; restauração no app continua fechada e precisa de conclusão/validação antes de importar no celular. Não orientar envio desse JSON ao GitHub, build, upload de assets ou fixture. Não transferimos nem alteramos o progresso original. P02 permanece pendente; priorizar um percurso de transferência compreensível antes de voltar ao polimento visual. Conta/sincronização F6 é uma frente separada.

## Publicação conferida

Deployment dpl_5zNwMfwxWzA6p6WdAdAZBsscSfPa, READY, target production **somente no projeto de testes novo**. [Endereço estável do app completo](https://conselho-elemental-testes.vercel.app/treinos?tab=workouts). Snapshot: https://conselho-elemental-testes-5jbqp1ik4-fr-prodiction.vercel.app. Build remoto terminou com sucesso; 4775 módulos transformados, sem nova execução da suíte local.

HTTP sem autenticação: /, /treinos?tab=workouts e /grimorio retornaram 200 na mesma origem, com root do SPA e script module; entry JS e CSS retornaram 200 com content-types corretos. Não houve redirecionamento ao login Vercel nessas verificações. Não se desativou proteção manualmente; trata-se da publicação normal do novo projeto. Isso não comprova execução de JS/interação real no celular; aceite permanece próprio.

Custódia sequencial e diff-check concluídos, reservas encerradas. Nenhum dado pessoal importado, SQL remoto, push, mudança de fórmula/gate ou substituição dos projetos anteriores. Próximo: fechar a transferência pessoal no domínio estável; não repetir ao usuário o link de QA como destino do backup.
