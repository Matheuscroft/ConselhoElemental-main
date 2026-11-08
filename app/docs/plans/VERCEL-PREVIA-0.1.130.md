# V01 — prévia Vercel para celular — 06/11/2026

Pedido explícito de Fábio: publicar para testar no celular durante a evolução. Versão 0.1.130 local sobre 67bb6e5; não houve push adicional no GitHub. Os 677 testes/tipos/lint/build são evidência do lote T06 anterior, sem nova execução neste deploy.

## Destino e resultado

- Equipe: fr-prodiction. Projeto confirmado pela CLI: dominio-do-mago-app, prj_XKrooiXpGY3f6cduFTgVZGZjCswR; Vite, output dist, raiz sem subdiretório.
- Deploy preview: dpl_GsC5JLcsiYikFBoECYwdi9Nbdwc8, estado READY confirmado por vercel inspect.
- [Endereço fixo de testes](https://dominio-do-mago-testes.vercel.app/treinos?tab=workouts).
- [Snapshot imutável](https://dominio-do-mago-a2nnqfl4p-fr-prodiction.vercel.app).
- [Build e detalhes](https://vercel.com/fr-prodiction/dominio-do-mago-app/GsC5JLcsiYikFBoECYwdi9Nbdwc8).

Alias de testes criado após listar aliases e confirmar ausência desse nome na equipe. Produção dominio-do-mago-app.vercel.app não promovida/substituída. Configuração Git de main/integração continua desativada; deploy manual autorizado somente nesta rodada. Para atualizar os testes, publicar outra prévia e apontar o mesmo alias após conferência, mantendo origem do navegador.

## Pacote e verificação

CLI usada após o conector Vercel retornar teams vazio. Outro projeto dominio-do-mago é Next.js/frontend e foi descartado como destino. Staging temporário somente com src/public/manifests/configs; dry-run identificou Vite, 501 arquivos, 54.202.835 bytes, sem .env/perfis/sessões/docs/Git/SQL/storage pessoal. Nenhum segredo de Supabase foi consultado ou criado. Configuração versionada de variáveis públicas foi mantida; não foram importados arquivos locais de ambiente.

Build remoto npm run build / TypeScript / Vite aprovado: 4775 módulos, Vite 20,83s, etapa de build total 48s. Avisos de chunks/Browserslist e avisos npm de cache-dir/install-scripts registrados; sem falha de build. Deploy/alias concluídos pela CLI, inspect confirmou READY/preview.

Acesso sem autenticação em /, /treinos e /santuario redirecionou para login Vercel. O HTTP 200 final era a página de login, não aprovação do app. Proteção não desativada. No celular, entrar na conta Vercel autorizada antes do app.

Verificação autenticada com vercel curl não concluiu: primeira tentativa encaminhou --cwd indevidamente ao curl; segunda exigiu confirmação de vínculo local. Não insistimos em vinculação automática de diretório temporário. A primeira chamada criou automaticamente uma credencial técnica de bypass de proteção pelo comportamento da CLI; o valor não foi exibido, lido, copiado para o repositório ou enviado ao usuário. Não houve alteração manual de proteção ou geração de link com token. Aceite visual/mobile e validação das rotas dentro do app permanecem pendentes; READY não comprova essas etapas.

## Progresso e próximos passos

Código publicado não transfere localStorage. O progresso do computador permanece na origem local; o celular tem armazenamento separado no domínio de testes. Manter esse endereço fixo evita trocar de origem a cada deploy, mas não implementa backup/sincronização. Não limpar dados do navegador nem presumir que uma conta já contém o progresso pessoal. F6, compatibilidade hospedada e associação com cópia/readback continuam pendentes com Matheus; gates preservados false, sem migração remota.

Próximo: teste manual no celular neste endereço; depois continuar T06/prévia → execução → descanso → resumo em Sol Médio. Sol Alto para Auth/contratos com Matheus. Revisão e custódia sequenciais, reservas documentais encerradas.
